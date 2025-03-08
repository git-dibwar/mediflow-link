
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Organization } from "@/types/auth";
import { getUserOrganization, upsertOrganization } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrganizationProfile = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [organization, setOrganization] = useState<Partial<Organization>>({
    name: "",
    address: "",
    phone: "",
    email: "",
    license_number: "",
  });

  useEffect(() => {
    const loadOrganizationData = async () => {
      if (user) {
        setLoading(true);
        const orgData = await getUserOrganization(user.id);
        if (orgData) {
          setOrganization(orgData);
        } else if (profile) {
          // Set default type from profile if no organization exists
          setOrganization({
            ...organization,
            type: profile.user_type,
          });
        }
        setLoading(false);
      }
    };

    if (user && profile) {
      loadOrganizationData();
    }
  }, [user, profile]);

  // Redirect to normal dashboard if user is a patient
  useEffect(() => {
    if (!isLoading && profile?.user_type === "patient") {
      navigate("/dashboard");
    }
  }, [profile, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrganization((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      const orgData = {
        ...organization,
        owner_id: user.id,
        type: profile?.user_type || organization.type,
      };

      const result = await upsertOrganization(orgData);
      if (result) {
        toast.success("Organization profile updated successfully");
        navigate("/organization-dashboard");
      }
    } catch (error) {
      console.error("Error saving organization profile:", error);
      toast.error("Failed to save organization profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-medical-primary mb-2" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-2xl font-bold mb-2">Organization Profile</h1>
          <p className="text-muted-foreground">
            Complete your organization information to set up your profile
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-medical-primary" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Organization Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={organization.name || ""}
                    onChange={handleChange}
                    placeholder="Enter your organization name"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address
                  </label>
                  <Textarea
                    id="address"
                    name="address"
                    value={organization.address || ""}
                    onChange={handleChange}
                    placeholder="Enter your organization address"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={organization.phone || ""}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={organization.email || ""}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="license_number" className="text-sm font-medium">
                    License Number
                  </label>
                  <Input
                    id="license_number"
                    name="license_number"
                    value={organization.license_number || ""}
                    onChange={handleChange}
                    placeholder="Enter license or registration number"
                  />
                  <p className="text-xs text-muted-foreground">
                    This information will be used for verification purposes
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Organization Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrganizationProfile;
