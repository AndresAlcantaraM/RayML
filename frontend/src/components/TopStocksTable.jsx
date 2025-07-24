import { useState } from 'react';
import './TopStocksTable.css';

const TopStocksTable = ({ data }) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="top-stocks-table-container">
        <div className="top-stocks-empty-message">
          No hay datos disponibles para mostrar
        </div>
      </div>
    );
  }

  const normalizedData = data.map(item => ({
    date: item.date || '',
    symbol: item.symbol || '',
    engagement: item.engagement || item.engagement_ratio || 0,
    rank: item.rank || 0
  }));

  const months = [...new Set(normalizedData.map(item => item.date))];
  const sortedMonths = [...months].sort((a, b) => new Date(a) - new Date(b));

  const filteredData = selectedMonth 
    ? normalizedData.filter(item => item.date === selectedMonth)
    : normalizedData;


  const sortedData = [...filteredData].sort((a, b) => {
    const dateCompare = new Date(a.date) - new Date(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.rank - b.rank;
  });

  const displayedData = showAll ? sortedData : sortedData.slice(0, 10);

  const downloadCSV = () => {
    const headers = ['Fecha,Símbolo,Engagement,Ranking'];
    const csvContent = [
      ...headers,
      ...sortedData.map(item => 
        `"${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}","${item.symbol}",${item.engagement},${item.rank}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'top_stocks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatEngagement = (value) => {
    return (
      <span className="engagement-value">
        {value.toFixed(4)}
      </span>
    );
  };

  return (
    <div className="top-stocks-table-container">
      <div className="top-stocks-actions">
        <select 
          onChange={(e) => setSelectedMonth(e.target.value || null)}
          value={selectedMonth || ''}
          className="month-selector"
        >
          <option value="">Todos los meses</option>
          {sortedMonths.map(month => (
            <option key={month} value={month}>
              {new Date(month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>

        {filteredData.length > 10 && (
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

      <table className="top-stocks-table">
        <thead>
          <tr>
            <th className="header-date">Fecha</th>
            <th className="header-symbol">Símbolo</th>
            <th className="header-engagement">Engagement</th>
            <th className="header-rank">Ranking</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.map((row, idx) => (
            <tr key={`${row.date}-${row.symbol}-${idx}`} className="top-stocks-row">
              <td className="date-cell">
                {row.date ? new Date(row.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : 'N/A'}
              </td>
              <td className="symbol-cell">
                {row.symbol}
              </td>
              <td className="engagement-cell">
                {formatEngagement(row.engagement)}
              </td>
              <td className="rank-cell">
                <span className={`rank-badge rank-${row.rank}`}>
                  {row.rank}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!showAll && filteredData.length > 10 && (
        <div className="top-stocks-message">
          Mostrando 10 de {filteredData.length} registros. Usa el botón "Mostrar todos" para ver el historico completo.
        </div>
      )}
    </div>
  );
};

export default TopStocksTable;