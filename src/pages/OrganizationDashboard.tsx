
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Activity, Calendar, UserRound, FileText, Clock, Users, Pill, HeartPulse, Stethoscope, Building2, Microscope } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserType } from '@/types/auth';
import { Loader2 } from 'lucide-react';

const OrganizationDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    pendingResults: 0,
    completedResults: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch actual stats from Supabase
        // For now, just simulate loading and set placeholder data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate different numbers based on provider type
        let mockStats = {
          patients: Math.floor(Math.random() * 50) + 10,
          appointments: Math.floor(Math.random() * 20) + 5,
          pendingResults: Math.floor(Math.random() * 8) + 1,
          completedResults: Math.floor(Math.random() * 30) + 10
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  const getProviderTypeIcon = (type: UserType) => {
    switch (type) {
      case 'doctor':
        return <Stethoscope className="h-6 w-6 text-blue-500" />;
      case 'clinic':
        return <Building2 className="h-6 w-6 text-green-500" />;
      case 'pharmacy':
        return <Pill className="h-6 w-6 text-rose-500" />;
      case 'laboratory':
        return <Microscope className="h-6 w-6 text-purple-500" />;
      default:
        return <HeartPulse className="h-6 w-6 text-medical-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Provider Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || 'Healthcare Provider'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getProviderTypeIcon(profile?.user_type as UserType)}
          <span className="font-medium capitalize">{profile?.user_type}</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patients}</div>
            <p className="text-xs text-muted-foreground">Registered patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingResults}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedResults}</div>
            <p className="text-xs text-muted-foreground">Results delivered</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent patient interactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sample activity items */}
              <div className="flex items-center gap-3 p-3 border rounded-md">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">New patient registration</p>
                  <p className="text-sm text-muted-foreground">John Smith completed registration</p>
                </div>
                <div className="text-xs text-muted-foreground ml-auto">2 hours ago</div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-md">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Appointment scheduled</p>
                  <p className="text-sm text-muted-foreground">Sarah Jones booked for cardiac consultation</p>
                </div>
                <div className="text-xs text-muted-foreground ml-auto">Yesterday</div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-md">
                <FileText className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Lab results ready</p>
                  <p className="text-sm text-muted-foreground">5 new results ready for review</p>
                </div>
                <div className="text-xs text-muted-foreground ml-auto">2 days ago</div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <UserRound className="mr-2 h-4 w-4" /> 
                  Add New Patient
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" /> 
                  Schedule Appointment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" /> 
                  Upload Document
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Provider Information</CardTitle>
                <CardDescription>Your professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{profile?.full_name || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider Type:</span>
                  <span className="font-medium capitalize">{profile?.user_type || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user?.email || 'Not set'}</span>
                </div>
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/organization-profile')}
                    className="ml-auto"
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>
                Manage your patients' information and records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserRound className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Patient Management Coming Soon</h3>
                <p className="text-muted-foreground mt-2">
                  This feature is under development and will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Schedule</CardTitle>
              <CardDescription>
                Manage your upcoming appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Calendar Integration Coming Soon</h3>
                <p className="text-muted-foreground mt-2">
                  The appointment management system is currently being developed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>
                Access and manage patient medical records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Records Management Coming Soon</h3>
                <p className="text-muted-foreground mt-2">
                  Secure medical records management will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationDashboard;
