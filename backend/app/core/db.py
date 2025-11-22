from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./app.db"  # local dev
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as s:
        yield s