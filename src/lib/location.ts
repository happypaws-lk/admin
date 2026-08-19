export interface ReverseGeocodeAddress {
  houseNumber?: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  district?: string;
  stateDistrict?: string;
  province?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface ResolvedLocation {
  cityOrTown?: string;
  suburbOrArea?: string;
  districtOrProvince?: string;
  fullAddress?: string;
  displayName?: string;
  formattedHeader?: string;
}

const geocodeCache = new Map<string, ResolvedLocation>();

/**
 * Builds a Google Maps search URL for coordinates or a text query.
 */
export function getGoogleMapsUrl(options: {
  latitude?: number | null;
  longitude?: number | null;
  query?: string | null;
}): string {
  const { latitude, longitude, query } = options;
  if (
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }
  if (query && query.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query.trim()
    )}`;
  }
  return "https://maps.google.com";
}

/**
 * Reverse geocodes coordinates via OpenStreetMap Nominatim with memory caching.
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ResolvedLocation | null> {
  if (isNaN(latitude) || isNaN(longitude)) return null;

  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "HappyPaws-Admin/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const addr = data.address || {};

    const cityOrTown =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.hamlet ||
      undefined;

    const suburbOrArea =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.hamlet ||
      undefined;

    const districtOrProvince =
      addr.state_district ||
      addr.county ||
      addr.state ||
      addr.province ||
      undefined;

    // Build a crisp primary header: e.g. "Daraluwa, Gampaha" or "Gampaha, Western Province"
    const headerParts: string[] = [];
    if (suburbOrArea && cityOrTown && suburbOrArea !== cityOrTown) {
      headerParts.push(suburbOrArea, cityOrTown);
    } else if (cityOrTown) {
      headerParts.push(cityOrTown);
      if (districtOrProvince && districtOrProvince !== cityOrTown) {
        headerParts.push(districtOrProvince);
      }
    } else if (districtOrProvince) {
      headerParts.push(districtOrProvince);
    }

    const result: ResolvedLocation = {
      cityOrTown,
      suburbOrArea,
      districtOrProvince,
      fullAddress: data.display_name,
      displayName: data.display_name,
      formattedHeader:
        headerParts.length > 0 ? headerParts.join(", ") : undefined,
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn("Reverse geocoding failed:", error);
    return null;
  }
}
