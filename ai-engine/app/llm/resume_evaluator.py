

# #----------------------------------------------------------------------------------------------------------------
# import os
# import google.generativeai as genai
# import json
# import itertools
# import random
# import time
# import re
# import traceback
# import uuid
# from datetime import datetime
# from dotenv import load_dotenv

# # 1. Load Environment Variables
# load_dotenv()

# # 2. Check API Key & Configure Mock Mode
# api_key = os.getenv("GOOGLE_API_KEY")
# is_mock_mode = False

# if not api_key or ("AIzaSy" in api_key and len(api_key) < 10):
#     print("⚠️ SYSTEM STATUS: No valid Google API Key found. Running in SMART SIMULATION MODE.")
#     is_mock_mode = True
# else:
#     genai.configure(api_key=api_key)

# # 3. COMPREHENSIVE MODEL LIST (Round Robin Failover)
# ALL_MODELS = [
#     'models/gemini-2.0-flash',
#     'models/gemini-2.0-flash-001',
#     'models/gemini-flash-latest',
#     'models/gemini-flash-lite-latest',
#     'models/gemini-2.5-flash',
#     'models/gemini-2.5-flash-lite',
#     'models/gemini-robotics-er-1.5-preview',
#     'models/gemini-1.5-flash',
#     'models/gemini-1.5-flash-latest',
#     'models/gemini-1.5-flash-001',
#     'models/gemini-1.5-flash-002',
#     'models/gemini-1.5-flash-8b',
#     'models/gemini-1.5-flash-8b-latest',
#     'models/gemini-1.5-flash-8b-001',
#     'models/gemini-1.5-pro',
#     'models/gemini-1.5-pro-latest',
#     'models/gemini-1.5-pro-001',
#     'models/gemini-1.5-pro-002',
#     'models/gemini-1.0-pro',
#     'models/gemini-1.0-pro-latest',
#     'models/gemini-1.0-pro-001',
#     'models/gemini-pro',
#     'models/gemini-pro-vision',
#     'models/gemini-2.5-flash-preview-09-2025',
#     'models/gemini-2.5-flash-lite-preview-09-2025',
#     'models/gemini-2.5-flash-tts',
#     'models/gemini-2.5-pro',
#     'models/gemini-pro-latest',
#     'models/gemini-3-pro-preview',
#     'models/deep-research-pro-preview-12-2025',
#     'models/gemini-2.0-flash-lite',
#     'models/gemini-2.0-flash-lite-001',
#     'models/gemini-2.0-flash-lite-preview',
#     'models/gemini-2.0-flash-lite-preview-02-05',
#     'models/gemini-2.0-flash-exp',
#     'models/gemini-exp-1206',
#     'models/gemma-3-27b-it',
#     'models/gemma-3-12b-it',
#     'models/gemma-3-4b-it',
#     'models/gemma-3-1b-it',
#     'models/gemma-3n-e4b-it',
#     'models/gemma-3n-e2b-it',
#     'models/gemma-2-27b-it',
#     'models/gemma-2-9b-it',
#     'models/gemma-2-2b-it',
#     'models/gemini-2.5-flash-native-audio-dialog',
#     'models/nano-banana-pro-preview',
#     'models/aqa'
# ]

# # Create an infinite cycle iterator to loop through models forever
# model_cycle = itertools.cycle(ALL_MODELS)

# def get_next_model():
#     """Returns the next model in the list (Round Robin)."""
#     model_name = next(model_cycle)
#     return model_name

# def clean_json_string(text):
#     """
#     Surgical JSON Extractor with Control Character Sanitization.
#     Sanitizes AI response to extract JSON and fixes common formatting issues.
#     """
#     try:
#         # 1. Surgical Extraction: Remove markdown code blocks
#         text = re.sub(r'```\w*\n', '', text)
#         text = text.replace("```", "")
        
#         # 2. Extract JSON object or array
#         if text.strip().startswith("{"):
#             match = re.search(r'\{.*\}', text, re.DOTALL)
#             if match: text = match.group(0)
#         elif text.strip().startswith("["):
#             match = re.search(r'\[.*\]', text, re.DOTALL)
#             if match: text = match.group(0)

#         # 3. Control Character Sanitization (Specific Fix)
#         # Fix unescaped tabs which are common in generated code blocks inside JSON
#         text = text.replace('\t', '\\t')
        
#         return text.strip()
#     except:
#         return text

# def generate_with_failover(prompt, max_retries=55):
#     """
#     Tries to generate content. If a model fails (quota/error), it IMMEDIATELY 
#     switches to the next one in the list and tries again.
#     Includes basic self-healing checks on empty responses.
#     """
#     attempts = 0
#     while attempts < max_retries:
#         current_model = get_next_model()
#         print(f"🔄 AI Request Attempt {attempts+1}/{max_retries}: Trying model '{current_model}'...")
        
#         try:
#             model = genai.GenerativeModel(current_model)
#             response = model.generate_content(prompt)
            
#             if not response.text:
#                 raise ValueError("Empty response received")
                
#             print(f"✅ SUCCESS using {current_model}")
#             return response.text
            
#         except Exception as e:
#             # Short error log to keep console clean
#             print(f"❌ FAILED with {current_model}: {str(e)[:100]}...")
#             attempts += 1
#             time.sleep(0.5)
            
#     raise Exception("All attempted models failed. API connectivity issue or global quota exhaustion.")

# # ==============================================================================
# # ENGINE 1: QUESTION GENERATOR (HYBRID RESUME CROSS-REFERENCE)
# # ==============================================================================

# def generate_resume_questions(topic, resume_text, difficulty="Senior", count=5):
#     """
#     Generates interview questions by CROSS-REFERENCING a 100k+ Question Bank 
#     with SPECIFIC claims found in the candidate's resume text.
#     """
    
#     # --- 1. STRICT VALIDATION ---
#     if not topic or not isinstance(topic, str) or len(topic.strip()) < 2:
#         # Fallback if topic is missing but resume exists (AI will infer topic later if needed, but strict mode fails here)
#         print("⛔ VALIDATION FAILED: Invalid topic.")
#         return [{"id": 0, "error": "INVALID_INPUT", "question": "Please specify a valid professional field."}]

#     # If resume text is missing, warn but proceed with generic questions (Hybrid Fallback)
#     has_resume = False
#     if resume_text and isinstance(resume_text, str) and len(resume_text) > 50:
#         has_resume = True
#     else:
#         print("⚠️ WARNING: No resume text provided. Reverting to GENERIC 100k+ Database Mode.")

#     if is_mock_mode:
#         return [{"id": 1, "type": "technical", "question": f"Mock Question regarding {topic} based on resume claims."}]

#     unique_seed = random.randint(10000, 99999)

#     # --- 2. HYBRID QUERY PROMPT (DATABASE + FORENSIC TEXT ANALYSIS) ---
#     prompt = f"""
#     ### SYSTEM OVERRIDE
#     - STRICTLY FORBIDDEN: Conversational fillers (e.g., "Here are the questions").
#     - MANDATORY: Output must be RAW JSON only.
#     - ESCAPING RULES: Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).

#     ### SYSTEM ROLE: CHIEF TECHNICAL AUDITOR & DATABASE ENGINE
#     *** MODE: HYBRID CROSS-REFERENCE - DATABASE (100,000+ Qs) + FORENSIC TEXT ANALYSIS ***
    
#     CONTEXT: 
#     1. **THE FIELD:** {topic.upper()}
#     2. **THE SOURCE:** A database of 100,000+ verified {difficulty}-level interview questions.
#     3. **THE TARGET:** The Candidate's Resume Text below.

#     ### CANDIDATE RESUME TEXT:
#     \"\"\"
#     {resume_text if has_resume else "NO RESUME TEXT AVAILABLE - USE GENERIC DATABASE"}
#     \"\"\"

#     ### TASK:
#     Generate {count} interview questions.
    
#     LOGIC PROTOCOL:
#     1. **IF RESUME IS PROVIDED:** - SCAN the text for specific projects, tools, or claims (e.g., "Built X using Y").
#        - QUERY the 100k+ database for a hard question related to "Y".
#        - **MANDATORY:** Start the question by citing the resume: "You mentioned working on [Project Name]..." or "Your resume claims proficiency in [Tool]..."
#        - GOAL: Ruthlessly dissect specific resume claims to isolate the candidate's distinct architectural contribution from collective team velocity, demanding verifiable metrics of impact and ownership. Compel a rigorous defense of historical design decisions against viable alternatives, exposing whether choices were driven by active engineering trade-offs or passive legacy adoption.
       
#     2. **IF RESUME IS MISSING:**
#        - Execute `SELECT * FROM {topic}_questions WHERE difficulty = '{difficulty}' ORDER BY RANDOM() LIMIT {count}`.

#     3. **DIFFICULTY CALIBRATION:**
#        - {difficulty} Level: Construct complex architectural scenarios that strictly enforce trade-off analysis between competing system constraints (e.g., consistency vs. latency) rather than simple definition recall. Prioritize failure mode interrogation, requiring the explicit identification of bottlenecks, race conditions, and cascading effects under high-load conditions. Avoid basic definition questions.

#     ### OUTPUT FORMAT (JSON ONLY):
#     [
#         {{
#             "id": 1,
#             "type": "resume_specific", 
#             "question": "In your 'E-commerce Overhaul' project, you mentioned using microservices. How did you handle distributed transactions and data consistency failures in that specific architecture?" 
#         }},
#         {{
#             "id": 2,
#             "type": "technical_deep_dive",
#             "question": "Your resume lists 'Advanced SQL'. Explain how you would optimize a query performing a full table scan on a 10-million row dataset without adding an index." 
#         }}
#     ]
#     """

#     try:
#         raw_text = generate_with_failover(prompt)
#         cleaned_text = clean_json_string(raw_text)
        
#         # Self-Healing JSON Parser
#         try:
#             return json.loads(cleaned_text)
#         except json.JSONDecodeError:
#             print("⚠️ JSON Parse Error: Invalid Escape detected. Attempting Regex Repair...")
#             repaired_text = re.sub(r'\\(?![/\\bfnrtu"])', r'\\\\', cleaned_text)
#             try:
#                 return json.loads(repaired_text)
#             except json.JSONDecodeError:
#                 sanitized_text = repaired_text.replace('\n', '\\n')
#                 try:
#                     return json.loads(sanitized_text)
#                 except json.JSONDecodeError:
#                     nuclear_text = cleaned_text.replace('\\', '\\\\')
#                     try:
#                         return json.loads(nuclear_text)
#                     except:
#                          raise Exception("All JSON Repair strategies failed.")

#     except Exception as e:
#         print(f"❌ QUESTION GENERATION ERROR: {e}")
#         traceback.print_exc()
#         return []

# # ==============================================================================
# # ENGINE 2: RESUME EVALUATOR (FORENSIC AUDITOR)
# # ==============================================================================

# def evaluate_resume_session(transcript_data, field="General", experience="Entry Level"):
#     """
#     THE SUPREME ATS FORENSIC AUDITOR.
#     Generates detailed analysis checking if the candidate matches their Resume Claims.
#     """
    
#     # 0. Check for empty transcript or invalid input
#     if not transcript_data or not isinstance(transcript_data, list):
#         print("⚠️ INPUT WARNING: Transcript data is empty or invalid.")
#         return {
#             "topic": field,
#             "score": 0,
#             "summary": "Evaluation Failed: No interview data provided.",
#             "silent_killers": ["Missing Data"],
#             "roadmap": "Please ensure the interview session is recorded correctly.",
#             "question_reviews": []
#         }

#     # 1. Immediate Mock Mode Return
#     if is_mock_mode:
#         print("ℹ️ Mock Mode Active: Returning simulated forensic analysis.")
#         return {
#             "topic": field, # <--- ADDED FIELD HERE
#             "score": 72,
#             "summary": "Mock Mode: Resume analysis simulation active. Good alignment with claimed skills.",
#             "silent_killers": ["Mock: Vague terminology"],
#             "roadmap": "Add API Key to see full forensic analysis.",
#             "question_reviews": []
#         }

#     try:
#         # 2. Try Real AI Evaluation
#         transcript_text = json.dumps(transcript_data)

#         # SUPREME FORENSIC GAP ANALYSIS PROMPT
#         prompt = f"""
#         ### SYSTEM OVERRIDE
#         - STRICTLY FORBIDDEN: Conversational fillers (e.g., "Here is the JSON", "I have generated...").
#         - MANDATORY: Output must be RAW JSON only.
#         - ESCAPING RULES: All backslashes must be double-escaped (\\\\ -> \\\\\\\\). All newlines within strings must be escaped (\\n -> \\\\n).

#         ### ROLE & SYSTEM CONTEXT:
#         ACT AS: The 'Supreme ATS Forensic Auditor' & 'Global Head of Talent Acquisition'.
#         CONTEXT: You are auditing a candidate who claims to be an expert in **{field.upper()}** with **{experience.upper()}** experience.
#         CAPABILITIES: You possess 100% mastery of top 50 Professional Domains (Engineering, Medical, Finance, Law, etc.) and deep behavioral psychology.
        
#         TASK: Conduct a ruthless "Resume Verification Analysis" of the following interview transcript.

#         ### TRANSCRIPT DATA:
#         {transcript_text}

#         ### ANALYSIS PROTOCOL (The "Audit"):
#         For every answer, perform a "Claim vs. Reality" check:
#         1. **Domain Consistency:** Does the candidate use the correct terminology for {field}? (e.g., A Doctor knows 'triage', a Dev knows 'CI/CD').
#         2. **Experience Verification:** Does the depth match {experience}? 
#            - Entry Level: Should know 'how' and basic definitions.
#            - Senior Level: Should know 'why', 'trade-offs', 'edge cases', and 'system impact'.
#         3. **Red Flag Detection (Lying):** Identify vague answers ("I handled everything") that suggest "Resume Padding" or lying about skills.
#         4. **Valid Resume Check:** If the answers are total gibberish or completely unrelated to {field}, flag it immediately.

#         ### SCORING CRITERIA (Strict):
#         - **90-100 (Hired):** Exceptional. Demonstrates deep, practical expertise matching the resume claims perfectly.
#         - **70-89 (Strong):** Good. Minor gaps but generally truthful and competent.
#         - **40-69 (Weak):** Inconsistent. Struggles with concepts expected at this level. Requires significant training.
#         - **0-39 (Fraud/Mismatch):** Imposter. Answers contradict the resume claims or show fundamental lack of knowledge.

#         REQUIREMENTS:
#         1. **Resume Strength Score (0-100):** Be strict.
#         2. **Executive Summary:** A concise 2-sentence verdict on their hireability.
#         3. **Silent Killers:** Detect specific lies, inconsistencies, or behavioral red flags (e.g., "Claimed 5 years Java but stuck on basic OOP").
#         4. **Roadmap:** Specific, actionable steps to bridge the gap between their current performance and their claimed experience level.
#         5. **Per-Question Breakdown:**
#             - "question": Original question.
#             - "user_answer": Their response.
#             - "score": 0-10 rating.
#             - "feedback": Direct critique referencing their claimed level.
#             - "ideal_answer": How a true top-tier professional in {field} would answer.

#         **SPECIAL CONDITION:**
#         If the input answers seem to be completely random text, spam, or not an interview, set the score to 0 and the summary to: "INVALID INPUT: Please upload a valid resume and conduct a proper interview session."

#         CRITICAL JSON FORMATTING RULES:
#         - Output ONLY valid JSON.
#         - **ESCAPE ALL BACKSLASHES:** If you write code with '\\n', you MUST write it as '\\\\n'. 
#         - Do not include any text before or after the JSON.

#         OUTPUT FORMAT (JSON ONLY):
#         {{
#             "score": <number>,
#             "summary": "<executive_summary_string>",
#             "silent_killers": ["<flag_1>", "<flag_2>"],
#             "roadmap": "<step_by_step_improvement_plan>",
#             "question_reviews": [
#                 {{
#                     "question": "...",
#                     "user_answer": "...",
#                     "score": 8,
#                     "feedback": "...",
#                     "ideal_answer": "..."
#                 }}
#             ]
#         }}
#         """

#         raw_text = generate_with_failover(prompt)
#         cleaned_text = clean_json_string(raw_text)
        
#         # --- SELF-HEALING JSON PARSER ---
#         try:
#             evaluation_result = json.loads(cleaned_text)
#             # INJECT THE FIELD NAME INTO THE RESULT
#             evaluation_result["topic"] = field
#             return evaluation_result
            
#         except json.JSONDecodeError:
#             print("⚠️ JSON Parse Error: Invalid Escape detected. Attempting Regex Repair...")
#             # Repair Strategy 1: Fix single backslashes that aren't valid escapes
#             repaired_text = re.sub(r'\\(?![/\\bfnrtu"])', r'\\\\', cleaned_text)
#             try:
#                 evaluation_result = json.loads(repaired_text)
#                 evaluation_result["topic"] = field
#                 return evaluation_result
#             except json.JSONDecodeError:
#                 print("⚠️ Regex Repair failed. Attempting Nuclear Repair (Double-Escape All)...")
#                 # Repair Strategy 2: Control Character Sanitization (Specific fix)
#                 sanitized_text = repaired_text.replace('\n', '\\n')
#                 try:
#                     evaluation_result = json.loads(sanitized_text)
#                     evaluation_result["topic"] = field
#                     return evaluation_result
#                 except json.JSONDecodeError:
#                     # Repair Strategy 3: Nuclear Option
#                     nuclear_text = cleaned_text.replace('\\', '\\\\')
#                     try:
#                         evaluation_result = json.loads(nuclear_text)
#                         evaluation_result["topic"] = field
#                         return evaluation_result
#                     except:
#                          raise Exception("All JSON Repair strategies failed.")

#     except Exception as e:
#         print(f"❌ RESUME AUDIT CRASHED: {e}")
#         traceback.print_exc() # Print full traceback for debugging
#         print("⚠️ SWITCHING TO SMART OFFLINE FALLBACK ENGINE")
        
#         # 3. CRASH-PROOF FALLBACK (Algorithmic Grading)
#         total_words = 0
#         reviews = []
        
#         for item in transcript_data:
#             ans = str(item.get('answer', ''))
#             word_count = len(ans.split())
#             total_words += word_count
            
#             # Simple Heuristic Scoring
#             algo_score = 4
#             if word_count > 30: algo_score = 8
#             elif word_count > 10: algo_score = 6
            
#             reviews.append({
#                 "question": item.get('question', 'Unknown Question'),
#                 "user_answer": ans,
#                 "score": algo_score,
#                 "feedback": "Offline Audit: Answer recorded. Deep forensic analysis unavailable due to network/parsing constraints.",
#                 "ideal_answer": f"A verified {experience} expert in {field} would provide concrete examples and metrics here."
#             })

#         # Calculate rough global score
#         final_score = min(88, max(40, int((total_words / (len(transcript_data) or 1)) * 2)))

#         return {
#             "topic": field, # <--- ADDED FIELD HERE
#             "score": final_score,
#             "summary": "Offline Assessment: The Forensic Engine is temporarily unreachable. Scoring is based on response depth metrics.",
#             "silent_killers": ["Network/API Connectivity Issue", "Heuristic Analysis Mode"],
#             "roadmap": "Check backend logs for JSON formatting errors. Ensure Google API Key is active.",
#             "question_reviews": reviews
#         }

# # ==============================================================================
# # ENGINE 3: SESSION LOG MANAGER (Disqualified/Active/Storage)
# # ==============================================================================

# class SessionLogManager:
#     def __init__(self):
#         # In a real app, this would be a database. 
#         # Here we use an in-memory list for demonstration.
#         self.logs = []

#     def save_session(self, evaluation_data):
#         """
#         Saves the session. handles both PASSED and DISQUALIFIED sessions.
#         """
#         is_disqualified = evaluation_data.get('score', 0) < 40
        
#         log_entry = {
#             "id": str(uuid.uuid4()),
#             "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            
#             # TITLE FIX: Use the 'topic' we added in Step 1. 
#             # If missing, fallback to "General Interview".
#             "title": evaluation_data.get('topic', 'General Interview'), 
            
#             "score": evaluation_data.get('score', 0),
#             "status": "Disqualified" if is_disqualified else "Active",
#             "summary": evaluation_data.get('summary', 'Processing...'),
#             "details": evaluation_data # Store full details for "View"
#         }
        
#         self.logs.insert(0, log_entry) # Add to top of list (Recent)
#         return log_entry

#     def delete_session(self, session_id):
#         """
#         Deletes a session (works for Disqualified or Active).
#         """
#         self.logs = [log for log in self.logs if log['id'] != session_id]
#         return {"status": "success", "message": "Session deleted"}

#     def get_recent_logs(self):
#         """
#         Returns formatted logs for the Frontend UI.
#         """
#         return self.logs

# # Initialize the manager
# log_manager = SessionLogManager()

# # --- EXAMPLE USAGE BLOCK ---
# if __name__ == "__main__":
    
#     # 1. The user uploads a resume and picks a field
#     selected_field = "Full Stack Java Development" 
    
#     # Simulate a Resume Text
#     resume_txt = """
#     EXPERIENCE:
#     Senior Java Developer at TechCorp (2020-Present)
#     - Led the migration of a monolithic payment gateway to Microservices using Spring Boot.
#     - Reduced latency by 40% using Redis Caching strategies.
#     - Managed a team of 5 developers.
#     """

#     print(f"\n--- 1. Generating Questions for Topic: {selected_field} with Resume Data ---")
    
#     # 2. You generate questions (as per your existing code)
#     questions = generate_resume_questions(selected_field, resume_txt, "Senior", 3)
#     print("Generated Questions:", json.dumps(questions, indent=2))
    
#     # 3. (Simulation) User answers questions -> Transcript is created
#     # We will simulate a weak candidate to trigger the "Disqualified" logic
#     transcript = [
#         {"question": "Explain JVM", "answer": "It is a virtual machine..."},
#         {"question": "Explain Microservices", "answer": "I don't know, never used it."} # Weak answer
#     ]

#     print(f"\n--- 2. Evaluating Session ---")
    
#     # 4. RUN EVALUATION (Returns the data with the 'topic' field)
#     evaluation = evaluate_resume_session(transcript, field=selected_field, experience="Senior")
    
#     print(f"\n--- 3. Saving to Session Log ---")
#     # 5. SAVE THE LOG (Automatically handles Disqualified logic)
#     saved_log = log_manager.save_session(evaluation)
#     print(f"Saved Session ID: {saved_log['id']} | Status: {saved_log['status']}")

#     print(f"\n--- 4. Frontend Log Output ---")
#     # 6. DISPLAY RECENT LOGS (What your frontend will see)
#     recent_logs = log_manager.get_recent_logs()
#     print(json.dumps(recent_logs, indent=2))
#-----------------------------------------------------------------------------------------------------------------------------------------------
#it is not generating random questions
# import os
# import google.generativeai as genai
# import json
# import itertools
# import random
# import time
# import re
# import traceback
# import uuid
# from datetime import datetime
# from dotenv import load_dotenv

# # 1. Load Environment Variables
# load_dotenv()

# # 2. Check API Key & Configure Mock Mode
# api_key = os.getenv("GOOGLE_API_KEY")
# is_mock_mode = False

# if not api_key or ("AIzaSy" in api_key and len(api_key) < 10):
#     print("⚠️ SYSTEM STATUS: No valid Google API Key found. Running in SMART SIMULATION MODE.")
#     is_mock_mode = True
# else:
#     genai.configure(api_key=api_key)

