# Build context is the repo root (see docker-compose.yml) so this can
# reach both backend/ and ai/ as siblings.
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
COPY ai/requirements.txt ./ai-requirements.txt
RUN pip install --no-cache-dir -r requirements.txt -r ai-requirements.txt

COPY backend/ .
COPY ai/ /ai
ENV PYTHONPATH=/ai/src:$PYTHONPATH

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
