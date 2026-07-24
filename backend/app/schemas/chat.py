from pydantic import BaseModel


class ChatRequest(BaseModel):
    vehicle_id: str
    question: str


class ChatResponse(BaseModel):
    answer: str
