export interface City {
  name: string;
  state: string;
  lat: number;
  lon: number;
  aqi_station: string;
}

export const CITIES: City[] = [
  { name: "New York", state: "NY", lat: 40.7128, lon: -74.006, aqi_station: "new-york" },
  { name: "Los Angeles", state: "CA", lat: 34.0522, lon: -118.2437, aqi_station: "los-angeles" },
  { name: "Chicago", state: "IL", lat: 41.8781, lon: -87.6298, aqi_station: "chicago" },
  { name: "Houston", state: "TX", lat: 29.7604, lon: -95.3698, aqi_station: "houston" },
  { name: "Miami", state: "FL", lat: 25.7617, lon: -80.1918, aqi_station: "miami" },
  { name: "Seattle", state: "WA", lat: 47.6062, lon: -122.3321, aqi_station: "seattle" },
  { name: "San Francisco", state: "CA", lat: 37.7749, lon: -122.4194, aqi_station: "san-francisco" },
  { name: "Austin", state: "TX", lat: 30.2672, lon: -97.7431, aqi_station: "austin" },
  { name: "Denver", state: "CO", lat: 39.7392, lon: -104.9903, aqi_station: "denver" },
  { name: "Boston", state: "MA", lat: 42.3601, lon: -71.0589, aqi_station: "boston" },
  { name: "Nashville", state: "TN", lat: 36.1627, lon: -86.7816, aqi_station: "nashville" },
  { name: "Portland", state: "OR", lat: 45.5051, lon: -122.675, aqi_station: "portland" },
  { name: "Atlanta", state: "GA", lat: 33.749, lon: -84.388, aqi_station: "atlanta" },
  { name: "Phoenix", state: "AZ", lat: 33.4484, lon: -112.074, aqi_station: "phoenix" },
  { name: "Las Vegas", state: "NV", lat: 36.1699, lon: -115.1398, aqi_station: "las-vegas" },
  { name: "Minneapolis", state: "MN", lat: 44.9778, lon: -93.265, aqi_station: "minneapolis" },
  { name: "New Orleans", state: "LA", lat: 29.9511, lon: -90.0715, aqi_station: "new-orleans" },
  { name: "San Diego", state: "CA", lat: 32.7157, lon: -117.1611, aqi_station: "san-diego" },
  { name: "Washington DC", state: "DC", lat: 38.9072, lon: -77.0369, aqi_station: "washington-dc" },
  { name: "Philadelphia", state: "PA", lat: 39.9526, lon: -75.1652, aqi_station: "philadelphia" },
];
