/**
 * Copilot Panel Component
 * Main interface for AI Copilot interaction
 */

import React, { useState, useEffect } from 'react';
import { copilotService } from '../services/copilotService';
import { danielVoiceService } from '../services/danielVoiceService';
import { medGemmaService } from '../services/medGemmaService';
import type { CopilotRecommendation, PatientContext, DrugInteractionAlert } from '../types/copilot';
import { GlassCard, GlassButton } from './ui/GlassComponents';

interface CopilotPanelProps {
    patientContext: PatientContext;
    onClose?: () => void;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({ patientContext, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [query, setQuery] = useState('');
    const [recommendation, setRecommendation] = useState<CopilotRecommendation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [drugAlerts, setDrugAlerts] = useState<DrugInteractionAlert[]>([]);

    // Check for drug interactions on mount
    useEffect(() => {
        checkDrugInteractions();
    }, [patientContext.medications]);

    const checkDrugInteractions = async () => {
        if (patientContext.medications.length >= 2) {
            const alerts = await medGemmaService.checkInteractions(patientContext.medications);
            setDrugAlerts(alerts);
        }
    };

    const handleVoiceInput = async () => {
        setIsListening(true);

        // Use Web Speech API for voice input
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'es-ES';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = async (event: any) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                await invokeCopilot(transcript, 'voice');
                setIsListening(false);
            };

            recognition.onerror = () => {
                setIsListening(false);
            };

            recognition.start();
        } else {
            alert('Reconocimiento de voz no soportado en este navegador');
            setIsListening(false);
        }
    };

    const handleTextInput = async () => {
        if (!query.trim()) return;
        await invokeCopilot(query, 'text');
    };

    const invokeCopilot = async (text: string, method: 'voice' | 'text') => {
        setIsLoading(true);

        try {
            const rec = await copilotService.invoke({
                method,
                trigger: text,
                context: patientContext,
                timestamp: new Date()
            });

            setRecommendation(rec);

            // Speak the recommendation using Daniel's voice
            await danielVoiceService.speak(
                `Recomendación: ${rec.recommendation}`,
                'normal'
            );

        } catch (error) {
            console.error('Error invoking copilot:', error);
            alert('Error al consultar el copiloto. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptRecommendation = async () => {
        if (!recommendation) return;

        await copilotService.recordDecision({
            recommendationId: recommendation.id,
            accepted: true,
            modified: false,
            timestamp: new Date(),
            professionalId: 'current_user', // TODO: Get from auth context
            professionalName: 'Professional Name'
        });

        await danielVoiceService.speak('Decisión registrada correctamente', 'normal');
        setRecommendation(null);
        setQuery('');
    };

    const handleRejectRecommendation = async () => {
        if (!recommendation) return;

        await copilotService.recordDecision({
            recommendationId: recommendation.id,
            accepted: false,
            modified: false,
            justification: 'Rechazada por el profesional',
            timestamp: new Date(),
            professionalId: 'current_user',
            professionalName: 'Professional Name'
        });

        setRecommendation(null);
        setQuery('');
    };

    return (
        <div className="fixed right-4 bottom-4 z-50">
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#A855F7] shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group relative"
                >
                    <div className="absolute inset-0 rounded-full bg-[#00E5FF] opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                    <span className="text-3xl relative z-10">🤖</span>

                    {/* Badge for drug alerts */}
                    {drugAlerts.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                            {drugAlerts.length}
                        </div>
                    )}
                </button>
            )}

            {/* Copilot Panel */}
            {isOpen && (
                <GlassCard className="w-96 max-h-[600px] overflow-y-auto !p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🤖</span>
                            <h3 className="text-xl font-bold text-white">Copiloto Daniel</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Drug Interaction Alerts */}
                    {drugAlerts.length > 0 && (
                        <div className="mb-4 space-y-2">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                ⚠️ Alertas de Interacciones
                            </h4>
                            {drugAlerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border ${alert.severity === 'critical'
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : alert.severity === 'major'
                                            ? 'bg-orange-500/10 border-orange-500/30'
                                            : 'bg-yellow-500/10 border-yellow-500/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase">
                                            {alert.severity === 'critical' ? '🔴' : alert.severity === 'major' ? '🟠' : '🟡'}
                                            {' '}{alert.severity}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-300">
                                        {alert.drugs.map(d => d.name).join(' + ')}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {alert.interaction.substring(0, 100)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleTextInput()}
                                placeholder="Pregunta al copiloto..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleVoiceInput}
                                disabled={isLoading || isListening}
                                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${isListening
                                    ? 'bg-red-500 animate-pulse'
                                    : 'bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30'
                                    }`}
                            >
                                🎤
                            </button>
                        </div>
                        <button
                            onClick={handleTextInput}
                            disabled={isLoading || !query.trim()}
                            className="w-full mt-2 bg-gradient-to-r from-[#00E5FF] to-[#A855F7] text-white font-bold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isLoading ? 'Consultando...' : 'Consultar'}
                        </button>
                    </div>

                    {/* Recommendation Display */}
                    {recommendation && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">💡</span>
                                <h4 className="text-sm font-bold text-white uppercase">Recomendación</h4>
                                <span className="ml-auto text-xs text-[#00E5FF]">
                                    {recommendation.confidence}% confianza
                                </span>
                            </div>

                            <p className="text-sm text-gray-300 mb-4">
                                {recommendation.recommendation}
                            </p>

                            {recommendation.warnings.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="text-xs font-bold text-yellow-400 mb-2">⚠️ Advertencias:</h5>
                                    {recommendation.warnings.map((warning, index) => (
                                        <p key={index} className="text-xs text-gray-400 mb-1">
                                            • {warning.message}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {recommendation.alternatives.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="text-xs font-bold text-[#00E5FF] mb-2">Alternativas:</h5>
                                    {recommendation.alternatives.map((alt, index) => (
                                        <p key={index} className="text-xs text-gray-400 mb-1">
                                            • {alt.option}
                                        </p>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleAcceptRecommendation}
                                    className="flex-1 bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-2 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                                >
                                    ✓ Aceptar
                                </button>
                                <button
                                    onClick={handleRejectRecommendation}
                                    className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                                >
                                    ✕ Rechazar
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 mt-3 text-center italic">
                                La decisión final es siempre del profesional
                            </p>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                        <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 text-xs text-white transition-colors">
                            📋 Protocolos
                        </button>
                        <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 text-xs text-white transition-colors">
                            📊 Historial
                        </button>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};
