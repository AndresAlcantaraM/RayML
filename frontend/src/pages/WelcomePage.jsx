import { Link } from 'react-router';
import './styles.css';

const WelcomePage = () => {
  const features = [
    {
      name: 'Procesamiento Paralelo',
      description: 'Distribuimos la carga de trabajo con Ray para análisis a gran escala',
      icon: '⚡'
    },
    {
      name: 'Modelos Avanzados',
      description: 'Algoritmos de ML que identifican patrones de sentimiento con precisión',
      icon: '📊'
    },
    {
      name: 'Infraestructura Escalable',
      description: 'Arquitectura en contenedores para manejar picos de demanda',
      icon: '🖥️'
    }
  ];

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span>TwitterSentiment</span>
          </div>
          <div>
            <Link
              to="/sentiment"
              className="btn-primary"
            >
              Ir al Análisis →
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <h1 className="hero-title">
          Análisis de Sentimiento en <span className="hero-highlight">Tiempo Real</span>
        </h1>
        <p className="hero-description">
          Potenciado por Machine Learning paralelizado con Ray, descubre insights accionables
          del sentimiento del mercado en Twitter.
        </p>
        <div className="mt-10">
          <Link
            to="/sentiment"
            className="btn-primary large"
          >
            Comenzar Análisis
          </Link>
          <Link to="/garch" className="btn-primary">
            Estrategia GARCH →
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">Características</h2>
            <p className="features-subtitle">Tecnología de vanguardia</p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <div key={feature.name} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.name}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <p className="footer-text">
            &copy; {new Date().getFullYear()} TwitterSentiment Analytics. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
