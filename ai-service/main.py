import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Sahaay Groq-Only AI Service")

# Initialize Groq (Simplified)
def get_llm():
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key and not groq_key.startswith("your_"):
        return ChatGroq(model="llama3-8b-8192", temperature=0.2, groq_api_key=groq_key)
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

# --- Prompt Templates ---
# We use double curly braces {{ }} to escape them for LangChain
system_instructions = """You are Sahaay, a supportive AI for caregivers. 
    Analyze the user's emotion and provide a supportive reply.
    Return ONLY JSON in this format:
    {{
        "emotion": "sad | anxious | angry | happy | distressed",
        "confidence": 0.9,
        "risk": "LOW",
        "reply": "your empathetic reply here",
        "suggestions": ["suggestion 1", "suggestion 2"]
    }}
"""

master_prompt = ChatPromptTemplate.from_messages([
    ("system", system_instructions),
    ("user", "{message}")
])

# --- Endpoints ---
@app.get("/")
async def root():
    return {"status": "Sahaay AI is Online", "port": 8080}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    llm = get_llm()
    if not llm:
        return ChatResponse(
            emotion="neutral", confidence=0.0, risk="LOW",
            reply="I'm here, but I need my API key to think. Please check the Groq key! 💙",
            suggestions=["Check API Key"]
        )

    try:
        # Use simple string interpolation for the prompt
        chain = master_prompt | llm | JsonOutputParser()
        result = chain.invoke({"message": request.message})
        return ChatResponse(**result)
    except Exception as e:
        print(f"Chat Error: {e}")
        return ChatResponse(
            emotion="neutral", confidence=0.0, risk="LOW",
            reply="I'm having a little trouble with my brain (Groq). Let's try again in a second!",
            suggestions=["Retry"]
        )

@app.post("/summarize", response_model=SummaryResponse)
async def summarize_endpoint(request: SummaryRequest):
    llm = get_llm()
    if not llm:
        return SummaryResponse(summary="I'm here for you.")
    try:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Summarize these emotions in one warm sentence: {emotions}. Return JSON {{\"summary\": \"...\"}}")
        ])
        chain = prompt | llm | JsonOutputParser()
        result = chain.invoke({"emotions": ", ".join(request.emotions)})
        return SummaryResponse(summary=result.get("summary", "You've been navigating a lot lately."))
    except Exception as e:
        print(f"Summary Error: {e}")
        return SummaryResponse(summary="Remember to be kind to yourself today.")

@app.get("/health")
async def health():
    return {"status": "ok", "provider": "groq"}

if __name__ == "__main__":
    import uvicorn
    # Port 8080 for Railway
    uvicorn.run(app, host="0.0.0.0", port=8080)
