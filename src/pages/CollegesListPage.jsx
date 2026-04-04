import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  // Always return an array
  if (!collegeName) return [PLACEHOLDER_IMAGE];

  const raw = String(collegeName).trim();
  const enc = encodeURIComponent(raw);

  return [
    `/images/colleges/${enc}.jpg`,
    `/images/colleges/${enc}.jpeg`,
    `/images/colleges/${enc}.png`,
    `/images/colleges/${enc}.webp`,
    `/images/colleges/${raw}.jpg`, // browser will encode spaces
    PLACEHOLDER_IMAGE,
  ];
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
          console.error("CollegesList fetch error:", error);
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
          <div className="text-center text-neutral-600 dark:text-slate-400 py-10 font-medium animate-pulse">
            Loading colleges...
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="text-center text-neutral-600 dark:text-slate-400 py-10 font-medium animate-fade-in">
            No colleges found. Try a different search!
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 animate-fade-in-up">
            {filteredColleges.map((college, idx) => {
              const collegeName = college.NameoftheCollege;
              const imageSources = getCollegeImageSources(collegeName);

              return (
<Card
  key={idx}
  className="w-full h-full shadow-md rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-slate-900 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 border border-slate-100 dark:border-slate-800"
>
  {/* Logo Container */}
  <div className="w-full h-52 sm:h-48 bg-white dark:bg-white flex items-center justify-center overflow-hidden">
    <img
      src={imageSources[0]}
      alt={collegeName}
      className="w-full h-full object-contain"
      onError={(e) => {
        const current = e.target.src;
        const idx = imageSources.findIndex((src) => current.endsWith(src));
        const nextIdx = idx + 1;
        if (nextIdx < imageSources.length) {
          e.target.src = imageSources[nextIdx];
        } else {
          e.target.src = PLACEHOLDER_IMAGE;
        }
      }}
    />
  </div>

  {/* Thin Separation Line and Content Area */}
  {/* 'border-t border-slate-100' creates that clean divider you mentioned */}
  <CardContent className="py-5 px-4 flex-1 flex flex-col justify-between border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
    <div>
      <div className="font-bold text-lg mb-1 text-slate-900 dark:text-slate-100 line-clamp-2">
        {collegeName}
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {college.CollegeState && <span>{college.CollegeState}</span>}
        {college.CollegeCity && (
          <span>{college.CollegeState ? ", " : ""}{college.CollegeCity}</span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {college.CollegeWebsite && (
            <a
              href={
                college.CollegeWebsite.startsWith("http")
                  ? college.CollegeWebsite
                  : `https://${college.CollegeWebsite}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-bold uppercase tracking-wider truncate block"
              title={college.CollegeWebsite}
            >
              Visit Website
            </a>
          )}
        </div>
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
          className="bg-blue-600 dark:bg-blue-700 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm min-h-[44px] flex items-center justify-center"
        >
          Apply Now
        </button>
      </div>
    </div>

    {/* Footer Tag */}
    <div className="flex justify-end mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
      <span className="text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest">
        {country}
      </span>
    </div>
  </CardContent>
</Card>
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