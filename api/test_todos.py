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
