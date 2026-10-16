// Distance calculation and delivery fee logic for Firey Treat Restaurant
// Restaurant Location: Pachikapalem, Opposite DCCB Bank, Tirupati Road, Andhra Pradesh 517569
// Google Maps: https://maps.app.goo.gl/r8P7kyEs2Q5bEvXY7

export const RESTAURANT_COORDINATES = {
  latitude: 13.4478492,
  longitude: 79.3611529,
  address: 'Pachikapalem, DCCB Bank opposite, Tirupati Road, Andhra Pradesh 517569',
  mapUrl: 'https://maps.app.goo.gl/r8P7kyEs2Q5bEvXY7',
  maxDeliveryRadiusKm: 10, // 10 km maximum delivery radius limit
  reducedFeeThresholdMeters: 500, // 0-500m: FREE (₹0)
};

export type DistanceBracket = 'under_500m' | '500m_to_6km' | '6km_to_10km' | 'above_10km';

export interface DistanceInfo {
  distanceKm: number;
  distanceMeters: number;
  isUnder500m: boolean;
  isWithin10km: boolean;
  bracket: DistanceBracket;
  bracketLabel: string;
  calculatedFee: number;
  isDeliveryAvailable: boolean;
}

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number = RESTAURANT_COORDINATES.latitude,
  lon2: number = RESTAURANT_COORDINATES.longitude
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Evaluates delivery fee and radius status based on distance in kilometers.
 * Pricing Rules:
 *  - 0 – 500 meters: FREE (₹0)
 *  - 500 meters – 6 km: ₹30
 *  - 6 km – 10 km: ₹40
 *  - Above 10 km: Delivery unavailable (no online WhatsApp delivery)
 * NOTE: Free delivery on ₹499+ has been removed as requested.
 */
export function evaluateDeliveryDistance(distanceKm: number): DistanceInfo {
  const distanceMeters = Math.round(distanceKm * 1000);
  const isUnder500m = distanceMeters <= RESTAURANT_COORDINATES.reducedFeeThresholdMeters;
  const isWithin10km = distanceKm <= RESTAURANT_COORDINATES.maxDeliveryRadiusKm;

  let bracket: DistanceBracket;
  let bracketLabel: string;
  let calculatedFee = 0;
  let isDeliveryAvailable = true;

  if (isUnder500m) {
    bracket = 'under_500m';
    bracketLabel = 'Below 500 Meters (0 – 0.5 km)';
    calculatedFee = 0; // 0-500m is FREE
    isDeliveryAvailable = true;
  } else if (distanceKm <= 6) {
    bracket = '500m_to_6km';
    bracketLabel = '500m – 6 km Zone';
    calculatedFee = 30; // 500m-6km charge ₹30
    isDeliveryAvailable = true;
  } else if (distanceKm <= 10) {
    bracket = '6km_to_10km';
    bracketLabel = '6 km – 10 km Zone';
    calculatedFee = 40; // 6km-10km charge ₹40
    isDeliveryAvailable = true;
  } else {
    bracket = 'above_10km';
    bracketLabel = 'Above 10 km (Delivery Unavailable)';
    calculatedFee = 0;
    isDeliveryAvailable = false; // Above 10 km: cannot deliver online!
  }

  return {
    distanceKm,
    distanceMeters,
    isUnder500m,
    isWithin10km,
    bracket,
    bracketLabel,
    calculatedFee,
    isDeliveryAvailable,
  };
}

export const DISTANCE_PRESETS: {
  id: DistanceBracket;
  label: string;
  subLabel: string;
  typicalKm: number;
  feeNotice: string;
  charge: number;
  isAvailable: boolean;
}[] = [
  {
    id: 'under_500m',
    label: 'Below 500 Meters (0 – 0.5 km)',
    subLabel: 'Opposite DCCB Bank / Bus Stop / Immediate Pachikapalem vicinity',
    typicalKm: 0.35,
    feeNotice: 'FREE (₹0)',
    charge: 0,
    isAvailable: true,
  },
  {
    id: '500m_to_6km',
    label: '500m – 6 km',
    subLabel: 'Pachikapalem local neighborhoods & surrounding Tirupati Road areas',
    typicalKm: 3.2,
    feeNotice: '₹30 Delivery Fee',
    charge: 30,
    isAvailable: true,
  },
  {
    id: '6km_to_10km',
    label: '6 km – 10 km (Max Radius Limit)',
    subLabel: 'Outer perimeter within 10 km delivery radius',
    typicalKm: 7.8,
    feeNotice: '₹40 Delivery Fee',
    charge: 40,
    isAvailable: true,
  },
  {
    id: 'above_10km',
    label: 'More than 10 km away',
    subLabel: 'Beyond 10 km delivery limit — Online WhatsApp delivery not accepted',
    typicalKm: 12.0,
    feeNotice: 'Unable to deliver (>10 km)',
    charge: 0,
    isAvailable: false,
  },
];

