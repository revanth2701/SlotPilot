import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ServiceSelection from "./pages/ServiceSelection";
import Index from "./pages/Index";
import VisaServices from "./pages/VisaServices";
import VisaApplication from "./pages/VisaApplication";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import EmployerLoginRegister from "@/components/EmployerLoginRegister";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

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
          <Route path="/visa-services" element={<VisaServices />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/visa-application" element={<VisaApplication />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;