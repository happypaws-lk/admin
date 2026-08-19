"use client";

import { useState, useEffect } from "react";
import { reverseGeocodeCoordinates, type ResolvedLocation } from "@/lib/location";

interface UseReverseGeocodeResult {
  location: ResolvedLocation | null;
  isLoading: boolean;
}

/**
 * Hook to reverse geocode coordinates to structured town/city/province data.
 */
export function useReverseGeocode(
  latitude?: number | null,
  longitude?: number | null
): UseReverseGeocodeResult {
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      setLocation(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    reverseGeocodeCoordinates(latitude, longitude)
      .then((resolved) => {
        if (isMounted) {
          setLocation(resolved);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLocation(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  return { location, isLoading };
}