# # 3. COMPREHENSIVE MODEL LIST (Round Robin Failover)
# ALL_MODELS = [
#     'models/gemini-2.0-flash',
#     'models/gemini-2.0-flash-001',
#     'models/gemini-flash-latest',
#     'models/gemini-flash-lite-latest',
#     'models/gemini-2.5-flash',
#     'models/gemini-2.5-flash-lite',
#     'models/gemini-robotics-er-1.5-preview',
#     'models/gemini-1.5-flash',
#     'models/gemini-1.5-flash-latest',
#     'models/gemini-1.5-flash-001',
#     'models/gemini-1.5-flash-002',
#     'models/gemini-1.5-flash-8b',
#     'models/gemini-1.5-flash-8b-latest',
#     'models/gemini-1.5-flash-8b-001',
#     'models/gemini-1.5-pro',
#     'models/gemini-1.5-pro-latest',
#     'models/gemini-1.5-pro-001',
#     'models/gemini-1.5-pro-002',
#     'models/gemini-1.0-pro',
#     'models/gemini-1.0-pro-latest',
#     'models/gemini-1.0-pro-001',
#     'models/gemini-pro',
#     'models/gemini-pro-vision',
#     'models/gemini-2.5-flash-preview-09-2025',
#     'models/gemini-2.5-flash-lite-preview-09-2025',
#     'models/gemini-2.5-flash-tts',
#     'models/gemini-2.5-pro',
#     'models/gemini-pro-latest',
#     'models/gemini-3-pro-preview',
#     'models/deep-research-pro-preview-12-2025',
#     'models/gemini-2.0-flash-lite',
#     'models/gemini-2.0-flash-lite-001',
#     'models/gemini-2.0-flash-lite-preview',
#     'models/gemini-2.0-flash-lite-preview-02-05',
#     'models/gemini-2.0-flash-exp',
#     'models/gemini-exp-1206',
#     'models/gemma-3-27b-it',
#     'models/gemma-3-12b-it',
#     'models/gemma-3-4b-it',
#     'models/gemma-3-1b-it',
#     'models/gemma-3n-e4b-it',
#     'models/gemma-3n-e2b-it',
#     'models/gemma-2-27b-it',
#     'models/gemma-2-9b-it',
#     'models/gemma-2-2b-it',
#     'models/gemini-2.5-flash-native-audio-dialog',
#     'models/nano-banana-pro-preview',
#     'models/aqa'
# ]

# # Create an infinite cycle iterator to loop through models forever
# model_cycle = itertools.cycle(ALL_MODELS)

# def get_next_model():
#     """Returns the next model in the list (Round Robin)."""
#     model_name = next(model_cycle)
#     return model_name

# def clean_json_string(text):
#     """
#     LAYER 2: Surgical JSON Extractor with Control Character Sanitization.
#     Sanitizes AI response to extract JSON and fixes common formatting issues.
#     """
#     try:
#         # 1. Surgical Extraction: Remove markdown code blocks
#         text = re.sub(r'```\w*\n', '', text)
#         text = text.replace("```", "")
        
#         # 2. Extract JSON object or array
#         if text.strip().startswith("{"):
#             match = re.search(r'\{.*\}', text, re.DOTALL)
#             if match: text = match.group(0)
#         elif text.strip().startswith("["):
#             match = re.search(r'\[.*\]', text, re.DOTALL)
#             if match: text = match.group(0)

#         # 3. Control Character Sanitization (Specific Fix)
#         # Fix unescaped tabs which are common in generated code blocks inside JSON
#         text = text.replace('\t', '\\t')
        
#         return text.strip()
#     except:
#         return text

# def generate_with_failover(prompt, max_retries=55):
#     """
#     Tries to generate content. If a model fails (quota/error), it IMMEDIATELY 
#     switches to the next one in the list and tries again.
#     Includes basic self-healing checks on empty responses.
#     """
#     attempts = 0
#     while attempts < max_retries:
#         current_model = get_next_model()
#         print(f"🔄 AI Request Attempt {attempts+1}/{max_retries}: Trying model '{current_model}'...")
        
#         try:
#             model = genai.GenerativeModel(current_model)
#             response = model.generate_content(prompt)
            
#             if not response.text:
#                 raise ValueError("Empty response received")
                
#             print(f"✅ SUCCESS using {current_model}")
#             return response.text
            
#         except Exception as e:
#             # Short error log to keep console clean
#             print(f"❌ FAILED with {current_model}: {str(e)[:100]}...")
#             attempts += 1
#             time.sleep(0.5)
            
#     raise Exception("All attempted models failed. API connectivity issue or global quota exhaustion.")

# # ==============================================================================
# # ENGINE 1: QUESTION GENERATOR (HYBRID RESUME CROSS-REFERENCE + TEMPLATE INTEGRITY)
# # ==============================================================================

# def generate_resume_questions(topic, resume_text, difficulty="Senior", count=5):
#     """
#     Generates interview questions by CROSS-REFERENCING a 100k+ Question Bank 
#     with SPECIFIC claims found in the candidate's resume text.
#     INCLUDES: Strict Template Integrity Protocol (DNA Check) for 50+ Global Fields.
#     """
    
#     # --- 1. STRICT VALIDATION ---
#     if not topic or not isinstance(topic, str) or len(topic.strip()) < 2:
#         print("⛔ VALIDATION FAILED: Invalid topic.")
#         return [{"id": 0, "error": "INVALID_INPUT", "question": "Please specify a valid professional field."}]

#     has_resume = False
#     if resume_text and isinstance(resume_text, str) and len(resume_text) > 50:
#         has_resume = True
#     else:
#         print("⚠️ WARNING: No resume text provided. Reverting to GENERIC 100k+ Database Mode.")

#     if is_mock_mode:
#         return [{"id": 1, "type": "technical", "question": f"Mock Question regarding {topic} based on resume claims."}]

#     unique_seed = random.randint(10000, 99999)

#     # --- 2. HYBRID QUERY PROMPT (DATABASE + FORENSIC TEXT ANALYSIS + TEMPLATE INTEGRITY) ---
#     prompt = f"""
#     ### SYSTEM OVERRIDE
#     - STRICTLY FORBIDDEN: Conversational fillers (e.g., "Here are the questions").
#     - MANDATORY: Output must be RAW JSON only.
#     - ESCAPING RULES: Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).

#     ### SYSTEM ROLE: CHIEF TALENT ARCHITECT, DATABASE ENGINE & RESUME DNA EXPERT
#     *** MODE: HYBRID CROSS-REFERENCE - DATABASE (100,000+ Qs) + FORENSIC TEXT ANALYSIS ***
    
#     CONTEXT: 
#     1. **THE FIELD:** {topic.upper()}
#     2. **THE SOURCE:** A database of 100,000+ verified {difficulty}-level interview questions.
#     3. **THE TARGET:** The Candidate's Resume Text below.
#     4. **THE STANDARD:** You hold the "Golden Standard" templates for every profession. You know that a Doctor's CV is structurally distinct from a Developer's Resume, which is distinct from a Chartered Accountant's Profile.

#     ### CANDIDATE RESUME TEXT:
#     \"\"\"
#     {resume_text if has_resume else "NO RESUME TEXT AVAILABLE - USE GENERIC DATABASE"}
#     \"\"\"

#     ### PHASE 1: DNA TEMPLATE CHECK (STRICT INTEGRITY PROTOCOL)
#     Analyze if the provided resume text matches the **structural and semantic DNA** of a {topic} professional.
    
#     **SUPPORTED DOMAINS & EXPECTED DNA:**
#     You must validate against the specific lexicon and regulatory requirements of the following fields:
#     1.  **Software Engineering & Development:** (GitHub, LeetCode, Stacks: MERN/MEAN/Spring, Cloud: AWS/Azure).
#     2.  **Data Science & Analytics:** (Kaggle, Python/R, SQL, Tableau, Big Data: Spark/Hadoop, Models: NLP/Regression).
#     3.  **Product Management:** (Roadmaps, Agile/Scrum, User Stories, KPIs, Jira/Confluence).
#     4.  **Civil Engineering:** (AutoCAD, Revit, STAAD.Pro, Site Supervision, PE/Chartered Engineer).
#     5.  **Mechanical Engineering:** (SolidWorks, AutoCAD, HVAC, Six Sigma, PLC/SCADA).
#     6.  **Electrical & Electronics Engineering:** (Circuit Design, MATLAB, IoT, Embedded Systems).
#     7.  **Medical (Doctor/Surgeon):** (USMLE/PLAB/NEET-PG, Board Certifications, Residency, Clinical Rotations).
#     8.  **Nursing & Healthcare:** (NCLEX/NMC, RN License, Patient Care, Triage).
#     9.  **Pharmacy & Biotech:** (State Council Reg, GPAT/NAPLEX, Clinical Trials, Drug Safety).
#     10. **Chartered Accountancy (CA) & Finance:** (ICAI/CPA/ACCA/CIMA, Audit, Taxation, IFRS/GAAP).
#     11. **Investment Banking:** (Financial Modeling, DCF Valuation, M&A, CFA Levels).
#     12. **Marketing & Digital Strategy:** (SEO/SEM, Google Analytics, ROAS/ROI, HubSpot, Campaign Mgmt).
#     13. **Human Resources (HR):** (Talent Acquisition, Payroll, Compliance, Workday/BambooHR).
#     14. **Sales & Business Development:** (CRM, Lead Gen, Closing, Quota Achievement).
#     15. **Supply Chain & Logistics:** (SAP/ERP, Inventory Mgmt, Procurement, Last Mile).
#     16. **Corporate Law & Legal:** (Bar Council/State Bar, Litigation, Contracts, Due Diligence).
#     17. **Journalism & Media:** (By-lines, CMS, Editing, Reporting, Portfolio).
#     18. **Architecture & Interior Design:** (Portfolio, SketchUp, V-Ray, Building Codes).
#     19. **Teaching & Education:** (Curriculum Design, Classroom Mgmt, B.Ed/M.Ed/PhD).
#     20. **Graphic & UI/UX Design:** (Figma, Adobe XD/CC, Wireframing, Behance/Dribbble).
#     21. **Content Writing & Copywriting:** (SEO, Blog, Social Media, Portfolio).
#     22. **Hospitality & Hotel Management:** (Front Office, F&B, Guest Relations, Opera PMS).
#     23. **Aviation & Pilot:** (CPL/ATPL/PPL, Type Ratings, Flight Hours, FAA/DGCA/EASA).
#     24. **Social Work & NGO:** (Community Outreach, Grant Writing, Impact Assessment).
#     25. **Government & Public Service:** (Civil Service Exams, Policy Implementation, Administration).

#     **COUNTRY-WISE REGULATORY VALIDATION (MANDATORY):**
#     - **IF MEDICAL:** Check for USMLE (USA), PLAB (UK), NEET/NMC (India).
#     - **IF FINANCE/CA:** Check for CPA (USA), ACCA (UK), ICAI (India).
#     - **IF ENGINEERING:** Check for PE (USA), Chartered (UK/Aus), GATE (India).
#     - **IF LEGAL:** Check for State Bar (USA), Solicitor (UK), Bar Council (India).
#     - **IF AVIATION:** Check for FAA (USA), EASA (Europe), DGCA (India).

#     **CRITICAL FAILURE CONDITION:**
#     If the resume text is generic, gibberish, or structurally belongs to a completely different profession (e.g., a "Chef" resume uploaded for a "Surgeon" role), you MUST REJECT IT immediately.
    
#     **OUTPUT FOR FAILURE (JSON ONLY):**
#     [{{ "id": 0, "error": "TEMPLATE_MISMATCH", "question": "Resume template not matched. The provided document does not align with the professional standards required for a {topic}." }}]

#     ### PHASE 2: QUESTION GENERATION (Execute Only if Phase 1 Passes)
#     Generate {count} interview questions.
    
#     **QUERY RANDOMIZATION PROTOCOL (STRICT):**
#     - **SEED:** {unique_seed}
#     - **DATABASE SIMULATION:** Access the "Long Tail" of the {topic} question bank. 
#     - **EXCLUSION:** Do NOT select the top 100 most common questions for {topic}. (e.g., If Java, NO "What is OOP?"; If Accounting, NO "What is a Debit?").
#     - **UNIQUENESS:** Select specific, scenario-based edge cases that only a practitioner would know.
    
#     LOGIC PROTOCOL:
#     1. **IF RESUME IS PROVIDED:** - SCAN the text for specific projects, tools, or claims (e.g., "Built X using Y").
#        - QUERY the database for a hard question related to "Y".
#        - **MANDATORY:** Start the question by citing the resume: "You mentioned working on [Project Name]..." or "Your resume claims proficiency in [Tool]..."
#        - **GOAL:** Ruthlessly dissect specific resume claims to isolate the candidate's distinct architectural contribution from collective team velocity, demanding verifiable metrics of impact and ownership. Compel a rigorous defense of historical design decisions against viable alternatives, exposing whether choices were driven by active engineering trade-offs or passive legacy adoption.
       
#     2. **IF RESUME IS MISSING:**
#        - Execute `SELECT * FROM {topic}_questions WHERE difficulty = '{difficulty}' AND is_cliche = FALSE ORDER BY RANDOM(SEED={unique_seed}) LIMIT {count}`.

#     3. **DIFFICULTY CALIBRATION:**
#        - {difficulty} Level: Construct complex architectural scenarios that strictly enforce trade-off analysis between competing system constraints (e.g., consistency vs. latency) rather than simple definition recall. Prioritize failure mode interrogation, requiring the explicit identification of bottlenecks, race conditions, and cascading effects under high-load conditions. Avoid basic definition questions.

#     ### OUTPUT FORMAT (JSON ONLY):
#     [
#         {{
#             "id": 1,
#             "type": "resume_specific", 
#             "question": "In your 'E-commerce Overhaul' project, you mentioned using microservices. How did you handle distributed transactions and data consistency failures in that specific architecture?" 
#         }},
#         {{
#             "id": 2,
#             "type": "technical_deep_dive",
#             "question": "Your resume lists 'Advanced SQL'. Explain how you would optimize a query performing a full table scan on a 10-million row dataset without adding an index." 
#         }}
#     ]
#     """

#     try:
#         raw_text = generate_with_failover(prompt)
#         cleaned_text = clean_json_string(raw_text)
        
#         # --- 7-LAYER PARSING DEFENSE ---
#         try:
#             # Layer 3: Standard Parsing
#             return json.loads(cleaned_text)
#         except json.JSONDecodeError:
#             print("⚠️ Layer 3 Failed. Attempting Layer 4 (Regex Fixes)...")
#             # Layer 4: Fix common trailing commas
#             repaired_text = re.sub(r',\s*([\]}])', r'\1', cleaned_text)
#             try:
#                 return json.loads(repaired_text)
#             except json.JSONDecodeError:
#                 print("⚠️ Layer 4 Failed. Attempting Layer 5 (Escape Repair)...")
#                 # Layer 5: Fix single backslashes
#                 repaired_text = re.sub(r'\\(?![/\\bfnrtu"])', r'\\\\', cleaned_text)
#                 try:
#                     return json.loads(repaired_text)
#                 except json.JSONDecodeError:
#                     print("⚠️ Layer 5 Failed. Attempting Layer 6 (Nuclear Sanitization)...")
#                     # Layer 6: Nuclear Option
#                     nuclear_text = cleaned_text.replace('\\', '\\\\').replace('\n', '\\n')
#                     try:
#                         return json.loads(nuclear_text)
#                     except:
#                         # Layer 7: Failsafe Structure
#                         print("❌ ALL LAYERS FAILED. DEPLOYING FAILSAFE.")
#                         return [{"id": 0, "error": "JSON_PARSE_CRASH", "question": "Error generating questions. Please try again."}]

#     except Exception as e:
#         print(f"❌ QUESTION GENERATION ERROR: {e}")
#         traceback.print_exc()
#         return [{"id": 0, "error": "SYSTEM_CRASH", "question": "Critical error. Please contact support."}]

# # ==============================================================================
# # ENGINE 2: RESUME EVALUATOR (FORENSIC AUDITOR)
# # ==============================================================================

# def evaluate_resume_session(transcript_data, field="General", experience="Entry Level"):
#     """
#     THE SUPREME ATS FORENSIC AUDITOR.
#     Generates detailed analysis checking if the candidate matches their Resume Claims.
#     """
    
#     if not transcript_data or not isinstance(transcript_data, list):
#         print("⚠️ INPUT WARNING: Transcript data is empty or invalid.")
#         return {
#             "topic": field,
#             "score": 0,
#             "summary": "Evaluation Failed: No interview data provided.",
#             "silent_killers": ["Missing Data"],
#             "roadmap": "Please ensure the interview session is recorded correctly.",
#             "question_reviews": []
#         }

#     if is_mock_mode:
#         print("ℹ️ Mock Mode Active: Returning simulated forensic analysis.")
#         return {
#             "topic": field,
#             "score": 72,
#             "summary": "Mock Mode: Resume analysis simulation active. Good alignment with claimed skills.",
#             "silent_killers": ["Mock: Vague terminology"],
#             "roadmap": "Add API Key to see full forensic analysis.",
#             "question_reviews": []
#         }

#     try:
#         transcript_text = json.dumps(transcript_data)

#         # SUPREME FORENSIC GAP ANALYSIS PROMPT (FULL RESTORED VERSION)
#         prompt = f"""
#         ### SYSTEM OVERRIDE
#         - STRICTLY FORBIDDEN: Conversational fillers (e.g., "Here is the JSON", "I have generated...").
#         - MANDATORY: Output must be RAW JSON only.
#         - ESCAPING RULES: All backslashes must be double-escaped (\\\\ -> \\\\\\\\). All newlines within strings must be escaped (\\n -> \\\\n).

#         ### ROLE & SYSTEM CONTEXT:
#         ACT AS: The 'Supreme ATS Forensic Auditor' & 'Global Head of Talent Acquisition'.
#         CONTEXT: You are auditing a candidate who claims to be an expert in **{field.upper()}** with **{experience.upper()}** experience.
#         CAPABILITIES: You possess 100% mastery of top 50 Professional Domains (Engineering, Medical, Finance, Law, etc.) and deep behavioral psychology.
        
#         **PROFESSIONAL STANDARDS KNOWLEDGE (TEMPLATE INTEGRITY):**
#         You know exactly how a {field} expert speaks. 
#         - A Doctor discusses patient outcomes, protocols, and pathology (not just "fixing people").
#         - A Chartered Accountant (CA) discusses compliance, sections of the act, and financial risk (not just "doing math").
#         - An Engineer discusses scalability, complexity, and trade-offs (not just "writing code").
#         - A Pilot discusses checklists, meteorology, and specific aircraft systems.
        
#         TASK: Conduct a ruthless "Resume Verification Analysis" of the following interview transcript.

#         ### TRANSCRIPT DATA:
#         {transcript_text}

#         ### ANALYSIS PROTOCOL (The "Audit"):
#         For every answer, perform a "Claim vs. Reality" check:
#         1. **Domain DNA Verification:** Does the candidate use the correct terminology for {field}? (e.g., A Doctor knows 'triage', a Dev knows 'CI/CD', a Pilot knows 'METAR'). If they use generic terms instead of industry-standard lexicon, penalize heavily.
#         2. **Experience Verification:** Does the depth match {experience}? 
#            - Entry Level: Should know 'how' and basic definitions.
#            - Senior Level: Should know 'why', 'trade-offs', 'edge cases', and 'system impact'.
#         3. **Red Flag Detection (Lying):** Identify vague answers ("I handled everything") that suggest "Resume Padding" or lying about skills.
#         4. **Valid Resume Check:** If the answers are total gibberish or completely unrelated to {field}, flag it immediately.

#         ### SCORING CRITERIA (Strict):
#         - **90-100 (Hired):** Exceptional. Demonstrates deep, practical expertise matching the resume claims perfectly. Matches the professional template perfectly.
#         - **70-89 (Strong):** Good. Minor gaps but generally truthful and competent.
#         - **40-69 (Weak):** Inconsistent. Struggles with concepts expected at this level. Requires significant training.
#         - **0-39 (Fraud/Mismatch):** Imposter. Answers contradict the resume claims, contradict the professional standards of {field}, or show fundamental lack of knowledge.

#         REQUIREMENTS:
#         1. **Resume Strength Score (0-100):** Be strict.
#         2. **Executive Summary:** A concise verdict on their hireability. 
#            - **STRICT CONSTRAINT:** ATTENTION, Do NOT use the phrase **like** "Please upload a valid resume and conduct a proper interview session".
#            - **MANDATORY:** Always append 2-5 lines of specific, high-value improvement advice based on the interview performance, even if the candidate is excellent. This advice must be unique and different every time.
#         3. **Silent Killers:** Detect specific lies, inconsistencies, or behavioral red flags (e.g., "Claimed 5 years Java but stuck on basic OOP").
#         4. **Roadmap:** Specific, actionable steps to bridge the gap between their current performance and their claimed experience level.
#         5. **Per-Question Breakdown:**
#             - "question": Original question.
#             - "user_answer": Their response.
#             - "score": 0-10 rating.
#             - "feedback": Direct critique referencing their claimed level.
#             - "ideal_answer": How a true top-tier professional in {field} would answer.

#         **SPECIAL CONDITION:**
#         If the input answers seem to be completely random text, spam, or not an interview, set the score to 0 and the summary to: "INVALID INPUT: Please upload a valid resume and conduct a proper interview session."

#         CRITICAL JSON FORMATTING RULES:
#         - Output ONLY valid JSON.
#         - **ESCAPE ALL BACKSLASHES:** If you write code with '\\n', you MUST write it as '\\\\n'. 
#         - Do not include any text before or after the JSON.

#         OUTPUT FORMAT (JSON ONLY):
#         {{
#             "score": <number>,
#             "summary": "<executive_summary_string>",
#             "silent_killers": ["<flag_1>", "<flag_2>"],
#             "roadmap": "<step_by_step_improvement_plan>",
#             "question_reviews": [
#                 {{
#                     "question": "...",
#                     "user_answer": "...",
#                     "score": 8,
#                     "feedback": "...",
#                     "ideal_answer": "..."
#                 }}
#             ]
#         }}
#         """

#         raw_text = generate_with_failover(prompt)
#         cleaned_text = clean_json_string(raw_text)
        
#         # --- 7-LAYER PARSING DEFENSE ---
#         try:
#             # Layer 3: Standard Parsing
#             evaluation_result = json.loads(cleaned_text)
#             evaluation_result["topic"] = field
#             return evaluation_result
            
#         except json.JSONDecodeError:
#             print("⚠️ Layer 3 Failed. Attempting Layer 4 (Regex Fixes)...")
#             # Layer 4: Fix common trailing commas/syntax errors
#             repaired_text = re.sub(r',\s*([\]}])', r'\1', cleaned_text)
#             try:
#                 evaluation_result = json.loads(repaired_text)
#                 evaluation_result["topic"] = field
#                 return evaluation_result
#             except json.JSONDecodeError:
#                 print("⚠️ Layer 4 Failed. Attempting Layer 5 (Escape Repair)...")
#                 # Layer 5: Fix single backslashes that are NOT part of a valid escape
#                 repaired_text = re.sub(r'\\(?![/\\bfnrtu"])', r'\\\\', cleaned_text)
#                 try:
#                     evaluation_result = json.loads(repaired_text)
#                     evaluation_result["topic"] = field
#                     return evaluation_result
#                 except json.JSONDecodeError:
#                     print("⚠️ Layer 5 Failed. Attempting Layer 6 (Nuclear Sanitization)...")
#                     # Layer 6: Nuclear Option
#                     # Aggressively double-escape backslashes and sanitize newlines
#                     nuclear_text = cleaned_text.replace('\\', '\\\\')
#                     # Sanitize newlines that might be breaking the JSON structure
#                     nuclear_text = nuclear_text.replace('\n', ' ') 
#                     try:
#                         evaluation_result = json.loads(nuclear_text)
#                         evaluation_result["topic"] = field
#                         return evaluation_result
#                     except:
#                         print("❌ LAYERS 3-6 FAILED. DEPLOYING LAYER 7 (FAILSAFE).")
#                         # Layer 7: Failsafe Structure (The Safety Net)
#                         # Construct a valid object manually so the app NEVER crashes
                        
#                         # Attempt to extract score via regex if possible
#                         score_match = re.search(r'"score":\s*(\d+)', cleaned_text)
#                         fallback_score = int(score_match.group(1)) if score_match else 0
                        
#                         # Attempt to extract summary via regex
#                         summary_match = re.search(r'"summary":\s*"(.*?)"', cleaned_text)
#                         fallback_summary = summary_match.group(1) if summary_match else "Analysis partially failed due to complex formatting. However, we recorded your session."

#                         return {
#                             "topic": field,
#                             "score": fallback_score,
#                             "summary": fallback_summary + " (Note: Detailed AI analysis was truncated due to formatting issues, but your core metrics are preserved.)",
#                             "silent_killers": ["Complex Output Formatting", "AI Syntax Error"],
#                             "roadmap": "Please try again with shorter answers to ensure simpler processing.",
#                             "question_reviews": []
#                         }

