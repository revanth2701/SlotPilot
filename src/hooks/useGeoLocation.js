import { useState, useEffect } from "react";

const SESSION_KEY = "slotpilot_geo";

/**
 * useGeoLocation — detects user's country via IP-API with sessionStorage caching.
 * Returns { country, countryCode, loading, error }
 */
export default function useGeoLocation() {
  const [geo, setGeo] = useState(() => {
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.country) return { ...parsed, loading: false, error: null };
      }
    } catch {
      /* ignore */
    }
    return { country: null, countryCode: null, loading: true, error: null };
  });

  useEffect(() => {
    // If already resolved from cache, skip fetch
    if (geo.country && !geo.loading) return;

    let cancelled = false;

    const detect = async () => {
      // Try multiple free geo APIs for reliability (HTTPS-compatible first)
      const apis = [
        {
          url: "https://ipapi.co/json/",
          parse: (d) => d.country_name && { country: d.country_name, countryCode: d.country_code },
        },
        {
          url: "https://ip-api.com/json/?fields=status,country,countryCode",
          parse: (d) => d.status === "success" && d.country && { country: d.country, countryCode: d.countryCode },
        },
      ];

      for (const api of apis) {
        try {
          const res = await fetch(api.url, { signal: AbortSignal.timeout(4000) });
          if (!res.ok) continue;
          const data = await res.json();
          if (cancelled) return;
          const result = api.parse(data);
          if (result) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
            setGeo({ ...result, loading: false, error: null });
            return;
          }
        } catch {
          if (cancelled) return;
          // try next API
        }
      }

      // All APIs failed
      if (!cancelled) {
        setGeo({ country: null, countryCode: null, loading: false, error: "All geo APIs failed" });
      }
    };

    detect();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return geo;
}
