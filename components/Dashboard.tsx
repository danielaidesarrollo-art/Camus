
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.tsx';
import PatientList from './PatientList.tsx';
import HandoverForm from './HandoverForm.tsx';
import ScheduleView from './ScheduleView.tsx';
import ProfileView from './ProfileView.tsx';
import MapView from './MapView.tsx';
import RoutePlanner from './RoutePlanner.tsx';
import StaffManagement from './StaffManagement.tsx';
import ProductionOrderView from './ProductionOrderView.tsx';
import PersonnelPlanner from './PersonnelPlanner.tsx';
import PatientPortal from './PatientPortal.tsx';
import { CopilotPanel } from './CopilotPanel.tsx';
import { EmergencyButton } from './EmergencyButton.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import { canAccessView, View, isPatient } from '../utils/permissions.ts';
import type { PatientContext } from '../types/copilot';

const Dashboard: React.FC = () => {
    const { user } = useAppContext();
    const [activeView, setActiveView] = useState('dashboard');

    // Redirect patients to their portal
    useEffect(() => {
        if (user && isPatient(user)) {
            setActiveView('patient_portal');
        }
    }, [user]);

    useEffect(() => {
        const validViews = ['dashboard', 'patient_portal', 'handover', 'schedule', 'profile', 'map', 'routes', 'staff', 'production', 'personnel'];
        if (!validViews.includes(activeView)) {
            setActiveView('dashboard');
        }

        // Check if user has permission to access this view
        if (user && !canAccessView(user, activeView as View)) {
            // Redirect to appropriate default view
            if (isPatient(user)) {
                setActiveView('patient_portal');
            } else {
                setActiveView('dashboard');
            }
        }
    }, [activeView, user]);

    const renderView = () => {
        // Patients always see their portal
        if (user && isPatient(user)) {
            return <PatientPortal />;
        }

        switch (activeView) {
            case 'dashboard':
                return <PatientList />;
            case 'patient_portal':
                return <PatientPortal />;
            case 'handover':
                return <HandoverForm />;
            case 'schedule':
                return <ScheduleView />;
            case 'map':
                return <MapView />;
            case 'routes':
                return <RoutePlanner />;
            case 'production':
                return <ProductionOrderView />;
            case 'profile':
                return <ProfileView />;
            case 'staff':
                return <StaffManagement />;
            case 'personnel':
                return <PersonnelPlanner />;
            default:
                return <PatientList />;
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#0B0E14] font-inter">
            {/* Background decorative glows */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00E5FF] opacity-[0.03] blur-[150px] pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#00E5FF] opacity-[0.03] blur-[150px] pointer-events-none"></div>

            <Navbar onNavigate={setActiveView} activeView={activeView} />

            <main className="flex-grow p-4 md:p-8 relative z-10 overflow-x-hidden">
                <div className="max-w-7xl mx-auto animate-fade-in">
                    {renderView()}
                </div>
            </main>

            {/* AI Copilot Panel - Available for all professionals */}
            {user && !isPatient(user) && (
                <CopilotPanel
                    patientContext={{
                        patientId: 'current',
                        age: 0,
                        gender: 'M',
                        diagnoses: [],
                        medications: [],
                        allergies: []
                    } as PatientContext}
                />
            )}

            {/* Emergency Button - Available for all professionals */}
            {user && !isPatient(user) && (
                <EmergencyButton
                    patientContext={{
                        patientId: 'current',
                        age: 0,
                        gender: 'M',
                        diagnoses: [],
                        medications: [],
                        allergies: []
                    } as PatientContext}
                />
            )}
        </div>
    );
};

export default Dashboard;
