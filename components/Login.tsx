
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { GlassCard, GlassButton, GlassInput } from './ui/GlassComponents.tsx';
import Register from './Register.tsx';

const Login: React.FC = () => {
    const [documento, setDocumento] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const { login, users } = useAppContext();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!users || users.length === 0) {
            setError("No se encontraron datos de usuario. Por favor, regístrese o contacte a soporte.");
            return;
        }

        const user = users.find(u => u.documento === documento && u.password === password);

        if (user) {
            login(user);
        } else {
            setError('Documento o clave incorrecta.');
        }
    };

    if (isRegistering) {
        return <Register onBackToLogin={() => setIsRegistering(false)} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] p-4 font-inter">
            {/* Background decorative glows */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#00E5FF] opacity-10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#00E5FF] opacity-10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
                <div className="flex flex-col items-center">
                    <img
                        src="/logo.jpg"
                        alt="Camus Logo"
                        className="w-32 h-32 rounded-full border-2 border-[#00E5FF]/30 glow-cyan mb-6 object-cover"
                    />
                    <h1 className="text-4xl font-bold text-white font-outfit text-glow">CAMUS</h1>
                    <p className="mt-2 text-gray-400 font-medium uppercase tracking-widest text-sm">
                        Gestión de Atención Extramural
                    </p>
                </div>

                <GlassCard className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-1">Bienvenido</h2>
                        <p className="text-sm text-gray-400">Ingrese sus credenciales para continuar</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleLogin}>
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
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <GlassButton type="submit" className="w-full" glow>
                            Iniciar Sesión
                        </GlassButton>
                    </form>

                    <div className="pt-4 text-center border-t border-white/5">
                        <button
                            onClick={() => setIsRegistering(true)}
                            className="text-sm font-medium text-[#00E5FF] hover:text-[#00B8CC] transition-colors"
                        >
                            ¿Nuevo colaborador? Registre su cuenta
                        </button>
                    </div>
                </GlassCard>

                <p className="text-center text-xs text-gray-500">
                    &copy; 2026 Virrey Solís IPS. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};

export default Login;
