import React from 'react';
import { getPainEVAData } from '../utils/clinicalCalculators';

interface EVASliderProps {
  value: number;
  onChange: (val: number) => void;
}

const EVA_PRESETS = [
  { val: 0, label: '0', face: '😊', desc: 'Sin dolor' },
  { val: 2, label: '2', face: '🙂', desc: 'Leve' },
  { val: 4, label: '4', face: '😐', desc: 'Moderado' },
  { val: 7, label: '7', face: '😣', desc: 'Severo' },
  { val: 10, label: '10', face: '😭', desc: 'Insoportable' },
];

export const EVASlider: React.FC<EVASliderProps> = ({ value, onChange }) => {
  const painInfo = getPainEVAData(value);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>Escala Visual Analógica (EVA)</span>
        </label>
        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${painInfo.bg} ${painInfo.color} border border-current/30`}>
          <span className="text-base">{painInfo.face}</span>
          <span>{value} / 10 · {painInfo.label}</span>
        </div>
      </div>

      {/* Interactive Range Slider with custom colored gradient track */}
      <div className="relative pt-1">
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #06b6d4 30%, #f59e0b 60%, #ea580c 80%, #ef4444 100%)`,
          }}
        />

        <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1 px-1">
          <span>0 (Nada)</span>
          <span>2</span>
          <span>4</span>
          <span>6</span>
          <span>8</span>
          <span>10 (Máximo)</span>
        </div>
      </div>

      {/* Quick tap buttons for mobile thumb selection */}
      <div className="grid grid-cols-5 gap-1.5 pt-1">
        {EVA_PRESETS.map((p) => {
          const isSelected = value === p.val || (p.val === 2 && value >= 1 && value <= 3) || (p.val === 4 && value >= 4 && value <= 6) || (p.val === 7 && value >= 7 && value <= 8) || (p.val === 10 && value >= 9);
          return (
            <button
              key={p.val}
              type="button"
              onClick={() => onChange(p.val)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center min-h-[52px] ${
                isSelected
                  ? 'bg-slate-800 border-cyan-400 shadow-md shadow-cyan-900/40 ring-1 ring-cyan-400'
                  : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="text-xl mb-0.5">{p.face}</span>
              <span className="text-[11px] font-bold">{p.label}</span>
              <span className="text-[9px] text-slate-400 truncate max-w-full">{p.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
