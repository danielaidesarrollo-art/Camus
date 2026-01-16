import { User } from '../types';
import { emailService } from './emailService';

interface ResetCode {
    documento: string;
    code: string;
    expiresAt: number;
}

export const authService = {
    /**
     * Standard Login - localStorage only
     */
    async login(documento: string, password: string): Promise<{ user: User; token: string }> {
        // Currently using localStorage only
        // Future: Add API authentication here when backend is available
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: User) => u.documento === documento && u.password === password);

        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        // Store current user
        const token = 'mock-token-' + Date.now();
        localStorage.setItem('polaris_token', token);
        localStorage.setItem('authUser', JSON.stringify(user));

        return { user, token };
    },

    /**
     * Biometric Validation Simulation (Polaris Protocol)
     */
    async validateBiometrics(documento: string): Promise<boolean> {
        // Simulates a call to Polaris Biometric Station
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[Polaris] Biometric validation successful for: ${documento}`);
                resolve(true);
            }, 1500);
        });
    },

    /**
     * Register new collaborator in the Daniel AI ecosystem
     */
    async register(userData: Partial<User>): Promise<User> {
        // Currently using localStorage only
        // Future: Add API registration here when backend is available
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Check if user already exists
        const exists = users.find((u: User) => u.documento === userData.documento);
        if (exists) {
            throw new Error('Usuario ya existe');
        }

        // Add new user
        const newUser = userData as User;
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        return newUser;
    },

    /**
     * Request password reset - generates code and sends email
     */
    async requestPasswordReset(documentoOrEmail: string): Promise<{ success: boolean; message: string }> {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Find user by documento or email
        const user = users.find((u: User) =>
            u.documento === documentoOrEmail || u.correo === documentoOrEmail
        );

        if (!user) {
            throw new Error('No se encontró un usuario con ese documento o correo electrónico.');
        }

        // Generate 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store reset code with 15-minute expiration
        const resetCode: ResetCode = {
            documento: user.documento,
            code,
            expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
        };

        const resetCodes = JSON.parse(localStorage.getItem('resetCodes') || '[]');
        // Remove any existing codes for this user
        const filteredCodes = resetCodes.filter((rc: ResetCode) => rc.documento !== user.documento);
        filteredCodes.push(resetCode);
        localStorage.setItem('resetCodes', JSON.stringify(filteredCodes));

        // Send email with reset code
        try {
            if (!emailService.isConfigured()) {
                // For development/testing: show code in console
                console.log(`[DEV MODE] Reset code for ${user.nombre}: ${code}`);
                return {
                    success: true,
                    message: `Código de recuperación generado: ${code} (válido por 15 minutos). En producción, este código se enviará a ${user.correo}`
                };
            }

            await emailService.sendPasswordResetEmail(user.correo, user.nombre, code);
            return {
                success: true,
                message: `Se ha enviado un código de verificación a ${user.correo}`
            };
        } catch (error) {
            console.error('[AuthService] Error sending reset email:', error);
            // Still return the code in dev mode for testing
            console.log(`[DEV MODE] Reset code for ${user.nombre}: ${code}`);
            return {
                success: true,
                message: `Código de recuperación generado: ${code} (Error al enviar email, pero puede usar este código)`
            };
        }
    },

    /**
     * Validate reset code
     */
    validateResetCode(documento: string, code: string): boolean {
        const resetCodes: ResetCode[] = JSON.parse(localStorage.getItem('resetCodes') || '[]');
        const resetCode = resetCodes.find(rc => rc.documento === documento && rc.code === code);

        if (!resetCode) {
            return false;
        }

        // Check if code is expired
        if (Date.now() > resetCode.expiresAt) {
            // Remove expired code
            const filteredCodes = resetCodes.filter(rc => rc.documento !== documento);
            localStorage.setItem('resetCodes', JSON.stringify(filteredCodes));
            return false;
        }

        return true;
    },

    /**
     * Reset password with valid code
     */
    async resetPassword(documento: string, code: string, newPassword: string): Promise<void> {
        // Validate code first
        if (!this.validateResetCode(documento, code)) {
            throw new Error('Código de verificación inválido o expirado.');
        }

        // Update password
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.documento === documento);

        if (userIndex === -1) {
            throw new Error('Usuario no encontrado.');
        }

        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));

        // Remove used reset code
        const resetCodes: ResetCode[] = JSON.parse(localStorage.getItem('resetCodes') || '[]');
        const filteredCodes = resetCodes.filter(rc => rc.documento !== documento);
        localStorage.setItem('resetCodes', JSON.stringify(filteredCodes));

        console.log(`[AuthService] Password reset successful for user: ${documento}`);
    },

    /**
     * Log out and clear tokens
     */
    logout() {
        localStorage.removeItem('polaris_token');
        localStorage.removeItem('authUser');
    }
};
