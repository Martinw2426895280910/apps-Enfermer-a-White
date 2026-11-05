import { ClinicalAssessmentData } from '../types/clinical';

export interface BMIResult {
  bmi: number | null;
  category: string;
  categoryKey: string;
  color: string;
  text: string;
  isPediatric: boolean;
}

export function calculateBMI(weightStr: string, heightStr: string, ageStr: string): BMIResult {
  const w = parseFloat(weightStr);
  const hCm = parseFloat(heightStr);
  const age = ageStr ? parseFloat(ageStr) : null;

  if (isNaN(w) || isNaN(hCm) || w <= 0 || hCm <= 0 || hCm > 260 || w > 500) {
    return {
      bmi: null,
      category: 'Pendiente',
      categoryKey: 'none',
      color: 'text-slate-400',
      text: 'Ingrese peso en kg y estatura en cm. Fórmula: kg ÷ m².',
      isPediatric: false,
    };
  }

  const hM = hCm / 100;
  const bmiVal = w / (hM * hM);
  const isPediatric = age !== null && age < 18;

  let key = 'normal';
  let cat = 'Intervalo normal';
  let color = 'text-emerald-400';

  if (bmiVal < 16.0) {
    key = 'severe';
    cat = 'Delgadez severa';
    color = 'text-rose-400';
  } else if (bmiVal < 17.0) {
    key = 'moderate';
    cat = 'Delgadez moderada';
    color = 'text-amber-400';
  } else if (bmiVal < 18.5) {
    key = 'mild';
    cat = 'Delgadez leve';
    color = 'text-amber-300';
  } else if (bmiVal < 25.0) {
    key = 'normal';
    cat = 'Intervalo normal';
    color = 'text-emerald-400';
  } else if (bmiVal < 30.0) {
    key = 'over';
    cat = 'Sobrepeso';
    color = 'text-amber-400';
  } else if (bmiVal < 35.0) {
    key = 'ob1';
    cat = 'Obesidad clase I';
    color = 'text-orange-400';
  } else if (bmiVal < 40.0) {
    key = 'ob2';
    cat = 'Obesidad clase II';
    color = 'text-rose-400';
  } else {
    key = 'ob3';
    cat = 'Obesidad clase III';
    color = 'text-rose-500';
  }

  let text = `IMC: ${bmiVal.toFixed(2)} kg/m² (${cat}). Fórmula: ${w.toFixed(1)} kg ÷ (${hM.toFixed(2)} m)²`;
  if (isPediatric) {
    text += ' ⚠️ En <18 años se deben utilizar percentiles / curvas de OMS (Score Z).';
  }

  return {
    bmi: Number(bmiVal.toFixed(2)),
    category: cat,
    categoryKey: key,
    color,
    text,
    isPediatric,
  };
}

