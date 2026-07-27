from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatInput(BaseModel):
    message: str = Field(..., min_length=1, description="Message to the AI Assistant")

class ChatOutput(BaseModel):
    reply: str = Field(..., description="Conversational reply from the AI Assistant")

class VoiceOrderInput(BaseModel):
    text: str = Field(..., min_length=1)

class VoiceOrderOutputItem(BaseModel):
    id: int
    name: str
    price: float
    category: str
    is_veg: bool

class VoiceOrderMatchedItem(BaseModel):
    item: VoiceOrderOutputItem
    quantity: int

class VoiceOrderAmbiguousItem(BaseModel):
    query: str
    quantity: int
    options: List[VoiceOrderOutputItem]

class VoiceOrderOutput(BaseModel):
    matched: List[VoiceOrderMatchedItem]
    ambiguous: List[VoiceOrderAmbiguousItem]

class BillExplanationInput(BaseModel):
    order_id: Optional[int] = None
    items: Optional[List[Dict[str, Any]]] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    service_charge: Optional[float] = None
    total: Optional[float] = None

class BillExplanationOutput(BaseModel):
    explanation: str

class ScanDishInput(BaseModel):
    image_base64: str = Field(..., min_length=1)

class ScanDishMatchedItem(BaseModel):
    id: int
    name: str
    price: float
    category: str
    confidence: float
    ingredients: str
    is_veg: bool

class ScanDishOutput(BaseModel):
    success: bool
    found: bool
    match: Optional[ScanDishMatchedItem] = None
    recommendations: List[VoiceOrderOutputItem] = []
