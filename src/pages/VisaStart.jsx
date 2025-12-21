import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Globe2, Sparkles, ArrowRight } from "lucide-react";

const COUNTRIES = [
    "India",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "Ireland",
    "United Arab Emirates",
    "France",
    "Italy",
    "Japan",
    "Singapore",
    "New Zealand",
];

// Simple emoji flags for a “travel vibe” (kept local and safe; no extra deps)
const COUNTRY_EMOJI = {
    India: "🇮🇳",
    "United States": "🇺🇸",
    "United Kingdom": "🇬🇧",
    Canada: "🇨🇦",
    Australia: "🇦🇺",
    Germany: "🇩🇪",
    Ireland: "🇮🇪",
    "United Arab Emirates": "🇦🇪",
    France: "🇫🇷",
    Italy: "🇮🇹",
    Japan: "🇯🇵",
    Singapore: "🇸🇬",
    "New Zealand": "🇳🇿",
};

const VisaStart = () => {
  const navigate = useNavigate();
  const [passportCountry, setPassportCountry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.localeCompare(b)),
    []
  );

  const goToVisaServices = (country) => {
    if (!country || isLoading) return;

    setIsLoading(true);
    setPassportCountry(country);

    // short friendly delay so the loading animation is visible
    setTimeout(() => {
      navigate("/visa-services", {
        state: { passportCountry: country, fromVisaStart: true },
      });
    }, 1100);
  };

  const handleContinue = () => {
    if (!passportCountry || isLoading) return;
    goToVisaServices(passportCountry);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-white px-4 py-12 relative overflow-hidden">
      {/* Page-level styles (kept local so you don't need new files) */}
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
        @keyframes vs-gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes vs-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        @keyframes vs-dots {
          0% { content: ""; }
          33% { content: "."; }
          66% { content: ".."; }
          100% { content: "..."; }
        }

        /* NEW: “travel chips” orbit + drift */
        @keyframes vs-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes vs-chipFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes vs-chipPop {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0px) scale(1); }
        }
        @keyframes vs-scanline {
          0% { transform: translateX(-120%); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        .vs-enter { animation: vs-softPop 560ms cubic-bezier(.2,.9,.2,1) both; }
        .vs-enter-2 { animation: vs-fadeUp 520ms ease-out both; animation-delay: 110ms; }
        .vs-enter-3 { animation: vs-fadeUp 520ms ease-out both; animation-delay: 190ms; }

        .vs-bg-orb {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 9999px;
          filter: blur(34px);
          opacity: 0.35;
          mix-blend-mode: multiply;
          pointer-events: none;
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

        .vs-card {
          box-shadow: 0 20px 65px rgba(2,6,23,0.10);
          border: 1px solid rgba(148,163,184,0.45);
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(8px);
        }

        .vs-card-hover {
          transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
        }
        .vs-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 85px rgba(2,6,23,0.12);
          border-color: rgba(56,189,248,0.55);
        }

        .vs-badge-anim {
          background: linear-gradient(90deg, rgba(56,189,248,0.18), rgba(99,102,241,0.16), rgba(56,189,248,0.18));
          background-size: 200% 200%;
          animation: vs-gradientMove 5s ease infinite;
        }

        .vs-btn {
          position: relative;
          overflow: hidden;
          transition: transform 140ms ease, box-shadow 140ms ease, filter 140ms ease;
        }
        .vs-btn:hover { transform: translateY(-1px); }
        .vs-btn:active { transform: translateY(0px) scale(0.99); }
        .vs-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.45), transparent);
          transform: translateX(-120%);
        }
        .vs-btn:hover::after { animation: vs-shimmer 900ms ease; }

        .vs-loading-backdrop { animation: vs-fadeUp 180ms ease-out both; }
        .vs-ellipsis::after {
          content: "";
          display: inline-block;
          width: 1.2em;
          text-align: left;
          animation: vs-dots 1s steps(3, end) infinite;
        }
        .vs-spinner {
          width: 64px; height: 64px; border-radius: 9999px;
          border: 6px solid rgba(56,189,248,0.22);
          border-top-color: rgba(56,189,248,1);
          animation: spin 900ms linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* NEW: animated country “chips” around the card (subtle, non-blocking) */
        .vs-chip-ring {
          position: absolute;
          inset: -36px;
          pointer-events: none;
          opacity: 0.95;
          filter: drop-shadow(0 10px 18px rgba(2,6,23,0.08));
        }
        .vs-chip-ring::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 26px;
          background: linear-gradient(90deg, rgba(56,189,248,0.10), rgba(99,102,241,0.08), rgba(34,197,94,0.08));
          mask: linear-gradient(#000, #000) content-box, linear-gradient(#000, #000);
          -webkit-mask: linear-gradient(#000, #000) content-box, linear-gradient(#000, #000);
          padding: 1px;
          opacity: 0.55;
        }
        .vs-chip {
          position: absolute;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(226,232,240,0.9);
          color: rgba(15,23,42,0.82);
          font-size: 12px;
          line-height: 1;
          backdrop-filter: blur(6px);
          animation: vs-chipPop 520ms ease-out both, vs-chipFloat 3.4s ease-in-out infinite;
          user-select: none;
          white-space: nowrap;
        }
        .vs-chip .emoji { font-size: 14px; }

        /* Reduce motion support */
        @media (prefers-reduced-motion: reduce) {
          .vs-bg-orb.one, .vs-bg-orb.two,
          .vs-badge-anim,
          .vs-chip,
          .vs-btn:hover::after,
          .vs-spinner { animation: none !important; }
        }
      `}</style>

      {/* animated background orbs */}
      <div className="vs-bg-orb one" />
      <div className="vs-bg-orb two" />

      {/* Loading overlay */}
      {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 vs-loading-backdrop">
              <div className="bg-white/90 rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 border border-white/60 backdrop-blur-md">
                  <div className="vs-spinner" />
                  <div className="text-center">
                      <p className="text-sm text-slate-700">
                          Preparing visa options for{" "}
                          <strong className="text-slate-900">
                              {COUNTRY_EMOJI[passportCountry] ? `${COUNTRY_EMOJI[passportCountry]} ` : ""}
                              {passportCountry}
                          </strong>
                          <span className="vs-ellipsis" />
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                          Fetching destinations and visa types.
                      </p>
                  </div>
              </div>
          </div>
      )}

      <Card
        className={[
          "w-full max-w-xl overflow-visible relative rounded-2xl",
          "vs-card vs-card-hover",
          mounted ? "vs-enter" : "",
        ].join(" ")}
      >
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-100 text-slate-700 vs-badge-anim">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-medium">Fast, guided visa discovery</span>
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Start Your Visa Application
          </CardTitle>
          <CardDescription className="mt-2 text-slate-600 leading-relaxed">
            Select the country that issued your passport. We’ll show destinations
            you can apply for in the next step.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className={mounted ? "vs-enter-2 space-y-2" : "space-y-2"}>
            <label className="flex items-center justify-center sm:justify-start gap-2 text-sm font-medium text-slate-800">
              <Globe2 className="w-4 h-4 text-sky-600" />
              <b>Select the Country that Issued your Passport</b>
            </label>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Select
                  value={passportCountry}
                  onValueChange={(value) => {
                    // Auto-load immediately on selection
                    goToVisaServices(value);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full sm:w-[33rem] h-12 text-base bg-white border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-sky-200">
                    <SelectValue placeholder="Select passport country" />
                  </SelectTrigger>

                  <SelectContent className="max-h-72 overflow-auto z-50 bg-white border border-slate-200 shadow-lg text-slate-900 text-base min-w-[22rem]">
                    {sortedCountries.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="cursor-pointer py-2 hover:bg-sky-200 data-[state=checked]:bg-sky-100 data-[state=checked]:text-slate-900"
                      >
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-xs text-slate-500 mt-2">
                  Tip: choose the country printed on your passport’s cover.
                </p>
              </div>
            </div>
          </div>

          <div className={mounted ? "vs-enter-3" : ""}>
            <p className="text-xs text-slate-500 text-center mt-3">
              You can change this later on the visa services page if needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisaStart;