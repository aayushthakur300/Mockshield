// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// const ResumeReport = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Safe Data Extraction
//   const state = location.state || {};
  
//   const feedback = state.feedback || { 
//     score: 0, 
//     summary: "No Resume Analysis Data Available.", 
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
//     doc.text("RESUME ANALYSIS REPORT", margin + 2, cursorY); 
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
//     doc.text("RESUME STRENGTH SCORE", margin + 10, cursorY + 18);

//     const isFlagged = integrity.count > 0;
//     doc.setTextColor(isFlagged ? 220 : 0, 0, 0);
//     doc.text(`INTEGRITY STATUS: ${isFlagged ? "FLAGGED" : "CLEAN"}`, pageWidth / 2, cursorY + 10);
    
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
//       doc.text("RESUME RED FLAGS", margin + 2, cursorY); 
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
//       doc.text("IMPROVEMENT ROADMAP", margin + 2, cursorY);
//       cursorY += 8;
//       addWrappedText(feedback.roadmap, 10, 'normal');
//       cursorY += 10;
//     }

//     // Question Analysis Tables
//     checkPageBreak(15);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text("FORENSIC INTERROGATION ANALYSIS", margin + 2, cursorY);
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
//     doc.save(`Resume_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
//                         Resume Analysis Report
//                     </h1>
//                     <p className="text-gray-400 font-mono text-sm">SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
//                     <p className="text-gray-400 font-mono text-sm">DATE: {new Date().toLocaleDateString()}</p>
//                 </div>
//                 <div className="text-right">
//                     <div className="text-6xl font-black text-blue-600 tracking-tighter">{feedback.score}<span className="text-2xl text-gray-300">/100</span></div>
//                     <p className="font-bold text-slate-400 text-xs uppercase tracking-widest mt-1">Resume Strength Score</p>
//                 </div>
//             </div>

//             {/* Integrity Badge */}
//             <div className={`mb-10 p-4 rounded-lg border flex items-center gap-4 ${integrity.count > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
//                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${integrity.count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
//                     <i className={`fa-solid ${integrity.count > 0 ? 'fa-triangle-exclamation' : 'fa-shield-check'}`}></i>
//                 </div>
//                 <div>
//                     <h3 className={`font-bold uppercase text-sm ${integrity.count > 0 ? 'text-red-700' : 'text-green-700'}`}>
//                         Integrity Status: {integrity.count > 0 ? "Flagged" : "Verified"}
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
//                         Resume Red Flags
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
//                         Improvement Roadmap
//                     </h3>
//                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
//                         {feedback.roadmap}
//                     </div>
//                 </div>
//             </div>

//             {/* Forensic Analysis */}
//             <div>
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-6 border-b border-gray-100 pb-2">
//                     Forensic Interrogation Analysis
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

// export default ResumeReport;
//-----------------------------------------------------------------------------------------------------------------------------------
//present one -----------------------------> 
// // import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import ChatAssistant from '../components/ChatAssistant'; // Ensure this path is correct

// const ResumeReport = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // --- 1. SAFE DATA EXTRACTION ---
//   const state = location.state || {};
  
//   // Normalize data structure (Handle both direct 'report' object or nested 'feedback')
//   const reportData = state.report || state.feedback || { 
//     score: 0, 
//     summary: "No Resume Analysis Data Available. Please ensure the backend is connected.", 
//     roadmap: "N/A", 
//     silent_killers: [], 
//     question_reviews: [] 
//   };

//   const topicName = state.topic || "Resume Audit"; // Capture passed topic
//   const answers = state.answers || [];
//   const integrity = state.integrity || { score: 100, count: 0 };

//   // --- 2. PDF GENERATION LOGIC ---
//   const handleDownload = () => {
//     const doc = new jsPDF('p', 'mm', 'a4');
    
//     // Page Config
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 15;
//     const contentWidth = pageWidth - (margin * 2);
//     let cursorY = margin + 10;

//     const drawPageBorder = () => {
//         doc.setDrawColor(200);
//         doc.setLineWidth(0.5);
//         doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
//     };

//     const checkPageBreak = (heightNeeded) => {
//       if (cursorY + heightNeeded > pageHeight - margin - 20) {
//         doc.addPage();
//         drawPageBorder();
//         cursorY = margin + 15;
//         return true;
//       }
//       return false;
//     };

//     const addWrappedText = (text, fontSize = 11, fontType = 'normal', color = [60, 60, 60]) => {
//         doc.setFontSize(fontSize);
//         doc.setFont('helvetica', fontType);
//         doc.setTextColor(...color);
//         const lines = doc.splitTextToSize(text || "N/A", contentWidth - 10);
//         const blockHeight = lines.length * (fontSize * 0.4) + 4;
//         checkPageBreak(blockHeight);
//         doc.text(lines, margin + 5, cursorY);
//         cursorY += blockHeight;
//     };

//     // --- PAGE 1: EXECUTIVE SUMMARY ---
//     drawPageBorder();

//     // 1. Header
//     doc.setFontSize(22);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(33, 33, 33);
//     doc.text(`${topicName.toUpperCase()} REPORT`, margin + 5, cursorY);
//     cursorY += 10;

//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.setTextColor(100);
//     doc.text(`SESSION ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, margin + 5, cursorY);
//     doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - margin - 35, cursorY);
//     cursorY += 15;

//     // 2. Scorecard Box
//     doc.setFillColor(248, 250, 252);
//     doc.setDrawColor(226, 232, 240);
//     doc.roundedRect(margin + 5, cursorY, contentWidth - 10, 40, 3, 3, 'FD');
    
//     // Score
//     doc.setFontSize(32);
//     doc.setFont('helvetica', 'bold');
//     const scoreColor = reportData.score >= 80 ? [34, 197, 94] : reportData.score >= 50 ? [234, 179, 8] : [239, 68, 68];
//     doc.setTextColor(...scoreColor);
//     doc.text(`${reportData.score}`, margin + 15, cursorY + 20);
//     doc.setFontSize(12);
//     doc.text("/ 100", margin + 35, cursorY + 20);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text("COMPETENCY SCORE", margin + 15, cursorY + 30);

//     // Integrity
//     doc.setFontSize(14);
//     doc.setTextColor(integrity.count > 0 ? 220 : 34, integrity.count > 0 ? 38 : 197, 60);
//     doc.text(integrity.count > 0 ? "FLAGGED" : "VERIFIED", pageWidth - margin - 40, cursorY + 15, { align: 'right' });
//     doc.setFontSize(10);
//     doc.setTextColor(80);
//     doc.text("INTEGRITY STATUS", pageWidth - margin - 40, cursorY + 25, { align: 'right' });
    
//     cursorY += 50;

//     // 3. Executive Summary
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(0);
//     doc.text("EXECUTIVE SUMMARY", margin + 5, cursorY);
//     cursorY += 8;
//     addWrappedText(reportData.summary, 11, 'normal', [50, 50, 50]);
//     cursorY += 10;

//     // 4. Silent Killers (Red Flags)
//     if (reportData.silent_killers && reportData.silent_killers.length > 0) {
//         checkPageBreak(40);
//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(220, 38, 38);
//         doc.text("CRITICAL RED FLAGS", margin + 5, cursorY);
//         cursorY += 8;

