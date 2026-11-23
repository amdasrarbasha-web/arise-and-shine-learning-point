import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  School, 
  Calendar, 
  BookOpen, 
  DollarSign, 
  IdCard, 
  MessageSquare, 
  User, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle, 
  Send, 
  Camera, 
  Eye, 
  ChevronRight, 
  RefreshCw, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Download, 
  Sparkles, 
  Flame, 
  Share2, 
  QrCode, 
  RotateCw, 
  Check, 
  FileText, 
  Upload, 
  Smartphone,
  Phone,
  HelpCircle,
  Award,
  Zap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

// Lightbox Photo Modal for Homework Worksheets
function PhotoModal({ isOpen, onClose, photoUrl, title }) {
  if (!isOpen || !photoUrl) return null;
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full apple-glass-card p-4 sm:p-6 shadow-2xl border border-white/15 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white truncate">{title || 'Worksheet Document'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="flex justify-center bg-black/60 rounded-2xl overflow-hidden max-h-[70vh]">
          <img 
            src={photoUrl} 
            alt="Expanded worksheet" 
            className="max-h-[70vh] w-auto object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

// Apple Fitness Concentric Triple Activity Rings SVG Component
function AppleActivityRings({ attendance = 94.4, discipline = 95, homework = 96, size = 140 }) {
  // Ring 1 (Outer - Neon Green): Attendance Rate
  const r1 = 56;
  const c1 = 2 * Math.PI * r1;
  const off1 = c1 - (Math.min(attendance, 100) / 100) * c1;

  // Ring 2 (Middle - Electric Cyan): Punctuality & Discipline
  const r2 = 42;
  const c2 = 2 * Math.PI * r2;
  const off2 = c2 - (Math.min(discipline, 100) / 100) * c2;

  // Ring 3 (Inner - Vibrant Orange): Homework Completion
  const r3 = 28;
  const c3 = 2 * Math.PI * r3;
  const off3 = c3 - (Math.min(homework, 100) / 100) * c3;

  return (
    <div className="relative inline-flex items-center justify-center group">
      <svg width={size} height={size} viewBox="0 0 140 140" className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(48,209,88,0.25)]">
        {/* Ring 1 Track & Progress (Neon Green) */}
        <circle cx="70" cy="70" r={r1} stroke="rgba(48, 209, 88, 0.15)" strokeWidth="10" fill="transparent" />
        <circle 
          cx="70" cy="70" r={r1} 
          stroke="#30D158" 
          strokeWidth="10" 
          strokeDasharray={c1} 
          strokeDashoffset={off1} 
          strokeLinecap="round" 
          fill="transparent" 
          className="transition-all duration-1000 ease-out"
        />

        {/* Ring 2 Track & Progress (Electric Cyan) */}
        <circle cx="70" cy="70" r={r2} stroke="rgba(10, 132, 255, 0.15)" strokeWidth="9" fill="transparent" />
        <circle 
          cx="70" cy="70" r={r2} 
          stroke="#0A84FF" 
          strokeWidth="9" 
          strokeDasharray={c2} 
          strokeDashoffset={off2} 
          strokeLinecap="round" 
          fill="transparent" 
          className="transition-all duration-1000 ease-out"
        />

        {/* Ring 3 Track & Progress (Vibrant Orange) */}
        <circle cx="70" cy="70" r={r3} stroke="rgba(255, 159, 10, 0.15)" strokeWidth="8" fill="transparent" />
        <circle 
          cx="70" cy="70" r={r3} 
          stroke="#FF9F0A" 
          strokeWidth="8" 
          strokeDasharray={c3} 
          strokeDashoffset={off3} 
          strokeLinecap="round" 
          fill="transparent" 
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-xl font-black text-white font-heading tracking-tight">
          {attendance}%
        </span>
        <span className="text-[9px] uppercase tracking-widest font-extrabold text-neutral-400">
          Activity
        </span>
      </div>
    </div>
  );
}