#     except Exception as e:
#         print(f"❌ RESUME AUDIT CRASHED: {e}")
#         traceback.print_exc()
#         # Fallback to Layer 7 logic even in outer exception
#         return {
#             "topic": field,
#             "score": 0,
#             "summary": "System Error: The AI analysis could not be completed.",
#             "silent_killers": ["System Crash"],
#             "roadmap": "Contact support or retry.",
#             "question_reviews": []
#         }

# # ==============================================================================
# # ENGINE 3: SESSION LOG MANAGER (Disqualified/Active/Storage)
# # ==============================================================================

# class SessionLogManager:
#     def __init__(self):
#         # In a real app, this would be a database. 
#         # Here we use an in-memory list for demonstration.
#         self.logs = []

#     def save_session(self, evaluation_data):
#         """
#         Saves the session. handles both PASSED and DISQUALIFIED sessions.
#         """
#         is_disqualified = evaluation_data.get('score', 0) < 40
        
#         log_entry = {
#             "id": str(uuid.uuid4()),
#             "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            
#             # TITLE FIX: Use the 'topic' we added in Step 1. 
#             # If missing, fallback to "General Interview".
#             "title": evaluation_data.get('topic', 'General Interview'), 
            
#             "score": evaluation_data.get('score', 0),
#             "status": "Disqualified" if is_disqualified else "Active",
#             "summary": evaluation_data.get('summary', 'Processing...'),
#             "details": evaluation_data # Store full details for "View"
#         }
        
#         self.logs.insert(0, log_entry) # Add to top of list (Recent)
#         return log_entry

#     def delete_session(self, session_id):
#         """
#         Deletes a session (works for Disqualified or Active).
#         """
#         self.logs = [log for log in self.logs if log['id'] != session_id]
#         return {"status": "success", "message": "Session deleted"}

#     def get_recent_logs(self):
#         """
#         Returns formatted logs for the Frontend UI.
#         """
#         return self.logs

# # Initialize the manager
# log_manager = SessionLogManager()

# # --- EXAMPLE USAGE BLOCK ---
# if __name__ == "__main__":
    
#     # 1. The user uploads a resume and picks a field
#     selected_field = "Chartered Accountancy (CA) & Finance" 
    
#     # Simulate a Resume Text that matches the Template Check
#     # CASE A: A VALID CA Resume (India Context)
#     resume_txt = """
#     EXPERIENCE:
#     Senior Audit Assistant at Deloitte (2020-Present)
#     - Qualified Chartered Accountant (ICAI Membership #123456).
#     - Led statutory audits for listed entities under Ind-AS.
#     - Handled GST compliance and filing of GSTR-9/9C.
#     - Conducted internal audits for manufacturing clients.
#     """

#     print(f"\n--- 1. Generating Questions for Topic: {selected_field} with Resume Data ---")
    
#     # 2. You generate questions (as per your existing code)
#     questions = generate_resume_questions(selected_field, resume_txt, "Senior", 3)
#     print("Generated Questions:", json.dumps(questions, indent=2))
    
#     # If the generator returns the error, we stop here in a real app.
#     # For this script, we proceed to show the evaluator working.
    
#     # 3. (Simulation) User answers questions -> Transcript is created
#     transcript = [
#         {"question": "How do you handle Ind-AS 115 revenue recognition?", "answer": "We identify the contract, performance obligations, and then allocate the transaction price based on standalone selling prices."} 
#     ]

#     print(f"\n--- 2. Evaluating Session ---")
    
#     # 4. RUN EVALUATION (Returns the data with the 'topic' field)
#     evaluation = evaluate_resume_session(transcript, field=selected_field, experience="Senior")
    
#     print(f"\n--- 3. Saving to Session Log ---")
#     # 5. SAVE THE LOG (Automatically handles Disqualified logic)
#     saved_log = log_manager.save_session(evaluation)
#     print(f"Saved Session ID: {saved_log['id']} | Status: {saved_log['status']}")

#     print(f"\n--- 4. Frontend Log Output ---")
#     # 6. DISPLAY RECENT LOGS (What your frontend will see)
#     recent_logs = log_manager.get_recent_logs()
#     print(json.dumps(recent_logs, indent=2))
#-----------------------------------------------------------------------------------------------------------------------------------------------
#---------------------> working perfect 
# import os
# import google.generativeai as genai
# import json
# import itertools
# import random
# import time
# import re
# import traceback
# import uuid
# import hashlib
# import shutil
# from datetime import datetime
# from dotenv import load_dotenv

# # 1. Load Environment Variables
# load_dotenv()

# # 2. Check API Key & Configure Mock Mode
# api_key = os.getenv("GOOGLE_API_KEY")
# is_mock_mode = False

# if not api_key or ("AIzaSy" in api_key and len(api_key) < 10):
#     print("⚠️ SYSTEM STATUS: No valid Google API Key found. Running in SMART SIMULATION MODE.")
#     is_mock_mode = True
# else:
#     genai.configure(api_key=api_key)

# # 3. COMPREHENSIVE MODEL LIST (Round Robin Failover)
# ALL_MODELS = [
#     'models/gemini-2.0-flash',
#     'models/gemini-2.0-flash-001',
#     'models/gemini-flash-latest',
#     'models/gemini-flash-lite-latest',
#     'models/gemini-2.5-flash',
#     'models/gemini-2.5-flash-lite',
#     'models/gemini-robotics-er-1.5-preview',
#     'models/gemini-1.5-flash',
#     'models/gemini-1.5-flash-latest',
#     'models/gemini-1.5-flash-001',
#     'models/gemini-1.5-flash-002',
#     'models/gemini-1.5-flash-8b',
#     'models/gemini-1.5-flash-8b-latest',
#     'models/gemini-1.5-flash-8b-001',
#     'models/gemini-1.5-pro',
#     'models/gemini-1.5-pro-latest',
#     'models/gemini-1.5-pro-001',
#     'models/gemini-1.5-pro-002',
#     'models/gemini-1.0-pro',
#     'models/gemini-1.0-pro-latest',
#     'models/gemini-1.0-pro-001',
#     'models/gemini-pro',
#     'models/gemini-pro-vision',
#     'models/gemini-2.5-flash-preview-09-2025',
#     'models/gemini-2.5-flash-lite-preview-09-2025',
#     'models/gemini-2.5-flash-tts',
#     'models/gemini-2.5-pro',
#     'models/gemini-pro-latest',
#     'models/gemini-3-pro-preview',
#     'models/deep-research-pro-preview-12-2025',
#     'models/gemini-2.0-flash-lite',
#     'models/gemini-2.0-flash-lite-001',
#     'models/gemini-2.0-flash-lite-preview',
#     'models/gemini-2.0-flash-lite-preview-02-05',
#     'models/gemini-2.0-flash-exp',
#     'models/gemini-exp-1206',
#     'models/gemma-3-27b-it',
#     'models/gemma-3-12b-it',
#     'models/gemma-3-4b-it',
#     'models/gemma-3-1b-it',
#     'models/gemma-3n-e4b-it',
#     'models/gemma-3n-e2b-it',
#     'models/gemma-2-27b-it',
#     'models/gemma-2-9b-it',
#     'models/gemma-2-2b-it',
#     'models/gemini-2.5-flash-native-audio-dialog',
#     'models/nano-banana-pro-preview',
#     'models/aqa'
# ]

# # Create an infinite cycle iterator to loop through models forever
# model_cycle = itertools.cycle(ALL_MODELS)

# def get_next_model():
#     """Returns the next model in the list (Round Robin)."""
#     model_name = next(model_cycle)
#     return model_name

# def sanitize_input_for_prompt(text):
#     """
#     SECURITY LAYER: Neutralizes Prompt Injection attacks.
#     Prevents users from hijacking the system via resume text.
#     """
#     if not isinstance(text, str):
#         return ""
#     # Remove system delimiters and escape quotes to prevent breaking out of f-strings
#     text = text.replace("###", "") \
#                .replace("SYSTEM OVERRIDE", "") \
#                .replace('"""', "'''") \
#                .replace("```", "")
#     return text.strip()

# def clean_json_string(text):
#     """
#     LAYER 2: Surgical JSON Extractor with Control Character Sanitization.
#     Sanitizes AI response to extract JSON and fixes common formatting issues.
#     """
#     try:
#         # 1. Surgical Extraction: Remove markdown code blocks
#         text = re.sub(r'```\w*\n', '', text)
#         text = text.replace("```", "")
        
#         # 2. Extract JSON object or array
#         if text.strip().startswith("{"):
#             match = re.search(r'\{.*\}', text, re.DOTALL)
#             if match: text = match.group(0)
#         elif text.strip().startswith("["):
#             match = re.search(r'\[.*\]', text, re.DOTALL)
#             if match: text = match.group(0)

#         # 3. Control Character Sanitization
#         # Fix unescaped tabs/newlines in code blocks inside JSON
#         text = text.replace('\t', '\\t')
        
#         return text.strip()
#     except:
#         return text

# def generate_with_failover(prompt, max_retries=55):
#     """
#     Tries to generate content with Exponential Backoff + Jitter.
#     """
#     attempts = 0
#     base_delay = 1
    
#     while attempts < max_retries:
#         current_model = get_next_model()
#         print(f"🔄 AI Request Attempt {attempts+1}/{max_retries}: Trying model '{current_model}'...")
        
#         try:
#             model = genai.GenerativeModel(current_model)
#             response = model.generate_content(prompt)
            
#             if not response.text:
#                 raise ValueError("Empty response received")
                
#             print(f"✅ SUCCESS using {current_model}")
#             return response.text
            
#         except Exception as e:
#             print(f"❌ FAILED with {current_model}: {str(e)[:100]}...")
#             attempts += 1
#             # Exponential backoff with jitter to prevent thundering herd
#             sleep_time = min(30, base_delay * (2 ** attempts)) + (random.random() * 0.5)
#             time.sleep(sleep_time)
            
#     raise Exception("All attempted models failed. API connectivity issue or global quota exhaustion.")

# # ==============================================================================
# # ENGINE 0: HISTORY MANAGER (ATOMIC & PERSISTENT)
# # ==============================================================================
# class HistoryManager:
#     """
#     Manages a persistent JSON file to track all questions ever asked.
#     Uses ATOMIC WRITES to prevent file corruption during crashes.
#     """
#     def __init__(self, filename="question_history.json"):
#         self.filename = filename
#         self.history = self._load_history()

#     def _load_history(self):
#         if not os.path.exists(self.filename):
#             return {"questions": []}
#         try:
#             with open(self.filename, 'r') as f:
#                 return json.load(f)
#         except:
#             return {"questions": []}

#     def save_question(self, question_text):
#         """Saves a new question using Atomic Write Pattern."""
#         # Normalize: remove special chars, lowercase, strip
#         clean_q = re.sub(r'[^a-zA-Z0-9\s]', '', question_text).lower().strip()
        
#         if clean_q not in self.history["questions"]:
#             self.history["questions"].append(clean_q)
            
#             # ATOMIC WRITE: Write to temp, then rename.
#             # This guarantees the file is never left in a half-written state.
#             temp_file = f"{self.filename}.tmp"
#             try:
#                 with open(temp_file, 'w') as f:
#                     json.dump(self.history, f)
#                 os.replace(temp_file, self.filename)
#             except Exception as e:
#                 print(f"⚠️ Write Error: {e}")
#                 if os.path.exists(temp_file):
#                     os.remove(temp_file)

#     def get_recent_history(self, limit=30):
#         return self.history["questions"][-limit:] if self.history["questions"] else []

#     def is_duplicate(self, question_text):
#         clean_q = re.sub(r'[^a-zA-Z0-9\s]', '', question_text).lower().strip()
#         return clean_q in self.history["questions"]

# # Initialize History Manager
# history_manager = HistoryManager()

# # ==============================================================================
# # ENGINE 1: QUESTION GENERATOR (EXTREME SECURITY EDITION)
# # ==============================================================================

# def generate_resume_questions(topic, resume_text, difficulty="Senior", count=5):
#     """
#     Generates interview questions.
#     INCLUDES: Strict Input Sanitization, Full Prompt Logic & Advanced JSON Repair.
#     """
    
#     # --- 1. STRICT VALIDATION ---
#     if not topic or not isinstance(topic, str) or len(topic.strip()) < 2:
#         return [{"id": 0, "error": "INVALID_INPUT", "question": "Please specify a valid professional field."}]

#     # SANITIZE USER INPUT (Anti-Injection)
#     clean_resume = sanitize_input_for_prompt(resume_text)
#     clean_topic = sanitize_input_for_prompt(topic)

#     has_resume = False
#     if clean_resume and len(clean_resume) > 50:
#         has_resume = True
#     else:
#         print("⚠️ WARNING: No resume text provided. Reverting to GENERIC Database Mode.")

#     if is_mock_mode:
#         return [{"id": 1, "type": "technical", "question": f"Mock Question regarding {clean_topic}."}]

#     unique_seed = random.randint(10000, 99999)
    
#     # --- EXCLUSION LOGIC ---
#     # Fetch recent history to prevent duplicates
#     past_questions = history_manager.get_recent_history(limit=25)
#     exclusion_text = ""
#     if past_questions:
#         exclusion_text = "### EXCLUSION LIST (DO NOT ASK THESE OR SIMILAR VARIATIONS):\n" + "\n".join([f"- {q}" for q in past_questions])

#     # Request extra questions to buffer against duplicates
#     buffer_count = count + 3

#     # --- 2. HYBRID QUERY PROMPT (FULL HIGH-FIDELITY VERSION) ---
#     prompt = f"""
#     ### SYSTEM OVERRIDE
#     - STRICTLY FORBIDDEN: Conversational fillers (e.g., "Here are the questions").
#     - MANDATORY: Output must be RAW JSON only.
#     - ESCAPING RULES: Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).

#     ### SYSTEM ROLE: CHIEF TALENT ARCHITECT, DATABASE ENGINE & RESUME DNA EXPERT
#     *** MODE: HYBRID CROSS-REFERENCE - DATABASE (100,000+ Qs) + FORENSIC TEXT ANALYSIS ***
    
#     CONTEXT: 
#     1. **THE FIELD:** {clean_topic.upper()}
#     2. **THE SOURCE:** A database of 100,000+ verified {difficulty}-level interview questions.
#     3. **THE TARGET:** The Candidate's Resume Text below.
#     4. **THE STANDARD:** You hold the "Golden Standard" templates for every profession. You know that a Doctor's CV is structurally distinct from a Developer's Resume, which is distinct from a Chartered Accountant's Profile.
    
#     {exclusion_text}

#     ### CANDIDATE RESUME TEXT:
#     \"\"\"
#     {clean_resume if has_resume else "NO RESUME TEXT AVAILABLE - USE GENERIC DATABASE"}
#     \"\"\"

#     ### PHASE 1: DNA TEMPLATE CHECK (STRICT INTEGRITY PROTOCOL)
#     Analyze if the provided resume text matches the **structural and semantic DNA** of a {clean_topic} professional.
    
#     **SUPPORTED DOMAINS & EXPECTED DNA:**
#     You must validate against the specific lexicon and regulatory requirements of the following fields:
#     Analyze if the provided resume text matches the **structural and semantic DNA** of a {clean_topic} professional.
        
#     **SUPPORTED DOMAINS & EXPECTED DNA:**
#     1. Software Engineering & Development.
#     2. Data Science & Analytics. 
#     3. Product Management: 
#     4. Civil Engineering.
#     5. Mechanical Engineering.
#     6. Electrical & Electronics Engineering 
#     7. Medical (Doctor/Surgeon). 
#     8. Nursing & Healthcare.
#     9. Pharmacy & Biotech. 
#     10. Chartered Accountancy.
#     11. Investment Banking.
#     12. Marketing & Digital Strategy.
#     13. Human Resources (HR).
#     14. Sales & Business Development.
#     15. Supply Chain & Logistics.
#     16. Corporate Law & Legal.
#     17. Journalism & Media.
#     18. Architecture & Interior Design.
#     19. Teaching & Education.
#     20. Graphic & UI/UX Design.
#     21. Content Writing & Copywriting.
#     22. Hospitality & Hotel Management.
#     23. Aviation & Pilot.
#     24. Social Work & NGO.
#     25. Government & Public Service.

#     **CRITICAL FAILURE CONDITION:**
#     If the resume text is generic, gibberish, or structurally belongs to a completely different profession (e.g., a "Chef" resume uploaded for a "Surgeon" role), you MUST REJECT IT immediately.
    
#     **OUTPUT FOR FAILURE (JSON ONLY):**
#     [{{ "id": 0, "error": "TEMPLATE_MISMATCH", "question": "Resume template not matched. The provided document does not align with the professional standards required for a {clean_topic}." }}]

#     ### PHASE 2: QUESTION GENERATION (Execute Only if Phase 1 Passes)
#     Generate {buffer_count} interview questions. (We generate extra to filter duplicates).
    
#     **QUERY RANDOMIZATION PROTOCOL (STRICT):**
#     - **SEED:** {unique_seed}
#     - **DATABASE SIMULATION:** Access the "Long Tail" of the {clean_topic} question bank. 
#     - **EXCLUSION:** Do NOT select the top 100 most common questions for {clean_topic}. (e.g., If Java, NO "What is OOP?"; If Accounting, NO "What is a Debit?").
#     - **UNIQUENESS:** Select specific, scenario-based edge cases that only a practitioner would know.
    
#     LOGIC PROTOCOL:
#     1. **IF RESUME IS PROVIDED:** - SCAN the text for specific projects, tools, or claims (e.g., "Built X using Y").
#        - QUERY the database for a hard question related to "Y".
#        - **MANDATORY:** Start the question by citing the resume: "You mentioned working on [Project Name]..." or "Your resume claims proficiency in [Tool]..."
#        - **GOAL:** Ruthlessly dissect specific resume claims to isolate the candidate's distinct architectural contribution from collective team velocity, demanding verifiable metrics of impact and ownership. Compel a rigorous defense of historical design decisions against viable alternatives, exposing whether choices were driven by active engineering trade-offs or passive legacy adoption.
       
#     2. **IF RESUME IS MISSING:**
#        - Execute `SELECT * FROM {clean_topic}_questions WHERE difficulty = '{difficulty}' AND is_cliche = FALSE ORDER BY RANDOM(SEED={unique_seed}) LIMIT {buffer_count}`.

#     3. **DIFFICULTY CALIBRATION:**
#        - {difficulty} Level: Construct complex architectural scenarios that strictly enforce trade-off analysis between competing system constraints (e.g., consistency vs. latency) rather than simple definition recall. Prioritize failure mode interrogation, requiring the explicit identification of bottlenecks, race conditions, and cascading effects under high-load conditions. Avoid basic definition questions.

#     ### OUTPUT FORMAT (JSON ONLY):
#     [
#         {{
#             "id": 1,
#             "type": "resume_specific", 
#             "question": "In your 'E-commerce Overhaul' project, you mentioned using microservices. How did you handle distributed transactions and data consistency failures in that specific architecture?" 
#         }}
#     ]
#     """

#     try:
#         raw_text = generate_with_failover(prompt)
#         cleaned_text = clean_json_string(raw_text)
        
#         # --- 7-LAYER PARSING DEFENSE (HARDENED) ---
#         generated_data = []
#         try:
#             # Layer 3: Standard Parsing
#             generated_data = json.loads(cleaned_text)
#         except json.JSONDecodeError:
#             # Layer 4: Fix trailing commas
#             repaired_text = re.sub(r',\s*([\]}])', r'\1', cleaned_text)
#             try:
#                 generated_data = json.loads(repaired_text)
#             except json.JSONDecodeError:
#                 # Layer 5: Fix Single Backslashes (UNICODE AWARE FIX)
#                 # The previous regex failed on \u. This one protects \u, \n, \r, \t, etc.
#                 # It only doubles backslashes that are NOT followed by valid escape chars.
#                 repaired_text = re.sub(r'\\(?![/\\bfnrtu"U])', r'\\\\', cleaned_text)
#                 try:
#                     generated_data = json.loads(repaired_text)
#                 except json.JSONDecodeError:
#                     # Layer 6: Nuclear Option (Sanitized)
#                     nuclear_text = cleaned_text.replace('\\', '\\\\').replace('\n', '\\n')
#                     try:
#                         generated_data = json.loads(nuclear_text)
#                     except:
#                         # Layer 7: Failsafe
#                         return [{"id": 0, "error": "JSON_PARSE_CRASH", "question": "Error generating questions."}]

#         # --- DUPLICATE REMOVAL & HISTORY SAVING ---
#         unique_questions = []
#         for item in generated_data:
#             if "error" in item:
#                 return [item] # Return the error immediately if template mismatch
            
#             q_text = item.get("question", "")
#             if not history_manager.is_duplicate(q_text):
#                 unique_questions.append(item)
#                 # Save to history immediately
#                 history_manager.save_question(q_text)
            
#             if len(unique_questions) >= count:
#                 break
        
#         # If we ran out of unique questions (rare, but possible if buffer was all duplicates)
#         if len(unique_questions) < count:
#             print("⚠️ Warning: Could not generate enough unique questions even with buffer.")
        
#         return unique_questions

#     except Exception as e:
#         print(f"❌ GENERATION ERROR: {e}")
#         return [{"id": 0, "error": "SYSTEM_CRASH", "question": "Critical error."}]

# # ==============================================================================
# # ENGINE 2: RESUME EVALUATOR (FORENSIC AUDITOR)
# # ==============================================================================

# def evaluate_resume_session(transcript_data, field="General", experience="Entry Level"):
#     """
#     THE SUPREME ATS FORENSIC AUDITOR.
#     Generates detailed analysis checking if the candidate matches their Resume Claims.
#     """
#     if not transcript_data or not isinstance(transcript_data, list):
#         return {
#             "topic": field,
#             "score": 0,
#             "summary": "Evaluation Failed: No data.",
#             "silent_killers": ["Missing Data"],
#             "roadmap": "Ensure session is recorded.",
#             "question_reviews": []
#         }

#     if is_mock_mode:
#         return {
#             "topic": field,
#             "score": 72,
#             "summary": "Mock Mode: Simulation active.",
#             "silent_killers": ["Mock Mode"],
#             "roadmap": "Add API Key.",
#             "question_reviews": []
#         }

#     try:
#         transcript_text = json.dumps(transcript_data)
#         clean_field = sanitize_input_for_prompt(field)

#         # SUPREME FORENSIC GAP ANALYSIS PROMPT (FULL RESTORED VERSION)
#         prompt = f"""
#         ### SYSTEM OVERRIDE
#         - STRICTLY FORBIDDEN: Conversational fillers (e.g., "Here is the JSON", "I have generated...").
#         - MANDATORY: Output must be RAW JSON only.
#         - ESCAPING RULES: All backslashes must be double-escaped (\\\\ -> \\\\\\\\). All newlines within strings must be escaped (\\n -> \\\\n).

#         ### ROLE & SYSTEM CONTEXT:
#         ACT AS: The 'Supreme ATS Forensic Auditor' & 'Global Head of Talent Acquisition'.
#         CONTEXT: You are auditing a candidate who claims to be an expert in **{clean_field.upper()}** with **{experience.upper()}** experience.
#         CAPABILITIES: You possess 100% mastery of top 50 Professional Domains (Engineering, Medical, Finance, Law, etc.) and deep behavioral psychology.
        
#         **PROFESSIONAL STANDARDS KNOWLEDGE (TEMPLATE INTEGRITY):**
#         You know exactly how a {clean_field} expert speaks. 
#         - A Doctor discusses patient outcomes, protocols, and pathology (not just "fixing people").
#         - A Chartered Accountant (CA) discusses compliance, sections of the act, and financial risk (not just "doing math").
#         - An Engineer discusses scalability, complexity, and trade-offs (not just "writing code").
#         - A Pilot discusses checklists, meteorology, and specific aircraft systems.
        
#         TASK: Conduct a ruthless "Resume Verification Analysis" of the following interview transcript.

#         ### TRANSCRIPT DATA:
#         {transcript_text}

