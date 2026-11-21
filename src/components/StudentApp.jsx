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
  Download
} from 'lucide-react';
import PhotoModal from './PhotoModal';

export default function StudentApp({ 
  student, 
  onLogout, 
  onLoginSuccess, 
  centerInfo,
  isStandaloneApp,
  onOpenInstallModal
}) {
  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active view: 'student' (Student Profile), 'parent' (Parent Profile), 'announcements'
  const [activeMode, setActiveMode] = useState('student');

  // Photo modal state
  const [modalPhoto, setModalPhoto] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  // Parent Profile: Homework submission form state
  const [hwSubject, setHwSubject] = useState('Mathematics');
  const [hwDescription, setHwDescription] = useState('');
  const [hwPhotoBase64, setHwPhotoBase64] = useState('');
  const [isSubmittingHw, setIsSubmittingHw] = useState(false);
  const [hwSuccessMsg, setHwSuccessMsg] = useState('');

  // Parent Profile: Feedback form state
  const [fbCategory, setFbCategory] = useState('Academics');
  const [fbMessage, setFbMessage] = useState('');
  const [isSubmittingFb, setIsSubmittingFb] = useState(false);
  const [fbSuccessMsg, setFbSuccessMsg] = useState('');

  // Fetched Data
  const [homeworksList, setHomeworksList] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load student-specific data whenever student changes or view opens
  const fetchStudentData = async (studId) => {
    if (!studId) return;
    setIsLoadingData(true);
    try {
      const [hwRes, fbRes, annRes, studRes] = await Promise.all([
        fetch(`/api/homeworks?studentId=${studId}`),
        fetch(`/api/feedbacks?studentId=${studId}`),
        fetch('/api/announcements'),
        fetch(`/api/students/${studId}`),
      ]);

      if (hwRes.ok) setHomeworksList(await hwRes.json());
      if (fbRes.ok) setFeedbacksList(await fbRes.json());
      if (annRes.ok) setAnnouncementsList(await annRes.json());
      if (studRes.ok) {
        const freshStudent = await studRes.json();
        if (freshStudent && onLoginSuccess) {
          onLoginSuccess(freshStudent);
        }
      }
    } catch (err) {
      console.error('Failed to fetch student data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (student?.id) {
      fetchStudentData(student.id);

      // Auto-poll every 6 seconds to live-sync updated fee amount and updated announcements from Admin
      const pollTimer = setInterval(() => {
        fetchStudentData(student.id);
      }, 6000);

      return () => clearInterval(pollTimer);
    } else {
      // Fetch public announcements even before student logs in
      fetch('/api/announcements')
        .then(r => r.ok ? r.json() : [])
        .then(data => setAnnouncementsList(data))
        .catch(err => console.error('Failed to fetch announcements:', err));
    }
  }, [student?.id, activeMode]);

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
        onLoginSuccess(data.student);
        fetchStudentData(data.student.id);
      }
    } catch (err) {
      setLoginError('Unable to connect to tuition server. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Convert uploaded image file to Base64
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    // Limit to 8MB
    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB. Please choose a smaller picture.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setHwPhotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Homework by Parent
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
          studentId: student.id,
          subject: hwSubject,
          description: hwDescription,
          photoUrl: hwPhotoBase64,
          schoolName: student.school,
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
          studentId: student.id,
          category: fbCategory,
          message: fbMessage,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setFeedbacksList([result.feedback, ...feedbacksList]);
        setFbMessage('');
        setFbSuccessMsg('Your query has been sent to the center admin. You will receive a reply here soon.');
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

  // ----------------------------------------------------
  // 1. LOGIN SCREEN (When student is not logged in)
  // ----------------------------------------------------
  if (!student) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-blue-50/60 via-slate-50 to-indigo-50/40">
        <div className="max-w-md w-full">
          {/* Tuition Center Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-slate-200/90 p-6 sm:p-8 relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-400"></div>

            <div className="text-center mb-6">
              <div className="mb-3 flex justify-center">
                <img 
                  src="/logo.png" 
                  alt="Arise and Shine Tuition Center Logo" 
                  className="w-24 h-24 object-contain drop-shadow-md hover:scale-105 transition-transform" 
                />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
                ARISE & SHINE
              </h2>
              <a 
                href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest mt-0.5 hover:underline"
                title="View Melvisharam center on Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>TUITION CENTER • MELVISHARAM</span>
              </a>
              <p className="text-xs text-slate-500 mt-2">
                Student & Parent Academic Portal. Sign in with your unique ID and password.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ASLP-101"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your student password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
              >
                <span>{isLoggingIn ? 'Verifying Student...' : 'Access My Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Install Prompt for Mobile Web Visitors (Hidden once running as installed standalone app) */}
            {!isStandaloneApp && (
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-300/60 text-center">
                <div className="flex items-center justify-center gap-2 mb-1.5 text-slate-800 font-bold text-xs">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>Download the Official App on Your Phone!</span>
                </div>
                <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                  Install Arise & Shine to get full-screen access, instant updates, and view your academic profile without opening a browser.
                </p>
                <button
                  type="button"
                  onClick={onOpenInstallModal}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App (Android & iPhone)</span>
                </button>
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
  const attPct = student.attendance?.percentage || 0;
  const attColor =
    attPct >= 90 ? 'bg-emerald-500' : attPct >= 75 ? 'bg-amber-500' : 'bg-rose-500';
  const attTextColor =
    attPct >= 90 ? 'text-emerald-700' : attPct >= 75 ? 'text-amber-700' : 'text-rose-700';

  // Calculate behaviour score colors
  const behScore = student.behaviour?.score || 90;
  const behColor =
    behScore >= 90 ? 'from-indigo-500 to-purple-600' : 'from-blue-500 to-indigo-600';

  // Fee status
  const isFeePaid = student.fee?.status === 'PAID';

  // ----------------------------------------------------
  // 2. LOGGED-IN STUDENT / PARENT VIEW
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Student Welcome & Switcher Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Profile Identity Bar */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={student.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.id}`}
                alt={student.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/20"
              />
              <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 text-[10px] font-bold rounded-full border-2 border-white text-white ${
                student.attendance?.todayStatus === 'Present' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                {student.attendance?.todayStatus || 'Active'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  {student.name}
                </h1>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                  ID: {student.id}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  Roll: {student.rollNo}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 flex items-center gap-2">
                <School className="w-3.5 h-3.5 text-blue-500" />
                <span>{student.grade}</span>
                <span>•</span>
                <span className="text-slate-500 truncate max-w-xs">{student.school}</span>
              </p>

              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                <span>Parent: <strong className="text-slate-600">{student.parentName}</strong></span>
                <span>•</span>
                <span>Contact: <strong className="text-slate-600">{student.parentPhone}</strong></span>
              </div>
            </div>
          </div>

          {/* TWO SWITCHABLE PROFILES: STUDENT & PARENT */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveMode('student')}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMode === 'student'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Student Profile</span>
              </button>

              <button
                onClick={() => setActiveMode('parent')}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMode === 'parent'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Parent Profile</span>
                {/* Micro badge for pending fee */}
                {!isFeePaid && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setActiveMode('announcements')}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMode === 'announcements'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Announcements</span>
                {announcementsList.length > 0 && (
                  <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded-full">
                    {announcementsList.length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => fetchStudentData(student.id)}
              disabled={isLoadingData}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition self-center cursor-pointer"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* VIEW A: STUDENT PROFILE (Attendance bar, Behaviour bar, etc.) */}
      {/* ------------------------------------------------------------ */}
      {activeMode === 'student' && (
        <div className="space-y-6 animate-fadeIn">
          {/* TWO PRIMARY BARS: ATTENDANCE BAR & BEHAVIOUR BAR */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. ATTENDANCE BAR CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-heading">
                      Attendance Performance Bar
                    </h2>
                    <p className="text-xs text-slate-500">Live track of tuition sessions</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-2xl font-black font-heading ${attTextColor}`}>
                    {attPct}%
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">Overall Rate</p>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Regularity Meter</span>
                  <span className={attTextColor}>
                    {attPct >= 90 ? '🌟 Outstanding Regularity' : attPct >= 75 ? '👍 Good Attendance' : '⚠️ Improvement Required'}
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${attColor}`}
                    style={{ width: `${Math.min(attPct, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-center">
                  <span className="text-xs text-slate-500 block">Total Classes</span>
                  <span className="text-lg font-black text-blue-900 font-heading">
                    {student.attendance?.totalClasses || 0}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-xs text-slate-500 block">Attended</span>
                  <span className="text-lg font-black text-emerald-900 font-heading">
                    {student.attendance?.attendedClasses || 0}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 text-center">
                  <span className="text-xs text-slate-500 block">Today's Status</span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full inline-block mt-1">
                    {student.attendance?.todayStatus || 'Present'}
                  </span>
                </div>
              </div>

              {/* Recent Attendance Log Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Recent Session Logs
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(student.attendance?.recentHistory || []).map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          h.status === 'Present' ? 'bg-emerald-500' : h.status === 'Late' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        <span className="font-semibold text-slate-800">{h.date}</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500 truncate max-w-[180px]">{h.note || 'Regular class'}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
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

            {/* 2. BEHAVIOUR BAR CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 font-heading">
                        Conduct & Behaviour Bar
                      </h2>
                      <p className="text-xs text-slate-500">Teacher evaluations and character appraisal</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black font-heading text-purple-700">
                      {behScore}/100
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Grade: <span className="font-bold text-purple-600">{student.behaviour?.grade || 'A+'}</span>
                    </p>
                  </div>
                </div>

                {/* Behaviour Meter */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Discipline & Character Index</span>
                    <span className="text-purple-700 font-bold">
                      {behScore >= 90 ? '🌟 Exemplary Behaviour' : behScore >= 80 ? '👍 Disciplined' : 'Needs Focus'}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${behColor} transition-all duration-700`}
                      style={{ width: `${Math.min(behScore, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Granular Ratings */}
                <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Class Discipline</span>
                    <div className="flex items-center justify-center gap-1 mt-0.5 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold text-slate-800">
                        {student.behaviour?.disciplineRating || '5.0'}/5
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Participation</span>
                    <div className="flex items-center justify-center gap-1 mt-0.5 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold text-slate-800">
                        {student.behaviour?.participationRating || '4.8'}/5
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">HW Completion</span>
                    <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                      {student.behaviour?.homeworkCompletion || 95}%
                    </span>
                  </div>
                </div>

                {/* Teacher's Personal Remarks */}
                <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Teacher's Feedback & Guidance
                  </div>
                  <p className="text-xs text-purple-950/90 leading-relaxed italic">
                    "{student.behaviour?.teacherRemarks || 'Consistent in tuition work and respectful towards faculty.'}"
                  </p>
                </div>
              </div>

              {/* Badges Earned */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Recognitions & Badges
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(student.behaviour?.badges || ['Punctual', 'High Discipline']).map((badge, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <span>🏅</span>
                      <span>{badge}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice Banner on Student Tab */}
          <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-800/80 rounded-xl">
                <School className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Arise and Shine Learning Point - Tuition Schedule</h4>
                <p className="text-xs text-blue-200">
                  {centerInfo.timings || 'Mon - Sat: 5:00 PM to 9:30 PM | Special Sunday Batches'} • Classes LKG to 12th Std
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveMode('announcements')}
              className="text-xs font-bold bg-white text-blue-900 hover:bg-blue-50 px-3.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
            >
              Check Latest Announcements &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* VIEW B: PARENT PROFILE (Fee details, Next Due, Homework, Feedback) */}
      {/* ------------------------------------------------------------ */}
      {activeMode === 'parent' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 1. FEE DETAILS CARD WITH NEXT DUE DATE (Requirement: Fee details, if paid show paid, say next due date) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-2xl ${isFeePaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-heading">
                    Tuition Fee Statement & Next Due
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official Fee Record for {student.name} ({student.grade})
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-xs ${
                    isFeePaid
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white animate-pulse'
                  }`}
                >
                  {isFeePaid ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      FEE STATUS: PAID
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      FEE STATUS: PENDING
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Fee Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">Monthly Tuition Fee</span>
                <span className="text-2xl font-black text-slate-900 font-heading">
                  ₹{student.fee?.monthlyFee?.toLocaleString('en-IN') || '1,500'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Per calendar month</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">Last Payment Info</span>
                <span className="text-sm font-bold text-slate-800 block">
                  {student.fee?.lastPaidDate ? `Date: ${student.fee.lastPaidDate}` : 'No recent payment'}
                </span>
                <span className="text-xs text-slate-500 block mt-1 font-mono">
                  Receipt: {student.fee?.receiptNo || 'N/A'} • {student.fee?.paymentMode || 'Cash'}
                </span>
              </div>

              {/* NEXT DUE DATE NOTICE */}
              <div className={`p-4 rounded-2xl border ${
                isFeePaid
                  ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <span className="text-xs font-bold uppercase tracking-wider block mb-1">
                  Next Fee Due Date
                </span>
                <span className="text-xl font-black font-heading block">
                  {student.fee?.nextDueDate || '05th of Next Month'}
                </span>
                <span className="text-xs mt-1 block font-medium opacity-90">
                  {isFeePaid
                    ? 'Your account is up-to-date. Thank you!'
                    : 'Kindly clear the pending tuition fee on or before this date.'}
                </span>
              </div>
            </div>

            {/* Payment Modes & Center Note */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <strong className="text-slate-800">Payment Modes Accepted:</strong> Cash at Tuition Center office or UPI (GPay / PhonePe / Paytm) to{' '}
                <strong className="text-blue-700">6379840006</strong> / <strong className="text-blue-700">9842385666</strong>.
              </div>
              <div className="text-[11px] text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Center: Melvisharam
              </div>
            </div>
          </div>

          {/* 2. HOMEWORK TAB (Requirement: tab to parents saying homework where parents share child's homework received by schools, allow them to share photo) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-heading">
                    School Homework Desk (Shared by Parents)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload homework received from your child's school. Our tuition masters will supervise it during tuition hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Homework Upload Form */}
            <form onSubmit={handleHomeworkSubmit} className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-4">
              <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                Share New School Homework / Worksheet
              </h3>

              {hwSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{hwSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Homework Details / Chapter / Question Numbers
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Maths Chapter 4 Exercise 4.2 Questions 1 to 5. Teacher instructed to write steps in separate notebook."
                  value={hwDescription}
                  onChange={(e) => setHwDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* PHOTO UPLOAD (ALLOW PARENTS TO SHARE PHOTO) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attach Photo of Notebook / Question Sheet (Optional)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition shadow-xs">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>Take or Choose Photo</span>
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
                        alt="Preview"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                      <span className="text-xs text-indigo-900 font-medium">Photo attached!</span>
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
                  <span>{isSubmittingHw ? 'Submitting...' : 'Send Homework to Tuition Master'}</span>
                </button>
              </div>
            </form>

            {/* List of Submitted Homeworks for this Student */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Submitted Homeworks & Teacher Review Status ({homeworksList.length})
              </h3>

              {homeworksList.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  No homework submitted yet. Share any homework received from school above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {homeworksList.map((hw) => (
                    <div
                      key={hw.id}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {hw.subject}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">
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

                      {/* Photo Thumbnail if present */}
                      {hw.photoUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={hw.photoUrl}
                            alt="Worksheet"
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition"
                            onClick={() => {
                              setModalPhoto(hw.photoUrl);
                              setModalTitle(`${hw.subject} Homework`);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setModalPhoto(hw.photoUrl);
                              setModalTitle(`${hw.subject} Homework`);
                            }}
                            className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Attached Photo
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                        <span>Submitted: {hw.submittedAt}</span>
                        <span className="text-indigo-600 font-semibold">{hw.subject}</span>
                      </div>

                      {/* Teacher's Remarks if reviewed */}
                      {hw.adminRemarks && (
                        <div className="p-2.5 bg-blue-50/80 border border-blue-100 rounded-xl text-xs text-blue-900">
                          <strong>Tuition Master Note:</strong> {hw.adminRemarks}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. FEEDBACK FORM BOX (Requirement: feedback form box in which queries should reach admin) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  Parent Feedback & Query Box
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={`${student.name} (ID: ${student.id})`}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Message / Query *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Write your query or message here for Arise & Shine Learning Point admin..."
                  value={fbMessage}
                  onChange={(e) => setFbMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Queries are reviewed directly by Mr. Asrar Basha & Head Faculty.
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
                Your Past Queries & Admin Responses ({feedbacksList.length})
              </h3>

              {feedbacksList.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  No previous inquiries submitted yet.
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
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">{fb.submittedAt}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            fb.status === 'Replied'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {fb.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-800 font-medium">
                        "{fb.message}"
                      </p>

                      {/* Admin Reply */}
                      {fb.adminReply ? (
                        <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                            <span>Admin Reply from Arise & Shine:</span>
                            <span className="text-slate-400 font-normal">{fb.repliedAt}</span>
                          </div>
                          <p className="text-slate-700 italic">
                            {fb.adminReply}
                          </p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-600 italic">
                          Awaiting response from center administration...
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

      {/* ------------------------------------------------------------ */}
      {/* VIEW C: ANNOUNCEMENTS PAGE (Announcements by Admin visible) */}
      {/* ------------------------------------------------------------ */}
      {activeMode === 'announcements' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-heading">
                    Center Announcements & Circulars
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official updates from Arise and Shine Learning Point, Melvisharam
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {announcementsList.length} Announcements
              </span>
            </div>

            {announcementsList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No active announcements at the moment.
              </div>
            ) : (
              <div className="space-y-4">
                {announcementsList.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      ann.isPinned
                        ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        {ann.isPinned && (
                          <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            📌 PINNED NOTICE
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          ann.category === 'Exam'
                            ? 'bg-purple-100 text-purple-800'
                            : ann.category === 'Schedule'
                            ? 'bg-blue-100 text-blue-800'
                            : ann.category === 'Holiday'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ann.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Target: <strong className="text-slate-700">{ann.target}</strong>
                        </span>
                      </div>

                      <span className="text-xs text-slate-400 font-medium">
                        {ann.date}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1 font-heading">
                      {ann.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {ann.content}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Posted by: <strong className="text-slate-600">{ann.author || 'Center Director'}</strong></span>
                      <span>Arise & Shine Learning Point • Melvisharam</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* High Resolution Photo Modal for Homework */}
      <PhotoModal
        isOpen={Boolean(modalPhoto)}
        onClose={() => setModalPhoto(null)}
        photoUrl={modalPhoto}
        title={modalTitle}
        subtitle={`Student: ${student.name} (${student.id})`}
      />
    </div>
  );
}
