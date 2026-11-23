import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  LogOut, 
  Sparkles,
  Smartphone,
  Download,
  Clock,
  Compass,
  ArrowRight
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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all">
      {/* Top Premium Micro-Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white text-[11px] py-1.5 px-3 sm:px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Institution Highlights */}
          <div className="flex items-center space-x-3 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>Melvisharam Campus</span>
            </span>

            <span className="text-slate-600 hidden md:inline">•</span>

            <div className="hidden sm:flex items-center space-x-1.5 text-slate-300">
              <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>Classes: 5:00 PM – 9:30 PM (LKG – 12th)</span>
            </div>

            <span className="text-slate-600 hidden lg:inline">•</span>

            <a 
              href="https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden lg:flex items-center space-x-1 text-slate-300 hover:text-amber-300 transition"
            >
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="underline underline-offset-2">Location Map</span>
            </a>
          </div>

          {/* Right: Contact & Install App */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5 text-slate-200 font-medium">
              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
              <a href="tel:6379840006" className="hover:text-amber-300 transition font-semibold">6379840006</a>
              <span className="text-slate-500">/</span>
              <a href="tel:9842385666" className="hover:text-amber-300 transition font-semibold">9842385666</a>
            </div>

            {!isStandaloneApp && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-sm transition-all hover:scale-105 cursor-pointer"
                title="Install official app on phone"
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden xs:inline">Get Mobile App</span>
                <span className="xs:hidden">App</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Brand & Actions Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentPortal(currentPortal === 'admin' ? 'admin' : 'student')} 
          className="flex items-center space-x-3 cursor-pointer group min-w-0"
        >
          <div className="relative shrink-0">
            <img 
              src="/logo.png" 
              alt="Arise & Shine Logo" 
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md" 
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl font-black tracking-tight text-slate-950 font-heading">
                ARISE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">&</span> SHINE
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden sm:inline-block">
                Learning Point
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate hidden sm:block">
              {currentPortal === 'admin' ? 'Tuition Center Administration & Director Desk' : 'Premier Academic Tuition & Coaching • Melvisharam'}
            </p>
            <p className="text-[10px] font-bold text-indigo-600 truncate sm:hidden">
              {currentPortal === 'admin' ? 'Admin Control Center' : 'Student Portal'}
            </p>
          </div>
        </div>

        {/* Right Actions: Student Info / Admin Pill & Logout */}
        <div className="flex items-center space-x-2 shrink-0">
          {currentPortal === 'student' ? (
            activeStudent && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100/80 px-2.5 py-1.5 rounded-2xl border border-slate-200/80 transition shadow-xs max-w-[170px] sm:max-w-none">
                  <img
                    src={activeStudent.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeStudent.id}`}
                    alt={activeStudent.name}
                    className="w-7 h-7 rounded-xl object-cover border border-amber-400 shrink-0"
                  />
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-slate-900 truncate leading-none">
                      {activeStudent.name}
                    </p>
                    <span className="text-[10px] font-mono font-semibold text-indigo-600">
                      {activeStudent.id}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onStudentLogout}
                  className="p-2 sm:px-3 sm:py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-xl border border-rose-200/60 transition font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  title="Sign Out of Student Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 text-amber-400 rounded-xl text-xs font-bold border border-slate-800 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Portal</span>
                {isAdminLoggedIn && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </div>

              {isAdminLoggedIn && (
                <button
                  type="button"
                  onClick={onAdminLogout}
                  className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition font-bold flex items-center gap-1 cursor-pointer active:scale-95"
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
