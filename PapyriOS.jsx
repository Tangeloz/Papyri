import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, CheckCircle, FileText, Users, UploadCloud, 
  ChevronRight, Search, MoreHorizontal, ArrowLeft, Calculator, 
  Scale, Send, Bell, Settings, X, Tablet, PenTool, LogOut, 
  ChevronLeft, Folder, Grid, BarChart2, BookOpen, Clock, AlertCircle,
  Download, Filter, Printer, Menu, Activity, MessageSquare
} from 'lucide-react';

// --- MOCK DATA ---
const CLASSES = {
  PHYSICS: 'Physics 12',
  LAW: 'Law 12'
};

const RESOURCES = {
  [CLASSES.PHYSICS]: [
    { id: 'p1', title: 'Unit 3 Test: Dynamics', type: 'Test', status: 'uncollected', collected: 0, total: 30 },
    { id: 'p2', title: 'Lab 4: Friction Coefficients', type: 'Lab', status: 'collected', collected: 30, total: 30 },
    { id: 'p3', title: 'Homework 3.2: Vectors', type: 'Assignment', status: 'collected', collected: 30, total: 30 },
  ],
  [CLASSES.LAW]: [
    { id: 'l1', title: 'Case Study: R v. Parks', type: 'Assignment', status: 'uncollected', collected: 0, total: 28 },
    { id: 'l2', title: 'Charter Rights Essay', type: 'Essay', status: 'collected', collected: 28, total: 28 },
    { id: 'l3', title: 'Criminal Code Reading', type: 'Reading', status: 'collected', collected: 28, total: 28 },
  ]
};

const INITIAL_STUDENTS = [
  { id: 1, name: "Doe, John", studentId: "49201", assignments: [85, 88, 92], unit3Test: null, lawCase: null },
  { id: 2, name: "Smith, Sarah", studentId: "49202", assignments: [92, 94, 90], unit3Test: 95, lawCase: 92 },
  { id: 3, name: "Ross, Mike", studentId: "49203", assignments: [78, 82, 85], unit3Test: 80, lawCase: 78 },
  { id: 4, name: "Pearson, Jessica", studentId: "49204", assignments: [95, 98, 99], unit3Test: 96, lawCase: 98 },
  { id: 5, name: "Zane, Rachel", studentId: "49205", assignments: [88, 90, 89], unit3Test: 91, lawCase: 90 },
  { id: 6, name: "Litt, Louis", studentId: "49206", assignments: [72, 75, 78], unit3Test: 74, lawCase: 85 },
  { id: 7, name: "Specter, Harvey", studentId: "49207", assignments: [98, 97, 96], unit3Test: 99, lawCase: 97 },
  { id: 8, name: "Bennett, Katrina", studentId: "49208", assignments: [82, 85, 84], unit3Test: 83, lawCase: 82 },
];

const LAW_QUESTIONS = {
  q1: 'Identify the main legal issue regarding the Actus Reus in this case.',
  q2: 'Explain why the trial judge acquitted Parks initially.',
  q3: 'How does the concept of "continuing danger" apply here?',
  q4: 'Analyze the Supreme Court\'s decision on the Crown\'s appeal.',
  q5: 'What precedent does this case set for future sleepwalking defenses?'
};

const LAW_KEYWORDS = {
  q1: ['Actus Reus', 'Voluntariness', 'Sleepwalking', 'Conscious Will'],
  q2: ['Automatism', 'Disease of the Mind', 'Acquittal', 'Unconscious'],
  q3: ['Internal Cause', 'Recurrence', 'Public Safety', 'Continuing Danger'],
  q4: ['New Trial', 'Insane Automatism', 'Burden of Proof', 'Supreme Court'],
  q5: ['Non-insane Automatism', 'Precedent', 'Medical Evidence', 'Policy']
};

