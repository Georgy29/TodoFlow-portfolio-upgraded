from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from datetime import timedelta
import os

from .db import db
from .models import User, Todo

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///todos.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-secret-change-me")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=4)

    frontend_origin = os.environ.get("FRONTEND_ORIGIN")
    if frontend_origin:
        CORS(app, origins=[frontend_origin])
    else:
        CORS(app)

    db.init_app(app)
    JWTManager(app)

    with app.app_context():
        db.create_all()

    # --- health ---
    @app.get("/api/ping")
    def ping():
        return "pong"

    # --- auth ---
    @app.post("/api/auth/register")
    def register():
        data = request.get_json(force=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "").strip()
        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400
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
        data = request.get_json(force=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "").strip()
        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400
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
        data = request.get_json(force=True) or {}
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({"error": "title is required"}), 400
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
