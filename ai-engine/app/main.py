# from fastapi import FastAPI, Request, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# # Updated Import: We need generate_with_failover for the Chat feature
# from app.llm.generator import generate_questions_ai
# from app.llm.evaluator import evaluate_full_interview, generate_with_failover
# import json
# import os
# import uuid
# from datetime import datetime

# app = FastAPI()

# # Enable CORS for Frontend communication
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
#     allow_credentials=True,
# )

# # ==========================================
# #  SIMPLE JSON DATABASE (db.json)
# # ==========================================
# DB_FILE = "db.json"

# def load_db():
#     if not os.path.exists(DB_FILE):
#         return []
#     try:
#         with open(DB_FILE, "r") as f:
#             return json.load(f)
#     except:
#         return []

# def save_db(data):
#     with open(DB_FILE, "w") as f:
#         json.dump(data, f, indent=4)

# # ==========================================
# #  DATA MODELS
# # ==========================================
# class ChatRequest(BaseModel):
#     message: str
#     context: dict = {}

# # ==========================================
# #  AI ROUTES
# # ==========================================

# @app.post("/generate")
# async def generate_route(request: Request):
#     data = await request.json()
#     questions = generate_questions_ai(
#         data.get('topic'), 
#         data.get('difficulty'), 
#         int(data.get('count')),
#         data.get('round')
#     )
#     return {"questions": questions}

# @app.post("/evaluate_session")
# async def evaluate_route(request: Request):
#     data = await request.json()
#     feedback = evaluate_full_interview(data)
#     return feedback

# # --- NEW: REAL AI CHAT ENDPOINT ---
# @app.post("/chat")
# def chat_with_coach(req: ChatRequest):
#     try:
#         # Construct a prompt that gives the AI context
#         prompt = f"""
#         ACT AS: A Senior Technical Career Coach and Mentor.
        
#         USER CONTEXT:
#         The user is using "CodeStatic", an AI Interview Platform.
#         Context Data (Page/Score): {req.context}
        
#         USER QUESTION: "{req.message}"
        
#         TASK:
#         Provide a helpful, encouraging, and specific answer. 
#         If they ask about their score, explain how scoring works generally (unless you have specific score data).
#         Keep the answer concise (under 3 sentences).
#         """
        
#         # Use the 50-Model Failover Engine defined in evaluator.py
#         response_text = generate_with_failover(prompt)
#         return {"reply": response_text}
        
#     except Exception as e:
#         print(f"Chat Error: {e}")
#         # Fallback response if AI completely fails
#         return {"reply": "I'm having trouble connecting to my brain right now, but keep practicing! Focus on your 'Critical Flags'."}

# # ==========================================
# #  DATABASE ROUTES (The Missing Link)
# # ==========================================

# @app.post("/interviews")
# async def save_interview(request: Request):
#     """Saves a new interview session"""
#     data = await request.json()
#     db = load_db()
    
#     # Create a robust record
#     new_record = {
#         "id": str(uuid.uuid4()),
#         "createdAt": datetime.now().isoformat(),
#         # Try to guess the topic from the first question, or default
#         "topic": data.get("topic", "General Session"), 
#         "total_score": data.get("totalScore", 0),
#         "overall_feedback": data.get("overallFeedback", "No feedback"),
#         "full_data": data # Store the full deep-dive data including Integrity Score
#     }
    
#     db.insert(0, new_record) # Add to top of list
#     save_db(db)
#     return {"message": "Saved", "id": new_record["id"]}

# @app.get("/interviews")
# async def get_interviews():
#     """Returns the history list"""
#     return load_db()

# @app.delete("/interviews/{id}")
# async def delete_interview(id: str):
#     """Deletes a session by ID"""
#     db = load_db()
#     new_db = [item for item in db if item["id"] != id]
    
#     if len(db) == len(new_db):
#         raise HTTPException(status_code=404, detail="Session not found")
        
#     save_db(new_db)
#     return {"message": "Deleted successfully"}

# # Run with: uvicorn app.main:app --reload
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
#-----------------------------------------------------------------------------------------------------------
# import sys
# import os
# # --- 1. FORCE PATH TO CURRENT DIRECTORY (Crucial for imports) ---
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# from fastapi import FastAPI, Request, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import json
# import uuid
# import traceback
# from datetime import datetime

