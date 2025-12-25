import html

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import BadRequest

from ..db import db
from ..models import Todo

todos_bp = Blueprint("todos", __name__)


def sanitize_title(raw: str) -> str:
    return html.escape(raw.strip())


@todos_bp.get("/api/todos")
@jwt_required()
def get_todos():
    uid = int(get_jwt_identity())
    items = Todo.query.filter_by(user_id=uid).order_by(Todo.id.asc()).all()
    return jsonify([t.to_dict() for t in items])


@todos_bp.post("/api/todos")
@jwt_required()
def add_todo():
    uid = int(get_jwt_identity())
    try:
        data = request.get_json(force=True) or {}
    except BadRequest:
        return jsonify({"error": "Invalid JSON"}), 400
    raw_title = (data.get("title") or "").strip()
    if not raw_title:
        return jsonify({"error": "TODO title is required"}), 400

    # Escape HTML to prevent XSS
    title = sanitize_title(raw_title)
    if len(title) > 100:
        return jsonify({"error": "title too long"}), 400

    todo = Todo(title=title, done=False, user_id=uid)
    db.session.add(todo)
    db.session.commit()
    return jsonify(todo.to_dict()), 201


@todos_bp.patch("/api/todos/<int:todo_id>")
@jwt_required()
def toggle_todo(todo_id: int):
    uid = int(get_jwt_identity())
    todo = db.session.get(Todo, todo_id)
    if not todo or todo.user_id != uid:
        return jsonify({"error": "not found"}), 404
    todo.done = not todo.done
    db.session.commit()
    return jsonify(todo.to_dict())


@todos_bp.delete("/api/todos/<int:todo_id>")
@jwt_required()
def delete_todo(todo_id: int):
    uid = int(get_jwt_identity())
    todo = db.session.get(Todo, todo_id)
    if not todo or todo.user_id != uid:
        return jsonify({"error": "not found"}), 404
    db.session.delete(todo)
    db.session.commit()
    return ("", 204)
