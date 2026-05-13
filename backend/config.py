from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    raffle_title: str = "Rifa"
    raffle_prize: str = "Prémio surpresa"
    raffle_total_numbers: int = 100
    raffle_price: float = 10.00
    raffle_currency: str = "EUR"

    admin_username: str = "admin"
    admin_password: str = "changeme"


settings = Settings()