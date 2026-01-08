
import React, { useState, useEffect } from 'react';
import { Patient, AntibioticTreatment } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassCheckbox } from './ui/GlassComponents.tsx';
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
                return <div className="flex items-center gap-2 mt-2 p-2 bg-white/5 rounded-lg text-xs text-gray-500 font-bold uppercase tracking-widest">
                    <svg className="animate-spin h-3 w-3 text-[#00E5FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Verificando coordenadas GPS...
                </div>;
            case 'success':
                return <div className="flex items-center gap-2 mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    Localización Confirmada
                </div>;
            case 'outside':
                return <div className="mt-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-[0.2em] relative z-10">
                        ⚠ Cobertura Externa Extramural
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500 font-bold leading-relaxed relative z-10">El ingreso requiere autorización administrativa especial por ubicación geográfica.</p>
                </div>;
            case 'manual':
                return <div className="flex items-center gap-2 mt-2 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[10px] text-yellow-400 font-black uppercase tracking-[0.2em]">
                    Ingreso manual forzado
                </div>;
            case 'error':
                return <div className="mt-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">
                        Error de Geocodificación
                    </div>
                    <button onClick={handleForceManual} type="button" className="mt-2 text-[10px] text-[#00E5FF] font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-white transition-colors">Forzar Ingreso Manual</button>
                </div>;
            default: return null;
        }
    };

    const ProgressBar = ({ currentStep }: { currentStep: number }) => (
        <div className="flex gap-3 mb-12">
            {[1, 2, 3].map(s => (
                <div key={s} className="flex-grow space-y-2">
                    <div className={`h-1.5 rounded-full transition-all duration-700 ${s <= currentStep ? 'bg-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'bg-white/10'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] block ${s <= currentStep ? 'text-[#00E5FF]' : 'text-gray-600'}`}>
                        Paso 0{s}
                    </span>
                </div>
            ))}
        </div>
    );

    const renderStepOne = () => {
        const isNextDisabled = !['success', 'outside', 'manual'].includes(coverageStatus) || !programa;
        return (
            <div className="space-y-8 animate-fade-in">
                <ProgressBar currentStep={1} />
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white font-outfit uppercase tracking-tight">Identificación y Ubicación</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Datos básicos del paciente y domicilio</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassSelect label="Tipo de Documento" options={DOCUMENT_TYPES} value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)} required disabled={isEditMode} />
                    <GlassInput label="Número de Documento" type="text" value={id} onChange={e => setId(e.target.value)} required disabled={isEditMode} />
                    <GlassInput label="Nombre Completo" type="text" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} required className="md:col-span-2" />

                    <div className="space-y-3">
                        <GlassInput label="Fecha de Nacimiento" type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} required />
                        {fechaNacimiento && (
                            <div className="inline-block px-3 py-1 bg-[#00E5FF]/10 rounded-lg border border-[#00E5FF]/20">
                                <span className="text-[9px] font-black text-[#00E5FF] uppercase tracking-widest">{calculateAge(fechaNacimiento)} Años Detectados</span>
                            </div>
                        )}
                    </div>

                    <GlassSelect label="Programa Extramural" options={PROGRAMAS} value={programa} onChange={e => setPrograma(e.target.value)} required />

                    <div className="md:col-span-2 p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            <div className="flex-grow"><GlassInput label="Dirección de Residencia" type="text" value={direccion} onChange={e => setDireccion(e.target.value)} required /></div>
                            <GlassButton type="button" variant="outline" onClick={handleVerifyCoverage} disabled={coverageStatus === 'loading' || !direccion} className="md:h-[52px] !px-8 uppercase tracking-widest font-black text-[10px]">
                                {coverageStatus === 'loading' ? 'Procesando...' : 'Validar GPS'}
                            </GlassButton>
                        </div>
                        {renderCoverageStatus()}
                    </div>

                    {programa === PROGRAMAS[0] && <GlassInput label="Teléfono Fijo" type="tel" value={telefonoFijo} onChange={e => setTelefonoFijo(e.target.value)} />}
                    <GlassInput label="Teléfono Móvil" type="tel" value={telefonoMovil} onChange={e => setTelefonoMovil(e.target.value)} required />
                    <GlassInput label="Cuidador Principal" type="text" value={cuidadorPrincipal} onChange={e => setCuidadorPrincipal(e.target.value)} required />
                    <GlassInput label="Teléfono Cuidador" type="tel" value={telefonoCuidador} onChange={e => setTelefonoCuidador(e.target.value)} required />
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-white/5">
                    <GlassButton type="button" variant="ghost" onClick={onClose} className="uppercase tracking-widest font-black text-[10px]">Cerrar Formulario</GlassButton>
                    <GlassButton glow onClick={() => setStep(2)} disabled={isNextDisabled} className="h-12 px-10 uppercase tracking-widest font-black text-[10px]">Siguiente Etapa</GlassButton>
                </div>
            </div>
        );
    };

    const renderStepTwo = () => (
        <div className="space-y-8 animate-fade-in">
            <ProgressBar currentStep={2} />
            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white font-outfit uppercase tracking-tight">Historial Clínico de Remisión</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Procedencia y diagnósticos base</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <GlassSelect label="Institución Prestadora de Origen" options={CLINICAS_ORIGEN} value={clinicaEgreso} onChange={e => setClinicaEgreso(e.target.value)} required />
                <GlassInput label="Diagnóstico Principal (CIE-10)" type="text" value={diagnosticoEgreso} onChange={e => setDiagnosticoEgreso(e.target.value)} required />
                <GlassInput label="Fecha de Ingreso de Programa" type="date" value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} required disabled={isEditMode} />

                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-sm group">
                    <GlassCheckbox
                        label="¿Presenta Antecedentes Alérgicos?"
                        checked={alergicoMedicamentos}
                        onChange={e => setAlergicoMedicamentos(e.target.checked)}
                    />
                    {alergicoMedicamentos && (
                        <div className="mt-6 animate-slide-up bg-black/20 p-4 rounded-2xl border border-red-500/10">
                            <GlassInput
                                label="Especificación de Alergias"
                                placeholder="Describa fármacos y reacciones adversas observadas..."
                                value={alergiasInfo}
                                onChange={e => setAlergiasInfo(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-10 border-t border-white/5">
                <GlassButton variant="ghost" onClick={() => setStep(1)} className="uppercase tracking-widest font-black text-[10px]">Atrás</GlassButton>
                <GlassButton glow onClick={() => setStep(3)} className="h-12 px-10 uppercase tracking-widest font-black text-[10px]">Configurar Plan de Cuidado</GlassButton>
            </div>
        </div>
    );

    const renderStepThree = () => (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in relative">
            <ProgressBar currentStep={3} />
            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white font-outfit uppercase tracking-tight">Prescripción de Terapias</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Definición de servicios y parámetros médicos</p>
            </div>

            <GlassCard className="!bg-white/[0.02] !border-white/5 !p-6">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 px-2">Servicios Solicitados</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.keys(terapias).map(terapia => (
                        <div key={terapia} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00E5FF]/30 transition-all group">
                            <GlassCheckbox
                                label={terapia.replace(/ \(.+?\)/g, '')}
                                checked={!!terapias[terapia]}
                                onChange={() => handleTherapyChange(terapia)}
                            />
                        </div>
                    ))}
                </div>
            </GlassCard>

            <div className="space-y-8 max-h-[500px] overflow-y-auto pr-3 no-scrollbar custom-scrollbar">
                {terapias['Oxígeno'] && (
                    <GlassCard className="!bg-[#00E5FF]/5 !border-[#00E5FF]/20 !p-8 relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-[#00E5FF] rounded-full shadow-[0_0_12px_rgba(0,229,255,0.4)]"></div>
                            <h4 className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.25em]">Soporte Ventilatorio (O2)</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-6 relative z-10">
                            <GlassSelect label="Dispositivo" options={OXIGENO_DISPOSITIVOS} value={oxigenoDispositivo} onChange={e => setOxigenoDispositivo(e.target.value)} required />
                            <GlassInput label="Litraje (L/min)" type="number" step="0.5" value={oxigenoLitraje} onChange={e => setOxigenoLitraje(parseFloat(e.target.value))} required />
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#00E5FF]/5 blur-3xl group-hover:bg-[#00E5FF]/10 transition-all"></div>
                    </GlassCard>
                )}

                {terapias['Aplicación de terapia antibiótica'] && (
                    <GlassCard className="!bg-purple-500/5 !border-purple-500/20 !p-8 relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.4)]"></div>
                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.25em]">Parametrización Antibiótica</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <GlassSelect label="Fármaco" options={ANTIBIOTICOS} value={antibiotico.medicamento} onChange={e => setAntibiotico(p => ({ ...p, medicamento: e.target.value }))} required />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <GlassInput label="Dosis (mg)" type="number" value={antibiotico.miligramos || ''} onChange={e => setAntibiotico(p => ({ ...p, miligramos: parseFloat(e.target.value) }))} required />
                                    {errors.miligramos && <p className="text-red-400 text-[9px] mt-2 font-black uppercase tracking-widest">{errors.miligramos}</p>}
                                </div>
                                <div>
                                    <GlassInput label="Frecuencia (Horas)" type="number" value={antibiotico.frecuenciaHours || ''} onChange={e => setAntibiotico(p => ({ ...p, frecuenciaHoras: parseInt(e.target.value) }))} required />
                                    {errors.frecuenciaHoras && <p className="text-red-400 text-[9px] mt-2 font-black uppercase tracking-widest">{errors.frecuenciaHoras}</p>}
                                </div>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-2 gap-6">
                                <GlassInput label="Fecha Inicio Tratamiento" type="date" value={antibiotico.fechaInicio || ''} onChange={e => setAntibiotico(p => ({ ...p, fechaInicio: e.target.value }))} required />
                                <GlassInput label="Fecha Término Estimada" type="date" value={antibiotico.fechaTerminacion || ''} onChange={e => setAntibiotico(p => ({ ...p, fechaTerminacion: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition-all"></div>
                    </GlassCard>
                )}

                {terapias['Manejo de Sondas'] && (
                    <GlassCard className="!bg-white/5 !border-white/10 !p-8 group hover:border-[#00E5FF]/30 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-gray-500 rounded-full group-hover:bg-[#00E5FF] transition-colors"></div>
                            <h4 className="text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-[0.25em]">Procedimientos de Sonda</h4>
                        </div>
                        <GlassSelect label="Tipo de Dispositivo" options={SONDA_TIPOS} value={sondaInfo.tipo} onChange={e => setSondaInfo(p => ({ ...p, tipo: e.target.value }))} required />
                    </GlassCard>
                )}

                {terapias['curación mayor en casa por enfermería'] && (
                    <GlassCard className="!bg-white/5 !border-white/10 !p-8 group hover:border-[#00E5FF]/30 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-gray-500 rounded-full group-hover:bg-[#00E5FF] transition-colors"></div>
                            <h4 className="text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-[0.25em]">Curación de Heridas</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <GlassInput label="Clasificación Herida" value={heridaInfo.tipo} onChange={e => setHeridaInfo(p => ({ ...p, tipo: e.target.value }))} required />
                            <GlassInput label="Ubicación Anatómica" value={heridaInfo.localizacion} onChange={e => setHeridaInfo(p => ({ ...p, localizacion: e.target.value }))} required />
                        </div>
                    </GlassCard>
                )}

                {terapias['Toma de glucometrías'] && (
                    <GlassCard className="!bg-white/5 !border-white/10 !p-8 group hover:border-[#00E5FF]/30 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-gray-500 rounded-full group-hover:bg-[#00E5FF] transition-colors"></div>
                            <h4 className="text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-[0.25em]">Monitoreo Glucémico</h4>
                        </div>
                        <GlassSelect label="Frecuencia Institucional" options={GLUCOMETRIA_FRECUENCIAS} value={glucometriaInfo.frecuencia} onChange={e => setGlucometriaInfo(p => ({ ...p, frecuencia: e.target.value }))} required />
                    </GlassCard>
                )}

                {terapias['Otras terapias'] && (
                    <GlassCard className="!bg-white/5 !border-white/10 !p-8 group hover:border-[#00E5FF]/30 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-gray-500 rounded-full group-hover:bg-[#00E5FF] transition-colors"></div>
                            <h4 className="text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-[0.25em]">Observaciones Especiales</h4>
                        </div>
                        <GlassInput label="Descripción del Requerimiento" value={otrasTerapiasInfo} onChange={e => setOtrasTerapiasInfo(e.target.value)} required />
                    </GlassCard>
                )}
            </div>

            <div className="flex justify-between pt-10 border-t border-white/5">
                <GlassButton variant="ghost" onClick={() => setStep(2)} className="uppercase tracking-widest font-black text-[10px]">Atrás</GlassButton>
                <GlassButton glow type="submit" className="h-12 px-12 uppercase tracking-widest font-black text-[10px]">{isEditMode ? 'Confirmar Actualización' : 'Someter Ingreso Administrativo'}</GlassButton>
            </div>
        </form>
    );

    return (
        <div className="max-w-3xl mx-auto">
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
        </div>
    );
};

export default PatientIntakeForm;
