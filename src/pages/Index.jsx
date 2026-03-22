import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import LoginSelection from "@/components/LoginSelection";
import EmployerLoginRegister from "@/components/EmployerLoginRegister";
import StudentDashboardNew from "@/components/StudentDashboardNew";
import EmployerDashboard from "@/components/EmployerDashboard";
import { GraduationCap, Globe, Users, CheckCircle, MapPin, TrendingUp, Award, Clock, Star, ArrowRight, Mail, Phone, MapPinIcon, ChevronLeft, ChevronRight,Home } from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";
import { motion, useInView } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState("landing");
  const [scrollY, setScrollY] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [scrollDirection, setScrollDirection] = useState("down");

  const countries = [
    { name: "United States", flag: "🇺🇸", universities: "500+", flagImg: "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" },
    { name: "United Kingdom", flag: "🇬🇧", universities: "200+", flagImg: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg" },
    { name: "Canada", flag: "🇨🇦", universities: "300+", flagImg: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg" },
    { name: "Australia", flag: "🇦🇺", universities: "150+", flagImg: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg" },
    { name: "Germany", flag: "🇩🇪", universities: "400+", flagImg: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg" },
    { name: "Ireland", flag: "🇮🇪", universities: "50+", flagImg: "https://upload.wikimedia.org/wikipedia/commons/4/45/Flag_of_Ireland.svg" }
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
    { step: 5, title: "Pre-Departure", description: "Comprehensive pre-departure briefing and support services", icon: Award },
    { step: 6, title: "Accommodation",description: "Assistance in finding safe, convenient, and affordable housing options", icon: Home }
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.key]);

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
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }
      lastScrollY = currentScrollY;
    };
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

  if (currentView === "login") {
    return (
      <LoginSelection
        onStudentLogin={goToStudentLogin}
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

  const goToColleges = (countryName) => {
    navigate(`/colleges?country=${encodeURIComponent(countryName)}`);
  };

  const goToJourney = () => {
    navigate("/journey", {
      state: { from: location.pathname + location.search },
    });
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
      <nav className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-[120px]">
              <div className="sm:hidden text-lg font-extrabold text-primary">SlotPilot</div>
            </div>

            <div className="min-w-[120px] flex justify-end">
              <Button
                type="button"
                onClick={goToStudentLogin}
                className="font-semibold min-h-[44px]"
              >
                Student Login
              </Button>
            </div>

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

            <h1 className="font-bold mb-4 sm:mb-6 leading-tight" style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)" }}>
              Your Gateway to
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-rose-300 bg-clip-text text-transparent animate-pulse">
                Global Education
              </span>
            </h1>

            <p className="mb-8 sm:mb-10 max-w-full sm:max-w-3xl mx-auto opacity-95 leading-relaxed" style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}>
              Transform your academic dreams into reality with expert guidance for Masters programs
              in USA, UK, Canada, Ireland, Germany, and Australia.
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

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

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {countries.map((country, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                style={{ aspectRatio: '4 / 3' }}
                onClick={() => goToColleges(country.name)}
              >
                {/* Flag Background */}
                <img
                  src={country.flagImg}
                  alt={`${country.name} flag`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Dark Glass Overlay */}
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[4px] group-hover:bg-black/30 group-hover:backdrop-blur-[2px] transition-all duration-500" />

                {/* Mini Circular Flag Badge */}
                <div className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full overflow-hidden border-2 border-white/40 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <img src={country.flagImg} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-6">
                  <h3
                    className="text-white font-extrabold tracking-tight mb-1 drop-shadow-lg"
                    style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}
                  >
                    {country.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-white text-[11px] font-semibold">
                      <MapPin className="w-3 h-3" />
                      {country.universities} Universities
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium group-hover:text-white transition-colors duration-300">
                    Explore Universities
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="why-choose-us" className="py-20 bg-background overflow-hidden">
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

    {/* The Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => {
        const FeatureIcon = feature.icon;

        return (
          <motion.div
            key={index}
            className="h-full"
            initial={{ 
              opacity: 0,
              y: 30
            }}
            whileInView={{ 
              opacity: 1,
              y: 0
            }}
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 15,
              delay: index * 0.1
            }}
          >
            <Card
              className="group h-full flex flex-col shadow-card hover:shadow-2xl transition-all duration-500 text-center border-2 hover:border-blue-500 transform bg-card"
            >
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FeatureIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
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
                
                // Using a separate component for the step to manage local state cleanly
                return (
                  <ProcessStepItem 
                    key={index} 
                    step={step} 
                    isEven={isEven} 
                    StepIcon={StepIcon} 
                    scrollDirection={scrollDirection}
                    globalScrollY={scrollY}
                  />
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
                className="rounded-full hover:bg-blue-600 hover:text-white transition-colors min-w-[44px] min-h-[44px]"
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
                className="rounded-full hover:bg-blue-600 hover:text-white transition-colors min-w-[44px] min-h-[44px]"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}

<section className="py-20 bg-gradient-to-br from-secondary to-background overflow-x-hidden">
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
        <motion.div
          key={index}
          initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <AccordionItem
            value={`item-${index}`}
            className="border rounded-lg px-6 bg-card shadow-md hover:shadow-lg transition-shadow"
          >
            <AccordionTrigger className="text-left font-semibold hover:text-blue-600 transition-colors py-4">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        </motion.div>
      ))}
    </Accordion>
  </div>
</section>

      {/* CTA Section */}
<section id="cta" className="py-20 bg-blue-900 text-white relative overflow-hidden">
  {/* 1. The Video Background */}
  <video
    autoPlay
    loop
    muted
    playsInline
    preload="auto"
    className="absolute inset-0 w-full h-full object-cover z-0"
  >
    {/* Ensure the filename here matches exactly what you put in the public folder */}
    <source src="/bg-video.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  {/* 2. The Overlay (Crucial: This sits between the video and the text) */}
  <div className="absolute inset-0 bg-black/20 z-10" />

  {/* 3. The Content (Must have a higher z-index to be visible and clickable) */}
  <div className="max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
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

// Sub-component to handle the reset-at-top logic
const ProcessStepItem = ({ step, isEven, StepIcon, scrollDirection, globalScrollY }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Trigger animation ONLY when scrolling DOWN
  useEffect(() => {
    if (isInView && scrollDirection === "down") {
      setHasAnimated(true);
    }
  }, [isInView, scrollDirection]);

  // RESET state when user goes back to the very top of the page
  useEffect(() => {
    if (globalScrollY === 0) {
      setHasAnimated(false);
    }
  }, [globalScrollY]);

  return (
    <motion.div 
      ref={ref}
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
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
    </motion.div>
  );
};

export default Index;