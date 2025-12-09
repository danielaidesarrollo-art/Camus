
import { useCallback } from 'react';
import { HandoverNote } from '../types.ts';
import useLocalStorage from './useLocalStorage.ts';

export const useHandover = () => {
    const [handoverNotes, setHandoverNotes] = useLocalStorage<HandoverNote[]>('handoverNotes', []);

    const addHandoverNote = useCallback((newNote: HandoverNote) => {
        // Add the new note to the beginning of the array
        setHandoverNotes(prev => [newNote, ...prev]);
    }, [setHandoverNotes]);

    return { handoverNotes, addHandoverNote };
};