
import React, { useState, useEffect } from 'react';
import { Patient, AntibioticTreatment } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import Input from './ui/Input.tsx';
import Select from './ui/Select.tsx';
import Button from './ui/Button.tsx';
import Card from './ui/Card.tsx';
import { DOCUMENT_TYPES, CLINICAS_ORIGEN, PROGRAMAS, TERAPIAS_HOSPITALARIO, TERAPIAS_CRONICO, TERAPIAS_PALIATIVO, ANTIBIOTICOS, OXIGENO_DISPOSITIVOS, SONDA_TIPOS, GLUCOMETRIA_FRECUENCIAS, calculateAge } from '../constants.tsx';
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
    const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | undefined>(patientToEdit?.coordinates);

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
                 setTelefonoFijo(''); // Clear fixed phone if not Hospitalario
             } else if (programa === PROGRAMAS[2]) {
                 setTerapias(TERAPIAS_PALIATIVO);
                 setTelefonoFijo(''); // Clear fixed phone if not Hospitalario
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
        setTerapias(prev => ({...prev, [terapia]: !prev[terapia]}));
    };

    const handleVerifyCoverage = async () => {
        if (!direccion) {
            alert('Por favor, ingrese una dirección para verificar.');
            return;
        }
        setCoverageStatus('loading');
        
        let addressToVerify = direccion;
        // Basic check to see if city/country is already present to avoid duplication
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
            console.error("Verification failed", error);
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
            if (mg === undefined || mg === null || isNaN(mg) || mg <= 0) {
                newErrors.miligramos = 'La dosis debe ser un número positivo.';
            }

            const freq = antibiotico.frecuenciaHoras;
            if (freq === undefined || freq === null || isNaN(freq) || freq <= 0) {
                newErrors.frecuenciaHoras = 'La frecuencia debe ser un número positivo.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

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
            coordinates, // Saving coordinates to patient object
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
                return <div className="flex items-center gap-2 mt-1 text-sm text-gray-600"><svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Verificando...</span></div>;
            case 'success':
                return <div className="flex items-center gap-2 mt-1 text-sm text-green-700 font-medium"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg><span>Domicilio dentro del área de cobertura.</span></div>;
            case 'outside':
                return (
                    <div className="mt-1 text-sm">
                        <div className="flex items-center gap-2 font-medium text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                            <span>Domicilio fuera del área de cobertura.</span>
                        </div>
                        <p className="mt-1 text-gray-600 pl-7">
                            El paciente no puede ser ingresado automáticamente. Puede continuar el registro y quedará en 'Pendiente' para revisión manual.
                        </p>
                    </div>
                );
            case 'manual':
                 return (
                    <div className="mt-1 text-sm text-yellow-700">
                        <div className="flex items-center gap-2 font-medium">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                            <span>Ingreso manual habilitado.</span>
                        </div>
                         <p className="text-xs pl-7 mt-1">Se guardará sin coordenadas precisas.</p>
                    </div>
                 );
            case 'error':
                 return (
                    <div className="mt-1 text-sm text-yellow-700">
                        <div className="flex items-center gap-2 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                            <span>No se pudo verificar la dirección.</span>
                        </div>
                        <div className="pl-7 mt-1">
                             <p className="text-xs mb-1">Puede intentar corregir la dirección o usar el ingreso manual.</p>
                             <button onClick={handleForceManual} type="button" className="text-blue-600 underline text-xs font-semibold hover:text-blue-800">Forzar Ingreso Manual</button>
                        </div>
                    </div>
                 );
            default:
                return <div className="h-6 mt-1" />;
        }
    };

    const renderStepOne = () => {
        // Allows continuing if success, outside, OR manual override is active
        const isNextDisabled = !['success', 'outside', 'manual'].includes(coverageStatus) || !programa;
        
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">1. Identificación del Paciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Tipo de Documento" options={DOCUMENT_TYPES} value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)} required disabled={isEditMode} />
                    <Input label="Número de Documento" type="text" value={id} onChange={e => setId(e.target.value)} required disabled={isEditMode} />
                    <Input label="Nombres y Apellidos Completos" type="text" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} required className="md:col-span-2" />
                    
                    <div className="flex flex-col justify-start">
                        <Input label="Fecha de Nacimiento" type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} required />
                        <p className="text-sm text-gray-600 mt-1">Edad: {calculateAge(fechaNacimiento)} años</p>
                    </div>
                    
                    <Select 
                        label="Programa al que ingresa" 
                        options={PROGRAMAS} 
                        value={programa} 
                        onChange={e => setPrograma(e.target.value)} 
                        required 
                    />
                    
                    <div className="md:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:gap-2">
                            <div className="flex-grow"><Input label="Dirección de Residencia" type="text" value={direccion} onChange={e => setDireccion(e.target.value)} required /></div>
                            <Button type="button" variant="secondary" onClick={handleVerifyCoverage} disabled={coverageStatus === 'loading' || !direccion} className="mt-2 sm:mt-0 flex-shrink-0">{coverageStatus === 'loading' ? 'Verificando...' : 'Verificar Cobertura'}</Button>
                        </div>
                        {renderCoverageStatus()}
                    </div>

                    {programa === PROGRAMAS[0] && (
                         <Input label="Teléfono Fijo" type="tel" value={telefonoFijo} onChange={e => setTelefonoFijo(e.target.value)} />
                    )}

                    <Input label="Teléfono Móvil" type="tel" value={telefonoMovil} onChange={e => setTelefonoMovil(e.target.value)} required />
                    <Input label="Nombre del Cuidador Principal" type="text" value={cuidadorPrincipal} onChange={e => setCuidadorPrincipal(e.target.value)} required />
                    <Input label="Teléfono Móvil del Cuidador" type="tel" value={telefonoCuidador} onChange={e => setTelefonoCuidador(e.target.value)} required />
                </div>
                 <div className="flex items-center justify-between pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <div>
                        <Button onClick={() => setStep(2)} disabled={isNextDisabled}>Siguiente</Button>
                        {isNextDisabled && <p className="text-xs text-gray-500 mt-2 text-right">Debe verificar la dirección.</p>}
                    </div>
                </div>
            </div>
        );
    };
    
    const renderStepTwo = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">2. Datos Clínicos</h3>
             <Select label="Clínica de la cual egresa" options={CLINICAS_ORIGEN} value={clinicaEgreso} onChange={e => setClinicaEgreso(e.target.value)} required />
             <Input label="Diagnóstico de egreso (CIE 10)" type="text" value={diagnosticoEgreso} onChange={e => setDiagnosticoEgreso(e.target.value)} required />
             <Input label="Fecha de Ingreso" type="date" value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} required disabled={isEditMode} />
             <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="alergia" type="checkbox" className="h-4 w-4 text-brand-lightblue focus:ring-brand-blue border-gray-300 rounded" checked={alergicoMedicamentos} onChange={e => setAlergicoMedicamentos(e.target.checked)} />
                </div>
                <div className="ml-3 text-sm flex-grow">
                  <label htmlFor="alergia" className="font-medium text-gray-700">¿Paciente alérgico a algún medicamento?</label>
                  {alergicoMedicamentos && (
                    <Input id="alergia-info" type="text" placeholder="Especifique cuál(es)" value={alergiasInfo} onChange={e => setAlergiasInfo(e.target.value)} className="mt-2"/>
                  )}
                </div>
            </div>
            <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => setStep(1)}>Anterior</Button>
                <Button onClick={() => setStep(3)}>Siguiente</Button>
            </div>
        </div>
    );
    
    const renderStepThree = () => (
         <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">3. Terapias Requeridas</h3>
            <div className="space-y-2">
                {Object.keys(terapias).map(terapia => (
                    <div key={terapia} className="flex items-center">
                        <input id={terapia} type="checkbox" checked={!!terapias[terapia]} onChange={() => handleTherapyChange(terapia)} className="h-4 w-4 text-brand-lightblue focus:ring-brand-blue border-gray-300 rounded" />
                        <label htmlFor={terapia} className="ml-2 block text-sm text-gray-900 capitalize">{terapia.replace(/ \(.+?\)/g, '')}</label>
                    </div>
                ))}
            </div>

            {terapias['Oxígeno'] && (
                 <Card title="Detalles de Oxígeno" className="mt-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Tipo de Dispositivo" options={OXIGENO_DISPOSITIVOS} value={oxigenoDispositivo} onChange={e => setOxigenoDispositivo(e.target.value)} required />
                        <Input label="Litraje (L/min)" type="number" value={oxigenoLitraje} onChange={e => setOxigenoLitraje(parseFloat(e.target.value))} required />
                    </div>
                </Card>
            )}

             {terapias['Aplicación de terapia antibiótica'] && (
                 <Card title="Detalles de Terapia Antibiótica" className="mt-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Select label="Medicamento" options={ANTIBIOTICOS} value={antibiotico.medicamento} onChange={e => setAntibiotico(p => ({...p, medicamento: e.target.value}))} required />
                         <div>
                            <Input label="Dosis (mg)" type="number" value={antibiotico.miligramos || ''} onChange={e => setAntibiotico(p => ({...p, miligramos: parseFloat(e.target.value)}))} required />
                            {errors.miligramos && <p className="text-red-500 text-xs mt-1">{errors.miligramos}</p>}
                            <p className="text-xs text-gray-500 mt-1">Ingrese solo el valor numérico en miligramos.</p>
                         </div>
                         <div>
                            <Input label="Frecuencia (horas)" type="number" value={antibiotico.frecuenciaHoras || ''} onChange={e => setAntibiotico(p => ({...p, frecuenciaHoras: parseInt(e.target.value)}))} required />
                            {errors.frecuenciaHoras && <p className="text-red-500 text-xs mt-1">{errors.frecuenciaHoras}</p>}
                            <p className="text-xs text-gray-500 mt-1">Ingrese el intervalo en horas (ej: 8, 12, 24).</p>
                         </div>
                         <div className="md:col-span-2 grid grid-cols-2 gap-4">
                             <Input label="Fecha de Inicio" type="date" value={antibiotico.fechaInicio || ''} onChange={e => setAntibiotico(p => ({...p, fechaInicio: e.target.value}))} required />
                             <Input label="Fecha de Terminación" type="date" value={antibiotico.fechaTerminacion || ''} onChange={e => setAntibiotico(p => ({...p, fechaTerminacion: e.target.value}))} required />
                         </div>
                    </div>
                </Card>
            )}
            
            {terapias['Manejo de Sondas'] && (
                 <Card title="Detalles de Sondas" className="mt-4 bg-gray-50">
                     <Select label="Tipo de Sonda" options={SONDA_TIPOS} value={sondaInfo.tipo} onChange={e => setSondaInfo(p => ({...p, tipo: e.target.value}))} required />
                </Card>
            )}

            {terapias['curación mayor en casa por enfermería'] && (
                 <Card title="Detalles de Heridas/Curaciones" className="mt-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Tipo de Herida" type="text" value={heridaInfo.tipo} onChange={e => setHeridaInfo(p => ({...p, tipo: e.target.value}))} required />
                        <Input label="Localización" type="text" value={heridaInfo.localizacion} onChange={e => setHeridaInfo(p => ({...p, localizacion: e.target.value}))} required />
                    </div>
                </Card>
            )}

            {terapias['Toma de glucometrías'] && (
                 <Card title="Detalles de Glucometrías" className="mt-4 bg-gray-50">
                    <Select label="Frecuencia" options={GLUCOMETRIA_FRECUENCIAS} value={glucometriaInfo.frecuencia} onChange={e => setGlucometriaInfo(p => ({...p, frecuencia: e.target.value}))} required />
                </Card>
            )}

            {terapias['Otras terapias'] && (
                <Card title="Detalles de Otras Terapias" className="mt-4 bg-gray-50">
                    <Input label="Especifique" type="text" value={otrasTerapiasInfo} onChange={e => setOtrasTerapiasInfo(e.target.value)} required />
                </Card>
            )}

            <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => setStep(2)}>Anterior</Button>
                <Button type="submit">{isEditMode ? 'Guardar Cambios' : 'Guardar Paciente'}</Button>
            </div>
        </form>
    );

    return (
        <div>
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
        </div>
    );
};

export default PatientIntakeForm;
