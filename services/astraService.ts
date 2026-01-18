/**
 * Google Astra Service
 * Multimodal data collection with low latency
 */

import type {
    AstraInput,
    AstraOutput,
    AstraInputType,
    ClinicalContext,
    MedicalEntity,
    Suggestion
} from '../types/copilot';
import { ECOSYSTEM_CONFIG } from '../config/ecosystem';
import axios from 'axios';

class AstraService {
    private apiKey: string;
    private baseUrl: string;
    private processingQueue: AstraInput[];

    constructor() {
        this.apiKey = import.meta.env.VITE_ASTRA_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
        this.baseUrl = ECOSYSTEM_CONFIG.CORES.GATEWAY;
        this.processingQueue = [];
    }

    /**
     * Process multimodal input with Astra
     */
    async process(input: AstraInput): Promise<AstraOutput> {
        const startTime = performance.now();

        console.log('[Astra] Processing', input.type, 'input');

        try {
            let output: AstraOutput;

            switch (input.type) {
                case 'audio':
                    output = await this.processAudio(input);
                    break;
                case 'image':
                    output = await this.processImage(input);
                    break;
                case 'video':
                    output = await this.processVideo(input);
                    break;
                case 'text':
                    output = await this.processText(input);
                    break;
                default:
                    throw new Error(`Unsupported input type: ${input.type}`);
            }

            const processingTime = performance.now() - startTime;
            output.processingTime = processingTime;

            console.log('[Astra] Processed in', processingTime.toFixed(2), 'ms');

            return output;

        } catch (error) {
            console.error('[Astra] Processing error:', error);
            throw error;
        }
    }

    /**
     * Process audio input (voice commands, auscultation)
     */
    private async processAudio(input: AstraInput): Promise<AstraOutput> {
        // TODO: Implement actual Astra audio processing
        // For now, use Gemini with text transcription

        const audioBlob = input.data as Blob;

        // Simulate transcription (in production, use Speech-to-Text API)
        const transcription = await this.transcribeAudio(audioBlob);

        return {
            analysis: `Audio transcription: ${transcription}`,
            entities: [],
            suggestions: [],
            confidence: 0.85,
            processingTime: 0,
            timestamp: new Date()
        };
    }