export interface DetectedLocationResult {
  latitude: number;
  longitude: number;
  distanceKm: number;
  distanceMeters: number;
  bracket: DistanceBracket;
  suggestedAddress: string;
  isUnder500m: boolean;
  isWithin10km: boolean;
  calculatedFee: number;
  isDeliveryAvailable: boolean;
}

/**
 * Attempts reverse geocoding via OpenStreetMap Nominatim with an immediate fallback
 * to accurate local landmarks around Pachikapalem and Tirupati Road.
 */
export async function reverseGeocodeOrLandmark(
  lat: number,
  lon: number,
  distKm: number
): Promise<string> {
  const distMeters = Math.round(distKm * 1000);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.street || addr.pedestrian || addr.neighbourhood;
        const locality = addr.suburb || addr.village || addr.town || addr.city_district || addr.hamlet;
        const district = addr.county || addr.state_district || 'Tirupati Dt';

        const parts = [street, locality, district].filter(Boolean);
        if (parts.length > 0) {
          return `${parts.join(', ')} (${distKm < 1 ? `${distMeters}m` : `${distKm.toFixed(1)} km`} from Firey Treat)`;
        }
        if (data.display_name) {
          const shortName = data.display_name.split(',').slice(0, 3).join(',').trim();
          return `${shortName} (~${distKm < 1 ? `${distMeters}m` : `${distKm.toFixed(1)} km`})`;
        }
      }
    }
  } catch {
    // Graceful fallback if network or rate limit
  }

  // Proximity fallback based on Pachikapalem restaurant hub
  if (distMeters <= RESTAURANT_COORDINATES.reducedFeeThresholdMeters) {
    return `Pachikapalem Main Road (Opposite DCCB Bank / Market area, ~${distMeters}m from Firey Treat)`;
  } else if (distKm <= 6) {
    return `Pachikapalem & Tirupati Road Area (~${distKm.toFixed(1)} km from Firey Treat)`;
  } else if (distKm <= 10) {
    return `Tirupati Road Perimeter (~${distKm.toFixed(1)} km from Pachikapalem Hub)`;
  }
  return `Location Coordinates (${lat.toFixed(5)}, ${lon.toFixed(5)} - ~${distKm.toFixed(1)} km away - Beyond 10km Radius)`;
}

/**
 * Auto-detects customer GPS location, calculates distance, resolves nearest address,
 * and determines the matching delivery fee bracket.
 */
export async function autoDetectAndSelectLocation(
  _subtotal?: number
): Promise<DetectedLocationResult> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });
  });

  const { latitude, longitude } = position.coords;
  const distanceKm = calculateDistanceKm(latitude, longitude);
  const distanceMeters = Math.round(distanceKm * 1000);
  const isUnder500m = distanceMeters <= RESTAURANT_COORDINATES.reducedFeeThresholdMeters;
  const isWithin10km = distanceKm <= RESTAURANT_COORDINATES.maxDeliveryRadiusKm;

  let bracket: DistanceBracket;
  if (isUnder500m) {
    bracket = 'under_500m';
  } else if (distanceKm <= 6) {
    bracket = '500m_to_6km';
  } else if (distanceKm <= 10) {
    bracket = '6km_to_10km';
  } else {
    bracket = 'above_10km';
  }

  const evalInfo = evaluateDeliveryDistance(distanceKm);
  const suggestedAddress = await reverseGeocodeOrLandmark(latitude, longitude, distanceKm);

  return {
    latitude,
    longitude,
    distanceKm,
    distanceMeters,
    bracket,
    suggestedAddress,
    isUnder500m,
    isWithin10km,
    calculatedFee: evalInfo.calculatedFee,
    isDeliveryAvailable: evalInfo.isDeliveryAvailable,
  };
}
