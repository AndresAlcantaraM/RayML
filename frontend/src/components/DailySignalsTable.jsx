function DailySignalsTable({ signals }) {
  const formattedSignals = signals.map((row) => ({
    ...row,
    date: row.date || row.Date
  }));

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Señales diarias</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Señal</th>
            <th>Predicción</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(formattedSignals) && formattedSignals.length > 0 ? (
            formattedSignals.map((row, i) => (
              <tr key={i}>
                <td>
                  {new Date(row.date).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td>{row.signal_daily}</td>
                <td>{row.predictions?.toFixed(6)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No hay señales disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DailySignalsTable;
