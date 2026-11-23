import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Users,
  Shield,
  Calendar,
  DollarSign,
  Bell,
  BookOpen,
  MessageSquare,
  Award,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Send,
  Search,
  Filter,
  Save,
  X,
  Phone,
  School,
  IdCard,
  Key,
  Check,
  RefreshCw,
  Sparkles,
  MapPin,
  Camera,
  Upload,
  ArrowRight,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import PhotoModal from './PhotoModal';

export default function AdminApp({ 
  isAdminLoggedIn, 
  onAdminLoginSuccess, 
  onAdminLogout, 
  centerInfo 
}) {
  // Login form state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab: 'students', 'attendance', 'fees', 'homeworks', 'feedbacks', 'announcements'
  const [activeTab, setActiveTab] = useState('students');

  // Master Data
  const [studentsList, setStudentsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [homeworksList, setHomeworksList] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  // Homework Review Drawer
  const [selectedHw, setSelectedHw] = useState(null);
  const [hwRemarkText, setHwRemarkText] = useState('');
  const [hwStatusSelect, setHwStatusSelect] = useState('Reviewed');

  // Feedback Reply Drawer
  const [selectedFb, setSelectedFb] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Fee Modal
  const [selectedFeeStudent, setSelectedFeeStudent] = useState(null);
  const [editFeeAmount, setEditFeeAmount] = useState(1500);
  const [editFeeDueDate, setEditFeeDueDate] = useState('');
  const [editFeeStatus, setEditFeeStatus] = useState('PAID');

  // Change Student Photo Modal
  const [selectedPhotoStudent, setSelectedPhotoStudent] = useState(null);
  const [studentPhotoPreview, setStudentPhotoPreview] = useState('');
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  // Announcement Form
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState('Notice');
  const [newAnnTarget, setNewAnnTarget] = useState('All Batches');
  const [newAnnPinned, setNewAnnPinned] = useState(false);

  // New Student Form
  const [newStudId, setNewStudId] = useState('');
  const [newStudPassword, setNewStudPassword] = useState('');
  const [newStudName, setNewStudName] = useState('');
  const [newStudGender, setNewStudGender] = useState('Male');
  const [newStudGrade, setNewStudGrade] = useState('Class 10 - State Board');
  const [newStudSchool, setNewStudSchool] = useState('Islamiah Higher Secondary School, Melvisharam');
  const [newStudParentName, setNewStudParentName] = useState('');
  const [newStudParentPhone, setNewStudParentPhone] = useState('');
  const [newStudFee, setNewStudFee] = useState(1500);
  const [newStudPhoto, setNewStudPhoto] = useState('');

  // Attendance Date
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Broadcast sync to student portal
  const notifyStudentSync = (studentId) => {
    try {
      if (typeof window !== 'undefined') {
        if (window.BroadcastChannel) {
          const channel = new BroadcastChannel('arise_student_sync');
          channel.postMessage({ type: 'STUDENT_UPDATED', studentId, timestamp: Date.now() });
        }
        localStorage.setItem('arise_sync_ping', `${studentId || 'all'}_${Date.now()}`);
      }
    } catch (e) {}
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.65 },
        colors: ['#4f46e5', '#f59e0b', '#10b981', '#3b82f6']
      });
    } catch (e) {}
  };

  // Fetch all center data
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [stRes, annRes, hwRes, fbRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/announcements'),
        fetch('/api/homeworks'),
        fetch('/api/feedbacks'),
      ]);

      if (stRes.ok) setStudentsList(await stRes.json());
      if (annRes.ok) setAnnouncementsList(await annRes.json());
      if (hwRes.ok) setHomeworksList(await hwRes.json());
      if (fbRes.ok) setFeedbacksList(await fbRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAllData();
    }
  }, [isAdminLoggedIn]);

  // Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAdminLoginError(data.error || 'Invalid Admin credentials.');
      } else {
        onAdminLoginSuccess(data.admin);
        fetchAllData();
        triggerConfetti();
      }
    } catch (err) {
      setAdminLoginError('Failed to connect to backend server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Image processor for admin photo updates
  const processImageFile = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
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
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Add New Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudId.trim() || !newStudName.trim()) {
      alert('Student ID and Name are required.');
      return;
    }

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newStudId.trim().toUpperCase(),
          password: newStudPassword.trim() || 'pass123',
          name: newStudName.trim(),
          gender: newStudGender,
          grade: newStudGrade,
          school: newStudSchool,
          parentName: newStudParentName.trim() || 'Parent',
          parentPhone: newStudParentPhone.trim() || '9842385666',
          feeAmount: Number(newStudFee) || 1500,
          photo: newStudPhoto || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudentsList([...studentsList, data.student]);
        setIsAddStudentOpen(false);
        setNewStudId('');
        setNewStudName('');
        setNewStudPhoto('');
        showToast(`Enrolled ${data.student.name} successfully!`);
        notifyStudentSync(data.student.id);
        triggerConfetti();
      } else {
        const err = await res.json();
        alert(err.error || 'Could not add student.');
      }
    } catch (err) {
      alert('Failed to connect to server.');
    }
  };

  // Save changes from Edit Student Profile Modal
  const handleSaveEditStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingStudent.name,
          password: editingStudent.password,
          grade: editingStudent.grade,
          school: editingStudent.school,
          parentName: editingStudent.parentName,
          parentPhone: editingStudent.parentPhone,
          monthlyFee: Number(editingStudent.monthlyFee),
          photo: editingStudent.photo,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudentsList(studentsList.map((s) => (s.id === data.student.id ? data.student : s)));
        notifyStudentSync(data.student.id);
        setEditingStudent(null);
        showToast(`Profile updated for ${data.student.name}!`);
      } else {
        alert('Could not update student.');
      }
    } catch (err) {
      alert('Error saving student profile.');
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name} (${id}) from the tuition roster?`)) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStudentsList(studentsList.filter((s) => s.id !== id));
        notifyStudentSync(id);
        showToast(`Removed student ${name}`);
      } else {
        alert('Could not delete student.');
      }
    } catch (err) {
      alert('Failed to delete student.');
    }
  };

  // Update Attendance for a Student
  const handleUpdateAttendance = async (studentId, status) => {
    try {
      const res = await fetch(`/api/students/${studentId}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: attendanceDate,
          status: status,
          note: `Evening Session (${attendanceDate})`
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudentsList(studentsList.map((s) => (s.id === studentId ? data.student : s)));
        notifyStudentSync(studentId);
        showToast(`Marked ${data.student.name} as ${status}`);
      }
    } catch (err) {
      alert('Failed to update attendance');
    }
  };

  // 1-Click Toggle Fee Status
  const handleToggleFeeStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    try {
      const res = await fetch(`/api/students/${studentId}/fee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          lastPaidDate: newStatus === 'PAID' ? new Date().toISOString().split('T')[0] : undefined
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudentsList(studentsList.map(s => (s.id === studentId ? data.student : s)));
        notifyStudentSync(studentId);
        showToast(`Fee status for ${data.student.name}: ${newStatus}`);
        if (newStatus === 'PAID') triggerConfetti();
      }
    } catch (err) {
      alert('Error updating fee');
    }
  };

  // Save changes from Edit Fee Modal
  const handleSaveFeeModal = async (e) => {
    e.preventDefault();
    if (!selectedFeeStudent) return;
    try {
      const res = await fetch(`/api/students/${selectedFeeStudent.id}/fee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyFee: Number(editFeeAmount),
          nextDueDate: editFeeDueDate,
          status: editFeeStatus,
          lastPaidDate: editFeeStatus === 'PAID' ? new Date().toISOString().split('T')[0] : undefined
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudentsList(studentsList.map(s => (s.id === selectedFeeStudent.id ? data.student : s)));
        notifyStudentSync(selectedFeeStudent.id);
        setSelectedFeeStudent(null);
        showToast(`Fee updated to ₹${data.student.fee?.monthlyFee} for ${data.student.name}!`);
        if (editFeeStatus === 'PAID') triggerConfetti();
      } else {
        alert('Could not update fee.');
      }
    } catch (err) {
      alert('Failed to update student fee.');
    }
  };

  // Open Change Photo Modal
  const handleOpenPhotoModal = (student) => {
    setSelectedPhotoStudent(student);
    setStudentPhotoPreview(student.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.id}`);
  };

  // Save updated photo for student
  const handleSaveStudentPhoto = async (e) => {
    e.preventDefault();
    if (!selectedPhotoStudent || !studentPhotoPreview) return;
    setIsUpdatingPhoto(true);

    try {
      const res = await fetch(`/api/students/${selectedPhotoStudent.id}/photo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: studentPhotoPreview }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudentsList(studentsList.map(s => (s.id === selectedPhotoStudent.id ? { ...s, photo: data.student.photo } : s)));
        notifyStudentSync(selectedPhotoStudent.id);
        setSelectedPhotoStudent(null);
        showToast(`Profile picture updated for ${selectedPhotoStudent.name}!`);
      } else {
        alert('Could not update profile photo.');
      }
    } catch (err) {
      alert('Failed to update student picture.');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  // Submit Homework Review
  const handleReviewHomework = async (e) => {
    e.preventDefault();
    if (!selectedHw) return;

    try {
      const res = await fetch(`/api/homeworks/${selectedHw.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: hwStatusSelect,
          adminRemarks: hwRemarkText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHomeworksList(homeworksList.map(h => (h.id === data.homework.id ? data.homework : h)));
        notifyStudentSync(selectedHw.studentId);
        setSelectedHw(null);
        showToast(`Worksheet marked as ${hwStatusSelect}`);
      }
    } catch (err) {
      alert('Failed to review homework');
    }
  };

  // Submit Feedback Reply
  const handleReplyFeedback = async (e) => {
    e.preventDefault();
    if (!selectedFb || !replyText.trim()) return;

    try {
      const res = await fetch(`/api/feedbacks/${selectedFb.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbacksList(feedbacksList.map(f => (f.id === data.feedback.id ? data.feedback : f)));
        notifyStudentSync(selectedFb.studentId);
        setSelectedFb(null);
        setReplyText('');
        showToast('Reply dispatched to parent/student');
      }
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      alert('Please fill announcement title and content.');
      return;
    }

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAnnTitle,
          content: newAnnContent,
          category: newAnnCategory,
          target: newAnnTarget,
          isPinned: newAnnPinned,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnnouncementsList([data.announcement, ...announcementsList]);
        setNewAnnTitle('');
        setNewAnnContent('');
        showToast('Announcement broadcasted!');
        notifyStudentSync('all');
      }
    } catch (err) {
      alert('Error creating announcement');
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnouncementsList(announcementsList.filter(a => a.id !== id));
        notifyStudentSync('all');
        showToast('Announcement removed');
      }
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  // Filter students
  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.school && s.school.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGrade =
      gradeFilter === 'All' || s.grade.toLowerCase().includes(gradeFilter.toLowerCase());

    return matchesSearch && matchesGrade;
  });

  // KPI calculations
  const totalPaid = studentsList.filter(s => s.fee?.status === 'PAID').length;
  const totalPendingFee = studentsList.filter(s => s.fee?.status !== 'PAID').length;
  const pendingHwCount = homeworksList.filter(h => h.status === 'Submitted').length;
  const pendingFbCount = feedbacksList.filter(f => f.status === 'Pending').length;

  // ----------------------------------------------------
  // 1. ADMIN LOGIN GATEWAY
  // ----------------------------------------------------
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white">
        <div className="max-w-md w-full">
          <div className="bg-slate-900/95 rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-9 relative overflow-hidden backdrop-blur-2xl">
            {/* Top Amber Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500"></div>

            <div className="text-center mb-7">
              <div className="mb-3.5 flex justify-center">
                <img 
                  src="/logo.png" 
                  alt="Arise & Shine Center Logo" 
                  className="w-20 h-20 object-contain drop-shadow-xl hover:scale-105 transition-transform" 
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
                ADMINISTRATION PORTAL
              </h2>
              <a 
                href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 uppercase tracking-widest mt-1 hover:underline"
              >
                <MapPin className="w-3 h-3 text-red-400" />
                <span>ARISE & SHINE • MELVISHARAM</span>
              </a>
              <p className="text-xs text-slate-400 mt-2">
                Restricted to Center Director & Headmaster
              </p>
            </div>

            {adminLoginError && (
              <div className="mb-5 p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-500 text-slate-950 rounded-2xl font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <span>{isLoggingIn ? 'Authenticating Admin...' : 'Enter Admin Control Center'}</span>
                <Shield className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Demo for Administrator */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setAdminUsername('admin');
                  setAdminPassword('admin123');
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer"
              >
                Fill Default Admin Credentials (admin / admin123)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. ADMIN DASHBOARD & CONTROL CENTER
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-950 text-white border border-amber-400/60 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Executive Hero & Real-time KPIs */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="Center Logo" 
              className="w-14 h-14 object-contain shrink-0 hidden sm:block drop-shadow-md" 
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  Official Center Control Center
                </span>
                <a 
                  href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-slate-300 hover:text-amber-300 transition flex items-center gap-1 underline underline-offset-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Melvisharam (Google Maps)</span>
                </a>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-heading">
                ARISE AND SHINE TUITION CENTER
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Managing enrolled students, attendance verification, tuition fee records & homework guidance.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/25 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Enrol Student</span>
            </button>

            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-2xl transition cursor-pointer active:scale-95"
              title="Sync Live Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Real-time Executive Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block font-medium">Active Enrolled</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-heading">{studentsList.length}</span>
              <span className="text-[10px] text-emerald-400 font-bold">Students</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block font-medium">Fee Status</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-400 font-heading">{totalPaid} Paid</span>
              <span className="text-xs text-rose-400 font-semibold">{totalPendingFee} Due</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('homeworks')}
            className="p-3.5 bg-slate-800/60 hover:bg-slate-700/60 rounded-2xl border border-slate-700/60 cursor-pointer transition"
          >
            <span className="text-[11px] text-slate-400 block font-medium">Homeworks</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-400 font-heading">{homeworksList.length}</span>
              {pendingHwCount > 0 && (
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                  {pendingHwCount} New
                </span>
              )}
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('feedbacks')}
            className="p-3.5 bg-slate-800/60 hover:bg-slate-700/60 rounded-2xl border border-slate-700/60 cursor-pointer transition"
          >
            <span className="text-[11px] text-slate-400 block font-medium">Parent Inquiries</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400 font-heading">{feedbacksList.length}</span>
              {pendingFbCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingFbCount} Unread
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS (Horizontal scrolling pill dock on mobile & desktop) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto no-scrollbar flex items-center space-x-2 py-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'students' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Directory ({studentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Update Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'fees' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Tuition Fees</span>
        </button>

        <button
          onClick={() => setActiveTab('homeworks')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'homeworks' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Homeworks Desk ({homeworksList.length})</span>
          {pendingHwCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
        </button>

        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'feedbacks' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Queries ({feedbacksList.length})</span>
          {pendingFbCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Announcements Hub</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. STUDENT DIRECTORY (CARDS ON MOBILE & DATA TABLE ON DESKTOP) */}
      {/* ============================================================ */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
                Student Directory & Credentials
              </h3>
              <p className="text-xs text-slate-500">
                Official roster with individual IDs, passwords & parent contact records.
              </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, ID, school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="All">All Classes (LKG to 12th)</option>
                <option value="LKG">LKG / UKG</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>
          </div>

          {/* MOBILE VIEW: SLEEK STUDENT PROFILE CARDS */}
          <div className="sm:hidden space-y-3 pt-1">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No students found matching your search.
              </div>
            ) : (
              filteredStudents.map((st) => (
                <div 
                  key={st.id} 
                  className="bg-slate-50/80 border border-slate-200 rounded-3xl p-4 space-y-3 shadow-xs hover:border-indigo-400 transition"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      onClick={() => handleOpenPhotoModal(st)}
                      className="relative cursor-pointer shrink-0"
                      title="Upload or change student picture"
                    >
                      <img
                        src={st.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                        alt={st.name}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                      />
                      <span className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-full text-white shadow-xs">
                        <Camera className="w-2.5 h-2.5" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <h4 className="font-black text-sm text-slate-900 truncate">{st.name}</h4>
                        <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full shrink-0">
                          {st.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span>Roll: <strong className="text-slate-800 font-mono">{st.rollNo}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-600">Pass: <strong>{st.password}</strong></span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{st.grade}</p>
                      <p className="text-[11px] text-slate-400 truncate">{st.school}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 text-xs">
                    <div className="bg-white p-2.5 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Parent / Guardian</span>
                      <span className="font-bold text-slate-800 truncate block mt-0.5">{st.parentName}</span>
                      <a href={`tel:${st.parentPhone}`} className="text-indigo-600 font-mono font-bold text-[11px] flex items-center gap-1 mt-0.5 hover:underline">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span>{st.parentPhone}</span>
                      </a>
                    </div>

                    <div className="bg-white p-2.5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Attendance</span>
                        <span className="font-bold text-slate-800 text-xs">{st.attendance?.percentage || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Tuition Fee</span>
                        <button
                          type="button"
                          onClick={() => handleToggleFeeStatus(st.id, st.fee?.status)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition ${
                            st.fee?.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {st.fee?.status || 'PENDING'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => setEditingStudent({ ...st, monthlyFee: st.fee?.monthlyFee || 1500 })}
                      className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border border-indigo-200 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPhotoModal(st)}
                      className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border border-amber-200 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(st.id, st.name)}
                      className="py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border border-rose-200 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP VIEW: EXECUTIVE DATA TABLE */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-extrabold border-y border-slate-200">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">ID & Password</th>
                  <th className="py-3 px-3">Grade & School</th>
                  <th className="py-3 px-3">Parent & Contact</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Fee Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          onClick={() => handleOpenPhotoModal(st)}
                          className="relative cursor-pointer shrink-0"
                          title="Click to update student photo"
                        >
                          <img
                            src={st.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                            alt={st.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                          />
                          <span className="absolute -bottom-1 -right-1 p-0.5 bg-indigo-600 rounded-full text-white">
                            <Camera className="w-2.5 h-2.5" />
                          </span>
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">{st.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">Roll: {st.rollNo}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] block w-fit">
                        {st.id}
                      </span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Pass: {st.password}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block text-xs">{st.grade}</span>
                      <span className="text-slate-400 text-[11px] block truncate max-w-[180px]">{st.school}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 block text-xs">{st.parentName}</span>
                      <a href={`tel:${st.parentPhone}`} className="text-indigo-600 font-mono text-[11px] hover:underline flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-emerald-500" />
                        <span>{st.parentPhone}</span>
                      </a>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-extrabold text-slate-900 block">{st.attendance?.percentage || 0}%</span>
                      <span className="text-[10px] text-slate-400 block">
                        {st.attendance?.attendedClasses || 0}/{st.attendance?.totalClasses || 0} classes
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleFeeStatus(st.id, st.fee?.status)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                          st.fee?.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Click to toggle Paid/Pending"
                      >
                        {st.fee?.status || 'PENDING'}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setEditingStudent({ ...st, monthlyFee: st.fee?.monthlyFee || 1500 })}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Student"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(st.id, st.name)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. BATCH ATTENDANCE MARKER                                   */}
      {/* ============================================================ */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
                Batch Attendance Marker
              </h3>
              <p className="text-xs text-slate-500">
                1-Click fast attendance register for evening tuition batches.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Session Date:</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-3">
            {studentsList.map((st) => (
              <div 
                key={st.id}
                className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={st.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                    alt={st.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block">{st.name}</span>
                    <span className="text-xs text-slate-500 font-medium">{st.id} • {st.grade}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateAttendance(st.id, 'Present')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    ✓ Present
                  </button>
                  <button
                    onClick={() => handleUpdateAttendance(st.id, 'Late')}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Late
                  </button>
                  <button
                    onClick={() => handleUpdateAttendance(st.id, 'Absent')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    ✕ Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TUITION FEES MANAGEMENT                                   */}
      {/* ============================================================ */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
                Tuition Fee Collection Ledger
              </h3>
              <p className="text-xs text-slate-500">
                1-Click fee status toggles & customized monthly fees per student.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {studentsList.map((st) => (
              <div
                key={st.id}
                className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={st.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                    alt={st.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block">{st.name} ({st.id})</span>
                    <span className="text-xs text-slate-500">Monthly Fee: ₹{st.fee?.monthlyFee || 1500} • Due: {st.fee?.nextDueDate || '5th Next Month'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleFeeStatus(st.id, st.fee?.status)}
                    className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-xs transition ${
                      st.fee?.status === 'PAID'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    }`}
                  >
                    {st.fee?.status === 'PAID' ? '✓ PAID IN FULL' : 'PAYMENT PENDING'}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFeeStudent(st);
                      setEditFeeAmount(st.fee?.monthlyFee || 1500);
                      setEditFeeDueDate(st.fee?.nextDueDate || '');
                      setEditFeeStatus(st.fee?.status || 'PAID');
                    }}
                    className="p-2 bg-white border border-slate-300 hover:border-indigo-400 rounded-xl text-slate-700 text-xs font-bold transition cursor-pointer"
                    title="Edit Fee Amount & Dates"
                  >
                    <Edit className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. HOMEWORKS SUPERVISION DESK                                */}
      {/* ============================================================ */}
      {activeTab === 'homeworks' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
              School Homeworks Received ({homeworksList.length})
            </h3>
            <p className="text-xs text-slate-500">
              Worksheets shared by parents & students. Add faculty supervision remarks.
            </p>
          </div>

          {homeworksList.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No worksheets shared yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeworksList.map((hw) => (
                <div key={hw.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-3xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                        {hw.subject}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">Student: {hw.studentId}</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {hw.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">"{hw.description}"</p>

                  {hw.photoUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={hw.photoUrl}
                        alt="Worksheet"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 cursor-pointer"
                        onClick={() => {
                          setModalPhoto(hw.photoUrl);
                          setModalTitle(`Worksheet: ${hw.subject}`);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setModalPhoto(hw.photoUrl);
                          setModalTitle(`Worksheet: ${hw.subject}`);
                        }}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        Enlarge Picture
                      </button>
                    </div>
                  )}

                  {hw.adminRemarks && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                      <strong>Your Note:</strong> {hw.adminRemarks}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/70 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedHw(hw);
                        setHwRemarkText(hw.adminRemarks || '');
                        setHwStatusSelect(hw.status || 'Reviewed');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Add Master Remark
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. PARENT INQUIRIES & HELPDESK                               */}
      {/* ============================================================ */}
      {activeTab === 'feedbacks' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
              Parent & Student Inquiries ({feedbacksList.length})
            </h3>
            <p className="text-xs text-slate-500">
              Direct questions submitted from student portal.
            </p>
          </div>

          {feedbacksList.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No inquiries received.
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacksList.map((fb) => (
                <div key={fb.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {fb.category} • Student: {fb.studentId}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{fb.submittedAt}</span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">"{fb.message}"</p>

                  {fb.adminReply && (
                    <div className="p-2.5 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800">
                      <strong className="text-emerald-700 block text-[11px]">Your Reply:</strong>
                      <p className="text-slate-700 mt-0.5">{fb.adminReply}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/70 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedFb(fb);
                        setReplyText(fb.adminReply || '');
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      {fb.adminReply ? 'Edit Reply' : 'Reply to Query'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. ANNOUNCEMENTS HUB                                         */}
      {/* ============================================================ */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
              Broadcast Notices & Circulars
            </h3>
            <p className="text-xs text-slate-500">
              Publish center announcements visible instantly on all student portals.
            </p>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Special Sunday Chemistry Numerical Batch"
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Content Details *
              </label>
              <textarea
                rows="2"
                required
                placeholder="Notice description..."
                value={newAnnContent}
                onChange={(e) => setNewAnnContent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              ></textarea>
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Broadcast Notice
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-3">
            {announcementsList.map((ann) => (
              <div key={ann.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {ann.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 mt-1">{ann.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{ann.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS & DRAWERS                                             */}
      {/* ============================================================ */}

      {/* ENROL NEW STUDENT MODAL */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-base text-slate-900 font-heading">Enrol New Student</h3>
              <button onClick={() => setIsAddStudentOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ASLP-107"
                  value={newStudId}
                  onChange={(e) => setNewStudId(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Danish Ahmed"
                  value={newStudName}
                  onChange={(e) => setNewStudName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Portal Password</label>
                <input
                  type="text"
                  placeholder="pass107"
                  value={newStudPassword}
                  onChange={(e) => setNewStudPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade / Class</label>
                  <input
                    type="text"
                    value={newStudGrade}
                    onChange={(e) => setNewStudGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Tuition Fee (₹)</label>
                  <input
                    type="number"
                    value={newStudFee}
                    onChange={(e) => setNewStudFee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">School Name</label>
                <input
                  type="text"
                  value={newStudSchool}
                  onChange={(e) => setNewStudSchool(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parent Name</label>
                  <input
                    type="text"
                    placeholder="Parent name"
                    value={newStudParentName}
                    onChange={(e) => setNewStudParentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parent Contact</label>
                  <input
                    type="text"
                    placeholder="9842385666"
                    value={newStudParentPhone}
                    onChange={(e) => setNewStudParentPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Save & Enrol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT PROFILE MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-base text-slate-900 font-heading">Edit {editingStudent.name} ({editingStudent.id})</h3>
              <button onClick={() => setEditingStudent(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="text"
                  value={editingStudent.password}
                  onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade / Class</label>
                  <input
                    type="text"
                    value={editingStudent.grade}
                    onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Tuition Fee (₹)</label>
                  <input
                    type="number"
                    value={editingStudent.monthlyFee}
                    onChange={(e) => setEditingStudent({ ...editingStudent, monthlyFee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">School</label>
                <input
                  type="text"
                  value={editingStudent.school}
                  onChange={(e) => setEditingStudent({ ...editingStudent, school: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parent Contact</label>
                  <input
                    type="text"
                    value={editingStudent.parentPhone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE STUDENT PHOTO MODAL */}
      {selectedPhotoStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl text-center">
            <h3 className="font-black text-sm text-slate-900 font-heading mb-1">
              Update Student Photo
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedPhotoStudent.name} ({selectedPhotoStudent.id})</p>

            <div className="flex justify-center mb-4">
              <img
                src={studentPhotoPreview}
                alt="Preview"
                className="w-28 h-28 rounded-3xl object-cover border-4 border-amber-400 shadow-md ring-2 ring-slate-100"
              />
            </div>

            <form onSubmit={handleSaveStudentPhoto} className="space-y-3">
              <label className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 flex items-center justify-center gap-2 cursor-pointer transition shadow-xs">
                <Camera className="w-4 h-4" />
                <span>Select New Photo / Camera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) processImageFile(f, (b64) => setStudentPhotoPreview(b64));
                  }}
                  className="hidden"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPhotoStudent(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPhoto}
                  className="flex-1 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl cursor-pointer shadow-md"
                >
                  {isUpdatingPhoto ? 'Saving...' : 'Apply Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FEE MODAL */}
      {selectedFeeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl">
            <h3 className="font-black text-sm text-slate-900 font-heading mb-1">
              Adjust Tuition Fee
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedFeeStudent.name} ({selectedFeeStudent.id})</p>

            <form onSubmit={handleSaveFeeModal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Monthly Tuition Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={editFeeAmount}
                  onChange={(e) => setEditFeeAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Next Due Date</label>
                <input
                  type="text"
                  placeholder="e.g. 05th of Next Month"
                  value={editFeeDueDate}
                  onChange={(e) => setEditFeeDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Status</label>
                <select
                  value={editFeeStatus}
                  onChange={(e) => setEditFeeStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="PAID">PAID IN FULL</option>
                  <option value="PENDING">PAYMENT PENDING</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedFeeStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Save Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOMEWORK REVIEW DRAWER */}
      {selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="font-black text-sm text-slate-900 font-heading mb-1">Tuition Master Supervision</h3>
            <p className="text-xs text-slate-500 mb-4">Subject: {selectedHw.subject} • Student: {selectedHw.studentId}</p>

            <form onSubmit={handleReviewHomework} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Status</label>
                <select
                  value={hwStatusSelect}
                  onChange={(e) => setHwStatusSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Reviewed">Reviewed & Supervised</option>
                  <option value="Completed">Completed Fully</option>
                  <option value="Needs Revision">Needs Revision</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teacher Remarks / Guidance Note</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Completed with 95% accuracy. Good step-by-step working."
                  value={hwRemarkText}
                  onChange={(e) => setHwRemarkText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHw(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Save Remark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK REPLY DRAWER */}
      {selectedFb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="font-black text-sm text-slate-900 font-heading mb-1">Reply to Parent Inquiry</h3>
            <p className="text-xs text-slate-500 mb-3">"{selectedFb.message}"</p>

            <form onSubmit={handleReplyFeedback} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Response Note</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Type your response from Tuition Center Administration..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFb(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-black cursor-pointer shadow-md"
                >
                  Dispatch Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Photo Modal */}
      <PhotoModal
        isOpen={Boolean(modalPhoto)}
        onClose={() => setModalPhoto(null)}
        photoUrl={modalPhoto}
        title={modalTitle}
      />
    </div>
  );
}
