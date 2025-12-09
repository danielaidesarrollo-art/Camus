import React, { useState, useMemo } from 'react';
import { Patient } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import Button from './ui/Button.tsx';
import Card from './ui/Card.tsx';
import Modal from './ui/Modal.tsx';
import PatientIntakeForm from './PatientIntakeForm.tsx';
import PatientCard from './PatientCard.tsx';
import { Icons, PROGRAMAS } from '../constants.tsx';
import Input from './ui/Input.tsx';

const PatientList: React.FC = () => {
    const { patients, addPatient, updatePatient } = useAppContext();
    const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
    const [filter, setFilter] = useState<string>('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = useMemo(() => {
        if (!Array.isArray(patients)) {
            return [];
        }
        
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();

        return patients.filter(patient => {
            if (!patient || typeof patient.id !== 'string' || typeof patient.nombreCompleto !== 'string') {
                return false;
            }

            const programMatch = filter === 'Todos' || patient.programa === filter;
            if (!programMatch) return false;

            if (lowercasedSearchTerm === '') return true;
            
            const searchMatch =
                patient.nombreCompleto.toLowerCase().includes(lowercasedSearchTerm) ||
                patient.id.toLowerCase().includes(lowercasedSearchTerm) ||
                (typeof patient.tipoDocumento === 'string' && patient.tipoDocumento.toLowerCase().includes(lowercasedSearchTerm)) ||
                (typeof patient.estado === 'string' && patient.estado.toLowerCase().includes(lowercasedSearchTerm));
            
            return searchMatch;
        });
    }, [patients, filter, searchTerm]);

    const handleAddPatient = (patient: Patient) => {
        addPatient(patient);
        setIsNewPatientModalOpen(false);
    };

    const handleUpdatePatient = (updatedPatient: Patient) => {
        updatePatient(updatedPatient);
        if (selectedPatient && selectedPatient.id === updatedPatient.id) {
            setSelectedPatient(updatedPatient); // Keep the card open with updated data
        }
    };
    
    const handleEditSubmit = (updatedPatient: Patient) => {
        updatePatient(updatedPatient);
        setIsEditModalOpen(false);
        setPatientToEdit(null);
    };

    const handleOpenEditModal = (patient: Patient) => {
        setPatientToEdit(patient);
        setSelectedPatient(null);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setPatientToEdit(null);
    };
    
    const safeRender = (value: any, fallback: string = 'N/A') => {
        return (typeof value === 'string' || typeof value === 'number') ? value : fallback;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Listado de Pacientes</h1>
                <Button onClick={() => setIsNewPatientModalOpen(true)}>
                    {Icons.Plus}
                    Ingresar Paciente
                </Button>
            </div>
            
            <div className="mb-4">
                <Input
                    id="patient-search"
                    type="text"
                    placeholder="Buscar por nombre, documento, tipo de documento o estado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
                    <button onClick={() => setFilter('Todos')} className={`w-full py-2 px-4 rounded-md transition ${filter === 'Todos' ? 'bg-white shadow' : ''}`}>Todos</button>
                    {PROGRAMAS.map(prog => (
                         <button key={prog} onClick={() => setFilter(prog)} className={`w-full py-2 px-4 rounded-md transition text-sm ${filter === prog ? 'bg-white shadow' : ''}`}>{prog}</button>
                    ))}
                </div>
            </div>

            {selectedPatient && (
                <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title={`Detalles del Paciente: ${safeRender(selectedPatient.nombreCompleto, 'Paciente sin nombre')}`}>
                    <PatientCard patient={selectedPatient} onUpdate={handleUpdatePatient} onClose={() => setSelectedPatient(null)} onEdit={handleOpenEditModal} />
                </Modal>
            )}
            
            <Modal isOpen={isNewPatientModalOpen} onClose={() => setIsNewPatientModalOpen(false)} title="Formulario de Ingreso de Paciente">
                <PatientIntakeForm onSubmit={handleAddPatient} onClose={() => setIsNewPatientModalOpen(false)} />
            </Modal>
            
            {patientToEdit && (
                <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Información del Paciente">
                    <PatientIntakeForm patientToEdit={patientToEdit} onSubmit={handleEditSubmit} onClose={handleCloseEditModal} />
                </Modal>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.length > 0 ? filteredPatients.map(patient => (
                    <Card key={patient.id} className="cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setSelectedPatient(patient)}>
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-bold text-lg text-brand-blue">{safeRender(patient.nombreCompleto, 'Nombre no válido')}</p>
                                <p className="text-sm text-gray-500">ID: {safeRender(patient.id, 'ID no válido')}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                patient.estado === 'Aceptado' ? 'bg-green-100 text-green-800' : 
                                patient.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {safeRender(patient.estado)}
                            </span>
                        </div>
                       
                        <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                            <p><strong className="text-gray-600">Dirección:</strong> {safeRender(patient.direccion)}</p>
                            <p><strong className="text-gray-600">Teléfono:</strong> {safeRender(patient.telefonoMovil)}</p>
                             <p><strong className="text-gray-600">Programa:</strong> {safeRender(patient.programa)}</p>
                        </div>
                    </Card>
                )) : (
                    <p className="text-gray-500 col-span-full text-center mt-8">No se encontraron pacientes que coincidan con los filtros.</p>
                )}
            </div>
        </div>
    );
};

export default PatientList;