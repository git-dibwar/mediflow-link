
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Plus, 
  Upload, 
  Download, 
  Calendar, 
  FileCheck, 
  FileX, 
  FilePlus,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Sample health records data
const mockRecords = [
  {
    id: 1,
    title: "Annual Physical Results",
    category: "Lab Report",
    date: "2023-09-15",
    provider: "Dr. Sarah Johnson",
    status: "verified",
    fileType: "PDF",
    fileSize: "2.4 MB",
  },
  {
    id: 2,
    title: "MRI - Right Knee",
    category: "Imaging",
    date: "2023-08-22",
    provider: "City Hospital Radiology",
    status: "verified",
    fileType: "DICOM",
    fileSize: "45 MB",
  },
  {
    id: 3,
    title: "Blood Test Results",
    category: "Lab Report",
    date: "2023-10-05",
    provider: "LabCorp Services",
    status: "pending",
    fileType: "PDF",
    fileSize: "1.2 MB",
  },
  {
    id: 4,
    title: "Vaccination Record",
    category: "Immunization",
    date: "2023-07-10",
    provider: "County Health Department",
    status: "verified",
    fileType: "PDF",
    fileSize: "0.8 MB",
  },
  {
    id: 5,
    title: "Cardiac Stress Test",
    category: "Procedure",
    date: "2023-09-30",
    provider: "Heart Center",
    status: "pending",
    fileType: "PDF",
    fileSize: "3.1 MB",
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

const RecordCard = ({ record }: { record: typeof mockRecords[0] }) => {
  const getStatusBadge = () => {
    switch (record.status) {
      case "verified":
        return <Badge className="bg-emerald-500">Verified</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = () => {
    switch (record.category) {
      case "Lab Report":
        return <FileText className="w-5 h-5 text-medical-primary" />;
      case "Imaging":
        return <FileCheck className="w-5 h-5 text-violet-500" />;
      case "Immunization":
        return <FileCheck className="w-5 h-5 text-emerald-500" />;
      case "Procedure":
        return <FileText className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Card className="glass-card card-hover">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-medical-light flex items-center justify-center">
            {getCategoryIcon()}
          </div>
          <div>
            <CardTitle className="text-base">{record.title}</CardTitle>
            <p className="text-xs text-gray-500">{record.category}</p>
          </div>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(record.date)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {record.fileType} • {record.fileSize}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Provider: {record.provider}
        </p>
        <div className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm" className="text-medical-primary">
            <Download className="mr-1 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Records = () => {
  const [records, setRecords] = useState(mockRecords);
  const [view, setView] = useState<'all' | 'verified' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = records
    .filter((record) => {
      // Filter by status
      if (view === 'all') return true;
      return record.status === view;
    })
    .filter((record) => {
      // Filter by search query
      if (!searchQuery.trim()) return true;
      return (
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  return (
    <div className="min-h-screen flex flex-col bg-white bg-medical-pattern">
      <Header />
      <main className="flex-1 medical-container py-8 page-transition">
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-medical-primary/10 via-medical-secondary to-medical-primary/10 p-6 rounded-2xl animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
                <p className="text-gray-500 mt-1">Upload and manage your medical documents</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Record
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={view === 'all' ? 'default' : 'outline'} 
                onClick={() => setView('all')}
                className="flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4" />
                All Records
              </Button>
              <Button 
                variant={view === 'verified' ? 'default' : 'outline'} 
                onClick={() => setView('verified')}
                className="flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                Verified
              </Button>
              <Button 
                variant={view === 'pending' ? 'default' : 'outline'} 
                onClick={() => setView('pending')}
                className="flex items-center gap-2"
              >
                <FileX className="w-4 h-4" />
                Pending
              </Button>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No records found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Records;
