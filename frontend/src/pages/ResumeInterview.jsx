// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import WebcamFeed from '../components/WebcamFeed';
// import { evaluateSession, saveInterview } from '../services/api';
// import { loadProctoringModels } from '../utils/face-proctor';

// // --- EMBEDDED BEEP SOUND (Base64) ---
// const BEEP_URL = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMQAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZGlhZy4wAAD/7kmRAAAAAA0gAAAAANIAAAAADSCAAAA0ggAAAAAAAAAAAAAAA//uSZIYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmRmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmSmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmSmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAA";

// const Interview = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   // --- 1. PERSISTENCE LAYER ---
//   const SESSION_KEY = "interview_session_backup";
  
//   const getInitialState = () => {
//     const saved = localStorage.getItem(SESSION_KEY);
//     const propsData = location.state || {};
    
//     // CASE 1: Page Refresh (No Props, but LocalStorage exists)
//     if (saved && !propsData.questions) {
//       return JSON.parse(saved);
//     }

//     // CASE 2: New Interview Start (Props exist)
//     if (propsData.questions) {
//       if (saved) {
//         const parsed = JSON.parse(saved);
//         if (parsed.config?.topic === propsData.config?.topic) {
//           return parsed;
//         } else {
//           return {
//             questions: propsData.questions,
//             config: propsData.config,
//             currIndex: 0,
//             answers: [],
//             currentAnswer: "",
//             violations: 0 
//           };
//         }
//       }
//       return {
//         questions: propsData.questions || ["Error: No Questions Loaded"],
//         config: propsData.config || { topic: "Unknown", round: "General" },
//         currIndex: 0,
//         answers: [],
//         currentAnswer: "",
//         violations: 0 
//       };
//     }

//     // Fallback default
//     return {
//       questions: ["Error: No Questions Loaded"],
//       config: { topic: "Unknown", round: "General" },
//       currIndex: 0,
//       answers: [],
//       currentAnswer: "",
//       violations: 0
//     };
//   };

//   // Initialize State
//   const initialState = getInitialState();
//   const [questions] = useState(initialState.questions);
//   const [config] = useState(initialState.config);
  
//   const [currIndex, setCurrIndex] = useState(initialState.currIndex);
//   const [answers, setAnswers] = useState(initialState.answers);
//   const [currentAnswer, setCurrentAnswer] = useState(initialState.currentAnswer);
  
//   // --- FLAG STATE (PERSISTED) ---
//   const [violations, setViolations] = useState(initialState.violations);
  
//   // Runtime State
//   const [isListening, setIsListening] = useState(false);
//   const [processing, setProcessing] = useState(false);
  
//   // --- INTEGRITY & PROCTORING STATE ---
//   const [cameraStatus, setCameraStatus] = useState('checking'); // 'checking' | 'granted' | 'denied'
//   const [hasStarted, setHasStarted] = useState(false);
//   const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
//   const [isDisqualified, setIsDisqualified] = useState(false); // Permanent Block

//   const [showViolationModal, setShowViolationModal] = useState(false); // Tab Switch only
//   const [showFullScreenExitModal, setShowFullScreenExitModal] = useState(false); // Full Screen Exit
  
//   // NEW: Privacy Shutter State
//   const [showPrivacyShutterModal, setShowPrivacyShutterModal] = useState(false);

//   // Refs for tracking duration of bad behavior
//   const lastViolationTime = useRef(0);
  
//   // Timers for specific violations (in milliseconds/seconds)
//   const faceMissingCycleRef = useRef(0); // Tracks 1, 2, 3 strikes
//   const privacyShutterTimerRef = useRef(0); // Timer for 2-minute limit

//   const MAX_VIOLATIONS = 10;

//   // --- SAVE STATE ON CHANGE ---
//   useEffect(() => {
//     const stateToSave = {
//       questions,
//       config,
//       currIndex,
//       answers,
//       currentAnswer,
//       violations
//     };
//     localStorage.setItem(SESSION_KEY, JSON.stringify(stateToSave));
//   }, [currIndex, answers, currentAnswer, violations, questions, config]);

//   // --- 0. INITIAL CAMERA CHECK (MANDATORY) ---
//   useEffect(() => {
//     async function checkCamera() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         stream.getTracks().forEach(track => track.stop());
//         setCameraStatus('granted');
//       } catch (err) {
//         console.error("Camera permission denied:", err);
//         setCameraStatus('denied');
//       }
//     }
//     checkCamera();
//     loadProctoringModels();
//   }, []);

//   // --- TERMINATION HELPER (UPDATED TO SAVE DISQUALIFICATION) ---
//   const terminateSession = useCallback(async (reason) => {
//     // 1. Force Exit Full Screen
//     if (document.fullscreenElement) {
//         document.exitFullscreen().catch(() => {});
//     }

//     // 2. SAVE FAILED SESSION TO DB (The Fix)
//     try {
//         const failurePayload = {
//             questions: answers, // Save whatever answers were recorded
//             topic: config.topic || "Terminated Session", // Ensure topic is logged
//             totalScore: 0, // Score 0 for disqualification
//             overallFeedback: `DISQUALIFIED: ${reason}. The session was terminated due to suspicious activity.`,
//             roadmap: "N/A",
//             question_reviews: [],
//             silent_killers: ["Procedural Integrity Violation"],
//             integrity_score: 0,
//             violations_count: violations
//         };
//         console.log("💾 Saving Terminated Session...", failurePayload);
//         await saveInterview(failurePayload);
//     } catch (e) {
//         console.error("Failed to save termination log:", e);
//     }

//     localStorage.removeItem(SESSION_KEY);
//     const video = document.querySelector('video');
//     if (video && video.srcObject) {
//       video.srcObject.getTracks().forEach(track => track.stop());
//     }
//     navigate('/'); 
//   }, [navigate, SESSION_KEY, answers, config.topic, violations]);

//   // --- FULL SCREEN ENFORCEMENT ---
//   const enterFullScreen = async () => {
//     const elem = document.documentElement;
//     try {
//       if (elem.requestFullscreen) {
//         await elem.requestFullscreen();
//       } else if (elem.webkitRequestFullscreen) { /* Safari */
//         await elem.webkitRequestFullscreen();
//       } else if (elem.msRequestFullscreen) { /* IE11 */
//         await elem.msRequestFullscreen();
//       }
//     } catch (err) {
//       console.log("Full screen request denied:", err);
//     }
//   };

//   const handleStartInterview = () => {
//     if (!disclaimerAccepted) return alert("You must agree to the guidelines.");
    
//     // ATTEMPT FULL SCREEN ON START
//     enterFullScreen().then(() => {
//         setHasStarted(true);
//     }).catch(() => {
//         // Even if automatic fails, we set state to started
//         // The useEffect hook below will catch the lack of full screen and trigger the modal
//         setHasStarted(true);
//     });
//   };

//   // --- VIOLATION HANDLER ---
//   const handleViolation = useCallback((reason, isMajor = false) => {
//     if (!hasStarted || isDisqualified) return;

//     // A. PRIVACY SHUTTER
//     if (reason === "Privacy Shutter Detected") {
//         setShowPrivacyShutterModal(true);
//         return;
//     }

//     // B. FACE MISSING CYCLE (The 3-Strike Rule)
//     if (reason === "FACE_MISSING_20S") {
//         faceMissingCycleRef.current += 1;
//         const strikes = faceMissingCycleRef.current;
//         console.warn(`Face Missing Strike: ${strikes}/3`);

//         if (strikes >= 3) {
//             // === INSTANT TERMINATION LOGIC ===
//             setIsDisqualified(true); // Stop other logic
            
//             // 1. Exit Full Screen immediately
//             if (document.fullscreenElement) {
//                 document.exitFullscreen().catch(()=>{});
//             }
            
//             // 2. Alert
//             alert("You attempted cheating (Face Missing 3x).");
            
//             // 3. Navigate Home (Via Terminate)
//             terminateSession("Face Missing 3x");
//         } else {
//             // Just a warning
//             setViolations(prev => prev + 1);
//             alert(`WARNING: Face not visible for 20s. Strike ${strikes}/3.`);
//         }
//         return;
//     }

//     // C. GENERAL VIOLATIONS (Debounced)
//     const now = Date.now();
//     if (now - lastViolationTime.current < 1000) return;
//     lastViolationTime.current = now;
    
//     new Audio(BEEP_URL).play().catch(()=>{});
    
//     console.warn(`VIOLATION: ${reason}`);
//     setViolations(prev => {
//         const newCount = prev + 1;
//         if (newCount >= MAX_VIOLATIONS) {
//             setIsDisqualified(true);
//         }
//         return newCount;
//     });
    
//     if (reason.includes("Tab") || reason.includes("Focus")) {
//       setShowViolationModal(true);
//     }
//   }, [hasStarted, isDisqualified, terminateSession]);

//   // --- PRIVACY SHUTTER MONITOR ---
//   useEffect(() => {
//     if (!hasStarted || isDisqualified) return;
    
//     const interval = setInterval(() => {
//         const video = document.querySelector('video');
//         if (!video) return;

//         try {
//             const canvas = document.createElement('canvas');
//             canvas.width = 50; canvas.height = 50;
//             const ctx = canvas.getContext('2d');
//             ctx.drawImage(video, 0, 0, 50, 50);
//             const data = ctx.getImageData(0, 0, 50, 50).data;
//             let brightness = 0;
//             for(let i=0; i<data.length; i+=4) brightness += (data[i]+data[i+1]+data[i+2])/3;
//             brightness = brightness / (data.length/4);

//             if (brightness < 10) {
//                 // Black Screen
//                 if (!showPrivacyShutterModal) {
//                     setShowPrivacyShutterModal(true);
//                     handleViolation("Privacy Shutter Detected");
//                 }
//                 privacyShutterTimerRef.current += 1;
//                 if (privacyShutterTimerRef.current >= 120) {
//                     terminateSession("Camera covered for > 2 minutes.");
//                 }
//             } else {
//                 // OK
//                 if (showPrivacyShutterModal) {
//                     setShowPrivacyShutterModal(false);
//                     privacyShutterTimerRef.current = 0;
//                 }
//             }
//         } catch(e) {}
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [hasStarted, isDisqualified, showPrivacyShutterModal, handleViolation, terminateSession]);


//   // Listen for Full Screen Changes
//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       // Logic for strict full screen check
//       if (!hasStarted || isDisqualified) return;

//       if (!document.fullscreenElement && !document.webkitFullscreenElement) {
//         setShowFullScreenExitModal(true);
//         handleViolation("Exited Full Screen Mode");
//       } else {
//         setShowFullScreenExitModal(false);
//       }
//     };

//     document.addEventListener("fullscreenchange", handleFullScreenChange);
//     document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
//     document.addEventListener("mozfullscreenchange", handleFullScreenChange);
//     document.addEventListener("MSFullscreenChange", handleFullScreenChange);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullScreenChange);
//       document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
//       document.removeEventListener("mozfullscreenchange", handleFullScreenChange);
//       document.removeEventListener("MSFullscreenChange", handleFullScreenChange);
//     };
//   }, [hasStarted, isDisqualified, handleViolation]);

//   // Listen for Tab Switching
//   useEffect(() => {
//     if (!hasStarted || isDisqualified) return;
//     const handleVisibilityChange = () => {
//       if (document.hidden) handleViolation("User Left Tab / Minimized");
//     };
//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, [handleViolation, hasStarted, isDisqualified]);

//   // --- CORE INTERVIEW LOGIC ---
//   const recognition = window.SpeechRecognition || window.webkitSpeechRecognition 
//     ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() 
//     : null;

//   if (recognition) {
//     recognition.continuous = true;
//     recognition.lang = 'en-US';
//   }

//   const toggleMic = () => {
//     if (!recognition) return alert("Speech API not supported.");
    
//     if (isListening) {
//       recognition.stop();
//       setIsListening(false);
//     } else {
//       recognition.start();
//       setIsListening(true);
//       recognition.onresult = (event) => {
//         const transcript = Array.from(event.results)
//           .map(result => result[0].transcript)
//           .join('');
//         setCurrentAnswer(prev => prev + " " + transcript);
//       };
//     }
//   };

//   const handleNext = async () => {
//     const newAnswerEntry = { 
//       question: questions[currIndex], 
//       answer: currentAnswer || "[No Answer Provided]" 
//     };
    
//     const updatedAnswers = [...answers, newAnswerEntry];
//     setAnswers(updatedAnswers);
//     setCurrentAnswer("");
    
//     if (isListening) {
//       recognition.stop();
//       setIsListening(false);
//     }

//     if (currIndex + 1 < questions.length) {
//       setCurrIndex(currIndex + 1);
//     } else {
//       finishInterview(updatedAnswers);
//     }
//   };

//   const finishInterview = async (finalAnswers) => {
//     setProcessing(true);
//     try {
//       const feedbackRes = await evaluateSession(finalAnswers);
//       const fullPayload = {
//         questions: finalAnswers,
//         topic: config.topic || "Mock Interview", // Ensure topic is set
//         totalScore: feedbackRes.data.score,
//         overallFeedback: feedbackRes.data.summary,
//         roadmap: feedbackRes.data.roadmap,
//         question_reviews: feedbackRes.data.question_reviews, 
//         silent_killers: feedbackRes.data.silent_killers,
//         integrity_score: Math.max(0, 100 - (violations * 10)),
//         violations_count: violations
//       };

//       await saveInterview(fullPayload);
//       localStorage.removeItem(SESSION_KEY); 
//       navigate('/report', { state: { 
//         feedback: feedbackRes.data, 
//         answers: finalAnswers,
//         integrity: { score: Math.max(0, 100 - (violations * 10)), count: violations }
//       }});

//     } catch (err) {
//       console.error(err);
//       alert("Error submitting interview. Please try again.");
//       setProcessing(false);
//     }
//   };

//   // --- RENDER HELPERS ---

//   const renderCameraDeniedModal = () => (
//     <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-6xl text-red-500 mb-6 animate-pulse">
//         <i className="fa-solid fa-video-slash"></i>
//       </div>
//       <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Camera Access Required</h2>
//       <p className="text-gray-300 max-w-lg mb-8 text-lg">
//         We cannot proceed without camera access. This is a proctored interview environment.
//       </p>
//       <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 max-w-md">
//          <p className="text-white font-bold mb-2">How to fix:</p>
//          <ol className="text-left text-gray-400 list-decimal pl-5 space-y-2">
//            <li>Click the lock icon in your browser address bar.</li>
//            <li>Enable "Camera" permissions.</li>
//            <li>Refresh this page.</li>
//          </ol>
//       </div>
//       <button 
//         onClick={() => window.location.reload()}
//         className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider"
//       >
//         Reload Page
//       </button>
//     </div>
//   );

//   const renderDisclaimerModal = () => (
//     <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
//       <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl p-6 md:p-10 relative">
//         <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-6 border-b-4 border-blue-600 pb-4">
//             Interview Guidelines
//         </h2>
//         <div className="space-y-4 mb-8 text-slate-700 text-lg leading-relaxed">
//            <ul className="list-none space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-200">
//              <li className="flex items-start gap-3">
//                <i className="fa-solid fa-expand text-blue-600 mt-1"></i>
//                <span><strong>Full Screen Mode</strong> is mandatory. Exiting will trigger a violation flag.</span>
//              </li>
//              <li className="flex items-start gap-3">
//                <i className="fa-solid fa-eye text-blue-600 mt-1"></i>
//                <span>
//                   <strong>Face Visibility</strong>: If your face is not in the frame for <strong>20 seconds</strong>, a flag will be triggered.
//                   <span className="block text-red-600 text-sm mt-1 font-bold">
//                       ⚠️ If this cycle repeats 3 times, you will be DISQUALIFIED immediately.
//                   </span>
//                </span>
//              </li>
//              <li className="flex items-start gap-3">
//                <i className="fa-solid fa-arrows-to-eye text-blue-600 mt-1"></i>
//                <span>
//                   <strong>Head Movement</strong>: Looking Left, Right, Up, or Down away from the camera will <strong>trigger a flag immediately</strong>.
//                </span>
//              </li>
//              <li className="flex items-start gap-3">
//                <i className="fa-solid fa-window-restore text-blue-600 mt-1"></i>
//                <span><strong>No Tab Switching</strong>. Moving to other tabs/windows is strictly prohibited.</span>
//              </li>
//              <li className="flex items-start gap-3 text-red-600 font-bold border-l-4 border-red-500 pl-3 bg-red-50 py-2">
//                <i className="fa-solid fa-triangle-exclamation mt-1"></i>
//                <span>
//                   CRITICAL: If your Flag Count reaches {MAX_VIOLATIONS}, you will be IMMEDIATELY DISQUALIFIED.
//                </span>
//              </li>
//            </ul>
//         </div>
//         <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
//           <input 
//             type="checkbox" 
//             className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
//             checked={disclaimerAccepted}
//             onChange={(e) => setDisclaimerAccepted(e.target.checked)}
//           />
//           <span className="font-bold text-slate-800">I have read the rules and agree to be proctored.</span>
//         </label>
//         <button 
//           onClick={handleStartInterview}
//           disabled={!disclaimerAccepted}
//           className={`w-full mt-6 py-4 rounded-lg font-bold text-xl uppercase tracking-wider transition-all shadow-xl ${
//             disclaimerAccepted 
//             ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]' 
//             : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//           }`}
//         >
//           Start Assessment
//         </button>
//       </div>
//     </div>
//   );

