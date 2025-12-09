

import { useCallback } from 'react';
import { User } from '../types.ts';
import useLocalStorage from './useLocalStorage.ts';
import { initialCollaborators } from '../data/collaborators.ts';

export const useAuth = () => {
    const [users, setUsers] = useLocalStorage<User[]>('users', initialCollaborators);
    const [user, setUser] = useLocalStorage<User | null>('authUser', null);

    const login = useCallback((userData: User) => setUser(userData), [setUser]);
    const logout = useCallback(() => setUser(null), [setUser]);
    const updateUserInContext = useCallback((updatedUserData: User) => setUser(updatedUserData), [setUser]);

    const addUser = useCallback((newUser: User) => {
        setUsers(prevUsers => {
            if (prevUsers.some(u => u.documento === newUser.documento || u.correo === newUser.correo)) {
                throw new Error('El documento o correo ya está registrado.');
            }
            return [...prevUsers, newUser];
        });
    }, [setUsers]);

    const updateUserInList = useCallback((updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.documento === updatedUser.documento ? updatedUser : u));
    }, [setUsers]);

    const removeUser = useCallback((documento: string) => {
        setUsers(prevUsers => prevUsers.filter(u => u.documento !== documento));
    }, [setUsers]);

    return { user, users, login, logout, updateUserInContext, addUser, updateUserInList, removeUser };
};