//         reportData.silent_killers.forEach(flag => {
//             doc.setFillColor(254, 242, 242);
//             doc.rect(margin + 5, cursorY, 2, 2, 'F'); // Bullet
//             addWrappedText(`•  ${flag}`, 11, 'normal', [185, 28, 28]);
//         });
//         cursorY += 10;
//     }

//     // 5. Roadmap
//     if (reportData.roadmap) {
//         checkPageBreak(40);
//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(37, 99, 235);
//         doc.text("IMPROVEMENT ROADMAP", margin + 5, cursorY);
//         cursorY += 8;
//         addWrappedText(reportData.roadmap, 11, 'normal', [30, 58, 138]);
//         cursorY += 10;
//     }

//     // --- PAGE 2+: DETAILED Q&A ---
//     doc.addPage();
//     drawPageBorder();
//     cursorY = margin + 15;

//     doc.setFontSize(16);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(0);
//     doc.text("DETAILED FORENSIC ANALYSIS", margin + 5, cursorY);
//     cursorY += 15;

//     const reviews = reportData.question_reviews && reportData.question_reviews.length > 0 
//         ? reportData.question_reviews 
//         : answers.map((a, i) => ({ 
//             question: a.question, 
//             user_answer: a.answer, 
//             score: 0, 
//             feedback: "Analysis unavailable.", 
//             ideal_answer: "N/A" 
//           }));

//     reviews.forEach((item, index) => {
//         checkPageBreak(60);

//         // Question Box
//         doc.setFillColor(241, 245, 249);
//         doc.rect(margin + 2, cursorY, contentWidth - 4, 10, 'F');
//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(51, 65, 85);
//         const qText = `Q${index + 1}: ${item.question.substring(0, 80)}...`;
//         doc.text(qText, margin + 5, cursorY + 6);
        
//         doc.text(`Score: ${item.score}/10`, pageWidth - margin - 25, cursorY + 6);
//         cursorY += 15;

//         // Content Table
//         autoTable(doc, {
//             startY: cursorY,
//             margin: { left: margin + 2, right: margin + 2 },
//             tableWidth: contentWidth - 4,
//             head: [['Candidate Response', 'Forensic Analysis & Ideal Approach']],
//             body: [[
//                 item.user_answer || "No Answer",
//                 `ANALYSIS: ${item.feedback}\n\nIDEAL: ${item.ideal_answer}`
//             ]],
//             theme: 'grid',
//             headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 9, fontStyle: 'bold' },
//             bodyStyles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
//             columnStyles: { 
//                 0: { cellWidth: (contentWidth - 4) * 0.4 }, 
//                 1: { cellWidth: (contentWidth - 4) * 0.6 } 
//             },
//             didDrawPage: () => drawPageBorder(),
//         });

//         cursorY = doc.lastAutoTable.finalY + 10;
//     });

//     doc.save(`Resume_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center relative font-sans">
      
//       {/* NAVIGATION BAR */}
//       <div className="w-full max-w-5xl flex justify-between items-center mb-8">
//         <button 
//             onClick={() => navigate('/')} 
//             className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2 transition-colors"
//         >
//             <i className="fa-solid fa-arrow-left"></i> Dashboard
//         </button>
//         <button 
//             onClick={handleDownload}
//             className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 hover:scale-105"
//         >
//             <i className="fa-solid fa-file-pdf"></i> Download Official Report
//         </button>
//       </div>

//       {/* REPORT PREVIEW CARD */}
//       <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-none md:rounded-lg p-8 md:p-12 border border-slate-200 relative">
            
//             {/* 1. HEADER */}
//             <div className="border-b border-gray-200 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start gap-6">
//                 <div>
//                     <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">
//                         {topicName} <span className="text-blue-600">AUDIT</span>
//                     </h1>
//                     <div className="flex flex-col gap-1">
//                         <p className="text-gray-400 font-mono text-xs font-bold tracking-widest">
//                             SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
//                         </p>
//                         <p className="text-gray-400 font-mono text-xs font-bold tracking-widest">
//                             DATE: {new Date().toLocaleDateString()}
//                         </p>
//                     </div>
//                 </div>
//                 <div className="text-right">
//                     <div className={`text-6xl font-black tracking-tighter ${
//                         reportData.score >= 80 ? 'text-green-600' : 
//                         reportData.score >= 50 ? 'text-yellow-500' : 'text-red-600'
//                     }`}>
//                         {reportData.score}<span className="text-2xl text-gray-300">/100</span>
//                     </div>
//                     <p className="font-bold text-slate-400 text-xs uppercase tracking-widest mt-1">Competency Score</p>
//                 </div>
//             </div>

//             {/* 2. INTEGRITY STATUS */}
//             <div className={`mb-10 p-4 rounded-lg border flex items-center gap-4 ${integrity.count > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
//                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm ${integrity.count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
//                     <i className={`fa-solid ${integrity.count > 0 ? 'fa-triangle-exclamation' : 'fa-shield-check'}`}></i>
//                 </div>
//                 <div>
//                     <h3 className={`font-bold uppercase text-sm ${integrity.count > 0 ? 'text-red-700' : 'text-green-700'}`}>
//                         Integrity Status: {integrity.count > 0 ? "Flagged" : "Verified"}
//                     </h3>
//                     <p className="text-slate-600 text-sm mt-1">
//                         {integrity.count > 0 
//                         ? `Focus lost ${integrity.count} times. Integrity Score: ${integrity.score}%`
//                         : "Candidate maintained verified focus throughout the session."}
//                     </p>
//                 </div>
//             </div>

//             {/* 3. EXECUTIVE SUMMARY */}
//             <div className="mb-12">
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 border-b border-gray-100 pb-2">
//                     Executive Summary
//                 </h3>
//                 <p className="text-lg text-slate-700 leading-relaxed font-medium">
//                     {reportData.summary}
//                 </p>
//             </div>

//             {/* 4. ANALYSIS GRID (RED FLAGS & ROADMAP) */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                
//                 {/* Red Flags */}
//                 <div className="bg-red-50/50 p-6 rounded-xl border border-red-100">
//                     <h3 className="font-bold text-red-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
//                         <i className="fa-solid fa-flag"></i> Resume Red Flags
//                     </h3>
//                     <ul className="space-y-3">
//                         {reportData.silent_killers && reportData.silent_killers.length > 0 ? (
//                             reportData.silent_killers.map((killer, i) => (
//                                 <li key={i} className="flex items-start gap-3">
//                                     <i className="fa-solid fa-xmark text-red-500 mt-1.5 text-sm"></i>
//                                     <span className="text-slate-800 text-sm font-medium leading-snug">{killer}</span>
//                                 </li>
//                             ))
//                         ) : (
//                             <li className="flex items-center gap-2 text-green-600 text-sm font-bold">
//                                 <i className="fa-solid fa-check-circle"></i> No critical flags detected.
//                             </li>
//                         )}
//                     </ul>
//                 </div>

//                 {/* Roadmap */}
//                 <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
//                     <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
//                         <i className="fa-solid fa-map"></i> Improvement Roadmap
//                     </h3>
//                     <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
//                         {reportData.roadmap || "No specific roadmap generated."}
//                     </div>
//                 </div>
//             </div>

