// Distance calculation and delivery fee logic for Firey Treat Restaurant
// Restaurant Location: Pachikapalem, Opposite DCCB Bank, Tirupati Road, Andhra Pradesh 517569
// Google Maps: https://maps.app.goo.gl/r8P7kyEs2Q5bEvXY7

export const RESTAURANT_COORDINATES = {
  latitude: 13.4478492,
  longitude: 79.3611529,
  address: 'Pachikapalem, DCCB Bank opposite, Tirupati Road, Andhra Pradesh 517569',
  mapUrl: 'https://maps.app.goo.gl/r8P7kyEs2Q5bEvXY7',
  maxDeliveryRadiusKm: 10, // 10 km maximum delivery radius
  reducedFeeThresholdMeters: 500, // Below 500m has reduced delivery fee (₹0 / Free)
};

export type DistanceBracket = 'under_500m' | '500m_to_3km' | '3km_to_6km' | '6km_to_10km' | 'above_10km';

export interface DistanceInfo {
  distanceKm: number;
  distanceMeters: number;
  isUnder500m: boolean;
  isWithin10km: boolean;
  bracket: DistanceBracket;
  bracketLabel: string;
  calculatedFee: number;
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
 * Evaluates delivery fee and radius status based on distance in kilometers
 */
export function evaluateDeliveryDistance(distanceKm: number, subtotal: number = 0): DistanceInfo {
  const distanceMeters = Math.round(distanceKm * 1000);
  const isUnder500m = distanceMeters <= RESTAURANT_COORDINATES.reducedFeeThresholdMeters;
  const isWithin10km = distanceKm <= RESTAURANT_COORDINATES.maxDeliveryRadiusKm;

  let bracket: DistanceBracket;
  let bracketLabel: string;
  let baseFee = 30;

  if (isUnder500m) {
    bracket = 'under_500m';
    bracketLabel = 'Immediate Vicinity (< 500m)';
    baseFee = 0; // Reduced delivery charge below 500m: FREE!
  } else if (distanceKm <= 3) {
    bracket = '500m_to_3km';
    bracketLabel = 'Pachikapalem Local (500m - 3km)';
    baseFee = 20;
  } else if (distanceKm <= 6) {
    bracket = '3km_to_6km';
    bracketLabel = 'Mid Zone (3km - 6km)';
    baseFee = 30;
  } else if (distanceKm <= 10) {
    bracket = '6km_to_10km';
    bracketLabel = 'Outer Limit (6km - 10km)';
    baseFee = 40;
  } else {
    bracket = 'above_10km';
    bracketLabel = 'Beyond 10km Radius';
    baseFee = 60;
  }

  // Orders above ₹499 get free delivery if within 10km
  const calculatedFee = isUnder500m ? 0 : subtotal >= 499 && isWithin10km ? 0 : baseFee;

  return {
    distanceKm,
    distanceMeters,
    isUnder500m,
    isWithin10km,
    bracket,
    bracketLabel,
    calculatedFee,
  };
}

export const DISTANCE_PRESETS: {
  id: DistanceBracket;
  label: string;
  subLabel: string;
  typicalKm: number;
  feeNotice: string;
}[] = [
  {
    id: 'under_500m',
    label: 'Below 500 Meters (< 0.5 km)',
    subLabel: 'Opposite DCCB Bank / Pachikapalem Bus Stop / Local Market',
    typicalKm: 0.35,
    feeNotice: 'FREE (Reduced Charge)',
  },
  {
    id: '500m_to_3km',
    label: '500m – 3 km',
    subLabel: 'Nearby Pachikapalem neighborhoods & main road',
    typicalKm: 1.8,
    feeNotice: '₹20 (Free above ₹499)',
  },
  {
    id: '3km_to_6km',
    label: '3 km – 6 km',
    subLabel: 'Surrounding localities along Tirupati Road',
    typicalKm: 4.5,
    feeNotice: '₹30 (Free above ₹499)',
  },
  {
    id: '6km_to_10km',
    label: '6 km – 10 km (Max Delivery Limit)',
    subLabel: 'Outer perimeter within 10km delivery radius',
    typicalKm: 8.0,
    feeNotice: '₹40 (Free above ₹499)',
  },
  {
    id: 'above_10km',
    label: 'More than 10 km away',
    subLabel: 'Beyond standard delivery zone (Takeaway / Special bulk order)',
    typicalKm: 12.0,
    feeNotice: 'Takeaway Recommended',
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

  // High-accuracy fallback based on calculated proximity to Pachikapalem restaurant
  if (distMeters <= RESTAURANT_COORDINATES.reducedFeeThresholdMeters) {
    return `Pachikapalem Main Road (Opposite DCCB Bank / Market area, ~${distMeters}m from Firey Treat)`;
  } else if (distKm <= 3) {
    return `Pachikapalem Area, Tirupati Road (~${distKm.toFixed(1)} km from Firey Treat)`;
  } else if (distKm <= 6) {
    return `Tirupati Road Locality (~${distKm.toFixed(1)} km from Pachikapalem Hub)`;
  } else if (distKm <= 10) {
    return `Outer Perimeter (~${distKm.toFixed(1)} km from Pachikapalem Hub)`;
  }
  return `Location Coordinates (${lat.toFixed(5)}, ${lon.toFixed(5)} - ~${distKm.toFixed(1)} km away)`;
}

/**
 * Auto-detects customer GPS location, calculates distance, resolves nearest address,
 * and determines the matching delivery fee bracket.
 */
export async function autoDetectAndSelectLocation(
  subtotal: number = 0
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
  } else if (distanceKm <= 3) {
    bracket = '500m_to_3km';
  } else if (distanceKm <= 6) {
    bracket = '3km_to_6km';
  } else if (distanceKm <= 10) {
    bracket = '6km_to_10km';
  } else {
    bracket = 'above_10km';
  }

  const evalInfo = evaluateDeliveryDistance(distanceKm, subtotal);
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
  };
}
