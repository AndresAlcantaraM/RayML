import { useState } from 'react';
import { analyzeGARCH, checkHealth } from '../api/analysisService';
import ResultChart from '../components/ResultChart';
import DailySignalsTable from '../components/DailySignalsTable';
import SummaryBox from '../components/SummaryBox';
import DateRangePicker from '../components/DateRangePicker';
import { subMonths } from 'date-fns';
import './stylesAnalysis.css';

const GarchStrategyPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState(new Date());

  const handleAnalyze = async () => {
    if (!startDate || !endDate) {
      alert('Por favor seleccione ambas fechas');
      return;
    }

    if (startDate >= endDate) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    setLoading(true);
    try {
      const health = await checkHealth();
      if (health.api !== 'healthy') {
        alert('API no saludable');
        return;
      }
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const result = await analyzeGARCH(formattedStartDate, formattedEndDate);
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
        <div className="analysis-card">
          <h1 className="analysis-title">Estrategia Intradía GARCH</h1>
          <p className="analysis-description">
            Analiza estrategias de trading intradía utilizando modelos GARCH para la predicción de volatilidad
          </p>
          <p className="date-warning">
            Selecciona un rango de fechas entre <strong>2021-09-29</strong> y <strong>2023-09-18</strong> (inclusive).
            El rango debe cubrir al menos <strong>6 meses completos</strong> para que el modelo pueda generar señales válidas.
          </p>
          
          <div className="analysis-form">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            
            <button
              onClick={handleAnalyze}
              disabled={loading || !startDate || !endDate}
              className="submit-btn submit-btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading-spinner-inline"></span>
                  Analizando...
                </>
              ) : (
                'Ejecutar Estrategia'
              )}
            </button>
          </div>
        </div>

        {data && (
          <div className="results-container">
            <div className="results-grid">
              <div className="results-card">
                <h3 className="card-title">Resumen de Rendimiento</h3>
                <SummaryBox cumulative={data.cumulative_return} />
              </div>
              
              <div className="results-card">
                <h3 className="card-title">Gráfico de Retornos</h3>
                <ResultChart returns={data.strategy_returns} />
              </div>
              
              <div className="results-card full-width">
                <h3 className="card-title">Señales Diarias</h3>
                <DailySignalsTable signals={data.daily_signals} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GarchStrategyPage;
