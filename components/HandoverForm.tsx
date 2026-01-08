
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { HandoverNote } from '../types.ts';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassRadioGroup, GlassTextArea, GlassCheckbox } from './ui/GlassComponents.tsx';
import { GUIA_INFUSION_ANTIBIOTICOS, ANTIBIOTICOS, OXIGENO_DISPOSITIVOS, Icons, ROLES_ASISTENCIALES } from '../constants.tsx';
import { aiService } from '../utils/aiService.ts';

// --- Constants based on the Google Form ---
const VITAL_SIGNS_OPTIONS = ["Tomado y Registrado en Historia Clinica", "No se toma por orden médica", "Paciente no permite la toma"];
const MEDICAMENTOS_OPTIONS = ["Se administra medicamento vía oral según horario", "Se administra medicamento vía endovenosa según horario", "Se administra medicamento vía intramuscular según horario", "No aplica"];
const CURACIONES_OPTIONS = ["Se realiza curación según técnica", "No tiene curaciones pendientes"];
const SONDAS_OPTIONS = ["Se realiza cambio de sonda según protocolo", "No tiene sondas"];
const GLUCOMETRIAS_OPTIONS = ["Se realiza glucometria y se registra en la historia clínica", "No tiene glucometrias pendientes"];
const SOPORTE_NUTRICIONAL_OPTIONS = ["Se administra soporte nutricional según indicación médica", "No tiene soporte nutricional"];

// --- Therapies Options ---
const MODALIDAD_FISIO_OPTIONS = ["Terapia Respiratoria", "Terapia Física", "Integral (Física y Respiratoria)"];
const SECRECIONES_OPTIONS = ["Ausentes", "Escasas / Hialinas", "Abundantes / Mucopurulentas", "Manejo con aspiración"];
const CONSISTENCIA_DIETA_OPTIONS = ["Líquida Clara", "Líquida Completa", "Semisólida (Papilla/Puré)", "Sólida Blanda", "Normal"];
const VIA_ALIMENTACION_OPTIONS = ["Oral", "Sonda Nasogástrica", "Gastrostomía", "Parenteral"];

// --- Doctor Specific Options ---
const ANTIBIOTIC_ACTIONS = ["Iniciar Tratamiento", "Continuar Tratamiento", "Cambiar Antibiótico", "Finalizar Tratamiento", "No Aplica"];
const OXYGEN_ACTIONS = ["Sí, iniciar/continuar oxígeno", "No requiere oxígeno"];

type VitalSigns = {
    tensionArterial: string;
    frecuenciaCardiaca: string;
    frecuenciaRespiratoria: string;
    temperatura: string;
    saturacionO2: string;
};

const VITAL_SIGNS_FIELDS: { key: keyof VitalSigns; label: string }[] = [
    { key: 'tensionArterial', label: 'Tension Arterial' },
    { key: 'frecuenciaCardiaca', label: 'Frecuencia Cardiaca' },
    { key: 'frecuenciaRespiratoria', label: 'Frecuencia Respiratoria' },
    { key: 'temperatura', label: 'Temperatura' },
    { key: 'saturacionO2', label: 'Saturación O2' },
];


