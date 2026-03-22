

import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapPicker({ open, onClose, onPick }) {
  const [containerId, setContainerId] = useState(null);
  const [selected, setSelected] = useState({ lat: 20, lng: 78 });
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  // Generate a new containerId every time modal opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) {
      setContainerId(`map_${Math.random().toString(36).slice(2)}`);
      setSelected({ lat: 20, lng: 78 });
    } else {
      setContainerId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !containerId) return;
    setTimeout(() => {
      const mapDiv = document.getElementById(containerId);
      if (mapDiv && !mapInstance.current) {
        mapInstance.current = L.map(mapDiv).setView([selected.lat, selected.lng], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
        // Add zoom controls
        mapInstance.current.zoomControl.setPosition('topright');
        // Add marker
        markerRef.current = L.marker([selected.lat, selected.lng], { draggable: true }).addTo(mapInstance.current);
        markerRef.current.on('dragend', function (e) {
          const { lat, lng } = e.target.getLatLng();
          setSelected({ lat, lng });
        });
        // On map click, move marker
        mapInstance.current.on('click', function (e) {
          markerRef.current.setLatLng(e.latlng);
          setSelected({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }
    }, 0);
    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [open, containerId]);

  // Select location handler
  const handleSelect = () => {
    if (onPick && selected) onPick(selected.lat, selected.lng);
    if (onClose) onClose();
  };

  if (!open || !containerId) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, minWidth: 350, minHeight: 350, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>Close</button>
        <div id={containerId} style={{ width: 400, height: 350, borderRadius: 8 }}></div>
        <div style={{ marginTop: 8, fontSize: 14, color: '#333' }}>Drag the marker or click the map to pick a location.<br/>Then click Select Location.</div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#333' }}>Lat: {selected.lat.toFixed(5)}, Lng: {selected.lng.toFixed(5)}</span>
          <button onClick={handleSelect} style={{ padding: '0.4em 1.2em', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Select Location</button>
        </div>
      </div>
    </div>
  );
}
