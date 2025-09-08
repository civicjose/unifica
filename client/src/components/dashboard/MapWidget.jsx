import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { FiMapPin } from 'react-icons/fi';

// Personalizar los iconos del mapa
const sedeIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const centroIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapWidget({ locations }) {
  // Coordenadas para centrar el mapa en España
  const initialPosition = [40.416775, -3.703790]; 

  if (!locations || locations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
         <p className="text-center text-slate-500">No hay ubicaciones para mostrar en el mapa.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
      <div className="flex items-center mb-4">
        <FiMapPin className="h-6 w-6 text-secondary mr-3" />
        <h3 className="text-lg font-bold text-secondary">Mapa de Ubicaciones</h3>
      </div>
      <div className="h-[400px] w-full rounded-lg overflow-hidden">
        <MapContainer center={initialPosition} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map(loc => (
            <Marker 
              key={loc.id} 
              position={[loc.lat, loc.lon]} 
              icon={loc.tipo === 'Sede' ? sedeIcon : centroIcon}
            >
              <Popup>
                <b>{loc.nombre}</b><br/>
                ({loc.tipo})
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapWidget;