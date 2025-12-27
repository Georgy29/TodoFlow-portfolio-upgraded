import os


def normalize_database_url(url: str) -> str:
    # Some providers (and older guides) use "postgres://" which SQLAlchemy treats as invalid.
    if url.startswith("postgres://"):
        return "postgresql://" + url.removeprefix("postgres://")
    return url


def resolve_database_uri(explicit_uri: str | None = None) -> str:
    if explicit_uri:
        return normalize_database_url(explicit_uri)

    env_uri = os.environ.get("DATABASE_URL") or os.environ.get(
        "SQLALCHEMY_DATABASE_URI"
    )
    if env_uri:
        return normalize_database_url(env_uri)

    return "sqlite:///todos.db"
