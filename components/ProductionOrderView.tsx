

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { calculateAge, AUDIFARMA_EMAILS, MEDICAMENTOS_ALTO_RIESGO } from '../constants.tsx';
import { GlassCard, GlassButton, GlassInput, GlassCheckbox } from './ui/GlassComponents.tsx';
import { Icons } from '../constants.tsx';

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
            current.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

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
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 font-outfit">
                        <span className="p-2 bg-[#00E5FF]/10 rounded-xl text-[#00E5FF]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3l1 1" /><path d="M15 5s.3 3.44-.5 5c-1 2-4 3-4 3l-1-1" /></svg>
                        </span>
                        Orden de Producción
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Gestión diaria de solicitudes de mezclas intravenosas para antibióticos.</p>
                </div>

                <GlassCard className="!p-1.5 flex items-center gap-2 border-white/5 bg-white/5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3">Corte:</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCutoffTime('14:00')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${cutoffTime === '14:00' ? 'bg-[#00E5FF] text-[#0B0E14] shadow-lg shadow-[#00E5FF]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            14:00
                        </button>
                        <button
                            onClick={() => setCutoffTime('17:00')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${cutoffTime === '17:00' ? 'bg-[#00E5FF] text-[#0B0E14] shadow-lg shadow-[#00E5FF]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            17:00
                        </button>
                    </div>
                </GlassCard>
            </div>

            {/* Legend for Alerts */}
            <div className="flex flex-wrap gap-4 px-1">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Ingreso Reciente</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Medicamento Alto Riesgo</span>
                </div>
            </div>

            <GlassCard className="!p-0 overflow-hidden border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 uppercase tracking-wider font-bold text-gray-400">
                                <th className="px-3 py-4 text-center">
                                    <GlassCheckbox
                                        checked={antibioticPatients.length > 0 && selectedRows.size === antibioticPatients.length}
                                        onChange={toggleAll}
                                    />
                                </th>
                                <th className="px-3 py-4">Fecha/Mes</th>
                                <th className="px-3 py-4">Unidad/Dirección</th>
                                <th className="px-3 py-4">Paciente/Documento</th>
                                <th className="px-3 py-4">Edad</th>
                                <th className="px-3 py-4 bg-[#00E5FF]/5 text-[#00E5FF]">Medicamento/Dosis/Freq</th>
                                <th className="px-3 py-4">Días Tx</th>
                                <th className="px-3 py-4">Alergias</th>
                                <th className="px-3 py-4">NAP</th>
                                <th className="px-3 py-4">Reutilización</th>
                                <th className="px-3 py-4">Aut. / NAP Aut.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {antibioticPatients.length > 0 ? (
                                antibioticPatients.map((p) => {
                                    const age = calculateAge(p.fechaNacimiento);
                                    const admin = adminData[p.id] || { nap: '', auth: '', reutilization: '', napAuth: '' };
                                    const isSelected = selectedRows.has(p.id);

                                    // Logic for Alerts
                                    const medicationName = p.antibiotico?.medicamento || '';
                                    const isHighRisk = MEDICAMENTOS_ALTO_RIESGO.some(riskMed =>
                                        medicationName.toUpperCase().includes(riskMed)
                                    );

                                    const admissionDate = new Date(p.fechaIngreso);
                                    const timeDiff = Math.abs(new Date().getTime() - admissionDate.getTime());
                                    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                                    const isNewPatient = dayDiff <= 2;

                                    return (
                                        <tr key={p.id} className={`hover:bg-white/5 transition-colors ${isSelected ? 'bg-[#00E5FF]/5' : ''}`}>
                                            <td className="px-3 py-4 text-center">
                                                <GlassCheckbox
                                                    checked={isSelected}
                                                    onChange={() => toggleRow(p.id)}
                                                />
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-gray-500">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{dateStr}</span>
                                                    <span>{monthStr}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 max-w-[150px] truncate group relative">
                                                <span className="text-gray-300 group-hover:text-white transition-colors">{p.direccion}</span>
                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 p-2 bg-black/90 border border-white/10 rounded-lg text-xs whitespace-normal w-48 shadow-2xl backdrop-blur-xl">
                                                    {p.direccion}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white uppercase">{p.nombreCompleto}</span>
                                                    <span className="text-[10px] text-gray-500 font-mono tracking-tighter mt-0.5">{p.id}</span>
                                                    {isNewPatient && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-[8px] font-bold uppercase tracking-widest w-fit mt-1 border border-[#00E5FF]/30">
                                                            NUEVO
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-gray-400">{age}</td>
                                            <td className={`px-3 py-4 bg-[#00E5FF]/5 border-x border-white/5`}>
                                                <div className="flex flex-col gap-1">
                                                    <span className={`font-bold transition-colors ${isHighRisk ? 'text-red-400' : 'text-[#00E5FF]'}`}>
                                                        {medicationName}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-[10px] font-semibold">
                                                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">{p.antibiotico?.miligramos}mg</span>
                                                        <span className="text-gray-400">/</span>
                                                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">{p.antibiotico?.frecuenciaHoras}hrs</span>
                                                    </div>
                                                    {isHighRisk && (
                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-0.5 animate-pulse">ALTO RIESGO</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold">{p.antibiotico?.diasTotales} d</span>
                                                    <span className="text-[9px] text-gray-600 font-mono">Fin: {p.antibiotico?.fechaTerminacion}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <span className={`font-bold uppercase ${p.alergicoMedicamentos ? 'text-red-500' : 'text-gray-600'}`}>
                                                    {p.alergicoMedicamentos ? (p.alergiasInfo || 'SÍ') : 'NO'}
                                                </span>
                                            </td>

                                            <td className="px-2 py-4">
                                                <GlassInput
                                                    className="!py-1 !px-2 !text-[10px] min-w-[80px]"
                                                    value={admin.nap}
                                                    onChange={(e) => handleAdminDataChange(p.id, 'nap', e.target.value)}
                                                    placeholder="NAP..."
                                                />
                                            </td>
                                            <td className="px-2 py-4 text-center">
                                                <GlassInput
                                                    className="!py-1 !px-2 !text-[10px] min-w-[80px]"
                                                    value={admin.reutilization}
                                                    onChange={(e) => handleAdminDataChange(p.id, 'reutilization', e.target.value)}
                                                    placeholder="—"
                                                />
                                            </td>
                                            <td className="px-2 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <select
                                                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-[#00E5FF]/50"
                                                        value={admin.auth}
                                                        onChange={(e) => handleAdminDataChange(p.id, 'auth', e.target.value)}
                                                    >
                                                        <option value="">-</option>
                                                        <option value="SI">SI</option>
                                                        <option value="NO">NO</option>
                                                        <option value="ENTE">ENTE</option>
                                                    </select>
                                                    <GlassInput
                                                        className="!py-1 !px-2 !text-[10px] min-w-[80px]"
                                                        value={admin.napAuth}
                                                        onChange={(e) => handleAdminDataChange(p.id, 'napAuth', e.target.value)}
                                                        placeholder="NAP Aut."
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={11} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                            <p className="text-sm font-light">No hay pacientes con terapia antibiótica activa.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-2.5 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
                        <Icons.User size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest">Responsable de Aval</p>
                        <p className="text-sm text-white font-bold">{user?.nombre}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{user?.cargo}</p>
                    </div>
                </div>

                <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={handleSendOrder}
                    disabled={selectedRows.size === 0}
                    className="min-w-[240px] !py-4 shadow-2xl shadow-[#00E5FF]/20"
                    glow
                >
                    <div className="flex items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                        <span>Avalar y Enviar Orden ({selectedRows.size})</span>
                    </div>
                </GlassButton>
            </div>
        </div>
    );
};

export default ProductionOrderView;