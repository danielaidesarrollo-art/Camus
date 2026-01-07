

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

const Dashboard: React.FC = () => {
    const [activeView, setActiveView] = useState('dashboard');

    useEffect(() => {
        const validViews = ['dashboard', 'handover', 'schedule', 'profile', 'map', 'routes', 'staff', 'production'];
        if (!validViews.includes(activeView)) {
            setActiveView('dashboard');
        }
    }, [activeView]);

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <PatientList />;
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

            {/* Fixed Bottom Nav for Mobile on Omega (Triage) view could go here if needed per Stitch specs */}
        </div>
    );
};

export default Dashboard;
