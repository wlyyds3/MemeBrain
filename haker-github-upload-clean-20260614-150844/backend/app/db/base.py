from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models so SQLAlchemy metadata includes all tables before create_all.
from app import models  # noqa: E402,F401
