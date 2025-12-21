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

  // from VisaStart
  const { passportCountry } = location.state || {};

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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <style>{`
        .hero-bg {
          background: radial-gradient(ellipse at 20% 10%, rgba(59,130,246,0.06), transparent 20%),
                      radial-gradient(ellipse at 80% 90%, rgba(99,102,241,0.04), transparent 20%);
        }
        .glass {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 8px 30px rgba(2,6,23,0.06);
        }
        .country-hero {
          height: 160px;
          object-fit: cover;
          width: 100%;
          display: block;
        }
        .card-title-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 10px 14px;
          background: linear-gradient(180deg, transparent, rgba(0,0,0,0.45));
          color: white;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }
        .chip {
          padding:6px 10px;
          border-radius:999px;
          background: rgba(15,23,42,0.04);
          cursor:pointer;
          transition:transform .12s ease;
        }
        .chip:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(2,6,23,0.06);
        }
        .country-card-bounce {
          transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s;
        }
        .country-card-bounce:hover {
          transform: scale(1.04) translateY(-6px);
          box-shadow: 0 16px 32px rgba(2,6,23,0.10);
        }
        .country-card-bounce:active {
          transform: scale(0.98) translateY(2px);
        }
      `}</style>

      <div className="hero-bg">
        {/* Header */}
        <header className="relative z-10 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-md border-b border-primary/20 shadow-elegant">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="w-32" />
              <div className="text-center flex-1">
                <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-hero bg-clip-text text-transparent tracking-tight">
                  SlotPilot Visa Services
                </h1>
              </div>
              <div className="w-32" />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedCountry ? (
            <div className="animate-fade-in">
              {/* Country Selection */}
              <div className="mb-6">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Discover Your Destination
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
                    Explore countries and their visa options — quick search, filter by region and friendly previews.
                  </p>

                  <div className="mt-4 flex justify-center">
                    <div className="w-full sm:w-11/12 md:w-4/5 lg:w-3/5 xl:w-2/3">
                      <div className="relative">
                        <style>{`
                          .search-glass {
                            background: linear-gradient(135deg, rgba(255,255,255,0.92), rgba(250,250,255,0.85));
                            box-shadow: 0 8px 30px rgba(12, 22, 49, 0.06), inset 0 1px 0 rgba(255,255,255,0.6);
                            border: 1px solid rgba(15,23,42,0.06);
                          }
                          .search-glass:focus-within {
                            box-shadow: 0 14px 45px rgba(59,130,246,0.09);
                            transform: translateY(-1px);
                          }
                          .search-input::placeholder {
                            color: rgba(15,23,42,0.45);
                            font-weight: 500;
                          }
                          .search-clear {
                            opacity: 0.85;
                            transition: opacity .18s ease;
                          }
                          .search-clear:hover { opacity: 1; }
                        `}</style>

                        <div className="search-glass rounded-full px-5 py-3 flex items-center gap-3 glass">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                            <Search className="h-6 w-6 text-primary" aria-hidden="true" />
                          </div>

                          <Input
                            placeholder="Search countries..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="search-input bg-transparent pl-2 text-lg w-full border-0 focus:ring-0"
                            aria-label="Search countries"
                          />

                          {query && (
                            <button
                              type="button"
                              onClick={() => setQuery('')}
                              aria-label="Clear search"
                              className="search-clear flex items-center justify-center w-9 h-9 rounded-full bg-white/80 border border-transparent hover:bg-white"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ NEW: mismatch message (no PassportCountry match) */}
              {!isPassportCheckLoading && passportCountry && passportMatch === false && (
                <div className="text-center text-muted-foreground py-10">
                  No visas available at the moment for{" "}
                  <span className="font-semibold">{passportCountry}</span>.
                </div>
              )}

              {/* optional: loading state while checking */}
              {isPassportCheckLoading && (
                <div className="text-center text-muted-foreground py-10">
                  Loading visa destinations...
                </div>
              )}

              {/* ✅ keep existing cards logic unchanged */}
              {!isPassportCheckLoading && passportMatch !== false && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCountries.map((country, index) => (
                    <Card
                      key={country.id}
                      className="country-card-bounce group border-2 bg-gradient-to-br from-background to-primary/5 transform-gpu rounded-2xl overflow-hidden"
                      style={{ animationDelay: `${index * 40}ms` }}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <CardHeader className="relative p-0">
                        <CountryImage
                          countryName={country.name}
                          alt={`${country.name} hero`}
                          className="country-hero rounded-t-2xl"
                        />
                        <div className="card-title-overlay">
                          <div className="text-sm font-semibold">{country.name}</div>
                          <Badge variant="secondary" className="text-xs">
                            {country.popularity || country.region}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardTitle className="text-xl font-bold mb-2">
                          {country.name}
                        </CardTitle>
                        <CardDescription className="text-sm mb-3 text-muted-foreground">
                          {country.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{country.processingTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-accent" />
                            <span>{country.successRate}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {country.visaTypes.slice(0, 3).map((v, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {v.type.split(' ')[0]}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCountrySelect(country);
                          }}
                          className="w-full rounded-b-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground"
                        >
                          Explore Visas
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="text-center mb-8">
                  <CountryImage
                    countryName={selectedCountry.name}
                    alt={`${selectedCountry.name} hero`}
                    className="w-full max-w-3xl mx-auto h-72 sm:h-96 object-cover rounded-xl shadow-lg mb-6"
                  />
                  <h2 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {selectedCountry.name} Visa Services
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
                    {selectedCountry.description}
                  </p>
                  <div className="flex items-center justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="font-medium">
                        Processing: {selectedCountry.processingTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-accent fill-accent" />
                      <span className="font-medium">
                        Success Rate: {selectedCountry.successRate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedCountry.visaTypes.map((visa, index) => {
                  const IconComponent = visa.icon;
                  return (
                    <Card
                      key={index}
                      className="hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/30 bg-gradient-to-br from-background to-primary/5 hover:scale-105 animate-fade-in hover-scale transform-gpu rounded-2xl overflow-hidden"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                            <IconComponent className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              {visa.type}
                            </CardTitle>
                            <CardDescription className="text-base leading-relaxed">
                              {visa.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">
                                Duration of Stay
                              </p>
                              <p className="font-semibold text-sm">
                                {visa.duration}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">
                                Fee
                              </p>
                              <p className="font-semibold text-sm">
                                {visa.fee}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>Complete document guidance & review</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>Application tracking & status updates</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>Interview preparation (if required)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>24/7 expert consultation support</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleApplyVisa(visa)}
                            className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 h-auto hover:shadow-lg transition-all duration-300 hover-scale transform-gpu animate-fade-in rounded-b-2xl"
                            style={{ animationDelay: `${index * 200}ms` }}
                            size="lg"
                          >
                            Apply for {visa.type}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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