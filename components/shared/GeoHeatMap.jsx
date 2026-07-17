'use client';

import Script from 'next/script';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import * as L from 'leaflet';

const heatPoints = [
  { lat: 12.9716, lng: 77.5946, intensity: 0.5 },
  { lat: 12.9722, lng: 77.5950, intensity: 0.8 },
  { lat: 12.9700, lng: 77.5965, intensity: 0.4 },
  { lat: 12.9730, lng: 77.5935, intensity: 0.9 },
];

function HeatmapLayer() {
  const map = useMap();
  const [heatReady, setHeatReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js';
      script.async = true;
      script.onload = () => setHeatReady(true);
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!heatReady || !map || typeof window === 'undefined') return;

    if (typeof window.L?.heatLayer !== 'function') {
      console.error('❌ heatLayer not loaded from leaflet.heat');
      return;
    }

    // ✅ Use heatLayer from window.L
    const heat = window.L.heatLayer(
      heatPoints.map((p) => [p.lat, p.lng, p.intensity]),
      {
        radius: 25,
        blur: 15,
        maxZoom: 17,
      }
    ).addTo(map);

    // 🔵 Optional: Add circle markers with tooltip
    heatPoints.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 6,
        fillColor: '#fff',
        fillOpacity: 1,
        color: '#000',
        weight: 1,
      }).addTo(map);

      marker.bindTooltip(`📍 Lat: ${p.lat}, Lng: ${p.lng}`, {
        permanent: false,
        direction: 'top',
      });
    });

    return () => {
      map.removeLayer(heat);
    };
  }, [map, heatReady]);

  return null;
}

export default function GeoHeatMap() {
  return (
    <div style={{ height: '500px' }}>
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer />
      </MapContainer>
    </div>
  );
}
