
import { useCallback } from 'react';
import { HandoverNote } from '../types.ts';
import useLocalStorage from './useLocalStorage.ts';
import apiClient from '../utils/apiClient.ts';

export const useHandover = () => {
    const [handoverNotes, setHandoverNotes] = useLocalStorage<HandoverNote[]>('handoverNotes', []);

    const refreshHandoverNotes = useCallback(async () => {
        try {
            const response = await apiClient.get('/handover');
            if (response.data) setHandoverNotes(response.data);
        } catch (e) {
            console.error("Polaris sync failed (handover), using cache", e);
        }
    }, [setHandoverNotes]);

    const addHandoverNote = useCallback(async (newNote: HandoverNote) => {
        try {
            await apiClient.post('/handover', newNote);
            setHandoverNotes(prev => [newNote, ...prev]);
        } catch (e) {
            setHandoverNotes(prev => [newNote, ...prev]);
        }
    }, [setHandoverNotes]);

    return { handoverNotes, addHandoverNote, refreshHandoverNotes };
};
