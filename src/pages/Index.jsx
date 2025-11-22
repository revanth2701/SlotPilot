import { useState } from "react";
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-16">
            <div className="flex justify-between items-center h-16 z-10">
              {/* Back to Services Button (left) */}
              <div>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  size="sm"
                  className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 font-semibold"
                >
                  ← Back to Services
                </Button>
              </div>

              {/* Student Login (right) */}
              <div>
                <Button onClick={() => setCurrentView("student-auth")} variant="outline" size="sm">
                  Student Login
                </Button>
              </div>
            </div>

            {/* Centered brand (absolute center of the nav) */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="text-2xl font-extrabold tracking-tight leading-none text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-rose-500">
                  SlotPilot
                </span>
              </div>
              <div className="text-xs text-muted-foreground text-center">Global Education & Visa Services</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.8), rgba(37, 99, 235, 0.6)), url(${heroImage})`
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your Gateway to 
            <span className="block bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent">
              Global Education
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Transform your academic dreams into reality with expert guidance for Masters programs 
            in USA, UK, Canada, Ireland, Germany, and Australia.
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={() => setCurrentView("student-auth")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-3 h-auto"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-20 bg-gradient-to-br from-secondary to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Study Destinations
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from top universities across 6 countries offering world-class education and career opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{country.flag}</div>
                  <h3 className="text-xl font-semibold mb-2">{country.name}</h3>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Why Choose Us?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide comprehensive support throughout your international education journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-300 text-center">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful students who have achieved their dreams of studying abroad
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={() => {
                setCurrentView("journey");
                // ensure the Journey form loads then scroll to its top
                setTimeout(() => {
                  const el = document.getElementById("start-your-journey") || document.getElementById("student-name");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    // plain JS focus check
                    // Element might be HTMLInputElement, HTMLElement, etc.
                    // @ts-ignore - safe for runtime in plain JS/JSX projects
                    if (typeof el.focus === "function") el.focus();
                  } else {
                    // fallback: scroll to page top
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }, 120);
              }}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-3 h-auto"
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
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent">
                  SlotPilot
                </span>
                <span className="text-muted-foreground text-base font-light ml-2">
                  Global Education & Visa Services
                </span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SlotPilot Consultancy. Empowering students worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;