
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { User } from '../types.ts';
import Card from './ui/Card.tsx';
import Input from './ui/Input.tsx';
import Select from './ui/Select.tsx';
import Button from './ui/Button.tsx';
import { ROLES_ASISTENCIALES, Icons } from '../constants.tsx';

const StaffManagement: React.FC = () => {
    const { users, addUser, updateUserInList, removeUser } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    
    // Form State
    const [documento, setDocumento] = useState('');
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [cargo, setCargo] = useState('');
    const [password, setPassword] = useState('password123'); // Default password
    const [turnoInicio, setTurnoInicio] = useState('');
    const [turnoFin, setTurnoFin] = useState('');
    const [maxPacientes, setMaxPacientes] = useState<number | ''>('');

    const resetForm = () => {
        setDocumento('');
        setNombre('');
        setCorreo('');
        setCargo('');
        setPassword('password123');
        setTurnoInicio('');
        setTurnoFin('');
        setMaxPacientes('');
        setIsEditing(false);
    };

    const handleEdit = (user: User) => {
        setDocumento(user.documento);
        setNombre(user.nombre);
        setCorreo(user.correo);
        setCargo(user.cargo);
        setPassword(user.password || '');
        setTurnoInicio(user.turnoInicio || '');
        setTurnoFin(user.turnoFin || '');
        setMaxPacientes(user.maxPacientes || '');
        setIsEditing(true);
    };

    const handleDelete = (doc: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar a este colaborador? Esta acción no se puede deshacer.')) {
            removeUser(doc);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación: Hora Fin debe ser posterior a Hora Inicio
        if (turnoInicio && turnoFin && turnoInicio >= turnoFin) {
            alert('La hora de fin de turno debe ser posterior a la hora de inicio.');
            return;
        }

        const userData: User = {
            documento,
            nombre,
            correo,
            cargo,
            password,
            turnoInicio: turnoInicio || undefined,
            turnoFin: turnoFin || undefined,
            maxPacientes: maxPacientes ? Number(maxPacientes) : undefined
        };

        try {
            if (isEditing) {
                updateUserInList(userData);
                alert('Colaborador actualizado exitosamente.');
            } else {
                addUser(userData);
                alert('Colaborador creado exitosamente.');
            }
            resetForm();
        } catch (err: any) {
            alert(err.message || 'Error al guardar colaborador.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                {Icons.Users} Gestión de Personal
            </h1>
            <p className="text-gray-600">
                Panel administrativo para Ingreso, Edición y Programación de Turnos del personal asistencial.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <Card title={isEditing ? "Editar Colaborador" : "Nuevo Colaborador"} className="sticky top-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Documento" value={documento} onChange={e => setDocumento(e.target.value)} required disabled={isEditing} />
                            <Input label="Nombre Completo" value={nombre} onChange={e => setNombre(e.target.value)} required />
                            <Input label="Correo" type="email" value={correo} onChange={e => setCorreo(e.target.value)} required />
                            <Select label="Cargo" options={ROLES_ASISTENCIALES} value={cargo} onChange={e => setCargo(e.target.value)} required />
                            
                            {!isEditing && (
                                <Input label="Contraseña Inicial" value={password} onChange={e => setPassword(e.target.value)} required />
                            )}

                            {/* Shift Scheduling Section */}
                            <div className="pt-4 border-t border-gray-200 mt-4">
                                <h4 className="font-semibold text-gray-700 mb-2 text-sm">Programación de Turno</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input label="Inicio Turno" type="time" value={turnoInicio} onChange={e => setTurnoInicio(e.target.value)} />
                                    <Input label="Fin Turno" type="time" value={turnoFin} onChange={e => setTurnoFin(e.target.value)} />
                                </div>
                                <div className="mt-2">
                                    <Input label="Capacidad Máx. Pacientes" type="number" value={maxPacientes} onChange={e => setMaxPacientes(parseInt(e.target.value) || '')} placeholder="Ej: 6" />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" className="w-full">
                                    {isEditing ? 'Actualizar' : 'Crear Colaborador'}
                                </Button>
                                {isEditing && (
                                    <Button type="button" variant="secondary" onClick={resetForm}>
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Card>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <Card title={`Lista de Personal (${users.length})`}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Nombre / Documento</th>
                                        <th className="px-4 py-3 font-semibold">Cargo</th>
                                        <th className="px-4 py-3 font-semibold">Turno</th>
                                        <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((u) => (
                                        <tr key={u.documento} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{u.nombre}</p>
                                                <p className="text-xs text-gray-500">{u.documento}</p>
                                                <p className="text-xs text-gray-400">{u.correo}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {u.cargo}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {u.turnoInicio ? (
                                                    <div className="text-xs">
                                                        <p>🕒 {u.turnoInicio} - {u.turnoFin}</p>
                                                        <p className="font-semibold text-gray-600">Max: {u.maxPacientes || 'N/A'}</p>
                                                    </div>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button 
                                                    onClick={() => handleEdit(u)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(u.documento)}
                                                    className="text-red-600 hover:text-red-800 font-medium text-xs"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;
