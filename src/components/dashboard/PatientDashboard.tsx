
import { useEffect, useState } from 'react';
import { Calendar, Clock, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import QuickActions from './QuickActions';

// Sample data - in a real app, this would come from API
const mockData = {
  patientName: "John Doe",
  upcomingAppointments: 2,
  recentReports: 3,
  pendingConsultations: 1,
  connectedProviders: 4,
  healthScore: 85
};

const PatientDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(mockData);
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-medical-primary/10 via-medical-secondary to-medical-primary/10 p-6 rounded-2xl animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {dashboardData.patientName}
            </h1>
            <p className="text-gray-500 mt-1">Here's a summary of your health dashboard</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white/90 backdrop-blur-sm py-2 px-4 rounded-full border border-medical-primary/20 shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Health Score</span>
              <div className="flex items-center space-x-2">
                <Progress value={dashboardData.healthScore} className="w-24" />
                <span className="text-sm font-medium text-medical-primary">{dashboardData.healthScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-normal">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-medical-primary mr-2" />
                <span className="text-2xl font-bold">{dashboardData.upcomingAppointments}</span>
              </div>
              <a href="/appointments" className="text-xs text-medical-primary hover:underline">
                View all
              </a>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-normal">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-emerald-500 mr-2" />
                <span className="text-2xl font-bold">{dashboardData.recentReports}</span>
              </div>
              <a href="/reports" className="text-xs text-medical-primary hover:underline">
                View all
              </a>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-normal">Pending Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-amber-500 mr-2" />
                <span className="text-2xl font-bold">{dashboardData.pendingConsultations}</span>
              </div>
              <a href="/consultations" className="text-xs text-medical-primary hover:underline">
                View all
              </a>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-normal">Connected Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-violet-500 mr-2" />
                <span className="text-2xl font-bold">{dashboardData.connectedProviders}</span>
              </div>
              <a href="/providers" className="text-xs text-medical-primary hover:underline">
                View all
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="section-title mb-6">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  );
};

export default PatientDashboard;