//   const renderDisqualifiedModal = () => (
//     <div className="fixed inset-0 bg-red-900 z-[200] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-8xl text-white mb-6 animate-pulse">
//          <i className="fa-solid fa-ban"></i>
//       </div>
//       <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">
//         Disqualified
//       </h1>
//       <p className="text-red-200 text-2xl font-bold max-w-2xl leading-normal mb-8">
//         You have exceeded the maximum limit of {MAX_VIOLATIONS} violations. <br/>
//         Your session has been terminated due to suspicious activity.
//       </p>
//       <button 
//         onClick={() => terminateSession("Disqualified")}
//         className="bg-white text-red-900 px-10 py-5 rounded-lg font-black text-xl uppercase tracking-wider hover:bg-gray-100 transition-transform hover:scale-105"
//       >
//         Return to Home
//       </button>
//     </div>
//   );

//   const renderFullScreenModal = () => (
//     <div className="fixed inset-0 bg-slate-900 bg-opacity-100 z-[80] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-6xl text-yellow-500 mb-6 animate-pulse">
//         <i className="fa-solid fa-expand"></i>
//       </div>
//       <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Full Screen Required</h2>
//       <p className="text-gray-300 max-w-lg mb-8 text-lg">
//         You have exited full screen. <span className="text-red-400 font-bold">Resume immediately or you will be disqualified.</span>
//       </p>
//       <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg justify-center">
//         <button 
//           onClick={() => enterFullScreen()}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg"
//         >
//           Resume
//         </button>
//         <button 
//           onClick={() => terminateSession("Exited Full Screen")}
//           className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg"
//         >
//           Exit
//         </button>
//       </div>
//     </div>
//   );

//   const renderViolationModal = () => (
//     <div className="fixed inset-0 bg-red-900 bg-opacity-95 backdrop-blur-xl z-[70] flex flex-col items-center justify-center p-6 text-center border-8 border-red-600">
//       <div className="text-7xl text-white mb-6 animate-pulse">
//         <i className="fa-solid fa-triangle-exclamation"></i>
//       </div>
//       <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">Rules Violated</h2>
//       <p className="text-red-100 text-xl font-bold mb-8 max-w-2xl leading-relaxed">
//         You attempted to leave the interview interface.
//       </p>
//       <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
//         <button 
//           onClick={() => terminateSession("Tab Switch")}
//           className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-6 py-4 rounded-lg border-2 border-gray-600 font-bold uppercase tracking-wider transition-all"
//         >
//           Terminate
//         </button>
//         <button 
//           onClick={() => setShowViolationModal(false)}
//           className="flex-1 bg-white text-red-700 hover:bg-gray-100 px-6 py-4 rounded-lg font-black border-4 border-red-700 uppercase tracking-wider transition-all shadow-2xl hover:scale-105"
//         >
//           Continue
//         </button>
//       </div>
//     </div>
//   );

//   const renderPrivacyShutterModal = () => (
//     <div className="fixed inset-0 bg-black z-[90] flex flex-col items-center justify-center p-6 text-center border-8 border-gray-800">
//       <div className="text-7xl text-gray-500 mb-6 animate-pulse">
//         <i className="fa-solid fa-eye-slash"></i>
//       </div>
//       <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">Camera Blocked</h2>
//       <p className="text-gray-300 text-xl font-bold mb-8 max-w-2xl leading-relaxed">
//         We detected your camera privacy shutter is closed or the room is too dark. 
//         <br/><br/>
//         <span className="text-red-500">Open the shutter immediately.</span> 
//         <br/>
//         The session will terminate in <span className="text-white bg-red-600 px-2 rounded">{120 - privacyShutterTimerRef.current}s</span> if not resolved.
//       </p>
//     </div>
//   );

//   return (
//     <div 
//       className="min-h-screen flex flex-col p-4 md:p-6 bg-slate-50 relative overflow-x-hidden"
//       onClick={() => { new Audio(BEEP_URL).play().catch(()=>{}) }} 
//     >
//       {/* 1. DISQUALIFIED (Top Priority) */}
//       {isDisqualified && renderDisqualifiedModal()}

//       {/* 2. INITIALIZATION SCREENS */}
//       {!hasStarted && !isDisqualified && (
//           <>
//             {cameraStatus === 'checking' && (
//               <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center text-white font-bold text-xl">
//                 <i className="fa-solid fa-spinner animate-spin mr-3"></i> Checking System Permissions...
//               </div>
//             )}
//             {cameraStatus === 'denied' && renderCameraDeniedModal()}
//             {cameraStatus === 'granted' && renderDisclaimerModal()}
//           </>
//        )}

//       {/* 3. RUNTIME MODALS */}
//       {hasStarted && !isDisqualified && showFullScreenExitModal && renderFullScreenModal()}
//       {hasStarted && !isDisqualified && showViolationModal && renderViolationModal()}
//       {hasStarted && !isDisqualified && showPrivacyShutterModal && renderPrivacyShutterModal()}

//       {/* HEADER */}
//       <div className="flex flex-wrap justify-between items-center mb-6 md:mb-8 gap-4 px-1 shrink-0">
//         <div>
//            <h2 className="font-black text-2xl md:text-3xl uppercase text-slate-800 tracking-tight">
//              {config.round} <span className="text-red-500">//</span> ASSESSMENT
//            </h2>
//            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
//              <p className="font-mono text-xs md:text-sm text-gray-400 font-bold uppercase">
//                Topic: {config.topic}
//              </p>
//              <span className="bg-red-100 text-red-600 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded border border-red-200">
//                ⚠️ {violations} / {MAX_VIOLATIONS} FLAGS
//              </span>
//            </div>
//         </div>
//         <div className="flex items-center gap-3 md:gap-4">
//            <div className="font-mono font-black text-white bg-slate-900 px-4 py-2 md:px-5 md:py-3 rounded shadow-lg text-sm md:text-lg">
//              {currIndex + 1} <span className="text-gray-500">/</span> {questions.length}
//            </div>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex flex-1 flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto w-full">
        
//         {/* LEFT: WEBCAM */}
//         <div className="w-full lg:w-1/3 flex flex-col gap-6 shrink-0">
          
//           <div className="card-panel p-2 shadow-xl border-slate-200 bg-white rounded-lg relative transition-all duration-300 z-0">
//               <WebcamFeed onViolation={handleViolation} />
//               <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded animate-pulse font-bold">
//                 REC
//               </div>
//           </div>
          
//           <div className="card-panel p-6 md:p-8 border-l-4 border-red-600 bg-white shadow-lg rounded-r-lg">
//             <h3 className="font-mono text-xs font-bold text-red-500 uppercase mb-3 md:mb-4 flex items-center gap-2">
//                <i className="fa-solid fa-terminal"></i> Current Inquiry
//             </h3>
//             <p className="text-xl md:text-2xl font-bold text-slate-900 leading-snug break-words">
//               {questions[currIndex]}
//             </p>
//           </div>
//         </div>

//         {/* RIGHT: ANSWER TERMINAL */}
//         <div className="w-full lg:w-2/3 flex flex-col">
//           <div className="card-panel flex flex-col p-0 relative overflow-hidden shadow-2xl border-0 bg-white rounded-lg min-h-[400px] lg:min-h-[600px] h-full">
//             <div className="bg-slate-100 border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0">
//                <span className="text-xs font-bold text-gray-500 uppercase">Response Terminal</span>
//                <div className="flex gap-2">
//                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
//                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
//                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
//                </div>
//             </div>
//             <div className="flex-1 relative">
//                <textarea
//                  className="w-full h-full min-h-[300px] lg:min-h-[450px] p-6 md:p-8 border-none outline-none resize-none text-lg md:text-xl font-mono font-bold text-slate-900 leading-relaxed bg-transparent focus:bg-slate-50 transition-colors pb-32"
//                  placeholder="> Type your response here..."
//                  value={currentAnswer}
//                  onChange={(e) => setCurrentAnswer(e.target.value)}
//                  spellCheck="false"
//                />
//                <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
//                   <button 
//                     onClick={toggleMic}
//                     className={`w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border-2 ${
//                       isListening 
//                       ? 'border-red-500 bg-red-50 text-red-600 animate-pulse' 
//                       : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
//                     }`}
//                   >
//                     <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
//                     {isListening ? "Listening..." : "Dictate Answer"}
//                   </button>
//                   <button 
//                     onClick={handleNext}
//                     disabled={processing}
//                     className="w-full sm:w-auto btn btn-primary px-8 md:px-10 py-3 md:py-4 shadow-red hover:shadow-xl transition-all disabled:opacity-50 bg-slate-900 text-white rounded-lg font-bold flex justify-center items-center"
//                   >
//                     {processing ? (
//                         <span className="flex items-center gap-2">
//                             <i className="fa-solid fa-cog animate-spin"></i> PROCESSING
//                         </span>
//                     ) : (
//                         <span className="flex items-center gap-2">
//                             {currIndex === questions.length - 1 ? "FINALIZE" : "NEXT"} 
//                             <i className="fa-solid fa-arrow-right"></i>
//                         </span>
//                     )}
//                   </button>
//                </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Interview;
//-----------------------------------------------------------------------------------------------------------------------------------
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import WebcamFeed from '../components/WebcamFeed';
// import { evaluateResumeSession, saveInterview } from '../services/api';
// import { loadProctoringModels } from '../utils/face-proctor';

// // --- EMBEDDED BEEP SOUND (Base64) ---
// const BEEP_URL = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMQAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZGlhZy4wAAD/7kmRAAAAAA0gAAAAANIAAAAADSCAAAA0ggAAAAAAAAAAAAAAA//uSZIYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmRmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmSmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmSmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAA";

// const ResumeInterview = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   // --- 1. PERSISTENCE LAYER ---
//   const SESSION_KEY = "resume_session_backup";
  
//   const getInitialState = () => {
//     const saved = localStorage.getItem(SESSION_KEY);
//     const propsData = location.state || {};
    
//     // CASE 1: Page Refresh (No Props, but LocalStorage exists)
//     if (saved && !propsData.questions) {
//       return JSON.parse(saved);
//     }

//     // CASE 2: New Interview Start (Props exist)
//     if (propsData.questions) {
//       if (saved) {
//         const parsed = JSON.parse(saved);
//         // Check if it's the same session based on field
//         if (parsed.config?.field === propsData.config?.field) {
//           return parsed;
//         }
//       }
//       return {
//         questions: propsData.questions || ["Error: No Questions Loaded"],
//         config: propsData.config || { field: "General", experience: "Junior" },
//         currIndex: 0,
//         answers: [],
//         currentAnswer: "",
//         violations: 0 
//       };
//     }

//     // Fallback default
//     return {
//       questions: ["Error: No Questions Loaded"],
//       config: { field: "General", experience: "Junior" },
//       currIndex: 0,
//       answers: [],
//       currentAnswer: "",
//       violations: 0
//     };
//   };

//   // Initialize State
//   const initialState = getInitialState();
//   const [questions] = useState(initialState.questions);
//   const [config] = useState(initialState.config);
  
//   const [currIndex, setCurrIndex] = useState(initialState.currIndex);
//   const [answers, setAnswers] = useState(initialState.answers);
//   const [currentAnswer, setCurrentAnswer] = useState(initialState.currentAnswer);
  
//   // --- FLAG STATE (PERSISTED) ---
//   const [violations, setViolations] = useState(initialState.violations);
  
//   // Runtime State
//   const [isListening, setIsListening] = useState(false);
//   const [processing, setProcessing] = useState(false);
  
//   // --- INTEGRITY & PROCTORING STATE ---
//   const [cameraStatus, setCameraStatus] = useState('checking'); 
//   const [hasStarted, setHasStarted] = useState(false);
//   const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
//   const [isDisqualified, setIsDisqualified] = useState(false); 

//   const [showViolationModal, setShowViolationModal] = useState(false); 
//   const [showFullScreenExitModal, setShowFullScreenExitModal] = useState(false); 
//   const [showPrivacyShutterModal, setShowPrivacyShutterModal] = useState(false);

//   // Refs
//   const lastViolationTime = useRef(0);
//   const faceMissingCycleRef = useRef(0); 
//   const privacyShutterTimerRef = useRef(0); 

//   const MAX_VIOLATIONS = 10;

//   // --- SAVE STATE ON CHANGE ---
//   useEffect(() => {
//     const stateToSave = {
//       questions,
//       config,
//       currIndex,
//       answers,
//       currentAnswer,
//       violations
//     };
//     localStorage.setItem(SESSION_KEY, JSON.stringify(stateToSave));
//   }, [currIndex, answers, currentAnswer, violations, questions, config]);

//   // --- 0. INITIAL CAMERA CHECK ---
//   useEffect(() => {
//     async function checkCamera() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         stream.getTracks().forEach(track => track.stop());
//         setCameraStatus('granted');
//       } catch (err) {
//         console.error("Camera permission denied:", err);
//         setCameraStatus('denied');
//       }
//     }
//     checkCamera();
//     loadProctoringModels();
//   }, []);

//   // --- TERMINATION HELPER (SAVES TO DB) ---
//   const terminateSession = useCallback(async (reason) => {
//     if (document.fullscreenElement) {
//         document.exitFullscreen().catch(() => {});
//     }

//     // SAVE DISQUALIFIED SESSION TO DB
//     try {
//         const failurePayload = {
//             questions: answers, 
//             topic: config.field || "Resume Audit (Terminated)", // Log the Field Name correctly
//             totalScore: 0, 
//             overallFeedback: `DISQUALIFIED: ${reason}. Session terminated due to protocol violation.`,
//             roadmap: "N/A",
//             question_reviews: [],
//             silent_killers: ["Procedural Integrity Violation", reason],
//             integrity_score: 0,
//             violations_count: violations
//         };
//         console.log("💾 Saving Terminated Resume Session...", failurePayload);
//         await saveInterview(failurePayload);
//     } catch (e) {
//         console.error("Failed to save termination log:", e);
//     }

//     localStorage.removeItem(SESSION_KEY);
//     const video = document.querySelector('video');
//     if (video && video.srcObject) {
//       video.srcObject.getTracks().forEach(track => track.stop());
//     }
//     navigate('/'); 
//   }, [navigate, SESSION_KEY, answers, config.field, violations]);

//   // --- FULL SCREEN ENFORCEMENT ---
//   const enterFullScreen = async () => {
//     const elem = document.documentElement;
//     try {
//       if (elem.requestFullscreen) {
//         await elem.requestFullscreen();
//       } else if (elem.webkitRequestFullscreen) { 
//         await elem.webkitRequestFullscreen();
//       } else if (elem.msRequestFullscreen) { 
//         await elem.msRequestFullscreen();
//       }
//     } catch (err) {
//       console.log("Full screen request denied:", err);
//     }
//   };

//   const handleStartInterview = () => {
//     if (!disclaimerAccepted) return alert("You must agree to the guidelines.");
//     enterFullScreen().then(() => {
//         setHasStarted(true);
//     }).catch(() => {
//         setHasStarted(true);
//     });
//   };

//   // --- VIOLATION HANDLER ---
//   const handleViolation = useCallback((reason, isMajor = false) => {
//     if (!hasStarted || isDisqualified) return;

//     if (reason === "Privacy Shutter Detected") {
//         setShowPrivacyShutterModal(true);
//         return;
//     }

//     if (reason === "FACE_MISSING_20S") {
//         faceMissingCycleRef.current += 1;
//         const strikes = faceMissingCycleRef.current;
//         console.warn(`Face Missing Strike: ${strikes}/3`);

