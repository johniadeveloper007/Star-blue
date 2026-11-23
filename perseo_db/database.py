from sqlalchemy import Engine, create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker


def build_engine(database_url: str) -> Engine:
    url = make_url(database_url)
    options: dict[str, object] = {"pool_pre_ping": True}
    if url.get_backend_name() == "postgresql":
        options.update(pool_size=5, max_overflow=10, pool_timeout=30)
    return create_engine(database_url, **options)


def build_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

