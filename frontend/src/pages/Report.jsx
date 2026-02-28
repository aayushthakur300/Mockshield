// present one --------------> report.jsx
// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// const Report = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Safe Data Extraction
//   const state = location.state || {};
  
//   const feedback = state.feedback || { 
//     score: 0, 
//     summary: "No Assessment Data Available.", 
//     roadmap: "N/A", 
//     silent_killers: [], 
//     question_reviews: [] 
//   };

//   const answers = state.answers || [];

//   const integrity = state.integrity || { 
//     score: 100, 
//     count: 0 
//   };

//   // --- PDF GENERATION LOGIC ---
//   const handleDownload = () => {
//     // 1. Initialize Document
//     const doc = new jsPDF('p', 'mm', 'a4');
    
//     // 2. Constants
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 10;
//     const contentWidth = pageWidth - (margin * 2);
//     const contentHeight = pageHeight - (margin * 2);
//     const safeBottom = pageHeight - margin - 5;
    
//     let cursorY = margin + 15;

//     // --- Helpers ---
//     const drawPageBorder = () => {
//       doc.setDrawColor(0);
//       doc.setLineWidth(0.5);
//       doc.rect(margin, margin, contentWidth, contentHeight);
//     };

//     const checkPageBreak = (heightNeeded) => {
//       if (cursorY + heightNeeded > safeBottom) {
//         doc.addPage();
//         drawPageBorder();
//         cursorY = margin + 15;
//         return true;
//       }
//       return false;
//     };

//     const addWrappedText = (text, fontSize = 12, fontType = 'normal', color = [0, 0, 0]) => {
//       doc.setFontSize(fontSize);
//       doc.setFont('helvetica', fontType);
//       doc.setTextColor(...color);

//       const lines = doc.splitTextToSize(text, contentWidth - 4);
//       const blockHeight = lines.length * (fontSize * 0.3527 + 2);

//       checkPageBreak(blockHeight);

//       doc.text(lines, margin + 2, cursorY);
//       cursorY += blockHeight + 2;
//     };

//     // ================= START PDF CONTENT =================
//     drawPageBorder();

//     // Header
//     doc.setFontSize(22);
//     doc.setFont('helvetica', 'bold');
//     doc.text("MOCKSHIELD REPORT", margin + 2, cursorY); // <--- NAME CHANGED
//     cursorY += 10;

//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.text(`SESSION ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, margin + 2, cursorY);
//     doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, cursorY);
//     cursorY += 10;

//     // Scorecard
//     checkPageBreak(30);
//     doc.setFillColor(240, 240, 240);
//     doc.rect(margin + 2, cursorY, contentWidth - 4, 25, 'F');
    
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`${feedback.score}/100`, margin + 10, cursorY + 10);
//     doc.text("ASSESSMENT SCORE", margin + 10, cursorY + 18);

