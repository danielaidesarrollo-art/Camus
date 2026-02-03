/**
 * AI Copilot Service
 * Core service for CAMUS AI Copilot functionality
 */

import type {
    CopilotInvocation,
    CopilotRecommendation,
    PatientContext,
    UserDecision,
    MedicalProtocol,
    ProtocolUpdate
} from '../types/copilot';

class CopilotService {
    private apiKey: string;
    private baseUrl: string;
    private protocols: Map<string, MedicalProtocol>;
    private conversationHistory: CopilotInvocation[];

    constructor() {
        this.apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.protocols = new Map();
        this.conversationHistory = [];
        this.loadProtocols();
    }

    /**
     * Invoke the copilot with voice or text
     */
    async invoke(invocation: CopilotInvocation): Promise<CopilotRecommendation> {
        console.log('[Copilot] Invoked:', invocation);

        // Add to conversation history
        this.conversationHistory.push(invocation);

        // Build context for AI
        const context = this.buildContext(invocation.context);

        // Get recommendation from Gemini Flash
        const recommendation = await this.getRecommendation(context, invocation.trigger);

        return recommendation;
    }

    /**
     * Build context for AI inference
     */
    private buildContext(patientContext: PatientContext): string {
        const context = `
Patient Information:
- Age: ${patientContext.age}
- Gender: ${patientContext.gender}
- Active Diagnoses: ${patientContext.diagnoses.filter(d => d.status === 'active').map(d => d.description).join(', ')}
- Current Medications: ${patientContext.medications.map(m => `${m.name} ${m.dose} ${m.frequency}`).join(', ')}
- Known Allergies: ${patientContext.allergies.map(a => `${a.allergen} (${a.severity})`).join(', ')}

${patientContext.vitalSigns ? `
Recent Vital Signs:
- Blood Pressure: ${patientContext.vitalSigns.bloodPressure?.systolic}/${patientContext.vitalSigns.bloodPressure?.diastolic} mmHg
- Heart Rate: ${patientContext.vitalSigns.heartRate} bpm
- Respiratory Rate: ${patientContext.vitalSigns.respiratoryRate} rpm
- Temperature: ${patientContext.vitalSigns.temperature}°C
- O2 Saturation: ${patientContext.vitalSigns.oxygenSaturation}%
` : ''}

Available Protocols:
${Array.from(this.protocols.values()).map(p => `- ${p.name} (${p.version})`).join('\n')}
        `.trim();

        return context;
    }

    private async getRecommendation(context: string, query: string): Promise<CopilotRecommendation> {
        try {
            const { gatewayClient } = await import('./gatewayClient');

            // Determine if the task is clinical or administrative
            const isAdminTask = /ruta|horario|agend|administrativ|logístic|personal/i.test(query);
            const targetModel = isAdminTask ? 'gemini-flash' : 'med-gemma';

            console.log(`[Copilot] Routing task to ${targetModel} based on query: "${query}"`);

            const response = await gatewayClient.invoke({
                type: isAdminTask ? 'admin_task' : 'clinical_recommendation',
                app: 'camus',
                priority: isAdminTask ? 'NORMAL' : 'HIGH',
                model: targetModel, // Explicitly request the specified model
                data: {
                    query: query,
                    context: context
                }
            });

            // The Gateway returns the processed AI response
            const text = response.ai_analysis || response.result || response.text;

            // Parse the response into a structured recommendation
            return this.parseRecommendation(text);

        } catch (error) {
            console.error('[Copilot] Error getting recommendation:', error);
            throw error;
        }
    }

