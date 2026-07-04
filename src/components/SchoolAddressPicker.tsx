import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultCenter: [number, number] = [-6.2, 106.816666];

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
});

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type SchoolAddressPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SchoolAddressPicker({ value, onChange }: SchoolAddressPickerProps) {
  const [mode, setMode] = useState<'map' | 'manual'>('map');
  const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [lookupLabel, setLookupLabel] = useState<string>('');
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);

  const center = useMemo(() => selectedPoint || defaultCenter, [selectedPoint]);

  useEffect(() => {
    if (!value || mode !== 'map') return;
    setLookupLabel(value);
  }, [mode, value]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLookupLoading(true);
    setMapError(null);
    try {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lng));
      url.searchParams.set('accept-language', 'id');

      const res = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Reverse geocode gagal');
      }

      const data = await res.json();
      const label = data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setLookupLabel(label);
      onChange(label);
    } catch (error) {
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setLookupLabel(fallback);
      onChange(fallback);
      setMapError('Nama alamat dari peta tidak ditemukan. Anda masih bisa lanjut manual.');
    } finally {
      setIsLookupLoading(false);
    }
  };

  const handlePick = (lat: number, lng: number) => {
    setSelectedPoint([lat, lng]);
    void reverseGeocode(lat, lng);
  };

  const handleSearch = async () => {
    const query = searchTerm.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setIsSearching(true);
    setMapError(null);

    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('q', query);
      url.searchParams.set('limit', '5');
      url.searchParams.set('countrycodes', 'id');
      url.searchParams.set('accept-language', 'id');

      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Pencarian lokasi gagal');
      }

      const data = (await res.json()) as SearchResult[];
      setSearchResults(data);

      if (data.length === 0) {
        setMapError('Lokasi tidak ditemukan. Coba kata kunci yang lebih spesifik atau pakai manual.');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setSearchResults([]);
        setMapError('Pencarian lokasi gagal. Anda masih bisa input manual.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = async (result: SearchResult) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    setSelectedPoint([lat, lng]);
    setSearchResults([]);
    setSearchTerm(result.display_name);
    await reverseGeocode(lat, lng);
  };

  if (mode === 'manual') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-slate-500 font-bold mb-1 uppercase">Alamat Lengkap</label>
          <button
            type="button"
            onClick={() => setMode('map')}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Pakai map
          </button>
        </div>
        <textarea
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 h-20"
          placeholder="Alamat sekolah..."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-slate-500 font-bold mb-1 uppercase">Alamat Lengkap</label>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Input manual
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="Cari lokasi sekolah, contoh: SMA Negeri 1 Bandung"
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
          />
          <button
            type="button"
            onClick={() => void handleSearch()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm disabled:bg-slate-300"
            disabled={isSearching}
          >
            {isSearching ? 'Mencari...' : 'Cari'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white">
            {searchResults.map((result) => (
              <button
                key={`${result.lat}-${result.lon}-${result.display_name}`}
                type="button"
                onClick={() => void selectSearchResult(result)}
                className="w-full text-left px-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
              >
                <div className="text-sm font-semibold text-slate-800 line-clamp-2">
                  {result.display_name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {Number(result.lat).toFixed(6)}, {Number(result.lon).toFixed(6)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
        <div className="h-64 w-full">
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom
            className="h-full w-full"
            whenReady={() => setMapError(null)}
          >
            <TileLayer
              eventHandlers={{
                tileerror: () => {
                  setMapError('Peta tidak berhasil dimuat. Gunakan input manual.');
                  setMode('manual');
                },
              }}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <MapClickHandler onPick={handlePick} />
            <RecenterMap center={center} />
            {selectedPoint && <Marker position={selectedPoint} />}
          </MapContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
        {isLookupLoading
          ? 'Mencari alamat dari titik peta...'
          : lookupLabel || 'Klik peta untuk memilih lokasi sekolah.'}
      </div>

      {mapError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
          {mapError}
        </div>
      )}
    </div>
  );
}
