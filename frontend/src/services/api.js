// import axios from 'axios';

// // --- CONFIGURATION ---
// // We are routing everything to the Python AI Engine for now 
// // to ensure the Delete/Save features work with the new db.json system.
// const PYTHON_API = 'http://localhost:8000';
// const NODE_API = 'http://localhost:5000/api'; // Kept for future Auth use

// // --- AI ENGINE (Python) ---

// // 1. Generate Questions
// export const generateQuestions = (config) => {
//     return axios.post(`${PYTHON_API}/generate`, config);
// };

// // 2. Evaluate Session
// export const evaluateSession = (transcript) => {
//     return axios.post(`${PYTHON_API}/evaluate_session`, transcript);
// };

// // --- DATA STORAGE (Now routed to Python Backend for simplicity) ---

// // 3. Save Interview (Updated to hit Python db.json)
// export const saveInterview = (data) => {
//     return axios.post(`${PYTHON_API}/interviews`, data);
// };

// // 4. Get History (Updated to hit Python db.json)
// export const getInterviews = () => {
//     return axios.get(`${PYTHON_API}/interviews`);
// };

// // 5. Delete Session (THE MISSING EXPORT)
// export const deleteSession = (id) => {
//     return axios.delete(`${PYTHON_API}/interviews/${id}`);
// };

// // --- AUTH (Node.js - Optional/Future) ---
// export const loginUser = (data) => axios.post(`${NODE_API}/auth/login`, data);
// export const registerUser = (data) => axios.post(`${NODE_API}/auth/register`, data);
//--------------------------------------------------------------------------------------------------------------
import axios from 'axios';

// --- CONFIGURATION ---
// We are routing everything to the Python AI Engine (Port 8000)
// const PYTHON_API = 'http://localhost:8000';
// const NODE_API = 'http://localhost:5000/api'; 
// --- CONFIGURATION ---
// VITE_PYTHON_API_URL will be injected by Render during deployment
const PYTHON_API = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
const NODE_API = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5000/api';
// ==========================================
//  1. AI GENERATION & LOGIC
// ==========================================

// Standard Mock Interview Questions
// FIXED: Now accepts a single 'config' object to match your previous Setup.jsx
export const generateQuestions = (config) => {
    return axios.post(`${PYTHON_API}/generate`, config);
};

// Resume Analysis Questions
export const generateResumeQuestions = (resumeText, domain, yoe, count) => {
    return axios.post(`${PYTHON_API}/generate_resume_questions`, {
        resume_text: resumeText,
        domain: domain,
        yoe: parseInt(yoe),
        count: parseInt(count)
    });
};

// Chat Coach (Assistant)
export const chatWithCoach = (message, context) => {
    return axios.post(`${PYTHON_API}/chat`, {
        message,
        context
    });
};

// ==========================================
//  2. EVALUATION ENDPOINTS
// ==========================================

export const evaluateSession = (transcript) => {
    return axios.post(`${PYTHON_API}/evaluate_session`, { transcript });
};

export const evaluateResumeSession = (transcript, domain, experienceLevel) => {
    return axios.post(`${PYTHON_API}/evaluate_resume_session`, {
        transcript,
        domain,
        experience_level: experienceLevel
    });
};

// ==========================================
//  3. DATA STORAGE (Python db.json)
// ==========================================

export const saveInterview = (data) => {
    return axios.post(`${PYTHON_API}/interviews`, data);
};

export const getInterviews = () => {
    return axios.get(`${PYTHON_API}/interviews`);
};

export const deleteSession = (id) => {
    return axios.delete(`${PYTHON_API}/interviews/${id}`);
};
export const clearAllSessions = () => {
    return axios.delete(`${PYTHON_API}/api/sessions/clear`);
};
// ==========================================
//  4. AUTH (Node.js - Optional)
// ==========================================
export const loginUser = (data) => axios.post(`${NODE_API}/auth/login`, data);
export const registerUser = (data) => axios.post(`${NODE_API}/auth/register`, data);