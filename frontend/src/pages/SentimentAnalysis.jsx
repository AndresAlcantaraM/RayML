import { useState } from 'react';
import { analyzeSentiment } from '../api/analysisService';
import DateRangePicker from '../components/DateRangePicker';
import PortfolioTable from '../components/PortfolioTable';
import TopStocksTable from '../components/TopStocksTable'; 
import MetadataCard from '../components/MetadataCard';
import PortfolioComparison from '../components/PortfolioComparison';
import 'react-toastify/dist/ReactToastify.css';
import './stylesAnalysis.css';

const SentimentAnalysis = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error('Por favor selecciona ambas fechas');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('La fecha de inicio no puede ser posterior a la fecha de fin');
      return;
    }

    try {
      setLoading(true);

      const cleanStartDate = new Date(startDate).toISOString().split('T')[0];
      const cleanEndDate = new Date(endDate).toISOString().split('T')[0];

      // Actualizar el rango de fechas para el componente de comparación
      setDateRange({ startDate: cleanStartDate, endDate: cleanEndDate });

      const data = await analyzeSentiment(cleanStartDate, cleanEndDate);
      setResults(data);
      toast.success('Análisis completado con éxito');
    } catch (error) {
      toast.error(error.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <h1 className="analysis-title">
          Análisis de Sentimiento en Twitter
        </h1>

        <div className="analysis-card">
          <div className="analysis-header">
            <h2 className="analysis-subtitle">
              Configurar Análisis
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="analysis-form">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <button
              type="submit"
              disabled={loading}
              className="submit-btn submit-btn-primary"
            >
              {loading ? 'Analizando...' : 'Iniciar Análisis'}
            </button>
          </form>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <p>Procesando datos...</p>
            </div>
          </div>
        )}

        {results && (
          <div className="results-container">
            <div className="results-tabs">
              <button
                className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
                onClick={() => setActiveTab('portfolio')}
              >
                Retornos del Portafolio
              </button>
              <button
                className={`tab-button ${activeTab === 'topStocks' ? 'active' : ''}`}
                onClick={() => setActiveTab('topStocks')}
              >
                Top 5 Acciones
              </button>
              <button
                className={`tab-button ${activeTab === 'comparison' ? 'active' : ''}`}
                onClick={() => setActiveTab('comparison')}
              >
                Comparación
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'portfolio' && (
                <div className="results-card">
                  <h2 className="analysis-subtitle">
                    Resultados del Portafolio
                  </h2>
                  <PortfolioTable data={results.returns} />
                </div>
              )}

              {activeTab === 'topStocks' && (
                <div className="results-card">
                  <h2 className="analysis-subtitle">
                    Top 5 Acciones por Engagement Mensual
                  </h2>
                  <TopStocksTable data={results.topStocks} />
                </div>
              )}

              {activeTab === 'comparison' && (
                <div className="results-card">
                  <h2 className="analysis-subtitle">
                    Comparación con Ticker Individual
                  </h2>
                  <PortfolioComparison 
                    sentimentData={results} 
                    dateRange={dateRange}
                  />
                </div>
              )}
            </div>

            <MetadataCard metadata={results.metadata} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysis;

