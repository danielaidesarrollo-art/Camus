import apiClient from './apiClient';
import { User } from '../types';

export const authService = {
    /**
     * Standard Login via Polaris Gateway
     */
    async login(documento: string, password: string): Promise<{ user: User; token: string }> {
        // In a real scenario, this coordinates with the Sirius Auth station
        const response = await apiClient.post('/auth/login', { documento, password });
        const { user, token } = response.data;

        localStorage.setItem('polaris_token', token);
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
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    /**
     * Log out and clear tokens
     */
    logout() {
        localStorage.removeItem('polaris_token');
        localStorage.removeItem('authUser');
    }
};
