
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/useDarkMode";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Reports from "./pages/Reports";
import Consultations from "./pages/Consultations";
import Providers from "./pages/Providers";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Medications from "./pages/Medications";
import Appointments from "./pages/Appointments";
import Records from "./pages/Records";
import LandingPage from "./pages/LandingPage";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import OrganizationProfile from "./pages/OrganizationProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                
                {/* Patient routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute requireUserType={['patient']}>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute requireUserType={['patient']}>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/consultations" element={
                  <ProtectedRoute requireUserType={['patient']}>
                    <Consultations />
                  </ProtectedRoute>
                } />
                <Route path="/providers" element={
                  <ProtectedRoute requireUserType={['patient']}>
                    <Providers />
                  </ProtectedRoute>
                } />
                <Route path="/medications" element={
                  <ProtectedRoute requireUserType={['patient']}>
                    <Medications />
                  </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                  <ProtectedRoute requireUserType={['patient']}>
                    <Appointments />
                  </ProtectedRoute>
                } />
                <Route path="/records" element={
                  <ProtectedRoute requireUserType={['patient']}>
                    <Records />
                  </ProtectedRoute>
                } />
                
                {/* Professional routes */}
                <Route path="/organization-dashboard" element={
                  <ProtectedRoute requireUserType={['doctor', 'clinic', 'pharmacy', 'laboratory']}>
                    <OrganizationDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/organization-profile" element={
                  <ProtectedRoute requireUserType={['doctor', 'clinic', 'pharmacy', 'laboratory']}>
                    <OrganizationProfile />
                  </ProtectedRoute>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
