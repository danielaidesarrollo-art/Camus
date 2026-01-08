import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Patient } from '../types.ts';
import { calculateAge, Icons } from '../constants.tsx';
import { GlassCard } from './ui/GlassComponents.tsx';

interface Appointment {
    patientName: string;
    patientId: string;
    visitType: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
}

const ScheduleView: React.FC = () => {
    const { patients } = useAppContext();

    const schedule = useMemo(() => {
        const appointments: Appointment[] = [];
        if (!Array.isArray(patients)) return [];

        const acceptedPatients = patients.filter(p =>
            p && p.estado === 'Aceptado' && p.fechaIngreso && p.fechaNacimiento
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        acceptedPatients.forEach(patient => {
            try {
                let intervalDays = 0;
                let visitType = 'Visita de Seguimiento';
                let priority: 'high' | 'medium' | 'low' = 'medium';

                if (patient.programa === 'Virrey solis en Casa Hospitalario') {
                    intervalDays = 3;
                    visitType = 'Visita Domiciliaria (Hospitalario)';
                    priority = 'medium';
                } else if (patient.programa === 'Virrey solis en Casa Crónico') {
                    intervalDays = 90;
                    visitType = 'Visita Domiciliaria (Crónico)';
                    priority = 'low';
                } else if (patient.programa === 'Virrey solis en Casa Crónico Paliativo') {
                    intervalDays = 7;
                    visitType = 'Visita Domiciliaria (Paliativo)';
                    priority = 'high';
                }

                const age = calculateAge(patient.fechaNacimiento);
                let isAntibioticActive = false;

                if (patient.terapias['Aplicación de terapia antibiótica'] && patient.antibiotico) {
                    const abStart = new Date(patient.antibiotico.fechaInicio);
                    const abEnd = new Date(patient.antibiotico.fechaTerminacion);
                    abStart.setHours(0, 0, 0, 0);
                    abEnd.setHours(23, 59, 59, 999);

                    if (today >= abStart && today <= abEnd) {
                        isAntibioticActive = true;
                        intervalDays = 1;
                        priority = 'high';
                        visitType = `Control Antibiótico (${patient.antibiotico.medicamento})`;
                    }
                }

                if (!isAntibioticActive && age < 5) {
                    intervalDays = 1;
                    priority = 'high';
                    visitType = 'Control Pediátrico Prioritario';
                }

                if (intervalDays > 0) {
                    const ingressDate = new Date(patient.fechaIngreso);
                    ingressDate.setHours(0, 0, 0, 0);

                    if (isNaN(ingressDate.getTime())) return;

                    const diffTime = today.getTime() - ingressDate.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
                    let daysUntilNext = diffDays < 0 ? Math.abs(diffDays) : (diffDays % intervalDays === 0 ? 0 : (intervalDays - (diffDays % intervalDays)));

                    const nextVisitDate = new Date(today);
                    nextVisitDate.setDate(today.getDate() + daysUntilNext);

                    appointments.push({
                        patientName: patient.nombreCompleto,
                        patientId: patient.id,
                        visitType,
                        dueDate: nextVisitDate.toLocaleDateString('es-CO'),
                        priority,
                    });
                }
            } catch (error) {
                console.error(`Error processing patient ${patient.id}:`, error);
            }
        });

        return appointments.sort((a, b) => {
            const weights = { high: 3, medium: 2, low: 1 };
            if (weights[a.priority] !== weights[b.priority]) return weights[b.priority] - weights[a.priority];

            const [dA, mA, yA] = a.dueDate.split('/').map(Number);
            const [dB, mB, yB] = b.dueDate.split('/').map(Number);
            return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();
        });
    }, [patients]);

    return (
        <div className="flex flex-col space-y-8 animate-fade-in max-w-6xl mx-auto px-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white font-outfit flex items-center gap-3">
                    <span className="p-2 bg-[#00E5FF]/10 rounded-lg text-[#00E5FF]">{Icons.Calendar}</span>
                    Agenda de Visitas
                </h1>
                <p className="text-gray-400 max-w-2xl leading-relaxed">
                    Planificación automática generada mediante criterios clínicos de alta prioridad (antibióticos, pediatría) y protocolos por programa.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedule.length > 0 ? schedule.map((appt, index) => {
                    const isHigh = appt.priority === 'high';
                    return (
                        <GlassCard
                            key={`${appt.patientId}-${index}`}
                            className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${isHigh ? 'border-purple-500/30' : ''}`}
                        >
                            {isHigh && (
                                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-purple-500/10 blur-2xl rounded-full"></div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${appt.priority === 'high' ? 'bg-purple-500/20 text-purple-400' :
                                        appt.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-[#00E5FF]/20 text-[#00E5FF]'
                                    }`}>
                                    Prioridad {appt.priority}
                                </span>
                                {isHigh && (
                                    <span className="text-purple-400 animate-pulse">{Icons.AlertCircle}</span>
                                )}
                            </div>

                            <div className="space-y-1 mb-6">
                                <h3 className="text-lg font-bold text-white group-hover:text-[#00E5FF] transition-colors truncate">
                                    {appt.patientName}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">ID: {appt.patientId}</p>
                            </div>

                            <div className="bg-white/5 rounded-xl p-3 mb-6 border border-white/5">
                                <p className="text-sm text-gray-300 font-medium leading-tight">
                                    {appt.visitType}
                                </p>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Próxima Visita</p>
                                    <p className="text-xl font-bold text-white font-outfit">{appt.dueDate}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-[#00E5FF] group-hover:bg-[#00E5FF]/10 transition-all cursor-pointer">
                                    {Icons.ClipboardCheck}
                                </div>
                            </div>
                        </GlassCard>
                    );
                }) : (
                    <div className="col-span-full py-20 text-center">
                        <GlassCard className="inline-block px-12 py-8 border-dashed border-white/10">
                            <p className="text-gray-500 font-medium italic">No se encontraron visitas programadas pendientes.</p>
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleView;
