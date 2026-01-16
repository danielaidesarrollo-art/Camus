
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { GlassCard, GlassButton, GlassInput } from './ui/GlassComponents.tsx';
import { Icons } from '../constants.tsx';
import Register from './Register.tsx';
import ForgotPassword from './ForgotPassword.tsx';

const Login: React.FC = () => {
    const [documento, setDocumento] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const { login, users } = useAppContext();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!users || users.length === 0) {
            setError("No se encontraron datos de usuario. Por favor, regístrese o contacte a soporte.");
            return;
        }

        try {
            await login(documento, password);
        } catch (err: any) {
            setError(err.message || 'Documento o clave incorrecta.');
        }
    };

    if (isRegistering) {
        return <Register onBackToLogin={() => setIsRegistering(false)} />;
    }

    if (isForgotPassword) {
        return <ForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] p-4 font-inter relative overflow-hidden">
            {/* Multi-layered background decorative glows */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#00E5FF] opacity-[0.08] blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#A855F7] opacity-[0.08] blur-[120px] rounded-full"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00E5FF] opacity-[0.03] blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00E5FF] opacity-[0.03] blur-[150px] pointer-events-none"></div>

            <div className="w-full max-w-md space-y-10 relative z-10 animate-fade-in-up">
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-[#A855F7] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img
                            src="/logo.jpg"
                            alt="Camus Logo"
                            className="relative w-32 h-32 rounded-full border border-white/10 glow-cyan mb-6 object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                    <h1 className="text-5xl font-bold text-white font-outfit text-glow tracking-tighter">CAMUS</h1>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#00E5FF] to-[#A855F7] rounded-full mt-4 mb-2"></div>
                    <p className="text-gray-400 font-medium uppercase tracking-[0.3em] text-[10px]">
                        Atención Extramural Inteligente
                    </p>
                </div>

                <GlassCard className="!p-10 border-white/5 relative overflow-hidden">
                    {/* Interior decorative glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00E5FF]/5 blur-3xl pointer-events-none"></div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Bienvenido</h2>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">Ingrese sus credenciales para acceder a la plataforma.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <GlassInput
                            label="Documento de Identidad"
                            type="text"
                            placeholder="Ej. 123456789"
                            value={documento}
                            onChange={(e) => setDocumento(e.target.value)}
                            required
                        />
                        <GlassInput
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-shake">
                                {Icons.AlertCircle && <span className="inline-block mr-2 align-middle">⚠️</span>}
                                {error}
                            </div>
                        )}

                        <GlassButton type="submit" className="w-full !py-4 text-sm uppercase tracking-widest font-black" glow>
                            Iniciar Sesión
                        </GlassButton>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(true)}
                                className="text-[10px] font-bold text-gray-400 hover:text-[#00E5FF] transition-all uppercase tracking-widest"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    </form>

                    <div className="pt-6 mt-8 text-center border-t border-white/5">
                        <button
                            onClick={() => setIsRegistering(true)}
                            className="text-[10px] font-bold text-[#00E5FF] hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2 group mx-auto"
                        >
                            Nuevo registro?
                            <span className="group-hover:translate-x-1 transition-transform">Ingrese aquí &rarr;</span>
                        </button>
                    </div>
                </GlassCard>

                <div className="text-center space-y-2">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">
                        &copy; 2026 Virrey Solís IPS
                    </p>
                    <div className="flex justify-center gap-4">
                        <div className="w-1 h-1 rounded-full bg-white/10"></div>
                        <div className="w-1 h-1 rounded-full bg-white/10"></div>
                        <div className="w-1 h-1 rounded-full bg-white/10"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
