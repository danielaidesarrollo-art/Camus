import { GoogleGenAI } from "@google/genai";

// Configuration for models
const ADMIN_MODEL = "gemini-2.0-flash"; // Excellent for logistics and speed
const CLINICAL_MODEL = "med-gemma"; // Specialized for clinical inference

// Use the API key defined in vite.config.ts via 'define'
const API_KEY = (process.env as any).GEMINI_API_KEY || "REPLACED_WITH_ENV";

const genAI = new GoogleGenAI({ apiKey: API_KEY });

export interface AIResponse {
    text: string;
    groundingMetadata?: any;
    error?: string;
}

export const aiService = {
    /**
     * Handles administrative and logistics queries using Gemini Pro (Flash).
     */
    runAdministrativeInference: async (prompt: string, options?: any): Promise<AIResponse> => {
        try {
            const response = await genAI.models.generateContent({
                model: ADMIN_MODEL,
                contents: prompt,
                config: {
                    tools: [{ googleMaps: {} } as any],
                    toolConfig: options?.toolConfig
                }
            });

            return {
                text: response.text || "No se pudo generar una respuesta.",
                groundingMetadata: (response as any).candidates?.[0]?.groundingMetadata
            };
        } catch (error: any) {
            console.error("Administrative Inference Error:", error);
            return { text: "", error: error.message || "Error en inferencia administrativa" };
        }
    },

    /**
     * Handles clinical queries using the specialized Med-Gemma model.
     */
    runClinicalInference: async (prompt: string, context?: string): Promise<AIResponse> => {
        try {
            const systemInstruction = `Eres un asistente clínico avanzado especializado en atención domiciliaria (PAD). 
            Utilizas el modelo Med-Gemma para proporcionar análisis basados en evidencia médica.
            Analiza los datos del paciente y proporciona recomendaciones, posibles alertas o resúmenes de evolución.
            No reemplazas el juicio médico, eres una herramienta de apoyo.`;

            const fullPrompt = context
                ? `${systemInstruction}\n\nContexto del Paciente:\n${context}\n\nConsulta:\n${prompt}`
                : `${systemInstruction}\n\nConsulta:\n${prompt}`;

            const response = await genAI.models.generateContent({
                model: CLINICAL_MODEL,
                contents: fullPrompt
            });

            return {
                text: response.text || "No se pudo generar respuesta clínica."
            };
        } catch (error: any) {
            console.error("Clinical Inference Error:", error);
            return { text: "", error: error.message || "Error en inferencia clínica" };
        }
    }
};

