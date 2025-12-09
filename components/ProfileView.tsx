
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import Card from './ui/Card.tsx';
import Input from './ui/Input.tsx';
import Button from './ui/Button.tsx';

// Helper component to safely render user data that might be malformed in localStorage
const InfoItem: React.FC<{ label: string, value: any }> = ({ label, value }) => {
    const displayValue = (typeof value === 'string' || typeof value === 'number') ? value : 'N/A';
    return (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-lg text-gray-900">{displayValue}</p>
        </div>
    );
};

const ProfileView: React.FC = () => {
    // Fix: Destructure properties directly from useAppContext as the 'state' object is no longer part of the context type.
    const { user, users, updateUserInContext, updateUserInList } = useAppContext();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user) {
            setError('No hay un usuario autenticado.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('La nueva clave y la confirmación no coinciden.');
            return;
        }

        const currentUserInDb = users.find(u => u.documento === user.documento);

        if (!currentUserInDb) {
            setError("No se pudo encontrar su usuario en la base de datos para verificar la clave.");
            return;
        }

        if (currentUserInDb.password !== currentPassword) {
            setError('La clave actual es incorrecta.');
            return;
        }

        const updatedUser = { ...currentUserInDb, password: newPassword };

        try {
            updateUserInList(updatedUser);
            updateUserInContext(updatedUser);

            setSuccess('¡Clave actualizada exitosamente!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'No se pudo actualizar la clave.');
        }
    };

    if (!user) {
        return <p>Cargando perfil...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
            <Card title="Información del Colaborador">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Nombre Completo" value={user.nombre} />
                    <InfoItem label="Documento" value={user.documento} />
                    <InfoItem label="Correo Corporativo" value={user.correo} />
                    <InfoItem label="Cargo" value={user.cargo} />
                </div>
            </Card>

            <Card title="Cambiar Clave Personal">
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input 
                        label="Clave Actual" 
                        type="password" 
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required 
                    />
                    <Input 
                        label="Nueva Clave" 
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required 
                    />
                    <Input 
                        label="Confirmar Nueva Clave" 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required 
                    />
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                    <div className="pt-2">
                        <Button type="submit">Actualizar Clave</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ProfileView;