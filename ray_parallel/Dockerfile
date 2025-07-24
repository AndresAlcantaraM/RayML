FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /tmp/ray && chmod -R 777 /tmp/ray


CMD ray start --head --port=6379 --include-dashboard=true \
    --dashboard-host=0.0.0.0 --dashboard-port=8265 --temp-dir=/tmp/ray \
 && python serviceRay.py
