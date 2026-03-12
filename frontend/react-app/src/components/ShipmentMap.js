

import { useEffect, useRef, useState } from "react";
import "../styles/ShipmentMap.css";

// Dynamically import Leaflet so it doesn't SSR-crash
let L = null;
const loadLeaflet = async () => {
  if (L) return L;
  const mod = await import("leaflet");
  L = mod.default ?? mod;

  // fix default marker icons broken by webpack
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  return L;
};

// Nominatim geocoder (free, no key)
const geocode = async (address) => {
  if (!address) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "lt,en" },
    });
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
};

export default function ShipmentMap({ address, pinnedCoords, onPin }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  // Initialize map
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setStatus("loading");
      const Leaflet = await loadLeaflet();

      // also inject CSS if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (cancelled || !mapRef.current) return;
      if (mapInstanceRef.current) return; // already initialised

      const defaultCenter = [54.9, 23.9]; // Lithuania
      const map = Leaflet.map(mapRef.current, {
        center: defaultCenter,
        zoom: 7,
        zoomControl: true,
      });

      Leaflet.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      // Click to pin
      map.on("click", (e) => {
        onPin?.({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapInstanceRef.current = map;
      setStatus("ready");

      // Try to geocode the address
      if (address) {
        const coords = await geocode(address);
        if (!cancelled && coords && mapInstanceRef.current) {
          mapInstanceRef.current.setView([coords.lat, coords.lng], 14);
          onPin?.(coords); // pre-fill coords
        }
      }
    };

    init().catch(() => setStatus("error"));

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only once

  // Keep marker in sync with pinnedCoords
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (pinnedCoords) {
      markerRef.current = L.marker([pinnedCoords.lat, pinnedCoords.lng], {
        draggable: true,
      }).addTo(mapInstanceRef.current);

      markerRef.current.on("dragend", (e) => {
        const ll = e.target.getLatLng();
        onPin?.({ lat: ll.lat, lng: ll.lng });
      });
    }
  }, [pinnedCoords, onPin]);

  return (
    <div className="shm-root">
      {status === "loading" && (
        <div className="shm-overlay">
          <div className="shm-spinner" />
          <span>Kraunamas žemėlapis…</span>
        </div>
      )}
      {status === "error" && (
        <div className="shm-overlay shm-overlay--error">
          Nepavyko užkrauti žemėlapio
        </div>
      )}
      <div ref={mapRef} className="shm-map" />
      <div className="shm-hint">Spustelėkite žemėlapyje, kad pažymėtumėte pristatymo vietą</div>
    </div>
  );
}