/**
 * Daniel AI Gateway Client
 * Centralized communication with the Copilot Gateway (Port 4000)
 */

interface GatewayRequest {
    type: string;
    app: string;
    priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
    model?: string; // Optional model specification
    data: any;
}

import { ECOSYSTEM_CONFIG } from '../config/ecosystem';

class GatewayClient {
    private gatewayUrl: string;

    constructor() {
        // Use centralized configuration from ecosystem.ts
        // Fallback to CORES if services.gateway is not available (though we just added it)
        const baseUrl = ECOSYSTEM_CONFIG.services.gateway?.baseUrl || ECOSYSTEM_CONFIG.CORES.GATEWAY;
        this.gatewayUrl = `${baseUrl}/v1/copilot/invoke`;
    }

    async invoke(request: GatewayRequest): Promise<any> {
        console.log(`[Gateway] Invoking ${request.type} for ${request.app}`);

        try {
            const { encryptData } = await import('../utils/security');
            const encryptedPayload = await encryptData(request);

            const response = await fetch(this.gatewayUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // JWT Auth should be added here in production as per Directiva 4
                    'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-token'}`,
                    'X-Transit-IV': encryptedPayload.iv
                },
                body: JSON.stringify({ data: encryptedPayload.ciphertext })
            });

            if (!response.ok) {
                throw new Error(`Gateway Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[Gateway] Critical Failure:', error);
            throw error;
        }
    }
}

export const gatewayClient = new GatewayClient();
