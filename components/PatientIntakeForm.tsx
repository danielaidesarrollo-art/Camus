
import React, { useState, useEffect } from 'react';
import { Patient, AntibioticTreatment } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './ui/GlassComponents.tsx';
import { DOCUMENT_TYPES, CLINICAS_ORIGEN, PROGRAMAS, TERAPIAS_HOSPITALARIO, TERAPIAS_CRONICO, TERAPIAS_PALIATIVO, ANTIBIOTICOS, OXIGENO_DISPOSITIVOS, SONDA_TIPOS, GLUCOMETRIA_FRECUENCIAS, calculateAge, Icons } from '../constants.tsx';
import { isPointInPolygon, geocodeAddress, COVERAGE_POLYGON } from '../utils/geolocation.ts';

interface PatientIntakeFormProps {
    onSubmit: (patient: Patient) => void;
    patientToEdit?: Patient | null;
    onClose?: () => void;
}

const PatientIntakeForm: React.FC<PatientIntakeFormProps> = ({ onSubmit, patientToEdit = null, onClose }) => {
    const { user } = useAppContext();
    const isEditMode = !!patientToEdit;

    const [step, setStep] = useState(1);

    // Patient data
    const [tipoDocumento, setTipoDocumento] = useState(patientToEdit?.tipoDocumento || '');
    const [id, setId] = useState(patientToEdit?.id || '');
    const [nombreCompleto, setNombreCompleto] = useState(patientToEdit?.nombreCompleto || '');
    const [fechaNacimiento, setFechaNacimiento] = useState(patientToEdit?.fechaNacimiento || '');
    const [direccion, setDireccion] = useState(patientToEdit?.direccion || '');
    const [telefonoFijo, setTelefonoFijo] = useState(patientToEdit?.telefonoFijo || '');
    const [telefonoMovil, setTelefonoMovil] = useState(patientToEdit?.telefonoMovil || '');
    const [cuidadorPrincipal, setCuidadorPrincipal] = useState(patientToEdit?.cuidadorPrincipal || '');
    const [telefonoCuidador, setTelefonoCuidador] = useState(patientToEdit?.telefonoCuidador || '');

    // Geolocation state
    const [coverageStatus, setCoverageStatus] = useState<'idle' | 'loading' | 'success' | 'outside' | 'error' | 'manual'>(() => {
        if (isEditMode && patientToEdit?.coordinates) {
            return isPointInPolygon(patientToEdit.coordinates, COVERAGE_POLYGON) ? 'success' : 'outside';
        }
        return 'idle';
    });
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | undefined>(patientToEdit?.coordinates);

    // Clinical data
    const [clinicaEgreso, setClinicaEgreso] = useState(patientToEdit?.clinicaEgreso || '');
    const [diagnosticoEgreso, setDiagnosticoEgreso] = useState(patientToEdit?.diagnosticoEgreso || '');
    const [alergicoMedicamentos, setAlergicoMedicamentos] = useState(patientToEdit?.alergicoMedicamentos || false);
    const [alergiasInfo, setAlergiasInfo] = useState(patientToEdit?.alergiasInfo || '');
    const [fechaIngreso, setFechaIngreso] = useState(() => {
        if (patientToEdit?.fechaIngreso) {
            return patientToEdit.fechaIngreso.split('T')[0];
        }
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [programa, setPrograma] = useState(patientToEdit?.programa || '');
    const [terapias, setTerapias] = useState<{ [key: string]: boolean }>(patientToEdit?.terapias || {});

    // Therapy specifics
    const [oxigenoDispositivo, setOxigenoDispositivo] = useState(patientToEdit?.oxigeno?.dispositivo || '');
    const [oxigenoLitraje, setOxigenoLitraje] = useState(patientToEdit?.oxigeno?.litraje || 0);
    const [antibiotico, setAntibiotico] = useState<Partial<AntibioticTreatment>>(patientToEdit?.antibiotico || {});
    const [sondaInfo, setSondaInfo] = useState(patientToEdit?.sondaInfo || { tipo: '' });
    const [heridaInfo, setHeridaInfo] = useState(patientToEdit?.heridaInfo || { tipo: '', localizacion: '' });
    const [glucometriaInfo, setGlucometriaInfo] = useState(patientToEdit?.glucometriaInfo || { frecuencia: '' });
    const [otrasTerapiasInfo, setOtrasTerapiasInfo] = useState(patientToEdit?.otrasTerapiasInfo || '');

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (!isEditMode) {
            if (programa === PROGRAMAS[0]) {
                setTerapias(TERAPIAS_HOSPITALARIO);
            } else if (programa === PROGRAMAS[1]) {
                setTerapias(TERAPIAS_CRONICO);
                setTelefonoFijo('');
            } else if (programa === PROGRAMAS[2]) {
                setTerapias(TERAPIAS_PALIATIVO);
                setTelefonoFijo('');
            } else {
                setTerapias({});
            }
        }
    }, [programa, isEditMode]);

    useEffect(() => {
        if (isEditMode && patientToEdit?.direccion === direccion) {
            return;
        }
        setCoverageStatus('idle');
        setCoordinates(undefined);
    }, [direccion, isEditMode, patientToEdit]);

    const calculateAntibioticDays = (start: string, end: string) => {
        if (!start || !end) return { total: 0, current: 0 };
        const startDate = new Date(start);
        const endDate = new Date(end);
        const today = new Date();
        const total = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        const current = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        return { total, current };
    };

    const handleTherapyChange = (terapia: string) => {
        setTerapias(prev => ({ ...prev, [terapia]: !prev[terapia] }));
    };

    const handleVerifyCoverage = async () => {
        if (!direccion) return;
        setCoverageStatus('loading');

        let addressToVerify = direccion;
        if (!addressToVerify.toLowerCase().includes('bogota') && !addressToVerify.toLowerCase().includes('soacha')) {
            addressToVerify += ", Bogotá, Colombia";
        }

        try {
            const coords = await geocodeAddress(addressToVerify);
            if (coords) {
                const isInside = isPointInPolygon(coords, COVERAGE_POLYGON);
                setCoverageStatus(isInside ? 'success' : 'outside');
                setCoordinates(coords);
            } else {
                setCoverageStatus('error');
                setCoordinates(undefined);
            }
        } catch (error) {
            setCoverageStatus('error');
        }
    };

    const handleForceManual = () => {
        if (confirm("¿Está seguro de forzar el ingreso? Si la dirección no es válida, la geolocalización no funcionará en el mapa.")) {
            setCoverageStatus('manual');
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (terapias['Aplicación de terapia antibiótica']) {
            const mg = antibiotico.miligramos;
            if (mg === undefined || mg === null || isNaN(mg) || mg <= 0) newErrors.miligramos = 'La dosis debe ser un número positivo.';
            const freq = antibiotico.frecuenciaHoras;
            if (freq === undefined || freq === null || isNaN(freq) || freq <= 0) newErrors.frecuenciaHoras = 'La frecuencia debe ser un número positivo.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        let finalAntibiotic: AntibioticTreatment | undefined = undefined;
        if (terapias['Aplicación de terapia antibiótica'] && antibiotico.medicamento && antibiotico.fechaInicio && antibiotico.fechaTerminacion && antibiotico.miligramos && antibiotico.frecuenciaHoras) {
            const { total, current } = calculateAntibioticDays(antibiotico.fechaInicio, antibiotico.fechaTerminacion);
            finalAntibiotic = {
                medicamento: antibiotico.medicamento,
                fechaInicio: antibiotico.fechaInicio,
                fechaTerminacion: antibiotico.fechaTerminacion,
                miligramos: antibiotico.miligramos,
                frecuenciaHoras: antibiotico.frecuenciaHoras,
                diasTotales: total,
                diaActual: current < 1 ? 1 : current,
            };
        }

        const newPatient: Patient = {
            id,
            tipoDocumento,
            nombreCompleto,
            fechaNacimiento,
            direccion,
            coordinates,
            telefonoFijo,
            telefonoMovil,
            cuidadorPrincipal,
            telefonoCuidador,
            alergicoMedicamentos,
            alergiasInfo: alergicoMedicamentos ? alergiasInfo : undefined,
            clinicaEgreso,
            diagnosticoEgreso,
            programa,
            terapias,
            oxigeno: terapias['Oxígeno'] ? { dispositivo: oxigenoDispositivo, litraje: oxigenoLitraje } : undefined,
            antibiotico: finalAntibiotic,
            sondaInfo: terapias['Manejo de Sondas'] ? sondaInfo : undefined,
            heridaInfo: terapias['curación mayor en casa por enfermería'] ? heridaInfo : undefined,
            glucometriaInfo: terapias['Toma de glucometrías'] ? glucometriaInfo : undefined,
            otrasTerapiasInfo: terapias['Otras terapias'] ? otrasTerapiasInfo : undefined,
            estado: isEditMode ? patientToEdit.estado : 'Pendiente',
            ingresadoPor: isEditMode ? patientToEdit.ingresadoPor : (user?.correo || 'N/A'),
            fechaIngreso: isEditMode ? patientToEdit.fechaIngreso : new Date(fechaIngreso + 'T00:00:00').toISOString(),
        };
        onSubmit(newPatient);
    };

    const renderCoverageStatus = () => {
        switch (coverageStatus) {
            case 'loading':
                return <div className="flex items-center gap-2 mt-2 p-2 bg-white/5 rounded-lg text-xs text-gray-400">
                    <svg className="animate-spin h-3 w-3 text-[#00E5FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Verificando coordenadas...
                </div>;
            case 'success':
                return <div className="flex items-center gap-2 mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    {Icons.Plus} Cobertura Confirmada
                </div>;
            case 'outside':
                return <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
                        ⚠ Cobertura Externa
                    </div>
                    <p className="mt-1 text-[10px] text-gray-500 leading-tight">El ingreso quedará sujeto a revisión administrativa.</p>
                </div>;
            case 'manual':
                return <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400 font-bold uppercase tracking-wider">
                    Ingreso manual activado
                </div>;
            case 'error':
                return <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-widest">
                        No se pudo verificar
                    </div>
                    <button onClick={handleForceManual} type="button" className="mt-1 text-[10px] text-[#00E5FF] font-bold uppercase underline">Forzar Ingreso Manual</button>
                </div>;
            default: return null;
        }
    };

    const ProgressBar = ({ currentStep }: { currentStep: number }) => (
        <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${s <= currentStep ? 'bg-[#00E5FF] glow-cyan' : 'bg-white/10'}`} />
            ))}
        </div>
    );

    const renderStepOne = () => {
        const isNextDisabled = !['success', 'outside', 'manual'].includes(coverageStatus) || !programa;
        return (
            <div className="space-y-6 animate-fade-in">
                <ProgressBar currentStep={1} />
                <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">1. Identificación y Ubicación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassSelect label="Tipo de Documento" options={DOCUMENT_TYPES} value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)} required disabled={isEditMode} />
                    <GlassInput label="Número de Documento" type="text" value={id} onChange={e => setId(e.target.value)} required disabled={isEditMode} />
                    <GlassInput label="Nombre Completo" type="text" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} required className="md:col-span-2" />

                    <div className="space-y-2">
                        <GlassInput label="Fecha de Nacimiento" type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} required />
                        <p className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest ml-1">{calculateAge(fechaNacimiento)} años detectados</p>
                    </div>

                    <GlassSelect label="Programa" options={PROGRAMAS} value={programa} onChange={e => setPrograma(e.target.value)} required />

                    <div className="md:col-span-2">
                        <div className="flex flex-col md:flex-row md:items-end gap-3">
                            <div className="flex-grow"><GlassInput label="Dirección de Residencia" type="text" value={direccion} onChange={e => setDireccion(e.target.value)} required /></div>
                            <GlassButton type="button" variant="outline" onClick={handleVerifyCoverage} disabled={coverageStatus === 'loading' || !direccion} className="md:h-[50px]">
                                {coverageStatus === 'loading' ? 'Verificando...' : 'Verificar'}
                            </GlassButton>
                        </div>
                        {renderCoverageStatus()}
                    </div>

                    {programa === PROGRAMAS[0] && <GlassInput label="Teléfono Fijo" type="tel" value={telefonoFijo} onChange={e => setTelefonoFijo(e.target.value)} />}
                    <GlassInput label="Teléfono Móvil" type="tel" value={telefonoMovil} onChange={e => setTelefonoMovil(e.target.value)} required />
                    <GlassInput label="Cuidador Principal" type="text" value={cuidadorPrincipal} onChange={e => setCuidadorPrincipal(e.target.value)} required />
                    <GlassInput label="Teléfono Cuidador" type="tel" value={telefonoCuidador} onChange={e => setTelefonoCuidador(e.target.value)} required />
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <GlassButton type="button" variant="ghost" onClick={onClose}>Cancelar</GlassButton>
                    <GlassButton glow onClick={() => setStep(2)} disabled={isNextDisabled}>Siguiente Paso</GlassButton>
                </div>
            </div>
        );
    };

    const renderStepTwo = () => (
        <div className="space-y-6 animate-fade-in">
            <ProgressBar currentStep={2} />
            <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">2. Resumen Clínico</h3>
            <div className="grid grid-cols-1 gap-6">
                <GlassSelect label="Clínica de Origen" options={CLINICAS_ORIGEN} value={clinicaEgreso} onChange={e => setClinicaEgreso(e.target.value)} required />
                <GlassInput label="Diagnóstico CIE 10" type="text" value={diagnosticoEgreso} onChange={e => setDiagnosticoEgreso(e.target.value)} required />
                <GlassInput label="Fecha Efectiva de Ingreso" type="date" value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} required disabled={isEditMode} />

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${alergicoMedicamentos ? 'bg-[#00E5FF] border-[#00E5FF]' : 'border-white/20 group-hover:border-white/40'}`}>
                            {alergicoMedicamentos && <span className="text-[#0B0E14] text-xs font-bold">✓</span>}
                        </div>
                        <input type="checkbox" className="hidden" checked={alergicoMedicamentos} onChange={e => setAlergicoMedicamentos(e.target.checked)} />
                        <span className="text-sm font-medium text-gray-300">¿Paciente alérgico a medicamentos?</span>
                    </label>
                    {alergicoMedicamentos && (
                        <div className="mt-4 animate-slide-up">
                            <GlassInput placeholder="Describa medicamentos y reacciones" value={alergiasInfo} onChange={e => setAlergiasInfo(e.target.value)} />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-between pt-8 border-t border-white/5">
                <GlassButton variant="ghost" onClick={() => setStep(1)}>Atrás</GlassButton>
                <GlassButton glow onClick={() => setStep(3)}>Configurar Terapias</GlassButton>
            </div>
        </div>
    );

    const renderStepThree = () => (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <ProgressBar currentStep={3} />
            <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">3. Plan de Cuidados</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                {Object.keys(terapias).map(terapia => (
                    <label key={terapia} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${terapias[terapia] ? 'bg-[#00E5FF] border-[#00E5FF]' : 'border-white/20 group-hover:border-white/40'}`}>
                            {terapias[terapia] && <span className="text-[#0B0E14] text-xs font-bold">✓</span>}
                        </div>
                        <input type="checkbox" className="hidden" checked={!!terapias[terapia]} onChange={() => handleTherapyChange(terapia)} />
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-tight group-hover:text-white transition-colors">
                            {terapia.replace(/ \(.+?\)/g, '')}
                        </span>
                    </label>
                ))}
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {terapias['Oxígeno'] && (
                    <GlassCard className="!bg-[#00E5FF]/5 border-[#00E5FF]/20">
                        <h4 className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em] mb-4">Parámetros de Oxígeno</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <GlassSelect label="Dispositivo" options={OXIGENO_DISPOSITIVOS} value={oxigenoDispositivo} onChange={e => setOxigenoDispositivo(e.target.value)} required />
                            <GlassInput label="Litraje (L/min)" type="number" value={oxigenoLitraje} onChange={e => setOxigenoLitraje(parseFloat(e.target.value))} required />
                        </div>
                    </GlassCard>
                )}

                {terapias['Aplicación de terapia antibiótica'] && (
                    <GlassCard className="!bg-[#10B981]/5 border-[#10B981]/20">
                        <h4 className="text-[10px] font-bold text-[#10B981] uppercase tracking-[0.2em] mb-4">Esquema Antibiótico</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <GlassSelect label="Fármaco" options={ANTIBIOTICOS} value={antibiotico.medicamento} onChange={e => setAntibiotico(p => ({ ...p, medicamento: e.target.value }))} required />
                            <div>
                                <GlassInput label="Dosis (mg)" type="number" value={antibiotico.miligramos || ''} onChange={e => setAntibiotico(p => ({ ...p, miligramos: parseFloat(e.target.value) }))} required />
                                {errors.miligramos && <p className="text-red-400 text-[10px] mt-1 font-bold">{errors.miligramos}</p>}
                            </div>
                            <div>
                                <GlassInput label="Intervalo (Horas)" type="number" value={antibiotico.frecuenciaHoras || ''} onChange={e => setAntibiotico(p => ({ ...p, frecuenciaHoras: parseInt(e.target.value) }))} required />
                                {errors.frecuenciaHoras && <p className="text-red-400 text-[10px] mt-1 font-bold">{errors.frecuenciaHoras}</p>}
                            </div>
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <GlassInput label="F. Inicio" type="date" value={antibiotico.fechaInicio || ''} onChange={e => setAntibiotico(p => ({ ...p, fechaInicio: e.target.value }))} required />
                                <GlassInput label="F. Fin" type="date" value={antibiotico.fechaTerminacion || ''} onChange={e => setAntibiotico(p => ({ ...p, fechaTerminacion: e.target.value }))} required />
                            </div>
                        </div>
                    </GlassCard>
                )}

                {terapias['Manejo de Sondas'] && (
                    <GlassCard className="!bg-white/5 border-white/10">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Gestión de Sondas</h4>
                        <GlassSelect label="Tipo" options={SONDA_TIPOS} value={sondaInfo.tipo} onChange={e => setSondaInfo(p => ({ ...p, tipo: e.target.value }))} required />
                    </GlassCard>
                )}

                {terapias['curación mayor en casa por enfermería'] && (
                    <GlassCard className="!bg-white/5 border-white/10">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Curaciones</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <GlassInput label="Tipo Herida" value={heridaInfo.tipo} onChange={e => setHeridaInfo(p => ({ ...p, tipo: e.target.value }))} required />
                            <GlassInput label="Ubicación" value={heridaInfo.localizacion} onChange={e => setHeridaInfo(p => ({ ...p, localizacion: e.target.value }))} required />
                        </div>
                    </GlassCard>
                )}

                {terapias['Toma de glucometrías'] && (
                    <GlassCard className="!bg-white/5 border-white/10">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Monitoreo Metabólico</h4>
                        <GlassSelect label="Frecuencia" options={GLUCOMETRIA_FRECUENCIAS} value={glucometriaInfo.frecuencia} onChange={e => setGlucometriaInfo(p => ({ ...p, frecuencia: e.target.value }))} required />
                    </GlassCard>
                )}

                {terapias['Otras terapias'] && (
                    <GlassCard className="!bg-white/5 border-white/10">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Observaciones Adicionales</h4>
                        <GlassInput label="Descripción" value={otrasTerapiasInfo} onChange={e => setOtrasTerapiasInfo(e.target.value)} required />
                    </GlassCard>
                )}
            </div>

            <div className="flex justify-between pt-8 border-t border-white/5">
                <GlassButton variant="ghost" onClick={() => setStep(2)}>Atrás</GlassButton>
                <GlassButton glow type="submit">{isEditMode ? 'Actualizar Ficha' : 'Confirmar Ingreso'}</GlassButton>
            </div>
        </form>
    );

    return (
        <div className="max-w-2xl mx-auto">
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
        </div>
    );
};

export default PatientIntakeForm;
