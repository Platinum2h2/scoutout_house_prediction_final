import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, Locate } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons
const createCustomIcon = (color: string = 'blue') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

interface City {
  City: string;
  State: string;
  Population: number;
  lat: number;
  lon: number;
}

interface GeographicMapProps {
  address?: string;
  lat?: number;
  lon?: number;
  onAddressLocate?: (address: string) => void;
}

// Component to update map view when coordinates change
function MapController({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lon], 10);
  }, [lat, lon, map]);
  
  return null;
}

export function GeographicMap({ address, lat = 40.7128, lon = -74.0060, onAddressLocate }: GeographicMapProps) {
  const [nearbyCities, setNearbyCities] = useState<Array<City & { distance: number }>>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [searchAddress, setSearchAddress] = useState(address || '');
  const [loading, setLoading] = useState(false);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Locate address on map
  const locateAddress = async () => {
    if (!searchAddress.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(searchAddress)}`);
      const data = await response.json();
      
      if (data.success) {
        onAddressLocate?.(searchAddress);
        // The parent component will update lat/lon which will trigger map update
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get directions to address
  const getDirections = () => {
    if (userLocation) {
      const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lon}/${lat},${lon}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      const googleMapsUrl = `https://www.google.com/maps/dir//${lat},${lon}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Fetch nearby cities
  useEffect(() => {
    const fetchNearbyCities = async () => {
      try {
        const response = await fetch(`/api/nearby-cities?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        setNearbyCities(data.nearbyCities);
      } catch (error) {
        console.error('Error fetching nearby cities:', error);
      }
    };

    fetchNearbyCities();
  }, [lat, lon]);

  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const nearestCity = nearbyCities.length > 0 ? nearbyCities[0] : null;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-6 glass-effect">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter address to locate..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && locateAddress()}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={locateAddress}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Locate className="w-4 h-4 mr-2" />
              {loading ? 'Locating...' : 'Locate Address'}
            </Button>
            <Button 
              onClick={getDirections}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Directions
            </Button>
          </div>
        </div>
        
        {nearestCity && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <MapPin className="inline w-4 h-4 mr-1" />
              Nearest city: <strong>{nearestCity.City}, {nearestCity.State}</strong> 
              ({nearestCity.distance?.toFixed(1) || 0} miles away)
            </p>
          </div>
        )}
      </Card>

      {/* Map */}
      <Card className="overflow-hidden glass-effect">
        <div style={{ height: '500px', width: '100%' }}>
          <MapContainer
            center={[lat, lon] as [number, number]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapController lat={lat} lon={lon} />
            
            {/* Main location marker */}
            <Marker position={[lat, lon] as [number, number]}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">{address || 'Target Location'}</h3>
                  <p className="text-sm text-gray-600">
                    {lat.toFixed(4)}, {lon.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* User location marker */}
            {userLocation && (
              <Marker 
                position={[userLocation.lat, userLocation.lon] as [number, number]}
                icon={createCustomIcon('red')}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold">Your Location</h3>
                    <p className="text-sm text-gray-600">
                      Distance: {calculateDistance(userLocation.lat, userLocation.lon, lat, lon).toFixed(1)} miles
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Nearby cities markers */}
            {nearbyCities.slice(0, 5).map((city, index) => (
              <Marker 
                key={`city-${city.City}-${city.State}-${index}`}
                position={[city.lat, city.lon] as [number, number]}
                icon={createCustomIcon('green')}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold">{city.City}, {city.State}</h3>
                    <p className="text-sm text-gray-600">
                      Population: {city.Population?.toLocaleString() || 'N/A'}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {city.distance.toFixed(1)} miles away
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Card>

      {/* Nearby Cities List */}
      <Card className="p-6 glass-effect">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Nearby Cities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyCities.slice(0, 6).map((city, index) => (
            <div 
              key={`list-${city.City}-${city.State}-${index}`}
              className="p-4 bg-white/60 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h4 className="font-semibold text-gray-800">{city.City}, {city.State}</h4>
              <p className="text-sm text-gray-600">Pop: {city.Population?.toLocaleString() || 'N/A'}</p>
              <p className="text-sm text-blue-600 font-medium">{city.distance.toFixed(1)} miles</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}