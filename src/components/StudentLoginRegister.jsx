import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Mail, Lock, User, Phone, FileText, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentLoginRegister = ({ onBack }) => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    firstName: "",
    surname: "",
    email: "",
    contactNumber: "",
    passportNumber: "",
    passportIssuedDate: "",
    passportExpiryDate: "",
    password: "",
    confirmPassword: ""
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged in", description: "Welcome back!" });
    }
    setLoginLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setRegisterLoading(true);
    
    try {
      // First create the auth user
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

      // Then save student data to StudentData table
      const { error: dataError } = await supabase
        .from('StudentData')
        .insert([
          {
            'First Name': registerData.firstName,
            'Last Name': registerData.surname,
            'Mailid': registerData.email,
            'Contact Number': parseInt(registerData.contactNumber),
            'Passport Number': registerData.passportNumber,
            'Passport Issued Date': registerData.passportIssuedDate,
            'Passport Expiry Date': registerData.passportExpiryDate,
            'dtCreatedon': new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
            'Registrationid': Date.now() // Using timestamp as registration ID
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Student Portal
            </span>
          </div>
          <p className="text-muted-foreground">
            Access your student dashboard to manage your applications
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" variant="hero" disabled={loginLoading} aria-busy={loginLoading}>
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstname">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-firstname"
                          type="text"
                          placeholder="First name"
                          className="pl-10"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-surname">Surname</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-surname"
                          type="text"
                          placeholder="Surname"
                          className="pl-10"
                          value={registerData.surname}
                          onChange={(e) => setRegisterData({ ...registerData, surname: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-contact">Contact Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-contact"
                        type="tel"
                        placeholder="Enter your contact number"
                        className="pl-10"
                        value={registerData.contactNumber}
                        onChange={(e) => setRegisterData({ ...registerData, contactNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-passport">Passport Number</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-passport"
                        type="text"
                        placeholder="Enter your passport number"
                        className="pl-10"
                        value={registerData.passportNumber}
                        onChange={(e) => setRegisterData({ ...registerData, passportNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-passport-issued">Passport Issued Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-passport-issued"
                          type="date"
                          className="pl-10"
                          value={registerData.passportIssuedDate}
                          onChange={(e) => setRegisterData({ ...registerData, passportIssuedDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-passport-expiry">Passport Expiry Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-passport-expiry"
                          type="date"
                          className="pl-10"
                          value={registerData.passportExpiryDate}
                          onChange={(e) => setRegisterData({ ...registerData, passportExpiryDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" variant="hero" disabled={registerLoading} aria-busy={registerLoading}>
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginRegister;