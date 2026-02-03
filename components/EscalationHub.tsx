import React, { useState } from 'react';
import { AldebaranPanel } from './AldebaranPanel';
import type { PatientContext } from '../types/copilot';

interface EscalationPortalProps {
    patientContext: PatientContext;
}

export const EscalationHub: React.FC<EscalationPortalProps> = ({ patientContext }) => {
    const [activeCore, setActiveCore] = useState<'NONE' | 'ANTARES' | 'PHOENIX' | 'ORION'>('NONE');

    if (activeCore === 'ANTARES') {
        return <AldebaranPanel patientContext={patientContext} onEnd={() => setActiveCore('NONE')} />;
    }

    // Mock implementations for Phoenix/Orion redirects
    if (activeCore === 'PHOENIX') {
        return (
            <div className="fixed inset-0 bg-black z-[250] flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-6">🏥</div>
                <h1 className="text-4xl font-black text-cyan-400 mb-4">REDIRECCIÓN A PHOENIX</h1>
                <p className="text-xl text-gray-400 mb-8">Abriendo Clínica de Heridas Astra...</p>
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <button
                    onClick={() => setActiveCore('NONE')}
                    className="mt-12 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                >
                    Volver a Camus
                </button>
            </div>
        );
    }

    if (activeCore === 'ORION') {
        return (
            <div className="fixed inset-0 bg-black z-[250] flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-6">⚡</div>
                <h1 className="text-4xl font-black text-amber-400 mb-4">REDIRECCIÓN A ORION</h1>
                <p className="text-xl text-gray-400 mb-8">Activando Triage de Urgencias Alfa/Omega...</p>
                <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                <button
                    onClick={() => setActiveCore('NONE')}
                    className="mt-12 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                >
                    Volver a Camus
                </button>
            </div>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {/* ANTARES - Emergency PCR */}
            <button
                onClick={() => setActiveCore('ANTARES')}
                className="group relative w-16 h-16 bg-red-600/10 border-2 border-red-500/50 rounded-xl hover:bg-red-500/20 transition-all flex flex-col items-center justify-center"
                title="Antares - RCP"
            >
                <div className="absolute inset-0 bg-red-500 opacity-20 blur-xl animate-pulse rounded-xl"></div>
                <span className="text-2xl relative z-10 text-red-500">🚨</span>
                <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter relative z-10">Antares</span>
            </button>

            {/* PHOENIX - Wound Clinic */}
            <button
                onClick={() => setActiveCore('PHOENIX')}
                className="group relative w-16 h-16 bg-cyan-600/10 border-2 border-cyan-500/50 rounded-xl hover:bg-cyan-500/20 transition-all flex flex-col items-center justify-center"
                title="Phoenix - Heridas"
            >
                <span className="text-2xl relative z-10 text-cyan-500">🩹</span>
                <span className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter relative z-10">Phoenix</span>
            </button>

            {/* ORION - Triage */}
            <button
                onClick={() => setActiveCore('ORION')}
                className="group relative w-16 h-16 bg-amber-600/10 border-2 border-amber-500/50 rounded-xl hover:bg-amber-500/20 transition-all flex flex-col items-center justify-center"
                title="Orion - Urgencias"
            >
                <span className="text-2xl relative z-10 text-amber-500">💊</span>
                <span className="text-[8px] font-black text-amber-400 uppercase tracking-tighter relative z-10">Orion</span>
            </button>
        </div>
    );
};
