import os
import json
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Sahaay Groq AI Service v3.0")

# Initialize Groq
def get_llm():
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key and not groq_key.startswith("your_"):
        # Switched to 8b-instant for maximum speed to avoid timeouts
        return ChatGroq(model="llama-3.1-8b-instant", temperature=0.2, groq_api_key=groq_key)
    return None

# --- Models ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    emotion: str
    confidence: float
    risk: str
    reply: str
    suggestions: List[str]

class SummaryRequest(BaseModel):
    emotions: List[str]

class SummaryResponse(BaseModel):
    summary: str

# --- Robust JSON parsing ---
def parse_json_safely(text: str) -> Dict:
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except Exception:
        return {}

# --- Endpoints ---
@app.get("/")
async def root():
    return {"status": "Sahaay AI is Online", "version": "3.0"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    llm = get_llm()
    if not llm:
        return ChatResponse(emotion="neutral", confidence=0.0, risk="LOW", reply="Check API Key", suggestions=[])

    try:
        # NO CURLY BRACES in the system prompt to avoid LangChain variable errors
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are Sahaay, a supportive AI. Provide a supportive reply. Always respond in valid JSON format with keys for emotion, confidence, risk, reply, and suggestions."),
            ("user", "{message}")
        ])
        
        chain = prompt | llm
        response = chain.invoke({"message": request.message})
        result = parse_json_safely(response.content)
        
        return ChatResponse(
            emotion=result.get("emotion", "neutral"),
            confidence=result.get("confidence", 0.9),
            risk=result.get("risk", "LOW"),
            reply=result.get("reply", "I'm here for you."),
            suggestions=result.get("suggestions", ["Take a deep breath"])
        )
    except Exception as e:
        print(f"Chat Error: {e}")
        return ChatResponse(emotion="neutral", confidence=0.0, risk="LOW", reply="Brain hiccup. Try again!", suggestions=[])

@app.post("/summarize", response_model=SummaryResponse)
async def summarize_endpoint(request: SummaryRequest):
    llm = get_llm()
    if not llm:
        return SummaryResponse(summary="I'm here.")
    try:
        # NO CURLY BRACES in the system prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Summarize these emotions in one warm sentence. Return JSON with a key named summary."),
            ("user", "{emotions}")
        ])
        chain = prompt | llm
        response = chain.invoke({"emotions": ", ".join(request.emotions)})
        result = parse_json_safely(response.content)
        return SummaryResponse(summary=result.get("summary", "You've been navigating a lot."))
    except Exception as e:
        return SummaryResponse(summary="Be kind to yourself.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
