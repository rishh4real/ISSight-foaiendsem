import { useEffect } from 'react';
import { RefreshCw, Satellite, Users } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { formatCoordinate } from '../utils/geo';

const issIcon = L.divIcon({
  html: '<div class="iss-marker">🚀</div>',
  className: '',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.setView([position.lat, position.lng], map.getZoom(), {
      animate: true,
      duration: 0.7,
    });
  }, [map, position]);

  return null;
}

function StatCard({ label, value, accent = 'text-slate-950 dark:text-white' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export default function ISSTracker({
  currentPosition,
  trajectory,
  nearestPlace,
  speedHistory,
  people,
  peopleCount,
  peopleLoading,
  loading,
  error,
  onRefresh,
}) {
  const mapCenter = currentPosition ? [currentPosition.lat, currentPosition.lng] : [0, 0];
  const linePositions = trajectory.map((point) => [point.lat, point.lng]);
  const latestSpeed = currentPosition?.speed || 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:shadow-soft-dark">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-300">
            <Satellite className="h-4 w-4" />
            ISS Live Tracker
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Orbital Position Monitor</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Updates every 15 seconds with trajectory, speed, nearest mock region, and crew data.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <p className="font-semibold">ISS data could not be loaded.</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Latitude"
          value={currentPosition ? formatCoordinate(currentPosition.lat, 'N', 'S') : 'Loading'}
        />
        <StatCard
          label="Longitude"
          value={currentPosition ? formatCoordinate(currentPosition.lng, 'E', 'W') : 'Loading'}
        />
        <StatCard
          label="Current Speed"
          value={`${Math.round(latestSpeed).toLocaleString()} km/h`}
          accent="text-cyan-700 dark:text-cyan-300"
        />
        <StatCard label="Tracked Positions" value={trajectory.length} accent="text-orange-600 dark:text-orange-300" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="relative min-h-[390px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          {loading && !currentPosition ? (
            <div className="absolute inset-0 z-[450] grid place-items-center bg-white/80 backdrop-blur-sm dark:bg-slate-950/70">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-300" />
            </div>
          ) : null}
          <MapContainer center={mapCenter} zoom={3} scrollWheelZoom className="z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap position={currentPosition} />
            {linePositions.length > 1 ? (
              <Polyline positions={linePositions} pathOptions={{ color: '#06b6d4', weight: 4, opacity: 0.82 }} />
            ) : null}
            {currentPosition ? (
              <Marker position={mapCenter} icon={issIcon}>
                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                  ISS: {currentPosition.lat.toFixed(3)}, {currentPosition.lng.toFixed(3)}
                </Tooltip>
                <Popup>
                  <strong>International Space Station</strong>
                  <br />
                  Latitude: {currentPosition.lat.toFixed(4)}
                  <br />
                  Longitude: {currentPosition.lng.toFixed(4)}
                  <br />
                  Speed: {Math.round(latestSpeed).toLocaleString()} km/h
                </Popup>
              </Marker>
            ) : null}
          </MapContainer>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Nearest Place
            </p>
            <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{nearestPlace}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Based on a lightweight mock geolocation table for reliability.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                <p className="font-semibold text-slate-950 dark:text-white">People in Space</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                {peopleCount}
              </span>
            </div>
            {peopleLoading ? (
              <div className="mt-4 space-y-2">
                <div className="skeleton h-4 rounded" />
                <div className="skeleton h-4 w-4/5 rounded" />
                <div className="skeleton h-4 w-3/5 rounded" />
              </div>
            ) : (
              <ul className="mt-4 max-h-56 space-y-2 overflow-auto pr-1 text-sm text-slate-600 dark:text-slate-300">
                {people.map((person) => (
                  <li key={`${person.name}-${person.craft}`} className="flex justify-between gap-3">
                    <span>{person.name}</span>
                    <span className="font-medium text-slate-400">{person.craft}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
            Latest speed samples: {speedHistory.length}/30
          </div>
        </aside>
      </div>
    </section>
  );
}
