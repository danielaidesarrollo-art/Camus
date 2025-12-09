

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, Patient, HandoverNote } from '../types.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import { usePatients } from '../hooks/usePatients.tsx';
import { useHandover } from '../hooks/useHandover.tsx';

const DATA_VERSION = '5.0'; // Updated to force data refresh

interface AppContextType {
  user: User | null;
  users: User[];
  patients: Patient[];
  handoverNotes: HandoverNote[];
  isLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  updateUserInContext: (user: User) => void;
  addUser: (user: User) => void;
  updateUserInList: (user: User) => void;
  removeUser: (documento: string) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  addHandoverNote: (note: HandoverNote) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // This effect handles data versioning and one-time setup checks.
    useEffect(() => {
        try {
            const storedVersion = localStorage.getItem('dataVersion');
            if (storedVersion !== DATA_VERSION) {
                console.warn(`Data version mismatch (found: ${storedVersion}, expected: ${DATA_VERSION}). Resetting application data.`);
                // Clear specific items to ensure a clean slate for the new structure
                localStorage.removeItem('users');
                localStorage.removeItem('authUser');
                localStorage.removeItem('patients');
                localStorage.removeItem('handoverNotes');
                localStorage.setItem('dataVersion', DATA_VERSION);
            }
        } catch (e) {
             console.error("Failed to check data version", e);
             setError("No se pudo verificar la versión de los datos. La aplicación puede no funcionar correctamente.");
        } finally {
            // Data is ready to be loaded by hooks
            setIsLoading(false);
        }
    }, []);

    const auth = useAuth();
    const patients = usePatients();
    const handover = useHandover();

    const value: AppContextType = {
        isLoading,
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