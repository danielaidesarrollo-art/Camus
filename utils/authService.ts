import { User } from '../types';

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
     * Log out and clear tokens
     */
    logout() {
        localStorage.removeItem('polaris_token');
        localStorage.removeItem('authUser');
    }
};
