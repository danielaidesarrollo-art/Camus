
import { useCallback } from 'react';
import { Patient } from '../types.ts';
import useLocalStorage from './useLocalStorage.ts';
import { getInitialPatients } from '../data/patients.ts';

export const usePatients = () => {
    const [patients, setPatients] = useLocalStorage<Patient[]>('patients', getInitialPatients);

    const refreshPatients = useCallback(async () => {
        // Currently using localStorage only
        // Future: Add API sync here when backend is available
        console.log('[usePatients] Refresh - using localStorage');
    }, []);

    const addPatient = useCallback(async (newPatient: Patient) => {
        setPatients(prev => [...prev, newPatient]);
    }, [setPatients]);

    const updatePatient = useCallback(async (updatedPatient: Patient) => {
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    }, [setPatients]);

    return { patients, addPatient, updatePatient, refreshPatients };
};
