import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from './ui/GlassComponents.tsx';
import { emailService } from '../utils/emailService.ts';

/**
 * EmailJS Configuration Test Component
 * This component helps diagnose EmailJS configuration issues
 */
const EmailJSTest: React.FC = () => {
    const [configStatus, setConfigStatus] = useState<any>(null);
    const [testResult, setTestResult] = useState<any>(null);
    const [testEmail, setTestEmail] = useState('daniel.ai.desarrollo@gmail.com');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check configuration on mount
        const status = emailService.getConfigStatus();
        setConfigStatus(status);
        console.log('[EmailJSTest] Configuration Status:', status);
    }, []);

    const handleTestConfiguration = async () => {
        setLoading(true);
        try {
            const result = await emailService.testConfiguration();
            setTestResult(result);
            console.log('[EmailJSTest] Test Result:', result);
        } catch (error) {
            console.error('[EmailJSTest] Test Error:', error);
            setTestResult({ success: false, message: 'Error al probar configuración' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendTestEmail = async () => {
        setLoading(true);
        try {
            const success = await emailService.sendPasswordResetEmail(
                testEmail,
                'Usuario de Prueba',
                '123456'
            );
            setTestResult({
                success,
                message: success
                    ? `Email de prueba enviado exitosamente a ${testEmail}`
                    : 'Error al enviar email de prueba'
            });
        } catch (error: any) {
            console.error('[EmailJSTest] Send Error:', error);
            setTestResult({
                success: false,
                message: error.message || 'Error al enviar email de prueba'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] p-4">
            <GlassCard className="max-w-2xl w-full p-8">
                <h1 className="text-3xl font-bold text-white mb-6">
                    🔧 EmailJS Configuration Test
                </h1>

                {/* Configuration Status */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-3">
                        Estado de Configuración
                    </h2>
                    {configStatus && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className={configStatus.configured ? 'text-green-500' : 'text-red-500'}>
                                    {configStatus.configured ? '✅' : '❌'}
                                </span>
                                <span className="text-gray-300">
                                    {configStatus.configured
                                        ? 'EmailJS está configurado'
                                        : 'EmailJS NO está configurado'}
                                </span>
                            </div>
                            <div className="ml-6 space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={configStatus.details.hasServiceId ? 'text-green-500' : 'text-red-500'}>
                                        {configStatus.details.hasServiceId ? '✅' : '❌'}
                                    </span>
                                    <span className="text-gray-400">Service ID</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={configStatus.details.hasTemplateId ? 'text-green-500' : 'text-red-500'}>
                                        {configStatus.details.hasTemplateId ? '✅' : '❌'}
                                    </span>
                                    <span className="text-gray-400">Template ID</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={configStatus.details.hasPublicKey ? 'text-green-500' : 'text-red-500'}>
                                        {configStatus.details.hasPublicKey ? '✅' : '❌'}
                                    </span>
                                    <span className="text-gray-400">Public Key</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Environment Variables */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-3">
                        Variables de Entorno
                    </h2>
                    <div className="bg-black/30 p-4 rounded-lg font-mono text-xs space-y-1">
                        <div className="text-gray-400">
                            VITE_EMAILJS_SERVICE_ID: <span className="text-cyan-400">{import.meta.env.VITE_EMAILJS_SERVICE_ID || 'NO CONFIGURADO'}</span>
                        </div>
                        <div className="text-gray-400">
                            VITE_EMAILJS_TEMPLATE_ID: <span className="text-cyan-400">{import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'NO CONFIGURADO'}</span>
                        </div>
                        <div className="text-gray-400">
                            VITE_EMAILJS_PUBLIC_KEY: <span className="text-cyan-400">{import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? '***' + import.meta.env.VITE_EMAILJS_PUBLIC_KEY.slice(-4) : 'NO CONFIGURADO'}</span>
                        </div>
                    </div>
                </div>

                {/* Test Actions */}
                <div className="space-y-4 mb-6">
                    <GlassButton
                        onClick={handleTestConfiguration}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Probando...' : 'Probar Configuración'}
                    </GlassButton>

                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="Email de prueba"
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                        <GlassButton
                            onClick={handleSendTestEmail}
                            disabled={loading || !configStatus?.configured}
                            glow
                        >
                            Enviar Email de Prueba
                        </GlassButton>
                    </div>
                </div>

                {/* Test Result */}
                {testResult && (
                    <div className={`p-4 rounded-lg border ${testResult.success
                            ? 'bg-green-500/10 border-green-500/20 text-green-500'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                        <div className="font-semibold mb-1">
                            {testResult.success ? '✅ Éxito' : '❌ Error'}
                        </div>
                        <div className="text-sm">{testResult.message}</div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h3 className="text-blue-400 font-semibold mb-2">📋 Instrucciones</h3>
                    <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                        <li>Verifica que todas las variables de entorno estén configuradas</li>
                        <li>Haz clic en "Probar Configuración" para validar las credenciales</li>
                        <li>Si todo está OK, envía un email de prueba</li>
                        <li>Revisa tu bandeja de entrada (y spam) en el email de prueba</li>
                        <li>Revisa la consola del navegador (F12) para ver logs detallados</li>
                    </ol>
                </div>
            </GlassCard>
        </div>
    );
};

export default EmailJSTest;
