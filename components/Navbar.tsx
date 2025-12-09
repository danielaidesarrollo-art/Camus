

import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Icons } from '../constants.tsx';

interface NavbarProps {
    onNavigate: (view: string) => void;
    activeView: string;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-brand-accent text-white' : 'text-gray-300 hover:bg-brand-lightblue hover:text-white'
        }`}
    >
        {icon}
        <span className="hidden md:inline">{label}</span>
    </button>
);

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView }) => {
    // Fix: Destructure properties directly from useAppContext as the 'state' object is no longer part of the context type.
    const { user, logout } = useAppContext();

    const safeRender = (value: any) => {
        return (typeof value === 'string' || typeof value === 'number') ? value : '';
    };

    const isChiefOrCoord = user?.cargo?.toUpperCase().includes('JEFE') || user?.cargo?.toUpperCase().includes('COORDINADOR');

    return (
        <nav className="bg-brand-blue shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="font-bold text-white text-xl">Virrey Solis PAD</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 overflow-x-auto">
                        <NavItem icon={Icons.Home} label="Pacientes" isActive={activeView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                        <NavItem icon={Icons.Clipboard} label="Entrega Turno" isActive={activeView === 'handover'} onClick={() => onNavigate('handover')} />
                        <NavItem icon={Icons.Calendar} label="Agenda" isActive={activeView === 'schedule'} onClick={() => onNavigate('schedule')} />
                        <NavItem icon={Icons.Map} label="Mapa" isActive={activeView === 'map'} onClick={() => onNavigate('map')} />
                        <NavItem icon={Icons.Route} label="Rutas" isActive={activeView === 'routes'} onClick={() => onNavigate('routes')} />
                        {isChiefOrCoord && (
                            <NavItem icon={Icons.ClipboardCheck} label="Orden Prod." isActive={activeView === 'production'} onClick={() => onNavigate('production')} />
                        )}
                        <NavItem icon={Icons.Profile} label="Mi Perfil" isActive={activeView === 'profile'} onClick={() => onNavigate('profile')} />
                        {user?.cargo === 'JEFE MEDICO' && (
                            <NavItem icon={Icons.Users} label="Personal" isActive={activeView === 'staff'} onClick={() => onNavigate('staff')} />
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{safeRender(user?.nombre)}</p>
                            <p className="text-xs text-gray-300">{safeRender(user?.cargo)}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-full text-gray-300 hover:bg-brand-lightblue hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-blue focus:ring-white"
                            title="Cerrar Sesión"
                        >
                            {Icons.Logout}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;