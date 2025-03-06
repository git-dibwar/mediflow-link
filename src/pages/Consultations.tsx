
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConsultationCard from "@/components/consultations/ConsultationCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data
const sampleConsultations = {
  upcoming: [
    {
      id: "1",
      doctorName: "Dr. Sarah Johnson",
      doctorSpecialty: "Cardiologist",
      doctorImage: "",
      date: "Jun 18, 2023",
      time: "10:30 AM",
      duration: "30 min",
      status: "scheduled" as const,
      isVideo: true
    },
    {
      id: "2",
      doctorName: "Dr. Michael Chen",
      doctorSpecialty: "Dermatologist",
      doctorImage: "",
      date: "Jun 25, 2023",
      time: "2:00 PM",
      duration: "15 min",
      status: "scheduled" as const,
      isVideo: false
    }
  ],
  past: [
    {
      id: "3",
      doctorName: "Dr. James Wilson",
      doctorSpecialty: "General Physician",
      doctorImage: "",
      date: "May 10, 2023",
      time: "11:00 AM",
      duration: "20 min",
      status: "completed" as const,
      isVideo: true
    },
    {
      id: "4",
      doctorName: "Dr. Emily Rodriguez",
      doctorSpecialty: "Neurologist",
      doctorImage: "",
      date: "Apr 28, 2023",
      time: "3:30 PM",
      duration: "45 min",
      status: "completed" as const,
      isVideo: true
    },
    {
      id: "5",
      doctorName: "Dr. Robert Kim",
      doctorSpecialty: "Orthopedic Surgeon",
      doctorImage: "",
      date: "Apr 15, 2023",
      time: "9:00 AM",
      duration: "30 min",
      status: "cancelled" as const,
      isVideo: false
    }
  ]
};

const Consultations = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  
  return (
    <div className="min-h-screen flex flex-col bg-white bg-medical-pattern">
      <Header />
      <main className="flex-1 medical-container py-8 page-transition">
        <div className="space-y-8">
          <div className="bg-medical-secondary/50 p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Online Consultations</h1>
                <p className="text-gray-600">
                  Connect with healthcare providers through video or chat consultations
                </p>
              </div>
              <Button className="mt-4 md:mt-0">
                Schedule New Consultation
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past Consultations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-6">
              {sampleConsultations.upcoming.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sampleConsultations.upcoming.map((consultation) => (
                    <ConsultationCard key={consultation.id} {...consultation} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming consultations</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    You don't have any scheduled consultations at the moment.
                  </p>
                  <Button>Schedule New Consultation</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-6">
              {sampleConsultations.past.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sampleConsultations.past.map((consultation) => (
                    <ConsultationCard key={consultation.id} {...consultation} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No past consultations</h3>
                  <p className="text-sm text-gray-500">
                    Your consultation history will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Consultations;
