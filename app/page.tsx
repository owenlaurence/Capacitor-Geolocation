"use client"
import { useState } from "react";
import { Geolocation, Position } from "@capacitor/geolocation";

export default function LocationComponent() {
  const [location, setLocation] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocation = async () => {
    try {

      // Must start by requesting permission. This results in the system-native prompt.
      await Geolocation.requestPermissions();

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,   // High accuracy gives us GPS style coords. 
        timeout: 10000,
        maximumAge: 0,
      });

      setLocation(position);
      setError(null);
    } 
    catch (err : any) { 
      setError(err.message);
    }
  };

  return (
    // adjust styling if not using tailwind.
    <div className="flex flex-col items-center justify-center h-screen"> 
      <button style={{ color: "blue" }} onClick={getLocation}>Get Location</button>

      {location && (
        <div>
          <p>Latitude: {location.coords.latitude}</p>
          <p>Longitude: {location.coords.longitude}</p>
        </div>
      )}

      {/* Catch any errors (likely an issue with info.plist) */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}