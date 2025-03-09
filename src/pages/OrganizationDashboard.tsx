
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Stethoscope, 
  Pill, 
  Microscope, 
  Settings, 
  Users, 
  FileText,
  Calendar,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Organization, UserType } from "@/types/auth";
import { getUserOrganization } from "@/lib/supabase";
import { toast } from "sonner";

const OrganizationDashboard = () => {
  const { user, profile, isLoading, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadOrganizationData = async () => {
      if (user) {
        setLoadingOrg(true);
        setLoadError(false);
        
        try {
          const orgData = await getUserOrganization(user.id);
          setOrganization(orgData);
        } catch (error) {
          console.error("Error loading organization:", error);
          setLoadError(true);
          toast.error("Failed to load organization data");
        } finally {
          setLoadingOrg(false);
        }
      }
    };

    if (user) {
      loadOrganizationData();
    }
  }, [user]);

  // Force refresh if we have user but no profile
  useEffect(() => {
    if (user && !profile && !isLoading) {
      refreshSession();
    }
  }, [user, profile, isLoading, refreshSession]);

  // Redirect to normal dashboard if user is a patient
  useEffect(() => {
    if (!isLoading && profile?.user_type === "patient") {
      navigate("/dashboard");
    }
  }, [profile, isLoading, navigate]);

  const getOrganizationIcon = (type?: UserType) => {
    switch (type) {
      case "doctor":
        return <Stethoscope className="h-8 w-8 text-blue-500" />;
      case "clinic":
        return <Building2 className="h-8 w-8 text-green-500" />;
      case "pharmacy":
        return <Pill className="h-8 w-8 text-red-500" />;
      case "laboratory":
        return <Microscope className="h-8 w-8 text-purple-500" />;
      default:
        return <Building2 className="h-8 w-8 text-gray-500" />;
    }
  };

  const getOrganizationTitle = (type?: UserType) => {
    switch (type) {
      case "doctor":
        return "Doctor Dashboard";
      case "clinic":
        return "Clinic Dashboard";
      case "pharmacy":
        return "Pharmacy Dashboard";
      case "laboratory":
        return "Laboratory Dashboard";
      default:
        return "Professional Dashboard";
    }
  };

  // Handle loading state with retry option
  if (isLoading || loadingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-medical-primary mb-2" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle error state with retry option
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm max-w-md">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Data Loading Error</h2>
          <p className="text-muted-foreground text-center mb-4">
            There was a problem loading your organization data. This could be due to a network issue.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Go to Patient Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use default user type if profile is missing
  const userType = profile?.user_type || "doctor";
  const userName = profile?.full_name || user?.email?.split('@')[0] || "Professional";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8 space-y-4">
          <div className="flex items-center space-x-4">
            {getOrganizationIcon(userType as UserType)}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {getOrganizationTitle(userType as UserType)}
              </h1>
              <p className="text-muted-foreground">
                {organization?.name || `Welcome, ${userName}`}
              </p>
            </div>
          </div>
          
          {!organization && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Complete Your Setup</CardTitle>
                <CardDescription>
                  Please complete your organization profile to access all features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/organization-profile")}>
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Patients</CardTitle>
              <CardDescription>Manage your patients</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                View Patients
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Appointments</CardTitle>
              <CardDescription>Schedule and manage appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Records</CardTitle>
              <CardDescription>Patient records and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Records
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Manage your profile and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => navigate("/organization-profile")}>
                <Settings className="mr-2 h-4 w-4" />
                Update Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrganizationDashboard;
