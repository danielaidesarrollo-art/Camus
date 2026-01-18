/**
 * Aldebaran Panel - CPR Assistant
 * Shared emergency protocol for CAMUS and ORION
 */

import React, { useState, useEffect } from 'react';
import { danielVoiceService } from '../services/danielVoiceService';
import type { PatientContext, CPREvent, CPRCycle } from '../types/copilot';

interface AldebaranPanelProps {
    patientContext: PatientContext;
    onEnd: () => void;
}

export const AldebaranPanel: React.FC<AldebaranPanelProps> = ({ patientContext, onEnd }) => {
    const [cycleNumber, setCycleNumber] = useState(1);
    const [compressions, setCompressions] = useState(0);
    const [ventilations, setVentilations] = useState(0);
    const [isCompressing, setIsCompressing] = useState(false);
    const [cycleTime, setCycleTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [cprEvent, setCprEvent] = useState<CPREvent>({
        emergencyId: `emergency_${Date.now()}`,
        startTime: new Date(),
        cycles: [],
        medications: [],
        outcome: null,
        notes: ''
    });

    // Metronome for compressions (100-120/min = ~500-600ms per compression)
    useEffect(() => {
        if (isCompressing) {
            const interval = setInterval(() => {
                setCompressions(prev => prev + 1);
                // Play metronome sound
                playMetronome();
            }, 550); // ~109 compressions per minute

            return () => clearInterval(interval);
        }
    }, [isCompressing]);

    // Cycle timer (2 minutes = 120 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            setCycleTime(prev => prev + 1);
            setTotalTime(prev => prev + 1);

            // Alert every 2 minutes
            if (cycleTime > 0 && cycleTime % 120 === 0) {
                handleCycleComplete();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [cycleTime]);

    // Initial voice guidance
    useEffect(() => {
        danielVoiceService.speak(
            'Aldebaran activado. Iniciando protocolo de RCP. Comience con 30 compresiones torácicas.',
            'immediate'
        );
    }, []);

    const playMetronome = () => {
        // Simple beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
    };

    const handleCycleComplete = async () => {
        const cycle: CPRCycle = {
            cycleNumber,
            startTime: new Date(Date.now() - 120000),
            compressions,
            ventilations,
            quality: compressions >= 100 && compressions <= 120 ? 'good' : 'fair'
        };

        setCprEvent(prev => ({
            ...prev,
            cycles: [...prev.cycles, cycle]
        }));

        setCycleNumber(prev => prev + 1);
        setCompressions(0);
        setVentilations(0);
        setCycleTime(0);

        await danielVoiceService.speak(
            `Ciclo ${cycleNumber} completado. Verifique pulso. Si no hay pulso, continúe con el siguiente ciclo.`,
            'immediate'
        );
    };

    const handleVentilationComplete = () => {
        setVentilations(prev => prev + 1);
        if (ventilations + 1 === 2) {
            danielVoiceService.speak('Ventilaciones completadas. Continúe con compresiones.', 'normal');
        }
    };

    const handleEndCPR = async (outcome: 'rosc' | 'ongoing' | 'unsuccessful') => {
        const finalEvent: CPREvent = {
            ...cprEvent,
            endTime: new Date(),
            outcome
        };

        // Save event to localStorage
        const events = JSON.parse(localStorage.getItem('cpr_events') || '[]');
        events.push(finalEvent);
        localStorage.setItem('cpr_events', JSON.stringify(events));

        await danielVoiceService.speak('Evento de RCP finalizado y registrado.', 'normal');
        onEnd();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center p-4">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-red-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-3xl animate-pulse">🚨</div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">ALDEBARAN</h1>
                        <p className="text-xs text-red-100">Asistente de RCP Activado</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-white">{formatTime(totalTime)}</div>
                    <div className="text-xs text-red-100">Tiempo Total</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-4xl mt-20 grid grid-cols-2 gap-4">
                {/* Left Panel - Instructions */}
                <div className="bg-gray-900 rounded-xl p-6 border-2 border-red-500">
                    <h2 className="text-xl font-bold text-white mb-4">Ciclo {cycleNumber}</h2>

                    {/* Cycle Timer */}
                    <div className="bg-red-500/20 rounded-lg p-4 mb-4 text-center">
                        <div className="text-4xl font-bold text-white mb-1">
                            {formatTime(cycleTime)}
                        </div>
                        <div className="text-xs text-red-300">Tiempo del Ciclo (2 min)</div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
                            <div
                                className="bg-red-500 h-2 rounded-full transition-all"
                                style={{ width: `${(cycleTime / 120) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Compressions */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-bold">Compresiones</span>
                            <span className="text-3xl font-bold text-cyan-400">{compressions}/30</span>
                        </div>
                        <button
                            onClick={() => setIsCompressing(!isCompressing)}
                            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${isCompressing
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
                                }`}
                        >
                            {isCompressing ? '⏸ Pausar' : '▶ Iniciar Compresiones'}
                        </button>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            100-120 por minuto • 5-6 cm de profundidad
                        </p>
                    </div>

                    {/* Ventilations */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-bold">Ventilaciones</span>
                            <span className="text-3xl font-bold text-purple-400">{ventilations}/2</span>
                        </div>
                        <button
                            onClick={handleVentilationComplete}
                            className="w-full py-4 rounded-lg font-bold text-lg bg-purple-500 text-white hover:bg-purple-600 transition-all"
                        >
                            Ventilación Completada
                        </button>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            1 segundo por ventilación • Elevación visible del tórax
                        </p>
                    </div>

                    {/* Cycle Info */}
                    <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300">
                        <p className="mb-1">📋 <strong>Protocolo:</strong> 30 compresiones : 2 ventilaciones</p>
                        <p className="mb-1">⏱️ <strong>Ciclo:</strong> ~2 minutos</p>
                        <p>🔄 <strong>Verificar pulso:</strong> Cada 2 minutos</p>
                    </div>
                </div>

                {/* Right Panel - Patient Info & Actions */}
                <div className="space-y-4">
                    {/* Patient Info */}
                    <div className="bg-gray-900 rounded-xl p-6 border-2 border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-3">Información del Paciente</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Edad:</span>
                                <span className="text-white font-bold">{patientContext.age} años</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Género:</span>
                                <span className="text-white font-bold">{patientContext.gender}</span>
                            </div>
                            {patientContext.allergies.length > 0 && (
                                <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                                    <p className="text-yellow-400 text-xs font-bold">⚠️ Alergias:</p>
                                    {patientContext.allergies.map((a, i) => (
                                        <p key={i} className="text-yellow-300 text-xs">• {a.allergen}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Emergency Medications */}
                    <div className="bg-gray-900 rounded-xl p-6 border-2 border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-3">💊 Medicamentos de Emergencia</h3>
                        <div className="space-y-2 text-xs">
                            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                                <p className="text-blue-400 font-bold">Epinefrina</p>
                                <p className="text-gray-400">1 mg IV cada 3-5 min</p>
                            </div>
                            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                                <p className="text-blue-400 font-bold">Amiodarona</p>
                                <p className="text-gray-400">300 mg IV en bolo</p>
                            </div>
                            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                                <p className="text-blue-400 font-bold">Atropina</p>
                                <p className="text-gray-400">1 mg IV (si bradicardia)</p>
                            </div>
                        </div>
                    </div>

                    {/* Cycle History */}
                    <div className="bg-gray-900 rounded-xl p-6 border-2 border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-3">📊 Historial de Ciclos</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {cprEvent.cycles.map((cycle, index) => (
                                <div key={index} className="p-2 bg-gray-800 rounded text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Ciclo {cycle.cycleNumber}</span>
                                        <span className={`font-bold ${cycle.quality === 'good' ? 'text-green-400' : 'text-yellow-400'
                                            }`}>
                                            {cycle.quality === 'good' ? '✓' : '~'} {cycle.quality}
                                        </span>
                                    </div>
                                    <div className="text-gray-500">
                                        {cycle.compressions} compresiones • {cycle.ventilations} ventilaciones
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-900 p-4 border-t-2 border-gray-700">
                <div className="max-w-4xl mx-auto flex gap-4">
                    <button
                        onClick={() => handleEndCPR('rosc')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all"
                    >
                        ✓ ROSC - Retorno de Circulación
                    </button>
                    <button
                        onClick={() => handleEndCPR('ongoing')}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition-all"
                    >
                        ⏸ Pausar - Traslado
                    </button>
                    <button
                        onClick={() => handleEndCPR('unsuccessful')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all"
                    >
                        ✕ Finalizar RCP
                    </button>
                </div>
            </div>
        </div>
    );
};