export default function StudentApp({ 
  student, 
  onLogout, 
  onLoginSuccess, 
  onStudentUpdate,
  centerInfo, 
  isStandaloneApp, 
  onOpenInstallModal 
}) {
  const [currentStudent, setCurrentStudent] = useState(student);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data streams
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [homeworksList, setHomeworksList] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Digital ID Card 3D Flip State
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Homework submission
  const [hwFilterSubject, setHwFilterSubject] = useState('All');
  const [selectedWorksheetPhoto, setSelectedWorksheetPhoto] = useState(null);
  const [uploadHwId, setUploadHwId] = useState(null);
  const [hwNotesInput, setHwNotesInput] = useState('');
  const [isSubmittingHw, setIsSubmittingHw] = useState(false);

  // Feedback form
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');

  useEffect(() => {
    if (student) setCurrentStudent(student);
  }, [student]);

  const s = currentStudent;

  // Fetch student records from backend
  const fetchStudentData = async (studentId) => {
    if (!studentId) return;
    setIsLoadingData(true);
    try {
      const [studRes, annRes, hwRes, fbRes] = await Promise.all([
        fetch(`/api/students/${studentId}`),
        fetch('/api/announcements'),
        fetch(`/api/homeworks?studentId=${studentId}`),
        fetch(`/api/feedbacks?studentId=${studentId}`),
      ]);

      if (studRes.ok) {
        const studData = await studRes.json();
        setCurrentStudent(studData);
        if (onStudentUpdate) onStudentUpdate(studData);
      }
      if (annRes.ok) setAnnouncementsList(await annRes.json());
      if (hwRes.ok) setHomeworksList(await hwRes.json());
      if (fbRes.ok) setFeedbacksList(await fbRes.json());
    } catch (err) {
      console.error('Failed to sync student data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (s?.id) {
      fetchStudentData(s.id);
      const pollTimer = setInterval(() => {
        fetchStudentData(s.id);
      }, 5000);
      return () => clearInterval(pollTimer);
    }
  }, [s?.id]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#30D158', '#0A84FF', '#FF9F0A', '#ffd066']
    });
  };

  // Student portal login
  const handleStudentLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError('Please enter Student ID and Password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: loginId.trim(), password: loginPassword.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Invalid credentials. Please verify your Student ID.');
      } else {
        setCurrentStudent(data.student);
        onLoginSuccess(data.student);
        fetchStudentData(data.student.id);
        triggerCelebration();
      }
    } catch (err) {
      setLoginError('Unable to connect to tuition server. Please check connection.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Instant 1-Click Demo Login
  const handleDemoLogin = async (id, pass) => {
    setLoginId(id);
    setLoginPassword(pass);
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id.trim(), password: pass.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Invalid credentials.');
      } else {
        setCurrentStudent(data.student);
        onLoginSuccess(data.student);
        fetchStudentData(data.student.id);
        triggerCelebration();
      }
    } catch (err) {
      setLoginError('Unable to connect to tuition server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Image processor for homework worksheets
  const processImageFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadHomeworkWorksheet = async (hwId, file) => {
    if (!file) return;
    try {
      const base64Data = await processImageFile(file);
      const res = await fetch(`/api/homeworks/${hwId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: s.id,
          studentName: s.name,
          worksheetPhoto: base64Data,
          studentNotes: hwNotesInput || 'Completed worksheet photo attached.'
        })
      });
      if (res.ok) {
        triggerCelebration();
        setUploadHwId(null);
        setHwNotesInput('');
        fetchStudentData(s.id);
      }
    } catch (err) {
      alert('Failed to upload worksheet. Please try again.');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setIsSendingFeedback(true);
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: s.id,
          studentName: s.name,
          parentName: s.parentName,
          subject: feedbackSubject.trim() || 'General Inquiry',
          message: feedbackMessage.trim()
        })
      });
      if (res.ok) {
        setFeedbackSuccessMsg('Your message was transmitted directly to faculty leadership.');
        setFeedbackSubject('');
        setFeedbackMessage('');
        fetchStudentData(s.id);
        setTimeout(() => setFeedbackSuccessMsg(''), 5000);
      }
    } catch (err) {
      alert('Unable to deliver message. Please call faculty directly.');
    } finally {
      setIsSendingFeedback(false);
    }
  };

  // ============================================================
  // 1. LOGGED-OUT: APPLE ID STYLE SLEEK AUTHENTICATION GATEWAY
  // ============================================================
  if (!s) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Apple Dynamic Ambient Orbs */}
        <div className="ambient-glow-orb-purple -top-20 left-1/3 animate-pulse-glow"></div>
        <div className="ambient-glow-orb-blue bottom-10 right-1/4"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Cupertino Frosted Auth Card */}
          <div className="apple-glass-card p-6 sm:p-8 border border-white/12 shadow-[0_24px_60px_rgba(0,0,0,0.8)]">
            {/* Top Apple Emblem & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/15 p-2 shadow-inner mb-4">
                <img 
                  src="/logo.png" 
                  alt="Arise & Shine Logo" 
                  className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
                Arise & Shine
              </h1>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-bold mt-1">
                Learning Point • Melvisharam
              </p>
              <p className="text-xs text-neutral-400 mt-2">
                Sign in to view live attendance, homework, & academic records.
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Student ID Number
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. ASLP-101"
                  className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-neutral-500 text-sm font-mono focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Portal Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-neutral-950 font-black text-sm rounded-xl shadow-lg transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Fast 1-Click Test Login Pills */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 text-center mb-2.5">
                ⚡ Fast 1-Click Test Access
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('ASLP-101', 'pass101')}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 rounded-xl text-left transition active:scale-95 cursor-pointer"
                >
                  <strong className="block text-white text-xs truncate">Mohammed Rehan</strong>
                  <span className="text-[10px] text-amber-400 font-mono">ASLP-101 • Class 10</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('ASLP-102', 'pass102')}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 rounded-xl text-left transition active:scale-95 cursor-pointer"
                >
                  <strong className="block text-white text-xs truncate">Ayesha Fathima</strong>
                  <span className="text-[10px] text-amber-400 font-mono">ASLP-102 • Class 12</span>
                </button>
              </div>
            </div>

            {/* Helpline */}
            <div className="mt-5 text-center text-[11px] text-neutral-400 space-y-1">
              <div>
                Helpline: <a href="tel:6379840006" className="text-amber-400 font-semibold hover:underline">6379840006</a> / <a href="tel:9842385666" className="text-amber-400 font-semibold hover:underline">9842385666</a>
              </div>
              <a 
                href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-neutral-300 hover:text-white inline-flex items-center gap-1 transition"
              >
                <MapPin className="w-3 h-3 text-red-400" />
                <span>Melvisharam Center (Google Maps)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Attendance metrics
  const attPct = s.attendance?.percentage || 0;
  const isFeePaid = s.fee?.status === 'PAID';
  const filteredHomeworks = hwFilterSubject === 'All'
    ? homeworksList
    : homeworksList.filter(h => h.subject.toLowerCase().includes(hwFilterSubject.toLowerCase()));

  // ============================================================
  // 2. LOGGED-IN: APPLE LUXURY ACADEMY PORTAL
  // ============================================================
  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] pb-32 sm:pb-20 relative selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Orbs */}
      <div className="ambient-glow-orb-purple -top-40 left-1/4 pointer-events-none"></div>
      <div className="ambient-glow-orb-amber top-1/3 right-10 pointer-events-none"></div>

      {/* Apple Cupertino Segmented Sticky Header (Desktop) */}
      <div className="hidden sm:block sticky top-15 z-30 bg-black/75 backdrop-blur-2xl border-b border-white/10 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="apple-segmented-track flex items-center space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-full transition cursor-pointer ${
                activeTab === 'dashboard' ? 'apple-segmented-item-active' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'attendance' ? 'apple-segmented-item-active' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Attendance</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
                {attPct}%
              </span>
            </button>
            <button
              onClick={() => setActiveTab('homework')}
              className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'homework' ? 'apple-segmented-item-active' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Homework</span>
              {homeworksList.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300">
                  {homeworksList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('fee')}
              className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'fee' ? 'apple-segmented-item-active' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Tuition Fee</span>
              <span className={`w-2 h-2 rounded-full ${isFeePaid ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`}></span>
            </button>
            <button
              onClick={() => setActiveTab('helpdesk')}
              className={`px-4 py-2 rounded-full transition cursor-pointer ${
                activeTab === 'helpdesk' ? 'apple-segmented-item-active' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Faculty Desk
            </button>
          </div>

          {/* Right Action: Digital Pass */}
          <button
            onClick={() => setIsIdCardModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <IdCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Digital Student Pass</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        
        {/* ============================================================
            HERO SPOTLIGHT: APPLE PROFILE & ACTIVITY RINGS
        ============================================================ */}
        <div className="apple-glass-card p-6 sm:p-8 border border-white/10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            {/* Left: Student Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left min-w-0">
              {/* Photo with Presence Halo */}
              <div className="relative shrink-0">
                <img 
                  src={s.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"} 
                  alt={s.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white/20 shadow-2xl" 
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" title="Active in Tuition"></span>
              </div>

              {/* Details */}
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                    {s.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                    {s.id}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                  {s.grade} • <span className="text-neutral-400">{s.school}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-neutral-400">
                  <span className="bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    Roll: <strong className="text-white">{s.rollNo}</strong>
                  </span>
                  <span className="bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    Parent: <strong className="text-white">{s.parentName}</strong>
                  </span>
                  <span className="bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    Joined: <strong className="text-white">{s.joinDate}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Apple Concentric Activity Rings & Quick KPI */}
            <div className="flex items-center gap-6 shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
              <AppleActivityRings 
                attendance={attPct} 
                discipline={s.behaviour?.score || 95} 
                homework={96} 
                size={110} 
              />
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#30D158]"></span>
                  <span className="text-neutral-400">Tuition Attendance:</span>
                  <strong className="text-white">{s.attendance?.attendedClasses || 51}/{s.attendance?.totalClasses || 54}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0A84FF]"></span>
                  <span className="text-neutral-400">Regularity Grade:</span>
                  <strong className="text-white">{s.behaviour?.grade || 'A+'}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A]"></span>
                  <span className="text-neutral-400">Tuition Fee:</span>
                  <strong className={isFeePaid ? 'text-emerald-400' : 'text-rose-400'}>
                    {isFeePaid ? 'Paid on Time' : 'Due'}
                  </strong>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Action Pill Row */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Campus Batch: <strong className="text-white">5:00 PM – 9:30 PM (Evening Batch)</strong></span>
            </div>
            <button
              onClick={() => setIsIdCardModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-black text-xs transition active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Show Digital Student Pass (Apple Wallet)</span>
            </button>
          </div>
        </div>

        {/* ============================================================
            TAB: DASHBOARD OVERVIEW
        ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 3 Executive Metric Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Tile 1: Attendance */}
              <div 
                onClick={() => setActiveTab('attendance')}
                className="apple-glass-card p-5 apple-glass-interactive cursor-pointer border border-white/10 flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Attendance Rate</span>
                  </span>
                  <div className="text-2xl font-black text-white font-heading">
                    {attPct}%
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {s.attendance?.attendedClasses || 51} of {s.attendance?.totalClasses || 54} sessions attended
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              {/* Tile 2: Homework Supervision */}
              <div 
                onClick={() => setActiveTab('homework')}
                className="apple-glass-card p-5 apple-glass-interactive cursor-pointer border border-white/10 flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Homework Supervision</span>
                  </span>
                  <div className="text-2xl font-black text-white font-heading">
                    {homeworksList.length} Worksheets
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Faculty monitored & graded
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Tile 3: Tuition Fee Account */}
              <div 
                onClick={() => setActiveTab('fee')}
                className="apple-glass-card p-5 apple-glass-interactive cursor-pointer border border-white/10 flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Tuition Account</span>
                  </span>
                  <div className="text-2xl font-black text-white font-heading">
                    ₹{s.fee?.monthlyFee || 1333} / mo
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Status: <strong className={isFeePaid ? 'text-emerald-400' : 'text-rose-400'}>{s.fee?.status || 'PAID'}</strong>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Campus Notice Board */}
            <div className="apple-glass-card p-6 border border-white/10">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                    Center Notice Board
                  </h3>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Melvisharam Center</span>
              </div>

              {announcementsList.length === 0 ? (
                <p className="text-xs text-neutral-400 py-3">No active notifications today.</p>
              ) : (
                <div className="space-y-3">
                  {announcementsList.slice(0, 3).map((ann) => (
                    <div key={ann.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      <div className="min-w-0">
                        <strong className="block text-xs text-white font-bold">{ann.title}</strong>
                        <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{ann.content}</p>
                        <span className="text-[10px] text-neutral-500 mt-1 block font-mono">{ann.date} • {ann.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: ATTENDANCE HUB
        ============================================================ */}
        {activeTab === 'attendance' && (
          <div className="apple-glass-card p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight font-heading">
                  Attendance & Regularity Records
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Verified log of student presence at Arise & Shine Learning Point.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                Today's Status: {s.attendance?.todayStatus || 'Present'}
              </div>
            </div>

            {/* Session History List */}
            <div className="space-y-3">
              {(s.attendance?.recentHistory || []).map((h, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${h.status === 'Present' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <div>
                      <strong className="block text-xs text-white font-semibold">{h.date}</strong>
                      <span className="text-[11px] text-neutral-400">{h.note || 'Evening tuition session'}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    h.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: HOMEWORK & WORKSHEETS
        ============================================================ */}
        {activeTab === 'homework' && (
          <div className="apple-glass-card p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight font-heading">
                  School Homework Supervision
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Review homework assignments, upload completed solutions, and view tuition remarks.
                </p>
              </div>
            </div>

            {filteredHomeworks.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No homework worksheets assigned currently.</p>
            ) : (
              <div className="space-y-4">
                {filteredHomeworks.map((hw) => (
                  <div key={hw.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          {hw.subject}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{hw.title}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-neutral-300">
                        Due: {hw.dueDate}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">{hw.description}</p>
                    {hw.teacherRemark && (
                      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                        <strong>Tuition Faculty Feedback:</strong> {hw.teacherRemark}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB: TUITION FEE ACCOUNT (APPLE CARD STYLE)
        ============================================================ */}
        {activeTab === 'fee' && (
          <div className="apple-glass-card p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight font-heading">
                  Tuition Fee Statement
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Official certified statement of tuition payments for {s.name}.
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isFeePaid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {s.fee?.status || 'PAID'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block">
                  Monthly Tuition Fee
                </span>
                <div className="text-3xl font-black text-white font-heading">
                  ₹{s.fee?.monthlyFee || 1333}
                </div>
                <p className="text-[11px] text-neutral-400">Cycle: Monthly tuition & supervision</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block">
                  Last Payment Record
                </span>
                <div className="text-base font-bold text-white">
                  Paid on {s.fee?.lastPaidDate || '2026-11-19'}
                </div>
                <p className="text-[11px] text-neutral-400">
                  Mode: <strong className="text-neutral-200">{s.fee?.paymentMode || 'GPay / Cash'}</strong> • Receipt: <strong className="text-neutral-200">{s.fee?.receiptNo || 'ASLP-REC-76192'}</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-400 flex items-center justify-between">
              <span>Next cycle due: <strong className="text-white">{s.fee?.nextDueDate || '2026-12-12'}</strong></span>
              <a href="tel:6379840006" className="text-amber-400 hover:underline font-semibold">
                Contact Tuition Office
              </a>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: FACULTY DESK / HELPDESK
        ============================================================ */}
        {activeTab === 'helpdesk' && (
          <div className="apple-glass-card p-6 sm:p-8 border border-white/10 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight font-heading">
                Faculty Communication Desk
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Reach center faculty leadership directly via phone, WhatsApp, or instant message.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href="tel:6379840006" 
                className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition active:scale-95 flex items-center space-x-3.5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-sm text-white font-bold">Call Center Primary</strong>
                  <span className="text-xs text-emerald-400 font-mono font-bold">6379840006</span>
                </div>
              </a>

              <a 
                href="tel:9842385666" 
                className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition active:scale-95 flex items-center space-x-3.5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-sm text-white font-bold">Call Center Secondary</strong>
                  <span className="text-xs text-emerald-400 font-mono font-bold">9842385666</span>
                </div>
              </a>
            </div>

            {/* Direct inquiry form */}
            <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Send Direct Message to Tuition Leadership
              </h4>
              {feedbackSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  {feedbackSuccessMsg}
                </div>
              )}
              <input
                type="text"
                value={feedbackSubject}
                onChange={(e) => setFeedbackSubject(e.target.value)}
                placeholder="Subject / Topic (e.g. Leave request, Exam schedule)"
                className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-indigo-400"
              />
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Write message here..."
                rows={4}
                className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-indigo-400"
                required
              />
              <button
                type="submit"
                disabled={isSendingFeedback}
                className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-black text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
              >
                {isSendingFeedback ? 'Transmitting...' : 'Send Message to Faculty'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ============================================================
          APPLE WALLET TITANIUM STUDENT PASS MODAL
      ============================================================ */}
      {isIdCardModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn"
          onClick={() => setIsIdCardModalOpen(false)}
        >
          <div 
            className="relative max-w-sm w-full perspective-1000"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setIsIdCardModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* 3D Flip Card */}
            <div 
              className={`w-full transition-transform duration-700 transform-style-3d cursor-pointer ${
                isCardFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={() => setIsCardFlipped(!isCardFlipped)}
            >
              {/* FRONT: Apple Wallet Titanium Pass */}
              <div className="w-full apple-wallet-pass rounded-3xl p-6 border border-white/20 shadow-2xl backface-hidden relative overflow-hidden animate-titanium-sheen">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
                    <div>
                      <strong className="block text-xs font-black text-white tracking-wider font-heading">
                        ARISE & SHINE
                      </strong>
                      <span className="text-[9px] uppercase tracking-widest text-amber-400 font-mono">
                        Learning Point
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">NFC PASS</span>
                </div>

                {/* Body Details */}
                <div className="mt-5 flex items-center gap-4">
                  <img 
                    src={s.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"} 
                    alt={s.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/20 shrink-0" 
                  />
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-white tracking-tight truncate font-heading">
                      {s.name}
                    </h3>
                    <p className="text-xs text-neutral-300 font-mono">{s.id}</p>
                    <p className="text-[11px] text-neutral-400 mt-1">{s.grade}</p>
                  </div>
                </div>

                {/* Footer Chips */}
                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                  <span>ROLL: {s.rollNo}</span>
                  <span>VALID: 2026-2027</span>
                  <span className="text-amber-400 font-bold">TAP TO FLIP ↻</span>
                </div>
              </div>

              {/* BACK OF PASS */}
              <div className="w-full apple-wallet-pass rounded-3xl p-6 border border-white/20 shadow-2xl backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-black text-white uppercase tracking-wider mb-2">
                    Official Tuition Identification
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    This credential confirms full academic enrollment at Arise & Shine Learning Point, Melvisharam.
                  </p>
                  <div className="mt-4 space-y-1 text-[11px] text-neutral-400">
                    <div>Parent Contact: <strong className="text-white">{s.parentPhone}</strong></div>
                    <div>Center Phone: <strong className="text-white">6379840006</strong></div>
                    <div>Location: Melvisharam Campus</div>
                  </div>
                </div>

                <div className="text-center pt-3 border-t border-white/10">
                  <span className="text-[10px] text-amber-400 font-bold font-mono">
                    TAP CARD TO FLIP FRONT ↻
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          NATIVE IOS FLOATING MOBILE BOTTOM DOCK
      ============================================================ */}
      <div className="sm:hidden fixed bottom-4 inset-x-4 z-40">
        <div className="ios-floating-dock rounded-full px-3 py-2 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-2 rounded-full flex flex-col items-center transition cursor-pointer ${
              activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-neutral-400'
            }`}
          >
            <School className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`p-2 rounded-full flex flex-col items-center transition cursor-pointer ${
              activeTab === 'attendance' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('homework')}
            className={`p-2 rounded-full flex flex-col items-center transition cursor-pointer ${
              activeTab === 'homework' ? 'text-blue-400 font-bold' : 'text-neutral-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">Homework</span>
          </button>

          <button
            onClick={() => setActiveTab('fee')}
            className={`p-2 rounded-full flex flex-col items-center transition cursor-pointer ${
              activeTab === 'fee' ? 'text-amber-400 font-bold' : 'text-neutral-400'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">Tuition Fee</span>
          </button>

          <button
            onClick={() => setIsIdCardModalOpen(true)}
            className="p-2 rounded-full flex flex-col items-center text-neutral-400 transition cursor-pointer hover:text-white"
          >
            <IdCard className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">Pass</span>
          </button>
        </div>
      </div>

    </div>
  );
}
