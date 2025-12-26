import { useEffect, useLayoutEffect } from "react";
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
import Communities from "./pages/Communities";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import EmployerLoginRegister from "@/components/EmployerLoginRegister";
import ResetPassword from "./pages/ResetPassword";
import CollegesListPage from "./pages/CollegesListPage";
import StudentLoginRegister from "@/components/StudentLoginRegister";
import JourneyForm from "./components/JourneyForm";
import StudentDashboard from "./components/StudentDashboard";
import StudentDashboardNew from "./components/StudentDashboardNew";

const queryClient = new QueryClient();

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Prevent the browser from restoring scroll position on back/forward.
    // This makes our scroll-to-top behavior deterministic.
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.key]);

  return null;
}

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
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<ServiceSelection />} />
          <Route path="/higher-education" element={<Index />} />
          <Route path="/communities" element={<Communities />} />
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
          <Route path="/student-dashboard-new" element={<StudentDashboardNew/>} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;