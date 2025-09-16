# Fullstack PingPong (Flask + React)

Учебный fullstack-проект: бэкенд на **Flask + SQLite + JWT**, фронтенд на **React (Vite)**.

---

## 🚀 Запуск локально

### Бэкенд (Flask API)

1. Установи зависимости (лучше в виртуальном окружении):

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate   # Linux / macOS
.venv\Scripts\activate    # Windows PowerShell

pip install -r requirements.txt
```

2. Пересоздай БД (для dev):

```bash
rm -f todos.db
export JWT_SECRET_KEY=dev   # Linux / macOS
set JWT_SECRET_KEY=dev      # Windows PowerShell
cd ..
python -m api.app
```
API поднимется на `http://localhost:5000`.

### Фронтенд (React + Vite)

```bash
cd client
npm install
npm run dev -- --host
```

По умолчанию фронт откроется на `http://localhost:5173`.

---

## 🔗 Основные эндпоинты API

- `GET /api/ping` → проверка ("pong")  
- `POST /api/auth/register` → регистрация (JSON: `{ "email": "...", "password": "..." }`)  
- `POST /api/auth/login` → логин (вернёт JWT-токен)  
- `GET /api/me` → текущий пользователь (требует токен)  
- `GET /api/todos` → список задач (только свои, с токеном)  
- `POST /api/todos` → создать задачу (JSON: `{ "title": "..." }`)  
- `PATCH /api/todos/<id>` → переключить done  
- `DELETE /api/todos/<id>` → удалить задачу  

---

## 🌐 Деплой

### Бэкенд (Render)
1. Создай новый **Web Service**.  
2. Укажи:
   - **Build Command**: `pip install -r api/requirements.txt`
   - **Start Command**: `gunicorn api.app:create_app()`
3. Переменные окружения:
   - `PYTHON_VERSION=3.11`
   - `JWT_SECRET_KEY=<случайная строка>`
   - `FRONTEND_ORIGIN=https://<твой-netlify>.app`
4. После билда API доступен по адресу:  
   ```
   https://<your-app>.onrender.com/api/ping
   ```

### Фронтенд (Netlify)
1. В настройках укажи:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
2. Переменные окружения:
   - `VITE_API_BASE=https://<your-backend>.onrender.com`

---

## 🛠 Примечания

- В dev-режиме CORS открыт для всех, в проде лучше ограничить через `FRONTEND_ORIGIN`.  
- SQLite удобен локально, но на Render база может сбрасываться → используй Postgres для боевых данных.  
- Все запросы к защищённым эндпоинтам должны содержать заголовок:
  ```
  Authorization: Bearer <токен>
  ```
