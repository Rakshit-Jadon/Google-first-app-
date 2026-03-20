from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import os

from backend.database import engine, Base, get_db
from backend.models import ChatMessage
from backend.gemini_service import chat_with_goku

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Goku AI Chat")

# Mount static files (Frontend)
app.mount("/static", StaticFiles(directory="frontend"), name="static")

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    response: str

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("frontend/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    if not os.environ.get("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable is not set. Please set it to chat with Goku.")

    # Get history from DB
    history_records = db.query(ChatMessage).filter(ChatMessage.session_id == request.session_id).order_by(ChatMessage.timestamp).all()
    
    # Format history for Gemini SDK
    gemini_history = []
    for msg in history_records:
        gemini_history.append({
            "role": msg.role,
            "parts": [msg.content]
        })

    try:
        # Call Gemini
        goku_reply = chat_with_goku(history=gemini_history, new_message=request.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Save user message to DB
    user_msg = ChatMessage(session_id=request.session_id, role="user", content=request.message)
    db.add(user_msg)

    # Save Goku reply to DB
    model_msg = ChatMessage(session_id=request.session_id, role="model", content=goku_reply)
    db.add(model_msg)
    
    db.commit()

    return {"response": goku_reply}

@app.get("/api/history/{session_id}")
async def get_history(session_id: str, db: Session = Depends(get_db)):
    history = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp).all()
    return [{"role": msg.role, "content": msg.content} for msg in history]
