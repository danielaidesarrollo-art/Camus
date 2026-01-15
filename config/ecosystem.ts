/**
 * Daniel_AI Ecosystem Configuration for Camus
 * Defines integration endpoints for Orion, Vega, and Sirius
 */

export const ECOSYSTEM_CONFIG = {
    // Camus Station Identity
    station: {
        name: 'Camus',
        code: 'CAMUS-01',
        type: 'Patient Management & Home Care',
        version: 'v1.0.0-PWA'
    },

    // Integration Endpoints
    services: {
        // Sirius - Authentication & Authorization Gateway
        sirius: {
            enabled: true,
            baseUrl: process.env.VITE_SIRIUS_URL || 'https://sirius-api.daniel-ai.com',
            endpoints: {
                auth: '/auth/login',
                validate: '/auth/validate',
                biometric: '/auth/biometric',
                register: '/auth/register'
            },
            features: {
                biometricAuth: true,
                roleBasedAccess: true,
                tokenRefresh: true
            }
        },

        // Orion - Triage & Clinical Decision Support
        orion: {
            enabled: true,
            baseUrl: process.env.VITE_ORION_URL || 'https://orion-api.daniel-ai.com',
            endpoints: {
                triage: '/triage/assess',
                clinicalNotes: '/clinical/notes',
                aiAnalysis: '/ai/analyze',
                recommendations: '/ai/recommendations'
            },
            features: {
                aiTriage: true,
                clinicalAnalysis: true,
                riskAssessment: true
            }
        },

        // Vega - Data Core & Analytics
        vega: {
            enabled: true,
            baseUrl: process.env.VITE_VEGA_URL || 'https://vega-api.daniel-ai.com',
            endpoints: {
                patients: '/data/patients',
                handovers: '/data/handovers',
                analytics: '/analytics/dashboard',
                sync: '/sync/bidirectional'
            },
            features: {
                realTimeSync: true,
                analytics: true,
                dataWarehouse: true
            }
        },

        // Phoenix - Wound Care (Optional Integration)
        phoenix: {
            enabled: false,
            baseUrl: process.env.VITE_PHOENIX_URL || 'https://phoenix-api.daniel-ai.com',
            endpoints: {
                wounds: '/wounds/list',
                assessments: '/wounds/assess',
                images: '/wounds/images'
            }
        }
    },

    // SafeCore Compliance Settings
    compliance: {
        encryptionLevel: 'AES-256',
        complianceVersion: 'v2.0-HIPAA',
        auditLogging: true,
        dataRetention: 90, // days
        piiProtection: true
    },

    // Sync Configuration
    sync: {
        enabled: true,
        interval: 30000, // 30 seconds
        strategy: 'bidirectional',
        conflictResolution: 'server-wins',
        offlineQueue: true
    },

    // Feature Flags
    features: {
        patientPortal: true,
        pwaSupport: true,
        offlineMode: true,
        biometricAuth: false, // Disabled for now, requires Sirius integration
        aiAnalysis: false, // Disabled for now, requires Orion integration
        realTimeSync: false // Disabled for now, requires Vega integration
    }
};

/**
 * Get service URL for a specific endpoint
 */
export const getServiceUrl = (service: keyof typeof ECOSYSTEM_CONFIG.services, endpoint: string): string => {
    const serviceConfig = ECOSYSTEM_CONFIG.services[service];
    if (!serviceConfig || !serviceConfig.enabled) {
        throw new Error(`Service ${service} is not enabled`);
    }
    return `${serviceConfig.baseUrl}${endpoint}`;
};

/**
 * Check if a service is available
 */
export const isServiceAvailable = (service: keyof typeof ECOSYSTEM_CONFIG.services): boolean => {
    const serviceConfig = ECOSYSTEM_CONFIG.services[service];
    return serviceConfig?.enabled || false;
};

/**
 * Get ecosystem health status
 */
export const getEcosystemHealth = () => {
    return {
        station: ECOSYSTEM_CONFIG.station.name,
        services: {
            sirius: ECOSYSTEM_CONFIG.services.sirius.enabled,
            orion: ECOSYSTEM_CONFIG.services.orion.enabled,
            vega: ECOSYSTEM_CONFIG.services.vega.enabled,
            phoenix: ECOSYSTEM_CONFIG.services.phoenix.enabled
        },
        features: ECOSYSTEM_CONFIG.features,
        compliance: ECOSYSTEM_CONFIG.compliance.complianceVersion
    };
};
