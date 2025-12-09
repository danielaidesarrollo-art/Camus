

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { HandoverNote } from '../types.ts';
import Card from './ui/Card.tsx';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';
import Select from './ui/Select.tsx';
import { GUIA_INFUSION_ANTIBIOTICOS, ANTIBIOTICOS, OXIGENO_DISPOSITIVOS } from '../constants.tsx';

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

// --- Reusable Radio Group Component ---
const RadioGroup: React.FC<{ legend: string, name: string, options: string[], selectedValue: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ legend, name, options, selectedValue, onChange }) => (
    <fieldset className="space-y-1">
        <legend className="text-sm font-medium text-gray-700">{legend}</legend>
        <div className="flex flex-col gap-1">
            {options.map(option => (
                <label key={option} className="flex items-center text-sm">
                    <input type="radio" name={name} value={option} checked={selectedValue === option} onChange={onChange} className="h-4 w-4 text-brand-lightblue focus:ring-brand-blue border-gray-300"/>
                    <span className="ml-2 text-gray-800">{option}</span>
                </label>
            ))}
        </div>
    </fieldset>
);


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
    
    // Role Detection
    const isMedico = userCargo === 'MEDICO DOMICILIARIO';
    const isJefeEnfermeria = userCargo === 'ENFERMERO(A) JEFE PAD ADMINISTRATIVO' || userCargo === 'ENFERMERO(A) JEFE PAD';
    const isAuxiliar = userCargo.includes('AUXILIAR DE ENFERMERÍA') || userCargo.includes('AUXILIAR DE ENFERMERIA');
    const isFisioterapeuta = userCargo.includes('FISIOTERAPEUTA');
    const isTerapeutaOcupacional = userCargo.includes('TERAPEUTA OCUPACIONAL');
    const isFonoaudiologo = userCargo.includes('FONOAUDIOLOGO');

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
        <div className="space-y-4">
            <RadioGroup 
                legend="Gestión de Antibióticos" 
                name="medAction" 
                options={ANTIBIOTIC_ACTIONS} 
                selectedValue={medAction} 
                onChange={e => setMedAction(e.target.value)} 
            />

            {(medAction === "Iniciar Tratamiento" || medAction === "Cambiar Antibiótico") && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-2 space-y-3 animate-fade-in">
                    <h5 className="font-semibold text-brand-blue text-sm">Detalles de la Prescripción</h5>
                    <Select 
                        label="Antibiótico" 
                        id="antibioticSelect"
                        options={ANTIBIOTICOS} 
                        value={medAntibioticName} 
                        onChange={e => setMedAntibioticName(e.target.value)}
                        required={true}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input 
                            label="Dosis (mg)" 
                            type="number" 
                            value={medDose} 
                            onChange={e => setMedDose(parseInt(e.target.value) || '')} 
                            placeholder="Ej: 500" 
                            required={true}
                        />
                        <Input 
                            label="Intervalo (Horas)" 
                            type="number" 
                            value={medFreq} 
                            onChange={e => setMedFreq(parseInt(e.target.value) || '')} 
                            placeholder="Ej: 8" 
                            required={true}
                        />
                        <Input 
                            label="Días Prescritos" 
                            type="number" 
                            value={medDays} 
                            onChange={e => setMedDays(parseInt(e.target.value) || '')} 
                            placeholder="Ej: 7" 
                            required={true}
                        />
                    </div>
                </div>
            )}

            <div className="border-t pt-4">
                <RadioGroup 
                    legend="Gestión de Oxígeno" 
                    name="oxygenAction" 
                    options={OXYGEN_ACTIONS} 
                    selectedValue={oxygenAction} 
                    onChange={e => setOxygenAction(e.target.value)} 
                />
                
                {oxygenAction === "Sí, iniciar/continuar oxígeno" && (
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        <Select 
                            label="Dispositivo" 
                            id="oxDevice"
                            options={OXIGENO_DISPOSITIVOS} 
                            value={oxygenDevice} 
                            onChange={e => setOxygenDevice(e.target.value)}
                            required={true}
                        />
                        <Input 
                            label="Litros por minuto" 
                            type="number" 
                            value={oxygenLiters} 
                            onChange={e => setOxygenLiters(parseFloat(e.target.value) || '')} 
                            placeholder="Ej: 2" 
                            step="0.5"
                            required={true}
                        />
                    </div>
                )}
            </div>

            <Input label="Solicitud de laboratorios" value={labRequests} onChange={e => setLabRequests(e.target.value)} />
            <Input label="Solicitud de remisiones por deterioro" value={referralInfo} onChange={e => setReferralInfo(e.target.value)} />
            <Input label="Salida del paciente y órdenes" value={dischargeOrders} onChange={e => setDischargeOrders(e.target.value)} />
        </div>
    );

    const renderJefeEnfermeriaForm = () => (
         <>
            <Input label="Verificación de accesos venosos (punciones, cambios)" value={ivAccessInfo} onChange={e => setIvAccessInfo(e.target.value)} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Escala de Flebitis (0-4)</label>
              <select value={phlebitisScale} onChange={e => setPhlebitisScale(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue">
                  <option value={0}>0 - Sin síntomas</option>
                  <option value={1}>1 - Eritema</option>
                  <option value={2}>2 - Dolor, eritema, edema</option>
                  <option value={3}>3 - Induración, cordón venoso palpable</option>
                  <option value={4}>4 - Cordón venoso palpable > 2.5 cm, purulencia</option>
              </select>
            </div>
            <Input label="Presencia de úlceras por presión" value={pressureUlcersInfo} onChange={e => setPressureUlcersInfo(e.target.value)} />
        </>
    );

    const handleSignosVitalesChange = (key: keyof VitalSigns, value: string) => {
        setSignosVitales(prev => ({ ...prev, [key]: value }));
    };

    const renderAuxiliarForm = () => (
        <div className="space-y-6">
            <fieldset>
                <legend className="text-base font-semibold text-gray-800 border-b pb-2 mb-2">Signos vitales</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {VITAL_SIGNS_FIELDS.map(field => (
                        <RadioGroup
                            key={field.key}
                            legend={field.label}
                            name={field.key}
                            options={VITAL_SIGNS_OPTIONS}
                            selectedValue={signosVitales[field.key]}
                            onChange={(e) => handleSignosVitalesChange(field.key, e.target.value)}
                        />
                    ))}
                </div>
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <RadioGroup legend="Administración de Medicamentos" name="medicamentos" options={MEDICAMENTOS_OPTIONS} selectedValue={administracionMedicamentos} onChange={e => setAdministracionMedicamentos(e.target.value)} />
                    <div className="mt-2">
                         <button type="button" onClick={() => setShowInfusionGuide(!showInfusionGuide)} className="text-brand-blue text-sm underline font-medium hover:text-brand-lightblue transition-colors focus:outline-none">
                           {showInfusionGuide ? 'Ocultar Guía de Infusión' : 'Ver Guía de Dilución y Tiempos de Infusión Recomendados'}
                         </button>
                         {showInfusionGuide && (
                            <div className="mt-2 overflow-x-auto border border-gray-200 rounded-md shadow-sm bg-white">
                                <table className="min-w-full text-xs text-left text-gray-700">
                                    <thead className="bg-gray-100 font-semibold text-gray-800 border-b">
                                        <tr>
                                            <th className="px-2 py-1">Antibiótico</th>
                                            <th className="px-2 py-1">Vehículo</th>
                                            <th className="px-2 py-1">Volumen</th>
                                            <th className="px-2 py-1">Tiempo Infusión</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {GUIA_INFUSION_ANTIBIOTICOS.map((item, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-2 py-1 font-medium">{item.antibiotico}</td>
                                                <td className="px-2 py-1">{item.vehiculo}</td>
                                                <td className="px-2 py-1">{item.volumen}</td>
                                                <td className="px-2 py-1">{item.tiempo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         )}
                    </div>
                </div>

                <RadioGroup legend="Curaciones" name="curaciones" options={CURACIONES_OPTIONS} selectedValue={curaciones} onChange={e => setCuraciones(e.target.value)} />
                <RadioGroup legend="Manejo de Sondas" name="sondas" options={SONDAS_OPTIONS} selectedValue={manejoSondas} onChange={e => setManejoSondas(e.target.value)} />
                <RadioGroup legend="Toma de glucometrias" name="glucometrias" options={GLUCOMETRIAS_OPTIONS} selectedValue={tomaGlucometrias} onChange={e => setTomaGlucometrias(e.target.value)} />
                <RadioGroup legend="Soporte Nutricional" name="nutricion" options={SOPORTE_NUTRICIONAL_OPTIONS} selectedValue={soporteNutricional} onChange={e => setSoporteNutricional(e.target.value)} />
            </div>

            <div>
                <label htmlFor="estadoPiel" className="block text-sm font-medium text-gray-700 mb-1">Estado de Piel</label>
                <textarea id="estadoPiel" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue" placeholder="Descripción de la piel, si hay presencia de lesiones, etc." value={estadoPiel} onChange={e => setEstadoPiel(e.target.value)} />
            </div>
        </div>
    );

    const renderFisioterapiaForm = () => (
        <div className="space-y-4">
             <RadioGroup legend="Modalidad Realizada" name="fisioModalidad" options={MODALIDAD_FISIO_OPTIONS} selectedValue={fisioModalidad} onChange={e => setFisioModalidad(e.target.value)} />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Auscultación Pulmonar" value={fisioAuscultacion} onChange={e => setFisioAuscultacion(e.target.value)} placeholder="Ruidos sobreagregados" />
                <Input label="Patrón Respiratorio" value={fisioPatron} onChange={e => setFisioPatron(e.target.value)} placeholder="Costal, Diafragmático..." />
             </div>
             
             <RadioGroup legend="Manejo de Secreciones" name="fisioSecreciones" options={SECRECIONES_OPTIONS} selectedValue={fisioSecreciones} onChange={e => setFisioSecreciones(e.target.value)} />
             <Input label="Movilidad y Fuerza Muscular" value={fisioMovilidad} onChange={e => setFisioMovilidad(e.target.value)} placeholder="Ej: Movilidad activa 4/5" />
             
             <div className="border-t pt-4 mt-4">
                 <h4 className="font-semibold text-gray-700 mb-3">Plan de Manejo y Pronóstico</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input 
                        label="Cantidad de terapias a realizar" 
                        type="number" 
                        value={fisioSesiones} 
                        onChange={e => setFisioSesiones(parseInt(e.target.value) || '')} 
                        placeholder="Ej: 10"
                        min="0"
                    />
                    <Input 
                        label="Duración estimada terapia (Meses)" 
                        type="number" 
                        value={fisioDuracion} 
                        onChange={e => setFisioDuracion(parseInt(e.target.value) || '')} 
                        placeholder="Ej: 3"
                        min="0"
                    />
                 </div>
                 
                 <div className="flex flex-col md:flex-row gap-6 mb-4">
                     <div className="flex items-center">
                        <input id="fisioEgreso" type="checkbox" checked={fisioEgreso} onChange={e => setFisioEgreso(e.target.checked)} className="h-4 w-4 text-brand-lightblue focus:ring-brand-blue border-gray-300 rounded" />
                        <label htmlFor="fisioEgreso" className="ml-2 block text-sm text-gray-900">Tiene egreso de rehabilitación</label>
                     </div>
                     <div className="flex items-center">
                        <input id="fisioPlanCasero" type="checkbox" checked={fisioPlanCasero} onChange={e => setFisioPlanCasero(e.target.checked)} className="h-4 w-4 text-brand-lightblue focus:ring-brand-blue border-gray-300 rounded" />
                        <label htmlFor="fisioPlanCasero" className="ml-2 block text-sm text-gray-900">Se dejó plan casero</label>
                     </div>
                 </div>

                 <div>
                    <label htmlFor="fisioJustificacion" className="block text-sm font-medium text-gray-700 mb-1">Justificación de continuidad en rehabilitación</label>
                    <textarea id="fisioJustificacion" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue" placeholder="Explique por qué el paciente debe continuar con el plan..." value={fisioJustificacion} onChange={e => setFisioJustificacion(e.target.value)} />
                </div>
             </div>

             <div>
                <label htmlFor="evolucionFisio" className="block text-sm font-medium text-gray-700 mb-1">Evolución y Notas Adicionales</label>
                <textarea id="evolucionFisio" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue" placeholder="Tolerancia al ejercicio, saturación, etc." value={note} onChange={e => setNote(e.target.value)} />
            </div>
        </div>
    );

    const renderTerapiaOcupacionalForm = () => (
        <div className="space-y-4">
            <Input label="Desempeño en AVD" value={toDesempenoAVD} onChange={e => setToDesempenoAVD(e.target.value)} placeholder="Ej: Independiente en alimentación, requiere asistencia para vestido" />
            <Input label="Componente Cognitivo" value={toCognitivo} onChange={e => setToCognitivo(e.target.value)} placeholder="Ej: Alerta, sigue instrucciones complejas, memoria conservada" />
            <Input label="Habilidades Motoras y Sensoriales" value={toMotor} onChange={e => setToMotor(e.target.value)} placeholder="Ej: Pinza fina conservada, coordinación ojo-mano adecuada" />
            <Input label="Adaptaciones del Entorno/Férulas" value={toAdaptaciones} onChange={e => setToAdaptaciones(e.target.value)} placeholder="Ej: Se indica uso de cojín antiescaras, adaptación de cubiertos" />
             
             <div className="border-t pt-4 mt-4">
                 <h4 className="font-semibold text-gray-700 mb-3">Plan de Manejo y Pronóstico</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input 
                        label="Cantidad de Terapias" 
                        type="number" 
                        value={toSesiones} 
                        onChange={e => setToSesiones(parseInt(e.target.value) || '')} 
                        placeholder="Ej: 8"
                        min="0"
                    />
                    <Input 
                        label="Duración estimada en meses" 
                        type="number" 
                        value={toDuracion} 
                        onChange={e => setToDuracion(parseInt(e.target.value) || '')} 
                        placeholder="Ej: 2"
                        min="0"
                    />
                 </div>
                 
                 <div className="flex flex-col md:flex-row gap-6 mb-4">
                     <div className="flex items-center">
                        <input id="toEgreso" type="checkbox" checked={toEgreso} onChange={e => setToEgreso(e.target.checked)} className="h-4 w-4 text-brand-lightblue focus:ring-brand-blue border-gray-300 rounded" />
                        <label htmlFor="toEgreso" className="ml-2 block text-sm text-gray-900">Egreso de Rehabilitación</label>
                     </div>
                     <div className="flex items-center">
                        <input id="toPlanCasero" type="checkbox" checked={toPlanCasero} onChange={e => setToPlanCasero(e.target.checked)} className="h-4 w-4 text-brand-lightblue focus:ring-brand-blue border-gray-300 rounded" />
                        <label htmlFor="toPlanCasero" className="ml-2 block text-sm text-gray-900">Plan Casero</label>
                     </div>
                 </div>

                 <div>
                    <label htmlFor="toJustificacion" className="block text-sm font-medium text-gray-700 mb-1">Justificación de Continuidad</label>
                    <textarea id="toJustificacion" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue" placeholder="Explique por qué el paciente debe continuar con el plan..." value={toJustificacion} onChange={e => setToJustificacion(e.target.value)} />
                </div>
             </div>

             <div>
                <label htmlFor="evolucionTO" className="block text-sm font-medium text-gray-700 mb-1">Evolución y Notas Adicionales</label>
                <textarea id="evolucionTO" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue" placeholder="Describa el progreso en la sesión y plan de tratamiento." value={note} onChange={e => setNote(e.target.value)} />
            </div>
        </div>
    );

    const renderFonoaudiologiaForm = () => (
        <div className="space-y-4">
             <RadioGroup legend="Vía de Alimentación Actual" name="fonoVia" options={VIA_ALIMENTACION_OPTIONS} selectedValue={fonoVia} onChange={e => setFonoVia(e.target.value)} />
             <RadioGroup legend="Consistencia de Dieta Tolerada" name="fonoDieta" options={CONSISTENCIA_DIETA_OPTIONS} selectedValue={fonoDieta} onChange={e => setFonoDieta(e.target.value)} />
             <Input label="Estado de la Deglución" value={fonoDeglucion} onChange={e => setFonoDeglucion(e.target.value)} placeholder="Ej: Deglución funcional, signos de penetración/aspiración con líquidos" />
             <Input label="Estado Comunicativo / Lenguaje" value={fonoComunicacion} onChange={e => setFonoComunicacion(e.target.value)} placeholder="Ej: Lenguaje expresivo preservado, disartria leve, comprensible" />
             
             <div className="border-t pt-4 mt-4">
                 <h4 className="font-semibold text-gray-700 mb-3">Plan de Manejo y Pronóstico</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input 
                        label="Cantidad de terapias a realizar" 
                        type="number" 
                        value={fonoSesiones} 
                        onChange={e => setFonoSesiones(parseInt(e.target.value) || '')} 
                        placeholder="Ej: 12"
                        min="0"
                    />
                    <Input 
                        label="Duración estimada terapia (Meses)" 
                        type="number" 
                        value={fonoDuracion} 
                        onChange={e => setFonoDuracion(parseInt(e.target.value) || '')} 
                        placeholder="Ej: 4"
                        min="0"
                    />
                 </div>
                 
                 <div className="flex flex-col md:flex-row gap-6 mb-4">
                     <div className="flex items-center">
                        <input id="fonoEgreso" type="checkbox" checked={fonoEgreso} onChange={e => setFonoEgreso(e.target.checked)} className="h-4 w-4 text-brand-lightblue focus:ring-brand-blue border-gray-300 rounded" />
                        <label htmlFor="fonoEgreso" className="ml-2 block text-sm text-gray-900">Tiene egreso de rehabilitación</label>
                     </div>
                     <div className="flex items-center">
                        <input id="fonoPlanCasero" type="checkbox" checked={fonoPlanCasero} onChange={e => setFonoPlanCasero(e.target.checked)} className="h-4 w-4 text-brand-lightblue focus:ring-brand-blue border-gray-300 rounded" />
                        <label htmlFor="fonoPlanCasero" className="ml-2 block text-sm text-gray-900">Se dejó plan casero</label>
                     </div>
                 </div>

                 <div>
                    <label htmlFor="fonoJustificacion" className="block text-sm font-medium text-gray-700 mb-1">Justificación de continuidad en rehabilitación</label>
                    <textarea id="fonoJustificacion" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue" placeholder="Explique por qué el paciente debe continuar con el plan..." value={fonoJustificacion} onChange={e => setFonoJustificacion(e.target.value)} />
                </div>
             </div>

             <div>
                <label htmlFor="evolucionFono" className="block text-sm font-medium text-gray-700 mb-1">Evolución y Notas Adicionales</label>
                <textarea id="evolucionFono" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue" placeholder="Detalles de la sesión, ejercicios oromotores realizados y recomendaciones de alimentación." value={note} onChange={e => setNote(e.target.value)} />
            </div>
        </div>
    );
    
    const renderGenericForm = () => (
        <div>
             <label htmlFor="novedades" className="block text-sm font-medium text-gray-700 mb-1">Novedades del paciente</label>
            <textarea
                id="novedades"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue"
                rows={5}
                placeholder="Escriba aquí las novedades del paciente..."
                value={note}
                onChange={e => setNote(e.target.value)}
                required
            />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Entrega de Turno / Novedades</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Paciente</label>
                         <select
                            id="patient-select"
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue"
                            required
                        >
                            <option value="">-- Elija un paciente --</option>
                            {acceptedPatients.map(p => <option key={p.id} value={p.id}>{p.nombreCompleto} (ID: {p.id})</option>)}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-700">Novedades para: <span className="text-brand-blue">{user?.cargo}</span></h3>
                        
                        {isMedico && renderMedicoForm()}
                        {isJefeEnfermeria && renderJefeEnfermeriaForm()}
                        {isAuxiliar && renderAuxiliarForm()}
                        {isFisioterapeuta && renderFisioterapiaForm()}
                        {isTerapeutaOcupacional && renderTerapiaOcupacionalForm()}
                        {isFonoaudiologo && renderFonoaudiologiaForm()}
                        
                        {/* If none of the specific roles match, show generic form */}
                        {!isMedico && !isJefeEnfermeria && !isAuxiliar && !isFisioterapeuta && !isTerapeutaOcupacional && !isFonoaudiologo && renderGenericForm()}
                        
                         {/* Common text area for Auxiliar (others have their own inside specific renders) */}
                         {isAuxiliar && (
                             <div>
                                <label htmlFor="novedadesAux" className="block text-sm font-medium text-gray-700 mb-1">Novedades y/o Pendientes</label>
                                <textarea id="novedadesAux" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue focus:border-brand-lightblue" placeholder="Observaciones generales..." value={note} onChange={e => setNote(e.target.value)} />
                            </div>
                         )}
                    </div>
                    
                    <div className="pt-4 border-t">
                        <Button type="submit" className="w-full md:w-auto" disabled={!selectedPatientId}>Registrar Novedad</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default HandoverForm;