export interface VitalAlert {
  field: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

export function evaluateVitals(data: ClinicalAssessmentData['vitals'], ageStr: string): VitalAlert[] {
  const alerts: VitalAlert[] = [];
  const t = parseFloat(data.temperature);
  const hr = parseFloat(data.heartRate);
  const rr = parseFloat(data.respiratoryRate);
  const sbp = parseFloat(data.systolicBP);
  const dbp = parseFloat(data.diastolicBP);
  const spo2 = parseFloat(data.spo2);
  const glu = parseFloat(data.glucose);
  const age = ageStr ? parseFloat(ageStr) : 40;

  if (!isNaN(t)) {
    if (t >= 38.0) alerts.push({ field: 'Temp', severity: 'warning', message: `Fiebre (${t}°C ≥ 38.0°C)` });
    else if (t < 35.0) alerts.push({ field: 'Temp', severity: 'warning', message: `Hipotermia (${t}°C < 35.0°C)` });
  }

  if (!isNaN(hr)) {
    if (hr > 120) alerts.push({ field: 'FC', severity: 'critical', message: `Taquicardia marcada (${hr} lpm > 120)` });
    else if (hr > 100) alerts.push({ field: 'FC', severity: 'warning', message: `Taquicardia leve (${hr} lpm > 100)` });
    else if (hr < 50) alerts.push({ field: 'FC', severity: 'critical', message: `Bradicardia (${hr} lpm < 50)` });
  }

  if (!isNaN(rr)) {
    if (rr > 24) alerts.push({ field: 'FR', severity: 'critical', message: `Taquipnea (${rr} rpm > 24)` });
    else if (rr < 10) alerts.push({ field: 'FR', severity: 'critical', message: `Bradipnea severa (${rr} rpm < 10)` });
  }

  if (!isNaN(sbp)) {
    if (sbp >= 180) alerts.push({ field: 'PA', severity: 'critical', message: `Crisis hipertensiva sistólica (PAS ${sbp} ≥ 180 mmHg)` });
    else if (sbp >= 140) alerts.push({ field: 'PA', severity: 'warning', message: `Hipertensión sistólica (${sbp} mmHg)` });
    else if (sbp < 90) alerts.push({ field: 'PA', severity: 'critical', message: `Hipotensión sistólica (${sbp} mmHg < 90)` });
  }

  if (!isNaN(dbp)) {
    if (dbp >= 120) alerts.push({ field: 'PA', severity: 'critical', message: `Crisis hipertensiva diastólica (PAD ${dbp} ≥ 120 mmHg)` });
    else if (dbp >= 90) alerts.push({ field: 'PA', severity: 'warning', message: `Hipertensión diastólica (${dbp} mmHg)` });
  }

  if (!isNaN(spo2)) {
    if (spo2 < 90) alerts.push({ field: 'SpO₂', severity: 'critical', message: `Hipoxemia severa (${spo2}% < 90%) - Oxígeno urgente` });
    else if (spo2 < 94) alerts.push({ field: 'SpO₂', severity: 'warning', message: `SpO₂ subóptima (${spo2}% < 94%)` });
  }

  if (!isNaN(glu)) {
    if (glu < 70) alerts.push({ field: 'Glucemia', severity: 'critical', message: `Hipoglucemia aguda (${glu} mg/dL < 70) - Protocolo glucosa` });
    else if (glu >= 250) alerts.push({ field: 'Glucemia', severity: 'warning', message: `Hiperglucemia marcada (${glu} mg/dL ≥ 250)` });
  }

  return alerts;
}

export function calculateGlasgow(eye: string, verbal: string, motor: string) {
  const e = parseInt(eye, 10);
  const v = parseInt(verbal, 10);
  const m = parseInt(motor, 10);

  if (isNaN(e) || isNaN(v) || isNaN(m)) {
    return {
      score: null,
      label: 'Sin valorar completo',
      severity: 'none',
      badgeColor: 'bg-slate-800 text-slate-300',
    };
  }

  const score = e + v + m;
  if (score <= 8) {
    return {
      score,
      label: 'Compromiso Grave (3–8) - Riesgo de vía aérea',
      severity: 'critical',
      badgeColor: 'bg-rose-950/80 text-rose-300 border border-rose-500/40',
    };
  } else if (score <= 12) {
    return {
      score,
      label: 'Compromiso Moderado (9–12)',
      severity: 'warning',
      badgeColor: 'bg-amber-950/80 text-amber-300 border border-amber-500/40',
    };
  } else {
    return {
      score,
      label: 'Estado Leve / Normal (13–15)',
      severity: 'good',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40',
    };
  }
}

export function calculateBraden(
  sensory: string,
  moisture: string,
  activity: string,
  mobility: string,
  nutrition: string,
  friction: string
) {
  const s = parseInt(sensory, 10);
  const m = parseInt(moisture, 10);
  const a = parseInt(activity, 10);
  const mob = parseInt(mobility, 10);
  const n = parseInt(nutrition, 10);
  const f = parseInt(friction, 10);

  if ([s, m, a, mob, n, f].some(isNaN)) {
    return {
      score: null,
      risk: 'Pendiente de completar',
      color: 'text-slate-400',
      badgeClass: 'bg-slate-800 text-slate-300',
    };
  }

  const total = s + m + a + mob + n + f;
  let risk = '';
  let color = '';
  let badgeClass = '';

  if (total <= 9) {
    risk = 'Riesgo MUY ALTO (≤ 9)';
    color = 'text-rose-400';
    badgeClass = 'bg-rose-950/80 text-rose-300 border border-rose-500/50';
  } else if (total <= 12) {
    risk = 'Riesgo ALTO (10–12)';
    color = 'text-rose-300';
    badgeClass = 'bg-rose-900/60 text-rose-200 border border-rose-400/40';
  } else if (total <= 14) {
    risk = 'Riesgo MODERADO (13–14)';
    color = 'text-amber-400';
    badgeClass = 'bg-amber-950/80 text-amber-300 border border-amber-500/50';
  } else if (total <= 18) {
    risk = 'Riesgo BAJO (15–18)';
    color = 'text-teal-300';
    badgeClass = 'bg-teal-950/80 text-teal-300 border border-teal-500/50';
  } else {
    risk = 'Riesgo MÍNIMO / Sin Riesgo (19–23)';
    color = 'text-emerald-400';
    badgeClass = 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50';
  }

  return { score: total, risk, color, badgeClass };
}

export function calculateFluidBalance(oral: string, iv: string, urine: string, other: string) {
  const o = parseFloat(oral) || 0;
  const i = parseFloat(iv) || 0;
  const u = parseFloat(urine) || 0;
  const ot = parseFloat(other) || 0;

  const totalIn = o + i;
  const totalOut = u + ot;
  const net = totalIn - totalOut;

  const hasData = [oral, iv, urine, other].some((x) => x && x.trim() !== '');

  return {
    totalIn,
    totalOut,
    net,
    hasData,
    isPositive: net > 0,
    isNegative: net < 0,
    isNeutral: net === 0,
  };
}

export function getPainEVAData(eva: number) {
  if (eva === 0) return { label: 'Sin dolor', face: '😊', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  if (eva <= 3) return { label: 'Dolor leve', face: '🙂', color: 'text-teal-300', bg: 'bg-teal-500/20' };
  if (eva <= 6) return { label: 'Dolor moderado', face: '😐', color: 'text-amber-400', bg: 'bg-amber-500/20' };
  if (eva <= 8) return { label: 'Dolor severo', face: '😣', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  return { label: 'Dolor máximo / intolerable', face: '😭', color: 'text-rose-400', bg: 'bg-rose-500/20' };
}

export function generateWhatsAppFormattedReport(data: ClinicalAssessmentData): string {
  const safe = (v?: string | null) => (v && v.trim() ? v.trim() : 'No consignado');
  const bmiObj = calculateBMI(data.anthropometry.weight, data.anthropometry.height, data.patient.age);
  const vitalsAlerts = evaluateVitals(data.vitals, data.patient.age);
  const g = calculateGlasgow(data.neurological.glasgowEye, data.neurological.glasgowVerbal, data.neurological.glasgowMotor);
  const bal = calculateFluidBalance(
    data.fluidBalance.oralIntake,
    data.fluidBalance.ivIntake,
    data.fluidBalance.urineOutput,
    data.fluidBalance.otherLosses
  );
  const br = calculateBraden(
    data.skinWounds.bradenSensory,
    data.skinWounds.bradenMoisture,
    data.skinWounds.bradenActivity,
    data.skinWounds.bradenMobility,
    data.skinWounds.bradenNutrition,
    data.skinWounds.bradenFriction
  );
  const pain = getPainEVAData(data.nutritionPain.painEVA);

  const lines: string[] = [
    `📋 *INFORME DE VALORACIÓN DE ENFERMERÍA*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🏥 *Institución/Servicio:* ${safe(data.evolution.institution)}`,
    `📅 *Fecha y Hora:* ${safe(data.patient.date)}`,
    `👤 *Paciente:* ${safe(data.patient.name)}`,
    `🆔 *DNI / HC:* ${safe(data.patient.document)}`,
    `🎂 *Edad:* ${safe(data.patient.age)} años | *Sexo:* ${safe(data.patient.sex)}`,
    `🛏️ *Ubicación / Cama:* ${safe(data.patient.bed)}`,
    `📌 *Motivo de Consulta:* ${safe(data.patient.reason)}`,
    `⚠️ *Antecedentes / Alergias:* ${safe(data.patient.history)}`,
    ``,
    `📊 *ANTROPOMETRÍA & IMC*`,
    `• Peso: ${safe(data.anthropometry.weight)} kg | Talla: ${safe(data.anthropometry.height)} cm`,
    `• IMC: ${bmiObj.bmi ? `${bmiObj.bmi} kg/m² (*${bmiObj.category}*)` : 'No calculado'}`,
    `• Perímetro abd.: ${safe(data.anthropometry.waist)} cm | Cefálico: ${safe(data.anthropometry.headCircumference)} cm`,
    ``,
    `🩺 *SIGNOS VITALES*`,
    `• *Temp:* ${safe(data.vitals.temperature)} °C`,
    `• *FC:* ${safe(data.vitals.heartRate)} lpm | *FR:* ${safe(data.vitals.respiratoryRate)} rpm`,
    `• *PA:* ${safe(data.vitals.systolicBP)}/${safe(data.vitals.diastolicBP)} mmHg`,
    `• *SpO₂:* ${safe(data.vitals.spo2)}% | *Glucemia:* ${safe(data.vitals.glucose)} mg/dL`,
    `• *Oxigenoterapia:* ${safe(data.vitals.oxygenTherapy)}${data.vitals.oxygenDevice ? ` (${data.vitals.oxygenDevice})` : ''}`,
  ];

  if (vitalsAlerts.length > 0) {
    lines.push(`🚨 *ALERTAS CLÍNICAS:* ${vitalsAlerts.map((a) => a.message).join(' · ')}`);
  }

  lines.push(
    ``,
    `🧠 *VALORACIÓN NEUROLÓGICA*`,
    `• Conciencia: ${safe(data.neurological.consciousness)}`,
    `• Orientación: ${safe(data.neurological.orientation)}`,
    `• Pupilas: ${safe(data.neurological.pupils)}`,
    `• Movilidad: ${safe(data.neurological.motorResponse)}`,
    `• *Glasgow:* ${g.score ? `${g.score}/15 (O${data.neurological.glasgowEye} V${data.neurological.glasgowVerbal} M${data.neurological.glasgowMotor}) - ${g.label}` : 'Pendiente'}`,
    ``,
    `🫁 *VALORACIÓN RESPIRATORIA*`,
    `• Patrón: ${safe(data.respiratory.pattern)}`,
    `• Ruidos: ${safe(data.respiratory.sounds)}`,
    `• Tos/Secreciones: ${safe(data.respiratory.cough)} | Cianosis: ${safe(data.respiratory.cyanosis)}`,
    data.respiratory.notes ? `• Obs: ${data.respiratory.notes}` : '',
    ``,
    `🫀 *VALORACIÓN CARDIOVASCULAR*`,
    `• Pulso: ${safe(data.cardiovascular.pulse)} | Relleno capilar: ${safe(data.cardiovascular.capillaryRefill)}`,
    `• Edemas: ${safe(data.cardiovascular.edema)} | Piel: ${safe(data.cardiovascular.skinColor)}`,
    data.cardiovascular.notes ? `• Obs: ${data.cardiovascular.notes}` : '',
    ``,
    `💧 *BALANCE HÍDRICO & ELIMINACIÓN*`,
    `• Ingresos: ${bal.totalIn} mL (VO: ${safe(data.fluidBalance.oralIntake)} | IV: ${safe(data.fluidBalance.ivIntake)})`,
    `• Egresos: ${bal.totalOut} mL (Diuresis: ${safe(data.fluidBalance.urineOutput)} | Otras: ${safe(data.fluidBalance.otherLosses)})`,
    `• *Balance Neto:* ${bal.net > 0 ? `+${bal.net}` : bal.net} mL`,
    `• Aspecto orina: ${safe(data.fluidBalance.urineAspect)} | Evacuación: ${safe(data.fluidBalance.bowelMovement)}`,
    data.fluidBalance.notes ? `• Obs eliminación: ${data.fluidBalance.notes}` : '',
    ``,
    `🍽️ *NUTRICIÓN & DOLOR*`,
    `• Dieta: ${safe(data.nutritionPain.diet)} | Apetito: ${safe(data.nutritionPain.appetite)}`,
    `• *Dolor EVA:* ${data.nutritionPain.painEVA}/10 ${pain.face} (*${pain.label}*)`,
    data.nutritionPain.painSite ? `• Localización: ${data.nutritionPain.painSite}` : '',
    data.nutritionPain.painNotes ? `• Características: ${data.nutritionPain.painNotes}` : '',
    ``,
    `🩹 *PIEL, HERIDAS & RIESGOS*`,
    `• Estado piel: ${safe(data.skinWounds.skinState)} | Lesiones: ${safe(data.skinWounds.hasWounds)}`,
    data.skinWounds.woundNotes ? `• Detalle heridas: ${data.skinWounds.woundNotes}` : '',
    `• *Escala Braden:* ${br.score ? `${br.score}/23 (*${br.risk}*)` : 'No completada'}`,
    `• Movilidad funcional: ${safe(data.mobilityFalls.functionalMobility)} | Ayuda: ${safe(data.mobilityFalls.assistiveDevice)}`,
    `• Factores de caída: ${data.mobilityFalls.fallFactors.length > 0 ? data.mobilityFalls.fallFactors.join(', ') : 'Ninguno registrado'}`
  );

  // Medications
  lines.push(``, `💊 *MEDICACIÓN INDICADA / ADMINISTRADA*`);
  const validMeds = data.medications.filter((m) => m.name.trim());
  if (validMeds.length > 0) {
    validMeds.forEach((m, idx) => {
      lines.push(`${idx + 1}. *${m.name}* - ${safe(m.dose)} | Vía: ${safe(m.route)} | Horario: ${safe(m.schedule)}`);
    });
  } else {
    lines.push(`• Sin medicación registrada`);
  }

  // Labs
  lines.push(``, `🧪 *LABORATORIO & ESTUDIOS COMPLEMENTARIOS*`);
  const validLabs = data.labs.filter((l) => l.testName.trim());
  if (validLabs.length > 0) {
    validLabs.forEach((l, idx) => {
      lines.push(`${idx + 1}. *${l.testName}*: ${safe(l.result)} (Ref: ${safe(l.reference)})`);
    });
  } else {
    lines.push(`• Sin estudios complementarios registrados`);
  }

  // Evolution & Nursing Care
  lines.push(
    ``,
    `📝 *EVOLUCIÓN & PLAN DE CUIDADOS*`,
    `• Evolución: ${safe(data.evolution.nursingEvolution)}`,
    `• Intervenciones: ${safe(data.evolution.carePlan)}`,
    `• *Responsable:* ${safe(data.evolution.professionalName)}${data.evolution.licenseNumber ? ` (MN/MP: ${data.evolution.licenseNumber})` : ''}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `_Herramienta clínica de apoyo. Interpretar con criterio profesional._`
  );

  return lines.filter((l) => l !== '').join('\n');
}

export const SAMPLE_PRESETS: { label: string; desc: string; data: Partial<ClinicalAssessmentData> }[] = [
  {
    label: 'Adulto Hipertenso en Observación',
    desc: 'Carga paciente adulto con cifras tensionales elevadas y dolor de cabeza',
    data: {
      patient: {
        name: 'Carlos Alberto Rodríguez',
        document: '28.450.912',
        date: new Date().toISOString().slice(0, 16),
        age: '54',
        sex: 'Masculino',
        ageGroup: 'adult',
        bed: 'Guardia - Cama 04',
        reason: 'Cefalea pulsátil holocraneana y mareos de 3 horas de evolución.',
        history: 'Hipertensión arterial diagnosticada hace 8 años. Alergia a Penicilina.',
      },
      anthropometry: {
        weight: '84.5',
        height: '174',
        waist: '98',
        headCircumference: '',
      },
      vitals: {
        temperature: '36.8',
        heartRate: '92',
        respiratoryRate: '18',
        systolicBP: '165',
        diastolicBP: '100',
        spo2: '97',
        glucose: '118',
        oxygenTherapy: 'No',
        oxygenDevice: '',
      },
      neurological: {
        consciousness: 'Alerta',
        orientation: 'Orientado en persona, tiempo y espacio',
        pupils: 'Isocóricas y reactivas',
        motorResponse: 'Conservada',
        glasgowEye: '4',
        glasgowVerbal: '5',
        glasgowMotor: '6',
      },
      respiratory: {
        pattern: 'Eupneico',
        sounds: 'Murmullo vesicular conservado bilateral',
        cough: 'Sin tos',
        cyanosis: 'No',
        notes: 'Buena mecánica ventilatoria, sin tiraje.',
      },
      cardiovascular: {
        pulse: 'Regular y palpable',
        capillaryRefill: '≤ 2 segundos',
        edema: 'MMII leves + en tobillos',
        skinColor: 'Normocoloreada',
        notes: 'Pulsos periféricos simétricos.',
      },
      fluidBalance: {
        oralIntake: '400',
        ivIntake: '500',
        urineOutput: '650',
        otherLosses: '0',
        urineAspect: 'Clara',
        bowelMovement: 'Conservada',
        notes: 'Micción espontánea sin disuria.',
      },
      nutritionPain: {
        diet: 'Hiposódica',
        appetite: 'Conservado',
        painEVA: 5,
        painSite: 'Región occipital y frontal',
        painNotes: 'Cefalea opresiva/pulsátil que disminuye con reposo en decúbito semielevado.',
      },
      skinWounds: {
        skinState: 'Íntegra',
        hasWounds: 'No',
        woundNotes: 'Piel normohidratada.',
        bradenSensory: '4',
        bradenMoisture: '4',
        bradenActivity: '3',
        bradenMobility: '3',
        bradenNutrition: '3',
        bradenFriction: '3',
      },
      mobilityFalls: {
        functionalMobility: 'Con ayuda parcial',
        assistiveDevice: 'Ninguna',
        fallFactors: ['Alteración de marcha', 'Medicación de riesgo'],
      },
      medications: [
        { id: '1', name: 'Amlodipina', dose: '10 mg VO', route: 'Oral', schedule: 'Dosis única en guardia' },
        { id: '2', name: 'Paracetamol', dose: '1000 mg VO', route: 'Oral', schedule: 'c/ 8 horas si cefalea' },
      ],
      labs: [
        { id: '1', testName: 'Hemograma completo', result: 'Hb 14.8 g/dL, Leucocitos 7.200/mm³', reference: 'Hb 13-17' },
        { id: '2', testName: 'Ionograma plasmático', result: 'Na 140 mEq/L, K 4.1 mEq/L', reference: 'Na 135-145, K 3.5-5.0' },
      ],
      evolution: {
        nursingEvolution: 'Paciente lúcido, colaborador, en posición fowler 45°. Se realiza control de signos vitales evidenciando HTA grado 2. Se administra medicación indicada por médico de guardia. Refiere leve alivio de cefalea tras analgesia.',
        carePlan: 'Monitoreo horario de presión arterial, reposo relativo, control de signos de alarma neurológicos, registro de balance hídrico.',
        professionalName: 'Lic. Mariana Fernández',
        licenseNumber: 'MP 4821',
        institution: 'Hospital Central - Servicio de Emergencias',
      },
    },
  },
  {
    label: 'Postoperatorio Inmediato',
    desc: 'Paciente posquirúrgico con dolor EVA 7, herida quirúrgica y plan de hidratación',
    data: {
      patient: {
        name: 'Beatriz Silveira',
        document: '32.119.805',
        date: new Date().toISOString().slice(0, 16),
        age: '42',
        sex: 'Femenino',
        ageGroup: 'adult',
        bed: 'Cirugía - Cama 12B',
        reason: 'Postoperatorio inmediato colecistectomía laparoscópica.',
        history: 'Sin antecedentes patológicos crónicos. Sin alergias conocidas.',
      },
      anthropometry: {
        weight: '68.0',
        height: '162',
        waist: '82',
        headCircumference: '',
      },
      vitals: {
        temperature: '36.4',
        heartRate: '84',
        respiratoryRate: '16',
        systolicBP: '115',
        diastolicBP: '75',
        spo2: '98',
        glucose: '102',
        oxygenTherapy: 'Sí - cánula nasal',
        oxygenDevice: 'Cánula nasal a 2 L/min',
      },
      neurological: {
        consciousness: 'Somnoliento',
        orientation: 'Orientado en persona, tiempo y espacio',
        pupils: 'Isocóricas y reactivas',
        motorResponse: 'Conservada',
        glasgowEye: '3',
        glasgowVerbal: '5',
        glasgowMotor: '6',
      },
      respiratory: {
        pattern: 'Eupneico',
        sounds: 'Murmullo vesicular conservado',
        cough: 'Sin tos',
        cyanosis: 'No',
        notes: 'Ventila adecuadamente con bajo flujo de O2.',
      },
      cardiovascular: {
        pulse: 'Regular y palpable',
        capillaryRefill: '≤ 2 segundos',
        edema: 'Ausentes',
        skinColor: 'Pálida',
        notes: 'Piel tibia y seca.',
      },
      fluidBalance: {
        oralIntake: '0',
        ivIntake: '1000',
        urineOutput: '450',
        otherLosses: '50',
        urineAspect: 'Clara',
        bowelMovement: 'No registrada',
        notes: 'Sonda vesical permeable con diuresis clara. Drenaje abdominal con escaso débito serohemático (50 mL).',
      },
      nutritionPain: {
        diet: 'Ayuno',
        appetite: 'Intolerancia / vómitos',
        painEVA: 7,
        painSite: 'Abdomen superior / puertos laparoscópicos',
        painNotes: 'Dolor cólico y punzante acentuado con la movilización.',
      },
      skinWounds: {
        skinState: 'Frágil',
        hasWounds: 'Sí - describir',
        woundNotes: 'Cuatro heridas por trócares con apósitos limpios y secos, sin sangrado activo.',
        bradenSensory: '3',
        bradenMoisture: '4',
        bradenActivity: '1',
        bradenMobility: '2',
        bradenNutrition: '2',
        bradenFriction: '2',
      },
      mobilityFalls: {
        functionalMobility: 'En cama',
        assistiveDevice: 'Ninguna',
        fallFactors: ['Medicación de riesgo', 'Necesita asistencia'],
      },
      medications: [
        { id: '1', name: 'Ketorolac', dose: '30 mg EV', route: 'Endovenosa', schedule: 'c/ 8 horas' },
        { id: '2', name: 'Omeprazol', dose: '40 mg EV', route: 'Endovenosa', schedule: 'c/ 24 horas' },
        { id: '3', name: 'Solución Fisiológica 0.9%', dose: '500 mL con 20 mEq KCl', route: 'Endovenosa', schedule: 'a 21 gotas/min' },
      ],
      labs: [
        { id: '1', testName: 'Hemoglobina postquirúrgica', result: '12.1 g/dL', reference: '12.0 - 15.5' },
        { id: '2', testName: 'Glucemia en ayunas', result: '102 mg/dL', reference: '70 - 110' },
      ],
      evolution: {
        nursingEvolution: 'Ingresa a sala de internación quirúrgica proveniente de quirófano. Responde a estímulos verbales, orientada en tiempo y espacio. Apósito abdominal limpio y seco. Se conecta analgesia pautada. Permeabilidad de vía venosa periférica en MSD #20G.',
        carePlan: 'Control de signos vitales cada 2 horas, control de débito de drenaje y diuresis, manejo del dolor según escala EVA, cambios posturales protegidos.',
        professionalName: 'Enf. Rodrigo Morales',
        licenseNumber: 'MP 7109',
        institution: 'Sanatorio Modelo - Sala de Cirugía',
      },
    },
  },
];
