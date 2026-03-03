### 🚀 MockShield 

# Ai-Platform for Technical Interview and Resume Evaluation 


### 🌐 Production Deployment Access

# ⏳ Service Initialization Instructions (Render Cold Start)

# Due to cold start behavior on hosted backend services:

# 1️⃣ Open the backend services first:

# Main Backend: https://mockshield.onrender.com

# Node Backend: https://mockshield-node.onrender.com


# 2️⃣ Wait approximately 50 seconds until both services indicate active or running status.

# 3️⃣ Then open the frontend:

# Frontend: https://mockshield.vercel.app


After initialization, select the desired domain and begin the mock interview session.


---

### 📌 Overview

MockShield AI is a distributed technical assessment system designed to conduct structured mock interviews and resume-based forensic evaluations.

The platform integrates:

 🧠 Multi-tier large language model routing

🧩 Deterministic JSON schema enforcement

🗄 PostgreSQL-based persistent storage

🔁 Automated failover handling

🏗 Domain-specific interview simulation logic


The architecture prioritizes reliability, structured AI output handling, and production-level resilience.


---

### 🏗 System Architecture

MockShield AI follows a decoupled microservices architecture.

Layer	Technology Stack	Responsibility

🎨 Frontend	React (Vite), TailwindCSS	User interface and session workflow
🔗 Core Backend	Node.js	API routing, authentication, database transactions
🤖 AI Engine	Python (FastAPI)	LLM generation, evaluation, structured parsing
🗄 Database	PostgreSQL	Persistent session and transcript storage
🔄 LLM Routing	Google Gemini SDK	Model orchestration and failover


The separation of services ensures modularity, scalability, and controlled execution boundaries.


---

### ⚙️ Core Modules

1️⃣ Dynamic Mock Interview Engine

The interview engine generates domain-specific, scenario-based technical questions.

Capabilities

🧮 Algorithmic question generation (non-static question bank)

🔀 Parameterized technical variables

📊 Real-time transcript evaluation

📈 Composite scoring computation

🏢 Support for 20+ simulated interview domains


Representative Domains

Data Structures and Algorithms

System Design

Backend Engineering

Cloud Architecture

DevOps Engineering

Data Science

Full Stack Development

Behavioral Interviews



---

### 2️⃣ Resume Forensic Auditor (BOB Engine)

The resume auditor performs structured cross-validation between declared resume claims and candidate responses.

Capabilities

🔍 Technical claim verification

🧠 Edge-case interrogation generation

📚 Difficulty scaling based on Years of Experience (YOE)

🏷 Domain-specific validation logic


Example Behavior

If distributed systems or AWS services are declared, the system may generate follow-up questions regarding consistency models, CAP theorem implications, or service-specific internal mechanics.


---

### 3️⃣ Multi-Tier LLM Failover Matrix

The system is designed to maintain availability under API limitations.

Tier	Function

🥇 Primary Models	High-accuracy generation
🥈 Secondary Models	Automatic latency and rate-limit fallback
🛟 Offline Question Bank	Emergency zero-dependency fallback


Failure Scenarios Handled

🚦 HTTP 429 rate limits

⌛ API timeouts

⚠️ Service unavailability



---

### 4️⃣ JSON Defense Architecture

Ensures structured and valid LLM outputs before application execution.

Mechanisms

📦 Standard JSON parsing

🌳 Abstract Syntax Tree (AST) literal evaluation

🧵 Regex-based bracket balancing

✏️ Quote correction handling

🛡 Nested schema validation


This layer prevents malformed responses from affecting application stability.


---

### 5️⃣ Candidate Analytics Dashboard

🗂 PostgreSQL-backed session history

🕒 Timestamped transcript logs

📊 Composite evaluation metrics

🚩 Behavioral anomaly flagging

🗑 Hard-delete privacy endpoints



---

### 🔐 Security Engineering

🛡 Prompt injection isolation using randomized delimiters

🚦 Concurrency semaphores limiting parallel AI requests

📑 Structured payload validation prior to processing

🧩 Strict schema enforcement for all model outputs

🔁 Controlled failover routing logic



---

### 🛠 Local Development Setup

✅ Prerequisites

Node.js (v18 or higher)

Python (3.9 or higher)

PostgreSQL (running on port 5432)

Google Gemini API key


Three terminal instances are required to run all services concurrently.


---

### 🖥 Terminal 1 — Core Backend (Node.js)

# cd backend
# npm install
# npm start


---

### 🧠 Terminal 2 — AI Engine (FastAPI)

# cd ai-engine
# python -m venv venv

Windows

# venv\Scripts\activate

macOS / Linux

# source venv/bin/activate

# pip install fastapi uvicorn pydantic google-generativeai python-dotenv
# python -m app.main

# Default Port: 8000


---

### 🎨 Terminal 3 — Frontend (React + Vite)

# cd frontend
# npm install
# npm run dev


---

# 📡 AI Engine API Reference

Method	Endpoint	Description

# POST	/generate	Generate mock interview questions
# POST	/evaluate_session	Evaluate technical transcript
# POST	/generate_resume_questions	Initialize resume audit
# POST	/evaluate_resume_session	Resume-linked transcript evaluation
# POST	/chat	Context-aware follow-up interaction
# GET	/interviews	Retrieve saved sessions
# POST	/interviews	Persist completed session
# DELETE	/interviews/{id}	Delete specific session
# DELETE	/api/sessions/clear	Clear all user sessions


All endpoints enforce structured JSON schema validation.


---

### 📐 Engineering Principles

Deterministic AI output handling

Production-grade failover design

Microservice isolation

Structured persistence strategy

Defensive JSON validation



---

### 📄 License

Intended for educational use and structured technical evaluation purposes.
