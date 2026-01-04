import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ visits }) => {
    // Default center (Jakarta)
    const defaultCenter = [-6.2088, 106.8456];

    // If we have visits, center on the first one
    const center = visits.length > 0 && visits[0].latitude
        ? [visits[0].latitude, visits[0].longitude]
        : defaultCenter;

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 z-0">
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {visits.map((visit) => (
                    visit.latitude && visit.longitude ? (
                        <Marker key={visit.id} position={[visit.latitude, visit.longitude]}>
                            <Popup>
                                <div className="text-xs">
                                    <strong>{visit.customer?.name || "Nasabah"}</strong><br />
                                    {visit.user?.name}<br />
                                    {new Date(visit.visitTime).toLocaleDateString()}
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
