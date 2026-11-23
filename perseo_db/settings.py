from dataclasses import dataclass
import os

from dotenv import load_dotenv


@dataclass(frozen=True)
class Settings:
    database_url: str


def get_settings() -> Settings:
    load_dotenv()
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is required. Set it in the environment or a local .env file."
        )
    return Settings(database_url=database_url)

