/**
 * AI Copilot Types
 * Core type definitions for the CAMUS AI Copilot System
 */

// ============================================================================
// Copilot Core Types
// ============================================================================

export type InvocationMethod = 'voice' | 'text' | 'button';

export interface CopilotInvocation {
    method: InvocationMethod;
    trigger: string;
    context: PatientContext;
    timestamp: Date;
}

export interface PatientContext {
    patientId: string;
    age: number;
    gender: 'M' | 'F' | 'Other';
    diagnoses: Diagnosis[];
    medications: Medication[];
    allergies: Allergy[];
    vitalSigns?: VitalSigns;
    environment?: EnvironmentAssessment;
}

export interface Diagnosis {
    code: string; // ICD-10
    description: string;
    diagnosedDate: Date;
    status: 'active' | 'resolved' | 'chronic';
}

export interface Medication {
    name: string;
    dose: string;
    frequency: string;
    route: string;
    startDate: Date;
    endDate?: Date;
    prescribedBy: string;
}

export interface Allergy {
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
}

export interface VitalSigns {
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    timestamp: Date;
}

// ============================================================================
// Copilot Recommendations
// ============================================================================

export interface CopilotRecommendation {
    id: string;
    type: 'diagnostic' | 'therapeutic' | 'monitoring' | 'referral';
    recommendation: string;
    confidence: number; // 0-100
    evidence: Evidence[];
    alternatives: Alternative[];
    warnings: Warning[];
    requiresConfirmation: boolean;
    protocolUsed?: string;
    timestamp: Date;
}

export interface Evidence {
    source: string;
    level: 'A' | 'B' | 'C' | 'D'; // Evidence level
    summary: string;
    reference: string;
}

export interface Alternative {
    option: string;
    pros: string[];
    cons: string[];
    contraindications?: string[];
}

export interface Warning {
    severity: 'info' | 'warning' | 'critical';
    message: string;
    action?: string;
}

export interface UserDecision {
    recommendationId: string;
    accepted: boolean;
    modified: boolean;
    modificationDetails?: string;
    justification?: string;
    timestamp: Date;
    professionalId: string;
    professionalName: string;
}

// ============================================================================
// Medical Protocols
// ============================================================================

export interface MedicalProtocol {
    id: string;
    name: string;
    category: ProtocolCategory;
    version: string;
    publishedDate: Date;
    source: 'international' | 'custom';
    organization?: string;
    content: ProtocolContent;
    lastUpdated: Date;
    uploadedBy?: string;
    approvedBy?: string;
    status: 'active' | 'pending' | 'archived';
}

export type ProtocolCategory =
    | 'hypertension'
    | 'diabetes'
    | 'copd'
    | 'heart_failure'
    | 'palliative_care'
    | 'wound_care'
    | 'pain_management'
    | 'nutrition'
    | 'custom';

export interface ProtocolContent {
    overview: string;
    indications: string[];
    contraindications: string[];
    steps: ProtocolStep[];
    medications?: MedicationGuideline[];
    monitoring: MonitoringGuideline[];
    references: string[];
}

export interface ProtocolStep {
    order: number;
    title: string;
    description: string;
    critical: boolean;
    estimatedTime?: number; // minutes
}

export interface MedicationGuideline {
    medication: string;
    indication: string;
    dosing: string;
    precautions: string[];
}

export interface MonitoringGuideline {
    parameter: string;
    frequency: string;
    targetRange?: string;
    alertCriteria?: string;
}

export interface ProtocolUpdate {
    protocolId: string;
    currentVersion: string;
    newVersion: string;
    changes: string[];
    releaseDate: Date;
    status: 'detected' | 'pending_review' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewDate?: Date;
}

// ============================================================================
// Google Astra Integration
// ============================================================================

export type AstraInputType = 'audio' | 'image' | 'video' | 'text';

export interface AstraInput {
    type: AstraInputType;
    data: Blob | string;
    context: ClinicalContext;
    timestamp: Date;
}

export interface ClinicalContext {
    patientId: string;
    visitId: string;
    professionalId: string;
    location: string;
    purpose: string;
}

export interface AstraOutput {
    analysis: string;
    entities: MedicalEntity[];
    suggestions: Suggestion[];
    confidence: number;
    processingTime: number; // milliseconds
    timestamp: Date;
}

export interface MedicalEntity {
    type: 'symptom' | 'diagnosis' | 'medication' | 'procedure' | 'finding';
    text: string;
    confidence: number;
    metadata?: Record<string, any>;
}

export interface Suggestion {
    type: 'action' | 'question' | 'warning';
    text: string;
    priority: 'low' | 'medium' | 'high';
}

// ============================================================================
// Environment Assessment
// ============================================================================

export interface EnvironmentAssessment {
    assessmentId: string;
    patientId: string;
    assessmentDate: Date;
    assessedBy: string;
    physical: PhysicalEnvironment;
    social: SocialEnvironment;
    risks: IdentifiedRisk[];
    recommendations: string[];
}

