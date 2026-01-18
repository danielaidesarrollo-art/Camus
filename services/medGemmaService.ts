/**
 * Med-Gemma Service
 * Drug interaction checking and medical inference using Med-Gemma
 */

import type {
    DrugInteractionAlert,
    Drug,
    Medication,
    Reference
} from '../types/copilot';

class MedGemmaService {
    private apiKey: string;
    private baseUrl: string;
    private interactionCache: Map<string, DrugInteractionAlert>;

    constructor() {
        this.apiKey = import.meta.env.VITE_MEDGEMMA_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.interactionCache = new Map();
    }

    /**
     * Check for drug interactions
     */
    async checkInteractions(medications: Medication[]): Promise<DrugInteractionAlert[]> {
        if (medications.length < 2) {
            return [];
        }

        console.log('[Med-Gemma] Checking interactions for', medications.length, 'medications');

        const alerts: DrugInteractionAlert[] = [];

        // Check each pair of medications
        for (let i = 0; i < medications.length; i++) {
            for (let j = i + 1; j < medications.length; j++) {
                const alert = await this.checkPairInteraction(
                    medications[i],
                    medications[j]
                );
                if (alert) {
                    alerts.push(alert);
                }
            }
        }

        // Sort by severity
        return alerts.sort((a, b) => {
            const severityOrder = { critical: 0, major: 1, moderate: 2, minor: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }

    /**
     * Check interaction between two medications
     */
    private async checkPairInteraction(
        med1: Medication,
        med2: Medication
    ): Promise<DrugInteractionAlert | null> {
        const cacheKey = `${med1.name}_${med2.name}`;

        // Check cache first
        if (this.interactionCache.has(cacheKey)) {
            return this.interactionCache.get(cacheKey)!;
        }

        try {
            const prompt = `
As a medical AI specialized in pharmacology, analyze the potential drug interaction between:

Drug 1: ${med1.name} (${med1.dose}, ${med1.route}, ${med1.frequency})
Drug 2: ${med2.name} (${med2.dose}, ${med2.route}, ${med2.frequency})

Provide a structured analysis including:
1. Severity level (critical/major/moderate/minor/none)
2. Mechanism of interaction
3. Clinical effects
4. Management recommendations
5. References

If there is no significant interaction, respond with "NO_INTERACTION".
            `.trim();

            const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.3, // Lower temperature for medical accuracy
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Med-Gemma API error: ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;

            if (text.includes('NO_INTERACTION')) {
                return null;
            }

            // Parse the response
            const alert = this.parseInteractionResponse(text, med1, med2);

            // Cache the result
            this.interactionCache.set(cacheKey, alert);

            return alert;

        } catch (error) {
            console.error('[Med-Gemma] Error checking interaction:', error);
            return null;
        }
    }

    /**
     * Parse Med-Gemma response into structured alert
     */
    private parseInteractionResponse(
        text: string,
        med1: Medication,
        med2: Medication
    ): DrugInteractionAlert {
        const lowerText = text.toLowerCase();

        // Extract severity
        let severity: 'critical' | 'major' | 'moderate' | 'minor' = 'moderate';
        if (lowerText.includes('critical') || lowerText.includes('contraindicated') || lowerText.includes('contraindicado')) {
            severity = 'critical';
        } else if (lowerText.includes('major') || lowerText.includes('grave')) {
            severity = 'major';
        } else if (lowerText.includes('minor') || lowerText.includes('leve')) {
            severity = 'minor';
        }

        // Extract mechanism
        let mechanism = 'Mecanismo no especificado';
        const mechanismMatch = text.match(/mecanismo[:\s]+([^\n]+)|mechanism[:\s]+([^\n]+)/i);
        if (mechanismMatch) {
            mechanism = (mechanismMatch[1] || mechanismMatch[2]).trim();
        }

        // Extract clinical effect
        let clinicalEffect = 'Efecto clínico no especificado';
        const effectMatch = text.match(/efecto[s]?\s+clínico[s]?[:\s]+([^\n]+)|clinical\s+effect[s]?[:\s]+([^\n]+)/i);
        if (effectMatch) {
            clinicalEffect = (effectMatch[1] || effectMatch[2]).trim();
        }

        // Extract management recommendations
        const management: string[] = [];
        const mgmtSection = text.match(/manejo[:\s]+([\s\S]*?)(?=\n\n|referencia|$)|management[:\s]+([\s\S]*?)(?=\n\n|reference|$)/i);
        if (mgmtSection) {
            const mgmtText = mgmtSection[1] || mgmtSection[2];
            const mgmtLines = mgmtText.split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0 && (l.startsWith('-') || l.startsWith('•') || l.match(/^\d+\./)));
            management.push(...mgmtLines.map(l => l.replace(/^[-•\d.]\s*/, '')));
        }
        if (management.length === 0) {
            management.push('Monitorear al paciente', 'Consultar con médico si es necesario');
        }

        // Extract references
        const references: Reference[] = [];
        const refMatches = text.matchAll(/referencia[s]?[:\s]+([^\n]+)|reference[s]?[:\s]+([^\n]+)/gi);
        for (const match of refMatches) {
            const refText = (match[1] || match[2]).trim();
            references.push({
                source: refText,
                url: ''
            });
        }

        return {
            id: `alert_${Date.now()}`,
            severity,
            drugs: [
                {
                    name: med1.name,
                    genericName: this.getGenericName(med1.name),
                    dose: med1.dose,
                    route: med1.route
                },
                {
                    name: med2.name,
                    genericName: this.getGenericName(med2.name),
                    dose: med2.dose,
                    route: med2.route
                }
            ],
            interaction: text,
            mechanism,
            clinicalEffect,
            management,
            references,
            timestamp: new Date()
        };
    }

    /**
     * Get generic name from brand name
     */
    private getGenericName(brandName: string): string {
        // Common medication mappings (expand as needed)
        const genericMap: Record<string, string> = {
            // Analgesics
            'tylenol': 'acetaminofén',
            'advil': 'ibuprofeno',
            'motrin': 'ibuprofeno',
            'aleve': 'naproxeno',

            // Antibiotics
            'amoxil': 'amoxicilina',
            'augmentin': 'amoxicilina/clavulanato',
            'zithromax': 'azitromicina',

            // Cardiovascular
            'lipitor': 'atorvastatina',
            'crestor': 'rosuvastatina',
            'plavix': 'clopidogrel',
            'norvasc': 'amlodipino',

            // Diabetes
            'glucophage': 'metformina',
            'januvia': 'sitagliptina',

            // Respiratory
            'ventolin': 'salbutamol',
            'symbicort': 'budesonida/formoterol'
        };

        const lowerName = brandName.toLowerCase();
        return genericMap[lowerName] || brandName;
    }

    /**
     * Get detailed interaction information
     */
    async getInteractionDetails(alertId: string): Promise<DrugInteractionAlert | null> {
        // Search cache for alert
        for (const alert of this.interactionCache.values()) {
            if (alert.id === alertId) {
                return alert;
            }
        }
        return null;
    }

    /**
     * Clear interaction cache
     */
    clearCache(): void {
        this.interactionCache.clear();
    }
}

export const medGemmaService = new MedGemmaService();
