
// A simplified polygon approximating the Virrey Solis coverage area in Bogotá/Soacha
// Coordinates are in [latitude, longitude] format.
export const COVERAGE_POLYGON: [number, number][] = [
  [4.78, -74.12], // North-West (near Cota/Siberia)
  [4.73, -74.02], // North-East (near La Calera)
  [4.60, -74.04], // East (Central-East Bogotá)
  [4.50, -74.10], // South-East (near Usme)
  [4.56, -74.25], // South-West (Soacha)
  [4.68, -74.22], // West (near Funza/Mosquera)
  [4.78, -74.12], // Close the polygon
];

/**
 * Checks if a point is inside a polygon using the ray-casting algorithm.
 * @param point - The point to check, with `lat` and `lng` properties.
 * @param polygon - An array of [lat, lng] coordinates representing the polygon vertices.
 * @returns `true` if the point is inside the polygon, `false` otherwise.
 */
export const isPointInPolygon = (point: { lat: number; lng: number }, polygon: [number, number][]): boolean => {
  let isInside = false;
  const x = point.lat;
  const y = point.lng;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) {
      isInside = !isInside;
    }
  }
  return isInside;
};

/**
 * Geocodes an address string to coordinates.
 * Tries to use the Google Maps Geocoding API first.
 * If the API is unavailable or fails (e.g., invalid key), falls back to a mock simulation.
 * @param address - The address string to geocode.
 * @returns A promise that resolves to coordinates `{ lat, lng }` or `null` if not found.
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  // 1. Try real Google Maps Geocoding API
  if (window.google && window.google.maps && window.google.maps.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ address });
      
      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        console.log(`Geocoding success for "${address}":`, location.toString());
        return { lat: location.lat(), lng: location.lng() };
      }
    } catch (e) {
      console.warn("Google Maps Geocoding API failed (likely REQUEST_DENIED due to missing Geocoding API permission). Falling back to mock.", e);
    }
  }

  // 2. Fallback Mock Implementation
  // If we reach here, either the script failed or the API call failed.
  // We use a more permissive mock to ensure users can still proceed if they are in Bogotá.
  const lowerAddress = address.toLowerCase();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // If the user explicitly typed Bogotá or Soacha, default to an "Inside" coordinate 
  // to allow the flow to continue even if precise location failed.
  if (lowerAddress.includes('bogotá') || lowerAddress.includes('bogota') || lowerAddress.includes('soacha')) {
      // Return a default central point that is inside the polygon
      return { lat: 4.65, lng: -74.10 }; 
  }

  // Fallback for specific keywords if city wasn't typed but neighborhood was
  if (lowerAddress.includes('170') || lowerAddress.includes('usaquén') || lowerAddress.includes('usaquen')) return { lat: 4.75, lng: -74.05 };
  if (lowerAddress.includes('suba')) return { lat: 4.74, lng: -74.1 };
  if (lowerAddress.includes('kennedy') || lowerAddress.includes('bosa')) return { lat: 4.62, lng: -74.18 };
  if (lowerAddress.includes('usme')) return { lat: 4.53, lng: -74.12 };
  if (lowerAddress.includes('chapinero') || lowerAddress.includes('teusaquillo')) return { lat: 4.64, lng: -74.06 };

  // --- Addresses OUTSIDE coverage area (simulated) ---
  if (lowerAddress.includes('chía') || lowerAddress.includes('chia') || lowerAddress.includes('cota')) return { lat: 4.82, lng: -74.09 };
  if (lowerAddress.includes('cali')) return { lat: 3.45, lng: -76.53 };
  if (lowerAddress.includes('medellín') || lowerAddress.includes('medellin')) return { lat: 6.24, lng: -75.58 };
  if (lowerAddress.includes('funza') || lowerAddress.includes('mosquera')) return { lat: 4.71, lng: -74.25 };
  
  // If we can't determine it's inside, return null to prompt error
  return null;
};

/**
 * Calculates the distance between two points in km using the Haversine formula.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