//         if (strikes >= 3) {
//             setIsDisqualified(true); 
//             if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
//             alert("You attempted cheating (Face Missing 3x).");
//             terminateSession("Face Missing 3x");
//         } else {
//             setViolations(prev => prev + 1);
//             alert(`WARNING: Face not visible for 20s. Strike ${strikes}/3.`);
//         }
//         return;
//     }

//     const now = Date.now();
//     if (now - lastViolationTime.current < 1000) return;
//     lastViolationTime.current = now;
    
//     new Audio(BEEP_URL).play().catch(()=>{});
    
//     console.warn(`VIOLATION: ${reason}`);
//     setViolations(prev => {
//         const newCount = prev + 1;
//         if (newCount >= MAX_VIOLATIONS) {
//             setIsDisqualified(true);
//         }
//         return newCount;
//     });
    
//     if (reason.includes("Tab") || reason.includes("Focus")) {
//       setShowViolationModal(true);
//     }
//   }, [hasStarted, isDisqualified, terminateSession]);

//   // --- PRIVACY SHUTTER MONITOR ---
//   useEffect(() => {
//     if (!hasStarted || isDisqualified) return;
    
//     const interval = setInterval(() => {
//         const video = document.querySelector('video');
//         if (!video) return;

//         try {
//             const canvas = document.createElement('canvas');
//             canvas.width = 50; canvas.height = 50;
//             const ctx = canvas.getContext('2d');
//             ctx.drawImage(video, 0, 0, 50, 50);
//             const data = ctx.getImageData(0, 0, 50, 50).data;
//             let brightness = 0;
//             for(let i=0; i<data.length; i+=4) brightness += (data[i]+data[i+1]+data[i+2])/3;
//             brightness = brightness / (data.length/4);

//             if (brightness < 10) {
//                 if (!showPrivacyShutterModal) {
//                     setShowPrivacyShutterModal(true);
//                     handleViolation("Privacy Shutter Detected");
//                 }
//                 privacyShutterTimerRef.current += 1;
//                 if (privacyShutterTimerRef.current >= 120) {
//                     terminateSession("Camera covered for > 2 minutes.");
//                 }
//             } else {
//                 if (showPrivacyShutterModal) {
//                     setShowPrivacyShutterModal(false);
//                     privacyShutterTimerRef.current = 0;
//                 }
//             }
//         } catch(e) {}
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [hasStarted, isDisqualified, showPrivacyShutterModal, handleViolation, terminateSession]);

//   // --- LISTENERS ---
//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       if (!hasStarted || isDisqualified) return;
//       if (!document.fullscreenElement && !document.webkitFullscreenElement) {
//         setShowFullScreenExitModal(true);
//         handleViolation("Exited Full Screen Mode");
//       } else {
//         setShowFullScreenExitModal(false);
//       }
//     };
//     document.addEventListener("fullscreenchange", handleFullScreenChange);
//     return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
//   }, [hasStarted, isDisqualified, handleViolation]);

//   useEffect(() => {
//     if (!hasStarted || isDisqualified) return;
//     const handleVisibilityChange = () => {
//       if (document.hidden) handleViolation("User Left Tab / Minimized");
//     };
//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, [handleViolation, hasStarted, isDisqualified]);

//   // --- STT & INTERVIEW LOGIC ---
//   const recognition = window.SpeechRecognition || window.webkitSpeechRecognition 
//     ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() 
//     : null;

//   if (recognition) {
//     recognition.continuous = true;
//     recognition.lang = 'en-US';
//   }

//   const toggleMic = () => {
//     if (!recognition) return alert("Speech API not supported.");
    
//     if (isListening) {
//       recognition.stop();
//       setIsListening(false);
//     } else {
//       recognition.start();
//       setIsListening(true);
//       recognition.onresult = (event) => {
//         const transcript = Array.from(event.results)
//           .map(result => result[0].transcript)
//           .join('');
//         setCurrentAnswer(prev => prev + " " + transcript);
//       };
//     }
//   };

//   const handleNext = async () => {
//     const newAnswerEntry = { 
//       question: questions[currIndex], 
//       answer: currentAnswer || "[No Answer Provided]" 
//     };
    
//     const updatedAnswers = [...answers, newAnswerEntry];
//     setAnswers(updatedAnswers);
//     setCurrentAnswer("");
    
//     if (isListening) {
//       recognition.stop();
//       setIsListening(false);
//     }

//     if (currIndex + 1 < questions.length) {
//       setCurrIndex(currIndex + 1);
//     } else {
//       finishInterview(updatedAnswers);
//     }
//   };

//   const finishInterview = async (finalAnswers) => {
//     setProcessing(true);
    
//     // 1. EVALUATE WITH RESUME API
//     let evaluationResult = null;
//     try {
//         console.log("🧠 Sending for Evaluation...", finalAnswers);
//         const response = await evaluateResumeSession(
//             finalAnswers, 
//             config.field, // Use field for context
//             config.experience
//         );
//         evaluationResult = response.data || response;
//     } catch (error) {
//         console.error("Evaluation Error:", error);
//         evaluationResult = {
//             score: 0,
//             summary: "AI Analysis Failed. Please retry.",
//             silent_killers: [],
//             roadmap: "",
//             question_reviews: []
//         };
//     }

//     // 2. CONSTRUCT CLEAN DATA FOR DB & UI
//     // Ensure all fields are primitives to prevent DataCloneError
//     const cleanReport = {
//         score: Number(evaluationResult.score) || 0,
//         summary: String(evaluationResult.summary || "No summary available."),
//         roadmap: String(evaluationResult.roadmap || "No roadmap available."),
//         silent_killers: Array.isArray(evaluationResult.silent_killers) ? evaluationResult.silent_killers : [],
//         question_reviews: Array.isArray(evaluationResult.question_reviews) ? evaluationResult.question_reviews : []
//     };

//     const integrityScore = Math.max(0, 100 - (violations * 10));

//     // 3. SAVE WITH CORRECT TOPIC
//     try {
//       const fullPayload = {
//         questions: finalAnswers,
//         // CRITICAL FIX: Use config.field so log shows "React Developer" not generic
//         topic: config.field || "Resume Audit", 
//         totalScore: cleanReport.score,
//         overallFeedback: cleanReport.summary,
//         roadmap: cleanReport.roadmap,
//         question_reviews: cleanReport.question_reviews, 
//         silent_killers: cleanReport.silent_killers,
//         integrity_score: integrityScore,
//         violations_count: violations
//       };

//       console.log("💾 Saving Session to History:", fullPayload);
//       await saveInterview(fullPayload);
//       localStorage.removeItem(SESSION_KEY); 
      
//       // 4. NAVIGATE TO REPORT (FIXED DATA CLONE ERROR)
//       // We explicitly parse/stringify to break any non-serializable references
//       navigate('/resume-report', { state: { 
//         report: JSON.parse(JSON.stringify(cleanReport)), 
//         feedback: JSON.parse(JSON.stringify(cleanReport)), 
//         answers: finalAnswers,
//         integrity: { score: integrityScore, count: violations }
//       }});

//     } catch (err) {
//       console.error("Critical Save/Nav Error:", err);
//       alert("Error saving session. Check console.");
//       setProcessing(false);
//     }
//   };

//   // --- RENDER ---

//   const renderCameraDeniedModal = () => (
//     <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-6xl text-red-500 mb-6 animate-pulse"><i className="fa-solid fa-video-slash"></i></div>
//       <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Camera Access Required</h2>
//       <button onClick={() => window.location.reload()} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider">Reload Page</button>
//     </div>
//   );

//   const renderDisclaimerModal = () => (
//     <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
//       <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl p-6 md:p-10 relative">
//         <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-6 border-b-4 border-blue-600 pb-4">Resume Audit Guidelines</h2>
//         <div className="space-y-4 mb-8 text-slate-700 text-lg leading-relaxed">
//            <ul className="list-none space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-200">
//              <li className="flex items-start gap-3"><i className="fa-solid fa-expand text-blue-600 mt-1"></i><span><strong>Full Screen Mode</strong> is mandatory. Exiting will trigger a violation flag.</span></li>
//              <li className="flex items-start gap-3"><i className="fa-solid fa-eye text-blue-600 mt-1"></i><span><strong>Face Visibility</strong>: If your face is not in the frame for <strong>20 seconds</strong>, a flag will be triggered.<span className="block text-red-600 text-sm mt-1 font-bold">⚠️ If this cycle repeats 3 times, you will be DISQUALIFIED immediately.</span></span></li>
//              <li className="flex items-start gap-3"><i className="fa-solid fa-arrows-to-eye text-blue-600 mt-1"></i><span><strong>Head Movement</strong>: Looking Left, Right, Up, or Down away from the camera will <strong>trigger a flag immediately</strong>.</span></li>
//              <li className="flex items-start gap-3"><i className="fa-solid fa-window-restore text-blue-600 mt-1"></i><span><strong>No Tab Switching</strong>. Moving to other tabs/windows is strictly prohibited.</span></li>
//              <li className="flex items-start gap-3 text-red-600 font-bold border-l-4 border-red-500 pl-3 bg-red-50 py-2"><i className="fa-solid fa-triangle-exclamation mt-1"></i><span>CRITICAL: If your Flag Count reaches {MAX_VIOLATIONS}, you will be IMMEDIATELY DISQUALIFIED.</span></li>
//            </ul>
//         </div>
//         <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
//           <input type="checkbox" className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500" checked={disclaimerAccepted} onChange={(e) => setDisclaimerAccepted(e.target.checked)}/>
//           <span className="font-bold text-slate-800">I have read the rules and agree to be proctored.</span>
//         </label>
//         <button onClick={handleStartInterview} disabled={!disclaimerAccepted} className={`w-full mt-6 py-4 rounded-lg font-bold text-xl uppercase tracking-wider transition-all shadow-xl ${disclaimerAccepted ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Start Assessment</button>
//       </div>
//     </div>
//   );

//   const renderDisqualifiedModal = () => (
//     <div className="fixed inset-0 bg-red-900 z-[200] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-8xl text-white mb-6 animate-pulse"><i className="fa-solid fa-ban"></i></div>
//       <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Disqualified</h1>
//       <p className="text-red-200 text-2xl font-bold max-w-2xl leading-normal mb-8">You have exceeded the maximum limit of {MAX_VIOLATIONS} violations.</p>
//       <button onClick={() => terminateSession("Disqualified")} className="bg-white text-red-900 px-10 py-5 rounded-lg font-black text-xl uppercase tracking-wider hover:bg-gray-100 transition-transform hover:scale-105">Return to Home</button>
//     </div>
//   );

//   const renderFullScreenModal = () => (
//     <div className="fixed inset-0 bg-slate-900 bg-opacity-100 z-[80] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-6xl text-yellow-500 mb-6 animate-pulse"><i className="fa-solid fa-expand"></i></div>
//       <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Full Screen Required</h2>
//       <p className="text-gray-300 max-w-lg mb-8 text-lg">You have exited full screen. <span className="text-red-400 font-bold">Resume immediately or you will be disqualified.</span></p>
//       <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg justify-center">
//         <button onClick={() => enterFullScreen()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg">Resume</button>
//         <button onClick={() => terminateSession("Exited Full Screen")} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg">Exit</button>
//       </div>
//     </div>
//   );

//   const renderViolationModal = () => (
//     <div className="fixed inset-0 bg-red-900 bg-opacity-95 backdrop-blur-xl z-[70] flex flex-col items-center justify-center p-6 text-center border-8 border-red-600">
//       <div className="text-7xl text-white mb-6 animate-pulse"><i className="fa-solid fa-triangle-exclamation"></i></div>
//       <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">Rules Violated</h2>
//       <p className="text-red-100 text-xl font-bold mb-8 max-w-2xl leading-relaxed">You attempted to leave the interview interface.</p>
//       <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
//         <button onClick={() => terminateSession("Tab Switch")} className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-6 py-4 rounded-lg border-2 border-gray-600 font-bold uppercase tracking-wider transition-all">Terminate</button>
//         <button onClick={() => setShowViolationModal(false)} className="flex-1 bg-white text-red-700 hover:bg-gray-100 px-6 py-4 rounded-lg font-black border-4 border-red-700 uppercase tracking-wider transition-all shadow-2xl hover:scale-105">Continue</button>
//       </div>
//     </div>
//   );

//   const renderPrivacyShutterModal = () => (
//     <div className="fixed inset-0 bg-black z-[90] flex flex-col items-center justify-center p-6 text-center border-8 border-gray-800">
//       <div className="text-7xl text-gray-500 mb-6 animate-pulse"><i className="fa-solid fa-eye-slash"></i></div>
//       <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">Camera Blocked</h2>
//       <p className="text-gray-300 text-xl font-bold mb-8 max-w-2xl leading-relaxed">We detected your camera privacy shutter is closed. <br/><span className="text-red-500">Open immediately.</span> <br/>Terminating in <span className="text-white bg-red-600 px-2 rounded">{120 - privacyShutterTimerRef.current}s</span>.</p>
//     </div>
//   );

//   return (
//     <div className="min-h-screen flex flex-col p-4 md:p-6 bg-slate-50 relative overflow-x-hidden" onClick={() => { new Audio(BEEP_URL).play().catch(()=>{}) }}>
//       {isDisqualified && renderDisqualifiedModal()}
//       {!hasStarted && !isDisqualified && (
//           <>
//             {cameraStatus === 'checking' && <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center text-white font-bold text-xl"><i className="fa-solid fa-spinner animate-spin mr-3"></i> Checking System...</div>}
//             {cameraStatus === 'denied' && renderCameraDeniedModal()}
//             {cameraStatus === 'granted' && renderDisclaimerModal()}
//           </>
//        )}

//       {hasStarted && !isDisqualified && showFullScreenExitModal && renderFullScreenModal()}
//       {hasStarted && !isDisqualified && showViolationModal && renderViolationModal()}
//       {hasStarted && !isDisqualified && showPrivacyShutterModal && renderPrivacyShutterModal()}
      
//       {/* HEADER */}
//       <div className="flex flex-wrap justify-between items-center mb-6 md:mb-8 gap-4 px-1 shrink-0">
//         <div>
//            <h2 className="font-black text-2xl md:text-3xl uppercase text-slate-800 tracking-tight">RESUME <span className="text-blue-600">//</span> AUDIT</h2>
//            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
//              <p className="font-mono text-xs md:text-sm text-gray-400 font-bold uppercase">Field: {config.field}</p>
//              <span className="bg-red-100 text-red-600 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded border border-red-200">⚠️ {violations} FLAGS</span>
//            </div>
//         </div>
//         <div className="flex items-center gap-3 md:gap-4">
//            <div className="font-mono font-black text-white bg-slate-900 px-4 py-2 md:px-5 md:py-3 rounded shadow-lg text-sm md:text-lg">{currIndex + 1} <span className="text-gray-500">/</span> {questions.length}</div>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex flex-1 flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto w-full">
//         {/* LEFT: WEBCAM */}
//         <div className="w-full lg:w-1/3 flex flex-col gap-6 shrink-0">
//           <div className="card-panel p-2 shadow-xl border-slate-200 bg-white rounded-lg relative transition-all duration-300 z-0">
//               <WebcamFeed onViolation={handleViolation} />
//               <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded animate-pulse font-bold">REC</div>
//           </div>
//           <div className="card-panel p-6 md:p-8 border-l-4 border-blue-600 bg-white shadow-lg rounded-r-lg">
//             <h3 className="font-mono text-xs font-bold text-blue-500 uppercase mb-3 md:mb-4 flex items-center gap-2"><i className="fa-solid fa-terminal"></i> Interview Query</h3>
//             <p className="text-xl md:text-2xl font-bold text-slate-900 leading-snug break-words">{questions[currIndex]}</p>
//           </div>
//         </div>

