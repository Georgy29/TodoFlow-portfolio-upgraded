import os


def normalize_database_url(url: str) -> str:
    # Some providers (and older guides) use "postgres://" which SQLAlchemy treats as invalid.
    if url.startswith("postgres://"):
        url = "postgresql://" + url.removeprefix("postgres://")

    # If the URL doesn't specify a driver (e.g. "postgresql://..."), SQLAlchemy will
    # default to psycopg2. This project uses psycopg v3, so prefer it explicitly.
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url.removeprefix("postgresql://")

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
