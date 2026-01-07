
import React, { useState, useMemo, useEffect } from 'react';
import { Patient, HandoverNote } from '../types.ts';
import { GlassCard, GlassButton } from './ui/GlassComponents.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import { calculateAge, Icons } from '../constants.tsx';
import Modal from './ui/Modal.tsx';

interface PatientCardProps {
    patient: Patient;
    onUpdate: (patient: Patient) => void;
    onClose: () => void;
    onEdit: (patient: Patient) => void;
}

const DetailItem: React.FC<{ label: string; value: any }> = ({ label, value }) => {
    const renderValue = () => {
        if (value === null || typeof value === 'undefined' || value === '') {
            return 'N/A';
        }
        if (typeof value === 'boolean') {
            return value ? 'Sí' : 'No';
        }
        if (typeof value === 'string' || typeof value === 'number') {
            return value;
        }
        return <span className="text-red-400 italic font-medium">Dato no válido</span>;
    };

    return (
        <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">{label}</p>
            <p className="text-sm text-gray-300 font-medium">{renderValue()}</p>
        </div>
    );
};

const NoteDetail: React.FC<{ label: string; value: any }> = ({ label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <p className="text-xs text-gray-400 mt-1"><strong className="text-[#00E5FF]/70 font-bold uppercase tracking-tighter mr-1">{label}:</strong>{String(value)}</p>
    );
};

