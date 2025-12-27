from flask_sqlalchemy import SQLAlchemy

# Один экземпляр на всё приложение — Flask сам управляет сессией на запрос
db = SQLAlchemy()