# # --- 2. IMPORT AI ENGINES ---
# try:
#     # Resume Engines
#     from app.llm.resume_generator import generate_resume_questions_wrapper
#     from app.llm.resume_evaluator import evaluate_resume_session, generate_with_failover
    
#     # Standard Mock Engines (Assuming these files exist in the same folder)
#     from app.llm.generator import generate_questions_ai 
#     from app.llm.evaluator import evaluate_full_interview
    
#     print("✅ AI Engines Imported Successfully")
# except ImportError as e:
#     print(f"⚠️ Import Warning: {e}")
#     # Dummies to prevent server crash if files are missing
#     def generate_resume_questions_wrapper(*args, **kwargs): return []
#     def evaluate_resume_session(*args, **kwargs): return {"score": 0, "summary": "Import Error"}
#     def generate_questions_ai(*args, **kwargs): return []
#     def evaluate_full_interview(*args, **kwargs): return {"score": 0, "summary": "Import Error"}
#     def generate_with_failover(*args): return "AI Unavailable"

# app = FastAPI()

# # Enable CORS for Frontend (Port 5173)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
#     allow_credentials=True,
# )

# # ==========================================
# #  DATABASE UTILS (JSON FILE)
# # ==========================================
# DB_FILE = "db.json"

# def load_db():
#     if not os.path.exists(DB_FILE): return []
#     try:
#         with open(DB_FILE, "r") as f: return json.load(f)
#     except: return []

# def save_db(data):
#     with open(DB_FILE, "w") as f: json.dump(data, f, indent=4)

# # ==========================================
# #  DATA MODELS
# # ==========================================
# class ResumeGenRequest(BaseModel):
#     resume_text: str
#     domain: str
#     yoe: int = 1
#     count: int = 5

# class GeneralGenRequest(BaseModel):
#     topic: str
#     difficulty: str
#     count: int
#     round_type: str = "Technical" # FIX: Added default round_type

# class EvaluationRequest(BaseModel):
#     transcript: list
#     domain: str
#     experience_level: str

# class StandardEvalRequest(BaseModel):
#     transcript: list

# class ChatRequest(BaseModel):
#     message: str
#     context: dict = {}

# # ==========================================
# #  ROUTES
# # ==========================================

# @app.get("/")
# def health_check():
#     return {"status": "MockShield AI Online", "port": 8000}

# # --- 1. RESUME GENERATION (THE MISSING ROUTE) ---
# @app.post("/generate_resume_questions")
# async def generate_resume_endpoint(req: ResumeGenRequest):
#     print(f"📄 GENERATING RESUME QUESTIONS: {req.domain} ({req.yoe} YOE)")
#     try:
#         questions = generate_resume_questions_wrapper(
#             resume_text=req.resume_text,
#             domain=req.domain,
#             yoe=req.yoe,
#             count=req.count
#         )
#         return {"questions": questions}
#     except Exception as e:
#         print(f"❌ Resume Generation Error: {e}")
#         # Return empty list to trigger Frontend Emergency Fallback
#         return {"questions": []} 

# # --- 2. STANDARD MOCK GENERATION ---
# @app.post("/generate")
# async def generate_general_endpoint(req: GeneralGenRequest):
#     print(f"🤖 GENERATING MOCK QUESTIONS: {req.topic}")
#     try:
#         # FIX: Passed round_type argument to match function signature
#         questions = generate_questions_ai(
#             topic=req.topic,
#             difficulty=req.difficulty,
#             count=req.count,
#             round_type=req.round_type
#         )
#         return {"questions": questions}
#     except Exception as e:
#         print(f"❌ Mock Generation Error: {e}")
#         return {"questions": []}

# # --- 3. RESUME EVALUATION ---
# @app.post("/evaluate_resume_session")
# async def evaluate_resume_endpoint(req: EvaluationRequest):
#     print(f"⚖️ EVALUATING RESUME SESSION: {req.domain}")
#     try:
#         feedback = evaluate_resume_session(
#             transcript_data=req.transcript,
#             field=req.domain,
#             experience=req.experience_level
#         )
#         return feedback
#     except Exception as e:
#         traceback.print_exc()
#         return {"error": "Evaluation failed"}

