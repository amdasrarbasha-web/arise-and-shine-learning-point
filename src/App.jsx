import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentApp from './components/StudentApp';
import AdminApp from './components/AdminApp';
import InstallAppModal from './components/InstallAppModal';
import { Phone, MapPin, Sparkles, GraduationCap, ShieldCheck, Smartphone, X } from 'lucide-react';

export default function App() {
  // Current view: 'student' (Student & Parent App) or 'admin' (Admin Portal)
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
  const [deferredPrompt, setDeferredPrompt] = useState(() => {
    return typeof window !== 'undefined' ? window.deferredPrompt || null : null;
  });

  // Standalone app detection (true when opened as installed app from phone screen or desktop)
  const [isStandaloneApp, setIsStandaloneApp] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://') ||
      window.location.search.includes('mode=standalone')
    );
  });

  // User dismissed top banner for this session
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('arise_install_banner_dismissed') === 'true';
  });

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

  // Sync PWA install prompt & standalone detection
  useEffect(() => {
    const syncPrompt = () => {
      if (window.deferredPrompt) {
        setDeferredPrompt(window.deferredPrompt);
      }
    };
    syncPrompt();
    window.addEventListener('pwa-prompt-ready', syncPrompt);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleModeChange = (e) => setIsStandaloneApp(e.matches);
    mediaQuery.addEventListener('change', handleModeChange);

    const handleAppInstalled = () => {
      setIsStandaloneApp(true);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') window.deferredPrompt = null;
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', syncPrompt);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      mediaQuery.removeEventListener('change', handleModeChange);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Fetch center info and restore active student session on mount
  useEffect(() => {
    fetch('/api/center')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setCenterInfo(data);
      })
      .catch(err => console.error('Error fetching center info:', err));

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
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-safe relative overflow-x-hidden">
      {/* Ambient Luxury Lighting Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed top-1/3 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 left-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Navigation Bar */}
      <Navbar
        currentPortal={currentPortal}
        setCurrentPortal={handlePortalChange}
        activeStudent={activeStudent}
        onStudentLogout={handleStudentLogout}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={() => handleAdminLoginState(false)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isStandaloneApp={isStandaloneApp}
      />

      {/* Prominent Install Prompt Banner (Sleek, single-line responsive) */}
      {!isStandaloneApp && !isBannerDismissed && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold shadow-xs border-b border-amber-600/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="p-1 bg-slate-950 text-amber-400 rounded-md shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </span>
              <span className="truncate sm:whitespace-normal">
                <strong className="hidden sm:inline">For the best experience: </strong>
                <span>Install <strong>Arise & Shine App</strong> on phone</span>
              </span>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(true)}
                className="bg-slate-950 hover:bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                Install App
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBannerDismissed(true);
                  sessionStorage.setItem('arise_install_banner_dismissed', 'true');
                }}
                className="p-1 text-slate-900 hover:text-slate-700 rounded transition cursor-pointer font-bold text-xs"
                title="Dismiss Banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1">
        {currentPortal === 'student' ? (
          <StudentApp
            student={activeStudent}
            onLogout={handleStudentLogout}
            onLoginSuccess={handleStudentLogin}
            onStudentUpdate={setActiveStudent}
            centerInfo={centerInfo}
            isStandaloneApp={isStandaloneApp}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
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
            {!isStandaloneApp && (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsInstallModalOpen(true)} 
                  className="text-amber-400 hover:text-amber-300 transition cursor-pointer font-bold"
                >
                  Download Mobile App
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}