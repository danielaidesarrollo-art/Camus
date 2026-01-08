
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Patient } from '../types.ts';
import { Icons, PROGRAMAS, calculateAge } from '../constants.tsx';
import { calculateDistance } from '../utils/geolocation.ts';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassTextArea } from './ui/GlassComponents.tsx';
import { aiService } from '../utils/aiService.ts';

declare global {
    interface Window {
        google: any;
        initMap: () => void;
        markerClusterer: any;
    }
}

const MapView: React.FC = () => {
    const { patients } = useAppContext();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const clustererRef = useRef<any>(null);
    const circleRef = useRef<any>(null);

    const [mapError, setMapError] = useState<string | null>(null);

    const [selectedProgram, setSelectedProgram] = useState<string>('Todos');
    const [selectedStatus, setSelectedStatus] = useState<string>('Aceptado');
    const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
    const [radiusFilter, setRadiusFilter] = useState<number>(0);

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number } | null>(null);
    const [addressQuery, setAddressQuery] = useState('');

    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (!window.google || !window.google.maps) {
            setMapError('La API de Google Maps no se ha cargado correctamente.');
            return;
        }

        if (!mapRef.current || mapInstanceRef.current) return;

        try {
            const defaultCenter = { lat: 4.65, lng: -74.10 };
            const map = new window.google.maps.Map(mapRef.current, {
                center: defaultCenter,
                zoom: 11,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#212121" }] },
                    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
                    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
                    { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
                    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#2e2e2e" }] },
                    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#333333" }] },
                    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
                    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
                ],
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false
            });

            mapInstanceRef.current = map;
            setMapCenter(defaultCenter);

            map.addListener('idle', () => {
                const c = map.getCenter();
                if (c) {
                    setMapCenter({ lat: c.lat(), lng: c.lng() });
                }
            });

        } catch (e: any) {
            console.error("Error initializing map:", e);
            setMapError("Error al inicializar el mapa: " + e.message);
        }
    }, []);

    const geolocatedPatients = useMemo(() => {
        if (!Array.isArray(patients)) return [];

        return patients.filter(p => {
            if (selectedStatus !== 'Todos' && p.estado !== selectedStatus) return false;
            const hasCoords = p.coordinates && typeof p.coordinates.lat === 'number' && typeof p.coordinates.lng === 'number';
            if (!hasCoords) return false;
            if (selectedProgram !== 'Todos' && p.programa !== selectedProgram) return false;
            if (dateRange.start || dateRange.end) {
                const admissionDate = new Date(p.fechaIngreso);
                admissionDate.setHours(0, 0, 0, 0);
                if (dateRange.start) {
                    const start = new Date(dateRange.start);
                    start.setHours(0, 0, 0, 0);
                    if (admissionDate < start) return false;
                }
                if (dateRange.end) {
                    const end = new Date(dateRange.end);
                    end.setHours(23, 59, 59, 999);
                    if (admissionDate > end) return false;
                }
            }
            if (radiusFilter > 0 && mapCenter && p.coordinates) {
                const distance = calculateDistance(mapCenter.lat, mapCenter.lng, p.coordinates.lat, p.coordinates.lng);
                if (distance > radiusFilter) return false;
            }
            return true;
        });
    }, [patients, selectedProgram, selectedStatus, dateRange, radiusFilter, mapCenter]);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        if (clustererRef.current) clustererRef.current.clearMarkers();
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        const infoWindow = new window.google.maps.InfoWindow();

        const newMarkers = geolocatedPatients.map(patient => {
            if (!patient.coordinates) return null;
            let iconUrl = null;
            if (patient.estado === 'Aceptado') iconUrl = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
            else if (patient.estado === 'Rechazado') iconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
            else iconUrl = 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';

            const marker = new window.google.maps.Marker({
                position: patient.coordinates,
                title: patient.nombreCompleto,
                icon: iconUrl
            });

            marker.addListener('click', () => {
                const content = `
            <div style="background: #0B0E14; color: white; padding: 15px; border-radius: 12px; max-width: 280px; font-family: 'Inter', sans-serif; border: 1px solid rgba(255,255,255,0.1);">
                <div style="border-bottom: 1px solid rgba(0,229,255,0.3); padding-bottom: 8px; margin-bottom: 10px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #00E5FF;">${patient.nombreCompleto}</h3>
                    <span style="font-size: 11px; color: #9ca3af;">${patient.tipoDocumento}: ${patient.id}</span>
                </div>
                <div style="font-size: 13px; color: #d1d5db; line-height: 1.6;">
                    <p style="margin: 4px 0;"><strong>Edad:</strong> ${calculateAge(patient.fechaNacimiento)} años</p>
                    <p style="margin: 4px 0;"><strong>Programa:</strong> ${patient.programa}</p>
                    <p style="margin: 4px 0;"><strong>Dx:</strong> ${patient.diagnosticoEgreso}</p>
                    <p style="margin: 4px 0;"><strong>Dirección:</strong> ${patient.direccion}</p>
                    <p style="margin: 4px 0;"><strong>Tel:</strong> <a href="tel:${patient.telefonoMovil}" style="color:#00E5FF; text-decoration:none;">${patient.telefonoMovil}</a></p>
                </div>
                <div style="margin-top: 12px; text-align: right;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: bold; text-transform: uppercase; background: rgba(0,229,255,0.1); color: #00E5FF; border: 1px solid rgba(0,229,255,0.2);">
                        ${patient.estado}
                    </span>
                </div>
            </div>
          `;
                infoWindow.setContent(content);
                infoWindow.open(map, marker);
                setSelectedPatient(patient);
            });
            return marker;
        }).filter(m => m !== null);

        markersRef.current = newMarkers;

        if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
            if (!clustererRef.current) {
                clustererRef.current = new window.markerClusterer.MarkerClusterer({ map, markers: newMarkers });
            } else {
                clustererRef.current.addMarkers(newMarkers);
            }
        } else {
            newMarkers.forEach(m => m.setMap(map));
        }

        if (circleRef.current) circleRef.current.setMap(null);
        if (radiusFilter > 0 && mapCenter) {
            circleRef.current = new window.google.maps.Circle({
                strokeColor: "#00E5FF",
                strokeOpacity: 0.5,
                strokeWeight: 1,
                fillColor: "#00E5FF",
                fillOpacity: 0.05,
                map,
                center: mapCenter,
                radius: radiusFilter * 1000,
                clickable: false
            });
        }
    }, [geolocatedPatients, radiusFilter, mapCenter]);

    const handleAddressSearch = () => {
        if (!addressQuery.trim() || !window.google || !window.google.maps) return;
        const geocoder = new window.google.maps.Geocoder();
        const searchString = addressQuery.toLowerCase().includes('bogota') || addressQuery.toLowerCase().includes('soacha')
            ? addressQuery : `${addressQuery}, Bogotá, Colombia`;

        geocoder.geocode({ address: searchString }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const newCenter = { lat: location.lat(), lng: location.lng() };
                setMapCenter(newCenter);
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setCenter(newCenter);
                    mapInstanceRef.current.setZoom(14);
                }
                if (radiusFilter === 0) setRadiusFilter(3);
            } else {
                alert('No se pudo encontrar la ubicación especificada.');
            }
        });
    };

    const handleAiSearch = async () => {
        if (!aiQuery.trim()) return;
        setIsAiLoading(true);
        setAiResponse('');
        setGroundingLinks([]);
        try {
            let toolConfig = undefined;
            let prompt = aiQuery;
            if (selectedPatient && selectedPatient.coordinates) {
                toolConfig = { retrievalConfig: { latLng: { latitude: selectedPatient.coordinates.lat, longitude: selectedPatient.coordinates.lng } } };
                prompt = `Con respecto a la ubicación en ${selectedPatient.coordinates.lat}, ${selectedPatient.coordinates.lng} (Dirección: ${selectedPatient.direccion}): ${aiQuery}`;
            }

            const response = await aiService.runAdministrativeInference(prompt, { toolConfig });

            if (response.error) {
                setAiResponse(`Error: ${response.error}`);
                return;
            }

            setAiResponse(response.text || "No se pudo generar una respuesta.");
            const chunks = response.groundingMetadata?.groundingChunks || [];
            const mapLinks = chunks
                .filter((c: any) => c.maps?.uri)
                .map((c: any) => ({
                    uri: c.maps.uri,
                    title: c.maps.title || "Ver Ubicación"
                }));
            setGroundingLinks(mapLinks);
        } catch (e: any) {
            setAiResponse("Error al consultar el asistente inteligente administrativo.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 font-outfit">
                        <span className="p-2 bg-[#00E5FF]/10 rounded-lg text-[#00E5FF]">{Icons.Map}</span>
                        Mapa de Pacientes
                    </h1>
                    <div className="flex gap-2 w-full md:w-auto">
                        <GlassInput
                            placeholder="Buscar ubicación..."
                            value={addressQuery}
                            onChange={(e) => setAddressQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                        />
                        <GlassButton onClick={handleAddressSearch} className="px-4">
                            🔍
                        </GlassButton>
                    </div>
                </div>

                <GlassCard className="!p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <GlassSelect
                            label="Programa"
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                            options={['Todos', ...PROGRAMAS]}
                        />

                        <GlassSelect
                            label="Estado"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            options={['Todos', 'Aceptado', 'Pendiente', 'Rechazado']}
                        />

                        <GlassSelect
                            label="Radio Cercano"
                            value={radiusFilter.toString()}
                            onChange={(e) => setRadiusFilter(Number(e.target.value))}
                            options={[
                                { value: '0', label: 'Sin Filtro' },
                                { value: '1', label: '1 km' },
                                { value: '3', label: '3 km' },
                                { value: '5', label: '5 km' },
                                { value: '10', label: '10 km' }
                            ]}
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <GlassInput
                                label="Ingreso Desde"
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                            <GlassInput
                                label="Hasta"
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>
                    </div>
                </GlassCard>
            </div>

            {mapError ? (
                <GlassCard className="border-red-500/50 bg-red-500/5">
                    <div className="text-center p-8 space-y-4">
                        <h3 className="text-xl font-bold text-red-500">Error de Configuración</h3>
                        <p className="text-gray-400">{mapError}</p>
                    </div>
                </GlassCard>
            ) : (
                <div className="flex-grow flex flex-col lg:flex-row gap-6 h-[650px]">
                    <div className="flex-grow relative rounded-2xl overflow-hidden border border-white/10 glass-panel">
                        <div ref={mapRef} className="w-full h-full" />
                        {geolocatedPatients.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E14]/60 backdrop-blur-sm z-10 pointer-events-none">
                                <p className="text-[#00E5FF] font-medium bg-[#0B0E14] border border-[#00E5FF]/20 px-6 py-3 rounded-xl shadow-2xl">
                                    No hay pacientes que coincidan con los filtros.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-96 flex-shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        <GlassCard title="Resumen de Vista" className="!p-5">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-xl font-bold text-white">{patients.length}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20">
                                    <p className="text-[10px] text-[#00E5FF] uppercase tracking-widest mb-1">Visibles</p>
                                    <p className="text-xl font-bold text-[#00E5FF]">{geolocatedPatients.length}</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard title="Asistente IA" className="!p-5 border-[#00E5FF]/20">
                            <div className="space-y-4">
                                {selectedPatient && (
                                    <div className="px-3 py-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-xs text-[#00E5FF] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
                                        Contexto: {selectedPatient.nombreCompleto}
                                    </div>
                                )}
                                <GlassTextArea
                                    rows={3}
                                    placeholder="¿Dónde está la farmacia más cercana? Calcule tiempos de tráfico..."
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                />
                                <GlassButton
                                    className="w-full !py-2.5"
                                    onClick={handleAiSearch}
                                    disabled={isAiLoading || !aiQuery}
                                >
                                    {isAiLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            Analizando Mapa...
                                        </div>
                                    ) : 'Consultar con Gemini'}
                                </GlassButton>

                                {(aiResponse || isAiLoading) && (
                                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-sm max-h-60 overflow-y-auto">
                                        {isAiLoading ? (
                                            <div className="space-y-2">
                                                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4"></div>
                                                <div className="h-4 bg-white/5 rounded animate-pulse w-1/2"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">{aiResponse}</p>
                                                {groundingLinks.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fuentes y Enlaces</p>
                                                        <div className="space-y-2">
                                                            {groundingLinks.map((link, idx) => (
                                                                <a
                                                                    key={idx}
                                                                    href={link.uri}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/5 transition-all text-gray-400 hover:text-[#00E5FF] text-xs"
                                                                >
                                                                    <span className="text-lg">📍</span> {link.title}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {selectedPatient && (
                            <GlassCard title="Detalles del Paciente" className="animate-fade-in !p-5">
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-bold text-[#00E5FF] text-lg leading-tight">{selectedPatient.nombreCompleto}</p>
                                        <p className="text-sm text-gray-400 mt-1">{selectedPatient.direccion}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${selectedPatient.estado === 'Aceptado' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            selectedPatient.estado === 'Rechazado' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            }`}>
                                            {selectedPatient.estado}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Edad</p>
                                            <p className="text-white font-medium">{calculateAge(selectedPatient.fechaNacimiento)} Años</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Programa</p>
                                            <p className="text-white font-medium truncate" title={selectedPatient.programa}>{selectedPatient.programa}</p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapView;
