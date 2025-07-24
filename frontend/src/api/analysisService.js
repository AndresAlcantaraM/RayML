import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

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

// Chequeo de salud del backend
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    console.log(response)
    return response.data;
  } catch (error) {
    return { api: 'unreachable', ray_service: 'unreachable' };
  }
};
