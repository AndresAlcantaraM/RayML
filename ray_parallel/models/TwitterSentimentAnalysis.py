import pandas as pd
import numpy as np
import yfinance as yf
import ray
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(ROOT_DIR, 'data')

@ray.remote
def download_prices_remote(tickers, start_date, end_date):
    prices_df = yf.download(
        tickers=tickers,
        start=start_date,
        end=end_date,
        auto_adjust=False
    )
    return prices_df

@ray.remote
def calculate_returns_remote(prices_df, fixed_dates):
    returns_df = np.log(prices_df['Adj Close']).diff().dropna(how='all')
    portfolio_df = pd.DataFrame()
    for start_date in fixed_dates.keys():
        end_date = (pd.to_datetime(start_date) + pd.offsets.MonthEnd()).strftime('%Y-%m-%d')
        cols = fixed_dates[start_date]
        temp_df = returns_df[start_date:end_date][cols].mean(axis=1).to_frame('portfolio_return')
        portfolio_df = pd.concat([portfolio_df, temp_df], axis=0)
    return portfolio_df

class TwitterSentimentAlgorithm:
    def __init__(self, filename='sentiment_data.csv'):
        self.filename = os.path.join(DATA_DIR, filename)
        self.df = pd.read_csv(self.filename)

    def load_sentiment_data(self):
        sentiment_df = self.df.copy()
        sentiment_df['date'] = pd.to_datetime(sentiment_df['date'])
        sentiment_df = sentiment_df.set_index(['date', 'symbol'])
        sentiment_df['engagement_ratio'] = sentiment_df['twitterComments'] / sentiment_df['twitterLikes']
        sentiment_df = sentiment_df[
            (sentiment_df['twitterLikes'] > 20) & (sentiment_df['twitterComments'] > 10)
        ]
        return sentiment_df

    def aggregate(self, sentiment_df):
        aggregated_df = (
            sentiment_df.reset_index('symbol')
            .groupby([pd.Grouper(freq='M'), 'symbol'])[['engagement_ratio']]
            .mean()
        )
        aggregated_df['rank'] = aggregated_df.groupby(level=0)['engagement_ratio'].transform(
            lambda x: x.rank(ascending=False)
        )
        return aggregated_df

    def select_top_5(self, aggregated_df):
        filtered_df = aggregated_df[aggregated_df['rank'] < 6].copy()
        filtered_df = filtered_df.reset_index(level=1)
        filtered_df.index = filtered_df.index + pd.DateOffset(1)
        filtered_df = filtered_df.reset_index().set_index(['date', 'symbol'])
        return filtered_df

    def extract_stocks_by_date(self, filtered_df):
        dates = filtered_df.index.get_level_values('date').unique().tolist()
        fixed_dates = {}
        for d in dates:
            fixed_dates[d.strftime('%Y-%m-%d')] = filtered_df.xs(d, level=0).index.tolist()
        return fixed_dates

    def run_analysis(self, start_date: str, end_date: str):
        sentiment_df = self.load_sentiment_data()
        aggregated_df = self.aggregate(sentiment_df)
        filtered_df = self.select_top_5(aggregated_df)
        fixed_dates = self.extract_stocks_by_date(filtered_df)
        
        tickers = sentiment_df.index.get_level_values('symbol').unique().tolist()

        top_stocks = (
            filtered_df
            .reset_index()
            .rename(columns={"engagement_ratio": "engagement"})
            .assign(date=lambda x: x['date'].dt.strftime('%Y-%m-%d'))
            [['date', 'symbol', 'engagement', 'rank']]
        )


        prices_ref = download_prices_remote.remote(tickers, start_date, end_date)
        prices_df = ray.get(prices_ref)


        returns_ref = calculate_returns_remote.remote(prices_df, fixed_dates)
        portfolio_df = ray.get(returns_ref)

        return {
            "returns": portfolio_df.reset_index().to_dict(orient="records"),
            "top_stocks": top_stocks.to_dict(orient="records"),
            "metadata": {
                "period": f"{start_date} - {end_date}",
                "num_tickers": len(tickers),
                "num_periods": len(fixed_dates)
            }
        }
    

