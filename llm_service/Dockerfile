FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

# gunicorn con hilos: las llamadas a Gemini son bloqueantes y pueden tardar
CMD ["gunicorn", "-w", "2", "-k", "gthread", "--threads", "4", "-b", "0.0.0.0:5001", "--timeout", "300", "app:app"]
