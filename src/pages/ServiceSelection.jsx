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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden flex flex-col overflow-x-hidden">
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
          {/* Higher Education Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Higher Education
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Get guidance for studying abroad, university applications, and academic programs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>University Selection & Applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Document Preparation & Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Scholarship Guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Student Visa Assistance</span>
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
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-secondary/20 bg-gradient-to-br from-background to-secondary/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plane className="w-8 h-8 text-secondary-foreground" />
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
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Tourist & Business Visas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Work & Employment Visas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Family & Immigration Visas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Document Support & Review</span>
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