const PaperTeacherApp = () => {
  // --- GLOBAL STATE ---
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, grading, gradebook, student
  const [selectedClass, setSelectedClass] = useState(CLASSES.PHYSICS);
  const [distributedFile, setDistributedFile] = useState(null); // null, 'p1', 'l1'
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, complete
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // NEW: Sidebar state

  // Student State
  const [studentViewMode, setStudentViewMode] = useState('home'); // home, folder, assignment, success
  const [activeFolder, setActiveFolder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  
  // Student Inputs
  const [physicsAnswers, setPhysicsAnswers] = useState({ q1: null, q2: null, q3: '' });
  const [lawAnswers, setLawAnswers] = useState({ 
    q1: 'The main legal issue is whether the sleepwalking defense constitutes non-insane automatism.',
    q2: '', q3: '', q4: '', q5: '' 
  });

  // Teacher Grading State
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [manualScore, setManualScore] = useState('');
  const [gradingSelectedStudentId, setGradingSelectedStudentId] = useState(null);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (currentView === 'student' && studentViewMode === 'assignment' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentView, studentViewMode, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- HELPERS ---
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUploadTrigger = (fileId = null) => {
    if (uploadStatus !== 'idle') return;
    setUploadStatus('uploading');
    
    // Default to the first uncollected file if none specified (for click interaction)
    const targetFile = fileId || RESOURCES[selectedClass].find(r => r.status === 'uncollected')?.id;

    setTimeout(() => {
      setUploadStatus('complete');
      setDistributedFile(targetFile);
      triggerToast(`Distributed to ${selectedClass === CLASSES.PHYSICS ? '30' : '28'} devices.`);
    }, 2000); // Increased delay slightly to show off the loading bar
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("fileId");
    if (!fileId) return;
    handleUploadTrigger(fileId);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDragStart = (e, fileId) => {
    e.dataTransfer.setData("fileId", fileId);
  };

  const submitGrade = (scoreOverride = null) => {
    // Accept direct score override for quick-click grading (Physics)
    const scoreInt = typeof scoreOverride === 'number' ? scoreOverride : parseInt(manualScore || 0);
    
    setStudents(prev => prev.map(s => {
      if (s.id !== 1) return s;
      // Fixed Calculation: 9 marks for MCQ + 5 for Written = 14 Total. Converted to Percentage.
      if (distributedFile === 'p1') {
        const percentage = Math.round(((9 + scoreInt) / 14) * 100);
        return { ...s, unit3Test: percentage, status: "Graded" }; 
      }
      if (distributedFile === 'l1') return { ...s, lawCase: scoreInt, status: "Graded" };
      return s;
    }));
    
    triggerToast("Grade synced to Master Gradebook.");
    setCurrentView('gradebook');
    setGradingSelectedStudentId(null);
  };

  const calculateAverage = (student) => {
    let grades = [...student.assignments];
    // Use !== null to correctly handle 0 scores
    if (student.unit3Test !== null) grades.push(student.unit3Test);
    if (student.lawCase !== null) grades.push(student.lawCase);
    if (grades.length === 0) return 0;
    return Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);
  };

  // --- COMPONENTS ---

  const Toast = () => (
    <div className={`fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform z-[100] ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
      <div className="bg-green-500 rounded-full p-1">
        <CheckCircle size={16} className="text-white" />
      </div>
      <span className="font-medium">{toastMessage}</span>
    </div>
  );

  // --- STUDENT TABLET OS ---
  // Changed from a component to a function to prevent re-rendering/focus loss on input
  const renderStudentOS = () => {
    // 4. SUCCESS SCREEN
    if (studentViewMode === 'success') {
        return (
            <div className="bg-[#f8f6f1] h-full flex flex-col items-center justify-center font-sans text-slate-800 animate-fade-in text-center p-12">
                <div className="w-24 h-24 border-4 border-slate-900 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={48} className="text-slate-900" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Handed In</h2>
                <p className="text-slate-600 font-serif text-xl mb-12">Your assignment has been securely sent to Mr. Specter's grading queue.</p>
                
                <button 
                    onClick={() => {
                        setStudentViewMode('home'); 
                        setCurrentView('grading'); // Return to Teacher Grading View
                    }}
                    className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-3 shadow-xl"
                >
                    <LogOut size={20} />
                    Return to Teacher View
                </button>
            </div>
        )
    }

    // 1. HOME SCREEN (GRID)
    if (studentViewMode === 'home') {
      return (
        <div className="bg-[#f8f6f1] h-full flex flex-col font-sans text-slate-800">
           {/* E-ink Header */}
           <div className="px-8 py-4 border-b border-slate-300 flex justify-between items-center text-xs font-mono uppercase tracking-widest text-slate-500">
              <span>John Doe</span>
              <span className="font-bold text-slate-900">My Files</span>
              <span>10:42 AM</span>
           </div>
           
           <div className="flex-1 p-10 flex flex-col justify-center">
             <h2 className="font-serif text-3xl mb-8 text-slate-900">Semester 1</h2>
             <div className="grid grid-cols-2 gap-8">
               {['Physics 12', 'Law 12', 'English 11', 'Band 10'].map((subject) => (
                 <button 
                   key={subject}
                   onClick={() => { setActiveFolder(subject); setStudentViewMode('folder'); }}
                   className="aspect-[4/3] bg-white border-2 border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-6 hover:border-slate-900 hover:shadow-xl transition-all group relative overflow-hidden"
                 >
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={20} className="text-slate-400" />
                   </div>
                   <Folder size={64} className="text-slate-300 group-hover:text-slate-900 transition-colors duration-300" strokeWidth={1.5} />
                   <div className="text-center">
                      <span className="font-serif text-2xl font-medium block">{subject}</span>
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-2 block">
                        {(subject === CLASSES.PHYSICS && distributedFile === 'p1') || (subject === CLASSES.LAW && distributedFile === 'l1') 
                            ? '1 New File' 
                            : 'Up to date'}
                      </span>
                   </div>
                   {((subject === CLASSES.PHYSICS && distributedFile === 'p1') || (subject === CLASSES.LAW && distributedFile === 'l1')) && (
                      <div className="absolute top-4 left-4 w-3 h-3 bg-slate-900 rounded-full animate-pulse"></div>
                   )}
                 </button>
               ))}
             </div>
           </div>
        </div>
      );
    }

    // 2. FOLDER VIEW
    if (studentViewMode === 'folder') {
       const grades = students[0]; // John Doe
       const avg = calculateAverage(grades);
       const isCurrentClassPhysics = activeFolder === CLASSES.PHYSICS;
       const isCurrentClassLaw = activeFolder === CLASSES.LAW;
       
       const hasNewFile = (isCurrentClassPhysics && distributedFile === 'p1') || (isCurrentClassLaw && distributedFile === 'l1');

       return (
         <div className="bg-[#f8f6f1] h-full flex flex-col font-sans text-slate-800 animate-fade-in">
            <div className="px-8 py-5 border-b border-slate-300 flex justify-between items-center bg-white sticky top-0 z-10">
              <button onClick={() => setStudentViewMode('home')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 uppercase text-xs font-bold tracking-widest transition-colors">
                <ChevronLeft size={16} /> All Classes
              </button>
              <span className="font-serif text-xl font-bold">{activeFolder}</span>
              <div className="w-20 text-right font-mono text-xs text-slate-400">Folder 01</div> 
            </div>

            <div className="p-8 flex gap-8 h-full overflow-hidden">
               {/* File List */}
               <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 sticky top-0 bg-[#f8f6f1] py-2 z-10">Inbox</h3>
                  
                  {/* The Distributed File (if matches folder) */}
                  {hasNewFile && (
                    <button 
                      onClick={() => { setStudentViewMode('assignment'); setTimeLeft(2700); }}
                      className="w-full text-left p-6 bg-white border-2 border-slate-900 rounded-xl shadow-lg flex justify-between items-center group hover:scale-[1.02] transition-transform duration-300"
                    >
                       <div className="flex items-start gap-4">
                         <div className="mt-1 p-2 bg-slate-900 text-white rounded-lg">
                            <FileText size={24} />
                         </div>
                         <div>
                            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">Unopened</span>
                            <h4 className="font-serif text-xl font-bold group-hover:underline decoration-2 underline-offset-4">
                              {isCurrentClassPhysics ? 'Unit 3 Test: Dynamics' : 'Case Study: R v. Parks'}
                            </h4>
                            <p className="text-slate-500 text-sm mt-1">Due Today • 10:50 AM</p>
                         </div>
                       </div>
                       <ChevronRight className="text-slate-300 group-hover:text-slate-900" />
                    </button>
                  )}

                  {!hasNewFile && (
                      <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-300 rounded-xl">
                          <p>No new assignments distributed.</p>
                      </div>
                  )}

                  {/* Past Graded Work */}
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 mt-8 sticky top-0 bg-[#f8f6f1] py-2">Archive</h3>
                  {RESOURCES[activeFolder === CLASSES.PHYSICS ? CLASSES.PHYSICS : CLASSES.LAW]
                    .filter(r => r.status === 'collected')
                    .map((res, i) => (
                    <div key={res.id} className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
                       <div className="flex items-center gap-3">
                           <CheckCircle size={18} className="text-slate-300" />
                           <span className="font-serif text-lg">{res.title}</span>
                       </div>
                       <span className="font-mono font-bold text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">
                           {grades.assignments[i] || '--'}%
                       </span>
                    </div>
                  ))}
               </div>

               {/* Stats Panel */}
               <div className="w-1/3 bg-white rounded-2xl p-6 border border-slate-200 h-fit shadow-sm">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Grade Report</span>
                    <BarChart2 size={18} className="text-slate-400" />
                  </div>
                  <div className="text-center mb-8">
                    <div className="text-7xl font-serif font-bold mb-2 text-slate-900">{avg}</div>
                    <div className="text-xs font-mono uppercase tracking-widest text-slate-400">Current Average</div>
                  </div>
               </div>
            </div>
         </div>
       );
    }

    // 3. ASSIGNMENT VIEW
    const isLaw = activeFolder === CLASSES.LAW || (distributedFile === 'l1' && !activeFolder);
    return (
      <div className="bg-[#fdfbf7] h-full flex flex-col relative animate-fade-in overflow-hidden">
         <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 z-10" /> 
         
         <div className="h-full overflow-y-auto flex flex-col relative">
            {/* Assignment Header - Sticky */}
            <div className="px-8 py-4 border-b border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-30">
                <button onClick={() => setStudentViewMode('folder')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft size={20} /> <span className="font-serif">Back to Folder</span>
                </button>
                <div className="text-center">
                <h1 className="font-serif text-lg font-bold text-slate-900">
                    {isLaw ? 'R v. Parks: Automatism Defense' : 'Unit 3 Test: Dynamics'}
                </h1>
                </div>
                <div className="flex items-center gap-2 font-mono font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                    <Clock size={16} className="text-slate-500" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-8 scroll-smooth pb-0">
                <div className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 p-12 min-h-[900px]">
                
                {isLaw ? (
                    /* LAW ASSIGNMENT VIEW */
                    <div className="space-y-10">
                        <div className="prose prose-slate max-w-none font-serif border-b pb-10 mb-10 border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-4 uppercase tracking-widest text-xs font-bold">
                            <BookOpen size={16} /> Reading Passage
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Case Background</h3>
                        <p className="text-lg leading-loose text-slate-700">
                            <strong>Facts:</strong> The accused, Parks, drove 23km to the home of his wife's parents. He entered their home and attacked them with a knife, killing his mother-in-law and seriously injuring his father-in-law. Immediately after the incident, he drove to the police station and confessed.
                        </p>
                        <p className="text-lg leading-loose text-slate-700 mt-6">
                            <strong>Defense:</strong> Parks presented a defense of <em>non-insane automatism</em>, claiming he was sleepwalking during the entire incident and therefore acted involuntarily. Expert witnesses testified to his history of sleep disorders.
                        </p>
                        </div>

                        <div className="space-y-8">
                        {[1, 2, 3, 4, 5].map((q) => (
                            <div key={q} className="group">
                                <label className="block font-bold text-slate-900 mb-4 font-serif text-xl">
                                {q}. {LAW_QUESTIONS[`q${q}`]}
                                </label>
                                <textarea 
                                className="w-full p-6 rounded-xl bg-[#f8f6f1] border-2 border-transparent focus:border-slate-900 focus:bg-white transition-all outline-none font-serif text-lg min-h-[160px] resize-none leading-relaxed shadow-inner"
                                placeholder="Tap to write..."
                                value={lawAnswers[`q${q}`]}
                                onChange={(e) => setLawAnswers({...lawAnswers, [`q${q}`]: e.target.value})}
                                />
                            </div>
                        ))}
                        </div>
                    </div>
                ) : (
                    /* PHYSICS ASSIGNMENT VIEW */
                    <div className="space-y-12">
                        {/* Q1 */}
                        <section>
                            <p className="font-serif text-2xl text-slate-900 mb-6 leading-relaxed font-medium">
                                1. Which of the following best describes Newton's First Law?
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                {['A', 'B', 'C', 'D'].map((opt) => (
                                    <button key={opt} onClick={() => setPhysicsAnswers({...physicsAnswers, q1: opt})} className={`text-left p-5 rounded-xl border-2 font-serif text-lg transition-all flex items-center gap-4 ${physicsAnswers.q1 === opt ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-transparent border-slate-200 hover:border-slate-400 text-slate-600'}`}>
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${physicsAnswers.q1 === opt ? 'bg-white text-slate-900 border-white' : 'border-slate-300'}`}>{opt}</span>
                                        {opt === 'B' ? 'An object in motion stays in motion' : 'Force equals mass times acceleration'}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Q2 */}
                        <section>
                            <p className="font-serif text-2xl text-slate-900 mb-6 leading-relaxed font-medium">
                                2. Calculate the normal force on a 10kg box on a flat surface.
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                {['A', 'B', 'C', 'D'].map((opt) => (
                                    <button key={opt} onClick={() => setPhysicsAnswers({...physicsAnswers, q2: opt})} className={`text-left p-5 rounded-xl border-2 font-serif text-lg transition-all flex items-center gap-4 ${physicsAnswers.q2 === opt ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-transparent border-slate-200 hover:border-slate-400 text-slate-600'}`}>
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${physicsAnswers.q2 === opt ? 'bg-white text-slate-900 border-white' : 'border-slate-300'}`}>{opt}</span>
                                        {opt === 'A' ? '98 N' : 
                                        opt === 'B' ? '9.8 N' : 
                                        opt === 'C' ? '0.98 N' : '980 N'}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Q3 Written */}
                        <section>
                            <p className="font-serif text-2xl text-slate-900 mb-6 leading-relaxed font-medium">
                                3. A 50kg skier slides down a 30° slope with u=0.1. Calculate acceleration.
                            </p>
                            <textarea 
                                value={physicsAnswers.q3}
                                onChange={(e) => setPhysicsAnswers({...physicsAnswers, q3: e.target.value})}
                                className="w-full h-80 p-8 rounded-xl border-2 border-slate-200 font-['Caveat'] text-2xl bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] focus:border-slate-900 outline-none resize-none leading-[3rem]"
                                style={{fontFamily: 'cursive'}}
                                placeholder="Write your answer here..."
                            />
                        </section>
                    </div>
                )}

                </div>
            </div>

            {/* Footer - Now static at bottom of flow */}
            <div className="p-6 border-t border-slate-200 bg-white flex justify-end mt-auto z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={() => { 
                    triggerToast("Submitting to Mr. Specter..."); 
                    setTimeout(() => setStudentViewMode('success'), 1000);
                    }}
                    className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform flex items-center gap-3 text-lg"
                >
                    Hand In <Send size={20} />
                </button>
            </div>
         </div>
      </div>
    );
  };

  // --- TEACHER VIEWS ---

  const TeacherDashboard = () => (
    <div className="max-w-6xl mx-auto pt-6 animate-fade-in pb-12">
       <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Class Distribution</h2>
          <p className="text-slate-500 mt-2">Manage handouts for <span className="font-semibold text-slate-900">{selectedClass}</span></p>
        </div>
        <div className="relative">
             <select 
               value={selectedClass}
               onChange={(e) => { setSelectedClass(e.target.value); setDistributedFile(null); setUploadStatus('idle'); }}
               className="appearance-none bg-white border border-slate-200 text-slate-900 rounded-xl pl-6 pr-12 py-3 font-semibold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-slate-300 transition-colors"
             >
               <option>{CLASSES.PHYSICS}</option>
               <option>{CLASSES.LAW}</option>
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                 <ChevronRight className="rotate-90" size={18} />
             </div>
         </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
          {/* DROP ZONE (Modified: Full Width) */}
          <div className="col-span-12">
              <div 
                onClick={() => handleUploadTrigger()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`group relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 h-80 flex flex-col items-center justify-center text-center cursor-pointer
                ${uploadStatus === 'idle' ? 'border-slate-300 bg-slate-50/50 hover:border-blue-500 hover:bg-blue-50/30' : ''}
                ${uploadStatus === 'uploading' ? 'border-blue-500 bg-blue-50/30' : ''}
                ${uploadStatus === 'complete' ? 'border-green-500 bg-green-50/30' : ''}
                `}
              >
                {uploadStatus === 'idle' && (
                <>
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud size={40} className="text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Drag Material Here</h3>
                    <p className="text-slate-500">or click to browse local files</p>
                </>
                )}

                {uploadStatus === 'uploading' && (
                    <div className="w-full max-w-sm space-y-4 animate-fade-in px-8">
                        <div className="flex justify-between text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                            <span>Syncing Devices</span>
                            <span>75%</span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                            <div className="bg-blue-600 h-3 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" style={{width: '75%'}}></div>
                        </div>
                        <p className="text-blue-600 font-medium animate-pulse">Pushing to {selectedClass === CLASSES.PHYSICS ? '30' : '28'} tablets...</p>
                    </div>
                )}

                {uploadStatus === 'complete' && (
                    <div className="animate-fade-in flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center shadow-sm mb-6">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-900 mb-6">Distributed Successfully</h3>
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                setStudentViewMode('home'); // Reset to Home!
                                setCurrentView('student'); 
                            }}
                            className="px-8 py-3 bg-slate-900 text-white rounded-full text-sm font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-3"
                        >
                            <Tablet size={18} /> Launch Student Simulator
                        </button>
                    </div>
                )}
              </div>
          </div>

          {/* LOWER SECTION: Class Materials & Live Feed (Modified Layout) */}
          <div className="col-span-12 lg:col-span-6 flex flex-col h-80">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Class Materials</h3>
                 <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
             </div>
             <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {RESOURCES[selectedClass].map((res) => (
                <div 
                    key={res.id}
                    draggable={res.status === 'uncollected'}
                    onDragStart={(e) => handleDragStart(e, res.id)}
                    className={`p-4 bg-white border rounded-2xl flex items-center justify-between transition-all group
                    ${res.status === 'uncollected' 
                        ? 'border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-400' 
                        : 'border-slate-100 opacity-60 bg-slate-50 cursor-default'}
                    `}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${res.status === 'uncollected' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors' : 'bg-slate-200 text-slate-400'}`}>
                        <FileText size={20} />
                        </div>
                        <div>
                        <h4 className="font-bold text-slate-900 text-sm">{res.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{res.type} • {res.collected}/{res.total} Collected</p>
                        </div>
                    </div>
                </div>
                ))}
             </div>
          </div>

          {/* NEW: Live Activity Feed */}
          <div className="col-span-12 lg:col-span-6 flex flex-col h-80">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Activity Feed</h3>
                 <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                 </div>
             </div>
             <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 overflow-y-auto space-y-6 shadow-sm">
                <div className="flex gap-4">
                    <div className="mt-1"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">JD</div></div>
                    <div>
                        <p className="text-sm text-slate-900"><span className="font-bold">John Doe</span> opened <span className="font-medium text-blue-600">Unit 3 Test</span>.</p>
                        <p className="text-xs text-slate-400 mt-1">Just now</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="mt-1"><div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">SS</div></div>
                    <div>
                        <p className="text-sm text-slate-900"><span className="font-bold">Sarah Smith</span> submitted <span className="font-medium text-blue-600">Lab 4 Report</span>.</p>
                        <p className="text-xs text-slate-400 mt-1">2 mins ago</p>
                    </div>
                </div>
                <div className="flex gap-4 opacity-60">
                    <div className="mt-1"><div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold">MR</div></div>
                    <div>
                        <p className="text-sm text-slate-900"><span className="font-bold">Mike Ross</span> logged in.</p>
                        <p className="text-xs text-slate-400 mt-1">5 mins ago</p>
                    </div>
                </div>
             </div>
          </div>
      </div>
    </div>
  );

  const TeacherGrading = () => {
    // 1. SHOW STUDENT LIST IF NO STUDENT SELECTED
    if (!gradingSelectedStudentId) {
        return (
            <div className="max-w-4xl mx-auto pt-6 animate-fade-in">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Submission Queue</h2>
                    <p className="text-slate-500 mt-2">
                        {distributedFile ? `Grading: ${RESOURCES[selectedClass].find(r => r.id === distributedFile)?.title}` : 'Select an assignment to grade'}
                    </p>
                </header>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Student</div>
                        <div className="col-span-3">Status</div>
                        <div className="col-span-2">Time Handed In</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>

                    {/* Student List */}
                    {students.map((s, idx) => {
                        // Logic to determine status based on our simulation state
                        let status = 'Missing';
                        let time = '--';
                        let statusColor = 'bg-slate-100 text-slate-500';

                        // Simulate John Doe's status based on "Graded" or "Handed In" flow
                        if (s.id === 1) { 
                            if (s.status === 'Graded') {
                                status = 'Graded';
                                statusColor = 'bg-green-100 text-green-700';
                                time = '10:52 AM';
                            } else if (distributedFile) {
                                // If we distributed a file, assume he handed it in for the demo if not graded
                                status = 'Ready to Grade';
                                statusColor = 'bg-blue-100 text-blue-700 animate-pulse';
                                time = 'Just now';
                            }
                        }

                        return (
                            <div key={s.id} className="grid grid-cols-12 gap-4 p-5 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="col-span-1 font-mono text-slate-400">{s.studentId}</div>
                                <div className="col-span-4 font-bold text-slate-900">{s.name}</div>
                                <div className="col-span-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                                        {status}
                                    </span>
                                </div>
                                <div className="col-span-2 text-sm text-slate-500 font-mono">{time}</div>
                                <div className="col-span-2 text-right">
                                    <button 
                                        onClick={() => setGradingSelectedStudentId(s.id)}
                                        disabled={status === 'Missing'}
                                        className="text-sm font-bold text-blue-600 hover:underline disabled:text-slate-300 disabled:no-underline"
                                    >
                                        {status === 'Graded' ? 'Review' : 'Grade'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // 2. SHOW GRADING INTERFACE (Existing View)
    const isLawGrading = distributedFile === 'l1' || selectedClass === CLASSES.LAW;

    // --- HELPER FOR KEYWORD HIGHLIGHTING ---
    const highlightText = (text, keywords) => {
        if (!text) return <span className="text-slate-300 italic">No answer provided.</span>;
        
        // Sort keywords by length descending to match phrases before words (e.g. Actus Reus before Actus)
        const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
        const regex = new RegExp(`(${sortedKeywords.join('|')})`, 'gi');
        
        return text.split(regex).map((part, index) => {
           const isKeyword = sortedKeywords.some(k => k.toLowerCase() === part.toLowerCase());
           return isKeyword 
             ? <span key={index} className="bg-yellow-200/50 text-blue-800 font-bold px-1 rounded mx-0.5 border-b-2 border-yellow-300">{part}</span>
             : part;
        });
    };

    return (
      <div className="h-[calc(100vh-2rem)] flex gap-6 pt-2 animate-fade-in">
         {/* LEFT PANE: STUDENT WORK */}
         <div className="w-3/5 bg-slate-100 rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-inner">
            <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10">
               <div className="flex items-center gap-4">
                   <button onClick={() => setGradingSelectedStudentId(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                       <ArrowLeft size={20} />
                   </button>
                   <span className="font-bold text-slate-700 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500"></div> John Doe's Submission
                   </span>
               </div>
               <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">ID: 49201</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 bg-slate-200/50">
               <div className="bg-white min-h-[900px] shadow-sm p-12 max-w-3xl mx-auto rounded-sm relative">
                 {/* Paper Header */}
                 <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-8">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-slate-900">{isLawGrading ? 'Case Analysis' : 'Unit 3 Test'}</h1>
                        <p className="font-serif text-slate-600 mt-2">{isLawGrading ? 'Law 12' : 'Physics 12'}</p>
                    </div>
                    <div className="text-right font-serif text-slate-500">
                        <p>Oct 24, 2025</p>
                    </div>
                 </div>

                 {isLawGrading ? (
                    <div className="space-y-10 font-serif">
                       {[1,2,3,4,5].map(i => (
                          <div key={i}>
                             <p className="font-bold text-lg mb-3">{i}. {LAW_QUESTIONS[`q${i}`]}</p>
                             <div className="text-xl text-blue-900 leading-loose bg-[#fdfbf7] p-6 rounded-xl border border-blue-100 shadow-sm font-handwriting">
                                {/* Use helper to highlight student's answer text */}
                                {highlightText(lawAnswers[`q${i}`], LAW_KEYWORDS[`q${i}`])}
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    /* Physics Grading */
                    <div className="relative">
                       <div className="space-y-8">
                          {/* Q1 */}
                          <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                             <p className="text-slate-500 font-serif italic mb-3">1. Which of the following best describes Newton's First Law?</p>
                             <div className="flex gap-6 items-start">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0 mt-1 shadow-sm">✓</div>
                                <div>
                                    <p className="font-serif font-bold text-lg mb-1">Answered: B</p>
                                    <p className="text-sm text-slate-500">Correct.</p>
                                </div>
                             </div>
                          </div>

                          {/* Q2 */}
                          <div className="p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                             <p className="text-slate-500 font-serif italic mb-3">2. Calculate the normal force on a 10kg box on a flat surface.</p>
                             <div className="flex gap-6 items-start">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold shrink-0 mt-1 shadow-sm">✗</div>
                                <div>
                                    <p className="font-serif font-bold text-lg mb-1">Answered: A (98 N)</p>
                                    <p className="text-sm text-red-500 font-bold">Incorrect. Correct: 9.8 N</p>
                                </div>
                             </div>
                          </div>

                          {/* Q3 */}
                          <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200">
                             <div className="flex justify-between items-center mb-4">
                                <p className="font-serif font-bold text-xl">Q3. Written Response</p>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">Needs Grading</span>
                             </div>
                             <p className="text-slate-500 font-serif italic mb-4">3. A 50kg skier slides down a 30° slope with u=0.1. Calculate acceleration.</p>
                             
                             <div className="font-handwriting text-blue-900 text-2xl font-['Caveat'] leading-loose p-4" style={{fontFamily: 'cursive'}}>
                                F_net = 202.6N ... a = 4.05 m/s^2
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
               </div>
            </div>
         </div>

         {/* RIGHT PANE: GRADING TOOLS */}
         <div className="w-2/5 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm h-full overflow-hidden">
            <div className="p-8 border-b border-slate-200 bg-slate-50/50">
               <div className="flex items-center gap-2 mb-6">
                  <BookOpen size={16} className="text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {isLawGrading ? 'Analysis Keywords' : 'Detailed Answer Key'}
                  </h3>
               </div>
               
               {isLawGrading ? (
                 <div className="space-y-4 overflow-y-auto max-h-[300px]">
                    {[1,2,3,4,5].map(q => (
                       <div key={q} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <p className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-3">Question {q}</p>
                          <div className="flex flex-wrap gap-2">
                             {LAW_KEYWORDS[`q${q}`].map(k => {
                                // Check if keyword exists in student answer for dynamic styling
                                const answer = (lawAnswers[`q${q}`] || '').toLowerCase();
                                const isMatch = answer.includes(k.toLowerCase());
                                return (
                                   <span key={k} className={`px-2 py-1 text-xs font-bold rounded border transition-all duration-300 ${
                                      isMatch 
                                      ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' 
                                      : 'bg-blue-50 text-blue-700 border-blue-100 opacity-60'
                                   }`}>{k}</span>
                                );
                             })}
                          </div>
                       </div>
                    ))}
                 </div>
               ) : (
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-sm space-y-3 font-mono">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">m</span>
                        <span className="font-bold">50 kg</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-slate-500">θ</span>
                         <span className="font-bold">30°</span>
                    </div>
                     <div className="flex justify-between text-slate-600">
                         <span>Fg_x = mg sin(θ)</span>
                         <span>245 N</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                         <span>Fn = mg cos(θ)</span>
                         <span>424.35 N</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                         <span>Ff = μFn</span>
                         <span>42.4 N</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                         <span className="text-slate-800 font-bold">Fnet = Fg_x - Ff</span>
                         <span className="text-blue-600 font-bold">202.6 N</span>
                    </div>
                    <div className="flex justify-between bg-green-50 p-2 rounded border border-green-100 mt-2">
                         <span className="text-green-800 font-bold">a = Fnet / m</span>
                         <span className="text-green-700 font-bold text-lg">4.05 m/s²</span>
                    </div>
                 </div>
               )}
            </div>

            {/* NEW: Private Notes Section (Fills the gap) - Added min-h-0 to prevent layout blowouts */}
            <div className="flex-1 min-h-0 px-8 py-4 bg-slate-50/50 flex flex-col">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <MessageSquare size={14} /> Teacher Notes (Private)
                </div>
                <textarea 
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Enter private feedback or notes for yourself..."
                ></textarea>
            </div>

            <div className="p-8 mt-auto bg-white z-10 border-t border-slate-200">
               {!isLawGrading && (
                  <div className="mb-8 flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <span className="text-slate-500 font-medium">Auto-Graded MCQ</span>
                     <span className="font-bold bg-green-100 text-green-700 px-3 py-1 rounded-lg">9/10</span>
                  </div>
               )}
               
               <label className="block text-sm font-bold text-slate-900 mb-4">
                  {isLawGrading ? 'Total Score (/100)' : 'Manual Score for Q3 (/5)'}
               </label>
               
               {isLawGrading ? (
                 <input 
                   type="number"
                   value={manualScore}
                   onChange={(e) => setManualScore(e.target.value)}
                   className="w-full p-4 text-3xl font-bold border-2 border-slate-200 rounded-xl mb-6 focus:border-blue-500 outline-none text-center"
                   placeholder="--"
                 />
               ) : (
                 <div className="flex gap-3 mb-8">
                    {[1,2,3,4,5].map(s => (
                       <button 
                        key={s} 
                        onClick={() => submitGrade(s)} // Auto-submit on click for Physics
                        className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900
                        ${parseInt(manualScore) === s 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                            : 'bg-white text-slate-600 border-slate-200'}`}
                       >
                           {s}
                       </button>
                    ))}
                 </div>
               )}

               {/* Only show Manual Submit for Law, Physics handles it in the buttons above */}
               {isLawGrading && (
                   <button 
                     disabled={!manualScore}
                     onClick={() => submitGrade()}
                     className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                   >
                     Submit Grade
                   </button>
               )}
            </div>
         </div>
      </div>
    );
  };

  const MasterGradebook = () => (
    <div className="max-w-[1400px] mx-auto pt-6 animate-fade-in pb-12">
       <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Master Gradebook</h2>
            <div className="flex items-center gap-2 mt-2 text-slate-500">
                <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{selectedClass}</span>
                <span>•</span>
                <span>Fall Semester 2025</span>
            </div>
          </div>
          <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-50">
                  <Filter size={16} /> Filter
              </button>
              <button className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-50">
                  <Printer size={16} /> Print
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-green-700 shadow-sm">
                  <UploadCloud size={16}/> Publish to Parents
              </button>
          </div>
       </header>

       <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-900/5">
          <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                   <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider w-12 sticky left-0 bg-slate-50 z-10">#</th>
                   <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider sticky left-12 bg-slate-50 z-10 border-r border-slate-200">Student Name</th>
                   <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider font-mono">ID</th>
                   <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Unit 1</th>
                   <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Unit 2</th>
                   <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Midterm</th>
                   <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-l border-r border-slate-200 bg-blue-50/50 text-blue-700`}>
                      {selectedClass === CLASSES.PHYSICS ? 'Unit 3 Test' : 'Case Study'}
                   </th>
                   <th className="px-6 py-4 text-xs font-bold uppercase text-slate-900 tracking-wider text-right">Average</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {students.map((s, idx) => {
                    const avg = calculateAverage(s);
                    const isGradedRow = s.status === 'Graded' && s.id === 1;
                    return (
                   <tr key={s.id} className={`group transition-colors ${isGradedRow ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-3 text-sm text-slate-400 font-mono sticky left-0 bg-white group-hover:bg-slate-50 transition-colors">{idx + 1}</td>
                      <td className="px-6 py-3 font-semibold text-slate-900 sticky left-12 bg-white group-hover:bg-slate-50 border-r border-slate-100 transition-colors">{s.name}</td>
                      <td className="px-6 py-3 text-sm text-slate-500 font-mono">{s.studentId}</td>
                      <td className="px-6 py-3 text-sm text-slate-600 font-medium">{s.assignments[0]}%</td>
                      <td className="px-6 py-3 text-sm text-slate-600 font-medium">{s.assignments[1]}%</td>
                      <td className="px-6 py-3 text-sm text-slate-600 font-medium">{s.assignments[2]}%</td>
                      <td className={`px-6 py-3 font-mono font-bold border-l border-r border-slate-100 ${isGradedRow ? 'text-blue-600 bg-blue-50/50' : 'text-slate-300'}`}>
                         {selectedClass === CLASSES.PHYSICS 
                            ? (s.unit3Test ? s.unit3Test + '%' : '--')
                            : (s.lawCase ? s.lawCase + '%' : '--')
                         }
                      </td>
                      <td className="px-6 py-3 text-right">
                         <span className={`inline-block w-12 text-center py-1 rounded-md text-sm font-bold border
                            ${avg >= 90 ? 'bg-green-50 text-green-700 border-green-200' : 
                              avg >= 80 ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              avg >= 70 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'
                            }
                         `}>{avg}%</span>
                      </td>
                   </tr>
                )})}
             </tbody>
          </table>
       </div>
    </div>
  );

  // --- MAIN RENDER ---
  if (currentView === 'student') {
    return (
       <div className="bg-slate-900 h-screen w-screen flex items-center justify-center p-8">
          {/* Reverted dimensions to Landscape Mode (approx 4:3 aspect ratio) */}
          <div className="w-full max-w-[1100px] h-full max-h-[850px] bg-[#1a1a1a] rounded-[2.5rem] p-4 border-[8px] border-[#2a2a2a] shadow-2xl relative ring-1 ring-white/10">
             {/* Tablet Power Button Mockup */}
             <div className="absolute -right-[12px] top-32 w-[6px] h-16 bg-[#333] rounded-r-md border-l border-black/50"></div>
             
             {/* Screen Container */}
             <div className="w-full h-full rounded-[2rem] overflow-hidden bg-white relative shadow-inner">
                 {/* Called as a function instead of a component to preserve focus state */}
                 {renderStudentOS()}
             </div>

             {/* Home Bar */}
             <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-40 h-1.5 bg-white/10 rounded-full backdrop-blur-sm"></div>
          </div>
          
          <button onClick={() => setCurrentView('dashboard')} className="fixed bottom-8 left-8 text-white/40 hover:text-white flex items-center gap-3 transition-colors">
             <div className="p-2 border border-white/20 rounded-full"><LogOut size={20} /></div>
             <span className="font-medium tracking-wide text-sm uppercase">Exit Simulation</span>
          </button>
          <Toast />
       </div>
    );
  }

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900">
       {/* Sidebar with Retraction Logic */}
       <div className={`${sidebarCollapsed ? 'w-24 items-center' : 'w-72'} bg-slate-50 border-r border-slate-200 flex flex-col z-20 transition-all duration-300 relative`}>
          {/* Sidebar Toggle Button */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-8 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-slate-900 shadow-sm z-30"
          >
             {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className={`p-8 mb-2 ${sidebarCollapsed ? 'px-2 flex flex-col items-center' : ''}`}>
             <div className="flex items-center gap-3 mb-1">
                 <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-xl font-bold text-xl shadow-lg shadow-slate-900/20 shrink-0">P</div>
                 {!sidebarCollapsed && <div className="font-bold text-xl tracking-tight overflow-hidden whitespace-nowrap">Papyri<span className="font-normal text-slate-400">OS</span></div>}
             </div>
             {!sidebarCollapsed && <p className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 mt-2 overflow-hidden whitespace-nowrap">Teacher Command</p>}
          </div>
          
          <nav className="space-y-2 px-4 w-full">
             {['dashboard', 'grading', 'gradebook'].map(v => (
                <button 
                  key={v}
                  onClick={() => setCurrentView(v)}
                  className={`w-full text-left px-4 py-4 rounded-xl capitalize font-medium flex items-center gap-4 transition-all duration-200 
                    ${currentView === v ? 'bg-white shadow-md text-blue-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                  title={v}
                >
                   {v === 'dashboard' && <LayoutDashboard size={20} className="shrink-0" />}
                   {v === 'grading' && <CheckCircle size={20} className="shrink-0" />}
                   {v === 'gradebook' && <Users size={20} className="shrink-0" />}
                   {!sidebarCollapsed && <span>{v}</span>}
                </button>
             ))}
          </nav>

          <div className="mt-auto p-6 border-t border-slate-200 w-full">
              {!sidebarCollapsed ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">MS</div>
                      <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">Mr. Specter</p>
                          <p className="text-xs text-slate-500 truncate">Elgin Park Secondary</p>
                      </div>
                      <Settings size={18} className="text-slate-400 cursor-pointer hover:text-slate-600 shrink-0" />
                  </div>
              ) : (
                  <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer" title="Settings">MS</div>
                  </div>
              )}
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 p-10 bg-[#f8f9fc] overflow-y-auto">
          {currentView === 'dashboard' && <TeacherDashboard />}
          {currentView === 'grading' && <TeacherGrading />}
          {currentView === 'gradebook' && <MasterGradebook />}
       </div>
       <Toast />
    </div>
  );
};

export default PaperTeacherApp;
