from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Optional admin credentials for initial setup (if you want to use hardcoded in .env)
    admin_email: str | None = None
    admin_password: str | None = None

    # Comma-separated list of browser origins allowed to call this API.
    # "*" is fine for local development but must be set to the real site
    # origin(s) in production, because credentialed requests are rejected
    # by browsers when the server answers Access-Control-Allow-Origin: *.
    cors_origins: str = "*"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()