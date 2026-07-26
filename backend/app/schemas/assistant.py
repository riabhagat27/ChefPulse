from pydantic import BaseModel, Field

class ChatInput(BaseModel):
    message: str = Field(..., min_length=1, description="Message to the AI Assistant")

class ChatOutput(BaseModel):
    reply: str = Field(..., description="Conversational reply from the AI Assistant")
