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
  onOpenInstallModal 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro bar for Center Details */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1 text-amber-300 font-semibold tracking-wide uppercase text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              Tuition & Academic Excellence
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <a 
              href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 text-slate-200 hover:text-amber-300 transition"
              title="Open Location on Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span className="underline decoration-slate-500 underline-offset-2">Melvisharam (View on Google Maps)</span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-200">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Contact:</span>
              <a href="tel:6379840006" className="font-semibold text-white hover:text-amber-300 transition">6379840006</a>
              <span>,</span>
              <a href="tel:9842385666" className="font-semibold text-white hover:text-amber-300 transition">9842385666</a>
            </div>

            <button
              onClick={onOpenInstallModal}
              className="bg-amber-500/90 hover:bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Install official mobile app on your phone"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentPortal('student')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <img 
            src="/logo.png" 
            alt="Arise and Shine Tuition Center Logo" 
            className="w-12 h-12 object-contain group-hover:scale-105 transition-transform duration-200 shrink-0 drop-shadow-sm" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                ARISE <span className="text-amber-500">&</span> SHINE
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 hidden sm:inline-block">
                TUITION CENTER
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Coaching for LKG to 12th Std • Melvisharam
            </p>
          </div>
        </div>

        {/* Portal Switcher & Auth status */}
        <div className="flex items-center space-x-3">
          {/* Main App Switcher Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/90 shadow-inner">
            <button
              onClick={() => setCurrentPortal('student')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentPortal === 'student'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Student / Parent App</span>
              {activeStudent && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setCurrentPortal('admin')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentPortal === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Portal</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>
          </div>

          {/* User state logout actions */}
          {currentPortal === 'student' && activeStudent && (
            <button
              onClick={onStudentLogout}
              className="flex items-center space-x-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition font-medium cursor-pointer"
              title="Sign Out of Student Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}

          {currentPortal === 'admin' && isAdminLoggedIn && (
            <button
              onClick={onAdminLogout}
              className="flex items-center space-x-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition font-medium cursor-pointer"
              title="Exit Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Exit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
