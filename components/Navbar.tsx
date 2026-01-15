

import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Icons } from '../constants.tsx';
import { isPatient, canAccessView, View } from '../utils/permissions.ts';

interface NavbarProps {
    onNavigate: (view: string) => void;
    activeView: string;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-500 relative group ${isActive
            ? 'text-[#00E5FF]'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
    >
        {isActive && (
            <div className="absolute inset-0 bg-[#00E5FF]/10 rounded-xl blur-sm -z-10 animate-fade-in"></div>
        )}
        <span className={`${isActive ? 'text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]' : 'text-gray-500 group-hover:text-[#00E5FF] transition-colors'}`}>{icon}</span>
        <span className="hidden lg:inline">{label}</span>
    </button>
);

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView }) => {
    const { user, logout } = useAppContext();

    const isChiefOrCoord = user?.cargo?.toUpperCase().includes('JEFE') || user?.cargo?.toUpperCase().includes('COORDINADOR');
    const userIsPatient = user && isPatient(user);

    return (
        <nav className="sticky top-0 z-50 px-4 py-3">
            <div className="max-w-7xl mx-auto">
                <div className="glass-panel px-6 py-3 flex items-center justify-between border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-white/5">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate(userIsPatient ? 'patient_portal' : 'dashboard')}>
                        <div className="relative">
                            <img src="/logo-camus.jpg" alt="Camus Logo" className="w-10 h-10 rounded-full border border-[#00E5FF]/30 object-cover group-hover:border-[#00E5FF] transition-all" />
                            <div className="absolute inset-0 rounded-full bg-[#00E5FF]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="hidden sm:block">
                            <span className="font-bold text-white text-lg font-outfit tracking-tight block leading-none">CAMUS</span>
                            <p className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-[0.2em] opacity-80 mt-1">
                                {userIsPatient ? 'Mi Portal' : 'Extramural'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2">
                        {userIsPatient ? (
                            // Patient navigation - simplified
                            <>
                                <NavItem icon={Icons.Home} label="Mi Portal" isActive={activeView === 'patient_portal'} onClick={() => onNavigate('patient_portal')} />
                                <NavItem icon={Icons.Profile} label="Perfil" isActive={activeView === 'profile'} onClick={() => onNavigate('profile')} />
                            </>
                        ) : (
                            // Professional navigation - full access based on permissions
                            <>
                                {canAccessView(user, View.DASHBOARD) && (
                                    <NavItem icon={Icons.Home} label="Pacientes" isActive={activeView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                                )}
                                {canAccessView(user, View.MAP) && (
                                    <NavItem icon={Icons.Map} label="Mapa" isActive={activeView === 'map'} onClick={() => onNavigate('map')} />
                                )}
                                {canAccessView(user, View.ROUTES) && (
                                    <NavItem icon={Icons.Route} label="Rutas" isActive={activeView === 'routes'} onClick={() => onNavigate('routes')} />
                                )}
                                {isChiefOrCoord && canAccessView(user, View.PRODUCTION) && (
                                    <NavItem icon={Icons.ClipboardCheck} label="Prod." isActive={activeView === 'production'} onClick={() => onNavigate('production')} />
                                )}
                                {isChiefOrCoord && canAccessView(user, View.PERSONNEL) && (
                                    <NavItem icon={Icons.Users} label="Planeación" isActive={activeView === 'personnel'} onClick={() => onNavigate('personnel')} />
                                )}
                                <NavItem icon={Icons.Profile} label="Perfil" isActive={activeView === 'profile'} onClick={() => onNavigate('profile')} />
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pl-4 border-l border-white/10 ml-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-white leading-tight font-outfit">{user?.nombre}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1 opacity-70">
                                {userIsPatient ? 'Paciente' : (user?.cargo?.includes('(') ? user.cargo.split('(')[0] : user?.cargo)}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-95 group"
                            title="Cerrar Sesión"
                        >
                            <span className="group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.4)] transition-all">
                                {Icons.Logout}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