# # --- 4. STANDARD EVALUATION ---
# @app.post("/evaluate_session")
# async def evaluate_session_endpoint(req: StandardEvalRequest):
#     print("⚖️ EVALUATING STANDARD SESSION")
#     try:
#         # Standard evaluator typically expects a list of {question, answer}
#         feedback = evaluate_full_interview(req.transcript)
#         return feedback
#     except Exception as e:
#         traceback.print_exc()
#         return {"score": 0, "summary": "Evaluation Error"}

# # --- 5. CHAT COACH ---
# @app.post("/chat")
# def chat_endpoint(req: ChatRequest):
#     try:
#         # 1. Parse Context for better prompt engineering
#         topic = req.context.get("topic", "General Interview")
#         score = req.context.get("score", "N/A")
#         page = req.context.get("page", "Dashboard")

#         # 2. THE POWER PROMPT
#         prompt = f"""
#         ### SYSTEM ROLE:
#         You are the **MockShield Forensic Career Coach**. 
#         You are an elite Technical Hiring Manager known for direct, high-value feedback. You do not fluff your answers.

#         ### SESSION CONTEXT:
#         - **Current Page:** {page}
#         - **Interview Topic:** {topic}
#         - **Candidate Score:** {score}/100

#         ### USER QUESTION:
#         "{req.message}"

#         ### INSTRUCTIONS:
#         1. **Context-Aware:** If the user asks about their score, explain that a score of {score} indicates specific gaps in {topic} depth or communication.
#         2. **Technical Specificity:** If asked for tips, provide actionable, advanced concepts specific to **{topic}** (e.g., if Python, mention decorators/generators; if React, mention reconciliation/hooks).
#         3. **Tone:** Professional, encouraging, but strict on quality. "Tough Love".
#         4. **Constraint:** Keep your answer **under 4 sentences**. Be extremely concise.

#         ### GENERATE RESPONSE:
#         """

#         # 3. Call AI
#         response_text = generate_with_failover(prompt)
#         return {"reply": response_text}

#     except Exception as e:
#         print(f"❌ CHAT ERROR: {e}")
#         return {"reply": "I'm analyzing your data but hit a network snag. Please try asking again in a moment."}

# # ==========================================
# #  DB ROUTES (HISTORY)
# # ==========================================
# @app.post("/interviews")
# async def save_interview(request: Request):
#     data = await request.json()
#     db = load_db()
    
#     new_record = {
#         "id": str(uuid.uuid4()),
#         "createdAt": datetime.now().isoformat(),
#         "topic": data.get("topic", "Interview Session"), 
#         "total_score": data.get("score", 0), 
#         "summary": data.get("summary", "No summary."),
#         "full_data": data 
#     }
    
#     db.insert(0, new_record) 
#     save_db(db)
#     print(f"💾 Saved Session: {new_record['id']}")
#     return {"message": "Saved", "id": new_record["id"]}

# @app.get("/interviews")
# async def get_interviews():
#     return load_db()

# @app.delete("/interviews/{id}")
# async def delete_interview(id: str):
#     db = load_db()
#     new_db = [item for item in db if item["id"] != id]
    
#     if len(db) == len(new_db):
#         raise HTTPException(status_code=404, detail="Session not found")
    
#     save_db(new_db)
#     return {"message": "Deleted successfully"}

# # --- STARTUP ---
# if __name__ == "__main__":
#     import uvicorn
#     print("🚀 MockShield AI Engine Starting on Port 8000...")
#     uvicorn.run(app, host="0.0.0.0", port=8000)
#-----------------------------------------------------------------------------------------------------
#all correct 28 feb
# import sys
# import os
# # --- 1. FORCE PATH TO CURRENT DIRECTORY (Crucial for imports) ---
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# from fastapi import FastAPI, Request, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import json
# import uuid
# import traceback  # <--- CRITICAL IMPORT FOR DEBUGGING
# from datetime import datetime

# # --- 2. IMPORT AI ENGINES ---
# try:
#     # Resume Engines
#     from app.llm.resume_generator import generate_resume_questions_wrapper
#     from app.llm.resume_evaluator import evaluate_resume_session, generate_with_failover
    
