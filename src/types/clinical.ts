export interface PatientInfo {
  name: string;
  document: string;
  date: string;
  age: string;
  sex: string;
  ageGroup: 'adult' | 'older' | 'child' | 'infant';
  bed: string;
  reason: string;
  history: string;
}

export interface Anthropometry {
  weight: string;
  height: string;
  waist: string;
  headCircumference: string;
}

export interface VitalSigns {
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  systolicBP: string;
  diastolicBP: string;
  spo2: string;
  glucose: string;
  oxygenTherapy: string;
  oxygenDevice: string;
}

export interface Neurological {
  consciousness: string;
  orientation: string;
  pupils: string;
  motorResponse: string;
  glasgowEye: string;
  glasgowVerbal: string;
  glasgowMotor: string;
}

export interface Respiratory {
  pattern: string;
  sounds: string;
  cough: string;
  cyanosis: string;
  notes: string;
}

export interface Cardiovascular {
  pulse: string;
  capillaryRefill: string;
  edema: string;
  skinColor: string;
  notes: string;
}

export interface FluidBalance {
  oralIntake: string;
  ivIntake: string;
  urineOutput: string;
  otherLosses: string;
  urineAspect: string;
  bowelMovement: string;
  notes: string;
}

export interface NutritionPain {
  diet: string;
  appetite: string;
  painEVA: number;
  painSite: string;
  painNotes: string;
}

export interface SkinWounds {
  skinState: string;
  hasWounds: string;
  woundNotes: string;
  bradenSensory: string;
  bradenMoisture: string;
  bradenActivity: string;
  bradenMobility: string;
  bradenNutrition: string;
  bradenFriction: string;
}

export interface MobilityFalls {
  functionalMobility: string;
  assistiveDevice: string;
  fallFactors: string[];
}

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  route: string;
  schedule: string;
}

export interface LabItem {
  id: string;
  testName: string;
  result: string;
  reference: string;
}

export interface ClinicalEvolution {
  nursingEvolution: string;
  carePlan: string;
  professionalName: string;
  licenseNumber: string;
  institution: string;
}

export interface ClinicalAssessmentData {
  patient: PatientInfo;
  anthropometry: Anthropometry;
  vitals: VitalSigns;
  neurological: Neurological;
  respiratory: Respiratory;
  cardiovascular: Cardiovascular;
  fluidBalance: FluidBalance;
  nutritionPain: NutritionPain;
  skinWounds: SkinWounds;
  mobilityFalls: MobilityFalls;
  medications: MedicationItem[];
  labs: LabItem[];
  evolution: ClinicalEvolution;
}
