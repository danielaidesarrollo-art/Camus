
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Patient } from '../types.ts';
import Card from './ui/Card.tsx';
import { Icons, PROGRAMAS } from '../constants.tsx';
import Button from './ui/Button.tsx';
import { calculateDistance } from '../utils/geolocation.ts';
import { GoogleGenAI } from "@google/genai";

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
  const mapInstanceRef = useRef<any>(null); // Store map instance to prevent re-renders
  const markersRef = useRef<any[]>([]); // Store markers to clear them
  const clustererRef = useRef<any>(null); // Store clusterer instance
  const circleRef = useRef<any>(null); // Store radius circle

  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>('Todos');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Radius Filter State
  const [radiusFilter, setRadiusFilter] = useState<number>(0); // 0 means no filter
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [addressQuery, setAddressQuery] = useState('');

  // AI State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initialize Map Instance ONLY ONCE
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      setMapError('La API de Google Maps no se ha cargado correctamente. Asegúrese de haber configurado su API KEY en el archivo index.html.');
      return;
    }

    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      const defaultCenter = { lat: 4.65, lng: -74.10 }; // Default center (Bogotá)
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 11,
        styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
        ]
      });

      mapInstanceRef.current = map;
      setMapCenter(defaultCenter);

      // Listen for map movements to update the center for filtering
      map.addListener('idle', () => {
        const c = map.getCenter();
        if (c) {
            setMapCenter({ lat: c.lat(), lng: c.lng() });
        }
      });

    } catch (e: any) {
      console.error("Error initializing map:", e);
      setMapError("Ocurrió un error al inicializar el mapa: " + e.message);
    }
  }, []);

  // Filter patients based on Program AND Radius
  const geolocatedPatients = useMemo(() => {
    if (!Array.isArray(patients)) return [];
    
    return patients.filter(p => {
      // 0. Status check: Only show Accepted patients
      if (p.estado !== 'Aceptado') return false;

      // 1. Coordinate check
      const hasCoords = p.coordinates && 
                        typeof p.coordinates.lat === 'number' && 
                        typeof p.coordinates.lng === 'number';
      if (!hasCoords) return false;

      // 2. Program check
      const programMatch = selectedProgram === 'Todos' || p.programa === selectedProgram;
      if (!programMatch) return false;

      // 3. Radius check
      if (radiusFilter > 0 && mapCenter && p.coordinates) {
        const distance = calculateDistance(
            mapCenter.lat, 
            mapCenter.lng, 
            p.coordinates.lat, 
            p.coordinates.lng
        );
        if (distance > radiusFilter) return false;
      }

      return true;
    });
  }, [patients, selectedProgram, radiusFilter, mapCenter]);

  // Handle Markers, Clustering and Circle rendering when data or map changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Clear existing markers and clusterer
    if (clustererRef.current) {
        clustererRef.current.clearMarkers();
    }
    
    // Clear legacy markers array just in case (though clusterer handles clearing visual markers)
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 2. Create new markers
    const infoWindow = new window.google.maps.InfoWindow();

    const newMarkers = geolocatedPatients.map(patient => {
        if (!patient.coordinates) return null;

        const marker = new window.google.maps.Marker({
          position: patient.coordinates,
          // IMPORTANT: Do not set 'map: map' here when using clustering, 
          // or markers will appear twice (once in cluster, once on map).
          // If Clustering library fails to load, we handle fallback below.
          title: patient.nombreCompleto,
          icon: null // Use default marker
        });

        marker.addListener('click', () => {
          const content = `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 5px 0; font-weight: bold; color: #0D47A1;">${patient.nombreCompleto}</h3>
              <p style="margin: 0; font-size: 12px; color: #555;">ID: ${patient.id}</p>
              <p style="margin: 5px 0 0 0; font-size: 13px;">${patient.direccion}</p>
              <span style="display: inline-block; margin-top: 5px; padding: 2px 6px; border-radius: 4px; font-size: 10px; background-color: #E3F2FD; color: #0D47A1;">${patient.programa}</span>
            </div>
          `;
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
          setSelectedPatient(patient);
        });

        return marker;
    }).filter(m => m !== null);

    markersRef.current = newMarkers;

    // 3. Initialize or Update Clusterer
    if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
        if (!clustererRef.current) {
            clustererRef.current = new window.markerClusterer.MarkerClusterer({
                map: map,
                markers: newMarkers
            });
        } else {
            clustererRef.current.addMarkers(newMarkers);
        }
    } else {
        // Fallback if clustering library didn't load: show standard markers
        newMarkers.forEach(m => m.setMap(map));
    }

    // 4. Handle Radius Circle
    if (circleRef.current) {
        circleRef.current.setMap(null); // Remove existing circle
    }

    if (radiusFilter > 0 && mapCenter) {
        const circle = new window.google.maps.Circle({
            strokeColor: "#0D47A1",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#0D47A1",
            fillOpacity: 0.15,
            map,
            center: mapCenter,
            radius: radiusFilter * 1000, // Convert km to meters
            clickable: false // Allow clicking through to the map
        });
        circleRef.current = circle;
    }

  }, [geolocatedPatients, radiusFilter, mapCenter]); // Re-run when list changes or filter parameters change

  const handleAddressSearch = () => {
    if (!addressQuery.trim() || !window.google || !window.google.maps) return;
    
    const geocoder = new window.google.maps.Geocoder();
    // Append context to improve search results
    const searchString = addressQuery.toLowerCase().includes('bogota') || addressQuery.toLowerCase().includes('soacha') 
        ? addressQuery 
        : `${addressQuery}, Bogotá, Colombia`;

    geocoder.geocode({ address: searchString }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const newCenter = { lat: location.lat(), lng: location.lng() };
            
            setMapCenter(newCenter);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setCenter(newCenter);
                mapInstanceRef.current.setZoom(14);
            }
            
            // If no radius is selected, select a default one to make the search meaningful
            if (radiusFilter === 0) {
                setRadiusFilter(3);
            }
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
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // If a patient is selected, use their coordinates for the grounding config
        let toolConfig = undefined;
        let prompt = aiQuery;

        if (selectedPatient && selectedPatient.coordinates) {
             toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: selectedPatient.coordinates.lat,
                        longitude: selectedPatient.coordinates.lng
                    }
                }
             };
             // Reinforce context in prompt (Spanish)
             prompt = `Con respecto a la ubicación en ${selectedPatient.coordinates.lat}, ${selectedPatient.coordinates.lng} (Dirección: ${selectedPatient.direccion}): ${aiQuery}`;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: toolConfig
            }
        });

        setAiResponse(response.text || "No se pudo generar una respuesta.");
        
        // Extract grounding chunks
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        // Filter for maps chunks and extract URI and Title
        const mapLinks = chunks
            .filter((c: any) => c.maps?.uri)
            .map((c: any) => ({ 
                uri: c.maps.uri, 
                title: c.maps.title || "Ver Ubicación en Google Maps" 
            }));

        setGroundingLinks(mapLinks);

    } catch (e: any) {
        console.error("AI Error:", e);
        setAiResponse("Lo siento, ocurrió un error al consultar el asistente inteligente. Por favor verifica tu conexión o intenta de nuevo.");
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            {Icons.Map} Mapa de Pacientes
        </h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
             <div className="flex gap-1 w-full md:w-auto">
                 <input 
                    type="text" 
                    placeholder="Buscar ubicación..." 
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue w-full md:w-48"
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                 />
                 <button 
                    onClick={handleAddressSearch}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium text-gray-700"
                 >
                    🔍
                 </button>
             </div>
             <select 
                value={radiusFilter} 
                onChange={(e) => setRadiusFilter(Number(e.target.value))}
                className="w-1/2 md:w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue"
             >
                <option value={0}>Todo el mapa</option>
                <option value={1}>1 km del centro</option>
                <option value={3}>3 km del centro</option>
                <option value={5}>5 km del centro</option>
                <option value={10}>10 km del centro</option>
             </select>
             <select 
                value={selectedProgram} 
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-1/2 md:w-56 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-lightblue"
             >
                <option value="Todos">Todos los Programas</option>
                {PROGRAMAS.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
        </div>
      </div>

      {mapError ? (
        <Card className="bg-red-50 border border-red-200">
            <div className="text-center p-8">
                <h3 className="text-xl font-bold text-red-600 mb-2">Error de Configuración</h3>
                <p className="text-gray-700">{mapError}</p>
                <p className="mt-4 text-sm text-gray-500">
                    Nota: Para ver el mapa, debe agregar una API KEY válida de Google Maps en el archivo <code>index.html</code>.
                </p>
            </div>
        </Card>
      ) : (
        <div className="flex-grow flex flex-col md:flex-row gap-4 h-[600px]">
            <div className="flex-grow bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 relative">
                <div ref={mapRef} className="w-full h-full" />
                {geolocatedPatients.length === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10 pointer-events-none">
                        <p className="text-gray-500 font-medium bg-white px-4 py-2 rounded shadow">
                            No hay pacientes en esta zona o filtro.
                        </p>
                     </div>
                )}
                {radiusFilter > 0 && (
                     <div className="absolute top-2 left-2 z-10 bg-white bg-opacity-90 px-3 py-1 rounded shadow text-xs text-blue-800 font-semibold border border-blue-200">
                        Filtrando a {radiusFilter}km del centro del mapa
                     </div>
                )}
            </div>
            
            <div className="w-full md:w-80 flex-shrink-0 space-y-4 overflow-y-auto max-h-[600px]">
                <Card title="Resumen" className="sticky top-0 z-10 bg-white">
                    <div className="text-sm space-y-2">
                        <p><strong>Total Pacientes:</strong> {patients.length}</p>
                        <p><strong>Visibles en Mapa:</strong> {geolocatedPatients.length}</p>
                        <p><strong>Programa:</strong> {selectedProgram}</p>
                        <p><strong>Radio:</strong> {radiusFilter > 0 ? `${radiusFilter} km` : 'Sin límite'}</p>
                    </div>
                </Card>
                
                {/* Gemini AI Assistant Section */}
                <Card title="Asistente de Ubicación IA" className="bg-blue-50 border border-blue-100">
                    <div className="space-y-3">
                        <p className="text-xs text-gray-600">
                            Pregunta sobre lugares de interés, farmacias, tráfico o servicios cercanos.
                        </p>
                        {selectedPatient && (
                            <div className="text-xs bg-blue-100 p-2 rounded text-blue-800 mb-2">
                                <strong>Contexto:</strong> Ubicación de {selectedPatient.nombreCompleto}
                            </div>
                        )}
                        <textarea 
                            className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-brand-blue outline-none"
                            rows={2}
                            placeholder="Ej: ¿Dónde está la farmacia más cercana?"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                        />
                        <Button 
                            className="w-full text-sm" 
                            onClick={handleAiSearch} 
                            disabled={isAiLoading || !aiQuery}
                        >
                            {isAiLoading ? 'Consultando...' : 'Consultar con Gemini'}
                        </Button>

                        {(aiResponse || isAiLoading) && (
                            <div className="mt-3 p-3 bg-white rounded border border-gray-200 text-sm max-h-60 overflow-y-auto">
                                {isAiLoading ? (
                                    <p className="text-gray-500 italic">Analizando mapa...</p>
                                ) : (
                                    <>
                                        <p className="whitespace-pre-wrap text-gray-800">{aiResponse}</p>
                                        {groundingLinks.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 mb-1">Fuentes:</p>
                                                <ul className="space-y-1">
                                                    {groundingLinks.map((link, idx) => (
                                                        <li key={idx}>
                                                            <a 
                                                                href={link.uri} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-brand-blue hover:underline text-xs block truncate"
                                                                title={link.title}
                                                            >
                                                                📍 {link.title}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {selectedPatient && (
                    <Card title="Paciente Seleccionado" className="animate-fade-in">
                        <div>
                            <p className="font-bold text-brand-blue">{selectedPatient.nombreCompleto}</p>
                            <p className="text-sm text-gray-600 mb-2">{selectedPatient.direccion}</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                selectedPatient.estado === 'Aceptado' ? 'bg-green-100 text-green-800' : 
                                selectedPatient.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {selectedPatient.estado}
                            </span>
                        </div>
                    </Card>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
