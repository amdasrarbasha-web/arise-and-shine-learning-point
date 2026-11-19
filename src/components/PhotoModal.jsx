import React from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

export default function PhotoModal({ isOpen, onClose, photoUrl, title, subtitle }) {
  if (!isOpen || !photoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700 text-white">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{title || 'Homework Document / Worksheet'}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
              title="Open full image in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/70">
          <img
            src={photoUrl}
            alt="Homework Worksheet"
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-lg border border-slate-800"
          />
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-800 text-xs text-slate-400 flex items-center justify-between border-t border-slate-700">
          <span>Shared by parent for Arise and Shine Learning Point supervision</span>
          <span>Tip: Right-click image to save or print</span>
        </div>
      </div>
    </div>
  );
}
