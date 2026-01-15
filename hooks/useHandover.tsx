
import { useCallback } from 'react';
import { HandoverNote } from '../types.ts';
import useLocalStorage from './useLocalStorage.ts';

export const useHandover = () => {
    const [handoverNotes, setHandoverNotes] = useLocalStorage<HandoverNote[]>('handoverNotes', []);

    const refreshHandoverNotes = useCallback(async () => {
        // Currently using localStorage only
        // Future: Add API sync here when backend is available
        console.log('[useHandover] Refresh - using localStorage');
    }, []);

    const addHandoverNote = useCallback(async (newNote: HandoverNote) => {
        setHandoverNotes(prev => [newNote, ...prev]);
    }, [setHandoverNotes]);

    return { handoverNotes, addHandoverNote, refreshHandoverNotes };
};
