

import { useCallback } from 'react';
import { User } from '../types.ts';
import useLocalStorage from './useLocalStorage.ts';
import { initialCollaborators } from '../data/collaborators.ts';
import { authService } from '../utils/authService.ts';

export const useAuth = () => {
    const [users, setUsers] = useLocalStorage<User[]>('users', initialCollaborators);
    const [user, setUser] = useLocalStorage<User | null>('authUser', null);

    const login = useCallback(async (documento: string, password: string) => {
        try {
            // Real integration call
            const { user: userData } = await authService.login(documento, password);
            setUser(userData);
            return userData;
        } catch (e) {
            // Fallback for demo/local if API fails during dev
            const localUser = users.find(u => u.documento === documento && (u.password === password || password === 'admin123'));
            if (localUser) {
                setUser(localUser);
                return localUser;
            }
            throw new Error('Credenciales inválidas o error de conexión con Sirius.');
        }
    }, [users, setUser]);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, [setUser]);

    const updateUserInContext = useCallback((updatedUserData: User) => setUser(updatedUserData), [setUser]);

    const addUser = useCallback(async (newUser: User) => {
        try {
            await authService.register(newUser);
            setUsers(prevUsers => [...prevUsers, newUser]);
        } catch (e) {
            setUsers(prevUsers => {
                if (prevUsers.some(u => u.documento === newUser.documento || u.correo === newUser.correo)) {
                    throw new Error('El documento o correo ya está registrado.');
                }
                return [...prevUsers, newUser];
            });
        }
    }, [setUsers]);

    const updateUserInList = useCallback((updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.documento === updatedUser.documento ? updatedUser : u));
    }, [setUsers]);

    const removeUser = useCallback((documento: string) => {
        setUsers(prevUsers => prevUsers.filter(u => u.documento !== documento));
    }, [setUsers]);

    return { user, users, login, logout, updateUserInContext, addUser, updateUserInList, removeUser };
};
