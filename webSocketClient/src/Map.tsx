import React, { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import axios from "axios";

const Map: React.FC = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [shipName, setShipName] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [direction, setDirection] = useState<number | null>(null);

  //Fetch ship details
  const fetchShipDetails = async () => {
    try {
      const response = await axios.get("/api/ship-details");
      if (response.status === 200) {
        const { ShipName, ShipId, Latitude, Longitude, Sog, Cog } = response.data;

        // State if ShipId matches
        if (ShipId === 219230000) {
          setPosition([Latitude, Longitude]);
          setShipName(ShipName);
          setSpeed(Sog);
          setDirection(Cog);
        }
      }
    } catch (error) {
      console.error("Error fetching ship details:", error);
    }
  };

  // Fetch ship details on component mount and set an interval
  useEffect(() => {
    fetchShipDetails(); // Fetch details on component mount
    const intervalId = setInterval(fetchShipDetails, 5000); // Fetch every 5 seconds

    return () => {
      clearInterval(intervalId); // Clean up interval on component unmount
    };
  }, []);

  return (
    <MapContainer center={position ?? [56.032615, 12.6174]} zoom={10} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position && (
        <Marker position={position}>
          <Popup>
            Name: {shipName !== null ? `${shipName}` : 'N/A'}<br />
            Speed: {speed !== null ? `${speed} knots` : 'N/A'}<br />
            Direction: {direction !== null ? `${direction} degrees` : 'N/A'}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
