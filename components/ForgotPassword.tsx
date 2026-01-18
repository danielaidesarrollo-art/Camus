
import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from './ui/GlassComponents.tsx';
import { Icons } from '../constants.tsx';
import { authService } from '../utils/authService.ts';

interface ForgotPasswordProps {
    onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
    const [step, setStep] = useState<'request' | 'verify'>('request');
    const [documentoOrEmail, setDocumentoOrEmail] = useState('');
    const [documento, setDocumento] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await authService.requestPasswordReset(documentoOrEmail);
            setSuccess(result.message);
            setDocumento(documentoOrEmail); // Store for next step
            setStep('verify');
        } catch (err: any) {
            setError(err.message || 'Error al solicitar recuperación de contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Validate password strength
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(documento, code, newPassword);
            setSuccess('¡Contraseña actualizada exitosamente! Redirigiendo al login...');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                onBackToLogin();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Error al restablecer contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] p-4 font-inter relative overflow-hidden">
            {/* Background decorative glows */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#00E5FF] opacity-[0.08] blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#A855F7] opacity-[0.08] blur-[120px] rounded-full"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00E5FF] opacity-[0.03] blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00E5FF] opacity-[0.03] blur-[150px] pointer-events-none"></div>

            <div className="w-full max-w-md space-y-10 relative z-10 animate-fade-in-up">
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-[#A855F7] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img
                            src="/logo-polaris.jpg"
                            alt="Polaris Core Logo"
                            className="relative w-32 h-32 rounded-full border border-white/10 glow-cyan mb-6 object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                    <h1 className="text-5xl font-bold text-white font-outfit text-glow tracking-tighter">CAMUS</h1>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#00E5FF] to-[#A855F7] rounded-full mt-4 mb-2"></div>
                    <p className="text-gray-400 font-medium uppercase tracking-[0.3em] text-[10px]">
                        Recuperación de Contraseña
                    </p>
                </div>

                <GlassCard className="!p-10 border-white/5 relative overflow-hidden">
                    {/* Interior decorative glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00E5FF]/5 blur-3xl pointer-events-none"></div>

                    {step === 'request' ? (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Recuperar Contraseña</h2>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Ingrese su documento de identidad o correo electrónico para recibir un código de verificación.
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleRequestReset}>
                                <GlassInput
                                    label="Documento o Correo Electrónico"
                                    type="text"
                                    placeholder="Ej. 79965441 o correo@ejemplo.com"
                                    value={documentoOrEmail}
                                    onChange={(e) => setDocumentoOrEmail(e.target.value)}
                                    required
                                />

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-shake">
                                        {Icons.AlertCircle && <span className="inline-block mr-2 align-middle">⚠️</span>}
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                                        ✓ {success}
                                    </div>
                                )}

                                <GlassButton
                                    type="submit"
                                    className="w-full !py-4 text-sm uppercase tracking-widest font-black"
                                    glow
                                    disabled={loading}
                                >
                                    {loading ? 'Enviando...' : 'Enviar Código'}
                                </GlassButton>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Verificar Código</h2>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Ingrese el código de verificación que recibió y su nueva contraseña.
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleResetPassword}>
                                <GlassInput
                                    label="Código de Verificación"
                                    type="text"
                                    placeholder="Ej. 123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    maxLength={6}
                                />

                                <GlassInput
                                    label="Nueva Contraseña"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />

                                <GlassInput
                                    label="Confirmar Contraseña"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-shake">
                                        {Icons.AlertCircle && <span className="inline-block mr-2 align-middle">⚠️</span>}
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                                        ✓ {success}
                                    </div>
                                )}

                                <GlassButton
                                    type="submit"
                                    className="w-full !py-4 text-sm uppercase tracking-widest font-black"
                                    glow
                                    disabled={loading}
                                >
                                    {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
                                </GlassButton>

                                <button
                                    type="button"
                                    onClick={() => setStep('request')}
                                    className="w-full text-[10px] font-bold text-gray-400 hover:text-[#00E5FF] transition-all uppercase tracking-widest"
                                >
                                    ← Solicitar nuevo código
                                </button>
                            </form>
                        </>
                    )}

                    <div className="pt-6 mt-8 text-center border-t border-white/5">
                        <button
                            onClick={onBackToLogin}
                            className="text-[10px] font-bold text-[#00E5FF] hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2 group mx-auto"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span>
                            Volver al Login
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

export default ForgotPassword;
