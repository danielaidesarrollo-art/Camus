
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { GlassCard, GlassButton } from './ui/GlassComponents.tsx';
import { Icons, calculateAge } from '../constants.tsx';
import { Patient, HandoverNote } from '../types.ts';

const PatientPortal: React.FC = () => {
    const { user, patients, handoverNotes } = useAppContext();

    // Get patient data linked to this user
    const myPatientData = useMemo(() => {
        if (!user || !user.patientId) return null;
        return patients.find(p => p.id === user.patientId);
    }, [user, patients]);

    // Get handover notes for this patient
    const myHandoverNotes = useMemo(() => {
        if (!myPatientData) return [];
        return handoverNotes
            .filter(note => note.patientId === myPatientData.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10); // Last 10 notes
    }, [myPatientData, handoverNotes]);

    // Calculate next visit (mock - in real system this would come from scheduled routes)
    const nextVisit = useMemo(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        return tomorrow;
    }, []);

    const timeUntilVisit = useMemo(() => {
        const now = new Date();
        const diff = nextVisit.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes };
    }, [nextVisit]);

    if (!myPatientData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <GlassCard className="p-8 max-w-md text-center">
                    <div className="text-yellow-500 mb-4">{Icons.AlertCircle}</div>
                    <h2 className="text-xl font-bold text-white mb-2">Cuenta No Vinculada</h2>
                    <p className="text-gray-400 text-sm">
                        Su cuenta de paciente no está vinculada a un registro. Por favor contacte al coordinador.
                    </p>
                </GlassCard>
            </div>
        );
    }

    const age = calculateAge(myPatientData.fechaNacimiento);
    const activeTerapias = Object.entries(myPatientData.terapias).filter(([_, active]) => active);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white font-outfit">
                    Bienvenido, {myPatientData.nombreCompleto.split(' ')[0]}
                </h1>
                <p className="text-gray-400 text-sm">Portal del Paciente - Camus Extramural</p>
            </div>

            {/* Next Visit Countdown */}
            <GlassCard className="!p-8 border-[#00E5FF]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#00E5FF]/10 rounded-xl">
                            {Icons.Calendar}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Próxima Visita</h2>
                            <p className="text-xs text-gray-500">Programada para mañana</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                            <div className="text-4xl font-black text-[#00E5FF]">{timeUntilVisit.hours}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Horas</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                            <div className="text-4xl font-black text-[#00E5FF]">{timeUntilVisit.minutes}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Minutos</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                            <p className="text-sm text-gray-400">Fecha y Hora</p>
                            <p className="text-white font-bold">
                                {nextVisit.toLocaleDateString('es-CO', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <p className="text-[#00E5FF] font-bold">
                                {nextVisit.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <GlassButton className="!py-3 !px-6" glow>
                            Confirmar Asistencia
                        </GlassButton>
                    </div>
                </div>
            </GlassCard>

            {/* Patient Info Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="!p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        {Icons.User}
                        Mis Datos
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-500">Documento</p>
                            <p className="text-white font-medium">{myPatientData.tipoDocumento}: {myPatientData.id}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Edad</p>
                            <p className="text-white font-medium">{age} años</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Dirección</p>
                            <p className="text-white font-medium">{myPatientData.direccion}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Teléfono</p>
                            <p className="text-white font-medium">{myPatientData.telefonoMovil}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Cuidador Principal</p>
                            <p className="text-white font-medium">{myPatientData.cuidadorPrincipal}</p>
                            <p className="text-gray-400 text-xs">{myPatientData.telefonoCuidador}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="!p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        {Icons.ClipboardCheck}
                        Mi Programa
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-500">Programa Actual</p>
                            <p className="text-white font-medium">{myPatientData.programa}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Diagnóstico</p>
                            <p className="text-white font-medium">{myPatientData.diagnosticoEgreso}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Clínica de Egreso</p>
                            <p className="text-white font-medium">{myPatientData.clinicaEgreso}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Estado</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${myPatientData.estado === 'Aceptado' ? 'bg-green-500/20 text-green-400' :
                                    myPatientData.estado === 'Pendiente' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                }`}>
                                {myPatientData.estado}
                            </span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Active Therapies */}
            <GlassCard className="!p-6">
                <h3 className="text-lg font-bold text-white mb-4">Mis Terapias Activas</h3>
                {activeTerapias.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeTerapias.map(([terapia]) => (
                            <div key={terapia} className="p-3 bg-white/5 rounded-xl border border-[#00E5FF]/20">
                                <p className="text-sm text-white capitalize">{terapia}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No hay terapias activas registradas</p>
                )}

                {/* Antibiotic Info */}
                {myPatientData.antibiotico && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <h4 className="text-sm font-bold text-blue-400 mb-2">Tratamiento Antibiótico</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <p className="text-gray-500">Medicamento</p>
                                <p className="text-white">{myPatientData.antibiotico.medicamento}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Progreso</p>
                                <p className="text-white">
                                    Día {myPatientData.antibiotico.diaActual} de {myPatientData.antibiotico.diasTotales}
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all"
                                style={{
                                    width: `${(myPatientData.antibiotico.diaActual / myPatientData.antibiotico.diasTotales) * 100}%`
                                }}
                            ></div>
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* Recent Updates */}
            <GlassCard className="!p-6">
                <h3 className="text-lg font-bold text-white mb-4">Actualizaciones Recientes</h3>
                {myHandoverNotes.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {myHandoverNotes.map((note) => (
                            <div key={note.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-white">{note.authorRole}</p>
                                        <p className="text-xs text-gray-500">{note.authorName}</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {new Date(note.timestamp).toLocaleDateString('es-CO')}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-3">{note.note}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No hay actualizaciones recientes</p>
                )}
            </GlassCard>

            {/* Emergency Contact */}
            <GlassCard className="!p-6 border-red-500/20">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-500/10 rounded-xl">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">Contacto de Emergencia</h3>
                        <p className="text-sm text-gray-400">
                            Si presenta alguna urgencia, comuníquese inmediatamente con su coordinador de atención.
                        </p>
                    </div>
                    <GlassButton className="!bg-red-500/20 !text-red-400 border-red-500/30">
                        Llamar
                    </GlassButton>
                </div>
            </GlassCard>
        </div>
    );
};

export default PatientPortal;
