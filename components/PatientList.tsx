
import React, { useState, useMemo } from 'react';
import { Patient } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import { GlassCard, GlassButton, GlassInput } from './ui/GlassComponents.tsx';
import Modal from './ui/Modal.tsx';
import PatientIntakeForm from './PatientIntakeForm.tsx';
import PatientCard from './PatientCard.tsx';
import { Icons, PROGRAMAS } from '../constants.tsx';

const PatientList: React.FC = () => {
    const { patients, addPatient, updatePatient } = useAppContext();
    const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
    const [filter, setFilter] = useState<string>('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = useMemo(() => {
        if (!Array.isArray(patients)) return [];
        const lowerTerm = searchTerm.toLowerCase().trim();
        return patients.filter(p => {
            if (!p) return false;
            const programMatch = filter === 'Todos' || p.programa === filter;
            if (!programMatch) return false;
            if (lowerTerm === '') return true;
            return (
                p.nombreCompleto?.toLowerCase().includes(lowerTerm) ||
                p.id?.toLowerCase().includes(lowerTerm) ||
                p.estado?.toLowerCase().includes(lowerTerm)
            );
        });
    }, [patients, filter, searchTerm]);

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-white font-outfit text-glow">Pacientes</h1>
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-0.5 bg-[#00E5FF] rounded-full"></span>
                        <p className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-black">Gestión de atención extramural</p>
                    </div>
                </div>
                <GlassButton onClick={() => setIsNewPatientModalOpen(true)} glow className="h-[52px] !px-8">
                    {Icons.Plus}
                    <span className="ml-3 font-bold">Ingresar Paciente</span>
                </GlassButton>
            </header>

            <GlassCard className="!p-4 border-[#00E5FF]/20 relative overflow-visible">
                <div className="flex flex-col xl:flex-row gap-6">
                    <div className="flex-grow">
                        <GlassInput
                            placeholder="Buscar por nombre, documento o estado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="!bg-white/[0.03]"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 no-scrollbar items-center">
                        <button
                            onClick={() => setFilter('Todos')}
                            className={`px-5 py-2.5 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap border ${filter === 'Todos'
                                ? 'bg-[#00E5FF] border-[#00E5FF] text-[#0B0E14] shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                                : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:border-white/10'
                                }`}
                        >
                            Todos
                        </button>
                        {PROGRAMAS.map(prog => (
                            <button
                                key={prog}
                                onClick={() => setFilter(prog)}
                                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap border ${filter === prog
                                    ? 'bg-[#00E5FF] border-[#00E5FF] text-[#0B0E14] shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                                    : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:border-white/10'
                                    }`}
                            >
                                {prog.replace('Virrey solis en Casa ', '')}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPatients.length > 0 ? filteredPatients.map(patient => (
                    <GlassCard
                        key={patient.id}
                        className="group relative h-[220px] cursor-pointer hover:border-[#00E5FF]/40 flex flex-col justify-between transition-all duration-500"
                        onClick={() => setSelectedPatient(patient)}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1 min-w-0">
                                <h3 className="text-xl font-bold text-white group-hover:text-[#00E5FF] transition-colors truncate font-outfit">
                                    {patient.nombreCompleto}
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Doc: {patient.id}</p>
                            </div>
                            <span className={`flex-shrink-0 px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] rounded-lg border ${patient.estado === 'Aceptado' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                patient.estado === 'Rechazado' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                    'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                }`}>
                                {patient.estado}
                            </span>
                        </div>

                        <div className="space-y-3 py-4 border-y border-white/5 mt-4">
                            <div className="flex items-center gap-3">
                                <span className="p-1.5 bg-white/5 rounded-lg text-[#00E5FF] opacity-70">{Icons.Map}</span>
                                <p className="text-sm text-gray-400 truncate leading-none">{patient.direccion}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="p-1.5 bg-white/5 rounded-lg text-[#00E5FF] opacity-70">{Icons.Home}</span>
                                <p className="text-[11px] text-gray-300 font-bold uppercase tracking-wider leading-none">
                                    {patient.programa?.replace('Virrey solis en Casa ', '')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-[10px] font-black text-[#00E5FF] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            <span>Ver detalles clínicos</span>
                            <span className="text-xl">→</span>
                        </div>

                        {/* Decorative glow background */}
                        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#00E5FF]/5 blur-3xl rounded-full group-hover:bg-[#00E5FF]/10 transition-all"></div>
                    </GlassCard>
                )) : (
                    <div className="col-span-full py-32 text-center">
                        <GlassCard className="inline-block px-12 py-8 border-dashed border-white/10">
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">
                                No se encontraron registros coincidentes
                            </p>
                        </GlassCard>
                    </div>
                )}
            </div>

            {selectedPatient && (
                <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title={selectedPatient.nombreCompleto}>
                    <PatientCard patient={selectedPatient} onUpdate={updatePatient} onClose={() => setSelectedPatient(null)} onEdit={(p) => { setPatientToEdit(p); setIsEditModalOpen(true); setSelectedPatient(null); }} />
                </Modal>
            )}

            <Modal isOpen={isNewPatientModalOpen} onClose={() => setIsNewPatientModalOpen(false)} title="Ingreso Administrativo">
                <PatientIntakeForm onSubmit={(p) => { addPatient(p); setIsNewPatientModalOpen(false); }} onClose={() => setIsNewPatientModalOpen(false)} />
            </Modal>

            {patientToEdit && (
                <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setPatientToEdit(null); }} title="Corrección de Datos">
                    <PatientIntakeForm patientToEdit={patientToEdit} onSubmit={(p) => { updatePatient(p); setIsEditModalOpen(false); setPatientToEdit(null); }} onClose={() => { setIsEditModalOpen(false); setPatientToEdit(null); }} />
                </Modal>
            )}
        </div>
    );
};

export default PatientList;
