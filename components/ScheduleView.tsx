

import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Patient } from '../types.ts';
import Card from './ui/Card.tsx';
import { calculateAge } from '../constants.tsx';

interface Appointment {
    patientName: string;
    patientId: string;
    visitType: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
}

const ScheduleView: React.FC = () => {
    // Fix: Destructure properties directly from useAppContext as the 'state' object is no longer part of the context type.
    const { patients } = useAppContext();

    const schedule = useMemo(() => {
        const appointments: Appointment[] = [];
        if (!Array.isArray(patients)) {
            return [];
        }

        const acceptedPatients = patients.filter(p => 
            p &&
            typeof p.id === 'string' &&
            typeof p.nombreCompleto === 'string' &&
            p.estado === 'Aceptado' &&
            typeof p.fechaIngreso === 'string' &&
            typeof p.fechaNacimiento === 'string'
        );

        acceptedPatients.forEach(patient => {
            try {
                let intervalDays = 0;
                let visitType = 'Visita de Seguimiento';
                let priority: 'high' | 'medium' | 'low' = 'medium';

                if (patient.programa === 'Virrey solis en Casa Hospitalario') {
                    intervalDays = 3; // cada 72 horas
                    visitType = 'Visita Domiciliaria (Hospitalario)';
                } else if (patient.programa === 'Virrey solis en Casa Crónico') {
                    intervalDays = 90; // cada 3 meses
                    visitType = 'Visita Domiciliaria (Crónico)';
                    priority = 'low';
                } else if (patient.programa === 'Virrey solis en Casa Crónico Paliativo') {
                    intervalDays = 7; // cada 7 días
                    visitType = 'Visita Domiciliaria (Paliativo)';
                    priority = 'high';
                }

                // Criterios clínicos
                // Assuming 'gestante' could be a therapy or a note - for now, we can't detect this.
                // Let's focus on age.
                if (calculateAge(patient.fechaNacimiento) < 5) {
                    intervalDays = 1; // cada 24 horas
                    priority = 'high';
                    visitType += ' - Pediátrico Urgente';
                }

                if (intervalDays > 0) {
                    const ingressDate = new Date(patient.fechaIngreso);
                    
                    // Check if the date is valid. If not, skip this patient.
                    if (isNaN(ingressDate.getTime())) {
                        console.warn(`Skipping schedule for patient ${patient.id} due to invalid fechaIngreso:`, patient.fechaIngreso);
                        return; // continue to next patient in forEach
                    }
                    
                    const nextVisitDate = new Date(ingressDate); // Create a copy
                    nextVisitDate.setDate(nextVisitDate.getDate() + intervalDays);
                    
                    appointments.push({
                        patientName: patient.nombreCompleto,
                        patientId: patient.id,
                        visitType,
                        dueDate: nextVisitDate.toLocaleDateString('es-CO'),
                        priority,
                    });
                }
            } catch (error) {
                console.error(`Failed to process schedule for patient ${patient.id}:`, error);
                // Continue to the next patient even if one fails
            }
        });

        // Sort by due date
        return appointments.sort((a, b) => {
            try {
                // The date is in DD/MM/YYYY format from toLocaleDateString('es-CO')
                const dateA = new Date(a.dueDate.split('/').reverse().join('-'));
                const dateB = new Date(b.dueDate.split('/').reverse().join('-'));
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0; // Don't sort if dates are invalid
                return dateA.getTime() - dateB.getTime();
            } catch (e) {
                console.error('Error during schedule sort:', e);
                return 0; // Don't sort if parsing fails
            }
        });
    }, [patients]);
    
    const getPriorityClass = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high': return 'border-l-4 border-red-500';
            case 'medium': return 'border-l-4 border-yellow-500';
            case 'low': return 'border-l-4 border-green-500';
        }
    }

    const safeRender = (value: any, fallback: string = 'N/A') => {
        return (typeof value === 'string' || typeof value === 'number') ? value : fallback;
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Agenda de Visitas Programadas</h1>
            <p className="text-gray-600 mb-6">
                Esta es una agenda generada automáticamente basada en los criterios del programa y clínicos de cada paciente.
            </p>
            <div className="space-y-4">
                {schedule.length > 0 ? schedule.map((appt, index) => (
                    <div key={index} className={`bg-white shadow rounded-lg p-4 flex justify-between items-center ${getPriorityClass(appt.priority)}`}>
                        <div>
                            <p className="font-bold text-lg text-brand-blue">{safeRender(appt.patientName, 'Nombre no válido')}</p>
                            <p className="text-sm text-gray-500">ID: {safeRender(appt.patientId, 'ID no válido')}</p>
                            <p className="text-md text-gray-700 mt-1">{safeRender(appt.visitType)}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-gray-500">Fecha Programada</p>
                             <p className="font-semibold text-lg text-gray-800">{safeRender(appt.dueDate)}</p>
                        </div>
                    </div>
                )) : (
                    <Card><p className="text-center text-gray-500">No hay citas programadas. Acepte pacientes para generar la agenda.</p></Card>
                )}
            </div>
        </div>
    );
};

export default ScheduleView;