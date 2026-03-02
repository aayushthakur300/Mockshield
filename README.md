MockShield AI

MockShield AI is a technical assessment platform that executes Mock Interviews and Resume Forensic Audits. Utilizing a multi-tiered LLM routing system integrated with Google Gemini models and persistent data storage, it executes scenario-based technical evaluations across 25+ professional domains.

The system implements a 15-Layer Defense Architecture to enforce strict JSON schema parsing, prompt-injection mitigation, and automated failover handling.

🏗 System Architecture

The project implements a decoupled, microservices-based client-server architecture:

Frontend Client (/frontend): React.js (Vite), TailwindCSS, React Router.

Core Backend (/backend): Node.js environment managing database transactions, authentication, and standard API routing.

AI Engine Microservice (/ai-engine): Python, FastAPI environment dedicated exclusively to processing LLM generation, evaluation, and JSON structural enforcement.

Database Layer: PostgreSQL (Relational data persistence for session history, transcripts, and evaluation metrics) / JSON Flat-file fallback.

LLM Engine Routing: Google Generative AI SDK (gemini-3.1-pro, gemini-2.5-flash) via asynchronous thread pooling and concurrency semaphores.

⚙️ Core Modules & Features

1. Dynamic Mock Interview Engine

Generates domain-specific, scenario-based technical questions.

Algorithmic Question Generation: Utilizes randomization seeds to bypass static question banks, pulling from a parameterized matrix of technical variables.

Real-Time Transcript Evaluation: Parses candidate responses for technical accuracy, domain lexicon, and architectural problem-solving methodology to compute a composite score.

20+ Mock Interview Modules: Simulates over 20 distinct interview environments, ranging from rigorous System Design and Advanced DSA to behavioral HR screenings and live debugging.

2. Resume Forensic Auditor (The "BOB" Engine)

Executes cross-reference validation between uploaded resume claims and technical reality.

Discrepancy Scanning: Detects unverified technical assertions and dynamically generates edge-case questions (e.g., querying S3 eventual consistency models if AWS is claimed).

Dynamic Difficulty Scaling: Calibrates interrogation parameters based on extracted Years of Experience (YOE). Architect-level queries focus on system degradation and CAP theorem; junior queries focus on internal API mechanics.

25+ Supported Tech Domains: Deep-scan technical evaluations configured for over 25 unique engineering domains, including Full-Stack Web, Cloud Architecture, Data Science, and DevOps.

3. Multi-Tiered AI Failover Matrix

Engineered to handle API rate-limiting (HTTP 429) and execution timeouts.

Primary Fleet: High-fidelity models (gemini-3.1-pro-preview, gemini-2.5-pro).

Fallback Fleet: Automated failover to secondary nodes upon latency threshold breach.

Hard Fallback Heuristic: In the event of complete API unavailability, the system routes to a local offline bank (25 domains, 250+ questions) to guarantee zero downtime.

4. JSON Defense System

Mitigates LLM formatting hallucinations and syntax errors.

Standard JSON parsing load.

AST Literal Evaluation.

Regex surgery for bracket balancing and rogue quote termination.

Schema enforcement validating nested dictionaries and array structures.

5. Interactive Candidate Dashboard

PostgreSQL-Powered Analytics: Retrieves timestamped interview sessions and evaluation metrics directly from the relational database.

Silent Killer Detection: Flags critical behavioral anomalies and technical anti-patterns extracted during the session.

Privacy Controls: Concurrent bulk deletion via Promise.all and FastAPI DELETE endpoints to execute hard wipes of candidate database records.

🚀 Local Development Setup

Prerequisites

Node.js (v18.x or higher)

Python (3.9.x or higher)

PostgreSQL (Running locally on port 5432)

Google Gemini API Key

The system requires three concurrent terminal instances to run the microservices simultaneously.

1. Core Backend Setup (Terminal 1)

Initialize the Node.js backend server handling database routing:

Bash

# Navigate to the backend directory

cd backend

# Install dependencies

npm install

# Start the Node server

npm start

The core backend will initialize on its designated port.

2. AI Engine Setup (Terminal 2)

Initialize the Python FastAPI microservice handling LLM logic:

Bash

# Navigate to the AI engine directory

cd ai-engine

# Create and activate a virtual environment

python -m venv venv

# On Windows:

venv\Scripts\activate

# On macOS/Linux:

source venv/bin/activate

# Install core dependencies

pip install fastapi uvicorn pydantic google-generativeai python-dotenv

# Execute the AI Engine module

python -m app.main

The AI Engine will boot and expose its endpoints (default local port 8000).

3. Frontend Client Setup (Terminal 3)

Initialize the React/Vite user interface:

Bash

# Navigate to the frontend directory

cd frontend

# Install Node dependencies

npm install

# Start the Vite development server

npm run dev

The frontend client will boot and become accessible in the browser.

📡 API Reference (AI Engine)

Method | Endpoint | Description | Payload Format

POST | /generate | Generates standard technical mock interview | { topic, difficulty, count, round_type }

POST | /evaluate_session | Standard technical transcript evaluation | { transcript }

POST | /generate_resume_questions | Initializes Forensic Resume Audit | { resume_text, domain, yoe, count }

POST | /evaluate_resume_session | Cross-references transcript against resume | { transcript, domain, experience_level }

POST | /chat | Context-aware post-interview AI routing | { message, context: {topic, score} }

GET | /interviews | Fetch all saved candidate sessions | N/A

POST | /interviews | Persist a completed session | Session Object

DELETE | /interviews/{id} | Hard delete a specific session record | N/A

DELETE | /api/sessions/clear | Wipes all database records for the user | N/A

🛡 Security Engineering

Prompt Injection Mitigation: All user-supplied inputs (Resume text, Chat parameters) are encapsulated within randomized security delimiters (e.g., ===CANDIDATE_DATA_[UUID]===) to isolate passive data payloads from system execution instructions.

Concurrency Guards: Backend threading semaphores restrict the maximum number of concurrent Generative AI requests to prevent memory exhaustion and mitigate API billing overrun.

Gemini said Thank you. Give star ⭐ if you like...

Developed by Aayush Thakur | Full Stack Tech Engineer
