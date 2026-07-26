from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.assistant import ChatInput, ChatOutput
from app.services.auth import get_current_user
from app.services.assistant import generate_reply

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

@router.post("/chat", response_model=ChatOutput)
def chat_with_assistant(
    chat_in: ChatInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    try:
        reply_content = generate_reply(chat_in.message, db)
        return {"reply": reply_content}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"assistant error: {str(e)}"
        )
