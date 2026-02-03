
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
import { EscalationHub } from './EscalationHub.tsx';
import { ServicePlanningWidget } from './ServicePlanningWidget.tsx';
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
                return (
                    <>
                        {/* New Service Planning Widget (Phase 2 Requirement) */}
                        <ServicePlanningWidget />
                        <PatientList />
                    </>
                );
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
        <div className="hud-layout bg-[#0B0E14] font-inter">
            {/* Background decorative glows */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00E5FF] opacity-[0.03] blur-[150px] pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#00E5FF] opacity-[0.03] blur-[150px] pointer-events-none"></div>

            <header className="hud-header z-50">
                <Navbar onNavigate={setActiveView} activeView={activeView} />
            </header>

            <aside className="peripheral-left z-10 overflow-y-auto custom-scrollbar">
                <div className="animate-fade-in px-2">
                    {activeView === 'dashboard' && <ServicePlanningWidget />}
                    {renderView()}
                </div>
            </aside>

            <div className="center-clear">
                {/* 👓 Visual center is cleared for AR Passthrough/Vision */}
                <div className="w-64 h-64 border-2 border-dashed border-[#00E5FF]/10 rounded-full flex items-center justify-center">
                    <p className="text-[#00E5FF]/20 text-[10px] uppercase tracking-widest">Astra Vision Center</p>
                </div>
            </div>

            <aside className="peripheral-right z-10 flex flex-col gap-4">
                {/* AI Copilot Panel - Integrated into right HUD zone */}
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

                {/* Escalation Hub - Integrated into right HUD zone */}
                {user && !isPatient(user) && (
                    <EscalationHub
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
            </aside>

            <footer className="hud-footer flex items-center justify-between px-8 text-[10px] text-gray-500 uppercase tracking-widest bg-black/20 backdrop-blur-md">
                <span>Ecosistema Daniel AI - Camus v1.2.0</span>
                <span>HUD Status: <span className="text-[#00E5FF]">Optimal</span></span>
                <span>Secure Transit: <span className="text-[#10B981]">AES-256-GCM</span></span>
            </footer>
        </div>
    );
};

export default Dashboard;
