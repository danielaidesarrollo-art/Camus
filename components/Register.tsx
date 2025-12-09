
import React, { useState } from 'react';
import { User } from '../types.ts';
import Input from './ui/Input.tsx';
import Button from './ui/Button.tsx';
import { ROLES_ASISTENCIALES } from '../constants.tsx';
import Select from './ui/Select.tsx';
import { useAppContext } from '../context/AppContext.tsx';

interface RegisterProps {
    onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
    // Fix: Destructure properties directly from useAppContext as the 'state' object is no longer part of the context type.
    const { users, addUser } = useAppContext();

    const [documento, setDocumento] = useState('');
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [institucion, setInstitucion] = useState('');
    const [cargo, setCargo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Las claves no coinciden.');
            return;
        }

        if (users.some(u => u.documento === documento || u.correo === correo)) {
            setError('El documento o correo ya está registrado.');
            return;
        }

        const newUser: User = { documento, nombre, correo, institucion, cargo, password };
        
        try {
            addUser(newUser);
            setSuccess('¡Registro exitoso! Ahora puede iniciar sesión.');
            
            // Clear form
            setDocumento('');
            setNombre('');
            setCorreo('');
            setInstitucion('');
            setCargo('');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
             setError(err.message || 'Ocurrió un error inesperado durante el registro.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-gray">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-brand-blue">
                        Registro de Colaborador
                    </h2>
                </div>
                <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="nombre" label="Nombres y Apellidos" type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />
                        <Input id="documento" label="Número de Documento" type="text" value={documento} onChange={e => setDocumento(e.target.value)} required />
                        <Input id="correo" label="Correo Electrónico" type="email" value={correo} onChange={e => setCorreo(e.target.value)} required />
                        <Input id="institucion" label="Institución donde trabaja" type="text" value={institucion} onChange={e => setInstitucion(e.target.value)} required />
                        <Select id="cargo" label="Cargo" options={ROLES_ASISTENCIALES} value={cargo} onChange={e => setCargo(e.target.value)} required />
                        <Input id="password" label="Clave" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <Input id="confirmPassword" label="Confirmar Clave" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                    
                    <div className="flex flex-col md:flex-row gap-4 pt-4">
                        <Button type="submit" className="w-full">Registrarse</Button>
                        <Button type="button" variant="secondary" onClick={onBackToLogin} className="w-full">Volver a Inicio de Sesión</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;