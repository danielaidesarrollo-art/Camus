

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
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                ? 'bg-[#00E5FF] text-[#0B0E14] glow-cyan'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
    >
        <span className={`${isActive ? 'text-[#0B0E14]' : 'text-[#00E5FF]'}`}>{icon}</span>
        <span className="hidden lg:inline">{label}</span>
    </button>
);

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView }) => {
    const { user, logout } = useAppContext();

    const isChiefOrCoord = user?.cargo?.toUpperCase().includes('JEFE') || user?.cargo?.toUpperCase().includes('COORDINADOR');

    return (
        <nav className="sticky top-0 z-50 px-4 py-3">
            <div className="max-w-7xl mx-auto">
                <div className="glass-panel px-6 py-3 flex items-center justify-between border-white/5 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-full border border-[#00E5FF]/30 object-cover" />
                        <div className="hidden sm:block">
                            <span className="font-bold text-white text-lg font-outfit tracking-tight">CAMUS</span>
                            <p className="text-[10px] text-[#00E5FF] font-medium uppercase tracking-widest opacity-80 leading-none">Extramural</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2">
                        <NavItem icon={Icons.Home} label="Pacientes" isActive={activeView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                        <NavItem icon={Icons.Map} label="Mapa" isActive={activeView === 'map'} onClick={() => onNavigate('map')} />
                        <NavItem icon={Icons.Route} label="Rutas" isActive={activeView === 'routes'} onClick={() => onNavigate('routes')} />
                        {isChiefOrCoord && (
                            <NavItem icon={Icons.ClipboardCheck} label="Prod." isActive={activeView === 'production'} onClick={() => onNavigate('production')} />
                        )}
                        <NavItem icon={Icons.Profile} label="Perfil" isActive={activeView === 'profile'} onClick={() => onNavigate('profile')} />
                    </div>

                    <div className="flex items-center gap-4 border-l border-white/10 pl-4 ml-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-white leading-tight">{user?.nombre}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">{user?.cargo}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-90"
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
