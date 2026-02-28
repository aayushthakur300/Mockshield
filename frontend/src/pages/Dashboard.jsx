//1 st without mock interview
// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { getInterviews, deleteSession } from '../services/api';

// const Dashboard = () => {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   const fetchHistory = async () => {
//       try {
//           const res = await getInterviews();
//           // Sort by newest first
//           const sortedData = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//           setHistory(sortedData);
//       } catch (err) {
//           console.error("Failed to load history", err);
//       }
//       setLoading(false);
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   const handleDelete = async (e, id) => {
//     e.stopPropagation(); // Prevent row click
//     if(!window.confirm("CONFIRM DELETION: This record will be permanently erased.")) return;

//     try {
//         setHistory(prev => prev.filter(item => item.id !== id));
//         await deleteSession(id);
//     } catch (err) {
//         alert("Deletion Failed.");
//         fetchHistory();
//     }
//   };

//   // --- REPORT VIEWER HANDLER ---
//   const handleViewReport = (item) => {
//     // Extract the full data payload saved during the interview
//     const rawData = item.full_data || {};
    
//     // Normalize data structure for the Report Page
//     const feedbackData = {
//         score: rawData.totalScore || item.total_score || 0,
//         summary: rawData.overallFeedback || item.overall_feedback || "No summary available.",
//         roadmap: rawData.roadmap || "No roadmap data found.",
//         // Critical: Pass the arrays needed for the breakdown
//         silent_killers: rawData.silent_killers || [],
//         question_reviews: rawData.question_reviews || [] 
//     };
    
//     navigate('/report', { state: { feedback: feedbackData } });
//   };

//   return (
//     <div className="min-h-screen p-8">
//       <div className="container-tight">
        
//         {/* Header */}
//         <div className="card-panel p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
//           <div>
//             <h1 className="text-3xl uppercase tracking-tighter mb-1">
//               Candidate <span className="text-danger">Dashboard</span>
//             </h1>
//             <p className="font-mono text-sm text-gray-500 font-bold">SYSTEM_READY // V.2.0.4</p>
//           </div>
//           <div>
//              <Link to="/setup" className="btn btn-primary px-8 py-4 inline-block shadow-red hover:shadow-xl transition-all">
//                 <i className="fa-solid fa-play mr-2"></i> Initialize Simulation
//              </Link>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//             <div className="card-panel p-6 flex flex-col items-center justify-center text-center">
//                 <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">Total Sessions</span>
//                 <p className="text-5xl font-black text-slate-800">{history.length}</p>
//             </div>
//             <div className="card-panel p-6 flex flex-col items-center justify-center text-center">
//                 <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">Avg Performance</span>
//                 <p className="text-5xl font-black text-slate-800">
//                     {history.length > 0 
//                         ? (history.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / history.length).toFixed(0) 
//                         : "0"}
//                 </p>
//             </div>
//             <div className="card-panel p-6 flex flex-col items-center justify-center text-center">
//                 <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">System Status</span>
//                 <div className="flex items-center gap-2 mt-2">
//                     <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
//                     <span className="font-bold text-slate-700">ONLINE</span>
//                 </div>
//             </div>
//         </div>

//         {/* Logs List */}
//         <div className="flex justify-between items-end mb-4 ml-2">
//             <h3 className="font-mono text-sm font-bold text-gray-500 uppercase">Recent Logs</h3>
//         </div>
        
//         {loading ? (
//             <div className="text-center py-20 font-mono text-gray-400 animate-pulse">
//                 [LOADING DATA STREAMS...]
//             </div>
//         ) : (
//             <div className="space-y-4">
//                 {history.length === 0 ? (
//                     <div className="card-panel p-16 text-center border-dashed border-2 border-gray-300">
//                         <div className="text-gray-300 text-6xl mb-4"><i className="fa-solid fa-folder-open"></i></div>
//                         <h3 className="text-xl font-bold text-slate-800 mb-2">Database Empty</h3>
//                         <p className="text-gray-500 mb-6 max-w-md mx-auto">
//                             No interview records found. Initiate your first technical assessment to generate data points.
//                         </p>
//                     </div>
//                 ) : (
//                     history.map((item) => (
//                       <div 
//                         key={item.id} 
//                         onClick={() => handleViewReport(item)} // CLICKABLE ROW
//                         className="card-panel p-6 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:border-red-300 transition-all cursor-pointer hover:shadow-md"
//                       >
                        
//                         <div className="md:w-1/4">
//                             <span className="font-mono text-xs text-gray-400 block mb-1">
//                                 {new Date(item.createdAt).toLocaleDateString()}
//                             </span>
//                             <h4 className="font-bold text-lg leading-tight text-slate-800 group-hover:text-red-600 transition-colors">
//                                 {typeof item.topic === 'string' && item.topic.length > 30 ? "Technical Assessment" : item.topic || "Technical Assessment"}
//                             </h4>
//                         </div>
                        
//                         <div className="md:w-2/4">
//                              <div className="bg-slate-50 p-3 rounded border border-slate-200 group-hover:bg-white transition-colors">
//                                 <p className="text-xs text-gray-600 font-mono line-clamp-2">
//                                     "{item.overall_feedback || "Processing data..."}"
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="md:w-1/4 flex items-center justify-end gap-4">
//                             <div className={`px-4 py-2 font-black text-xl border-2 rounded ${
//                                 item.total_score >= 80 ? 'border-green-500 text-green-600 bg-green-50' :
//                                 item.total_score >= 60 ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
//                                 'border-red-500 text-red-600 bg-red-50'
//                             }`}>
//                                 {item.total_score ? Number(item.total_score).toFixed(0) : "0"}
//                             </div>

//                             <button 
//                                 onClick={(e) => handleDelete(e, item.id)}
//                                 className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all flex items-center justify-center shadow-sm z-10"
//                                 title="Delete Record"
//                             >
//                                 <i className="fa-solid fa-trash"></i>
//                             </button>
//                         </div>
//                       </div>
//                     ))
//                 )}
//             </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// +-+---------------------------------------------------------------------------+++-++--+-+-++++++++++++++++++++++++++-------------
// +-+---------------------------------------------------------------------------+++-++--+-+-++++++++++++++++++++++++++-------------
// //2nd work present one
// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { getInterviews, deleteSession } from '../services/api';

// const Dashboard = () => {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   const fetchHistory = async () => {
//       try {
//           const res = await getInterviews();
//           // Ensure we handle the data array correctly depending on backend response structure
//           const data = res.data ? (Array.isArray(res.data) ? res.data : []) : [];
          
//           // Sort by newest first
//           const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//           setHistory(sortedData);
//       } catch (err) {
//           console.error("Failed to load history", err);
//       }
//       setLoading(false);
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   const handleDelete = async (e, id) => {
//     e.stopPropagation(); // Prevent row click
//     if(!window.confirm("CONFIRM DELETION: This record will be permanently erased.")) return;

//     try {
//         // Optimistic UI Update
//         setHistory(prev => prev.filter(item => item.id !== id));
//         await deleteSession(id);
//     } catch (err) {
//         alert("Deletion Failed. Check console/network.");
//         console.error(err);
//         fetchHistory(); // Revert if failed
//     }
//   };

//   // --- REPORT VIEWER HANDLER ---
//   const handleViewReport = (item) => {
//     // Extract the full data payload saved during the interview
//     const rawData = item.full_data || item;
    
//     // Normalize data structure for the Report Page
//     const feedbackData = {
//         score: rawData.totalScore || item.total_score || 0,
//         summary: rawData.overallFeedback || item.summary || "No summary available.",
//         roadmap: rawData.roadmap || "No roadmap data found.",
//         // Critical: Pass the arrays needed for the breakdown
//         silent_killers: rawData.silent_killers || [],
//         question_reviews: rawData.question_reviews || [],
//         questions: rawData.questions || [] 
//     };
    
//     navigate('/report', { state: { feedback: feedbackData, answers: rawData.questions } });
//   };

//   // Helper: Check if the session was actually disqualified (Cheating/Termination)
//   const isSessionDisqualified = (item) => {
//       const summary = (item.summary || item.overallFeedback || "").toUpperCase();
//       const topic = (item.topic || "").toUpperCase();
//       // It is disqualified ONLY if the text explicitly says so
//       return summary.includes("DISQUALIFIED") || topic.includes("TERMINATED");
//   };

//   // Helper to get formatted topic name
//   const getTopicName = (item) => {
//       if (item.topic && item.topic !== "Interview Session") return item.topic;
//       return "Technical Assessment";
//   };

//   return (
//     <div className="min-h-screen p-4 md:p-8 bg-slate-50">
//       <div className="max-w-6xl mx-auto">
        
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
//           <div>
//             <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 mb-1">
//               Candidate <span className="text-red-600">Dashboard</span>
//             </h1>
//             <p className="font-mono text-sm text-gray-500 font-bold">SYSTEM_READY // V.2.0.4</p>
//           </div>
//           <div>
//              <Link to="/setup" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2">
//                 <i className="fa-solid fa-play"></i> Initialize Simulation
//              </Link>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
//                 <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">Total Sessions</span>
//                 <p className="text-5xl font-black text-slate-800">{history.length}</p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
//                 <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">Avg Performance</span>
//                 <p className="text-5xl font-black text-slate-800">
//                     {history.length > 0 
//                         ? (history.reduce((acc, curr) => acc + (Number(curr.total_score) || 0), 0) / history.length).toFixed(0) 
//                         : "0"}
//                 </p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
//                 <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">System Status</span>
//                 <div className="flex items-center gap-2 mt-2">
//                     <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
//                     <span className="font-bold text-slate-700">ONLINE</span>
//                 </div>
//             </div>
//         </div>

//         {/* Logs List */}
//         <div className="flex justify-between items-end mb-4 ml-2">
//             <h3 className="font-mono text-sm font-bold text-gray-500 uppercase">Recent Logs</h3>
//         </div>
        
//         {loading ? (
//             <div className="text-center py-20 font-mono text-gray-400 animate-pulse">
//                 [LOADING DATA STREAMS...]
//             </div>
//         ) : (
//             <div className="space-y-4">
//                 {history.length === 0 ? (
//                     <div className="bg-white p-16 text-center border-dashed border-2 border-gray-300 rounded-xl">
//                         <div className="text-gray-300 text-6xl mb-4"><i className="fa-solid fa-folder-open"></i></div>
//                         <h3 className="text-xl font-bold text-slate-800 mb-2">Database Empty</h3>
//                         <p className="text-gray-500 mb-6 max-w-md mx-auto">
//                             No interview records found. Initiate your first technical assessment to generate data points.
//                         </p>
//                     </div>
//                 ) : (
//                     history.map((item) => {
//                       const disqualified = isSessionDisqualified(item);
//                       const score = Number(item.total_score) || 0;

//                       return (
//                         <div 
//                           key={item.id} 
//                           onClick={() => handleViewReport(item)} // CLICKABLE ROW
//                           className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
//                               disqualified ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'
//                           }`}
//                         >
                          
//                           {/* Session Date & Topic */}
//                           <div className="md:w-1/4 z-10">
//                               <span className="font-mono text-xs text-gray-400 block mb-1">
//                                   {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
//                               </span>
//                               <h4 className="font-black text-lg leading-tight text-slate-800 group-hover:text-blue-600 transition-colors uppercase">
//                                   {getTopicName(item)}
//                               </h4>
//                           </div>
                          
//                           {/* Summary / Feedback Preview */}
//                           <div className="md:w-2/4 z-10">
//                                <div className="bg-slate-50 p-3 rounded border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
//                                   <p className="text-xs text-gray-600 font-mono line-clamp-2">
//                                       {disqualified ? (
//                                           <span className="text-red-600 font-bold">
//                                               <i className="fa-solid fa-triangle-exclamation mr-2"></i>
//                                               SESSION FAILED / DISQUALIFIED
//                                           </span>
//                                       ) : (
//                                           // Show actual summary for completed sessions (even if score is 0)
//                                           `"${item.summary || item.overallFeedback || "Processing data..."}"`
//                                       )}
//                                   </p>
//                               </div>
//                           </div>

//                           {/* Score & Actions */}
//                           <div className="md:w-1/4 flex items-center justify-end gap-4 z-10">
//                               <div className={`px-4 py-2 font-black text-xl border-2 rounded ${
//                                   disqualified ? 'border-red-500 text-red-600 bg-red-50' :
//                                   score >= 80 ? 'border-green-500 text-green-600 bg-green-50' :
//                                   score >= 50 ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
//                                   'border-gray-300 text-gray-500 bg-gray-50' // Low score but completed
//                               }`}>
//                                   {score.toFixed(0)}
//                               </div>

//                               <button 
//                                   onClick={(e) => handleDelete(e, item.id)}
//                                   className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
//                                   title="Delete Record"
//                               >
//                                   <i className="fa-solid fa-trash"></i>
//                               </button>
//                           </div>
//                         </div>
//                       );
//                     })
//                 )}
//             </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// +-+---------------------------------------------------------------------------+++-++--+-+-++++++++++++++++++++++++++-------------
// +-+---------------------------------------------------------------------------+++-++--+-+-++++++++++++++++++++++++++-------------
// Newly added
// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { getInterviews, deleteSession } from '../services/api';

// const Dashboard = () => {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // --- DATA FETCHING ---
//   const fetchHistory = async () => {
//       try {
//           const res = await getInterviews();
//           // Safety check: Ensure data is an array before sorting
//           const data = res.data ? (Array.isArray(res.data) ? res.data : []) : [];
          
//           // Sort by newest first (Timestamp descending)
//           const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//           setHistory(sortedData);
//       } catch (err) {
//           console.error("Failed to load history", err);
//       }
//       setLoading(false);
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   // --- DELETE HANDLER ---
//   const handleDelete = async (e, id) => {
//     e.stopPropagation(); // Prevent row click
//     if(!window.confirm("CONFIRM DELETION: This record will be permanently erased.")) return;

//     try {
//         // Optimistic UI Update
//         setHistory(prev => prev.filter(item => item.id !== id));
//         await deleteSession(id);
//     } catch (err) {
//         alert("Deletion Failed. Check console/network.");
//         console.error(err);
//         fetchHistory(); // Revert if failed
//     }
//   };

//   // --- SILENT KILLER DETECTOR: Score Extraction Logic ---
//   // FIX: This function prioritizes the Deep Score (5) over the Dashboard Score (0)
//   const extractSafeScore = (item) => {
//       // 1. Check Deep Nested Data (The accurate score inside full_data)
//       const deepScore = item.full_data?.totalScore;
      
//       // 2. Check Top Level Data (The potentially buggy cache score)
//       const topScore = item.total_score;

//       // DETECTOR: Keep this ON to track mismatches in the console
//       if (deepScore !== undefined && topScore !== undefined && Number(deepScore) !== Number(topScore)) {
//           console.warn(`[SILENT KILLER DETECTED] ID: ${item.id} | Deep Score: ${deepScore} vs Dashboard Score: ${topScore}. Using Deep score.`);
//       }

//       // PRIORITY FIX: Always return Deep Score if it exists
//       if (deepScore !== undefined && deepScore !== null) return Number(deepScore);
      
//       // Fallback to Top Score
//       if (topScore !== undefined && topScore !== null) return Number(topScore);
      
//       return 0;
//   };

//   // --- REPORT VIEWER HANDLER ---
//   const handleViewReport = (item) => {
//     // Extract the full data payload saved during the interview
//     const rawData = item.full_data || item;
    
//     // Normalize data structure for the Report Page
//     // We use extractSafeScore here too to ensure the Report matches the Dashboard
//     const feedbackData = {
//         score: extractSafeScore(item), 
//         summary: rawData.overallFeedback || item.summary || "No summary available.",
//         roadmap: rawData.roadmap || "No roadmap data found.",
//         // Critical: Pass the arrays needed for the breakdown
//         silent_killers: rawData.silent_killers || [],
//         question_reviews: rawData.question_reviews || [],
//         questions: rawData.questions || [],
//         // Pass context for the report header
//         topic: item.topic,
//         type: determineSessionType(item)
//     };
    
//     // Determine which report page to navigate to based on session type
//     const sessionType = determineSessionType(item);
//     if (sessionType === "Resume Assessment") {
//          navigate('/resume-report', { state: { feedback: feedbackData, answers: rawData.questions, topic: item.topic } });
//     } else {
//          navigate('/report', { state: { feedback: feedbackData, answers: rawData.questions } });
//     }
//   };

//   // --- HELPER: Detect Disqualification ---
//   const isSessionDisqualified = (item) => {
//       const summary = (item.summary || item.overallFeedback || "").toUpperCase();
//       const topic = (item.topic || "").toUpperCase();
//       // Returns true only if explicitly flagged as terminated/disqualified
//       return summary.includes("DISQUALIFIED") || 
//              topic.includes("TERMINATED") || 
//              summary.includes("CHEATING DETECTED");
//   };

//   // --- HELPER: Determine Component Type (Mock vs Resume) ---
//   const determineSessionType = (item) => {
//       const topic = (item.topic || "").toLowerCase();
//       // Logic to distinguish the 2 components
//       if (topic.includes("resume") || topic.includes("cv")) {
//           return "Resume Assessment";
//       }
//       return "Mock Interview";
//   };

//   // --- HELPER: Get Precise Formatted Score ---
//   const getScoreColor = (score, disqualified) => {
//       if (disqualified) return 'border-red-500 text-red-600 bg-red-50';
//       if (score >= 80) return 'border-green-500 text-green-600 bg-green-50';
//       if (score >= 50) return 'border-yellow-500 text-yellow-600 bg-yellow-50';
//       return 'border-gray-300 text-gray-500 bg-gray-50';
//   };

//   // --- HELPER: Get Formatted Topic Name ---
//   const getTopicDisplay = (topic) => {
//       if (!topic) return "Technical Assessment";
//       if (topic.length > 30) return "Technical Assessment"; // Truncate long topics generic name
//       return topic;
//   };

//   return (
//     <div className="min-h-screen p-4 md:p-8 bg-slate-50">
//       <div className="max-w-6xl mx-auto">
        
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
//           <div>
//             <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 mb-1">
//               Candidate <span className="text-red-600">Dashboard</span>
//             </h1>
//             <p className="font-mono text-sm text-gray-500 font-bold">SYSTEM_READY // V.2.0.4</p>
//           </div>
//           <div>
//              <Link to="/setup" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2">
//                 <i className="fa-solid fa-play"></i> Initialize Simulation
//              </Link>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
//                 <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">Total Sessions</span>
//                 <p className="text-5xl font-black text-slate-800">{history.length}</p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
//                 <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">Avg Performance</span>
//                 <p className="text-5xl font-black text-slate-800">
//                     {history.length > 0 
//                         ? (history.reduce((acc, curr) => acc + extractSafeScore(curr), 0) / history.length).toFixed(0) 
//                         : "0"}
//                 </p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
//                 <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">System Status</span>
//                 <div className="flex items-center gap-2 mt-2">
//                     <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
//                     <span className="font-bold text-slate-700">ONLINE</span>
//                 </div>
//             </div>
//         </div>

//         {/* Logs List Header */}
//         <div className="flex justify-between items-end mb-4 ml-2">
//             <h3 className="font-mono text-sm font-bold text-gray-500 uppercase">Recent Logs</h3>
//         </div>
        
//         {/* Logs List Body */}
//         {loading ? (
//             <div className="text-center py-20 font-mono text-gray-400 animate-pulse">
//                 [LOADING DATA STREAMS...]
//             </div>
//         ) : (
//             <div className="space-y-4">
//                 {history.length === 0 ? (
//                     <div className="bg-white p-16 text-center border-dashed border-2 border-gray-300 rounded-xl">
//                         <div className="text-gray-300 text-6xl mb-4"><i className="fa-solid fa-folder-open"></i></div>
//                         <h3 className="text-xl font-bold text-slate-800 mb-2">Database Empty</h3>
//                         <p className="text-gray-500 mb-6 max-w-md mx-auto">
//                             No interview records found. Initiate your first technical assessment to generate data points.
//                         </p>
//                     </div>
//                 ) : (
//                     history.map((item) => {
//                       const disqualified = isSessionDisqualified(item);
//                       const sessionType = determineSessionType(item); // Mock vs Resume
                      
//                       // USE THE SILENT KILLER DETECTOR FOR SCORE
//                       // This ensures we get '5' instead of '0' for the specific ID you found
//                       const score = extractSafeScore(item);

//                       return (
//                         <div 
//                           key={item.id} 
//                           onClick={() => handleViewReport(item)} // CLICKABLE ROW
//                           className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
//                               disqualified ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'
//                           }`}
//                         >
                          
//                           {/* 1. Session Metadata (Date, Topic, Type) */}
//                           <div className="md:w-1/4 z-10">
//                               <span className="font-mono text-xs text-gray-400 block mb-1">
//                                   {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
//                               </span>
                              
//                               <h4 className="font-black text-lg leading-tight text-slate-800 group-hover:text-blue-600 transition-colors uppercase">
//                                   {getTopicDisplay(item.topic)}
//                               </h4>
                              
//                               {/* CATEGORY BADGE BELOW SUB-TOPIC */}
//                               <span className={`text-xs font-bold px-2 py-1 rounded mt-2 inline-flex items-center gap-1 border ${
//                                   sessionType === "Resume Assessment" 
//                                   ? "bg-purple-50 text-purple-700 border-purple-100" 
//                                   : "bg-blue-50 text-blue-700 border-blue-100"
//                               }`}>
//                                   {sessionType === "Resume Assessment" ? (
//                                       <><i className="fa-solid fa-file-arrow-up"></i> Resume Assessment</>
//                                   ) : (
//                                       <><i className="fa-solid fa-microphone-lines"></i> Mock Interview</>
//                                   )}
//                               </span>
//                           </div>
                          
//                           {/* 2. Summary / Feedback / Disqualification Details */}
//                           <div className="md:w-2/4 z-10">
//                                <div className={`p-3 rounded border transition-colors ${
//                                    disqualified ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100 group-hover:bg-blue-50/50"
//                                }`}>
//                                   {disqualified ? (
//                                       <div className="flex flex-col gap-1">
//                                           <div className="text-red-600 font-bold flex items-center gap-2">
//                                               <i className="fa-solid fa-triangle-exclamation"></i>
//                                               SESSION TERMINATED
//                                           </div>
//                                           <p className="text-xs text-red-800 font-mono">
//                                               Reason: {item.summary || item.overallFeedback || "Policy Violation / Disconnected"}
//                                           </p>
//                                           {/* Mandatory Session ID for Disqualified items */}
//                                           <p className="text-xs text-gray-400 font-mono mt-1 border-t border-red-200 pt-1">
//                                               SID: {item.id}
//                                           </p>
//                                       </div>
//                                   ) : (
//                                       <p className="text-xs text-gray-600 font-mono line-clamp-2">
//                                           "{item.summary || item.overallFeedback || "Processing feedback..."}"
//                                       </p>
//                                   )}
//                                </div>
//                           </div>

//                           {/* 3. Score & Actions */}
//                           <div className="md:w-1/4 flex items-center justify-end gap-4 z-10">
//                               {/* Precise Scoring Display using extractSafeScore */}
//                               <div className={`px-4 py-2 font-black text-xl border-2 rounded ${getScoreColor(score, disqualified)}`}>
//                                   {score.toFixed(0)}
//                               </div>

//                               <button 
//                                   onClick={(e) => handleDelete(e, item.id)}
//                                   className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
//                                   title="Delete Record"
//                               >
//                                   <i className="fa-solid fa-trash"></i>
//                               </button>
//                           </div>
//                         </div>
//                       );
//                     })
//                 )}
//             </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Newly added - 10 feb
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getInterviews, deleteSession, clearAllSessions } from '../services/api';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const navigate = useNavigate();

  // --- DATA FETCHING ---
  const fetchHistory = async () => {
      try {
          const res = await getInterviews();
          // Safety check: Ensure data is an array before sorting
          const data = res.data ? (Array.isArray(res.data) ? res.data : []) : [];
          
          // Sort by newest first (Timestamp descending)
          const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setHistory(sortedData);
      } catch (err) {
          console.error("Failed to load history", err);
      }
      setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // --- DELETE SINGLE RECORD HANDLER ---
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent row click
    if(!window.confirm("CONFIRM DELETION: This record will be permanently erased.")) return;

    try {
        // Optimistic UI Update
        setHistory(prev => prev.filter(item => item.id !== id));
        await deleteSession(id);
    } catch (err) {
        alert("Deletion Failed. Check console/network.");
        console.error(err);
        fetchHistory(); // Revert if failed
    }
  };

  // --- CLEAR ALL HISTORY HANDLER (UPDATED TO USE BACKEND ENDPOINT) ---
  const handleClearAll = async () => {
    if (history.length === 0) return;
    if (!window.confirm("⚠️ CRITICAL WARNING: This will permanently erase ALL interview history. This action cannot be undone. Are you absolutely sure?")) return;

    setIsClearing(true);
    try {
        // Calls the new Python backend route to wipe the DB file instantly
        await clearAllSessions();
        setHistory([]); // Optimistically clear the UI
    } catch (err) {
        alert("Failed to completely clear history. Check console.");
        console.error(err);
        fetchHistory(); // Re-fetch to ensure UI is in sync with database
    } finally {
        setIsClearing(false);
    }
  };

  // --- SILENT KILLER DETECTOR: Score Extraction Logic ---
  const extractSafeScore = (item) => {
      // 1. Check Deep Nested Data (The accurate score inside full_data)
      const deepScore = item.full_data?.totalScore;
      
      // 2. Check Top Level Data (The potentially buggy cache score)
      const topScore = item.total_score;

      // DETECTOR: Keep this ON to track mismatches in the console
      if (deepScore !== undefined && topScore !== undefined && Number(deepScore) !== Number(topScore)) {
          console.warn(`[SILENT KILLER DETECTED] ID: ${item.id} | Deep Score: ${deepScore} vs Dashboard Score: ${topScore}. Using Deep score.`);
      }

      // PRIORITY FIX: Always return Deep Score if it exists
      if (deepScore !== undefined && deepScore !== null) return Number(deepScore);
      
      // Fallback to Top Score
      if (topScore !== undefined && topScore !== null) return Number(topScore);
      
      return 0;
  };

  // --- REPORT VIEWER HANDLER ---
  const handleViewReport = (item) => {
    // Extract the full data payload saved during the interview
    const rawData = item.full_data || item;
    
    // Normalize data structure for the Report Page
    const feedbackData = {
        score: extractSafeScore(item), 
        summary: rawData.overallFeedback || item.summary || "No summary available.",
        roadmap: rawData.roadmap || "No roadmap data found.",
        // Critical: Pass the arrays needed for the breakdown
        silent_killers: rawData.silent_killers || [],
        question_reviews: rawData.question_reviews || [],
        questions: rawData.questions || [],
        // Pass context for the report header
        topic: item.topic,
        type: determineSessionType(item)
    };
    
    // Determine which report page to navigate to based on session type
    const sessionType = determineSessionType(item);
    if (sessionType === "Resume Assessment") {
         navigate('/resume-report', { state: { feedback: feedbackData, answers: rawData.questions, topic: item.topic } });
    } else {
         navigate('/report', { state: { feedback: feedbackData, answers: rawData.questions } });
    }
  };

  // --- HELPER: Detect Disqualification ---
  const isSessionDisqualified = (item) => {
      const summary = (item.summary || item.overallFeedback || "").toUpperCase();
      const topic = (item.topic || "").toUpperCase();
      // Returns true only if explicitly flagged as terminated/disqualified
      return summary.includes("DISQUALIFIED") || 
             topic.includes("TERMINATED") || 
             summary.includes("CHEATING DETECTED");
  };

  // --- HELPER: Determine Component Type (Mock vs Resume) ---
  const determineSessionType = (item) => {
      const topic = (item.topic || "").toLowerCase();
      // Logic to distinguish the 2 components based on saved topic naming conventions
      // Resume sessions usually saved with specific field names or "Resume Audit"
      if (topic.includes("resume") || topic.includes("cv") || item.type === "Resume") {
          return "Resume Assessment";
      }
      return "Mock Interview";
  };

  // --- HELPER: Get Precise Formatted Score ---
  const getScoreColor = (score, disqualified) => {
      if (disqualified) return 'border-red-500 text-red-600 bg-red-50';
      if (score >= 80) return 'border-green-500 text-green-600 bg-green-50';
      if (score >= 50) return 'border-yellow-500 text-yellow-600 bg-yellow-50';
      return 'border-gray-300 text-gray-500 bg-gray-50';
  };

  // --- HELPER: Get Formatted Topic Name (STRICT MANDATORY ENFORCEMENT) ---
  const getTopicDisplay = (item) => {
      const topic = item.topic;
      const deepTopic = item.full_data?.topic;

      // 1. Try Top Level Topic
      if (topic && topic.trim() !== "" && topic !== "Unknown") return topic;
      
      // 2. Try Deep Nested Topic (Fallback for some saved structures)
      if (deepTopic && deepTopic.trim() !== "") return deepTopic;

      // 3. Last Resort Fallback (Should rarely happen if saving logic is correct)
      return "General Interview"; 
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 mb-1">
              Candidate <span className="text-red-600">Dashboard</span>
            </h1>
            <p className="font-mono text-sm text-gray-500 font-bold">SYSTEM_READY // V2.0</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
             {/* CLEAR HISTORY BUTTON */}
             {history.length > 0 && (
                 <button 
                     onClick={handleClearAll}
                     disabled={isClearing}
                     className="bg-white text-red-600 border border-red-200 px-6 py-4 rounded-xl font-bold shadow-sm hover:bg-red-50 hover:border-red-300 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                     {isClearing ? (
                         <><i className="fa-solid fa-spinner fa-spin"></i> Clearing...</>
                     ) : (
                         <><i className="fa-solid fa-trash-can"></i> Clear History</>
                     )}
                 </button>
             )}
             <Link to="/setup" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2">
                <i className="fa-solid fa-play"></i> Initiate New Session
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">Total Sessions</span>
                <p className="text-5xl font-black text-slate-800">{history.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-xs font-bold text-gray-400 uppercase mb-2">Avg Performance</span>
                <p className="text-5xl font-black text-slate-800">
                    {history.length > 0 
                        ? (history.reduce((acc, curr) => acc + extractSafeScore(curr), 0) / history.length).toFixed(0) 
                        : "0"}
                </p>
            </div>
        </div>

        {/* Logs List Header */}
        <div className="flex justify-between items-end mb-4 ml-2">
            <h3 className="font-mono text-sm font-bold text-gray-500 uppercase">Recent Activity Logs</h3>
        </div>
        
        {/* Logs List Body */}
        {loading ? (
            <div className="text-center py-20 font-mono text-gray-400 animate-pulse">
                [LOADING DATA STREAMS...]
            </div>
        ) : (
            <div className="space-y-4">
                {history.length === 0 ? (
                    <div className="bg-white p-16 text-center border-dashed border-2 border-gray-300 rounded-xl">
                        <div className="text-gray-300 text-6xl mb-4"><i className="fa-solid fa-folder-open"></i></div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Database Empty</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            No interview records found. Initiate your first technical assessment to generate data points.
                        </p>
                    </div>
                ) : (
                    history.map((item) => {
                      const disqualified = isSessionDisqualified(item);
                      const sessionType = determineSessionType(item); 
                      const score = extractSafeScore(item);

                      return (
                        <div 
                          key={item.id} 
                          onClick={() => handleViewReport(item)} 
                          className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
                              disqualified ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'
                          }`}
                        >
                          
                          {/* 1. Session Metadata: Timestamp & Target Domain/Field */}
                          <div className="md:w-1/4 z-10">
                              <span className="font-mono text-xs text-gray-400 block mb-1">
                                  {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              
                              <h4 className="font-black text-lg leading-tight text-slate-800 group-hover:text-blue-600 transition-colors uppercase break-words">
                                  {getTopicDisplay(item)}
                              </h4>
                              
                              <span className={`text-xs font-bold px-2 py-1 rounded mt-2 inline-flex items-center gap-1 border ${
                                  sessionType === "Resume Assessment" 
                                  ? "bg-purple-50 text-purple-700 border-purple-100" 
                                  : "bg-blue-50 text-blue-700 border-blue-100"
                              }`}>
                                  {sessionType === "Resume Assessment" ? (
                                      <><i className="fa-solid fa-file-arrow-up"></i> Resume Audit</>
                                  ) : (
                                      <><i className="fa-solid fa-microphone-lines"></i> Mock Interview</>
                                  )}
                              </span>
                          </div>
                          
                          {/* 2. Summary / Disqualification Details */}
                          <div className="md:w-2/4 z-10">
                               <div className={`p-3 rounded border transition-colors ${
                                   disqualified ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100 group-hover:bg-blue-50/50"
                               }`}>
                                  {disqualified ? (
                                      <div className="flex flex-col gap-1">
                                          <div className="text-red-600 font-bold flex items-center gap-2">
                                              <i className="fa-solid fa-triangle-exclamation"></i>
                                              SESSION TERMINATED
                                          </div>
                                          <p className="text-xs text-red-800 font-mono">
                                              Reason: {item.summary || item.overallFeedback || "Policy Violation / Disconnected"}
                                          </p>
                                          <p className="text-xs text-gray-400 font-mono mt-1 border-t border-red-200 pt-1">
                                              SID: {item.id}
                                          </p>
                                      </div>
                                  ) : (
                                      <p className="text-xs text-gray-600 font-mono line-clamp-2">
                                          "{item.summary || item.overallFeedback || "Processing feedback..."}"
                                      </p>
                                  )}
                               </div>
                          </div>

                          {/* 3. Score & Actions */}
                          <div className="md:w-1/4 flex items-center justify-end gap-4 z-10">
                              <div className={`px-4 py-2 font-black text-xl border-2 rounded ${getScoreColor(score, disqualified)}`}>
                                  {score.toFixed(0)}
                              </div>

                              <button 
                                  onClick={(e) => handleDelete(e, item.id)}
                                  className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
                                  title="Delete Record"
                              >
                                  <i className="fa-solid fa-trash"></i>
                              </button>
                          </div>
                        </div>
                      );
                    })
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;