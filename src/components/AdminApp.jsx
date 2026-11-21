import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Camera,
  Upload,
  Image
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

  // Active Admin Tab
  // 1. 'students' (Student Management)
  // 2. 'attendance' (Update Attendance of every student)
  // 3. 'fees' (Update Fee of every student)
  // 4. 'homeworks' (TAB 1: Homeworks received from parent with student id & name)
  // 5. 'feedbacks' (TAB 2: Feedbacks received from parent with student id & name)
  // 6. 'announcements' (Update Announcements)
  // 7. 'behaviour' (Update Behaviour of students)
  const [activeTab, setActiveTab] = useState('students');

  // Master Data
  const [studentsList, setStudentsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [homeworksList, setHomeworksList] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');

  // Modal / Form States
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  // Homework Review Drawer / Modal State
  const [selectedHw, setSelectedHw] = useState(null);
  const [hwRemarkText, setHwRemarkText] = useState('');
  const [hwStatusSelect, setHwStatusSelect] = useState('Reviewed');

  // Feedback Reply Drawer / Modal State
  const [selectedFb, setSelectedFb] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState('all'); // 'all', 'pending', 'replied'

  // Edit Fee Modal State (Admin edits student fee amount, due date, status)
  const [selectedFeeStudent, setSelectedFeeStudent] = useState(null);
  const [editFeeAmount, setEditFeeAmount] = useState(1500);
  const [editFeeDueDate, setEditFeeDueDate] = useState('');
  const [editFeeStatus, setEditFeeStatus] = useState('PAID');

  // Change Student Photo Modal State
  const [selectedPhotoStudent, setSelectedPhotoStudent] = useState(null);
  const [studentPhotoPreview, setStudentPhotoPreview] = useState('');
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  // Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState('Notice');
  const [newAnnTarget, setNewAnnTarget] = useState('All Batches');
  const [newAnnPinned, setNewAnnPinned] = useState(false);

  // Edit Announcement Modal State
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editAnnTitle, setEditAnnTitle] = useState('');
  const [editAnnContent, setEditAnnContent] = useState('');
  const [editAnnCategory, setEditAnnCategory] = useState('Notice');
  const [editAnnTarget, setEditAnnTarget] = useState('All Batches');
  const [editAnnPinned, setEditAnnPinned] = useState(false);

  // New Student Form State
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

  // Attendance Date Selector
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Toast / Status Message
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
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
        setAdminLoginError(data.error || 'Invalid Admin credentials');
      } else {
        onAdminLoginSuccess(data.admin);
        fetchAllData();
      }
    } catch (err) {
      setAdminLoginError('Failed to connect to backend.');
    } finally {
      setIsLoggingIn(false);
    }
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
          parentPhone: newStudParentPhone.trim() || '6379840006',
          photo: newStudPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${newStudId}`,
          fee: {
            monthlyFee: Number(newStudFee) || 1200,
            status: 'PAID',
            lastPaidDate: new Date().toISOString().split('T')[0],
            receiptNo: `ASLP-REC-${Math.floor(10000 + Math.random() * 90000)}`,
            nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            paymentMode: 'Cash',
            notes: 'Admission fee recorded'
          }
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to add student.');
      } else {
        setStudentsList([data.student, ...studentsList]);
        setIsAddStudentOpen(false);
        // Reset form
        setNewStudId('');
        setNewStudName('');
        setNewStudPassword('');
        setNewStudParentName('');
        setNewStudParentPhone('');
        showToast(`Student ${data.student.name} (${data.student.id}) added successfully!`);
      }
    } catch (err) {
      alert('Error creating student.');
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} (${id})?`)) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStudentsList(studentsList.filter(s => s.id !== id));
        showToast(`Student ${name} deleted.`);
      }
    } catch (err) {
      alert('Could not delete student.');
    }
  };

  // Delete parent feedback by admin (only when admin chooses to delete)
  const handleDeleteFeedback = async (id, studentName) => {
    if (!window.confirm(`Permanently delete this query from the parent of "${studentName}"? This message cannot be recovered.`)) return;
    try {
      const res = await fetch(`/api/feedbacks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedbacksList(feedbacksList.filter(f => f.id !== id));
        showToast('Parent query deleted successfully by admin.');
      } else {
        alert('Could not delete query.');
      }
    } catch (err) {
      alert('Error deleting feedback query.');
    }
  };

  // Delete homework record by admin
  const handleDeleteHomework = async (id, subject) => {
    if (!window.confirm(`Delete ${subject} homework record?`)) return;
    try {
      const res = await fetch(`/api/homeworks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHomeworksList(homeworksList.filter(h => h.id !== id));
        showToast('Homework record removed.');
      }
    } catch (err) {
      alert('Failed to delete homework.');
    }
  };

  // Quick Attendance Update for single student
  const handleUpdateAttendance = async (studentId, status) => {
    try {
      const res = await fetch(`/api/students/${studentId}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, date: attendanceDate }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudentsList(studentsList.map(s => (s.id === studentId ? data.student : s)));
        showToast(`Marked ${data.student.name} as ${status}`);
      }
    } catch (err) {
      alert('Error updating attendance');
    }
  };

  // Bulk Mark Attendance
  const handleBulkAttendance = async (status) => {
    try {
      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, date: attendanceDate }),
      });

      if (res.ok) {
        showToast(`Marked all students as ${status} for ${attendanceDate}!`);
        fetchAllData();
      }
    } catch (err) {
      alert('Bulk attendance failed');
    }
  };

  // Update Student Fee
  const handleUpdateFee = async (studentId, newStatus, newDueDate, newAmount) => {
    try {
      const res = await fetch(`/api/students/${studentId}/fee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          nextDueDate: newDueDate,
          monthlyFee: newAmount,
          lastPaidDate: newStatus === 'PAID' ? new Date().toISOString().split('T')[0] : undefined
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudentsList(studentsList.map(s => (s.id === studentId ? data.student : s)));
        showToast(`Updated fee record for ${data.student.name}`);
      }
    } catch (err) {
      alert('Error updating fee');
    }
  };

  // Save changes from Edit Fee Modal (Updates fee amount, due date, status)
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
        setSelectedFeeStudent(null);
        showToast(`Fee updated to ₹${data.student.fee?.monthlyFee} for ${data.student.name}!`);
      } else {
        alert('Could not update fee.');
      }
    } catch (err) {
      alert('Failed to update student fee.');
    }
  };

  // Helper to optimize and convert uploaded image file to efficient base64 Data URL
  const processImageFile = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        callback(dataUrl);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
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
        showToast('Announcement posted successfully!');
      }
    } catch (err) {
      alert('Error posting announcement');
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnouncementsList(announcementsList.filter(a => a.id !== id));
        showToast('Announcement deleted');
      }
    } catch (err) {
      alert('Could not delete announcement');
    }
  };

  // Update existing announcement (Admin edits title, content, target, category, pin)
  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    if (!editingAnnouncement || !editAnnTitle.trim() || !editAnnContent.trim()) {
      alert('Title and content are required.');
      return;
    }

    try {
      const res = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editAnnTitle,
          content: editAnnContent,
          category: editAnnCategory,
          target: editAnnTarget,
          isPinned: editAnnPinned,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnnouncementsList(announcementsList.map(a => (a.id === editingAnnouncement.id ? data.announcement : a)));
        setEditingAnnouncement(null);
        showToast('Announcement updated successfully!');
      } else {
        alert('Could not update announcement.');
      }
    } catch (err) {
      alert('Error updating announcement.');
    }
  };

  // Update Homework Status & Remarks (Tab 1: Homeworks received from parent)
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
        setHomeworksList(homeworksList.map(h => (h.id === selectedHw.id ? data.homework : h)));
        setSelectedHw(null);
        showToast(`Homework for ${data.homework.studentName} updated to ${data.homework.status}`);
      }
    } catch (err) {
      alert('Failed to update homework');
    }
  };

  // Reply to Parent Feedback / Query (Tab 2: Feedbacks received from parent)
  const handleReplyFeedback = async (e) => {
    e.preventDefault();
    if (!selectedFb || !replyText.trim()) {
      alert('Please type a reply message.');
      return;
    }

    try {
      const res = await fetch(`/api/feedbacks/${selectedFb.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminReply: replyText.trim(),
          status: 'Replied',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbacksList(feedbacksList.map(f => (f.id === selectedFb.id ? data.feedback : f)));
        setSelectedFb(null);
        setReplyText('');
        showToast(`Reply sent to parent of ${data.feedback.studentName}!`);
      }
    } catch (err) {
      alert('Failed to reply to feedback');
    }
  };

  // Update Behaviour score & teacher remark
  const handleUpdateBehaviour = async (studentId, score, remarks) => {
    try {
      const res = await fetch(`/api/students/${studentId}/behaviour`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: Number(score), teacherRemarks: remarks }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudentsList(studentsList.map(s => (s.id === studentId ? data.student : s)));
        showToast(`Behaviour updated for ${data.student.name}`);
      }
    } catch (err) {
      alert('Failed to update behaviour');
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

  // Counters for dashboard overview
  const totalPaid = studentsList.filter(s => s.fee?.status === 'PAID').length;
  const totalPendingFee = studentsList.filter(s => s.fee?.status !== 'PAID').length;
  const pendingHwCount = homeworksList.filter(h => h.status === 'Submitted').length;
  const pendingFbCount = feedbacksList.filter(f => f.status === 'Pending').length;

  // ----------------------------------------------------
  // 1. ADMIN LOGIN GATE
  // ----------------------------------------------------
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/90 rounded-3xl shadow-2xl border border-slate-700 p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
            <div className="text-center mb-6">
              <div className="mb-3 flex justify-center">
                <img 
                  src="/logo.png" 
                  alt="Arise and Shine Tuition Center Logo" 
                  className="w-24 h-24 object-contain drop-shadow-lg hover:scale-105 transition-transform" 
                />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight font-heading">
                ADMINISTRATION PORTAL
              </h2>
              <a 
                href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 uppercase tracking-widest mt-0.5 hover:underline"
              >
                <span>ARISE & SHINE • MELVISHARAM</span>
              </a>
              <p className="text-xs text-slate-400 mt-2">
                Restricted to Center Director & Headmaster
              </p>
            </div>

            {adminLoginError && (
              <div className="mb-5 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
              >
                <span>{isLoggingIn ? 'Authenticating Admin...' : 'Enter Admin Control Center'}</span>
                <Shield className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. ADMIN DASHBOARD & MANAGEMENT TABS
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white border border-amber-400/40 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Dashboard Hero / Quick Stats */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="Center Logo" 
              className="w-16 h-16 object-contain shrink-0 hidden sm:block drop-shadow-md" 
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
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
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 font-heading">
                ARISE AND SHINE TUITION CENTER
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Managing enrolled students, academic attendance, fee records, school homework submissions & parent queries.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Student</span>
            </button>

            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="Sync Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Overview Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block font-medium">Active Enrolled</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-heading">{studentsList.length}</span>
              <span className="text-[10px] text-emerald-400 font-bold">Students</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block font-medium">Fee Collection</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-400 font-heading">{totalPaid} Paid</span>
              <span className="text-xs text-rose-400 font-semibold">{totalPendingFee} Pending</span>
            </div>
          </div>

          {/* Pending Homework reviews metric */}
          <div 
            onClick={() => setActiveTab('homeworks')}
            className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl border border-slate-700/80 cursor-pointer transition"
          >
            <span className="text-[11px] text-slate-400 block font-medium">Homeworks Shared</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-400 font-heading">{homeworksList.length}</span>
              {pendingHwCount > 0 && (
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                  {pendingHwCount} New
                </span>
              )}
            </div>
          </div>

          {/* Parent Feedbacks metric */}
          <div 
            onClick={() => setActiveTab('feedbacks')}
            className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl border border-slate-700/80 cursor-pointer transition"
          >
            <span className="text-[11px] text-slate-400 block font-medium">Parent Queries</span>
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

      {/* ADMIN NAVIGATION TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'students' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students Profiles ({studentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Update Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'fees' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Update Fees</span>
        </button>

        {/* TAB 1 REQUIRED BY USER: HOMEWORKS RECEIVED FROM PARENT */}
        <button
          onClick={() => setActiveTab('homeworks')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'homeworks' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Homeworks Received ({homeworksList.length})</span>
          {pendingHwCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>

        {/* TAB 2 REQUIRED BY USER: FEEDBACKS RECEIVED FROM PARENT */}
        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'feedbacks' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedbacks & Queries ({feedbacksList.length})</span>
          {pendingFbCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'announcements' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Announcements Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('behaviour')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'behaviour' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Behaviour & Conduct</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. STUDENTS PROFILES TAB */}
      {/* ============================================================ */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Students Records & Credentials Directory
              </h2>
              <p className="text-xs text-slate-500">
                All enrolled students with individual IDs & passwords. Click credentials to view or copy.
              </p>
            </div>

            {/* Search and Grade filters */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, name, school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
              </div>

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Student Grid / Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
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
                          className="relative group/avatar cursor-pointer shrink-0"
                          title="Click to upload or change student picture"
                        >
                          <img
                            src={st.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                            alt={st.name}
                            className="w-11 h-11 rounded-2xl object-cover border-2 border-slate-200 group-hover/avatar:border-indigo-500 transition shadow-xs"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition">
                            <Camera className="w-4 h-4 text-white drop-shadow" />
                          </div>
                          <span className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-full text-white shadow-xs group-hover/avatar:scale-110 transition">
                            <Camera className="w-2.5 h-2.5" />
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{st.name}</span>
                          <span className="text-[10px] text-slate-400 block">Roll: {st.rollNo}</span>
                          <button
                            type="button"
                            onClick={() => handleOpenPhotoModal(st)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 mt-0.5 cursor-pointer hover:underline"
                          >
                            <Camera className="w-2.5 h-2.5" />
                            <span>Change Photo</span>
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="space-y-0.5">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] block w-fit">
                          {st.id}
                        </span>
                        <span className="text-slate-500 text-[10px] block">
                          Pass: <strong className="text-slate-800">{st.password}</strong>
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 block">{st.grade}</span>
                      <span className="text-slate-500 text-[11px] truncate max-w-xs block">{st.school}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 block">{st.parentName}</span>
                      <a href={`tel:${st.parentPhone}`} className="text-blue-600 hover:underline text-[11px]">
                        {st.parentPhone}
                      </a>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-800">{st.attendance?.percentage || 0}%</span>
                        <span className={`w-2 h-2 rounded-full ${
                          (st.attendance?.percentage || 0) >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {st.attendance?.attendedClasses}/{st.attendance?.totalClasses} sessions
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        st.fee?.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {st.fee?.status || 'PENDING'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Due: {st.fee?.nextDueDate}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenPhotoModal(st)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Upload / Change Student Photo"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(st.id, st.name)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove Student"
                        >
                          <Trash2 className="w-4 h-4" />
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
      {/* 2. UPDATE ATTENDANCE TAB (Requirement: update attendance of every student) */}
      {/* ============================================================ */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Attendance Management Desk
              </h2>
              <p className="text-xs text-slate-500">
                Mark daily presence, absence, or late entry. Records sync directly to student & parent bars.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />

              <button
                onClick={() => handleBulkAttendance('Present')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Present Today</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentsList.map((st) => (
              <div
                key={st.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={st.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                    alt={st.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{st.name}</h4>
                    <span className="text-[10px] text-blue-600 font-mono font-medium block">
                      {st.id} • {st.grade}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Attendance: <strong>{st.attendance?.percentage || 0}%</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => handleUpdateAttendance(st.id, 'Present')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      st.attendance?.todayStatus === 'Present'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    P
                  </button>

                  <button
                    onClick={() => handleUpdateAttendance(st.id, 'Late')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      st.attendance?.todayStatus === 'Late'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    L
                  </button>

                  <button
                    onClick={() => handleUpdateAttendance(st.id, 'Absent')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      st.attendance?.todayStatus === 'Absent'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    A
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. UPDATE FEES TAB (Requirement: update the fee of every student) */}
      {/* ============================================================ */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Tuition Fee Manager
              </h2>
              <p className="text-xs text-slate-500">
                Update payment status, monthly amount, and set the next due date for each student.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl font-bold">
                {totalPaid} Students Paid
              </div>
              <div className="text-xs bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-xl font-bold">
                {totalPendingFee} Pending Dues
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {studentsList.map((st) => {
              const isPaid = st.fee?.status === 'PAID';
              return (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={st.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                      alt={st.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{st.name}</h4>
                        <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                          {st.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {st.grade} • Parent: {st.parentName} ({st.parentPhone})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Amount with Edit Icon Button */}
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Monthly Fee</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-base font-black text-slate-900 font-heading">
                          ₹{st.fee?.monthlyFee || 1200}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedFeeStudent(st);
                            setEditFeeAmount(st.fee?.monthlyFee || 1200);
                            setEditFeeDueDate(st.fee?.nextDueDate || '2026-12-05');
                            setEditFeeStatus(st.fee?.status || 'PENDING');
                          }}
                          className="px-2 py-0.5 rounded-lg text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 border border-blue-200 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Edit Student Fee Amount"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Next Due Date */}
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Next Due Date</span>
                      <input
                        type="date"
                        defaultValue={st.fee?.nextDueDate || '2026-12-05'}
                        onBlur={(e) => handleUpdateFee(st.id, st.fee?.status, e.target.value, st.fee?.monthlyFee)}
                        className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                      />
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateFee(st.id, 'PAID', st.fee?.nextDueDate, st.fee?.monthlyFee)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          isPaid
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>PAID</span>
                      </button>

                      <button
                        onClick={() => handleUpdateFee(st.id, 'PENDING', st.fee?.nextDueDate, st.fee?.monthlyFee)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          !isPaid
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>PENDING</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TAB 1: HOMEWORKS RECEIVED FROM PARENT (Requirement: tab showing homeworks received from parent with student id and name) */}
      {/* ============================================================ */}
      {activeTab === 'homeworks' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  Homeworks Received From Parents
                </h2>
                <p className="text-xs text-slate-500">
                  School homework submitted by parents with attached photos, student ID, and student name.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              {homeworksList.length} Submissions Total
            </span>
          </div>

          {homeworksList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No school homework submitted by parents yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeworksList.map((hw) => (
                <div
                  key={hw.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 relative overflow-hidden"
                >
                  {/* STUDENT ID AND STUDENT NAME PROMINENTLY DISPLAYED */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">
                          ID: {hw.studentId}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900">
                          {hw.studentName}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {hw.grade} • {hw.schoolName}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      hw.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : hw.status === 'Reviewed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {hw.status}
                    </span>
                  </div>

                  {/* Subject and Description */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block mb-1">
                      {hw.subject}
                    </span>
                    <p className="text-xs text-slate-800 font-medium">
                      {hw.description}
                    </p>
                  </div>

                  {/* PHOTO VIEW (WITH MODAL ENLARGEMENT) */}
                  {hw.photoUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <img
                        src={hw.photoUrl}
                        alt="Homework Attachment"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition"
                        onClick={() => {
                          setModalPhoto(hw.photoUrl);
                          setModalTitle(`${hw.subject} Homework from ${hw.studentName}`);
                        }}
                      />
                      <div>
                        <span className="text-xs font-bold text-indigo-950 block">Worksheet Photo Attached</span>
                        <button
                          type="button"
                          onClick={() => {
                            setModalPhoto(hw.photoUrl);
                            setModalTitle(`${hw.subject} Homework - ${hw.studentName} (${hw.studentId})`);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Click to View Full Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">No photo attached for this submission.</div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Received: {hw.submittedAt}</span>
                    <span className="text-indigo-600 font-semibold">{hw.subject}</span>
                  </div>

                  {/* Existing Teacher Remarks if any */}
                  {hw.adminRemarks && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 text-xs text-blue-900 rounded-xl">
                      <strong>Current Teacher Note:</strong> {hw.adminRemarks}
                    </div>
                  )}

                  {/* Action Buttons: Delete & Review */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteHomework(hw.id, hw.subject)}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-rose-200"
                      title="Delete this homework record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedHw(hw);
                        setHwRemarkText(hw.adminRemarks || '');
                        setHwStatusSelect(hw.status || 'Reviewed');
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Review & Add Teacher Remarks</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. TAB 2: FEEDBACKS RECEIVED FROM PARENT (Requirement: tab showing feedbacks received from parent with student id and name) */}
      {/* ============================================================ */}
      {activeTab === 'feedbacks' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  Feedbacks & Queries Received From Parents
                </h2>
                <p className="text-xs text-slate-500">
                  Messages are permanently stored in database memory and will never vanish until deleted by Admin.
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setFeedbackFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  feedbackFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({feedbacksList.length})
              </button>
              <button
                onClick={() => setFeedbackFilter('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  feedbackFilter === 'pending' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unread ({feedbacksList.filter(f => f.status === 'Pending').length})
              </button>
              <button
                onClick={() => setFeedbackFilter('replied')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  feedbackFilter === 'replied' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Replied ({feedbacksList.filter(f => f.status === 'Replied').length})
              </button>
            </div>
          </div>

          {feedbacksList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No parent inquiries received yet.
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacksList
                .filter(fb => {
                  if (feedbackFilter === 'pending') return fb.status === 'Pending';
                  if (feedbackFilter === 'replied') return fb.status === 'Replied';
                  return true;
                })
                .map((fb) => (
                <div
                  key={fb.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  {/* STUDENT ID AND STUDENT NAME */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-mono font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                        ID: {fb.studentId}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">
                        Student: {fb.studentName}
                      </h3>
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-xs text-slate-600 font-medium">
                        Parent: <strong>{fb.parentName}</strong>
                      </span>
                      {fb.parentPhone && (
                        <a
                          href={`tel:${fb.parentPhone}`}
                          className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {fb.parentPhone}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{fb.submittedAt}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        fb.status === 'Replied'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {fb.status}
                      </span>
                    </div>
                  </div>

                  {/* Message box */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded inline-block mb-1.5">
                      {fb.category}
                    </span>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      "{fb.message}"
                    </p>
                  </div>

                  {/* Existing Reply if already replied */}
                  {fb.adminReply && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                        <span>Your Reply to Parent:</span>
                        <span className="text-slate-400 font-normal">{fb.repliedAt}</span>
                      </div>
                      <p className="text-emerald-950 italic">
                        {fb.adminReply}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons: Delete Query by Admin OR Reply */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteFeedback(fb.id, fb.studentName)}
                      className="px-3 py-1.5 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Delete this query from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Query</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedFb(fb);
                        setReplyText(fb.adminReply || '');
                      }}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{fb.adminReply ? 'Update Reply' : 'Compose Reply to Parent'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. ANNOUNCEMENTS HUB TAB (Requirement: update the announcements) */}
      {/* ============================================================ */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post New Announcement */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs lg:col-span-1 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Publish Announcement
            </h3>
            <p className="text-xs text-slate-500">
              Notices appear instantly on Student & Parent apps.
            </p>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Model Exam Timetable"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newAnnCategory}
                  onChange={(e) => setNewAnnCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  <option value="Notice">General Notice</option>
                  <option value="Exam">Exam / Test Series</option>
                  <option value="Schedule">Schedule / Timetable</option>
                  <option value="Holiday">Holiday Announcement</option>
                  <option value="Important">Important / Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 10 & 12, or All Batches"
                  value={newAnnTarget}
                  onChange={(e) => setNewAnnTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Announcement Details *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write full circular message..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={newAnnPinned}
                  onChange={(e) => setNewAnnPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="pinned" className="text-xs font-semibold text-slate-700">
                  Pin to Top of Announcements
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Publish to Students & Parents
              </button>
            </form>
          </div>

          {/* Existing Announcements List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Active Announcements ({announcementsList.length})
            </h3>

            <div className="space-y-3">
              {announcementsList.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ann.isPinned && (
                        <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.2 rounded-full">
                          PINNED
                        </span>
                      )}
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.2 rounded">
                        {ann.category}
                      </span>
                      <span className="text-xs text-slate-400">{ann.date}</span>
                      <span className="text-xs text-slate-500">• For {ann.target}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{ann.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingAnnouncement(ann);
                        setEditAnnTitle(ann.title);
                        setEditAnnContent(ann.content);
                        setEditAnnCategory(ann.category);
                        setEditAnnTarget(ann.target);
                        setEditAnnPinned(ann.isPinned);
                      }}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="Edit Announcement"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. BEHAVIOUR & CONDUCT MANAGEMENT TAB */}
      {/* ============================================================ */}
      {activeTab === 'behaviour' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Behaviour, Discipline & Character Appraisal
            </h2>
            <p className="text-xs text-slate-500">
              Update behaviour scores (0 - 100) and teacher guidance notes for each student.
            </p>
          </div>

          <div className="space-y-4">
            {studentsList.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={st.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                    alt={st.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{st.name}</h4>
                    <span className="text-xs text-blue-600 font-mono font-bold">
                      {st.id} • {st.grade}
                    </span>
                    <p className="text-xs text-purple-700 italic mt-1">
                      "{st.behaviour?.teacherRemarks || 'Consistent effort.'}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
                    <span className="text-lg font-black text-purple-700 font-heading">
                      {st.behaviour?.score || 90}/100
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const newScore = prompt(`Enter new behaviour score for ${st.name} (0 - 100):`, st.behaviour?.score || 90);
                      if (newScore !== null && !isNaN(newScore)) {
                        const newRemarks = prompt(`Enter teacher remarks for ${st.name}:`, st.behaviour?.teacherRemarks || '');
                        if (newRemarks !== null) {
                          handleUpdateBehaviour(st.id, newScore, newRemarks);
                        }
                      }
                    }}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Behaviour</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD NEW STUDENT */}
      {/* ============================================================ */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add New Student Profile</h3>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ASLP-107"
                    value={newStudId}
                    onChange={(e) => setNewStudId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pass107"
                    value={newStudPassword}
                    onChange={(e) => setNewStudPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Imran Khan"
                  value={newStudName}
                  onChange={(e) => setNewStudName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Class</label>
                  <input
                    type="text"
                    placeholder="Class 10 - State Board"
                    value={newStudGrade}
                    onChange={(e) => setNewStudGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newStudGender}
                    onChange={(e) => setNewStudGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  placeholder="e.g. Islamiah Higher Secondary School, Melvisharam"
                  value={newStudSchool}
                  onChange={(e) => setNewStudSchool(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    placeholder="Father / Mother Name"
                    value={newStudParentName}
                    onChange={(e) => setNewStudParentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone</label>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={newStudParentPhone}
                    onChange={(e) => setNewStudParentPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Tuition Fee (₹)</label>
                  <input
                    type="number"
                    value={newStudFee}
                    onChange={(e) => setNewStudFee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Picture (Optional)</label>
                  <div className="flex items-center space-x-2">
                    {newStudPhoto ? (
                      <div className="relative shrink-0">
                        <img
                          src={newStudPhoto}
                          alt="New Student Preview"
                          className="w-10 h-10 rounded-xl object-cover border border-slate-300 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setNewStudPhoto('')}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5"
                          title="Remove Photo"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                    )}
                    <label className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center space-x-1 border border-indigo-200">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{newStudPhoto ? 'Change Photo' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            processImageFile(file, (dataUrl) => setNewStudPhoto(dataUrl));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save Student Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: REVIEW HOMEWORK */}
      {/* ============================================================ */}
      {selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Review School Homework</h3>
              <button onClick={() => setSelectedHw(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 space-y-3">
              <div className="p-3 bg-indigo-50 rounded-xl text-xs">
                <span className="font-bold text-indigo-900 block">Student: {selectedHw.studentName} ({selectedHw.studentId})</span>
                <span className="text-slate-600 block mt-0.5">Subject: {selectedHw.subject}</span>
                <span className="text-slate-700 italic block mt-1">"{selectedHw.description}"</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={hwStatusSelect}
                  onChange={(e) => setHwStatusSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Reviewed">Reviewed & Guided</option>
                  <option value="Completed">Completed in Tuition</option>
                  <option value="Needs Correction">Needs Correction / Incomplete</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teacher Remarks for Parent</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Solved questions 1 to 5 with him. Student has understood the concepts."
                  value={hwRemarkText}
                  onChange={(e) => setHwRemarkText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHw(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReviewHomework}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: REPLY TO PARENT FEEDBACK */}
      {/* ============================================================ */}
      {selectedFb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Reply to Parent Query</h3>
              <button onClick={() => setSelectedFb(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl text-xs">
                <span className="font-bold text-amber-950 block">From Parent of: {selectedFb.studentName} ({selectedFb.studentId})</span>
                <span className="text-slate-600 block">Category: {selectedFb.category}</span>
                <p className="text-slate-800 italic mt-1 font-medium">"{selectedFb.message}"</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Compose Admin Response *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Type your reply to the parent..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFb(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReplyFeedback}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Send Reply to Parent App
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDIT STUDENT FEE AMOUNT & STATUS */}
      {/* ============================================================ */}
      {selectedFeeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Student Fee</h3>
                  <p className="text-xs text-slate-500">{selectedFeeStudent.name} ({selectedFeeStudent.id})</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFeeStudent(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeeModal} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Monthly Fee Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editFeeAmount}
                    onChange={(e) => setEditFeeAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">This updated amount will automatically reflect in the Parent's tab.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Next Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={editFeeDueDate}
                  onChange={(e) => setEditFeeDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Payment Status *
                </label>
                <select
                  value={editFeeStatus}
                  onChange={(e) => setEditFeeStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PAID">PAID (Clear)</option>
                  <option value="PENDING">PENDING (Payment due)</option>
                  <option value="OVERDUE">OVERDUE (Urgent)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedFeeStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save & Update Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDIT ANNOUNCEMENT */}
      {/* ============================================================ */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Announcement</h3>
                  <p className="text-xs text-slate-500">Updates reflect live in the Students & Parents apps</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingAnnouncement(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAnnouncement} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editAnnTitle}
                  onChange={(e) => setEditAnnTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={editAnnCategory}
                    onChange={(e) => setEditAnnCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="General">General Notice</option>
                    <option value="Exam">Exam / Test</option>
                    <option value="Holiday">Holiday Notice</option>
                    <option value="Fee">Fee Notice</option>
                    <option value="Event">Special Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Audience</label>
                  <select
                    value={editAnnTarget}
                    onChange={(e) => setEditAnnTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="All">All Students & Parents</option>
                    <option value="High School">High School (9th-12th)</option>
                    <option value="Middle School">Middle School (6th-8th)</option>
                    <option value="Primary">Primary (LKG-5th)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Content *</label>
                <textarea
                  rows="4"
                  required
                  value={editAnnContent}
                  onChange={(e) => setEditAnnContent(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editPinAnn"
                  checked={editAnnPinned}
                  onChange={(e) => setEditAnnPinned(e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="editPinAnn" className="ml-2 block text-xs font-semibold text-slate-700 cursor-pointer">
                  Pin this announcement to top
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: UPLOAD / CHANGE STUDENT PICTURE */}
      {/* ============================================================ */}
      {selectedPhotoStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Change Student Picture</h3>
                  <p className="text-xs text-slate-500">{selectedPhotoStudent.name} ({selectedPhotoStudent.id})</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPhotoStudent(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentPhoto} className="py-4 space-y-4">
              {/* Photo Preview Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="relative group">
                  <img
                    src={studentPhotoPreview || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedPhotoStudent.id}`}
                    alt={selectedPhotoStudent.name}
                    className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-lg ring-2 ring-indigo-500/30"
                  />
                  {studentPhotoPreview && (
                    <button
                      type="button"
                      onClick={() => setStudentPhotoPreview(`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedPhotoStudent.id}`)}
                      className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow-sm cursor-pointer"
                      title="Reset to default avatar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2.5">{selectedPhotoStudent.name}</span>
                <span className="text-[11px] text-slate-400 font-medium">{selectedPhotoStudent.grade}</span>
                <p className="text-[10px] text-indigo-600 font-semibold mt-1">
                  This picture will display on the student & parent app profile!
                </p>
              </div>

              {/* Upload Controls */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Upload Picture from Device
                </label>
                <label className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition">
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo or Take Picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        processImageFile(file, (dataUrl) => setStudentPhotoPreview(dataUrl));
                      }
                    }}
                  />
                </label>
                <p className="text-[11px] text-slate-400 text-center">
                  Supports mobile camera, JPG, PNG & WebP
                </p>
              </div>

              {/* Or Paste URL */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Or Paste Photo URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  value={studentPhotoPreview.startsWith('data:') ? '' : studentPhotoPreview}
                  onChange={(e) => setStudentPhotoPreview(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPhotoStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPhoto}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center space-x-1 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>{isUpdatingPhoto ? 'Updating...' : 'Save & Update Picture'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      <PhotoModal
        isOpen={Boolean(modalPhoto)}
        onClose={() => setModalPhoto(null)}
        photoUrl={modalPhoto}
        title={modalTitle}
      />
    </div>
  );
}