    /**
     * Parse AI response into structured recommendation
     */
    private parseRecommendation(text: string): CopilotRecommendation {
        // Extract structured information from AI response
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Determine recommendation type
        let type: 'diagnostic' | 'therapeutic' | 'monitoring' | 'referral' = 'therapeutic';
        const lowerText = text.toLowerCase();
        if (lowerText.includes('diagnos') || lowerText.includes('evalua')) {
            type = 'diagnostic';
        } else if (lowerText.includes('refer') || lowerText.includes('traslado')) {
            type = 'referral';
        } else if (lowerText.includes('monitor') || lowerText.includes('seguimiento')) {
            type = 'monitoring';
        }

        // Extract confidence level
        let confidence = 75;
        const confidenceMatch = text.match(/(\d+)%|confianza[:\s]+(\d+)/i);
        if (confidenceMatch) {
            confidence = parseInt(confidenceMatch[1] || confidenceMatch[2]);
        }

        // Extract evidence
        const evidence: string[] = [];
        const evidencePatterns = [/evidencia[:\s]+([^\n]+)/gi, /estudio[s]?[:\s]+([^\n]+)/gi];
        evidencePatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) { if (match[1]) evidence.push(match[1].trim()); }
        });

        // Extract alternatives
        const alternatives: string[] = [];
        const altSection = text.match(/alternativa[s]?[:\s]+([\s\S]*?)(?=\n\n|$)/i);
        if (altSection) {
            const altLines = altSection[1].split('\n').map(l => l.trim()).filter(l => l.length > 0 && (l.startsWith('-') || l.startsWith('•')));
            alternatives.push(...altLines.map(l => l.replace(/^[-•]\s*/, '')));
        }

        // Extract warnings
        const warnings: string[] = [];
        const warningPatterns = [/advertencia[s]?[:\s]+([^\n]+)/gi, /contraindicación[es]*[:\s]+([^\n]+)/gi];
        warningPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) { if (match[1]) warnings.push(match[1].trim()); }
        });

        // Extract main recommendation
        let recommendation = text;
        const recSection = text.match(/recomendación[:\s]+([\s\S]*?)(?=\n\n|$)/i);
        if (recSection) {
            recommendation = recSection[1].trim();
        }

        const requiresConfirmation = confidence < 70 || warnings.length > 0;

        return {
            id: `rec_${Date.now()}`,
            type,
            recommendation,
            confidence,
            evidence: evidence.map(e => ({ source: e, level: 'B', summary: e, reference: '' })),
            alternatives: alternatives.map(a => ({ option: a, pros: [], cons: [] })),
            warnings: warnings.map(w => ({ message: w, severity: 'warning' })),
            requiresConfirmation,
            timestamp: new Date()
        };
    }

    async recordDecision(decision: UserDecision): Promise<void> {
        console.log('[Copilot] Decision recorded:', decision);

        // TODO: Store in Vega DataCore
        localStorage.setItem(
            `decision_${decision.recommendationId}`,
            JSON.stringify(decision)
        );
    }

    /**
     * Load medical protocols
     */
    private loadProtocols(): void {
        // Load international protocols
        const internationalProtocols: MedicalProtocol[] = [
            {
                id: 'hypertension_aha_2023',
                name: 'Hypertension Management (AHA/ACC 2023)',
                category: 'hypertension',
                version: '2023.1',
                publishedDate: new Date('2023-01-01'),
                source: 'international',
                organization: 'American Heart Association',
                content: {
                    overview: 'Evidence-based guidelines for hypertension management',
                    indications: ['Blood pressure ≥130/80 mmHg', 'Cardiovascular risk factors'],
                    contraindications: [],
                    steps: [],
                    monitoring: [],
                    references: []
                },
                lastUpdated: new Date('2023-01-01'),
                status: 'active'
            },
            // Add more protocols...
        ];

        internationalProtocols.forEach(protocol => {
            this.protocols.set(protocol.id, protocol);
        });

        // Load custom protocols from localStorage
        const customProtocols = localStorage.getItem('custom_protocols');
        if (customProtocols) {
            const protocols: MedicalProtocol[] = JSON.parse(customProtocols);
            protocols.forEach(protocol => {
                this.protocols.set(protocol.id, protocol);
            });
        }
    }

    /**
     * Get all protocols
     */
    getProtocols(): MedicalProtocol[] {
        return Array.from(this.protocols.values());
    }

    /**
     * Get protocol by ID
     */
    getProtocol(id: string): MedicalProtocol | undefined {
        return this.protocols.get(id);
    }

    /**
     * Add custom protocol
     */
    async addCustomProtocol(protocol: MedicalProtocol): Promise<void> {
        protocol.source = 'custom';
        protocol.status = 'pending';
        this.protocols.set(protocol.id, protocol);

        // Save to localStorage
        const customProtocols = Array.from(this.protocols.values())
            .filter(p => p.source === 'custom');
        localStorage.setItem('custom_protocols', JSON.stringify(customProtocols));
    }

    /**
     * Approve protocol update (Jefe Médico only)
     */
    async approveProtocolUpdate(update: ProtocolUpdate, approvedBy: string): Promise<void> {
        const protocol = this.protocols.get(update.protocolId);
        if (!protocol) {
            throw new Error('Protocol not found');
        }

        protocol.version = update.newVersion;
        protocol.lastUpdated = new Date();
        protocol.approvedBy = approvedBy;
        protocol.status = 'active';

        this.protocols.set(protocol.id, protocol);

        console.log('[Copilot] Protocol updated:', protocol);
    }

    /**
     * Check for protocol updates
     */
    async checkForUpdates(): Promise<ProtocolUpdate[]> {
        // TODO: Implement actual update checking
        // This would query an external API for new protocol versions
        return [];
    }
}

export const copilotService = new CopilotService();
