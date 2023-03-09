import React, {useState} from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import './App.css';
import { Icon } from "leaflet";
import parkData from "./data/skateboard-parks.js";
import { Counter } from './features/counter/Counter';

function App() {
  const [activePark, setActivePark] = useState(null);
  console.log(activePark);
  const icon = new Icon({
    iconUrl: "/skateboarding.svg",
    iconSize: [25, 25]
  });

  return (
    <><MapContainer center={[45.4, -75.7]} zoom={12} scrollWheelZoom={true}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
      {parkData.features.map(park => (
        <Marker
          key={park.properties.PARK_ID}
          position={[
            park.geometry.coordinates[1],
            park.geometry.coordinates[0]
          ]}
          eventHandlers={{
            click: () => {
              console.log(park);
              setActivePark(park);
            }
          }}
          icon={icon} />
      ))}

      {activePark && (
        <Popup
          position={[
            activePark.geometry.coordinates[1],
            activePark.geometry.coordinates[0]
          ]}
          onClose={() => {
            setActivePark(null);
          } }
        >
          <div>
            <h2>{activePark.properties.NAME}</h2>
            <p>{activePark.properties.DESCRIPTIO}</p>
          </div>
        </Popup>
      )}
    </MapContainer><Counter></Counter></>
  );
}

export default App;
