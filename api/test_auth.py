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