import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  LogOut, 
  User, 
  Sparkles,
  Smartphone,
  Download
} from 'lucide-react';

export default function Navbar({ 
  currentPortal, 
  setCurrentPortal, 
  activeStudent, 
  onStudentLogout, 
  isAdminLoggedIn, 
  onAdminLogout,
  onOpenInstallModal,
  isStandaloneApp 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro bar for Center Details - Hidden on mobile if student is logged in for maximum app space */}
      <div className={`bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white text-[11px] py-1 px-3 sm:px-6 ${activeStudent ? 'hidden sm:block' : 'block'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 truncate">
            <span className="flex items-center gap-1 text-amber-300 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] shrink-0">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Tuition Excellence</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <div className="flex items-center space-x-1 text-slate-200 text-[11px] truncate">
              <Phone className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <a href="tel:6379840006" className="font-semibold text-white hover:text-amber-300 transition">6379840006</a>
              <span>/</span>
              <a href="tel:9842385666" className="font-semibold text-white hover:text-amber-300 transition">9842385666</a>
            </div>
          </div>

          {!isStandaloneApp && (
            <button
              onClick={onOpenInstallModal}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 transition cursor-pointer shadow-xs shrink-0"
              title="Install official mobile app on your phone"
            >
              <Smartphone className="w-3 h-3" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentPortal('student')} 
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group min-w-0"
        >
          <img 
            src="/logo.png" 
            alt="Arise and Shine Tuition Center Logo" 
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain group-hover:scale-105 transition-transform duration-200 shrink-0 drop-shadow-sm" 
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 font-heading truncate">
                ARISE <span className="text-amber-500">&</span> SHINE
              </span>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 hidden sm:inline-block shrink-0">
                PORTAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate hidden sm:block">
              Coaching for LKG to 12th Std • Melvisharam
            </p>
            <p className="text-[10px] text-blue-600 font-bold truncate sm:hidden">
              {currentPortal === 'admin' ? 'Center Admin Portal' : 'Official Student App'}
            </p>
          </div>
        </div>

        {/* Right side Actions (No Admin Tab in Student App) */}
        <div className="flex items-center space-x-2 shrink-0">
          {currentPortal === 'student' ? (
            // In Student & Parent App: Clean view with student status & logout only
            activeStudent && (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 max-w-[130px] sm:max-w-none truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="truncate">{activeStudent.name}</span>
                </span>
                <button
                  onClick={onStudentLogout}
                  className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-rose-200 transition font-bold cursor-pointer shrink-0"
                  title="Sign Out of Student Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )
          ) : (
            // In Admin App: Secure Admin Portal Header
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-amber-400 rounded-xl text-xs font-bold border border-slate-700 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Portal</span>
                {isAdminLoggedIn && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </span>
              {isAdminLoggedIn && (
                <button
                  onClick={onAdminLogout}
                  className="flex items-center space-x-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition font-medium cursor-pointer"
                  title="Exit Admin Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit Admin</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