#     # Standard Mock Engines
#     from app.llm.generator import generate_questions_ai 
#     from app.llm.evaluator import evaluate_full_interview
    
#     print("✅ AI Engines Imported Successfully")
# except ImportError as e:
#     print(f"⚠️ Import Warning: {e}")
#     traceback.print_exc() # Print why import failed
#     # Dummies to prevent server crash if files are missing
#     def generate_resume_questions_wrapper(*args, **kwargs): return []
#     def evaluate_resume_session(*args, **kwargs): return {"score": 0, "summary": "Import Error"}
#     def generate_questions_ai(*args, **kwargs): return []
#     def evaluate_full_interview(*args, **kwargs): return {"score": 0, "summary": "Import Error"}
#     def generate_with_failover(*args): return "AI Unavailable"

# app = FastAPI()

# # Enable CORS for Frontend (Port 5173)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
#     allow_credentials=True,
# )

# # ==========================================
# #  DATABASE UTILS (JSON FILE)
# # ==========================================
# DB_FILE = "db.json"

# def load_db():
#     if not os.path.exists(DB_FILE): return []
#     try:
#         with open(DB_FILE, "r") as f: return json.load(f)
#     except: return []

# def save_db(data):
#     with open(DB_FILE, "w") as f: json.dump(data, f, indent=4)

# # ==========================================
# #  DATA MODELS
# # ==========================================
# class ResumeGenRequest(BaseModel):
#     resume_text: str
#     domain: str
#     yoe: int = 1
#     count: int = 5

# class GeneralGenRequest(BaseModel):
#     topic: str
#     difficulty: str
#     count: int
#     round_type: str = "Technical" 

# class EvaluationRequest(BaseModel):
#     transcript: list
#     domain: str
#     experience_level: str

# class StandardEvalRequest(BaseModel):
#     transcript: list

# class ChatRequest(BaseModel):
#     message: str
#     context: dict = {}

# # ==========================================
# #  ROUTES
# # ==========================================

# @app.get("/")
# def health_check():
#     return {"status": "MockShield AI Online", "port": 8000}

# # --- 1. RESUME GENERATION (WITH TRACEBACK) ---
# @app.post("/generate_resume_questions")
# async def generate_resume_endpoint(req: ResumeGenRequest):
#     print(f"📄 GENERATING RESUME QUESTIONS: {req.domain} ({req.yoe} YOE)")
#     try:
#         questions = generate_resume_questions_wrapper(
#             resume_text=req.resume_text,
#             domain=req.domain,
#             yoe=req.yoe,
#             count=req.count
#         )
#         return {"questions": questions}
#     except Exception as e:
#         print(f"❌ Resume Generation Error: {e}")
#         print("vvvvvvvvvv TRACEBACK vvvvvvvvvv")
#         traceback.print_exc()  # <--- THIS PRINTS THE REAL ERROR
#         print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
#         # Return empty list to trigger Frontend Emergency Fallback
#         return {"questions": []} 

# # --- 2. STANDARD MOCK GENERATION (WITH TRACEBACK) ---
# @app.post("/generate")
# async def generate_general_endpoint(req: GeneralGenRequest):
#     print(f"🤖 GENERATING MOCK QUESTIONS: {req.topic}")
#     try:
#         questions = generate_questions_ai(
#             topic=req.topic,
#             difficulty=req.difficulty,
#             count=req.count,
#             round_type=req.round_type
#         )
#         return {"questions": questions}
#     except Exception as e:
#         print(f"❌ Mock Generation Error: {e}")
#         print("vvvvvvvvvv TRACEBACK vvvvvvvvvv")
#         traceback.print_exc() # <--- DEBUGGING ENABLED
#         print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
#         return {"questions": []}

# # --- 3. RESUME EVALUATION (WITH TRACEBACK) ---
# @app.post("/evaluate_resume_session")
# async def evaluate_resume_endpoint(req: EvaluationRequest):
#     print(f"⚖️ EVALUATING RESUME SESSION: {req.domain}")
#     try:
#         feedback = evaluate_resume_session(
#             transcript_data=req.transcript,
#             field=req.domain,
#             experience=req.experience_level
#         )
#         return feedback
#     except Exception as e:
#         print(f"❌ Resume Evaluation Error: {e}")
#         traceback.print_exc() # <--- DEBUGGING ENABLED
#         return {"error": "Evaluation failed"}

