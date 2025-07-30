import ray
from ray import serve
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from models.TwitterSentimentAnalysis import TwitterSentimentAlgorithm
from models.IntradayGARCHStrategy import IntradayGARCHAlgorithm
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Permitir frontend localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@serve.deployment()
@serve.ingress(app)
class CombinedAnalysisServer:
    def __init__(self):
        self.sentiment_model = TwitterSentimentAlgorithm()
        self.garch_model = IntradayGARCHAlgorithm()
        logger.info("Modelos cargados correctamente")

    @app.post("/analyze/sentiment")
    async def analyze_sentiment(self, request: Request):
        try:
            body = await request.json()
            start_date = body.get("start_date")
            end_date = body.get("end_date")

            if not start_date or not end_date:
                return {"status": "error", "message": "start_date y end_date son requeridos"}

            logger.info(f"Ejecutando análisis de sentimiento: {start_date} - {end_date}")
            result = self.sentiment_model.run_analysis(start_date, end_date)
            return result

        except Exception as e:
            logger.error(f"Error en análisis de sentimiento: {str(e)}")
            return {"status": "error", "message": str(e)}

    @app.post("/analyze/garch")
    async def analyze_garch(self, request: Request):
        try:
            body = await request.json()
            start_date = body.get("start_date")
            end_date = body.get("end_date")

            if not start_date or not end_date:
                return {"status": "error", "message": "start_date y end_date son requeridos"}

            logger.info(f"Ejecutando GARCH Strategy: {start_date} - {end_date}")
            result = self.garch_model.run_strategy(start_date, end_date)
            if not result or not isinstance(result, dict):
                logger.error("GARCH result es inválido o incompleto: %s", result)
                return {
                    "status": "error",
                    "message": "No se pudo calcular la estrategia GARCH",
                    "daily_signals": [],
                    "strategy_returns": [],
                    "cumulative_return": 0
                }
            return result

        except Exception as e:
            logger.error(f"Error en estrategia GARCH: {str(e)}")
            return {"status": "error", "message": str(e)}

    @app.post("/analyze/ticker-prices")
    async def get_ticker_prices(self, request: Request):
        try:
            body = await request.json()
            ticker = body.get("ticker")
            start_date = body.get("start_date")
            end_date = body.get("end_date")

            if not ticker or not start_date or not end_date:
                return {"status": "error", "message": "ticker, start_date y end_date son requeridos"}

            logger.info(f"Obteniendo precios para ticker: {ticker}, periodo: {start_date} - {end_date}")
            result = self.sentiment_model.get_ticker_prices(ticker, start_date, end_date)
            return result

        except Exception as e:
            logger.error(f"Error obteniendo precios del ticker: {str(e)}")
            return {"status": "error", "message": str(e)}

    @app.get("/health")
    async def health(self):
        return {"status": "healthy"}

def start_service():
    ray.init(ignore_reinit_error=True)
    serve.start(http_options={"host": "0.0.0.0"})

    serve.run(CombinedAnalysisServer.bind())
    logger.info("Servicio Ray combinado desplegado correctamente")

    import time
    while True:
        time.sleep(5)

if __name__ == "__main__":
    start_service()
