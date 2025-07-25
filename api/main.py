from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RAY_SERVE_URL = "http://ray_service:8000"


class AnalyzeRequest(BaseModel):
    start_date: str
    end_date: str

class TickerPricesRequest(BaseModel):
    ticker: str
    start_date: str
    end_date: str

@app.post("/api/analyze/sentiment")
async def analyze_sentiment(data: AnalyzeRequest):
    try:
        logger.info(f"Solicitando análisis de sentimiento: {data.start_date} - {data.end_date}")
        response = requests.post(
            f"{RAY_SERVE_URL}/analyze/sentiment",
            json={"start_date": data.start_date, "end_date": data.end_date},
            timeout=30
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        logger.error(f"Error en Ray Serve (sentiment): {str(e)}")
        raise HTTPException(status_code=502, detail=f"Servicio de análisis no disponible: {str(e)}")
    except Exception as e:
        logger.error(f"Error inesperado (sentiment): {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/api/analyze/garch")
async def analyze_garch(data: AnalyzeRequest):
    try:
        logger.info(f"Solicitando análisis GARCH: {data.start_date} - {data.end_date}")
        response = requests.post(
            f"{RAY_SERVE_URL}/analyze/garch",
            json={"start_date": data.start_date, "end_date": data.end_date},
            timeout=60
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        logger.error(f"Error en Ray Serve (GARCH): {str(e)}")
        raise HTTPException(status_code=502, detail=f"Servicio GARCH no disponible: {str(e)}")
    except Exception as e:
        logger.error(f"Error inesperado (GARCH): {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/api/analyze/ticker-prices") 
async def get_ticker_prices(data: TickerPricesRequest):
    try:
        logger.info(f"Solicitando precios para ticker: {data.ticker}, periodo: {data.start_date} - {data.end_date}")
        response = requests.post(
            f"{RAY_SERVE_URL}/analyze/ticker-prices",
            json={"ticker": data.ticker, "start_date": data.start_date, "end_date": data.end_date},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error en Ray Serve (ticker prices): {str(e)}")
        raise HTTPException(status_code=502, detail=f"Servicio de precios no disponible: {str(e)}")
    except Exception as e:
        logger.error(f"Error inesperado (ticker prices): {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/")
async def root():
    return {"message": "API combinada: Sentiment y GARCH"}

@app.get("/api/health")
async def health_check():
    try:
        response = requests.get(f"{RAY_SERVE_URL}/health", timeout=5)
        response.raise_for_status()
        return {
            "api": "healthy",
            "ray_service": response.json().get("status", "unknown")
        }
    except Exception as e:
        return {
            "api": "healthy",
            "ray_service": "unavailable",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