//         {/* RIGHT: ANSWER TERMINAL */}
//         <div className="w-full lg:w-2/3 flex flex-col">
//           <div className="card-panel flex flex-col p-0 relative overflow-hidden shadow-2xl border-0 bg-white rounded-lg min-h-[400px] lg:min-h-[600px] h-full">
//             <div className="bg-slate-100 border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0">
//                <span className="text-xs font-bold text-gray-500 uppercase">Response Terminal</span>
//                <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
//             </div>
//             <div className="flex-1 relative">
//                <textarea
//                  className="w-full h-full min-h-[300px] lg:min-h-[450px] p-6 md:p-8 border-none outline-none resize-none text-lg md:text-xl font-mono font-bold text-slate-900 leading-relaxed bg-transparent focus:bg-slate-50 transition-colors pb-32"
//                  placeholder="> Explain your approach..."
//                  value={currentAnswer}
//                  onChange={(e) => setCurrentAnswer(e.target.value)}
//                  spellCheck="false"
//                />
//                <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
//                   <button onClick={toggleMic} className={`w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border-2 ${isListening ? 'border-red-500 bg-red-50 text-red-600 animate-pulse' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
//                     <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i> {isListening ? "Listening..." : "Dictate Answer"}
//                   </button>
//                   <button onClick={handleNext} disabled={processing} className="w-full sm:w-auto btn btn-primary px-8 md:px-10 py-3 md:py-4 shadow-blue hover:shadow-xl transition-all disabled:opacity-50 bg-slate-900 text-white rounded-lg font-bold flex justify-center items-center">
//                     {processing ? <span><i className="fa-solid fa-cog animate-spin"></i> PROCESSING</span> : <span>{currIndex === questions.length - 1 ? "FINALIZE" : "NEXT"} <i className="fa-solid fa-arrow-right"></i></span>}
//                   </button>
//                </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResumeInterview;
//----------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------
//  ----------------------------------->   prev added buttom
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import WebcamFeed from '../components/WebcamFeed';
// import { evaluateResumeSession, saveInterview } from '../services/api';
// import { loadProctoringModels } from '../utils/face-proctor';

// // --- EMBEDDED BEEP SOUND (Base64) ---
// const BEEP_URL = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMQAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZGlhZy4wAAD/7kmRAAAAAA0gAAAAANIAAAAADSCAAAA0ggAAAAAAAAAAAAAAA//uSZIYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmRmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmSmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmSmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAA";

// const ResumeInterview = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   // --- 1. PERSISTENCE LAYER ---
//   const SESSION_KEY = "resume_session_backup";
  
//   const getInitialState = () => {
//     const saved = localStorage.getItem(SESSION_KEY);
//     const propsData = location.state || {};
    
//     // CASE 1: Page Refresh (No Props, but LocalStorage exists)
//     // We prioritize the saved session to preserve content on refresh
//     if (saved && !propsData.questions) {
//       return JSON.parse(saved);
//     }

//     // CASE 2: New Interview Start (Props exist)
//     if (propsData.questions) {
//       if (saved) {
//         const parsed = JSON.parse(saved);
//         // Check if it's the same session based on field
//         if (parsed.config?.field === propsData.config?.field) {
//           // If the user refreshed or came back, return the IN-PROGRESS state, not a fresh one
//           return parsed;
//         }
//       }
//       return {
//         questions: propsData.questions || ["Error: No Questions Loaded"],
//         config: propsData.config || { field: "General", experience: "Junior" },
//         currIndex: 0,
//         answers: [], // This will store {question, answer} objects for every index
//         currentAnswer: "",
//         violations: 0 
//       };
//     }

//     // Fallback default
//     return {
//       questions: ["Error: No Questions Loaded"],
//       config: { field: "General", experience: "Junior" },
//       currIndex: 0,
//       answers: [],
//       currentAnswer: "",
//       violations: 0
//     };
//   };

//   // Initialize State
//   const initialState = getInitialState();
//   const [questions] = useState(initialState.questions);
//   const [config] = useState(initialState.config);
  
//   const [currIndex, setCurrIndex] = useState(initialState.currIndex);
//   const [answers, setAnswers] = useState(initialState.answers);
//   const [currentAnswer, setCurrentAnswer] = useState(initialState.currentAnswer);
  
//   // --- FLAG STATE (PERSISTED) ---
//   const [violations, setViolations] = useState(initialState.violations);
  
//   // Runtime State
//   const [isListening, setIsListening] = useState(false);
//   const [processing, setProcessing] = useState(false);
  
//   // --- INTEGRITY & PROCTORING STATE ---
//   const [cameraStatus, setCameraStatus] = useState('checking'); 
//   const [hasStarted, setHasStarted] = useState(false);
//   const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
//   // CHECK DISQUALIFICATION ON LOAD
//   // If they were disqualified in the saved state, they remain disqualified
//   const [isDisqualified, setIsDisqualified] = useState(initialState.isDisqualified || false); 

//   const [showViolationModal, setShowViolationModal] = useState(false); 
//   const [showFullScreenExitModal, setShowFullScreenExitModal] = useState(false); 
//   const [showPrivacyShutterModal, setShowPrivacyShutterModal] = useState(false);

//   // Refs
//   const lastViolationTime = useRef(0);
//   const faceMissingCycleRef = useRef(0); 
//   const privacyShutterTimerRef = useRef(0); 

//   const MAX_VIOLATIONS = 10;

//   // --- SAVE STATE ON CHANGE (PERSISTENCE) ---
//   useEffect(() => {
//     const stateToSave = {
//       questions,
//       config,
//       currIndex,
//       answers,
//       currentAnswer, // Crucial: Saves the text currently being typed
//       violations,
//       isDisqualified // Persist disqualification status
//     };
//     localStorage.setItem(SESSION_KEY, JSON.stringify(stateToSave));
//   }, [currIndex, answers, currentAnswer, violations, questions, config, isDisqualified]);

//   // --- 0. INITIAL CAMERA CHECK ---
//   useEffect(() => {
//     async function checkCamera() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         stream.getTracks().forEach(track => track.stop());
//         setCameraStatus('granted');
//       } catch (err) {
//         console.error("Camera permission denied:", err);
//         setCameraStatus('denied');
//       }
//     }
//     checkCamera();
//     loadProctoringModels();
//   }, []);

//   // --- TERMINATION HELPER (SAVES TO DB) ---
//   const terminateSession = useCallback(async (reason) => {
//     if (document.fullscreenElement) {
//         document.exitFullscreen().catch(() => {});
//     }

//     // Set disqualified state immediately to block UI
//     setIsDisqualified(true);

//     // SAVE DISQUALIFIED SESSION TO DB
//     try {
//         const failurePayload = {
//             questions: answers, 
//             topic: config.field || "Resume Audit (Terminated)", 
//             totalScore: 0, 
//             overallFeedback: `DISQUALIFIED: ${reason}. Session terminated due to protocol violation.`,
//             roadmap: "N/A",
//             question_reviews: [],
//             silent_killers: ["Procedural Integrity Violation", reason],
//             integrity_score: 0,
//             violations_count: violations
//         };
//         console.log("💾 Saving Terminated Resume Session...", failurePayload);
//         await saveInterview(failurePayload);
//     } catch (e) {
//         console.error("Failed to save termination log:", e);
//     }

//     // Clear session and navigate home
//     localStorage.removeItem(SESSION_KEY);
//     const video = document.querySelector('video');
//     if (video && video.srcObject) {
//       video.srcObject.getTracks().forEach(track => track.stop());
//     }
//     navigate('/'); 
//   }, [navigate, SESSION_KEY, answers, config.field, violations]);

//   // --- FULL SCREEN ENFORCEMENT ---
//   const enterFullScreen = async () => {
//     const elem = document.documentElement;
//     try {
//       if (elem.requestFullscreen) {
//         await elem.requestFullscreen();
//       } else if (elem.webkitRequestFullscreen) { 
//         await elem.webkitRequestFullscreen();
//       } else if (elem.msRequestFullscreen) { 
//         await elem.msRequestFullscreen();
//       }
//     } catch (err) {
//       console.log("Full screen request denied:", err);
//     }
//   };

//   const handleStartInterview = () => {
//     if (!disclaimerAccepted) return alert("You must agree to the guidelines.");
//     enterFullScreen().then(() => {
//         setHasStarted(true);
//     }).catch(() => {
//         setHasStarted(true);
//     });
//   };

//   // --- VIOLATION HANDLER ---
//   const handleViolation = useCallback((reason, isMajor = false) => {
//     if (!hasStarted || isDisqualified) return;

//     if (reason === "Privacy Shutter Detected") {
//         setShowPrivacyShutterModal(true);
//         return;
//     }

//     if (reason === "FACE_MISSING_20S") {
//         faceMissingCycleRef.current += 1;
//         const strikes = faceMissingCycleRef.current;
//         console.warn(`Face Missing Strike: ${strikes}/3`);

//         if (strikes >= 3) {
//             setIsDisqualified(true); 
//             if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
//             alert("You attempted cheating (Face Missing 3x).");
//             terminateSession("Face Missing 3x");
//         } else {
//             setViolations(prev => prev + 1);
//             alert(`WARNING: Face not visible for 20s. Strike ${strikes}/3.`);
//         }
//         return;
//     }

//     const now = Date.now();
//     if (now - lastViolationTime.current < 1000) return;
//     lastViolationTime.current = now;
    
//     new Audio(BEEP_URL).play().catch(()=>{});
    
//     console.warn(`VIOLATION: ${reason}`);
//     setViolations(prev => {
//         const newCount = prev + 1;
//         if (newCount >= MAX_VIOLATIONS) {
//             setIsDisqualified(true);
//         }
//         return newCount;
//     });
    
//     if (reason.includes("Tab") || reason.includes("Focus")) {
//       setShowViolationModal(true);
//     }
//   }, [hasStarted, isDisqualified, terminateSession]);

//   // --- PRIVACY SHUTTER MONITOR ---
//   useEffect(() => {
//     if (!hasStarted || isDisqualified) return;
    
//     const interval = setInterval(() => {
//         const video = document.querySelector('video');
//         if (!video) return;

//         try {
//             const canvas = document.createElement('canvas');
//             canvas.width = 50; canvas.height = 50;
//             const ctx = canvas.getContext('2d');
//             ctx.drawImage(video, 0, 0, 50, 50);
//             const data = ctx.getImageData(0, 0, 50, 50).data;
//             let brightness = 0;
//             for(let i=0; i<data.length; i+=4) brightness += (data[i]+data[i+1]+data[i+2])/3;
//             brightness = brightness / (data.length/4);

//             if (brightness < 10) {
//                 if (!showPrivacyShutterModal) {
//                     setShowPrivacyShutterModal(true);
//                     handleViolation("Privacy Shutter Detected");
//                 }
//                 privacyShutterTimerRef.current += 1;
//                 if (privacyShutterTimerRef.current >= 120) {
//                     terminateSession("Camera covered for > 2 minutes.");
//                 }
//             } else {
//                 if (showPrivacyShutterModal) {
//                     setShowPrivacyShutterModal(false);
//                     privacyShutterTimerRef.current = 0;
//                 }
//             }
//         } catch(e) {}
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [hasStarted, isDisqualified, showPrivacyShutterModal, handleViolation, terminateSession]);

//   // --- LISTENERS ---
//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       if (!hasStarted || isDisqualified) return;
//       if (!document.fullscreenElement && !document.webkitFullscreenElement) {
//         setShowFullScreenExitModal(true);
//         handleViolation("Exited Full Screen Mode");
//       } else {
//         setShowFullScreenExitModal(false);
//       }
//     };
//     document.addEventListener("fullscreenchange", handleFullScreenChange);
//     return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
//   }, [hasStarted, isDisqualified, handleViolation]);

//   useEffect(() => {
//     if (!hasStarted || isDisqualified) return;
//     const handleVisibilityChange = () => {
//       if (document.hidden) handleViolation("User Left Tab / Minimized");
//     };
//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, [handleViolation, hasStarted, isDisqualified]);

//   // --- STT & INTERVIEW LOGIC ---
//   const recognition = window.SpeechRecognition || window.webkitSpeechRecognition 
//     ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() 
//     : null;

//   if (recognition) {
//     recognition.continuous = true;
//     recognition.lang = 'en-US';
//   }

//   const toggleMic = () => {
//     if (!recognition) return alert("Speech API not supported.");
    
//     if (isListening) {
//       recognition.stop();
//       setIsListening(false);
//     } else {
//       recognition.start();
//       setIsListening(true);
//       recognition.onresult = (event) => {
//         const transcript = Array.from(event.results)
//           .map(result => result[0].transcript)
//           .join('');
//         setCurrentAnswer(prev => prev + " " + transcript);
//       };
//     }
//   };

//   // --- NAVIGATION HANDLERS ---
  
//   // Logic to handle saving state when moving BACKWARDS
//   const handlePrevious = () => {
//     if (currIndex > 0) {
//         if (isListening) {
//             recognition.stop();
//             setIsListening(false);
//         }

//         // 1. SAVE CURRENT ANSWER
//         // Create a copy of the answers array
//         const updatedAnswers = [...answers];
//         // Insert/Update the answer at the current index
//         updatedAnswers[currIndex] = {
//             question: questions[currIndex],
//             answer: currentAnswer // Save the text currently in the textarea
//         };
//         setAnswers(updatedAnswers);

//         // 2. MOVE BACK
//         const prevIndex = currIndex - 1;
//         setCurrIndex(prevIndex);

//         // 3. RESTORE PREVIOUS ANSWER
//         // Retrieve the answer from the array if it exists
//         const prevStoredData = updatedAnswers[prevIndex];
//         setCurrentAnswer(prevStoredData ? prevStoredData.answer : "");
//     }
//   };

//   // Logic to handle saving state when moving FORWARDS
//   const handleNext = async () => {
//     // 1. SAVE CURRENT ANSWER
//     const updatedAnswers = [...answers];
//     updatedAnswers[currIndex] = { 
//       question: questions[currIndex], 
//       answer: currentAnswer || "[No Answer Provided]" 
//     };
//     setAnswers(updatedAnswers);
    
//     if (isListening) {
//       recognition.stop();
//       setIsListening(false);
//     }

//     if (currIndex + 1 < questions.length) {
//       // 2. MOVE FORWARD
//       const nextIndex = currIndex + 1;
//       setCurrIndex(nextIndex);
      
//       // 3. LOAD NEXT ANSWER (if exists)
//       const nextStoredData = updatedAnswers[nextIndex];
//       setCurrentAnswer(nextStoredData ? nextStoredData.answer : "");
//     } else {
//       // FINALIZE
//       finishInterview(updatedAnswers);
//     }
//   };

//   const finishInterview = async (finalAnswers) => {
//     setProcessing(true); // Triggers the overlay
    
//     // 1. EVALUATE WITH RESUME API
//     let evaluationResult = null;
//     try {
//         console.log("🧠 Sending for Evaluation...", finalAnswers);
//         const response = await evaluateResumeSession(
//             finalAnswers, 
//             config.field, // Use field for context
//             config.experience
//         );
//         evaluationResult = response.data || response;
//     } catch (error) {
//         console.error("Evaluation Error:", error);
//         evaluationResult = {
//             score: 0,
//             summary: "AI Analysis Failed. Please retry.",
//             silent_killers: [],
//             roadmap: "",
//             question_reviews: []
//         };
//     }

//     // 2. CONSTRUCT CLEAN DATA FOR DB & UI
//     const cleanReport = {
//         score: Number(evaluationResult.score) || 0,
//         summary: String(evaluationResult.summary || "No summary available."),
//         roadmap: String(evaluationResult.roadmap || "No roadmap available."),
//         silent_killers: Array.isArray(evaluationResult.silent_killers) ? evaluationResult.silent_killers : [],
//         question_reviews: Array.isArray(evaluationResult.question_reviews) ? evaluationResult.question_reviews : []
//     };

//     const integrityScore = Math.max(0, 100 - (violations * 10));

//     // 3. SAVE WITH CORRECT TOPIC
//     try {
//       const fullPayload = {
//         questions: finalAnswers,
//         topic: config.field || "Resume Audit", 
//         totalScore: cleanReport.score,
//         overallFeedback: cleanReport.summary,
//         roadmap: cleanReport.roadmap,
//         question_reviews: cleanReport.question_reviews, 
//         silent_killers: cleanReport.silent_killers,
//         integrity_score: integrityScore,
//         violations_count: violations
//       };

//       console.log("💾 Saving Session to History:", fullPayload);
//       await saveInterview(fullPayload);
//       localStorage.removeItem(SESSION_KEY); 
      
//       // 4. NAVIGATE TO REPORT
//       navigate('/resume-report', { state: { 
//         report: JSON.parse(JSON.stringify(cleanReport)), 
//         feedback: JSON.parse(JSON.stringify(cleanReport)), 
//         answers: finalAnswers,
//         integrity: { score: integrityScore, count: violations }
//       }});

//     } catch (err) {
//       console.error("Critical Save/Nav Error:", err);
//       alert("Error saving session. Check console.");
//       setProcessing(false);
//     }
//   };

//   // --- RENDER HELPERS ---

//   const renderCameraDeniedModal = () => (
//     <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-6xl text-red-500 mb-6 animate-pulse"><i className="fa-solid fa-video-slash"></i></div>
//       <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Camera Access Required</h2>
//       <button onClick={() => window.location.reload()} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider">Reload Page</button>
//     </div>
//   );

