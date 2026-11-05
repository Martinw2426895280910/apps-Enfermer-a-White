/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Activity,
  HeartPulse,
  Stethoscope,
  Send,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Printer,
  Plus,
  Trash2,
  AlertTriangle,
  Brain,
  Wind,
  Droplets,
  Utensils,
  ShieldAlert,
  Sparkles,
  User,
  Pill,
  TestTube,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { ClinicalAssessmentData, MedicationItem, LabItem } from './types/clinical';
import {
  calculateBMI,
  evaluateVitals,
  calculateGlasgow,
  calculateBraden,
  calculateFluidBalance,
  generateWhatsAppFormattedReport,
  SAMPLE_PRESETS,
} from './utils/clinicalCalculators';

import { ECGMonitor } from './components/ECGMonitor';
import { BMIGauge } from './components/BMIGauge';
import { EVASlider } from './components/EVASlider';
import { WhatsAppPreviewModal } from './components/WhatsAppPreviewModal';
import { StickyBottomBar } from './components/StickyBottomBar';

export default function App() {
  const getInitialDateTime = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const initialData: ClinicalAssessmentData = {
    patient: {
      name: '',
      document: '',
      date: getInitialDateTime(),
      age: '',
      sex: '',
      ageGroup: 'adult',
      bed: '',
      reason: '',
      history: '',
    },
    anthropometry: {
      weight: '',
      height: '',
      waist: '',
      headCircumference: '',
    },
    vitals: {
      temperature: '',
      heartRate: '',
      respiratoryRate: '',
      systolicBP: '',
      diastolicBP: '',
      spo2: '',
      glucose: '',
      oxygenTherapy: 'No',
      oxygenDevice: '',
    },
    neurological: {
      consciousness: '',
      orientation: '',
      pupils: '',
      motorResponse: '',
      glasgowEye: '',
      glasgowVerbal: '',
      glasgowMotor: '',
    },
    respiratory: {
      pattern: '',
      sounds: '',
      cough: '',
      cyanosis: '',
      notes: '',
    },
    cardiovascular: {
      pulse: '',
      capillaryRefill: '',
      edema: '',
      skinColor: '',
      notes: '',
    },
    fluidBalance: {
      oralIntake: '',
      ivIntake: '',
      urineOutput: '',
      otherLosses: '',
      urineAspect: '',
      bowelMovement: '',
      notes: '',
    },
    nutritionPain: {
      diet: '',
      appetite: '',
      painEVA: 0,
      painSite: '',
      painNotes: '',
    },
    skinWounds: {
      skinState: '',
      hasWounds: '',
      woundNotes: '',
      bradenSensory: '',
      bradenMoisture: '',
      bradenActivity: '',
      bradenMobility: '',
      bradenNutrition: '',
      bradenFriction: '',
    },
    mobilityFalls: {
      functionalMobility: '',
      assistiveDevice: '',
      fallFactors: [],
    },
    medications: [
      { id: '1', name: '', dose: '', route: '', schedule: '' },
    ],
    labs: [
      { id: '1', testName: '', result: '', reference: '' },
    ],
    evolution: {
      nursingEvolution: '',
      carePlan: '',
      professionalName: '',
      licenseNumber: '',
      institution: '',
    },
  };

  const [formData, setFormData] = useState<ClinicalAssessmentData>(initialData);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Soft sound feedback
  const playSound = (freq = 520, type: OscillatorType = 'sine', duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore audio errors
    }
  };

  // Updaters
  const updatePatient = (field: keyof ClinicalAssessmentData['patient'], val: string) => {
    setFormData((prev) => ({ ...prev, patient: { ...prev.patient, [field]: val } }));
  };

  const updateAnthropometry = (field: keyof ClinicalAssessmentData['anthropometry'], val: string) => {
    setFormData((prev) => ({ ...prev, anthropometry: { ...prev.anthropometry, [field]: val } }));
  };

  const updateVitals = (field: keyof ClinicalAssessmentData['vitals'], val: string) => {
    setFormData((prev) => ({ ...prev, vitals: { ...prev.vitals, [field]: val } }));
  };

  const updateNeurological = (field: keyof ClinicalAssessmentData['neurological'], val: string) => {
    setFormData((prev) => ({ ...prev, neurological: { ...prev.neurological, [field]: val } }));
  };

  const updateRespiratory = (field: keyof ClinicalAssessmentData['respiratory'], val: string) => {
    setFormData((prev) => ({ ...prev, respiratory: { ...prev.respiratory, [field]: val } }));
  };

  const updateCardiovascular = (field: keyof ClinicalAssessmentData['cardiovascular'], val: string) => {
    setFormData((prev) => ({ ...prev, cardiovascular: { ...prev.cardiovascular, [field]: val } }));
  };

  const updateFluidBalance = (field: keyof ClinicalAssessmentData['fluidBalance'], val: string) => {
    setFormData((prev) => ({ ...prev, fluidBalance: { ...prev.fluidBalance, [field]: val } }));
  };

  const updateNutritionPain = (field: keyof ClinicalAssessmentData['nutritionPain'], val: unknown) => {
    setFormData((prev) => ({ ...prev, nutritionPain: { ...prev.nutritionPain, [field]: val } }));
  };

  const updateSkinWounds = (field: keyof ClinicalAssessmentData['skinWounds'], val: string) => {
    setFormData((prev) => ({ ...prev, skinWounds: { ...prev.skinWounds, [field]: val } }));
  };

  const updateMobilityFalls = (field: keyof ClinicalAssessmentData['mobilityFalls'], val: unknown) => {
    setFormData((prev) => ({ ...prev, mobilityFalls: { ...prev.mobilityFalls, [field]: val } }));
  };

  const updateEvolution = (field: keyof ClinicalAssessmentData['evolution'], val: string) => {
    setFormData((prev) => ({ ...prev, evolution: { ...prev.evolution, [field]: val } }));
  };

  // Fall factors toggle
  const toggleFallFactor = (factor: string) => {
    playSound(440, 'triangle', 0.05);
    setFormData((prev) => {
      const exists = prev.mobilityFalls.fallFactors.includes(factor);
      const updated = exists
        ? prev.mobilityFalls.fallFactors.filter((f) => f !== factor)
        : [...prev.mobilityFalls.fallFactors, factor];
      return { ...prev, mobilityFalls: { ...prev.mobilityFalls, fallFactors: updated } };
    });
  };

  // Medications management
  const addMedication = () => {
    playSound(580, 'sine', 0.06);
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { id: Date.now().toString(), name: '', dose: '', route: '', schedule: '' },
      ],
    }));
  };

  const updateMedication = (id: string, field: keyof MedicationItem, val: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.map((m) => (m.id === id ? { ...m, [field]: val } : m)),
    }));
  };

  const removeMedication = (id: string) => {
    playSound(320, 'sine', 0.06);
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== id),
    }));
  };

  // Labs management
  const addLab = () => {
    playSound(580, 'sine', 0.06);
    setFormData((prev) => ({
      ...prev,
      labs: [
        ...prev.labs,
        { id: Date.now().toString(), testName: '', result: '', reference: '' },
      ],
    }));
  };

  const updateLab = (id: string, field: keyof LabItem, val: string) => {
    setFormData((prev) => ({
      ...prev,
      labs: prev.labs.map((l) => (l.id === id ? { ...l, [field]: val } : l)),
    }));
  };

  const removeLab = (id: string) => {
    playSound(320, 'sine', 0.06);
    setFormData((prev) => ({
      ...prev,
      labs: prev.labs.filter((l) => l.id !== id),
    }));
  };

  // Preset loaders
  const loadPreset = (presetIndex: number) => {
    playSound(660, 'sine', 0.1);
    const p = SAMPLE_PRESETS[presetIndex];
    if (p && p.data) {
      setFormData((prev) => ({
        ...prev,
        ...p.data,
        patient: {
          ...prev.patient,
          ...(p.data.patient || {}),
          date: getInitialDateTime(),
        },
      }));
    }
  };

  const resetForm = () => {
    if (window.confirm('¿Desea limpiar todos los campos del formulario?')) {
      playSound(250, 'sawtooth', 0.15);
      setFormData({
        ...initialData,
        patient: {
          ...initialData.patient,
          date: getInitialDateTime(),
        },
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calculations
  const bmiResult = useMemo(
    () => calculateBMI(formData.anthropometry.weight, formData.anthropometry.height, formData.patient.age),
    [formData.anthropometry.weight, formData.anthropometry.height, formData.patient.age]
  );

  const vitalsAlerts = useMemo(
    () => evaluateVitals(formData.vitals, formData.patient.age),
    [formData.vitals, formData.patient.age]
  );

  const glasgow = useMemo(
    () =>
      calculateGlasgow(
        formData.neurological.glasgowEye,
        formData.neurological.glasgowVerbal,
        formData.neurological.glasgowMotor
      ),
    [formData.neurological.glasgowEye, formData.neurological.glasgowVerbal, formData.neurological.glasgowMotor]
  );

  const braden = useMemo(
    () =>
      calculateBraden(
        formData.skinWounds.bradenSensory,
        formData.skinWounds.bradenMoisture,
        formData.skinWounds.bradenActivity,
        formData.skinWounds.bradenMobility,
        formData.skinWounds.bradenNutrition,
        formData.skinWounds.bradenFriction
      ),
    [
      formData.skinWounds.bradenSensory,
      formData.skinWounds.bradenMoisture,
      formData.skinWounds.bradenActivity,
      formData.skinWounds.bradenMobility,
      formData.skinWounds.bradenNutrition,
      formData.skinWounds.bradenFriction,
    ]
  );

  const fluidBalance = useMemo(
    () =>
      calculateFluidBalance(
        formData.fluidBalance.oralIntake,
        formData.fluidBalance.ivIntake,
        formData.fluidBalance.urineOutput,
        formData.fluidBalance.otherLosses
      ),
    [
      formData.fluidBalance.oralIntake,
      formData.fluidBalance.ivIntake,
      formData.fluidBalance.urineOutput,
      formData.fluidBalance.otherLosses,
    ]
  );

  const reportText = useMemo(() => generateWhatsAppFormattedReport(formData), [formData]);

  // Assessment completion progress
  const progressPercent = useMemo(() => {
    let filled = 0;
    const checks = [
      formData.patient.name,
      formData.patient.document,
      formData.patient.age,
      formData.patient.bed,
      formData.anthropometry.weight,
      formData.anthropometry.height,
      formData.vitals.heartRate,
      formData.vitals.systolicBP,
      formData.vitals.spo2,
      formData.neurological.consciousness,
      formData.neurological.glasgowEye,
      formData.respiratory.pattern,
      formData.cardiovascular.pulse,
      formData.nutritionPain.diet,
      formData.skinWounds.skinState,
      formData.mobilityFalls.functionalMobility,
      formData.evolution.nursingEvolution,
    ];
    checks.forEach((c) => {
      if (c && c.trim() !== '') filled++;
    });
    return Math.round((filled / checks.length) * 100);
  }, [formData]);

  const handleOpenWhatsApp = () => {
    playSound(750, 'sine', 0.12);
    setIsWhatsAppModalOpen(true);
  };

  const handleCopyReport = async () => {
    playSound(600, 'sine', 0.08);
    try {
      await navigator.clipboard.writeText(reportText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = reportText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const scrollToSection = (id: string) => {
    playSound(480, 'sine', 0.05);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Section tabs for mobile fast navigation
  const SECTIONS_NAV = [
    { id: 'all', label: 'Todo el Formulario' },
    { id: 'sec-patient', label: '01. Paciente' },
    { id: 'sec-anthropometry', label: '02. Antropometría' },
    { id: 'sec-vitals', label: '03. Vitales & ECG' },
    { id: 'sec-neuro', label: '04. Glasgow' },
    { id: 'sec-resp', label: '05. Respiratorio' },
    { id: 'sec-cardio', label: '06. Cardiovascular' },
    { id: 'sec-balance', label: '07. Balance Hídrico' },
    { id: 'sec-pain', label: '08. Nutrición & EVA' },
    { id: 'sec-skin', label: '09. Braden & Piel' },
    { id: 'sec-mobility', label: '10. Caídas' },
    { id: 'sec-meds', label: '11. Medicación' },
    { id: 'sec-labs', label: '12. Laboratorio' },
    { id: 'sec-evolution', label: '13. Evolución' },
    { id: 'sec-report', label: '14. Informe WhatsApp' },
  ];

  return (
    <div className="min-h-screen bg-[#0a111e] text-slate-100 pb-28 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Clinical Header with Glow and Live Branding */}
      <header className="relative bg-gradient-to-r from-[#0d1c33] via-[#10243e] to-[#0c182b] border-b border-cyan-500/20 shadow-lg px-4 py-4 sm:py-5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0d1c33] animate-ping" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0d1c33]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>Enfermería</span>
                  <span className="text-cyan-400 font-light">·</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Valoración Móvil
                  </span>
                </h1>
                <span className="bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Send className="w-2.5 h-2.5" /> WhatsApp Directo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Evaluación clínica integral, trazados interactivos y pase de guardia</span>
                <span className="hidden sm:inline text-slate-600">·</span>
                <span className="hidden sm:inline text-cyan-300 font-mono text-[11px]">Bioq. Dr. A. M. W.</span>
              </p>
            </div>
          </div>

          {/* Quick Toolbar with Titilante WhatsApp Button */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Pulsing Green WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="animate-pulse-glow flex items-center gap-2 bg-gradient-to-r from-[#25D366] to-[#1ebe57] text-[#072413] font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>WhatsApp Móvil</span>
            </button>

            {/* Generar Informe Blue Glow Button */}
            <button
              type="button"
              onClick={() => scrollToSection('sec-report')}
              className="animate-pulse-glow-blue flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Generar Informe</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={soundEnabled ? 'Silenciar sonidos de interfaz' : 'Activar sonidos de interfaz'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Reset Form */}
            <button
              type="button"
              onClick={resetForm}
              className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition-colors"
              title="Limpiar formulario"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Example Presets bar */}
        <div className="max-w-5xl mx-auto mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Cargar caso de prueba:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(idx)}
                className="bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 border border-cyan-500/30 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all hover:border-cyan-400 active:scale-95"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 mt-4 space-y-5">
        {/* Important Clinical Notice */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Herramienta de apoyo al registro clínico y pase de enfermería:</strong>{' '}
            Los rangos son orientativos y deben interpretarse según edad, antecedentes, contexto clínico y protocolos institucionales. No reemplaza la valoración profesional ni el criterio del equipo de salud.
          </div>
        </div>

        {/* Horizontal Navigation Pills for Quick Section Jumping */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {SECTIONS_NAV.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setActiveTab(sec.id);
                if (sec.id !== 'all') scrollToSection(sec.id);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeTab === sec.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SECTION 01: Identificación del Paciente */}
          <section id="sec-patient" className="bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-mono">
                  01
                </span>
                <span>Identificación del Paciente</span>
              </h2>
              <User className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Nombre y Apellido</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={formData.patient.name}
                  onChange={(e) => updatePatient('name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">DNI / Historia Clínica</label>
                <input
                  type="text"
                  placeholder="Número de documento / HC"
                  value={formData.patient.document}
                  onChange={(e) => updatePatient('document', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  value={formData.patient.date}
                  onChange={(e) => updatePatient('date', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Edad (años)</label>
                <input
                  type="number"
                  min="0"
                  max="125"
                  placeholder="Ej: 54"
                  value={formData.patient.age}
                  onChange={(e) => updatePatient('age', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sexo Registrado</label>
                <select
                  value={formData.patient.sex}
                  onChange={(e) => updatePatient('sex', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Otro / no consignado">Otro / no consignado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Grupo Etario</label>
                <select
                  value={formData.patient.ageGroup}
                  onChange={(e) => updatePatient('ageGroup', e.target.value as ClinicalAssessmentData['patient']['ageGroup'])}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="adult">Adulto</option>
                  <option value="older">Adulto mayor</option>
                  <option value="child">Pediátrico</option>
                  <option value="infant">Lactante</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sala / Cama</label>
                <input
                  type="text"
                  placeholder="Ej: Guardia - Cama 04"
                  value={formData.patient.bed}
                  onChange={(e) => updatePatient('bed', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Motivo de Consulta / Ingreso</label>
                <textarea
                  rows={2}
                  placeholder="Describir motivo de consulta o motivo de pase..."
                  value={formData.patient.reason}
                  onChange={(e) => updatePatient('reason', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors text-xs resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Antecedentes Relevantes / Alergias</label>
                <textarea
                  rows={2}
                  placeholder="HTA, DBT, cirugías previas, alergias medicamentosas..."
                  value={formData.patient.history}
                  onChange={(e) => updatePatient('history', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors text-xs resize-none"
                />
              </div>
            </div>
          </section>

          {/* SECTION 02: Antropometría & IMC */}
          <section id="sec-anthropometry" className="bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono">
                  02
                </span>
                <span>Antropometría & IMC</span>
              </h2>
              <span className="text-xs font-mono text-emerald-400 font-semibold">OMS</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Peso Corporal (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  placeholder="Ej: 70.5"
                  value={formData.anthropometry.weight}
                  onChange={(e) => updateAnthropometry('weight', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Estatura / Talla (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  placeholder="Ej: 175"
                  value={formData.anthropometry.height}
                  onChange={(e) => updateAnthropometry('height', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Perímetro Abdominal (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ej: 88"
                  value={formData.anthropometry.waist}
                  onChange={(e) => updateAnthropometry('waist', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Perímetro Cefálico (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Pediátrico / lactante"
                  value={formData.anthropometry.headCircumference}
                  onChange={(e) => updateAnthropometry('headCircumference', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Interactive Visual BMI Gauge */}
            <BMIGauge
              bmiResult={bmiResult}
              weight={formData.anthropometry.weight}
              height={formData.anthropometry.height}
            />
          </section>

          {/* SECTION 03: Signos Vitales & Trazado ECG animado (Full width) */}
          <section id="sec-vitals" className="md:col-span-2 bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-950 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xs font-mono">
                  03
                </span>
                <span>Signos Vitales & Monitor ECG</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs text-rose-400 font-mono font-semibold">En tiempo real</span>
              </div>
            </div>

            {/* Visual ECG stroke trace component */}
            <ECGMonitor
              heartRate={formData.vitals.heartRate}
              spo2={formData.vitals.spo2}
              systolic={formData.vitals.systolicBP}
              diastolic={formData.vitals.diastolicBP}
            />

            {/* Vital signs input fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Temperatura (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  value={formData.vitals.temperature}
                  onChange={(e) => updateVitals('temperature', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">FC (lpm)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 75"
                  value={formData.vitals.heartRate}
                  onChange={(e) => updateVitals('heartRate', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">FR (rpm)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 16"
                  value={formData.vitals.respiratoryRate}
                  onChange={(e) => updateVitals('respiratoryRate', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">SpO₂ (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ej: 98"
                  value={formData.vitals.spo2}
                  onChange={(e) => updateVitals('spo2', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">PA Sistólica (mmHg)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 120"
                  value={formData.vitals.systolicBP}
                  onChange={(e) => updateVitals('systolicBP', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">PA Diastólica (mmHg)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 80"
                  value={formData.vitals.diastolicBP}
                  onChange={(e) => updateVitals('diastolicBP', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Glucemia (mg/dL)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 95"
                  value={formData.vitals.glucose}
                  onChange={(e) => updateVitals('glucose', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Oxigenoterapia</label>
                <select
                  value={formData.vitals.oxygenTherapy}
                  onChange={(e) => updateVitals('oxygenTherapy', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="No">No</option>
                  <option value="Sí - cánula nasal">Sí - cánula nasal</option>
                  <option value="Sí - máscara">Sí - máscara</option>
                  <option value="Sí - máscara con reservorio">Sí - reservorio</option>
                  <option value="Sí - alto flujo">Sí - alto flujo</option>
                  <option value="Sí - ventilación mecánica">Sí - VMNI / ARM</option>
                </select>
              </div>
            </div>

            {/* Vital signs alerts & observations banner with pulsing glow */}
            {vitalsAlerts.length > 0 ? (
              <div className="animate-pulse-glow-red p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-1">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Alertas Clínicas Detectadas ({vitalsAlerts.length})</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {vitalsAlerts.map((alt, i) => (
                    <span
                      key={i}
                      className="text-xs bg-rose-900/60 text-rose-200 border border-rose-500/40 px-2.5 py-1 rounded-lg font-medium"
                    >
                      {alt.message}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Sin alertas clínicas automáticas con los valores ingresados.</span>
                <span className="text-emerald-400 font-semibold">Parámetros estables ✓</span>
              </div>
            )}
          </section>

          {/* SECTION 04: Valoración Neurológica & Glasgow */}
          <section id="sec-neuro" className="bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-mono">
                  04
                </span>
                <span>Valoración Neurológica & Glasgow</span>
              </h2>
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Estado de Conciencia</label>
                <select
                  value={formData.neurological.consciousness}
                  onChange={(e) => updateNeurological('consciousness', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Alerta">Alerta</option>
                  <option value="Somnoliento">Somnoliento</option>
                  <option value="Obnubilado">Obnubilado</option>
                  <option value="Estuporoso">Estuporoso</option>
                  <option value="Comatoso">Comatoso</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Orientación</label>
                <select
                  value={formData.neurological.orientation}
                  onChange={(e) => updateNeurological('orientation', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Orientado en persona, tiempo y espacio">Orientado en persona, tiempo y espacio</option>
                  <option value="Desorientado parcialmente">Desorientado parcialmente</option>
                  <option value="Desorientado globalmente">Desorientado globalmente</option>
                  <option value="No valorable">No valorable</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pupilas</label>
                <select
                  value={formData.neurological.pupils}
                  onChange={(e) => updateNeurological('pupils', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Isocóricas y reactivas">Isocóricas y reactivas (PIRRL)</option>
                  <option value="Anisocóricas">Anisocóricas</option>
                  <option value="Mióticas">Mióticas</option>
                  <option value="Midriáticas">Midriáticas</option>
                  <option value="No reactivas / arreactivas">No reactivas / arreactivas</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Respuesta Motora</label>
                <select
                  value={formData.neurological.motorResponse}
                  onChange={(e) => updateNeurological('motorResponse', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Conservada">Conservada</option>
                  <option value="Debilidad">Debilidad muscular</option>
                  <option value="Hemiparesia">Hemiparesia</option>
                  <option value="Parálisis">Parálisis</option>
                </select>
              </div>
            </div>

            {/* Glasgow Component breakdown */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Escala de Coma de Glasgow</span>
                {glasgow.score !== null ? (
                  <span className={`text-xs px-2.5 py-0.5 rounded-lg font-bold font-mono ${glasgow.badgeColor}`}>
                    {glasgow.score} / 15
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Pendiente</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ocular (1–4)</label>
                  <select
                    value={formData.neurological.glasgowEye}
                    onChange={(e) => updateNeurological('glasgowEye', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  >
                    <option value="">Sin valorar</option>
                    <option value="4">4 - Espontánea</option>
                    <option value="3">3 - A la voz</option>
                    <option value="2">2 - Al dolor</option>
                    <option value="1">1 - Ninguna</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Verbal (1–5)</label>
                  <select
                    value={formData.neurological.glasgowVerbal}
                    onChange={(e) => updateNeurological('glasgowVerbal', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  >
                    <option value="">Sin valorar</option>
                    <option value="5">5 - Orientada</option>
                    <option value="4">4 - Confusa</option>
                    <option value="3">3 - Inapropiada</option>
                    <option value="2">2 - Incomprensible</option>
                    <option value="1">1 - Ninguna</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Motora (1–6)</label>
                  <select
                    value={formData.neurological.glasgowMotor}
                    onChange={(e) => updateNeurological('glasgowMotor', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  >
                    <option value="">Sin valorar</option>
                    <option value="6">6 - Obedece</option>
                    <option value="5">5 - Localiza dolor</option>
                    <option value="4">4 - Retira dolor</option>
                    <option value="3">3 - Flexión anormal</option>
                    <option value="2">2 - Extensión anormal</option>
                    <option value="1">1 - Ninguna</option>
                  </select>
                </div>
              </div>

              {glasgow.score !== null && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold ${glasgow.badgeColor} mt-1`}>
                  {glasgow.label} · Desglose: O{formData.neurological.glasgowEye} V{formData.neurological.glasgowVerbal} M{formData.neurological.glasgowMotor}
                </div>
              )}
            </div>
          </section>

          {/* SECTION 05: Valoración Respiratoria */}
          <section id="sec-resp" className="bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-950 text-teal-400 border border-teal-500/30 flex items-center justify-center text-xs font-mono">
                  05
                </span>
                <span>Valoración Respiratoria</span>
              </h2>
              <Wind className="w-4 h-4 text-teal-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Patrón Respiratorio</label>
                <select
                  value={formData.respiratory.pattern}
                  onChange={(e) => updateRespiratory('pattern', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Eupneico">Eupneico</option>
                  <option value="Taquipneico">Taquipneico</option>
                  <option value="Bradipneico">Bradipneico</option>
                  <option value="Disneico">Disneico</option>
                  <option value="Apneico">Apneico</option>
                  <option value="Irregular">Irregular</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ruidos Respiratorios</label>
                <select
                  value={formData.respiratory.sounds}
                  onChange={(e) => updateRespiratory('sounds', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Murmullo vesicular conservado bilateral">Murmullo vesicular conservado</option>
                  <option value="Disminuidos">Disminuidos</option>
                  <option value="Crepitantes">Crepitantes</option>
                  <option value="Sibilancias">Sibilancias</option>
                  <option value="Roncus">Roncus</option>
                  <option value="Estridor">Estridor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tos / Secreciones</label>
                <select
                  value={formData.respiratory.cough}
                  onChange={(e) => updateRespiratory('cough', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Sin tos">Sin tos</option>
                  <option value="Tos seca">Tos seca</option>
                  <option value="Tos productiva">Tos productiva</option>
                  <option value="Secreciones abundantes">Secreciones abundantes</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cianosis</label>
                <select
                  value={formData.respiratory.cyanosis}
                  onChange={(e) => updateRespiratory('cyanosis', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="No">No</option>
                  <option value="Periférica">Periférica (acrocianosis)</option>
                  <option value="Central">Central (peribucal / mucosa)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Observaciones Respiratorias</label>
                <input
                  type="text"
                  placeholder="Mecánica, tiraje, uso de músculos accesorios..."
                  value={formData.respiratory.notes}
                  onChange={(e) => updateRespiratory('notes', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors text-xs"
                />
              </div>
            </div>
          </section>

          {/* SECTION 06: Valoración Cardiovascular */}
          <section id="sec-cardio" className="bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-950 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xs font-mono">
                  06
                </span>
                <span>Valoración Cardiovascular</span>
              </h2>
              <HeartPulse className="w-4 h-4 text-rose-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pulso Periférico</label>
                <select
                  value={formData.cardiovascular.pulse}
                  onChange={(e) => updateCardiovascular('pulse', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Regular y palpable">Regular y palpable</option>
                  <option value="Débil / filiforme">Débil / filiforme</option>
                  <option value="Irregular">Irregular / arritmia</option>
                  <option value="Ausente">Ausente</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Relleno Capilar</label>
                <select
                  value={formData.cardiovascular.capillaryRefill}
                  onChange={(e) => updateCardiovascular('capillaryRefill', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="≤ 2 segundos">≤ 2 segundos (Normal)</option>
                  <option value="> 2 segundos">&gt; 2 segundos (Enlentecido)</option>
                  <option value="No valorado">No valorado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Edemas</label>
                <select
                  value={formData.cardiovascular.edema}
                  onChange={(e) => updateCardiovascular('edema', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Ausentes">Ausentes</option>
                  <option value="MMII leves +">MMII leves (+)</option>
                  <option value="MMII moderados ++">MMII moderados (++)</option>
                  <option value="Generalizados / anasarca">Generalizados (+++)</option>
                  <option value="Unilateral">Unilateral</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Coloración de Piel</label>
                <select
                  value={formData.cardiovascular.skinColor}
                  onChange={(e) => updateCardiovascular('skinColor', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Normocoloreada">Normocoloreada</option>
                  <option value="Pálida">Pálida</option>
                  <option value="Ruborizada">Ruborizada</option>
                  <option value="Ictérica / subictérica">Ictérica / subictérica</option>
                  <option value="Marmórea">Marmórea</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Observaciones Cardiovasculares</label>
                <input
                  type="text"
                  placeholder="Yugulares, perfusión distal, temperatura de extremidades..."
                  value={formData.cardiovascular.notes}
                  onChange={(e) => updateCardiovascular('notes', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors text-xs"
                />
              </div>
            </div>
          </section>

          {/* SECTION 07: Balance Hídrico & Eliminación */}
          <section id="sec-balance" className="bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-950 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-mono">
                  07
                </span>
                <span>Balance Hídrico & Eliminación</span>
              </h2>
              <Droplets className="w-4 h-4 text-sky-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ingesta Oral (mL)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.fluidBalance.oralIntake}
                  onChange={(e) => updateFluidBalance('oralIntake', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Aportes IV (mL)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.fluidBalance.ivIntake}
                  onChange={(e) => updateFluidBalance('ivIntake', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Diuresis (mL)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.fluidBalance.urineOutput}
                  onChange={(e) => updateFluidBalance('urineOutput', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Otras Pérdidas (mL)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.fluidBalance.otherLosses}
                  onChange={(e) => updateFluidBalance('otherLosses', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Características Orina</label>
                <select
                  value={formData.fluidBalance.urineAspect}
                  onChange={(e) => updateFluidBalance('urineAspect', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Clara">Clara</option>
                  <option value="Concentrada">Concentrada</option>
                  <option value="Hemática">Hemática</option>
                  <option value="Colúrica">Colúrica</option>
                  <option value="Turbia">Turbia</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Evacuación Intestinal</label>
                <select
                  value={formData.fluidBalance.bowelMovement}
                  onChange={(e) => updateFluidBalance('bowelMovement', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Conservada">Conservada</option>
                  <option value="Constipación">Constipación</option>
                  <option value="Diarrea">Diarrea</option>
                  <option value="Incontinencia">Incontinencia</option>
                </select>
              </div>
            </div>

            {/* Live Fluid Balance Summary Tile */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Ingresos: </span>
                <span className="font-mono font-bold text-sky-400">{fluidBalance.totalIn} mL</span>
                <span className="text-slate-600 mx-2">|</span>
                <span className="text-slate-400">Egresos: </span>
                <span className="font-mono font-bold text-amber-400">{fluidBalance.totalOut} mL</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold font-mono">
                <span className="text-slate-300">Balance:</span>
                <span className={`px-2 py-0.5 rounded ${
                  fluidBalance.net > 0 ? 'bg-sky-950 text-sky-300 border border-sky-500/40' : fluidBalance.net < 0 ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                }`}>
                  {fluidBalance.net > 0 ? `+${fluidBalance.net}` : fluidBalance.net} mL
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 08: Nutrición & Escala de Dolor EVA Visual */}
          <section id="sec-pain" className="bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-950 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-mono">
                  08
                </span>
                <span>Nutrición & Dolor EVA</span>
              </h2>
              <Utensils className="w-4 h-4 text-orange-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tipo de Alimentación</label>
                <select
                  value={formData.nutritionPain.diet}
                  onChange={(e) => updateNutritionPain('diet', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Oral habitual">Oral habitual</option>
                  <option value="Hiposódica">Hiposódica</option>
                  <option value="Diabética">Diabética</option>
                  <option value="Blanda / astringente">Blanda / astringente</option>
                  <option value="Enteral">Enteral (SNG/K108)</option>
                  <option value="Parenteral">Parenteral</option>
                  <option value="Ayuno">Ayuno / NPO</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Apetito / Tolerancia</label>
                <select
                  value={formData.nutritionPain.appetite}
                  onChange={(e) => updateNutritionPain('appetite', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Conservado">Conservado</option>
                  <option value="Disminuido">Disminuido / hiporexia</option>
                  <option value="Intolerancia / vómitos">Intolerancia / náuseas</option>
                </select>
              </div>
            </div>

            {/* Interactive EVA Pain Slider with expressive emoji faces */}
            <EVASlider
              value={formData.nutritionPain.painEVA}
              onChange={(val) => {
                playSound(350 + val * 40, 'sine', 0.05);
                updateNutritionPain('painEVA', val);
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Localización del Dolor</label>
                <input
                  type="text"
                  placeholder="Ej: Abdominal, dorsal, cefalea..."
                  value={formData.nutritionPain.painSite}
                  onChange={(e) => updateNutritionPain('painSite', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Características del Dolor</label>
                <input
                  type="text"
                  placeholder="Punzante, opresivo, irradiado..."
                  value={formData.nutritionPain.painNotes}
                  onChange={(e) => updateNutritionPain('painNotes', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* SECTION 09: Piel, Heridas & Escala de Braden */}
          <section id="sec-skin" className="bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-pink-950 text-pink-400 border border-pink-500/30 flex items-center justify-center text-xs font-mono">
                  09
                </span>
                <span>Piel, Heridas & Escala Braden</span>
              </h2>
              <ShieldAlert className="w-4 h-4 text-pink-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Estado de la Piel</label>
                <select
                  value={formData.skinWounds.skinState}
                  onChange={(e) => updateSkinWounds('skinState', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Íntegra">Íntegra</option>
                  <option value="Seca">Seca / descamativa</option>
                  <option value="Húmeda">Húmeda / macerada</option>
                  <option value="Frágil">Frágil / hematomas</option>
                  <option value="Lesionada">Lesionada / UPP</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Heridas / Lesiones</label>
                <select
                  value={formData.skinWounds.hasWounds}
                  onChange={(e) => updateSkinWounds('hasWounds', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="No">No presenta</option>
                  <option value="Sí - herida quirúrgica">Sí - herida quirúrgica</option>
                  <option value="Sí - UPP / escaras">Sí - UPP / escaras</option>
                  <option value="Sí - traumática">Sí - traumática</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Detalle de Heridas / Curaciones</label>
                <input
                  type="text"
                  placeholder="Ubicación, apósitos, exudado, curación realizada..."
                  value={formData.skinWounds.woundNotes}
                  onChange={(e) => updateSkinWounds('woundNotes', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors text-xs"
                />
              </div>
            </div>

            {/* Braden Scale 6 Domains */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Escala de Braden (Riesgo UPP)</span>
                {braden.score !== null ? (
                  <span className={`text-xs px-2.5 py-0.5 rounded-lg font-bold font-mono ${braden.badgeClass}`}>
                    {braden.score} / 23 · {braden.risk}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Pendiente de 6 dominios</span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Sensorial</label>
                  <select
                    value={formData.skinWounds.bradenSensory}
                    onChange={(e) => updateSkinWounds('bradenSensory', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-white text-xs"
                  >
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Humedad</label>
                  <select
                    value={formData.skinWounds.bradenMoisture}
                    onChange={(e) => updateSkinWounds('bradenMoisture', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-white text-xs"
                  >
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Actividad</label>
                  <select
                    value={formData.skinWounds.bradenActivity}
                    onChange={(e) => updateSkinWounds('bradenActivity', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-white text-xs"
                  >
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Movilidad</label>
                  <select
                    value={formData.skinWounds.bradenMobility}
                    onChange={(e) => updateSkinWounds('bradenMobility', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-white text-xs"
                  >
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Nutrición</label>
                  <select
                    value={formData.skinWounds.bradenNutrition}
                    onChange={(e) => updateSkinWounds('bradenNutrition', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-white text-xs"
                  >
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Fricción (1–3)</label>
                  <select
                    value={formData.skinWounds.bradenFriction}
                    onChange={(e) => updateSkinWounds('bradenFriction', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-white text-xs"
                  >
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 10: Movilidad & Riesgo de Caídas */}
          <section id="sec-mobility" className="bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-yellow-950 text-yellow-400 border border-yellow-500/30 flex items-center justify-center text-xs font-mono">
                  10
                </span>
                <span>Movilidad & Riesgo de Caídas</span>
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded font-bold font-mono ${
                formData.mobilityFalls.fallFactors.length >= 2 ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {formData.mobilityFalls.fallFactors.length} Factores
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Movilidad Funcional</label>
                <select
                  value={formData.mobilityFalls.functionalMobility}
                  onChange={(e) => updateMobilityFalls('functionalMobility', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Independiente">Independiente</option>
                  <option value="Con ayuda parcial">Con ayuda parcial</option>
                  <option value="Dependiente">Dependiente</option>
                  <option value="En cama">En cama estricto</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ayuda Técnica</label>
                <select
                  value={formData.mobilityFalls.assistiveDevice}
                  onChange={(e) => updateMobilityFalls('assistiveDevice', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="Ninguna">Ninguna</option>
                  <option value="Bastón">Bastón</option>
                  <option value="Andador">Andador</option>
                  <option value="Silla de ruedas">Silla de ruedas</option>
                  <option value="Muletas">Muletas</option>
                </select>
              </div>
            </div>

            {/* Checkbox list of fall factors */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Factores de Riesgo Observados:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Caída previa',
                  'Alteración de marcha',
                  'Confusión / desorientación',
                  'Déficit sensorial (visual/auditivo)',
                  'Medicación de riesgo (sedantes/antiHTA)',
                  'Necesita asistencia permanente',
                ].map((factor) => {
                  const isChecked = formData.mobilityFalls.fallFactors.includes(factor);
                  return (
                    <button
                      key={factor}
                      type="button"
                      onClick={() => toggleFallFactor(factor)}
                      className={`text-left p-2 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                        isChecked
                          ? 'bg-amber-950/60 border-amber-500/50 text-amber-200 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                        isChecked ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold' : 'border-slate-600'
                      }`}>
                        {isChecked && '✓'}
                      </div>
                      <span className="leading-tight">{factor}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 11: Medicación Administrada / Indicada (Full width) */}
          <section id="sec-meds" className="md:col-span-2 bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-950 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-mono">
                  11
                </span>
                <span>Medicación Indicada / Administrada</span>
              </h2>
              <button
                type="button"
                onClick={addMedication}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 text-xs font-semibold active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Medicamento</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.medications.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 items-center text-xs"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Fármaco (Ej: Paracetamol, Enalapril)"
                      value={item.name}
                      onChange={(e) => updateMedication(item.id, 'name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Dosis (Ej: 500 mg VO)"
                      value={item.dose}
                      onChange={(e) => updateMedication(item.id, 'dose', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Vía (Oral, EV, SC)"
                      value={item.route}
                      onChange={(e) => updateMedication(item.id, 'route', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Horario (c/ 8h)"
                      value={item.schedule}
                      onChange={(e) => updateMedication(item.id, 'schedule', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeMedication(item.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 transition-colors"
                      title="Quitar medicamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 12: Laboratorio & Estudios Complementarios (Full width) */}
          <section id="sec-labs" className="md:col-span-2 bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono">
                  12
                </span>
                <span>Laboratorio & Estudios Complementarios</span>
              </h2>
              <button
                type="button"
                onClick={addLab}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-semibold active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Estudio</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.labs.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 items-center text-xs"
                >
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Analito / Estudio (Ej: Hemoglobina, Glucosa, Rx Tórax)"
                      value={item.testName}
                      onChange={(e) => updateLab(item.id, 'testName', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Resultado / Unidad (Ej: 13.5 g/dL)"
                      value={item.result}
                      onChange={(e) => updateLab(item.id, 'result', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Fecha / Referencia (Ej: 12-16)"
                      value={item.reference}
                      onChange={(e) => updateLab(item.id, 'reference', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeLab(item.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 transition-colors"
                      title="Quitar analito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 13: Evolución de Enfermería & Plan de Cuidados (Full width) */}
          <section id="sec-evolution" className="md:col-span-2 bg-[#0f1b2d] rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-mono">
                  13
                </span>
                <span>Evolución, Cuidados & Responsable</span>
              </h2>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">
                  Nota de Evolución / Valoración de Enfermería
                </label>
                <textarea
                  rows={4}
                  placeholder="Describir hallazgos objetivos, estado general, tolerancia a tratamientos y respuesta..."
                  value={formData.evolution.nursingEvolution}
                  onChange={(e) => updateEvolution('nursingEvolution', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors text-xs resize-y"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">
                  Plan de Cuidados / Intervenciones Programadas
                </label>
                <textarea
                  rows={3}
                  placeholder="Monitoreo tensional horario, control de balance, cambios posturales..."
                  value={formData.evolution.carePlan}
                  onChange={(e) => updateEvolution('carePlan', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors text-xs resize-y"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Profesional de Enfermería</label>
                <input
                  type="text"
                  placeholder="Nombre y Apellido"
                  value={formData.evolution.professionalName}
                  onChange={(e) => updateEvolution('professionalName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Matrícula (MN / MP)</label>
                <input
                  type="text"
                  placeholder="Ej: MN 12345 / MP 6789"
                  value={formData.evolution.licenseNumber}
                  onChange={(e) => updateEvolution('licenseNumber', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Institución / Servicio / Guardia</label>
                <input
                  type="text"
                  placeholder="Ej: Hospital Central - Servicio de Emergencias"
                  value={formData.evolution.institution}
                  onChange={(e) => updateEvolution('institution', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          </section>
        </div>

        {/* SECTION 14: Vista Previa e Informe Formateado para WhatsApp */}
        <section id="sec-report" className="bg-[#0b141d] rounded-2xl border border-cyan-500/30 p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-ping" />
                <h2 className="text-base font-extrabold text-white">
                  Informe Formateado para WhatsApp Móvil
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generado con tipografía clara, negritas *...* y listas optimizadas para lectura rápida en celulares.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                {copyFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Copiar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="animate-pulse-glow flex items-center gap-2 bg-gradient-to-r from-[#25D366] to-[#1ebe57] text-[#072413] font-black px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 fill-current" />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Formatted Text Box with Custom Styling */}
          <div className="relative bg-[#060c14] rounded-2xl border border-slate-800/80 p-4 overflow-hidden">
            <pre className="text-xs sm:text-[13px] leading-relaxed text-slate-200 font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {reportText}
            </pre>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 py-6 border-t border-slate-800/60 space-y-1">
          <p className="font-medium text-slate-400">
            Herramienta diseñada para apoyo educativo y registro clínico de enfermería · Bioq. Dr. A. M. W.
          </p>
          <p className="text-[11px] text-slate-600">
            Optimizado para celulares, WhatsApp Web y formatos estándar de pases de guardia hospitalarios.
          </p>
        </footer>
      </main>

      {/* Sticky Mobile Bottom Bar with Titilante WhatsApp Glowing Button */}
      <StickyBottomBar
        onOpenWhatsApp={handleOpenWhatsApp}
        onGenerateReport={() => scrollToSection('sec-report')}
        progressPercent={progressPercent}
      />

      {/* WhatsApp Chat Preview Modal */}
      <WhatsAppPreviewModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        reportText={reportText}
        patientName={formData.patient.name}
        bed={formData.patient.bed}
      />
    </div>
  );
}
