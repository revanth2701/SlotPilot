import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import ServiceSelection from "./pages/ServiceSelection";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";

// Only the landing page loads up front; every other page loads when first opened.
const Index = lazy(() => import("./pages/Index"));
const VisaStart = lazy(() => import("./pages/VisaStart"));
const VisaServices = lazy(() => import("./pages/VisaServices"));
const VisaApplication = lazy(() => import("./pages/VisaApplication"));
const Communities = lazy(() => import("./pages/Communities"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const EmployerLoginRegister = lazy(() => import("@/components/EmployerLoginRegister"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CollegesListPage = lazy(() => import("./pages/CollegesListPage"));
const StudentLoginRegister = lazy(() => import("@/components/StudentLoginRegister"));
const JourneyForm = lazy(() => import("./components/JourneyForm"));
const StudentDashboardNew = lazy(() => import("./components/StudentDashboardNew"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
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
          <Route path="/student-dashboard-new" element={<ProtectedRoute><StudentDashboardNew/></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard/></AdminRoute>} />

        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;