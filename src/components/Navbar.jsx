import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  LogOut, 
  Sparkles,
  Smartphone,
  Clock,
  ChevronRight,
  ExternalLink
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
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      {/* Top Luxury Micro-Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Campus Badge & Timings */}
          <div className="flex items-center space-x-3 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-extrabold uppercase tracking-widest text-[10px] shrink-0 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Melvisharam Campus</span>
            </span>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <div className="hidden sm:flex items-center space-x-1.5 text-slate-300">
              <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>Evening Tuition: 5:00 PM – 9:30 PM (LKG to 12th)</span>
            </div>

            <span className="text-slate-700 hidden lg:inline">|</span>

            <a 
              href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden lg:flex items-center space-x-1 text-slate-400 hover:text-amber-400 transition"
            >
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span>Center Location on Google Maps</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
            </a>
          </div>

          {/* Right: Hotline & Get App */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5 text-slate-300 text-xs font-semibold">
              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
              <a href="tel:6379840006" className="hover:text-amber-400 transition">6379840006</a>
              <span className="text-slate-600">/</span>
              <a href="tel:9842385666" className="hover:text-amber-400 transition">9842385666</a>
            </div>

            {!isStandaloneApp && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm transition hover:scale-105 cursor-pointer"
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden xs:inline">Install App</span>
                <span className="xs:hidden">App</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Brand & Actions Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3 text-white">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentPortal(currentPortal === 'admin' ? 'admin' : 'student')} 
          className="flex items-center space-x-3 cursor-pointer group min-w-0"
        >
          <div className="relative shrink-0">
            <img 
              src="/logo.png" 
              alt="Arise & Shine Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
            />
            <div className="absolute -inset-1 bg-amber-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-white font-heading">
                ARISE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">&</span> SHINE
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block">
                Learning Point
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate hidden sm:block">
              {currentPortal === 'admin' ? 'Administrative Control Center & Center Director Desk' : 'Center of Academic Excellence • Coaching LKG to 12th Std'}
            </p>
            <p className="text-[10px] font-bold text-amber-400 truncate sm:hidden">
              {currentPortal === 'admin' ? 'Admin Portal' : 'Student Portal'}
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {currentPortal === 'student' ? (
            activeStudent && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2.5 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800 shadow-inner max-w-[170px] sm:max-w-none">
                  <img
                    src={activeStudent.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeStudent.id}`}
                    alt={activeStudent.name}
                    className="w-7 h-7 rounded-xl object-cover border border-amber-400 shrink-0"
                  />
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-white truncate leading-none">
                      {activeStudent.name}
                    </p>
                    <span className="text-[10px] font-mono font-semibold text-amber-400">
                      {activeStudent.id}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onStudentLogout}
                  className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/30 transition font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Sign Out of Student Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 text-amber-400 rounded-2xl text-xs font-black border border-amber-400/30 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Console</span>
                {isAdminLoggedIn && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </div>

              {isAdminLoggedIn && (
                <button
                  type="button"
                  onClick={onAdminLogout}
                  className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/30 transition font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                  title="Exit Admin Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
