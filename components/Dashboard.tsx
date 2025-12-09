

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.tsx';
import PatientList from './PatientList.tsx';
import HandoverForm from './HandoverForm.tsx';
import ScheduleView from './ScheduleView.tsx';
import ProfileView from './ProfileView.tsx';
import MapView from './MapView.tsx';
import RoutePlanner from './RoutePlanner.tsx';
import StaffManagement from './StaffManagement.tsx';
import ProductionOrderView from './ProductionOrderView.tsx'; // New Import

const Dashboard: React.FC = () => {
    const [activeView, setActiveView] = useState('dashboard');

    // Ensure that if the view state is ever invalid, it defaults back to the patient list.
    // This makes the navigation more robust and aligns with ensuring the patient list is the primary view.
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
                // Render the patient list as a safe fallback while the useEffect corrects the state.
                return <PatientList />;
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar onNavigate={setActiveView} activeView={activeView} />
            <main className="flex-grow p-4 md:p-8">
                {renderView()}
            </main>
        </div>
    );
};

export default Dashboard;