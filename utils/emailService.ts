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
            // Initialize EmailJS with public key
            emailjs.init(emailConfig.publicKey);

            const templateParams = {
                to_email: userEmail,
                to_name: userName,
                reset_code: resetCode,
                app_name: 'CAMUS',
                validity_minutes: '15'
            };

            const response = await emailjs.send(
                emailConfig.serviceId,
                emailConfig.templateId,
                templateParams
            );

            console.log('[EmailService] Password reset email sent successfully:', response.status);
            return response.status === 200;
        } catch (error) {
            console.error('[EmailService] Failed to send password reset email:', error);
            throw new Error('No se pudo enviar el correo de recuperación. Por favor, intente más tarde.');
        }
    },

    /**
     * Validate EmailJS configuration
     */
    isConfigured(): boolean {
        return !!(
            emailConfig.serviceId &&
            emailConfig.templateId &&
            emailConfig.publicKey &&
            emailConfig.publicKey !== ''
        );
    }
};
