

import React, { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react';
import { User, Patient, HandoverNote } from '../types.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import { usePatients } from '../hooks/usePatients.tsx';
import { useHandover } from '../hooks/useHandover.tsx';
import { safeCore } from '../utils/SafeCoreSDK.ts';

const DATA_VERSION = '5.1';
const SYNC_INTERVAL = 30000; // Sync every 30 seconds

interface AppContextType {
    user: User | null;
    users: User[];
    patients: Patient[];
    handoverNotes: HandoverNote[];
    isLoading: boolean;
    isSyncing: boolean;
    error: string | null;
    login: (documento: string, password: string) => Promise<User>;
    logout: () => void;
    updateUserInContext: (user: User) => void;
    addUser: (user: User) => void;
    updateUserInList: (user: User) => void;
    removeUser: (documento: string) => void;
    addPatient: (patient: Patient) => void;
    updatePatient: (patient: Patient) => void;
    addHandoverNote: (note: HandoverNote) => void;
    syncData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

    const auth = useAuth();
    const patients = usePatients();
    const handover = useHandover();

    // Data versioning & Initial Load
    useEffect(() => {
        const init = async () => {
            try {
                const storedVersion = localStorage.getItem('dataVersion');
                if (storedVersion !== DATA_VERSION) {
                    localStorage.clear();
                    localStorage.setItem('dataVersion', DATA_VERSION);
                }
                // Initial sync
                await syncData();
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // Real-time Polling Mechanism
    useEffect(() => {
        if (auth.user) {
            syncTimerRef.current = setInterval(() => {
                syncData();
            }, SYNC_INTERVAL);
        } else {
            if (syncTimerRef.current) clearInterval(syncTimerRef.current);
        }
        return () => {
            if (syncTimerRef.current) clearInterval(syncTimerRef.current);
        };
    }, [auth.user]);

    const syncData = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            // Secure ecosystem headers simulation (Sirius compliance)
            const headers = safeCore.getEcosystemHeaders();
            console.log("[AppContext] Syncing with Ecosystem:", headers['X-DanielAI-Station']);

            await Promise.all([
                patients.refreshPatients(),
                handover.refreshHandoverNotes()
            ]);
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            setIsSyncing(false);
        }
    };

    const value: AppContextType = {
        isLoading,
        isSyncing,
        error,
        user: auth.user,
        users: auth.users,
        patients: patients.patients,
        handoverNotes: handover.handoverNotes,
        login: auth.login,
        logout: auth.logout,
        updateUserInContext: auth.updateUserInContext,
        addUser: auth.addUser,
        updateUserInList: auth.updateUserInList,
        removeUser: auth.removeUser,
        addPatient: patients.addPatient,
        updatePatient: patients.updatePatient,
        addHandoverNote: handover.addHandoverNote,
        syncData
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
