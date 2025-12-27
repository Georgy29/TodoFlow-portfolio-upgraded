def _auth_headers(client, email="todo@b.com", password="abc12345"):
    r = client.post("/api/auth/register", json={"email": email, "password": password})
    assert r.status_code in (201, 409)  # 409 if you reuse same email in same DB

    login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    token = login.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_todos_requires_token(client):
    res = client.get("/api/todos")
    assert res.status_code == 401


def test_todos_crud_flow(client):
    headers = _auth_headers(client)

    create = client.post("/api/todos", json={"title": "learn pytest"}, headers=headers)
    assert create.status_code == 201
    todo = create.get_json()
    todo_id = todo["id"]
    assert todo["title"] == "learn pytest"
    assert todo["done"] is False

    lst = client.get("/api/todos", headers=headers)
    assert lst.status_code == 200
    items = lst.get_json()
    assert isinstance(items, list)
    assert len(items) == 1
    assert items[0]["id"] == todo_id

    toggled = client.patch(f"/api/todos/{todo_id}", headers=headers)
    assert toggled.status_code == 200
    assert toggled.get_json()["done"] is True

    deleted = client.delete(f"/api/todos/{todo_id}", headers=headers)
    assert deleted.status_code == 204

    lst2 = client.get("/api/todos", headers=headers)
    assert lst2.status_code == 200
    assert lst2.get_json() == []


def test_todo_requires_title(client):
    headers = _auth_headers(client)
    res = client.post("/api/todos", json={}, headers=headers)
    assert res.status_code == 400
    assert res.get_json() == {"error": "TODO title is required"}


def test_todo_title_too_long(client):
    headers = _auth_headers(client)
    long_title = "a" * 101
    res = client.post("/api/todos", json={"title": long_title}, headers=headers)
    assert res.status_code == 400
    assert res.get_json() == {"error": "title too long"}


def test_todo_title_is_escaped(client):
    headers = _auth_headers(client)
    raw = "<script>alert(1)</script>"
    res = client.post("/api/todos", json={"title": raw}, headers=headers)
    assert res.status_code == 201
    assert res.get_json()["title"] == "&lt;script&gt;alert(1)&lt;/script&gt;"


def test_todo_not_found(client):
    headers = _auth_headers(client)
    res = client.delete("/api/todos/999999", headers=headers)
    assert res.status_code == 404
    assert res.get_json() == {"error": "not found"}


def test_todo_wrong_owner(client):
    headers_a = _auth_headers(client, email="a@b.com")
    created = client.post("/api/todos", json={"title": "a"}, headers=headers_a)
    todo_id = created.get_json()["id"]

    headers_b = _auth_headers(client, email="b@b.com")
    res = client.delete(f"/api/todos/{todo_id}", headers=headers_b)
    assert res.status_code == 404
    assert res.get_json() == {"error": "not found"}


def test_todo_invalid_json(client):
    headers = _auth_headers(client)
    res = client.post(
        "/api/todos",
        data="not-json",
        headers={"Content-Type": "application/json", **headers},
    )
    assert res.status_code == 400
    assert res.get_json() == {"error": "Invalid JSON"}
