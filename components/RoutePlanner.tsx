
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { User, Patient } from '../types.ts';
import {
    EXCLUDED_FROM_ROUTES,
    calculateAge,
    SERVICE_ROLE_MAPPING,
    Icons
} from '../constants.tsx';
import { calculateDistance, COVERAGE_POLYGON } from '../utils/geolocation.ts';
import {
    GlassCard,
    GlassButton,
    GlassInput,
    GlassSelect
} from './ui/GlassComponents.tsx';

declare global {
    interface Window {
        google: any;
    }
}

const RoutePlanner: React.FC = () => {
    const { patients, users, user, handoverNotes } = useAppContext();

    // State for filtering
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedRole, setSelectedRole] = useState<string>('MEDICO DOMICILIARIO');
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [mapError, setMapError] = useState<string | null>(null);

    // Manual Route State
    const [manualRoute, setManualRoute] = useState<Patient[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const polylineRef = useRef<any>(null);

    const canEditRoute = useMemo(() => {
        if (!user || !user.cargo) return false;
        const cargo = user.cargo.toUpperCase();
        return cargo.includes('JEFE') || cargo.includes('COORDINADOR') || cargo.includes('JEFE MEDICO');
    }, [user]);

    const availableStaff = useMemo(() => {
        return users.filter(u => {
            const role = u.cargo?.toUpperCase() || '';
            const targetRole = selectedRole.toUpperCase();

            let roleMatch = false;
            if (targetRole.includes('MEDICO')) roleMatch = role.includes('MEDICO');
            else if (targetRole.includes('AUXILIAR')) roleMatch = role.includes('AUXILIAR');
            else if (targetRole.includes('JEFE')) roleMatch = role.includes('JEFE') && role.includes('ADMINISTRATIVO');
            else if (targetRole.includes('FISIOTERAPEUTA')) roleMatch = role.includes('FISIOTERAPEUTA');
            else if (targetRole.includes('FONOAUDIOLOGO')) roleMatch = role.includes('FONOAUDIOLOGO');
            else if (targetRole.includes('TERAPEUTA')) roleMatch = role.includes('TERAPEUTA');
            else if (targetRole.includes('NUTRICIONISTA')) roleMatch = role.includes('NUTRICIONISTA');
            else if (targetRole.includes('PSICOLOGO')) roleMatch = role.includes('PSICOLOGO');
            else if (targetRole.includes('TRABAJADOR')) roleMatch = role.includes('TRABAJADOR');

            const isExcluded = EXCLUDED_FROM_ROUTES.some(excludedName =>
                u.nombre.toUpperCase().includes(excludedName.toUpperCase())
            );

            return roleMatch && !isExcluded;
        });
    }, [users, selectedRole]);

    const selectedStaffMember = useMemo(() => {
        return users.find(u => u.documento === selectedStaffId);
    }, [users, selectedStaffId]);

    const shiftMetrics = useMemo(() => {
        if (!selectedStaffMember || !selectedStaffMember.turnoInicio || !selectedStaffMember.turnoFin) {
            return { duration: 0, capacityTime: 0 };
        }
        try {
            const [startH, startM] = selectedStaffMember.turnoInicio.split(':').map(Number);
            const [endH, endM] = selectedStaffMember.turnoFin.split(':').map(Number);
            let start = startH + startM / 60;
            let end = endH + endM / 60;
            if (end < start) end += 24;
            const duration = end - start;
            const capacityTime = Math.floor(duration * 60);
            return { duration, capacityTime };
        } catch (e) {
            return { duration: 0, capacityTime: 0 };
        }
    }, [selectedStaffMember]);

    const getAntibioticSchedule = (patient: Patient, dateStr: string): string[] => {
        if (!patient.antibiotico || !patient.terapias['Aplicación de terapia antibiótica']) return [];
        if (!patient.antibiotico.fechaInicio || !patient.antibiotico.frecuenciaHoras) return [];
        const start = new Date(patient.antibiotico.fechaInicio);
        const end = new Date(patient.antibiotico.fechaTerminacion);
        const targetDate = new Date(dateStr);
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const t = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        if (t >= s && t <= e) return [`Cada ${patient.antibiotico.frecuenciaHoras}h`];
        return [];
    };

    const getLastNoteSummary = (patientId: string) => {
        const notes = handoverNotes
            .filter(n => n.patientId === patientId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (notes.length === 0) return "Sin novedades registradas.";
        const last = notes[0];
        return `${last.authorRole} (${new Date(last.timestamp).toLocaleDateString()}): ${last.note.substring(0, 80)}${last.note.length > 80 ? '...' : ''}`;
    };

    const calculatedRoute = useMemo(() => {
        if (!Array.isArray(patients) || !selectedStaffMember) return [];
        const staffServices = Object.entries(SERVICE_ROLE_MAPPING)
            .filter(([_, roles]) => roles.includes(selectedStaffMember.cargo))
            .map(([service]) => service.toUpperCase());
        const isAuxiliar = selectedStaffMember.cargo.includes('AUXILIAR');

        const filtered = patients.filter(p => {
            if (p.estado !== 'Aceptado' || !p.fechaIngreso || !p.coordinates) return false;
            const patientNeeds = Object.entries(p.terapias)
                .filter(([_, required]) => required)
                .map(([terapia]) => terapia.toUpperCase());
            const hasMatchingTherapy = patientNeeds.some(need => staffServices.includes(need));
            const hasAntibioticNeed = isAuxiliar && p.terapias['Aplicación de terapia antibiótica'];
            if (!hasMatchingTherapy && !hasAntibioticNeed) return false;

            if (isAuxiliar && hasAntibioticNeed) {
                if (getAntibioticSchedule(p, selectedDate).length > 0) return true;
            }

            let intervalDays = 0;
            if (p.programa === 'Virrey solis en Casa Hospitalario') intervalDays = 3;
            else if (p.programa === 'Virrey solis en Casa Crónico') intervalDays = 90;
            else if (p.programa === 'Virrey solis en Casa Crónico Paliativo') intervalDays = 7;
            if (calculateAge(p.fechaNacimiento) < 5) intervalDays = 1;
            if (intervalDays === 0) return false;

            const ingressDate = new Date(p.fechaIngreso);
            const targetDate = new Date(selectedDate);
            const diffTime = Math.abs(targetDate.getTime() - ingressDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays % intervalDays === 0 || diffDays === 0;
        });

        return filtered.sort((a, b) => {
            if (isAuxiliar) {
                const aDoses = getAntibioticSchedule(a, selectedDate).length > 0;
                const bDoses = getAntibioticSchedule(b, selectedDate).length > 0;
                if (aDoses && !bDoses) return -1;
                if (!aDoses && bDoses) return 1;
            }
            return (b.coordinates?.lat || 0) - (a.coordinates?.lat || 0);
        });
    }, [patients, selectedDate, selectedStaffMember]);

    useEffect(() => {
        setManualRoute(calculatedRoute);
        setIsDirty(false);
    }, [calculatedRoute]);

    const movePatient = (index: number, direction: 'up' | 'down') => {
        if (!canEditRoute) return;
        const newRoute = [...manualRoute];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newRoute.length) {
            [newRoute[index], newRoute[targetIndex]] = [newRoute[targetIndex], newRoute[index]];
            setManualRoute(newRoute);
            setIsDirty(true);
        }
    };

    const removePatientFromRoute = (index: number) => {
        if (!canEditRoute) return;
        const newRoute = manualRoute.filter((_, i) => i !== index);
        setManualRoute(newRoute);
        setIsDirty(true);
    };

    const addPatientToRoute = (patient: Patient) => {
        if (!canEditRoute) return;
        const maxCapacity = selectedStaffMember?.maxPacientes || 6;
        if (manualRoute.length >= maxCapacity) {
            alert(`Límite alcanzado (${maxCapacity}).`);
            return;
        }
        setManualRoute(prev => [...prev, patient]);
        setIsDirty(true);
        setSearchTerm('');
    };

    const searchResults = useMemo(() => {
        if (!searchTerm || !canEditRoute) return [];
        const lowerTerm = searchTerm.toLowerCase();
        return patients.filter(p => {
            const alreadyInRoute = manualRoute.some(routeP => routeP.id === p.id);
            if (alreadyInRoute) return false;
            return (p.nombreCompleto.toLowerCase().includes(lowerTerm) || p.id.includes(lowerTerm)) && p.coordinates && p.estado === 'Aceptado';
        }).slice(0, 5);
    }, [patients, searchTerm, manualRoute, canEditRoute]);

    const handleSaveRoute = () => {
        if (!selectedStaffId) return;
        alert(`Ruta asignada exitosamente.`);
        setIsDirty(false);
    };

    useEffect(() => {
        if (!window.google || !window.google.maps || !mapRef.current || mapInstanceRef.current) return;
        try {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 4.65, lng: -74.10 },
                zoom: 11,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#212121" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
                ]
            });
            mapInstanceRef.current = map;
            const coveragePolygon = new window.google.maps.Polygon({
                paths: COVERAGE_POLYGON.map(p => ({ lat: p[0], lng: p[1] })),
                strokeColor: "#00E5FF",
                strokeOpacity: 0.3,
                strokeWeight: 1,
                fillColor: "#00E5FF",
                fillOpacity: 0.05,
                clickable: false
            });
            coveragePolygon.setMap(map);
        } catch (e) { setMapError("Error de mapa."); }
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
        if (polylineRef.current) polylineRef.current.setMap(null);
        const pathCoords: any[] = [];
        const infoWindow = new window.google.maps.InfoWindow();
        manualRoute.forEach((patient, index) => {
            if (!patient.coordinates) return;
            const position = { lat: patient.coordinates.lat, lng: patient.coordinates.lng };
            pathCoords.push(position);
            const hasPriority = selectedRole.includes('AUXILIAR') && getAntibioticSchedule(patient, selectedDate).length > 0;
            const marker = new window.google.maps.Marker({
                position, map, label: { text: (index + 1).toString(), color: 'white', fontWeight: 'bold' },
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: hasPriority ? '#A855F7' : '#00E5FF',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF',
                    scale: 12
                }
            });
            marker.addListener('click', () => {
                infoWindow.setContent(`<div style="background:#0B0E14; color:white; padding:10px; border-radius:8px; border:1px solid rgba(0,229,255,0.2); font-family:sans-serif;">
                    <strong style="color:#00E5FF;">${index + 1}. ${patient.nombreCompleto}</strong><br/>
                    <span style="font-size:11px; color:#9ca3af;">${patient.direccion}</span>
                </div>`);
                infoWindow.open(map, marker);
            });
            markersRef.current.push(marker);
        });
        if (pathCoords.length > 1) {
            polylineRef.current = new window.google.maps.Polyline({
                path: pathCoords, geodesic: true, strokeColor: '#00E5FF', strokeOpacity: 0.4, strokeWeight: 2,
                icons: [{ icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2, strokeColor: '#00E5FF' }, offset: '100%', repeat: '40px' }]
            });
            polylineRef.current.setMap(map);
            const bounds = new window.google.maps.LatLngBounds();
            pathCoords.forEach(c => bounds.extend(c));
            map.fitBounds(bounds);
        }
    }, [manualRoute, selectedRole, selectedDate]);

    const maxCapacity = selectedStaffMember?.maxPacientes || 6;
    const currentLoad = manualRoute.length;
    const estimatedMinutes = currentLoad * 60;
    const availableMinutes = shiftMetrics.capacityTime;
    const timeLoadPercent = availableMinutes > 0 ? Math.min(100, (estimatedMinutes / availableMinutes) * 100) : 0;

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white font-outfit flex items-center gap-3">
                    <span className="p-2 bg-[#00E5FF]/10 rounded-lg text-[#00E5FF]">{Icons.Routes}</span>
                    Rutas Inteligentes
                </h1>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <GlassInput type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-40" />
                    <GlassSelect
                        value={selectedRole}
                        onChange={e => setSelectedRole(e.target.value)}
                        className="w-48"
                        options={[
                            { value: "MEDICO DOMICILIARIO", label: "Médicos" },
                            { value: "AUXILIAR DE ENFERMERIA", label: "Auxiliares" },
                            { value: "JEFE DE ENFERMERIA", label: "Jefes" },
                            { value: "FISIOTERAPEUTA", label: "Fisioterapia" },
                            { value: "FONOAUDIOLOGO", label: "Fonoaudiología" },
                            { value: "TERAPEUTA OCUPACIONAL", label: "T. Ocupacional" }
                        ]}
                    />
                    <GlassSelect
                        value={selectedStaffId}
                        onChange={e => setSelectedStaffId(e.target.value)}
                        className="w-48"
                        options={[{ value: "", label: "-- Colaborador --" }, ...availableStaff.map(s => ({ value: s.documento, label: s.nombre }))]}
                    />
                    {canEditRoute && isDirty && (
                        <GlassButton onClick={handleSaveRoute} className="!bg-green-500/20 !border-green-500/30 text-green-400">
                            Guardar
                        </GlassButton>
                    )}
                </div>
            </div>

            {selectedStaffMember && (
                <GlassCard className="!p-4 border-[#00E5FF]/20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                        <div className="flex gap-4 items-center">
                            <span className="font-bold text-white">{selectedStaffMember.nombre}</span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                                Turno: {selectedStaffMember.turnoInicio || '--'} - {selectedStaffMember.turnoFin || '--'}
                            </span>
                        </div>
                        <div className={`text-sm font-bold ${currentLoad > maxCapacity ? 'text-red-500' : 'text-[#00E5FF]'}`}>
                            Carga: {currentLoad} / {maxCapacity} Pacientes
                        </div>
                    </div>
                    {availableMinutes > 0 && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest px-1">
                                <span>Capacidad Horaria</span>
                                <span>{Math.round(timeLoadPercent)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={`h-full transition-all duration-500 ${timeLoadPercent > 90 ? 'bg-red-500' : 'bg-[#00E5FF]'}`}
                                    style={{ width: `${timeLoadPercent}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </GlassCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
                    <GlassCard title={`Pacientes en Ruta (${manualRoute.length})`} className="flex-grow flex flex-col overflow-hidden">
                        {canEditRoute && selectedStaffMember && (
                            <div className="mb-4 relative px-1">
                                <GlassInput
                                    placeholder="🔍 Buscar para agregar..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && searchResults.length > 0 && (
                                    <div className="absolute z-50 left-0 right-0 top-full mt-1 glass-panel border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                        {searchResults.map(p => (
                                            <div
                                                key={p.id}
                                                className="p-3 hover:bg-[#00E5FF]/10 cursor-pointer border-b border-white/5 text-sm fill-gray-300 hover:text-[#00E5FF] transition-colors flex justify-between"
                                                onClick={() => addPatientToRoute(p)}
                                            >
                                                <span className="font-medium truncate">{p.nombreCompleto}</span>
                                                <span className="text-[10px] bg-[#00E5FF]/20 text-[#00E5FF] px-2 py-0.5 rounded-md">ADD</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3 px-1">
                            {manualRoute.length > 0 ? manualRoute.map((p, i) => {
                                const isExpanded = expandedPatientId === p.id;
                                const isPriority = selectedRole.includes('AUXILIAR') && getAntibioticSchedule(p, selectedDate).length > 0;
                                return (
                                    <div key={p.id} className={`group bg-white/5 border border-white/10 rounded-xl p-3 transition-all hover:border-[#00E5FF]/30 ${isPriority ? 'border-[#A855F7]/30 bg-[#A855F7]/5' : ''}`}>
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white ${isPriority ? 'bg-[#A855F7]' : 'bg-[#00E5FF]/20 text-[#00E5FF]'}`}>
                                                    {i + 1}
                                                </span>
                                                {canEditRoute && (
                                                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => movePatient(i, 'up')} disabled={i === 0} className="text-gray-500 hover:text-white px-1">▲</button>
                                                        <button onClick={() => movePatient(i, 'down')} disabled={i === manualRoute.length - 1} className="text-gray-500 hover:text-white px-1">▼</button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedPatientId(isExpanded ? null : p.id)}>
                                                    <div className="truncate pr-2">
                                                        <p className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors truncate">{p.nombreCompleto}</p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5 truncate">{p.direccion}</p>
                                                    </div>
                                                    {isPriority && <span className="flex-shrink-0 animate-pulse text-[8px] bg-[#A855F7] text-white px-1.5 py-0.5 rounded font-bold">ABX</span>}
                                                </div>
                                                {isExpanded && (
                                                    <div className="mt-3 pt-3 border-t border-white/5 space-y-2 animate-fade-in">
                                                        <p className="text-[11px] text-gray-400"><strong>Prog:</strong> {p.programa}</p>
                                                        <p className="text-[11px] text-gray-500 italic leading-relaxed border-l-2 border-[#00E5FF]/20 pl-2">
                                                            {getLastNoteSummary(p.id)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {canEditRoute && (
                                                <button onClick={() => removePatientFromRoute(i)} className="text-gray-600 hover:text-red-400 transition-colors self-start">
                                                    ✖
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="h-40 flex items-center justify-center italic text-gray-600 text-sm">No hay pacientes asignados.</div>
                            )}
                        </div>
                    </GlassCard>
                </div>
                <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-white/10 glass-panel relative">
                    <div ref={mapRef} className="w-full h-full" />
                    {mapError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E14]/80 backdrop-blur-sm z-10 text-red-500 font-bold">
                            {mapError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoutePlanner;
