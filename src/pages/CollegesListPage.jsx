import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { MapPin, ExternalLink, GraduationCap, ArrowRight } from "lucide-react";

// ── Country-name aliases ───────────────────────────────────────────────
// Maps common variations to the canonical name stored in Supabase.
const COUNTRY_ALIASES = {
  "usa": "United States",
  "us": "United States",
  "united states of america": "United States",
  "united states": "United States",
  "uk": "United Kingdom",
  "great britain": "United Kingdom",
  "united kingdom": "United Kingdom",
};

/** Return the canonical country name (case-insensitive alias lookup). */
const resolveCountry = (raw) => {
  if (!raw) return "United States";
  const key = String(raw).trim().toLowerCase();
  return COUNTRY_ALIASES[key] || String(raw).trim();
};

// ── Default placeholder (inline SVG data-URI so it never 404s) ─────────
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' fill='none'%3E%3Crect width='400' height='200' rx='12' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui,sans-serif' font-size='16' fill='%2394a3b8'%3ECollege Image%3C/text%3E%3C/svg%3E";

const getCollegeImageSources = (collegeName) => {
  if (!collegeName) return [PLACEHOLDER_IMAGE];
  const raw = String(collegeName).trim();
  const enc = encodeURIComponent(raw);
  return [
    `/images/colleges/${enc}.jpg`,
    `/images/colleges/${enc}.jpeg`,
    `/images/colleges/${enc}.png`,
    `/images/colleges/${enc}.webp`,
    `/images/colleges/${raw}.jpg`,
    PLACEHOLDER_IMAGE,
  ];
};

