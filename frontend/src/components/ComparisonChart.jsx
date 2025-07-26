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
  console.log('ComparisonChart - Props recibidas:', {
    portfolioData: portfolioData?.slice(0, 2),
    tickerData: {
      ticker: tickerData?.ticker,
      pricesLength: tickerData?.prices?.length,
      firstPrice: tickerData?.prices?.[0],
      summary: tickerData?.summary
    },
    tickerSymbol
  });

  if (!portfolioData || !tickerData) {
    console.log('ComparisonChart - Missing data, returning null');
    return <div>No hay datos para mostrar la comparación</div>;
  }

  // Preparar los datos combinados por fecha
  const prepareChartData = () => {
    console.log('ComparisonChart - Preparando datos del portafolio:', portfolioData);
    console.log('ComparisonChart - Preparando datos del ticker:', tickerData);

    if (!portfolioData || portfolioData.length === 0) {
      console.log('ComparisonChart - No hay datos del portafolio');
      return { labels: [], portfolioValues: [], tickerValues: [] };
    }

    if (!tickerData || !tickerData.prices || tickerData.prices.length === 0) {
      console.log('ComparisonChart - No hay datos de precios del ticker');
      return { labels: [], portfolioValues: [], tickerValues: [] };
    }

    // Normalizar fechas para evitar problemas de formato
    const normalizeDate = (dateStr) => {
      if (!dateStr) return null;
      try {
        let date;
        // Intentar varios formatos de fecha
        if (typeof dateStr === 'string') {
          // Formato ISO o similar
          if (dateStr.includes('T')) {
            date = new Date(dateStr);
          } else {
            // Formato YYYY-MM-DD o similar  
            date = new Date(dateStr + 'T00:00:00');
          }
        } else {
          date = new Date(dateStr);
        }
        
        // Verificar que la fecha sea válida
        if (isNaN(date.getTime())) {
          console.warn('ComparisonChart - Fecha inválida:', dateStr);
          return null;
        }
        
        // Devolver en formato YYYY-MM-DD para comparación consistente
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.warn('ComparisonChart - Error procesando fecha:', dateStr, error);
        return null;
      }
    };

    const portfolioReturns = portfolioData
      .map(item => ({
        date: normalizeDate(item.Date || item.date), // Usar Date con mayúscula primero
        portfolioReturn: Number(item.portfolio_return) || 0
      }))
      .filter(item => item.date !== null);

    const tickerReturns = tickerData.prices
      .map(item => ({
        date: normalizeDate(item.Date || item.date), // Usar Date con mayúscula primero
        tickerReturn: Number(item.return) || 0
      }))
      .filter(item => item.date !== null);

    console.log('ComparisonChart - Portfolio returns preparados:', portfolioReturns.slice(0, 3));
    console.log('ComparisonChart - Ticker returns preparados:', tickerReturns.slice(0, 3));

    // Crear un mapa para hacer el merge más eficiente
    const tickerMap = new Map();
    tickerReturns.forEach(item => {
      if (item.date) {
        tickerMap.set(item.date, item.tickerReturn);
      }
    });
    
    // Combinar datos por fecha
    const labels = [];
    const portfolioValues = [];
    const tickerValues = [];

    portfolioReturns.forEach(portfolioItem => {
      if (!portfolioItem.date) return;
      
      const tickerReturn = tickerMap.get(portfolioItem.date);
      if (tickerReturn !== undefined && tickerReturn !== null && !isNaN(tickerReturn)) {
        // Formatear fecha para mostrar
        const dateObj = new Date(portfolioItem.date);
        const formattedDate = dateObj.toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric'
        });
        
        labels.push(formattedDate);
        portfolioValues.push(portfolioItem.portfolioReturn * 100); // Convertir a porcentaje
        tickerValues.push(tickerReturn * 100); // Convertir a porcentaje
      }
    });

    console.log('ComparisonChart - Datos finales preparados:');
    console.log('ComparisonChart - Labels:', labels.slice(0, 5));
    console.log('ComparisonChart - Portfolio values:', portfolioValues.slice(0, 5));
    console.log('ComparisonChart - Ticker values:', tickerValues.slice(0, 5));
    console.log('ComparisonChart - Total matching dates:', labels.length);

    return { labels, portfolioValues, tickerValues };
  };

  const { labels, portfolioValues, tickerValues } = prepareChartData();

  // Validar que tenemos datos para mostrar
  if (labels.length === 0 || portfolioValues.length === 0 || tickerValues.length === 0) {
    return (
      <div className="comparison-chart-container" style={{ margin: '20px 0', textAlign: 'center', padding: '40px' }}>
        <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
          <h4 style={{ color: '#374151', marginBottom: '12px' }}>No se encontraron datos coincidentes</h4>
          <p style={{ color: '#6b7280', marginBottom: '8px' }}>
            No hay fechas que coincidan entre el portafolio de sentimiento y el ticker {tickerSymbol}.
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.9em' }}>
            Esto puede ocurrir si:
          </p>
          <ul style={{ color: '#6b7280', fontSize: '0.9em', textAlign: 'left', display: 'inline-block', marginTop: '8px' }}>
            <li>• Las fechas del análisis no coinciden con días de mercado</li>
            <li>• El ticker seleccionado no tiene datos para el rango de fechas</li>
            <li>• Hay diferencias en el formato de fechas</li>
          </ul>
          <p style={{ color: '#374151', marginTop: '16px', fontWeight: '500' }}>
            Intenta con un rango de fechas diferente o otro ticker.
          </p>
        </div>
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Portafolio Sentimiento (%)',
        data: portfolioValues,
        borderColor: 'rgb(59, 130, 246)', // Azul más moderno
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.2,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: `${tickerSymbol} Retornos (%)`,
        data: tickerValues,
        borderColor: 'rgb(239, 68, 68)', // Rojo más moderno
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.2,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
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
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: `Comparación de Retornos Diarios: Portafolio vs ${tickerSymbol}`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const color = value >= 0 ? '🟢' : '🔴';
            return `${color} ${context.dataset.label}: ${value.toFixed(3)}%`;
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
          text: 'Fecha',
          font: {
            size: 12,
            weight: '600'
          }
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Retorno Diario (%)',
          font: {
            size: 12,
            weight: '600'
          }
        },
        ticks: {
          callback: function(value) {
            return value.toFixed(1) + '%';
          },
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        // Agregar línea en y=0 para referencia
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      },
    },
    elements: {
      line: {
        tension: 0.2
      },
      point: {
        radius: 2,
        hoverRadius: 4,
        hitRadius: 6
      }
    }
  };

  return (
    <div className="comparison-chart-container" style={{ margin: '20px 0' }}>
      {/* Tabla de debug - remover en producción */}
      <details style={{ marginBottom: '20px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: '500', color: '#374151' }}>
          📊 Datos de comparación ({labels.length} fechas coincidentes)
        </summary>
        <div style={{ 
          marginTop: '10px', 
          maxHeight: '200px', 
          overflow: 'auto', 
          fontSize: '12px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '6px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f3f4f6', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Fecha</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>Portafolio (%)</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>{tickerSymbol} (%)</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {labels.slice(0, 15).map((label, index) => {
                const portfolioValue = portfolioValues[index];
                const tickerValue = tickerValues[index];
                const difference = portfolioValue - tickerValue;
                return (
                  <tr key={index} style={{ background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ border: '1px solid #e5e7eb', padding: '6px' }}>{label}</td>
                    <td style={{ 
                      border: '1px solid #e5e7eb', 
                      padding: '6px', 
                      textAlign: 'right',
                      color: portfolioValue >= 0 ? '#059669' : '#dc2626'
                    }}>
                      {portfolioValue?.toFixed(3)}%
                    </td>
                    <td style={{ 
                      border: '1px solid #e5e7eb', 
                      padding: '6px', 
                      textAlign: 'right',
                      color: tickerValue >= 0 ? '#059669' : '#dc2626'
                    }}>
                      {tickerValue?.toFixed(3)}%
                    </td>
                    <td style={{ 
                      border: '1px solid #e5e7eb', 
                      padding: '6px', 
                      textAlign: 'right',
                      color: difference >= 0 ? '#059669' : '#dc2626',
                      fontWeight: '500'
                    }}>
                      {difference > 0 ? '+' : ''}{difference?.toFixed(3)}%
                    </td>
                  </tr>
                );
              })}
              {labels.length > 15 && (
                <tr>
                  <td colSpan="4" style={{ 
                    border: '1px solid #e5e7eb', 
                    padding: '8px', 
                    textAlign: 'center',
                    fontStyle: 'italic',
                    color: '#6b7280'
                  }}>
                    ... y {labels.length - 15} fechas más
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </details>
      
      <div style={{ height: '400px', position: 'relative' }}>
        <Line 
          data={data} 
          options={options}
          plugins={[
            {
              afterDraw: (chart) => {
                // Agregar línea de referencia en y=0
                const ctx = chart.ctx;
                const yAxis = chart.scales.y;
                const xAxis = chart.scales.x;
                
                if (yAxis.min < 0 && yAxis.max > 0) {
                  const zeroY = yAxis.getPixelForValue(0);
                  
                  ctx.save();
                  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                  ctx.lineWidth = 1;
                  ctx.setLineDash([5, 5]);
                  ctx.beginPath();
                  ctx.moveTo(xAxis.left, zeroY);
                  ctx.lineTo(xAxis.right, zeroY);
                  ctx.stroke();
                  ctx.restore();
                }
              }
            }
          ]}
        />
      </div>
    </div>
  );
};

export default ComparisonChart;