#         ### ANALYSIS PROTOCOL (The "Audit"):
#         For every answer, perform a "Claim vs. Reality" check:
#         1. **Domain DNA Verification:** Does the candidate use the correct terminology for {clean_field}? (e.g., A Doctor knows 'triage', a Dev knows 'CI/CD', a Pilot knows 'METAR'). If they use generic terms instead of industry-standard lexicon, penalize heavily.
#         2. **Experience Verification:** Does the depth match {experience}? 
#            - Entry Level: Should know 'how' and basic definitions.
#            - Senior Level: Should know 'why', 'trade-offs', 'edge cases', and 'system impact'.
#         3. **Red Flag Detection (Lying):** Identify vague answers ("I handled everything") that suggest "Resume Padding" or lying about skills.
#         4. **Valid Resume Check:** If the answers are total gibberish or completely unrelated to {clean_field}, flag it immediately.

#         ### SCORING CRITERIA (Strict):
#         - **90-100 (Hired):** Exceptional. Demonstrates deep, practical expertise matching the resume claims perfectly. Matches the professional template perfectly.
#         - **70-89 (Strong):** Good. Minor gaps but generally truthful and competent.
#         - **40-69 (Weak):** Inconsistent. Struggles with concepts expected at this level. Requires significant training.
#         - **0-39 (Fraud/Mismatch):** Imposter. Answers contradict the resume claims, contradict the professional standards of {clean_field}, or show fundamental lack of knowledge.

#         REQUIREMENTS:
#         1. **Resume Strength Score (0-100):** Be strict.
#         2. **Executive Summary:** A concise verdict on their hireability. 
#            - **STRICT CONSTRAINT:** ATTENTION, Do NOT use the phrase **like** "Please upload a valid resume and conduct a proper interview session".
#            - **MANDATORY:** Always append 2-5 lines of specific, high-value improvement advice based on the interview performance, even if the candidate is excellent. This advice must be unique and different every time.
#         3. **Silent Killers:** Detect specific lies, inconsistencies, or behavioral red flags (e.g., "Claimed 5 years Java but stuck on basic OOP").
#         4. **Roadmap:** Specific, actionable steps to bridge the gap between their current performance and their claimed experience level.
#         5. **Per-Question Breakdown:**
#             - "question": Original question.
#             - "user_answer": Their response.
#             - "score": 0-10 rating.
#             - "feedback": Direct critique referencing their claimed level.
#             - "ideal_answer": How a true top-tier professional in {clean_field} would answer.

#         **SPECIAL CONDITION:**
#         If the input answers seem to be completely random text, spam, or not an interview, set the score to 0 and the summary to: "INVALID INPUT: Please upload a valid resume and conduct a proper interview session."

#         CRITICAL JSON FORMATTING RULES:
#         - Output ONLY valid JSON.
#         - **ESCAPE ALL BACKSLASHES:** If you write code with '\\n', you MUST write it as '\\\\n'. 
#         - Do not include any text before or after the JSON.

#         OUTPUT FORMAT (JSON ONLY):
#         {{
#             "score": <number>,
#             "summary": "<executive_summary_string>",
#             "silent_killers": ["<flag_1>", "<flag_2>"],
#             "roadmap": "<step_by_step_improvement_plan>",
#             "question_reviews": [
#                 {{
#                     "question": "...",
#                     "user_answer": "...",
#                     "score": 8,
#                     "feedback": "...",
#                     "ideal_answer": "..."
#                 }}
#             ]
#         }}
#         """

#         raw_text = generate_with_failover(prompt)
#         cleaned_text = clean_json_string(raw_text)
        
#         try:
#             result = json.loads(cleaned_text)
#             result["topic"] = clean_field
#             return result
#         except:
#             # Re-using the hardened regex repair from above
#             repaired_text = re.sub(r'\\(?![/\\bfnrtu"U])', r'\\\\', cleaned_text)
#             try:
#                 result = json.loads(repaired_text)
#                 result["topic"] = clean_field
#                 return result
#             except:
#                  # Fallback extraction logic
#                 score_match = re.search(r'"score":\s*(\d+)', cleaned_text)
#                 fallback_score = int(score_match.group(1)) if score_match else 0
#                 return {
#                     "topic": clean_field,
#                     "score": fallback_score,
#                     "summary": "Analysis truncated due to formatting.",
#                     "silent_killers": ["Formatting Error"],
#                     "roadmap": "Retry with simpler answers.",
#                     "question_reviews": []
#                 }

#     except Exception as e:
#         print(f"❌ AUDIT ERROR: {e}")
#         return {
#             "topic": field,
#             "score": 0,
#             "summary": "System Error.",
#             "silent_killers": ["System Crash"],
#             "roadmap": "Contact support.",
#             "question_reviews": []
#         }

# # ==============================================================================
# # ENGINE 3: SESSION LOG MANAGER
# # ==============================================================================

# class SessionLogManager:
#     def __init__(self):
#         self.logs = []

#     def save_session(self, evaluation_data):
#         is_disqualified = evaluation_data.get('score', 0) < 40
        
#         log_entry = {
#             "id": str(uuid.uuid4()),
#             "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
#             "title": evaluation_data.get('topic', 'General Interview'), 
#             "score": evaluation_data.get('score', 0),
#             "status": "Disqualified" if is_disqualified else "Active",
#             "summary": evaluation_data.get('summary', 'Processing...'),
#             "details": evaluation_data 
#         }
        
#         self.logs.insert(0, log_entry)
#         return log_entry

#     def delete_session(self, session_id):
#         self.logs = [log for log in self.logs if log['id'] != session_id]
#         return {"status": "success", "message": "Session deleted"}

#     def get_recent_logs(self):
#         return self.logs

# log_manager = SessionLogManager()

# # --- MAIN EXECUTION ---
# if __name__ == "__main__":
    
#     # 1. Setup
#     selected_field = "Chartered Accountancy (CA) & Finance" 
    
#     resume_txt = """
#     EXPERIENCE:
#     Senior Audit Assistant at Deloitte (2020-Present)
#     - Qualified Chartered Accountant (ICAI Membership #123456).
#     - Led statutory audits for listed entities under Ind-AS.
#     - Handled GST compliance and filing of GSTR-9/9C.
#     - Conducted internal audits for manufacturing clients.
#     """

#     print(f"\n--- 1. Generating Questions (Secured) ---")
#     questions = generate_resume_questions(selected_field, resume_txt, "Senior", 3)
#     print("Generated:", json.dumps(questions, indent=2))
    
#     transcript = [
#         {"question": "How do you handle Ind-AS 115?", "answer": "Identify contract, obligations, allocate price."} 
#     ]

#     print(f"\n--- 2. Evaluating Session ---")
#     evaluation = evaluate_resume_session(transcript, field=selected_field, experience="Senior")
    
#     print(f"\n--- 3. Saving Log ---")
#     saved_log = log_manager.save_session(evaluation)
#     print(f"Saved ID: {saved_log['id']} | Status: {saved_log['status']}")
#-------------------------------------------------------------------------------------------------------------------------------------------------------------
# import os
# import google.generativeai as genai
# import json
# import itertools
# import random
# import time
# import re
# import traceback
# import uuid
# import hashlib
# import shutil
# from datetime import datetime
# from dotenv import load_dotenv

# # 1. Load Environment Variables
# load_dotenv()

# # 2. Check API Key & Configure Mock Mode
# api_key = os.getenv("GOOGLE_API_KEY")
# is_mock_mode = False

# if not api_key or ("AIzaSy" in api_key and len(api_key) < 10):
#     print("⚠️ SYSTEM STATUS: No valid Google API Key found. Running in SMART SIMULATION MODE.")
#     is_mock_mode = True
# else:
#     genai.configure(api_key=api_key)

# # 3. COMPREHENSIVE MODEL LIST (Round Robin Failover)
# ALL_MODELS = [
#     # Gemini 3 Series (Preview),
#     'models/gemini-3-flash-preview',
#     # Gemini 2.5 Pro & Flash (newest stable)
#     'models/gemini-2.5-pro',
#     'models/gemini-2.5-flash',
#     'models/gemini-2.5-flash-lite',

#     # Gemini 2.0 Flash stable
#     'models/gemini-2.0-flash',
#     'models/gemini-2.0-flash-001',
#     'models/gemini-2.0-flash-lite',
#     'models/gemini-2.0-flash-lite-001',

#     # Gemini 1.5 Pro stable
#     'models/gemini-1.5-pro',
#     'models/gemini-1.5-pro-latest',
#     'models/gemini-1.5-pro-001',
#     'models/gemini-1.5-pro-002',

#     # Gemini 1.5 Flash stable
#     'models/gemini-1.5-flash',
#     'models/gemini-1.5-flash-latest',
#     'models/gemini-1.5-flash-001',
#     'models/gemini-1.5-flash-002',

#     # Gemini 1.5 Flash 8B stable
#     'models/gemini-1.5-flash-8b',
#     'models/gemini-1.5-flash-8b-latest',
#     'models/gemini-1.5-flash-8b-001',

#     # Latest aliases (always working)
#     'models/gemini-flash-latest',
#     'models/gemini-flash-lite-latest',
#     'models/gemini-pro-latest',

#     # Gemma models (fully working text models)
#     'models/gemma-3-27b-it',
#     'models/gemma-3-12b-it',
#     'models/gemma-3-4b-it',
#     'models/gemma-3-1b-it',
#     'models/gemma-3n-e4b-it',
#     'models/gemma-3n-e2b-it',

#     'models/gemma-2-27b-it',
#     'models/gemma-2-9b-it',
#     'models/gemma-2-2b-it',
    
#     # Robotics model (not text generation)
#     'models/gemini-robotics-er-1.5-preview',


#     # Gemini 3 preview (works but limited access)
#     'models/gemini-3-pro-preview',

#     # Deep research (restricted but works)
#     'models/deep-research-pro-preview-12-2025',

#     # Experimental models (working but unstable)
#     'models/gemini-2.0-flash-exp',
#     'models/gemini-exp-1206',

#     # Preview lite models
#     'models/gemini-2.0-flash-lite-preview',
#     'models/gemini-2.0-flash-lite-preview-02-05',

#     # Preview flash models
#     'models/gemini-2.5-flash-preview-09-2025',
#     'models/gemini-2.5-flash-lite-preview-09-2025',


#     # Old legacy models (deprecated or restricted)
#     'models/gemini-pro-latest',
#     'models/gemini-1.0-pro-001',

#     'models/gemini-pro',
#     'models/gemini-pro-vision',

#     # Audio only model
#     'models/gemini-2.5-flash-native-audio-dialog',

#     # TTS only model
#     'models/gemini-2.5-flash-tts',

#     # Internal / restricted
#     'models/nano-banana-pro-preview',

#     # Not usable model
#     'models/aqa',
# ]

# # Create an infinite cycle iterator to loop through models forever
# model_cycle = itertools.cycle(ALL_MODELS)

# def get_next_model():
#     """Returns the next model in the list (Round Robin)."""
#     model_name = next(model_cycle)
#     return model_name

# def sanitize_input_for_prompt(text, max_chars=20000):
#     """
#     SECURITY LAYER: Neutralizes Prompt Injection & Enforces Token Limits.
#     """
#     if not isinstance(text, str):
#         return ""
        
#     # 1. Truncate to prevent Token Limit Errors (Safety Fix)
#     if len(text) > max_chars:
#         text = text[:max_chars] + "... [TRUNCATED]"
        
#     # 2. Remove system delimiters
#     text = text.replace("###", "") \
#                .replace("SYSTEM OVERRIDE", "") \
#                .replace('"""', "'''") \
#                .replace("```", "")
               
#     return text.strip()

# def clean_json_string(text):
#     """
#     LAYER 2: Surgical JSON Extractor with Control Character Sanitization.
#     Sanitizes AI response to extract JSON and fixes common formatting issues.
#     """
#     try:
#         # 1. Surgical Extraction: Remove markdown code blocks
#         text = re.sub(r'```\w*\n', '', text)
#         text = text.replace("```", "")
        
#         # 2. Extract JSON object or array
#         if text.strip().startswith("{"):
#             match = re.search(r'\{.*\}', text, re.DOTALL)
#             if match: text = match.group(0)
#         elif text.strip().startswith("["):
#             match = re.search(r'\[.*\]', text, re.DOTALL)
#             if match: text = match.group(0)

#         # 3. Control Character Sanitization
#         # Fix unescaped tabs/newlines in code blocks inside JSON
#         text = text.replace('\t', '\\t')
        
#         return text.strip()
#     except:
#         return text

# def generate_with_failover(prompt, max_retries=55):
#     """
#     Tries to generate content with Exponential Backoff + Jitter.
#     INCLUDES: Infinite Loop Guard (Timeout Protection).
#     """
#     attempts = 0
#     base_delay = 1
#     start_time = time.time()
#     TIMEOUT_SECONDS = 180  # 3 Minute Hard Limit to prevent infinite spinning
    
#     while attempts < max_retries:
#         # --- INFINITE LOOP GUARD ---
#         if time.time() - start_time > TIMEOUT_SECONDS:
#              print("⚠️ SYSTEM HALT: Infinite Loop Guard triggered (Timeout). Stopping retries.")
#              break
        
#         current_model = get_next_model()
#         print(f"🔄 AI Request Attempt {attempts+1}/{max_retries}: Trying model '{current_model}'...")
        
#         try:
#             model = genai.GenerativeModel(current_model)
#             response = model.generate_content(prompt)
            
#             if not response.text:
#                 raise ValueError("Empty response received")
                
#             print(f"✅ SUCCESS using {current_model}")
#             return response.text
            
#         except Exception as e:
#             print(f"❌ FAILED with {current_model}: {str(e)[:100]}...")
#             attempts += 1
            
#             # Exponential backoff with jitter to prevent thundering herd
#             sleep_time = min(30, base_delay * (2 ** attempts)) + (random.random() * 0.5)
#             time.sleep(sleep_time)
            
#     raise Exception("All attempted models failed. API connectivity issue or global quota exhaustion.")
# # ==============================================================================
# # ENGINE 0: HISTORY MANAGER (ATOMIC & PERSISTENT)
# # ==============================================================================
# class HistoryManager:
#     """
#     Manages a persistent JSON file to track all questions ever asked.
#     Uses ATOMIC WRITES to prevent file corruption during crashes.
#     """
#     def __init__(self, filename="question_history.json"):
#         self.filename = filename
#         self.history = self._load_history()

#     def _load_history(self):
#         if not os.path.exists(self.filename):
#             return {"questions": []}
#         try:
#             with open(self.filename, 'r') as f:
#                 return json.load(f)
#         except:
#             return {"questions": []}

#     def save_question(self, question_text):
#         """Saves a new question using Atomic Write Pattern."""
#         # Normalize: remove special chars, lowercase, strip
#         clean_q = re.sub(r'[^a-zA-Z0-9\s]', '', question_text).lower().strip()
        
#         if clean_q not in self.history["questions"]:
#             self.history["questions"].append(clean_q)
            
#             # ATOMIC WRITE: Write to temp, then rename.
#             # This guarantees the file is never left in a half-written state.
#             temp_file = f"{self.filename}.tmp"
#             try:
#                 with open(temp_file, 'w') as f:
#                     json.dump(self.history, f)
#                 os.replace(temp_file, self.filename)
#             except Exception as e:
#                 print(f"⚠️ Write Error: {e}")
#                 if os.path.exists(temp_file):
#                     os.remove(temp_file)

#     def get_recent_history(self, limit=30):
#         return self.history["questions"][-limit:] if self.history["questions"] else []

#     def is_duplicate(self, question_text):
#         clean_q = re.sub(r'[^a-zA-Z0-9\s]', '', question_text).lower().strip()
#         return clean_q in self.history["questions"]

# # Initialize History Manager
# history_manager = HistoryManager()

# # ==============================================================================
# # ENGINE 1: QUESTION GENERATOR (SUPREME: 100K DB + RANDOMIZATION + STRICT JSON)
# # ==============================================================================

# def generate_resume_questions(topic, resume_text, difficulty="Expert", count=5):
#     """
#     THE 'SUPREME' GENERATOR.
#     FEATURES:
#     1. 100k+ Database Simulation (The "Long Tail").
#     2. QUERY RANDOMIZATION PROTOCOL (Pseudo-SQL Injection for Entropy).
#     3. Bob's Forensic "Paper Tiger" Analysis.
#     4. STRICT FORMATTING GUARD (No fillers, strict JSON).
#     """
    
#     # --- 1. STRICT VALIDATION ---
#     if not topic or not isinstance(topic, str) or len(topic.strip()) < 2:
#         return [{"id": 0, "error": "INVALID_INPUT", "question": "Please specify a valid professional field."}]

#     # SANITIZE
#     clean_resume = sanitize_input_for_prompt(resume_text)
#     clean_topic = sanitize_input_for_prompt(topic)

#     has_resume = False
#     if clean_resume and len(clean_resume) > 50:
#         has_resume = True
#     else:
#         print("⚠️ WARNING: No resume text provided. Reverting to 'Supreme' Database Mode.")

#     if is_mock_mode:
#         return [{"id": 1, "type": "technical", "question": f"Mock Supreme Question for {clean_topic}."}]

#     unique_seed = random.randint(10000, 99999)
    
#     # --- EXCLUSION LOGIC ---
#     past_questions = history_manager.get_recent_history(limit=25)
#     exclusion_text = ""
#     if past_questions:
#         exclusion_text = "### EXCLUSION LIST (DO NOT ASK THESE OR SIMILAR VARIATIONS):\n" + "\n".join([f"- {q}" for q in past_questions])

#     buffer_count = count + 3

#     # --- THE SUPREME PROMPT (ALL PROTOCOLS MERGED) ---
#     prompt = f"""
#     ### SYSTEM OVERRIDE: SUPREME ARCHITECT MODE
#     - **STRICTLY FORBIDDEN:** Conversational fillers (e.g., "Here are the questions").
#     - **MANDATORY:** Output must be RAW JSON only.
#     - **ESCAPING RULES:** Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).
    
#     - **IDENTITY:** You are the 'Chief Talent Architect' AND 'Bob' (The Elite Forensic Auditor).
#     - **DATABASE ACCESS:** You have direct access to a simulated **Global Interview Database of 100,000+ Verified Questions** across 25+ domains.
#     - **METHOD:** You perform 'Resume DNA Analysis' combined with 'Forensic Text Interrogation'.
#     - **GOAL:** 90%+ Difficulty. Top 1% Hiring Standard.

#     ### CONTEXT & SIMULATION PARAMETERS:
#     1. **THE FIELD:** {clean_topic.upper()}
#     2. **THE SOURCE:** A simulated database of 100,000+ verified {difficulty}-level interview questions.
#     3. **THE STANDARD:** You know that a Doctor's CV is structurally distinct from a Developer's Resume. You must validate the "Professional DNA".

#     {exclusion_text}

#     ### CANDIDATE RESUME TEXT:
#     \"\"\"
#     {clean_resume if has_resume else "NO RESUME TEXT AVAILABLE - USE ELITE GENERIC DATABASE"}
#     \"\"\"

#     ### PHASE 1: FORENSIC DNA & TEMPLATE CHECK
#     Analyze if the resume matches the **structural and semantic DNA** of a {clean_topic} professional.
#     **SUPPORTED DNA DOMAINS:**
#     - Software Engineering (Scalability, Trade-offs)
#     - Medical/Doctor (Pathology, Protocol)
#     - Chartered Accountancy (Compliance, Risk)
#     - Civil/Mech Engineering (Safety, Physics)
#     - Law, HR, Sales, Aviation, & Government.

#     **FAILURE CONDITION:**
#     If the resume is generic gibberish or belongs to a wrong profession (e.g., Chef resume for Pilot role), REJECT IT.
#     Output: [{{ "id": 0, "error": "TEMPLATE_MISMATCH", "question": "Resume template not matched." }}]

#     ### PHASE 2: RESUME AUTOPSY (BOB'S PAPER TIGER SCAN)
#     (Execute only if Phase 1 passes). Scan for buzzwords without depth ("Paper Tigers"):
#     - **Microservices?** Ask about *Distributed Tracing & Saga Patterns*.
#     - **Management?** Ask about *Handling Toxic High-Performers*.
#     - **Audit?** Ask about *Detecting Fraud in seemingly perfect books*.

#     ### PHASE 3: QUERY RANDOMIZATION PROTOCOL (MANDATORY)
#     You must simulate a Random SQL Retrieval to ensure high entropy and avoid cliches.
    
#     **EXECUTE THE FOLLOWING SIMULATION LOGIC:**
#     1. **SET SEED:** {unique_seed}
#     2. **ACCESS TABLE:** `{clean_topic}_QuestionBank` (Size: 100,000+ Rows)
#     3. **FILTER:** `WHERE Difficulty = '{difficulty}' AND Type = 'Scenario_Based' AND Is_Cliche = FALSE`
#     4. **RANDOMIZE:** `ORDER BY RANDOM(SEED={unique_seed})`
#     5. **LIMIT:** {buffer_count}

#     **CRITICAL CONSTRAINT:** - Do NOT select the top 100 most common questions for {clean_topic}. (e.g., NO "What is OOP?", NO "What is a Debit?").
#     - Select specific, scenario-based edge cases that only a practitioner would know.

#     ### PHASE 4: QUESTION REFINEMENT (90%+ QUALITY)
#     Refine the selected questions using Bob's "Brutal Difficulty" rules:
#     1. **Disaster Scenarios:** Ask "Here is a disaster involving X, how do you fix it?"
#     2. **Trade-Offs:** Force a choice between two bad options (Latency vs Consistency, Speed vs Safety).
#     3. **Resume Specificity:** Start with: "Your resume claims [Project X]..." or "You listed [Tool Y]..."

#     ### OUTPUT FORMAT (JSON ONLY):
#     [
#         {{
#             "id": 1,
#             "type": "resume_specific", 
#             "question": "Referring to your 'Cloud Migration' project: You moved from On-Prem to AWS. If your specific latency requirements were <5ms but the new cloud load balancer added 10ms overhead, how did you re-architect the network layer to solve this without abandoning the cloud?" 
#         }}
#     ]
#     """

#     try:
#         raw_text = generate_with_failover(prompt)
#         cleaned_text = clean_json_string(raw_text)
        
#         # --- 7-LAYER PARSING DEFENSE (HARDENED) ---
#         generated_data = []
#         try:
#             # Layer 3: Standard Parsing
#             generated_data = json.loads(cleaned_text)
#         except json.JSONDecodeError:
#             # Layer 4: Fix trailing commas
#             repaired_text = re.sub(r',\s*([\]}])', r'\1', cleaned_text)
#             try:
#                 generated_data = json.loads(repaired_text)
#             except json.JSONDecodeError:
#                 # Layer 5: Fix Single Backslashes (UNICODE AWARE FIX)
#                 repaired_text = re.sub(r'\\(?![/\\bfnrtu"U])', r'\\\\', cleaned_text)
#                 try:
#                     generated_data = json.loads(repaired_text)
#                 except:
#                      # Layer 6: Nuclear Option (Sanitized)
#                      nuclear_text = cleaned_text.replace('\\', '\\\\').replace('\n', '\\n')
#                      try:
#                         generated_data = json.loads(nuclear_text)
#                      except:
#                         # Layer 7: Failsafe
#                         return [{"id": 0, "error": "JSON_PARSE_CRASH", "question": "Error generating questions."}]

#         # --- DUPLICATE REMOVAL & HISTORY SAVING ---
#         unique_questions = []
#         for item in generated_data:
#             if "error" in item: return [item]
            
#             q_text = item.get("question", "")
#             if not history_manager.is_duplicate(q_text):
#                 unique_questions.append(item)
#                 history_manager.save_question(q_text)
            
#             if len(unique_questions) >= count:
#                 break
        
#         if len(unique_questions) < count:
#             print("⚠️ Warning: Could not generate enough unique questions.")
        
#         return unique_questions

#     except Exception as e:
#         print(f"❌ GENERATION ERROR: {e}")
#         return [{"id": 0, "error": "SYSTEM_CRASH", "question": "Critical error."}]

# # ==============================================================================
# # ENGINE 2: RESUME EVALUATOR (SUPREME MERGE: FORENSIC RIGOR + BOB DETAIL)
# # ==============================================================================