//             {/* 5. QUESTION BREAKDOWN */}
//             <div>
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-6 border-b border-gray-100 pb-2">
//                     Forensic Interrogation Analysis
//                 </h3>
//                 <div className="space-y-8">
//                     {reportData.question_reviews && reportData.question_reviews.length > 0 ? (
//                         reportData.question_reviews.map((review, i) => (
//                             <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
//                                 <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
//                                     <h4 className="font-bold text-slate-800 text-sm">Query {i + 1}</h4>
//                                     <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
//                                         review.score >= 8 ? 'bg-green-100 text-green-700' : 
//                                         review.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
//                                     }`}>
//                                         Rating: {review.score}/10
//                                     </span>
//                                 </div>
//                                 <div className="p-6">
//                                     <p className="text-slate-900 font-bold text-md mb-6">{review.question}</p>
                                    
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         {/* User Answer */}
//                                         <div>
//                                             <div className="text-xs font-bold text-slate-400 uppercase mb-2">Candidate Response</div>
//                                             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-600 text-sm leading-relaxed font-mono">
//                                                 {review.user_answer || <span className="text-gray-400 italic">No response captured.</span>}
//                                             </div>
//                                         </div>
                                        
//                                         {/* Ideal Answer */}
//                                         <div>
//                                             <div className="text-xs font-bold text-blue-500 uppercase mb-2">Ideal Technical Response</div>
//                                             <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-slate-800 text-sm leading-relaxed font-mono">
//                                                 {review.ideal_answer}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Feedback */}
//                                     <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3">
//                                         <i className="fa-solid fa-user-doctor text-purple-500 mt-1"></i>
//                                         <p className="text-slate-500 text-sm italic font-medium">"{review.feedback}"</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
//                             No detailed question analysis available for this session.
//                         </div>
//                     )}
//                 </div>
//             </div>
//       </div>

//       {/* --- FLOATING CHAT ASSISTANT (MANDATORY ADDITION) --- */}
//       <div className="fixed bottom-6 right-6 z-50">
//          <ChatAssistant context={{ 
//              page: "Report Analysis", 
//              score: reportData.score, 
//              topic: topicName 
//          }} />
//       </div>

//     </div>
//   );
// };

// export default ResumeReport;
//------------------------------------------------------------------------------------------------------------------------------------------------------
// ----> newly added
// import React, { useEffect, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import ChatAssistant from '../components/ChatAssistant'; 

// const ResumeReport = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // --- 1. SAFE DATA EXTRACTION & FALLBACKS ---
//   const state = location.state || {};
  
//   // Raw Data Sources
//   const rawReport = state.report || state.feedback || {};
//   const rawAnswers = state.answers || []; // This is the User's Source of Truth (e.g., 20 items)
//   const rawReviews = rawReport.question_reviews || []; // This is the API's Response (e.g., maybe 18 items)
//   const integrity = state.integrity || { score: 100, count: 0 };
//   const topicName = state.topic || "Resume Audit";

//   // --- 2. FORENSIC DATA RECONCILER (STRICT MERGE PROTOCOL) ---
//   const processedData = useMemo(() => {
//     const userCount = rawAnswers.length;
//     const apiCount = rawReviews.length;

//     // A. Integrity Log
//     if (userCount !== apiCount) {
//       console.warn(`⚠️ DATA MISMATCH: User answered ${userCount}, API returned ${apiCount}. Engaging Strict Merge.`);
//     }

//     // B. The "Strict Merge" Loop
//     // We iterate over rawAnswers because we MUST show every question the user answered.
//     const mergedReviews = rawAnswers.map((answerEntry, index) => {
//       // Try to find a matching review from the API based on index
//       // (Assuming sequential processing by the backend)
//       const aiReview = rawReviews[index];

//       if (aiReview) {
//         // --- CRITICAL FIX HERE ---
//         // We do NOT return 'aiReview' directly. 
//         // We create a new object that prioritizes the USER'S local text 
//         // to prevent API glitches from hiding the question/answer.
//         return {
//           question: answerEntry.question,     // FORCE Local Question Text
//           user_answer: answerEntry.answer,    // FORCE Local User Answer
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
//     const doc = new jsPDF('p', 'mm', 'a4');
    
//     // Page Config
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 15;
//     const contentWidth = pageWidth - (margin * 2);
//     let cursorY = margin + 10;

//     const drawPageBorder = () => {
//         doc.setDrawColor(200);
//         doc.setLineWidth(0.5);
//         doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
//     };

//     const checkPageBreak = (heightNeeded) => {
//       if (cursorY + heightNeeded > pageHeight - margin - 20) {
//         doc.addPage();
//         drawPageBorder();
//         cursorY = margin + 15;
//         return true;
//       }
//       return false;
//     };

//     const addWrappedText = (text, fontSize = 11, fontType = 'normal', color = [60, 60, 60]) => {
//         doc.setFontSize(fontSize);
//         doc.setFont('helvetica', fontType);
//         doc.setTextColor(...color);
//         const lines = doc.splitTextToSize(text || "N/A", contentWidth - 10);
//         const blockHeight = lines.length * (fontSize * 0.4) + 4;
//         checkPageBreak(blockHeight);
//         doc.text(lines, margin + 5, cursorY);
//         cursorY += blockHeight;
//     };

//     // --- PAGE 1: EXECUTIVE SUMMARY ---
//     drawPageBorder();

//     // 1. Header
//     doc.setFontSize(22);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(33, 33, 33);
//     doc.text(`${topicName.toUpperCase()} REPORT`, margin + 5, cursorY);
//     cursorY += 10;

//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.setTextColor(100);
//     doc.text(`SESSION ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, margin + 5, cursorY);
//     doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - margin - 35, cursorY);
//     cursorY += 15;

//     // 2. Scorecard Box
//     doc.setFillColor(248, 250, 252);
//     doc.setDrawColor(226, 232, 240);
//     doc.roundedRect(margin + 5, cursorY, contentWidth - 10, 40, 3, 3, 'FD');
    
//     // Score
//     doc.setFontSize(32);
//     doc.setFont('helvetica', 'bold');
//     const scoreColor = processedData.score >= 80 ? [34, 197, 94] : processedData.score >= 50 ? [234, 179, 8] : [239, 68, 68];
//     doc.setTextColor(...scoreColor);
//     doc.text(`${processedData.score}`, margin + 15, cursorY + 20);
//     doc.setFontSize(12);
//     doc.text("/ 100", margin + 35, cursorY + 20);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text("COMPETENCY SCORE", margin + 15, cursorY + 30);

//     // Integrity
//     doc.setFontSize(14);
//     doc.setTextColor(integrity.count > 0 ? 220 : 34, integrity.count > 0 ? 38 : 197, 60);
//     doc.text(integrity.count > 0 ? "FLAGGED" : "VERIFIED", pageWidth - margin - 40, cursorY + 15, { align: 'right' });
//     doc.setFontSize(10);
//     doc.setTextColor(80);
//     doc.text("INTEGRITY STATUS", pageWidth - margin - 40, cursorY + 25, { align: 'right' });
    
//     cursorY += 50;

//     // 3. Executive Summary
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(0);
//     doc.text("EXECUTIVE SUMMARY", margin + 5, cursorY);
//     cursorY += 8;
//     addWrappedText(processedData.summary, 11, 'normal', [50, 50, 50]);
//     cursorY += 10;

//     // 4. Silent Killers (Red Flags)
//     if (processedData.silent_killers && processedData.silent_killers.length > 0) {
//         checkPageBreak(40);
//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(220, 38, 38);
//         doc.text("CRITICAL RED FLAGS", margin + 5, cursorY);
//         cursorY += 8;

