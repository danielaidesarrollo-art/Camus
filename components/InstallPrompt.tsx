
import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from './ui/GlassComponents.tsx';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if user dismissed the prompt before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after 10 seconds
            setTimeout(() => {
                setShowPrompt(true);
            }, 10000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for successful installation
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
        } else {
            console.log('[PWA] User dismissed the install prompt');
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Don't show if already installed or no prompt available
    if (isInstalled || !showPrompt || !deferredPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-fade-in">
            <GlassCard className="!p-6 border-[#00E5FF]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E5FF]/10 blur-2xl rounded-full"></div>

                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
                    aria-label="Cerrar"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-[#00E5FF]/10 rounded-xl">
                            <svg className="w-6 h-6 text-[#00E5FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">Instalar Camus</h3>
                            <p className="text-sm text-gray-400">
                                Instala la app en tu dispositivo para acceso rápido y uso sin conexión
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <GlassButton
                            onClick={handleInstallClick}
                            className="flex-1 !py-3"
                            glow
                        >
                            Instalar Ahora
                        </GlassButton>
                        <GlassButton
                            onClick={handleDismiss}
                            className="!bg-white/5 !text-gray-400 hover:!text-white !py-3 px-4"
                        >
                            Más Tarde
                        </GlassButton>
                    </div>

                    <div className="mt-3 text-xs text-gray-500 text-center">
                        Funciona en Android, iOS y Desktop
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default InstallPrompt;
