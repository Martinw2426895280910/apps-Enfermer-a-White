import React from 'react';
import { BMIResult } from '../utils/clinicalCalculators';
import { Scale, Info } from 'lucide-react';

interface BMIGaugeProps {
  bmiResult: BMIResult;
  weight: string;
  height: string;
}

const BMI_RANGES = [
  { key: 'severe', label: '< 16.0', title: 'Delgadez severa', color: 'bg-rose-500/80', textCol: 'text-rose-400' },
  { key: 'moderate', label: '16.0–16.9', title: 'Delgadez moderada', color: 'bg-amber-500/80', textCol: 'text-amber-400' },
  { key: 'mild', label: '17.0–18.4', title: 'Delgadez leve', color: 'bg-yellow-500/80', textCol: 'text-yellow-400' },
  { key: 'normal', label: '18.5–24.9', title: 'Intervalo normal', color: 'bg-emerald-500/80', textCol: 'text-emerald-400' },
  { key: 'over', label: '25.0–29.9', title: 'Sobrepeso', color: 'bg-amber-500/80', textCol: 'text-amber-400' },
  { key: 'ob1', label: '30.0–34.9', title: 'Obesidad I', color: 'bg-orange-500/80', textCol: 'text-orange-400' },
  { key: 'ob2', label: '35.0–39.9', title: 'Obesidad II', color: 'bg-rose-500/80', textCol: 'text-rose-400' },
  { key: 'ob3', label: '≥ 40.0', title: 'Obesidad III', color: 'bg-rose-700/80', textCol: 'text-rose-300' },
];

export const BMIGauge: React.FC<BMIGaugeProps> = ({ bmiResult, weight, height }) => {
  const { bmi, category, categoryKey, isPediatric } = bmiResult;

  // Calculate percentage pointer along scale (12 to 45 BMI)
  let percent = 50;
  if (bmi !== null) {
    const minB = 14;
    const maxB = 42;
    percent = Math.min(Math.max(((bmi - minB) / (maxB - minB)) * 100, 2), 98);
  }

  return (
    <div className="space-y-3">
      {/* Gauge bar */}
      <div className="relative pt-2">
        <div className="flex justify-between items-center mb-1 text-xs text-slate-300">
          <span className="font-semibold flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Índice de Masa Corporal (IMC)</span>
          </span>
          {bmi !== null ? (
            <span className={`font-bold font-mono text-sm ${bmiResult.color}`}>
              {bmi} kg/m²
            </span>
          ) : (
            <span className="text-slate-500 text-xs font-mono">Sin datos</span>
          )}
        </div>

        {/* Visual Multi-segment Bar */}
        <div className="h-3 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-900 border border-slate-700">
          <div className="w-[12%] bg-rose-600/70" title="Delgadez <18.5" />
          <div className="w-[30%] bg-emerald-500/80" title="Normal 18.5-24.9" />
          <div className="w-[20%] bg-amber-500/80" title="Sobrepeso 25.0-29.9" />
          <div className="w-[18%] bg-orange-500/80" title="Obesidad I 30.0-34.9" />
          <div className="w-[20%] bg-rose-500/90" title="Obesidad II/III ≥35" />
        </div>

        {/* Pointer indicator */}
        {bmi !== null && (
          <div
            className="absolute top-8 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
            style={{ left: `${percent}%` }}
          >
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-cyan-400" />
            <div className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-400/50 shadow-md whitespace-nowrap">
              {bmi}
            </div>
          </div>
        )}
      </div>

      {/* Formula & Explanation Result Box */}
      <div className={`mt-5 p-3 rounded-xl border text-xs leading-relaxed ${
        bmi !== null
          ? categoryKey === 'normal'
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
          : 'bg-slate-900/60 border-slate-800 text-slate-300'
      }`}>
        <div className="font-semibold flex items-center justify-between">
          <span>{category !== 'Pendiente' ? `Clasificación: ${category}` : 'Cálculo de IMC'}</span>
          {weight && height && (
            <span className="font-mono text-[11px] text-slate-400">
              {weight} kg ÷ ({(parseFloat(height) / 100).toFixed(2)} m)²
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-300 mt-1">
          {bmiResult.text}
        </div>
      </div>

      {/* Responsive WHO Adults Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <th className="py-2 px-3 font-semibold">IMC (kg/m²)</th>
              <th className="py-2 px-3 font-semibold">Clasificación Adultos (OMS)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {BMI_RANGES.map((row) => {
              const isActive = categoryKey === row.key;
              return (
                <tr
                  key={row.key}
                  className={`transition-colors ${
                    isActive
                      ? 'bg-cyan-950/70 font-semibold text-white'
                      : 'hover:bg-slate-900/40 text-slate-300'
                  }`}
                >
                  <td className="py-1.5 px-3 font-mono text-[11px]">
                    {row.label}
                  </td>
                  <td className="py-1.5 px-3 flex items-center justify-between">
                    <span className={isActive ? row.textCol : ''}>{row.title}</span>
                    {isActive && (
                      <span className="text-emerald-400 font-bold ml-2">✓ Activo</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isPediatric && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-[11px] text-cyan-200">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Paciente pediátrico (&lt; 18 años): los puntos de corte adultos no definen sobrepeso o desnutrición. Se debe utilizar la gráfica de percentiles OMS / SAP según sexo.
          </span>
        </div>
      )}
    </div>
  );
};
