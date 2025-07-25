import React, { useState } from 'react';
import { getTickerPrices } from '../api/analysisService';
import LoadingSpinner from './LoadingSpinner';
import ComparisonChart from './ComparisonChart';
import './PortfolioComparison.css';

const PortfolioComparison = ({ sentimentData, dateRange }) => {
  const [tickerSymbol, setTickerSymbol] = useState('');
  const [tickerData, setTickerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleComparePortfolio = async () => {
    if (!tickerSymbol.trim()) {
      setError('Por favor ingresa un símbolo de ticker');
      return;
    }

    if (!sentimentData || !sentimentData.returns || sentimentData.returns.length === 0) {
      setError('No hay datos de sentimiento para comparar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTickerPrices(
        tickerSymbol.trim(),
        dateRange.startDate,
        dateRange.endDate
      );
      
      setTickerData(result);
      setShowComparison(true);
    } catch (err) {
      setError(err.message);
      setShowComparison(false);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    if (!tickerData || !sentimentData) return null;

    const sentimentReturns = sentimentData.returns.map(r => r.portfolio_return);
    const avgSentimentReturn = sentimentReturns.reduce((a, b) => a + b, 0) / sentimentReturns.length;
    const sentimentVolatility = Math.sqrt(
      sentimentReturns.reduce((sum, r) => sum + Math.pow(r - avgSentimentReturn, 2), 0) / sentimentReturns.length
    ) * Math.sqrt(252); // Anualizada

    return {
      sentiment: {
        avgReturn: (avgSentimentReturn * 100).toFixed(4),
        volatility: (sentimentVolatility * 100).toFixed(2),
        observations: sentimentReturns.length
      },
      ticker: {
        avgReturn: tickerData.summary.avg_daily_return.toFixed(4),
        volatility: tickerData.summary.volatility.toFixed(2),
        totalReturn: tickerData.summary.total_return.toFixed(2),
        observations: tickerData.summary.num_observations
      }
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="portfolio-comparison">
      <div className="comparison-header">
        <h3>Comparación de Portafolios</h3>
        <div className="ticker-input-section">
          <div className="input-group">
            <input
              type="text"
              value={tickerSymbol}
              onChange={(e) => setTickerSymbol(e.target.value.toUpperCase())}
              placeholder="Ej: AAPL, TSLA, MSFT"
              className="ticker-input"
              disabled={loading}
            />
            <button
              onClick={handleComparePortfolio}
              disabled={loading || !tickerSymbol.trim()}
              className="compare-button"
            >
              {loading ? 'Cargando...' : 'Comparar'}
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {showComparison && tickerData && (
        <div className="comparison-results">
          <div className="comparison-summary">
            <div className="summary-card">
              <h4>Portafolio Sentimiento</h4>
              <div className="metric">
                <span className="label">Retorno Promedio Diario:</span>
                <span className="value">{metrics.sentiment.avgReturn}%</span>
              </div>
              <div className="metric">
                <span className="label">Volatilidad Anualizada:</span>
                <span className="value">{metrics.sentiment.volatility}%</span>
              </div>
              <div className="metric">
                <span className="label">Observaciones:</span>
                <span className="value">{metrics.sentiment.observations}</span>
              </div>
            </div>

            <div className="summary-card">
              <h4>{tickerData.ticker}</h4>
              <div className="metric">
                <span className="label">Retorno Promedio Diario:</span>
                <span className="value">{metrics.ticker.avgReturn}%</span>
              </div>
              <div className="metric">
                <span className="label">Volatilidad Anualizada:</span>
                <span className="value">{metrics.ticker.volatility}%</span>
              </div>
              <div className="metric">
                <span className="label">Retorno Total:</span>
                <span className="value">{metrics.ticker.totalReturn}%</span>
              </div>
              <div className="metric">
                <span className="label">Observaciones:</span>
                <span className="value">{metrics.ticker.observations}</span>
              </div>
            </div>
          </div>

          <div className="comparison-chart">
            <h4>Comparación de Retornos</h4>
            <ComparisonChart
              portfolioData={sentimentData.returns}
              tickerData={tickerData}
              tickerSymbol={tickerData.ticker}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioComparison;
