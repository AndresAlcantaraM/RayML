import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ComparisonChart = ({ portfolioData, tickerData, tickerSymbol }) => {
  console.log('ComparisonChart - portfolioData:', portfolioData);
  console.log('ComparisonChart - tickerData:', tickerData);
  console.log('ComparisonChart - tickerSymbol:', tickerSymbol);

  if (!portfolioData || !tickerData) {
    console.log('ComparisonChart - Missing data, returning null');
    return <div>No hay datos para mostrar la comparación</div>;
  }

  // Preparar los datos combinados por fecha
  const prepareChartData = () => {
    console.log('Preparando datos del portafolio:', portfolioData);
    console.log('Preparando datos del ticker:', tickerData);

    if (!portfolioData || portfolioData.length === 0) {
      console.log('No hay datos del portafolio');
      return { labels: [], portfolioValues: [], tickerValues: [] };
    }

    if (!tickerData.prices || tickerData.prices.length === 0) {
      console.log('No hay datos de precios del ticker');
      return { labels: [], portfolioValues: [], tickerValues: [] };
    }

    const portfolioReturns = portfolioData.map(item => ({
      date: item.date,
      portfolioReturn: item.portfolio_return
    }));

    const tickerReturns = tickerData.prices.map(item => ({
      date: item.Date || item.date,
      tickerReturn: item.return
    }));

    console.log('Portfolio returns preparados:', portfolioReturns.slice(0, 3));
    console.log('Ticker returns preparados:', tickerReturns.slice(0, 3));

    // Crear un mapa para hacer el merge más eficiente
    const tickerMap = new Map(tickerReturns.map(item => [item.date, item.tickerReturn]));
    
    // Combinar datos por fecha
    const labels = [];
    const portfolioValues = [];
    const tickerValues = [];

    portfolioReturns.forEach(portfolioItem => {
      const tickerReturn = tickerMap.get(portfolioItem.date);
      if (tickerReturn !== undefined && tickerReturn !== null) {
        // Formatear fecha de forma más consistente
        const dateObj = new Date(portfolioItem.date);
        const formattedDate = dateObj.toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric'
        });
        
        labels.push(formattedDate);
        portfolioValues.push(Number(portfolioItem.portfolioReturn) * 100); // Convertir a porcentaje
        tickerValues.push(Number(tickerReturn) * 100); // Convertir a porcentaje
      }
    });

    console.log('Datos finales preparados:');
    console.log('Labels:', labels.slice(0, 5));
    console.log('Portfolio values:', portfolioValues.slice(0, 5));
    console.log('Ticker values:', tickerValues.slice(0, 5));

    return { labels, portfolioValues, tickerValues };
  };

  const { labels, portfolioValues, tickerValues } = prepareChartData();

  // Validar que tenemos datos para mostrar
  if (labels.length === 0 || portfolioValues.length === 0 || tickerValues.length === 0) {
    return (
      <div className="comparison-chart-container" style={{ margin: '20px 0', textAlign: 'center', padding: '40px' }}>
        <p>No hay datos coincidentes entre las fechas del portafolio y el ticker seleccionado.</p>
        <p>Intenta con un rango de fechas diferente o otro ticker.</p>
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Portafolio Sentimiento (%)',
        data: portfolioValues,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: `${tickerSymbol} Retornos (%)`,
        data: tickerValues,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true,
      },
      title: {
        display: true,
        text: `Comparación de Retornos: Portafolio Sentimiento vs ${tickerSymbol}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(4)}%`;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Fecha'
        },
        ticks: {
          maxTicksLimit: 10
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Retorno (%)'
        },
        ticks: {
          callback: function(value) {
            return value.toFixed(2) + '%';
          }
        }
      },
    },
    elements: {
      line: {
        tension: 0.1
      },
      point: {
        radius: 3,
        hoverRadius: 6
      }
    }
  };  return (
    <div className="comparison-chart-container" style={{ margin: '20px 0' }}>
      {/* Tabla de debug - remover en producción */}
      <details style={{ marginBottom: '20px' }}>
        <summary>Datos de debug (click para ver)</summary>
        <div style={{ maxHeight: '200px', overflow: 'auto', fontSize: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '4px' }}>Fecha</th>
                <th style={{ border: '1px solid #ccc', padding: '4px' }}>Portafolio (%)</th>
                <th style={{ border: '1px solid #ccc', padding: '4px' }}>{tickerSymbol} (%)</th>
              </tr>
            </thead>
            <tbody>
              {labels.slice(0, 10).map((label, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ccc', padding: '4px' }}>{label}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px' }}>{portfolioValues[index]?.toFixed(4)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px' }}>{tickerValues[index]?.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      
      <div style={{ height: '400px', position: 'relative' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ComparisonChart;
