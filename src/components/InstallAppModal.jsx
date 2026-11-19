import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Share2, 
  Apple, 
  Play, 
  ExternalLink,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose, deferredPrompt }) {
  const [isCopied, setIsCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallSuccess(true);
      }
    } else {
      // If prompt isn't supported, guide user to browser menu
      alert('To install on your phone:\n- Android Chrome: Tap menu (⋮) > "Install app" or "Add to Home screen"\n- iPhone Safari: Tap Share (⎋) > "Add to Home Screen"');
    }
  };

  const handleShareApp = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({
        title: 'Arise & Shine Learning Point App',
        text: 'Download the official Arise & Shine Learning Point App for students, parents, and teachers.',
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain drop-shadow-sm" 
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Install Mobile Apps</h3>
              <p className="text-xs text-slate-500">Google Play Store, App Store & Mobile Install</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5">
          {/* App Cards Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-center">
              <div className="w-8 h-8 mx-auto bg-blue-600 text-white rounded-xl flex items-center justify-center mb-1.5 shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-blue-950">App 1: Student & Parent</h4>
              <p className="text-[10px] text-blue-700/80 mt-0.5">Attendance, Homework & Fees</p>
            </div>

            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100 text-center">
              <div className="w-8 h-8 mx-auto bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center mb-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-amber-950">App 2: Admin Portal</h4>
              <p className="text-[10px] text-amber-700/80 mt-0.5">Full Student & Fee Control</p>
            </div>
          </div>

          {/* 1-Click Install Button */}
          <div className="p-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                  Instant Mobile Installation
                </span>
                <h4 className="text-sm font-bold">Add to Your Phone Screen</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Install both apps directly on your Android or iPhone. Operates full-screen with offline support and zero browser bars!
                </p>
              </div>
              <div className="p-2.5 bg-white/10 rounded-xl shrink-0">
                <Smartphone className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{installSuccess ? 'App Installed!' : 'Install Mobile App Now'}</span>
              </button>

              <button
                onClick={handleShareApp}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Share link with parents via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isCopied ? 'Link Copied!' : 'Share App'}</span>
              </button>
            </div>
          </div>

          {/* Platform Specific Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Step-by-Step Mobile Instructions
            </h4>

            {/* Android Guide */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start space-x-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                <Play className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Android & Google Chrome:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  1. Open this website in Chrome on your phone.<br />
                  2. Tap the <strong>three dots (⋮)</strong> menu at the top right.<br />
                  3. Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.<br />
                  4. The official Arise & Shine app icon will appear on your app drawer!
                </p>
              </div>
            </div>

            {/* iOS Guide */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start space-x-3">
              <div className="p-2 bg-slate-200 text-slate-800 rounded-xl shrink-0">
                <Apple className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">iPhone / iPad (Apple Safari):</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  1. Open this website in Safari on your iPhone.<br />
                  2. Tap the <strong>Share button (square with arrow ⎋)</strong> at the bottom.<br />
                  3. Scroll down and tap <strong>"Add to Home Screen"</strong>.<br />
                  4. Tap <strong>"Add"</strong> in the top right corner. Done!
                </p>
              </div>
            </div>

            {/* Store Release Details */}
            <div className="p-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/60 text-xs">
              <span className="font-bold text-indigo-950 block">Play Store & App Store Packaging:</span>
              <p className="text-indigo-800/90 mt-1 leading-relaxed">
                Both apps are configured with native <strong>Capacitor</strong> and <strong>PWA manifest</strong>, ready to build native Android APK/AAB for <strong>Google Play Console</strong> and Xcode iOS packages for <strong>Apple App Store Connect</strong>.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}