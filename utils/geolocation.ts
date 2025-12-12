
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
 * Helper to wait for Google Maps API to load
 */
const waitForGoogleMaps = async (timeout = 2000): Promise<boolean> => {
    const start = Date.now();
    while (!window.google || !window.google.maps) {
        if (Date.now() - start > timeout) return false;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return true;
};

/**
 * Adds a small random offset to coordinates to prevent exact stacking
 */
const addJitter = (coord: {lat: number, lng: number}) => {
    // Approx +/- 50 meters
    const offsetLat = (Math.random() - 0.5) * 0.0005; 
    const offsetLng = (Math.random() - 0.5) * 0.0005;
    return { lat: coord.lat + offsetLat, lng: coord.lng + offsetLng };
};

/**
 * Geocodes an address string to coordinates.
 * Tries to use the Google Maps Geocoding API first.
 * If the API is unavailable or fails (e.g., invalid key), falls back to a mock simulation.
 * @param address - The address string to geocode.
 * @returns A promise that resolves to coordinates `{ lat, lng }` or `null` if not found.
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  // 1. Wait for API load
  await waitForGoogleMaps();

  // 2. Try real Google Maps Geocoding API
  if (window.google && window.google.maps && window.google.maps.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      // Wrapping in a promise for older API versions compatibility
      const result = await new Promise<any>((resolve, reject) => {
          geocoder.geocode({ address }, (results: any, status: any) => {
              if (status === 'OK') resolve({ results });
              else reject(status);
          });
      });
      
      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        console.log(`Geocoding success for "${address}":`, location.toString());
        return { lat: location.lat(), lng: location.lng() };
      }
    } catch (e) {
      console.warn("Google Maps Geocoding API failed (likely REQUEST_DENIED or API limit). Falling back to mock.", e);
    }
  }

  // 3. Fallback Mock Implementation
  console.log("Using fallback geocoding for:", address);
  
  const lowerAddress = address.toLowerCase();
  
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 500));

  let baseCoord = null;

  // Specific Neighborhood/Zone mapping for better approximation
  if (lowerAddress.includes('170') || lowerAddress.includes('colina') || lowerAddress.includes('mazuren')) baseCoord = { lat: 4.75, lng: -74.05 };
  else if (lowerAddress.includes('suba') || lowerAddress.includes('imperial') || lowerAddress.includes('compartir')) baseCoord = { lat: 4.74, lng: -74.1 };
  else if (lowerAddress.includes('usaquén') || lowerAddress.includes('usaquen') || lowerAddress.includes('cedritos')) baseCoord = { lat: 4.72, lng: -74.03 };
  else if (lowerAddress.includes('chapinero') || lowerAddress.includes('calle 60') || lowerAddress.includes('calle 72')) baseCoord = { lat: 4.65, lng: -74.06 };
  else if (lowerAddress.includes('centro') || lowerAddress.includes('candelaria') || lowerAddress.includes('calle 19')) baseCoord = { lat: 4.60, lng: -74.07 };
  else if (lowerAddress.includes('teusaquillo') || lowerAddress.includes('salitre') || lowerAddress.includes('calle 26')) baseCoord = { lat: 4.64, lng: -74.09 };
  else if (lowerAddress.includes('kennedy') || lowerAddress.includes('americas') || lowerAddress.includes('abastos')) baseCoord = { lat: 4.62, lng: -74.15 };
  else if (lowerAddress.includes('bosa') || lowerAddress.includes('soacha') || lowerAddress.includes('san mateo')) baseCoord = { lat: 4.60, lng: -74.19 };
  else if (lowerAddress.includes('tunal') || lowerAddress.includes('ciudad bolivar') || lowerAddress.includes('meissen')) baseCoord = { lat: 4.57, lng: -74.13 };
  else if (lowerAddress.includes('usme') || lowerAddress.includes('santa librada')) baseCoord = { lat: 4.53, lng: -74.12 };
  else if (lowerAddress.includes('engativa') || lowerAddress.includes('calle 80') || lowerAddress.includes('minuto')) baseCoord = { lat: 4.70, lng: -74.10 };
  else if (lowerAddress.includes('fontibon') || lowerAddress.includes('zona franca')) baseCoord = { lat: 4.67, lng: -74.14 };

  // Addresses OUTSIDE coverage area (known municipalities)
  else if (lowerAddress.includes('chía') || lowerAddress.includes('chia')) baseCoord = { lat: 4.86, lng: -74.03 };
  else if (lowerAddress.includes('cota')) baseCoord = { lat: 4.81, lng: -74.10 };
  else if (lowerAddress.includes('mosquera') || lowerAddress.includes('funza')) baseCoord = { lat: 4.70, lng: -74.22 };
  else if (lowerAddress.includes('calera')) baseCoord = { lat: 4.72, lng: -73.97 };

  // If exact match failed but it's Bogotá/Soacha general
  else if (lowerAddress.includes('bogotá') || lowerAddress.includes('bogota') || lowerAddress.includes('soacha')) {
      baseCoord = { lat: 4.65, lng: -74.10 }; // Central default
  }

  // If we found a base coordinate, return it with jitter
  if (baseCoord) {
      return addJitter(baseCoord);
  }

  // If we can't determine it, return null to trigger manual or error state
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