//         processedData.silent_killers.forEach(flag => {
//             doc.setFillColor(254, 242, 242);
//             doc.rect(margin + 5, cursorY, 2, 2, 'F'); // Bullet
//             addWrappedText(`•  ${flag}`, 11, 'normal', [185, 28, 28]);
//         });
//         cursorY += 10;
//     }

//     // 5. Roadmap
//     if (processedData.roadmap) {
//         checkPageBreak(40);
//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(37, 99, 235);
//         doc.text("IMPROVEMENT ROADMAP", margin + 5, cursorY);
//         cursorY += 8;
//         addWrappedText(processedData.roadmap, 11, 'normal', [30, 58, 138]);
//         cursorY += 10;
//     }

//     // --- PAGE 2+: DETAILED Q&A ---
//     doc.addPage();
//     drawPageBorder();
//     cursorY = margin + 15;

//     doc.setFontSize(16);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(0);
//     doc.text("DETAILED FORENSIC ANALYSIS", margin + 5, cursorY);
//     cursorY += 15;

//     processedData.question_reviews.forEach((item, index) => {
//         checkPageBreak(60);

//         // Question Box
//         doc.setFillColor(241, 245, 249);
//         doc.rect(margin + 2, cursorY, contentWidth - 4, 10, 'F');
//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(51, 65, 85);
        
//         // Use the safely merged question text
//         const qText = `Q${index + 1}: ${item.question ? item.question.substring(0, 80) : "Question Text Missing"}...`;
//         doc.text(qText, margin + 5, cursorY + 6);
        
//         doc.text(`Score: ${item.score}/10`, pageWidth - margin - 25, cursorY + 6);
//         cursorY += 15;

//         // Content Table
//         autoTable(doc, {
//             startY: cursorY,
//             margin: { left: margin + 2, right: margin + 2 },
//             tableWidth: contentWidth - 4,
//             head: [['Candidate Response', 'Forensic Analysis & Ideal Approach']],
//             body: [[
//                 item.user_answer || "No Answer",
//                 `ANALYSIS: ${item.feedback}\n\nIDEAL: ${item.ideal_answer}`
//             ]],
//             theme: 'grid',
//             headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 9, fontStyle: 'bold' },
//             bodyStyles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
//             columnStyles: { 
//                 0: { cellWidth: (contentWidth - 4) * 0.4 }, 
//                 1: { cellWidth: (contentWidth - 4) * 0.6 } 
//             },
//             didDrawPage: () => drawPageBorder(),
//         });

//         cursorY = doc.lastAutoTable.finalY + 10;
//     });

//     doc.save(`Resume_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center relative font-sans">
      
//       {/* NAVIGATION BAR */}
//       <div className="w-full max-w-5xl flex justify-between items-center mb-8">
//         <button 
//             onClick={() => navigate('/')} 
//             className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2 transition-colors"
//         >
//             <i className="fa-solid fa-arrow-left"></i> Dashboard
//         </button>
//         <button 
//             onClick={handleDownload}
//             className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 hover:scale-105"
//         >
//             <i className="fa-solid fa-file-pdf"></i> Download Official Report
//         </button>
//       </div>

//       {/* REPORT PREVIEW CARD */}
//       <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-none md:rounded-lg p-8 md:p-12 border border-slate-200 relative">
            
//             {/* 1. HEADER */}
//             <div className="border-b border-gray-200 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start gap-6">
//                 <div>
//                     <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">
//                         {topicName} <span className="text-blue-600">AUDIT</span>
//                     </h1>
//                     <div className="flex flex-col gap-1">
//                         <p className="text-gray-400 font-mono text-xs font-bold tracking-widest">
//                             SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
//                         </p>
//                         <p className="text-gray-400 font-mono text-xs font-bold tracking-widest">
//                             DATE: {new Date().toLocaleDateString()}
//                         </p>
//                     </div>
//                 </div>
//                 <div className="text-right">
//                     <div className={`text-6xl font-black tracking-tighter ${
//                         processedData.score >= 80 ? 'text-green-600' : 
//                         processedData.score >= 50 ? 'text-yellow-500' : 'text-red-600'
//                     }`}>
//                         {processedData.score}<span className="text-2xl text-gray-300">/100</span>
//                     </div>
//                     <p className="font-bold text-slate-400 text-xs uppercase tracking-widest mt-1">Competency Score</p>
//                 </div>
//             </div>

//             {/* 2. INTEGRITY STATUS */}
//             <div className={`mb-10 p-4 rounded-lg border flex items-center gap-4 ${integrity.count > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
//                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm ${integrity.count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
//                     <i className={`fa-solid ${integrity.count > 0 ? 'fa-triangle-exclamation' : 'fa-shield-check'}`}></i>
//                 </div>
//                 <div>
//                     <h3 className={`font-bold uppercase text-sm ${integrity.count > 0 ? 'text-red-700' : 'text-green-700'}`}>
//                         Integrity Status: {integrity.count > 0 ? "Flagged" : "Verified"}
//                     </h3>
//                     <p className="text-slate-600 text-sm mt-1">
//                         {integrity.count > 0 
//                         ? `Focus lost ${integrity.count} times. Integrity Score: ${integrity.score}%`
//                         : "Candidate maintained verified focus throughout the session."}
//                     </p>
//                 </div>
//             </div>

//             {/* 3. EXECUTIVE SUMMARY */}
//             <div className="mb-12">
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 border-b border-gray-100 pb-2">
//                     Executive Summary
//                 </h3>
//                 <p className="text-lg text-slate-700 leading-relaxed font-medium">
//                     {processedData.summary}
//                 </p>
//             </div>

//             {/* 4. ANALYSIS GRID (RED FLAGS & ROADMAP) */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                
//                 {/* Red Flags */}
//                 <div className="bg-red-50/50 p-6 rounded-xl border border-red-100">
//                     <h3 className="font-bold text-red-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
//                         <i className="fa-solid fa-flag"></i> Resume Red Flags
//                     </h3>
//                     <ul className="space-y-3">
//                         {processedData.silent_killers && processedData.silent_killers.length > 0 ? (
//                             processedData.silent_killers.map((killer, i) => (
//                                 <li key={i} className="flex items-start gap-3">
//                                     <i className="fa-solid fa-xmark text-red-500 mt-1.5 text-sm"></i>
//                                     <span className="text-slate-800 text-sm font-medium leading-snug">{killer}</span>
//                                 </li>
//                             ))
//                         ) : (
//                             <li className="flex items-center gap-2 text-green-600 text-sm font-bold">
//                                 <i className="fa-solid fa-check-circle"></i> No critical flags detected.
//                             </li>
//                         )}
//                     </ul>
//                 </div>

//                 {/* Roadmap */}
//                 <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
//                     <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
//                         <i className="fa-solid fa-map"></i> Improvement Roadmap
//                     </h3>
//                     <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
//                         {processedData.roadmap || "No specific roadmap generated."}
//                     </div>
//                 </div>
//             </div>

