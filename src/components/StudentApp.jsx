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
  Award
} from 'lucide-react';

// Lightbox Photo Modal for Homework Worksheets
function PhotoModal({ isOpen, onClose, photoUrl, title }) {
  if (!isOpen || !photoUrl) return null;
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white truncate">{title || 'Worksheet Document'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition text-base font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="flex justify-center bg-black/40 rounded-2xl overflow-hidden max-h-[70vh]">
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

// Circular Attendance Donut SVG Component
function AttendanceDonut({ percentage, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (pct) => {
    if (pct >= 90) return '#10b981'; // Emerald
    if (pct >= 75) return '#f59e0b'; // Amber
    return '#f43f5e'; // Rose
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(percentage)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl sm:text-2xl font-black text-white font-heading leading-none">
          {percentage}%
        </span>
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mt-0.5">
          Rate
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
  // Current Student Data
  const [currentStudent, setCurrentStudent] = useState(student);

  // Tabs: 'dashboard', 'attendance', 'homework', 'fee', 'idcard', 'helpdesk'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Homework Desk state
  const [homeworksList, setHomeworksList] = useState([]);
  const [hwSubject, setHwSubject] = useState('Mathematics');
  const [hwDescription, setHwDescription] = useState('');
  const [hwPhotoBase64, setHwPhotoBase64] = useState('');
  const [isSubmittingHw, setIsSubmittingHw] = useState(false);
  const [hwSuccessMsg, setHwSuccessMsg] = useState('');
  const [hwFilterSubject, setHwFilterSubject] = useState('All');

  // Helpdesk Query state
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [fbCategory, setFbCategory] = useState('Academics');
  const [fbMessage, setFbMessage] = useState('');
  const [isSubmittingFb, setIsSubmittingFb] = useState(false);
  const [fbSuccessMsg, setFbSuccessMsg] = useState('');

  // Announcements
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Photo Lightbox modal
  const [modalPhoto, setModalPhoto] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  // 3D ID Card Flip state
  const [isIdCardFlipped, setIsIdCardFlipped] = useState(false);

  // Sync external student changes
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

      // Multi-window / multi-device instant sync
      const pollTimer = setInterval(() => {
        fetchStudentData(s.id);
      }, 5000);

      const handleStorage = (e) => {
        if (e.key === 'arise_sync_ping') fetchStudentData(s.id);
      };
      window.addEventListener('storage', handleStorage);

      return () => {
        clearInterval(pollTimer);
        window.removeEventListener('storage', handleStorage);
      };
    }
  }, [s?.id]);

  // Trigger confetti for high achievement
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#4f46e5', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
      });
    } catch (e) {}
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
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

  // 1-Click Demo Login Helper
  const handleDemoLogin = (id, pass) => {
    setLoginId(id);
    setLoginPassword(pass);
  };

  // Image processor for homework worksheets
  const processImageFile = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file, (base64) => setHwPhotoBase64(base64));
    }
  };

  // Submit Homework by Parent / Student
  const handleHomeworkSubmit = async (e) => {
    e.preventDefault();
    if (!hwDescription.trim() && !hwPhotoBase64) {
      alert('Please describe homework or attach a picture.');
      return;
    }

    setIsSubmittingHw(true);
    setHwSuccessMsg('');

    try {
      const res = await fetch('/api/homeworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: s.id,
          subject: hwSubject,
          description: hwDescription,
          photoUrl: hwPhotoBase64,
          schoolName: s.school,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setHomeworksList([result.homework, ...homeworksList]);
        setHwDescription('');
        setHwPhotoBase64('');
        setHwSuccessMsg('Homework shared with Tuition Faculty! We will review during tuition hours.');
        triggerCelebration();
        setTimeout(() => setHwSuccessMsg(''), 6000);
      } else {
        alert('Could not submit worksheet.');
      }
    } catch (err) {
      alert('Network error submitting homework.');
    } finally {
      setIsSubmittingHw(false);
    }
  };

  // Submit Feedback / Query
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!fbMessage.trim()) {
      alert('Please write your message.');
      return;
    }

    setIsSubmittingFb(true);
    setFbSuccessMsg('');

    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: s.id,
          category: fbCategory,
          message: fbMessage,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setFeedbacksList([result.feedback, ...feedbacksList]);
        setFbMessage('');
        setFbSuccessMsg('Query submitted to Center Director. You will receive a response shortly.');
        setTimeout(() => setFbSuccessMsg(''), 6000);
      } else {
        alert('Could not submit inquiry.');
      }
    } catch (err) {
      alert('Failed to send query.');
    } finally {
      setIsSubmittingFb(false);
    }
  };

  // ============================================================
  // 1. PUBLIC LOGGED-OUT VIEW (STUDENT PORTAL ACCESS GATEWAY)
  // ============================================================
  if (!s) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-14 bg-transparent text-white relative">
        <div className="max-w-md w-full relative z-10">
          {/* Main Login Card with Luxury Glass */}
          <div className="bg-[#0e162b]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-9 border border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden text-white">
            {/* Luminous Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-600"></div>

            {/* Crest & Title */}
            <div className="text-center mb-7">
              <div className="inline-flex p-3.5 bg-gradient-to-br from-indigo-500/20 to-amber-500/10 text-amber-400 rounded-3xl mb-3 border border-amber-400/30 shadow-inner">
                <School className="w-9 h-9" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
                Student & Parent Portal
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1.5">
                Official Tuition Academic Records & Attendance System • Melvisharam
              </p>
            </div>

            {/* Error Banner */}
            {loginError && (
              <div className="mb-5 p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-2xl flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Student ID Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. ASLP-101"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition shadow-xs placeholder:text-slate-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Portal Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-semibold text-white focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition shadow-xs placeholder:text-slate-500"
                  />
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <span>{isLoggingIn ? 'Verifying Student Identity...' : 'Access Student Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Demo Accounts */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Quick Test Logins (1-Click)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('ASLP-101', 'pass101')}
                  className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/50 rounded-xl text-left transition cursor-pointer text-white"
                >
                  <strong className="block text-white text-[11px] truncate">Mohammed Rehan</strong>
                  <span className="text-[10px] text-amber-400 font-mono">ASLP-101 • Class 10</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('ASLP-102', 'pass102')}
                  className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/50 rounded-xl text-left transition cursor-pointer text-white"
                >
                  <strong className="block text-white text-[11px] truncate">Ayesha Fathima</strong>
                  <span className="text-[10px] text-amber-400 font-mono">ASLP-102 • Class 12</span>
                </button>
              </div>
            </div>

            {/* Install Native App Card */}
            {!isStandaloneApp && (
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border border-amber-400/30 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-white font-extrabold text-xs">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Download Dedicated Mobile App</span>
                </div>
                <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                  Install Arise & Shine APK on your phone for full-screen access & instant attendance notifications.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={onOpenInstallModal}
                    className="flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Install on Phone</span>
                  </button>
                  <a
                    href="/arise-and-shine-student.apk"
                    download="Arise-and-Shine-Student.apk"
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer text-center active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Student APK (.apk)</span>
                  </a>
                </div>
              </div>
            )}

            {/* Helpline footer */}
            <div className="mt-5 text-center text-[11px] text-slate-400 space-y-1">
              <div>
                Helpline: <a href="tel:6379840006" className="text-amber-400 font-semibold hover:underline">6379840006</a> / <a href="tel:9842385666" className="text-amber-400 font-semibold hover:underline">9842385666</a>
              </div>
              <a 
                href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-400 hover:underline font-semibold inline-flex items-center gap-1"
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

  // Filtered homework list
  const filteredHomeworks = hwFilterSubject === 'All'
    ? homeworksList
    : homeworksList.filter(h => h.subject.toLowerCase().includes(hwFilterSubject.toLowerCase()));

  // ============================================================
  // 2. LOGGED-IN UNIVERSITY ACADEMIC PORTAL
  // ============================================================
  return (
    <div className="min-h-screen bg-transparent pb-28 sm:pb-16 text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Desktop Sticky University Tabs (Hidden on mobile; mobile uses floating bottom dock) */}
      <div className="hidden sm:block bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 sticky top-15 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar text-xs font-bold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-400/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-400/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Attendance ({attPct}%)</span>
            </button>

            <button
              onClick={() => setActiveTab('homework')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'homework'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-400/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Homework Desk</span>
              {homeworksList.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  {homeworksList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('fee')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'fee'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-400/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Tuition Fee</span>
              <span className={`w-2 h-2 rounded-full ${isFeePaid ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`}></span>
            </button>

            <button
              onClick={() => setActiveTab('idcard')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'idcard'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-400/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <IdCard className="w-4 h-4" />
              <span>Digital Student ID</span>
            </button>

            <button
              onClick={() => setActiveTab('helpdesk')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'helpdesk'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-400/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Queries</span>
            </button>

            <button
              onClick={() => fetchStudentData(s.id)}
              disabled={isLoadingData}
              className="p-2 ml-auto text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition cursor-pointer"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-6">

        {/* ============================================================ */}
        {/* TAB 1: ACADEMIC DASHBOARD                                    */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 1. STUDENT EXECUTIVE IDENTITY HERO CARD */}
            <div className="bg-gradient-to-br from-slate-950 via-[#0d162d] to-[#111c38] text-white rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-700/80 relative overflow-hidden">
              {/* Luminous Glow Orbs */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
                {/* Avatar & Details */}
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={s.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.id}`}
                      alt={s.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl ring-4 ring-amber-400/20"
                    />
                    <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading truncate">
                        {s.name}
                      </h1>
                      <span className="text-[11px] font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                        {s.id}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 truncate">
                      {s.grade} • <span className="text-slate-400">{s.school}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-2.5 flex-wrap text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{s.attendance?.todayStatus === 'Present' ? 'Present in Class' : (s.attendance?.todayStatus || 'Active Student')}</span>
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Roll: <strong>{s.rollNo}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action: Digital ID shortcut */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab('idcard')}
                    className="w-full md:w-auto py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
                  >
                    <IdCard className="w-4 h-4 text-slate-950" />
                    <span>Open Digital Student ID</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. THREE HIGH-IMPACT UNIVERSITY METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Attendance Card with Donut Chart */}
              <div 
                onClick={() => setActiveTab('attendance')}
                className="bg-[#0e162b]/85 backdrop-blur-xl rounded-3xl p-5 border border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:border-indigo-400/60 hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer group text-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Attendance Performance</span>
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition border border-indigo-500/20">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-white font-heading">
                      {s.attendance?.attendedClasses || 0} / {s.attendance?.totalClasses || 0}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">Classes Attended</p>
                    <p className="text-[11px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{attPct >= 90 ? 'Outstanding Regularity' : 'Good Consistency'}</span>
                    </p>
                  </div>
                  <AttendanceDonut percentage={attPct} size={84} strokeWidth={8} />
                </div>
              </div>

              {/* Homework Card */}
              <div 
                onClick={() => setActiveTab('homework')}
                className="bg-[#0e162b]/85 backdrop-blur-xl rounded-3xl p-5 border border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:border-indigo-400/60 hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer group text-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">School Homework</span>
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition border border-indigo-500/20">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black font-heading text-white">{homeworksList.length}</span>
                  <span className="text-xs text-slate-400 font-medium">Worksheets Shared</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Submit school worksheets for supervision by tuition faculty.
                </p>
                <p className="text-[11px] text-amber-400 font-bold mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Homework Desk</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </p>
              </div>

              {/* Tuition Fee Card */}
              <div 
                onClick={() => setActiveTab('fee')}
                className="bg-[#0e162b]/85 backdrop-blur-xl rounded-3xl p-5 border border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:border-emerald-400/60 hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group text-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Fee Account</span>
                  <div className={`p-2 rounded-xl transition ${isFeePaid ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-xl font-black font-heading ${isFeePaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isFeePaid ? 'PAID IN FULL' : 'PAYMENT DUE'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Monthly: ₹{s.fee?.monthlyFee?.toLocaleString('en-IN') || '1,500'} • Next: {s.fee?.nextDueDate || '5th Next Month'}
                </p>
                <p className="text-[11px] text-amber-400 font-bold mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Official Fee Statement</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </p>
              </div>
            </div>

            {/* 3. QUICK NAVIGATION TILES */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                Quick Navigation & Tools
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('idcard')}
                  className="p-4 bg-[#0e162b]/80 backdrop-blur-xl rounded-2xl border border-slate-800 hover:border-amber-400/60 hover:shadow-lg transition text-left cursor-pointer group text-white"
                >
                  <div className="p-2.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-xl w-fit mb-2 group-hover:scale-110 transition">
                    <IdCard className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xs text-white block">Student ID Card</span>
                  <span className="text-[10px] text-slate-400">Digital verified credential</span>
                </button>

                <button
                  onClick={() => setActiveTab('attendance')}
                  className="p-4 bg-[#0e162b]/80 backdrop-blur-xl rounded-2xl border border-slate-800 hover:border-emerald-400/60 hover:shadow-lg transition text-left cursor-pointer group text-white"
                >
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl w-fit mb-2 group-hover:scale-110 transition">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xs text-white block">Attendance Hub</span>
                  <span className="text-[10px] text-slate-400">Session logs & stats</span>
                </button>

                <button
                  onClick={() => setActiveTab('homework')}
                  className="p-4 bg-[#0e162b]/80 backdrop-blur-xl rounded-2xl border border-slate-800 hover:border-indigo-400/60 hover:shadow-lg transition text-left cursor-pointer group text-white"
                >
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl w-fit mb-2 group-hover:scale-110 transition">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xs text-white block">Homework Desk</span>
                  <span className="text-[10px] text-slate-400">Upload & track notes</span>
                </button>

                <button
                  onClick={() => setActiveTab('helpdesk')}
                  className="p-4 bg-[#0e162b]/80 backdrop-blur-xl rounded-2xl border border-slate-800 hover:border-amber-400/60 hover:shadow-lg transition text-left cursor-pointer group text-white"
                >
                  <div className="p-2.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-xl w-fit mb-2 group-hover:scale-110 transition">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xs text-white block">Helpdesk Query</span>
                  <span className="text-[10px] text-slate-400">Direct faculty support</span>
                </button>
              </div>
            </div>

            {/* 4. NOTICE BOARD & ANNOUNCEMENTS */}
            <div className="bg-[#0e162b]/85 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.5)] text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white">Center Notice Board</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Official Circulars</span>
              </div>

              {announcementsList.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No new announcements today.</p>
              ) : (
                <div className="space-y-3">
                  {announcementsList.slice(0, 3).map((ann, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition text-white">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {ann.priority || 'Notice'}
                          </span>
                          <span className="text-xs font-bold text-white">{ann.title}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{ann.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">{ann.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ATTENDANCE HUB                                        */}
        {/* ============================================================ */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-[#0e162b]/85 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.5)] text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white font-heading">
                      Attendance & Regularity Analytics
                    </h2>
                    <p className="text-xs text-slate-400">Official Melvisharam center academic records</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <AttendanceDonut percentage={attPct} size={70} strokeWidth={7} />
                  <div>
                    <span className="text-xs text-slate-400 font-extrabold uppercase block">Overall Rate</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {attPct >= 90 ? '🌟 Outstanding Regularity' : 'Good Attendance'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-indigo-500/20 text-center">
                  <span className="text-[11px] text-slate-400 block font-medium">Total Sessions</span>
                  <span className="text-2xl font-black text-white font-heading mt-0.5">{s.attendance?.totalClasses || 0}</span>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-emerald-500/20 text-center">
                  <span className="text-[11px] text-slate-400 block font-medium">Classes Attended</span>
                  <span className="text-2xl font-black text-emerald-400 font-heading mt-0.5">{s.attendance?.attendedClasses || 0}</span>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-rose-500/20 text-center">
                  <span className="text-[11px] text-slate-400 block font-medium">Classes Absent</span>
                  <span className="text-2xl font-black text-rose-400 font-heading mt-0.5">
                    {Math.max(0, (s.attendance?.totalClasses || 0) - (s.attendance?.attendedClasses || 0))}
                  </span>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-amber-500/20 text-center">
                  <span className="text-[11px] text-slate-400 block font-medium">Today's Status</span>
                  <span className="text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    {s.attendance?.todayStatus || 'Present'}
                  </span>
                </div>
              </div>

              {/* Attendance Log List */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  Recent Session Logs
                </h4>
                <div className="space-y-2">
                  {(s.attendance?.recentHistory || []).map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition text-white"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          h.status === 'Present' ? 'bg-emerald-400' : h.status === 'Late' ? 'bg-amber-400' : 'bg-rose-400'
                        }`}></span>
                        <div>
                          <span className="font-bold text-white font-mono">{h.date}</span>
                          <span className="text-slate-400 block text-[11px]">{h.note || 'Evening Session (5:00 PM – 9:30 PM)'}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl font-bold text-[10px] ${
                        h.status === 'Present'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : h.status === 'Late'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: HOMEWORK & ACADEMICS DESK                             */}
        {/* ============================================================ */}
        {activeTab === 'homework' && (
          <div className="space-y-6">
            <div className="bg-[#0e162b]/85 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.5)] text-white">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800 mb-6">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white font-heading">
                    School Homework Desk
                  </h2>
                  <p className="text-xs text-slate-400">
                    Share homework given by school. Our tuition masters guide and verify it during evening tuition hours.
                  </p>
                </div>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleHomeworkSubmit} className="p-4 sm:p-6 bg-slate-900/80 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  Submit New School Worksheet or Problem Sheet
                </h3>

                {hwSuccessMsg && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{hwSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                      Subject *
                    </label>
                    <select
                      value={hwSubject}
                      onChange={(e) => setHwSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science - Physics">Science - Physics</option>
                      <option value="Science - Chemistry">Science - Chemistry</option>
                      <option value="Science - Biology">Science - Biology</option>
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Social Science">Social Science</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="General Worksheet">General Worksheet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                      Enrolled School
                    </label>
                    <input
                      type="text"
                      disabled
                      value={s.school || 'Islamiah Higher Secondary School'}
                      className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    Homework Instructions / Chapter & Page Numbers
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Exercise 4.2 questions 1 to 5. Needs explanation on trigonometry formula."
                    value={hwDescription}
                    onChange={(e) => setHwDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    Attach Notebook or Worksheet Photo
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-slate-200 cursor-pointer transition shadow-xs">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Take or Select Picture</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    {hwPhotoBase64 && (
                      <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-amber-400/40 shadow-xs">
                        <img
                          src={hwPhotoBase64}
                          alt="Worksheet Preview"
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                        />
                        <span className="text-xs text-amber-300 font-bold">Picture attached!</span>
                        <button
                          type="button"
                          onClick={() => setHwPhotoBase64('')}
                          className="text-xs text-rose-400 hover:text-rose-300 font-bold ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    disabled={isSubmittingHw}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingHw ? 'Submitting...' : 'Send to Tuition Master'}</span>
                  </button>
                </div>
              </form>

              {/* Homework List */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Worksheets Shared ({homeworksList.length})
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-medium">Filter:</span>
                    <select
                      value={hwFilterSubject}
                      onChange={(e) => setHwFilterSubject(e.target.value)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white"
                    >
                      <option value="All">All Subjects</option>
                      <option value="Math">Maths</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>

                {filteredHomeworks.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                    No homework recorded for this category yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredHomeworks.map((hw) => (
                      <div
                        key={hw.id}
                        className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3 relative hover:border-slate-700 transition text-white"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                              {hw.subject}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-1.5 leading-snug">
                              {hw.description}
                            </h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            hw.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {hw.status}
                          </span>
                        </div>

                        {hw.photoUrl && (
                          <div className="flex items-center gap-2">
                            <img
                              src={hw.photoUrl}
                              alt="Worksheet thumbnail"
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700 cursor-pointer hover:opacity-80 transition"
                              onClick={() => {
                                setModalPhoto(hw.photoUrl);
                                setModalTitle(`${hw.subject} Worksheet`);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setModalPhoto(hw.photoUrl);
                                setModalTitle(`${hw.subject} Worksheet`);
                              }}
                              className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Worksheet Picture</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                          <span>Date: {hw.submittedAt}</span>
                          <span className="text-amber-400 font-semibold">{hw.schoolName || s.school}</span>
                        </div>

                        {hw.adminRemarks && (
                          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-300">
                            <strong className="text-white">Tuition Master Note:</strong> {hw.adminRemarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: TUITION FEE & STATEMENT                               */}
        {/* ============================================================ */}
        {activeTab === 'fee' && (
          <div className="space-y-6">
            <div className="bg-[#0e162b]/85 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.5)] text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl ${isFeePaid ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white font-heading">
                      Tuition Fee Account & Ledger
                    </h2>
                    <p className="text-xs text-slate-400">Official fee records for {s.name}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-xs ${
                    isFeePaid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isFeePaid ? 'FEES: PAID IN FULL' : 'PAYMENT DUE'}</span>
                </span>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Monthly Tuition Fee</span>
                  <span className="text-2xl font-black text-white font-heading">
                    ₹{s.fee?.monthlyFee?.toLocaleString('en-IN') || '1,500'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">Per calendar month</span>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Payment Method</span>
                  <span className="text-sm font-bold text-white block">
                    {s.fee?.paymentMode || 'Cash at Center'}
                  </span>
                  <span className="text-xs text-amber-400 block mt-1 font-mono">
                    Receipt: {s.fee?.receiptNo || 'ASLP-REC-2025-084'}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${isFeePaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                  <span className="text-xs font-extrabold uppercase tracking-wider block mb-1">Next Due Date</span>
                  <span className="text-xl font-black font-heading block">
                    {s.fee?.nextDueDate || '05th of Next Month'}
                  </span>
                  <span className="text-[11px] mt-1 block font-medium opacity-90">
                    {isFeePaid ? 'Account is completely settled.' : 'Kindly pay the pending tuition fee.'}
                  </span>
                </div>
              </div>

              {/* Official Statement Ledger */}
              <div className="border border-slate-800 rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-xl relative text-white">
                <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-800 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <img src="/logo.png" alt="Center Logo" className="w-9 h-9 object-contain drop-shadow" />
                    <div>
                      <h4 className="text-xs font-black text-white font-heading uppercase">
                        ARISE AND SHINE LEARNING POINT
                      </h4>
                      <p className="text-[10px] text-slate-400">Melvisharam, Ranipet Dist • Coaching LKG to 12th Std</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                      RECEIPT: {s.fee?.receiptNo || 'ASLP-REC-2025-084'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Date: {s.fee?.lastPaidDate || 'Recent Session'}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Student Name:</span>
                    <span className="font-bold text-white">{s.name} ({s.id})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Class & School:</span>
                    <span className="font-bold text-white">{s.grade} • {s.school}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Particulars:</span>
                    <span className="font-bold text-white">Monthly Tuition Fee & Practice Worksheets</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-sm">
                    <span className="text-white">Total Settled Amount:</span>
                    <span className="text-emerald-400">₹{s.fee?.monthlyFee?.toLocaleString('en-IN') || '1,500'} ({isFeePaid ? 'PAID' : 'PENDING'})</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Certified Tuition Record</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Melvisharam Center Office</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: 3D INTERACTIVE DIGITAL STUDENT ID CARD                */}
        {/* ============================================================ */}
        {activeTab === 'idcard' && (
          <div className="space-y-6">
            <div className="max-w-md mx-auto">
              {/* Interactive Flip Action Helper */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>3D Digital ID Badge</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsIdCardFlipped(!isIdCardFlipped)}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{isIdCardFlipped ? 'Show Front' : 'Flip to Back'}</span>
                </button>
              </div>

              {/* Interactive Card Container */}
              <div 
                className="w-full min-h-[460px] cursor-pointer"
                onClick={() => setIsIdCardFlipped(!isIdCardFlipped)}
              >
                {!isIdCardFlipped ? (
                  /* FRONT SIDE */
                  <div className="w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-amber-400/80 relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

                    {/* ID Card Header */}
                    <div className="text-center pb-4 border-b border-white/10 mb-5">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <img src="/logo.png" alt="Center Crest" className="w-10 h-10 object-contain drop-shadow" />
                        <div>
                          <h2 className="text-sm font-black tracking-wider text-amber-300 font-heading uppercase">
                            ARISE AND SHINE
                          </h2>
                          <p className="text-[10px] text-slate-300 tracking-widest uppercase">
                            LEARNING POINT • MELVISHARAM
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold tracking-widest text-blue-200 bg-white/10 px-3 py-0.5 rounded-full uppercase">
                        Official Student Identity Card
                      </span>
                    </div>

                    {/* Photo */}
                    <div className="flex flex-col items-center mb-5">
                      <div className="relative">
                        <img
                          src={s.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.id}`}
                          alt={s.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-amber-400 shadow-xl ring-4 ring-white/10"
                        />
                      </div>
                      <h3 className="text-lg font-black text-white mt-3 font-heading text-center">
                        {s.name}
                      </h3>
                      <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-3 py-0.5 rounded-full border border-amber-400/30 mt-1">
                        ID: {s.id}
                      </span>
                    </div>

                    {/* Information Matrix */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Roll Number:</span>
                        <span className="font-bold text-white font-mono">{s.rollNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Class / Grade:</span>
                        <span className="font-bold text-white">{s.grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">School:</span>
                        <span className="font-bold text-white text-right max-w-[180px] truncate">{s.school}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Parent / Guardian:</span>
                        <span className="font-bold text-white">{s.parentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Academic Session:</span>
                        <span className="font-bold text-amber-300 font-mono">2025 - 2026</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-white rounded-lg">
                          <QrCode className="w-7 h-7 text-slate-900" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-300 block font-semibold">Center Authorized</span>
                          <span className="text-[9px] text-amber-300">Tap to flip card</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Director Seal</span>
                    </div>
                  </div>
                ) : (
                  /* BACK SIDE */
                  <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-indigo-400/70 relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
                    <div className="text-center pb-3 border-b border-white/10 mb-4">
                      <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest">
                        EMERGENCY & CENTER PROTOCOL
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Arise & Shine Learning Point • Melvisharam</p>
                    </div>

                    <div className="space-y-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Center Location</span>
                        <p className="text-white font-medium text-xs mt-0.5">Melvisharam, Ranipet Dist, Tamil Nadu</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Helpline Numbers</span>
                        <p className="text-amber-300 font-mono font-bold mt-0.5">6379840006 / 9842385666</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Emergency Parent Contact</span>
                        <p className="text-emerald-400 font-mono font-bold mt-0.5">{s.parentPhone || 'Registered with center'}</p>
                      </div>
                    </div>

                    {/* Barcode */}
                    <div className="mt-5 p-3.5 bg-white rounded-2xl text-center">
                      <div className="flex justify-center items-center space-x-1 h-10 py-1">
                        {[4, 2, 6, 3, 5, 2, 7, 3, 4, 2, 8, 3, 5, 2, 6, 4, 3, 5, 2, 4, 6].map((w, i) => (
                          <div key={i} className="bg-slate-950 h-full" style={{ width: `${w}px` }}></div>
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-slate-800 font-bold block mt-1 tracking-widest">
                        *{s.id}*
                      </span>
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-[10px] text-slate-400">
                        This digital identity card is strictly institutional property. Managed exclusively by center administration.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Institution Verified Note */}
              <div className="mt-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center shadow-lg text-white">
                <div className="flex items-center justify-center gap-1.5 text-white font-extrabold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Tuition Verified Record</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Student details and photographs are verified and managed strictly by Tuition Center Administration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: QUERIES & HELPDESK                                    */}
        {/* ============================================================ */}
        {activeTab === 'helpdesk' && (
          <div className="space-y-6">
            <div className="bg-[#0e162b]/85 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.5)] space-y-6 text-white">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                <div className="p-3 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-2xl">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white font-heading">
                    Tuition Helpdesk & Query Box
                  </h2>
                  <p className="text-xs text-slate-400">
                    Send questions regarding academic progress or tuition timings directly to center faculty.
                  </p>
                </div>
              </div>

              {fbSuccessMsg && (
                <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{fbSuccessMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Query Category *
                    </label>
                    <select
                      value={fbCategory}
                      onChange={(e) => setFbCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="Academics">Academic Progress / Doubt in Subject</option>
                      <option value="Discipline">Discipline & Attendance</option>
                      <option value="Timings">Batch Timings / Bus Delay</option>
                      <option value="Fee Query">Tuition Fee Inquiry</option>
                      <option value="General Feedback">General Suggestion / Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Student Details
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${s.name} (ID: ${s.id})`}
                      className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Your Message / Question *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Write your message here for Arise & Shine Learning Point..."
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Queries reviewed directly by Center Faculty.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingFb}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-2xl text-xs shadow-md shadow-amber-500/20 inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingFb ? 'Sending Query...' : 'Submit Query to Admin'}</span>
                  </button>
                </div>
              </form>

              {/* Past Inquiries */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  Past Inquiries ({feedbacksList.length})
                </h3>

                {feedbacksList.length === 0 ? (
                  <div className="text-center py-6 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                    No inquiries submitted yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feedbacksList.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5 text-white"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded">
                            {fb.category}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">{fb.submittedAt}</span>
                        </div>

                        <p className="text-xs text-slate-200 font-medium">
                          "{fb.message}"
                        </p>

                        {fb.adminReply && (
                          <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                              <span>Admin Reply from Arise & Shine:</span>
                              <span className="text-slate-500 font-normal">{fb.repliedAt}</span>
                            </div>
                            <p className="text-slate-300">{fb.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* FLOATING iOS-STYLE BOTTOM NAVIGATION DOCK (MOBILE ONLY)       */}
      {/* ============================================================ */}
      <nav className="sm:hidden fixed bottom-3 left-3 right-3 z-40 bg-slate-950/95 backdrop-blur-2xl border border-amber-400/30 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <School className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'attendance' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('homework')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition cursor-pointer relative ${
            activeTab === 'homework' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Homework</span>
          {homeworksList.length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('fee')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'fee' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Fees</span>
        </button>

        <button
          onClick={() => setActiveTab('idcard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'idcard' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <IdCard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">ID Card</span>
        </button>
      </nav>

      {/* Expanded Photo Lightbox Modal */}
      <PhotoModal
        isOpen={Boolean(modalPhoto)}
        onClose={() => setModalPhoto(null)}
        photoUrl={modalPhoto}
        title={modalTitle}
      />
    </div>
  );
}
