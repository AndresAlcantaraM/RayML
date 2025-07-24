import './Metadata.css';

const MetadataCard = ({ metadata }) => {
  return (
    <div className="metadata-card">
      <div className="metadata-header">
        <div className="metadata-icon">📊</div>
        <h2 className="metadata-title">Metadatos del Análisis</h2>
      </div>
      
      <div className="metadata-grid">
        <div className="metadata-item">
          <h3 className="metadata-item-label">Período analizado</h3>
          <p className="metadata-item-value">{metadata.period}</p>
        </div>
        
        <div className="metadata-item">
          <h3 className="metadata-item-label">Acciones analizadas</h3>
          <p className="metadata-item-value">{metadata.num_tickers}</p>
        </div>
        
        <div className="metadata-item">
          <h3 className="metadata-item-label">Períodos calculados</h3>
          <p className="metadata-item-value">{metadata.num_periods}</p>
        </div>
      </div>
      
      <div className="metadata-details">
        <h3 className="details-title">Detalles técnicos</h3>
        <ul className="details-list">
          <li className="detail-item">
            <span className="detail-bullet">→</span>
            <span>Análisis basado en datos de Twitter</span>
          </li>
          <li className="detail-item">
            <span className="detail-bullet">→</span>
            <span>Procesamiento paralelizado con Ray</span>
          </li>
          <li className="detail-item">
            <span className="detail-bullet">→</span>
            <span>Top 5 acciones por engagement ratio</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MetadataCard;