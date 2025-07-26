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
      console.log('PortfolioComparison - Solicitando datos para:', {
        ticker: tickerSymbol.trim(),
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const result = await getTickerPrices(
        tickerSymbol.trim(),
        dateRange.startDate,
        dateRange.endDate
      );
      
      console.log('PortfolioComparison - Datos del ticker recibidos:', result);
      console.log('PortfolioComparison - Datos del sentimiento disponibles:', {
        returns: sentimentData.returns?.length || 0,
        firstReturn: sentimentData.returns?.[0],
        lastReturn: sentimentData.returns?.[sentimentData.returns?.length - 1]
      });
      
      setTickerData(result);
      setShowComparison(true);
    } catch (err) {
      console.error('PortfolioComparison - Error al obtener datos del ticker:', err);
      setError(err.message);
      setShowComparison(false);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    if (!tickerData || !sentimentData || !sentimentData.returns) {
      console.log('PortfolioComparison - No se pueden calcular métricas: faltan datos');
      return null;
    }

    try {
      const sentimentReturns = sentimentData.returns.map(r => Number(r.portfolio_return) || 0);
      const avgSentimentReturn = sentimentReturns.reduce((a, b) => a + b, 0) / sentimentReturns.length;
      const sentimentVolatility = Math.sqrt(
        sentimentReturns.reduce((sum, r) => sum + Math.pow(r - avgSentimentReturn, 2), 0) / sentimentReturns.length
      ) * Math.sqrt(252); // Anualizada

      // Validar que tickerData.summary existe
      if (!tickerData.summary) {
        console.log('PortfolioComparison - No hay datos de resumen del ticker');
        return null;
      }

      return {
        sentiment: {
          avgReturn: (avgSentimentReturn * 100).toFixed(4),
          volatility: (sentimentVolatility * 100).toFixed(2),
          observations: sentimentReturns.length
        },
        ticker: {
          avgReturn: (Number(tickerData.summary.avg_daily_return) || 0).toFixed(4),
          volatility: (Number(tickerData.summary.volatility) || 0).toFixed(2),
          totalReturn: (Number(tickerData.summary.total_return) || 0).toFixed(2),
          observations: Number(tickerData.summary.num_observations) || 0
        }
      };
    } catch (error) {
      console.error('PortfolioComparison - Error calculando métricas:', error);
      return null;
    }
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
          {/* Debug info - puede removerse en producción */}
          <details style={{ marginBottom: '20px', fontSize: '12px', background: '#f3f4f6', padding: '10px', borderRadius: '4px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '500' }}>
              Información de debug (click para ver)
            </summary>
            <div style={{ marginTop: '10px' }}>
              <p><strong>Datos del sentimiento:</strong> {sentimentData.returns?.length || 0} registros</p>
              <p><strong>Datos del ticker:</strong> {tickerData.prices?.length || 0} registros</p>
              <p><strong>Rango de fechas:</strong> {dateRange.startDate} a {dateRange.endDate}</p>
              {sentimentData.returns?.length > 0 && (
                <p><strong>Primera fecha sentimiento:</strong> {sentimentData.returns[0]?.date}</p>
              )}
              {tickerData.prices?.length > 0 && (
                <p><strong>Primera fecha ticker:</strong> {tickerData.prices[0]?.Date || tickerData.prices[0]?.date}</p>
              )}
            </div>
          </details>

          <div className="comparison-summary">
            {metrics ? (
              <>
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
              </>
            ) : (
              <div style={{ 
                background: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '6px', 
                padding: '16px',
                gridColumn: '1 / -1' 
              }}>
                <p style={{ color: '#dc2626', margin: 0 }}>
                  Error al calcular métricas. Verifica que los datos estén completos.
                </p>
              </div>
            )}
          </div>

          <div className="comparison-chart">
            <h4>Comparación de Retornos</h4>
            {sentimentData && sentimentData.returns && tickerData && tickerData.prices ? (
              <ComparisonChart
                portfolioData={sentimentData.returns}
                tickerData={tickerData}
                tickerSymbol={tickerData.ticker}
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  No se pueden mostrar los datos de comparación. 
                  Verifica que tanto el portafolio como el ticker tengan datos válidos.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioComparison;
