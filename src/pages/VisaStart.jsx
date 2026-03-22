import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Globe2,
  Sparkles,
  ArrowRight,
  User,
  Users,
  Search,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import useGeoLocation from "@/hooks/useGeoLocation";

// ── Expanded country list (25+ popular passport countries) ──────────────────
const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "Ireland", "United Arab Emirates", "France", "Italy",
  "Japan", "Singapore", "New Zealand", "South Korea", "China",
  "Brazil", "Mexico", "South Africa", "Saudi Arabia", "Netherlands",
  "Spain", "Portugal", "Thailand", "Philippines", "Nigeria",
  "Malaysia", "Indonesia", "Turkey", "Russia", "Bangladesh",
];

const COUNTRY_EMOJI = {
  "India": "🇮🇳", "United States": "🇺🇸", "United Kingdom": "🇬🇧",
  "Canada": "🇨🇦", "Australia": "🇦🇺", "Germany": "🇩🇪", "Ireland": "🇮🇪",
  "United Arab Emirates": "🇦🇪", "France": "🇫🇷", "Italy": "🇮🇹",
  "Japan": "🇯🇵", "Singapore": "🇸🇬", "New Zealand": "🇳🇿",
  "South Korea": "🇰🇷", "China": "🇨🇳", "Brazil": "🇧🇷",
  "Mexico": "🇲🇽", "South Africa": "🇿🇦", "Saudi Arabia": "🇸🇦",
  "Netherlands": "🇳🇱", "Spain": "🇪🇸", "Portugal": "🇵🇹",
  "Thailand": "🇹🇭", "Philippines": "🇵🇭", "Nigeria": "🇳🇬",
  "Malaysia": "🇲🇾", "Indonesia": "🇮🇩", "Turkey": "🇹🇷",
  "Russia": "🇷🇺", "Bangladesh": "🇧🇩",
};

const VISA_CONTEXT_KEY = "slotpilot_visa_context";

// ── Phase enum ──────────────────────────────────────────────────────────────
const PHASE = {
  DETECTING: "detecting",
  INTENT: "intent",
  PICK_COUNTRY: "pick_country",
  NAVIGATING: "navigating",
};

