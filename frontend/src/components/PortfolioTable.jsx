import { useState } from 'react';
import './Portafolio.css';

const PortfolioTable = ({ data }) => {
  const [showAll, setShowAll] = useState(false);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="portfolio-table-container">
        <div className="portfolio-empty-message">
          No hay datos disponibles para mostrar
        </div>
      </div>
    );
  }

  const normalizedData = data.map(item => ({
    date: item.Date || item.date || '',
    return: item.portfolio_return || item.return || 0
  }));

  const sortedData = [...normalizedData].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  const displayedData = showAll ? sortedData : sortedData.slice(0, 10);

  const downloadCSV = () => {
    const headers = ['Fecha,Retorno'];
    const csvContent = [
      ...headers,
      ...sortedData.map(item => 
        `"${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}",${item.return}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'retornos_portafolio.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatReturn = (value) => {
    const percentage = (value * 100).toFixed(2);
    const isPositive = value >= 0;
    
    return (
      <span className={`return-value ${isPositive ? 'positive-return' : 'negative-return'}`}>
        {isPositive ? '+' : ''}{percentage}%
      </span>
    );
  };

  return (
    <div className="portfolio-table-container">
      <div className="portfolio-actions">
        {sortedData.length > 10 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="toggle-data-btn"
          >
            {showAll ? 'Mostrar solo 10' : 'Mostrar todos'}
          </button>
        )}
        <button 
          onClick={downloadCSV}
          className="download-btn"
        >
          Descargar CSV
        </button>
      </div>

      <table className="portfolio-table">
        <thead>
          <tr>
            <th className="header-date">Fecha</th>
            <th className="header-return">Retorno</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.map((row, idx) => (
            <tr key={`${row.date}-${idx}`} className="portfolio-row">
              <td className="date-cell">
                {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="return-cell">
                {formatReturn(row.return)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!showAll && sortedData.length > 10 && (
        <div className="portfolio-message">
          Mostrando 10 de {sortedData.length} registros. Usa el botón "Mostrar todos" para ver el historico completo.
        </div>
      )}
    </div>
  );
};

export default PortfolioTable;