//     const isFlagged = integrity.count > 0;
//     doc.setTextColor(isFlagged ? 220 : 0, 0, 0);
//     doc.text(`PROCTORING STATUS: ${isFlagged ? "FLAGGED" : "CLEAN"}`, pageWidth / 2, cursorY + 10);
    
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.text(
//       `Focus lost ${integrity.count} times. Integrity Score: ${integrity.score}%`, 
//       pageWidth / 2, 
//       cursorY + 18
//     );
//     doc.setTextColor(0, 0, 0);
//     cursorY += 35;

//     // Executive Summary
//     checkPageBreak(10);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text("EXECUTIVE SUMMARY", margin + 2, cursorY);
//     cursorY += 8;
//     addWrappedText(feedback.summary || "No summary provided.", 11, 'normal');
//     cursorY += 5;

//     // Critical Flags
//     if (feedback.silent_killers && feedback.silent_killers.length > 0) {
//       checkPageBreak(20);
//       doc.setFontSize(12);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(200, 0, 0);
//       doc.text("MOCKSHIELD CRITICAL FLAGS", margin + 2, cursorY); // <--- NAME CHANGED
//       cursorY += 8;

//       feedback.silent_killers.forEach(killer => {
//         addWrappedText(`X ${killer}`, 10, 'normal', [200, 0, 0]);
//       });
//       doc.setTextColor(0, 0, 0);
//       cursorY += 5;
//     }

//     // Roadmap
//     if (feedback.roadmap) {
//       checkPageBreak(20);
//       doc.setFontSize(12);
//       doc.setFont('helvetica', 'bold');
//       doc.text("RECOMMENDED ROADMAP", margin + 2, cursorY);
//       cursorY += 8;
//       addWrappedText(feedback.roadmap, 10, 'normal');
//       cursorY += 10;
//     }

//     // Question Analysis Tables
//     checkPageBreak(15);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text("FORENSIC QUESTION ANALYSIS", margin + 2, cursorY);
//     cursorY += 10;

//     // Determine if we use review data or raw answers
//     const questionsToMap = feedback.question_reviews && feedback.question_reviews.length > 0 
//       ? feedback.question_reviews 
//       : answers.map(a => ({ question: a.question, user_answer: a.answer, ideal_answer: "" }));

//     questionsToMap.forEach((q, index) => {
//       checkPageBreak(20);
//       doc.setFontSize(11);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(50, 50, 50);
//       doc.text(`Question ${index + 1}`, margin + 2, cursorY);
//       cursorY += 6;

//       addWrappedText(q.question, 10, 'italic', [80, 80, 80]);
//       cursorY += 2;

//       autoTable(doc, {
//         startY: cursorY,
//         margin: { left: margin + 2, right: margin + 2 },
//         tableWidth: contentWidth - 4,
//         head: [['CANDIDATE ANSWER', 'IDEAL ANSWER']],
//         body: [[
//           q.user_answer || "[No Answer Provided]",
//           q.ideal_answer || "Standard technical expectations..."
//         ]],
//         styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak', valign: 'top' },
//         headStyles: { fillColor: [40, 44, 52], textColor: 255 },
//         columnStyles: { 0: { cellWidth: (contentWidth - 4) / 2 }, 1: { cellWidth: (contentWidth - 4) / 2 } },
//         didDrawPage: () => drawPageBorder(),
//       });

//       cursorY = doc.lastAutoTable.finalY + 10;
//     });

//     // Save File
//     doc.save(`MockShield_Report_${new Date().toISOString().split('T')[0]}.pdf`); // <--- NAME CHANGED
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center relative">
      
//       {/* ACTION BAR */}
//       <div className="w-full max-w-5xl flex justify-between items-center mb-8">
//         <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 font-bold">
//             <i className="fa-solid fa-arrow-left mr-2"></i> Dashboard
//         </button>
//         <button 
//             onClick={handleDownload}
//             className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition flex items-center gap-2"
//         >
//             <i className="fa-solid fa-file-pdf"></i> Download Official Report
//         </button>
//       </div>

//       {/* REPORT VISUAL PREVIEW (HTML) */}
//       <div className="flex justify-center w-full overflow-hidden">
//         <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-none p-12 border border-slate-200">
            
//             {/* Header */}
//             <div className="border-b border-gray-200 pb-8 mb-8 flex justify-between items-start">
//                 <div>
//                     <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">
//                         MockShield Report
//                     </h1>
//                     <p className="text-gray-400 font-mono text-sm">SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
//                     <p className="text-gray-400 font-mono text-sm">DATE: {new Date().toLocaleDateString()}</p>
//                 </div>
//                 <div className="text-right">
//                     <div className="text-6xl font-black text-blue-600 tracking-tighter">{feedback.score}<span className="text-2xl text-gray-300">/100</span></div>
//                     <p className="font-bold text-slate-400 text-xs uppercase tracking-widest mt-1">Assessment Score</p>
//                 </div>
//             </div>

//             {/* Integrity Badge */}
//             <div className={`mb-10 p-4 rounded-lg border flex items-center gap-4 ${integrity.count > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
//                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${integrity.count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
//                     <i className={`fa-solid ${integrity.count > 0 ? 'fa-triangle-exclamation' : 'fa-shield-check'}`}></i>
//                 </div>
//                 <div>
//                     <h3 className={`font-bold uppercase text-sm ${integrity.count > 0 ? 'text-red-700' : 'text-green-700'}`}>
//                         Proctoring Status: {integrity.count > 0 ? "Flagged" : "Verified"}
//                     </h3>
//                     <p className="text-slate-600 text-sm">
//                         {integrity.count > 0 
//                         ? `Focus lost ${integrity.count} times. Integrity Score: ${integrity.score}%`
//                         : "Candidate maintained focus throughout the session."}
//                     </p>
//                 </div>
//             </div>

//             {/* Executive Summary */}
//             <div className="mb-12">
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 border-b border-gray-100 pb-2">
//                     Executive Summary
//                 </h3>
//                 <p className="text-lg text-slate-700 leading-relaxed font-medium">
//                     {feedback.summary}
//                 </p>
//             </div>

//             {/* Analysis Grid */}
//             <div className="grid grid-cols-1 gap-10 mb-12">
//                 <div>
//                     <h3 className="font-bold text-red-600 uppercase text-xs tracking-widest mb-4 border-b border-red-100 pb-2">
//                         MockShield Critical Flags
//                     </h3>
//                     <ul className="space-y-3">
//                         {feedback.silent_killers && feedback.silent_killers.length > 0 ? (
//                             feedback.silent_killers.map((killer, i) => (
//                                 <li key={i} className="flex items-start gap-3 bg-red-50 p-3 rounded-md border border-red-100">
//                                     <i className="fa-solid fa-xmark text-red-500 mt-1"></i>
//                                     <span className="text-slate-800 text-sm font-medium leading-snug">{killer}</span>
//                                 </li>
//                             ))
//                         ) : (
//                             <li className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded border border-green-100">
//                                 <i className="fa-solid fa-check"></i> No critical flags detected.
//                             </li>
//                         )}
//                     </ul>
//                 </div>

//                 <div>
//                     <h3 className="font-bold text-green-600 uppercase text-xs tracking-widest mb-4 border-b border-green-100 pb-2">
//                         Recommended Roadmap
//                     </h3>
//                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
//                         {feedback.roadmap}
//                     </div>
//                 </div>
//             </div>

//             {/* Forensic Analysis */}
//             <div>
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-6 border-b border-gray-100 pb-2">
//                     Forensic Question Analysis
//                 </h3>
//                 <div className="space-y-8">
//                     {feedback.question_reviews && feedback.question_reviews.map((review, i) => (
//                         <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden break-inside-avoid">
//                             <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
//                                 <h4 className="font-bold text-slate-800 text-sm">Question {i + 1}</h4>
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-xs font-bold text-slate-400 uppercase">Rating:</span>
//                                     <span className={`px-2 py-1 rounded text-xs font-bold ${review.score >= 8 ? 'bg-green-100 text-green-700' : review.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
//                                         {review.score}/10
//                                     </span>
//                                 </div>
//                             </div>
//                             <div className="p-6 space-y-4">
//                                 <p className="text-slate-900 font-bold text-md">{review.question}</p>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div>
//                                         <div className="text-xs font-bold text-slate-400 uppercase mb-2">Candidate Answer</div>
//                                         <div className="bg-slate-50 p-3 rounded border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono">
//                                             {review.user_answer || <span className="text-gray-400 italic">No answer provided</span>}
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <div className="text-xs font-bold text-blue-500 uppercase mb-2">Ideal Answer</div>
//                                         <div className="bg-blue-50 p-3 rounded border border-blue-100 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-mono">
//                                             {review.ideal_answer}
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="pt-2">
//                                     <div className="flex items-start gap-2">
//                                         <i className="fa-solid fa-comment-dots text-purple-500 mt-1"></i>
//                                         <p className="text-slate-500 text-sm italic">"{review.feedback}"</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Report; 
//--------------------------------------------------------------------------------------------------------------------
// ------------------->   newly added
// import React, { useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// const Report = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // --- 1. SAFE DATA EXTRACTION & FALLBACKS ---
//   const state = location.state || {};
  
//   // Raw Data Sources
//   const rawReport = state.feedback || state.report || {};
//   const rawAnswers = state.answers || []; // Source of Truth (User's local data)
//   const rawReviews = rawReport.question_reviews || []; // API Response
//   const integrity = state.integrity || { score: 100, count: 0 };

//   // --- 2. FORENSIC DATA RECONCILER (STRICT MERGE PROTOCOL) ---
//   // This logic guarantees that the report ALWAYS matches the number of questions answered by the user.
//   // It uses the User's Text as the "Source of Truth" and only patches in the API scores/feedback.
//   const processedData = useMemo(() => {
//     const userCount = rawAnswers.length;
//     const apiCount = rawReviews.length;

//     // A. Silent Killer Detection Log
//     if (userCount !== apiCount) {
//       console.warn(
//         `%c⚠️ SILENT KILLER DETECTED: DATA MISMATCH`, 
//         "color: red; font-weight: bold; font-size: 14px;"
//       );
//       console.warn(`User Answered: ${userCount} | AI Analyzed: ${apiCount}`);
//       console.warn("Engaging Strict Merge Protocol to force full report generation...");
//     } else {
//       console.log("%c✅ DATA INTEGRITY VERIFIED: 1:1 Match", "color: green; font-weight: bold;");
//     }

//     // B. The Strict Merge Loop
//     // We map over RAW ANSWERS to ensure every user interaction is preserved.
//     const mergedReviews = rawAnswers.map((answerEntry, index) => {
//       // Try to find the matching review from API
//       const aiReview = rawReviews[index];

//       if (aiReview) {
//         // --- CRITICAL FIX ---
//         // We do NOT return 'aiReview' directly. 
//         // We create a new object that prioritizes the USER'S local text 
//         // to prevent API glitches from hiding the question/answer.
//         return {
//           question: answerEntry.question,     // FORCE Local Question Text (Source of Truth)
//           user_answer: answerEntry.answer,    // FORCE Local User Answer (Source of Truth)
//           score: aiReview.score || 0,         // Use API Score
//           feedback: aiReview.feedback || "Analysis Pending", // Use API Feedback
//           ideal_answer: aiReview.ideal_answer || "Standard best practices apply." // Use API Ideal Answer
//         };
//       } else {
//         // Fallback for completely missing API data (The "Patch")
//         return {
//           question: answerEntry.question,
//           user_answer: answerEntry.answer,
//           score: 0,
//           feedback: "⚠️ AI Analysis Timeout. Raw submission preserved.",
//           ideal_answer: "N/A - Analysis Data Missing"
//         };
//       }
//     });

//     return {
//       score: rawReport.score || 0,
//       summary: rawReport.summary || "Summary generation incomplete.",
//       roadmap: rawReport.roadmap || "Roadmap generation incomplete.",
//       silent_killers: rawReport.silent_killers || [],
//       question_reviews: mergedReviews // <--- Now contains the strictly merged data
//     };
//   }, [rawAnswers, rawReviews, rawReport]);

//   // --- 3. PDF GENERATION LOGIC ---
//   const handleDownload = () => {
//     // 1. Initialize Document
//     const doc = new jsPDF('p', 'mm', 'a4');
    
//     // 2. Constants
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 10;
//     const contentWidth = pageWidth - (margin * 2);
//     const contentHeight = pageHeight - (margin * 2);
//     const safeBottom = pageHeight - margin - 5;
    
//     let cursorY = margin + 15;

//     // --- Helpers ---
//     const drawPageBorder = () => {
//       doc.setDrawColor(0);
//       doc.setLineWidth(0.5);
//       doc.rect(margin, margin, contentWidth, contentHeight);
//     };

//     const checkPageBreak = (heightNeeded) => {
//       if (cursorY + heightNeeded > safeBottom) {
//         doc.addPage();
//         drawPageBorder();
//         cursorY = margin + 15;
//         return true;
//       }
//       return false;
//     };

//     const addWrappedText = (text, fontSize = 12, fontType = 'normal', color = [0, 0, 0]) => {
//       doc.setFontSize(fontSize);
//       doc.setFont('helvetica', fontType);
//       doc.setTextColor(...color);

//       const lines = doc.splitTextToSize(text || "N/A", contentWidth - 4);
//       const blockHeight = lines.length * (fontSize * 0.3527 + 2);

//       checkPageBreak(blockHeight);

//       doc.text(lines, margin + 2, cursorY);
//       cursorY += blockHeight + 2;
//     };

//     // ================= START PDF CONTENT =================
//     drawPageBorder();

//     // Header
//     doc.setFontSize(22);
//     doc.setFont('helvetica', 'bold');
//     doc.text("MOCKSHIELD REPORT", margin + 2, cursorY); 
//     cursorY += 10;

//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.text(`SESSION ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, margin + 2, cursorY);
//     doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, cursorY);
//     cursorY += 10;

//     // Scorecard
//     checkPageBreak(30);
//     doc.setFillColor(240, 240, 240);
//     doc.rect(margin + 2, cursorY, contentWidth - 4, 25, 'F');
    
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`${processedData.score}/100`, margin + 10, cursorY + 10); // Use Processed Data
//     doc.text("ASSESSMENT SCORE", margin + 10, cursorY + 18);

