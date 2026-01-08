
import React, { useState } from 'react';
import { User } from '../types.ts';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './ui/GlassComponents.tsx';
import { ROLES_ASISTENCIALES } from '../constants.tsx';
import { useAppContext } from '../context/AppContext.tsx';

interface RegisterProps {
    onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
    // Fix: Destructure properties directly from useAppContext as the 'state' object is no longer part of the context type.
    const { users, addUser } = useAppContext();

    const [documento, setDocumento] = useState('');
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [institucion, setInstitucion] = useState('');
    const [cargo, setCargo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Las claves no coinciden.');
            return;
        }

        if (users.some(u => u.documento === documento || u.correo === correo)) {
            setError('El documento o correo ya está registrado.');
            return;
        }

        const newUser: User = { documento, nombre, correo, institucion, cargo, password };

        try {
            addUser(newUser);
            setSuccess('¡Registro exitoso! Ahora puede iniciar sesión.');

            // Clear form
            setDocumento('');
            setNombre('');
            setCorreo('');
            setInstitucion('');
            setCargo('');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado durante el registro.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] p-4 font-inter relative overflow-hidden">
            {/* Background decorative glows - matched with Login */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#00E5FF] opacity-[0.07] blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#A855F7] opacity-[0.07] blur-[120px] rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00E5FF] opacity-[0.03] blur-[150px] pointer-events-none"></div>

            <div className="w-full max-w-2xl space-y-8 relative z-10 animate-fade-in-up">
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-[#A855F7] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img
                            src="/logo.jpg"
                            alt="Camus Logo"
                            className="relative w-24 h-24 rounded-full border border-white/10 glow-cyan mb-6 object-cover shadow-2xl"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white font-outfit text-glow tracking-tight">Registro de Colaborador</h1>
                    <p className="mt-2 text-gray-400 font-medium uppercase tracking-[0.2em] text-[10px]">
                        Únase a la red de atención extramural Camus
                    </p>
                </div>

                <GlassCard className="!p-10 border-white/5 relative overflow-hidden">
                    {/* Interior glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00E5FF]/5 blur-3xl pointer-events-none"></div>

                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <GlassInput id="nombre" label="Nombres y Apellidos" type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Nombre completo" />
                            <GlassInput id="documento" label="Número de Documento" type="text" value={documento} onChange={e => setDocumento(e.target.value)} required placeholder="Ej: 10203040" />
                            <GlassInput id="correo" label="Correo Electrónico" type="email" value={correo} onChange={e => setCorreo(e.target.value)} required placeholder="correo@virreysolis.com" />
                            <GlassInput id="institucion" label="Institución / IPS" type="text" value={institucion} onChange={e => setInstitucion(e.target.value)} required placeholder="Nombre de la IPS" />
                            <GlassSelect id="cargo" label="Cargo Asistencial" options={ROLES_ASISTENCIALES} value={cargo} onChange={e => setCargo(e.target.value)} required />
                            <div className="flex flex-col gap-6">
                                <GlassInput id="password" label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                                <GlassInput id="confirmPassword" label="Confirmar Contraseña" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Confirmar contraseña" />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider animate-shake">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-4 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
                                {success}
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-white/5">
                            <GlassButton type="submit" variant="primary" className="flex-1 !py-4" glow>
                                Finalizar Registro
                            </GlassButton>
                            <GlassButton type="button" variant="secondary" onClick={onBackToLogin} className="flex-1 !py-4">
                                Volver a Identificación
                            </GlassButton>
                        </div>
                    </form>
                </GlassCard>

                <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest leading-loose">
                    &copy; 2026 Virrey Solís IPS. <br />
                    Sistema de Gestión de Atención domiciliaria - Protocolo Sirius-Polaris Integrado.
                </p>
            </div>
        </div>
    );
};

export default Register;