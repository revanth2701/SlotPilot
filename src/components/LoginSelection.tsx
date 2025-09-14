import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Building2, ArrowLeft } from "lucide-react";

interface LoginSelectionProps {
  onStudentLogin: () => void;
  onEmployerLogin: () => void;
  onBack: () => void;
}

const LoginSelection = ({ onStudentLogin, onEmployerLogin, onBack }: LoginSelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-start mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Welcome to GlobalEdu Consultancy
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your login type to continue
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 p-4 bg-gradient-primary rounded-full w-20 h-20 flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Student Portal</CardTitle>
              <CardDescription className="text-lg">
                Apply for your dream university abroad. Start your journey to global education.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                variant="hero"
                className="w-full h-12 text-lg font-semibold"
                onClick={onStudentLogin}
              >
                Student Login
              </Button>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                New student? Create your profile and start your application process
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 p-4 bg-gradient-primary rounded-full w-20 h-20 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Employer Portal</CardTitle>
              <CardDescription className="text-lg">
                Manage student applications and consultancy operations with our comprehensive dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                variant="outline"
                className="w-full h-12 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={onEmployerLogin}
              >
                Employer Login
              </Button>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Access student management dashboard and consultation tools
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;