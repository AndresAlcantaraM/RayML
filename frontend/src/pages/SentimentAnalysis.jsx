import { useState, useEffect } from 'react';
import { analyzeSentiment, checkHealth, getTopStocksByMonth } from '../api/analysisService';
import DateRangePicker from '../components/DateRangePicker';
import PortfolioTable from '../components/PortfolioTable';
import TopStocksTable from '../components/TopStocksTable'; 
import MetadataCard from '../components/MetadataCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './stylesAnalysis.css';

const SentimentAnalysis = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('portfolio');

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

  const checkServiceHealth = async () => {
    const status = await checkHealth();
    setApiStatus(status);
    if (status.api === 'healthy' && status.ray_service === 'healthy') {
      toast.success('Todos los servicios están operativos');
    } else {
      toast.warning('Algunos servicios no están disponibles');
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
            <button
              onClick={checkServiceHealth}
              className="status-badge"
            >
              Verificar Estado
            </button>
          </div>

          {apiStatus && (
            <div className="mb-6 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Estado de los servicios:</h3>
              <ul className="space-y-1">
                <li>API: <span className={apiStatus.api === 'healthy' ? 'status-healthy' : 'status-unhealthy'}>
                  {apiStatus.api}
                </span></li>
                <li>Ray Service: <span className={apiStatus.ray_service === 'healthy' ? 'status-healthy' : 'status-unhealthy'}>
                  {apiStatus.ray_service || 'unknown'}
                </span></li>
              </ul>
            </div>
          )}

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
            </div>

            <MetadataCard metadata={results.metadata} />
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
};

export default SentimentAnalysis;

