import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plane, MapPin, Clock, CheckCircle, Globe, Building2, Heart, Briefcase, Star, Users } from 'lucide-react';

const VisaServices = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const countries = [
    {
      id: 'usa',
      name: 'United States',
      flag: '🇺🇸',
      processingTime: '2-6 months',
      popularity: 'Most Popular',
      successRate: '92%',
      description: 'Land of opportunities with world-class education and career prospects',
      visaTypes: [
        { type: 'Tourist Visa (B-2)', description: 'For tourism, visiting friends/family', icon: Heart, duration: '6 months', fee: '$160' },
        { type: 'Business Visa (B-1)', description: 'For business meetings, conferences', icon: Briefcase, duration: '6 months', fee: '$160' },
        { type: 'Student Visa (F-1)', description: 'For academic studies', icon: Building2, duration: 'Course duration', fee: '$350' },
        { type: 'Work Visa (H-1B)', description: 'For skilled employment', icon: Briefcase, duration: '3 years', fee: '$460' },
      ]
    },
    {
      id: 'canada',
      name: 'Canada',
      flag: '🇨🇦',
      processingTime: '2-8 weeks',
      popularity: 'High Demand',
      successRate: '95%',
      description: 'Friendly immigration policies and excellent quality of life',
      visaTypes: [
        { type: 'Visitor Visa', description: 'For tourism and family visits', icon: Heart, duration: '6 months', fee: '$100' },
        { type: 'Study Permit', description: 'For students', icon: Building2, duration: 'Course duration', fee: '$150' },
        { type: 'Work Permit', description: 'For temporary employment', icon: Briefcase, duration: '2 years', fee: '$155' },
        { type: 'Express Entry', description: 'For permanent residence', icon: Globe, duration: 'Permanent', fee: '$1,365' },
      ]
    },
    {
      id: 'uk',
      name: 'United Kingdom',
      flag: '🇬🇧',
      processingTime: '3-8 weeks',
      popularity: 'Popular',
      successRate: '88%',
      description: 'Rich history, excellent education system, and global business hub',
      visaTypes: [
        { type: 'Standard Visitor', description: 'For tourism and business', icon: Heart, duration: '6 months', fee: '£95' },
        { type: 'Student Visa', description: 'For studies over 6 months', icon: Building2, duration: 'Course duration', fee: '£348' },
        { type: 'Skilled Worker Visa', description: 'For skilled employment', icon: Briefcase, duration: '5 years', fee: '£610' },
        { type: 'Family Visa', description: 'For joining family members', icon: Heart, duration: '2.5 years', fee: '£1,523' },
      ]
    },
    {
      id: 'australia',
      name: 'Australia',
      flag: '🇦🇺',
      processingTime: '1-4 months',
      popularity: 'Growing',
      successRate: '91%',
      description: 'Beautiful landscapes, excellent work-life balance, and strong economy',
      visaTypes: [
        { type: 'Tourist Visa (600)', description: 'For tourism and business', icon: Heart, duration: '3-12 months', fee: '$145' },
        { type: 'Student Visa (500)', description: 'For education', icon: Building2, duration: 'Course duration', fee: '$620' },
        { type: 'Skilled Visa (189)', description: 'For skilled migration', icon: Briefcase, duration: 'Permanent', fee: '$4,115' },
        { type: 'Working Holiday (417)', description: 'For work and travel', icon: Globe, duration: '1 year', fee: '$485' },
      ]
    },
    {
      id: 'germany',
      name: 'Germany',
      flag: '🇩🇪',
      processingTime: '2-12 weeks',
      popularity: 'Emerging',
      successRate: '87%',
      description: 'Economic powerhouse with excellent job opportunities and free education',
      visaTypes: [
        { type: 'Schengen Visa', description: 'For short stays in EU', icon: Heart, duration: '90 days', fee: '€80' },
        { type: 'Student Visa', description: 'For academic studies', icon: Building2, duration: 'Course duration', fee: '€75' },
        { type: 'Work Visa', description: 'For employment', icon: Briefcase, duration: '4 years', fee: '€75' },
        { type: 'Family Reunion', description: 'For joining family', icon: Heart, duration: '3 years', fee: '€75' },
      ]
    },
    {
      id: 'singapore',
      name: 'Singapore',
      flag: '🇸🇬',
      processingTime: '1-3 weeks',
      popularity: 'Fast Track',
      successRate: '94%',
      description: 'Gateway to Asia with excellent business opportunities and modern lifestyle',
      visaTypes: [
        { type: 'Tourist Visa', description: 'For tourism and business', icon: Heart, duration: '30 days', fee: '$30' },
        { type: 'Student Pass', description: 'For studies', icon: Building2, duration: 'Course duration', fee: '$30' },
        { type: 'Employment Pass', description: 'For professionals', icon: Briefcase, duration: '2 years', fee: '$105' },
        { type: 'Dependent Pass', description: 'For family members', icon: Heart, duration: '2 years', fee: '$105' },
      ]
    }
  ];

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  const handleApplyVisa = (visaType) => {
    // Navigate to application form with country and visa type
    navigate('/visa-application', { 
      state: { 
        country: selectedCountry.name, 
        visaType: visaType.type,
        flag: selectedCountry.flag 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-md border-b border-primary/20 shadow-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-hero bg-clip-text text-transparent tracking-tight">
                SlotPilot Visa Services
              </h1>
              <p className="text-lg text-primary font-bold tracking-wider mt-1 uppercase">
                Worldwide Visa Assistance
              </p>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedCountry ? (
          <div className="animate-fade-in">
            {/* Country Selection */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Discover Your Destination
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Choose from our carefully curated list of countries. Each destination offers unique opportunities 
                and experiences tailored to your visa needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {countries.map((country, index) => (
                <Card 
                  key={country.id}
                  className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-primary/30 bg-gradient-to-br from-background to-primary/5 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCountrySelect(country)}
                >
                  <CardHeader className="text-center pb-4 relative">
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {country.popularity}
                      </Badge>
                    </div>
                    <div className="text-7xl mb-6 group-hover:scale-125 transition-transform duration-500 animate-bounce">
                      {country.flag}
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">{country.name}</CardTitle>
                    <CardDescription className="text-base mb-4 text-muted-foreground leading-relaxed">
                      {country.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">Processing: {country.processingTime}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-medium">Success Rate: {country.successRate}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Available Visa Types:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {country.visaTypes.slice(0, 3).map((visa, index) => (
                            <Badge key={index} variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                              {visa.type.split(' ')[0]}
                            </Badge>
                          ))}
                          {country.visaTypes.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{country.visaTypes.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 h-auto group-hover:shadow-lg transition-all duration-300" 
                        size="lg"
                      >
                        <MapPin className="w-5 h-5 mr-2" />
                        Explore {country.name} Visas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Visa Types for Selected Country */}
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => setSelectedCountry(null)}
                className="mb-6 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Countries
              </Button>
              
              <div className="text-center mb-8">
                <div className="text-8xl mb-6 animate-bounce">{selectedCountry.flag}</div>
                <h2 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {selectedCountry.name} Visa Services
                </h2>
                <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
                  {selectedCountry.description}
                </p>
                <div className="flex items-center justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-medium">Processing: {selectedCountry.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <span className="font-medium">Success Rate: {selectedCountry.successRate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {selectedCountry.visaTypes.map((visa, index) => {
                const IconComponent = visa.icon;
                return (
                  <Card 
                    key={index} 
                    className="hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/30 bg-gradient-to-br from-background to-primary/5 hover:scale-105 animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                          <IconComponent className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{visa.type}</CardTitle>
                          <CardDescription className="text-base leading-relaxed">
                            {visa.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Visa Details */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="font-semibold text-sm">{visa.duration}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Fee</p>
                            <p className="font-semibold text-sm">{visa.fee}</p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>Complete document guidance & review</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>Application tracking & status updates</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>Interview preparation (if required)</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>24/7 expert consultation support</span>
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleApplyVisa(visa)}
                          className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 h-auto hover:shadow-lg transition-all duration-300"
                          size="lg"
                        >
                          <Plane className="w-5 h-5 mr-2" />
                          Apply for {visa.type}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
      </main>
    </div>
  );
};

export default VisaServices;