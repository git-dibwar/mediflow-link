
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, User, Plus, CheckCircle, XCircle, CalendarDays, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sample appointment data
const mockAppointments = [
  {
    id: 1,
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "2023-11-20",
    time: "09:30 AM",
    location: "Heart Care Center, Building A",
    status: "upcoming",
    virtual: false,
  },
  {
    id: 2,
    doctorName: "Dr. Michael Chen",
    specialty: "Endocrinologist",
    date: "2023-11-22",
    time: "02:15 PM",
    location: "Online Video Consultation",
    status: "upcoming",
    virtual: true,
  },
  {
    id: 3,
    doctorName: "Dr. Lisa Rodriguez",
    specialty: "Dermatologist",
    date: "2023-11-12",
    time: "10:00 AM",
    location: "Skin Health Clinic, Suite 302",
    status: "completed",
    virtual: false,
  },
  {
    id: 4,
    doctorName: "Dr. James Wilson",
    specialty: "Neurologist",
    date: "2023-11-10",
    time: "03:45 PM",
    location: "Neurology Partners, Floor 5",
    status: "cancelled",
    virtual: false,
  },
];

// Helper to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const AppointmentCard = ({ appointment }: { appointment: typeof mockAppointments[0] }) => {
  const getStatusBadge = () => {
    switch (appointment.status) {
      case "upcoming":
        return <Badge className="bg-emerald-500">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-gray-500">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-500">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="glass-card card-hover">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {appointment.doctorName}
            {appointment.virtual && 
              <Badge variant="outline" className="ml-1 text-xs">Virtual</Badge>
            }
          </CardTitle>
          <p className="text-sm text-gray-500">{appointment.specialty}</p>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="text-medical-primary w-4 h-4" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="text-medical-primary w-4 h-4" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="text-medical-primary w-4 h-4" />
            <span>{appointment.location}</span>
          </div>
        </div>
        
        <div className="flex justify-between pt-2 border-t border-gray-100">
          {appointment.status === "upcoming" ? (
            <div className="space-x-2">
              <Button variant="outline" size="sm" className="text-xs">
                Reschedule
              </Button>
              <Button variant="outline" size="sm" className="text-xs text-rose-500 hover:text-rose-600">
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="ghost" className="p-0 h-auto text-xs text-medical-primary">
              <span className="flex items-center">
                View Details <ArrowRight className="ml-1 w-3 h-3" />
              </span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Appointments = () => {
  const [appointments] = useState(mockAppointments);
  const [view, setView] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const filteredAppointments = appointments.filter((appt) => {
    if (view === 'all') return true;
    return appt.status === view;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white bg-medical-pattern">
      <Header />
      <main className="flex-1 medical-container py-8 page-transition">
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-medical-primary/10 via-medical-secondary to-medical-primary/10 p-6 rounded-2xl animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-500 mt-1">Schedule and manage your doctor appointments</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Appointment
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant={view === 'all' ? 'default' : 'outline'} 
              onClick={() => setView('all')}
              className="flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              All
            </Button>
            <Button 
              variant={view === 'upcoming' ? 'default' : 'outline'} 
              onClick={() => setView('upcoming')}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Upcoming
            </Button>
            <Button 
              variant={view === 'completed' ? 'default' : 'outline'} 
              onClick={() => setView('completed')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Completed
            </Button>
            <Button 
              variant={view === 'cancelled' ? 'default' : 'outline'} 
              onClick={() => setView('cancelled')}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancelled
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No appointments found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Appointments;
