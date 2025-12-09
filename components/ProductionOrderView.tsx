
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { calculateAge, AUDIFARMA_EMAILS } from '../constants.tsx';
import Card from './ui/Card.tsx';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';

const ProductionOrderView: React.FC = () => {
    const { patients, user } = useAppContext();
    const [cutoffTime, setCutoffTime] = useState<'14:00' | '17:00'>('14:00');
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    
    // Local state for administrative fields not in Patient model (Authorizations, NAPs, Reutilization)
    // Key: PatientID, Value: Object with fields
    const [adminData, setAdminData] = useState<Record<string, { nap: string, auth: string, reutilization: string, napAuth: string }>>({});

    const today = new Date();
    const dateStr = today.toLocaleDateString('es-CO');
    const monthStr = today.toLocaleString('es-CO', { month: 'long' }).toUpperCase();

    // Filter patients with ACTIVE antibiotic therapy
    const antibioticPatients = useMemo(() => {
        if (!Array.isArray(patients)) return [];
        
        return patients.filter(p => {
            if (p.estado !== 'Aceptado') return false;
            
            // Must have antibiotic therapy checked
            if (!p.terapias['Aplicación de terapia antibiótica']) return false;
            
            // Must have antibiotic data
            if (!p.antibiotico || !p.antibiotico.medicamento) return false;

            // Check if active (Today is between Start and End)
            const start = new Date(p.antibiotico.fechaInicio);
            const end = new Date(p.antibiotico.fechaTerminacion);
            const current = new Date();
            // Reset time part for accurate date comparison
            current.setHours(0,0,0,0);
            start.setHours(0,0,0,0);
            end.setHours(0,0,0,0);

            return current >= start && current <= end;
        });
    }, [patients]);

    const handleAdminDataChange = (patientId: string, field: string, value: string) => {
        setAdminData(prev => ({
            ...prev,
            [patientId]: {
                ...(prev[patientId] || { nap: '', auth: '', reutilization: '', napAuth: '' }),
                [field]: value
            }
        }));
    };

    const toggleRow = (id: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const toggleAll = () => {
        if (selectedRows.size === antibioticPatients.length) {
            setSelectedRows(new Set());
        } else {
            const allIds = new Set(antibioticPatients.map(p => p.id));
            setSelectedRows(allIds);
        }
    };

    const handleSendOrder = () => {
        if (selectedRows.size === 0) {
            alert("Por favor seleccione al menos un paciente para incluir en la orden.");
            return;
        }

        const selectedPatients = antibioticPatients.filter(p => selectedRows.has(p.id));
        const count = selectedPatients.length;
        
        const recipientList = AUDIFARMA_EMAILS.join(', ');
        
        // Simulation of Email Sending
        const confirmation = window.confirm(
            `Está a punto de avalar y enviar la Orden de Producción (Corte ${cutoffTime}) con ${count} pacientes a:\n\n${recipientList}\n\n¿Desea continuar?`
        );

        if (confirmation) {
            console.log("Enviando orden a:", recipientList);
            console.log("Datos:", selectedPatients.map(p => ({
                patient: p.nombreCompleto,
                drug: p.antibiotico?.medicamento,
                adminDetails: adminData[p.id]
            })));
            
            alert(`✅ Orden de Producción (Corte ${cutoffTime}) enviada exitosamente.\n\nSe ha notificado a Audifarma y Central de Mezclas.`);
            // In a real app, this would trigger an API call to a backend service like SendGrid/Nodemailer
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Orden de Producción de Antibióticos</h1>
                    <p className="text-gray-600">Gestión y solicitud diaria de mezclas intravenosas.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <span className="font-semibold text-gray-700">Seleccionar Corte:</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCutoffTime('14:00')}
                            className={`px-4 py-2 rounded-md font-medium transition ${cutoffTime === '14:00' ? 'bg-brand-blue text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            14:00
                        </button>
                        <button 
                            onClick={() => setCutoffTime('17:00')}
                            className={`px-4 py-2 rounded-md font-medium transition ${cutoffTime === '17:00' ? 'bg-brand-blue text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            17:00
                        </button>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left text-gray-700">
                        <thead className="bg-green-100 border-b-2 border-green-200 text-green-900 uppercase">
                            <tr>
                                <th className="px-2 py-3 text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={antibioticPatients.length > 0 && selectedRows.size === antibioticPatients.length} 
                                        onChange={toggleAll}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                </th>
                                <th className="px-2 py-3">Fecha</th>
                                <th className="px-2 py-3">Mes</th>
                                <th className="px-2 py-3">Unidad (Dirección)</th>
                                <th className="px-2 py-3">Documento</th>
                                <th className="px-2 py-3">Nombre Paciente</th>
                                <th className="px-2 py-3">Edad</th>
                                <th className="px-2 py-3 bg-blue-50">Medicamento</th>
                                <th className="px-2 py-3 bg-blue-50">Dosis</th>
                                <th className="px-2 py-3 bg-blue-50">Frecuencia</th>
                                <th className="px-2 py-3">Días Tx</th>
                                <th className="px-2 py-3">Alergias</th>
                                <th className="px-2 py-3 w-24">NAP</th>
                                <th className="px-2 py-3 w-24">Fecha Fin</th>
                                <th className="px-2 py-3 w-24">Reutilización</th>
                                <th className="px-2 py-3 w-24">Tiene Aut.</th>
                                <th className="px-2 py-3 w-24">NAP Aut.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {antibioticPatients.length > 0 ? (
                                antibioticPatients.map((p) => {
                                    const age = calculateAge(p.fechaNacimiento);
                                    const admin = adminData[p.id] || { nap: '', auth: '', reutilization: '', napAuth: '' };
                                    const isSelected = selectedRows.has(p.id);

                                    return (
                                        <tr key={p.id} className={`hover:bg-gray-50 transition ${isSelected ? 'bg-green-50' : ''}`}>
                                            <td className="px-2 py-2 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={() => toggleRow(p.id)}
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-2 py-2 whitespace-nowrap">{dateStr}</td>
                                            <td className="px-2 py-2">{monthStr}</td>
                                            <td className="px-2 py-2 max-w-[150px] truncate" title={p.direccion}>{p.direccion}</td>
                                            <td className="px-2 py-2">{p.id}</td>
                                            <td className="px-2 py-2 font-medium">{p.nombreCompleto}</td>
                                            <td className="px-2 py-2">{age}</td>
                                            <td className="px-2 py-2 bg-blue-50 font-semibold">{p.antibiotico?.medicamento}</td>
                                            <td className="px-2 py-2 bg-blue-50">{p.antibiotico?.miligramos} mg</td>
                                            <td className="px-2 py-2 bg-blue-50">{p.antibiotico?.frecuenciaHoras} Hrs</td>
                                            <td className="px-2 py-2 text-center">{p.antibiotico?.diasTotales}</td>
                                            <td className="px-2 py-2 text-red-600 font-bold text-xs">{p.alergicoMedicamentos ? (p.alergiasInfo || 'SÍ') : 'NO'}</td>
                                            
                                            {/* Editable Administrative Fields */}
                                            <td className="px-1 py-2">
                                                <input 
                                                    type="text" 
                                                    className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                                                    value={admin.nap}
                                                    onChange={(e) => handleAdminDataChange(p.id, 'nap', e.target.value)}
                                                    placeholder="Pendiente"
                                                />
                                            </td>
                                            <td className="px-2 py-2 whitespace-nowrap text-xs">{p.antibiotico?.fechaTerminacion}</td>
                                            <td className="px-1 py-2">
                                                <input 
                                                    type="text" 
                                                    className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                                                    value={admin.reutilization}
                                                    onChange={(e) => handleAdminDataChange(p.id, 'reutilization', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-1 py-2">
                                                <select 
                                                    className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                                                    value={admin.auth}
                                                    onChange={(e) => handleAdminDataChange(p.id, 'auth', e.target.value)}
                                                >
                                                    <option value="">-</option>
                                                    <option value="SI">SI</option>
                                                    <option value="NO">NO</option>
                                                    <option value="ENTE">ENTE</option>
                                                </select>
                                            </td>
                                            <td className="px-1 py-2">
                                                <input 
                                                    type="text" 
                                                    className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                                                    value={admin.napAuth}
                                                    onChange={(e) => handleAdminDataChange(p.id, 'napAuth', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={17} className="px-6 py-10 text-center text-gray-500">
                                        No hay pacientes con terapia antibiótica activa para la fecha actual.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="flex justify-end pt-4 border-t border-gray-200">
                <div className="flex gap-4 items-center">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">Responsable del Aval:</p>
                        <p className="text-sm text-gray-600">{user?.nombre} - {user?.cargo}</p>
                    </div>
                    <Button onClick={handleSendOrder} disabled={selectedRows.size === 0} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                        <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                            Avalar y Enviar Orden ({selectedRows.size})
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductionOrderView;
