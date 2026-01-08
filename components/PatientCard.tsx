
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
        <div className="space-y-1 group/item">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none group-hover/item:text-[#00E5FF] transition-colors">{label}</p>
            <p className="text-sm text-gray-200 font-bold font-inter">{renderValue()}</p>
        </div>
    );
};

const NoteDetail: React.FC<{ label: string; value: any }> = ({ label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <p className="text-[11px] text-gray-400 mt-1"><strong className="text-[#00E5FF]/60 font-black uppercase tracking-widest mr-2">{label}:</strong>{String(value)}</p>
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
            <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                {note.note && (
                    <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                        <strong className="text-[9px] text-[#00E5FF] font-black uppercase tracking-[0.2em] block mb-2 opacity-70">Evolución Clínica:</strong>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-inter">{note.note}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NoteDetail label="Acceso Venoso" value={note.ivAccessInfo} />
                    <NoteDetail label="Escala Flebitis" value={note.phlebitisScale} />
                    <NoteDetail label="Úlceras P." value={note.pressureUlcersInfo} />
                    {note.signosVitales && (
                        <div className="col-span-full p-4 bg-[#00E5FF]/5 rounded-xl border border-[#00E5FF]/10 backdrop-blur-sm">
                            <strong className="text-[9px] text-[#00E5FF] font-black uppercase tracking-[0.2em] block mb-3">Monitorización Hemodinámica</strong>
                            <div className="grid grid-cols-3 gap-6 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                <div className="space-y-1">
                                    <span className="opacity-50 block">T. Arterial</span>
                                    <span className="text-white text-sm">{note.signosVitales.tensionArterial}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="opacity-50 block">F. Cardiaca</span>
                                    <span className="text-white text-sm">{note.signosVitales.frecuenciaCardiaca}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="opacity-50 block">Sat O2</span>
                                    <span className="text-[#00E5FF] text-sm">{note.signosVitales.saturacionO2}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-6 animate-fade-in">
            {/* Header / Basic Info */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#00E5FF]/10 via-transparent to-transparent border border-[#00E5FF]/20 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] text-3xl border border-[#00E5FF]/30 shadow-[0_0_30px_rgba(0,229,255,0.15)] group-hover:scale-105 transition-transform duration-500">
                            {Icons.Profile}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold text-white font-outfit uppercase tracking-tight leading-none">{patient.nombreCompleto}</h3>
                            <div className="flex items-center gap-4 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] pt-1">
                                <span>ID: <span className="text-white">{patient.id}</span></span>
                                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                <span>{calculateAge(patient.fechaNacimiento)} años</span>
                            </div>
                        </div>
                    </div>
                    <span className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border shadow-lg ${patient.estado === 'Aceptado' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5' :
                        patient.estado === 'Rechazado' ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/5' :
                            'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 shadow-yellow-500/5'}`}>
                        {patient.estado}
                    </span>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#00E5FF]/5 blur-[100px] rounded-full group-hover:bg-[#00E5FF]/10 transition-all duration-700"></div>
            </div>

            {/* Content Tabs/Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Identification Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#00E5FF] rounded-full shadow-[0_0_12px_rgba(0,229,255,0.5)]"></div>
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.25em]">Identificación</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-8 bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-md relative group/card">
                        <DetailItem label="Tipo Doc" value={patient.tipoDocumento} />
                        <DetailItem label="Teléfono" value={patient.telefonoMovil} />
                        <DetailItem label="Cuidador" value={patient.cuidadorPrincipal} />
                        <DetailItem label="Tel Cuidador" value={patient.telefonoCuidador} />
                        <div className="col-span-full pt-4 border-t border-white/5">
                            <DetailItem label="Dirección de Residencia" value={patient.direccion} />
                            <button onClick={handleOpenMap} className="mt-3 text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-2 group/map">
                                <span>Ver Localización GPS</span>
                                <span className="group-hover/map:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Clinical Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.5)]"></div>
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.25em]">Plan de Atención</h4>
                    </div>
                    <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-md relative overflow-hidden group/card">
                        <DetailItem label="Programa Institucional" value={patient.programa} />
                        <DetailItem label="Clínica de Remisión" value={patient.clinicaEgreso} />
                        <DetailItem label="Diagnóstico Principal" value={patient.diagnosticoEgreso} />

                        <div className="mt-4 pt-6 border-t border-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Servicios Autorizados</p>
                            <div className="flex flex-wrap gap-2">
                                {patient.terapias && Object.entries(patient.terapias)
                                    .filter(([_, active]) => active)
                                    .map(([key]) => (
                                        <span key={key} className="px-4 py-1.5 bg-white/5 text-white/70 text-[9px] font-black uppercase tracking-widest rounded-xl border border-white/10 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-all">
                                            {key.replace(/ \(.+?\)/g, '')}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {patient.alergicoMedicamentos && (
                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl relative overflow-hidden group">
                            <h5 className="text-red-400 text-[10px] font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                Alertas Alérgicas
                            </h5>
                            <p className="text-gray-200 font-bold font-inter text-sm bg-black/20 p-3 rounded-xl border border-red-500/10">
                                {patient.alergiasInfo || 'Información de alergias no detallada'}
                            </p>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/5 blur-[50px] group-hover:bg-red-500/10 transition-all"></div>
                        </div>
                    )}
                    {patient.antibiotico && (
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl relative overflow-hidden group">
                            <h5 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                Esquema de Antibiótico
                            </h5>
                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-emerald-500/10 backdrop-blur-sm relative z-10">
                                <div>
                                    <p className="text-white font-black text-lg font-outfit group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{patient.antibiotico.medicamento}</p>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                                        Día <span className="text-emerald-400">{patient.antibiotico.diaActual}</span> de {patient.antibiotico.diasTotales}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#00E5FF] font-black text-xl font-outfit drop-shadow-[0_0_10px_rgba(0,229,255,0.2)]">{patient.antibiotico.miligramos}mg</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Cada {patient.antibiotico.frecuenciaHoras}h</p>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-[50px] group-hover:bg-emerald-500/10 transition-all"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Handover History */}
            <section className="pt-6">
                <button
                    onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                    className="w-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 p-6 rounded-3xl flex justify-between items-center transition-all duration-500 relative overflow-hidden group/history"
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-2.5 rounded-xl bg-white/5 text-[#00E5FF] transition-transform duration-500 ${isHistoryVisible ? 'bg-[#00E5FF]/20' : ''}`}>
                            {Icons.Clipboard}
                        </div>
                        <div className="text-left">
                            <h4 className="text-xs font-black text-white uppercase tracking-[0.25em]">Historial Clínico de Novedades</h4>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">{patientNotes.length} registros encontrados</p>
                        </div>
                    </div>
                    <span className={`text-[#00E5FF] transition-all duration-500 p-2 rounded-full hover:bg-[#00E5FF]/10 ${isHistoryVisible ? 'rotate-180 bg-[#00E5FF]/10' : ''}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-full bg-gradient-to-l from-[#00E5FF]/5 to-transparent opacity-0 group-hover/history:opacity-100 transition-opacity"></div>
                </button>

                {isHistoryVisible && (
                    <div className="space-y-6 pt-6 animate-slide-up max-h-[500px] overflow-y-auto no-scrollbar outline-none">
                        {patientNotes.length > 0 ? (
                            patientNotes.map((note) => (
                                <GlassCard key={note.id} className="!p-6 border-white/10 hover:border-[#00E5FF]/30 transition-all duration-500">
                                    <div className="flex justify-between items-start gap-4 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00E5FF] border border-white/5 shadow-inner">
                                                {Icons.Profile}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white font-inter tracking-tight leading-none">{note.authorName}</p>
                                                <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black mt-2">{note.authorRole}</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
                                            {new Date(note.timestamp).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                    </div>
                                    {renderNoteContent(note)}
                                </GlassCard>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                                <p className="text-gray-600 font-black uppercase tracking-[0.25em] text-[10px] italic">Sin registros de evolución previa</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Actions */}
            {canManage && (
                <footer className="flex flex-col sm:flex-row justify-end gap-4 pt-10 border-t border-white/5">
                    <GlassButton onClick={() => onEdit(patient)} className="sm:w-auto h-12 uppercase tracking-widest text-[10px] font-black">
                        {Icons.Plus} <span className="ml-2">Modificar Información</span>
                    </GlassButton>
                    {patient.estado === 'Pendiente' && (
                        <div className="flex gap-4">
                            <GlassButton className="!bg-red-500/10 !border-red-500/20 text-red-500 hover:!bg-red-500/20 sm:w-auto h-12 uppercase tracking-widest text-[10px] font-black" onClick={() => setIsRejectModalOpen(true)}>
                                Rechazar Solicitud
                            </GlassButton>
                            <GlassButton glow onClick={handleAcceptPatient} className="flex-grow sm:w-auto h-12 uppercase tracking-widest text-[10px] font-black">
                                Autorizar Ingreso
                            </GlassButton>
                        </div>
                    )}
                </footer>
            )}

            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Confirmar Acción de Rechazo">
                <div className="space-y-8">
                    <div className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10">
                        <p className="text-gray-400 text-sm leading-relaxed font-inter">
                            ¿Confirma formalmente el rechazo del ingreso administrativo de <span className="text-white font-bold">{patient.nombreCompleto}</span>? <br /><br />
                            <span className="opacity-70 text-xs">Esta acción revocará la solicitud y notificará al coordinador solicitante en tiempo real.</span>
                        </p>
                    </div>
                    <div className="flex justify-end gap-4">
                        <GlassButton onClick={() => setIsRejectModalOpen(false)} variant="ghost" className="uppercase tracking-widest font-black text-[10px]">Cancelar</GlassButton>
                        <GlassButton className="!bg-red-600 !text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] !border-transparent hover:!bg-red-500 h-12 px-8 uppercase tracking-widest font-black text-[10px]" onClick={confirmRejection}>Proceder con el Rechazo</GlassButton>
                    </div>
                </div>
            </Modal>

            {/* Custom Notification Toast */}
            {notification && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] animate-slide-up">
                    <div className={`px-8 py-4 rounded-2xl flex items-center gap-4 border shadow-2xl backdrop-blur-xl ${notification.type === 'success'
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/20 border-red-500/30 text-red-400'
                        }`}>
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">
                            {notification.type === 'success' ? '✓' : '!'}
                        </div>
                        <p className="font-black uppercase tracking-widest text-[10px]">{notification.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientCard;
