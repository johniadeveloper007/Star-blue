import argparse
import logging
import sys

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from perseo_db.database import build_engine
from perseo_db.settings import get_settings


def main() -> None:
    parser = argparse.ArgumentParser(prog="perseo-db")
    parser.add_argument("command", choices=["check"], help="Database operations command.")
    args = parser.parse_args()

    if args.command == "check":
        try:
            engine = build_engine(get_settings().database_url)
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            engine.dispose()
        except (RuntimeError, SQLAlchemyError):
            logging.exception("Database connectivity check failed.")
            sys.exit(1)
        print("Database connection is healthy.")


if __name__ == "__main__":
    main()

