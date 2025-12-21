import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import ServiceSelection from "./pages/ServiceSelection";
import Index from "./pages/Index";
import VisaStart from "./pages/VisaStart";
import VisaServices from "./pages/VisaServices";
import VisaApplication from "./pages/VisaApplication";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import EmployerLoginRegister from "@/components/EmployerLoginRegister";
import ResetPassword from "./pages/ResetPassword";
import CollegesListPage from "./pages/CollegesListPage";
import StudentLoginRegister from "@/components/StudentLoginRegister";
import JourneyForm from "./components/JourneyForm";

const queryClient = new QueryClient();

function StudentLoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || "/";

  return (
    <StudentLoginRegister
      onBack={() => navigate(-1)}
      onLogin={() => navigate(redirectTo, { replace: true })}
    />
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ServiceSelection />} />
          <Route path="/higher-education" element={<Index />} />
          <Route path="/employer-login" element={<EmployerLoginRegister />} />
          <Route path="/visa-start" element={<VisaStart />} />
          <Route path="/visa-services" element={<VisaServices />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/visa-application" element={<VisaApplication />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/colleges" element={<CollegesListPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/StudentLoginRegisterPage" element={<StudentLoginRegister />} />
          <Route path="/student-login" element={<StudentLoginRoute />} />
          <Route path="/journey" element={<JourneyForm/>} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;