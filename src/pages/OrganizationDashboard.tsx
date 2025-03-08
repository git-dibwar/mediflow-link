
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
  Loader2
} from "lucide-react";
import { Organization, UserType } from "@/types/auth";
import { getUserOrganization } from "@/lib/supabase";

const OrganizationDashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  useEffect(() => {
    const loadOrganizationData = async () => {
      if (user) {
        setLoadingOrg(true);
        const orgData = await getUserOrganization(user.id);
        setOrganization(orgData);
        setLoadingOrg(false);
      }
    };

    if (user) {
      loadOrganizationData();
    }
  }, [user]);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8 space-y-4">
          <div className="flex items-center space-x-4">
            {getOrganizationIcon(profile?.user_type)}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {getOrganizationTitle(profile?.user_type)}
              </h1>
              <p className="text-muted-foreground">
                {organization?.name || `Welcome, ${profile?.full_name || 'Professional'}`}
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
