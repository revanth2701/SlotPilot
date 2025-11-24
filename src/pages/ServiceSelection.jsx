import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Plane, Building2, Globe, Users } from 'lucide-react';


// constant Earth — realistic 3D rotating globe component (uses an equirectangular world-map image at /public/images/world-map.jpg)
const Earth = () => (
  <div className="globe-wrap" aria-hidden="false">
    <style>{`
      .globe-wrap { width:72px; height:72px; display:flex; align-items:center; justify-content:center; }
      .globe { width:64px; height:64px; position:relative; perspective:800px; }
      .globe__sphere {
        width:100%;
        height:100%;
        border-radius:50%;
        background-image: url('/images/world-map.jpg');
        background-size: cover;
        background-position: 50% 50%;
        box-shadow: inset -10px -6px 24px rgba(0,0,0,0.45), 0 6px 18px rgba(10,20,40,0.25);
        transform: rotateX(15deg) rotateY(0deg);
        transform-style: preserve-3d;
        animation: globeSpin 10s linear infinite;
        will-change: transform;
      }
      .globe__overlay {
        position:absolute;
        inset:0;
        border-radius:50%;
        background: radial-gradient(60% 50% at 30% 25%, rgba(255,255,255,0.35), rgba(255,255,255,0.05) 20%, rgba(0,0,0,0.25) 70%);
        mix-blend-mode: overlay;
        pointer-events:none;
      }
      .globe__shadow {
        position:absolute;
        left:6%;
        top:74%;
        width:86%;
        height:20%;
        border-radius:50%;
        background: radial-gradient(closest-side, rgba(0,0,0,0.28), transparent 60%);
        filter: blur(6px);
        opacity:0.9;
        transform: translateY(6px);
        pointer-events:none;
      }
      @keyframes globeSpin {
        from { transform: rotateX(15deg) rotateY(0deg); }
        to   { transform: rotateX(15deg) rotateY(360deg); }
      }
    `}</style>

    <div className="globe" role="img" aria-label="Revolving globe logo">
      <div className="globe__sphere" />
      <div className="globe__overlay" />
      <div className="globe__shadow" />
    </div>
  </div>
);

/* NOTE: Place a suitable equirectangular world map image at: public/images/world-map.jpg
   Example: download an open-source equirectangular map and save it there so the globe texture looks realistic. */

const ServiceSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col overflow-x-hidden">
      {/* Animated Background Layers */}
      <div className="fixed inset-0 z-0">
        {/* Dynamic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-teal-500 to-emerald-600 animate-gradient-shift"></div>

        {/* Floating particles */}
        <div className="particles-container absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle absolute rounded-full bg-white/20"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 15}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-300/40 via-transparent to-transparent animate-mesh-1"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-amber-400/40 via-transparent to-transparent animate-mesh-2"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-cyan-300/40 via-transparent to-transparent animate-mesh-3"></div>
        </div>

        {/* Animated waves */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>

        {/* Grid pattern with animation */}
        <div className="absolute inset-0 opacity-10 animate-grid-pulse" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Advanced CSS animations */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-100px) translateX(50px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-200px) translateX(-30px) scale(0.8);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-100px) translateX(-80px) scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes mesh-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(50px, 100px) rotate(120deg) scale(1.2); }
          66% { transform: translate(-50px, 50px) rotate(240deg) scale(0.9); }
        }
        .animate-mesh-1 { animation: mesh-1 20s ease-in-out infinite; }

        @keyframes mesh-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(-100px, -50px) rotate(-120deg) scale(1.1); }
          66% { transform: translate(80px, -100px) rotate(-240deg) scale(0.95); }
        }
        .animate-mesh-2 { animation: mesh-2 18s ease-in-out infinite; }

        @keyframes mesh-3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(70px, -80px) rotate(90deg) scale(1.15); }
          66% { transform: translate(-60px, 60px) rotate(180deg) scale(0.85); }
        }
        .animate-mesh-3 { animation: mesh-3 22s ease-in-out infinite; }

        .wave {
          position: absolute;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 50%
          );
          border-radius: 45%;
        }

        @keyframes wave-animation {
          0% { transform: translate(-50%, -80%) rotate(0deg); }
          100% { transform: translate(-50%, -80%) rotate(360deg); }
        }

        .wave-1 {
          animation: wave-animation 25s linear infinite;
          opacity: 0.3;
        }

        .wave-2 {
          animation: wave-animation 20s linear infinite reverse;
          opacity: 0.2;
          animation-delay: -5s;
        }

        .wave-3 {
          animation: wave-animation 30s linear infinite;
          opacity: 0.15;
          animation-delay: -10s;
        }

        @keyframes grid-pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.02); }
        }
        .animate-grid-pulse {
          animation: grid-pulse 8s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* left placeholder (keeps balanced layout) */}
            <div className="w-16" />

            {/* center wordmark */}
            <div className="flex-1 flex justify-center">
              <div className="text-center">
                {/* Animated wordmark styles (disabled on small screens for stability) */}
                <style>{`
                  .slotpilot-wordmark { display:inline-flex; gap:0.04rem; align-items:baseline; }
                  .slotpilot-wordmark span {
                    display:inline-block;
                    font-weight:800;
                    font-size:1.6rem;
                    line-height:1;
                    -webkit-background-clip:text;
                    background-clip:text;
                    color:transparent;
                    background-image: linear-gradient(90deg, #F59E0B 0%, #F97316 45%, #FB7185 100%);
                    transition: transform 220ms ease, letter-spacing 220ms ease;
                  }
                  /* subtle staggered wave on md+ only */
                  @media (min-width: 768px) {
                    .slotpilot-wordmark span { font-size:2.625rem; }
                    .slotpilot-wordmark span:nth-child(1){ animation:wave 2200ms ease-in-out infinite; animation-delay:0ms; }
                    .slotpilot-wordmark span:nth-child(2){ animation:wave 2200ms ease-in-out infinite; animation-delay:80ms; }
                    .slotpilot-wordmark span:nth-child(3){ animation:wave 2200ms ease-in-out infinite; animation-delay:160ms; }
                    .slotpilot-wordmark span:nth-child(4){ animation:wave 2200ms ease-in-out infinite; animation-delay:240ms; }
                    .slotpilot-wordmark span:nth-child(5){ animation:wave 2200ms ease-in-out infinite; animation-delay:320ms; }
                    .slotpilot-wordmark span:nth-child(6){ animation:wave 2200ms ease-in-out infinite; animation-delay:400ms; }
                    .slotpilot-wordmark span:nth-child(7){ animation:wave 2200ms ease-in-out infinite; animation-delay:480ms; }
                    .slotpilot-wordmark span:nth-child(8){ animation:wave 2200ms ease-in-out infinite; animation-delay:560ms; }
                    .slotpilot-wordmark span:nth-child(9){ animation:wave 2200ms ease-in-out infinite; animation-delay:640ms; }
                    @keyframes wave {
                      0% { transform: translateY(0) scale(1); }
                      40% { transform: translateY(-6px) scale(1.03); }
                      70% { transform: translateY(-3px) scale(1.015); }
                      100% { transform: translateY(0) scale(1); }
                    }
                    .slotpilot-wordmark:hover span { transform: translateY(-3px) scale(1.02); letter-spacing:0.6px; }
                  }
                `}</style>

                <div>
                  <h1 className="mb-0">
                    <span className="slotpilot-wordmark" aria-label="SlotPilot">
                      {"SlotPilot".split('').map((ch, i) => <span key={i}>{ch}</span>)}
                    </span>
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-white/70 font-medium tracking-wide uppercase mt-1">
                  Global Education & Visa Services
                </p>
              </div>
            </div>

            {/* right: employer/student actions (responsive) */}
            <div className="w-16 flex justify-end items-center">
              <div className="hidden sm:block">
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => navigate('/employer-login')}
                  className="font-semibold shadow-lg"
                >
                  Employer Login
                </Button>
              </div>
              {/* small-screen compact action: show login icon (navigates to Employer Login) */}
              <div className="sm:hidden">
                <button
                  className="p-2 rounded-md border flex items-center justify-center"
                  aria-label="Employer Login"
                  onClick={() => navigate('/employer-login')}
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Choose Your Service
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Select the service you need assistance with. Our expert consultants are here to guide you through every step of your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Higher Education Card */}
          <Card className="group hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 border border-white/20 bg-white/15 backdrop-blur-xl hover:bg-white/25 hover:scale-105 hover:border-cyan-400/50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Higher Education
              </CardTitle>
              <CardDescription className="text-gray-700">
                Get guidance for studying abroad, university applications, and academic programs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                  <span className="text-gray-800">University Selection & Applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                  <span className="text-gray-800">Document Preparation & Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                  <span className="text-gray-800">Scholarship Guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                  <span className="text-gray-800">Student Visa Assistance</span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/higher-education')}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 h-auto"
                size="lg"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Apply for Higher Education
              </Button>
            </CardContent>
          </Card>

          {/* Visa Services Card */}
          <Card className="group hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 border border-white/20 bg-white/15 backdrop-blur-xl hover:bg-white/25 hover:scale-105 hover:border-amber-400/50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plane className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Visa Services
              </CardTitle>
              <CardDescription className="text-gray-700">
                Expert assistance for all types of visa applications worldwide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-gray-800">Tourist & Business Visas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-gray-800">Work & Employment Visas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-gray-800">Family & Immigration Visas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-gray-800">Document Support & Review</span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/visa-services')}
                className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-secondary-foreground font-semibold py-3 h-auto"
                size="lg"
              >
                <Globe className="w-5 h-5 mr-2" />
                Apply for Visa
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-white/70">
            Contact our consultants for personalized guidance at
            <a href="mailto:info@slotpilot.in" className="text-cyan-400 underline"> info@slotpilot.in</a>
          </p>
          <div className="mt-4 text-xs text-white/50">
            © 2025 Slotpilot. All rights reserved. |
            <span
              className="text-cyan-400 underline cursor-pointer mx-1"
              onClick={() => navigate('/privacy-policy')}
            >
              Privacy Policy
            </span>
            |
            <span
              className="text-cyan-400 underline cursor-pointer mx-1"
              onClick={() => navigate('/terms-of-service')}
            >
              Terms of Service
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceSelection;