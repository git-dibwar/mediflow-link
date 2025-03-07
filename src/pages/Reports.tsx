
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReportList from "@/components/reports/ReportList";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchReports } from "@/services/reportsService";
import { useAuth } from "@/hooks/useAuth";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { user } = useAuth();
  
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: fetchReports,
    enabled: !!user
  });
  
  // Filter reports based on search term and filter type
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || report.type.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white bg-medical-pattern">
      <Header />
      <main className="flex-1 medical-container py-8 page-transition">
        <div className="space-y-8">
          <div className="bg-medical-secondary/50 p-6 rounded-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Medical Reports</h1>
            <p className="text-gray-600">
              Access and manage all your medical reports in one place
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by report name or provider..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="blood test">Blood Test</SelectItem>
                <SelectItem value="radiology">Radiology</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="pathology">Pathology</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ReportList reports={filteredReports} isLoading={isLoading} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
