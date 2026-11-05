import React from 'react';
import { HeartPulse, Activity, Zap } from 'lucide-react';

interface ECGMonitorProps {
  heartRate: string;
  spo2: string;
  systolic: string;
  diastolic: string;
}

export const ECGMonitor: React.FC<ECGMonitorProps> = ({ heartRate, spo2, systolic, diastolic }) => {
  const hrNum = parseFloat(heartRate);
  const isTachycardia = !isNaN(hrNum) && hrNum > 100;
  const isBradycardia = !isNaN(hrNum) && hrNum < 50;
  const isNormal = !isNaN(hrNum) && hrNum >= 50 && hrNum <= 100;

  // Calculate animation duration based on heart rate (e.g. 60bpm -> 1.0s, 120bpm -> 0.5s)
  const animDuration = hrNum && hrNum > 30 && hrNum < 220 ? (60 / hrNum).toFixed(2) + 's' : '1.2s';

  const strokeColor = isTachycardia ? '#f87171' : isBradycardia ? '#fbbf24' : '#34d399';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-[#0b1626] to-slate-900 border border-cyan-500/30 p-4 shadow-xl">
      {/* Background medical grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" /> Monitor de Ritmo & Trazo ECG
          </span>
        </div>
        <div className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>Derivación II · 25 mm/s</span>
        </div>
      </div>

      {/* SVG ECG stroke trace */}
      <div className="relative z-10 h-16 w-full flex items-center overflow-hidden my-1">
        <svg viewBox="0 0 600 80" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          {/* Subtle baseline glow */}
          <path
            d="M0,40 L60,40 L70,40 L80,38 L88,43 L96,40 L115,40 L125,37 L132,45 L138,5 L146,75 L154,34 L160,44 L168,40 L190,40 L205,33 L218,33 L230,40 L300,40 L360,40 L370,40 L380,38 L388,43 L396,40 L415,40 L425,37 L432,45 L438,5 L446,75 L454,34 L460,44 L468,40 L490,40 L505,33 L518,33 L530,40 L600,40"
            fill="none"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: `drop-shadow(0 0 6px ${strokeColor})`,
              strokeDasharray: '600',
              animation: `ecgLineMove ${animDuration} linear infinite`,
            }}
          />
        </svg>

        {/* Scan line effect */}
        <div
          className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none"
          style={{
            animation: `ecgLineMove ${animDuration} linear infinite`,
          }}
        />
      </div>

      {/* Live readout strip */}
      <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Frecuencia</span>
          </div>
          <div className="mt-1 flex items-baseline justify-center gap-1">
            <span
              className={`text-2xl font-bold font-mono tracking-tight ${
                isTachycardia
                  ? 'text-rose-400 animate-pulse'
                  : isBradycardia
                  ? 'text-amber-400'
                  : isNormal
                  ? 'text-emerald-400'
                  : 'text-slate-300'
              }`}
            >
              {heartRate ? heartRate : '--'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">lpm</span>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-medium">Presión Arterial</div>
          <div className="mt-1 flex items-baseline justify-center gap-1">
            <span className="text-xl font-bold font-mono text-cyan-300">
              {systolic || diastolic ? `${systolic || '--'}/${diastolic || '--'}` : '--/--'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">mmHg</span>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-medium">Saturación O₂</div>
          <div className="mt-1 flex items-baseline justify-center gap-1">
            <span
              className={`text-2xl font-bold font-mono ${
                parseFloat(spo2) < 92 ? 'text-rose-400 animate-pulse' : 'text-teal-300'
              }`}
            >
              {spo2 ? `${spo2}%` : '--%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
