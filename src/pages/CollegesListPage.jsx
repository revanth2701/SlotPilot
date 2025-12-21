import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=College+Image";

const getCollegeImageSources = (collegeName) => {
  // ✅ fix: always return an array
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

  // ✅ take country from URL first, fallback to navigation state, then default
  const country =
    query.get("country") ||
    location.state?.country ||
    "United States of America";

  const [search, setSearch] = useState("");
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch colleges only if Country matches selected country
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

      const { data, error } = await supabase
        .from("CollegesList")
        .select("*")
        // ✅ case-insensitive exact match (no wildcards)
        .ilike("Country", selected);

      if (!mounted) return;

      if (error) {
        console.error("CollegesList fetch error:", error);
        setColleges([]);
        setLoading(false);
        return;
      }

      // ✅ if no matching rows, show none (and your UI can show a "no colleges" message)
      setColleges(Array.isArray(data) ? data : []);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 flex flex-col items-center py-8 px-3 relative overflow-hidden">
      {/* Soft animated background circles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full opacity-40 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-sky-300 rounded-full opacity-30 blur-3xl animate-float-slower" />
      </div>

      <div className="w-full max-w-7xl mb-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-full flex flex-col items-center justify-center py-7 rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 shadow-2xl animate-fade-in-down">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 text-center tracking-tight drop-shadow-lg">
              🎓 Explore Colleges in {country}
            </h1>
            <p className="text-base sm:text-lg text-blue-100 text-center max-w-xl font-medium drop-shadow">
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
              className="w-full h-14 px-6 py-4 text-lg rounded-2xl border border-blue-300 shadow-md focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-200 bg-white placeholder:text-blue-400 font-semibold"
            />
          </div>
        </div>

        {/* College cards */}
        {loading ? (
          <div className="text-center text-neutral-600 py-10 font-medium animate-pulse">
            Loading colleges...
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="text-center text-neutral-600 py-10 font-medium animate-fade-in">
            No colleges found. Try a different search!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {filteredColleges.map((college, idx) => {
              const collegeName = college.NameoftheCollege;
              const imageSources = getCollegeImageSources(collegeName);

              return (
                <Card
                  key={idx}
                  className="w-full h-full shadow-md rounded-2xl overflow-hidden flex flex-col bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Logo area that shows full image without cropping */}
                  <div className="w-full h-52 sm:h-48 bg-blue-300 flex items-center justify-center overflow-hidden">
                    <img
                      src={imageSources[0]}
                      alt={collegeName}
                      className="max-h-full max-w-full object-contain p-3"
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

                  <CardContent className="py-4 px-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-lg mb-1 text-neutral-900 line-clamp-2">
                        {collegeName}
                      </div>
                      <div className="text-sm text-neutral-600 mb-3">
                        {college.CollegeState && <span>{college.CollegeState}</span>}
                        {college.CollegeCity && (
                          <span>{college.CollegeState ? ", " : ""}{college.CollegeCity}</span>
                        )}
                      </div>

                      {/* Website link and Proceed to Apply button */}
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
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline truncate"
                              title={college.CollegeWebsite}
                            >
                              Visit College Website
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            navigate("/StudentLoginRegisterPage", {
                              state: {
                                country,
                                college: collegeName,
                                // where to come back after successful login
                                redirectTo: location.pathname + location.search,
                              },
                            })
                          }
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap"
                          aria-label={`Proceed to apply to ${collegeName}`}
                        >
                          Proceed to Apply
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end mt-3">
                      <span className="bg-neutral-200 text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold">
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