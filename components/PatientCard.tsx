

import React, { useState, useMemo, useEffect } from 'react';
import { Patient, HandoverNote } from '../types.ts';
import Button from './ui/Button.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import { calculateAge } from '../constants.tsx';
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
        return <span className="text-red-500 italic">Dato no válido</span>;
    };

    return (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-md text-gray-900">{renderValue()}</p>
        </div>
    );
};

const NoteDetail: React.FC<{ label: string; value: any }> = ({ label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <p className="text-xs text-gray-600"><strong className="font-medium">{label}:</strong> {String(value)}</p>
    );
};


const PatientCard: React.FC<PatientCardProps> = ({ patient, onUpdate, onClose, onEdit }) => {
    const { user, handoverNotes } = useAppContext();
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    // Auto-dismiss notification
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
    
    const safeRender = (value: any, fallback: string | number = 'N/A') => {
        const type = typeof value;
        if (type === 'string' || type === 'number') {
            return value;
        }
        return fallback;
    };

    const cargo = user?.cargo || '';
    // Updated permission logic: Includes any role with 'JEFE', 'COORDINADOR', or 'ADMINISTRATIVO'
    const canManage = cargo.toUpperCase().includes('JEFE') || 
                      cargo.toUpperCase().includes('COORDINADOR') || 
                      cargo.toUpperCase().includes('ADMINISTRATIVO');

    // Helper to simulate email sending
    const notifyRequester = (action: 'ACEPTADO' | 'RECHAZADO') => {
        const email = patient.ingresadoPor;
        const subject = `Notificación de Paciente: ${action}`;
        const body = `El paciente ${patient.nombreCompleto} ha sido ${action} en el sistema.`;
        
        // Simulation of backend email service
        console.log(`[SIMULACIÓN EMAIL] Enviando correo a: ${email}`);
        console.log(`[SIMULACIÓN EMAIL] Asunto: ${subject}`);
        console.log(`[SIMULACIÓN EMAIL] Mensaje: ${body}`);

        return `Se ha enviado una notificación al correo: ${email}`;
    };

    const handleAcceptPatient = () => {
        const updatedPatient = { ...patient, estado: 'Aceptado' as const };
        onUpdate(updatedPatient);
        
        const emailMsg = notifyRequester('ACEPTADO');
        setNotification({
            type: 'success',
            message: `✔ Paciente ACEPTADO correctamente. ${emailMsg}`
        });
    };

    const handleRejectClick = () => {
        setIsRejectModalOpen(true);
    };

    const confirmRejection = () => {
        const updatedPatient = { ...patient, estado: 'Rechazado' as const };
        onUpdate(updatedPatient);
        setIsRejectModalOpen(false);
        
        const emailMsg = notifyRequester('RECHAZADO');
        setNotification({
            type: 'success', // Still a "successful" system action, even if the outcome is rejection
            message: `⚠ Paciente RECHAZADO. ${emailMsg}`
        });
    };

    const handleOpenMap = () => {
        if (typeof patient.direccion === 'string' && patient.direccion) {
            const query = encodeURIComponent(patient.direccion);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
        }
    };

    const renderNoteContent = (note: HandoverNote) => {
        const isAuxiliarNote = note.authorRole?.includes('AUXILIAR');
        const isFisioNote = note.authorRole?.includes('FISIOTERAPEUTA');
        const isTONote = note.authorRole?.includes('TERAPEUTA OCUPACIONAL');
        const isFonoNote = note.authorRole?.includes('FONOAUDIOLOGO');

        return (
             <div className="mt-2 border-t pt-2 space-y-2">
                {note.note && <div className="mb-2"><strong className="text-xs text-gray-700">Evolución/Novedades:</strong><p className="text-sm text-gray-800 whitespace-pre-wrap">{note.note}</p></div>}
                
                {/* Medico */}
                {note.antibioticData ? (
                    <div className="bg-blue-50 p-2 rounded border border-blue-100">
                        <p className="text-xs font-bold text-brand-blue mb-1">{note.antibioticData.action}</p>
                        {note.antibioticData.medicamento && (
                            <div className="text-xs text-gray-700">
                                <p><strong>Rx:</strong> {note.antibioticData.medicamento}</p>
                                <p><strong>Dosis:</strong> {note.antibioticData.dosisMg} mg</p>
                                <p><strong>Frecuencia:</strong> Cada {note.antibioticData.frecuenciaHoras} horas</p>
                                <p><strong>Duración:</strong> {note.antibioticData.diasTratamiento} días</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <NoteDetail label="Estado Antibiótico" value={note.antibioticStatus} />
                )}
                
                <NoteDetail label="Info Oxígeno" value={note.oxygenInfo} />
                <NoteDetail label="Labs Solicitados" value={note.labRequests} />
                <NoteDetail label="Remisiones" value={note.referralInfo} />
                <NoteDetail label="Órdenes de Salida" value={note.dischargeOrders} />
                
                {/* Jefe Enfermeria */}
                <NoteDetail label="Acceso Venoso" value={note.ivAccessInfo} />
                <NoteDetail label="Escala Flebitis" value={note.phlebitisScale} />
                <NoteDetail label="Úlceras por Presión" value={note.pressureUlcersInfo} />
                
                {/* Auxiliar */}
                {isAuxiliarNote && (
                    <div className="space-y-1">
                        <NoteDetail label="Admin. Medicamentos" value={note.administracionMedicamentos} />
                        <NoteDetail label="Curaciones" value={note.curaciones} />
                        <NoteDetail label="Manejo Sondas" value={note.manejoSondas} />
                        <NoteDetail label="Glucometrías" value={note.tomaGlucometrias} />
                        <NoteDetail label="Soporte Nutricional" value={note.soporteNutricional} />
                        <NoteDetail label="Estado de Piel" value={note.estadoPiel} />
                        {note.signosVitales && (
                            <div className="text-xs text-gray-600">
                                <strong className="font-medium">Signos Vitales:</strong>
                                <ul className="list-disc list-inside pl-4 text-gray-700">
                                    <li>TA: {note.signosVitales.tensionArterial}</li>
                                    <li>FC: {note.signosVitales.frecuenciaCardiaca}</li>
                                    <li>FR: {note.signosVitales.frecuenciaRespiratoria}</li>
                                    <li>Temp: {note.signosVitales.temperatura}</li>
                                    <li>Sat O2: {note.signosVitales.saturacionO2}</li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Fisioterapia */}
                {isFisioNote && note.fisioterapia && (
                    <div className="space-y-1 bg-blue-50 p-2 rounded">
                        <h5 className="text-xs font-bold text-brand-blue mb-1">Valoración Fisioterapia</h5>
                        <NoteDetail label="Modalidad" value={note.fisioterapia.modalidad} />
                        <NoteDetail label="Auscultación" value={note.fisioterapia.auscultacion} />
                        <NoteDetail label="Patrón Resp." value={note.fisioterapia.patronRespiratorio} />
                        <NoteDetail label="Secreciones" value={note.fisioterapia.secreciones} />
                        <NoteDetail label="Movilidad/Fuerza" value={note.fisioterapia.fuerzaMovilidad} />
                        
                        {(note.fisioterapia.numeroSesiones !== undefined || note.fisioterapia.duracionMeses !== undefined) && (
                             <div className="mt-2 pt-2 border-t border-blue-200">
                                <h6 className="text-xs font-semibold text-blue-700">Plan y Pronóstico</h6>
                                <NoteDetail label="Sesiones Programadas" value={note.fisioterapia.numeroSesiones} />
                                <NoteDetail label="Duración Estimada" value={note.fisioterapia.duracionMeses ? `${note.fisioterapia.duracionMeses} Meses` : undefined} />
                                <NoteDetail label="Egreso Rehabilitación" value={note.fisioterapia.tieneEgresoRehabilitacion ? 'Sí' : 'No'} />
                                <NoteDetail label="Se dejó Plan Casero" value={note.fisioterapia.planCasero ? 'Sí' : 'No'} />
                                <NoteDetail label="Justificación Continuidad" value={note.fisioterapia.justificacionContinuidad} />
                             </div>
                        )}
                    </div>
                )}

                {/* Terapia Ocupacional */}
                {isTONote && note.terapiaOcupacional && (
                    <div className="space-y-1 bg-green-50 p-2 rounded">
                         <h5 className="text-xs font-bold text-green-700 mb-1">Valoración T. Ocupacional</h5>
                        <NoteDetail label="AVDs" value={note.terapiaOcupacional.desempenoAVD} />
                        <NoteDetail label="Cognitivo" value={note.terapiaOcupacional.componenteCognitivo} />
                        <NoteDetail label="Motor/Sensorial" value={note.terapiaOcupacional.componenteMotor} />
                        <NoteDetail label="Adaptaciones" value={note.terapiaOcupacional.adaptaciones} />

                        {(note.terapiaOcupacional.numeroSesiones !== undefined || note.terapiaOcupacional.duracionMeses !== undefined) && (
                             <div className="mt-2 pt-2 border-t border-green-200">
                                <h6 className="text-xs font-semibold text-green-800">Plan y Pronóstico</h6>
                                <NoteDetail label="Sesiones Programadas" value={note.terapiaOcupacional.numeroSesiones} />
                                <NoteDetail label="Duración Estimada" value={note.terapiaOcupacional.duracionMeses ? `${note.terapiaOcupacional.duracionMeses} Meses` : undefined} />
                                <NoteDetail label="Egreso Rehabilitación" value={note.terapiaOcupacional.tieneEgresoRehabilitacion ? 'Sí' : 'No'} />
                                <NoteDetail label="Se dejó Plan Casero" value={note.terapiaOcupacional.planCasero ? 'Sí' : 'No'} />
                                <NoteDetail label="Justificación Continuidad" value={note.terapiaOcupacional.justificacionContinuidad} />
                             </div>
                        )}
                    </div>
                )}

                {/* Fonoaudiologia */}
                {isFonoNote && note.fonoaudiologia && (
                    <div className="space-y-1 bg-yellow-50 p-2 rounded">
                        <h5 className="text-xs font-bold text-yellow-700 mb-1">Valoración Fonoaudiología</h5>
                        <NoteDetail label="Vía Alimentación" value={note.fonoaudiologia.viaAlimentacion} />
                        <NoteDetail label="Consistencia" value={note.fonoaudiologia.consistenciaDieta} />
                        <NoteDetail label="Deglución" value={note.fonoaudiologia.estadoDeglucion} />
                        <NoteDetail label="Comunicación" value={note.fonoaudiologia.estadoComunicativo} />

                         {(note.fonoaudiologia.numeroSesiones !== undefined || note.fonoaudiologia.duracionMeses !== undefined) && (
                             <div className="mt-2 pt-2 border-t border-yellow-200">
                                <h6 className="text-xs font-semibold text-yellow-800">Plan y Pronóstico</h6>
                                <NoteDetail label="Sesiones Programadas" value={note.fonoaudiologia.numeroSesiones} />
                                <NoteDetail label="Duración Estimada" value={note.fonoaudiologia.duracionMeses ? `${note.fonoaudiologia.duracionMeses} Meses` : undefined} />
                                <NoteDetail label="Egreso Rehabilitación" value={note.fonoaudiologia.tieneEgresoRehabilitacion ? 'Sí' : 'No'} />
                                <NoteDetail label="Se dejó Plan Casero" value={note.fonoaudiologia.planCasero ? 'Sí' : 'No'} />
                                <NoteDetail label="Justificación Continuidad" value={note.fonoaudiologia.justificacionContinuidad} />
                             </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Notification Banner */}
            {notification && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in ${
                    notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {notification.type === 'success' 
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        }
                    </svg>
                    <span className="font-medium">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-4 hover:bg-white/20 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-brand-blue">{safeRender(patient.nombreCompleto)}</h3>
                        <p className="text-sm text-gray-600">ID: {safeRender(patient.id)} | Edad: {calculateAge(patient.fechaNacimiento)} años</p>
                    </div>
                     <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${
                        patient.estado === 'Aceptado' ? 'bg-green-100 text-green-800' : 
                        patient.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                        {safeRender(patient.estado)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <h4 className="col-span-full text-lg font-semibold text-gray-700 border-b pb-2 mb-2">Datos de Identificación</h4>
                <DetailItem label="Tipo de Documento" value={patient.tipoDocumento} />
                <DetailItem label="Teléfono Móvil" value={patient.telefonoMovil} />
                <DetailItem label="Teléfono Fijo" value={patient.telefonoFijo} />
                <DetailItem label="Cuidador Principal" value={patient.cuidadorPrincipal} />
                <DetailItem label="Teléfono del Cuidador" value={patient.telefonoCuidador} />
                <DetailItem label="Alérgico a Medicamentos" value={patient.alergicoMedicamentos} />
                {patient.alergicoMedicamentos && patient.alergiasInfo && <DetailItem label="Detalle Alergias" value={patient.alergiasInfo} />}
                <div className="col-span-full">
                    <p className="text-sm font-medium text-gray-500">Dirección</p>
                    <div className="flex items-center gap-4">
                         <p className="text-md text-gray-900">{safeRender(patient.direccion)}</p>
                         <button onClick={handleOpenMap} className="text-sm text-blue-600 hover:underline">Ver en mapa</button>
                    </div>
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <h4 className="col-span-full text-lg font-semibold text-gray-700 border-b pb-2 mb-2">Datos Clínicos</h4>
                <DetailItem label="Clínica de Egreso" value={patient.clinicaEgreso} />
                <DetailItem label="Diagnóstico de Egreso" value={patient.diagnosticoEgreso} />
                <div className="md:col-span-2"><DetailItem label="Programa" value={patient.programa} /></div>
                
                <div className="col-span-full">
                     <p className="text-sm font-medium text-gray-500">Terapias Requeridas</p>
                     <ul className="list-disc list-inside text-md text-gray-900">
                        {patient.terapias && typeof patient.terapias === 'object' && patient.terapias !== null && Object.entries(patient.terapias).filter(([_, required]) => required).map(([terapia]) => (
                            <li key={terapia}>{terapia}</li>
                        ))}
                    </ul>
                </div>

                {patient.terapias?.['Oxígeno'] && patient.oxigeno && (
                    <>
                        <DetailItem label="Dispositivo de Oxígeno" value={patient.oxigeno.dispositivo} />
                        <DetailItem label="Litraje de Oxígeno" value={`${safeRender(patient.oxigeno.litraje, 0)} L/min`} />
                    </>
                )}
                {patient.terapias?.['Manejo de Sondas'] && patient.sondaInfo && (
                    <DetailItem label="Tipo de Sonda" value={patient.sondaInfo.tipo} />
                )}
                {patient.terapias?.['curación mayor en casa por enfermería'] && patient.heridaInfo && (
                    <>
                        <DetailItem label="Tipo de Herida" value={patient.heridaInfo.tipo} />
                        <DetailItem label="Localización de Herida" value={patient.heridaInfo.localizacion} />
                    </>
                )}
                {patient.terapias?.['Toma de glucometrías'] && patient.glucometriaInfo && (
                    <DetailItem label="Frecuencia Glucometrías" value={patient.glucometriaInfo.frecuencia} />
                )}
                {patient.terapias?.['Otras terapias'] && patient.otrasTerapiasInfo && (
                    <div className="md:col-span-2"><DetailItem label="Detalle Otras Terapias" value={patient.otrasTerapiasInfo} /></div>
                )}
                
                {patient.terapias?.['Aplicación de terapia antibiótica'] && patient.antibiotico && (
                    <>
                        <h5 className="col-span-full font-semibold text-gray-600 mt-2">Tratamiento Antibiótico</h5>
                        <DetailItem label="Medicamento" value={patient.antibiotico.medicamento} />
                        <DetailItem label="Dosis" value={`${safeRender(patient.antibiotico.miligramos, 0)} mg / ${safeRender(patient.antibiotico.frecuenciaHoras, 0)}h`} />
                        <DetailItem label="Fecha Inicio" value={patient.antibiotico.fechaInicio} />
                        <DetailItem label="Fecha Fin" value={patient.antibiotico.fechaTerminacion} />
                        <DetailItem label="Progreso" value={`Día ${safeRender(patient.antibiotico.diaActual, 0)} de ${safeRender(patient.antibiotico.diasTotales, 0)}`} />
                    </>
                )}
            </div>
            
            <div className="border-t pt-4">
                <button
                    onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                    className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-700 hover:text-brand-blue transition-colors"
                    aria-expanded={isHistoryVisible}
                >
                    <span>Historial de Novedades ({patientNotes.length})</span>
                     <svg xmlns="http://www.w.org/2000/svg" className={`h-5 w-5 transition-transform ${isHistoryVisible ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                {isHistoryVisible && (
                    <div className="mt-4 space-y-4 max-h-60 overflow-y-auto pr-2 border-l-2 border-gray-100 pl-4">
                        {patientNotes.length > 0 ? (
                            patientNotes.map((note: HandoverNote) => (
                                <div key={note.id} className="bg-gray-50 p-3 rounded-md border text-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="font-bold text-gray-800">{safeRender(note.authorName)}</p>
                                            <p className="text-xs text-gray-500">{safeRender(note.authorRole)}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{new Date(note.timestamp).toLocaleString('es-CO')}</span>
                                    </div>
                                    {renderNoteContent(note)}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">No hay novedades registradas para este paciente.</p>
                        )}
                    </div>
                )}
            </div>

            {canManage && (
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button variant="secondary" onClick={() => onEdit(patient)}>Editar</Button>
                    {patient.estado === 'Pendiente' && (
                        <>
                            <Button variant="danger" onClick={handleRejectClick}>Rechazar</Button>
                            <Button onClick={handleAcceptPatient}>Aceptar Paciente</Button>
                        </>
                    )}
                </div>
            )}
            
            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Confirmar Rechazo">
                <div className="space-y-4">
                    <p className="text-gray-700">
                        ¿Está seguro de que desea rechazar a este paciente? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-4">
                        <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={confirmRejection}>Rechazar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PatientCard;
