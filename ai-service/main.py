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

app = FastAPI(title="Sahaay Groq AI Service v2.0")

# Initialize Groq
def get_llm():
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key and not groq_key.startswith("your_"):
        # Switched to llama-3.3-70b-versatile for superior performance
        return ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2, groq_api_key=groq_key)
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

# --- Helper for robust JSON parsing ---
def parse_json_safely(text: str) -> Dict:
    try:
        # Try finding JSON block if AI adds conversational filler
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except Exception:
        return {}

# --- Endpoints ---
@app.get("/")
async def root():
    return {"status": "Sahaay AI is Online", "model": "llama-3.1-8b-instant"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    llm = get_llm()
    if not llm:
        return ChatResponse(
            emotion="neutral", confidence=0.0, risk="LOW",
            reply="Please check the Groq API key! 💙",
            suggestions=["Check API Key"]
        )

    try:
        # Use a simpler prompt style to avoid variable interpolation issues
        system_prompt = "You are Sahaay, a supportive AI for caregivers. Return ONLY JSON: {\"emotion\": \"...\", \"confidence\": 0.9, \"risk\": \"LOW\", \"reply\": \"...\", \"suggestions\": [\"...\"]}"
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "{message}")
        ])
        
        chain = prompt | llm
        response = chain.invoke({"message": request.message})
        
        # Parse content manually for maximum reliability
        result = parse_json_safely(response.content)
        
        return ChatResponse(
            emotion=result.get("emotion", "neutral"),
            confidence=result.get("confidence", 0.9),
            risk=result.get("risk", "LOW"),
            reply=result.get("reply", "I'm here for you. How can I help?"),
            suggestions=result.get("suggestions", ["Take a breath"])
        )
    except Exception as e:
        print(f"Chat Error: {e}")
        return ChatResponse(
            emotion="neutral", confidence=0.0, risk="LOW",
            reply="I'm having a little trouble with my brain today. Let's try again!",
            suggestions=["Retry"]
        )

@app.post("/summarize", response_model=SummaryResponse)
async def summarize_endpoint(request: SummaryRequest):
    llm = get_llm()
    if not llm:
        return SummaryResponse(summary="I'm here for you.")
    try:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Summarize these emotions in one warm sentence. Return JSON {\"summary\": \"...\"}"),
            ("user", "{emotions}")
        ])
        chain = prompt | llm
        response = chain.invoke({"emotions": ", ".join(request.emotions)})
        result = parse_json_safely(response.content)
        return SummaryResponse(summary=result.get("summary", "You've been navigating a lot lately."))
    except Exception as e:
        print(f"Summary Error: {e}")
        return SummaryResponse(summary="Remember to be kind to yourself today.")

@app.get("/health")
async def health():
    return {"status": "ok", "provider": "groq"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
