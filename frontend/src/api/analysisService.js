import axios from 'axios';



const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.PUBLIC_IP || 'http://localhost:8001';

console.log("API_BASE_URL:", API_BASE_URL);
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("PUBLIC_IP:", import.meta.env.PUBLIC_IP);

// Análisis de sentimiento
export const analyzeSentiment = async (startDate, endDate) => {
  try {
    const response = await axios.post(
        `${API_BASE_URL}/api/analyze/sentiment`, 
        {
            start_date: startDate,
            end_date: endDate
        },
        {
            timeout: 90000
        }
    );

    console.log("Respuesta Sentiment:", response.data);

    return {
      returns: response.data.returns || [],
      topStocks: response.data.top_stocks || [],
      metadata: response.data.metadata || {}
    };
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Error al analizar sentimiento');
  }
};

// Análisis GARCH
export const analyzeGARCH = async (startDate, endDate) => {
  try {
    const response = await axios.post(
        `${API_BASE_URL}/api/analyze/garch`, 
        {
            start_date: startDate,
            end_date: endDate
        },
        {
            timeout: 90000
        }
    );

    console.log("Respuesta GARCH:", response.data);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Error en análisis GARCH');
  }
};

// Obtener precios de un ticker específico
export const getTickerPrices = async (ticker, startDate, endDate) => {
  try {
    const response = await axios.post(
        `${API_BASE_URL}/api/analyze/ticker-prices`, 
        {
            ticker: ticker.toUpperCase(),
            start_date: startDate,
            end_date: endDate
        },
        {
            timeout: 60000
        }
    );

    console.log("Respuesta Ticker Prices:", response.data);

    return {
      ticker: response.data.ticker,
      period: response.data.period,
      prices: response.data.prices || [],
      summary: response.data.summary || {}
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener precios del ticker');
  }
};

// Chequeo de salud del backend
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    console.log(response)
    return response.data;
  } catch (error) {
    console.log("Error en health check:", error);
    return { api: 'unreachable', ray_service: 'unreachable' };
  }
};