export interface PhysicalEnvironment {
    housingType: 'house' | 'apartment' | 'assisted_living' | 'other';
    accessibility: AccessibilityScore;
    safety: SafetyAssessment;
    hygiene: HygieneScore;
    medicationStorage: StorageAssessment;
}

export interface AccessibilityScore {
    overall: number; // 0-100
    stairs: boolean;
    ramps: boolean;
    handrails: boolean;
    bathroomAdaptations: boolean;
    notes: string;
}

export interface SafetyAssessment {
    overall: number; // 0-100
    fallRisks: string[];
    fireHazards: string[];
    electricalIssues: string[];
    lighting: 'adequate' | 'poor';
    notes: string;
}

export interface HygieneScore {
    overall: number; // 0-100
    cleanliness: 'good' | 'fair' | 'poor';
    ventilation: 'adequate' | 'poor';
    pestControl: boolean;
    notes: string;
}

export interface StorageAssessment {
    appropriate: boolean;
    temperature: 'controlled' | 'uncontrolled';
    accessibility: 'easy' | 'difficult';
    organization: 'organized' | 'disorganized';
    issues: string[];
}

export interface SocialEnvironment {
    supportNetwork: SupportNetwork;
    caregiver?: CaregiverInfo;
    isolation: IsolationRisk;
    economic: EconomicStatus;
}

export interface SupportNetwork {
    familySupport: 'strong' | 'moderate' | 'weak' | 'none';
    friendsSupport: 'strong' | 'moderate' | 'weak' | 'none';
    communityResources: string[];
    emergencyContacts: EmergencyContact[];
}

export interface CaregiverInfo {
    name: string;
    relationship: string;
    availability: 'full-time' | 'part-time' | 'occasional';
    capabilities: string[];
    burden: 'low' | 'moderate' | 'high';
}

export interface IsolationRisk {
    level: 'low' | 'moderate' | 'high';
    factors: string[];
    interventions: string[];
}

export interface EconomicStatus {
    level: 'stable' | 'at_risk' | 'critical';
    insurance: boolean;
    medicationAffordability: 'no_issues' | 'some_difficulty' | 'significant_difficulty';
    foodSecurity: 'secure' | 'at_risk' | 'insecure';
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    available24h: boolean;
}

export interface IdentifiedRisk {
    category: 'physical' | 'social' | 'medical' | 'economic';
    description: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    interventions: string[];
    status: 'identified' | 'addressed' | 'ongoing';
}

// ============================================================================
// Med-Gemma Drug Interactions
// ============================================================================

export interface DrugInteractionAlert {
    id: string;
    severity: 'critical' | 'major' | 'moderate' | 'minor';
    drugs: Drug[];
    interaction: string;
    mechanism: string;
    clinicalEffect: string;
    management: string[];
    references: Reference[];
    timestamp: Date;
}

export interface Drug {
    name: string;
    genericName: string;
    dose: string;
    route: string;
}

export interface Reference {
    source: string;
    url?: string;
    pubmedId?: string;
}

// ============================================================================
// Voice Synthesis (Daniel)
// ============================================================================

export interface VoiceGuidance {
    id: string;
    text: string;
    audioFile?: string;
    priority: 'immediate' | 'normal' | 'low';
    repeat: boolean;
    context: 'copilot' | 'alert' | 'emergency' | 'confirmation';
}

export interface DanielVoiceConfig {
    modelWeights: {
        gptSoVITS: string;
        checkpoint: string;
    };
    audioSamples: string[];
    voiceSettings: {
        speed: number; // 0.5 - 2.0
        pitch: number; // 0.5 - 2.0
        volume: number; // 0.0 - 1.0
    };
}

// ============================================================================
// Emergency System
// ============================================================================

export interface EmergencyActivation {
    id: string;
    trigger: 'manual' | 'automatic';
    reason: 'cardiac_arrest' | 'respiratory_arrest' | 'severe_trauma' | 'other';
    location: Location;
    timestamp: Date;
    professional: Professional;
    patient: PatientContext;
    status: 'active' | 'resolved' | 'cancelled';
}

export interface Location {
    address: string;
    coordinates?: { lat: number; lng: number };
    accessInstructions?: string;
}

export interface Professional {
    id: string;
    name: string;
    role: string;
    phone: string;
}

export interface CPREvent {
    emergencyId: string;
    startTime: Date;
    endTime?: Date;
    cycles: CPRCycle[];
    medications: EmergencyMedication[];
    outcome: 'rosc' | 'ongoing' | 'unsuccessful' | null;
    notes: string;
}

export interface CPRCycle {
    cycleNumber: number;
    startTime: Date;
    compressions: number;
    ventilations: number;
    quality: 'good' | 'fair' | 'poor';
}

export interface EmergencyMedication {
    medication: string;
    dose: string;
    route: string;
    time: Date;
    administeredBy: string;
}
