/**
 * InferenceEngine.ts
 * Core mathematical logic for Health Operational Capacity.
 */

export interface CapacityScenario {
    k: number;
    etpMedicina: number;
    etpEnfermeria: number;
    etpAuxiliar: number;
    totalEtp: number;
}

export interface InferenceResult {
    modelType: 'Continuity' | 'Reactivity' | 'Logistics';
    scenarios: {
        minimum: CapacityScenario;
        excellence: CapacityScenario;
        gap: {
            difference: number;
            percentage: number;
        };
    };
    riskAlert?: string;
}

export const InferenceEngine = {
    /**
     * Standard ETP Calculation Formula:
     * ETP = sum(Visits * (T_visita * K) + Visits * T_traslado) / T_productivo
     */
    calculateETP: (
        visits: number,
        tVisita: number,
        tTraslado: number,
        tProductivo: number,
        k: number = 1.0
    ): number => {
        const totalMinutes = (visits * (tVisita * k)) + (visits * tTraslado);
        const etp = totalMinutes / tProductivo;
        return Math.round(etp * 10) / 10;
    },

    /**
     * Erlang C for Reactivity/Emergency models (EMI)
     * Simplified version for capacity inference
     */
    calculateErlangC: (arrivalRate: number, serviceTime: number, agents: number): number => {
        const intensity = arrivalRate * serviceTime;
        // Simplified probability of waiting logic
        if (agents <= intensity) return 1.0; // Overloaded
        return intensity / agents; // Occupancy rate
    },

    /**
     * Zoned Density Calculation for Logistics models
     */
    calculateZonedETP: (population: number, density: number, factorK: number): number => {
        const baseVisits = population * 0.15; // 15% coverage assumption
        const travelFactor = 1 / density; // High density = low travel time
        return (baseVisits * factorK) * travelFactor;
    }
};
