import { GoogleGenAI } from "@google/genai";

// Configuration for models
const ADMIN_MODEL = "gemini-2.0-flash"; // Excellent for logistics and speed
const CLINICAL_MODEL = "med-gemma"; // Specialized for clinical inference
const CAPACITY_MODEL = "gemini-2.0-flash"; // High precision for structured output

// Fallback logic for API KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_ASTRA_API_KEY ||
    "";

// Defensive initialization to prevent top-level crashes if API_KEY is missing
let genAI: GoogleGenAI | null = null;
try {
    if (API_KEY) {
        genAI = new GoogleGenAI({ apiKey: API_KEY });
    } else {
        console.warn("AI Service: Missing API Key. Inference methods will fail.");
    }
} catch (e) {
    console.error("AI Service: Failed to initialize GoogleGenAI:", e);
}

const CAMUS_CAPACITY_PROMPT = `
Actúa como un motor de optimización de recursos de salud. Tu objetivo es transformar modelos de atención médica (PDF/Docs) y censos de pacientes (Datasets) en cálculos precisos de Equivalentes a Tiempo Completo (ETP) utilizando tres modelos lógicos predefinidos: Continuidad (Post-Hosp), Reactividad (Pre-Hosp) y Logística (Territorial).

Variables de Inferencia:
- Factor K (Humanización): Multiplicador de tiempo clínico (Rango 1.0 a 1.3).
- Productividad: Tiempo de jornada menos traslados y administración.
- Estratificación: Segmentación automática de pacientes por riesgo clínico.

Lógica de Extracción (Mapping):
"Al procesar documentos de 'Modelo de Atención', extrae y prioriza:
1. Frecuencias de visita por rol (Ej. Diario, cada 72h, mensual).
2. Duración estándar de la actividad (Ej. 45 min atención + 15 min admin).
3. Criterios de ingreso/egreso para proyectar rotación (churn rate)."

Lógica de Cálculo (Algoritmo):
"Aplica la fórmula: $ETP = \\frac{\\sum (Visitas \\times (T_{visita} \\times K)) + (Visitas \\times T_{traslado})}{T_{productivo}}$.
- Si detectas el modelo EMI, conmuta a Erlang C.
- Si detectas el modelo Secretaría, aplica Zonificación por Densidad."

Instrucción de Salida (Output):
"Genera siempre tres escenarios:
1. Mínimo Operativo: (K=1.0).
2. Excelente/Acreditación: (K=1.15 a 1.25).
3. Brecha de Capacidad: Comparativa entre ETP Requerido vs. ETP Actual disponible."

Debe devolver un objeto JSON con la siguiente estructura:
{
  "model_type": "string (Continuity | Reactivity | Logistics)",
  "etp_required": {
    "medicina": number,
    "enfermeria_jefe": number,
    "auxiliares": number
  },
  "scenarios": {
    "minimum": { "k": 1.0, "total_etp": number },
    "excellence": { "k": number, "total_etp": number },
    "gap": { "difference": number, "percentage": number }
  },
  "risk_alert": "string (alert message if overload detected)",
  "insights": ["array of strategic findings"]
}
`;

export interface AIResponse {
    text: string;
    json?: any;
    groundingMetadata?: any;
    error?: string;
}

export const aiService = {
    /**
     * Run capacity inference using the specialized Camus prompt.
     */
    runCapacityInference: async (modelDocument: string, censusData: string): Promise<AIResponse> => {
        if (!genAI) return { text: "", error: "AI Engine not initialized. Please check API Key." };

        try {
            const prompt = `${CAMUS_CAPACITY_PROMPT}\n\nDOCUMENTO MODELO ATENCIÓN:\n${modelDocument}\n\nDATASET CENSO PACIENTES:\n${censusData}\n\nPROCESAR Y GENERAR INFERENCIA EN FORMATO JSON:`;

            const response = await genAI.models.generateContent({
                model: CAPACITY_MODEL,
                contents: prompt,
                config: {
                    response_mime_type: "application/json"
                }
            });

            const text = response.text || "{}";
            try {
                const json = JSON.parse(text);
                return { text, json };
            } catch (e) {
                return { text, error: "Error al parsear el resultado JSON de la IA" };
            }
        } catch (error: any) {
            console.error("Capacity Inference Error:", error);
            return { text: "", error: error.message || "Error en motor de inferencia de capacidad" };
        }
    },

    /**
     * Handles administrative and logistics queries using Gemini.
     */
    runAdministrativeInference: async (prompt: string, options?: any): Promise<AIResponse> => {
        if (!genAI) return { text: "", error: "AI Engine not initialized." };

        try {
            const response = await genAI.models.generateContent({
                model: ADMIN_MODEL,
                contents: prompt,
                config: {
                    tools: options?.tools
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
        if (!genAI) return { text: "", error: "AI Engine not initialized." };

        try {
            const systemInstruction = `Eres un asistente clínico avanzado especializado en atención domiciliaria (PAD). 
            Analiza los datos del paciente y proporciona recomendaciones médico-administrativas.
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