//             {/* 5. QUESTION BREAKDOWN */}
//             <div>
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-6 border-b border-gray-100 pb-2">
//                     Forensic Interrogation Analysis ({processedData.question_reviews.length} Qs)
//                 </h3>
//                 <div className="space-y-8">
//                     {processedData.question_reviews.map((review, i) => (
//                         <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
//                             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
//                                 <h4 className="font-bold text-slate-800 text-sm">Query {i + 1}</h4>
//                                 <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
//                                     review.score >= 8 ? 'bg-green-100 text-green-700' : 
//                                     review.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
//                                 }`}>
//                                     Rating: {review.score}/10
//                                 </span>
//                             </div>
//                             <div className="p-6">
//                                 {/* Use safely merged question text */}
//                                 <p className="text-slate-900 font-bold text-md mb-6">{review.question}</p>
                                
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     {/* User Answer */}
//                                     <div>
//                                         <div className="text-xs font-bold text-slate-400 uppercase mb-2">Candidate Response</div>
//                                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-600 text-sm leading-relaxed font-mono">
//                                             {review.user_answer || <span className="text-gray-400 italic">No response captured.</span>}
//                                         </div>
//                                     </div>
                                    
//                                     {/* Ideal Answer */}
//                                     <div>
//                                         <div className="text-xs font-bold text-blue-500 uppercase mb-2">Ideal Technical Response</div>
//                                         <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-slate-800 text-sm leading-relaxed font-mono">
//                                             {review.ideal_answer}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Feedback */}
//                                 <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3">
//                                     <i className="fa-solid fa-user-doctor text-purple-500 mt-1"></i>
//                                     <p className="text-slate-500 text-sm italic font-medium">"{review.feedback}"</p>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//       </div>

//       {/* FLOATING CHAT ASSISTANT */}
//       <div className="fixed bottom-6 right-6 z-50">
//          <ChatAssistant context={{ 
//              page: "Report Analysis", 
//              score: processedData.score, 
//              topic: topicName 
//          }} />
//       </div>

//     </div>
//   );
// };

// export default ResumeReport;
//------------------------------------------------------------------------------------------------------------------------
//without Executive Summary
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
//-----------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------
// import React, { useEffect, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import ChatAssistant from '../components/ChatAssistant'; 

// const ResumeReport = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // --- 1. SAFE DATA EXTRACTION & FALLBACKS ---
//   const state = location.state || {};
  
//   // Raw Data Sources
//   const rawReport = state.report || state.feedback || {};
//   const rawAnswers = state.answers || []; // This is the User's Source of Truth (e.g., 20 items)
//   const rawReviews = rawReport.question_reviews || []; // This is the API's Response (e.g., maybe 18 items)
//   const integrity = state.integrity || { score: 100, count: 0 };
//   const topicName = state.topic || "Resume Audit";

//   // --- 2. FORENSIC DATA RECONCILER (STRICT MERGE PROTOCOL) ---
//   const processedData = useMemo(() => {
//     const userCount = rawAnswers.length;
//     const apiCount = rawReviews.length;

//     // A. Integrity Log
//     if (userCount !== apiCount) {
//       console.warn(`⚠️ DATA MISMATCH: User answered ${userCount}, API returned ${apiCount}. Engaging Strict Merge.`);
//     }

//     // B. The "Strict Merge" Loop
//     // We iterate over rawAnswers because we MUST show every question the user answered.
//     const mergedReviews = rawAnswers.map((answerEntry, index) => {
//       // Try to find a matching review from the API based on index
//       // (Assuming sequential processing by the backend)
//       const aiReview = rawReviews[index];

//       if (aiReview) {
//         // --- CRITICAL FIX HERE ---
//         // We do NOT return 'aiReview' directly. 
//         // We create a new object that prioritizes the USER'S local text 
//         // to prevent API glitches from hiding the question/answer.
//         return {
//           question: answerEntry.question,     // FORCE Local Question Text
//           user_answer: answerEntry.answer,    // FORCE Local User Answer
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
//     const doc = new jsPDF('p', 'mm', 'a4');
    
//     // Page Config
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 15;
//     const contentWidth = pageWidth - (margin * 2);
//     let cursorY = margin + 10;

//     const drawPageBorder = () => {
//         doc.setDrawColor(200);
//         doc.setLineWidth(0.5);
//         doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
//     };

//     const checkPageBreak = (heightNeeded) => {
//       if (cursorY + heightNeeded > pageHeight - margin - 20) {
//         doc.addPage();
//         drawPageBorder();
//         cursorY = margin + 15;
//         return true;
//       }
//       return false;
//     };

//     const addWrappedText = (text, fontSize = 11, fontType = 'normal', color = [60, 60, 60]) => {
//         doc.setFontSize(fontSize);
//         doc.setFont('helvetica', fontType);
//         doc.setTextColor(...color);
//         const lines = doc.splitTextToSize(text || "N/A", contentWidth - 10);
//         const blockHeight = lines.length * (fontSize * 0.4) + 4;
//         checkPageBreak(blockHeight);
//         doc.text(lines, margin + 5, cursorY);
//         cursorY += blockHeight;
//     };

//     // --- PAGE 1: EXECUTIVE SUMMARY ---
//     drawPageBorder();

//     // 1. Header
//     doc.setFontSize(22);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(33, 33, 33);
//     doc.text(`${topicName.toUpperCase()} REPORT`, margin + 5, cursorY);
//     cursorY += 10;

//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.setTextColor(100);
//     doc.text(`SESSION ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, margin + 5, cursorY);
//     doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - margin - 35, cursorY);
//     cursorY += 15;

//     // 2. Scorecard Box
//     doc.setFillColor(248, 250, 252);
//     doc.setDrawColor(226, 232, 240);
//     doc.roundedRect(margin + 5, cursorY, contentWidth - 10, 40, 3, 3, 'FD');
    
//     // Score
//     doc.setFontSize(32);
//     doc.setFont('helvetica', 'bold');
//     const scoreColor = processedData.score >= 80 ? [34, 197, 94] : processedData.score >= 50 ? [234, 179, 8] : [239, 68, 68];
//     doc.setTextColor(...scoreColor);
//     doc.text(`${processedData.score}`, margin + 15, cursorY + 20);
//     doc.setFontSize(12);
//     doc.text("/ 100", margin + 35, cursorY + 20);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text("COMPETENCY SCORE", margin + 15, cursorY + 30);

//     // Integrity
//     doc.setFontSize(14);
//     doc.setTextColor(integrity.count > 0 ? 220 : 34, integrity.count > 0 ? 38 : 197, 60);
//     doc.text(integrity.count > 0 ? "FLAGGED" : "VERIFIED", pageWidth - margin - 40, cursorY + 15, { align: 'right' });
//     doc.setFontSize(10);
//     doc.setTextColor(80);
//     doc.text("INTEGRITY STATUS", pageWidth - margin - 40, cursorY + 25, { align: 'right' });
    
//     cursorY += 50;

//     // 3. Executive Summary
//     // doc.setFontSize(14);
//     // doc.setFont('helvetica', 'bold');
//     // doc.setTextColor(0);
//     // doc.text("EXECUTIVE SUMMARY", margin + 5, cursorY);
//     // cursorY += 8;
//     // addWrappedText(processedData.summary, 11, 'normal', [50, 50, 50]);
//     // cursorY += 10;

//     // 4. Silent Killers (Red Flags)
//     if (processedData.silent_killers && processedData.silent_killers.length > 0) {
//         checkPageBreak(40);
//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(220, 38, 38);
//         doc.text("CRITICAL RED FLAGS", margin + 5, cursorY);
//         cursorY += 8;

