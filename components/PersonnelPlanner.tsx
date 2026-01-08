import React, { useState, useMemo } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './ui/GlassComponents.tsx';
import { Icons } from '../constants.tsx';

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
                        <Icons.ClipboardCheck size={24} />
                    </span>
                    Planeación de Personal ETP
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard title="Configuración de Población">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Censo Total de Pacientes: <span className="text-[#00E5FF] font-bold">{census}</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="500"
                                value={census}
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

                            <div className="pt-4 border-t border-white/5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Matriz de Tiempos (min)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <TimeInput label="Val. Inicial" value={times.initialValoracion} onChange={(v) => setTimes({ ...times, initialValoracion: v })} />
                                    <TimeInput label="Seg. Médico" value={times.medicalFollowUp} onChange={(v) => setTimes({ ...times, medicalFollowUp: v })} />
                                    <TimeInput label="Visita Enf." value={times.followUpAntibiotic} onChange={(v) => setTimes({ ...times, followUpAntibiotic: v })} />
                                    <TimeInput label="Desplazam." value={times.commuteTime} onChange={(v) => setTimes({ ...times, commuteTime: v })} />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard title="Disparadores de Crecimiento" className="border-[#A855F7]/20">
                        <div className="space-y-4">
                            {triggers.map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black">{t.label}</p>
                                        <p className="text-sm font-bold text-white">{t.value}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${t.status === 'CRITICO' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                            t.status === 'ALERTA' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                'bg-green-500/20 text-green-400 border border-green-500/30'
                                        }`}>
                                        {t.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard title="Cálculo de Requerimientos (ETP)" className="h-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            <EtpCard
                                role="Médico"
                                value={calculations.etpMedicine}
                                color="#00E5FF"
                                icon={<Icons.User size={24} />}
                                tasks={["Valoraciones ingreso/egreso", "Análisis clínico HC", "Telexperticia"]}
                            />
                            <EtpCard
                                role="Enfermería (Jefe)"
                                value={calculations.etpNursing}
                                color="#A855F7"
                                icon={<Icons.Clipboard size={24} />}
                                tasks={["Supervisión de cuidado", "Educación a cuidador", "Planificación logística"]}
                            />
                            <EtpCard
                                role="Auxiliar"
                                value={calculations.etpAssistant}
                                color="#34D399"
                                icon={<Icons.Users size={24} />}
                                tasks={["Admin. medicamentos", "Curaciones básicas", "Toma de muestras"]}
                            />
                        </div>

                        <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Icons.Home size={120} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Resumen Operativo</h3>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                                Según el censo de <span className="text-white font-bold">{census} pacientes</span> y una jornada productiva de {productiveHours}h,
                                se requiere una plantilla total de <span className="text-[#00E5FF] font-bold">{(calculations.etpMedicine + calculations.etpNursing + calculations.etpAssistant).toFixed(1)} ETPs</span>.
                                La tasa de utilización se mantiene en un rango <span className="text-green-400 font-bold">Óptimo</span>.
                            </p>
                            <div className="mt-6 flex gap-4">
                                <GlassButton className="!py-2 text-xs">Descargar Matriz</GlassButton>
                                <GlassButton className="!py-2 text-xs border-[#A855F7]/50 text-[#A855F7]">Simular Expansión</GlassButton>
                            </div>
                        </div>
                    </GlassCard>
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
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50"
            />
        </div>
    </div>
);

const EtpCard = ({ role, value, color, icon, tasks }: { role: string, value: number, color: string, icon: any, tasks: string[] }) => (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group hover:bg-white/[0.08] transition-all hover:translate-y-[-4px]">
        <div className="absolute -top-6 -right-6 w-24 h-24 blur-3xl opacity-20 transition-all group-hover:opacity-40" style={{ backgroundColor: color }}></div>
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-white/5 text-white" style={{ borderColor: `${color}40`, color }}>
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
