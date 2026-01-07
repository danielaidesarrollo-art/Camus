
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
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white font-outfit text-glow">Pacientes</h1>
                    <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs font-medium">Gestión de atención domiciliaria</p>
                </div>
                <GlassButton onClick={() => setIsNewPatientModalOpen(true)} glow>
                    {Icons.Plus}
                    <span className="ml-2">Ingresar Paciente</span>
                </GlassButton>
            </header>

            <GlassCard className="!p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-grow">
                        <GlassInput
                            placeholder="Buscar por nombre, documento o estado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                        <button
                            onClick={() => setFilter('Todos')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === 'Todos' ? 'bg-[#00E5FF] text-[#0B0E14]' : 'bg-white/5 text-gray-400 hover:text-white'
                                }`}
                        >
                            Todos
                        </button>
                        {PROGRAMAS.map(prog => (
                            <button
                                key={prog}
                                onClick={() => setFilter(prog)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === prog ? 'bg-[#00E5FF] text-[#0B0E14]' : 'bg-white/5 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {prog.replace('Virrey solis en Casa ', '')}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.length > 0 ? filteredPatients.map(patient => (
                    <GlassCard
                        key={patient.id}
                        className="group relative overflow-hidden"
                        onClick={() => setSelectedPatient(patient)}
                    >
                        <div className="absolute top-0 right-0 p-4">
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${patient.estado === 'Aceptado' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                    patient.estado === 'Rechazado' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                        'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                }`}>
                                {patient.estado}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-[#00E5FF] transition-colors line-clamp-1">
                                    {patient.nombreCompleto}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">ID: {patient.id}</p>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <div className="flex items-start gap-2">
                                    <span className="text-[#00E5FF] opacity-50 mt-1">{Icons.Map}</span>
                                    <p className="text-sm text-gray-400 line-clamp-1">{patient.direccion}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#00E5FF] opacity-50">{Icons.Home}</span>
                                    <p className="text-sm text-gray-300 font-medium">{patient.programa?.replace('Virrey solis en Casa ', '')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Ver Detalles →
                            </span>
                        </div>
                    </GlassCard>
                )) : (
                    <div className="col-span-full py-20 text-center glass-panel">
                        <p className="text-gray-500 font-medium">No se encontraron pacientes para esta búsqueda.</p>
                    </div>
                )}
            </div>

            {/* Modals remain mostly the same but could be stylized further in Modal.tsx */}
            {selectedPatient && (
                <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title={selectedPatient.nombreCompleto}>
                    <PatientCard patient={selectedPatient} onUpdate={updatePatient} onClose={() => setSelectedPatient(null)} onEdit={(p) => { setPatientToEdit(p); setIsEditModalOpen(true); setSelectedPatient(null); }} />
                </Modal>
            )}

            <Modal isOpen={isNewPatientModalOpen} onClose={() => setIsNewPatientModalOpen(false)} title="Nuevo Ingreso">
                <PatientIntakeForm onSubmit={(p) => { addPatient(p); setIsNewPatientModalOpen(false); }} onClose={() => setIsNewPatientModalOpen(false)} />
            </Modal>

            {patientToEdit && (
                <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setPatientToEdit(null); }} title="Editar Paciente">
                    <PatientIntakeForm patientToEdit={patientToEdit} onSubmit={(p) => { updatePatient(p); setIsEditModalOpen(false); setPatientToEdit(null); }} onClose={() => { setIsEditModalOpen(false); setPatientToEdit(null); }} />
                </Modal>
            )}
        </div>
    );
};

export default PatientList;
