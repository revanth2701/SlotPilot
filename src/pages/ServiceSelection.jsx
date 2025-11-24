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
        {/* Professional gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950"></div>

        {/* Animated Globe - Centered */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <div className="globe-container" style={{ width: '600px', height: '600px', position: 'relative' }}>
            <div className="globe-sphere"></div>
            <div className="globe-overlay"></div>
            <div className="globe-glow"></div>
          </div>
        </div>

        {/* Orbiting rings around globe */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="orbit-ring orbit-ring-1"></div>
          <div className="orbit-ring orbit-ring-2"></div>
          <div className="orbit-ring orbit-ring-3"></div>
        </div>

        {/* Subtle animated gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-cyan-600/10 animate-gradient-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-slate-900/50 to-transparent"></div>
        </div>

        {/* Floating light particles */}
        <div className="particles-container absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle absolute rounded-full bg-white/10"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float-gentle ${Math.random() * 15 + 20}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 8}s`,
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>

        {/* Connection lines animation */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="connection-line"
              style={{
                position: 'absolute',
                width: '2px',
                height: '150px',
                background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.5), transparent)',
                left: `${(i + 1) * 15}%`,
                top: '20%',
                animation: `line-pulse ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                transformOrigin: 'top'
              }}
            />
          ))}
        </div>

        {/* Subtle mesh gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-radial from-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse-slow-delayed"></div>
        </div>

        {/* Professional grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}></div>

        {/* Subtle scanline effect */}
        <div className="absolute inset-0 opacity-[0.02] animate-scanline" style={{
          backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.05) 50%)',
          backgroundSize: '100% 4px'
        }}></div>
      </div>

      {/* Professional CSS animations */}
      <style>{`
        /* Globe Animations */
        .globe-sphere {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.3), rgba(14, 165, 233, 0.2) 50%, rgba(6, 78, 159, 0.1));
          box-shadow:
            inset -40px -40px 80px rgba(0, 0, 0, 0.4),
            inset 20px 20px 40px rgba(59, 130, 246, 0.2),
            0 0 100px rgba(59, 130, 246, 0.3);
          position: relative;
          animation: globe-rotate 40s linear infinite;
          overflow: hidden;
        }

        .globe-sphere::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 29px,
              rgba(59, 130, 246, 0.1) 29px,
              rgba(59, 130, 246, 0.1) 30px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 29px,
              rgba(59, 130, 246, 0.1) 29px,
              rgba(59, 130, 246, 0.1) 30px
            );
          animation: globe-grid 20s linear infinite;
        }

        @keyframes globe-rotate {
          from { transform: rotateY(0deg) rotateX(15deg); }
          to { transform: rotateY(360deg) rotateX(15deg); }
        }

        @keyframes globe-grid {
          from { transform: translateX(0); }
          to { transform: translateX(30px); }
        }

        .globe-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.2) 0%,
            rgba(255, 255, 255, 0.05) 40%,
            rgba(0, 0, 0, 0.2) 100%
          );
        }

        .globe-glow {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 70%);
          filter: blur(30px);
          animation: pulse-glow 4s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        /* Orbiting Rings */
        .orbit-ring {
          position: absolute;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          animation: orbit-rotate 20s linear infinite;
        }

        .orbit-ring-1 {
          width: 700px;
          height: 700px;
          border-width: 1px;
          animation-duration: 25s;
        }

        .orbit-ring-2 {
          width: 800px;
          height: 800px;
          border-width: 1px;
          border-style: dashed;
          animation-duration: 35s;
          animation-direction: reverse;
        }

        .orbit-ring-3 {
          width: 900px;
          height: 900px;
          border-width: 1px;
          animation-duration: 45s;
          opacity: 0.5;
        }

        @keyframes orbit-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Connection Lines Pulse */
        @keyframes line-pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.6;
            transform: scaleY(1.5);
          }
        }

        /* Gradient Animation */
        @keyframes gradient-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-gradient-slow {
          animation: gradient-slow 20s ease-in-out infinite;
        }

        /* Floating Particles */
        @keyframes float-gentle {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.1;
          }
          50% {
            transform: translate(30px, -80px);
            opacity: 0.3;
          }
        }

        /* Pulse Effects */
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-pulse-slow-delayed {
          animation: pulse-slow 8s ease-in-out infinite;
          animation-delay: 4s;
        }

        /* Scanline Effect */
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10 bg-slate-900/40 backdrop-blur-xl border-b border-white/10 shadow-lg">
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
          <Card className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border border-white/10 bg-slate-900/60 backdrop-blur-xl hover:bg-slate-900/80 hover:scale-[1.02] hover:border-blue-400/30">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/30">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Higher Education
              </CardTitle>
              <CardDescription className="text-white/70">
                Get guidance for studying abroad, university applications, and academic programs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50"></div>
                  <span>University Selection & Applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50"></div>
                  <span>Document Preparation & Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50"></div>
                  <span>Scholarship Guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50"></div>
                  <span>Student Visa Assistance</span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/higher-education')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Apply for Higher Education
              </Button>
            </CardContent>
          </Card>

          {/* Visa Services Card */}
          <Card className="group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 border border-white/10 bg-slate-900/60 backdrop-blur-xl hover:bg-slate-900/80 hover:scale-[1.02] hover:border-cyan-400/30">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-600 to-cyan-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-cyan-500/30">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Visa Services
              </CardTitle>
              <CardDescription className="text-white/70">
                Expert assistance for all types of visa applications worldwide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400/50"></div>
                  <span>Tourist & Business Visas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400/50"></div>
                  <span>Work & Employment Visas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400/50"></div>
                  <span>Family & Immigration Visas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400/50"></div>
                  <span>Document Support & Review</span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/visa-services')}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-semibold py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
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
            <a href="mailto:info@slotpilot.in" className="text-blue-400 underline hover:text-blue-300 transition-colors"> info@slotpilot.in</a>
          </p>
          <div className="mt-4 text-xs text-white/50">
            © 2025 Slotpilot. All rights reserved. |
            <span
              className="text-blue-400 underline cursor-pointer mx-1 hover:text-blue-300 transition-colors"
              onClick={() => navigate('/privacy-policy')}
            >
              Privacy Policy
            </span>
            |
            <span
              className="text-blue-400 underline cursor-pointer mx-1 hover:text-blue-300 transition-colors"
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