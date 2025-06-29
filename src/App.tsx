
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ScanResults from "./pages/ScanResults";
import SmartDeletion from "./pages/SmartDeletion";
import AdvancedClassification from "./pages/AdvancedClassification";
import AutoOrganization from "./pages/AutoOrganization";
import EmailDetails from "./pages/EmailDetails";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan-results" element={<ScanResults />} />
          <Route path="/smart-deletion" element={<SmartDeletion />} />
          <Route path="/advanced-classification" element={<AdvancedClassification />} />
          <Route path="/auto-organization" element={<AutoOrganization />} />
          <Route path="/email-details" element={<EmailDetails />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
