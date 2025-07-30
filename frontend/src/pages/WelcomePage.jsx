import { Link } from 'react-router';
import { checkHealth } from '../api/analysisService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

const WelcomePage = () => {

  const checkServiceHealth = async () => {
    const status = await checkHealth();
    if (status.api === 'healthy' && status.ray_service === 'healthy') {
      toast.success('Todos los servicios están operativos');
    } else {
      toast.warning('Algunos servicios no están disponibles');
    }
  };

  const features = [
    {
      name: 'Procesamiento Paralelo',
      description: 'Distribuimos la carga de trabajo con Ray para análisis a gran escala con máxima eficiencia',
      icon: '⚡'
    },
    {
      name: 'Modelos Avanzados',
      description: 'Algoritmos de ML de última generación que identifican patrones de sentimiento con alta precisión',
      icon: '📊'
    },
    {
      name: 'Infraestructura Escalable',
      description: 'Arquitectura robusta en contenedores diseñada para manejar picos de demanda automáticamente',
      icon: '🖥️'
    }
  ];

  return (
    <div className="welcome-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span>RayML Analytics</span>
          </div>
          <div className="nav-actions">
            <button
              onClick={checkServiceHealth}
              className="nav-health"
            >
              ✅ Verificar Estado
            </button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Análisis de Sentimiento en Twitter<br />
            Estrategia GARCH Intradía<br />
            <span className="hero-highlight center-line">EN TIEMPO REAL</span>
          </h1>
          <p className="hero-description">
            Potenciado por Machine Learning paralelizado con Ray, descubre insights accionables
            del sentimiento del mercado y estrategias de trading avanzadas.
          </p>
          <div className="hero-actions mt-10">
            <Link
              to="/sentiment"
              className="btn-primary large"
            >
              🚀 Análisis de Sentimiento
            </Link>
            <Link to="/garch" className="btn-primary large">
              📈 Estrategia GARCH
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">🎯 Características Principales</h2>
            <p className="features-subtitle">Tecnología de Vanguardia</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={feature.name} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
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
            &copy; {new Date().getFullYear()} RayML Analytics Platform. Desarrollado con ❤️ para análisis financiero avanzado.
          </p>
        </div>
      </footer>
      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
};

export default WelcomePage;
