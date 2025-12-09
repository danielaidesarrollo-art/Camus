
import { useState, useEffect } from 'react';

/**
 * A custom hook to manage state that is persisted in localStorage.
 * @param key The key to use in localStorage.
 * @param initialValue The initial value to use if nothing is in localStorage. Can be a value or a function to compute it.
 * @returns A stateful value, and a function to update it.
 */
function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                return JSON.parse(item);
            }
            // If initialValue is a function, call it to get the initial value
            return initialValue instanceof Function ? initialValue() : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue instanceof Function ? initialValue() : initialValue;
        }
    });

    useEffect(() => {
        try {
            const valueToStore = JSON.stringify(storedValue);
            window.localStorage.setItem(key, valueToStore);
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}

export default useLocalStorage;
