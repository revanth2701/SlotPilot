import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import LoginSelection from "@/components/LoginSelection";
import EmployerLoginRegister from "@/components/EmployerLoginRegister";
import StudentDashboardNew from "@/components/StudentDashboardNew";
import EmployerDashboard from "@/components/EmployerDashboard";
import { GraduationCap, Globe, Users, CheckCircle, MapPin, TrendingUp, Award, Clock, Star, ArrowRight, Mail, Phone, MapPinIcon, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState("landing");
  const [scrollY, setScrollY] = useState(0);
  const [email, setEmail] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const countries = [
    { name: "United States of America", flag: "🇺🇸", universities: "500+" },
    { name: "United Kingdom", flag: "🇬🇧", universities: "200+" },
    { name: "Canada", flag: "🇨🇦", universities: "300+" },
    { name: "Australia", flag: "🇦🇺", universities: "150+" },
    { name: "Germany", flag: "🇩🇪", universities: "400+" },
    { name: "Ireland", flag: "🇮🇪", universities: "50+" }
  ];

  const features = [
    { icon: Users, title: "Expert Guidance", description: "Dedicated consultants with 10+ years of experience in international education" },
    { icon: Globe, title: "Global Network", description: "Partnerships with top universities across 6 countries for diverse opportunities" },
    { icon: CheckCircle, title: "End-to-End Support", description: "From application to visa processing, we handle every step of your journey" },
    { icon: GraduationCap, title: "Success Stories", description: "95% acceptance rate with over 5000+ students placed in top universities" }
  ];

  const statistics = [
    { value: 5000, suffix: "+", label: "Students Placed", icon: Users },
    { value: 95, suffix: "%", label: "Success Rate", icon: TrendingUp },
    { value: 1600, suffix: "+", label: "Partner Universities", icon: Globe },
    { value: 15, suffix: "+", label: "Years Experience", icon: Award }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      university: "Stanford University, USA",
      text: "SlotPilot made my dream of studying at Stanford a reality. Their guidance throughout the application process was invaluable.",
      rating: 5,
      image: "SJ"
    },
    {
      name: "Raj Patel",
      university: "University of Oxford, UK",
      text: "The team's expertise in UK admissions helped me secure a place at Oxford. Forever grateful for their support!",
      rating: 5,
      image: "RP"
    },
    {
      name: "Emily Chen",
      university: "University of Toronto, Canada",
      text: "From start to finish, SlotPilot handled everything professionally. Now I'm pursuing my Master's in Toronto!",
      rating: 5,
      image: "EC"
    },
    {
      name: "Michael Schmidt",
      university: "Technical University of Munich, Germany",
      text: "Excellent service! They helped me navigate the complex German application process with ease.",
      rating: 5,
      image: "MS"
    }
  ];

  const processSteps = [
    { step: 1, title: "Initial Consultation", description: "Free consultation to understand your goals and assess your profile", icon: Users },
    { step: 2, title: "University Selection", description: "Personalized university recommendations based on your profile", icon: GraduationCap },
    { step: 3, title: "Application Support", description: "Complete assistance with applications, essays, and documentation", icon: CheckCircle },
    { step: 4, title: "Visa Processing", description: "Expert guidance through visa applications and interview preparation", icon: Globe },
    { step: 5, title: "Pre-Departure", description: "Comprehensive pre-departure briefing and support services", icon: Award }
  ];

  const faqs = [
    {
      question: "What services does SlotPilot provide?",
      answer: "We provide end-to-end support for international education including university selection, application assistance, visa processing, scholarship guidance, and pre-departure support."
    },
    {
      question: "How much does your service cost?",
      answer: "Our pricing varies based on the services you need. We offer free initial consultations and customized packages. Contact us for detailed pricing information."
    },
    {
      question: "What is your success rate?",
      answer: "We maintain a 95% success rate with over 5000+ students successfully placed in top universities worldwide over the past 15 years."
    },
    {
      question: "Which countries do you cover?",
      answer: "We specialize in six major study destinations: USA, UK, Canada, Australia, Germany, and Ireland, with partnerships across 1600+ universities."
    },
    {
      question: "How long does the application process take?",
      answer: "The timeline varies by country and university, but typically ranges from 3-6 months. We recommend starting at least 8-12 months before your intended intake."
    },
    {
      question: "Do you help with scholarships?",
      answer: "Yes! We provide comprehensive scholarship guidance and help you identify and apply for various scholarship opportunities to make your education more affordable."
    }
  ];

  useEffect(() => {
    document.documentElement.style.scrollPaddingTop = "72px";
    return () => { document.documentElement.style.scrollPaddingTop = ""; };
  }, []);

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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const goToStudentLogin = () => {
    navigate("/student-login", {
      state: { redirectTo: location.pathname + location.search },
    });
  };

  // ❌ remove this block (no longer render login here)
  // if (currentView === "student-auth") {
  //   return <StudentLoginRegister onBack={() => setCurrentView("landing")} onLogin={() => setCurrentView("student")} />;
  // }

  if (currentView === "login") {
    return (
      <LoginSelection
        onStudentLogin={goToStudentLogin} // ✅ proper navigation
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

  const scrollToDestinations = () => {
    const el = document.getElementById("study-destinations");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToFeatures = () => {
    const el = document.getElementById("why-choose-us");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToCta = () => {
    const el = document.getElementById("cta");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ Navigate to CollegesListPage with the clicked country (via query param)
  const goToColleges = (countryName) => {
    navigate(`/colleges?country=${encodeURIComponent(countryName)}`);
  };

  const goToJourney = () => {
    navigate("/journey", {
      state: { from: location.pathname + location.search },
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing! We'll send updates to ${email}`);
      setEmail("");
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const CountUp = ({ end, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        },
        { threshold: 0.5 }
      );

      if (countRef.current) {
        observer.observe(countRef.current);
      }

      return () => {
        if (countRef.current) {
          observer.unobserve(countRef.current);
        }
      };
    }, [isVisible]);

    useEffect(() => {
      if (!isVisible) return;

      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return <span ref={countRef}>{count}{suffix}</span>;
  };

  return (
    <div className="min-h-screen bg-background page-content overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-16 flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <div className="sm:hidden text-lg font-extrabold text-primary">SlotPilot</div>
            </div>

            {/* ✅ Student Login button (top right) */}
            <div className="min-w-[120px] flex justify-end">
              <Button
                type="button"
                onClick={goToStudentLogin} // ✅ navigate to StudentLoginRegister page (route)
                className="font-semibold"
              >
                Student Login
              </Button>
            </div>

            {/* Centered brand (desktop) */}
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
      <section className="relative min-h-[50vh] sm:min-h-[90vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(37, 99, 235, 0.85), rgba(16, 185, 129, 0.75)), url(${heroImage})`,
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />

        <div className="relative max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground z-10">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Badge className="mb-4 text-xs sm:text-sm px-4 py-2 bg-white/20 backdrop-blur-md border-white/30">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2 fill-yellow-400 text-yellow-400" />
              Trusted by 5000+ Students Worldwide
            </Badge>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              Your Gateway to
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-rose-300 bg-clip-text text-transparent animate-pulse">
                Global Education
              </span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl mb-8 sm:mb-10 max-w-full sm:max-w-3xl mx-auto opacity-95 leading-relaxed">
              Transform your academic dreams into reality with expert guidance for Masters programs
              in USA, UK, Canada, Ireland, Germany, and Australia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={goToJourney}
                className="bg-white text-blue-600 hover:bg-blue-50 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToDestinations}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full transition-all duration-300 w-full sm:w-auto"
              >
                Explore Destinations
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 to-teal-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {statistics.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div key={index} className="text-center transform hover:scale-110 transition-all duration-300">
                  <div className="mb-3 flex justify-center">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                      <StatIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-5xl font-bold mb-2">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm sm:text-base opacity-90">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section id="study-destinations" className="py-20 bg-gradient-to-br from-secondary to-background relative">
        <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge className="mb-4 px-4 py-2" variant="outline">
              <Globe className="w-4 h-4 mr-2" />
              6 Countries, 1600+ Universities
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Study Destinations
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from top universities across 6 countries offering world-class education and career opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country, index) => (
              <Card
                key={index}
                className="group shadow-card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 hover:border-blue-500 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-4 sm:p-6 text-center relative z-10">
                  <div className="text-5xl sm:text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{country.flag}</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{country.name}</h3>
                  <Badge variant="secondary" className="mb-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    {country.universities} Universities
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore opportunities in top-ranked institutions
                  </p>

                  <Button
                    type="button"
                    className="w-full group-hover:bg-blue-600 transition-colors duration-300"
                    onClick={() => goToColleges(country.name)}
                  >
                    Explore Universities
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="why-choose-us" className="py-20 bg-background">
        <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2" variant="outline">
              <CheckCircle className="w-4 h-4 mr-2" />
              Our Commitment
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Why Choose Us?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide comprehensive support throughout your international education journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group shadow-card hover:shadow-2xl transition-all duration-500 text-center border-2 hover:border-blue-500 transform hover:-translate-y-2"
                >
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FeatureIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="py-20 bg-gradient-to-br from-secondary to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Your Success Roadmap
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Our Process
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              A systematic approach to ensure your success at every step
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-600 to-teal-500" />

            <div className="space-y-12">
              {processSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isEven = index % 2 === 0;
                return (
                  <div key={index} className="relative">
                    <div className={`flex flex-col lg:flex-row items-center gap-8 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                      <div className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'}`}>
                        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold">
                                {step.step}
                              </div>
                              <h3 className="text-xl font-bold">{step.title}</h3>
                            </div>
                            <p className="text-muted-foreground">{step.description}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="hidden lg:flex flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 items-center justify-center shadow-lg z-10">
                        <StepIcon className="w-8 h-8 text-white" />
                      </div>

                      <div className="flex-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2" variant="outline">
              <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
              Success Stories
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              What Our Students Say
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Real experiences from students who achieved their dreams with SlotPilot
            </p>
          </div>

          <div className="relative">
            <Card className="shadow-2xl border-2">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold mb-6">
                    {testimonials[currentTestimonial].image}
                  </div>

                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-lg sm:text-xl text-muted-foreground mb-6 italic leading-relaxed max-w-2xl">
                    "{testimonials[currentTestimonial].text}"
                  </p>

                  <div>
                    <h4 className="text-xl font-bold">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-muted-foreground">{testimonials[currentTestimonial].university}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full hover:bg-blue-600 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full hover:bg-blue-600 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-secondary to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2" variant="outline">
              <CheckCircle className="w-4 h-4 mr-2" />
              Got Questions?
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to common questions about our services
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 bg-card shadow-md hover:shadow-lg transition-shadow">
                <AccordionTrigger className="text-left font-semibold hover:text-blue-600 transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-teal-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 px-4 py-2 bg-white/20 backdrop-blur-md border-white/30">
            <Mail className="w-4 h-4 mr-2" />
            Stay Updated
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Get the latest updates on university deadlines, scholarships, and study abroad tips
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white text-gray-900 border-0 h-12"
              required
            />
            <Button type="submit" size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8">
              Subscribe
            </Button>
          </form>

          <p className="text-sm opacity-75 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 bg-gradient-to-br from-blue-600 via-teal-500 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-300 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg sm:text-xl mb-10 opacity-95 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful students who have achieved their dreams of studying abroad with our expert guidance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={goToJourney}
              className="bg-white text-blue-600 hover:bg-blue-50 text-base sm:text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 w-full sm:w-auto"
            >
              Schedule Free Consultation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={goToStudentLogin}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-base sm:text-lg px-8 py-6 rounded-full transition-all duration-300 w-full sm:w-auto"
            >
              Login to Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                    SLOT
                  </span>
                  <span className="bg-gradient-to-r from-teal-400 to-orange-400 bg-clip-text text-transparent">
                    PILOT
                  </span>
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Your trusted partner in international education. Helping students achieve their dreams of studying abroad since 2009.
              </p>
              <div className="flex gap-3">
                <Button size="icon" variant="outline" className="rounded-full bg-white/10 border-white/20 hover:bg-white hover:text-blue-600">
                  <Globe className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full bg-white/10 border-white/20 hover:bg-white hover:text-blue-600">
                  <Mail className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full bg-white/10 border-white/20 hover:bg-white hover:text-blue-600">
                  <Phone className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#study-destinations" className="hover:text-white transition-colors">Study Destinations</a></li>
                <li><a href="#why-choose-us" className="hover:text-white transition-colors">Why Choose Us</a></li>
                <li><a href="/journey" className="hover:text-white transition-colors">Schedule Consultation</a></li>
                <li><a href="/colleges" className="hover:text-white transition-colors">Universities</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><button onClick={scrollToCta} className="hover:text-white transition-colors text-left">Contact Us</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                © 2024 SlotPilot Consultancy. All rights reserved. Empowering students worldwide.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPinIcon className="w-4 h-4" />
                <span>Serving students globally from our offices worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;