# # --- 4. STANDARD EVALUATION (WITH TRACEBACK) ---
# @app.post("/evaluate_session")
# async def evaluate_session_endpoint(req: StandardEvalRequest):
#     print("⚖️ EVALUATING STANDARD SESSION")
#     try:
#         feedback = evaluate_full_interview(req.transcript)
#         return feedback
#     except Exception as e:
#         print(f"❌ Standard Evaluation Error: {e}")
#         traceback.print_exc() # <--- DEBUGGING ENABLED
#         return {"score": 0, "summary": "Evaluation Error"}

# # --- 5. CHAT COACH (WITH TRACEBACK) ---
# @app.post("/chat")
# def chat_endpoint(req: ChatRequest):
#     try:
#         # 1. Parse Context 
#         topic = req.context.get("topic", "General Interview")
#         score = req.context.get("score", "N/A")
#         page = req.context.get("page", "Dashboard")

#         # 2. THE POWER PROMPT
#         prompt = f"""
#         ### SYSTEM ROLE:
#         You are the **MockShield Forensic Career Coach**. 
#         You are an elite Technical Hiring Manager.

#         ### SESSION CONTEXT:
#         - **Current Page:** {page}
#         - **Interview Topic:** {topic}
#         - **Candidate Score:** {score}/100

#         ### USER QUESTION:
#         "{req.message}"

#         ### INSTRUCTIONS:
#         1. **Context-Aware:** Explain score {score} gaps in {topic}.
#         2. **Technical Specificity:** Provide actionable tips for **{topic}**.
#         3. **Tone:** Professional, encouraging, but strict.
#         4. **Constraint:** Keep your answer **under 4 sentences**.

#         ### GENERATE RESPONSE:
#         """

#         # 3. Call AI
#         response_text = generate_with_failover(prompt)
#         return {"reply": response_text}

#     except Exception as e:
#         print(f"❌ CHAT ERROR: {e}")
#         traceback.print_exc() # <--- DEBUGGING ENABLED
#         return {"reply": "I'm analyzing your data but hit a network snag. Please try asking again in a moment."}

# # ==========================================
# #  DB ROUTES (HISTORY)
# # ==========================================
# @app.post("/interviews")
# async def save_interview(request: Request):
#     try:
#         data = await request.json()
#         db = load_db()
        
#         new_record = {
#             "id": str(uuid.uuid4()),
#             "createdAt": datetime.now().isoformat(),
#             "topic": data.get("topic", "Interview Session"), 
#             "total_score": data.get("score", 0), 
#             "summary": data.get("summary", "No summary."),
#             "full_data": data 
#         }
        
#         db.insert(0, new_record) 
#         save_db(db)
#         print(f"💾 Saved Session: {new_record['id']}")
#         return {"message": "Saved", "id": new_record["id"]}
#     except Exception as e:
#         print(f"❌ Save DB Error: {e}")
#         traceback.print_exc()
#         return {"error": "Failed to save session"}

# @app.get("/interviews")
# async def get_interviews():
#     try:
#         return load_db()
#     except Exception as e:
#         print(f"❌ Read DB Error: {e}")
#         traceback.print_exc()
#         return []

# @app.delete("/interviews/{id}")
# async def delete_interview(id: str):
#     try:
#         db = load_db()
#         new_db = [item for item in db if item["id"] != id]
        
#         if len(db) == len(new_db):
#             raise HTTPException(status_code=404, detail="Session not found")
        
#         save_db(new_db)
#         return {"message": "Deleted successfully"}
#     except Exception as e:
#         print(f"❌ Delete DB Error: {e}")
#         traceback.print_exc()
#         return {"error": "Failed to delete"}

# # --- STARTUP ---
# if __name__ == "__main__":
#     import uvicorn
#     print("🚀 MockShield AI Engine Starting on Port 8000...")
#     uvicorn.run(app, host="0.0.0.0", port=8000)
# -----------------------------------------------------------------------
# 28 feb session added
import sys
import os
# --- 1. FORCE PATH TO CURRENT DIRECTORY (Crucial for imports) ---
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import uuid
import traceback  # <--- CRITICAL IMPORT FOR DEBUGGING
from datetime import datetime

