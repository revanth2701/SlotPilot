import { useState, useEffect } from "react";

const SESSION_KEY = "slotpilot_geo";

function getCountryNameFromCode(countryCode) {
  if (!countryCode) return null;
  try {
    const regionCode = String(countryCode).toUpperCase();
    const displayNames = new Intl.DisplayNames([navigator.language || "en"], {
      type: "region",
    });
    const countryName = displayNames.of(regionCode);
    if (!countryName) return null;
    return { country: countryName, countryCode: regionCode };
  } catch {
    return null;
  }
}

function getLocaleFallbackCountry() {
  try {
    const languages = navigator.languages?.length
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];

    for (const languageTag of languages) {
      const match = String(languageTag).match(/-([A-Za-z]{2})\b/);
      if (!match) continue;
      const fromCode = getCountryNameFromCode(match[1]);
      if (fromCode) return fromCode;
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchJsonWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

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
      // Try multiple HTTPS geo APIs for reliability
      const apis = [
        {
          url: "https://ipapi.co/json/",
          parse: (d) => d.country_name && { country: d.country_name, countryCode: d.country_code },
        },
        {
          url: "https://ipwho.is/",
          parse: (d) => d?.success !== false && d?.country && {
            country: d.country,
            countryCode: d.country_code,
          },
        },
        {
          url: "https://ipinfo.io/json",
          parse: (d) => getCountryNameFromCode(d?.country),
        },
      ];

      for (const api of apis) {
        const data = await fetchJsonWithTimeout(api.url, 5000);
        if (cancelled) return;
        if (!data) continue;

        const result = api.parse(data);
        if (result?.country) {
          try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
          } catch {
            // ignore storage failures in strict privacy modes
          }
          setGeo({ ...result, loading: false, error: null });
          return;
        }
      }

      const localeFallback = getLocaleFallbackCountry();
      if (!cancelled && localeFallback?.country) {
        setGeo({ ...localeFallback, loading: false, error: "Geo API unavailable, used browser locale" });
        return;
      }

      // All APIs and locale fallback failed
      if (!cancelled) {
        setGeo({
          country: null,
          countryCode: null,
          loading: false,
          error: "Could not auto-detect location",
        });
      }
    };

    detect();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return geo;
}
