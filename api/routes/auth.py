import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.exceptions import BadRequest

from ..db import db
from ..models import User

auth_bp = Blueprint("auth", __name__)

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def validate_email(email: str) -> str | None:
    if not EMAIL_REGEX.fullmatch(email):
        return "invalid email format"
    return None


def validate_password(password: str) -> str | None:
    if len(password) < 8:
        return "password must be at least 8 characters"
    if not re.search(r"[A-Za-z]", password):
        return "password must contain at least one letter"
    if not re.search(r"\d", password):
        return "password must contain at least one number"
    return None


@auth_bp.post("/api/auth/register")
def register():
    try:
        data = request.get_json(force=True) or {}
    except BadRequest:
        return jsonify({"error": "Invalid JSON"}), 400
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


@auth_bp.post("/api/auth/login")
def login():
    try:
        data = request.get_json(force=True) or {}
    except BadRequest:
        return jsonify({"error": "Invalid JSON"}), 400
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


@auth_bp.get("/api/me")
@jwt_required()
def me():
    uid = int(get_jwt_identity())
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"error": "not found"}), 404
    return jsonify({"user": user.to_dict()})