# --- 2. IMPORT AI ENGINES ---
try:
    # Resume Engines
    from app.llm.resume_generator import generate_resume_questions_wrapper
    from app.llm.resume_evaluator import evaluate_resume_session, generate_with_failover
    
    # Standard Mock Engines
    from app.llm.generator import generate_questions_ai 
    from app.llm.evaluator import evaluate_full_interview
    
    print("✅ AI Engines Imported Successfully")
except ImportError as e:
    print(f"⚠️ Import Warning: {e}")
    traceback.print_exc() # Print why import failed
    # Dummies to prevent server crash if files are missing
    def generate_resume_questions_wrapper(*args, **kwargs): return []
    def evaluate_resume_session(*args, **kwargs): return {"score": 0, "summary": "Import Error"}
    def generate_questions_ai(*args, **kwargs): return []
    def evaluate_full_interview(*args, **kwargs): return {"score": 0, "summary": "Import Error"}
    def generate_with_failover(*args): return "AI Unavailable"

app = FastAPI()

# Enable CORS for Frontend (Port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #Keep this as "*" for the initial deployment
    allow_methods=["*"],
    allow_headers=["*"],
    # allow_credentials=True,
    allow_credentials=False, # Note: If allow_origins=["*"], then allow_credentials MUST be False, otherwise FastAPI will crash on startup.
)

# ==========================================
#  DATABASE UTILS (JSON FILE)
# ==========================================
DB_FILE = "db.json"

def load_db():
    if not os.path.exists(DB_FILE): return []
    try:
        with open(DB_FILE, "r") as f: return json.load(f)
    except: return []

def save_db(data):
    with open(DB_FILE, "w") as f: json.dump(data, f, indent=4)

# ==========================================
#  DATA MODELS
# ==========================================
class ResumeGenRequest(BaseModel):
    resume_text: str
    domain: str
    yoe: int = 1
    count: int = 5

class GeneralGenRequest(BaseModel):
    topic: str
    difficulty: str
    count: int
    round_type: str = "Technical" 

class EvaluationRequest(BaseModel):
    transcript: list
    domain: str
    experience_level: str

class StandardEvalRequest(BaseModel):
    transcript: list

class ChatRequest(BaseModel):
    message: str
    context: dict = {}

# ==========================================
#  ROUTES
# ==========================================

@app.get("/")
def health_check():
    return {"status": "MockShield AI Online", "port": 8000}

# --- 1. RESUME GENERATION (WITH TRACEBACK) ---
@app.post("/generate_resume_questions")
async def generate_resume_endpoint(req: ResumeGenRequest):
    print(f"📄 GENERATING RESUME QUESTIONS: {req.domain} ({req.yoe} YOE)")
    try:
        questions = generate_resume_questions_wrapper(
            resume_text=req.resume_text,
            domain=req.domain,
            yoe=req.yoe,
            count=req.count
        )
        return {"questions": questions}
    except Exception as e:
        print(f"❌ Resume Generation Error: {e}")
        print("vvvvvvvvvv TRACEBACK vvvvvvvvvv")
        traceback.print_exc()  # <--- THIS PRINTS THE REAL ERROR
        print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
        # Return empty list to trigger Frontend Emergency Fallback
        return {"questions": []} 

# --- 2. STANDARD MOCK GENERATION (WITH TRACEBACK) ---
@app.post("/generate")
async def generate_general_endpoint(req: GeneralGenRequest):
    print(f"🤖 GENERATING MOCK QUESTIONS: {req.topic}")
    try:
        questions = generate_questions_ai(
            topic=req.topic,
            difficulty=req.difficulty,
            count=req.count,
            round_type=req.round_type
        )
        return {"questions": questions}
    except Exception as e:
        print(f"❌ Mock Generation Error: {e}")
        print("vvvvvvvvvv TRACEBACK vvvvvvvvvv")
        traceback.print_exc() # <--- DEBUGGING ENABLED
        print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
        return {"questions": []}