    /**
     * Process image input (wounds, lesions, medications)
     */
    private async processImage(input: AstraInput): Promise<AstraOutput> {
        const imageBlob = input.data as Blob;

        // Convert image to base64
        const base64Image = await this.blobToBase64(imageBlob);

        const prompt = `
Analyze this medical image in the context of home healthcare.

Clinical Context:
- Patient ID: ${input.context.patientId}
- Visit ID: ${input.context.visitId}
- Purpose: ${input.context.purpose}

Provide:
1. Description of what you see
2. Relevant medical findings
3. Suggestions for the healthcare professional
4. Any concerns or red flags
        `.trim();

        try {
            const formData = new FormData();
            formData.append('media', imageBlob, 'frame.jpg');
            formData.append('type', 'multimodal_assessment');
            formData.append('app', 'camus');
            formData.append('priority', 'normal');
            formData.append('prompt', prompt);

            const response = await axios.post(`${this.baseUrl}/v1/copilot/invoke`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const analysis = response.data.analysis;

            return {
                analysis,
                entities: this.extractEntities(analysis),
                suggestions: this.extractSuggestions(analysis),
                confidence: 0.90,
                processingTime: 0,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('[Astra] Image processing error:', error);
            throw error;
        }
    }

    /**
     * Process video input (mobility assessment, gait analysis)
     */
    private async processVideo(input: AstraInput): Promise<AstraOutput> {
        // TODO: Implement video processing
        // For now, extract frames and analyze as images

        return {
            analysis: 'Video processing not yet implemented',
            entities: [],
            suggestions: [],
            confidence: 0,
            processingTime: 0,
            timestamp: new Date()
        };
    }

    /**
     * Process text input
     */
    private async processText(input: AstraInput): Promise<AstraOutput> {
        const text = input.data as string;

        const prompt = `
Analyze this clinical note or observation:

"${text}"

Clinical Context:
- Patient ID: ${input.context.patientId}
- Visit ID: ${input.context.visitId}
- Purpose: ${input.context.purpose}

Extract:
1. Medical entities (symptoms, diagnoses, medications, procedures)
2. Relevant findings
3. Suggestions for follow-up
        `.trim();

        try {
            const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Astra API error: ${response.statusText}`);
            }

            const data = await response.json();
            const analysis = data.candidates[0].content.parts[0].text;

            return {
                analysis,
                entities: this.extractEntities(analysis),
                suggestions: this.extractSuggestions(analysis),
                confidence: 0.88,
                processingTime: 0,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('[Astra] Text processing error:', error);
            throw error;
        }
    }

    /**
     * Transcribe audio to text
     */
    private async transcribeAudio(audioBlob: Blob): Promise<string> {
        // TODO: Implement actual speech-to-text
        // For now, return placeholder
        return '[Audio transcription placeholder]';
    }

    /**
     * Convert blob to base64
     */
    private async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                // Remove data URL prefix
                const base64Data = base64.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Extract medical entities from analysis
     */
    private extractEntities(analysis: string): MedicalEntity[] {
        const entities: MedicalEntity[] = [];
        const lowerAnalysis = analysis.toLowerCase();

        // Extract symptoms
        const symptomPatterns = [
            /síntoma[s]?[:\s]+([^\n.]+)/gi,
            /symptom[s]?[:\s]+([^\n.]+)/gi,
            /presenta[:\s]+([^\n.]+)/gi,
            /refiere[:\s]+([^\n.]+)/gi
        ];
        symptomPatterns.forEach(pattern => {
            const matches = analysis.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    entities.push({
                        type: 'symptom',
                        text: match[1].trim(),
                        confidence: 0.85
                    });
                }
            }
        });

        // Extract medications
        const medPatterns = [
            /medicamento[s]?[:\s]+([^\n.]+)/gi,
            /medication[s]?[:\s]+([^\n.]+)/gi,
            /fármaco[s]?[:\s]+([^\n.]+)/gi
        ];
        medPatterns.forEach(pattern => {
            const matches = analysis.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    entities.push({
                        type: 'medication',
                        text: match[1].trim(),
                        confidence: 0.90
                    });
                }
            }
        });

        // Extract diagnoses
        const diagPatterns = [
            /diagnóstico[s]?[:\s]+([^\n.]+)/gi,
            /diagnosis[:\s]+([^\n.]+)/gi,
            /condición[es]*[:\s]+([^\n.]+)/gi
        ];
        diagPatterns.forEach(pattern => {
            const matches = analysis.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    entities.push({
                        type: 'diagnosis',
                        text: match[1].trim(),
                        confidence: 0.80
                    });
                }
            }
        });

        // Extract vital signs
        const vitalPatterns = [
            /(\d+)\/(\d+)\s*mmhg/gi, // Blood pressure
            /(\d+)\s*bpm/gi, // Heart rate
            /(\d+\.?\d*)\s*°c/gi, // Temperature
            /(\d+)%\s*spo2/gi // Oxygen saturation
        ];
        vitalPatterns.forEach(pattern => {
            const matches = analysis.matchAll(pattern);
            for (const match of matches) {
                entities.push({
                    type: 'finding',
                    text: match[0].trim(),
                    confidence: 0.95
                });
            }
        });

        return entities;
    }

    /**
     * Extract suggestions from analysis
     */
    private extractSuggestions(analysis: string): Suggestion[] {
        const suggestions: Suggestion[] = [];

        // Extract suggestions from common patterns
        const suggestionPatterns = [
            /sugerencia[s]?[:\s]+([^\n]+)/gi,
            /suggestion[s]?[:\s]+([^\n]+)/gi,
            /recomendación[es]*[:\s]+([^\n]+)/gi,
            /recommendation[s]?[:\s]+([^\n]+)/gi,
            /considerar[:\s]+([^\n]+)/gi,
            /consider[:\s]+([^\n]+)/gi
        ];

        suggestionPatterns.forEach(pattern => {
            const matches = analysis.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    const text = match[1].trim();

                    // Determine priority based on keywords
                    let priority: 'high' | 'medium' | 'low' = 'medium';
                    const lowerText = text.toLowerCase();
                    if (lowerText.includes('urgente') || lowerText.includes('inmediato') ||
                        lowerText.includes('urgent') || lowerText.includes('immediate')) {
                        priority = 'high';
                    } else if (lowerText.includes('opcional') || lowerText.includes('optional')) {
                        priority = 'low';
                    }

                    suggestions.push({
                        type: 'action',
                        text,
                        priority
                    });
                }
            }
        });

        // Extract red flags/warnings
        const warningPatterns = [
            /⚠️\s*([^\n]+)/gi,
            /advertencia[s]?[:\s]+([^\n]+)/gi,
            /warning[s]?[:\s]+([^\n]+)/gi,
            /alerta[s]?[:\s]+([^\n]+)/gi
        ];

        warningPatterns.forEach(pattern => {
            const matches = analysis.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    suggestions.push({
                        type: 'warning',
                        text: match[1].trim(),
                        priority: 'high'
                    });
                }
            }
        });

        return suggestions;
    }

    /**
     * Batch process multiple inputs
     */
    async processBatch(inputs: AstraInput[]): Promise<AstraOutput[]> {
        const results = await Promise.all(
            inputs.map(input => this.process(input))
        );
        return results;
    }
}

export const astraService = new AstraService();
