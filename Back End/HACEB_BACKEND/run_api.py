import os
from pathlib import Path
import sys

from sqlalchemy.engine import URL


BACKEND_DIR = Path(__file__).resolve().parent
REPOSITORY_ROOT = BACKEND_DIR.parents[1]
DATABASE_PATH = REPOSITORY_ROOT / "Base de datos" / "powerbi_perseo.db"

sys.path.insert(0, str(BACKEND_DIR))

if not os.environ.get("DATABASE_URL", "").strip():
    if not DATABASE_PATH.is_file():
        raise FileNotFoundError(
            f"Power BI database not found: {DATABASE_PATH}. "
            "Set DATABASE_URL to a configured PostgreSQL database or restore the SQLite artifact."
        )
    os.environ["DATABASE_URL"] = URL.create(
        "sqlite",
        database=DATABASE_PATH.as_posix(),
    ).render_as_string(hide_password=False)

import uvicorn


if __name__ == "__main__":
    uvicorn.run(
        "perseo_db.api:app",
        app_dir=str(BACKEND_DIR),
        host="127.0.0.1",
        port=8000,
    )
