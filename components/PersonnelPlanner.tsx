import React, { useState, useMemo } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './ui/GlassComponents.tsx';
import { Icons } from '../constants.tsx';
import { aiService } from '../utils/aiService';
import './PersonnelPlanner.css';

interface standardTimes {
    initialValoracion: number;
    followUpAntibiotic: number;
    simpleHealing: number;
    medicalFollowUp: number;
    education: number;
    hcRegistration: number;
    adminCoordination: number;
    commuteTime: number;
}

const DEFAULT_TIMES: standardTimes = {
    initialValoracion: 60,
    followUpAntibiotic: 45,
    simpleHealing: 30,
    medicalFollowUp: 40,
    education: 30,
    hcRegistration: 15,
    adminCoordination: 10,
    commuteTime: 45
};

const PersonnelPlanner: React.FC = () => {
    // State for inputs
    const [census, setCensus] = useState(100);
    const [productiveHours, setProductiveHours] = useState(6.5);
    const [times, setTimes] = useState<standardTimes>(DEFAULT_TIMES);

    // State for visit distribution (percentage of patients needing each type)
    const [distInitial, setDistInitial] = useState(10); // 10% new admissions per day
    const [distAntibiotic, setDistAntibiotic] = useState(60);
    const [distHealing, setDistHealing] = useState(30);

    // AI Inference State
    const [modelDoc, setModelDoc] = useState('');
    const [censusData, setCensusData] = useState('');
    const [inferenceResult, setInferenceResult] = useState<any>(null);
    const [isInfereing, setIsInfereing] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'model' | 'census') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        try {
            let text = '';
            if (file.type === 'application/pdf') {
                const { extractTextFromPdf } = await import('../utils/pdfParser');
                text = await extractTextFromPdf(file);
            } else {
                text = await file.text();
            }

            if (target === 'model') setModelDoc(text);
            else setCensusData(text);
        } catch (error) {
            console.error('Error parsing file:', error);
            alert('Error al procesar el archivo. Asegúrese de que sea un PDF o texto válido.');
        } finally {
            setIsParsing(false);
        }
    };

    // ETP Calculation Logic
    const calculations = useMemo(() => {
        const prodMinutes = productiveHours * 60;

        // 1. Calculate workload for Medicine
        // Visits: Initial + Medical Follow-up
        const medVisits = (census * (distInitial / 100)) + (census * 0.2); // assuming 20% need medical follow-up
        const medWorkload = (medVisits * (times.initialValoracion + times.hcRegistration)) +
            (medVisits * times.commuteTime) +
            (census * times.adminCoordination);
        const etpMedicine = medWorkload / prodMinutes;

        // 2. Calculate workload for Nursing (Jefes)
        // Visits: Initial + Follow-up/Antibiotic + Education
        const nurseVisits = (census * (distInitial / 100)) + (census * (distAntibiotic / 100)) + (census * 0.1);
        const nurseWorkload = (nurseVisits * (times.followUpAntibiotic + times.hcRegistration)) +
            (nurseVisits * times.commuteTime) +
            (census * times.adminCoordination);
        const etpNursing = nurseWorkload / prodMinutes;

        // 3. Calculate workload for Nursing Assistants (Auxiliares)
        // Visits: Antibiotic (frec 2) + Healing + Simple Follow-up
        const auxVisits = (census * (distAntibiotic / 100) * 2) + (census * (distHealing / 100));
        const auxWorkload = (auxVisits * (times.simpleHealing + times.hcRegistration)) +
            (auxVisits * times.commuteTime);
        const etpAssistant = auxWorkload / prodMinutes;

        return {
            etpMedicine: Math.ceil(etpMedicine * 10) / 10,
            etpNursing: Math.ceil(etpNursing * 10) / 10,
            etpAssistant: Math.ceil(etpAssistant * 10) / 10,
            utilization: (etpMedicine + etpNursing + etpAssistant) / 30 * 100 // dummy ref
        };
    }, [census, productiveHours, times, distInitial, distAntibiotic, distHealing]);

    const runAIInference = async () => {
        if (!modelDoc || !censusData) {
            alert('Por favor ingrese tanto el Modelo de Atención como el Censo de Pacientes.');
            return;
        }

        setIsInfereing(true);
        try {
            const result = await aiService.runCapacityInference(modelDoc, censusData);
            if (result.json) {
                setInferenceResult(result.json);
            } else if (result.error) {
                alert(`Error en inferencia: ${result.error}`);
            }
        } catch (error) {
            console.error('Inference Error:', error);
        } finally {
            setIsInfereing(false);
        }
    };

    const triggers = [
        { label: 'Censo vs Capacidad', status: census > 180 ? 'CRITICO' : census > 150 ? 'ALERTA' : 'OPTIMO', value: `${census}/200` },
        { label: 'Tasa de Utilizacion', status: calculations.utilization > 85 ? 'ALERTA' : 'NORMAL', value: `${Math.round(calculations.utilization)}%` },
        { label: 'Horas Extra Promedio', status: 'CUMPLIDO', value: '2.5h' }
    ];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 font-outfit">
                    <span className="p-2 bg-[#00E5FF]/10 rounded-xl text-[#00E5FF]">
                        <Icons.ClipboardCheck />
                    </span>
                    Camus: Motor de Inferencia Operativa
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard title="Inyección de Datos AI">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Modelo de Atención</label>
                                    <label className="cursor-pointer text-[#00E5FF] text-[10px] font-bold hover:underline">
                                        Subir PDF
                                        <input type="file" className="hidden" accept=".pdf,.txt" onChange={(e) => handleFileUpload(e, 'model')} />
                                    </label>
                                </div>
                                <textarea
                                    value={modelDoc}
                                    onChange={(e) => setModelDoc(e.target.value)}
                                    placeholder="Pegue el contenido o suba un PDF..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-gray-300 focus:outline-none focus:border-[#00E5FF]/50 custom-scrollbar"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Censo de Pacientes</label>
                                    <label className="cursor-pointer text-[#00E5FF] text-[10px] font-bold hover:underline">
                                        Subir Archivo
                                        <input type="file" className="hidden" accept=".csv,.json,.txt" onChange={(e) => handleFileUpload(e, 'census')} />
                                    </label>
                                </div>
                                <textarea
                                    value={censusData}
                                    onChange={(e) => setCensusData(e.target.value)}
                                    placeholder="Dataset (CSV/JSON/Texto)..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-gray-300 focus:outline-none focus:border-[#00E5FF]/50 custom-scrollbar"
                                />
                            </div>
                            <GlassButton
                                onClick={runAIInference}
                                disabled={isInfereing || isParsing}
                                className="w-full py-4 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                            >
                                {isParsing ? 'Analizando Documento...' : isInfereing ? 'Procesando Inferencia...' : 'Ejecutar Inferencia Camus'}
                            </GlassButton>
                        </div>
                    </GlassCard>

                    <GlassCard title="Configuración Manual (Fallback)" className="opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Censo Total de Pacientes: <span className="text-[#00E5FF] font-bold">{census}</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="500"
                                value={census}
                                title="Ajustar censo de pacientes"
                                onChange={(e) => setCensus(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                            />

                            <GlassInput
                                label="Horas Laborales Productivas"
                                type="number"
                                value={productiveHours.toString()}
                                onChange={(e) => setProductiveHours(Number(e.target.value))}
                                suffix="h/dia"
                            />
                        </div>
                    </GlassCard>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {inferenceResult ? (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-xl font-bold text-[#00E5FF] flex items-center gap-2">
                                <span className="animate-pulse">●</span> Resultado de Inferencia: Modelo {inferenceResult.model_type}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <EtpCard
                                    role="Medicina"
                                    value={inferenceResult.etp_required.medicina}
                                    variant="cyan"
                                    tasks={["Factor K: " + (inferenceResult.scenarios.excellence.k || 1.15)]}
                                    icon={<Icons.User />}
                                />
                                <EtpCard
                                    role="Enfermería Jefe"
                                    value={inferenceResult.etp_required.enfermeria_jefe}
                                    variant="purple"
                                    tasks={["Estratificación Automática"]}
                                    icon={<Icons.Clipboard />}
                                />
                                <EtpCard
                                    role="Auxiliares"
                                    value={inferenceResult.etp_required.auxiliares}
                                    variant="green"
                                    tasks={["Productividad Ajustada"]}
                                    icon={<Icons.Users />}
                                />
                            </div>

                            <GlassCard title="Análisis de Brecha y Escenarios" className="border-cyan-500/30">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <p className="text-[10px] text-gray-500 uppercase font-black">Mínimo Operativo</p>
                                        <p className="text-2xl font-bold text-white">{inferenceResult.scenarios.minimum.total_etp} <span className="text-xs text-gray-500 font-normal">ETPs</span></p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                                        <p className="text-[10px] text-cyan-400 uppercase font-black">Excelente / Acreditación</p>
                                        <p className="text-2xl font-bold text-white">{inferenceResult.scenarios.excellence.total_etp} <span className="text-xs text-gray-500 font-normal">ETPs</span></p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                                        <p className="text-[10px] text-red-400 uppercase font-black">Brecha Detectada</p>
                                        <p className="text-2xl font-bold text-white">{inferenceResult.scenarios.gap.difference} <span className="text-xs text-gray-500 font-normal">ETPs</span></p>
                                    </div>
                                </div>
                                {inferenceResult.risk_alert && (
                                    <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-100 text-sm flex items-center gap-3">
                                        <span className="text-red-400"><Icons.AlertCircle /></span>
                                        {inferenceResult.risk_alert}
                                    </div>
                                )}
                            </GlassCard>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <GlassCard title="Insights Estratégicos">
                                    <ul className="space-y-3">
                                        {inferenceResult.insights?.map((insight: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                                                <span className="text-cyan-400">•</span> {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>
                                <div className="space-y-4">
                                    <GlassButton className="w-full">Exportar Informe Técnico (JSON)</GlassButton>
                                    <GlassButton className="w-full border-white/10 text-gray-400">Ver Lógica de Algoritmo</GlassButton>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50 space-y-6">
                            <div className="p-8 rounded-full bg-white/5 border border-white/10 animate-pulse">
                                <span className="text-gray-500"><Icons.ClipboardCheck /></span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Motor de Inferencia Camus en Espera</h3>
                                <p className="text-gray-400 max-w-md">Inyecte un modelo de atención y un censo de pacientes para generar el análisis de capacidad operativa.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TimeInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div>
        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">{label}</label>
        <div className="relative">
            <input
                type="number"
                value={value}
                title={label}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50"
            />
        </div>
    </div>
);

const EtpCard = ({ role, value, variant, icon, tasks }: { role: string, value: number, variant: 'cyan' | 'purple' | 'green', icon: React.ReactNode, tasks: string[] }) => (
    <div className={`p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group hover:bg-white/[0.08] transition-all hover:translate-y-[-4px] etp-${variant}`}>
        <div className="etp-card-accent"></div>
        <div className="flex items-center gap-4 mb-4">
            <div className="etp-icon-wrapper">
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">{role}</p>
                <p className="text-3xl font-black text-white mt-1">{value}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold">ETPs Requeridos</p>
            </div>
        </div>
        <div className="mt-4 space-y-2">
            {tasks.map((t, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[10px] text-gray-400">
                    <span className="text-white opacity-50">•</span>
                    {t}
                </div>
            ))}
        </div>
    </div>
);

export default PersonnelPlanner;
