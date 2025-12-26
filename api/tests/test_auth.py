from flask_jwt_extended import create_access_token
def test_register_returns_token(client):
    res = client.post(
        "/api/auth/register",
        json={"email": "a@b.com", "password": "abc12345"},
    )
    assert res.status_code == 201

    data = res.get_json()
    
    print(res.get_json())
    assert "token" in data
    assert isinstance(data["token"], str)
    assert data["user"]["email"] == "a@b.com"


def test_me_requires_token(client):
    res = client.get("/api/me")
    assert res.status_code == 401

def test_login_and_me_work_with_token(client):
    client.post("/api/auth/register", json={"email": "x@y.com", "password": "abc12345"})
    login = client.post("/api/auth/login", json={"email": "x@y.com", "password": "abc12345"})
    assert login.status_code == 200
    print(login.get_json())
    token = login.get_json()["token"]

    me = client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.get_json()["user"]["email"] == "x@y.com"

def test_auth_empty_fields(client):
    register = client.post(
        "/api/auth/register", 
        json = {"email" : "",  "password" : ""}
    )
   
    assert register.status_code == 400
    assert register.get_json() == {"error": "email and password are required"}

    login = client.post(
        "/api/auth/login",
        json = {"email" : "", "password" : ""}
    )    
    assert login.status_code == 400
    assert login.get_json() == {"error": "email and password are required"}

def test_register_invalid_email(client):
    res = client.post(
        "/api/auth/register",
        json = {"email": "bad", "password": "abc12345"}
    )
    assert res.status_code == 400
    assert res.get_json() == {"error" : "invalid email format"}

def test_register_weak_password(client):
    res = client.post(
        "/api/auth/register",
        json = {"email": "a@b.com", "password" : "123"}
    )
    assert res.status_code == 400 
    assert res.get_json() == {"error" : "password must be at least 8 characters"}

def test_login_invalid_json(client):
    res = client.post (
        "api/auth/login",
        data="bad-format",
        headers={"Content-Type": "application/json"}
    )
    assert res.status_code == 400
    assert res.get_json() == {"error" : "Invalid JSON"}

def test_login_invalid_credentials(client):
    client.post(
        "/api/auth/register",
        json={"email": "x@y.com", "password": "abc12345"},
    )
    res = client.post(
        "/api/auth/login",
        json={"email": "x@y.com", "password": "wrongpass1"},
    )
    assert res.status_code == 401
    assert res.get_json() == {"error": "invalid credentials"}

def test_me_user_not_found(app, client):
    with app.app_context():
        token = create_access_token(identity="999999")
    res = client.get("api/me", headers = {"Authorization": f"Bearer {token}"})
    assert res.status_code == 400
    assert res.get_json() == {"error": "not found"}

def test_ping(client):
    res = client.get("api/ping")
    res.status_code == 200
    assert res.data == b"pong"