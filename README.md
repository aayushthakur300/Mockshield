# MockShield AI

MockShield AI is an enterprise-grade technical assessment platform designed to conduct high-fidelity Mock Interviews and deep-dive Resume Forensic Audits.

Powered by a multi-tiered LLM routing system (integrating Google Gemini models) and backed by a robust PostgreSQL database, it simulates high-stress, scenario-based technical evaluations across 25+ professional domains.

The system is engineered with a 15-Layer Supreme Defense Architecture to ensure robust JSON parsing, strict prompt-injection mitigation, and zero-downtime failover handling.

---

## 🏗 System Architecture

The project follows a decoupled, highly scalable client-server architecture:

Frontend Client: React.js (Vite), TailwindCSS, React Router.

Backend API: Python, FastAPI, Uvicorn.

Database Layer: PostgreSQL (Relational data persistence for session history, transcripts, and evaluation metrics).

LLM Engine Routing: Google Generative AI (gemini-3.1-pro, gemini-2.5-flash) with asynchronous thread pooling and concurrency guards.

---

## ✨ Core Modules & Features

### 1. Dynamic Mock Interview Engine

The standard mock interview module generates high-entropy, scenario-based technical questions tailored to the user's specific domain and requested difficulty level.

Algorithmic Question Generation: Bypasses generic "textbook" questions by utilizing a randomization seed to pull from the "long tail" of a simulated 100,000+ question matrix.

Real-Time Transcript Evaluation: Analyzes candidate responses for technical accuracy, domain-specific lexicon, and problem-solving methodology, returning a structured score and actionable feedback.

---

### 2. Resume Forensic Auditor (The "BOB" Engine)

Conducts a ruthless "Claim vs. Reality" check on uploaded candidate resumes.

Paper Tiger Scanning: Detects buzzwords lacking depth and generates highly specific edge-case questions designed to test actual implementation experience (e.g., If a candidate lists AWS, the engine asks about S3 consistency models under load).

Dynamic Difficulty Scaling: Adjusts interrogation tactics based on claimed Years of Experience (YOE). Veteran Architect mode focuses on system failure states and CAP theorem trade-offs; Rising Talent focuses on deep internal mechanics.

---

### 3. Multi-Tiered AI Failover Matrix

To prevent rate-limiting (HTTP 429) or API timeouts, the system utilizes a tiered model discovery protocol:

Primary Fleet: High-performance models (gemini-3.1-pro-preview, gemini-2.5-pro).

Fallback Fleet: Open-weight or lower-tier models deployed automatically if primary nodes fail.

Hard Fallback Heuristic: If complete network extinction occurs, the system defaults to a hardcoded 25-domain, 250+ question offline bank to ensure zero interruption to the user experience.

---

### 4. Bulletproof JSON Defense System

LLMs frequently hallucinate formatting. MockShield utilizes a multi-pass parser to guarantee system stability:

Standard JSON load.

AST Literal Evaluation.

Regex bracket balancing and rogue quote surgery.

Complete structural enforcement, strictly validating expected schemas (Arrays of Objects vs. Nested Dicts).

---

### 5. Interactive Candidate Dashboard

PostgreSQL-Powered Analytics: View historical interview sessions sorted by timestamp and domain, fetched directly from the relational database.

Silent Killer Detection: Surfaces critical behavioral or technical red flags identified during the evaluation.

Privacy Controls: 1-click concurrent bulk deletion (Promise.all + FastAPI DELETE /api/sessions/clear) to permanently wipe candidate history from the Postgres database.

---

## 🚀 Installation & Quick Start

### Prerequisites

Node.js (v18+)

Python (3.9+)

PostgreSQL (Running locally or via cloud provider)

Google Gemini API Key

---

### 1. Backend Setup (FastAPI & PostgreSQL)

Navigate to the root backend directory:

```
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies (ensure psycopg2 or asyncpg is included for Postgres)
pip install fastapi uvicorn pydantic google-generativeai python-dotenv psycopg2-binary

# 3. Environment Configuration
# Create a .env file and add your keys and PostgreSQL connection string:
echo "GOOGLE_API_KEY=your_api_key_here" > .env
echo "DATABASE_URL=postgresql://user:password@localhost:5432/mockshield_db" >> .env

# 4. Start the AI Engine
python main.py
```

The server will boot on [http://localhost:8000](http://localhost:8000).

---

### 2. Frontend Setup (React)

Navigate to your frontend client directory:

```
# 1. Install dependencies
npm install
npm install axios react-router-dom

# 2. Start the development server
npm run dev
```

The client will boot on [http://localhost:5173](http://localhost:5173) (or your Vite default).

---

## 📡 API Reference (Backend)

| Method | Endpoint                   | Description                              | Payload Format                           |
| ------ | -------------------------- | ---------------------------------------- | ---------------------------------------- |
| POST   | /generate                  | Generates Standard Mock Interview        | { topic, difficulty, count, round_type } |
| POST   | /evaluate_session          | Standard transcript evaluation           | { transcript }                           |
| POST   | /generate_resume_questions | Triggers Forensic Resume Audit           | { resume_text, domain, yoe, count }      |
| POST   | /evaluate_resume_session   | Analyzes transcript against resume       | { transcript, domain, experience_level } |
| POST   | /chat                      | Context-aware post-interview coach       | { message, context: {topic, score} }     |
| GET    | /interviews                | Fetch all saved sessions from PostgreSQL | N/A                                      |
| POST   | /interviews                | Save a completed session to PostgreSQL   | Session Object                           |
| DELETE | /api/sessions/clear        | Wipes all DB records for the user        | N/A                                      |

---

## 🛡 Security Engineering

Prompt Injection Mitigation: All user inputs (Resumes, Chat context) are wrapped in randomized security delimiters (===CANDIDATE_DATA_[UUID]===) to isolate instructions from passive data payloads.

Concurrency Guards: Threading semaphores restrict the number of active Generative AI requests to prevent memory leaks and billing overrun.
