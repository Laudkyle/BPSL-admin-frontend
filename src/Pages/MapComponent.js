import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon setup
const createMarkerIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
  return new L.Icon.Default();
};

const LocationMarker = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState(initialLocation || null);
  const [mapReady, setMapReady] = useState(false);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newPosition = { lat, lng };
      setPosition(newPosition);
      onLocationSelect(lat, lng);
    },
    load() {
      setMapReady(true);
      // Force a redraw to fix tile loading issues
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  });

  useEffect(() => {
    if (mapReady && initialLocation) {
      setPosition(initialLocation);
      map.flyTo(initialLocation, map.getZoom());
    }
  }, [initialLocation, mapReady]);

  return position ? (
    <Marker position={position} icon={createMarkerIcon()}>
      <Popup className="text-sm font-medium">Selected Location</Popup>
    </Marker>
  ) : null;
};

const MapComponent = ({ onLocationSelect, initialLocation }) => {
  const [mapInstance, setMapInstance] = useState(null);
  const defaultCenter = initialLocation || { lat: 7.9465, lng: -1.0232 }; // Center of Ghana

  useEffect(() => {
    if (mapInstance) {
      // Fix for tile loading issues
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 0);
    }
  }, [mapInstance]);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={7}
        className="h-full w-full rounded-lg shadow-md"
        whenCreated={setMapInstance}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          noWrap={true}
          updateWhenIdle={true}
        />
        <LocationMarker 
          onLocationSelect={onLocationSelect} 
          initialLocation={initialLocation} 
        />
      </MapContainer>
      
      {/* Loading indicator */}
      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10 pointer-events-none">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );
};

export default MapComponent;