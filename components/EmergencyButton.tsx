import React, { useState } from 'react';
import { AldebaranPanel } from './AldebaranPanel';
import type { PatientContext } from '../types/copilot';

export const EmergencyButton: React.FC<{ patientContext: PatientContext }> = ({ patientContext }) => {
    const [isActive, setIsActive] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    if (isActive) return <AldebaranPanel patientContext={patientContext} onEnd={() => setIsActive(false)} />;

    return (
        <>
            <div className="fixed top-4 right-4 z-50">
                <button onClick={() => setShowConfirm(true)} className="relative group">
                    <div className="absolute inset-0 bg-red-500 opacity-30 blur-xl rounded-lg animate-pulse"></div>
                    <div className="relative bg-red-500/10 backdrop-blur-sm border-2 border-red-500/50 rounded-lg p-4 hover:bg-red-500/20 transition-all">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-white transform -rotate-45"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className="text-4xl">🚨</div>
                            <div className="text-xs font-bold text-red-400 uppercase text-center">Romper el<br />Cristal</div>
                        </div>
                    </div>
                </button>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#0B0E14] border-2 border-red-500 rounded-xl p-8 max-w-md">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h2 className="text-2xl font-bold text-white mb-2">ACTIVAR EMERGENCIA</h2>
                            <p className="text-red-400 font-bold">Aldebaran - RCP</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-500/20 text-gray-300 font-bold py-3 rounded-lg">Cancelar</button>
                            <button onClick={() => { setShowConfirm(false); setIsActive(true); }} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-lg">ACTIVAR</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