const HandoverForm: React.FC = () => {
    // Fix: Destructure properties directly from useAppContext as the 'state' object is no longer part of the context type.
    const { user, patients, addHandoverNote } = useAppContext();

    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [note, setNote] = useState(''); // Used for "Novedades y/o Pendientes" / "Evolución"

    // Specific fields for MEDICO DOMICILIARIO
    const [medAction, setMedAction] = useState('');
    const [medAntibioticName, setMedAntibioticName] = useState('');
    const [medDose, setMedDose] = useState<number | ''>('');
    const [medFreq, setMedFreq] = useState<number | ''>('');
    const [medDays, setMedDays] = useState<number | ''>('');

    // Oxygen Doctor fields
    const [oxygenAction, setOxygenAction] = useState('');
    const [oxygenDevice, setOxygenDevice] = useState('');
    const [oxygenLiters, setOxygenLiters] = useState<number | ''>('');

    const [labRequests, setLabRequests] = useState('');
    const [referralInfo, setReferralInfo] = useState('');
    const [dischargeOrders, setDischargeOrders] = useState('');

    // Specific fields for ENFERMERO(A) JEFE PAD ADMINISTRATIVO
    const [ivAccessInfo, setIvAccessInfo] = useState('');
    const [phlebitisScale, setPhlebitisScale] = useState<number>(0);
    const [pressureUlcersInfo, setPressureUlcersInfo] = useState('');

    // Specific fields for AUXILIAR DE ENFERMERIA
    const [signosVitales, setSignosVitales] = useState<VitalSigns>({ tensionArterial: '', frecuenciaCardiaca: '', frecuenciaRespiratoria: '', temperatura: '', saturacionO2: '' });
    const [administracionMedicamentos, setAdministracionMedicamentos] = useState('');
    const [curaciones, setCuraciones] = useState('');
    const [manejoSondas, setManejoSondas] = useState('');
    const [tomaGlucometrias, setTomaGlucometrias] = useState('');
    const [soporteNutricional, setSoporteNutricional] = useState('');
    const [estadoPiel, setEstadoPiel] = useState('');
    const [showInfusionGuide, setShowInfusionGuide] = useState(false);

    // Specific fields for FISIOTERAPIA
    const [fisioModalidad, setFisioModalidad] = useState('');
    const [fisioAuscultacion, setFisioAuscultacion] = useState('');
    const [fisioPatron, setFisioPatron] = useState('');
    const [fisioSecreciones, setFisioSecreciones] = useState('');
    const [fisioMovilidad, setFisioMovilidad] = useState('');
    const [fisioSesiones, setFisioSesiones] = useState<number | ''>('');
    const [fisioDuracion, setFisioDuracion] = useState<number | ''>('');
    const [fisioEgreso, setFisioEgreso] = useState(false);
    const [fisioPlanCasero, setFisioPlanCasero] = useState(false);
    const [fisioJustificacion, setFisioJustificacion] = useState('');


    // Specific fields for TERAPIA OCUPACIONAL
    const [toDesempenoAVD, setToDesempenoAVD] = useState('');
    const [toCognitivo, setToCognitivo] = useState('');
    const [toMotor, setToMotor] = useState('');
    const [toAdaptaciones, setToAdaptaciones] = useState('');
    // New TO fields
    const [toSesiones, setToSesiones] = useState<number | ''>('');
    const [toDuracion, setToDuracion] = useState<number | ''>('');
    const [toEgreso, setToEgreso] = useState(false);
    const [toPlanCasero, setToPlanCasero] = useState(false);
    const [toJustificacion, setToJustificacion] = useState('');

    // Specific fields for FONOAUDIOLOGIA
    const [fonoVia, setFonoVia] = useState('');
    const [fonoDieta, setFonoDieta] = useState('');
    const [fonoDeglucion, setFonoDeglucion] = useState('');
    const [fonoComunicacion, setFonoComunicacion] = useState('');
    // New Fono fields
    const [fonoSesiones, setFonoSesiones] = useState<number | ''>('');
    const [fonoDuracion, setFonoDuracion] = useState<number | ''>('');
    const [fonoEgreso, setFonoEgreso] = useState(false);
    const [fonoPlanCasero, setFonoPlanCasero] = useState(false);
    const [fonoJustificacion, setFonoJustificacion] = useState('');


    const acceptedPatients = useMemo(() => {
        if (!Array.isArray(patients)) {
            return [];
        }
        return patients.filter(p =>
            p &&
            (typeof p.id === 'string' || typeof p.id === 'number') &&
            typeof p.nombreCompleto === 'string' &&
            p.estado === 'Aceptado'
        );
    }, [patients]);

    const userCargo = user?.cargo || '';

    // Role Detection - Updated to be more robust based on ROLES_ASISTENCIALES
    const isMedico = userCargo === 'MEDICO DOMICILIARIO' || userCargo === 'JEFE MEDICO';
    const isJefeEnfermeria = userCargo.includes('ENFERMERO(A) JEFE');
    const isAuxiliar = userCargo.includes('AUXILIAR DE ENFERMERIA');
    const isFisioterapeuta = userCargo.includes('FISIOTERAPEUTA');
    const isTerapeutaOcupacional = userCargo.includes('TERAPEUTA OCUPACIONAL');
    const isFonoaudiologo = userCargo.includes('FONOAUDIOLOGO');

    // AI Assistant State
    const [aiClinicalResponse, setAiClinicalResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleClinicalAnalysis = async () => {
        if (!selectedPatientId) return;
        setIsAiLoading(true);
        setAiClinicalResponse('');

        try {
            const currentPatient = acceptedPatients.find(p => p.id === selectedPatientId);
            const context = `
                Paciente: ${currentPatient?.nombreCompleto}
                Edad: ${currentPatient?.fechaNacimiento}
                Programa: ${currentPatient?.programa}
                Estado Actual: ${currentPatient?.estado}
                Nota de Turno Actual: ${note}
                Signos Vitales: ${JSON.stringify(signosVitales)}
            `;

            const response = await aiService.runClinicalInference(
                "Analiza la condición actual del paciente y la nota de evolución. Proporciona sugerencias clínicas o alertas si es necesario.",
                context
            );

            setAiClinicalResponse(response.text || response.error || "No se pudo obtener análisis clínico.");
        } catch (error) {
            setAiClinicalResponse("Error al procesar el análisis clínico.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const resetForms = () => {
        setSelectedPatientId('');
        setNote('');

        // Medico
        setMedAction('');
        setMedAntibioticName('');
        setMedDose('');
        setMedFreq('');
        setMedDays('');
        setOxygenAction('');
        setOxygenDevice('');
        setOxygenLiters('');
        setLabRequests('');
        setReferralInfo('');
        setDischargeOrders('');

        // Jefe
        setIvAccessInfo('');
        setPhlebitisScale(0);
        setPressureUlcersInfo('');

        // Auxiliar
        setSignosVitales({ tensionArterial: '', frecuenciaCardiaca: '', frecuenciaRespiratoria: '', temperatura: '', saturacionO2: '' });
        setAdministracionMedicamentos('');
        setCuraciones('');
        setManejoSondas('');
        setTomaGlucometrias('');
        setSoporteNutricional('');
        setEstadoPiel('');
        setShowInfusionGuide(false);

        // Fisio
        setFisioModalidad('');
        setFisioAuscultacion('');
        setFisioPatron('');
        setFisioSecreciones('');
        setFisioMovilidad('');
        setFisioSesiones('');
        setFisioDuracion('');
        setFisioEgreso(false);
        setFisioPlanCasero(false);
        setFisioJustificacion('');

        // TO
        setToDesempenoAVD('');
        setToCognitivo('');
        setToMotor('');
        setToAdaptaciones('');
        setToSesiones('');
        setToDuracion('');
        setToEgreso(false);
        setToPlanCasero(false);
        setToJustificacion('');

        // Fono
        setFonoVia('');
        setFonoDieta('');
        setFonoDeglucion('');
        setFonoComunicacion('');
        setFonoSesiones('');
        setFonoDuracion('');
        setFonoEgreso(false);
        setFonoPlanCasero(false);
        setFonoJustificacion('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatientId || !user) return;

        const newNote: HandoverNote = {
            id: new Date().toISOString(),
            patientId: selectedPatientId,
            authorId: user.documento,
            authorName: user.nombre,
            authorRole: user.cargo,
            timestamp: new Date().toISOString(),
            note: note,
        };

        // Add role-specific data
        if (isMedico) {
            newNote.antibioticData = {
                action: medAction,
                medicamento: (medAction === 'Iniciar Tratamiento' || medAction === 'Cambiar Antibiótico') ? medAntibioticName : undefined,
                dosisMg: (medAction === 'Iniciar Tratamiento' || medAction === 'Cambiar Antibiótico') && medDose !== '' ? Number(medDose) : undefined,
                frecuenciaHoras: (medAction === 'Iniciar Tratamiento' || medAction === 'Cambiar Antibiótico') && medFreq !== '' ? Number(medFreq) : undefined,
                diasTratamiento: (medAction === 'Iniciar Tratamiento' || medAction === 'Cambiar Antibiótico') && medDays !== '' ? Number(medDays) : undefined,
            };
            // Legacy/Fallback string
            newNote.antibioticStatus = medAction + (medAntibioticName ? `: ${medAntibioticName}` : '');

            // Construct Oxygen Info
            let finalOxygenInfo = oxygenAction;
            if (oxygenAction === "Sí, iniciar/continuar oxígeno") {
                finalOxygenInfo += `. Dispositivo: ${oxygenDevice}, Litros/Min: ${oxygenLiters}`;
            }
            newNote.oxygenInfo = finalOxygenInfo;

            newNote.labRequests = labRequests;
            newNote.referralInfo = referralInfo;
            newNote.dischargeOrders = dischargeOrders;
        } else if (isJefeEnfermeria) {
            newNote.ivAccessInfo = ivAccessInfo;
            newNote.phlebitisScale = phlebitisScale;
            newNote.pressureUlcersInfo = pressureUlcersInfo;
        } else if (isAuxiliar) {
            newNote.signosVitales = signosVitales;
            newNote.administracionMedicamentos = administracionMedicamentos;
            newNote.curaciones = curaciones;
            newNote.manejoSondas = manejoSondas;
            newNote.tomaGlucometrias = tomaGlucometrias;
            newNote.soporteNutricional = soporteNutricional;
            newNote.estadoPiel = estadoPiel;
        } else if (isFisioterapeuta) {
            newNote.fisioterapia = {
                modalidad: fisioModalidad,
                auscultacion: fisioAuscultacion,
                patronRespiratorio: fisioPatron,
                secreciones: fisioSecreciones,
                fuerzaMovilidad: fisioMovilidad,
                numeroSesiones: fisioSesiones === '' ? undefined : Number(fisioSesiones),
                duracionMeses: fisioDuracion === '' ? undefined : Number(fisioDuracion),
                tieneEgresoRehabilitacion: fisioEgreso,
                planCasero: fisioPlanCasero,
                justificacionContinuidad: fisioJustificacion
            };
        } else if (isTerapeutaOcupacional) {
            newNote.terapiaOcupacional = {
                desempenoAVD: toDesempenoAVD,
                componenteCognitivo: toCognitivo,
                componenteMotor: toMotor,
                adaptaciones: toAdaptaciones,
                numeroSesiones: toSesiones === '' ? undefined : Number(toSesiones),
                duracionMeses: toDuracion === '' ? undefined : Number(toDuracion),
                tieneEgresoRehabilitacion: toEgreso,
                planCasero: toPlanCasero,
                justificacionContinuidad: toJustificacion
            };
        } else if (isFonoaudiologo) {
            newNote.fonoaudiologia = {
                viaAlimentacion: fonoVia,
                consistenciaDieta: fonoDieta,
                estadoDeglucion: fonoDeglucion,
                estadoComunicativo: fonoComunicacion,
                numeroSesiones: fonoSesiones === '' ? undefined : Number(fonoSesiones),
                duracionMeses: fonoDuracion === '' ? undefined : Number(fonoDuracion),
                tieneEgresoRehabilitacion: fonoEgreso,
                planCasero: fonoPlanCasero,
                justificacionContinuidad: fonoJustificacion
            };
        }

        addHandoverNote(newNote);
        resetForms();
        alert('Novedad de turno registrada exitosamente.');
    };


    const renderMedicoForm = () => (
        <div className="space-y-6 animate-fade-in">
            <GlassRadioGroup
                label="Gestión de Antibióticos"
                name="medAction"
                options={ANTIBIOTIC_ACTIONS}
                selectedValue={medAction}
                onChange={e => setMedAction(e.target.value)}
            />

            {(medAction === "Iniciar Tratamiento" || medAction === "Cambiar Antibiótico") && (
                <GlassCard className="!bg-[#00E5FF]/5 border-[#00E5FF]/20 space-y-4">
                    <h5 className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">Detalles de la Prescripción</h5>
                    <GlassSelect
                        label="Antibiótico"
                        options={ANTIBIOTICOS}
                        value={medAntibioticName}
                        onChange={e => setMedAntibioticName(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <GlassInput
                            label="Dosis (mg)"
                            type="number"
                            value={medDose}
                            onChange={e => setMedDose(parseInt(e.target.value) || '')}
                            placeholder="Ej: 500"
                            required
                        />
                        <GlassInput
                            label="Intervalo (Hrs)"
                            type="number"
                            value={medFreq}
                            onChange={e => setMedFreq(parseInt(e.target.value) || '')}
                            placeholder="Ej: 8"
                            required
                        />
                        <GlassInput
                            label="Días"
                            type="number"
                            value={medDays}
                            onChange={e => setMedDays(parseInt(e.target.value) || '')}
                            placeholder="Ej: 7"
                            required
                        />
                    </div>
                </GlassCard>
            )}

            <div className="border-t border-white/5 pt-6">
                <GlassRadioGroup
                    label="Gestión de Oxígeno"
                    name="oxygenAction"
                    options={OXYGEN_ACTIONS}
                    selectedValue={oxygenAction}
                    onChange={e => setOxygenAction(e.target.value)}
                />

                {oxygenAction === "Sí, iniciar/continuar oxígeno" && (
                    <GlassCard className="!bg-[#00E5FF]/5 border-[#00E5FF]/20 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GlassSelect
                            label="Dispositivo"
                            options={OXIGENO_DISPOSITIVOS}
                            value={oxygenDevice}
                            onChange={e => setOxygenDevice(e.target.value)}
                            required
                        />
                        <GlassInput
                            label="Litros / min"
                            type="number"
                            value={oxygenLiters}
                            onChange={e => setOxygenLiters(parseFloat(e.target.value) || '')}
                            placeholder="Ej: 2"
                            step="0.5"
                            required
                        />
                    </GlassCard>
                )}
            </div>

            <div className="space-y-4">
                <GlassInput label="Laboratorios Solicitados" value={labRequests} onChange={e => setLabRequests(e.target.value)} />
                <GlassInput label="Remisiones / Deterioro" value={referralInfo} onChange={e => setReferralInfo(e.target.value)} />
                <GlassInput label="Plan de Egreso / Órdenes" value={dischargeOrders} onChange={e => setDischargeOrders(e.target.value)} />
            </div>
        </div>
    );


    const renderJefeEnfermeriaForm = () => (
        <div className="space-y-6 animate-fade-in">
            <GlassInput label="Accesos Venosos (Punciones/Cambios)" value={ivAccessInfo} onChange={e => setIvAccessInfo(e.target.value)} />
            <div className="space-y-2">
                <GlassSelect
                    label="Escala de Flebitis"
                    options={[
                        { value: '0', label: '0 - Sin síntomas' },
                        { value: '1', label: '1 - Eritema' },
                        { value: '2', label: '2 - Dolor, eritema, edema' },
                        { value: '3', label: '3 - Induración, cordón palpable' },
                        { value: '4', label: '4 - Cordón palpable > 2.5 cm, purulencia' }
                    ]}
                    value={phlebitisScale.toString()}
                    onChange={e => setPhlebitisScale(Number(e.target.value))}
                />
            </div>
            <GlassInput label="Úlceras por Presión / Estado" value={pressureUlcersInfo} onChange={e => setPressureUlcersInfo(e.target.value)} />
        </div>
    );

    const handleSignosVitalesChange = (key: keyof VitalSigns, value: string) => {
        setSignosVitales(prev => ({ ...prev, [key]: value }));
    };

    const renderAuxiliarForm = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {VITAL_SIGNS_FIELDS.map(field => (
                    <GlassRadioGroup
                        key={field.key}
                        label={field.label}
                        name={field.key}
                        options={VITAL_SIGNS_OPTIONS}
                        selectedValue={signosVitales[field.key]}
                        onChange={(e) => handleSignosVitalesChange(field.key, e.target.value)}
                    />
                ))}
            </div>

            <div className="border-t border-white/5 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <GlassRadioGroup label="Administración de Medicamentos" name="medicamentos" options={MEDICAMENTOS_OPTIONS} selectedValue={administracionMedicamentos} onChange={e => setAdministracionMedicamentos(e.target.value)} />
                    <div className="mt-4">
                        <button type="button" onClick={() => setShowInfusionGuide(!showInfusionGuide)} className="text-[#00E5FF] text-xs font-bold uppercase tracking-widest hover:text-[#00B8CC] transition-colors flex items-center gap-2">
                            {showInfusionGuide ? '[-] Ocultar Guía' : '[+] Ver Guía de Infusión'}
                        </button>
                        {showInfusionGuide && (
                            <div className="mt-4 overflow-hidden border border-white/10 rounded-xl bg-white/5 backdrop-blur-md animate-slide-up">
                                <table className="min-w-full text-[10px] text-left text-gray-400">
                                    <thead className="bg-white/5 font-bold text-gray-300 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-3 py-2">Antibiótico</th>
                                            <th className="px-3 py-2">Vehículo</th>
                                            <th className="px-3 py-2">Vol.</th>
                                            <th className="px-3 py-2">Tiempo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {GUIA_INFUSION_ANTIBIOTICOS.map((item, index) => (
                                            <tr key={index} className="hover:bg-white/5 transition-colors">
                                                <td className="px-3 py-2 font-medium text-[#00E5FF]">{item.antibiotico}</td>
                                                <td className="px-3 py-2">{item.vehiculo}</td>
                                                <td className="px-3 py-2">{item.volumen}</td>
                                                <td className="px-3 py-2">{item.tiempo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <GlassRadioGroup label="Curaciones Realizadas" name="curaciones" options={CURACIONES_OPTIONS} selectedValue={curaciones} onChange={e => setCuraciones(e.target.value)} />
                <GlassRadioGroup label="Manejo de Sondas" name="sondas" options={SONDAS_OPTIONS} selectedValue={manejoSondas} onChange={e => setManejoSondas(e.target.value)} />
                <GlassRadioGroup label="Toma de Glucometrías" name="glucometrias" options={GLUCOMETRIAS_OPTIONS} selectedValue={tomaGlucometrias} onChange={e => setTomaGlucometrias(e.target.value)} />
                <GlassRadioGroup label="Soporte Nutricional" name="nutricion" options={SOPORTE_NUTRICIONAL_OPTIONS} selectedValue={soporteNutricional} onChange={e => setSoporteNutricional(e.target.value)} />
            </div>

            <GlassTextArea label="Estado de Piel / Hallazgos" placeholder="Descripción detallada de la piel..." value={estadoPiel} onChange={e => setEstadoPiel(e.target.value)} />
        </div>
    );


    const renderFisioterapiaForm = () => (
        <div className="space-y-8 animate-fade-in">
            <GlassRadioGroup label="Modalidad Realizada" name="fisioModalidad" options={MODALIDAD_FISIO_OPTIONS} selectedValue={fisioModalidad} onChange={e => setFisioModalidad(e.target.value)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassInput label="Auscultación Pulmonar" value={fisioAuscultacion} onChange={e => setFisioAuscultacion(e.target.value)} placeholder="Ruidos sobreagregados..." />
                <GlassInput label="Patrón Respiratorio" value={fisioPatron} onChange={e => setFisioPatron(e.target.value)} placeholder="Ej: Diafragmático" />
            </div>

            <GlassRadioGroup label="Manejo de Secreciones" name="fisioSecreciones" options={SECRECIONES_OPTIONS} selectedValue={fisioSecreciones} onChange={e => setFisioSecreciones(e.target.value)} />
            <GlassInput label="Movilidad y Fuerza Muscular" value={fisioMovilidad} onChange={e => setFisioMovilidad(e.target.value)} placeholder="Ej: 4/5 Global" />

            <GlassCard className="!bg-[#00E5FF]/5 border-[#00E5FF]/20 space-y-6">
                <h4 className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">Plan de Manejo y Pronóstico</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GlassInput
                        label="Total Sesiones"
                        type="number"
                        value={fisioSesiones}
                        onChange={e => setFisioSesiones(parseInt(e.target.value) || '')}
                        placeholder="10"
                    />
                    <GlassInput
                        label="Duración (Meses)"
                        type="number"
                        value={fisioDuracion}
                        onChange={e => setFisioDuracion(parseInt(e.target.value) || '')}
                        placeholder="3"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <GlassCheckbox
                        label="Egreso de Rehabilitación"
                        checked={fisioEgreso}
                        onChange={e => setFisioEgreso(e.target.checked)}
                    />
                    <GlassCheckbox
                        label="Plan Casero Entregado"
                        checked={fisioPlanCasero}
                        onChange={e => setFisioPlanCasero(e.target.checked)}
                    />
                </div>

                <GlassTextArea
                    label="Justificación de Continuidad"
                    placeholder="Especifique objetivos pendientes..."
                    value={fisioJustificacion}
                    onChange={e => setFisioJustificacion(e.target.value)}
                />
            </GlassCard>

            <GlassTextArea
                label="Evolución y Notas Adicionales"
                placeholder="Tolerancia, respuesta al tratamiento..."
                value={note}
                onChange={e => setNote(e.target.value)}
            />
        </div>
    );


    const renderTerapiaOcupacionalForm = () => (
        <div className="space-y-8 animate-fade-in">
            <GlassInput label="Desempeño en AVD" value={toDesempenoAVD} onChange={e => setToDesempenoAVD(e.target.value)} placeholder="Ej: Independiente en alimentación" />
            <GlassInput label="Componente Cognitivo" value={toCognitivo} onChange={e => setToCognitivo(e.target.value)} placeholder="Ej: Alerta, orientado" />
            <GlassInput label="Habilidades Motoras" value={toMotor} onChange={e => setToMotor(e.target.value)} placeholder="Ej: Pinza fina conservada" />
            <GlassInput label="Adaptaciones / Entorno" value={toAdaptaciones} onChange={e => setToAdaptaciones(e.target.value)} placeholder="Ej: Cojín antiescaras" />

            <GlassCard className="!bg-[#00E5FF]/5 border-[#00E5FF]/20 space-y-6">
                <h4 className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">Plan de Manejo y Pronóstico</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GlassInput
                        label="Total Sesiones"
                        type="number"
                        value={toSesiones}
                        onChange={e => setToSesiones(parseInt(e.target.value) || '')}
                        placeholder="8"
                    />
                    <GlassInput
                        label="Duración (Meses)"
                        type="number"
                        value={toDuracion}
                        onChange={e => setToDuracion(parseInt(e.target.value) || '')}
                        placeholder="2"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <GlassCheckbox
                        label="Egreso de Rehabilitación"
                        checked={toEgreso}
                        onChange={e => setToEgreso(e.target.checked)}
                    />
                    <GlassCheckbox
                        label="Plan Casero Entregado"
                        checked={toPlanCasero}
                        onChange={e => setToPlanCasero(e.target.checked)}
                    />
                </div>

                <GlassTextArea
                    label="Justificación de Continuidad"
                    placeholder="Especifique objetivos..."
                    value={toJustificacion}
                    onChange={e => setToJustificacion(e.target.value)}
                />
            </GlassCard>

            <GlassTextArea
                label="Evolución y Notas Adicionales"
                placeholder="Describa el progreso..."
                value={note}
                onChange={e => setNote(e.target.value)}
            />
        </div>
    );

    const renderFonoaudiologiaForm = () => (
        <div className="space-y-8 animate-fade-in">
            <GlassRadioGroup label="Vía de Alimentación" name="fonoVia" options={VIA_ALIMENTACION_OPTIONS} selectedValue={fonoVia} onChange={e => setFonoVia(e.target.value)} />
            <GlassRadioGroup label="Consistencia de Dieta" name="fonoDieta" options={CONSISTENCIA_DIETA_OPTIONS} selectedValue={fonoDieta} onChange={e => setFonoDieta(e.target.value)} />

            <GlassInput label="Estado de Deglución" value={fonoDeglucion} onChange={e => setFonoDeglucion(e.target.value)} placeholder="Ej: Funcional..." />
            <GlassInput label="Lenguaje / Comunicación" value={fonoComunicacion} onChange={e => setFonoComunicacion(e.target.value)} placeholder="Ej: Disartria leve..." />

            <GlassCard className="!bg-[#00E5FF]/5 border-[#00E5FF]/20 space-y-6">
                <h4 className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">Plan de Manejo y Pronóstico</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GlassInput
                        label="Total Sesiones"
                        type="number"
                        value={fonoSesiones}
                        onChange={e => setFonoSesiones(parseInt(e.target.value) || '')}
                        placeholder="12"
                    />
                    <GlassInput
                        label="Duración (Meses)"
                        type="number"
                        value={fonoDuracion}
                        onChange={e => setFonoDuracion(parseInt(e.target.value) || '')}
                        placeholder="4"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <GlassCheckbox
                        label="Egreso de Rehabilitación"
                        checked={fonoEgreso}
                        onChange={e => setFonoEgreso(e.target.checked)}
                    />
                    <GlassCheckbox
                        label="Plan Casero Entregado"
                        checked={fonoPlanCasero}
                        onChange={e => setFonoPlanCasero(e.target.checked)}
                    />
                </div>

                <GlassTextArea
                    label="Justificación de Continuidad"
                    placeholder="Especifique objetivos..."
                    value={fonoJustificacion}
                    onChange={e => setFonoJustificacion(e.target.value)}
                />
            </GlassCard>

            <GlassTextArea
                label="Evolución y Notas Adicionales"
                placeholder="Detalles de la sesión..."
                value={note}
                onChange={e => setNote(e.target.value)}
            />
        </div>
    );


    const renderGenericForm = () => (
        <div className="space-y-6 animate-fade-in">
            <GlassTextArea
                label="Evolución / Nota de Turno"
                placeholder="Describa los hallazgos y novedades del turno..."
                value={note}
                onChange={e => setNote(e.target.value)}
                required
            />
        </div>
    );

    if (!selectedPatientId) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
                <GlassCard className="!p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-500">
                        <Icons.User size={32} />
                    </div>
                    <h3 className="text-xl font-outfit text-white">No se ha seleccionado paciente</h3>
                    <p className="text-gray-400 max-w-xs">Seleccione un paciente de la lista para registrar una nueva novedad de turno.</p>
                </GlassCard>
            </div>
        );
    }

    const currentPatient = acceptedPatients.find(p => p.id === selectedPatientId);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <GlassCard className="!p-8 overflow-hidden relative">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 blur-[100px] -z-10" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-outfit font-bold text-white flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
                                <Icons.Clipboard size={20} />
                            </span>
                            Novedad de Turno
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Registrando evolución para <span className="text-white font-medium">{currentPatient?.nombreCompleto || 'Paciente'}</span></p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest">
                        {user?.cargo}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {isMedico && renderMedicoForm()}
                    {isJefeEnfermeria && renderJefeEnfermeriaForm()}
                    {isAuxiliar && renderAuxiliarForm()}
                    {isFisioterapeuta && renderFisioterapiaForm()}
                    {isTerapeutaOcupacional && renderTerapiaOcupacionalForm()}
                    {isFonoaudiologo && renderFonoaudiologiaForm()}
                    {!isMedico && !isJefeEnfermeria && !isAuxiliar && !isFisioterapeuta && !isTerapeutaOcupacional && !isFonoaudiologo && renderGenericForm()}

                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-[#A855F7] flex items-center gap-2 uppercase tracking-wider">
                                <span className="p-1.5 rounded-lg bg-[#A855F7]/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" /></svg>
                                </span>
                                Asistente Clínico (Med-Gemma)
                            </h4>
                            <GlassButton
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="!py-1.5"
                                onClick={handleClinicalAnalysis}
                                disabled={isAiLoading}
                            >
                                {isAiLoading ? 'Analizando...' : 'Solicitar Análisis Clínico'}
                            </GlassButton>
                        </div>

                        {aiClinicalResponse && (
                            <div className="p-4 rounded-xl bg-[#A855F7]/5 border border-[#A855F7]/20 text-sm animate-fade-in">
                                <p className="text-gray-300 leading-relaxed font-light whitespace-pre-wrap">{aiClinicalResponse}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
                        <GlassButton type="submit" variant="primary" className="min-w-[160px]">
                            Guardar Registro
                        </GlassButton>
                    </div>
                </form>
            </GlassCard>

            <GlassCard className="!p-6 border-emerald-500/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Icons.AlertCircle size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Recordatorio de Seguridad</h4>
                        <p className="text-xs text-gray-400">Toda la información registrada debe ser verídica y corresponde a la atención brindada en el domicilio.</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default HandoverForm;