// Module-level so React never remounts it on parent re-renders
const CollegeImage = ({ collegeName, className = "" }) => {
  const candidates = useMemo(() => getCollegeImageSources(collegeName), [collegeName]);
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [collegeName]);
  const src = candidates[Math.min(idx, candidates.length - 1)];
  return (
    <img
      src={src}
      alt={collegeName}
      className={className}
      decoding="async"
      onError={() => setIdx(i => Math.min(i + 1, candidates.length - 1))}
    />
  );
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const CollegesListPage = () => {
  const query = useQuery();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Resolve country from URL → nav-state → default, with alias normalization
  const country = resolveCountry(
    query.get("country") ||
    location.state?.country ||
    "United States"
  );

  const [search, setSearch] = useState("");
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch colleges — try canonical name first, then common alternatives
  useEffect(() => {
    let mounted = true;

    const fetchColleges = async () => {
      setLoading(true);

      const selected = String(country || "").trim();
      if (!selected) {
        if (mounted) {
          setColleges([]);
          setLoading(false);
        }
        return;
      }

      // Build a list of names to try (canonical + known alternatives)
      const namesToTry = [selected];
      if (selected === "United States") {
        namesToTry.push("United States of America", "USA");
      } else if (selected === "United Kingdom") {
        namesToTry.push("UK", "Great Britain");
      }

      let results = [];
      for (const name of namesToTry) {
        const { data, error } = await supabase
          .from("CollegesList")
          .select("*")
          .ilike("Country", name);

        if (error) {
          console.error("Failed to load college data.");
          continue;
        }
        if (data && data.length > 0) {
          results = data;
          break; // found matching rows, stop trying alternatives
        }
      }

      if (!mounted) return;

      setColleges(Array.isArray(results) ? results : []);
      setLoading(false);
    };

    fetchColleges();

    return () => {
      mounted = false;
    };
  }, [country]);

  const filteredColleges = colleges.filter(
    (college) =>
      (college.NameoftheCollege &&
        college.NameoftheCollege.toLowerCase().includes(search.toLowerCase())) ||
      (college.CollegeState &&
        college.CollegeState.toLowerCase().includes(search.toLowerCase())) ||
      (college.CollegeCity &&
        college.CollegeCity.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center py-8 px-3 relative overflow-hidden transition-colors duration-300">
      {/* Soft animated background circles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 dark:bg-blue-900 rounded-full opacity-40 dark:opacity-20 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-sky-300 dark:bg-indigo-900 rounded-full opacity-30 dark:opacity-20 blur-3xl animate-float-slower" />
      </div>

      <div className="w-full max-w-7xl mb-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-full flex flex-col items-center justify-center py-7 rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 dark:from-indigo-900 dark:via-blue-800 dark:to-indigo-950 shadow-2xl animate-fade-in-down">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 text-center tracking-tight drop-shadow-lg">
              🎓 Explore Colleges in {country}
            </h1>
            <p className="text-base sm:text-lg text-blue-100 dark:text-slate-300 text-center max-w-xl font-medium drop-shadow">
              Discover top colleges, search by name, city, or state, and find your best fit for higher education in{" "}
              {country}.
            </p>
          </div>
        </div>

        {/* Search box */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="w-full sm:w-2/3">
            <Input
              type="text"
              placeholder="🔍 Search colleges by name, state, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 px-6 py-4 text-lg rounded-2xl border border-blue-300 dark:border-slate-700 shadow-md focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 bg-white dark:bg-slate-800 dark:text-white placeholder:text-blue-400 dark:placeholder:text-slate-500 font-semibold"
            />
          </div>
        </div>

        {/* College cards */}
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading colleges…</p>
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="text-center text-neutral-600 dark:text-slate-400 py-10 font-medium animate-fade-in">
            No colleges found. Try a different search!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
            {filteredColleges.map((college, idx) => {
              const collegeName = college.NameoftheCollege;
              const hasWebsite = !!college.CollegeWebsite;
              const websiteHref = hasWebsite
                ? college.CollegeWebsite.startsWith("https://")
                  ? college.CollegeWebsite
                  : `https://${college.CollegeWebsite.replace(/^https?:\/\//i, "")}`
                : null;
              const location2 = [college.CollegeCity, college.CollegeState].filter(Boolean).join(", ");

              return (
                <div
                  key={idx}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 cursor-default"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* ── Image area ── */}
                  <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    <CollegeImage
                      collegeName={collegeName}
                      className="absolute inset-0 w-full h-full object-contain bg-white dark:bg-slate-800 transition-transform duration-600 group-hover:scale-105"
                    />
                    {/* bottom fade */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />

                    {/* country chip — top right */}
                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {country}
                    </div>
                  </div>

                  {/* ── Content area ── */}
                  <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-2">
                    {/* College name */}
                    <h3 className="font-black text-[0.95rem] leading-snug text-slate-900 dark:text-white line-clamp-2">
                      {collegeName}
                    </h3>

                    {/* Location */}
                    {location2 && (
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{location2}</span>
                      </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Action row */}
                    <div className="flex items-center gap-2 mt-2">
                      {websiteHref && (
                        <a
                          href={websiteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors truncate px-3"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          Website
                        </a>
                      )}
                      <button
                        onClick={() =>
                          navigate("/StudentLoginRegisterPage", {
                            state: {
                              country,
                              college: collegeName,
                              redirectTo: location.pathname + location.search,
                            },
                          })
                        }
                        className="flex items-center justify-center gap-1.5 flex-1 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all duration-300 group-hover:shadow-blue-500/40 px-3"
                      >
                        Apply
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>

                  {/* Shine sweep */}
                  <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
                    <div className="absolute top-0 left-[-65%] h-full w-[35%] bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:left-[130%] transition-all duration-700 ease-out" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Page-level animation styles */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes floatSlow {
            0% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0); }
          }
          @keyframes floatSlower {
            0% { transform: translateY(0); }
            50% { transform: translateY(20px); }
            100% { transform: translateY(0); }
          }
          .animate-fade-in { animation: fadeIn 0.8s ease-out; }
          .animate-fade-in-down { animation: fadeInDown 0.9s ease-out; }
          .animate-fade-in-up { animation: fadeInUp 0.9s ease-out; }
          .animate-float-slow { animation: floatSlow 9s ease-in-out infinite; }
          .animate-float-slower { animation: floatSlower 14s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
};

export default CollegesListPage;