//         processedData.silent_killers.forEach(flag => {
//             doc.setFillColor(254, 242, 242);
//             doc.rect(margin + 5, cursorY, 2, 2, 'F'); // Bullet
//             addWrappedText(`•  ${flag}`, 11, 'normal', [185, 28, 28]);
//         });
//         cursorY += 10;
//     }

//     // 5. Roadmap
//     if (processedData.roadmap) {
//         checkPageBreak(40);
//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(37, 99, 235);
//         doc.text("IMPROVEMENT ROADMAP", margin + 5, cursorY);
//         cursorY += 8;
//         addWrappedText(processedData.roadmap, 11, 'normal', [30, 58, 138]);
//         cursorY += 10;
//     }

//     // --- PAGE 2+: DETAILED Q&A ---
//     doc.addPage();
//     drawPageBorder();
//     cursorY = margin + 15;

//     doc.setFontSize(16);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(0);
//     doc.text("DETAILED FORENSIC ANALYSIS", margin + 5, cursorY);
//     cursorY += 15;

//     processedData.question_reviews.forEach((item, index) => {
//         checkPageBreak(60);

//         // Question Box
//         doc.setFillColor(241, 245, 249);
//         doc.rect(margin + 2, cursorY, contentWidth - 4, 10, 'F');
//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'bold');
//         doc.setTextColor(51, 65, 85);
        
//         // Use the safely merged question text
//         const qText = `Q${index + 1}: ${item.question ? item.question.substring(0, 80) : "Question Text Missing"}...`;
//         doc.text(qText, margin + 5, cursorY + 6);
        
//         doc.text(`Score: ${item.score}/10`, pageWidth - margin - 25, cursorY + 6);
//         cursorY += 15;

//         // Content Table
//         autoTable(doc, {
//             startY: cursorY,
//             margin: { left: margin + 2, right: margin + 2 },
//             tableWidth: contentWidth - 4,
//             head: [['Candidate Response', 'Forensic Analysis & Ideal Approach']],
//             body: [[
//                 item.user_answer || "No Answer",
//                 `ANALYSIS: ${item.feedback}\n\nIDEAL: ${item.ideal_answer}`
//             ]],
//             theme: 'grid',
//             headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 9, fontStyle: 'bold' },
//             bodyStyles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
//             columnStyles: { 
//                 0: { cellWidth: (contentWidth - 4) * 0.4 }, 
//                 1: { cellWidth: (contentWidth - 4) * 0.6 } 
//             },
//             didDrawPage: () => drawPageBorder(),
//         });

//         cursorY = doc.lastAutoTable.finalY + 10;
//     });

//     doc.save(`Resume_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center relative font-sans">
      
//       {/* NAVIGATION BAR */}
//       <div className="w-full max-w-5xl flex justify-between items-center mb-8">
//         <button 
//             onClick={() => navigate('/')} 
//             className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2 transition-colors"
//         >
//             <i className="fa-solid fa-arrow-left"></i> Dashboard
//         </button>
//         <button 
//             onClick={handleDownload}
//             className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 hover:scale-105"
//         >
//             <i className="fa-solid fa-file-pdf"></i> Download Official Report
//         </button>
//       </div>

//       {/* REPORT PREVIEW CARD */}
//       <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-none md:rounded-lg p-8 md:p-12 border border-slate-200 relative">
            
//             {/* 1. HEADER */}
//             <div className="border-b border-gray-200 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start gap-6">
//                 <div>
//                     <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">
//                         {topicName} <span className="text-blue-600">AUDIT</span>
//                     </h1>
//                     <div className="flex flex-col gap-1">
//                         <p className="text-gray-400 font-mono text-xs font-bold tracking-widest">
//                             SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
//                         </p>
//                         <p className="text-gray-400 font-mono text-xs font-bold tracking-widest">
//                             DATE: {new Date().toLocaleDateString()}
//                         </p>
//                     </div>
//                 </div>
//                 <div className="text-right">
//                     <div className={`text-6xl font-black tracking-tighter ${
//                         processedData.score >= 80 ? 'text-green-600' : 
//                         processedData.score >= 50 ? 'text-yellow-500' : 'text-red-600'
//                     }`}>
//                         {processedData.score}<span className="text-2xl text-gray-300">/100</span>
//                     </div>
//                     <p className="font-bold text-slate-400 text-xs uppercase tracking-widest mt-1">Competency Score</p>
//                 </div>
//             </div>

//             {/* 2. INTEGRITY STATUS */}
//             <div className={`mb-10 p-4 rounded-lg border flex items-center gap-4 ${integrity.count > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
//                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm ${integrity.count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
//                     <i className={`fa-solid ${integrity.count > 0 ? 'fa-triangle-exclamation' : 'fa-shield-check'}`}></i>
//                 </div>
//                 <div>
//                     <h3 className={`font-bold uppercase text-sm ${integrity.count > 0 ? 'text-red-700' : 'text-green-700'}`}>
//                         Integrity Status: {integrity.count > 0 ? "Flagged" : "Verified"}
//                     </h3>
//                     <p className="text-slate-600 text-sm mt-1">
//                         {integrity.count > 0 
//                         ? `Focus lost ${integrity.count} times. Integrity Score: ${integrity.score}%`
//                         : "Candidate maintained verified focus throughout the session."}
//                     </p>
//                 </div>
//             </div>

//             {/* 3. EXECUTIVE SUMMARY */}
//             {/* <div className="mb-12">
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 border-b border-gray-100 pb-2">
//                     Executive Summary
//                 </h3>
//                 <p className="text-lg text-slate-700 leading-relaxed font-medium">
//                     {processedData.summary}
//                 </p>
//             </div> */}

//             {/* 4. ANALYSIS GRID (RED FLAGS & ROADMAP) */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                
//                 {/* Red Flags */}
//                 <div className="bg-red-50/50 p-6 rounded-xl border border-red-100">
//                     <h3 className="font-bold text-red-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
//                         <i className="fa-solid fa-flag"></i> Resume Red Flags
//                     </h3>
//                     <ul className="space-y-3">
//                         {processedData.silent_killers && processedData.silent_killers.length > 0 ? (
//                             processedData.silent_killers.map((killer, i) => (
//                                 <li key={i} className="flex items-start gap-3">
//                                     <i className="fa-solid fa-xmark text-red-500 mt-1.5 text-sm"></i>
//                                     <span className="text-slate-800 text-sm font-medium leading-snug">{killer}</span>
//                                 </li>
//                             ))
//                         ) : (
//                             <li className="flex items-center gap-2 text-green-600 text-sm font-bold">
//                                 <i className="fa-solid fa-check-circle"></i> No critical flags detected.
//                             </li>
//                         )}
//                     </ul>
//                 </div>

//                 {/* Roadmap */}
//                 <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
//                     <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
//                         <i className="fa-solid fa-map"></i> Improvement Roadmap
//                     </h3>
//                     <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
//                         {processedData.roadmap || "No specific roadmap generated."}
//                     </div>
//                 </div>
//             </div>

