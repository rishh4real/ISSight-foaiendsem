const EARTH_RADIUS_KM = 6371;

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function haversineDistanceKm(pointA, pointB) {
  if (!pointA || !pointB) return 0;

  const lat1 = toNumber(pointA.lat);
  const lon1 = toNumber(pointA.lng);
  const lat2 = toNumber(pointB.lat);
  const lon2 = toNumber(pointB.lng);
  const toRadians = (degree) => (degree * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateSpeedKmh(previousPosition, nextPosition) {
  if (!previousPosition || !nextPosition) return 0;

  const elapsedHours = (nextPosition.timestamp - previousPosition.timestamp) / 1000 / 60 / 60;
  if (elapsedHours <= 0) return 0;

  return haversineDistanceKm(previousPosition, nextPosition) / elapsedHours;
}

export function getNearestPlace(lat, lng) {
  const latitude = toNumber(lat);
  const longitude = toNumber(lng);

  const places = [
    { name: 'North Pacific Ocean', lat: 25, lng: -150 },
    { name: 'South Pacific Ocean', lat: -25, lng: -130 },
    { name: 'Atlantic Ocean', lat: 10, lng: -35 },
    { name: 'Indian Ocean', lat: -20, lng: 80 },
    { name: 'Arctic Ocean', lat: 78, lng: 0 },
    { name: 'Southern Ocean', lat: -62, lng: 20 },
    { name: 'New York, USA', lat: 40.7128, lng: -74.006 },
    { name: 'London, UK', lat: 51.5072, lng: -0.1276 },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
    { name: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241 },
    { name: 'Rio de Janeiro, Brazil', lat: -22.9068, lng: -43.1729 },
    { name: 'Mumbai, India', lat: 19.076, lng: 72.8777 },
    { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
  ];

  return places.reduce((closest, place) => {
    const distance = haversineDistanceKm({ lat: latitude, lng: longitude }, place);
    return distance < closest.distance ? { ...place, distance } : closest;
  }, { name: 'Unknown region', distance: Number.POSITIVE_INFINITY }).name;
}

export function formatCoordinate(value, directionPositive, directionNegative) {
  const number = toNumber(value);
  return `${Math.abs(number).toFixed(4)}° ${number >= 0 ? directionPositive : directionNegative}`;
}
