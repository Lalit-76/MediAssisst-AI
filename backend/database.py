from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DATABASE_URL = "postgresql+psycopg://postgres:2005@localhost:5432/mediassist_db"


# ============================================================
# DATABASE ENGINE
# ============================================================

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


# ============================================================
# DATABASE SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# CONNECTION TEST
# ============================================================

if __name__ == "__main__":

    try:

        with engine.connect():

            print("========================================")
            print("DATABASE CONNECTION SUCCESSFUL")
            print("========================================")

    except Exception as error:

        print("========================================")
        print("DATABASE CONNECTION FAILED")
        print("========================================")
        print(error)