# def evaluate_resume_session(transcript_data, field="General", experience="Entry Level"):
#     """
#     THE 'SUPREME' AUDITOR.
#     MERGES:
#     1. 'Forensic' Rigor (DNA Checks, Claim Verification, Strict Scoring).
#     2. 'Bob' Detail (Paragraph-length feedback, high data density).
#     3. NO FORCED SCORE: The AI grades based on actual merit (0-100).
#     """
#     if not transcript_data or not isinstance(transcript_data, list):
#         return {
#             "topic": field,
#             "score": 0, 
#             "summary": "Evaluation Failed: No session data provided.",
#             "silent_killers": ["Missing Data"],
#             "roadmap": "Ensure session is recorded.",
#             "question_reviews": []
#         }

#     if is_mock_mode:
#         return {
#             "topic": field,
#             "score": 85,
#             "summary": "Mock Mode: Simulation active. Candidate showed strong potential.",
#             "silent_killers": ["Mock Mode Active"],
#             "roadmap": "Deploy to production.",
#             "question_reviews": []
#         }

#     try:
#         transcript_text = json.dumps(transcript_data)
#         clean_field = sanitize_input_for_prompt(field)

#         # --- THE SUPREME MERGED PROMPT (FORENSIC + BOB + STRICT SCORING) ---
#         prompt = f"""
#         ### SYSTEM OVERRIDE: SUPREME AUDITOR MODE
#         - **STRICTLY FORBIDDEN:** Conversational fillers.
#         - **MANDATORY:** Output must be RAW JSON only.
#         - **ESCAPING RULES:** Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).

#         ### ROLE: CHIEF TALENT ARCHITECT & SUPREME FORENSIC AUDITOR (CODE NAME: BOB)
#         - **CONTEXT:** You are the Global Head of Talent Acquisition with 100% mastery of 50+ Professional Domains (Engineering, Medical, Finance, Law, etc.).
#         - **TASK:** Conduct a ruthless "Resume Verification Analysis" & "Forensic Audit" of the candidate.
#         - **DIRECTIVE:** Provide MAXIMUM DATA DENSITY. Do not summarize; expand on every detail with paragraph-length forensic insights.

#         ### TRANSCRIPT DATA:
#         {transcript_text}

#         ### PHASE 1: FORENSIC DNA & TEMPLATE INTEGRITY CHECK
#         Analyze if the candidate's answers match the **structural and semantic DNA** of a {clean_field} professional.
#         - **Lexicon Verification:** Does a Doctor use 'Triage'? Does a Dev use 'CI/CD'? Does a Pilot use 'METAR'?
#         - **Experience Verification:** Does the depth match {experience}? (Entry = 'How', Senior = 'Why/Trade-offs').
#         - **Fraud Detection:** Identify vague answers ("I handled everything") that suggest Resume Padding.

#         ### PHASE 2: THE "BOB" DEEP DIVE (HIGH DETAIL PROTOCOL)
#         For every answer, perform a "Claim vs. Reality" Check:
#         1. **Deep Dive Analysis:** Write a PARAGRAPH (not a sentence) explaining exactly *why* the answer was strong or weak.
#         2. **Technical Nuance:** Even if the answer is good, add "Expert Level Nuance" to show what a Top 1% answer would look like.
#         3. **Benefit of Doubt vs. Rigor:** Be generous in interpretation but strict in scoring.

#         ### PHASE 3: SCORING CRITERIA (STRICT & MERIT-BASED)
#         Do NOT inflate the score. Judge honestly based on the "Golden Standard":
#         - **90-100 (Hired):** Exceptional. Perfect domain lexicon. Senior-level trade-off analysis.
#         - **70-89 (Strong):** Good. Minor gaps but generally truthful and competent.
#         - **40-69 (Weak):** Inconsistent. Struggles with concepts expected at this level.
#         - **0-39 (Fraud/Mismatch):** Imposter. Answers contradict the resume or professional standards.

#         ### OUTPUT REQUIREMENTS (JSON):
#         1. **score:** (Integer 0-100). Be strict.
#         2. **summary:** A detailed forensic executive summary (60-80 words). Verdict on hireability.
#         3. **silent_killers:** List 2-3 specific behavioral or technical red flags (e.g., "Claimed 5 years Java but stuck on basic OOP").
#         4. **roadmap:** A specific, actionable 3-step plan to bridge the gap to the next level.
#         5. **question_reviews:** - "feedback": A detailed technical paragraph (5-6 sentences).
#            - "ideal_answer": The textbook-perfect response using industry-standard jargon.

#         OUTPUT FORMAT (JSON ONLY):
#         {{
#             "score": <number>,
#             "summary": "...",
#             "silent_killers": ["..."],
#             "roadmap": "...",
#             "question_reviews": [
#                 {{
#                     "question": "...",
#                     "user_answer": "...",
#                     "score": 8,
#                     "feedback": "...",
#                     "ideal_answer": "..."
#                 }}
#             ]
#         }}
#         """

#         raw_text = generate_with_failover(prompt)
#         cleaned_text = clean_json_string(raw_text)
        
#         # --- 7-LAYER PARSING DEFENSE (HARDENED) ---
#         generated_data = {}
#         try:
#             # Layer 3: Standard Parsing
#             generated_data = json.loads(cleaned_text)
#         except json.JSONDecodeError:
#             # Layer 4: Fix trailing commas
#             repaired_text = re.sub(r',\s*([\]}])', r'\1', cleaned_text)
#             try:
#                 generated_data = json.loads(repaired_text)
#             except json.JSONDecodeError:
#                 # Layer 5: Fix Single Backslashes (UNICODE AWARE FIX)
#                 repaired_text = re.sub(r'\\(?![/\\bfnrtu"U])', r'\\\\', cleaned_text)
#                 try:
#                     generated_data = json.loads(repaired_text)
#                 except:
#                      # Layer 6: Nuclear Option (Sanitized)
#                      nuclear_text = cleaned_text.replace('\\', '\\\\').replace('\n', '\\n')
#                      try:
#                         generated_data = json.loads(nuclear_text)
#                      except:
#                         # Layer 7: Failsafe
#                         return {
#                             "topic": clean_field,
#                             "score": 0,
#                             "summary": "Analysis truncated due to formatting error.",
#                             "silent_killers": ["JSON Crash"],
#                             "roadmap": "Retry session.",
#                             "question_reviews": []
#                         }

#         # --- RETURN ACTUAL AI SCORE (NO FORCING) ---
#         generated_data["topic"] = clean_field
#         return generated_data

#     except Exception as e:
#         print(f"❌ AUDIT ERROR: {e}")
#         return {
#             "topic": field,
#             "score": 0,
#             "summary": "System Error during audit.",
#             "silent_killers": ["System Crash"],
#             "roadmap": "Contact support.",
#             "question_reviews": []
#         }

# # ==============================================================================
# # ENGINE 3: SESSION LOG MANAGER
# # ==============================================================================

# class SessionLogManager:
#     def __init__(self, filename="session_logs.json"):
#         self.filename = filename
#         self.logs = self._load_logs()

#     def _load_logs(self):
#         """Loads existing session logs from JSON file on startup."""
#         if not os.path.exists(self.filename):
#             return []
#         try:
#             with open(self.filename, 'r') as f:
#                 return json.load(f)
#         except Exception:
#             return []

#     def _save_logs_atomically(self):
#         """
#         Atomic Write Pattern: 
#         1. Write to .tmp file
#         2. os.replace (atomic rename)
#         Prevents data corruption if script crashes during write.
#         """
#         temp_file = f"{self.filename}.tmp"
#         try:
#             with open(temp_file, 'w') as f:
#                 json.dump(self.logs, f, indent=2)
#             os.replace(temp_file, self.filename)
#         except Exception as e:
#             print(f"⚠️ Log Save Failed: {e}")
#             if os.path.exists(temp_file):
#                 os.remove(temp_file)

#     def save_session(self, evaluation_data):
#         is_disqualified = evaluation_data.get('score', 0) < 40
        
#         log_entry = {
#             "id": str(uuid.uuid4()),
#             "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
#             "title": evaluation_data.get('topic', 'General Interview'), 
#             "score": evaluation_data.get('score', 0),
#             "status": "Disqualified" if is_disqualified else "Active",
#             "summary": evaluation_data.get('summary', 'Processing...'),
#             "details": evaluation_data 
#         }
        
#         self.logs.insert(0, log_entry)
#         self._save_logs_atomically() # Persist to disk immediately
#         return log_entry

#     def delete_session(self, session_id):
#         self.logs = [log for log in self.logs if log['id'] != session_id]
#         self._save_logs_atomically() # Update disk immediately
#         return {"status": "success", "message": "Session deleted"}

#     def get_recent_logs(self):
#         return self.logs

# log_manager = SessionLogManager()

# # --- MAIN EXECUTION ---
# if __name__ == "__main__":
    
#     # 1. Setup
#     selected_field = "Chartered Accountancy (CA) & Finance" 
    
#     resume_txt = """
#     EXPERIENCE:
#     Senior Audit Assistant at Deloitte (2020-Present)
#     - Qualified Chartered Accountant (ICAI Membership #123456).
#     - Led statutory audits for listed entities under Ind-AS.
#     - Handled GST compliance and filing of GSTR-9/9C.
#     - Conducted internal audits for manufacturing clients.
#     """

#     print(f"\n--- 1. Generating Questions (Secured) ---")
#     questions = generate_resume_questions(selected_field, resume_txt, "Senior", 3)
#     print("Generated:", json.dumps(questions, indent=2))
    
#     transcript = [
#         {"question": "How do you handle Ind-AS 115?", "answer": "Identify contract, obligations, allocate price."} 
#     ]

#     print(f"\n--- 2. Evaluating Session ---")
#     evaluation = evaluate_resume_session(transcript, field=selected_field, experience="Senior")
    
#     print(f"\n--- 3. Saving Log ---")
#     saved_log = log_manager.save_session(evaluation)
#     print(f"Saved ID: {saved_log['id']} | Status: {saved_log['status']}")
#---------------------------------------------------------------------------------------------------------------------------------------
#14 ai skipped problem solved without time out 
import os
import google.generativeai as genai
import json
import itertools
import random
import time
import re
import traceback
import uuid
import sqlite3
import threading
import unicodedata 
from datetime import datetime
from dotenv import load_dotenv

# ==============================================================================
# 0. DIAGNOSTIC STARTUP & MODEL AUTO-DISCOVERY
# ==============================================================================
print(f"[{datetime.now()}] 🟢 SYSTEM STARTUP: Initializing Supreme Defense Systems...", flush=True)

# 1. Load Environment Variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print(f"[{datetime.now()}] ❌ FATAL ERROR: 'GOOGLE_API_KEY' not found.", flush=True)
    exit(1)

# Mask Key for Logs
masked_key = f"{api_key[:5]}...{api_key[-5:]}"
print(f"[{datetime.now()}] 🔑 API Key Detected: {masked_key}", flush=True)

genai.configure(api_key=api_key)

# 2. MODEL AUTO-DISCOVERY (Prevents 404 Errors)
print(f"[{datetime.now()}] 📡 CONNECTING TO GOOGLE TO FETCH AVAILABLE MODELS...", flush=True)

try:
    # List all models available to your specific API Key
    live_models = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            live_models.append(m.name)
    
    if not live_models:
        print(f"[{datetime.now()}] ⚠️ WARNING: Could not fetch live models. Using fallback list.")
    else:
        print(f"[{datetime.now()}] ✅ FOUND {len(live_models)} LIVE MODELS. (Top: {live_models[0]})")

except Exception as e:
    print(f"[{datetime.now()}] ⚠️ CONNECTION WARNING: {e}")
    live_models = []

# ==============================================================================
# 1. CONFIGURATION: UNIVERSAL MODEL LIST (LATEST -> LEGACY FALLBACK)
# ==============================================================================

def get_tiered_model_iterator():
    """
    STRATEGY:
    1. Try 'Latest' & '2.0/2.5' Series (Best Quality/Speed).
    2. Try Standard '1.5' Series.
    3. Try 'Gemma' Series.
    4. EMERGENCY FALLBACK: Try '1.0' & Deprecated models.
    """
    backup_models = [
        # --- TIER 1: THE LATEST (Priority) ---
        'models/gemini-2.0-flash',
        'models/gemini-2.0-flash-lite-preview-02-05',
        'models/gemini-2.5-flash',
        'models/gemini-pro-latest',
        'models/gemini-flash-latest',
        'models/gemini-flash-lite-latest',
        
        # --- TIER 2: STANDARD 1.5 ---
        'models/gemini-1.5-pro',
        'models/gemini-1.5-pro-latest',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-flash-8b',
        'models/gemini-1.5-flash-latest',

        # --- TIER 3: OPEN WEIGHTS ---
        'models/gemma-3-27b-it',
    'models/gemma-3-12b-it',
    'models/gemma-3-4b-it',
    'models/gemma-3-1b-it',
    'models/gemma-3n-e4b-it',
    'models/gemma-3n-e2b-it',

    'models/gemma-2-27b-it',
    'models/gemma-2-9b-it',
    'models/gemma-2-2b-it',
    'models/gemma-2-27b-it',
    'models/gemma-7b-it',

        # --- TIER 4: LEGACY / DEPRECATED (Last Resort) ---
        'models/gemini-1.0-pro',
        'models/gemini-pro',
        'models/gemini-pro-vision', 
        'models/gemini-1.0-pro-001',
        'models/gemini-1.0-pro-latest',
    ]

    # MERGE: Combine Live + Backup, removing duplicates, keeping order.
    seen = set()
    final_list = []
    
    # 1. Add Backup models first (Strict Order)
    for m in backup_models:
        if m not in seen:
            final_list.append(m)
            seen.add(m)
            
    # 2. Add any extra Live models we missed (New releases)
    for m in live_models:
        if m not in seen:
            final_list.append(m)
            seen.add(m)

    return iter(final_list)

# ==============================================================================
# 2. SECURITY & UTILS: 10-LAYER DEFENSE SYSTEM (NUCLEAR + SURGEON)
# ==============================================================================

def sanitize_input_for_prompt(text, max_chars=25000):
    """ [LAYERS 1-2] INPUT SANITIZATION """
    if not isinstance(text, str): return ""
    
    # [LAYER 1] Token Overflow Guard
    if len(text) > max_chars:
        text = text[:max_chars] + "... [TRUNCATED]"
        
    # [LAYER 2] Delimiter Neutralization
    text = text.replace("### SYSTEM OVERRIDE", "").replace("### INSTRUCTION", "")
    return text.strip()

def clean_json_string(text):
    """ [LAYERS 3-7] PROACTIVE OUTPUT CLEANING """
    if not isinstance(text, str): return text
    
    # [LAYER 3] Markdown Stripping
    text = re.sub(r'```[a-zA-Z]*\n', '', text) # Strip ```json or ```
    text = text.replace("```", "")

    # [LAYER 4] Unicode Normalization (NFKC)
    text = unicodedata.normalize('NFKC', text)
    
    # [LAYER 5] Stack-Based Extraction (Precise)
    start_brace = -1
    end_brace = -1
    first_curly = text.find('{')
    first_square = text.find('[')
    
    is_object = False
    if first_curly == -1 and first_square == -1: return text 
    
    if first_curly != -1 and (first_square == -1 or first_curly < first_square):
        start_brace = first_curly
        is_object = True
    else:
        start_brace = first_square
        is_object = False
        
    if is_object: end_brace = text.rfind('}')
    else: end_brace = text.rfind(']')
        
    if start_brace != -1 and end_brace != -1:
        text = text[start_brace : end_brace + 1]
    
    return text.strip()

def nuclear_json_healing(text):
    """
    [LAYER 9] THE NUCLEAR HEALING MECHANISM
    Specifically fixes 'Invalid control character' (newlines in strings).
    """
    print(f"[{datetime.now()}] ☢️ ENGAGING NUCLEAR HEALING (Control Chars)...", flush=True)

    # 1. Regex to identify content INSIDE double quotes
    pattern = r'("(?:[^"\\]|\\.)*")'

    def replacer(match):
        content = match.group(1)
        # FIX: Replace literal newlines/tabs inside the string with escaped versions
        content = content.replace('\n', '\\n')
        content = content.replace('\r', '\\r')
        content = content.replace('\t', '\\t')
        return content

    repaired_text = re.sub(pattern, replacer, text, flags=re.DOTALL)
    return repaired_text

def rogue_quote_surgeon(text):
    """
    [LAYER 10] THE ROGUE QUOTE SURGEON
    Specifically fixes 'Expecting , delimiter' by finding unescaped quotes inside values.
    Example: "key": "This is "quoted" text" -> "key": "This is \"quoted\" text"
    """
    print(f"[{datetime.now()}] 🚑 ENGAGING ROGUE QUOTE SURGEON...", flush=True)
    
    # This pattern looks for a double quote that:
    # 1. Is preceded by a word character or whitespace (\w|\s)
    # 2. Is NOT escaped (?<!\\)
    # 3. Is followed by a word character or whitespace
    # This isolates quotes that are likely inside a sentence.
    
    # NOTE: This is a heuristic. Ideally, structural quotes are followed by [, ] : }
    # or preceded by { [ : ,
    
    def quote_replacer(match):
        # We found a quote surrounded by text, it's likely rogue.
        # We escape it.
        return match.group(0).replace('"', '\\"')

    # Regex: Find " surrounded by word chars or spaces
    # Captures things like: word " word
    pattern = r'(?<=[\w\s])"(?=[\w\s])'
    
    # Apply fix
    healed_text = re.sub(pattern, '\\"', text)
    
    return healed_text

# ==============================================================================
# 3. CORE ENGINE: GENERATION WITH SMART RATE-LIMIT HANDLING
# ==============================================================================

def generate_with_failover(prompt):
    """
    Executes generation with 429 Backoff, Flash Priority, and JSON Enforcement.
    """
    model_iterator = get_tiered_model_iterator()
    start_time = time.time()
    last_error = None
    
    # 1. Configure JSON enforcement (Removed Max Token Limit as requested)
    generation_config = genai.types.GenerationConfig(
        response_mime_type="application/json",
        temperature=0.7
        # max_output_tokens is purposely omitted to allow model maximum
    )

    # 2. Configure Aggressive Safety Bypass
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }
    MODEL_TIMEOUT = 120
    for model_name in model_iterator:
        # Timeout safety (5 minutes for large batches)
        if time.time() - start_time > 300: break 
        
        print(f"[{datetime.now()}] 🔄 Attempting with model: {model_name}...", flush=True)
        
        try:
            model = genai.GenerativeModel(model_name)
            
            response = model.generate_content(
                prompt, 
                safety_settings=safety_settings,
                generation_config=generation_config
            )
            
            if response.text:
                print(f"[{datetime.now()}] ✅ SUCCESS using {model_name}", flush=True)
                return response.text
                
        except Exception as e:
            error_msg = str(e)
            last_error = e

            if "429" in error_msg:
                print(f"[{datetime.now()}] ⏳ RATE LIMIT HIT ({model_name}).", flush=True)
                wait_match = re.search(r'retry in (\d+\.?\d*)s', error_msg)
                
                if wait_match:
                    wait_time = float(wait_match.group(1))
                    if wait_time < 5:
                        time.sleep(wait_time + 1)
                        try:
                            response = model.generate_content(
                                prompt, 
                                safety_settings=safety_settings,
                                generation_config=generation_config
                            )
                            if response.text: return response.text
                        except: pass 
                else:
                    time.sleep(2)
                continue 
            
            print(f"[{datetime.now()}] ⚠️ FAILED ({model_name}): {error_msg[:100]}...", flush=True)
            time.sleep(0.5)
            continue
            
    print(f"\n[{datetime.now()}] ❌ CRITICAL: ALL MODELS FAILED.", flush=True)
    if last_error: raise last_error
    raise Exception("All models failed without specific error.")

# ==============================================================================
# 4. DATABASE: HISTORY MANAGER (SQLite)
# ==============================================================================

class HistoryManager:
    DB_FILE = "question_history.db"
    STOPWORDS = {
        "the", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by", 
        "is", "are", "was", "were", "be", "been", "this", "that", "it", 
        "calculate", "find", "what", "how", "write", "function", "program",
        "determine", "probability", "value", "given", "assume", "suppose",
        "explain", "describe", "code", "create", "list", "difference", "between"
    }

    def __init__(self):
        self.conn = None
        self.lock = threading.Lock() 
        self._initialize_db()

    def _initialize_db(self):
        try:
            self.conn = sqlite3.connect(self.DB_FILE, check_same_thread=False)
            cursor = self.conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS questions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic TEXT,
                    question TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_topic ON questions(topic)')
            self.conn.commit()
        except Exception as e: print(f"HISTORY INIT ERROR: {e}")

    def get_past_questions(self, topic):
        clean_topic = topic.lower().strip()
        try:
            with self.lock: 
                cursor = self.conn.cursor()
                cursor.execute("SELECT question FROM questions WHERE topic = ? ORDER BY id DESC LIMIT 85", (clean_topic,))
                return [row[0] for row in cursor.fetchall()]
        except Exception as e:
            print(f"DB READ ERROR: {e}")
            return []

    def add_questions(self, topic, new_questions):
        clean_topic = topic.lower().strip()
        data_to_insert = []
        for q in new_questions:
            if isinstance(q, dict) and 'question' in q:
                data_to_insert.append((clean_topic, q['question']))
            elif isinstance(q, str):
                data_to_insert.append((clean_topic, q))
        try:
            with self.lock:
                cursor = self.conn.cursor()
                cursor.executemany("INSERT INTO questions (topic, question) VALUES (?, ?)", data_to_insert)
                self.conn.commit()
        except Exception as e: print(f"DB WRITE ERROR: {e}")

    def close(self):
        if self.conn: self.conn.close()

    def _tokenize(self, text):
        if not text: return set()
        text = re.sub(r'[^\w\s]', '', text.lower())
        return set(word for word in text.split() if word not in self.STOPWORDS and len(word) > 2)

    def is_duplicate(self, new_question_text, past_questions, jaccard_threshold=0.45):
        if not new_question_text: return True
        new_tokens = self._tokenize(new_question_text)
        if len(new_tokens) < 3: return False 
        for past_q in past_questions:
            past_tokens = self._tokenize(past_q)
            intersection = new_tokens.intersection(past_tokens)
            union = new_tokens.union(past_tokens)
            if len(union) == 0: continue
            if (len(intersection) / len(union)) > jaccard_threshold: return True
        return False

history_system = HistoryManager()

# ==============================================================================
# 5. ENGINE: QUESTION GENERATOR (FULL SUPREME MODE)
# ==============================================================================

