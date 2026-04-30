import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Sahaay Multi-LLM AI Service")

# --- LLM Factory ---
def get_llm():
    """
    Selects the LLM provider based on available environment variables.
    Groq is now the primary provider, OpenAI is the fallback.
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    if groq_key and not groq_key.startswith("your_"):
        print("Using Primary Provider: Groq (llama-3.3-70b-versatile)")
        return ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2, groq_api_key=groq_key)
    
    if openai_key and not openai_key.startswith("your_"):
        print("Using Fallback Provider: OpenAI")
        return ChatOpenAI(model="gpt-3.5-turbo", temperature=0.2, timeout=10)

    print("ERROR: No valid LLM API keys found.")
    return None

# Initialize LLM
llm = get_llm()

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
system_instructions = """You are orchestrating a team of 4 specialized AI agents for Sahaay:
    
    1. **Emotion Detection Specialist**: Detect user emotion and provide a confidence score.
    2. **Mental Health Risk Detector**: Identify self-harm or crisis signals.
    3. **Emotional Support Assistant**: Generate human-like, empathetic, non-judgmental responses.
    4. **Wellness Guide**: Suggest small, helpful wellness actions.

    CRITICAL: You must return the output in this EXACT JSON format:
    {{
        "emotion": "sad | anxious | angry | happy | distressed",
        "confidence": 0.0,
        "risk": "LOW | MEDIUM | HIGH",
        "reply": "string",
        "suggestions": ["list", "of", "strings"]
    }}
"""

master_prompt = ChatPromptTemplate.from_messages([
    ("system", system_instructions),
    ("user", "User Message: {message}")
])

summary_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an emotional support expert. Given a list of recent emotions felt by a caregiver, provide a 1-sentence supportive and insightful summary of their week. Keep it warm and non-clinical. Return as JSON {{ \"summary\": \"your summary\" }}."),
    ("user", "Recent emotions: {emotions}")
])

# --- Logic ---
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    openai_key = os.getenv("OPENAI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    
    # 1. Try Groq Primary
    if groq_key and not groq_key.startswith("your_"):
        try:
            print("Attempting Groq...")
            llm_groq = ChatGroq(model="llama3-8b-8192", temperature=0.2, groq_api_key=groq_key)
            chain = master_prompt | llm_groq | JsonOutputParser()
            result = chain.invoke({"message": request.message})
            return ChatResponse(**result)
        except Exception as e:
            print(f"Groq failed: {e}")
            if not openai_key:
                print("No OpenAI fallback available.")
    
    # 2. Try OpenAI Fallback
    if openai_key and not openai_key.startswith("your_"):
        try:
            print("Attempting OpenAI Fallback...")
            llm_openai = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.2, timeout=10)
            chain = master_prompt | llm_openai | JsonOutputParser()
            result = chain.invoke({"message": request.message})
            return ChatResponse(**result)
        except Exception as e:
            print(f"OpenAI failed: {e}")
            
    # 3. Last Resort Fallback
    return ChatResponse(
        emotion="neutral", confidence=0.0, risk="LOW",
        reply="I'm here for you. I'm having a little trouble thinking clearly right now, but I'm still listening. 💙",
        suggestions=["Try again in a moment", "Check connection"]
    )

@app.post("/summarize", response_model=SummaryResponse)
async def summarize_endpoint(request: SummaryRequest):
    current_llm = get_llm()
    if not current_llm:
        return SummaryResponse(summary="I'm still learning about your journey. Keep sharing with me.")

    try:
        chain = summary_prompt | current_llm | JsonOutputParser()
        result = chain.invoke({"emotions": ", ".join(request.emotions)})
        summary_text = result.get("summary") if isinstance(result, dict) else str(result)
        return SummaryResponse(summary=summary_text)
    except Exception as e:
        print(f"Summary Error: {e}")
        return SummaryResponse(summary="You've been navigating a lot of feelings. Remember to be kind to yourself.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
