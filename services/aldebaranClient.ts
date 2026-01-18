/**
 * Aldebaran Client Service
 * Secure communication with Aldebaran Emergency Service
 */

import type { EmergencyActivation, PatientContext, CPREvent } from '../types/copilot';

interface EmergencySession {
    id: string;
    status: 'active' | 'paused' | 'completed';
    startTime: Date;
    professional: {
        id: string;
        name: string;
    };
}

class AldebaranClient {
    private apiUrl: string;
    private wsUrl: string;
    private ws: WebSocket | null = null;
    private sessionId: string | null = null;

    constructor() {
        this.apiUrl = import.meta.env.VITE_ALDEBARAN_URL || 'http://localhost:3001';
        this.wsUrl = import.meta.env.VITE_ALDEBARAN_WS || 'ws://localhost:3001';
    }

    /**
     * Activate emergency session
     */
    async activateEmergency(activation: EmergencyActivation): Promise<EmergencySession> {
        try {
            // Get auth token from Polaris
            const token = this.getAuthToken();

            const response = await fetch(`${this.apiUrl}/api/emergency/activate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Source-App': 'CAMUS',
                    'X-Professional-ID': activation.professional.id
                },
                body: JSON.stringify({
                    patientContext: activation.patient,
                    location: activation.location,
                    reason: activation.reason,
                    trigger: activation.trigger
                })
            });

            if (!response.ok) {
                throw new Error(`Aldebaran activation failed: ${response.statusText}`);
            }

            const session: EmergencySession = await response.json();
            this.sessionId = session.id;

            // Establish WebSocket connection for real-time updates
            this.connectWebSocket(session.id, token);

            console.log('[Aldebaran] Emergency session activated:', session.id);
            return session;

        } catch (error) {
            console.error('[Aldebaran] Activation error:', error);
            // Fallback to local mode if Aldebaran is unavailable
            return this.activateLocalMode(activation);
        }
    }

    /**
     * Connect WebSocket for real-time updates
     */
    private connectWebSocket(sessionId: string, token: string): void {
        try {
            this.ws = new WebSocket(`${this.wsUrl}?session=${sessionId}&token=${token}`);

            this.ws.onopen = () => {
                console.log('[Aldebaran] WebSocket connected');
            };

            this.ws.onmessage = (event) => {
                const update = JSON.parse(event.data);
                this.handleRealtimeUpdate(update);
            };

            this.ws.onerror = (error) => {
                console.error('[Aldebaran] WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('[Aldebaran] WebSocket disconnected');
                // Attempt reconnection
                setTimeout(() => this.reconnectWebSocket(sessionId, token), 5000);
            };

        } catch (error) {
            console.error('[Aldebaran] WebSocket connection failed:', error);
        }
    }

    /**
     * Reconnect WebSocket
     */
    private reconnectWebSocket(sessionId: string, token: string): void {
        if (this.sessionId === sessionId) {
            this.connectWebSocket(sessionId, token);
        }
    }

    /**
     * Handle real-time updates from Aldebaran
     */
    private handleRealtimeUpdate(update: any): void {
        // Dispatch custom event for components to listen
        window.dispatchEvent(new CustomEvent('aldebaran-update', { detail: update }));
    }

    /**
     * Update CPR cycle data
     */
    async updateCycle(cycleData: any): Promise<void> {
        if (!this.sessionId) return;

        const token = this.getAuthToken();

        await fetch(`${this.apiUrl}/api/emergency/${this.sessionId}/cycle`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cycleData)
        });
    }

    /**
     * End emergency session
     */
    async endEmergency(outcome: 'rosc' | 'ongoing' | 'unsuccessful', notes?: string): Promise<void> {
        if (!this.sessionId) return;

        const token = this.getAuthToken();

        await fetch(`${this.apiUrl}/api/emergency/${this.sessionId}/end`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ outcome, notes })
        });

        // Close WebSocket
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.sessionId = null;
        console.log('[Aldebaran] Emergency session ended');
    }

    /**
     * Get authentication token from localStorage
     */
    private getAuthToken(): string {
        // TODO: Integrate with Polaris auth service
        return localStorage.getItem('auth_token') || '';
    }

    /**
     * Fallback to local mode when Aldebaran is unavailable
     */
    private activateLocalMode(activation: EmergencyActivation): EmergencySession {
        console.warn('[Aldebaran] Using local fallback mode');

        const session: EmergencySession = {
            id: `local_${Date.now()}`,
            status: 'active',
            startTime: new Date(),
            professional: activation.professional
        };

        // Store locally
        localStorage.setItem('aldebaran_session', JSON.stringify(session));

        return session;
    }

    /**
     * Check if Aldebaran service is available
     */
    async checkAvailability(): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

export const aldebaranClient = new AldebaranClient();
