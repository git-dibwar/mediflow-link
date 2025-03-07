
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Reports from "./pages/Reports";
import Consultations from "./pages/Consultations";
import Providers from "./pages/Providers";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Medications from "./pages/Medications";
import Appointments from "./pages/Appointments";
import Records from "./pages/Records";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/consultations" element={<Consultations />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/records" element={<Records />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
