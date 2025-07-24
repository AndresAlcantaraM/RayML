import { useState } from 'react';
import { analyzeGARCH, checkHealth } from '../api/analysisService';
import ResultChart from '../components/ResultChart';
import DailySignalsTable from '../components/DailySignalsTable';
import SummaryBox from '../components/SummaryBox';
import './stylesAnalysis.css';

const GarchStrategyPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const health = await checkHealth();
      if (health.api !== 'healthy') {
        alert('API no saludable');
        return;
      }
      const result = await analyzeGARCH();
      setData(result);
    } catch (error) {
      alert('Error al analizar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <h1 className="analysis-title">Estrategia Intradía GARCH</h1>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="submit-btn submit-btn-primary"
        >
          {loading ? 'Analizando...' : 'Ejecutar Estrategia'}
        </button>

        {data && (
          <>
            <div className="results-card">
              <SummaryBox cumulative={data.cumulative_return} />
            </div>
            <div className="results-card">
              <ResultChart returns={data.strategy_returns} />
            </div>
            <div className="results-card">
              <DailySignalsTable signals={data.daily_signals} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GarchStrategyPage;