//   const renderDisclaimerModal = () => (
//     <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
//       <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl p-6 md:p-10 relative">
//         <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-6 border-b-4 border-blue-600 pb-4">Resume Audit Guidelines</h2>
//         <div className="space-y-4 mb-8 text-slate-700 text-lg leading-relaxed">
//            <ul className="list-none space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-200">
//              <li className="flex items-start gap-3"><i className="fa-solid fa-expand text-blue-600 mt-1"></i><span><strong>Full Screen Mode</strong> is mandatory. Exiting will trigger a violation flag.</span></li>
//              <li className="flex items-start gap-3"><i className="fa-solid fa-eye text-blue-600 mt-1"></i><span><strong>Face Visibility</strong>: If your face is not in the frame for <strong>20 seconds</strong>, a flag will be triggered.<span className="block text-red-600 text-sm mt-1 font-bold">⚠️ If this cycle repeats 3 times, you will be DISQUALIFIED immediately.</span></span></li>
//              <li className="flex items-start gap-3"><i className="fa-solid fa-arrows-to-eye text-blue-600 mt-1"></i><span><strong>Head Movement</strong>: Looking Left, Right, Up, or Down away from the camera will <strong>trigger a flag immediately</strong>.</span></li>
//              <li className="flex items-start gap-3"><i className="fa-solid fa-window-restore text-blue-600 mt-1"></i><span><strong>No Tab Switching</strong>. Moving to other tabs/windows is strictly prohibited.</span></li>
//              <li className="flex items-start gap-3 text-red-600 font-bold border-l-4 border-red-500 pl-3 bg-red-50 py-2"><i className="fa-solid fa-triangle-exclamation mt-1"></i><span>CRITICAL: If your Flag Count reaches {MAX_VIOLATIONS}, you will be IMMEDIATELY DISQUALIFIED.</span></li>
//            </ul>
//         </div>
//         <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
//           <input type="checkbox" className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500" checked={disclaimerAccepted} onChange={(e) => setDisclaimerAccepted(e.target.checked)}/>
//           <span className="font-bold text-slate-800">I have read the rules and agree to be proctored.</span>
//         </label>
//         <button onClick={handleStartInterview} disabled={!disclaimerAccepted} className={`w-full mt-6 py-4 rounded-lg font-bold text-xl uppercase tracking-wider transition-all shadow-xl ${disclaimerAccepted ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Start Assessment</button>
//       </div>
//     </div>
//   );

//   const renderDisqualifiedModal = () => (
//     <div className="fixed inset-0 bg-red-900 z-[200] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-8xl text-white mb-6 animate-pulse"><i className="fa-solid fa-ban"></i></div>
//       <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Disqualified</h1>
//       <p className="text-red-200 text-2xl font-bold max-w-2xl leading-normal mb-8">You have exceeded the maximum limit of {MAX_VIOLATIONS} violations.</p>
//       <button onClick={() => terminateSession("Disqualified")} className="bg-white text-red-900 px-10 py-5 rounded-lg font-black text-xl uppercase tracking-wider hover:bg-gray-100 transition-transform hover:scale-105">Return to Home</button>
//     </div>
//   );

//   const renderFullScreenModal = () => (
//     <div className="fixed inset-0 bg-slate-900 bg-opacity-100 z-[80] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-6xl text-yellow-500 mb-6 animate-pulse"><i className="fa-solid fa-expand"></i></div>
//       <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Full Screen Required</h2>
//       <p className="text-gray-300 max-w-lg mb-8 text-lg">You have exited full screen. <span className="text-red-400 font-bold">Resume immediately or you will be disqualified.</span></p>
//       <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg justify-center">
//         <button onClick={() => enterFullScreen()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg">Resume</button>
//         <button onClick={() => terminateSession("Exited Full Screen")} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg">Exit</button>
//       </div>
//     </div>
//   );

//   const renderViolationModal = () => (
//     <div className="fixed inset-0 bg-red-900 bg-opacity-95 backdrop-blur-xl z-[70] flex flex-col items-center justify-center p-6 text-center border-8 border-red-600">
//       <div className="text-7xl text-white mb-6 animate-pulse"><i className="fa-solid fa-triangle-exclamation"></i></div>
//       <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">Rules Violated</h2>
//       <p className="text-red-100 text-xl font-bold mb-8 max-w-2xl leading-relaxed">You attempted to leave the interview interface.</p>
//       <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
//         <button onClick={() => terminateSession("Tab Switch")} className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-6 py-4 rounded-lg border-2 border-gray-600 font-bold uppercase tracking-wider transition-all">Terminate</button>
//         <button onClick={() => setShowViolationModal(false)} className="flex-1 bg-white text-red-700 hover:bg-gray-100 px-6 py-4 rounded-lg font-black border-4 border-red-700 uppercase tracking-wider transition-all shadow-2xl hover:scale-105">Continue</button>
//       </div>
//     </div>
//   );

//   const renderPrivacyShutterModal = () => (
//     <div className="fixed inset-0 bg-black z-[90] flex flex-col items-center justify-center p-6 text-center border-8 border-gray-800">
//       <div className="text-7xl text-gray-500 mb-6 animate-pulse"><i className="fa-solid fa-eye-slash"></i></div>
//       <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">Camera Blocked</h2>
//       <p className="text-gray-300 text-xl font-bold mb-8 max-w-2xl leading-relaxed">We detected your camera privacy shutter is closed. <br/><span className="text-red-500">Open immediately.</span> <br/>Terminating in <span className="text-white bg-red-600 px-2 rounded">{120 - privacyShutterTimerRef.current}s</span>.</p>
//     </div>
//   );

//   // --- PROCESSING OVERLAY ---
//   const renderProcessingOverlay = () => (
//     <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-500">
//         <div className="relative mb-8">
//             <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
//             <i className="fa-solid fa-circle-notch animate-spin text-7xl text-white relative z-10"></i>
//         </div>
//         <h2 className="text-white text-4xl font-black uppercase tracking-widest animate-pulse">
//             Analysis in Progress
//         </h2>
//         <p className="text-blue-300 mt-4 text-lg font-mono">Generating Resume Audit Report...</p>
//     </div>
//   );

//   return (
//     <div className="min-h-screen flex flex-col p-4 md:p-6 bg-slate-50 relative overflow-x-hidden" onClick={() => { new Audio(BEEP_URL).play().catch(()=>{}) }}>
      
//       {/* 0. PROCESSING OVERLAY */}
//       {processing && renderProcessingOverlay()}
      
//       {isDisqualified && renderDisqualifiedModal()}
      
//       {!hasStarted && !isDisqualified && (
//           <>
//             {cameraStatus === 'checking' && <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center text-white font-bold text-xl"><i className="fa-solid fa-spinner animate-spin mr-3"></i> Checking System...</div>}
//             {cameraStatus === 'denied' && renderCameraDeniedModal()}
//             {cameraStatus === 'granted' && renderDisclaimerModal()}
//           </>
//        )}

//       {hasStarted && !isDisqualified && showFullScreenExitModal && renderFullScreenModal()}
//       {hasStarted && !isDisqualified && showViolationModal && renderViolationModal()}
//       {hasStarted && !isDisqualified && showPrivacyShutterModal && renderPrivacyShutterModal()}
      
//       {/* HEADER */}
//       <div className="flex flex-wrap justify-between items-center mb-6 md:mb-8 gap-4 px-1 shrink-0">
//         <div>
//            <h2 className="font-black text-2xl md:text-3xl uppercase text-slate-800 tracking-tight">RESUME <span className="text-blue-600">//</span> AUDIT</h2>
//            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
//              <p className="font-mono text-xs md:text-sm text-gray-400 font-bold uppercase">Field: {config.field}</p>
//              <span className="bg-red-100 text-red-600 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded border border-red-200">⚠️ {violations} FLAGS</span>
//            </div>
//         </div>
//         <div className="flex items-center gap-3 md:gap-4">
//            <div className="font-mono font-black text-white bg-slate-900 px-4 py-2 md:px-5 md:py-3 rounded shadow-lg text-sm md:text-lg">{currIndex + 1} <span className="text-gray-500">/</span> {questions.length}</div>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex flex-1 flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto w-full">
//         {/* LEFT: WEBCAM */}
//         <div className="w-full lg:w-1/3 flex flex-col gap-6 shrink-0">
//           <div className="card-panel p-2 shadow-xl border-slate-200 bg-white rounded-lg relative transition-all duration-300 z-0">
//               <WebcamFeed onViolation={handleViolation} />
//               <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded animate-pulse font-bold">REC</div>
//           </div>
//           <div className="card-panel p-6 md:p-8 border-l-4 border-blue-600 bg-white shadow-lg rounded-r-lg">
//             <h3 className="font-mono text-xs font-bold text-blue-500 uppercase mb-3 md:mb-4 flex items-center gap-2"><i className="fa-solid fa-terminal"></i> Interview Query</h3>
//             <p className="text-xl md:text-2xl font-bold text-slate-900 leading-snug break-words">{questions[currIndex]}</p>
//           </div>
//         </div>

//         {/* RIGHT: ANSWER TERMINAL */}
//         <div className="w-full lg:w-2/3 flex flex-col">
//           <div className="card-panel flex flex-col p-0 relative overflow-hidden shadow-2xl border-0 bg-white rounded-lg min-h-[400px] lg:min-h-[600px] h-full">
//             <div className="bg-slate-100 border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0">
//                <span className="text-xs font-bold text-gray-500 uppercase">Response Terminal</span>
//                <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
//             </div>
//             <div className="flex-1 relative">
//                <textarea
//                  className="w-full h-full min-h-[300px] lg:min-h-[450px] p-6 md:p-8 border-none outline-none resize-none text-lg md:text-xl font-mono font-bold text-slate-900 leading-relaxed bg-transparent focus:bg-slate-50 transition-colors pb-32"
//                  placeholder="> Explain your approach..."
//                  value={currentAnswer}
//                  onChange={(e) => setCurrentAnswer(e.target.value)}
//                  spellCheck="false"
//                />
//                <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
                  
//                   {/* MIC BUTTON */}
//                   <button onClick={toggleMic} className={`w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border-2 ${isListening ? 'border-red-500 bg-red-50 text-red-600 animate-pulse' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
//                     <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i> {isListening ? "Listening..." : "Dictate Answer"}
//                   </button>
                  
//                   {/* NAVIGATION BUTTONS */}
//                   <div className="flex gap-3 w-full sm:w-auto">
//                     {/* PREVIOUS BUTTON */}
//                     <button 
//                         onClick={handlePrevious}
//                         disabled={currIndex === 0 || processing}
//                         className="flex-1 sm:flex-none btn px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-slate-300 text-slate-700 rounded-lg font-bold flex justify-center items-center"
//                     >
//                          <i className="fa-solid fa-arrow-left mr-2"></i> PREV
//                     </button>

//                     {/* NEXT / FINALIZE BUTTON */}
//                     <button 
//                         onClick={handleNext} 
//                         disabled={processing} 
//                         className="flex-1 sm:flex-none btn btn-primary px-8 md:px-10 py-3 md:py-4 shadow-blue hover:shadow-xl transition-all disabled:opacity-50 bg-slate-900 text-white rounded-lg font-bold flex justify-center items-center"
//                     >
//                         {processing ? (
//                             <span><i className="fa-solid fa-cog animate-spin"></i> PROCESSING</span>
//                         ) : (
//                             <span>{currIndex === questions.length - 1 ? "FINALIZE" : "NEXT"} <i className="fa-solid fa-arrow-right"></i></span>
//                         )}
//                     </button>
//                   </div>

//                </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResumeInterview;
//------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------
//upto date working 
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import WebcamFeed from '../components/WebcamFeed';
// import { evaluateResumeSession, saveInterview } from '../services/api';
// import { loadProctoringModels } from '../utils/face-proctor';

// // --- EMBEDDED BEEP SOUND (Base64) ---
// const BEEP_URL = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMQAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZGlhZy4wAAD/7kmRAAAAAA0gAAAAANIAAAAADSCAAAA0ggAAAAAAAAAAAAAAA//uSZIYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmRmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmSmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmSmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAA";

// const ResumeInterview = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   // --- 1. PERSISTENCE LAYER ---
//   const SESSION_KEY = "resume_session_backup";
  
//   const getInitialState = () => {
//     const saved = localStorage.getItem(SESSION_KEY);
//     const propsData = location.state || {};
    
//     // CASE 1: Page Refresh (No Props, but LocalStorage exists)
//     // We prioritize the saved session to preserve content on refresh
//     if (saved && !propsData.questions) {
//       return JSON.parse(saved);
//     }

//     // CASE 2: New Interview Start (Props exist)
//     if (propsData.questions) {
//       if (saved) {
//         const parsed = JSON.parse(saved);
//         // Check if it's the same session based on field
//         if (parsed.config?.field === propsData.config?.field) {
//           // If the user refreshed or came back, return the IN-PROGRESS state, not a fresh one
//           return parsed;
//         }
//       }
//       return {
//         questions: propsData.questions || ["Error: No Questions Loaded"],
//         config: propsData.config || { field: "General", experience: "Junior" },
//         currIndex: 0,
//         answers: [], // This will store {question, answer} objects for every index
//         currentAnswer: "",
//         violations: 0,
//         hasStarted: false,
//         isDisqualified: false
//       };
//     }

//     // Fallback default
//     return {
//       questions: ["Error: No Questions Loaded"],
//       config: { field: "General", experience: "Junior" },
//       currIndex: 0,
//       answers: [],
//       currentAnswer: "",
//       violations: 0,
//       hasStarted: false,
//       isDisqualified: false
//     };
//   };

//   // Initialize State
//   const initialState = getInitialState();
//   const [questions] = useState(initialState.questions);
//   const [config] = useState(initialState.config);
  
//   const [currIndex, setCurrIndex] = useState(initialState.currIndex);
//   const [answers, setAnswers] = useState(initialState.answers);
//   const [currentAnswer, setCurrentAnswer] = useState(initialState.currentAnswer);
  
//   // --- FLAG STATE (PERSISTED) ---
//   const [violations, setViolations] = useState(initialState.violations);
  
//   // Runtime State
//   const [isListening, setIsListening] = useState(false);
//   const [processing, setProcessing] = useState(false);
  
//   // --- INTEGRITY & PROCTORING STATE ---
//   const [cameraStatus, setCameraStatus] = useState('checking'); 
//   const [hasStarted, setHasStarted] = useState(initialState.hasStarted || false);
//   const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
//   // CHECK DISQUALIFICATION ON LOAD
//   // If they were disqualified in the saved state, they remain disqualified
//   const [isDisqualified, setIsDisqualified] = useState(initialState.isDisqualified || false); 

//   const [showViolationModal, setShowViolationModal] = useState(false); 
//   const [showFullScreenExitModal, setShowFullScreenExitModal] = useState(false); 
//   const [showPrivacyShutterModal, setShowPrivacyShutterModal] = useState(false);

//   // Refs
//   const lastViolationTime = useRef(0);
//   const faceMissingCycleRef = useRef(0); 
//   const privacyShutterTimerRef = useRef(0); 

//   const MAX_VIOLATIONS = 10;

//   // --- REFRESH / HARD RELOAD DETECTION ---
//   // This effect runs ONCE on mount. It checks if the session was "started" but full screen is lost.
//   // This effectively catches Ctrl+F5 or Browser Refresh button actions.
//   useEffect(() => {
//     if (hasStarted && !isDisqualified) {
//         // Check browser full screen state
//         const isFullScreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        
//         if (!isFullScreen) {
//             console.warn("Hard Refresh or Full Screen Exit Detected on Load.");
            
//             // AUTOMATIC FLAG INCREMENT
//             setViolations(prev => {
//                 const newCount = prev + 1;
//                 return newCount;
//             });

//             // Trigger the Full Screen Modal immediately
//             setShowFullScreenExitModal(true);
            
//             // Play Beep
//             new Audio(BEEP_URL).play().catch(()=>{});
//         }
//     }
//   }, []); // Empty dependency array ensures this runs only on mount/refresh

//   // --- SAVE STATE ON CHANGE (PERSISTENCE) ---
//   useEffect(() => {
//     const stateToSave = {
//       questions,
//       config,
//       currIndex,
//       answers,
//       currentAnswer, // Crucial: Saves the text currently being typed
//       violations,
//       isDisqualified, // Persist disqualification status
//       hasStarted      // Persist started status to detect refreshes
//     };
//     localStorage.setItem(SESSION_KEY, JSON.stringify(stateToSave));
//   }, [currIndex, answers, currentAnswer, violations, questions, config, isDisqualified, hasStarted]);

