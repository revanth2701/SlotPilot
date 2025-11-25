import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoginSelection from "@/components/LoginSelection";
import StudentLoginRegister from "@/components/StudentLoginRegister";
// import EmployerLoginRegister from "@/components/EmployerLoginRegister";
import StudentDashboardNew from "@/components/StudentDashboardNew";
import EmployerDashboard from "@/components/EmployerDashboard";
import JourneyForm from "@/components/JourneyForm";
import { GraduationCap, Globe, Users, CheckCircle, ArrowRight, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";

const Index = () => {
  const [currentView, setCurrentView] = useState("landing");

  const countries = [
    { name: "United States", flag: "🇺🇸", universities: "500+" },
    { name: "United Kingdom", flag: "🇬🇧", universities: "200+" },
    { name: "Canada", flag: "🇨🇦", universities: "300+" },
    { name: "Australia", flag: "🇦🇺", universities: "150+" },
    { name: "Germany", flag: "🇩🇪", universities: "400+" },
    { name: "Ireland", flag: "🇮🇪", universities: "50+" }
  ];

  const features = [
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Dedicated consultants with 10+ years of experience in international education"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Partnerships with top universities across 6 countries for diverse opportunities"
    },
    {
      icon: CheckCircle,
      title: "End-to-End Support",
      description: "From application to visa processing, we handle every step of your journey"
    },
    {
      icon: GraduationCap,
      title: "Success Stories",
      description: "95% acceptance rate with over 5000+ students placed in top universities"
    }
  ];

  useEffect(() => {
    // ensure page top offset for sticky nav on mount (helps mobile)
    document.documentElement.style.scrollPaddingTop = "72px";
    return () => { document.documentElement.style.scrollPaddingTop = ""; };
  }, []);

  // show logged in user's display name if available in localStorage
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem("userName") || ""; } catch { return ""; }
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "userName") setUserName(e.newValue || "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (currentView === "student-auth") {
    return <StudentLoginRegister onBack={() => setCurrentView("landing")} onLogin={() => setCurrentView("student")} />;
  }


  if (currentView === "login") {
    return (
      <LoginSelection
        onStudentLogin={() => setCurrentView("student-auth")}
        onEmployerLogin={() => setCurrentView("employer")}
      />
    );
  }

  if (currentView === "student") {
    return <StudentDashboardNew onBack={() => setCurrentView("landing")} />;
  }

  if (currentView === "employer") {
    return <EmployerDashboard onBack={() => setCurrentView("login")} />;
  }

  if (currentView === "journey") {
    return <JourneyForm onBack={() => setCurrentView("landing")} />;
  }

  return (
    <div className="min-h-screen bg-background page-content">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-16">
            <div className="flex justify-between items-center h-16 z-10">
              {/* Back to Services Button (left) */}
              <div className="flex items-center gap-2">
                <div className="sm:hidden text-lg font-extrabold text-primary">SlotPilot</div>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  size="sm"
                  className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 font-semibold"
                >
                  ← Back to Services
                </Button>
              </div>

            {/* center title - stays in normal flow on small screens to avoid overlap */}
            <div className="flex-1 flex justify-center px-2">
              <div className="text-base font-bold text-center md:text-lg">
                <span className="block md:inline bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent">
                  SLOT
                </span>
                <span className="block md:inline ml-0 md:ml-2 bg-clip-text text-transparent bg-gradient-to-r from-accent to-orange-500">
                  PILOT
                </span>
                <span className="block text-muted-foreground text-xs font-light md:inline md:ml-2">consultancy</span>
              </div>
            </div>

            {/* Centered brand: absolutely centered on sm+; show compact brand on xs in the left area */}
            <div className="hidden sm:block sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 pointer-events-none text-center">
              <div className="text-2xl font-extrabold tracking-tight leading-none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-rose-500">
                  SlotPilot
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Global Education & Visa Services</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] sm:min-h-[80vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.8), rgba(37, 99, 235, 0.6)), url(${heroImage})`
          }}
        />
        <div className="relative max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Your Gateway to 
            <span className="block bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent">
              Global Education
            </span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-full sm:max-w-3xl mx-auto opacity-90">
            Transform your academic dreams into reality with expert guidance for Masters programs 
            in USA, UK, Canada, Ireland, Germany, and Australia.
          </p>
          <div className="flex justify-center px-4">
            <Button
              size="lg"
              onClick={() => setCurrentView("student-auth")}
              className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-base sm:text-lg px-6 sm:px-8 py-3 h-auto"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-20 bg-gradient-to-br from-secondary to-background">
        <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Study Destinations
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from top universities across 6 countries offering world-class education and career opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-4xl mb-4">{country.flag}</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{country.name}</h3>
                  <Badge variant="secondary" className="mb-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    {country.universities} Universities
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Explore opportunities in top-ranked institutions
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Why Choose Us?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide comprehensive support throughout your international education journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-300 text-center">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-primary rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful students who have achieved their dreams of studying abroad
          </p>
          <div className="flex justify-center px-4">
            <Button
              size="lg"
              onClick={() => setCurrentView("journey")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-6 py-3 h-auto w-full sm:w-auto"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                  SLOT
                </span>
                <span className="bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                  PILOT
                </span>
                <span className="text-muted-foreground text-base font-light ml-1">
                  consultancy
                </span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Slotpilot Consultancy. Empowering students worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;