import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

function ResultChart({ returns }) {
  
  const formattedReturns = returns.map((r) => ({
    ...r,
    date: r.date || r.datetime 
  }));

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Retornos diarios</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedReturns}>
          <CartesianGrid stroke="#ccc" />
          <XAxis
            dataKey="date"
            tickFormatter={(str) =>
              new Date(str).toLocaleDateString('es-CO', {
                month: 'short',
                day: 'numeric'
              })
            }
          />
          <YAxis />
          <Tooltip
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString('es-CO', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            }
          />
          <Line type="monotone" dataKey="daily_return" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ResultChart;