//     const isFlagged = integrity.count > 0;
//     doc.setTextColor(isFlagged ? 220 : 0, 0, 0);
//     doc.text(`PROCTORING STATUS: ${isFlagged ? "FLAGGED" : "CLEAN"}`, pageWidth / 2, cursorY + 10);
    
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.text(
//       `Focus lost ${integrity.count} times. Integrity Score: ${integrity.score}%`, 
//       pageWidth / 2, 
//       cursorY + 18
//     );
//     doc.setTextColor(0, 0, 0);
//     cursorY += 35;

//     // Executive Summary
//     // checkPageBreak(10);
//     // doc.setFontSize(14);
//     // doc.setFont('helvetica', 'bold');
//     // doc.text("EXECUTIVE SUMMARY", margin + 2, cursorY);
//     // cursorY += 8;
//     // addWrappedText(processedData.summary, 11, 'normal');
//     // cursorY += 5;

//     // Critical Flags
//     if (processedData.silent_killers && processedData.silent_killers.length > 0) {
//       checkPageBreak(20);
//       doc.setFontSize(12);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(200, 0, 0);
//       doc.text("MOCKSHIELD CRITICAL FLAGS", margin + 2, cursorY);
//       cursorY += 8;

//       processedData.silent_killers.forEach(killer => {
//         addWrappedText(`X ${killer}`, 10, 'normal', [200, 0, 0]);
//       });
//       doc.setTextColor(0, 0, 0);
//       cursorY += 5;
//     }

//     // Roadmap
//     if (processedData.roadmap) {
//       checkPageBreak(20);
//       doc.setFontSize(12);
//       doc.setFont('helvetica', 'bold');
//       doc.text("RECOMMENDED ROADMAP", margin + 2, cursorY);
//       cursorY += 8;
//       addWrappedText(processedData.roadmap, 10, 'normal');
//       cursorY += 10;
//     }

//     // Question Analysis Tables (FORCED RENDER)
//     checkPageBreak(15);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`FORENSIC QUESTION ANALYSIS (${processedData.question_reviews.length} Qs)`, margin + 2, cursorY);
//     cursorY += 10;

//     // Iterate over the SAFE merged data
//     processedData.question_reviews.forEach((q, index) => {
//       checkPageBreak(20);
//       doc.setFontSize(11);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(50, 50, 50);
//       doc.text(`Question ${index + 1}`, margin + 2, cursorY);
      
//       // Score Label in PDF
//       doc.setFontSize(9);
//       doc.text(`Score: ${q.score}/10`, pageWidth - margin - 25, cursorY);

//       cursorY += 6;

//       // Use SAFE Question Text
//       addWrappedText(q.question, 10, 'italic', [80, 80, 80]);
//       cursorY += 2;

//       autoTable(doc, {
//         startY: cursorY,
//         margin: { left: margin + 2, right: margin + 2 },
//         tableWidth: contentWidth - 4,
//         head: [['CANDIDATE ANSWER', 'ANALYSIS & IDEAL ANSWER']],
//         body: [[
//           q.user_answer || "[No Answer Provided]",
//           `FEEDBACK: ${q.feedback}\n\nIDEAL: ${q.ideal_answer}`
//         ]],
//         styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak', valign: 'top' },
//         headStyles: { fillColor: [40, 44, 52], textColor: 255 },
//         columnStyles: { 0: { cellWidth: (contentWidth - 4) * 0.4 }, 1: { cellWidth: (contentWidth - 4) * 0.6 } },
//         didDrawPage: () => drawPageBorder(),
//       });

//       cursorY = doc.lastAutoTable.finalY + 10;
//     });

//     // Save File
//     doc.save(`MockShield_Report_${new Date().toISOString().split('T')[0]}.pdf`);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center relative">
      
//       {/* ACTION BAR */}
//       <div className="w-full max-w-5xl flex justify-between items-center mb-8">
//         <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 font-bold">
//             <i className="fa-solid fa-arrow-left mr-2"></i> Dashboard
//         </button>
//         <button 
//             onClick={handleDownload}
//             className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition flex items-center gap-2"
//         >
//             <i className="fa-solid fa-file-pdf"></i> Download Official Report
//         </button>
//       </div>

//       {/* REPORT VISUAL PREVIEW (HTML) */}
//       <div className="flex justify-center w-full overflow-hidden">
//         <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-none p-12 border border-slate-200">
            
//             {/* Header */}
//             <div className="border-b border-gray-200 pb-8 mb-8 flex justify-between items-start">
//                 <div>
//                     <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">
//                         MockShield Report
//                     </h1>
//                     <p className="text-gray-400 font-mono text-sm">SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
//                     <p className="text-gray-400 font-mono text-sm">DATE: {new Date().toLocaleDateString()}</p>
//                 </div>
//                 <div className="text-right">
//                     <div className="text-6xl font-black text-blue-600 tracking-tighter">{processedData.score}<span className="text-2xl text-gray-300">/100</span></div>
//                     <p className="font-bold text-slate-400 text-xs uppercase tracking-widest mt-1">Assessment Score</p>
//                 </div>
//             </div>

//             {/* Integrity Badge */}
//             <div className={`mb-10 p-4 rounded-lg border flex items-center gap-4 ${integrity.count > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
//                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${integrity.count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
//                     <i className={`fa-solid ${integrity.count > 0 ? 'fa-triangle-exclamation' : 'fa-shield-check'}`}></i>
//                 </div>
//                 <div>
//                     <h3 className={`font-bold uppercase text-sm ${integrity.count > 0 ? 'text-red-700' : 'text-green-700'}`}>
//                         Proctoring Status: {integrity.count > 0 ? "Flagged" : "Verified"}
//                     </h3>
//                     <p className="text-slate-600 text-sm">
//                         {integrity.count > 0 
//                         ? `Focus lost ${integrity.count} times. Integrity Score: ${integrity.score}%`
//                         : "Candidate maintained focus throughout the session."}
//                     </p>
//                 </div>
//             </div>

//             {/* Executive Summary */}
//             {/* <div className="mb-12">
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 border-b border-gray-100 pb-2">
//                     Executive Summary
//                 </h3>
//                 <p className="text-lg text-slate-700 leading-relaxed font-medium">
//                     {processedData.summary}
//                 </p>
//             </div> */}

//             {/* Analysis Grid */}
//             <div className="grid grid-cols-1 gap-10 mb-12">
//                 <div>
//                     <h3 className="font-bold text-red-600 uppercase text-xs tracking-widest mb-4 border-b border-red-100 pb-2">
//                         MockShield Critical Flags
//                     </h3>
//                     <ul className="space-y-3">
//                         {processedData.silent_killers && processedData.silent_killers.length > 0 ? (
//                             processedData.silent_killers.map((killer, i) => (
//                                 <li key={i} className="flex items-start gap-3 bg-red-50 p-3 rounded-md border border-red-100">
//                                     <i className="fa-solid fa-xmark text-red-500 mt-1"></i>
//                                     <span className="text-slate-800 text-sm font-medium leading-snug">{killer}</span>
//                                 </li>
//                             ))
//                         ) : (
//                             <li className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded border border-green-100">
//                                 <i className="fa-solid fa-check"></i> No critical flags detected.
//                             </li>
//                         )}
//                     </ul>
//                 </div>

//                 <div>
//                     <h3 className="font-bold text-green-600 uppercase text-xs tracking-widest mb-4 border-b border-green-100 pb-2">
//                         Recommended Roadmap
//                     </h3>
//                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
//                         {processedData.roadmap}
//                     </div>
//                 </div>
//             </div>

//             {/* Forensic Analysis (Strict Merge Render) */}
//             <div>
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-6 border-b border-gray-100 pb-2">
//                     Forensic Question Analysis ({processedData.question_reviews.length} Qs)
//                 </h3>
//                 <div className="space-y-8">
//                     {processedData.question_reviews.map((review, i) => (
//                         <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden break-inside-avoid shadow-sm hover:shadow-md transition-shadow">
//                             <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
//                                 <h4 className="font-bold text-slate-800 text-sm">Question {i + 1}</h4>
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-xs font-bold text-slate-400 uppercase">Rating:</span>
//                                     <span className={`px-2 py-1 rounded text-xs font-bold ${review.score >= 8 ? 'bg-green-100 text-green-700' : review.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
//                                         {review.score}/10
//                                     </span>
//                                 </div>
//                             </div>
//                             <div className="p-6 space-y-4">
//                                 {/* Safe Question Text */}
//                                 <p className="text-slate-900 font-bold text-md">{review.question}</p>
                                
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div>
//                                         <div className="text-xs font-bold text-slate-400 uppercase mb-2">Candidate Answer</div>
//                                         <div className="bg-slate-50 p-3 rounded border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono">
//                                             {/* Safe User Answer */}
//                                             {review.user_answer || <span className="text-gray-400 italic">No answer provided</span>}
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <div className="text-xs font-bold text-blue-500 uppercase mb-2">Ideal Answer</div>
//                                         <div className="bg-blue-50 p-3 rounded border border-blue-100 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-mono">
//                                             {review.ideal_answer}
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="pt-2">
//                                     <div className="flex items-start gap-2">
//                                         <i className="fa-solid fa-comment-dots text-purple-500 mt-1"></i>
//                                         <p className="text-slate-500 text-sm italic">"{review.feedback}"</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Report;
//------------------------------------------------------------------------------------------------------------------------
// 13 feb resume audit audit
import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- 1. SAFE DATA EXTRACTION & FALLBACKS ---
  const state = location.state || {};
  
  // --- DETECT SELECTED DOMAIN (1 of 25 Parts) ---
  // Checks selectedDomain or domain, normalizes text (removes underscores), and defaults if missing.
  const targetDomain = (state.selectedDomain || state.domain || "TARGET DOMAIN").replace(/_/g, " "); 

  // Raw Data Sources
  const rawReport = state.feedback || state.report || {};
  const rawAnswers = state.answers || []; // Source of Truth (User's local data)
  const rawReviews = rawReport.question_reviews || []; // API Response
  const integrity = state.integrity || { score: 100, count: 0 };

  // --- HELPER: SMART TEXT FORMATTER (HTML) ---
  // Detects newlines or bullet points and renders a clean HTML list
  const renderFormattedText = (text, isListMode = false) => {
    if (!text) return null;

    // Check if text contains newlines or looks like a list
    const hasNewLines = text.includes('\n');
    
    if (hasNewLines || isListMode) {
      const items = text.split('\n').filter(item => item.trim() !== '');
      return (
        <ul className="list-disc pl-5 space-y-1">
          {items.map((item, index) => {
            // Remove existing bullet markers if present to avoid double bullets
            const cleanItem = item.replace(/^[-*•]\s*/, ''); 
            return <li key={index}>{cleanItem}</li>;
          })}
        </ul>
      );
    }

    // Default return if no formatting needed
    return <p>{text}</p>;
  };

  // --- HELPER: PDF TEXT FORMATTER ---
  // Formats text into a visual list string for the PDF table cells
  const formatTextForPDF = (text) => {
    if (!text) return "N/A";
    const items = text.split('\n').filter(item => item.trim() !== '');
    if (items.length > 1) {
      return items.map(item => `• ${item.replace(/^[-*•]\s*/, '')}`).join('\n');
    }
    return text;
  };

  // --- 2. FORENSIC DATA RECONCILER (STRICT MERGE PROTOCOL) ---
  // This logic guarantees that the report ALWAYS matches the number of questions answered by the user.
  // It uses the User's Text as the "Source of Truth" and only patches in the API scores/feedback.
  const processedData = useMemo(() => {
    const userCount = rawAnswers.length;
    const apiCount = rawReviews.length;

    // A. Silent Killer Detection Log
    if (userCount !== apiCount) {
      console.warn(
        `%c⚠️ SILENT KILLER DETECTED: DATA MISMATCH`, 
        "color: red; font-weight: bold; font-size: 14px;"
      );
      console.warn(`User Answered: ${userCount} | AI Analyzed: ${apiCount}`);
      console.warn("Engaging Strict Merge Protocol to force full report generation...");
    } else {
      console.log("%c✅ DATA INTEGRITY VERIFIED: 1:1 Match", "color: green; font-weight: bold;");
    }

    // B. The Strict Merge Loop
    // We map over RAW ANSWERS to ensure every user interaction is preserved.
    const mergedReviews = rawAnswers.map((answerEntry, index) => {
      // Try to find the matching review from API
      const aiReview = rawReviews[index];

      if (aiReview) {
        // --- CRITICAL FIX ---
        // We do NOT return 'aiReview' directly. 
        // We create a new object that prioritizes the USER'S local text 
        // to prevent API glitches from hiding the question/answer.
        return {
          question: answerEntry.question,      // FORCE Local Question Text (Source of Truth)
          user_answer: answerEntry.answer,     // FORCE Local User Answer (Source of Truth)
          score: aiReview.score || 0,          // Use API Score
          feedback: aiReview.feedback || "Analysis Pending", // Use API Feedback
          ideal_answer: aiReview.ideal_answer || "Standard best practices apply." // Use API Ideal Answer
        };
      } else {
        // Fallback for completely missing API data (The "Patch")
        return {
          question: answerEntry.question,
          user_answer: answerEntry.answer,
          score: 0,
          feedback: "⚠️ AI Analysis Timeout. Raw submission preserved.",
          ideal_answer: "N/A - Analysis Data Missing"
        };
      }
    });

    return {
      score: rawReport.score || 0,
      summary: rawReport.summary || "Summary generation incomplete.",
      roadmap: rawReport.roadmap || "Roadmap generation incomplete.",
      silent_killers: rawReport.silent_killers || [],
      question_reviews: mergedReviews // <--- Now contains the strictly merged data
    };
  }, [rawAnswers, rawReviews, rawReport]);

  // --- 3. PDF GENERATION LOGIC ---
  const handleDownload = () => {
    // 1. Initialize Document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // 2. Constants
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);
    const safeBottom = pageHeight - margin - 5;
    
    let cursorY = margin + 15;

    // --- Helpers ---
    const drawPageBorder = () => {
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, contentWidth, contentHeight);
    };

    const checkPageBreak = (heightNeeded) => {
      if (cursorY + heightNeeded > safeBottom) {
        doc.addPage();
        drawPageBorder();
        cursorY = margin + 15;
        return true;
      }
      return false;
    };

    const addWrappedText = (text, fontSize = 12, fontType = 'normal', color = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontType);
      doc.setTextColor(...color);

      const lines = doc.splitTextToSize(text || "N/A", contentWidth - 4);
      const blockHeight = lines.length * (fontSize * 0.3527 + 2);

      checkPageBreak(blockHeight);

      doc.text(lines, margin + 2, cursorY);
      cursorY += blockHeight + 2;
    };

    // ================= START PDF CONTENT =================
    drawPageBorder();

    // Header - FORCED DOMAIN + HR + APTITUDE LABELING
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`INTERVIEW REPORT: ${targetDomain.toUpperCase()}`, margin + 2, cursorY); 
    cursorY += 8;
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`INCLUDES: HR & APTITUDE EVALUATION`, margin + 2, cursorY);
    doc.setTextColor(0, 0, 0);
    cursorY += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`SESSION ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, margin + 2, cursorY);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, cursorY);
    cursorY += 10;

    // Scorecard
    checkPageBreak(30);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin + 2, cursorY, contentWidth - 4, 25, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${processedData.score}/100`, margin + 10, cursorY + 10); // Use Processed Data
    doc.text("COMPOSITE SCORE", margin + 10, cursorY + 18);

    const isFlagged = integrity.count > 0;
    doc.setTextColor(isFlagged ? 220 : 0, 0, 0);
    doc.text(`PROCTORING STATUS: ${isFlagged ? "FLAGGED" : "CLEAN"}`, pageWidth / 2, cursorY + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Focus lost ${integrity.count} times. Integrity Score: ${integrity.score}%`, 
      pageWidth / 2, 
      cursorY + 18
    );
    doc.setTextColor(0, 0, 0);
    cursorY += 35;

    // Executive Summary removed per request logic (commented out in original)
    // checkPageBreak(10);
    // doc.setFontSize(14);
    // doc.setFont('helvetica', 'bold');
    // doc.text("EXECUTIVE SUMMARY", margin + 2, cursorY);
    // cursorY += 8;
    // addWrappedText(processedData.summary, 11, 'normal');
    // cursorY += 5;

    // Critical Flags
    if (processedData.silent_killers && processedData.silent_killers.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 0, 0);
      doc.text("CRITICAL RED FLAGS (DOMAIN & BEHAVIORAL)", margin + 2, cursorY);
      cursorY += 8;

      processedData.silent_killers.forEach(killer => {
        addWrappedText(`X ${killer}`, 10, 'normal', [200, 0, 0]);
      });
      doc.setTextColor(0, 0, 0);
      cursorY += 5;
    }

    // Roadmap
    if (processedData.roadmap) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("RECOMMENDED ROADMAP", margin + 2, cursorY);
      cursorY += 8;
      // Use formatTextForPDF to ensure roadmap is readable in PDF if it has bullets
      addWrappedText(formatTextForPDF(processedData.roadmap), 10, 'normal');
      cursorY += 10;
    }

    // Question Analysis Tables (FORCED RENDER)
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`DETAILED ANALYSIS: ${targetDomain.toUpperCase()}, HR & APTITUDE`, margin + 2, cursorY);
    cursorY += 10;

    // Iterate over the SAFE merged data
    processedData.question_reviews.forEach((q, index) => {
      checkPageBreak(20);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text(`Question ${index + 1}`, margin + 2, cursorY);
      
      // Score Label in PDF
      doc.setFontSize(9);
      doc.text(`Score: ${q.score}/10`, pageWidth - margin - 25, cursorY);

      cursorY += 6;

      // Use SAFE Question Text
      addWrappedText(q.question, 10, 'italic', [80, 80, 80]);
      cursorY += 2;

      // UPDATED PDF TABLE LOGIC: Formatting Ideal Answer as List
      const formattedIdealAnswer = formatTextForPDF(q.ideal_answer);
      const formattedFeedback = formatTextForPDF(q.feedback);

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin + 2, right: margin + 2 },
        tableWidth: contentWidth - 4,
        head: [['CANDIDATE ANSWER', 'ANALYSIS & IDEAL ANSWER']],
        body: [[
          q.user_answer || "[No Answer Provided]",
          `FEEDBACK:\n${formattedFeedback}\n\nIDEAL ANSWER:\n${formattedIdealAnswer}`
        ]],
        styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak', valign: 'top' },
        headStyles: { fillColor: [40, 44, 52], textColor: 255 },
        columnStyles: { 0: { cellWidth: (contentWidth - 4) * 0.4 }, 1: { cellWidth: (contentWidth - 4) * 0.6 } },
        didDrawPage: () => drawPageBorder(),
      });

      cursorY = doc.lastAutoTable.finalY + 10;
    });

    // Save File
    doc.save(`${targetDomain.replace(/\s+/g, '_')}_HR_Aptitude_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center relative">
      
      {/* ACTION BAR */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 font-bold">
            <i className="fa-solid fa-arrow-left mr-2"></i> Dashboard
        </button>
        <button 
          onClick={handleDownload}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition flex items-center gap-2"
        >
            <i className="fa-solid fa-file-pdf"></i> Download {targetDomain} Report
        </button>
      </div>

      {/* REPORT VISUAL PREVIEW (HTML) */}
      <div className="flex justify-center w-full overflow-hidden">
        <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-none p-12 border border-slate-200">
            
            {/* Header - FORCED TEXT CHANGE */}
            <div className="border-b border-gray-200 pb-8 mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                        {targetDomain} Report
                    </h1>
                    <h2 className="text-xl font-bold text-slate-500 uppercase tracking-tight mb-2">
                        + HR & Aptitude Analysis
                    </h2>
                    <p className="text-gray-400 font-mono text-sm">SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <p className="text-gray-400 font-mono text-sm">DATE: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <div className="text-6xl font-black text-blue-600 tracking-tighter">{processedData.score}<span className="text-2xl text-gray-300">/100</span></div>
                    <p className="font-bold text-slate-400 text-xs uppercase tracking-widest mt-1">Composite Score</p>
                </div>
            </div>

            {/* Integrity Badge */}
            <div className={`mb-10 p-4 rounded-lg border flex items-center gap-4 ${integrity.count > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${integrity.count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <i className={`fa-solid ${integrity.count > 0 ? 'fa-triangle-exclamation' : 'fa-shield-check'}`}></i>
                </div>
                <div>
                    <h3 className={`font-bold uppercase text-sm ${integrity.count > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        Proctoring Status: {integrity.count > 0 ? "Flagged" : "Verified"}
                    </h3>
                    <p className="text-slate-600 text-sm">
                        {integrity.count > 0 
                        ? `Focus lost ${integrity.count} times. Integrity Score: ${integrity.score}%`
                        : "Candidate maintained focus throughout the session."}
                    </p>
                </div>
            </div>

            {/* Executive Summary */}
            {/* <div className="mb-12">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 border-b border-gray-100 pb-2">
                    Executive Summary
                </h3>
                <p className="text-lg text-slate-700 leading-relaxed font-medium">
                    {processedData.summary}
                </p>
            </div> */}

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 gap-10 mb-12">
                <div>
                    <h3 className="font-bold text-red-600 uppercase text-xs tracking-widest mb-4 border-b border-red-100 pb-2">
                        Critical Flags ({targetDomain} & Behavior)
                    </h3>
                    <ul className="space-y-3">
                        {processedData.silent_killers && processedData.silent_killers.length > 0 ? (
                            processedData.silent_killers.map((killer, i) => (
                                <li key={i} className="flex items-start gap-3 bg-red-50 p-3 rounded-md border border-red-100">
                                    <i className="fa-solid fa-xmark text-red-500 mt-1"></i>
                                    <span className="text-slate-800 text-sm font-medium leading-snug">{killer}</span>
                                </li>
                            ))
                        ) : (
                            <li className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded border border-green-100">
                                <i className="fa-solid fa-check"></i> No critical flags detected.
                            </li>
                        )}
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold text-green-600 uppercase text-xs tracking-widest mb-4 border-b border-green-100 pb-2">
                        Recommended Roadmap
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {renderFormattedText(processedData.roadmap)}
                    </div>
                </div>
            </div>

            {/* Forensic Analysis (Strict Merge Render) */}
            <div>
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-6 border-b border-gray-100 pb-2">
                    Detailed Analysis: {targetDomain}, HR & Aptitude
                </h3>
                <div className="space-y-8">
                    {processedData.question_reviews.map((review, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden break-inside-avoid shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 text-sm">Question {i + 1}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Rating:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${review.score >= 8 ? 'bg-green-100 text-green-700' : review.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {review.score}/10
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Safe Question Text */}
                                <p className="text-slate-900 font-bold text-md">{review.question}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Candidate Answer</div>
                                        <div className="bg-slate-50 p-3 rounded border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono font-semibold">
                                            {/* Safe User Answer - BOLD ADDED */}
                                            {review.user_answer || <span className="text-gray-400 italic">No answer provided</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-blue-500 uppercase mb-2">Ideal Answer</div>
                                        <div className="bg-blue-50 p-3 rounded border border-blue-100 text-slate-800 text-sm leading-relaxed font-mono font-semibold">
                                            {/* Ideal Answer - SMART FORMATTER & BOLD ADDED */}
                                            {renderFormattedText(review.ideal_answer)}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <div className="flex items-start gap-2">
                                        <i className="fa-solid fa-comment-dots text-purple-500 mt-1"></i>
                                        <div className="text-slate-500 text-sm italic w-full">
                                            {/* Feedback - SMART FORMATTER ADDED */}
                                            {renderFormattedText(review.feedback)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Report;