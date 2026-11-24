from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection

from perseo_db.database import build_engine
from perseo_db.models import Base
from perseo_db.settings import get_settings

config = context.config
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=get_settings().database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = build_engine(get_settings().database_url)
    with engine.connect() as connection:
        migration_connection: Connection = connection
        context.configure(
            connection=migration_connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

