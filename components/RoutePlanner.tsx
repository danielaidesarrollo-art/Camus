
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { User, Patient } from '../types.ts';
import Card from './ui/Card.tsx';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';
import Select from './ui/Select.tsx';
import { EXCLUDED_FROM_ROUTES, calculateAge, SERVICE_ROLE_MAPPING } from '../constants.tsx';
import { calculateDistance, COVERAGE_POLYGON } from '../utils/geolocation.ts';

declare global {
  interface Window {
    google: any;
  }
}

const RoutePlanner: React.FC = () => {
    const { patients, users, user, handoverNotes } = useAppContext(); // Added user from context
    
    // State for filtering
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedRole, setSelectedRole] = useState<string>('MEDICO DOMICILIARIO');
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [mapError, setMapError] = useState<string | null>(null);

    // Manual Route State (Editable)
    const [manualRoute, setManualRoute] = useState<Patient[]>([]);
    const [isDirty, setIsDirty] = useState(false); // Tracks if route has been manually edited
    
    // Search State for Jefes
    const [searchTerm, setSearchTerm] = useState('');
    
    // UI State
    const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const polylineRef = useRef<any>(null);

    // Permission Check
    const canEditRoute = useMemo(() => {
        if (!user || !user.cargo) return false;
        const cargo = user.cargo.toUpperCase();
        return cargo.includes('JEFE') || cargo.includes('COORDINADOR') || cargo.includes('JEFE MEDICO');
    }, [user]);

    // 1. Filter Staff based on Role and Exclusion List
    const availableStaff = useMemo(() => {
        return users.filter(u => {
            // Check Role
            const role = u.cargo?.toUpperCase() || '';
            const targetRole = selectedRole.toUpperCase();
            
            // Allow fuzzy matching for roles
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

            // Check Exclusion
            const isExcluded = EXCLUDED_FROM_ROUTES.some(excludedName => 
                u.nombre.toUpperCase().includes(excludedName.toUpperCase())
            );

            return roleMatch && !isExcluded;
        });
    }, [users, selectedRole]);

    // Get selected staff member to check capacity and shift
    const selectedStaffMember = useMemo(() => {
        return users.find(u => u.documento === selectedStaffId);
    }, [users, selectedStaffId]);

    // Calculate Shift Duration in Hours
    const shiftMetrics = useMemo(() => {
        if (!selectedStaffMember || !selectedStaffMember.turnoInicio || !selectedStaffMember.turnoFin) {
            return { duration: 0, capacityTime: 0 };
        }
        try {
            const [startH, startM] = selectedStaffMember.turnoInicio.split(':').map(Number);
            const [endH, endM] = selectedStaffMember.turnoFin.split(':').map(Number);
            
            let start = startH + startM / 60;
            let end = endH + endM / 60;
            
            if (end < start) end += 24; // Handle night shifts crossing midnight
            
            const duration = end - start;
            // Est. 45 mins per patient + 15 mins travel = 1 hour per patient roughly
            const capacityTime = Math.floor(duration * 60); // in minutes
            return { duration, capacityTime };
        } catch (e) {
            return { duration: 0, capacityTime: 0 };
        }
    }, [selectedStaffMember]);

    // Helper: Calculate specific antibiotic dose times for a given date
    const getAntibioticSchedule = (patient: Patient, dateStr: string): string[] => {
        if (!patient.antibiotico || !patient.terapias['Aplicación de terapia antibiótica']) return [];
        if (!patient.antibiotico.fechaInicio || !patient.antibiotico.frecuenciaHoras) return [];

        const start = new Date(patient.antibiotico.fechaInicio);
        const end = new Date(patient.antibiotico.fechaTerminacion);
        
        // Simple string-based date comparison to avoid timezone issues with exact times for this basic check
        const targetDate = new Date(dateStr);
        
        // Reset times to compare just dates
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const t = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

        if (t >= s && t <= e) {
             return [`Cada ${patient.antibiotico.frecuenciaHoras}h`];
        }
        
        return [];
    };

    // Helper: Get summary of last note
    const getLastNoteSummary = (patientId: string) => {
        const notes = handoverNotes
            .filter(n => n.patientId === patientId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        if (notes.length === 0) return "Sin novedades registradas.";
        const last = notes[0];
        return `${last.authorRole} (${new Date(last.timestamp).toLocaleDateString()}): ${last.note.substring(0, 100)}${last.note.length > 100 ? '...' : ''}`;
    };

    // 2. Identify Patients requiring visits on the selected date AND matching the staff role
    const calculatedRoute = useMemo(() => {
        if (!Array.isArray(patients)) return [];
        if (!selectedStaffMember) return [];

        // Determine available services for this staff member based on mapping
        const staffServices = Object.entries(SERVICE_ROLE_MAPPING)
            .filter(([_, roles]) => roles.includes(selectedStaffMember.cargo))
            .map(([service]) => service.toUpperCase());

        const isAuxiliar = selectedStaffMember.cargo.includes('AUXILIAR');

        const filtered = patients.filter(p => {
             if (p.estado !== 'Aceptado' || !p.fechaIngreso || !p.coordinates) return false;
             
             // --- 1. THERAPY MATCHING LOGIC ---
             // Check if patient needs a therapy that matches the staff's role
             const patientNeeds = Object.entries(p.terapias)
                .filter(([_, required]) => required)
                .map(([terapia]) => terapia.toUpperCase());
            
             const hasMatchingTherapy = patientNeeds.some(need => staffServices.includes(need));
             
             // Special case: Antibiotics for Auxiliaries (might not be in simple mapping depending on key)
             const hasAntibioticNeed = isAuxiliar && p.terapias['Aplicación de terapia antibiótica'];

             // If the staff member cannot perform any of the patient's required therapies, skip
             if (!hasMatchingTherapy && !hasAntibioticNeed) return false;


             // --- 2. SCHEDULE/INTERVAL LOGIC ---
             if (isAuxiliar && hasAntibioticNeed) {
                const doses = getAntibioticSchedule(p, selectedDate);
                if (doses.length > 0) return true; // Always show if antibiotic is due today
             }

             // Standard Logic for Regular Visits
             let intervalDays = 0;
             if (p.programa === 'Virrey solis en Casa Hospitalario') intervalDays = 3;
             else if (p.programa === 'Virrey solis en Casa Crónico') intervalDays = 90;
             else if (p.programa === 'Virrey solis en Casa Crónico Paliativo') intervalDays = 7;
             
             // Pediatric override
             if (calculateAge(p.fechaNacimiento) < 5) intervalDays = 1;

             if (intervalDays === 0) return false;

             const ingressDate = new Date(p.fechaIngreso);
             const targetDate = new Date(selectedDate);
             
             const diffTime = Math.abs(targetDate.getTime() - ingressDate.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

             return diffDays % intervalDays === 0 || diffDays === 0; 
        });

        // Default Sort
        return filtered.sort((a, b) => {
            // PRIORITY RULE: Antibiotic Schedules for Auxiliaries
            if (isAuxiliar) {
                const aDoses = getAntibioticSchedule(a, selectedDate).length > 0;
                const bDoses = getAntibioticSchedule(b, selectedDate).length > 0;
                
                if (aDoses && !bDoses) return -1;
                if (!aDoses && bDoses) return 1;
            }
            // Secondary Sort: Latitude (North to South) for efficiency
            return (b.coordinates?.lat || 0) - (a.coordinates?.lat || 0);
        });

    }, [patients, selectedDate, selectedStaffMember]);

    // Sync manual route with calculated route when filters change (reset editing)
    useEffect(() => {
        setManualRoute(calculatedRoute);
        setIsDirty(false);
    }, [calculatedRoute]);


    // --- Manual Editing Functions ---

    const movePatient = (index: number, direction: 'up' | 'down') => {
        if (!canEditRoute) return;
        const newRoute = [...manualRoute];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newRoute.length) {
            // Swap
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
        // Check capacity limit
        const maxCapacity = selectedStaffMember?.maxPacientes || 6;
        if (manualRoute.length >= maxCapacity) {
            alert(`No se puede agregar más pacientes. El límite para este colaborador es de ${maxCapacity} pacientes.`);
            return;
        }

        setManualRoute(prev => [...prev, patient]);
        setIsDirty(true);
        setSearchTerm(''); // Clear search
    };

    // Filter available patients for search (exclude those already in route)
    const searchResults = useMemo(() => {
        if (!searchTerm || !canEditRoute) return [];
        const lowerTerm = searchTerm.toLowerCase();
        
        return patients.filter(p => {
            // Must not be in current route
            const alreadyInRoute = manualRoute.some(routeP => routeP.id === p.id);
            if (alreadyInRoute) return false;
            
            // Match name or ID
            const nameMatch = p.nombreCompleto.toLowerCase().includes(lowerTerm);
            const idMatch = p.id.includes(lowerTerm);
            
            return (nameMatch || idMatch) && p.coordinates && p.estado === 'Aceptado';
        }).slice(0, 5); // Limit results
    }, [patients, searchTerm, manualRoute, canEditRoute]);

    const handleSaveRoute = () => {
        if (!selectedStaffId) {
            alert("Por favor seleccione un colaborador para asignar la ruta.");
            return;
        }
        // In a real app, this would save to the backend
        alert(`Ruta asignada exitosamente al colaborador con documento: ${selectedStaffId}. Orden de visita guardado.`);
        setIsDirty(false);
    };

    // 4. Initialize Map
    useEffect(() => {
        if (!window.google || !window.google.maps) {
            setMapError('API de Google Maps no cargada.');
            return;
        }

        if (!mapRef.current || mapInstanceRef.current) return;

        try {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 4.65, lng: -74.10 },
                zoom: 11,
            });
            mapInstanceRef.current = map;

            // Render Coverage Polygon
            const coveragePolygon = new window.google.maps.Polygon({
                paths: COVERAGE_POLYGON.map(p => ({ lat: p[0], lng: p[1] })),
                strokeColor: "#0D47A1",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#0D47A1",
                fillOpacity: 0.1,
                clickable: false 
            });
            coveragePolygon.setMap(map);

        } catch (e: any) {
            console.error("Map init error:", e);
            setMapError("Error al cargar el mapa.");
        }
    }, []);

    // 5. Render Route on Map (Uses manualRoute now)
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clear existing
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
        if (polylineRef.current) polylineRef.current.setMap(null);

        const pathCoords: any[] = [];
        const infoWindow = new window.google.maps.InfoWindow();

        // Use manualRoute instead of sortedRoute (calculatedRoute)
        manualRoute.forEach((patient, index) => {
            if (!patient.coordinates) return;
            
            const position = { lat: patient.coordinates.lat, lng: patient.coordinates.lng };
            pathCoords.push(position);

            // Antibiotic Info for map marker
            let antibioticInfo = '';
            let hasPriority = false;

            if (selectedRole.includes('AUXILIAR')) {
                const times = getAntibioticSchedule(patient, selectedDate);
                if (times.length > 0) {
                    hasPriority = true;
                    antibioticInfo = `<p style="color:red; font-weight:bold; margin-top:5px;">⚠️ Terapia Antibiótica Activa</p>`;
                }
            }

            const marker = new window.google.maps.Marker({
                position,
                map,
                label: (index + 1).toString(), // Order number matches list
                title: patient.nombreCompleto,
                // Fix: Use HTTPS for marker icons to avoid mixed content errors
                icon: hasPriority ? 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });

            marker.addListener('click', () => {
                infoWindow.setContent(`
                    <div style="padding:8px; max-width:200px;">
                        <strong style="color:#0D47A1;">${index + 1}. ${patient.nombreCompleto}</strong><br/>
                        <span style="font-size:12px; color:#555;">${patient.direccion}</span>
                        ${antibioticInfo}
                    </div>
                `);
                infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
        });

        // Draw Polyline
        if (pathCoords.length > 1) {
            const polyline = new window.google.maps.Polyline({
                path: pathCoords,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                icons: [{
                    icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                    offset: '100%',
                    repeat: '50px'
                }]
            });
            polyline.setMap(map);
            polylineRef.current = polyline;
            
            // Fit bounds
            const bounds = new window.google.maps.LatLngBounds();
            pathCoords.forEach(c => bounds.extend(c));
            map.fitBounds(bounds);
        }

    }, [manualRoute, selectedRole, selectedDate]);

    // Capacity Logic
    const maxCapacity = selectedStaffMember?.maxPacientes || 6;
    const currentLoad = manualRoute.length;
    const isOverCapacity = currentLoad > maxCapacity;
    
    // Time Load Logic
    const estimatedMinutes = currentLoad * 60; // Approx 60 mins per patient visit incl travel
    const availableMinutes = shiftMetrics.capacityTime;
    const timeLoadPercent = availableMinutes > 0 ? Math.min(100, (estimatedMinutes / availableMinutes) * 100) : 0;

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <h1 className="text-2xl font-bold text-gray-800">Planificador de Rutas Inteligente</h1>
                 <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    <select 
                        value={selectedRole} 
                        onChange={e => setSelectedRole(e.target.value)}
                        className="border rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-brand-lightblue"
                    >
                        <option value="MEDICO DOMICILIARIO">Médicos</option>
                        <option value="AUXILIAR DE ENFERMERIA">Auxiliares</option>
                        <option value="JEFE DE ENFERMERIA">Jefes</option>
                        <option value="FISIOTERAPEUTA">Fisioterapia</option>
                        <option value="FONOAUDIOLOGO">Fonoaudiología</option>
                        <option value="TERAPEUTA OCUPACIONAL">T. Ocupacional</option>
                        <option value="TRABAJADOR SOCIAL">Trabajo Social</option>
                        <option value="PSICOLOGO">Psicología</option>
                        <option value="NUTRICIONISTA">Nutrición</option>
                    </select>
                    <select
                        value={selectedStaffId}
                        onChange={e => setSelectedStaffId(e.target.value)}
                        className="border rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-brand-lightblue"
                    >
                        <option value="">-- Asignar a --</option>
                        {availableStaff.map(s => <option key={s.documento} value={s.documento}>{s.nombre}</option>)}
                    </select>
                    {canEditRoute && isDirty && (
                        <Button onClick={handleSaveRoute} className="bg-green-600 hover:bg-green-700 text-sm">
                            Guardar Asignación
                        </Button>
                    )}
                 </div>
            </div>

            {selectedStaffMember && (
                <div className={`p-3 rounded-md border text-sm space-y-2 ${isOverCapacity || estimatedMinutes > availableMinutes ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <span className="font-semibold text-gray-800">Colaborador: {selectedStaffMember.nombre}</span>
                            {selectedStaffMember.turnoInicio && (
                                <span className="text-gray-600">🕒 Turno: {selectedStaffMember.turnoInicio} - {selectedStaffMember.turnoFin}</span>
                            )}
                        </div>
                        <div className="font-bold text-gray-800">
                            Pacientes: {currentLoad} / {maxCapacity}
                            {isOverCapacity && <span className="ml-2 text-red-600">⚠️ Cupo Excedido</span>}
                        </div>
                    </div>
                    
                    {/* Schedule Visualization Bar */}
                    {availableMinutes > 0 && (
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-medium w-20">Carga Horaria:</span>
                             <div className="flex-grow bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className={`h-2.5 rounded-full ${timeLoadPercent >= 100 ? 'bg-red-600' : 'bg-green-500'}`} 
                                    style={{ width: `${timeLoadPercent}%` }}
                                ></div>
                             </div>
                             <span className="text-xs text-gray-600">{estimatedMinutes}min / {availableMinutes}min</span>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
                <div className="md:col-span-1 overflow-y-auto bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                        <h3 className="font-bold text-lg">Ruta Sugerida ({manualRoute.length})</h3>
                        {canEditRoute && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Modo Edición Activo</span>}
                    </div>
                    
                    {!selectedStaffMember && (
                         <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded mb-2">Seleccione un colaborador para ver los pacientes que coinciden con su perfil y horario.</p>
                    )}

                    {/* --- Manual Add Patient (JEFES Only) --- */}
                    {canEditRoute && selectedStaffMember && (
                        <div className="mb-4 relative">
                            <Input 
                                placeholder="🔍 Buscar paciente para agregar..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="text-sm"
                            />
                            {searchTerm && searchResults.length > 0 && (
                                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-b shadow-lg mt-1 max-h-40 overflow-y-auto">
                                    {searchResults.map(p => (
                                        <div 
                                            key={p.id} 
                                            className="p-2 hover:bg-brand-lightblue hover:text-white cursor-pointer border-b last:border-0 text-sm flex justify-between items-center"
                                            onClick={() => addPatientToRoute(p)}
                                        >
                                            <span className="font-medium truncate mr-2">{p.nombreCompleto}</span>
                                            <span className="bg-green-100 text-green-800 text-xs px-1 rounded">Agregar</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchTerm && searchResults.length === 0 && (
                                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-b shadow-lg mt-1 p-2 text-xs text-gray-500">
                                    No se encontraron pacientes (o ya están en ruta).
                                </div>
                            )}
                        </div>
                    )}
                    
                    {manualRoute.length > 0 ? (
                        <ul className="space-y-3">
                            {manualRoute.map((p, i) => {
                                const isExpanded = expandedPatientId === p.id;
                                const isPriority = selectedRole.includes('AUXILIAR') && getAntibioticSchedule(p, selectedDate).length > 0;
                                
                                return (
                                <li key={p.id} className={`border-b pb-2 last:border-0 p-1 rounded transition-colors ${isPriority ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-start gap-2">
                                        <div className="flex flex-col items-center gap-1 mt-1">
                                             <span className={`font-bold text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs ${isPriority ? 'bg-purple-600' : 'bg-brand-blue'}`}>{i + 1}</span>
                                             {canEditRoute && (
                                                 <div className="flex flex-col">
                                                     <button onClick={() => movePatient(i, 'up')} disabled={i === 0} className="text-gray-400 hover:text-blue-600 disabled:opacity-30">▲</button>
                                                     <button onClick={() => movePatient(i, 'down')} disabled={i === manualRoute.length - 1} className="text-gray-400 hover:text-blue-600 disabled:opacity-30">▼</button>
                                                 </div>
                                             )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="cursor-pointer" onClick={() => setExpandedPatientId(isExpanded ? null : p.id)}>
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium text-gray-900 block hover:text-brand-blue">{p.nombreCompleto}</span>
                                                    {isExpanded ? 
                                                        <span className="text-gray-400 text-xs">▲</span> : 
                                                        <span className="text-gray-400 text-xs">▼</span>
                                                    }
                                                </div>
                                                <p className="text-gray-500 text-xs">{p.direccion}</p>
                                                {isPriority && (
                                                    <span className="inline-block mt-1 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-bold">⚠️ Antibiótico</span>
                                                )}
                                            </div>

                                            {/* Collapsible Details */}
                                            {isExpanded && (
                                                <div className="mt-2 text-xs bg-white bg-opacity-60 p-2 rounded border border-gray-100 animate-fade-in">
                                                    <p><strong>Programa:</strong> {p.programa}</p>
                                                    <p><strong>Dx:</strong> {p.diagnosticoEgreso}</p>
                                                    <p className="mt-1"><strong>Última Novedad:</strong></p>
                                                    <p className="italic text-gray-600 pl-1 border-l-2 border-gray-300">
                                                        {getLastNoteSummary(p.id)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {canEditRoute && (
                                            <button 
                                                onClick={() => removePatientFromRoute(i)}
                                                className="text-gray-400 hover:text-red-600 p-1 self-start"
                                                title="Eliminar de la ruta"
                                            >
                                                ✖
                                            </button>
                                        )}
                                    </div>
                                </li>
                            )})}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm text-center mt-10">No hay pacientes asignados para esta fecha/colaborador.</p>
                    )}
                </div>
                <div className="md:col-span-2 bg-gray-100 rounded-lg shadow border border-gray-200 relative overflow-hidden">
                    <div ref={mapRef} className="w-full h-full" />
                    {mapError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                            <div className="text-center p-6">
                                <p className="text-red-600 font-bold text-lg mb-2">Error del Mapa</p>
                                <p className="text-gray-700">{mapError}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoutePlanner;
