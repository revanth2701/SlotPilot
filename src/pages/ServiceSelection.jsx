import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GraduationCap, Plane, Building2, Globe, Users, TrendingUp, Award, Clock, Star, ArrowRight, Mail, Phone, MapPinIcon, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';


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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
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
  const [scrollY, setScrollY] = useState(0);
  const [email, setEmail] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const statistics = [
    { value: 15000, suffix: "+", label: "Visas Processed", icon: Globe },
    { value: 98, suffix: "%", label: "Success Rate", icon: TrendingUp },
    { value: 50, suffix: "+", label: "Countries Covered", icon: MapPinIcon },
    { value: 20, suffix: "+", label: "Years Experience", icon: Award }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      service: "Student Visa - USA",
      text: "SlotPilot made my F1 visa process incredibly smooth. Their expertise and guidance helped me get approval on my first attempt!",
      rating: 5,
      image: "PS"
    },
    {
      name: "David Martinez",
      service: "Work Visa - Canada",
      text: "Professional and efficient service. They handled all my documentation and I received my work permit faster than expected.",
      rating: 5,
      image: "DM"
    },
    {
      name: "Aisha Khan",
      service: "Higher Education - UK",
      text: "From university selection to visa approval, SlotPilot supported me at every step. Now I'm studying at my dream university!",
      rating: 5,
      image: "AK"
    },
    {
      name: "James Wilson",
      service: "Tourist Visa - Australia",
      text: "Quick, reliable, and hassle-free. Got my tourist visa approved without any complications. Highly recommended!",
      rating: 5,
      image: "JW"
    }
  ];

  const benefits = [
    { icon: CheckCircle, title: "End-to-End Support", description: "Complete assistance from documentation to approval" },
    { icon: Clock, title: "Fast Processing", description: "Quick turnaround times for all visa types" },
    { icon: Users, title: "Expert Consultants", description: "Experienced team with in-depth knowledge" },
    { icon: Award, title: "High Success Rate", description: "98% approval rate across all services" }
  ];

  const faqs = [
    {
      question: "What documents do I need for a student visa?",
      answer: "Required documents typically include a valid passport, admission letter from university, proof of financial support, academic transcripts, language proficiency test scores, and visa application forms. Our consultants will provide a comprehensive checklist based on your destination country."
    },
    {
      question: "How long does the visa process take?",
      answer: "Processing times vary by country and visa type. Student visas typically take 2-8 weeks, tourist visas 1-4 weeks, and work visas 4-12 weeks. We'll provide accurate timelines based on your specific case."
    },
    {
      question: "What is your success rate?",
      answer: "We maintain a 98% success rate across all our services. Our experienced consultants thoroughly review applications before submission to ensure the highest chances of approval."
    },
    {
      question: "Do you provide post-visa services?",
      answer: "Yes! We offer pre-departure guidance, accommodation assistance, airport pickup arrangements, and ongoing support after you reach your destination."
    },
    {
      question: "How much do your services cost?",
      answer: "Our fees vary based on the service and destination country. We offer transparent pricing with no hidden costs. Contact us for a detailed quote tailored to your needs."
    },
    {
      question: "Can you help with visa rejections?",
      answer: "Absolutely! We specialize in reapplication cases and have successfully helped many clients who faced initial rejections. We'll analyze your case and develop a strong reapplication strategy."
    }
  ];

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
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            {/* left placeholder */}
            <div className="w-32" />

            {/* center wordmark */}
            <div className="flex-1 flex justify-center">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  SlotPilot
                </h1>
                <p className="text-sm sm:text-base text-gray-300">
                  Your trusted hub for visa support and travel companions
                </p>
              </div>
            </div>

            {/* right: Explore Community button */}
            <div className="w-32 flex justify-end">
              <Button
                onClick={() => window.open('https://community.slotpilot.in', '_blank')}
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-3 sm:px-6 py-2 rounded-full shadow-lg transition-all duration-300 text-xs sm:text-base hidden sm:block"
              >
                Explore Community
              </Button>
              <Button
                onClick={() => window.open('https://community.slotpilot.in', '_blank')}
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-3 py-2 rounded-full shadow-lg transition-all duration-300 text-xs sm:hidden"
              >
                Community
              </Button>
            </div>
          </div>

          {/* Social media links */}
          <div className="flex justify-center gap-4 sm:gap-6">
            <a
              href="https://wa.me/your-number"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors text-sm sm:text-base font-medium"
            >
              WhatsApp
            </a>
            <a
              href="https://instagram.com/slotpilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 transition-colors text-sm sm:text-base font-medium"
            >
              Instagram
            </a>
            <a
              href="https://t.me/slotpilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base font-medium"
            >
              Telegram
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
               style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"
               style={{ transform: `translateY(${scrollY * -0.3}px)` }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Welcome to Global Travel Hub
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-300 leading-relaxed">
            Your one-stop platform for visa information, travel tips, and finding companions
          </p>

          <Button
            onClick={() => window.open('https://community.slotpilot.in', '_blank')}
            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            Explore Community
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">

        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Our Features
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Discover a community of travelers sharing experiences, advice, and opportunities to connect
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {/* Higher Education Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-2 hover:border-blue-500 bg-gradient-to-br from-background to-primary/5 transform hover:-translate-y-2">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
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
          <Card className="group hover:shadow-2xl transition-all duration-500 border-2 hover:border-teal-500 bg-gradient-to-br from-background to-secondary/5 transform hover:-translate-y-2">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-600 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Plane className="w-8 h-8 text-white" />
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
                type="button"
                onClick={() => navigate("/visa-start")}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold py-3 h-auto group-hover:shadow-xl transition-all"
                size="lg"
              >
                <Globe className="w-5 h-5 mr-2" />
                Apply for Visa
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Statistics Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 to-teal-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Track Record</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Numbers that speak for our commitment to excellence
            </p>
          </div>

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

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-secondary to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2" variant="outline">
              <CheckCircle className="w-4 h-4 mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Our Advantages
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the difference with our comprehensive service approach
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <Card
                  key={index}
                  className="group shadow-card hover:shadow-2xl transition-all duration-500 text-center border-2 hover:border-blue-500 transform hover:-translate-y-2"
                >
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BenefitIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2" variant="outline">
              <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
              Client Success Stories
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              What Our Clients Say
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Real experiences from clients who achieved their goals with SlotPilot
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
                    <p className="text-muted-foreground">{testimonials[currentTestimonial].service}</p>
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
            Get the latest updates on visa policies, education opportunities, and travel tips
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
                Your trusted partner in education and immigration. Helping clients achieve their global dreams since 2005.
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
                <li><button onClick={() => navigate('/higher-education')} className="hover:text-white transition-colors text-left">Higher Education</button></li>
                <li><button onClick={() => navigate('/visa-start')} className="hover:text-white transition-colors text-left">Visa Services</button></li>
                <li><a href="mailto:info@slotpilot.in" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms-of-service')} className="hover:text-white transition-colors text-left">Terms of Service</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                © 2025 SlotPilot Consultancy. All rights reserved. Empowering dreams globally.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPinIcon className="w-4 h-4" />
                <span>Serving clients worldwide from our global offices</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceSelection;