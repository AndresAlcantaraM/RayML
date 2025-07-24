import pandas as pd
import numpy as np
from arch import arch_model
import pandas_ta as ta
import ray
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(ROOT_DIR, 'data')

@ray.remote
def garch_forecast(window):
    try:
        model = arch_model(y=window, p=1, q=3)
        fit = model.fit(disp='off')
        forecast = fit.forecast(horizon=1).variance.iloc[-1, 0]
        return forecast
    except Exception:
        return np.nan

class IntradayGARCHAlgorithm:
    def __init__(self, 
             daily_file='simulated_daily_data.csv', 
             intraday_file='simulated_5min_data.csv'):
        self.daily_path = os.path.join(DATA_DIR, daily_file)
        self.intraday_path = os.path.join(DATA_DIR, intraday_file)

    def load_data(self):
        daily_df = pd.read_csv(self.daily_path, parse_dates=['Date'])
        daily_df.set_index('Date', inplace=True)
        daily_df = daily_df.drop(columns=['Unnamed: 7'], errors='ignore')
        daily_df['log_ret'] = np.log(daily_df['Adj Close']).diff()
        daily_df['variance'] = daily_df['log_ret'].rolling(180).var()
        self.daily_df = daily_df['2020-01-01':].copy()

        intraday_df = pd.read_csv(self.intraday_path, parse_dates=['datetime'])
        intraday_df.set_index('datetime', inplace=True)
        intraday_df['date'] = intraday_df.index.date
        self.intraday_df = intraday_df

    def parallel_predict_volatility(self):
        returns = self.daily_df['log_ret']
        windows = [returns.iloc[i-180:i] for i in range(180, len(returns))]
        futures = [garch_forecast.remote(win) for win in windows]
        results = ray.get(futures)

        
        self.daily_df = self.daily_df.iloc[180:].copy()
        self.daily_df['predictions'] = results

    def compute_signals(self):
        df = self.daily_df.copy()
        df['prediction_premium'] = (df['predictions'] - df['variance']) / df['variance']
        df['premium_std'] = df['prediction_premium'].rolling(180).std()
        df['signal_daily'] = df.apply(lambda x: 1 if x['prediction_premium'] > x['premium_std']
                                      else -1 if x['prediction_premium'] < -x['premium_std'] else np.nan, axis=1)
        df['signal_daily'] = df['signal_daily'].shift()
        self.daily_df = df

    def merge_intraday(self):
        daily_signals = self.daily_df[['signal_daily']].reset_index()
        intraday_df = self.intraday_df.reset_index()

        
        daily_signals['Date'] = pd.to_datetime(daily_signals['Date'])
        intraday_df['date'] = pd.to_datetime(intraday_df['date'])

        merged = intraday_df.merge(daily_signals, left_on='date', right_on='Date', how='left')
        merged = merged.drop(columns=['date', 'Date'])
        merged.set_index('datetime', inplace=True)
        self.final_df = merged

    def compute_intraday_signals(self):
        df = self.final_df.copy()
        df['rsi'] = ta.rsi(df['close'], length=20)
        bbands = ta.bbands(df['close'], length=20)
        df['lband'] = bbands['BBL_20_2.0']
        df['uband'] = bbands['BBU_20_2.0']

        df['signal_intraday'] = df.apply(lambda x: 1 if (x['rsi'] > 70 and x['close'] > x['uband'])
                                         else -1 if (x['rsi'] < 30 and x['close'] < x['lband']) else np.nan, axis=1)
        df['return'] = np.log(df['close']).diff()
        self.final_df = df

    def compute_strategy_returns(self):
        df = self.final_df.copy()

        df['return_sign'] = df.apply(lambda x: -1 if (x['signal_daily'] == 1 and x['signal_intraday'] == 1)
                                     else 1 if (x['signal_daily'] == -1 and x['signal_intraday'] == -1) else np.nan, axis=1)
        df['return_sign'] = df.groupby(pd.Grouper(freq='D'))['return_sign'].transform(lambda x: x.ffill())
        df['forward_return'] = df['return'].shift(-1)
        df['strategy_return'] = df['forward_return'] * df['return_sign']

        self.strategy_returns = df.groupby(pd.Grouper(freq='D'))['strategy_return'].sum()
        self.final_df = df

    def run_strategy(self, start_date: str, end_date: str):
        self.load_data()

        # Filtrado por fechas
        self.daily_df = self.daily_df.loc[start_date:end_date].copy()
        self.intraday_df = self.intraday_df[
            (self.intraday_df.index >= pd.to_datetime(start_date)) &
            (self.intraday_df.index <= pd.to_datetime(end_date))
        ]

        self.parallel_predict_volatility()
        self.compute_signals()
        self.merge_intraday()
        self.compute_intraday_signals()
        self.compute_strategy_returns()

        cumulative = np.exp(np.log1p(self.strategy_returns).cumsum()).sub(1)

        
        daily_signals = self.daily_df[['signal_daily', 'predictions']].reset_index()
        daily_signals.replace([np.inf, -np.inf], np.nan, inplace=True)
        daily_signals.fillna(0, inplace=True)

        strategy_returns = self.strategy_returns.reset_index().rename(columns={"strategy_return": "daily_return"})
        strategy_returns.replace([np.inf, -np.inf], np.nan, inplace=True)
        strategy_returns.fillna(0, inplace=True)

        cumulative_value = cumulative.iloc[-1] if not cumulative.empty else 0
        if not np.isfinite(cumulative_value):
            cumulative_value = 0

        return {
            "daily_signals": daily_signals.to_dict(orient='records'),
            "strategy_returns": strategy_returns.to_dict(orient='records'),
            "cumulative_return": cumulative_value
        }