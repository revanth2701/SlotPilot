import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Plane, Building2, Globe, Users, BookOpen, Award, Languages, MapPin } from 'lucide-react';


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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden flex flex-col overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            33% { transform: translateY(-20px) translateX(10px); }
            66% { transform: translateY(10px) translateX(-5px); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.05); }
          }
          @keyframes drift {
            0% { transform: translateX(0) translateY(0); }
            100% { transform: translateX(100vw) translateY(-100vh); }
          }
          .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.4;
            animation: float 8s ease-in-out infinite;
          }
          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.6), rgba(245, 158, 11, 0.6));
            animation: drift 15s linear infinite;
          }
        `}</style>

        {/* Floating orbs */}
        <div
          className="orb"
          style={{
            top: '10%',
            left: '15%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3), transparent)',
            animationDelay: '0s',
            animationDuration: '10s'
          }}
        />
        <div
          className="orb"
          style={{
            top: '60%',
            right: '10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25), transparent)',
            animationDelay: '2s',
            animationDuration: '12s'
          }}
        />
        <div
          className="orb"
          style={{
            bottom: '10%',
            left: '30%',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(251, 113, 133, 0.2), transparent)',
            animationDelay: '4s',
            animationDuration: '14s'
          }}
        />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${-10 + Math.random() * 20}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${12 + Math.random() * 8}s`,
              opacity: 0.15 + Math.random() * 0.2
            }}
          />
        ))}

        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(249, 115, 22, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(249, 115, 22, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: 0.5
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-md border-b border-primary/20 shadow-elegant">
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

                <p className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide uppercase mt-1">
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
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Choose Your Service
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the service you need assistance with. Our expert consultants are here to guide you through every step of your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <style>{`
            @keyframes card-glow {
              0%, 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.3), 0 0 40px rgba(245, 158, 11, 0.2); }
              50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.5), 0 0 60px rgba(245, 158, 11, 0.3); }
            }
            @keyframes card-glow-blue {
              0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(16, 185, 129, 0.2); }
              50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.5), 0 0 60px rgba(16, 185, 129, 0.3); }
            }
            @keyframes icon-bounce {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-10px) scale(1.1); }
            }
            @keyframes float-country {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-5px) rotate(5deg); }
            }
            .card-education {
              animation: card-glow 3s ease-in-out infinite;
              background: linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%);
              border: 2px solid transparent;
              background-clip: padding-box;
              position: relative;
            }
            .card-education::before {
              content: '';
              position: absolute;
              inset: -2px;
              background: linear-gradient(135deg, #ec4899, #f59e0b, #10b981);
              border-radius: inherit;
              z-index: -1;
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            .card-education:hover::before {
              opacity: 1;
            }
            .card-visa {
              animation: card-glow-blue 3s ease-in-out infinite;
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
              border: 2px solid transparent;
              background-clip: padding-box;
              position: relative;
            }
            .card-visa::before {
              content: '';
              position: absolute;
              inset: -2px;
              background: linear-gradient(135deg, #3b82f6, #10b981, #8b5cf6);
              border-radius: inherit;
              z-index: -1;
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            .card-visa:hover::before {
              opacity: 1;
            }
            .icon-wrapper {
              transition: all 0.3s ease;
            }
            .group:hover .icon-wrapper {
              animation: icon-bounce 0.6s ease;
            }
            .feature-dot {
              animation: pulse-glow 2s ease-in-out infinite;
            }
            .country-flag {
              font-size: 1.5rem;
              display: inline-block;
              animation: float-country 3s ease-in-out infinite;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
            }
            .countries-row {
              display: flex;
              gap: 0.5rem;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 1rem;
            }
          `}</style>

          {/* Higher Education Card */}
          <Card className="card-education group transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="icon-wrapper mx-auto w-20 h-20 bg-gradient-to-br from-pink-500 via-amber-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Higher Education Abroad
              </CardTitle>

              {/* Country Flags/Icons */}
              <div className="countries-row mb-3">
                <span className="country-flag" style={{ animationDelay: '0s' }} title="USA">🇺🇸</span>
                <span className="country-flag" style={{ animationDelay: '0.3s' }} title="UK">🇬🇧</span>
                <span className="country-flag" style={{ animationDelay: '0.6s' }} title="Canada">🇨🇦</span>
                <span className="country-flag" style={{ animationDelay: '0.9s' }} title="Australia">🇦🇺</span>
                <span className="country-flag" style={{ animationDelay: '1.2s' }} title="Germany">🇩🇪</span>
                <span className="country-flag" style={{ animationDelay: '1.5s' }} title="France">🇫🇷</span>
              </div>

              <CardDescription className="text-muted-foreground">
                Study in world-renowned universities across USA, UK, Canada, Australia, Europe & more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 group/item">
                  <MapPin className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground group-hover/item:translate-x-1 transition-transform">
                    <strong className="text-foreground">Global Universities:</strong> USA, UK, Canada, Australia, Germany, France & more
                  </span>
                </div>
                <div className="flex items-start gap-2 group/item">
                  <BookOpen className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground group-hover/item:translate-x-1 transition-transform">
                    <strong className="text-foreground">Course Selection:</strong> Undergraduate, Masters, PhD programs
                  </span>
                </div>
                <div className="flex items-start gap-2 group/item">
                  <Award className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground group-hover/item:translate-x-1 transition-transform">
                    <strong className="text-foreground">Scholarships:</strong> Financial aid & funding opportunities
                  </span>
                </div>
                <div className="flex items-start gap-2 group/item">
                  <Languages className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground group-hover/item:translate-x-1 transition-transform">
                    <strong className="text-foreground">Language Support:</strong> IELTS, TOEFL, GRE, GMAT prep
                  </span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/higher-education')}
                className="w-full bg-gradient-to-r from-pink-500 via-amber-500 to-emerald-500 hover:from-pink-600 hover:via-amber-600 hover:to-emerald-600 text-white font-semibold py-3 h-auto shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Globe className="w-5 h-5 mr-2" />
                Explore Global Education
              </Button>
            </CardContent>
          </Card>

          {/* Visa Services Card */}
          <Card className="card-visa group transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="icon-wrapper mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-emerald-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Plane className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Visa Services
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Expert assistance for all types of visa applications worldwide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 group/item">
                  <div className="feature-dot w-2 h-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full shadow-lg"></div>
                  <span className="group-hover/item:translate-x-1 transition-transform">Tourist & Business Visas</span>
                </div>
                <div className="flex items-center gap-2 group/item">
                  <div className="feature-dot w-2 h-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full shadow-lg" style={{ animationDelay: '0.5s' }}></div>
                  <span className="group-hover/item:translate-x-1 transition-transform">Work & Employment Visas</span>
                </div>
                <div className="flex items-center gap-2 group/item">
                  <div className="feature-dot w-2 h-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full shadow-lg" style={{ animationDelay: '1s' }}></div>
                  <span className="group-hover/item:translate-x-1 transition-transform">Family & Immigration Visas</span>
                </div>
                <div className="flex items-center gap-2 group/item">
                  <div className="feature-dot w-2 h-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full shadow-lg" style={{ animationDelay: '1.5s' }}></div>
                  <span className="group-hover/item:translate-x-1 transition-transform">Document Support & Review</span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/visa-services')}
                className="w-full bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 hover:from-blue-600 hover:via-emerald-600 hover:to-purple-600 text-white font-semibold py-3 h-auto shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
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
          <p className="text-muted-foreground">
            Contact our consultants for personalized guidance at
            <a href="mailto:info@slotpilot.in" className="text-primary underline"> info@slotpilot.in</a>
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            © 2025 Slotpilot. All rights reserved. |
            <span
              className="text-primary underline cursor-pointer mx-1"
              onClick={() => navigate('/privacy-policy')}
            >
              Privacy Policy
            </span>
            |
            <span
              className="text-primary underline cursor-pointer mx-1"
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