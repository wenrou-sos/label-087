import type { FireStation, GeoLocation } from './types'

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function findNearestStations(
  point: GeoLocation,
  stations: FireStation[],
  limit: number = 3
): (FireStation & { distance: number })[] {
  return stations
    .map((station) => ({
      ...station,
      distance: calculateDistance(point.lat, point.lng, station.location.lat, station.location.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}

export function estimateArrivalTime(distance: number): number {
  const avgSpeedKmPerMin = 0.6
  return Math.ceil(distance / avgSpeedKmPerMin)
}

export function generateRoutePoints(start: GeoLocation, end: GeoLocation): GeoLocation[] {
  const points: GeoLocation[] = [start]
  const steps = 8
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const lat = start.lat + (end.lat - start.lat) * t
    const lng = start.lng + (end.lng - start.lng) * t
    const offset = Math.sin(t * Math.PI) * 0.003
    points.push({ lat: lat + offset, lng: lng - offset * 0.5 })
  }
  points.push(end)
  return points
}
