FROM python:3.11

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential curl && apt-get clean

RUN pip install --upgrade pip

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]