// ── Animation variants ──────────────────────────────────────────────────────
const fadeSlide = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardPop = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const VisaStart = () => {
  const navigate = useNavigate();
  const geo = useGeoLocation();
  const searchRef = useRef(null);

  const [phase, setPhase] = useState(PHASE.DETECTING);
  const [chosenCountry, setChosenCountry] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Transition from DETECTING → INTENT once geo resolves
  useEffect(() => {
    if (phase !== PHASE.DETECTING) return;
    if (!geo.loading) {
      if (geo.country) {
        // Small delay so the detecting animation plays
        const t = setTimeout(() => setPhase(PHASE.INTENT), 800);
        return () => clearTimeout(t);
      } else {
        // Geo failed — skip straight to country picker
        const t = setTimeout(() => setPhase(PHASE.PICK_COUNTRY), 600);
        return () => clearTimeout(t);
      }
    }
  }, [geo.loading, geo.country, phase]);

  // Focus search input when entering picker phase
  useEffect(() => {
    if (phase === PHASE.PICK_COUNTRY) {
      setTimeout(() => searchRef.current?.focus(), 400);
    }
  }, [phase]);

  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.localeCompare(b)),
    []
  );

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedCountries;
    return sortedCountries.filter((c) => c.toLowerCase().includes(q));
  }, [searchQuery, sortedCountries]);

  // ── Navigation helper ─────────────────────────────────────────────────────
  const goToVisaServices = (country, mode = "self") => {
    if (!country || isLoading) return;
    setIsLoading(true);
    setChosenCountry(country);
    setPhase(PHASE.NAVIGATING);

    // Store context in sessionStorage
    sessionStorage.setItem(
      VISA_CONTEXT_KEY,
      JSON.stringify({
        contextCountry: country,
        countryCode: geo.countryCode || null,
        mode,
      })
    );

    setTimeout(() => {
      navigate("/visa-services", {
        state: { passportCountry: country, fromVisaStart: true },
      });
    }, 1100);
  };

  // ── Path: the flight animation path ───────────────────────────────────────
  const flightPath =
    "M -50 250 Q 50 150 150 250 T 350 250 C 450 250 450 50 350 50 C 250 50 250 250 550 250 L 1200 100";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12 relative overflow-hidden transition-colors duration-500">
      {/* ── Inline Styles ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes vs-fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes vs-softPop {
          0% { transform: translateY(10px) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes vs-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes vs-float2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(16px); }
        }
        @keyframes vs-dots {
          0% { content: ""; }
          33% { content: "."; }
          66% { content: ".."; }
          100% { content: "..."; }
        }
        @keyframes vs-pulse-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.6; }
        }
        @keyframes vs-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .vs-enter { animation: vs-softPop 560ms cubic-bezier(.2,.9,.2,1) both; }
        .vs-bg-orb {
          position: absolute; width: 520px; height: 520px; border-radius: 9999px;
          filter: blur(34px); opacity: 0.35; pointer-events: none;
        }
        .vs-bg-orb.one {
          left: -140px; top: -180px;
          background: radial-gradient(circle at 30% 30%, rgba(56,189,248,0.65), rgba(99,102,241,0.18), transparent 60%);
          animation: vs-float 7.2s ease-in-out infinite;
        }
        .vs-bg-orb.two {
          right: -180px; bottom: -200px;
          background: radial-gradient(circle at 30% 30%, rgba(34,197,94,0.22), rgba(56,189,248,0.38), transparent 62%);
          animation: vs-float2 8.4s ease-in-out infinite;
        }
        .vs-ellipsis::after {
          content: ""; display: inline-block; width: 1.2em; text-align: left;
          animation: vs-dots 1s steps(3, end) infinite;
        }
        .vs-spinner {
          width: 64px; height: 64px; border-radius: 9999px;
          border: 6px solid rgba(56,189,248,0.22);
          border-top-color: rgba(56,189,248,1);
          animation: spin 900ms linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .intent-card {
          position: relative;
          cursor: pointer;
          border-radius: 1.25rem;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s;
          overflow: hidden;
        }
        .intent-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, rgba(56,189,248,0.5), rgba(99,102,241,0.4), rgba(34,197,94,0.3));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.6;
          transition: opacity 0.3s;
        }
        .intent-card:hover::before { opacity: 1; }
        .intent-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 20px 40px rgba(2,6,23,0.12);
        }
        .intent-card:active { transform: scale(0.97); }

        .country-pick-card {
          cursor: pointer;
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          min-height: 44px;
          transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s, border-color 0.18s;
        }
        .country-pick-card:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 10px 24px rgba(2,6,23,0.08);
        }
        .country-pick-card:active { transform: scale(0.97); }
      `}</style>

      {/* ── Background Orbs ───────────────────────────────────────────── */}
      <div className="vs-bg-orb one" />
      <div className="vs-bg-orb two" />

      {/* ── Flying Paper Plane ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 500"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          className="opacity-40 dark:opacity-20"
        >
          <motion.path
            d={flightPath}
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="text-slate-400 dark:text-slate-600"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
          <motion.g
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            style={{ offsetPath: `path('${flightPath}')`, offsetRotate: "auto 0deg" }}
          >
            <path
              d="M15,0 L-10,-8 L-5,0 L-10,8 Z"
              fill="currentColor"
              className="text-sky-500 dark:text-sky-400"
            />
          </motion.g>
        </svg>
      </div>

      {/* ── Navigating Overlay ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 border border-white/60 dark:border-slate-800 backdrop-blur-md transition-colors duration-500">
            <div className="vs-spinner" />
            <div className="text-center">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Preparing visa options for{" "}
                <strong className="text-slate-900 dark:text-white">
                  {COUNTRY_EMOJI[chosenCountry] ? `${COUNTRY_EMOJI[chosenCountry]} ` : ""}
                  {chosenCountry}
                </strong>
                <span className="vs-ellipsis" />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Card ─────────────────────────────────────────────────── */}
      <Card className="w-full max-w-2xl overflow-visible relative rounded-3xl z-10 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md shadow-2xl transition-all duration-500 vs-enter">
        <AnimatePresence mode="wait">
          {/* ─── PHASE: DETECTING ─────────────────────────────────────── */}
          {phase === PHASE.DETECTING && (
            <motion.div key="detecting" {...fadeSlide} className="p-8 sm:p-10">
              <div className="flex flex-col items-center gap-6">
                {/* Pulsing globe */}
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full bg-sky-400/20 dark:bg-sky-500/15"
                    style={{ animation: "vs-pulse-ring 2s ease-in-out infinite" }}
                  />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/60 dark:to-indigo-900/40 flex items-center justify-center shadow-lg">
                    <Globe2 className="w-10 h-10 text-sky-600 dark:text-sky-400 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                    Detecting your location
                    <span className="vs-ellipsis" />
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    We'll personalize your visa experience
                  </p>
                </div>
                {/* Shimmer bar */}
                <div
                  className="w-48 h-2 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)",
                    backgroundSize: "200% 100%",
                    animation: "vs-shimmer 1.5s linear infinite",
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* ─── PHASE: INTENT ────────────────────────────────────────── */}
          {phase === PHASE.INTENT && (
            <motion.div key="intent" {...fadeSlide}>
              <CardHeader className="text-center pb-2 pt-8">
                <div className="mx-auto mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-100 dark:border-sky-900/50 text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 transition-colors duration-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium">Location detected</span>
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  We see you're in{" "}
                  <span className="bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {geo.country}
                  </span>{" "}
                  {COUNTRY_EMOJI[geo.country] || "🌍"}
                </CardTitle>
                <CardDescription className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                  Are you looking for visas for yourself, or assisting someone in another country?
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-8 pt-4">
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {/* ── For Myself ── */}
                  <motion.div variants={cardPop}>
                    <div
                      className="intent-card bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
                      onClick={() => goToVisaServices(geo.country, "self")}
                    >
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center mb-4 shadow-lg shadow-sky-500/20">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">
                        For Myself
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Show visas from{" "}
                        <strong className="text-slate-700 dark:text-slate-200">{geo.country}</strong>
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 dark:text-sky-400">
                        Continue <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>

                  {/* ── For Someone Else ── */}
                  <motion.div variants={cardPop}>
                    <div
                      className="intent-card bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
                      onClick={() => setPhase(PHASE.PICK_COUNTRY)}
                    >
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">
                        For Someone Else
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Select the applicant's country
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Choose country <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </motion.div>
          )}

          {/* ─── PHASE: PICK COUNTRY ──────────────────────────────────── */}
          {phase === PHASE.PICK_COUNTRY && (
            <motion.div key="pick" {...fadeSlide}>
              <CardHeader className="pb-3 pt-8">
                <div className="flex items-center gap-2 mb-2">
                  {geo.country && (
                    <button
                      onClick={() => setPhase(PHASE.INTENT)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-500" />
                    </button>
                  )}
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 transition-colors duration-500">
                      <Globe2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Select applicant's location</span>
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  Where is the applicant located?
                </CardTitle>
                <CardDescription className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                  Choose the country of the person applying for the visa.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-8">
                {/* Search */}
                <div className="relative mb-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    ref={searchRef}
                    placeholder="Search countries…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-sky-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <span className="text-lg text-slate-400 font-light leading-none">×</span>
                    </button>
                  )}
                </div>

                {/* Country Grid */}
                <div className="max-h-[340px] overflow-y-auto pr-1 -mr-1 space-y-0">
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                  >
                    {filteredCountries.map((c) => (
                      <motion.div key={c} variants={cardPop}>
                        <div
                          className="country-pick-card flex items-center gap-2 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600"
                          onClick={() => goToVisaServices(c, "proxy")}
                        >
                          <span className="text-xl leading-none">
                            {COUNTRY_EMOJI[c] || "🌍"}
                          </span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                            {c}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {filteredCountries.length === 0 && (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                      <Globe2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No countries match "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default VisaStart;