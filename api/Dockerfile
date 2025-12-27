FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY api/requirements.txt /app/api/requirements.txt
RUN python -m pip install --no-cache-dir -U pip \
    && python -m pip install --no-cache-dir -r /app/api/requirements.txt

COPY api /app/api

EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000", "api.app:create_app()"]

