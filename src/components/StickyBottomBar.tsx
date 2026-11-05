import React from 'react';
import { Send, FileText, CheckCircle2 } from 'lucide-react';

interface StickyBottomBarProps {
  onOpenWhatsApp: () => void;
  onGenerateReport: () => void;
  progressPercent: number;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  onOpenWhatsApp,
  onGenerateReport,
  progressPercent,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1726]/95 backdrop-blur-md border-t border-cyan-500/30 p-2.5 sm:p-3 shadow-2xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Progress indicator */}
        <div className="hidden xs:flex flex-col min-w-[70px] sm:min-w-[90px]">
          <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium mb-1">
            <span>Completado</span>
            <span className="font-mono text-cyan-300 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Generar Informe Button */}
          <button
            type="button"
            onClick={onGenerateReport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-3.5 sm:px-5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-200 border border-cyan-500/40 text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="whitespace-nowrap">Generar Informe</span>
          </button>

          {/* Titilante WhatsApp Glowing Button */}
          <button
            type="button"
            onClick={onOpenWhatsApp}
            className="animate-pulse-glow flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-[#25D366] via-[#20be5b] to-[#128C7E] text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer ring-2 ring-emerald-400/50"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span className="whitespace-nowrap">WhatsApp Móvil</span>
            <span className="hidden sm:inline-block text-[10px] bg-slate-950/20 text-slate-950 px-1.5 py-0.5 rounded font-bold uppercase">
              Directo
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
