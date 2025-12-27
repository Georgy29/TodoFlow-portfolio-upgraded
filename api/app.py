from datetime import timedelta
import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.exceptions import HTTPException

from .config import resolve_database_uri
from .db import db
from .routes import auth_bp, health_bp, todos_bp


def create_app(test_config=None):
    app = Flask(__name__)

    if test_config is not None:
        app.config.update(test_config)
    # --- JWT secret handling ---
    jwt_secret = app.config.get("JWT_SECRET_KEY") or os.environ.get(
        "JWT_SECRET_KEY", "dev-secret-change-me"
    )

    if os.environ.get("FLASK_ENV") == "production":
        if not jwt_secret or jwt_secret == "dev-secret-change-me":
            raise ValueError("JWT_SECRET_KEY must be set in production")

    app.config["JWT_SECRET_KEY"] = jwt_secret

    app.config["SQLALCHEMY_DATABASE_URI"] = resolve_database_uri(
        app.config.get("SQLALCHEMY_DATABASE_URI")
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config.setdefault("JWT_ACCESS_TOKEN_EXPIRES", timedelta(hours=4))

    frontend_origin = os.environ.get("FRONTEND_ORIGIN")
    if frontend_origin:
        CORS(app, origins=[frontend_origin])
    else:
        CORS(app)

    db.init_app(app)
    JWTManager(app)

    @app.errorhandler(Exception)
    def handle_error(e):
        if isinstance(e, HTTPException):
            return e
        db.session.rollback()
        # Log the error for debugging (server-side)
        print(f"Error: {e}")  # Only you see this
        # Return generic message to user
        return jsonify({"error": "Internal server error"}), 500

    # Avoid auto-creating tables during tests; for Postgres use Alembic migrations.
    if not app.config.get("TESTING") and app.config[
        "SQLALCHEMY_DATABASE_URI"
    ].startswith("sqlite:"):
        with app.app_context():
            db.create_all()

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(todos_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
