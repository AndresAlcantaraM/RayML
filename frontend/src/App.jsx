import { BrowserRouter as Router, Routes, Route } from 'react-router';
import WelcomePage from './pages/WelcomePage';
import SentimentAnalysis from './pages/SentimentAnalysis';
import GarchStrategyPage from './pages/GarchStrategyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/sentiment" element={<SentimentAnalysis />} />
        <Route path="/garch" element={<GarchStrategyPage />} />
      </Routes>
    </Router>
  );
}

export default App;