const PatientCard: React.FC<PatientCardProps> = ({ patient, onUpdate, onClose, onEdit }) => {
    const { user, handoverNotes } = useAppContext();
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const patientNotes = useMemo(() => {
        if (!Array.isArray(handoverNotes)) return [];
        return handoverNotes
            .filter(note => note && note.patientId === patient.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [handoverNotes, patient.id]);

    const cargo = user?.cargo || '';
    const canManage = cargo.toUpperCase().includes('JEFE') ||
        cargo.toUpperCase().includes('COORDINADOR') ||
        cargo.toUpperCase().includes('ADMINISTRATIVO');

    const handleAcceptPatient = () => {
        const updatedPatient = { ...patient, estado: 'Aceptado' as const };
        onUpdate(updatedPatient);
        setNotification({
            type: 'success',
            message: `✔ Paciente ACEPTADO correctamente. Se ha notificado a ${patient.ingresadoPor}`
        });
    };

    const confirmRejection = () => {
        const updatedPatient = { ...patient, estado: 'Rechazado' as const };
        onUpdate(updatedPatient);
        setIsRejectModalOpen(false);
        setNotification({
            type: 'success',
            message: `⚠ Paciente RECHAZADO. Se ha notificado a ${patient.ingresadoPor}`
        });
    };

    const handleOpenMap = () => {
        if (patient.direccion) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(patient.direccion)}`, '_blank');
        }
    };

    const renderNoteContent = (note: HandoverNote) => {
        return (
            <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
                {note.note && (
                    <div>
                        <strong className="text-[10px] text-[#00E5FF] uppercase tracking-widest">Evolución:</strong>
                        <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap leading-relaxed">{note.note}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <NoteDetail label="Acceso Venoso" value={note.ivAccessInfo} />
                    <NoteDetail label="Escala Flebitis" value={note.phlebitisScale} />
                    <NoteDetail label="Úlceras P." value={note.pressureUlcersInfo} />
                    {note.signosVitales && (
                        <div className="col-span-full mt-2 p-2 bg-white/5 rounded-lg border border-white/5">
                            <strong className="text-[10px] text-[#00E5FF] uppercase tracking-widest block mb-1">Signos Vitales</strong>
                            <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 font-bold">
                                <span>TA: <span className="text-white">{note.signosVitales.tensionArterial}</span></span>
                                <span>FC: <span className="text-white">{note.signosVitales.frecuenciaCardiaca}</span></span>
                                <span>Sat: <span className="text-white">{note.signosVitales.saturacionO2}</span></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-4">
            {/* Header / Basic Info */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#00E5FF]/10 to-transparent border border-[#00E5FF]/20">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] text-2xl border border-[#00E5FF]/30">
                            {Icons.Profile}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white font-outfit uppercase tracking-tight">{patient.nombreCompleto}</h3>
                            <div className="flex items-center gap-3 mt-1 text-gray-400 font-medium text-sm">
                                <span>ID: <span className="text-white">{patient.id}</span></span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                <span>{calculateAge(patient.fechaNacimiento)} años</span>
                            </div>
                        </div>
                    </div>
                    <span className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl border ${patient.estado === 'Aceptado' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                            patient.estado === 'Rechazado' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                        {patient.estado}
                    </span>
                </div>
            </div>

            {/* Content Tabs/Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Identification Section */}
                <section className="space-y-6">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest opacity-80">
                        <span className="w-2 h-4 bg-[#00E5FF] rounded-sm"></span>
                        Identificación y Contacto
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                        <DetailItem label="Tipo Doc" value={patient.tipoDocumento} />
                        <DetailItem label="Teléfono" value={patient.telefonoMovil} />
                        <DetailItem label="Cuidador" value={patient.cuidadorPrincipal} />
                        <DetailItem label="Tel Cuidador" value={patient.telefonoCuidador} />
                        <div className="col-span-full">
                            <DetailItem label="Dirección" value={patient.direccion} />
                            <button onClick={handleOpenMap} className="mt-2 text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest hover:text-white transition-colors">
                                Ver en Google Maps →
                            </button>
                        </div>
                    </div>
                </section>

                {/* Clinical Section */}
                <section className="space-y-6">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest opacity-80">
                        <span className="w-2 h-4 bg-[#00E5FF] rounded-sm"></span>
                        Diagnóstico y Plan
                    </h4>
                    <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                        <DetailItem label="Programa" value={patient.programa} />
                        <DetailItem label="Clínica Egreso" value={patient.clinicaEgreso} />
                        <DetailItem label="Diagnóstico" value={patient.diagnosticoEgreso} />

                        <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Terapias Activas</p>
                            <div className="flex flex-wrap gap-2">
                                {patient.terapias && Object.entries(patient.terapias)
                                    .filter(([_, active]) => active)
                                    .map(([key]) => (
                                        <span key={key} className="px-3 py-1 bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-bold rounded-lg border border-[#00E5FF]/20">
                                            {key}
                                        </span>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Clinical Alerts / Medications */}
            {(patient.alergicoMedicamentos || patient.antibiotico) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.alergicoMedicamentos && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <h5 className="text-red-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                ⚠ Alergias Detectadas
                            </h5>
                            <p className="text-gray-300 font-medium">{patient.alergiasInfo || 'Alergias registradas'}</p>
                        </div>
                    )}
                    {patient.antibiotico && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <h5 className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                                💊 Terapia Antibiótica
                            </h5>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white font-bold">{patient.antibiotico.medicamento}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Día {patient.antibiotico.diaActual} de {patient.antibiotico.diasTotales}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#00E5FF] font-bold text-sm">{patient.antibiotico.miligramos}mg</p>
                                    <p className="text-[10px] text-gray-400 font-medium">c/ {patient.antibiotico.frecuenciaHoras}h</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Handover History */}
            <section className="space-y-4">
                <button
                    onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                    className="w-full glass-panel !bg-white/5 hover:!bg-white/10 p-4 flex justify-between items-center transition-all group"
                >
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        {Icons.Clipboard} Historial de Novedades
                        <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-[10px]">{patientNotes.length}</span>
                    </h4>
                    <span className={`text-[#00E5FF] transition-transform duration-300 ${isHistoryVisible ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                </button>

                {isHistoryVisible && (
                    <div className="space-y-4 animate-slide-up max-h-[400px] overflow-y-auto no-scrollbar outline-none focus:outline-none">
                        {patientNotes.length > 0 ? (
                            patientNotes.map((note) => (
                                <GlassCard key={note.id} className="!p-5 border-white/5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#00E5FF]">
                                                {Icons.Profile}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white tracking-tight leading-none">{note.authorName}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{note.authorRole}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-600 font-bold">{new Date(note.timestamp).toLocaleString('es-CO')}</span>
                                    </div>
                                    {renderNoteContent(note)}
                                </GlassCard>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-600 italic">No hay registros previos.</div>
                        )}
                    </div>
                )}
            </section>

            {/* Actions */}
            {canManage && (
                <footer className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    <GlassButton onClick={() => onEdit(patient)}>
                        {Icons.Plus} <span className="ml-2">Editar Info</span>
                    </GlassButton>
                    {patient.estado === 'Pendiente' && (
                        <>
                            <GlassButton className="!bg-red-500/20 !border-red-500/30 text-red-400" onClick={() => setIsRejectModalOpen(true)}>
                                Rechazar
                            </GlassButton>
                            <GlassButton glow onClick={handleAcceptPatient}>
                                Aceptar Paciente
                            </GlassButton>
                        </>
                    )}
                </footer>
            )}

            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Confirmar Rechazo">
                <div className="space-y-6">
                    <p className="text-gray-400 text-sm leading-relaxed">
                        ¿Confirma que desea rechazar el ingreso de <span className="text-white font-bold">{patient.nombreCompleto}</span>? Esta acción se notificará al coordinador solicitante.
                    </p>
                    <div className="flex justify-end gap-3">
                        <GlassButton onClick={() => setIsRejectModalOpen(false)}>Cancelar</GlassButton>
                        <GlassButton className="!bg-red-500 !text-white" onClick={confirmRejection}>Confirmar Rechazo</GlassButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PatientCard;
