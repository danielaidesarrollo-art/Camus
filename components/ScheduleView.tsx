
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

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today

        acceptedPatients.forEach(patient => {
            try {
                let intervalDays = 0;
                let visitType = 'Visita de Seguimiento';
                let priority: 'high' | 'medium' | 'low' = 'medium';

                // 1. Base Logic based on Program
                if (patient.programa === 'Virrey solis en Casa Hospitalario') {
                    intervalDays = 3; // cada 72 horas
                    visitType = 'Visita Domiciliaria (Hospitalario)';
                    priority = 'medium';
                } else if (patient.programa === 'Virrey solis en Casa Crónico') {
                    intervalDays = 90; // cada 3 meses
                    visitType = 'Visita Domiciliaria (Crónico)';
                    priority = 'low';
                } else if (patient.programa === 'Virrey solis en Casa Crónico Paliativo') {
                    intervalDays = 7; // cada 7 días
                    visitType = 'Visita Domiciliaria (Paliativo)';
                    priority = 'high';
                }

                const age = calculateAge(patient.fechaNacimiento);
                let isAntibioticActive = false;

                // 2. Antibiotic Logic (Highest Priority - Overrides Program Defaults)
                // Check if patient has antibiotic therapy marked AND has valid antibiotic data
                if (patient.terapias['Aplicación de terapia antibiótica'] && patient.antibiotico) {
                    const abStart = new Date(patient.antibiotico.fechaInicio);
                    const abEnd = new Date(patient.antibiotico.fechaTerminacion);
                    // Normalize dates for comparison
                    abStart.setHours(0,0,0,0);
                    abEnd.setHours(23,59,59,999);

                    // Check if treatment is currently active
                    if (today >= abStart && today <= abEnd) {
                        isAntibioticActive = true;
                        intervalDays = 1; // Daily administration/check
                        priority = 'high';
                        visitType = `Administración/Control Antibiótico (${patient.antibiotico.medicamento})`;
                    }
                }

                // 3. Pediatric Logic (< 5 years) overrides Program medium/low priorities if not already handled by antibiotics
                if (!isAntibioticActive && age < 5) {
                    // Pediatric patients require daily or very frequent monitoring regardless of program
                    intervalDays = 1; 
                    priority = 'high';
                    visitType = 'Control Pediátrico Prioritario';
                }

                // 4. Calculate Next Visit Date
                if (intervalDays > 0) {
                    const ingressDate = new Date(patient.fechaIngreso);
                    ingressDate.setHours(0,0,0,0);
                    
                    if (isNaN(ingressDate.getTime())) {
                        console.warn(`Skipping schedule for patient ${patient.id} due to invalid fechaIngreso`);
                        return;
                    }
                    
                    // Logic: Find the next due date relative to TODAY based on ingress date cycle.
                    const diffTime = today.getTime() - ingressDate.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
                    
                    let daysUntilNext = 0;
                    
                    if (diffDays < 0) {
                        // Ingress is in future (unlikely but possible), visit is on ingress date
                        daysUntilNext = Math.abs(diffDays); 
                    } else {
                        // Calculate remainder to see when the next cycle hits
                        const remainder = diffDays % intervalDays;
                        // If remainder is 0, it's due today. 
                        // If not 0, it's due in (Interval - Remainder) days.
                        daysUntilNext = remainder === 0 ? 0 : (intervalDays - remainder);
                    }

                    const nextVisitDate = new Date(today);
                    nextVisitDate.setDate(today.getDate() + daysUntilNext);
                    
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
            }
        });

        // Sort: High Priority first, then by Date
        return appointments.sort((a, b) => {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
                return priorityWeight[b.priority] - priorityWeight[a.priority]; // Descending priority
            }
            
            try {
                // Parse DD/MM/YYYY format for sorting
                const [dayA, monthA, yearA] = a.dueDate.split('/').map(Number);
                const [dayB, monthB, yearB] = b.dueDate.split('/').map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                return dateA.getTime() - dateB.getTime();
            } catch (e) {
                return 0;
            }
        });
    }, [patients]);
    
    const getPriorityClass = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high': return 'border-l-4 border-red-500 bg-red-50';
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
                Agenda generada automáticamente basada en criterios clínicos (Antibióticos, Pediatría) y programa.
            </p>
            <div className="space-y-4">
                {schedule.length > 0 ? schedule.map((appt, index) => (
                    <div key={index} className={`shadow rounded-lg p-4 flex justify-between items-center ${getPriorityClass(appt.priority)}`}>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-lg text-brand-blue">{safeRender(appt.patientName, 'Nombre no válido')}</p>
                                {appt.priority === 'high' && <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold">Prioritario</span>}
                            </div>
                            <p className="text-sm text-gray-500">ID: {safeRender(appt.patientId, 'ID no válido')}</p>
                            <p className="text-md text-gray-800 font-medium mt-1">{safeRender(appt.visitType)}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-gray-500">Próxima Visita</p>
                             <p className="font-semibold text-lg text-gray-800">{safeRender(appt.dueDate)}</p>
                             {appt.priority === 'high' && <p className="text-xs text-red-600 font-bold mt-1">Requiere atención inmediata</p>}
                        </div>
                    </div>
                )) : (
                    <Card><p className="text-center text-gray-500">No hay visitas pendientes calculadas.</p></Card>
                )}
            </div>
        </div>
    );
};

export default ScheduleView;