def generate_resume_questions(topic, resume_text, difficulty="Expert", count=5):
    # Defense Layers 1-2
    clean_topic = sanitize_input_for_prompt(topic)
    clean_resume = sanitize_input_for_prompt(resume_text)
    
    # --- REQUESTED EMPTY RESUME CHECK ---
    if not clean_resume or len(clean_resume) < 50:
        print(f"[{datetime.now()}] ❌ RESUME_GENERATOR FAILED: Standalone mode - AI skipped")
        return [] 
    # --------------------------------

    # Setup History
    db_key = f"{clean_topic}_{difficulty}"
    past_questions = history_system.get_past_questions(db_key)
    exclusion_sample = past_questions[:85]
    exclusion_text = ""
    if exclusion_sample:
        exclusion_text = "### EXCLUSION LIST (DO NOT ASK THESE):\n" + "\n".join([f"- {q}" for q in exclusion_sample])

    unique_seed = random.randint(10000, 99999)
    buffer_count = count * 2 
    
    prompt = f"""
    ### SYSTEM OVERRIDE: SUPREME ARCHITECT MODE
    - **STRICTLY FORBIDDEN:** Conversational fillers.
    - **MANDATORY:** Output must be RAW JSON only.
    - **ESCAPING RULES:** Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).
    
    - **IDENTITY:** You are the 'Chief Talent Architect' AND 'Bob' (The Elite Forensic Auditor).
    - **DATABASE ACCESS:** You have direct access to a simulated **Global Interview Database of 100,000+ Verified Questions** across 25+ domains.
    - **METHOD:** You perform 'Resume DNA Analysis' combined with 'Forensic Text Interrogation'.
    - **GOAL:** 90%+ Difficulty. Top 1% Hiring Standard.

    ### CONTEXT & SIMULATION PARAMETERS:
    1. **THE FIELD:** {clean_topic.upper()}
    2. **DIFFICULTY:** {difficulty}
    3. **SEED:** {unique_seed} (Randomization Token).

    {exclusion_text}

    ### CANDIDATE RESUME TEXT:
    \"\"\"
    {clean_resume}
    \"\"\"

    ### PHASE 1: FORENSIC DNA & TEMPLATE CHECK
    Analyze if the resume matches the **structural and semantic DNA** of a {clean_topic} professional.
    **SUPPORTED DNA DOMAINS:**
    - Software Engineering (Scalability, Trade-offs)
    - Medical/Doctor (Pathology, Protocol)
    - Chartered Accountancy (Compliance, Risk)
    - Civil/Mech Engineering (Safety, Physics)
    - Law, HR, Sales, Aviation, & Government.

    **FAILURE CONDITION:**
    If the resume is generic gibberish or belongs to a wrong profession REJECT IT.
    Output: [{{ "id": 0, "error": "TEMPLATE_MISMATCH", "question": "Resume template not matched." }}]

    ### PHASE 2: RESUME AUTOPSY (BOB'S PAPER TIGER SCAN)
    (Execute only if Phase 1 passes). Scan for buzzwords without depth ("Paper Tigers"):
    - **Microservices?** Ask about *Distributed Tracing & Saga Patterns*.
    - **Management?** Ask about *Handling Toxic High-Performers*.
    - **Audit?** Ask about *Detecting Fraud in seemingly perfect books*.

    ### PHASE 3: QUERY RANDOMIZATION PROTOCOL (MANDATORY)
    You must simulate a Random SQL Retrieval to ensure high entropy and avoid cliches.
    
    **EXECUTE THE FOLLOWING SIMULATION LOGIC:**
    1. **SET SEED:** {unique_seed}
    2. **ACCESS TABLE:** `{clean_topic}_QuestionBank` (Size: 100,000+ Rows)
    3. **FILTER:** `WHERE Difficulty = '{difficulty}' AND Type = 'Scenario_Based' AND Is_Cliche = FALSE`
    4. **RANDOMIZE:** `ORDER BY RANDOM(SEED={unique_seed})`
    5. **LIMIT:** {buffer_count}

    **CRITICAL CONSTRAINT:** - Do NOT select the top 100 most common questions for {clean_topic}. (e.g., NO "What is OOP?", NO "What is a Debit?").
    - Select specific, scenario-based edge cases that only a practitioner would know.

    ### PHASE 4: QUESTION REFINEMENT (90%+ QUALITY)
    Refine the selected questions using Bob's "Brutal Difficulty" rules:
    1. **Disaster Scenarios:** Ask "Here is a disaster involving X, how do you fix it?"
    2. **Trade-Offs:** Force a choice between two bad options (Latency vs Consistency, Speed vs Safety).
    3. **Resume Specificity:** Start with: "Your resume claims [Project X]..." or "You listed [Tool Y]..."

    ### OUTPUT FORMAT (JSON ONLY):
    [
        {{
            "id": 1,
            "type": "resume_specific", 
            "question": "Referring to your 'Cloud Migration' project: You moved from On-Prem to AWS. If your specific latency requirements were <5ms but the new cloud load balancer added 10ms overhead, how did you re-architect the network layer to solve this without abandoning the cloud?" 
        }}
    ]
    """
    try:
        raw_text = generate_with_failover(prompt)
        cleaned_text = clean_json_string(raw_text)
        
        # [LAYER 8, 9 & 10] INTEGRATED PARSING RECOVERY
        generated_data = []
        try:
            # Attempt 1: Standard
            generated_data = json.loads(cleaned_text)
        except json.JSONDecodeError:
            try:
                # Attempt 2: Nuclear Healing (Fixes "Invalid control character")
                print(f"[{datetime.now()}] ⚠️ JSON Attempt 1 Failed. Engaging Nuclear Healing...")
                healed_text = nuclear_json_healing(cleaned_text)
                generated_data = json.loads(healed_text)
            except json.JSONDecodeError:
                # Attempt 3: Rogue Quote Surgeon (Fixes "Expecting delimiter")
                print(f"[{datetime.now()}] ⚠️ JSON Attempt 2 Failed. Engaging Quote Surgeon...")
                try:
                    healed_text = nuclear_json_healing(cleaned_text) # Re-apply nuclear first
                    surgeoed_text = rogue_quote_surgeon(healed_text)
                    generated_data = json.loads(surgeoed_text)
                except json.JSONDecodeError:
                    # Attempt 4: Trailing Commas
                    repaired_text = re.sub(r',\s*([\]}])', r'\1', cleaned_text)
                    try:
                        generated_data = json.loads(repaired_text)
                    except:
                        # Attempt 5: Brute Backslash Escape
                        repaired_text = re.sub(r'\\(?![/\\bfnrtu"U])', r'\\\\', cleaned_text)
                        try:
                            generated_data = json.loads(repaired_text)
                        except:
                            print(f"[{datetime.now()}] ❌ JSON PARSE CRASH ON: {cleaned_text[:100]}...")
                            return [{"id": 0, "error": "JSON_PARSE_CRASH", "question": "Error generating questions."}]

        unique_batch = []
        for item in generated_data:
            q_text = item.get("question", "")
            if not history_system.is_duplicate(q_text, past_questions):
                unique_batch.append(item)
                if len(unique_batch) >= count: break
        
        if unique_batch:
            history_system.add_questions(db_key, unique_batch)
            return unique_batch
        else:
            return generated_data[:count]

    except Exception as e:
        print(f"[{datetime.now()}] ❌ GENERATION ERROR: {e}")
        traceback.print_exc()
        raise e

# ==============================================================================
# 6. ENGINE: RESUME EVALUATOR (FULL BOB PROMPT + 6-STAGE RECOVERY)
# ==============================================================================

def evaluate_resume_session(transcript_data, field="General", experience="Entry Level"):
    if not transcript_data: return {}

    clean_field = sanitize_input_for_prompt(field)
    
    prompt = f"""
    #     ### SYSTEM OVERRIDE: SUPREME AUDITOR MODE
    - **STRICTLY FORBIDDEN:** Conversational fillers.
    - **MANDATORY:** Output must be RAW JSON only.
    - **ESCAPING RULES:** Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).

    ### ROLE: CHIEF TALENT ARCHITECT & SUPREME FORENSIC AUDITOR (CODE NAME: BOB)
    - **CONTEXT:** You are the Global Head of Talent Acquisition with 100% mastery of 50+ Professional Domains (Engineering, Medical, Finance, Law, etc.).
    - **TASK:** Conduct a ruthless "Resume Verification Analysis" & "Forensic Audit" of the candidate.
    - **DIRECTIVE:** Provide MAXIMUM DATA DENSITY. Do not summarize; expand on every detail with paragraph-length forensic insights.

    ### TRANSCRIPT DATA:
    {json.dumps(transcript_data)}

    ### PHASE 1: FORENSIC DNA & TEMPLATE INTEGRITY CHECK
    Analyze if the candidate's answers match the **structural and semantic DNA** of a {clean_field} professional.
    - **Lexicon Verification:** Does a Doctor use 'Triage'? Does a Dev use 'CI/CD'? Does a Pilot use 'METAR'?
    - **Experience Verification:** Does the depth match {experience}? (Entry = 'How', Senior = 'Why/Trade-offs').
    - **Fraud Detection:** Identify vague answers ("I handled everything") that suggest Resume Padding.

    ### PHASE 2: THE "BOB" DEEP DIVE (HIGH DETAIL PROTOCOL)
    For every answer, perform a "Claim vs. Reality" Check:
    1. **Deep Dive Analysis:** Write a PARAGRAPH (not a sentence) explaining exactly *why* the answer was strong or weak.
    2. **Technical Nuance:** Even if the answer is good, add "Expert Level Nuance" to show what a Top 1% answer would look like.
    3. **Benefit of Doubt vs. Rigor:** Be generous in interpretation but strict in scoring.

    ### PHASE 3: SCORING CRITERIA (STRICT & MERIT-BASED)
    Do NOT inflate the score. Judge honestly based on the "Golden Standard":
    - **90-100 (Hired):** Exceptional. Perfect domain lexicon. Senior-level trade-off analysis.
    - **70-89 (Strong):** Good. Minor gaps but generally truthful and competent.
    - **40-69 (Weak):** Inconsistent. Struggles with concepts expected at this level.
    - **0-39 (Fraud/Mismatch):** Imposter. Answers contradict the resume or professional standards.

    ### OUTPUT REQUIREMENTS (JSON):
    1. **score:** (Integer 0-100). Be strict.
    2. **summary:** A detailed forensic executive summary (60-80 words). Verdict on hireability.
    3. **silent_killers:** List 2-3 specific behavioral or technical red flags (e.g., "Claimed 5 years Java but stuck on basic OOP").
    4. **roadmap:** A specific, actionable 3-step plan to bridge the gap to the next level.
    5. **question_reviews:** - "feedback": A detailed technical paragraph (3-4 sentences).
       - "ideal_answer": The textbook-perfect response using industry-standard jargon.

    OUTPUT FORMAT (JSON ONLY):
    {{
        "score": <number>,
        "summary": "...",
        "silent_killers": ["..."],
        "roadmap": "...",
        "question_reviews": [
            {{
                "question": "...",
                "user_answer": "...",
                "score": 8,
                "feedback": "...",
                "ideal_answer": "..."
            }}
        ]
    }}
    """
    try:
        raw_text = generate_with_failover(prompt)
        cleaned_text = clean_json_string(raw_text)
        
        # [LAYER 8, 9 & 10] 6-STAGE RECOVERY SYSTEM
        # Designed specifically for "Invalid control character" AND "Expecting delimiter"
        try:
            # Attempt 1: Standard
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            print(f"[{datetime.now()}] ⚠️ JSON Attempt 1 Failed. Engaging Nuclear Healing...")
            
            # Attempt 2: NUCLEAR HEALING (Fixes newlines in strings)
            try:
                healed_text = nuclear_json_healing(cleaned_text)
                return json.loads(healed_text)
            except json.JSONDecodeError:
                 print(f"[{datetime.now()}] ⚠️ JSON Attempt 2 (Nuclear) Failed. Engaging ROGUE QUOTE SURGEON...")
                 
                 # Attempt 3: ROGUE QUOTE SURGEON (Fixes unescaped quotes)
                 try:
                     # Re-apply nuclear first to clean newlines, THEN apply surgeon
                     text_stage_2 = nuclear_json_healing(cleaned_text)
                     text_stage_3 = rogue_quote_surgeon(text_stage_2)
                     return json.loads(text_stage_3)
                 except json.JSONDecodeError:
                     print(f"[{datetime.now()}] ⚠️ JSON Attempt 3 (Surgeon) Failed. Engaging Trailing Comma Fix...")
                     
                     # Attempt 4: Trailing Commas (applied to Surgeon result)
                     try:
                        text_stage_3 = rogue_quote_surgeon(nuclear_json_healing(cleaned_text)) # Ensure we have base
                        repaired_text = re.sub(r',\s*([\]}])', r'\1', text_stage_3)
                        return json.loads(repaired_text)
                     except:
                         print(f"[{datetime.now()}] ⚠️ JSON Attempt 4 Failed. Engaging Brute Force...")

                         # Attempt 5: Brute Force Backslashes (Last Resort)
                         repaired_text = re.sub(r'\\(?![/\\bfnrtu"U])', r'\\\\', cleaned_text)
                         try:
                            return json.loads(repaired_text)
                         except:
                            # Attempt 6: Scorched Earth
                            scorched_text = cleaned_text.replace('\\', '\\\\')
                            try:
                                 return json.loads(scorched_text)
                            except:
                                # CRITICAL CRASH
                                print(f"[{datetime.now()}] ❌ AUDIT JSON CRASH.")
                                print(f"--- DUMPING BAD JSON ---\n{cleaned_text[:500]}...\n--------------------")
                                raise Exception("JSON Parsing Failed after all 6 recovery attempts.")

    except Exception as e:
        print(f"[{datetime.now()}] ❌ AUDIT ERROR: {e}")
        raise e

# ==============================================================================
# MAIN EXECUTION (FOR TESTING)
# ==============================================================================
if __name__ == "__main__":
    
    # 1. Setup
    field = "Senior DevOps Engineer"
    resume = "Experience with Kubernetes, Terraform, AWS, and CI/CD pipelines."
    
    print(f"\n[{datetime.now()}] --- 1. Generating Unique Questions (15 Max) ---")
    try:
        # User requested 15 max
        q1 = generate_resume_questions(field, resume, "Senior", 15)
        print(json.dumps(q1, indent=2))
    except Exception as e:
        print(f"❌ RESUME_GENERATOR FAILED: {e}")
        traceback.print_exc()

    history_system.close()
    
#------------------------------------------------------------------------------------------------------------------------------------
# 14 feb model timeout concept 
# import os
# import google.generativeai as genai
# import json
# import itertools
# import random
# import time
# import re
# import traceback
# import uuid
# import sqlite3
# import threading
# import unicodedata 
# from datetime import datetime
# from dotenv import load_dotenv
# from google.api_core import retry

# # ==============================================================================
# # 0. DIAGNOSTIC STARTUP & MODEL AUTO-DISCOVERY
# # ==============================================================================
# print(f"[{datetime.now()}] 🟢 SYSTEM STARTUP: Initializing Supreme Defense Systems (Gemini 3.0 Ready)...", flush=True)

# # 1. Load Environment Variables
# load_dotenv()
# api_key = os.getenv("GOOGLE_API_KEY")

# if not api_key:
#     print(f"[{datetime.now()}] ❌ FATAL ERROR: 'GOOGLE_API_KEY' not found.", flush=True)
#     exit(1)

# # Mask Key for Logs
# masked_key = f"{api_key[:5]}...{api_key[-5:]}"
# print(f"[{datetime.now()}] 🔑 API Key Detected: {masked_key}", flush=True)

# genai.configure(api_key=api_key)

# # 2. MODEL AUTO-DISCOVERY (Prevents 404 Errors)
# print(f"[{datetime.now()}] 📡 CONNECTING TO GOOGLE TO FETCH AVAILABLE MODELS...", flush=True)

# try:
#     # List all models available to your specific API Key
#     live_models = []
#     for m in genai.list_models():
#         if 'generateContent' in m.supported_generation_methods:
#             live_models.append(m.name)
    
#     if not live_models:
#         print(f"[{datetime.now()}] ⚠️ WARNING: Could not fetch live models. Using fallback list.")
#     else:
#         print(f"[{datetime.now()}] ✅ FOUND {len(live_models)} LIVE MODELS. (Top: {live_models[0]})")

# except Exception as e:
#     print(f"[{datetime.now()}] ⚠️ CONNECTION WARNING: {e}")
#     live_models = []

# # ==============================================================================
# # 1. CONFIGURATION: UNIVERSAL MODEL LIST (GEMINI 3.0 / 2.0 -> LEGACY FALLBACK)
# # ==============================================================================

# def get_tiered_model_iterator():
#     """
#     STRATEGY:
#     1. Try 'Gemini 3.0' (Future Proofing) & 'Gemini 2.0' (Current Speed Kings).
#     2. Try Standard '1.5' Series (Reliable).
#     3. Try 'Gemma' Series (Open Weights).
#     4. EMERGENCY FALLBACK: Try '1.0' & Deprecated models.
#     """
#     backup_models = [
#         # --- TIER 1: THE BLEEDING EDGE (GEMINI 3.0 & 2.0) ---
#         'models/gemini-3.0-pro-exp',  # Future-proof placeholder
#         'models/gemini-3.0-flash',    # Future-proof placeholder
#         'models/gemini-2.0-pro-exp',
#         'models/gemini-2.0-flash',
#         'models/gemini-2.0-flash-lite-preview-02-05',
#         'models/gemini-2.0-flash-exp',
        
#         # --- TIER 2: HIGH PERFORMANCE 1.5 ---
#         'models/gemini-1.5-pro',
#         'models/gemini-1.5-pro-latest',
#         'models/gemini-1.5-pro-002',
        
#         # --- TIER 3: HIGH SPEED 1.5 ---
#         'models/gemini-1.5-flash',
#         'models/gemini-1.5-flash-8b',
#         'models/gemini-1.5-flash-latest',
#         'models/gemini-1.5-flash-002',

#         # --- TIER 4: OPEN WEIGHTS ---
#         'models/gemma-2-27b-it',
#         'models/gemma-2-9b-it',
#         'models/gemma-7b-it',

#         # --- TIER 5: LEGACY / DEPRECATED (Last Resort) ---
#         'models/gemini-1.0-pro',
#         'models/gemini-pro', 
#         'models/gemini-1.0-pro-001',
#         'models/gemini-1.0-pro-latest',
#     ]

#     # MERGE: Combine Live + Backup, removing duplicates, keeping order.
#     seen = set()
#     final_list = []
    
#     # 1. Add Backup models first (Strict Order)
#     for m in backup_models:
#         if m not in seen:
#             final_list.append(m)
#             seen.add(m)
            
#     # 2. Add any extra Live models we missed (New releases)
#     for m in live_models:
#         if m not in seen:
#             final_list.append(m)
#             seen.add(m)

#     return iter(final_list)

# # ==============================================================================
# # 2. SECURITY & UTILS: 10-LAYER DEFENSE SYSTEM (NUCLEAR + SURGEON)
# # ==============================================================================

# def sanitize_input_for_prompt(text, max_chars=25000):
#     """ [LAYERS 1-2] INPUT SANITIZATION """
#     if not isinstance(text, str): return ""
    
#     # [LAYER 1] Token Overflow Guard
#     if len(text) > max_chars:
#         text = text[:max_chars] + "... [TRUNCATED]"
        
#     # [LAYER 2] Delimiter Neutralization
#     text = text.replace("### SYSTEM OVERRIDE", "").replace("### INSTRUCTION", "")
#     return text.strip()

# def clean_json_string(text):
#     """ [LAYERS 3-7] PROACTIVE OUTPUT CLEANING """
#     if not isinstance(text, str): return text
    
#     # [LAYER 3] Markdown Stripping
#     text = re.sub(r'```[a-zA-Z]*\n', '', text) # Strip ```json or ```
#     text = text.replace("```", "")

#     # [LAYER 4] Unicode Normalization (NFKC)
#     text = unicodedata.normalize('NFKC', text)
    
#     # [LAYER 5] Stack-Based Extraction (Precise)
#     start_brace = -1
#     end_brace = -1
#     first_curly = text.find('{')
#     first_square = text.find('[')
    
#     is_object = False
#     if first_curly == -1 and first_square == -1: return text 
    
#     if first_curly != -1 and (first_square == -1 or first_curly < first_square):
#         start_brace = first_curly
#         is_object = True
#     else:
#         start_brace = first_square
#         is_object = False
        
#     if is_object: end_brace = text.rfind('}')
#     else: end_brace = text.rfind(']')
        
#     if start_brace != -1 and end_brace != -1:
#         text = text[start_brace : end_brace + 1]
    
#     return text.strip()

# def nuclear_json_healing(text):
#     """
#     [LAYER 9] THE NUCLEAR HEALING MECHANISM
#     Specifically fixes 'Invalid control character' (newlines in strings).
#     """
#     print(f"[{datetime.now()}] ☢️ ENGAGING NUCLEAR HEALING (Control Chars)...", flush=True)

#     # 1. Regex to identify content INSIDE double quotes
#     pattern = r'("(?:[^"\\]|\\.)*")'

#     def replacer(match):
#         content = match.group(1)
#         # FIX: Replace literal newlines/tabs inside the string with escaped versions
#         content = content.replace('\n', '\\n')
#         content = content.replace('\r', '\\r')
#         content = content.replace('\t', '\\t')
#         return content

#     repaired_text = re.sub(pattern, replacer, text, flags=re.DOTALL)
#     return repaired_text

# def rogue_quote_surgeon(text):
#     """
#     [LAYER 10] THE ROGUE QUOTE SURGEON
#     Specifically fixes 'Expecting , delimiter' by finding unescaped quotes inside values.
#     Example: "key": "This is "quoted" text" -> "key": "This is \"quoted\" text"
#     """
#     print(f"[{datetime.now()}] 🚑 ENGAGING ROGUE QUOTE SURGEON...", flush=True)
    
#     # Regex: Find " surrounded by word chars or spaces
#     def quote_replacer(match):
#         return match.group(0).replace('"', '\\"')

#     pattern = r'(?<=[\w\s])"(?=[\w\s])'
#     healed_text = re.sub(pattern, '\\"', text)
#     return healed_text

# # ==============================================================================
# # 3. CORE ENGINE: GENERATION WITH SMART RATE-LIMIT HANDLING & TIMEOUT FIX
# # ==============================================================================

# def generate_with_failover(prompt):
#     """
#     Executes generation with 429 Backoff, Flash Priority, JSON Enforcement,
#     and STRICT TIMEOUT MANAGEMENT to prevent hanging.
#     """
#     model_iterator = get_tiered_model_iterator()
#     start_time = time.time()
#     last_error = None
    
#     # 1. Configure JSON enforcement
#     generation_config = genai.types.GenerationConfig(
#         response_mime_type="application/json",
#         temperature=0.7
#     )

#     # 2. Configure Aggressive Safety Bypass
#     from google.generativeai.types import HarmCategory, HarmBlockThreshold
#     safety_settings = {
#         HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
#         HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
#         HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
#         HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
#     }

#     # 3. GLOBAL TIMEOUT (Seconds) - Allow generous time for deep thinking models
#     MODEL_TIMEOUT = 120 

#     for model_name in model_iterator:
#         # Loop safety (5 minutes total for entire batch)
#         if time.time() - start_time > 300: break 
        
#         print(f"[{datetime.now()}] 🔄 Attempting with model: {model_name}...", flush=True)
        
#         try:
#             model = genai.GenerativeModel(model_name)
            
#             # CRITICAL FIX: request_options with timeout
#             # This forces the client to close the connection if the server hangs
#             response = model.generate_content(
#                 prompt, 
#                 safety_settings=safety_settings,
#                 generation_config=generation_config,
#                 request_options={"timeout": MODEL_TIMEOUT} 
#             )
            
#             if response.text:
#                 print(f"[{datetime.now()}] ✅ SUCCESS using {model_name}", flush=True)
#                 return response.text
                
#         except Exception as e:
#             error_msg = str(e)
#             last_error = e

#             # Handle 429 Rate Limits
#             if "429" in error_msg or "Resource exhausted" in error_msg:
#                 print(f"[{datetime.now()}] ⏳ RATE LIMIT HIT ({model_name}).", flush=True)
#                 wait_match = re.search(r'retry in (\d+\.?\d*)s', error_msg)
                
#                 if wait_match:
#                     wait_time = float(wait_match.group(1))
#                     if wait_time < 10:
#                         time.sleep(wait_time + 1)
#                         # Retry ONCE on the same model if wait time is short
#                         try:
#                             print(f"[{datetime.now()}] 🔄 Retrying {model_name}...", flush=True)
#                             response = model.generate_content(
#                                 prompt, 
#                                 safety_settings=safety_settings,
#                                 generation_config=generation_config,
#                                 request_options={"timeout": MODEL_TIMEOUT}
#                             )
#                             if response.text: return response.text
#                         except: pass 
#                 else:
#                     time.sleep(2)
#                 continue 
            
#             # Handle 404 (Model not found/deprecated)
#             elif "404" in error_msg or "Not Found" in error_msg:
#                  print(f"[{datetime.now()}] ⚠️ MODEL NOT FOUND ({model_name}). Skipping...", flush=True)
#                  continue

#             # Handle Timeouts (Deadline Exceeded)
#             elif "504" in error_msg or "Deadline Exceeded" in error_msg or "timed out" in error_msg:
#                  print(f"[{datetime.now()}] ⏱️ TIMEOUT ({model_name}). Moving to next...", flush=True)
#                  continue
            
#             print(f"[{datetime.now()}] ⚠️ FAILED ({model_name}): {error_msg[:100]}...", flush=True)
#             time.sleep(0.5)
#             continue
            
