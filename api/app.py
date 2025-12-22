from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.exceptions import BadRequest

from datetime import timedelta
import os, re, html

from .db import db
from .models import User, Todo

def create_app(test_config = None):
    app = Flask(__name__)


    if test_config is not None:
        app.config.update(test_config)
    # --- JWT secret handling ---
    jwt_secret = app.config.get("JWT_SECRET_KEY") or os.environ.get("JWT_SECRET_KEY", "dev-secret-change-me")

    if os.environ.get("FLASK_ENV") == "production":
        if not jwt_secret or jwt_secret == "dev-secret-change-me":
            raise ValueError("JWT_SECRET_KEY must be set in production")

    app.config["JWT_SECRET_KEY"] = jwt_secret

        
    app.config.setdefault("SQLALCHEMY_DATABASE_URI", "sqlite:///todos.db")
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
        db.session.rollback()
        # Log the error for debugging (server-side)
        print(f"Error: {e}")  # Only you see this
        # Return generic message to user
        return jsonify({"error": "Internal server error"}), 500
        
    # avoid auto-creating db during tests
    if not app.config.get("TESTING"):
        with app.app_context():
            db.create_all()
            
    EMAIL_REGEX = re.compile(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    def validate_email(email: str) -> str | None:
        if not EMAIL_REGEX.fullmatch(email):
            return 'invalid email format'
        return None
        
    
    def validate_password(password: str) -> str | None:
        if len(password) < 8:
            return "password must be at least 8 characters"
        if not re.search(r"[A-Za-z]", password):
            return "password must contain at least one letter"
        if not re.search(r"\d", password):
            return "password must contain at least one number"
        return None   
    
    def sanitize_title(raw: str) -> str:
        return html.escape(raw.strip())
    
    # --- health ---
    @app.get("/api/ping")
    def ping():
        return "pong"

    # --- auth ---
    @app.post("/api/auth/register")
    def register():
        try:
            data = request.get_json(force=True) or {}
        except BadRequest:
            return jsonify({"error" : "Invalid JSON"}), 400
        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "").strip()
        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400
        
        email_error = validate_email(email)
        if email_error:
             return jsonify({"error": email_error}), 400
        
        msg = validate_password(password)
        if msg:
            return jsonify({"error": msg}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "email already registered"}), 409
        user = User(email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        token = create_access_token(identity=str(user.id))
        return jsonify({"user": user.to_dict(), "token": token}), 201

    @app.post("/api/auth/login")
    def login():
        try:
            data = request.get_json(force=True) or {}
        except BadRequest:
            return jsonify({"error" : "Invalid JSON"}), 400
        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "").strip()
        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400
        email_error = validate_email(email)
        if email_error:
            return jsonify({"error": email_error}), 400
        
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "invalid credentials"}), 401
        token = create_access_token(identity=str(user.id))
        return jsonify({"user": user.to_dict(), "token": token})

    @app.get("/api/me")
    @jwt_required()
    def me():
        uid = int(get_jwt_identity())
        user = db.session.get(User, uid)
        if not user:
            return jsonify({"error" : "not found"}), 404    
        return jsonify({"user": user.to_dict()})

    # --- todos (protected) ---
    @app.get("/api/todos")
    @jwt_required()
    def get_todos():    
        uid = int(get_jwt_identity())
        items = Todo.query.filter_by(user_id=uid).order_by(Todo.id.asc()).all()
        return jsonify([t.to_dict() for t in items])



    @app.post("/api/todos")
    @jwt_required()
    def add_todo():
        uid = int(get_jwt_identity())
        try:
            data = request.get_json(force=True) or {}
        except BadRequest:
            return jsonify({"error" : "Invalid JSON"}), 400
        raw_title = (data.get("title") or "").strip()
        if not raw_title:
            return jsonify({"error": "TODO title is required"}), 400
        
        # Escape HTML to prevent XSS
        title = sanitize_title(raw_title)
        
        if len(title) > 100:
            return jsonify({"error":"title too long"}), 400
        
        
        todo = Todo(title=title, done=False, user_id=uid)
        db.session.add(todo)
        db.session.commit()
        return jsonify(todo.to_dict()), 201

    @app.patch("/api/todos/<int:todo_id>")
    @jwt_required()
    def toggle_todo(todo_id: int):
        uid = int(get_jwt_identity())
        todo = db.session.get(Todo, todo_id)
        if not todo or todo.user_id != uid:
            return jsonify({"error": "not found"}), 404
        todo.done = not todo.done
        db.session.commit()
        return jsonify(todo.to_dict())

    @app.delete("/api/todos/<int:todo_id>")
    @jwt_required()
    def delete_todo(todo_id: int):
        uid = int(get_jwt_identity())
        todo = db.session.get(Todo, todo_id)
        if not todo or todo.user_id != uid:
            return jsonify({"error": "not found"}), 404
        db.session.delete(todo)
        db.session.commit()
        return ("", 204)

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
