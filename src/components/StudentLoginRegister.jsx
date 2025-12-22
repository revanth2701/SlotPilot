import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ add useNavigate
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Mail, Lock, User, Phone, Eye, EyeOff, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentLoginRegister = ({ onBack, onLogin }) => {
  const [activeTab, setActiveTab] = useState("login");
  const location = useLocation();
  const navigate = useNavigate(); // ✅ add

  // NEW: show a success note after returning from email verification
  const [showEmailVerifiedBanner, setShowEmailVerifiedBanner] = useState(false);

  // NEW: detect Supabase email-confirm redirect
  useEffect(() => {
    // Supabase email confirmation redirects back with tokens/errors in the URL hash or query.
    // We treat "access_token" or "type=signup" as a successful verification signal.
    const hash = (window.location.hash || "").toLowerCase();
    const search = (window.location.search || "").toLowerCase();

    const isLikelyVerified =
      hash.includes("access_token=") ||
      hash.includes("type=signup") ||
      search.includes("type=signup") ||
      search.includes("access_token=");

    const hasError =
      hash.includes("error=") ||
      hash.includes("error_description=") ||
      search.includes("error=") ||
      search.includes("error_description=");

    if (isLikelyVerified && !hasError) {
      setShowEmailVerifiedBanner(true);
      setActiveTab("login");

      // Optional: show toast too
      // (banner stays until user dismisses)
      // eslint-disable-next-line no-unused-expressions
      // toast({ title: "Email verified", description: "Your account is confirmed. Please sign in." });

      // Clean up URL tokens so refresh/back doesn't re-trigger the banner
      try {
        window.history.replaceState({}, "", window.location.pathname);
      } catch {
        // ignore
      }
    }
  }, []);

  // Listen for browser back arrow and set tab to login
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab("login");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    firstName: "",
    surname: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    confirm: false
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const validatePassword = (password) => {
    const checks = [
      { test: password.length >= 8, message: "At least 8 characters" },
      { test: /[A-Z]/.test(password), message: "One uppercase letter" },
      { test: /[a-z]/.test(password), message: "One lowercase letter" },
      { test: /\d/.test(password), message: "One number" },
      { test: /[!@#$%^&*]/.test(password), message: "One special character" }
    ];

    const passed = checks.filter(check => check.test).length;
    return {
      score: passed,
      feedback: checks
    };
  };

  const handlePasswordChange = (password) => {
    setRegisterData({ ...registerData, password });
    setPasswordStrength(validatePassword(password));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        return;
      }

      const user = signInData?.user;
      const session = signInData?.session;

      if (!user || !session) {
        toast({
          title: "Login failed",
          description: "Unable to start a session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const isEmailVerified = Boolean(user.email_confirmed_at || user.confirmed_at);
      if (!isEmailVerified) {
        toast({
          title: "Email not verified",
          description: "Please verify your email first, then sign in again.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      toast({ title: "Logged in", description: "Welcome back!" });

      // ✅ Navigate to the route that renders StudentDashboardNew.jsx
      navigate("/student-dashboard-new", { replace: true });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setRegisterLoading(true);

    try {
      // Keep redirect back to the same origin; ideally this should be the route that renders this component
      const redirectUrl = `${window.location.origin}/`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: { emailRedirectTo: redirectUrl }
      });

      if (authError) {
        toast({ title: "Registration failed", description: authError.message, variant: "destructive" });
        return;
      }

      const { error: dataError } = await supabase
        .from('StudentData')
        .insert([
          {
            'First Name': registerData.firstName,
            'Last Name': registerData.surname,
            'Mailid': registerData.email,
            'Contact Number': parseInt(registerData.contactNumber),
            'dtCreatedon': new Date().toISOString().split('T')[0],
            'Registrationid': Math.floor(Math.random() * 1000000)
          }
        ]);

      if (dataError) {
        console.error('Error saving student data:', dataError);
        toast({
          title: "Registration successful",
          description: "Check your email to confirm. Note: Some profile data may need to be re-entered.",
          variant: "default"
        });
      } else {
        toast({ title: "Registration successful", description: "Check your email to confirm your account." });
      }

    } catch (error) {
      console.error('Registration error:', error);
      toast({ title: "Registration failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setRegisterLoading(false);
    }
  };

  // Listen for location changes and reset to login tab if coming back
  // Removed this useEffect as it was causing infinite reloads
  // useEffect(() => {
  //   setActiveTab("login");
  // }, [location.key]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Student Portal
          </h1>
          <p className="text-muted-foreground text-lg">
            Access your student dashboard to manage your applications
          </p>
        </div>

        {/* NEW: success note after email verification */}
        {showEmailVerifiedBanner && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-900 shadow-sm">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 mt-0.5 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold">Email verified successfully</p>
                <p className="text-sm text-green-800/90">
                  Your account is confirmed. Please sign in to continue.
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-green-800 hover:text-green-900"
                onClick={() => setShowEmailVerifiedBanner(false)}
                aria-label="Dismiss email verified message"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
            <CardDescription className="text-base">
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-base font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email address"
                        className="pl-12 h-12 text-base border-2 focus:border-primary transition-all"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-base font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword.login ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-12 pr-12 h-12 text-base border-2 focus:border-primary transition-all"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-8 w-8 p-0"
                        onClick={() => setShowPassword({ ...showPassword, login: !showPassword.login })}
                      >
                        {showPassword.login ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all" 
                    disabled={loginLoading}
                    aria-busy={loginLoading}
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* ✅ NEW: Sign up link below Sign In button */}
                  <div className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("register")}
                      className="font-semibold text-primary hover:underline underline-offset-4"
                      aria-label="Go to sign up"
                    >
                      Click here to signup
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstname" className="text-base font-medium">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-firstname"
                          type="text"
                          placeholder="First name"
                          className="pl-12 h-12 text-base border-2 focus:border-primary transition-all"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-surname" className="text-base font-medium">Surname</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-surname"
                          type="text"
                          placeholder="Surname"
                          className="pl-12 h-12 text-base border-2 focus:border-primary transition-all"
                          value={registerData.surname}
                          onChange={(e) => setRegisterData({ ...registerData, surname: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-base font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email address"
                        className="pl-12 h-12 text-base border-2 focus:border-primary transition-all"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-contact" className="text-base font-medium">Contact Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-contact"
                        type="tel"
                        placeholder="Enter your contact number"
                        className="pl-12 h-12 text-base border-2 focus:border-primary transition-all"
                        value={registerData.contactNumber}
                        onChange={(e) => setRegisterData({ ...registerData, contactNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-base font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword.register ? "text" : "password"}
                        placeholder="Create a secure password"
                        className="pl-12 pr-12 h-12 text-base border-2 focus:border-primary transition-all"
                        value={registerData.password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-8 w-8 p-0"
                        onClick={() => setShowPassword({ ...showPassword, register: !showPassword.register })}
                      >
                        {showPassword.register ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {registerData.password && (
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 rounded-full flex-1 ${
                            passwordStrength.score < 2 ? 'bg-red-200' :
                            passwordStrength.score < 4 ? 'bg-yellow-200' : 'bg-green-200'
                          }`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrength.score < 2 ? 'bg-red-500' :
                                passwordStrength.score < 4 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            passwordStrength.score < 2 ? 'text-red-600' :
                            passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {passwordStrength.score < 2 ? 'Weak' : 
                             passwordStrength.score < 4 ? 'Good' : 'Strong'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {passwordStrength.feedback.map((check, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {check.test ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                              <span className={check.test ? 'text-green-700' : 'text-muted-foreground'}>
                                {check.message}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm" className="text-base font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-confirm"
                        type={showPassword.confirm ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-12 pr-12 h-12 text-base border-2 focus:border-primary transition-all"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-8 w-8 p-0"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      >
                        {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {registerData.confirmPassword && (
                      <div className="flex items-center gap-2 mt-2">
                        {registerData.password === registerData.confirmPassword ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-700">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-700">Passwords don't match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all" 
                    disabled={registerLoading || passwordStrength.score < 3 || registerData.password !== registerData.confirmPassword}
                    aria-busy={registerLoading}
                  >
                    {registerLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  {/* ✅ Optional: link back to login */}
                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="font-semibold text-primary hover:underline underline-offset-4"
                      aria-label="Go to sign in"
                    >
                      Sign in
                    </button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentLoginRegister;