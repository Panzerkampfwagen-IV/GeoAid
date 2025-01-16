import React, { useState } from 'react';
import { MapPin, Loader2, Search, Navigation } from 'lucide-react';

interface IntersectionResult {
  lat: number;
  lon: number;
  display_name: string;
}

interface StreetLocation {
  lat: number;
  lon: number;
  display_name: string;
  type: string;
  importance: number;
}

interface HighwayLocation {
  lat: number;
  lon: number;
  display_name: string;
  type: string;
  importance: number;
}

function App() {
  // Intersection Finder State
  const [road1, setRoad1] = useState('');
  const [road2, setRoad2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntersectionResult | null>(null);
  const [error, setError] = useState('');

  // Street Finder State
  const [streetName, setStreetName] = useState('');
  const [streetLoading, setStreetLoading] = useState(false);
  const [streetResults, setStreetResults] = useState<StreetLocation[]>([]);
  const [streetError, setStreetError] = useState('');

  // Highway Finder State
  const [highwayName, setHighwayName] = useState('');
  const [highwayLoading, setHighwayLoading] = useState(false);
  const [highwayResults, setHighwayResults] = useState<HighwayLocation[]>([]);
  const [highwayError, setHighwayError] = useState('');

  const findIntersection = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response1 = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          `${road1} & ${road2}`
        )}&format=json&limit=1`
      );
      const data = await response1.json();

      if (data && data[0]) {
        setResult({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          display_name: data[0].display_name,
        });
      } else {
        setError('Intersection not found. Please try different road names.');
      }
    } catch (err) {
      setError('An error occurred while searching for the intersection.');
    } finally {
      setLoading(false);
    }
  };

  const findStreets = async (e: React.FormEvent) => {
    e.preventDefault();
    setStreetLoading(true);
    setStreetError('');
    setStreetResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          streetName
        )}&format=json&addressdetails=1&limit=50`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const locations = data
          .filter((item: any) => 
            ['road', 'street', 'residential', 'tertiary', 'secondary', 'primary', 'path', 'track', 'service']
            .includes(item.class) || 
            ['road', 'street', 'residential', 'tertiary', 'secondary', 'primary', 'path', 'track', 'service']
            .includes(item.type)
          )
          .map((item: any) => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            display_name: item.display_name,
            type: item.type || item.class,
            importance: item.importance,
          }));

        if (locations.length > 0) {
          setStreetResults(locations);
        } else {
          setStreetError('No streets found with that name. Try including the city name (e.g., "Main Street, Boston")');
        }
      } else {
        setStreetError('No streets found with that name. Try including the city name (e.g., "Main Street, Boston")');
      }
    } catch (err) {
      setStreetError('An error occurred while searching for streets.');
    } finally {
      setStreetLoading(false);
    }
  };

  const findHighways = async (e: React.FormEvent) => {
    e.preventDefault();
    setHighwayLoading(true);
    setHighwayError('');
    setHighwayResults([]);

    try {
      // First try with the exact highway name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          highwayName
        )}&format=json&addressdetails=1&limit=50`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const locations = data
          .filter((item: any) => {
            const relevantTypes = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'];
            const isHighway = 
              relevantTypes.includes(item.class) || 
              relevantTypes.includes(item.type) ||
              (item.display_name || '').toLowerCase().includes('highway') ||
              (item.display_name || '').toLowerCase().includes('route') ||
              (item.display_name || '').toLowerCase().includes('state road');
            return isHighway;
          })
          .map((item: any) => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            display_name: item.display_name,
            type: item.type || item.class,
            importance: item.importance,
          }));

        if (locations.length > 0) {
          setHighwayResults(locations);
        } else {
          setHighwayError('No highways found. Try including the state/country (e.g., "MN-62 Minnesota" or "A1 Highway UK")');
        }
      } else {
        setHighwayError('No highways found. Try including the state/country (e.g., "MN-62 Minnesota" or "A1 Highway UK")');
      }
    } catch (err) {
      setHighwayError('An error occurred while searching for highways.');
    } finally {
      setHighwayLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Intersection Finder */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <MapPin className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900 ml-2">
                Intersection Finder
              </h1>
            </div>

            <form onSubmit={findIntersection} className="space-y-4">
              <div>
                <label
                  htmlFor="road1"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Road
                </label>
                <input
                  type="text"
                  id="road1"
                  value={road1}
                  onChange={(e) => setRoad1(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  placeholder="e.g. Main Street"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="road2"
                  className="block text-sm font-medium text-gray-700"
                >
                  Second Road
                </label>
                <input
                  type="text"
                  id="road2"
                  value={road2}
                  onChange={(e) => setRoad2(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  placeholder="e.g. Broadway"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Find Intersection'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 text-red-600 text-sm text-center">{error}</div>
            )}

            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Intersection Found
                </h2>
                <p className="text-sm text-gray-600 mb-2">{result.display_name}</p>
                <div className="text-sm text-gray-800">
                  <p>Latitude: {result.lat}</p>
                  <p>Longitude: {result.lon}</p>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${result.lat}&mlon=${result.lon}&zoom=17`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm"
                >
                  View on OpenStreetMap →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Street Finder */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-emerald-500" />
              <h1 className="text-2xl font-bold text-gray-900 ml-2">
                Street Finder
              </h1>
            </div>

            <form onSubmit={findStreets} className="space-y-4">
              <div>
                <label
                  htmlFor="streetName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street Name
                </label>
                <input
                  type="text"
                  id="streetName"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"
                  placeholder="e.g. Broadway"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={streetLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {streetLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Find Streets'
                )}
              </button>
            </form>

            {streetError && (
              <div className="mt-4 text-red-600 text-sm text-center">
                {streetError}
              </div>
            )}

            {streetResults.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Found {streetResults.length} Locations
                </h2>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {streetResults.map((street, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm text-gray-600 mb-2">
                        {street.display_name}
                      </p>
                      <div className="text-sm text-gray-800">
                        <p>Latitude: {street.lat}</p>
                        <p>Longitude: {street.lon}</p>
                      </div>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${street.lat}&mlon=${street.lon}&zoom=17`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-emerald-600 hover:text-emerald-800 text-sm"
                      >
                        View on OpenStreetMap →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Highway Finder */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <Navigation className="h-8 w-8 text-purple-500" />
              <h1 className="text-2xl font-bold text-gray-900 ml-2">
                Highway Finder
              </h1>
            </div>

            <form onSubmit={findHighways} className="space-y-4">
              <div>
                <label
                  htmlFor="highwayName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Highway Name/Number
                </label>
                <input
                  type="text"
                  id="highwayName"
                  value={highwayName}
                  onChange={(e) => setHighwayName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                  placeholder="e.g. MN-62, A1, Route 66"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Try including state/country for better results
                </p>
              </div>

              <button
                type="submit"
                disabled={highwayLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {highwayLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Find Highways'
                )}
              </button>
            </form>

            {highwayError && (
              <div className="mt-4 text-red-600 text-sm text-center">
                {highwayError}
              </div>
            )}

            {highwayResults.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Found {highwayResults.length} Highways
                </h2>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {highwayResults.map((highway, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm text-gray-600 mb-2">
                        {highway.display_name}
                      </p>
                      <div className="text-sm text-gray-800">
                        <p>Latitude: {highway.lat}</p>
                        <p>Longitude: {highway.lon}</p>
                      </div>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${highway.lat}&mlon=${highway.lon}&zoom=12`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-purple-600 hover:text-purple-800 text-sm"
                      >
                        View on OpenStreetMap →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;