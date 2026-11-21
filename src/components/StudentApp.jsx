import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  Calendar,
  Award,
  BookOpen,
  DollarSign,
  Bell,
  MessageSquare,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Send,
  Sparkles,
  Phone,
  School,
  IdCard,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Star,
  Check,
  FileText,
  MapPin,
  RefreshCw,
  Smartphone,
  Download,
  ChevronRight,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  Share2
} from 'lucide-react';
import PhotoModal from './PhotoModal';

export default function StudentApp({ 
  student, 
  onLogout, 
  onLoginSuccess, 
  onStudentUpdate,
  centerInfo,
  isStandaloneApp,
  onOpenInstallModal
}) {
  // Real-time local student state that syncs instantly whenever Admin makes any update
  const [currentStudent, setCurrentStudent] = useState(student);

  useEffect(() => {
    if (student) {
      setCurrentStudent(student);
    }
  }, [student]);

  // Active student reference
  const s = currentStudent || student;

  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // University Tab Navigation: 'dashboard', 'attendance', 'homework', 'fee', 'idcard', 'helpdesk'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Photo modal state (for viewing homework worksheets)
  const [modalPhoto, setModalPhoto] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  // Homework submission form state (for sharing school worksheets with tuition master)
  const [hwSubject, setHwSubject] = useState('Mathematics');
  const [hwDescription, setHwDescription] = useState('');
  const [hwPhotoBase64, setHwPhotoBase64] = useState('');
  const [isSubmittingHw, setIsSubmittingHw] = useState(false);
  const [hwSuccessMsg, setHwSuccessMsg] = useState('');
  const [hwFilterSubject, setHwFilterSubject] = useState('All');

  // Feedback / Helpdesk form state
  const [fbCategory, setFbCategory] = useState('Academics');
  const [fbMessage, setFbMessage] = useState('');
  const [isSubmittingFb, setIsSubmittingFb] = useState(false);
  const [fbSuccessMsg, setFbSuccessMsg] = useState('');

  // Fetched Data
  const [homeworksList, setHomeworksList] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load student-specific data with cache-busting timestamp for INSTANT synchronization
  const fetchStudentData = async (studId) => {
    if (!studId) return;
    try {
      const cacheBust = Date.now();
      const [hwRes, fbRes, annRes, studRes] = await Promise.all([
        fetch(`/api/homeworks?studentId=${studId}&_t=${cacheBust}`),
        fetch(`/api/feedbacks?studentId=${studId}&_t=${cacheBust}`),
        fetch(`/api/announcements?_t=${cacheBust}`),
        fetch(`/api/students/${studId}?_t=${cacheBust}`),
      ]);

      if (hwRes.ok) setHomeworksList(await hwRes.json());
      if (fbRes.ok) setFeedbacksList(await fbRes.json());
      if (annRes.ok) setAnnouncementsList(await annRes.json());
      if (studRes.ok) {
        const freshStudent = await studRes.json();
        if (freshStudent && freshStudent.id) {
          // Instant synchronous update to local student state
          setCurrentStudent(freshStudent);
          if (onStudentUpdate) onStudentUpdate(freshStudent);
          if (onLoginSuccess) onLoginSuccess(freshStudent);
        }
      }
    } catch (err) {
      console.error('Failed to sync student data:', err);
    }
  };

  // Ultra-responsive Instant Synchronization Listeners
  useEffect(() => {
    const studentIdToWatch = s?.id;
    if (!studentIdToWatch) {
      // Fetch public announcements even before login
      fetch(`/api/announcements?_t=${Date.now()}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => setAnnouncementsList(data))
        .catch(err => console.error('Failed to fetch announcements:', err));
      return;
    }

    // 1. Immediate initial fetch
    fetchStudentData(studentIdToWatch);

    // 2. High-speed 1.5s background polling so updates from phone or computer reflect within 1.5s
    const pollTimer = setInterval(() => {
      fetchStudentData(studentIdToWatch);
    }, 1500);

    // 3. Instant BroadcastChannel for 0-millisecond sync across tabs/windows
    let syncChannel;
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        syncChannel = new BroadcastChannel('arise_student_sync');
        syncChannel.onmessage = (event) => {
          if (event.data?.type === 'STUDENT_UPDATED') {
            fetchStudentData(studentIdToWatch);
          }
        };
      }
    } catch (e) {}

    // 4. Instant localStorage storage event listener (cross-window/browser sync)
    const handleStorageEvent = (e) => {
      if (e.key === 'arise_sync_ping') {
        fetchStudentData(studentIdToWatch);
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 5. Refocus & screen unlock instant fetch
    const handleRefocus = () => {
      fetchStudentData(studentIdToWatch);
    };
    window.addEventListener('focus', handleRefocus);
    document.addEventListener('visibilitychange', handleRefocus);

    return () => {
      clearInterval(pollTimer);
      if (syncChannel) syncChannel.close();
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleRefocus);
      document.removeEventListener('visibilitychange', handleRefocus);
    };
  }, [s?.id]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both your Student ID and Password.');
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
        setLoginError(data.error || 'Login failed. Please check credentials.');
      } else {
        setCurrentStudent(data.student);
        onLoginSuccess(data.student);
        fetchStudentData(data.student.id);
      }
    } catch (err) {
      setLoginError('Unable to connect to tuition server. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Convert uploaded worksheet image file to Base64 (only for school homework)
  const processImageFile = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
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
        canvas.width = width;
        canvas.height = height;
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
      alert('Please provide either homework instructions or upload a photo.');
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
        setHwSuccessMsg('Homework shared successfully! Tuition master will supervise it.');
        setTimeout(() => setHwSuccessMsg(''), 5000);
      } else {
        alert('Could not submit homework. Please try again.');
      }
    } catch (err) {
      alert('Failed to submit homework.');
    } finally {
      setIsSubmittingHw(false);
    }
  };

  // Submit Feedback / Query by Parent
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!fbMessage.trim()) {
      alert('Please enter your query or feedback message.');
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
        setFbSuccessMsg('Query submitted! Center Director & Faculty will reply shortly.');
        setTimeout(() => setFbSuccessMsg(''), 5000);
      } else {
        alert('Could not send feedback.');
      }
    } catch (err) {
      alert('Failed to send feedback.');
    } finally {
      setIsSubmittingFb(false);
    }
  };

  // ============================================================
  // 1. PUBLIC / LOGGED-OUT VIEW (STUDENT LOGIN)
  // ============================================================
  if (!s) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-md mx-auto">
          {/* Tuition Center Official Seal Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500"></div>

            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-blue-50 text-blue-700 rounded-2xl mb-3 shadow-inner">
                <School className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Student & Parent Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Official Tuition Academic Records & Attendance System
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student ID Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. ASLP-101"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Portal Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoggingIn ? 'Verifying Student ID...' : 'Access Student Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Install Prompt for Mobile Web Visitors */}
            {!isStandaloneApp && (
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-300/60 text-center">
                <div className="flex items-center justify-center gap-2 mb-1.5 text-slate-800 font-bold text-xs">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>Download Official Mobile App</span>
                </div>
                <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                  Install Arise & Shine to get full-screen access, instant updates, and view your academic profile without opening a browser.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={onOpenInstallModal}
                    className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Install App</span>
                  </button>
                  <a
                    href="/arise-and-shine.apk"
                    download="Arise-and-Shine.apk"
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download APK (.apk)</span>
                  </a>
                </div>
              </div>
            )}

            {/* Center Helpline & Map Link */}
            <div className="mt-5 text-center text-[11px] text-slate-400 space-y-1">
              <div>
                Need help? Call Center: <a href="tel:6379840006" className="text-slate-600 font-semibold hover:underline">6379840006</a> / <a href="tel:9842385666" className="text-slate-600 font-semibold hover:underline">9842385666</a>
              </div>
              <div>
                <a 
                  href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>Melvisharam Center Location (Google Maps)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate attendance colors
  const attPct = s.attendance?.percentage || 0;
  const attColor =
    attPct >= 90 ? 'bg-emerald-500' : attPct >= 75 ? 'bg-amber-500' : 'bg-rose-500';
  const attTextColor =
    attPct >= 90 ? 'text-emerald-700' : attPct >= 75 ? 'text-amber-700' : 'text-rose-700';

  // Fee status
  const isFeePaid = s.fee?.status === 'PAID';

  // Filtered homework list
  const filteredHomeworks = hwFilterSubject === 'All'
    ? homeworksList
    : homeworksList.filter(h => h.subject.toLowerCase().includes(hwFilterSubject.toLowerCase()));

  // ============================================================
  // 2. LOGGED-IN UNIVERSITY STUDENT PORTAL VIEW
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50/70 pb-28 sm:pb-12">
      {/* University Top Tab Navigation (Desktop / Tablet) */}
      <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar text-xs font-bold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Attendance ({attPct}%)</span>
            </button>

            <button
              onClick={() => setActiveTab('homework')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'homework'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Homework</span>
              {homeworksList.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-900 text-indigo-100">
                  {homeworksList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('fee')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'fee'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Tuition Fee</span>
              <span className={`w-2 h-2 rounded-full ${isFeePaid ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
            </button>

            <button
              onClick={() => setActiveTab('idcard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'idcard'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <IdCard className="w-4 h-4" />
              <span>Digital Student ID</span>
            </button>

            <button
              onClick={() => setActiveTab('helpdesk')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'helpdesk'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Queries</span>
            </button>

            <button
              onClick={() => fetchStudentData(s.id)}
              disabled={isLoadingData}
              className="p-2 ml-auto text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Refresh Live Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">

        {/* ============================================================ */}
        {/* TAB 1: UNIVERSITY DASHBOARD (HERO + METRICS + QUICK ACTIONS) */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. STUDENT IDENTITY HERO CARD */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                {/* Photo & Details (Only Admin can change photo via Admin App) */}
                <div className="flex items-center space-x-4">
                  <div className="relative shrink-0">
                    <img
                      src={s.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.id}`}
                      alt={s.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md ring-2 ring-white/10"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white font-heading">
                        {s.name}
                      </h1>
                      <span className="text-[11px] font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                        {s.id}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 flex items-center gap-2 truncate">
                      <span>{s.grade}</span>
                      <span>•</span>
                      <span className="text-slate-400 truncate">{s.school}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-[11px]">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{s.attendance?.todayStatus === 'Present' ? 'Present Today' : (s.attendance?.todayStatus || 'Active Student')}</span>
                      </span>
                      <span className="text-slate-400 font-mono">
                        Roll: {s.rollNo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Button: Open Digital ID ONLY (Fee button removed as requested) */}
                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button
                    onClick={() => setActiveTab('idcard')}
                    className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-white/20 cursor-pointer shadow-xs"
                  >
                    <IdCard className="w-4 h-4 text-amber-400" />
                    <span>View Student ID</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. THREE UNIVERSITY ACADEMIC METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Attendance Card */}
              <div 
                onClick={() => setActiveTab('attendance')}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-400 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-black font-heading ${attTextColor}`}>{attPct}%</span>
                  <span className="text-xs text-slate-400 font-medium">({s.attendance?.attendedClasses || 0}/{s.attendance?.totalClasses || 0} classes)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full rounded-full ${attColor}`} style={{ width: `${Math.min(attPct, 100)}%` }}></div>
                </div>
              </div>

              {/* Homework Card */}
              <div 
                onClick={() => setActiveTab('homework')}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-indigo-400 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">School Homework</span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black font-heading text-slate-900">{homeworksList.length}</span>
                  <span className="text-xs text-slate-400 font-medium">Worksheets Shared</span>
                </div>
                <p className="text-[11px] text-indigo-600 font-semibold mt-3 flex items-center gap-1">
                  <span>Open Homework Desk</span>
                  <ChevronRight className="w-3 h-3" />
                </p>
              </div>

              {/* Tuition Fee Card */}
              <div 
                onClick={() => setActiveTab('fee')}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-emerald-400 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Account</span>
                  <div className={`p-2 rounded-xl transition ${isFeePaid ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-rose-50 text-rose-600'}`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-xl font-black font-heading ${isFeePaid ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isFeePaid ? 'PAID IN FULL' : 'PAYMENT DUE'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-3">
                  Monthly: ₹{s.fee?.monthlyFee?.toLocaleString('en-IN') || '1,500'} • Next: {s.fee?.nextDueDate || '5th Next Month'}
                </p>
              </div>
            </div>

            {/* 3. UNIVERSITY QUICK ACCESS ACTION TILES (Print option removed) */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Navigation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('idcard')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 shadow-xs transition text-left cursor-pointer group"
                >
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit mb-2 group-hover:scale-110 transition">
                    <IdCard className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-900 block">Student ID Card</span>
                  <span className="text-[10px] text-slate-400">Digital university badge</span>
                </button>

                <button
                  onClick={() => setActiveTab('attendance')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-xs transition text-left cursor-pointer group"
                >
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-2 group-hover:scale-110 transition">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-900 block">Attendance Hub</span>
                  <span className="text-[10px] text-slate-400">Classes & regularity</span>
                </button>

                <button
                  onClick={() => setActiveTab('homework')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 shadow-xs transition text-left cursor-pointer group"
                >
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-2 group-hover:scale-110 transition">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-900 block">Homework Desk</span>
                  <span className="text-[10px] text-slate-400">Upload & view notes</span>
                </button>

                <button
                  onClick={() => setActiveTab('fee')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs transition text-left cursor-pointer group"
                >
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit mb-2 group-hover:scale-110 transition">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-900 block">Fee Statement</span>
                  <span className="text-[10px] text-slate-400">Official fee ledger</span>
                </button>
              </div>
            </div>

            {/* 4. ANNOUNCEMENTS & CIRCULARS */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Center Notice Board</h3>
                </div>
                <span className="text-[11px] text-slate-400">Latest Circulars</span>
              </div>

              {announcementsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No new announcements today.</p>
              ) : (
                <div className="space-y-2.5">
                  {announcementsList.slice(0, 3).map((ann, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {ann.priority || 'Notice'}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{ann.title}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{ann.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. CENTER LOCATION & CONTACT */}
            <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Arise and Shine Learning Point • Melvisharam</h4>
                  <p className="text-[11px] text-blue-200">
                    Timings: 5:00 PM – 9:30 PM | Helpline: 6379840006, 9842385666
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:6379840006"
                  className="text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition"
                >
                  Call Center
                </a>
                <a
                  href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition border border-white/20"
                >
                  Directions
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ATTENDANCE HUB (METERS, GRAPHS, SESSIONS)             */}
        {/* ============================================================ */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Attendance Analytics Overview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-heading">
                      Attendance & Regularity Analytics
                    </h2>
                    <p className="text-xs text-slate-500">Live track of academic sessions at Melvisharam center</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-black font-heading ${attTextColor}`}>{attPct}%</span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Cumulative Rate</p>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Regularity Rating</span>
                  <span className={attTextColor}>
                    {attPct >= 90 ? '🌟 Outstanding Regularity' : attPct >= 75 ? '👍 Good Attendance' : '⚠️ Improvement Required'}
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-700 ${attColor}`} style={{ width: `${Math.min(attPct, 100)}%` }}></div>
                </div>
              </div>

              {/* 4 Counter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-center">
                  <span className="text-[11px] text-slate-500 block">Total Classes</span>
                  <span className="text-xl font-black text-blue-900 font-heading">{s.attendance?.totalClasses || 0}</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-[11px] text-slate-500 block">Classes Attended</span>
                  <span className="text-xl font-black text-emerald-900 font-heading">{s.attendance?.attendedClasses || 0}</span>
                </div>
                <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100 text-center">
                  <span className="text-[11px] text-slate-500 block">Classes Absent</span>
                  <span className="text-xl font-black text-rose-900 font-heading">
                    {Math.max(0, (s.attendance?.totalClasses || 0) - (s.attendance?.attendedClasses || 0))}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100 text-center">
                  <span className="text-[11px] text-slate-500 block">Today's Status</span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full inline-block mt-1">
                    {s.attendance?.todayStatus || 'Present'}
                  </span>
                </div>
              </div>

              {/* Recent Attendance Session Logs */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Session Attendance History
                </h4>
                <div className="space-y-2">
                  {(s.attendance?.recentHistory || []).map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          h.status === 'Present' ? 'bg-emerald-500' : h.status === 'Late' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        <div>
                          <span className="font-bold text-slate-800">{h.date}</span>
                          <span className="text-slate-400 block text-[11px]">{h.note || 'Evening Tuition Session (5:00 PM - 9:30 PM)'}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                        h.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'Late'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
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
          <div className="space-y-6 animate-fadeIn">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 mb-5">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-heading">
                    School Homework Desk
                  </h2>
                  <p className="text-xs text-slate-500">
                    Share homework given by school. Our tuition masters will supervise and guide your child during tuition hours.
                  </p>
                </div>
              </div>

              {/* Upload Form (Allows parents/students to attach school worksheet photos) */}
              <form onSubmit={handleHomeworkSubmit} className="p-4 sm:p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  Submit New School Worksheet or Assignment
                </h3>

                {hwSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{hwSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Subject *
                    </label>
                    <select
                      value={hwSubject}
                      onChange={(e) => setHwSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      School Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={s.school || 'Islamiah Higher Secondary School'}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Homework Details / Page Numbers / Instructions
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Maths Exercise 5.3 Questions 1 to 4. To be completed before tomorrow's class."
                    value={hwDescription}
                    onChange={(e) => setHwDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                {/* Photo attachment from Camera / Gallery for school worksheets */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Attach Notebook or Worksheet Picture (Optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition shadow-xs">
                      <Camera className="w-4 h-4 text-indigo-600" />
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
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-indigo-200">
                        <img
                          src={hwPhotoBase64}
                          alt="Worksheet Preview"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <span className="text-xs text-indigo-900 font-medium">Picture attached!</span>
                        <button
                          type="button"
                          onClick={() => setHwPhotoBase64('')}
                          className="text-xs text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    disabled={isSubmittingHw}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingHw ? 'Submitting...' : 'Send to Tuition Master'}</span>
                  </button>
                </div>
              </form>

              {/* List of Submitted Homeworks */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Homework Logs ({homeworksList.length})
                  </h3>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">Filter:</span>
                    <select
                      value={hwFilterSubject}
                      onChange={(e) => setHwFilterSubject(e.target.value)}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                    >
                      <option value="All">All Subjects</option>
                      <option value="Math">Maths</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>
                </div>

                {filteredHomeworks.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No homework recorded for this category yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredHomeworks.map((hw) => (
                      <div
                        key={hw.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                              {hw.subject}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 mt-1.5 leading-snug">
                              {hw.description}
                            </h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            hw.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : hw.status === 'Reviewed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {hw.status}
                          </span>
                        </div>

                        {/* Photo Thumbnail */}
                        {hw.photoUrl && (
                          <div className="flex items-center gap-2">
                            <img
                              src={hw.photoUrl}
                              alt="Worksheet thumbnail"
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition"
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
                              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Worksheet Picture</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                          <span>Date: {hw.submittedAt}</span>
                          <span className="text-indigo-600 font-semibold">{hw.schoolName || s.school}</span>
                        </div>

                        {/* Teacher's Supervision Note */}
                        {hw.adminRemarks && (
                          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                            <strong>Tuition Master Note:</strong> {hw.adminRemarks}
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
        {/* TAB 4: TUITION FEE & STATEMENT (Print Option Removed)        */}
        {/* ============================================================ */}
        {activeTab === 'fee' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Fee Status Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl ${isFeePaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-heading">
                      Tuition Fee Account & Statement
                    </h2>
                    <p className="text-xs text-slate-500">Official fee ledger for {s.name}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-xs ${
                    isFeePaid ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white animate-pulse'
                  }`}
                >
                  {isFeePaid ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>FEES: PAID IN FULL</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>FEES: PAYMENT PENDING</span>
                    </>
                  )}
                </span>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 block mb-1">Monthly Tuition Fee</span>
                  <span className="text-2xl font-black text-slate-900 font-heading">
                    ₹{s.fee?.monthlyFee?.toLocaleString('en-IN') || '1,500'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">Per calendar month</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 block mb-1">Payment Method</span>
                  <span className="text-sm font-bold text-slate-800 block">
                    {s.fee?.paymentMode || 'Cash at Center'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1 font-mono">
                    Receipt No: {s.fee?.receiptNo || 'ASLP-REC-2025-084'}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${isFeePaid ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                  <span className="text-xs font-bold uppercase tracking-wider block mb-1">Next Due Date</span>
                  <span className="text-xl font-black font-heading block">
                    {s.fee?.nextDueDate || '05th of Next Month'}
                  </span>
                  <span className="text-[11px] mt-1 block font-medium opacity-90">
                    {isFeePaid ? 'Your account is in good standing.' : 'Kindly pay the pending tuition fee.'}
                  </span>
                </div>
              </div>

              {/* Official Receipt Statement (Print option removed as requested) */}
              <div className="border border-slate-200 rounded-3xl p-6 bg-gradient-to-b from-white to-slate-50 shadow-sm relative">
                <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-300 mb-4">
                  <div className="flex items-center space-x-2">
                    <img src="/logo.png" alt="Center Logo" className="w-8 h-8 object-contain" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 font-heading uppercase">
                        ARISE AND SHINE LEARNING POINT
                      </h4>
                      <p className="text-[10px] text-slate-500">Melvisharam, Ranipet Dist • Coaching LKG to 12th Std</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      RECEIPT: {s.fee?.receiptNo || 'ASLP-REC-2025-084'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Date: {s.fee?.lastPaidDate || 'Recent Session'}</p>
                  </div>
                </div>

                {/* Receipt Details Table */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-bold text-slate-800">{s.name} ({s.id})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Class & School:</span>
                    <span className="font-bold text-slate-800">{s.grade} • {s.school}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Academic Year:</span>
                    <span className="font-bold text-slate-800">2025 - 2026 Session</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Fee Particulars:</span>
                    <span className="font-bold text-slate-800">Monthly Tuition Coaching & Study Material</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold text-sm">
                    <span className="text-slate-900">Total Amount:</span>
                    <span className="text-emerald-700">₹{s.fee?.monthlyFee?.toLocaleString('en-IN') || '1,500'} ({isFeePaid ? 'PAID' : 'PENDING'})</span>
                  </div>
                </div>

                {/* Stamp & Seal Footer (Print receipt button removed) */}
                <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Verified Tuition Record</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Center Certified • Melvisharam</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: DIGITAL STUDENT ID CARD (Strictly Admin Managed)       */}
        {/* ============================================================ */}
        {activeTab === 'idcard' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="max-w-md mx-auto">
              {/* Digital ID Card */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-amber-400/60 relative overflow-hidden">
                {/* Background watermarks */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-2xl pointer-events-none"></div>

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
                  <span className="text-[9px] font-bold tracking-widest text-blue-200 bg-white/10 px-2 py-0.5 rounded-full uppercase">
                    Official Student Identity Card
                  </span>
                </div>

                {/* Student Photo (Photo upload removed - Only Admin can change via Admin App) */}
                <div className="flex flex-col items-center mb-5">
                  <div className="relative">
                    <img
                      src={s.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.id}`}
                      alt={s.name}
                      className="w-28 h-28 rounded-3xl object-cover border-4 border-amber-400 shadow-xl ring-4 ring-white/10"
                    />
                  </div>
                  <h3 className="text-lg font-black text-white mt-3 font-heading text-center">
                    {s.name}
                  </h3>
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-3 py-0.5 rounded-full border border-amber-400/30 mt-1">
                    ID: {s.id}
                  </span>
                </div>

                {/* Identity Information Matrix */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2.5 text-xs">
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
                    <span className="text-slate-400">Contact:</span>
                    <span className="font-bold text-white font-mono">{s.parentPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valid Academic Session:</span>
                    <span className="font-bold text-amber-300">2025 - 2026</span>
                  </div>
                </div>

                {/* QR Code and Center Authorization */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-white rounded-lg">
                      <QrCode className="w-8 h-8 text-slate-900" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-300 block font-semibold">Center Authorized</span>
                      <span className="text-[9px] text-amber-300">Melvisharam Office</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-0.5 bg-amber-400/50 mb-1 ml-auto"></div>
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Center Director</span>
                  </div>
                </div>
              </div>

              {/* Institution Verified Notice (Photo upload card removed) */}
              <div className="mt-4 p-3.5 bg-white rounded-2xl border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Institution Verified Record</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Student details and photographs are verified and managed strictly by Tuition Center Administration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: PARENT & STUDENT HELPDESK / QUERY BOX                */}
        {/* ============================================================ */}
        {activeTab === 'helpdesk' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-heading">
                    Tuition Helpdesk & Query Box
                  </h2>
                  <p className="text-xs text-slate-500">
                    Send your questions, progress inquiries, or leave messages directly to the Center Director & Faculty.
                  </p>
                </div>
              </div>

              {fbSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fbSuccessMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Query Category *
                    </label>
                    <select
                      value={fbCategory}
                      onChange={(e) => setFbCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Academics">Academic Progress / Doubt in Subject</option>
                      <option value="Discipline">Discipline & Attendance</option>
                      <option value="Timings">Batch Timings / Bus Delay</option>
                      <option value="Fee Query">Tuition Fee Inquiry</option>
                      <option value="General Feedback">General Suggestion / Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Student Details
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${s.name} (ID: ${s.id})`}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Message / Question *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Write your query or message here for Arise & Shine Learning Point..."
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  ></textarea>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Queries are reviewed directly by Center Faculty.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingFb}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingFb ? 'Sending Query...' : 'Submit Query to Admin'}</span>
                  </button>
                </div>
              </form>

              {/* Previous Feedbacks & Admin Replies */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Your Past Inquiries ({feedbacksList.length})
                </h3>

                {feedbacksList.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No inquiries submitted yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feedbacksList.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            {fb.category}
                          </span>
                          <span className="text-[11px] text-slate-400">{fb.submittedAt}</span>
                        </div>

                        <p className="text-xs text-slate-800 font-medium">
                          "{fb.message}"
                        </p>

                        {/* Admin Reply */}
                        {fb.adminReply && (
                          <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                              <span>Admin Reply from Arise & Shine:</span>
                              <span className="text-slate-400 font-normal">{fb.repliedAt}</span>
                            </div>
                            <p className="text-slate-700">{fb.adminReply}</p>
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
      {/* UNIVERSITY MOBILE BOTTOM NAVIGATION BAR (FIXED)              */}
      {/* ============================================================ */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <School className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${
            activeTab === 'attendance' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('homework')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer relative ${
            activeTab === 'homework' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Homework</span>
          {homeworksList.length > 0 && (
            <span className="absolute top-0.5 right-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('fee')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${
            activeTab === 'fee' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <DollarSign className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Fees</span>
        </button>

        <button
          onClick={() => setActiveTab('idcard')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${
            activeTab === 'idcard' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <IdCard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">ID Card</span>
        </button>
      </nav>

      {/* Expanded Photo Modal */}
      <PhotoModal
        isOpen={Boolean(modalPhoto)}
        onClose={() => setModalPhoto(null)}
        photoUrl={modalPhoto}
        title={modalTitle}
      />
    </div>
  );
}
