import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentApp from './components/StudentApp';
import AdminApp from './components/AdminApp';
import InstallAppModal from './components/InstallAppModal';
import { Phone, MapPin, Sparkles, GraduationCap, ShieldCheck } from 'lucide-react';

export default function App() {
  // Current view: 'student' (Student & Parent App) or 'admin' (Admin Portal)
  // Initializes directly based on the URL pathname (/admin vs / or /student)
  const [currentPortal, setCurrentPortal] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/student')) return 'student';
    return localStorage.getItem('arise_current_portal') || 'student';
  });

  // Authenticated states with persistent local memory
  const [activeStudent, setActiveStudent] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('arise_admin_logged_in') === 'true';
  });

  // Mobile App Install Modal & PWA deferred prompt
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Tuition Center Details
  const [centerInfo, setCenterInfo] = useState({
    name: 'ARISE AND SHINE LEARNING POINT',
    location: 'ARISE AND SHINE LEARNING POINT, Melvisharam',
    mapsUrl: 'https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic',
    phones: ['6379840006', '9842385666'],
    timings: 'Mon - Sat: 5:00 PM - 9:30 PM | Special Sunday Batches',
    classes: 'Classes LKG to 12th Std (State Board, Matriculation & CBSE)'
  });

  // Listen to browser popstate so back/forward button navigates between apps
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
        setCurrentPortal('admin');
      } else {
        setCurrentPortal('student');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Capture PWA install prompt for 1-click mobile install
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Fetch center info and restore active student session on mount
  useEffect(() => {
    fetch('/api/center')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setCenterInfo(data);
      })
      .catch(err => console.error('Error fetching center info:', err));

    // Restore saved student profile from memory
    const savedStudentId = localStorage.getItem('arise_active_student_id');
    if (savedStudentId) {
      fetch(`/api/students/${savedStudentId}`)
        .then(res => (res.ok ? res.json() : null))
        .then(studentData => {
          if (studentData) setActiveStudent(studentData);
        })
        .catch(err => console.error('Error restoring student session:', err));
    }
  }, []);

  // Sync state changes to persistent browser memory and URL
  const handlePortalChange = (portal) => {
    setCurrentPortal(portal);
    localStorage.setItem('arise_current_portal', portal);
    const targetPath = portal === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const handleStudentLogin = (stud) => {
    setActiveStudent(stud);
    if (stud?.id) {
      localStorage.setItem('arise_active_student_id', stud.id);
    }
  };

  const handleStudentLogout = () => {
    setActiveStudent(null);
    localStorage.removeItem('arise_active_student_id');
  };

  const handleAdminLoginState = (isLoggedIn) => {
    setIsAdminLoggedIn(isLoggedIn);
    if (isLoggedIn) {
      localStorage.setItem('arise_admin_logged_in', 'true');
    } else {
      localStorage.removeItem('arise_admin_logged_in');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white pb-safe">
      {/* Navigation Bar */}
      <Navbar
        currentPortal={currentPortal}
        setCurrentPortal={handlePortalChange}
        activeStudent={activeStudent}
        onStudentLogout={handleStudentLogout}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={() => handleAdminLoginState(false)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1">
        {currentPortal === 'student' ? (
          <StudentApp
            student={activeStudent}
            onLogout={handleStudentLogout}
            onLoginSuccess={handleStudentLogin}
            centerInfo={centerInfo}
          />
        ) : (
          <AdminApp
            isAdminLoggedIn={isAdminLoggedIn}
            onAdminLoginSuccess={() => handleAdminLoginState(true)}
            onAdminLogout={() => handleAdminLoginState(false)}
            centerInfo={centerInfo}
          />
        )}
      </main>

      {/* Mobile App Install / Play Store & App Store Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800 text-center md:text-left">
            <div className="flex items-center space-x-3.5">
              <img 
                src="/logo.png" 
                alt="Arise & Shine Logo" 
                className="w-12 h-12 object-contain shrink-0 drop-shadow-sm" 
              />
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-white font-black text-base font-heading">
                    ARISE AND SHINE TUITION CENTER
                  </span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                    Melvisharam
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Coaching & Tuition for Classes LKG to 12th Std • State Board, Matriculation & CBSE
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
              <a 
                href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 hover:text-amber-400 transition underline underline-offset-4 decoration-slate-600 hover:decoration-amber-400"
                title="Open location on Google Maps"
              >
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Melvisharam Center (Google Maps)</span>
              </a>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call / WhatsApp:</span>
                <a href="tel:6379840006" className="text-white font-bold hover:text-amber-400">6379840006</a>
                <span>,</span>
                <a href="tel:9842385666" className="text-white font-bold hover:text-amber-400">9842385666</a>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} ARISE AND SHINE LEARNING POINT. All Rights Reserved.</span>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsInstallModalOpen(true)} 
                className="text-amber-400 hover:text-amber-300 transition cursor-pointer font-bold"
              >
                Download Mobile App
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}