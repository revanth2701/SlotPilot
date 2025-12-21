import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// use relative imports instead of "@/..." aliases to avoid resolution issues
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { FileText, User, MapPin, Send, Home, Globe } from 'lucide-react';
import { supabase } from "../utils/supabaseClient";

const TABLE_NAME = "Visaappointments";

const VisaApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, visaType, flag } = location.state || {};

  // ✅ Always start at top when this page loads
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    travelPurpose: '',
    intendedStayDuration: '',
    address: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, title, message, autoHide = true) => {
    setNotification({ type, title, message });
    if (autoHide) setTimeout(() => setNotification(null), 5000);
    if (type === 'error') console.error(title, message);
    else console.info(title, message);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const required = ['firstName','lastName','email','phone','dateOfBirth','nationality','passportNumber','travelPurpose','intendedStayDuration','address'];
    for (const key of required) {
      if (!formData[key] || !String(formData[key]).trim()) {
        showNotification('error', 'Missing required field', 'Please fill all required fields before submitting.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (!supabase || typeof supabase.from !== 'function') {
        showNotification('error', 'Configuration error', 'Database client is not configured. Contact admin.');
        setIsSubmitting(false);
        return;
      }

      // build payload using the exact column names you provided
      let insertPayload = {
        "Passport Number": formData.passportNumber,
        "First Name": formData.firstName,
        "Last Name": formData.lastName,
        "Address": formData.address,
        "Contact Number": formData.phone,
        "Mail id": formData.email,
        "DOB": formData.dateOfBirth,
        "Nationality": formData.nationality,
        "Purpose of Travel": formData.travelPurpose,
        "Length of Stay": formData.intendedStayDuration,
        "Country": country || null
      };

      // Attempt insert and handle missing-column errors by stripping unknown columns and retrying once.
      let attempt = 0;
      let lastError = null;

      while (attempt < 2) {
        const res = await supabase.from(TABLE_NAME).insert([insertPayload]);
        const error = res?.error || (res instanceof Error ? res : null);
        const data = res?.data ?? null;
        console.info("Supabase insert attempt", attempt + 1, { data, error });

        if (!error) {
          // show notification and set success state so UI displays the success message
          showNotification('success', 'Application Submitted', `Your ${visaType || 'visa'} application has been received.`);
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            nationality: '',
            passportNumber: '',
            travelPurpose: '',
            intendedStayDuration: '',
            address: ''
          });
          setIsSubmitting(false);
          setSubmissionSuccess(true);
          // do not auto-navigate away immediately so user sees success
          return;
        }

        lastError = error;
        const msg = error?.message || String(error);

        // detect missing-column messages like: Could not find the 'country' column...
        const missing = [...msg.matchAll(/Could not find the '([^']+)' column/g)].map(m => m[1]);

        if (missing.length === 0) break;

        // drop reported missing columns from payload and retry
        missing.forEach(col => {
          if (col in insertPayload) delete insertPayload[col];
          const camel = col.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          if (camel in insertPayload) delete insertPayload[camel];
          const snake = col.replace(/([A-Z])/g, m => `_${m.toLowerCase()}`);
          if (snake in insertPayload) delete insertPayload[snake];
          console.warn(`Dropped unknown column from payload: ${col}`);
        });

        attempt += 1;
      }

      const message = lastError?.message || 'Unable to save your application. Please try again later.';
      showNotification('error', 'Submission failed', message);
      setIsSubmitting(false);
      return;
    } catch (err) {
      console.error("Unexpected error while submitting visa application:", err);
      showNotification('error', 'An error occurred', String(err?.message || err));
      setIsSubmitting(false);
    }
  };

  if (!country || !visaType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">Invalid application request</p>
            <Button onClick={() => navigate('/visa-services')}>Return to Visa Services</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // show success screen after successful submit
  if (submissionSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
        <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="py-8 px-6 text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-inner animate-pulse">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-foreground mb-2">You're all set!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Thanks — we received your application for <strong>{country}</strong>. A visa consultant will contact you within 24 hours with next steps.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center px-6">
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => setSubmissionSuccess(false)}
              >
                Submit another
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => navigate("/visa-services", { replace: true })}
              >
                <Globe className="w-4 h-4 mr-2" />
                Visa Services
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate("/", { replace: true })}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
              Need faster help? Reply to the confirmation email or contact support.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/10 relative">
      {/* Loading overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white/90 rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-foreground" />
            <div className="text-sm font-medium">Submitting application...</div>
          </div>
        </div>
      )}

      {/* Header (centered title + proper navigation, no "Back" button) */}
      <header className="relative z-10 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm border-b">
        <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{flag}</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {country} Visa Application
                </h1>
                <p className="text-muted-foreground">
                  {visaType}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Visa Application Form
            </CardTitle>
            <CardDescription>
              Please fill out all required information accurately. Our visa consultants will review your application and contact you for next steps.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Notification (reworked — floating toast) */}
            {notification && (
              <div className="fixed top-6 right-6 z-50 animate-fade-in">
                <div
                  className={`max-w-sm w-full flex items-start gap-3 p-4 rounded-xl shadow-lg ring-1 ${
                    notification.type === 'error'
                      ? 'bg-red-50 text-red-900 ring-red-200'
                      : 'bg-white text-green-900 ring-green-100'
                  }`}
                >
                  <div className={`p-2 rounded-full ${notification.type === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
                    {notification.type === 'error' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-700">
                        <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="transparent"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-700">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold leading-tight">{notification.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{notification.message}</div>
                  </div>

                  <button
                    onClick={() => setNotification(null)}
                    aria-label="Close notification"
                    className="ml-3 text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      placeholder="Enter your nationality"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number *</Label>
                  <Input
                    id="passportNumber"
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                    placeholder="Enter your passport number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address (complete) *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                    required
                  />
                </div>

                {/* Country (auto-filled from the selected service) */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={country || ""}
                    readOnly
                    // keep the country visible to user; it's auto-filled from the selected service
                  />
                </div>
              </div>

              {/* Travel Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Travel Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="travelPurpose">Purpose of Travel *</Label>
                  <Textarea
                    id="travelPurpose"
                    value={formData.travelPurpose}
                    onChange={(e) => handleInputChange('travelPurpose', e.target.value)}
                    placeholder="Describe the purpose of your travel"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intendedStayDuration">Intended Duration of Stay *</Label>
                  <Input
                    id="intendedStayDuration"
                    value={formData.intendedStayDuration}
                    onChange={(e) => handleInputChange('intendedStayDuration', e.target.value)}
                    placeholder="e.g., 2 weeks, 3 months, 1 year"
                    required
                  />
                </div>
              </div>

              {/* Submission */}
              <div className="pt-6 border-t">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Our visa consultant will review your application within 24 hours</li>
                    <li>• You'll receive an email with document requirements and next steps</li>
                    <li>• Schedule a consultation call to discuss your application in detail</li>
                    <li>• Get personalized guidance throughout the visa process</li>
                  </ul>
                </div>

                <Button 
                  type="submit"
                  className="w-full"
                  variant="hero"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Visa Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VisaApplication;