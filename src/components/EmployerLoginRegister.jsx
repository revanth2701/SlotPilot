import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { supabase } from "@/integrations/supabase/client";
import { Building2, Mail, Lock } from "lucide-react";


const EmployerLoginRegister = ({ onBack }) => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const email = loginData.email.trim();
    const password = loginData.password;

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoginError("Invalid email or password.");
      setLoginLoading(false);
      return;
    }

    const { data: employer, error: employerError } = await supabase
      .from('EmployerData')
      .select('*')
      .eq('Mail Id', email)
      .maybeSingle();

    if (employerError) {
      setLoginError("Login failed. Please try again.");
      setLoginLoading(false);
      return;
    }
    if (!employer) {
      setLoginError("You are not registered as an employer.");
      setLoginLoading(false);
      return;
    }

    setLoginError("");
    setLoginLoading(false);
    navigate("/admin/dashboard", { replace: true });
  };



  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/20 transition-colors duration-300">
      {/* Header Tag Added Here */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-16 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-extrabold tracking-tight leading-none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-rose-500">
                  SlotPilot
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Global Education & Visa Services</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-2 border-primary/10">
            <CardHeader className="text-center pb-4">
              <div className="flex flex-col items-center gap-2 mb-2">
                <Building2 className="h-10 w-10 text-primary drop-shadow-lg" />
                <span className="text-3xl font-extrabold bg-gradient-to-r from-primary via-blue-500 to-accent bg-clip-text text-transparent tracking-tight">
                  Employer Portal
                </span>
              </div>
              <CardTitle className="text-2xl font-bold mb-1">Sign In</CardTitle>
              <CardDescription className="text-muted-foreground mb-2">
                Access your employer dashboard to find top talent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 bg-background"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary underline hover:text-accent ml-2"
                      onClick={async () => {
                        if (!loginData.email) {
                          alert('Please enter your email first.');
                          return;
                        }
                        const { error } = await supabase.auth.resetPasswordForEmail(loginData.email);
                        if (error) {
                          alert('Failed to send reset email.');
                        } else {
                          alert('Password reset email sent!');
                        }
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10 bg-background"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full font-bold text-lg py-3 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg text-white"
                >
                  {loginLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                {loginError && (
                  <div className="mt-3 text-destructive text-sm text-center font-medium">
                    {loginError}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
          <div className="text-center mt-6 flex flex-col gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerLoginRegister;