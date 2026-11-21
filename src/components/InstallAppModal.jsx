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
  GraduationCap,
  ArrowRight,
  Info
} from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose, deferredPrompt }) {
  const [isCopied, setIsCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('auto'); // 'auto', 'iphone', 'android'

  // Detect platform
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);

  useEffect(() => {
    if (isIOS) setActiveTab('iphone');
    else if (isAndroid) setActiveTab('android');
    else setActiveTab('auto');
  }, [isIOS, isAndroid]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? window.deferredPrompt : null);
    
    if (promptToUse) {
      try {
        promptToUse.prompt();
        const choiceResult = await promptToUse.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setInstallSuccess(true);
          if (typeof window !== 'undefined') window.deferredPrompt = null;
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
    } else {
      if (isIOS) {
        setActiveTab('iphone');
      } else {
        setActiveTab('android');
      }
    }
  };

  const handleShareApp = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({
        title: 'Arise & Shine Learning Point App',
        text: 'Install the official Arise & Shine Learning Point App on your phone for student profile, homework, and fee updates.',
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Arise & Shine Logo" 
              className="w-10 h-10 object-contain drop-shadow-sm" 
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Install Official App</h3>
              <p className="text-xs text-slate-500">Android, iPhone & Desktop Independent App</p>
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
        <div className="py-4 space-y-4">
          {/* Main Action Banner */}
          <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                  Standalone App Experience
                </span>
                <h4 className="text-sm font-bold">Install to Your Phone Home Screen</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Operates as a 100% individual app with no browser address bar, instant student notifications, camera uploads, and fast loading.
                </p>
              </div>
              <div className="p-2.5 bg-white/10 rounded-xl shrink-0">
                <Smartphone className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            {/* Install Trigger Button */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {installSuccess ? '✓ Installation Started!' : 'Install App Now'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleShareApp}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Share link with parents via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isCopied ? 'Copied Link!' : 'Share Link'}</span>
              </button>
            </div>
          </div>

          {/* Device Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('iphone')}
              className={`flex-1 py-2 text-center border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'iphone'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone (iOS)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 text-center border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'android'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Android Phones</span>
            </button>
          </div>

          {/* TAB 1: IPHONE INSTRUCTIONS */}
          {activeTab === 'iphone' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-1 border-b border-slate-200">
                <Apple className="w-4 h-4 text-slate-800" />
                <span>How to Install on iPhone / iPad (Safari)</span>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Why no direct APK?</strong> Apple strictly blocks third-party file downloads for iPhone security. Instead, Apple has built-in <strong>Web App Installation</strong> directly inside Safari that turns this into a standalone native app!
                </span>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span>Open this website in <strong>Safari</strong> on your iPhone.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <div>
                    <span>Tap the <strong>Share button</strong> <span className="inline-block px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">⎋</span> (square with arrow pointing up at the bottom).</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <div>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong> <span className="inline-block px-1.5 py-0.5 bg-white border border-slate-300 rounded font-bold text-[10px]">+</span>.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
                  <div>
                    <span>Tap <strong>"Add"</strong> at the top right. Done! The <strong>Arise & Shine</strong> app icon will now appear on your iPhone home screen and run full screen.</span>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* TAB 2: ANDROID INSTRUCTIONS */}
          {activeTab === 'android' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-1 border-b border-slate-200">
                <Play className="w-4 h-4 text-emerald-600" />
                <span>How to Install on Android (Chrome / Samsung Internet)</span>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span>Tap the <strong>"Install App Now"</strong> button above, or tap the <strong>3 vertical dots (⋮)</strong> at the top right of Chrome.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <div>
                    <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <div>
                    <span>Confirm by tapping <strong>"Install"</strong>. The official app is immediately downloaded to your phone's app drawer!</span>
                  </div>
                </li>
              </ol>

              {/* Direct APK Download Option */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  Or Download Direct APK File (.apk):
                </span>
                <a
                  href="/arise-and-shine.apk"
                  download="Arise-and-Shine.apk"
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Arise & Shine APK (.apk)</span>
                </a>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  Direct Android installation file. Tap to download, then tap open in your phone's notification bar or downloads folder to install.
                </p>
              </div>
            </div>
          )}

          {/* Once Installed Notice */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Automatic Clean UI</span>
              <span className="text-[11px] text-emerald-800">
                Once you open the installed app from your home screen, the "Install App" button and banners will disappear automatically!
              </span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Continue in Browser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}