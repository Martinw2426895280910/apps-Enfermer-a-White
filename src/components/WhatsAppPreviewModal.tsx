import React, { useState } from 'react';
import { MessageSquare, Copy, Check, Send, Phone, X, ExternalLink, Printer } from 'lucide-react';

interface WhatsAppPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportText: string;
  patientName: string;
  bed: string;
}

export const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({
  isOpen,
  onClose,
  reportText,
  patientName,
  bed,
}) => {
  const [copied, setCopied] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = reportText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const handleSendWhatsAppGeneral = () => {
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    let url = '';
    if (cleanPhone) {
      url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reportText)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0b141a] rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* WhatsApp Mobile Top Bar Simulation */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-slate-800 text-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                🩺
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#1f2c34]" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                <span>Pase de Guardia / Informe WhatsApp</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                {patientName ? `${patientName} (${bed || 'Cama'})` : 'Paciente en valoración'} · en línea
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-700/70 text-slate-400 hover:text-white transition-colors"
            title="Cerrar vista previa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Chat Wallpaper & Message Bubble Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 whatsapp-chat-bg space-y-3 font-sans">
          <div className="flex justify-center">
            <span className="bg-[#182229]/90 text-slate-400 text-[11px] px-3 py-1 rounded-lg border border-slate-700/50">
              HOY · MENSAJE CLINICO ENFERMERÍA
            </span>
          </div>

          {/* WhatsApp Sent Message Bubble */}
          <div className="flex justify-end">
            <div className="relative max-w-[94%] sm:max-w-[88%] bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-sm p-3.5 shadow-md border border-[#02735e]/50">
              <div className="text-[13px] leading-relaxed whitespace-pre-wrap font-sans break-words selection:bg-emerald-300 selection:text-slate-900">
                {reportText}
              </div>

              {/* Message Footer with Time and Double Tick */}
              <div className="flex items-center justify-end gap-1.5 mt-2 pt-1 border-t border-emerald-700/40 text-[11px] text-emerald-200/80">
                <span>{currentTime}</span>
                <span className="text-cyan-300 font-bold tracking-tighter">✓✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Mobile Quick Actions & Pulsing Buttons */}
        <div className="bg-[#1f2c34] p-3.5 sm:p-4 border-t border-slate-800 space-y-2.5">
          {/* Phone number toggle */}
          {showPhoneInput ? (
            <div className="flex items-center gap-2 bg-[#111b21] p-2 rounded-xl border border-slate-700">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
              <input
                type="tel"
                placeholder="Número con código de país (Ej: +54911...)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
              <button
                type="button"
                onClick={() => setShowPhoneInput(false)}
                className="text-[11px] text-slate-400 hover:text-white px-2"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
              <span>Destino: Cualquier contacto o grupo</span>
              <button
                type="button"
                onClick={() => setShowPhoneInput(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <Phone className="w-3 h-3" /> Asignar número directo
              </button>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Titilante WhatsApp Button */}
            <button
              type="button"
              onClick={handleSendWhatsAppGeneral}
              className="animate-pulse-glow col-span-2 sm:col-span-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#25D366] to-[#1ebe57] text-[#0a2012] font-bold py-3 px-4 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar a WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl border transition-all text-xs sm:text-sm active:scale-95 cursor-pointer ${
                copied
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                  : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Copiado al Portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-300" />
                  <span>Copiar Formateado</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Formateado con negritas *...* y emojis médicos
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="text-slate-400 hover:text-white flex items-center gap-1 underline underline-offset-2"
            >
              <Printer className="w-3 h-3" /> Imprimir / PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
