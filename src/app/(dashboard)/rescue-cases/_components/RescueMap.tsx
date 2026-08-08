"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { AdminCaseResponse } from "@/lib/types";
import Link from "next/link";

function getMarkerIcon(urgency: string) {
  const u = urgency.toLowerCase();
  const color =
    u === "critical" ? "#ef4444" : u === "moderate" ? "#f59e0b" : "#22c55e";
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.55);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

interface RescueMapProps {
  cases: AdminCaseResponse[];
}

export default function RescueMap({ cases }: RescueMapProps) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
  }, []);

  const plotted = cases.filter(
    (c) => c.latitude != null && c.longitude != null,
  );

  return (
    <MapContainer
      center={[7.8731, 80.7718]}
      zoom={8}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {plotted.map((c) => (
        <Marker
          key={c.id}
          position={[c.latitude, c.longitude]}
          icon={getMarkerIcon(c.urgency)}
        >
          <Popup>
            <div className="text-xs space-y-1 min-w-[160px]">
              <p className="font-bold text-sm">{c.locationName}</p>
              <p>
                <span className="font-medium">Urgency:</span> {c.urgency}
              </p>
              <p>
                <span className="font-medium">Status:</span> {c.status}
              </p>
              <Link
                href={`/rescue-cases/${c.id}`}
                className="block mt-1.5 text-indigo-600 hover:underline font-medium"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