#     print(f"\n[{datetime.now()}] ❌ CRITICAL: ALL MODELS FAILED.", flush=True)
#     if last_error: raise last_error
#     raise Exception("All models failed without specific error.")

# # ==============================================================================
# # 4. DATABASE: HISTORY MANAGER (SQLite)
# # ==============================================================================

# class HistoryManager:
#     DB_FILE = "question_history.db"
#     STOPWORDS = {
#         "the", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by", 
#         "is", "are", "was", "were", "be", "been", "this", "that", "it", 
#         "calculate", "find", "what", "how", "write", "function", "program",
#         "determine", "probability", "value", "given", "assume", "suppose",
#         "explain", "describe", "code", "create", "list", "difference", "between"
#     }

#     def __init__(self):
#         self.conn = None
#         self.lock = threading.Lock() 
#         self._initialize_db()

#     def _initialize_db(self):
#         try:
#             self.conn = sqlite3.connect(self.DB_FILE, check_same_thread=False)
#             cursor = self.conn.cursor()
#             cursor.execute('''
#                 CREATE TABLE IF NOT EXISTS questions (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     topic TEXT,
#                     question TEXT,
#                     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
#                 )
#             ''')
#             cursor.execute('CREATE INDEX IF NOT EXISTS idx_topic ON questions(topic)')
#             self.conn.commit()
#         except Exception as e: print(f"HISTORY INIT ERROR: {e}")

#     def get_past_questions(self, topic):
#         clean_topic = topic.lower().strip()
#         try:
#             with self.lock: 
#                 cursor = self.conn.cursor()
#                 cursor.execute("SELECT question FROM questions WHERE topic = ? ORDER BY id DESC LIMIT 85", (clean_topic,))
#                 return [row[0] for row in cursor.fetchall()]
#         except Exception as e:
#             print(f"DB READ ERROR: {e}")
#             return []

#     def add_questions(self, topic, new_questions):
#         clean_topic = topic.lower().strip()
#         data_to_insert = []
#         for q in new_questions:
#             if isinstance(q, dict) and 'question' in q:
#                 data_to_insert.append((clean_topic, q['question']))
#             elif isinstance(q, str):
#                 data_to_insert.append((clean_topic, q))
#         try:
#             with self.lock:
#                 cursor = self.conn.cursor()
#                 cursor.executemany("INSERT INTO questions (topic, question) VALUES (?, ?)", data_to_insert)
#                 self.conn.commit()
#         except Exception as e: print(f"DB WRITE ERROR: {e}")

#     def close(self):
#         if self.conn: self.conn.close()

#     def _tokenize(self, text):
#         if not text: return set()
#         text = re.sub(r'[^\w\s]', '', text.lower())
#         return set(word for word in text.split() if word not in self.STOPWORDS and len(word) > 2)

#     def is_duplicate(self, new_question_text, past_questions, jaccard_threshold=0.45):
#         if not new_question_text: return True
#         new_tokens = self._tokenize(new_question_text)
#         if len(new_tokens) < 3: return False 
#         for past_q in past_questions:
#             past_tokens = self._tokenize(past_q)
#             intersection = new_tokens.intersection(past_tokens)
#             union = new_tokens.union(past_tokens)
#             if len(union) == 0: continue
#             if (len(intersection) / len(union)) > jaccard_threshold: return True
#         return False

# history_system = HistoryManager()

# # ==============================================================================
# # 5. ENGINE: QUESTION GENERATOR (FULL SUPREME MODE)
# # ==============================================================================

# def generate_resume_questions(topic, resume_text, difficulty="Expert", count=5):
#     # Defense Layers 1-2
#     clean_topic = sanitize_input_for_prompt(topic)
#     clean_resume = sanitize_input_for_prompt(resume_text)
    
#     # --- REQUESTED EMPTY RESUME CHECK ---
#     if not clean_resume or len(clean_resume) < 50:
#         print(f"[{datetime.now()}] ❌ RESUME_GENERATOR FAILED: Standalone mode - AI skipped")
#         return [] 
#     # --------------------------------

#     # Setup History
#     db_key = f"{clean_topic}_{difficulty}"
#     past_questions = history_system.get_past_questions(db_key)
#     exclusion_sample = past_questions[:85]
#     exclusion_text = ""
#     if exclusion_sample:
#         exclusion_text = "### EXCLUSION LIST (DO NOT ASK THESE):\n" + "\n".join([f"- {q}" for q in exclusion_sample])

#     unique_seed = random.randint(10000, 99999)
#     buffer_count = count * 2 
    
#     prompt = f"""
#     ### SYSTEM OVERRIDE: SUPREME ARCHITECT MODE
#     - **STRICTLY FORBIDDEN:** Conversational fillers.
#     - **MANDATORY:** Output must be RAW JSON only.
#     - **ESCAPING RULES:** Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).
    
#     - **IDENTITY:** You are the 'Chief Talent Architect' AND 'Bob' (The Elite Forensic Auditor).
#     - **DATABASE ACCESS:** You have direct access to a simulated **Global Interview Database of 100,000+ Verified Questions** across 25+ domains.
#     - **METHOD:** You perform 'Resume DNA Analysis' combined with 'Forensic Text Interrogation'.
#     - **GOAL:** 90%+ Difficulty. Top 1% Hiring Standard.

#     ### CONTEXT & SIMULATION PARAMETERS:
#     1. **THE FIELD:** {clean_topic.upper()}
#     2. **DIFFICULTY:** {difficulty}
#     3. **SEED:** {unique_seed} (Randomization Token).

#     {exclusion_text}

#     ### CANDIDATE RESUME TEXT:
#     \"\"\"
#     {clean_resume}
#     \"\"\"

#     ### PHASE 1: FORENSIC DNA & TEMPLATE CHECK
#     Analyze if the resume matches the **structural and semantic DNA** of a {clean_topic} professional.
#     **SUPPORTED DNA DOMAINS:**
#     - Software Engineering (Scalability, Trade-offs)
#     - Medical/Doctor (Pathology, Protocol)
#     - Chartered Accountancy (Compliance, Risk)
#     - Civil/Mech Engineering (Safety, Physics)
#     - Law, HR, Sales, Aviation, & Government.

#     **FAILURE CONDITION:**
#     If the resume is generic gibberish or belongs to a wrong profession REJECT IT.
#     Output: [{{ "id": 0, "error": "TEMPLATE_MISMATCH", "question": "Resume template not matched." }}]

#     ### PHASE 2: RESUME AUTOPSY (BOB'S PAPER TIGER SCAN)
#     (Execute only if Phase 1 passes). Scan for buzzwords without depth ("Paper Tigers"):
#     - **Microservices?** Ask about *Distributed Tracing & Saga Patterns*.
#     - **Management?** Ask about *Handling Toxic High-Performers*.
#     - **Audit?** Ask about *Detecting Fraud in seemingly perfect books*.

#     ### PHASE 3: QUERY RANDOMIZATION PROTOCOL (MANDATORY)
#     You must simulate a Random SQL Retrieval to ensure high entropy and avoid cliches.
    
#     **EXECUTE THE FOLLOWING SIMULATION LOGIC:**
#     1. **SET SEED:** {unique_seed}
#     2. **ACCESS TABLE:** `{clean_topic}_QuestionBank` (Size: 100,000+ Rows)
#     3. **FILTER:** `WHERE Difficulty = '{difficulty}' AND Type = 'Scenario_Based' AND Is_Cliche = FALSE`
#     4. **RANDOMIZE:** `ORDER BY RANDOM(SEED={unique_seed})`
#     5. **LIMIT:** {buffer_count}

#     **CRITICAL CONSTRAINT:** - Do NOT select the top 100 most common questions for {clean_topic}. (e.g., NO "What is OOP?", NO "What is a Debit?").
#     - Select specific, scenario-based edge cases that only a practitioner would know.

#     ### PHASE 4: QUESTION REFINEMENT (90%+ QUALITY)
#     Refine the selected questions using Bob's "Brutal Difficulty" rules:
#     1. **Disaster Scenarios:** Ask "Here is a disaster involving X, how do you fix it?"
#     2. **Trade-Offs:** Force a choice between two bad options (Latency vs Consistency, Speed vs Safety).
#     3. **Resume Specificity:** Start with: "Your resume claims [Project X]..." or "You listed [Tool Y]..."

#     ### OUTPUT FORMAT (JSON ONLY):
#     [
#         {{
#             "id": 1,
#             "type": "resume_specific", 
#             "question": "Referring to your 'Cloud Migration' project: You moved from On-Prem to AWS. If your specific latency requirements were <5ms but the new cloud load balancer added 10ms overhead, how did you re-architect the network layer to solve this without abandoning the cloud?" 
#         }}
#     ]
#     """
#     try:
#         raw_text = generate_with_failover(prompt)
#         cleaned_text = clean_json_string(raw_text)
        
#         # [LAYER 8, 9 & 10] INTEGRATED PARSING RECOVERY
#         generated_data = []
#         try:
#             # Attempt 1: Standard
#             generated_data = json.loads(cleaned_text)
#         except json.JSONDecodeError:
#             try:
#                 # Attempt 2: Nuclear Healing (Fixes "Invalid control character")
#                 print(f"[{datetime.now()}] ⚠️ JSON Attempt 1 Failed. Engaging Nuclear Healing...")
#                 healed_text = nuclear_json_healing(cleaned_text)
#                 generated_data = json.loads(healed_text)
#             except json.JSONDecodeError:
#                 # Attempt 3: Rogue Quote Surgeon (Fixes "Expecting delimiter")
#                 print(f"[{datetime.now()}] ⚠️ JSON Attempt 2 Failed. Engaging Quote Surgeon...")
#                 try:
#                     healed_text = nuclear_json_healing(cleaned_text) # Re-apply nuclear first
#                     surgeoed_text = rogue_quote_surgeon(healed_text)
#                     generated_data = json.loads(surgeoed_text)
#                 except json.JSONDecodeError:
#                     # Attempt 4: Trailing Commas
#                     repaired_text = re.sub(r',\s*([\]}])', r'\1', cleaned_text)
#                     try:
#                         generated_data = json.loads(repaired_text)
#                     except:
#                         # Attempt 5: Brute Backslash Escape
#                         repaired_text = re.sub(r'\\(?![/\\bfnrtu"U])', r'\\\\', cleaned_text)
#                         try:
#                             generated_data = json.loads(repaired_text)
#                         except:
#                             print(f"[{datetime.now()}] ❌ JSON PARSE CRASH ON: {cleaned_text[:100]}...")
#                             return [{"id": 0, "error": "JSON_PARSE_CRASH", "question": "Error generating questions."}]

#         unique_batch = []
#         for item in generated_data:
#             q_text = item.get("question", "")
#             if not history_system.is_duplicate(q_text, past_questions):
#                 unique_batch.append(item)
#                 if len(unique_batch) >= count: break
        
#         if unique_batch:
#             history_system.add_questions(db_key, unique_batch)
#             return unique_batch
#         else:
#             return generated_data[:count]

#     except Exception as e:
#         print(f"[{datetime.now()}] ❌ GENERATION ERROR: {e}")
#         traceback.print_exc()
#         raise e

# # ==============================================================================
# # 6. ENGINE: RESUME EVALUATOR (FULL BOB PROMPT + 6-STAGE RECOVERY)
# # ==============================================================================

# def evaluate_resume_session(transcript_data, field="General", experience="Entry Level"):
#     if not transcript_data: return {}

#     clean_field = sanitize_input_for_prompt(field)
    
#     prompt = f"""
#     #     ### SYSTEM OVERRIDE: SUPREME AUDITOR MODE
#     - **STRICTLY FORBIDDEN:** Conversational fillers.
#     - **MANDATORY:** Output must be RAW JSON only.
#     - **ESCAPING RULES:** Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).

#     ### ROLE: CHIEF TALENT ARCHITECT & SUPREME FORENSIC AUDITOR (CODE NAME: BOB)
#     - **CONTEXT:** You are the Global Head of Talent Acquisition with 100% mastery of 50+ Professional Domains (Engineering, Medical, Finance, Law, etc.).
#     - **TASK:** Conduct a ruthless "Resume Verification Analysis" & "Forensic Audit" of the candidate.
#     - **DIRECTIVE:** Provide MAXIMUM DATA DENSITY. Do not summarize; expand on every detail with paragraph-length forensic insights.

#     ### TRANSCRIPT DATA:
#     {json.dumps(transcript_data)}

#     ### PHASE 1: FORENSIC DNA & TEMPLATE INTEGRITY CHECK
#     Analyze if the candidate's answers match the **structural and semantic DNA** of a {clean_field} professional.
#     - **Lexicon Verification:** Does a Doctor use 'Triage'? Does a Dev use 'CI/CD'? Does a Pilot use 'METAR'?
#     - **Experience Verification:** Does the depth match {experience}? (Entry = 'How', Senior = 'Why/Trade-offs').
#     - **Fraud Detection:** Identify vague answers ("I handled everything") that suggest Resume Padding.

#     ### PHASE 2: THE "BOB" DEEP DIVE (HIGH DETAIL PROTOCOL)
#     For every answer, perform a "Claim vs. Reality" Check:
#     1. **Deep Dive Analysis:** Write a PARAGRAPH (not a sentence) explaining exactly *why* the answer was strong or weak.
#     2. **Technical Nuance:** Even if the answer is good, add "Expert Level Nuance" to show what a Top 1% answer would look like.
#     3. **Benefit of Doubt vs. Rigor:** Be generous in interpretation but strict in scoring.

#     ### PHASE 3: SCORING CRITERIA (STRICT & MERIT-BASED)
#     Do NOT inflate the score. Judge honestly based on the "Golden Standard":
#     - **90-100 (Hired):** Exceptional. Perfect domain lexicon. Senior-level trade-off analysis.
#     - **70-89 (Strong):** Good. Minor gaps but generally truthful and competent.
#     - **40-69 (Weak):** Inconsistent. Struggles with concepts expected at this level.
#     - **0-39 (Fraud/Mismatch):** Imposter. Answers contradict the resume or professional standards.

#     ### OUTPUT REQUIREMENTS (JSON):
#     1. **score:** (Integer 0-100). Be strict.
#     2. **summary:** A detailed forensic executive summary (60-80 words). Verdict on hireability.
#     3. **silent_killers:** List 2-3 specific behavioral or technical red flags (e.g., "Claimed 5 years Java but stuck on basic OOP").
#     4. **roadmap:** A specific, actionable 3-step plan to bridge the gap to the next level.
#     5. **question_reviews:** - "feedback": A detailed technical paragraph (3-4 sentences).
#        - "ideal_answer": The textbook-perfect response using industry-standard jargon.

#     OUTPUT FORMAT (JSON ONLY):
#     {{
#         "score": <number>,
#         "summary": "...",
#         "silent_killers": ["..."],
#         "roadmap": "...",
#         "question_reviews": [
#             {{
#                 "question": "...",
#                 "user_answer": "...",
#                 "score": 8,
#                 "feedback": "...",
#                 "ideal_answer": "..."
#             }}
#         ]
#     }}
#     """
#     try:
#         raw_text = generate_with_failover(prompt)
#         cleaned_text = clean_json_string(raw_text)
        
#         # [LAYER 8, 9 & 10] 6-STAGE RECOVERY SYSTEM
#         # Designed specifically for "Invalid control character" AND "Expecting delimiter"
#         try:
#             # Attempt 1: Standard
#             return json.loads(cleaned_text)
#         except json.JSONDecodeError:
#             print(f"[{datetime.now()}] ⚠️ JSON Attempt 1 Failed. Engaging Nuclear Healing...")
            
#             # Attempt 2: NUCLEAR HEALING (Fixes newlines in strings)
#             try:
#                 healed_text = nuclear_json_healing(cleaned_text)
#                 return json.loads(healed_text)
#             except json.JSONDecodeError:
#                  print(f"[{datetime.now()}] ⚠️ JSON Attempt 2 (Nuclear) Failed. Engaging ROGUE QUOTE SURGEON...")
                 
#                  # Attempt 3: ROGUE QUOTE SURGEON (Fixes unescaped quotes)
#                  try:
#                      # Re-apply nuclear first to clean newlines, THEN apply surgeon
#                      text_stage_2 = nuclear_json_healing(cleaned_text)
#                      text_stage_3 = rogue_quote_surgeon(text_stage_2)
#                      return json.loads(text_stage_3)
#                  except json.JSONDecodeError:
#                      print(f"[{datetime.now()}] ⚠️ JSON Attempt 3 (Surgeon) Failed. Engaging Trailing Comma Fix...")
                     
#                      # Attempt 4: Trailing Commas (applied to Surgeon result)
#                      try:
#                         text_stage_3 = rogue_quote_surgeon(nuclear_json_healing(cleaned_text)) # Ensure we have base
#                         repaired_text = re.sub(r',\s*([\]}])', r'\1', text_stage_3)
#                         return json.loads(repaired_text)
#                      except:
#                          print(f"[{datetime.now()}] ⚠️ JSON Attempt 4 Failed. Engaging Brute Force...")

#                          # Attempt 5: Brute Force Backslashes (Last Resort)
#                          repaired_text = re.sub(r'\\(?![/\\bfnrtu"U])', r'\\\\', cleaned_text)
#                          try:
#                             return json.loads(repaired_text)
#                          except:
#                             # Attempt 6: Scorched Earth
#                             scorched_text = cleaned_text.replace('\\', '\\\\')
#                             try:
#                                  return json.loads(scorched_text)
#                             except:
#                                 # CRITICAL CRASH
#                                 print(f"[{datetime.now()}] ❌ AUDIT JSON CRASH.")
#                                 print(f"--- DUMPING BAD JSON ---\n{cleaned_text[:500]}...\n--------------------")
#                                 raise Exception("JSON Parsing Failed after all 6 recovery attempts.")

#     except Exception as e:
#         print(f"[{datetime.now()}] ❌ AUDIT ERROR: {e}")
#         raise e

# # ==============================================================================
# # MAIN EXECUTION (FOR TESTING)
# # ==============================================================================
# if __name__ == "__main__":
    
#     # 1. Setup
#     field = "Senior DevOps Engineer"
#     resume = "Experience with Kubernetes, Terraform, AWS, and CI/CD pipelines."
    
#     print(f"\n[{datetime.now()}] --- 1. Generating Unique Questions (15 Max) ---")
#     try:
#         # User requested 15 max
#         q1 = generate_resume_questions(field, resume, "Senior", 15)
#         print(json.dumps(q1, indent=2))
#     except Exception as e:
#         print(f"❌ RESUME_GENERATOR FAILED: {e}")
#         traceback.print_exc()

#     history_system.close()
#-----------------------------------------------------------------------------------------------------------------------------------------------
# 28 feb without timeout
import os
import google.generativeai as genai
import json
import itertools
import random
import time
import re
import traceback
import ast
import logging
import sys
import sqlite3
import threading
import unicodedata 
import concurrent.futures
from datetime import datetime
from dotenv import load_dotenv

# ==============================================================================
# 0. DIAGNOSTIC STARTUP & MODEL AUTO-DISCOVERY
# ==============================================================================
print(f"[{datetime.now()}] 🟢 SYSTEM STARTUP: Initializing Supreme Defense Systems (Resume Evaluator)...", flush=True)

# 1. Load Environment Variables
load_dotenv()

# --- WINDOWS UNICODE FIX ---
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# Force the logger to override any imported library hijackers
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("system_audit.log", encoding='utf-8')
    ],
    force=True 
)

api_key = os.getenv("GOOGLE_API_KEY")
is_mock_mode = False

if not api_key or ("AIzaSy" in api_key and len(api_key) < 10):
    print(f"[{datetime.now()}] ⚠️ SYSTEM STATUS: No valid Google API Key found. Running in SMART SIMULATION MODE.", flush=True)
    is_mock_mode = True
else:
    masked_key = f"{api_key[:5]}...{api_key[-5:]}"
    print(f"[{datetime.now()}] 🔑 API Key Detected: {masked_key}", flush=True)
    genai.configure(api_key=api_key)

# 2. MODEL AUTO-DISCOVERY (Prevents 404 Errors)
print(f"[{datetime.now()}] 📡 CONNECTING TO GOOGLE TO FETCH AVAILABLE MODELS...", flush=True)

live_models = []
if not is_mock_mode:
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                live_models.append(m.name)
        
        if not live_models:
            print(f"[{datetime.now()}] ⚠️ WARNING: Could not fetch live models. Using fallback list.", flush=True)
        else:
            print(f"[{datetime.now()}] ✅ FOUND {len(live_models)} LIVE MODELS. (Top: {live_models[0]})", flush=True)
    except Exception as e:
        print(f"[{datetime.now()}] ⚠️ CONNECTION WARNING: {e}", flush=True)
        live_models = []

# ==============================================================================
# 1. CONFIGURATION: PRIMARY VS FALLBACK MODEL LISTS
# ==============================================================================

def get_tiered_model_lists():
    """
    STRATEGY:
    Separates high-tier models (Primary) from lower-tier/legacy models (Fallback).
    Both lists are subjected to the exact same 15-Layer Defense and Timeout rules.
    """
    primary_candidates = [
        # --- TIER 1: THE BLEEDING EDGE ---
        'models/gemini-3.1-pro-preview',
        'models/gemini-3-flash-preview',
        'models/gemini-2.5-pro',
        'models/gemini-2.5-pro-latest',
        'models/gemini-2.5-pro-002',
        'models/gemini-2.5-flash',
        'models/gemini-2.5-flash-lite',
        'models/gemini-2.0-flash',
        'models/gemini-2.0-flash-001',
        'models/gemini-2.0-flash-lite',
        'models/gemini-2.0-flash-lite-001',
        # --- TIER 2: HIGH PERFORMANCE 1.5 ---
        'models/gemini-1.5-pro',
        'models/gemini-1.5-pro-latest',
        'models/gemini-1.5-pro-002',
        # --- TIER 3: HIGH SPEED 1.5 ---
        'models/gemini-1.5-flash',
        'models/gemini-1.5-flash-latest',
        'models/gemini-1.5-flash-002',
        'models/gemini-1.5-flash-8b',
    ]

    fallback_candidates = [
        # --- TIER 4: OPEN WEIGHTS (Prone to formatting errors, kept in fallback) ---
        'models/gemma-3-27b-it',
        'models/gemma-3-12b-it',
        'models/gemma-3-4b-it',
        'models/gemma-3-1b-it',
    ]

    seen = set()
    primary_list = []
    fallback_list = []
    
    # 1. Populate Primary List
    for m in primary_candidates:
        if m not in seen:
            primary_list.append(m)
            seen.add(m)
            
    # 2. Add unlisted live models to Primary (assume new Google releases are good)
    for m in live_models:
        if m not in seen and "gemma" not in m.lower():
            primary_list.append(m)
            seen.add(m)

    # 3. Populate Fallback List
    for m in fallback_candidates:
        if m not in seen:
            fallback_list.append(m)
            seen.add(m)

    return primary_list, fallback_list

PRIMARY_MODELS, FALLBACK_MODELS = get_tiered_model_lists()

# ==============================================================================
# 2. SECURITY & UTILS: SUPREME DEFENSE SYSTEM
# ==============================================================================

def sanitize_input_for_prompt(text, max_chars=25000):
    if not isinstance(text, str): return ""
    if len(text) > max_chars:
        text = text[:max_chars] + "... [TRUNCATED]"
    text = text.replace("### SYSTEM OVERRIDE", "").replace("### INSTRUCTION", "")
    return text.strip()

def sanitize_control_chars(text):
    text = re.sub(r'```[a-zA-Z]*\n', '', str(text))
    text = text.replace("```", "")
    return "".join(ch for ch in text if ord(ch) >= 32 or ch in "\n\r\t")

def balance_brackets(text):
    stack = []
    for char in text:
        if char in '{[':
            stack.append(char)
        elif char in '}]':
            if stack:
                last = stack[-1]
                if (char == '}' and last == '{') or (char == ']' and last == '['):
                    stack.pop()
    balanced = text
    while stack:
        opener = stack.pop()
        if opener == '{': balanced += '}'
        elif opener == '[': balanced += ']'
    return balanced

def extract_json_candidates(text):
    candidates = []
    matches = list(re.finditer(r'(\{.*\}|\[.*\])', text, re.DOTALL))
    for m in matches:
        candidates.append(m.group(0))
    if not candidates:
        start_brace = text.find('{')
        start_bracket = text.find('[')
        if start_brace != -1: candidates.append(text[start_brace:])
        elif start_bracket != -1: candidates.append(text[start_bracket:])
    return candidates if candidates else [text]

def nuclear_json_healing(text):
    pattern = r'("(?:[^"\\]|\\.)*")'
    def replacer(match):
        content = match.group(1)
        content = content.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
        return content
    return re.sub(pattern, replacer, text, flags=re.DOTALL)

def rogue_quote_surgeon(text):
    pattern = r'(?<=[\w\s])"(?=[\w\s])'
    return re.sub(pattern, '\\"', text)

def enforce_schema(data, expected_type):
    if expected_type == 'list':
        if isinstance(data, list): return data
        if isinstance(data, dict):
            for key in data:
                if isinstance(data[key], list): return data[key]
            return [data]
        raise ValueError(f"Schema violation: Expected list, got {type(data).__name__}")
        
    if expected_type == 'dict':
        if isinstance(data, dict): return data
        if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            return data[0]
        raise ValueError(f"Schema violation: Expected dict, got {type(data).__name__}")
        
    return data

def safe_literal_eval(candidate):
    if len(candidate) > 50000: 
        raise ValueError("Candidate too large for safe evaluation")
    return ast.literal_eval(candidate)

def bulletproof_json_parser(raw_text, expected_type='dict'):
    if isinstance(raw_text, (dict, list)):
        return enforce_schema(raw_text, expected_type)

    clean_text = sanitize_control_chars(str(raw_text))
    candidates = extract_json_candidates(clean_text)

    for candidate in candidates:
        try: return enforce_schema(json.loads(candidate), expected_type)
        except: pass
        try:
            fixed = re.sub(r',\s*([\]}])', r'\1', candidate)
            return enforce_schema(json.loads(fixed), expected_type)
        except: pass
        try: return enforce_schema(safe_literal_eval(candidate), expected_type)
        except: pass
        try:
            fixed = re.sub(r'\\(?![/\\bfnrtu"U])', r'\\\\', candidate)
            return enforce_schema(json.loads(fixed), expected_type)
        except: pass
        try:
            healed = nuclear_json_healing(candidate)
            return enforce_schema(json.loads(healed), expected_type)
        except: pass
        try:
            surgeoed = rogue_quote_surgeon(nuclear_json_healing(candidate))
            return enforce_schema(json.loads(surgeoed), expected_type)
        except: pass
        try:
            balanced = balance_brackets(candidate)
            return enforce_schema(json.loads(balanced), expected_type)
        except: pass
        
        if expected_type == 'list':
            try:
                obj_matches = re.findall(r'\{.*?\}', candidate, re.DOTALL)
                reconstructed_list = []
                for obj_str in obj_matches:
                    try: reconstructed_list.append(json.loads(obj_str))
                    except: pass
                if reconstructed_list: return reconstructed_list
            except: pass

    raise ValueError(f"CRITICAL PARSE FAILURE: Could not extract valid '{expected_type}' from model output.")

# ==============================================================================
# 3. ROBUST HISTORY MANAGER (Connection Pooling & WAL Mode)
# ==============================================================================

class HistoryManager:
    DB_FILE = "resume_evaluator_history.db"
    STOPWORDS = {
        "the", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by", 
        "is", "are", "was", "were", "be", "been", "this", "that", "it", 
        "calculate", "find", "what", "how", "write", "function", "program",
        "determine", "probability", "value", "given", "assume", "suppose",
        "explain", "describe", "code", "create", "list", "difference", "between"
    }

    def __init__(self):
        self.conn = None
        self.lock = threading.Lock() 
        self._initialize_db()

    def _initialize_db(self):
        try:
            self.conn = sqlite3.connect(self.DB_FILE, check_same_thread=False, timeout=15)
            cursor = self.conn.cursor()
            cursor.execute('PRAGMA journal_mode=WAL;')
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS evaluations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic TEXT,
                    data TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            self.conn.commit()
        except Exception as e: 
            print(f"HISTORY INIT ERROR: {e}", flush=True)

    def get_past_questions(self, topic):
        clean_topic = topic.lower().strip()
        try:
            with self.lock: 
                cursor = self.conn.cursor()
                cursor.execute("SELECT data FROM evaluations WHERE topic = ? ORDER BY id DESC LIMIT 85", (clean_topic,))
                return [row[0] for row in cursor.fetchall()]
        except Exception as e:
            print(f"DB READ ERROR: {e}", flush=True)
            return []

    def add_questions(self, topic, new_questions):
        clean_topic = topic.lower().strip()
        data_to_insert = []
        for q in new_questions:
            if isinstance(q, dict) and 'question' in q:
                data_to_insert.append((clean_topic, q['question']))
            elif isinstance(q, str):
                data_to_insert.append((clean_topic, q))
        try:
            with self.lock:
                cursor = self.conn.cursor()
                cursor.executemany("INSERT INTO evaluations (topic, data) VALUES (?, ?)", data_to_insert)
                self.conn.commit()
        except Exception as e: print(f"DB WRITE ERROR: {e}", flush=True)

    def close(self):
        if self.conn: self.conn.close()

    def _tokenize(self, text):
        if not text: return set()
        text = re.sub(r'[^\w\s]', '', text.lower())
        return set(word for word in text.split() if word not in self.STOPWORDS and len(word) > 2)

    def is_duplicate(self, new_question_text, past_questions, jaccard_threshold=0.45):
        if not new_question_text: return True
        new_tokens = self._tokenize(new_question_text)
        if len(new_tokens) < 3: return False 
        for past_q in past_questions:
            past_tokens = self._tokenize(past_q)
            intersection = new_tokens.intersection(past_tokens)
            union = new_tokens.union(past_tokens)
            if len(union) == 0: continue
            if (len(intersection) / len(union)) > jaccard_threshold: return True
        return False

history_system = HistoryManager()

# ==============================================================================
# 4. CORE ENGINE: SYNCHRONOUS TIMEOUT ENFORCER & PRIMARY/FALLBACK FAILOVER
# ==============================================================================

MAX_CONCURRENT = int(os.getenv("MAX_CONCURRENT_REQUESTS", 5))
CONCURRENCY_GUARD = threading.Semaphore(MAX_CONCURRENT) 

def generate_with_timeout_protection(model, prompt, timeout=120):
    if not CONCURRENCY_GUARD.acquire(timeout=5):
        raise SystemError("SYSTEM OVERLOAD: Too many active requests. Backing off.")
        
    try:
        def _make_call():
            from google.generativeai.types import HarmCategory, HarmBlockThreshold
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
            return model.generate_content(prompt, safety_settings=safety_settings)

        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            try:
                future = executor.submit(_make_call)
                return future.result(timeout=timeout)
            except Exception as e:
                if isinstance(e, concurrent.futures.TimeoutError):
                    raise TimeoutError(f"Model execution exceeded {timeout}s.")
                else:
                    raise e
    finally:
        CONCURRENCY_GUARD.release()

def generate_with_failover(prompt, expected_type='dict', timeout_val=45, max_retries=55):
    """
    STRICT FAILOVER: Demands valid JSON within exact timeout.
    Sequentially tests Primary Models. If all fail, automatically tests Fallback Models.
    """
    combined_models = PRIMARY_MODELS + FALLBACK_MODELS
    attempts = 0
    failed_models_log = []
    
    print(f"\n🚀 [AI ENGINE START] Available Models: Primary({len(PRIMARY_MODELS)}) + Fallback({len(FALLBACK_MODELS)})", flush=True)
    
    for current_model in combined_models:
        attempts += 1
        if attempts > max_retries:
            print(f"🛑 [FAILOVER HALTED] Reached max retries ({max_retries}).", flush=True)
            break

        # Warn user when Primary fails and Fallback Defense System engages
        if current_model in FALLBACK_MODELS and attempts > 1 and current_model == FALLBACK_MODELS[0]:
            print("\n⚠️ [WARNING] PRIMARY MODELS EXHAUSTED. DEPLOYING FALLBACK MODELS WITH FULL DEFENSE SYSTEM...\n", flush=True)
            
        print(f"🔄 [ATTEMPT {attempts}] Testing Model: '{current_model}' (Timeout: {timeout_val}s)...", flush=True)
        
        try:
            model = genai.GenerativeModel(current_model)
            response = generate_with_timeout_protection(model, prompt, timeout=timeout_val)
            
            if not response:
                raise ValueError("API returned a None response.")
            
            try:
                raw_text = response.text
            except ValueError:
                raise ValueError("Response blocked by AI safety filters or missing text payload.")
            
            if isinstance(raw_text, (dict, list)):
                raw_text = json.dumps(raw_text)
                
            if not raw_text or not str(raw_text).strip():
                raise ValueError("Empty text received from model.")
                
            parsed_data = bulletproof_json_parser(raw_text, expected_type=expected_type)
            
            if expected_type == 'list' and not isinstance(parsed_data, list):
                 print(f"⚠️ [RAW OUTPUT SNIPPET]:\n{str(raw_text)[:300]}...\n", flush=True)
                 raise ValueError(f"AI Format Error: Expected a list `[]`, but got {type(parsed_data).__name__}.")
            if expected_type == 'dict' and not isinstance(parsed_data, dict):
                 print(f"⚠️ [RAW OUTPUT SNIPPET]:\n{str(raw_text)[:300]}...\n", flush=True)
                 raise ValueError(f"AI Format Error: Expected a dict `{{}}`, but got {type(parsed_data).__name__}.")
            if not parsed_data:
                 print(f"⚠️ [RAW OUTPUT SNIPPET]:\n{str(raw_text)[:300]}...\n", flush=True)
                 raise ValueError("Parsed data is empty.")

            print(f"✅ [SUCCESS] Model '{current_model}' connected and generated valid JSON!", flush=True)
            if failed_models_log:
                print(f"⚠️ [PREVIOUS FAILURES] Models that failed before this success: {', '.join(failed_models_log)}", flush=True)

            if isinstance(parsed_data, dict):
                parsed_data["evaluating_model_success"] = current_model
                parsed_data["evaluating_model_failures"] = failed_models_log

            return parsed_data
            
        except TimeoutError:
            print(f"⏳ [TIMEOUT] Model '{current_model}' breached {timeout_val}s limit. Switching immediately...", flush=True)
            failed_models_log.append(f"{current_model} (Timeout)")
            time.sleep(0.5) 
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                backoff_time = min(2 ** attempts, 8) 
                print(f"⚠️ [RATE LIMITED] 429 Quota Error. Backing off for {backoff_time}s to avoid ban...", flush=True)
                failed_models_log.append(f"{current_model} (429 Rate Limit)")
                time.sleep(backoff_time)
            else:
                print(f"❌ [FAILED] Model '{current_model}' rejected output: {error_msg[:120]}", flush=True)
                failed_models_log.append(f"{current_model} (Error)")
                time.sleep(0.5) 
            
    raise Exception(f"CRITICAL FAILURE: All Primary and Fallback models failed. Failure Log: {failed_models_log}")

# ==============================================================================
# 5. ENGINE: RESUME QUESTION GENERATOR (FULL SUPREME MODE RESTORED)
# ==============================================================================

def generate_resume_questions(topic, resume_text, difficulty="Expert", count=5):
    # Defense Layers 1-2
    clean_topic = sanitize_input_for_prompt(topic)
    clean_resume = sanitize_input_for_prompt(resume_text)
    
    # --- EXACT MOCK MODE YOU REQUESTED ---
    if is_mock_mode:
        return [
            {"id": 1, "type": "coding", "question": f"Mock Coding: Optimize a distributed {clean_topic} lock."},
            {"id": 2, "type": "theory", "question": f"Mock Theory: Explain CAP theorem in {clean_topic}."},
            {"id": 3, "type": "hr", "question": "Mock HR: Describe a conflict with a Product Manager."},
            {"id": 4, "type": "aptitude", "question": "Mock Aptitude: A train 150m long is running at 60kmph..."}
        ]
    
    # --- REQUESTED EMPTY RESUME CHECK ---
    if not clean_resume or len(clean_resume) < 50:
        print(f"[{datetime.now()}] ❌ RESUME_GENERATOR FAILED: Standalone mode - AI skipped", flush=True)
        return [] 
    # --------------------------------

    # Setup History
    db_key = f"{clean_topic}_{difficulty}"
    past_questions = history_system.get_past_questions(db_key)
    exclusion_sample = past_questions[:85]
    exclusion_text = ""
    if exclusion_sample:
        exclusion_text = "### EXCLUSION LIST (DO NOT ASK THESE):\n" + "\n".join([f"- {q}" for q in exclusion_sample])

    unique_seed = random.randint(10000, 99999)
    buffer_count = count * 2 
    
    prompt = f"""
    ### SYSTEM OVERRIDE: SUPREME ARCHITECT MODE
    - **STRICTLY FORBIDDEN:** Conversational fillers.
    - **MANDATORY:** Output must be RAW JSON only.
    - **ESCAPING RULES:** Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).
    
    - **IDENTITY:** You are the 'Chief Talent Architect' AND 'Bob' (The Elite Forensic Auditor).
    - **DATABASE ACCESS:** You have direct access to a simulated **Global Interview Database of 100,000+ Verified Questions** across 25+ domains.
    - **METHOD:** You perform 'Resume DNA Analysis' combined with 'Forensic Text Interrogation'.
    - **GOAL:** 90%+ Difficulty. Top 1% Hiring Standard.

    ### CONTEXT & SIMULATION PARAMETERS:
    1. **THE FIELD:** {clean_topic.upper()}
    2. **DIFFICULTY:** {difficulty}
    3. **SEED:** {unique_seed} (Randomization Token).

    {exclusion_text}

    ### CANDIDATE RESUME TEXT:
    \"\"\"
    {clean_resume}
    \"\"\"

    ### PHASE 1: FORENSIC DNA & TEMPLATE CHECK
    Analyze if the resume matches the **structural and semantic DNA** of a {clean_topic} professional.
    **SUPPORTED DNA DOMAINS:**
    - Software Engineering (Scalability, Trade-offs)
    - Medical/Doctor (Pathology, Protocol)
    - Chartered Accountancy (Compliance, Risk)
    - Civil/Mech Engineering (Safety, Physics)
    - Law, HR, Sales, Aviation, & Government.

    **FAILURE CONDITION:**
    If the resume is generic gibberish or belongs to a wrong profession REJECT IT.
    Output: [{{ "id": 0, "error": "TEMPLATE_MISMATCH", "question": "Resume template not matched." }}]

    ### PHASE 2: RESUME AUTOPSY (BOB'S PAPER TIGER SCAN)
    (Execute only if Phase 1 passes). Scan for buzzwords without depth ("Paper Tigers"):
    - **Microservices?** Ask about *Distributed Tracing & Saga Patterns*.
    - **Management?** Ask about *Handling Toxic High-Performers*.
    - **Audit?** Ask about *Detecting Fraud in seemingly perfect books*.

    ### PHASE 3: QUERY RANDOMIZATION PROTOCOL (MANDATORY)
    You must simulate a Random SQL Retrieval to ensure high entropy and avoid cliches.
    
    **EXECUTE THE FOLLOWING SIMULATION LOGIC:**
    1. **SET SEED:** {unique_seed}
    2. **ACCESS TABLE:** `{clean_topic}_QuestionBank` (Size: 100,000+ Rows)
    3. **FILTER:** `WHERE Difficulty = '{difficulty}' AND Type = 'Scenario_Based' AND Is_Cliche = FALSE`
    4. **RANDOMIZE:** `ORDER BY RANDOM(SEED={unique_seed})`
    5. **LIMIT:** {buffer_count}

    **CRITICAL CONSTRAINT:** - Do NOT select the top 100 most common questions for {clean_topic}. (e.g., NO "What is OOP?", NO "What is a Debit?").
    - Select specific, scenario-based edge cases that only a practitioner would know.

    ### PHASE 4: QUESTION REFINEMENT (90%+ QUALITY)
    Refine the selected questions using Bob's "Brutal Difficulty" rules:
    1. **Disaster Scenarios:** Ask "Here is a disaster involving X, how do you fix it?"
    2. **Trade-Offs:** Force a choice between two bad options (Latency vs Consistency, Speed vs Safety).
    3. **Resume Specificity:** Start with: "Your resume claims [Project X]..." or "You listed [Tool Y]..."

    ### OUTPUT FORMAT (JSON ONLY):
    [
        {{
            "id": 1,
            "type": "resume_specific", 
            "question": "Referring to your 'Cloud Migration' project: You moved from On-Prem to AWS. If your specific latency requirements were <5ms but the new cloud load balancer added 10ms overhead, how did you re-architect the network layer to solve this without abandoning the cloud?" 
        }}
    ]
    """
    try:
        parsed_questions = generate_with_failover(prompt, expected_type='list', timeout_val=45)

        unique_batch = []
        for item in parsed_questions:
            q_text = item.get("question", "")
            if not history_system.is_duplicate(q_text, past_questions):
                unique_batch.append(item)
                if len(unique_batch) >= count: break
        
        if unique_batch:
            history_system.add_questions(db_key, unique_batch)
            return unique_batch
        else:
            return parsed_questions[:count]

    except Exception as e:
        print(f"[{datetime.now()}] ❌ GENERATION ERROR: {e}", flush=True)
        return [{"id": 0, "error": "GENERATION_CRASH", "question": "System failure after maximum retries. Please try again."}]

# ==============================================================================
# 6. ENGINE: RESUME EVALUATOR (FULL BOB PROMPT RESTORED)
# ==============================================================================

def evaluate_resume_session(transcript_data, field="General", experience="Entry Level"):
    if is_mock_mode:
        return {
            "score": 85,
            "summary": "Mock Mode: Simulation active.",
            "silent_killers": ["Mock Mode Active"],
            "roadmap": "Deploy to production.",
            "question_reviews": [],
            "evaluating_model_success": "mock-simulation-engine",
            "evaluating_model_failures": []
        }

    if not transcript_data: return {}

    clean_field = sanitize_input_for_prompt(field)
    
    prompt = f"""
    ### SYSTEM OVERRIDE: SUPREME AUDITOR MODE
    - **STRICTLY FORBIDDEN:** Conversational fillers.
    - **MANDATORY:** Output must be RAW JSON only.
    - **ESCAPING RULES:** Double-escape all backslashes (\\\\ -> \\\\\\\\). Escape newlines in strings (\\n -> \\\\n).

    ### ROLE: CHIEF TALENT ARCHITECT & SUPREME FORENSIC AUDITOR (CODE NAME: BOB)
    - **CONTEXT:** You are the Global Head of Talent Acquisition with 100% mastery of 50+ Professional Domains (Engineering, Medical, Finance, Law, etc.).
    - **TASK:** Conduct a ruthless "Resume Verification Analysis" & "Forensic Audit" of the candidate.
    - **DIRECTIVE:** Provide MAXIMUM DATA DENSITY. Do not summarize; expand on every detail with paragraph-length forensic insights.

    ### TRANSCRIPT DATA:
    {json.dumps(transcript_data)}

    ### PHASE 1: FORENSIC DNA & TEMPLATE INTEGRITY CHECK
    Analyze if the candidate's answers match the **structural and semantic DNA** of a {clean_field} professional.
    - **Lexicon Verification:** Does a Doctor use 'Triage'? Does a Dev use 'CI/CD'? Does a Pilot use 'METAR'?
    - **Experience Verification:** Does the depth match {experience}? (Entry = 'How', Senior = 'Why/Trade-offs').
    - **Fraud Detection:** Identify vague answers ("I handled everything") that suggest Resume Padding.

    ### PHASE 2: THE "BOB" DEEP DIVE (HIGH DETAIL PROTOCOL)
    For every answer, perform a "Claim vs. Reality" Check:
    1. **Deep Dive Analysis:** Write a PARAGRAPH (not a sentence) explaining exactly *why* the answer was strong or weak.
    2. **Technical Nuance:** Even if the answer is good, add "Expert Level Nuance" to show what a Top 1% answer would look like.
    3. **Benefit of Doubt vs. Rigor:** Be generous in interpretation but strict in scoring.

    ### PHASE 3: SCORING CRITERIA (STRICT & MERIT-BASED)
    Do NOT inflate the score. Judge honestly based on the "Golden Standard":
    - **90-100 (Hired):** Exceptional. Perfect domain lexicon. Senior-level trade-off analysis.
    - **70-89 (Strong):** Good. Minor gaps but generally truthful and competent.
    - **40-69 (Weak):** Inconsistent. Struggles with concepts expected at this level.
    - **0-39 (Fraud/Mismatch):** Imposter. Answers contradict the resume or professional standards.

    ### OUTPUT REQUIREMENTS (JSON):
    1. **score:** (Integer 0-100). Be strict.
    2. **summary:** A detailed forensic executive summary (60-80 words). Verdict on hireability.
    3. **silent_killers:** List 2-3 specific behavioral or technical red flags (e.g., "Claimed 5 years Java but stuck on basic OOP").
    4. **roadmap:** A specific, actionable 3-step plan to bridge the gap to the next level.
    5. **question_reviews:** - "feedback": A detailed technical paragraph (2-3 sentences).
        - "ideal_answer": The textbook-perfect response using industry-standard jargon.

    OUTPUT FORMAT (JSON ONLY):
    {{
        "score": <number>,
        "summary": "...",
        "silent_killers": ["..."],
        "roadmap": "...",
        "question_reviews": [
            {{
                "question": "...",
                "user_answer": "...",
                "score": 8,
                "feedback": "...",
                "ideal_answer": "..."
            }}
        ]
    }}
    """
    try:
        analysis_dict = generate_with_failover(prompt, expected_type='dict', timeout_val=45)
        return analysis_dict
    except Exception as e:
        print(f"[{datetime.now()}] ❌ EVALUATION CRASHED. EXTINCTION EVENT: {e}", flush=True)
        
        # Hard Heuristic Fallback
        total_words = 0
        reviews = []
        safe_transcript = transcript_data if isinstance(transcript_data, list) else []
        
        for item in safe_transcript:
            ans = str(item.get('answer', ''))
            word_count = len(ans.split())
            total_words += word_count
            algo_score = 4
            if word_count > 30: algo_score = 8
            elif word_count > 10: algo_score = 6
            reviews.append({
                "question": item.get('question', 'Unknown'),
                "user_answer": ans,
                "score": algo_score,
                "feedback": "Detailed AI analysis bypassed due to API failure.",
                "ideal_answer": "Provide a well-structured answer with examples."
            })

        safe_len = len(safe_transcript) or 1
        final_score = min(88, max(40, int((total_words / safe_len) * 2)))

        return {
            "score": final_score,
            "summary": "Evaluation Complete. AI analysis bypassed due to complete API cascade failure.",
            "silent_killers": ["System Extinction Event Triggered"], 
            "roadmap": "Retry API connection later.",
            "question_reviews": reviews,
            "evaluating_model_success": "hard-fallback-heuristic-engine",
            "evaluating_model_failures": ["ALL_MODELS_FAILED"]
        }

# ==============================================================================
# MAIN EXECUTION (FOR TESTING)
# ==============================================================================
if __name__ == "__main__":
    
    # 1. Setup
    field = "Senior DevOps Engineer"
    resume = "Experience with Kubernetes, Terraform, AWS, and CI/CD pipelines."
    
    print(f"\n[{datetime.now()}] --- 1. Generating Unique Questions (2 Max) ---")
    try:
        q1 = generate_resume_questions(field, resume, "Senior", 2)
        print(json.dumps(q1, indent=2))
        
        # Build mock transcript
        transcript = []
        for q in q1:
             transcript.append({
                 "question": q.get("question", "Error"),
                 "answer": "I used Terraform to provision EKS clusters and wrote Jenkins pipelines."
             })
             
        print(f"\n[{datetime.now()}] --- 2. Evaluating Interview ---")
        analysis = evaluate_resume_session(transcript, field, "Senior")
        print(json.dumps(analysis, indent=2))
        
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        traceback.print_exc()

    history_system.close()

    

    