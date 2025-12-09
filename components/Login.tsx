
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import Input from './ui/Input.tsx';
import Button from './ui/Button.tsx';
import { Icons } from '../constants.tsx';
import Register from './Register.tsx';

const Login: React.FC = () => {
    const [documento, setDocumento] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    // Fix: Destructure properties directly from useAppContext as the 'state' object is no longer part of the context type.
    const { login, users } = useAppContext();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!users || users.length === 0) {
            setError("No se encontraron datos de usuario. Por favor, regístrese o contacte a soporte.");
            return;
        }

        const user = users.find(u => u.documento === documento && u.password === password);
        
        if (user) {
            login(user);
        } else {
            setError('Documento o clave incorrecta.');
        }
    };

    if (isRegistering) {
        return <Register onBackToLogin={() => setIsRegistering(false)} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-gray">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-brand-blue">
                        Iniciar Sesión
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Módulo de Ingreso de Pacientes
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <Input
                        id="documento"
                        label="Número de Documento"
                        type="text"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        required
                        icon={Icons.User}
                    />
                    <Input
                        id="password"
                        label="Clave Personal"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        icon={Icons.Lock}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <Button type="submit" className="w-full">
                            Ingresar
                        </Button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <button onClick={() => setIsRegistering(true)} className="font-medium text-brand-lightblue hover:text-brand-blue">
                        ¿Nuevo colaborador? Regístrese aquí
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;