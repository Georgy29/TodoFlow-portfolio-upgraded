from flask import Blueprint

health_bp = Blueprint("health", __name__)


@health_bp.get("/api/ping")
def ping():
    return "pong"