//   // --- 0. INITIAL CAMERA CHECK ---
//   useEffect(() => {
//     async function checkCamera() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         stream.getTracks().forEach(track => track.stop());
//         setCameraStatus('granted');
//       } catch (err) {
//         console.error("Camera permission denied:", err);
//         setCameraStatus('denied');
//       }
//     }
//     checkCamera();
//     loadProctoringModels();
//   }, []);

//   // --- TERMINATION HELPER (SAVES TO DB) ---
//   const terminateSession = useCallback(async (reason) => {
//     if (document.fullscreenElement) {
//         document.exitFullscreen().catch(() => {});
//     }

//     // Set disqualified state immediately to block UI
//     setIsDisqualified(true);

//     // SAVE DISQUALIFIED SESSION TO DB
//     try {
//         const failurePayload = {
//             questions: answers, 
//             topic: config.field || "Resume Audit (Terminated)", 
//             totalScore: 0, 
//             overallFeedback: `DISQUALIFIED: ${reason}. Session terminated due to protocol violation.`,
//             roadmap: "N/A",
//             question_reviews: [],
//             silent_killers: ["Procedural Integrity Violation", reason],
//             integrity_score: 0,
//             violations_count: violations
//         };
//         console.log("💾 Saving Terminated Resume Session...", failurePayload);
//         await saveInterview(failurePayload);
//     } catch (e) {
//         console.error("Failed to save termination log:", e);
//     }

//     // Clear session and navigate home
//     localStorage.removeItem(SESSION_KEY);
//     const video = document.querySelector('video');
//     if (video && video.srcObject) {
//       video.srcObject.getTracks().forEach(track => track.stop());
//     }
//     navigate('/'); 
//   }, [navigate, SESSION_KEY, answers, config.field, violations]);

//   // --- FULL SCREEN ENFORCEMENT ---
//   const enterFullScreen = async () => {
//     const elem = document.documentElement;
//     try {
//       if (elem.requestFullscreen) {
//         await elem.requestFullscreen();
//       } else if (elem.webkitRequestFullscreen) { 
//         await elem.webkitRequestFullscreen();
//       } else if (elem.msRequestFullscreen) { 
//         await elem.msRequestFullscreen();
//       }
//     } catch (err) {
//       console.log("Full screen request denied:", err);
//     }
//   };

//   const handleStartInterview = () => {
//     if (!disclaimerAccepted) return alert("You must agree to the guidelines.");
//     enterFullScreen().then(() => {
//         setHasStarted(true);
//     }).catch(() => {
//         setHasStarted(true);
//     });
//   };

//   // --- VIOLATION HANDLER ---
//   const handleViolation = useCallback((reason, isMajor = false) => {
//     if (!hasStarted || isDisqualified) return;

//     if (reason === "Privacy Shutter Detected") {
//         setShowPrivacyShutterModal(true);
//         return;
//     }

//     if (reason === "FACE_MISSING_20S") {
//         faceMissingCycleRef.current += 1;
//         const strikes = faceMissingCycleRef.current;
//         console.warn(`Face Missing Strike: ${strikes}/3`);

//         if (strikes >= 3) {
//             setIsDisqualified(true); 
//             if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
//             alert("You attempted cheating (Face Missing 3x).");
//             terminateSession("Face Missing 3x");
//         } else {
//             setViolations(prev => prev + 1);
//             alert(`WARNING: Face not visible for 20s. Strike ${strikes}/3.`);
//         }
//         return;
//     }

//     const now = Date.now();
//     if (now - lastViolationTime.current < 1000) return;
//     lastViolationTime.current = now;
    
//     new Audio(BEEP_URL).play().catch(()=>{});
    
//     console.warn(`VIOLATION: ${reason}`);
//     setViolations(prev => {
//         const newCount = prev + 1;
//         if (newCount >= MAX_VIOLATIONS) {
//             setIsDisqualified(true);
//         }
//         return newCount;
//     });
    
//     if (reason.includes("Tab") || reason.includes("Focus")) {
//       setShowViolationModal(true);
//     }
//   }, [hasStarted, isDisqualified, terminateSession]);

//   // --- PRIVACY SHUTTER MONITOR ---
//   useEffect(() => {
//     if (!hasStarted || isDisqualified) return;
    
//     const interval = setInterval(() => {
//         const video = document.querySelector('video');
//         if (!video) return;

//         try {
//             const canvas = document.createElement('canvas');
//             canvas.width = 50; canvas.height = 50;
//             const ctx = canvas.getContext('2d');
//             ctx.drawImage(video, 0, 0, 50, 50);
//             const data = ctx.getImageData(0, 0, 50, 50).data;
//             let brightness = 0;
//             for(let i=0; i<data.length; i+=4) brightness += (data[i]+data[i+1]+data[i+2])/3;
//             brightness = brightness / (data.length/4);

//             if (brightness < 10) {
//                 if (!showPrivacyShutterModal) {
//                     setShowPrivacyShutterModal(true);
//                     handleViolation("Privacy Shutter Detected");
//                 }
//                 privacyShutterTimerRef.current += 1;
//                 if (privacyShutterTimerRef.current >= 120) {
//                     terminateSession("Camera covered for > 2 minutes.");
//                 }
//             } else {
//                 if (showPrivacyShutterModal) {
//                     setShowPrivacyShutterModal(false);
//                     privacyShutterTimerRef.current = 0;
//                 }
//             }
//         } catch(e) {}
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [hasStarted, isDisqualified, showPrivacyShutterModal, handleViolation, terminateSession]);

//   // --- LISTENERS ---
//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       if (!hasStarted || isDisqualified) return;
//       if (!document.fullscreenElement && !document.webkitFullscreenElement) {
//         setShowFullScreenExitModal(true);
//         handleViolation("Exited Full Screen Mode");
//       } else {
//         setShowFullScreenExitModal(false);
//       }
//     };
//     document.addEventListener("fullscreenchange", handleFullScreenChange);
//     return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
//   }, [hasStarted, isDisqualified, handleViolation]);

//   useEffect(() => {
//     if (!hasStarted || isDisqualified) return;
//     const handleVisibilityChange = () => {
//       if (document.hidden) handleViolation("User Left Tab / Minimized");
//     };
//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, [handleViolation, hasStarted, isDisqualified]);

//   // --- STT & INTERVIEW LOGIC ---
//   const recognition = window.SpeechRecognition || window.webkitSpeechRecognition 
//     ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() 
//     : null;

//   if (recognition) {
//     recognition.continuous = true;
//     recognition.lang = 'en-US';
//   }

//   const toggleMic = () => {
//     if (!recognition) return alert("Speech API not supported.");
    
//     if (isListening) {
//       recognition.stop();
//       setIsListening(false);
//     } else {
//       recognition.start();
//       setIsListening(true);
//       recognition.onresult = (event) => {
//         const transcript = Array.from(event.results)
//           .map(result => result[0].transcript)
//           .join('');
//         setCurrentAnswer(prev => prev + " " + transcript);
//       };
//     }
//   };

//   // --- NAVIGATION HANDLERS ---
  
//   // Logic to handle saving state when moving BACKWARDS
//   const handlePrevious = () => {
//     if (currIndex > 0) {
//         if (isListening) {
//             recognition.stop();
//             setIsListening(false);
//         }

//         // 1. SAVE CURRENT ANSWER INSTANTLY
//         const updatedAnswers = [...answers];
//         updatedAnswers[currIndex] = {
//             question: questions[currIndex],
//             answer: currentAnswer // Save whatever is in the textarea right now
//         };
//         setAnswers(updatedAnswers);

//         // 2. MOVE BACK
//         const prevIndex = currIndex - 1;
//         setCurrIndex(prevIndex);

//         // 3. RESTORE PREVIOUS ANSWER
//         const prevData = updatedAnswers[prevIndex];
//         setCurrentAnswer(prevData ? prevData.answer : "");
//     }
//   };

//   const handleNext = async () => {
//     // 1. SAVE CURRENT ANSWER INSTANTLY
//     const updatedAnswers = [...answers];
//     // Always overwrite the entry at currIndex with current text
//     updatedAnswers[currIndex] = { 
//       question: questions[currIndex], 
//       answer: currentAnswer || "[No Answer Provided]" 
//     };
//     setAnswers(updatedAnswers);
    
//     if (isListening) {
//       recognition.stop();
//       setIsListening(false);
//     }

//     if (currIndex + 1 < questions.length) {
//       // 2. MOVE FORWARD
//       const nextIndex = currIndex + 1;
//       setCurrIndex(nextIndex);
      
//       // 3. LOAD NEXT ANSWER (IF EXISTS)
//       const nextData = updatedAnswers[nextIndex];
//       setCurrentAnswer(nextData ? nextData.answer : "");

//     } else {
//       // FINALIZE
//       finishInterview(updatedAnswers);
//     }
//   };

//   const finishInterview = async (finalAnswers) => {
//     setProcessing(true); // Triggers the overlay
    
//     // 1. EVALUATE WITH RESUME API
//     let evaluationResult = null;
//     try {
//         console.log("🧠 Sending for Evaluation...", finalAnswers);
//         const response = await evaluateResumeSession(
//             finalAnswers, 
//             config.field, // Use field for context
//             config.experience
//         );
//         evaluationResult = response.data || response;
//     } catch (error) {
//         console.error("Evaluation Error:", error);
//         evaluationResult = {
//             score: 0,
//             summary: "AI Analysis Failed. Please retry.",
//             silent_killers: [],
//             roadmap: "",
//             question_reviews: []
//         };
//     }

//     // 2. CONSTRUCT CLEAN DATA FOR DB & UI
//     const cleanReport = {
//         score: Number(evaluationResult.score) || 0,
//         summary: String(evaluationResult.summary || "No summary available."),
//         roadmap: String(evaluationResult.roadmap || "No roadmap available."),
//         silent_killers: Array.isArray(evaluationResult.silent_killers) ? evaluationResult.silent_killers : [],
//         question_reviews: Array.isArray(evaluationResult.question_reviews) ? evaluationResult.question_reviews : []
//     };

//     const integrityScore = Math.max(0, 100 - (violations * 10));

//     // 3. SAVE WITH CORRECT TOPIC
//     try {
//       const fullPayload = {
//         questions: finalAnswers,
//         topic: config.field || "Resume Audit", 
//         totalScore: cleanReport.score,
//         overallFeedback: cleanReport.summary,
//         roadmap: cleanReport.roadmap,
//         question_reviews: cleanReport.question_reviews, 
//         silent_killers: cleanReport.silent_killers,
//         integrity_score: integrityScore,
//         violations_count: violations
//       };

//       console.log("💾 Saving Session to History:", fullPayload);
//       await saveInterview(fullPayload);
//       localStorage.removeItem(SESSION_KEY); 
      
//       // 4. NAVIGATE TO REPORT
//       navigate('/resume-report', { state: { 
//         report: JSON.parse(JSON.stringify(cleanReport)), 
//         feedback: JSON.parse(JSON.stringify(cleanReport)), 
//         answers: finalAnswers,
//         integrity: { score: integrityScore, count: violations }
//       }});

//     } catch (err) {
//       console.error("Critical Save/Nav Error:", err);
//       alert("Error saving session. Check console.");
//       setProcessing(false);
//     }
//   };

//   // --- RENDER HELPERS ---

//   const renderCameraDeniedModal = () => (
//     <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-6xl text-red-500 mb-6 animate-pulse"><i className="fa-solid fa-video-slash"></i></div>
//       <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Camera Access Required</h2>
//       <button onClick={() => window.location.reload()} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider">Reload Page</button>
//     </div>
//   );

//   const renderDisclaimerModal = () => (
//     <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
//       <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl p-6 md:p-10 relative">
//         <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-6 border-b-4 border-blue-600 pb-4">Resume Audit Guidelines</h2>
//         <div className="space-y-4 mb-8 text-slate-700 text-lg leading-relaxed">
//            <ul className="list-none space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-200">
//              <li className="flex items-start gap-3"><i className="fa-solid fa-expand text-blue-600 mt-1"></i><span><strong>Full Screen Mode</strong> is mandatory. Exiting will trigger a violation flag.</span></li>
//              <li className="flex items-start gap-3"><i className="fa-solid fa-eye text-blue-600 mt-1"></i><span><strong>Face Visibility</strong>: If your face is not in the frame for <strong>20 seconds</strong>, a flag will be triggered.<span className="block text-red-600 text-sm mt-1 font-bold">⚠️ If this cycle repeats 3 times, you will be DISQUALIFIED immediately.</span></span></li>
//              <li className="flex items-start gap-3"><i className="fa-solid fa-arrows-to-eye text-blue-600 mt-1"></i><span><strong>Head Movement</strong>: Looking Left, Right, Up, or Down away from the camera will <strong>trigger a flag immediately</strong>.</span></li>
//              <li className="flex items-start gap-3"><i className="fa-solid fa-window-restore text-blue-600 mt-1"></i><span><strong>No Tab Switching</strong>. Moving to other tabs/windows is strictly prohibited.</span></li>
//              <li className="flex items-start gap-3 text-red-600 font-bold border-l-4 border-red-500 pl-3 bg-red-50 py-2"><i className="fa-solid fa-triangle-exclamation mt-1"></i><span>CRITICAL: If your Flag Count reaches {MAX_VIOLATIONS}, you will be IMMEDIATELY DISQUALIFIED.</span></li>
//            </ul>
//         </div>
//         <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
//           <input type="checkbox" className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500" checked={disclaimerAccepted} onChange={(e) => setDisclaimerAccepted(e.target.checked)}/>
//           <span className="font-bold text-slate-800">I have read the rules and agree to be proctored.</span>
//         </label>
//         <button onClick={handleStartInterview} disabled={!disclaimerAccepted} className={`w-full mt-6 py-4 rounded-lg font-bold text-xl uppercase tracking-wider transition-all shadow-xl ${disclaimerAccepted ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Start Assessment</button>
//       </div>
//     </div>
//   );

//   const renderDisqualifiedModal = () => (
//     <div className="fixed inset-0 bg-red-900 z-[200] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-8xl text-white mb-6 animate-pulse"><i className="fa-solid fa-ban"></i></div>
//       <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Disqualified</h1>
//       <p className="text-red-200 text-2xl font-bold max-w-2xl leading-normal mb-8">You have exceeded the maximum limit of {MAX_VIOLATIONS} violations.</p>
//       <button onClick={() => terminateSession("Disqualified")} className="bg-white text-red-900 px-10 py-5 rounded-lg font-black text-xl uppercase tracking-wider hover:bg-gray-100 transition-transform hover:scale-105">Return to Home</button>
//     </div>
//   );

//   const renderFullScreenModal = () => (
//     <div className="fixed inset-0 bg-slate-900 bg-opacity-100 z-[80] flex flex-col items-center justify-center p-6 text-center">
//       <div className="text-6xl text-yellow-500 mb-6 animate-pulse"><i className="fa-solid fa-expand"></i></div>
//       <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Full Screen Required</h2>
//       <p className="text-gray-300 max-w-lg mb-8 text-lg">You have exited full screen. <span className="text-red-400 font-bold">Resume immediately or you will be disqualified.</span></p>
//       <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg justify-center">
//         <button onClick={() => enterFullScreen()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg">Resume</button>
//         <button onClick={() => terminateSession("Exited Full Screen")} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg">Exit</button>
//       </div>
//     </div>
//   );

//   const renderViolationModal = () => (
//     <div className="fixed inset-0 bg-red-900 bg-opacity-95 backdrop-blur-xl z-[70] flex flex-col items-center justify-center p-6 text-center border-8 border-red-600">
//       <div className="text-7xl text-white mb-6 animate-pulse"><i className="fa-solid fa-triangle-exclamation"></i></div>
//       <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">Rules Violated</h2>
//       <p className="text-red-100 text-xl font-bold mb-8 max-w-2xl leading-relaxed">You attempted to leave the interview interface.</p>
//       <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
//         <button onClick={() => terminateSession("Tab Switch")} className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-6 py-4 rounded-lg border-2 border-gray-600 font-bold uppercase tracking-wider transition-all">Terminate</button>
//         <button onClick={() => setShowViolationModal(false)} className="flex-1 bg-white text-red-700 hover:bg-gray-100 px-6 py-4 rounded-lg font-black border-4 border-red-700 uppercase tracking-wider transition-all shadow-2xl hover:scale-105">Continue</button>
//       </div>
//     </div>
//   );

