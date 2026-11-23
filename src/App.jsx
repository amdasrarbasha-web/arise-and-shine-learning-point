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
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col selection:bg-indigo-500 selection:text-white pb-safe relative overflow-x-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed top-1/2 right-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 left-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

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

      {/* Apple Dynamic Island Floating Pill Banner */}
      {!isStandaloneApp && !isBannerDismissed && (
        <div className="px-4 py-2 flex justify-center sticky top-15 z-30 pointer-events-none">
          <div className="pointer-events-auto bg-neutral-900/90 backdrop-blur-2xl border border-white/15 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center justify-between gap-3 max-w-lg w-full">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate text-neutral-300">
                Install <strong>Arise & Shine App</strong> for best mobile experience
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(true)}
                className="bg-white hover:bg-neutral-200 text-black px-3 py-1 rounded-full text-[11px] font-black transition active:scale-95 cursor-pointer shadow-sm"
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBannerDismissed(true);
                  sessionStorage.setItem('arise_install_banner_dismissed', 'true');
                }}
                className="p-1 text-neutral-400 hover:text-white rounded-full transition cursor-pointer text-xs"
                title="Dismiss"
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

      {/* Global Apple Cupertino Footer */}
      <footer className="bg-black text-neutral-400 text-xs py-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10 text-center md:text-left">
            <div className="flex items-center space-x-3.5">
              <img 
                src="/logo.png" 
                alt="Arise & Shine Logo" 
                className="w-10 h-10 object-contain shrink-0 drop-shadow-md" 
              />
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-white font-black text-sm tracking-tight font-heading">
                    ARISE AND SHINE LEARNING POINT
                  </span>
                  <span className="text-[10px] bg-white/10 text-neutral-300 font-bold px-2 py-0.5 rounded-full border border-white/10">
                    Melvisharam
                  </span>
                </div>
                <p className="text-neutral-400 text-xs mt-0.5">
                  Academic Tuition & Mentorship • Classes LKG to 12th Std
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-300">
              <a 
                href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 hover:text-white transition"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Melvisharam Center (Google Maps)</span>
              </a>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call:</span>
                <a href="tel:6379840006" className="text-white font-bold hover:text-amber-400">6379840006</a>
                <span>,</span>
                <a href="tel:9842385666" className="text-white font-bold hover:text-amber-400">9842385666</a>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-500">
            <span>© {new Date().getFullYear()} ARISE AND SHINE LEARNING POINT. All Rights Reserved.</span>
            {!isStandaloneApp && (
              <button 
                onClick={() => setIsInstallModalOpen(true)} 
                className="text-white hover:text-neutral-300 transition cursor-pointer font-bold"
              >
                Download Mobile App (.apk)
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}