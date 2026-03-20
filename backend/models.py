from sqlalchemy import Column, Integer, String, DateTime
from backend.database import Base
from datetime import datetime

class ChatMessage(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    role = Column(String) # "user" or "model"
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