//   const renderPrivacyShutterModal = () => (
//     <div className="fixed inset-0 bg-black z-[90] flex flex-col items-center justify-center p-6 text-center border-8 border-gray-800">
//       <div className="text-7xl text-gray-500 mb-6 animate-pulse"><i className="fa-solid fa-eye-slash"></i></div>
//       <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">Camera Blocked</h2>
//       <p className="text-gray-300 text-xl font-bold mb-8 max-w-2xl leading-relaxed">We detected your camera privacy shutter is closed. <br/><span className="text-red-500">Open immediately.</span> <br/>Terminating in <span className="text-white bg-red-600 px-2 rounded">{120 - privacyShutterTimerRef.current}s</span>.</p>
//     </div>
//   );

//   // --- PROCESSING OVERLAY ---
//   const renderProcessingOverlay = () => (
//     <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-500">
//         <div className="relative mb-8">
//             <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
//             <i className="fa-solid fa-circle-notch animate-spin text-7xl text-white relative z-10"></i>
//         </div>
//         <h2 className="text-white text-4xl font-black uppercase tracking-widest animate-pulse">
//             Analysis in Progress
//         </h2>
//         <p className="text-blue-300 mt-4 text-lg font-mono">Generating Resume Audit Report...</p>
//     </div>
//   );

//   return (
//     <div className="min-h-screen flex flex-col p-4 md:p-6 bg-slate-50 relative overflow-x-hidden" onClick={() => { new Audio(BEEP_URL).play().catch(()=>{}) }}>
      
//       {/* 0. PROCESSING OVERLAY */}
//       {processing && renderProcessingOverlay()}
      
//       {isDisqualified && renderDisqualifiedModal()}
      
//       {!hasStarted && !isDisqualified && (
//           <>
//             {cameraStatus === 'checking' && <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center text-white font-bold text-xl"><i className="fa-solid fa-spinner animate-spin mr-3"></i> Checking System...</div>}
//             {cameraStatus === 'denied' && renderCameraDeniedModal()}
//             {cameraStatus === 'granted' && renderDisclaimerModal()}
//           </>
//        )}

//       {hasStarted && !isDisqualified && showFullScreenExitModal && renderFullScreenModal()}
//       {hasStarted && !isDisqualified && showViolationModal && renderViolationModal()}
//       {hasStarted && !isDisqualified && showPrivacyShutterModal && renderPrivacyShutterModal()}
      
//       {/* HEADER */}
//       <div className="flex flex-wrap justify-between items-center mb-6 md:mb-8 gap-4 px-1 shrink-0">
//         <div>
//            <h2 className="font-black text-2xl md:text-3xl uppercase text-slate-800 tracking-tight">RESUME <span className="text-blue-600">//</span> AUDIT</h2>
//            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
//              <p className="font-mono text-xs md:text-sm text-gray-400 font-bold uppercase">Field: {config.field}</p>
//              <span className="bg-red-100 text-red-600 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded border border-red-200">⚠️ {violations} FLAGS</span>
//            </div>
//         </div>
//         <div className="flex items-center gap-3 md:gap-4">
//            <div className="font-mono font-black text-white bg-slate-900 px-4 py-2 md:px-5 md:py-3 rounded shadow-lg text-sm md:text-lg">{currIndex + 1} <span className="text-gray-500">/</span> {questions.length}</div>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex flex-1 flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto w-full">
//         {/* LEFT: WEBCAM */}
//         <div className="w-full lg:w-1/3 flex flex-col gap-6 shrink-0">
//           <div className="card-panel p-2 shadow-xl border-slate-200 bg-white rounded-lg relative transition-all duration-300 z-0">
//               <WebcamFeed onViolation={handleViolation} />
//               <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded animate-pulse font-bold">REC</div>
//           </div>
//           <div className="card-panel p-6 md:p-8 border-l-4 border-blue-600 bg-white shadow-lg rounded-r-lg">
//             <h3 className="font-mono text-xs font-bold text-blue-500 uppercase mb-3 md:mb-4 flex items-center gap-2"><i className="fa-solid fa-terminal"></i> Interview Query</h3>
//             <p className="text-xl md:text-2xl font-bold text-slate-900 leading-snug break-words">{questions[currIndex]}</p>
//           </div>
//         </div>

//         {/* RIGHT: ANSWER TERMINAL */}
//         <div className="w-full lg:w-2/3 flex flex-col">
//           <div className="card-panel flex flex-col p-0 relative overflow-hidden shadow-2xl border-0 bg-white rounded-lg min-h-[400px] lg:min-h-[600px] h-full">
//             <div className="bg-slate-100 border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0">
//                <span className="text-xs font-bold text-gray-500 uppercase">Response Terminal</span>
//                <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
//             </div>
//             <div className="flex-1 relative">
//                <textarea
//                  className="w-full h-full min-h-[300px] lg:min-h-[450px] p-6 md:p-8 border-none outline-none resize-none text-lg md:text-xl font-mono font-bold text-slate-900 leading-relaxed bg-transparent focus:bg-slate-50 transition-colors pb-32"
//                  placeholder="> Explain your approach..."
//                  value={currentAnswer}
//                  onChange={(e) => setCurrentAnswer(e.target.value)}
//                  spellCheck="false"
//                />
//                <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
                  
//                   {/* MIC BUTTON */}
//                   <button onClick={toggleMic} className={`w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border-2 ${isListening ? 'border-red-500 bg-red-50 text-red-600 animate-pulse' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
//                     <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i> {isListening ? "Listening..." : "Dictate Answer"}
//                   </button>
                  
//                   {/* NAVIGATION BUTTONS */}
//                   <div className="flex gap-3 w-full sm:w-auto">
//                     {/* PREVIOUS BUTTON */}
//                     <button 
//                         onClick={handlePrevious}
//                         disabled={currIndex === 0 || processing}
//                         className="flex-1 sm:flex-none btn px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-slate-300 text-slate-700 rounded-lg font-bold flex justify-center items-center"
//                     >
//                          <i className="fa-solid fa-arrow-left mr-2"></i> PREV
//                     </button>

//                     {/* NEXT / FINALIZE BUTTON */}
//                     <button 
//                         onClick={handleNext} 
//                         disabled={processing} 
//                         className="flex-1 sm:flex-none btn btn-primary px-8 md:px-10 py-3 md:py-4 shadow-blue hover:shadow-xl transition-all disabled:opacity-50 bg-slate-900 text-white rounded-lg font-bold flex justify-center items-center"
//                     >
//                         {processing ? (
//                             <span><i className="fa-solid fa-cog animate-spin"></i> PROCESSING</span>
//                         ) : (
//                             <span>{currIndex === questions.length - 1 ? "FINALIZE" : "NEXT"} <i className="fa-solid fa-arrow-right"></i></span>
//                         )}
//                     </button>
//                   </div>

//                </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResumeInterview;
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//12 feb
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WebcamFeed from '../components/WebcamFeed';
import { evaluateResumeSession, saveInterview } from '../services/api';
import { loadProctoringModels } from '../utils/face-proctor';

// --- EMBEDDED BEEP SOUND (Base64) ---
const BEEP_URL = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMQAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZGlhZy4wAAD/7kmRAAAAAA0gAAAAANIAAAAADSCAAAA0ggAAAAAAAAAAAAAAA//uSZIYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmRmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmSmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAAP/7kmSmAAAADSDgAAAA0gAAAAANIAAAADSAAAAAAAAAAAAAAAD/+5JkpgAAAA0g4AAAANIAAAAADSDgAAAA0gAAAAAAAAAAAAAAA//uSZKYAAAANIOAAAADSAAAAAA0g4AAAANIAAAAAAAAAAAAAAA";

const ResumeInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- 1. PERSISTENCE LAYER ---
  const SESSION_KEY = "resume_session_backup";
  
  const getInitialState = () => {
    const saved = localStorage.getItem(SESSION_KEY);
    const propsData = location.state || {};
    
    // CASE 1: Page Refresh (No Props, but LocalStorage exists)
    if (saved && !propsData.questions) {
      return JSON.parse(saved);
    }

    // CASE 2: New Interview Start (Props exist)
    if (propsData.questions) {
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if it's the same session based on field
        if (parsed.config?.field === propsData.config?.field) {
          return parsed;
        }
      }
      return {
        questions: propsData.questions || ["Error: No Questions Loaded"],
        config: propsData.config || { field: "General", experience: "Junior" },
        currIndex: 0,
        answers: [],
        currentAnswer: "",
        violations: 0,
        hasStarted: false,
        isDisqualified: false,
        isSubmitted: false // NEW: Track if user clicked Finalize
      };
    }

    // Fallback default
    return {
      questions: ["Error: No Questions Loaded"],
      config: { field: "General", experience: "Junior" },
      currIndex: 0,
      answers: [],
      currentAnswer: "",
      violations: 0,
      hasStarted: false,
      isDisqualified: false,
      isSubmitted: false
    };
  };

  // Initialize State
  const initialState = getInitialState();
  const [questions] = useState(initialState.questions);
  const [config] = useState(initialState.config);
  
  const [currIndex, setCurrIndex] = useState(initialState.currIndex);
  const [answers, setAnswers] = useState(initialState.answers);
  const [currentAnswer, setCurrentAnswer] = useState(initialState.currentAnswer);
  
  // --- FLAG STATE (PERSISTED) ---
  const [violations, setViolations] = useState(initialState.violations);
  
  // Runtime State
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // --- INTEGRITY & PROCTORING STATE ---
  const [cameraStatus, setCameraStatus] = useState('checking'); 
  const [hasStarted, setHasStarted] = useState(initialState.hasStarted || false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(initialState.isDisqualified || false); 

  // --- NEW: SUBMISSION LOCK STATE ---
  // If true, proctoring is OFF, UI is locked, and we are processing (even after refresh)
  const [isSubmitted, setIsSubmitted] = useState(initialState.isSubmitted || false);

  const [showViolationModal, setShowViolationModal] = useState(false); 
  const [showFullScreenExitModal, setShowFullScreenExitModal] = useState(false); 
  const [showPrivacyShutterModal, setShowPrivacyShutterModal] = useState(false);

  // Refs
  const lastViolationTime = useRef(0);
  const faceMissingCycleRef = useRef(0); 
  const privacyShutterTimerRef = useRef(0); 

  const MAX_VIOLATIONS = 10;

  // --- REFRESH / HARD RELOAD DETECTION ---
  useEffect(() => {
    // If submitted, we DO NOT check for fullscreen or refresh penalties.
    // We just want to recover the session.
    if (isSubmitted) {
        setProcessing(true); // Restore processing overlay
        return;
    }

    if (hasStarted && !isDisqualified) {
        const isFullScreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        
        if (!isFullScreen) {
            console.warn("Hard Refresh or Full Screen Exit Detected on Load.");
            
            setViolations(prev => prev + 1);
            setShowFullScreenExitModal(true);
            new Audio(BEEP_URL).play().catch(()=>{});
        }
    }
  }, []);

  // --- SAVE STATE ON CHANGE (PERSISTENCE) ---
  useEffect(() => {
    const stateToSave = {
      questions,
      config,
      currIndex,
      answers,
      currentAnswer,
      violations,
      isDisqualified,
      hasStarted,
      isSubmitted // PERSIST: Save submission state
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(stateToSave));
  }, [currIndex, answers, currentAnswer, violations, questions, config, isDisqualified, hasStarted, isSubmitted]);

  // --- 0. INITIAL CAMERA CHECK ---
  useEffect(() => {
    async function checkCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setCameraStatus('granted');
      } catch (err) {
        console.error("Camera permission denied:", err);
        setCameraStatus('denied');
      }
    }
    checkCamera();
    loadProctoringModels();
  }, []);

  // --- TERMINATION HELPER ---
  const terminateSession = useCallback(async (reason) => {
    // If submitted, user cannot be terminated anymore (answer is locked)
    if (isSubmitted) return;

    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }

    setIsDisqualified(true);

    try {
        const failurePayload = {
            questions: answers, 
            topic: config.field || "Resume Audit (Terminated)", 
            totalScore: 0, 
            overallFeedback: `DISQUALIFIED: ${reason}. Session terminated due to protocol violation.`,
            roadmap: "N/A",
            question_reviews: [],
            silent_killers: ["Procedural Integrity Violation", reason],
            integrity_score: 0,
            violations_count: violations
        };
        console.log("💾 Saving Terminated Resume Session...", failurePayload);
        await saveInterview(failurePayload);
    } catch (e) {
        console.error("Failed to save termination log:", e);
    }

    localStorage.removeItem(SESSION_KEY);
    const video = document.querySelector('video');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    navigate('/'); 
  }, [navigate, SESSION_KEY, answers, config.field, violations, isSubmitted]);

  // --- FULL SCREEN ENFORCEMENT ---
  const enterFullScreen = async () => {
    const elem = document.documentElement;
    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { 
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { 
        await elem.msRequestFullscreen();
      }
    } catch (err) {
      console.log("Full screen request denied:", err);
    }
  };

  const handleStartInterview = () => {
    if (!disclaimerAccepted) return alert("You must agree to the guidelines.");
    enterFullScreen().then(() => {
        setHasStarted(true);
    }).catch(() => {
        setHasStarted(true);
    });
  };

  // --- VIOLATION HANDLER ---
  const handleViolation = useCallback((reason, isMajor = false) => {
    // CRITICAL: DISABLE ALL PROCTORING IF SUBMITTED
    if (isSubmitted) return;
    
    if (!hasStarted || isDisqualified) return;

    if (reason === "Privacy Shutter Detected") {
        setShowPrivacyShutterModal(true);
        return;
    }

    if (reason === "FACE_MISSING_20S") {
        faceMissingCycleRef.current += 1;
        const strikes = faceMissingCycleRef.current;
        console.warn(`Face Missing Strike: ${strikes}/3`);

        if (strikes >= 3) {
            setIsDisqualified(true); 
            if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
            alert("You attempted cheating (Face Missing 3x).");
            terminateSession("Face Missing 3x");
        } else {
            setViolations(prev => prev + 1);
            alert(`WARNING: Face not visible for 20s. Strike ${strikes}/3.`);
        }
        return;
    }

    const now = Date.now();
    if (now - lastViolationTime.current < 1000) return;
    lastViolationTime.current = now;
    
    new Audio(BEEP_URL).play().catch(()=>{});
    
    console.warn(`VIOLATION: ${reason}`);
    setViolations(prev => {
        const newCount = prev + 1;
        if (newCount >= MAX_VIOLATIONS) {
            setIsDisqualified(true);
        }
        return newCount;
    });
    
    if (reason.includes("Tab") || reason.includes("Focus")) {
      setShowViolationModal(true);
    }
  }, [hasStarted, isDisqualified, terminateSession, isSubmitted]);

  // --- PRIVACY SHUTTER MONITOR ---
  useEffect(() => {
    if (isSubmitted) return; // Disable check if submitted
    if (!hasStarted || isDisqualified) return;
    
    const interval = setInterval(() => {
        const video = document.querySelector('video');
        if (!video) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = 50; canvas.height = 50;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, 50, 50);
            const data = ctx.getImageData(0, 0, 50, 50).data;
            let brightness = 0;
            for(let i=0; i<data.length; i+=4) brightness += (data[i]+data[i+1]+data[i+2])/3;
            brightness = brightness / (data.length/4);

            if (brightness < 10) {
                if (!showPrivacyShutterModal) {
                    setShowPrivacyShutterModal(true);
                    handleViolation("Privacy Shutter Detected");
                }
                privacyShutterTimerRef.current += 1;
                if (privacyShutterTimerRef.current >= 120) {
                    terminateSession("Camera covered for > 2 minutes.");
                }
            } else {
                if (showPrivacyShutterModal) {
                    setShowPrivacyShutterModal(false);
                    privacyShutterTimerRef.current = 0;
                }
            }
        } catch(e) {}
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isDisqualified, showPrivacyShutterModal, handleViolation, terminateSession, isSubmitted]);

  // --- LISTENERS ---
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (isSubmitted) return; // Disable check if submitted
      if (!hasStarted || isDisqualified) return;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setShowFullScreenExitModal(true);
        handleViolation("Exited Full Screen Mode");
      } else {
        setShowFullScreenExitModal(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, [hasStarted, isDisqualified, handleViolation, isSubmitted]);

  useEffect(() => {
    if (isSubmitted) return; // Disable check if submitted
    if (!hasStarted || isDisqualified) return;
    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation("User Left Tab / Minimized");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleViolation, hasStarted, isDisqualified, isSubmitted]);

  // --- STT & INTERVIEW LOGIC ---
  const recognition = window.SpeechRecognition || window.webkitSpeechRecognition 
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() 
    : null;

  if (recognition) {
    recognition.continuous = true;
    recognition.lang = 'en-US';
  }

  const toggleMic = () => {
    if (isSubmitted) return; // Disable mic if submitted
    if (!recognition) return alert("Speech API not supported.");
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setCurrentAnswer(prev => prev + " " + transcript);
      };
    }
  };

  // --- NAVIGATION HANDLERS ---
  const handlePrevious = () => {
    if (isSubmitted) return; // Disable nav if submitted
    if (currIndex > 0) {
        if (isListening) {
            recognition.stop();
            setIsListening(false);
        }

        const updatedAnswers = [...answers];
        updatedAnswers[currIndex] = {
            question: questions[currIndex],
            answer: currentAnswer
        };
        setAnswers(updatedAnswers);

        const prevIndex = currIndex - 1;
        setCurrIndex(prevIndex);

        const prevData = updatedAnswers[prevIndex];
        setCurrentAnswer(prevData ? prevData.answer : "");
    }
  };

  const handleNext = async () => {
    if (isSubmitted) return; // Disable nav if submitted

    const updatedAnswers = [...answers];
    updatedAnswers[currIndex] = { 
      question: questions[currIndex], 
      answer: currentAnswer || "[No Answer Provided]" 
    };
    setAnswers(updatedAnswers);
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    }

    if (currIndex + 1 < questions.length) {
      const nextIndex = currIndex + 1;
      setCurrIndex(nextIndex);
      
      const nextData = updatedAnswers[nextIndex];
      setCurrentAnswer(nextData ? nextData.answer : "");

    } else {
      // FINALIZE
      finishInterview(updatedAnswers);
    }
  };

  // --- FINISH LOGIC (UPDATED FOR RESILIENCE) ---
  const finishInterview = async (finalAnswers) => {
    // 1. LOCK THE STATE IMMEDIATELY
    setIsSubmitted(true);
    setProcessing(true);
    
    // 1a. Force immediate persistence of the 'isSubmitted' flag and 'answers'
    // in case the browser crashes/refreshes during the API call.
    const lockingState = {
      questions,
      config,
      currIndex,
      answers: finalAnswers,
      currentAnswer,
      violations,
      isDisqualified,
      hasStarted,
      isSubmitted: true // Lock
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(lockingState));

    // 2. STOP RECORDING / MEDIA
    const video = document.querySelector('video');
    if (video && video.srcObject) {
       // Optional: Stop camera stream to save resources, or keep it running in bg
       // video.srcObject.getTracks().forEach(track => track.stop());
    }

    // 3. EVALUATE WITH RESUME API
    let evaluationResult = null;
    try {
        console.log("🧠 Sending for Evaluation...", finalAnswers);
        const response = await evaluateResumeSession(
            finalAnswers, 
            config.field, 
            config.experience
        );
        evaluationResult = response.data || response;
    } catch (error) {
        console.error("Evaluation Error:", error);
        // Do not unlock isSubmitted. User must wait or refresh (which will retry).
        evaluationResult = {
            score: 0,
            summary: "AI Analysis Failed. Retrying...",
            silent_killers: [],
            roadmap: "",
            question_reviews: []
        };
    }

    const cleanReport = {
        score: Number(evaluationResult.score) || 0,
        summary: String(evaluationResult.summary || "No summary available."),
        roadmap: String(evaluationResult.roadmap || "No roadmap available."),
        silent_killers: Array.isArray(evaluationResult.silent_killers) ? evaluationResult.silent_killers : [],
        question_reviews: Array.isArray(evaluationResult.question_reviews) ? evaluationResult.question_reviews : []
    };

    const integrityScore = Math.max(0, 100 - (violations * 10));

    // 4. SAVE WITH CORRECT TOPIC
    try {
      const fullPayload = {
        questions: finalAnswers,
        topic: config.field || "Resume Audit", 
        totalScore: cleanReport.score,
        overallFeedback: cleanReport.summary,
        roadmap: cleanReport.roadmap,
        question_reviews: cleanReport.question_reviews, 
        silent_killers: cleanReport.silent_killers,
        integrity_score: integrityScore,
        violations_count: violations
      };

      console.log("💾 Saving Session to History:", fullPayload);
      await saveInterview(fullPayload);
      localStorage.removeItem(SESSION_KEY); 
      
      navigate('/resume-report', { state: { 
        report: JSON.parse(JSON.stringify(cleanReport)), 
        feedback: JSON.parse(JSON.stringify(cleanReport)), 
        answers: finalAnswers,
        integrity: { score: integrityScore, count: violations }
      }});

    } catch (err) {
      console.error("Critical Save/Nav Error:", err);
      // We do NOT turn off setProcessing here. We want to keep the user blocked.
      alert("Error saving session. Please check your connection.");
    }
  };

  // --- AUTO-RETRY ON RELOAD ---
  // If the user refreshed the page while "isSubmitted" was true,
  // this effect will automatically trigger the finish logic again.
  useEffect(() => {
    if (initialState.isSubmitted && !initialState.isDisqualified) {
        console.log("🔄 Detected interrupted submission. Retrying...");
        finishInterview(initialState.answers);
    }
  }, []);

  // --- RENDER HELPERS ---

  const renderCameraDeniedModal = () => (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl text-red-500 mb-6 animate-pulse"><i className="fa-solid fa-video-slash"></i></div>
      <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Camera Access Required</h2>
      <button onClick={() => window.location.reload()} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider">Reload Page</button>
    </div>
  );

  const renderDisclaimerModal = () => (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl p-6 md:p-10 relative">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-6 border-b-4 border-blue-600 pb-4">Resume Audit Guidelines</h2>
        <div className="space-y-4 mb-8 text-slate-700 text-lg leading-relaxed">
           <ul className="list-none space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-200">
             <li className="flex items-start gap-3"><i className="fa-solid fa-expand text-blue-600 mt-1"></i><span><strong>Full Screen Mode</strong> is mandatory. Exiting will trigger a violation flag.</span></li>
             <li className="flex items-start gap-3"><i className="fa-solid fa-eye text-blue-600 mt-1"></i><span><strong>Face Visibility</strong>: If your face is not in the frame for <strong>20 seconds</strong>, a flag will be triggered.<span className="block text-red-600 text-sm mt-1 font-bold">⚠️ If this cycle repeats 3 times, you will be DISQUALIFIED immediately.</span></span></li>
             <li className="flex items-start gap-3"><i className="fa-solid fa-arrows-to-eye text-blue-600 mt-1"></i><span><strong>Head Movement</strong>: Looking Left, Right, Up, or Down away from the camera will <strong>trigger a flag immediately</strong>.</span></li>
             <li className="flex items-start gap-3"><i className="fa-solid fa-window-restore text-blue-600 mt-1"></i><span><strong>No Tab Switching</strong>. Moving to other tabs/windows is strictly prohibited.</span></li>
             <li className="flex items-start gap-3 text-red-600 font-bold border-l-4 border-red-500 pl-3 bg-red-50 py-2"><i className="fa-solid fa-triangle-exclamation mt-1"></i><span>CRITICAL: If your Flag Count reaches {MAX_VIOLATIONS}, you will be IMMEDIATELY DISQUALIFIED.</span></li>
           </ul>
        </div>
        <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
          <input type="checkbox" className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500" checked={disclaimerAccepted} onChange={(e) => setDisclaimerAccepted(e.target.checked)}/>
          <span className="font-bold text-slate-800">I have read the rules and agree to be proctored.</span>
        </label>
        <button onClick={handleStartInterview} disabled={!disclaimerAccepted} className={`w-full mt-6 py-4 rounded-lg font-bold text-xl uppercase tracking-wider transition-all shadow-xl ${disclaimerAccepted ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Start Assessment</button>
      </div>
    </div>
  );

  const renderDisqualifiedModal = () => (
    <div className="fixed inset-0 bg-red-900 z-[200] flex flex-col items-center justify-center p-6 text-center">
      <div className="text-8xl text-white mb-6 animate-pulse"><i className="fa-solid fa-ban"></i></div>
      <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Disqualified</h1>
      <p className="text-red-200 text-2xl font-bold max-w-2xl leading-normal mb-8">You have exceeded the maximum limit of {MAX_VIOLATIONS} violations.</p>
      <button onClick={() => terminateSession("Disqualified")} className="bg-white text-red-900 px-10 py-5 rounded-lg font-black text-xl uppercase tracking-wider hover:bg-gray-100 transition-transform hover:scale-105">Return to Home</button>
    </div>
  );

  const renderFullScreenModal = () => (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-100 z-[80] flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl text-yellow-500 mb-6 animate-pulse"><i className="fa-solid fa-expand"></i></div>
      <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Full Screen Required</h2>
      <p className="text-gray-300 max-w-lg mb-8 text-lg">You have exited full screen. <span className="text-red-400 font-bold">Resume immediately or you will be disqualified.</span></p>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg justify-center">
        <button onClick={() => enterFullScreen()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg">Resume</button>
        <button onClick={() => terminateSession("Exited Full Screen")} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg">Exit</button>
      </div>
    </div>
  );

  const renderViolationModal = () => (
    <div className="fixed inset-0 bg-red-900 bg-opacity-95 backdrop-blur-xl z-[70] flex flex-col items-center justify-center p-6 text-center border-8 border-red-600">
      <div className="text-7xl text-white mb-6 animate-pulse"><i className="fa-solid fa-triangle-exclamation"></i></div>
      <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">Rules Violated</h2>
      <p className="text-red-100 text-xl font-bold mb-8 max-w-2xl leading-relaxed">You attempted to leave the interview interface.</p>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
        <button onClick={() => terminateSession("Tab Switch")} className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-6 py-4 rounded-lg border-2 border-gray-600 font-bold uppercase tracking-wider transition-all">Terminate</button>
        <button onClick={() => setShowViolationModal(false)} className="flex-1 bg-white text-red-700 hover:bg-gray-100 px-6 py-4 rounded-lg font-black border-4 border-red-700 uppercase tracking-wider transition-all shadow-2xl hover:scale-105">Continue</button>
      </div>
    </div>
  );

  const renderPrivacyShutterModal = () => (
    <div className="fixed inset-0 bg-black z-[90] flex flex-col items-center justify-center p-6 text-center border-8 border-gray-800">
      <div className="text-7xl text-gray-500 mb-6 animate-pulse"><i className="fa-solid fa-eye-slash"></i></div>
      <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-4 tracking-tight">Camera Blocked</h2>
      <p className="text-gray-300 text-xl font-bold mb-8 max-w-2xl leading-relaxed">We detected your camera privacy shutter is closed. <br/><span className="text-red-500">Open immediately.</span> <br/>Terminating in <span className="text-white bg-red-600 px-2 rounded">{120 - privacyShutterTimerRef.current}s</span>.</p>
    </div>
  );

  // --- PROCESSING OVERLAY ---
  const renderProcessingOverlay = () => (
    <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-500">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <i className="fa-solid fa-circle-notch animate-spin text-7xl text-white relative z-10"></i>
        </div>
        <h2 className="text-white text-4xl font-black uppercase tracking-widest animate-pulse">
            Analysis in Progress
        </h2>
        <p className="text-blue-300 mt-4 text-lg font-mono">Generating Resume Audit Report...</p>
        <p className="text-gray-400 mt-2 text-sm font-bold">Please do not close this window.</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 bg-slate-50 relative overflow-x-hidden" onClick={() => { if(!isSubmitted) new Audio(BEEP_URL).play().catch(()=>{}) }}>
      
      {/* 0. PROCESSING OVERLAY */}
      {processing && renderProcessingOverlay()}
      
      {isDisqualified && renderDisqualifiedModal()}
      
      {!hasStarted && !isDisqualified && !isSubmitted && (
          <>
            {cameraStatus === 'checking' && <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center text-white font-bold text-xl"><i className="fa-solid fa-spinner animate-spin mr-3"></i> Checking System...</div>}
            {cameraStatus === 'denied' && renderCameraDeniedModal()}
            {cameraStatus === 'granted' && renderDisclaimerModal()}
          </>
       )}

      {/* ONLY SHOW MODALS IF NOT SUBMITTED */}
      {hasStarted && !isDisqualified && !isSubmitted && showFullScreenExitModal && renderFullScreenModal()}
      {hasStarted && !isDisqualified && !isSubmitted && showViolationModal && renderViolationModal()}
      {hasStarted && !isDisqualified && !isSubmitted && showPrivacyShutterModal && renderPrivacyShutterModal()}
      
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-6 md:mb-8 gap-4 px-1 shrink-0">
        <div>
           <h2 className="font-black text-2xl md:text-3xl uppercase text-slate-800 tracking-tight">RESUME <span className="text-blue-600">//</span> AUDIT</h2>
           <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
             <p className="font-mono text-xs md:text-sm text-gray-400 font-bold uppercase">Field: {config.field}</p>
             <span className="bg-red-100 text-red-600 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded border border-red-200">⚠️ {violations} FLAGS</span>
           </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
           <div className="font-mono font-black text-white bg-slate-900 px-4 py-2 md:px-5 md:py-3 rounded shadow-lg text-sm md:text-lg">{currIndex + 1} <span className="text-gray-500">/</span> {questions.length}</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto w-full">
        {/* LEFT: WEBCAM */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 shrink-0">
          <div className="card-panel p-2 shadow-xl border-slate-200 bg-white rounded-lg relative transition-all duration-300 z-0">
              <WebcamFeed onViolation={handleViolation} />
              {!isSubmitted && <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded animate-pulse font-bold">REC</div>}
          </div>
          <div className="card-panel p-6 md:p-8 border-l-4 border-blue-600 bg-white shadow-lg rounded-r-lg">
            <h3 className="font-mono text-xs font-bold text-blue-500 uppercase mb-3 md:mb-4 flex items-center gap-2"><i className="fa-solid fa-terminal"></i> Interview Query</h3>
            <p className="text-xl md:text-2xl font-bold text-slate-900 leading-snug break-words">{questions[currIndex]}</p>
          </div>
        </div>

        {/* RIGHT: ANSWER TERMINAL */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="card-panel flex flex-col p-0 relative overflow-hidden shadow-2xl border-0 bg-white rounded-lg min-h-[400px] lg:min-h-[600px] h-full">
            <div className="bg-slate-100 border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0">
               <span className="text-xs font-bold text-gray-500 uppercase">Response Terminal</span>
               <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
            </div>
            <div className="flex-1 relative">
               <textarea
                 className="w-full h-full min-h-[300px] lg:min-h-[450px] p-6 md:p-8 border-none outline-none resize-none text-lg md:text-xl font-mono font-bold text-slate-900 leading-relaxed bg-transparent focus:bg-slate-50 transition-colors pb-32"
                 placeholder="> Explain your approach..."
                 value={currentAnswer}
                 onChange={(e) => !isSubmitted && setCurrentAnswer(e.target.value)}
                 spellCheck="false"
                 disabled={isSubmitted}
               />
               <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
                 
                 {/* MIC BUTTON */}
                 <button onClick={toggleMic} disabled={isSubmitted} className={`w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border-2 ${isListening ? 'border-red-500 bg-red-50 text-red-600 animate-pulse' : 'border-slate-200 text-slate-500 hover:border-slate-400'} ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}>
                   <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i> {isListening ? "Listening..." : "Dictate Answer"}
                 </button>
                 
                 {/* NAVIGATION BUTTONS */}
                 <div className="flex gap-3 w-full sm:w-auto">
                   {/* PREVIOUS BUTTON */}
                   <button 
                       onClick={handlePrevious}
                       disabled={currIndex === 0 || processing || isSubmitted}
                       className="flex-1 sm:flex-none btn px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-slate-300 text-slate-700 rounded-lg font-bold flex justify-center items-center"
                   >
                        <i className="fa-solid fa-arrow-left mr-2"></i> PREV
                   </button>

                   {/* NEXT / FINALIZE BUTTON */}
                   <button 
                       onClick={handleNext} 
                       disabled={processing || isSubmitted} 
                       className="flex-1 sm:flex-none btn btn-primary px-8 md:px-10 py-3 md:py-4 shadow-blue hover:shadow-xl transition-all disabled:opacity-50 bg-slate-900 text-white rounded-lg font-bold flex justify-center items-center"
                   >
                       {processing ? (
                           <span><i className="fa-solid fa-cog animate-spin"></i> PROCESSING</span>
                       ) : (
                           <span>{currIndex === questions.length - 1 ? "FINALIZE" : "NEXT"} <i className="fa-solid fa-arrow-right"></i></span>
                       )}
                   </button>
                 </div>

               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeInterview;