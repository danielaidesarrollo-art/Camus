
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { User } from '../types.ts';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './ui/GlassComponents.tsx';
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
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 font-outfit">
                    <span className="p-2 bg-[#00E5FF]/10 rounded-xl text-[#00E5FF]">
                        <Icons.Users size={24} />
                    </span>
                    Gestión de Personal
                </h1>
                <p className="text-gray-400 text-sm max-w-2xl">
                    Panel administrativo para ingreso, edición y programación de turnos del personal asistencial. Optimice la capacidad operativa de su equipo.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-4">
                    <GlassCard title={isEditing ? "Editar Colaborador" : "Nuevo Colaborador"} className="sticky top-6 !p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <GlassInput label="Documento" value={documento} onChange={e => setDocumento(e.target.value)} required disabled={isEditing} placeholder="Ej: 10203040" />
                            <GlassInput label="Nombre Completo" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Nombre del colaborador" />
                            <GlassInput label="Correo" type="email" value={correo} onChange={e => setCorreo(e.target.value)} required placeholder="correo@ejemplo.com" />
                            <GlassSelect label="Cargo" options={ROLES_ASISTENCIALES} value={cargo} onChange={e => setCargo(e.target.value)} required />

                            {!isEditing && (
                                <GlassInput label="Contraseña Inicial" value={password} onChange={e => setPassword(e.target.value)} required />
                            )}

                            {/* Shift Scheduling Section */}
                            <div className="pt-6 border-t border-white/5 mt-2 space-y-4">
                                <h4 className="text-xs font-bold text-[#00E5FF] uppercase tracking-widest">Programación de Turno</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <GlassInput label="Inicio Turno" type="time" value={turnoInicio} onChange={e => setTurnoInicio(e.target.value)} />
                                    <GlassInput label="Fin Turno" type="time" value={turnoFin} onChange={e => setTurnoFin(e.target.value)} />
                                </div>
                                <GlassInput label="Capacidad Máxima" type="number" value={maxPacientes} onChange={e => setMaxPacientes(parseInt(e.target.value) || '')} placeholder="Cant. pacientes" />
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                <GlassButton type="submit" variant="primary" className="w-full">
                                    {isEditing ? 'Actualizar Datos' : 'Registrar Colaborador'}
                                </GlassButton>
                                {isEditing && (
                                    <GlassButton type="button" variant="secondary" onClick={resetForm} className="w-full">
                                        Cancelar Edición
                                    </GlassButton>
                                )}
                            </div>
                        </form>
                    </GlassCard>
                </div>

                {/* List Section */}
                <div className="lg:col-span-8">
                    <GlassCard title={`Colaboradores Registrados (${users.length})`} className="!p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-6 py-4 font-semibold text-gray-300">Colaborador</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300">Cargo</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300 text-center">Turno / Capacidad</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((u) => (
                                        <tr key={u.documento} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white group-hover:text-[#00E5FF] transition-colors">{u.nombre}</span>
                                                    <span className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-tight">Doc: {u.documento}</span>
                                                    <span className="text-[10px] text-gray-500 overflow-hidden truncate max-w-[180px]">{u.correo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-bold uppercase tracking-wider border border-[#00E5FF]/20">
                                                    {u.cargo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.turnoInicio ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                                            <span className="text-[#A855F7] tracking-tighter">🕒</span>
                                                            {u.turnoInicio} - {u.turnoFin}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Máx: {u.maxPacientes || 'N/A'} pac</span>
                                                    </div>
                                                ) : <span className="block text-center text-gray-600">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(u)}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-[#00E5FF]/20 text-white hover:text-[#00E5FF] transition-all"
                                                        title="Editar"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.documento)}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;
