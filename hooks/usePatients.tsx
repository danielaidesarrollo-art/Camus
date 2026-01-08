
import { useCallback } from 'react';
import { Patient } from '../types.ts';
import useLocalStorage from './useLocalStorage.ts';
import { getInitialPatients } from '../data/patients.ts';
import apiClient from '../utils/apiClient.ts';

export const usePatients = () => {
    const [patients, setPatients] = useLocalStorage<Patient[]>('patients', getInitialPatients);

    const refreshPatients = useCallback(async () => {
        try {
            const response = await apiClient.get('/patients');
            if (response.data) setPatients(response.data);
        } catch (e) {
            console.error("Polaris sync failed, using cache", e);
        }
    }, [setPatients]);

    const addPatient = useCallback(async (newPatient: Patient) => {
        try {
            await apiClient.post('/patients', newPatient);
            setPatients(prev => [...prev, newPatient]);
        } catch (e) {
            setPatients(prev => [...prev, newPatient]);
        }
    }, [setPatients]);

    const updatePatient = useCallback(async (updatedPatient: Patient) => {
        try {
            await apiClient.put(`/patients/${updatedPatient.id}`, updatedPatient);
            setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        } catch (e) {
            setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        }
    }, [setPatients]);

    return { patients, addPatient, updatePatient, refreshPatients };
};
