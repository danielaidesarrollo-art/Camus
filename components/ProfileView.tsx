
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { GlassCard, GlassButton, GlassInput } from './ui/GlassComponents.tsx';
import { Icons } from '../constants.tsx';

// Helper component to safely render user data that might be malformed in localStorage
const InfoItem: React.FC<{ label: string, value: any, icon: React.ReactNode }> = ({ label, value, icon }) => {
    const displayValue = (typeof value === 'string' || typeof value === 'number') ? value : 'N/A';
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm text-white font-bold">{displayValue}</p>
            </div>
        </div>
    );
};

const ProfileView: React.FC = () => {
    // Fix: Destructure properties directly from useAppContext as the 'state' object is no longer part of the context type.
    const { user, users, updateUserInContext, updateUserInList } = useAppContext();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user) {
            setError('No hay un usuario autenticado.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('La nueva clave y la confirmación no coinciden.');
            return;
        }

        const currentUserInDb = users.find(u => u.documento === user.documento);

        if (!currentUserInDb) {
            setError("No se pudo encontrar su usuario en la base de datos para verificar la clave.");
            return;
        }

        if (currentUserInDb.password !== currentPassword) {
            setError('La clave actual es incorrecta.');
            return;
        }

        const updatedUser = { ...currentUserInDb, password: newPassword };

        try {
            updateUserInList(updatedUser);
            updateUserInContext(updatedUser);

            setSuccess('¡Clave actualizada exitosamente!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'No se pudo actualizar la clave.');
        }
    };

    if (!user) {
        return <p>Cargando perfil...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 font-outfit">
                    <span className="p-2 bg-[#00E5FF]/10 rounded-xl text-[#00E5FF]">
                        <Icons.Profile size={24} />
                    </span>
                    Mi Perfil
                </h1>
                <p className="text-gray-400 text-sm">Gestione su información personal y preferencias de seguridad.</p>
            </div>

            <GlassCard title="Información del Colaborador" className="!p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="Nombre Completo" value={user.nombre} icon={<Icons.User size={18} />} />
                    <InfoItem label="Documento de Identidad" value={user.documento} icon={<Icons.Lock size={18} />} />
                    <InfoItem label="Correo Corporativo" value={user.correo} icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    } />
                    <InfoItem label="Cargo Administrativo" value={user.cargo} icon={<Icons.Clipboard size={18} />} />
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-12">
                    <GlassCard title="Seguridad y Acceso" className="!p-8 relative overflow-hidden">
                        {/* Decorative background for security section */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row gap-10">
                            <div className="flex-1 space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    Actualizar Contraseña
                                </h3>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    Se recomienda cambiar su contraseña periódicamente para mantener la integridad de la información de los pacientes.
                                    Asegúrese de usar una combinación de letras, números y símbolos.
                                </p>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                                    <div className="text-red-400 mt-0.5"><Icons.AlertCircle size={14} /></div>
                                    <p className="text-[10px] text-gray-400">Su contraseña es personal e intransferible. Nunca la comparta con terceros ni la anote en lugares visibles.</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="flex-1 space-y-5">
                                <GlassInput
                                    label="Clave Actual"
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <GlassInput
                                        label="Nueva Clave"
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Nueva clave"
                                    />
                                    <GlassInput
                                        label="Confirmar Nueva Clave"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Repetir clave"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-3 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-[10px] font-bold uppercase tracking-wider">
                                        {success}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <GlassButton type="submit" variant="primary" className="min-w-[180px]">
                                        Actualizar Credenciales
                                    </GlassButton>
                                </div>
                            </form>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;