//             {/* 5. QUESTION BREAKDOWN */}
//             <div>
//                 <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-6 border-b border-gray-100 pb-2">
//                     Forensic Interrogation Analysis ({processedData.question_reviews.length} Qs)
//                 </h3>
//                 <div className="space-y-8">
//                     {processedData.question_reviews.map((review, i) => (
//                         <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
//                             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
//                                 <h4 className="font-bold text-slate-800 text-sm">Query {i + 1}</h4>
//                                 <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
//                                     review.score >= 8 ? 'bg-green-100 text-green-700' : 
//                                     review.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
//                                 }`}>
//                                     Rating: {review.score}/10
//                                 </span>
//                             </div>
//                             <div className="p-6">
//                                 {/* Use safely merged question text */}
//                                 <p className="text-slate-900 font-bold text-md mb-6">{review.question}</p>
                                
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     {/* User Answer */}
//                                     <div>
//                                         <div className="text-xs font-bold text-slate-400 uppercase mb-2">Candidate Response</div>
//                                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-600 text-sm leading-relaxed font-mono">
//                                             {review.user_answer || <span className="text-gray-400 italic">No response captured.</span>}
//                                         </div>
//                                     </div>
                                    
//                                     {/* Ideal Answer */}
//                                     <div>
//                                         <div className="text-xs font-bold text-blue-500 uppercase mb-2">Ideal Technical Response</div>
//                                         <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-slate-800 text-sm leading-relaxed font-mono">
//                                             {review.ideal_answer}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Feedback */}
//                                 <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3">
//                                     <i className="fa-solid fa-user-doctor text-purple-500 mt-1"></i>
//                                     <p className="text-slate-500 text-sm italic font-medium">"{review.feedback}"</p>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//       </div>

//       {/* FLOATING CHAT ASSISTANT */}
//       <div className="fixed bottom-6 right-6 z-50">
//          <ChatAssistant context={{ 
//              page: "Report Analysis", 
//              score: processedData.score, 
//              topic: topicName 
//          }} />
//       </div>

//     </div>
//   );
// };

// export default ResumeReport;
//-----------------------------------------------------------------------------------------------------------------
// 13 feb resume audit audit
import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ChatAssistant from '../components/ChatAssistant'; 

const ResumeReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- 1. SAFE DATA EXTRACTION & FALLBACKS ---
  const state = location.state || {};
  
  // --- DETECT PROFESSIONAL FIELD ---
  // Prioritizes specific domain selection, falls back to generic topic or "Professional".
  // Removes underscores and standardizes capitalization.
  const rawField = state.selectedDomain || state.domain || state.topic || "Professional Evaluation";
  const selectedField = rawField.replace(/_/g, " ").toUpperCase();

  // Raw Data Sources
  const rawReport = state.report || state.feedback || {};
  const rawAnswers = state.answers || []; // This is the User's Source of Truth (e.g., 20 items)
  const rawReviews = rawReport.question_reviews || []; // This is the API's Response (e.g., maybe 18 items)
  const integrity = state.integrity || { score: 100, count: 0 };

  // --- HELPER: FORMAT TEXT TO BULLETS OR PARAGRAPHS ---
  const renderFormattedText = (text, isBold = false) => {
    if (!text) return <span className="text-gray-400 italic">No data provided.</span>;

    // Split by newlines to detect if it's a list or paragraphs
    const lines = text.split(/\n/).filter(line => line.trim().length > 0);

    if (lines.length > 1) {
        return (
            <ul className={`list-disc ml-4 space-y-1 ${isBold ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                {lines.map((line, idx) => (
                    <li key={idx} className="pl-1">
                        {line.replace(/^-|\*|•/, '').trim()}
                    </li>
                ))}
            </ul>
        );
    }
    
    // Single line text
    return <p className={`${isBold ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>{text}</p>;
  };

  // --- 2. FORENSIC DATA RECONCILER (STRICT MERGE PROTOCOL) ---
  const processedData = useMemo(() => {
    const userCount = rawAnswers.length;
    const apiCount = rawReviews.length;

    // A. Integrity Log
    if (userCount !== apiCount) {
      console.warn(`⚠️ DATA MISMATCH: User answered ${userCount}, API returned ${apiCount}. Engaging Strict Merge.`);
    }

    // B. The "Strict Merge" Loop
    // We iterate over rawAnswers because we MUST show every question the user answered.
    const mergedReviews = rawAnswers.map((answerEntry, index) => {
      // Try to find a matching review from the API based on index
      // (Assuming sequential processing by the backend)
      const aiReview = rawReviews[index];

      if (aiReview) {
        // --- CRITICAL FIX HERE ---
        // We do NOT return 'aiReview' directly. 
        // We create a new object that prioritizes the USER'S local text 
        // to prevent API glitches from hiding the question/answer.
        return {
          question: answerEntry.question,     // FORCE Local Question Text
          user_answer: answerEntry.answer,    // FORCE Local User Answer
          score: aiReview.score || 0,         // Use API Score
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
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Page Config
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let cursorY = margin + 10;

    const drawPageBorder = () => {
        doc.setDrawColor(200);
        doc.setLineWidth(0.5);
        doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
    };

    const checkPageBreak = (heightNeeded) => {
      if (cursorY + heightNeeded > pageHeight - margin - 20) {
        doc.addPage();
        drawPageBorder();
        cursorY = margin + 15;
        return true;
      }
      return false;
    };

    const addWrappedText = (text, fontSize = 11, fontType = 'normal', color = [60, 60, 60]) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontType);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text || "N/A", contentWidth - 10);
        const blockHeight = lines.length * (fontSize * 0.4) + 4;
        checkPageBreak(blockHeight);
        doc.text(lines, margin + 5, cursorY);
        cursorY += blockHeight;
    };

    // --- PAGE 1: EXECUTIVE SUMMARY ---
    drawPageBorder();

    // 1. Header - DYNAMIC FIELD (REPLACES GENERIC "RESUME AUDIT")
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 33, 33);
    doc.text(`${selectedField} REPORT`, margin + 5, cursorY);
    cursorY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`SESSION ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, margin + 5, cursorY);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - margin - 35, cursorY);
    cursorY += 15;

    // 2. Scorecard Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin + 5, cursorY, contentWidth - 10, 40, 3, 3, 'FD');
    
    // Score
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    const scoreColor = processedData.score >= 80 ? [34, 197, 94] : processedData.score >= 50 ? [234, 179, 8] : [239, 68, 68];
    doc.setTextColor(...scoreColor);
    doc.text(`${processedData.score}`, margin + 15, cursorY + 20);
    doc.setFontSize(12);
    doc.text("/ 100", margin + 35, cursorY + 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("COMPETENCY SCORE", margin + 15, cursorY + 30);

    // Integrity
    doc.setFontSize(14);
    doc.setTextColor(integrity.count > 0 ? 220 : 34, integrity.count > 0 ? 38 : 197, 60);
    doc.text(integrity.count > 0 ? "FLAGGED" : "VERIFIED", pageWidth - margin - 40, cursorY + 15, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text("SESSION INTEGRITY", pageWidth - margin - 40, cursorY + 25, { align: 'right' });
    
    cursorY += 50;

    // 4. Silent Killers (Red Flags)
    if (processedData.silent_killers && processedData.silent_killers.length > 0) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
        doc.text(`CRITICAL FLAGS (${selectedField} STANDARDS)`, margin + 5, cursorY);
        cursorY += 8;

        processedData.silent_killers.forEach(flag => {
            doc.setFillColor(254, 242, 242);
            doc.rect(margin + 5, cursorY, 2, 2, 'F'); // Bullet
            addWrappedText(`•  ${flag}`, 11, 'normal', [185, 28, 28]);
        });
        cursorY += 10;
    }

    // 5. Roadmap
    if (processedData.roadmap) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text("OPTIMIZATION ROADMAP", margin + 5, cursorY);
        cursorY += 8;
        addWrappedText(processedData.roadmap, 11, 'normal', [30, 58, 138]);
        cursorY += 10;
    }

    // --- PAGE 2+: DETAILED Q&A ---
    doc.addPage();
    drawPageBorder();
    cursorY = margin + 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`DETAILED ANALYSIS: ${selectedField}`, margin + 5, cursorY);
    cursorY += 15;

    processedData.question_reviews.forEach((item, index) => {
        checkPageBreak(60);

        // Question Box
        doc.setFillColor(241, 245, 249);
        doc.rect(margin + 2, cursorY, contentWidth - 4, 10, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        
        // Use the safely merged question text
        const qText = `Q${index + 1}: ${item.question ? item.question.substring(0, 80) : "Question Text Missing"}...`;
        doc.text(qText, margin + 5, cursorY + 6);
        
        doc.text(`Score: ${item.score}/10`, pageWidth - margin - 25, cursorY + 6);
        cursorY += 15;

        // Content Table
        autoTable(doc, {
            startY: cursorY,
            margin: { left: margin + 2, right: margin + 2 },
            tableWidth: contentWidth - 4,
            head: [['Candidate Response', 'Professional Audit & Ideal Approach']],
            body: [[
                item.user_answer || "No Answer",
                // Format the ideal answer to look like bullets in PDF if it has newlines
                `AUDIT: ${item.feedback}\n\nIDEAL:\n${item.ideal_answer.replace(/\n/g, '\n• ')}`
            ]],
            theme: 'grid',
            headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
            columnStyles: { 
                0: { cellWidth: (contentWidth - 4) * 0.4 }, 
                1: { cellWidth: (contentWidth - 4) * 0.6 } 
            },
            didDrawPage: () => drawPageBorder(),
        });

        cursorY = doc.lastAutoTable.finalY + 10;
    });

    const filename = `${selectedField.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center relative font-sans">
      
      {/* NAVIGATION BAR */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <button 
            onClick={() => navigate('/')} 
            className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2 transition-colors"
        >
            <i className="fa-solid fa-arrow-left"></i> Dashboard
        </button>
        <button 
            onClick={handleDownload}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 hover:scale-105"
        >
            <i className="fa-solid fa-file-pdf"></i> Download Official Report
        </button>
      </div>

      {/* REPORT PREVIEW CARD */}
      <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-none md:rounded-lg p-8 md:p-12 border border-slate-200 relative">
            
            {/* 1. HEADER - DYNAMIC */}
            <div className="border-b border-gray-200 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                        {selectedField}
                    </h1>
                    <h2 className="text-xl font-bold text-blue-600 uppercase tracking-wide">
                        ASSESSMENT REPORT
                    </h2>
                    <div className="flex flex-col gap-1 mt-4">
                        <p className="text-gray-400 font-mono text-xs font-bold tracking-widest">
                            SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </p>
                        <p className="text-gray-400 font-mono text-xs font-bold tracking-widest">
                            DATE: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-6xl font-black tracking-tighter ${
                        processedData.score >= 80 ? 'text-green-600' : 
                        processedData.score >= 50 ? 'text-yellow-500' : 'text-red-600'
                    }`}>
                        {processedData.score}<span className="text-2xl text-gray-300">/100</span>
                    </div>
                    <p className="font-bold text-slate-400 text-xs uppercase tracking-widest mt-1">Competency Score</p>
                </div>
            </div>

            {/* 2. INTEGRITY STATUS */}
            <div className={`mb-10 p-4 rounded-lg border flex items-center gap-4 ${integrity.count > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm ${integrity.count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <i className={`fa-solid ${integrity.count > 0 ? 'fa-triangle-exclamation' : 'fa-shield-check'}`}></i>
                </div>
                <div>
                    <h3 className={`font-bold uppercase text-sm ${integrity.count > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        Integrity Status: {integrity.count > 0 ? "Flagged" : "Verified"}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
                        {integrity.count > 0 
                        ? `Focus lost ${integrity.count} times. Integrity Score: ${integrity.score}%`
                        : "Candidate maintained verified focus throughout the session."}
                    </p>
                </div>
            </div>

            {/* 3. EXECUTIVE SUMMARY */}
            <div className="mb-12">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 border-b border-gray-100 pb-2">
                    Executive Summary
                </h3>
                <p className="text-lg text-slate-700 leading-relaxed font-medium">
                    {processedData.summary}
                </p>
            </div>

            {/* 4. ANALYSIS GRID (RED FLAGS & ROADMAP) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                
                {/* Red Flags */}
                <div className="bg-red-50/50 p-6 rounded-xl border border-red-100">
                    <h3 className="font-bold text-red-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-flag"></i> {selectedField} Red Flags
                    </h3>
                    <ul className="space-y-3">
                        {processedData.silent_killers && processedData.silent_killers.length > 0 ? (
                            processedData.silent_killers.map((killer, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <i className="fa-solid fa-xmark text-red-500 mt-1.5 text-sm"></i>
                                    <span className="text-slate-800 text-sm font-medium leading-snug">{killer}</span>
                                </li>
                            ))
                        ) : (
                            <li className="flex items-center gap-2 text-green-600 text-sm font-bold">
                                <i className="fa-solid fa-check-circle"></i> No critical flags detected.
                            </li>
                        )}
                    </ul>
                </div>

                {/* Roadmap */}
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-map"></i> Optimization Roadmap
                    </h3>
                    <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {renderFormattedText(processedData.roadmap, false)}
                    </div>
                </div>
            </div>

            {/* 5. QUESTION BREAKDOWN */}
            <div>
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-6 border-b border-gray-100 pb-2">
                    Forensic Analysis: {selectedField} ({processedData.question_reviews.length} Qs)
                </h3>
                <div className="space-y-8">
                    {processedData.question_reviews.map((review, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 text-sm">Query {i + 1}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                    review.score >= 8 ? 'bg-green-100 text-green-700' : 
                                    review.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    Rating: {review.score}/10
                                </span>
                            </div>
                            <div className="p-6">
                                {/* Use safely merged question text */}
                                <p className="text-slate-900 font-bold text-md mb-6">{review.question}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* User Answer */}
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Candidate Response</div>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-600 text-sm leading-relaxed font-mono">
                                            {renderFormattedText(review.user_answer || "No response captured.", true)}
                                        </div>
                                    </div>
                                    
                                    {/* Ideal Answer */}
                                    <div>
                                        <div className="text-xs font-bold text-blue-500 uppercase mb-2">Ideal Technical Response</div>
                                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-slate-800 text-sm leading-relaxed font-mono">
                                            {renderFormattedText(review.ideal_answer, true)}
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback */}
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3">
                                    <i className="fa-solid fa-magnifying-glass-chart text-purple-500 mt-1"></i>
                                    <div className="text-slate-500 text-sm italic font-medium">
                                        {renderFormattedText(review.feedback, false)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
      </div>

      {/* FLOATING CHAT ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50">
         <ChatAssistant context={{ 
             page: "Report Analysis", 
             score: processedData.score, 
             topic: selectedField 
         }} />
      </div>

    </div>
  );
};

export default ResumeReport;