# --- 3. RESUME EVALUATION (WITH TRACEBACK) ---
@app.post("/evaluate_resume_session")
async def evaluate_resume_endpoint(req: EvaluationRequest):
    print(f"⚖️ EVALUATING RESUME SESSION: {req.domain}")
    try:
        feedback = evaluate_resume_session(
            transcript_data=req.transcript,
            field=req.domain,
            experience=req.experience_level
        )
        return feedback
    except Exception as e:
        print(f"❌ Resume Evaluation Error: {e}")
        traceback.print_exc() # <--- DEBUGGING ENABLED
        return {"error": "Evaluation failed"}

# --- 4. STANDARD EVALUATION (WITH TRACEBACK) ---
@app.post("/evaluate_session")
async def evaluate_session_endpoint(req: StandardEvalRequest):
    print("⚖️ EVALUATING STANDARD SESSION")
    try:
        feedback = evaluate_full_interview(req.transcript)
        return feedback
    except Exception as e:
        print(f"❌ Standard Evaluation Error: {e}")
        traceback.print_exc() # <--- DEBUGGING ENABLED
        return {"score": 0, "summary": "Evaluation Error"}

# --- 5. CHAT COACH (WITH TRACEBACK) ---
@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    try:
        # 1. Parse Context 
        topic = req.context.get("topic", "General Interview")
        score = req.context.get("score", "N/A")
        page = req.context.get("page", "Dashboard")

        # 2. THE POWER PROMPT
        prompt = f"""
        ### SYSTEM ROLE:
        You are the **MockShield Forensic Career Coach**. 
        You are an elite Technical Hiring Manager.

        ### SESSION CONTEXT:
        - **Current Page:** {page}
        - **Interview Topic:** {topic}
        - **Candidate Score:** {score}/100

        ### USER QUESTION:
        "{req.message}"

        ### INSTRUCTIONS:
        1. **Context-Aware:** Explain score {score} gaps in {topic}.
        2. **Technical Specificity:** Provide actionable tips for **{topic}**.
        3. **Tone:** Professional, encouraging, but strict.
        4. **Constraint:** Keep your answer **under 4 sentences**.
        """

        # 3. Call AI
        response_text = generate_with_failover(prompt)
        return {"reply": response_text}

    except Exception as e:
        print(f"❌ CHAT ERROR: {e}")
        traceback.print_exc() # <--- DEBUGGING ENABLED
        return {"reply": "I'm analyzing your data but hit a network snag. Please try asking again in a moment."}

# ==========================================
#  DB ROUTES (HISTORY)
# ==========================================
@app.post("/interviews")
async def save_interview(request: Request):
    try:
        data = await request.json()
        db = load_db()
        
        new_record = {
            "id": str(uuid.uuid4()),
            "createdAt": datetime.now().isoformat(),
            "topic": data.get("topic", "Interview Session"), 
            "total_score": data.get("score", 0), 
            "summary": data.get("summary", "No summary."),
            "full_data": data 
        }
        
        db.insert(0, new_record) 
        save_db(db)
        print(f"💾 Saved Session: {new_record['id']}")
        return {"message": "Saved", "id": new_record["id"]}
    except Exception as e:
        print(f"❌ Save DB Error: {e}")
        traceback.print_exc()
        return {"error": "Failed to save session"}

@app.get("/interviews")
async def get_interviews():
    try:
        return load_db()
    except Exception as e:
        print(f"❌ Read DB Error: {e}")
        traceback.print_exc()
        return []

@app.delete("/interviews/{id}")
async def delete_interview(id: str):
    try:
        db = load_db()
        new_db = [item for item in db if item["id"] != id]
        
        if len(db) == len(new_db):
            raise HTTPException(status_code=404, detail="Session not found")
        
        save_db(new_db)
        return {"message": "Deleted successfully"}
    except Exception as e:
        print(f"❌ Delete DB Error: {e}")
        traceback.print_exc()
        return {"error": "Failed to delete"}

# --- NEW: CLEAR ALL HISTORY ENDPOINT ---
@app.delete("/api/sessions/clear")
async def clear_all_history():
    try:
        # Overwrite the JSON file with an empty list
        save_db([])
        print("🗑️ All interview history cleared successfully.")
        return {"status": "success", "message": "All interview history permanently deleted."}
    except Exception as e:
        print(f"❌ Clear All DB Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to clear history")

# --- STARTUP ---
if __name__ == "__main__":
    import uvicorn
    print("🚀 MockShield AI Engine Starting on Port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)