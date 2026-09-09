import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="font-semibold text-slate-200">
              NetraDhrishti • MPLADS Compliance & Risk Intelligence Platform
            </div>
            <p className="text-slate-500 mt-1">
              Aligned with Revised MPLADS Guidelines 2023. Powered by Machine Learning & Anomaly Detection.
            </p>
          </div>
          <div className="text-center md:text-right">
            <div className="text-slate-400">
              © 2026 Ministry of Statistics and Programme Implementation (MoSPI)
            </div>
            <p className="text-amber-500/90 mt-1 font-medium">
              ⚠ Disclaimer: Risk indicators reflect automated screening requiring official administrative verification.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
