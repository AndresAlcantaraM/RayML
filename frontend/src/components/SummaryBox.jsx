function SummaryBox({ cumulative }) {
  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Retorno Acumulado</h2>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        {Math.round(cumulative * 10000) / 100}% 📈
      </p>
    </div>
  );
}

export default SummaryBox;
