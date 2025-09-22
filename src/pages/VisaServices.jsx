import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plane, MapPin, Clock, CheckCircle, Globe, Building2, Heart, Briefcase } from 'lucide-react';

const VisaServices = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const countries = [
    {
      id: 'usa',
      name: 'United States',
      flag: '🇺🇸',
      processingTime: '2-6 months',
      visaTypes: [
        { type: 'Tourist Visa (B-2)', description: 'For tourism, visiting friends/family', icon: Heart },
        { type: 'Business Visa (B-1)', description: 'For business meetings, conferences', icon: Briefcase },
        { type: 'Student Visa (F-1)', description: 'For academic studies', icon: Building2 },
        { type: 'Work Visa (H-1B)', description: 'For skilled employment', icon: Briefcase },
      ]
    },
    {
      id: 'canada',
      name: 'Canada',
      flag: '🇨🇦',
      processingTime: '2-8 weeks',
      visaTypes: [
        { type: 'Visitor Visa', description: 'For tourism and family visits', icon: Heart },
        { type: 'Study Permit', description: 'For students', icon: Building2 },
        { type: 'Work Permit', description: 'For temporary employment', icon: Briefcase },
        { type: 'Express Entry', description: 'For permanent residence', icon: Globe },
      ]
    },
    {
      id: 'uk',
      name: 'United Kingdom',
      flag: '🇬🇧',
      processingTime: '3-8 weeks',
      visaTypes: [
        { type: 'Standard Visitor', description: 'For tourism and business', icon: Heart },
        { type: 'Student Visa', description: 'For studies over 6 months', icon: Building2 },
        { type: 'Skilled Worker Visa', description: 'For skilled employment', icon: Briefcase },
        { type: 'Family Visa', description: 'For joining family members', icon: Heart },
      ]
    },
    {
      id: 'australia',
      name: 'Australia',
      flag: '🇦🇺',
      processingTime: '1-4 months',
      visaTypes: [
        { type: 'Tourist Visa (600)', description: 'For tourism and business', icon: Heart },
        { type: 'Student Visa (500)', description: 'For education', icon: Building2 },
        { type: 'Skilled Visa (189)', description: 'For skilled migration', icon: Briefcase },
        { type: 'Working Holiday (417)', description: 'For work and travel', icon: Globe },
      ]
    },
    {
      id: 'germany',
      name: 'Germany',
      flag: '🇩🇪',
      processingTime: '2-12 weeks',
      visaTypes: [
        { type: 'Schengen Visa', description: 'For short stays in EU', icon: Heart },
        { type: 'Student Visa', description: 'For academic studies', icon: Building2 },
        { type: 'Work Visa', description: 'For employment', icon: Briefcase },
        { type: 'Family Reunion', description: 'For joining family', icon: Heart },
      ]
    },
    {
      id: 'singapore',
      name: 'Singapore',
      flag: '🇸🇬',
      processingTime: '1-3 weeks',
      visaTypes: [
        { type: 'Tourist Visa', description: 'For tourism and business', icon: Heart },
        { type: 'Student Pass', description: 'For studies', icon: Building2 },
        { type: 'Employment Pass', description: 'For professionals', icon: Briefcase },
        { type: 'Dependent Pass', description: 'For family members', icon: Heart },
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
          <>
            {/* Country Selection */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Select Your Destination Country
              </h2>
              <p className="text-muted-foreground">
                Choose the country you want to visit or migrate to
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {countries.map((country) => (
                <Card 
                  key={country.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
                  onClick={() => handleCountrySelect(country)}
                >
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {country.flag}
                    </div>
                    <CardTitle className="text-xl">{country.name}</CardTitle>
                    <CardDescription className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      Processing: {country.processingTime}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Available Visa Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {country.visaTypes.slice(0, 3).map((visa, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {visa.type.split(' ')[0]}
                          </Badge>
                        ))}
                        {country.visaTypes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{country.visaTypes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      <MapPin className="w-4 h-4 mr-2" />
                      View Visa Options
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Visa Types for Selected Country */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCountry(null)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Countries
              </Button>
              
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedCountry.flag}</div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {selectedCountry.name} Visa Options
                </h2>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Processing Time: {selectedCountry.processingTime}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCountry.visaTypes.map((visa, index) => {
                const IconComponent = visa.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{visa.type}</CardTitle>
                          <CardDescription className="mt-1">
                            {visa.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Document guidance included</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Application review & support</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Interview preparation (if required)</span>
                        </div>
                        <Button 
                          onClick={() => handleApplyVisa(visa)}
                          className="w-full mt-4"
                          variant="hero"
                        >
                          <Plane className="w-4 h-4 mr-2" />
                          Apply for {visa.type}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default VisaServices;