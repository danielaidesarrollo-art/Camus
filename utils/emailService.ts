import emailjs from '@emailjs/browser';

interface EmailConfig {
    serviceId: string;
    templateId: string;
    publicKey: string;
}

// EmailJS Configuration
const emailConfig: EmailConfig = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_camus',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_password_reset',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
};

export const emailService = {
    /**
     * Send password reset code via email
     */
    async sendPasswordResetEmail(
        userEmail: string,
        userName: string,
        resetCode: string
    ): Promise<boolean> {
        try {
            // Validate configuration before attempting to send
            if (!this.isConfigured()) {
                console.warn('[EmailService] EmailJS not configured. Email will not be sent.');
                console.warn('[EmailService] Please configure VITE_EMAILJS_* environment variables.');
                return false;
            }

            console.log('[EmailService] Initializing EmailJS with public key...');
            emailjs.init(emailConfig.publicKey);

            const templateParams = {
                to_email: userEmail,
                to_name: userName,
                reset_code: resetCode,
                app_name: 'CAMUS',
                validity_minutes: '15'
            };

            console.log('[EmailService] Sending password reset email to:', userEmail);
            const response = await emailjs.send(
                emailConfig.serviceId,
                emailConfig.templateId,
                templateParams
            );

            console.log('[EmailService] ✅ Password reset email sent successfully!');
            console.log('[EmailService] Response status:', response.status);
            console.log('[EmailService] Response text:', response.text);
            return response.status === 200;
        } catch (error: any) {
            console.error('[EmailService] ❌ Failed to send password reset email');
            console.error('[EmailService] Error details:', error);

            // Provide more specific error messages
            let errorMessage = 'No se pudo enviar el correo de recuperación.';

            if (error?.text?.includes('Invalid')) {
                errorMessage = 'Configuración de EmailJS inválida. Verifica tus credenciales.';
            } else if (error?.status === 400) {
                errorMessage = 'Error en los parámetros del email. Contacta al administrador.';
            } else if (error?.status === 403) {
                errorMessage = 'Acceso denegado. Verifica tu cuenta de EmailJS.';
            } else if (error?.status === 412) {
                errorMessage = 'Plantilla de email no encontrada. Verifica la configuración.';
            }

            throw new Error(errorMessage);
        }
    },

    /**
     * Validate EmailJS configuration
     */
    isConfigured(): boolean {
        const configured = !!(
            emailConfig.serviceId &&
            emailConfig.templateId &&
            emailConfig.publicKey &&
            emailConfig.publicKey !== ''
        );

        if (!configured) {
            console.warn('[EmailService] Configuration status:');
            console.warn('  - Service ID:', emailConfig.serviceId ? '✅' : '❌');
            console.warn('  - Template ID:', emailConfig.templateId ? '✅' : '❌');
            console.warn('  - Public Key:', emailConfig.publicKey ? '✅' : '❌');
        }

        return configured;
    },

    /**
     * Get configuration status for debugging
     */
    getConfigStatus(): { configured: boolean; details: Record<string, boolean> } {
        return {
            configured: this.isConfigured(),
            details: {
                hasServiceId: !!emailConfig.serviceId,
                hasTemplateId: !!emailConfig.templateId,
                hasPublicKey: !!emailConfig.publicKey && emailConfig.publicKey !== ''
            }
        };
    },

    /**
     * Test EmailJS configuration (for debugging)
     */
    async testConfiguration(): Promise<{ success: boolean; message: string }> {
        try {
            if (!this.isConfigured()) {
                return {
                    success: false,
                    message: 'EmailJS no está configurado. Verifica las variables de entorno.'
                };
            }

            console.log('[EmailService] Testing EmailJS configuration...');
            emailjs.init(emailConfig.publicKey);

            return {
                success: true,
                message: 'Configuración de EmailJS válida. Listo para enviar emails.'
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Error en configuración: ${error?.message || 'Error desconocido'}`
            };
        }
    }
};
