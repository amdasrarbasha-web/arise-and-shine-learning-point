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
  ExternalLink,
  Shield
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
    <header className="sticky top-0 z-40 bg-black/75 backdrop-blur-2xl border-b border-white/10 transition-all">
      {/* Top Apple Style Micro Notification Strip */}
      <div className="bg-white/[0.03] text-neutral-300 text-[11px] py-1.5 px-4 sm:px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Campus Info */}
          <div className="flex items-center space-x-2.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-extrabold uppercase tracking-widest text-[9px] bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Melvisharam Campus</span>
            </span>

            <span className="text-neutral-700 hidden sm:inline">|</span>

            <span className="hidden sm:inline text-neutral-400 text-[11px]">
              Evening Tuition: 5:00 PM – 9:30 PM (LKG to 12th)
            </span>
          </div>

          {/* Right: Helpline & App Link */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5 text-neutral-300 text-xs font-semibold">
              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
              <a href="tel:6379840006" className="hover:text-white transition">6379840006</a>
              <span className="text-neutral-600">/</span>
              <a href="tel:9842385666" className="hover:text-white transition">9842385666</a>
            </div>

            {!isStandaloneApp && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="bg-white hover:bg-neutral-200 text-black px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-sm"
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden sm:inline">Get App</span>
                <span className="sm:hidden">App</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Apple Cupertino Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentPortal('student')} 
          className="flex items-center space-x-3 cursor-pointer group min-w-0"
        >
          <div className="relative shrink-0">
            <img 
              src="/logo.png" 
              alt="Arise & Shine Logo" 
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]" 
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white font-heading">
                ARISE & SHINE
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10 hidden sm:inline-block">
                Learning Point
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium truncate hidden sm:block">
              Tuition & Academic Excellence • Melvisharam
            </p>
          </div>
        </div>

        {/* Portal Switcher & User Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Apple Segmented Switcher for Portals */}
          <div className="apple-segmented-track flex items-center text-xs font-semibold">
            <button
              onClick={() => setCurrentPortal('student')}
              className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
                currentPortal === 'student' ? 'apple-segmented-item-active' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => setCurrentPortal('admin')}
              className={`px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1 ${
                currentPortal === 'admin' ? 'apple-segmented-item-active' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Admin</span>
            </button>
          </div>

          {/* Logged in student badge */}
          {currentPortal === 'student' && activeStudent && (
            <div className="flex items-center space-x-1.5 ml-2">
              <div className="hidden md:flex items-center space-x-2 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                <img 
                  src={activeStudent.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"} 
                  alt={activeStudent.name}
                  className="w-5 h-5 rounded-full object-cover border border-white/20"
                />
                <span className="text-xs font-bold text-white truncate max-w-[100px]">{activeStudent.name}</span>
              </div>
              <button
                onClick={onStudentLogout}
                className="p-1.5 text-rose-400 hover:text-rose-300 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition text-xs font-bold cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Admin Logged in badge */}
          {currentPortal === 'admin' && isAdminLoggedIn && (
            <button
              onClick={onAdminLogout}
              className="p-1.5 text-rose-400 hover:text-rose-300 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition text-xs font-bold cursor-pointer ml-1"
              title="Exit Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
