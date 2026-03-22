import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  MapPin,
  Clock,
  CheckCircle,
  Building2,
  Heart,
  Briefcase,
  Star,
  Users,
  Search
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import worldCountries from 'world-countries';
import { supabase } from "@/integrations/supabase/client";

// NEW: slug + local image resolver (supports both src/assets/countries/* and public/images/countries/*)
const toCountrySlug = (name = "") =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['().,]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Vite: bundle-time import of local country images (put files in: src/assets/countries/)
const BUNDLED_COUNTRY_IMAGES = (() => {
  try {
    const modules = import.meta.glob("../assets/countries/*.{jpg,jpeg,png,webp}", {
      eager: true,
      import: "default",
    });

    const map = new Map();
    for (const [path, url] of Object.entries(modules)) {
      const file = path.split("/").pop() || "";
      const slug = file.replace(/\.(jpg|jpeg|png|webp)$/i, "").toLowerCase();
      map.set(slug, url);
    }
    return map;
  } catch {
    return new Map();
  }
})();

const resolveBundledCountryImage = (countryName) => {
  const slug = toCountrySlug(countryName);
  return BUNDLED_COUNTRY_IMAGES.get(slug) || null;
};

// NEW: base path in /public (Vite serves /public at site root)
const PUBLIC_COUNTRY_IMAGE_DIR = "/images/countries";

// NEW: common aliases -> your actual filename slug
const COUNTRY_SLUG_ALIASES = new Map([
  ["united states", "united-states"],
  ["united states of america", "united-states"],
  ["usa", "united-states"],
  ["u.s.a", "united-states"],
]);

const resolveCountrySlug = (name = "") => {
  const key = String(name).trim().toLowerCase();
  return COUNTRY_SLUG_ALIASES.get(key) || toCountrySlug(name);
};

const VisaServices = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [query, setQuery] = useState("");

  // from VisaStart — with sessionStorage fallback for page refreshes
  const passportCountry = (() => {
    const fromState = location.state?.passportCountry;
    if (fromState) return fromState;
    try {
      const ctx = JSON.parse(sessionStorage.getItem("slotpilot_visa_context") || "null");
      return ctx?.contextCountry || null;
    } catch { return null; }
  })();

  const countryCodeToFlag = (cc) => {
    if (!cc || typeof cc !== 'string' || cc.length !== 2) return '';
    return cc.toUpperCase().replace(/./g, ch =>
      String.fromCodePoint(127397 + ch.charCodeAt(0))
    );
  };

  const defaultVisaTypes = () => ([
    {
      type: 'Tourist Visa',
      description: 'For tourism and short visits',
      icon: Heart,
      duration: 'Varies',
      fee: 'Varies',
    },
    {
      type: 'Student Visa',
      description: 'For academic studies',
      icon: Building2,
      duration: 'Course duration',
      fee: 'Varies',
    },
    {
      type: 'Work Visa',
      description: 'For employment',
      icon: Briefcase,
      duration: 'Varies',
      fee: 'Varies',
    },
  ]);

  // destination list from CountryList
  const [allowedCountryNames, setAllowedCountryNames] = useState([]);

  // ✅ NEW: track whether VisaStart selection matched CountryList.PassportCountry
  // null = not checked yet / loading, true = matched, false = no match
  const [passportMatch, setPassportMatch] = useState(null);
  const [isPassportCheckLoading, setIsPassportCheckLoading] = useState(false);

  useEffect(() => {
    if (!passportCountry) {
      setAllowedCountryNames([]);
      setPassportMatch(false);
      setIsPassportCheckLoading(false);
      return;
    }

    const fetchAllowedCountries = async () => {
      setIsPassportCheckLoading(true);
      setPassportMatch(null);

      // ✅ Case-insensitive exact match against PassportCountry
      const { data, error } = await supabase
        .from("CountryList")
        .select("PassportCountry, VisaCountries")
        .ilike("PassportCountry", String(passportCountry).trim())
        .maybeSingle();

      if (error) {
        console.error("CountryList fetch error:", error);
        setAllowedCountryNames([]);
        setPassportMatch(false);
        setIsPassportCheckLoading(false);
        return;
      }

      // ✅ Only allow VisaCountries if PassportCountry actually matched a row
      if (!data?.PassportCountry) {
        setAllowedCountryNames([]);
        setPassportMatch(false);
        setIsPassportCheckLoading(false);
        return;
      }

      const names =
        data?.VisaCountries?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [];

      setAllowedCountryNames(names);
      setPassportMatch(true);
      setIsPassportCheckLoading(false);
    };

    fetchAllowedCountries();
  }, [passportCountry]);

  const countries = useMemo(() => {
    const base = (worldCountries || []).filter(
      (c) => c && c.name && c.name.common
    );

    // ✅ IMPORTANT: keep the existing cards logic (same mapping),
    // but ONLY show destinations from VisaCountries when passportCountry matched.
    // If there is NO match / NO VisaCountries, show NOTHING (do NOT fall back to all countries).
    const allowedSet = new Set(
      (allowedCountryNames || []).map((n) => String(n).trim().toLowerCase())
    );

    const filtered =
      allowedSet.size > 0
        ? base.filter((c) => allowedSet.has(String(c.name.common).trim().toLowerCase()))
        : [];

    const list = filtered
      .map((c) => {
        // use cca2/cca3/ccn3 as stable ID like before
        const idSource =
          c.cca2 || c.cca3 || (c.ccn3 ? String(c.ccn3) : null) || c.name.common;

        return {
          id: String(idSource).toLowerCase(),
          name: c.name.common,
          flag: countryCodeToFlag(c.cca2),
          region: c.region || c.subregion || "",
          processingTime: "Varies",
          popularity: "",
          successRate: "Varies",
          description: c.region
            ? `${c.name.common} — ${c.region}`
            : c.name.common,
          visaTypes: defaultVisaTypes(),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [allowedCountryNames]);

  const imageForCountry = (countryName, w = 800, h = 500) => {
    if (!countryName) return `https://via.placeholder.com/${w}x${h}?text=No+Image`;
    const q = encodeURIComponent(`${countryName} landmark`);
    return `https://source.unsplash.com/${w}x${h}/?${q}`;
  };

  const CountryImage = ({ countryName, className = '', alt = '' }) => {
    const [src, setSrc] = useState(null);

    useEffect(() => {
      if (!countryName) {
        setSrc(`https://via.placeholder.com/600x400?text=No+Image`);
        return;
      }

      let mounted = true;

      // 1) Prefer bundled local images from src/assets/countries (if you ever add them later)
      const bundled = resolveBundledCountryImage(countryName);
      if (bundled) {
        setSrc(bundled);
        return () => { mounted = false; };
      }

      // 2) Try PUBLIC images: /public/images/Countries/
      // Try both slug-based filenames and raw countryName filenames.
      const slug = resolveCountrySlug(countryName);

      const rawName = String(countryName).trim();
      const rawEncoded = encodeURIComponent(rawName);

      const candidates = [
        // slugged (recommended naming)
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${slug}.jpg`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${slug}.jpeg`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${slug}.png`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${slug}.webp`,

        // raw filename (if you saved as "United States.jpg")
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${rawEncoded}.jpg`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${rawEncoded}.jpeg`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${rawEncoded}.png`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${rawEncoded}.webp`,

        // raw filename with uppercase extensions (if your files are .JPG etc)
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${rawEncoded}.JPG`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${rawEncoded}.JPEG`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${rawEncoded}.PNG`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${rawEncoded}.WEBP`,

        // slug with uppercase extensions
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${slug}.JPG`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${slug}.JPEG`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${slug}.PNG`,
        `${PUBLIC_COUNTRY_IMAGE_DIR}/${slug}.WEBP`,
      ];

      let idx = 0;

      const tryNext = () => {
        if (!mounted) return;

        if (idx >= candidates.length) {
          // 3) Final fallback
          setSrc(imageForCountry(countryName, 1200, 800));
          return;
        }

        const testSrc = candidates[idx++];
        const img = new Image();
        img.src = testSrc;

        img.onload = () => {
          if (mounted) setSrc(testSrc);
        };

        img.onerror = () => {
          tryNext();
        };
      };

      tryNext();

      return () => {
        mounted = false;
      };
    }, [countryName]);

    const placeholder =
      `https://via.placeholder.com/600x400?text=${encodeURIComponent(countryName || 'Loading')}`;

    return (
      <img
        src={src || placeholder}
        alt={alt || `${countryName} image`}
        className={className}
        onError={(e) => {
          const fallback = imageForCountry(countryName, 1200, 800);
          if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
        }}
        loading="lazy"
      />
    );
  };

  const handleCountrySelect = (country) => {
    if (!country?.id) return;

    // ✅ keep previous behavior: update UI immediately + keep URL in sync
    setSelectedCountry(country);

    // ✅ keep previous behavior: preserve VisaStart state (passportCountry) and push history
    navigate(
      `${location.pathname}?country=${encodeURIComponent(country.id)}`,
      { replace: false, state: location.state }
    );
  };

  const handleBackToCountries = () => {
    // ✅ keep previous behavior: go back to list, keep VisaStart state, allow browser Back/Forward
    setSelectedCountry(null);
    navigate(location.pathname, { replace: false, state: location.state });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  // sync selectedCountry with ?country= when present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const countryId = params.get("country");

    if (!countryId) {
      setSelectedCountry(null);
      return;
    }

    const match = countries.find(
      (c) => String(c.id).toLowerCase() === String(countryId).toLowerCase()
    );

    setSelectedCountry(match || null);
  }, [location.search, countries]);

  useEffect(() => {
    if (selectedCountry) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [selectedCountry]);

  const filteredCountries = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    let list = countries;
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [countries, query]);

  const handleApplyVisa = (visa) => {
    if (!selectedCountry) return;
    navigate('/visa-application', {
      state: {
        country: selectedCountry.name,
        visaType: visa.type || visa,
        flag: selectedCountry.flag || ''
      }
    });
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        /* ── Theme-Adaptive Glassmorphism ── */
        .vs-page-bg {
          background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 35%, #f5f0ff 65%, #f0f4ff 100%);
          min-height: 100vh; position: relative; overflow: hidden;
        }
        .dark .vs-page-bg {
          background: linear-gradient(135deg, #0a0e1a 0%, #0d1330 35%, #101840 65%, #0a0e1a 100%);
        }
        .vs-page-bg::before {
          content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 800px 600px at 20% 10%, rgba(59,130,246,0.06), transparent),
            radial-gradient(ellipse 600px 500px at 80% 80%, rgba(139,92,246,0.05), transparent),
            radial-gradient(ellipse 400px 400px at 50% 50%, rgba(99,102,241,0.04), transparent);
        }
        .dark .vs-page-bg::before {
          background:
            radial-gradient(ellipse 800px 600px at 20% 10%, rgba(59,130,246,0.08), transparent),
            radial-gradient(ellipse 600px 500px at 80% 80%, rgba(99,102,241,0.06), transparent),
            radial-gradient(ellipse 400px 400px at 50% 50%, rgba(139,92,246,0.04), transparent);
        }

        /* Orbs */
        .vs-orb { position: fixed; border-radius: 50%; pointer-events: none; filter: blur(80px); z-index: 0; }
        .vs-orb-1 { width: 500px; height: 500px; top: -120px; left: -100px;
          background: radial-gradient(circle, rgba(59,130,246,0.10), transparent 70%);
          animation: vs-orb-drift 12s ease-in-out infinite alternate; }
        .vs-orb-2 { width: 400px; height: 400px; bottom: -80px; right: -60px;
          background: radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%);
          animation: vs-orb-drift 15s ease-in-out infinite alternate-reverse; }
        .vs-orb-3 { width: 300px; height: 300px; top: 40%; left: 60%;
          background: radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%);
          animation: vs-orb-drift 10s ease-in-out infinite alternate; }
        .dark .vs-orb-1 { background: radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%); }
        .dark .vs-orb-2 { background: radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%); }
        .dark .vs-orb-3 { background: radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%); }
        @keyframes vs-orb-drift { 0% { transform: translate(0,0); } 100% { transform: translate(30px,-20px); } }

        /* Glass Card */
        .vs-glass-card {
          background: rgba(255,255,255,0.7); backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.8); border-radius: 1.25rem;
          overflow: hidden; cursor: pointer; position: relative;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease;
        }
        .dark .vs-glass-card {
          background: rgba(15,23,42,0.45); border-color: rgba(148,163,184,0.08); box-shadow: none;
        }
        .vs-glass-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 24px 60px rgba(59,130,246,0.10), 0 0 40px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
          border-color: rgba(59,130,246,0.25);
        }
        .dark .vs-glass-card:hover {
          box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 0 40px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06);
          border-color: rgba(59,130,246,0.2);
        }
        .vs-glass-card:active { transform: translateY(-2px) scale(0.99); }

        /* Card Hero */
        .vs-card-hero { height: 180px; width: 100%; object-fit: cover; display: block; transition: transform 0.5s ease, filter 0.5s ease; }
        .vs-glass-card:hover .vs-card-hero { transform: scale(1.08); filter: brightness(1.05); }

        /* Badges */
        .vs-cyber-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid; }
        .vs-cyber-badge--blue { background: rgba(59,130,246,0.10); color: #2563eb; border-color: rgba(59,130,246,0.20); }
        .vs-cyber-badge--green { background: rgba(34,197,94,0.10); color: #16a34a; border-color: rgba(34,197,94,0.20); }
        .vs-cyber-badge--violet { background: rgba(139,92,246,0.10); color: #7c3aed; border-color: rgba(139,92,246,0.20); }
        .dark .vs-cyber-badge--blue { color: #60a5fa; }
        .dark .vs-cyber-badge--green { color: #4ade80; }
        .dark .vs-cyber-badge--violet { color: #a78bfa; }

        /* Animations */
        @keyframes vs-card-fly-in { 0% { opacity:0; transform: translateY(40px) scale(0.95); } 100% { opacity:1; transform: translateY(0) scale(1); } }
        .vs-stagger-in { opacity: 0; animation: vs-card-fly-in 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }

        /* Command Bar */
        .vs-command-bar {
          position: relative; border-radius: 1rem;
          background: rgba(255,255,255,0.85); backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          border: 1px solid rgba(148,163,184,0.20); box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .dark .vs-command-bar {
          background: rgba(15,23,42,0.6); border-color: rgba(148,163,184,0.08); box-shadow: none;
        }
        .vs-command-bar:focus-within { border-color: rgba(59,130,246,0.4); box-shadow: 0 0 0 4px rgba(59,130,246,0.08), 0 8px 30px rgba(59,130,246,0.10); }

        /* Icon Pulse */
        @keyframes vs-icon-pulse { 0%,100% { opacity:0.5; transform:scale(1); } 50% { opacity:1; transform:scale(1.15); } }
        .vs-search-icon-pulse { animation: vs-icon-pulse 2.5s ease-in-out infinite; }

        /* Apply Button */
        .vs-apply-btn { background: linear-gradient(135deg,#3b82f6,#7c3aed); border:none; color:#fff; font-weight:700; border-radius:0.875rem; padding:0.875rem 1.5rem; cursor:pointer; width:100%; font-size:0.95rem; letter-spacing:0.02em; transition: transform 0.2s ease, box-shadow 0.3s ease, filter 0.3s ease; }
        .vs-apply-btn:hover { transform:translateY(-2px); box-shadow:0 12px 24px rgba(59,130,246,0.25); filter:brightness(1.08); }
        .vs-apply-btn:active { transform:translateY(1px); }

        /* Detail Glass */
        .vs-detail-glass {
          background: rgba(255,255,255,0.75); backdrop-filter: blur(20px) saturate(1.3);
          -webkit-backdrop-filter: blur(20px) saturate(1.3);
          border: 1px solid rgba(255,255,255,0.8); border-radius: 1.25rem; overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.3s ease;
        }
        .dark .vs-detail-glass { background: rgba(15,23,42,0.5); border-color: rgba(148,163,184,0.08); box-shadow: none; }
        .vs-detail-glass:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(59,130,246,0.10); border-color: rgba(59,130,246,0.20); }
        .dark .vs-detail-glass:hover { box-shadow: 0 20px 50px rgba(0,0,0,0.3), 0 0 30px rgba(59,130,246,0.06); border-color: rgba(59,130,246,0.18); }

        /* Hero Overlay */
        .vs-hero-overlay { position: absolute; left:0; right:0; bottom:0; height:60%; background: linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.75) 100%); pointer-events: none; }

        /* Header */
        .vs-header {
          background: rgba(255,255,255,0.85); backdrop-filter: blur(16px) saturate(1.5);
          -webkit-backdrop-filter: blur(16px) saturate(1.5);
          border-bottom: 1px solid rgba(148,163,184,0.15);
        }
        .dark .vs-header { background: rgba(10,14,26,0.7); border-bottom-color: rgba(148,163,184,0.06); }
      `}</style>

      <div className="vs-page-bg">
        {/* Background orbs */}
        <div className="vs-orb vs-orb-1" />
        <div className="vs-orb vs-orb-2" />
        <div className="vs-orb vs-orb-3" />

        {/* ── Header ── */}
        <header className="vs-header sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative h-16 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-extrabold tracking-tight leading-none">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
                    SlotPilot
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                  Global Education & Visa Services
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {!selectedCountry ? (
            <div>
              {/* ── Hero Section ── */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {passportCountry
                      ? `Searching visas in ${passportCountry}`
                      : "Explore Visas Worldwide"}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 leading-[1.1] tracking-tight">
                  Discover Your{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 dark:from-blue-400 dark:via-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
                    Destination
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                  Browse visa-eligible countries, compare processing times, and start your application — all in one place.
                </p>
              </div>

              {/* ── Floating Command Bar ── */}
              <div className="max-w-3xl mx-auto mb-12">
                <div className="vs-command-bar flex items-center h-14 sm:h-16 px-4 sm:px-6">
                  <Search className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 vs-search-icon-pulse" />
                  <Input
                    placeholder={passportCountry ? `Search destinations from ${passportCountry}…` : "Where to next?"}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-base sm:text-lg font-medium border-0
                               focus-visible:ring-0 focus-visible:ring-offset-0
                               placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white px-4 h-full"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <span className="text-lg text-slate-500 font-light leading-none">×</span>
                    </button>
                  )}
                  <div className="hidden sm:flex items-center gap-2 ml-3 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      ⌘ Search
                    </span>
                    <Plane className="w-3.5 h-3.5 text-blue-500 rotate-45" />
                  </div>
                </div>
              </div>

              {/* ── States ── */}
              {!isPassportCheckLoading && passportCountry && passportMatch === false && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                    No visas available for{" "}
                    <span className="text-slate-900 dark:text-white font-semibold">{passportCountry}</span>
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    Try selecting a different passport country
                  </p>
                </div>
              )}

              {isPassportCheckLoading && (
                <div className="text-center py-16">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <p className="text-slate-500 text-sm font-medium">Loading visa destinations…</p>
                </div>
              )}

              {/* ── Country Cards Grid ── */}
              {!isPassportCheckLoading && passportMatch !== false && (
                <>
                  {/* Results count */}
                  {filteredCountries.length > 0 && (
                    <div className="flex items-center justify-between mb-6 px-1">
                      <span className="text-sm text-slate-500 font-medium">
                        {filteredCountries.length} destination{filteredCountries.length !== 1 ? "s" : ""} available
                      </span>
                      {query && (
                        <span className="text-xs text-slate-600">
                          Filtered by "{query}"
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredCountries.map((country, index) => (
                      <div
                        key={country.id}
                        className="vs-stagger-in"
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        <div
                          className="vs-glass-card"
                          onClick={() => handleCountrySelect(country)}
                        >
                          {/* Hero Image */}
                          <div className="relative overflow-hidden">
                            <CountryImage
                              countryName={country.name}
                              alt={`${country.name}`}
                              className="vs-card-hero"
                            />
                            <div className="vs-hero-overlay" />

                            {/* Flag + Name overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-2xl leading-none">{country.flag}</span>
                                  <span className="text-white font-bold text-lg tracking-tight">{country.name}</span>
                                </div>
                                <div className="vs-cyber-badge vs-cyber-badge--blue">
                                  {country.region}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5">
                            {/* Meta Row */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-1.5 text-sm">
                                <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                                <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">{country.processingTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm">
                                <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                                <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">{country.successRate}</span>
                              </div>
                            </div>

                            {/* Visa Type Badges */}
                            <div className="flex flex-wrap gap-2 mb-5">
                              {country.visaTypes.slice(0, 3).map((v, i) => (
                                <span
                                  key={i}
                                  className={`vs-cyber-badge ${
                                    i === 0 ? "vs-cyber-badge--blue" :
                                    i === 1 ? "vs-cyber-badge--violet" :
                                    "vs-cyber-badge--green"
                                  }`}
                                >
                                  {v.type.split(" ")[0]}
                                </span>
                              ))}
                            </div>

                            {/* CTA */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCountrySelect(country);
                              }}
                              className="w-full py-3 rounded-xl text-sm font-bold
                                         bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-600/20 dark:to-violet-600/20
                                         border border-blue-200 dark:border-blue-500/15 text-blue-700 dark:text-blue-300
                                         hover:from-blue-100 hover:to-violet-100 dark:hover:from-blue-600/30 dark:hover:to-violet-600/30
                                         hover:border-blue-300 dark:hover:border-blue-500/30 hover:text-blue-800 dark:hover:text-blue-200
                                         transition-all duration-300 tracking-wide uppercase"
                              style={{ letterSpacing: "0.08em" }}
                            >
                              Explore Visas →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ── DETAIL VIEW ── */
            <div>
              {/* Back */}
              <button
                onClick={handleBackToCountries}
                className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors font-medium min-h-[44px]"
              >
                <span className="text-lg">←</span> Back to destinations
              </button>

              {/* Hero */}
              <div className="text-center mb-12">
                <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden mb-8 border border-white/50 dark:border-slate-800/50 shadow-lg">
                  <CountryImage
                    countryName={selectedCountry.name}
                    alt={selectedCountry.name}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 dark:from-[#0a0e1a] via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <span className="text-4xl">{selectedCountry.flag}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                      {selectedCountry.name}{" "}
                      <span className="bg-gradient-to-r from-blue-300 to-violet-300 bg-clip-text text-transparent">
                        Visa Services
                      </span>
                    </h1>
                  </div>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                  {selectedCountry.description}
                </p>

                <div className="flex items-center justify-center gap-8 mt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                      Processing: <span className="text-slate-900 dark:text-white font-semibold">{selectedCountry.processingTime}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                      Success: <span className="text-slate-900 dark:text-white font-semibold">{selectedCountry.successRate}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Visa Type Cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {selectedCountry.visaTypes.map((visa, index) => {
                  const IconComponent = visa.icon;
                  return (
                    <div
                      key={index}
                      className="vs-stagger-in"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <div className="vs-detail-glass p-6 sm:p-8">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-6">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-600/20 dark:to-violet-600/20 border border-blue-100 dark:border-blue-500/10">
                            <IconComponent className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                              {visa.type}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                              {visa.description}
                            </p>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 mb-6">
                          <div className="text-center">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Duration</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{visa.duration}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Fee</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{visa.fee}</p>
                          </div>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-3 mb-6">
                          {[
                            "Complete document guidance & review",
                            "Application tracking & status updates",
                            "Interview preparation (if required)",
                            "24/7 expert consultation support",
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                            </div>
                          ))}
                        </div>

                        {/* Apply Button */}
                        <button
                          onClick={() => handleApplyVisa(visa)}
                          className="vs-apply-btn"
                        >
                          Apply for {visa.type}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VisaServices;