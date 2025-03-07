
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Plus, Calendar, Clock, Check, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sample medication data - in a real app, this would come from an API
const mockMedications = [
  {
    id: 1,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    refillDate: "2023-11-15",
    status: "active",
    instructions: "Take in the morning with food",
    prescribedBy: "Dr. Sarah Johnson",
  },
  {
    id: 2,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    refillDate: "2023-11-20",
    status: "active",
    instructions: "Take with meals",
    prescribedBy: "Dr. Michael Chen",
  },
  {
    id: 3,
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily",
    refillDate: "2023-11-10",
    status: "refill-needed",
    instructions: "Take at bedtime",
    prescribedBy: "Dr. Sarah Johnson",
  },
  {
    id: 4,
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times daily",
    refillDate: "2023-11-05",
    status: "completed",
    instructions: "Take until finished",
    prescribedBy: "Dr. Robert Williams",
  },
];

// Helper to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const MedicationCard = ({ medication }: { medication: typeof mockMedications[0] }) => {
  const getStatusBadge = () => {
    switch (medication.status) {
      case "active":
        return <Badge className="bg-emerald-500">Active</Badge>;
      case "refill-needed":
        return <Badge className="bg-amber-500">Refill Needed</Badge>;
      case "completed":
        return <Badge className="bg-gray-500">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="glass-card card-hover">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-medical-primary flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <CardTitle>{medication.name}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>{medication.dosage} - {medication.frequency}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Refill: {formatDate(medication.refillDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{medication.frequency}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 pt-1 border-t">
          {medication.instructions}
        </p>
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-gray-500">Prescribed by: {medication.prescribedBy}</span>
          <Button variant="ghost" className="p-0 h-auto text-xs text-medical-primary">
            <span className="flex items-center">
              View Details <ArrowRight className="ml-1 w-3 h-3" />
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Medications = () => {
  const [medications] = useState(mockMedications);
  const [view, setView] = useState<'all' | 'active' | 'refill' | 'completed'>('all');

  const filteredMedications = medications.filter((med) => {
    if (view === 'all') return true;
    if (view === 'active') return med.status === 'active';
    if (view === 'refill') return med.status === 'refill-needed';
    if (view === 'completed') return med.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white bg-medical-pattern">
      <Header />
      <main className="flex-1 medical-container py-8 page-transition">
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-medical-primary/10 via-medical-secondary to-medical-primary/10 p-6 rounded-2xl animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
                <p className="text-gray-500 mt-1">Manage and track your prescriptions</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Request Refill
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
              <FileText className="w-4 h-4" />
              All
            </Button>
            <Button 
              variant={view === 'active' ? 'default' : 'outline'} 
              onClick={() => setView('active')}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Active
            </Button>
            <Button 
              variant={view === 'refill' ? 'default' : 'outline'} 
              onClick={() => setView('refill')}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Refill Needed
            </Button>
            <Button 
              variant={view === 'completed' ? 'default' : 'outline'} 
              onClick={() => setView('completed')}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Completed
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedications.length > 0 ? (
              filteredMedications.map((medication) => (
                <MedicationCard key={medication.id} medication={medication} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No medications found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Medications;
