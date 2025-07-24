import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Users, ArrowRight, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LocationMapProps {
  address?: string;
  lat?: number;
  lon?: number;
}

interface NearbyCity {
  name: string;
  state: string;
  population: number;
  lat: number;
  lon: number;
  distance: number;
}

interface LocationData {
  targetLocation: {
    lat: number;
    lon: number;
    address?: string;
  };
  nearbyCities: NearbyCity[];
}

export default function LocationMap({ address, lat, lon }: LocationMapProps) {
  const [selectedCity, setSelectedCity] = useState<NearbyCity | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(
    lat && lon ? { lat, lon } : null
  );

  // Geocode address if provided but no coordinates
  const geocodeQuery = useQuery({
    queryKey: ["geocode", address],
    queryFn: async () => {
      if (!address || currentCoords) return null;
      const response = await apiRequest("GET", `/api/geocode?address=${encodeURIComponent(address)}`);
      return response.json();
    },
    enabled: !!address && !currentCoords,
  });

  // Update coordinates when geocoding completes
  useEffect(() => {
    if (geocodeQuery.data?.success) {
      setCurrentCoords({ lat: geocodeQuery.data.lat, lon: geocodeQuery.data.lon });
    }
  }, [geocodeQuery.data]);

  // Fetch nearby cities
  const locationQuery = useQuery({
    queryKey: ["nearby-cities", currentCoords?.lat, currentCoords?.lon],
    queryFn: async (): Promise<LocationData> => {
      if (!currentCoords) throw new Error("No coordinates available");
      const response = await apiRequest(
        "GET", 
        `/api/nearby-cities?lat=${currentCoords.lat}&lon=${currentCoords.lon}&address=${encodeURIComponent(address || '')}`
      );
      return response.json();
    },
    enabled: !!currentCoords,
  });

  if (!address && !currentCoords) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Enter an address to see nearby cities and market insights</p>
        </CardContent>
      </Card>
    );
  }

  if (geocodeQuery.isLoading || locationQuery.isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = locationQuery.data;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Interactive Map Visualization */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl backdrop-blur-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Navigation className="w-5 h-5" />
            </div>
            Location Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Custom SVG Map */}
          <div className="relative h-80 bg-gradient-to-br from-slate-100 to-blue-100">
            <svg 
              viewBox="0 0 800 400" 
              className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
            >
              <defs>
                <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#1d4ed8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1" />
                </radialGradient>
                <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#d97706" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#92400e" stopOpacity="0.2" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Grid background */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Center point (target location) */}
              <g transform="translate(400, 200)">
                <circle r="40" fill="url(#targetGlow)" />
                <circle r="12" fill="#f59e0b" filter="url(#glow)" className="animate-pulse" />
                <circle r="6" fill="#ffffff" />
                <text y="50" textAnchor="middle" className="text-xs fill-amber-700 font-semibold">
                  Property Location
                </text>
              </g>

              {/* Nearby cities positioned around center */}
              {data.nearbyCities.slice(0, 8).map((city, index) => {
                const angle = (index * 45) * (Math.PI / 180); // 45 degree intervals
                const radius = 80 + (city.distance * 2); // Distance from center
                const x = 400 + Math.cos(angle) * radius;
                const y = 200 + Math.sin(angle) * radius;
                const isSelected = selectedCity?.name === city.name;

                return (
                  <g 
                    key={city.name} 
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedCity(isSelected ? null : city)}
                  >
                    {/* Connection line */}
                    <line 
                      x1={-x + 400} 
                      y1={-y + 200} 
                      x2="0" 
                      y2="0" 
                      stroke={isSelected ? "#3b82f6" : "#cbd5e1"}
                      strokeWidth={isSelected ? "2" : "1"}
                      strokeDasharray={isSelected ? "none" : "5,5"}
                      opacity="0.6"
                    />
                    
                    {/* City marker */}
                    <circle 
                      r={isSelected ? "20" : "15"} 
                      fill="url(#cityGlow)" 
                      className="transition-all duration-300"
                    />
                    <circle 
                      r={isSelected ? "8" : "6"} 
                      fill="#3b82f6" 
                      className="transition-all duration-300"
                    />
                    <circle r="3" fill="#ffffff" />
                    
                    {/* City label */}
                    <text 
                      y={isSelected ? "35" : "30"} 
                      textAnchor="middle" 
                      className={`text-xs font-medium transition-all duration-300 ${
                        isSelected ? 'fill-blue-700' : 'fill-gray-600'
                      }`}
                    >
                      {city.name}
                    </text>
                    <text 
                      y={isSelected ? "47" : "42"} 
                      textAnchor="middle" 
                      className="text-xs fill-gray-500"
                    >
                      {city.distance}mi
                    </text>

                    {/* Selection indicator */}
                    {isSelected && (
                      <circle 
                        r="25" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="2" 
                        strokeDasharray="2,2"
                        className="animate-spin"
                        style={{ animationDuration: '4s' }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Distance rings */}
              <g opacity="0.2">
                <circle cx="400" cy="200" r="100" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
                <circle cx="400" cy="200" r="150" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
                <circle cx="400" cy="200" r="200" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
              </g>

              {/* Distance labels */}
              <text x="500" y="205" className="text-xs fill-gray-400">25mi</text>
              <text x="550" y="205" className="text-xs fill-gray-400">50mi</text>
              <text x="600" y="205" className="text-xs fill-gray-400">75mi</text>
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Property Location</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Nearby Cities</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* City Details Panel */}
      {selectedCity && (
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-xl backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                {selectedCity.name}, {selectedCity.state}
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {selectedCity.distance} miles away
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Population</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {selectedCity.population.toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Coordinates</span>
                </div>
                <p className="text-sm text-gray-700 font-mono">
                  {selectedCity.lat.toFixed(4)}, {selectedCity.lon.toFixed(4)}
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Market Insights</h4>
              <p className="text-sm text-blue-700">
                This {selectedCity.population < 50000 ? 'smaller' : selectedCity.population < 200000 ? 'mid-size' : 'major'} city 
                is {selectedCity.distance} miles from your property, making it a {
                  selectedCity.distance < 20 ? 'highly accessible' : 
                  selectedCity.distance < 50 ? 'moderately accessible' : 'distant but relevant'
                } market influence.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nearby Cities List */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            Nearby Cities & Markets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-3">
            {data.nearbyCities.map((city, index) => (
              <div 
                key={city.name}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  selectedCity?.name === city.name 
                    ? 'bg-blue-50 border-blue-200 shadow-md' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCity(selectedCity?.name === city.name ? null : city)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-blue-100 text-blue-700' :
                      index === 2 ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{city.name}, {city.state}</h4>
                      <p className="text-sm text-gray-600">
                        Population: {city.population.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={city.distance < 20 ? "default" : city.distance < 50 ? "secondary" : "outline"}>
                      {city.distance} miles
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-1 ml-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}