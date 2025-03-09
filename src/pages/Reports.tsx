
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use the correct React Query options structure
  const { data: reports = [], isLoading, error, refetch } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: fetchReports,
    enabled: !!user,
    meta: {
      onError: (err: any) => {
        console.error('Error fetching reports:', err);
        toast.error('Failed to load reports. Please try again.');
      }
    }
  });
  
  // Handle back button navigation
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      // This ensures the component reacts to browser back/forward buttons
      console.log('Back button detected in Reports page');
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, []);
  
  // Function to handle filter type change
  const handleFilterTypeChange = (value: string) => {
    setFilterType(value);
  };
  
  // Function to handle report deletion and refresh the list
  const handleReportDeleted = () => {
    console.log('Report deleted, refreshing list');
    refetch();
  };
  
  // Filter reports based on search term and filter type
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || report.type.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 bg-medical-pattern">
      <Header />
      <main className="flex-1 medical-container py-8 page-transition">
        <div className="space-y-8">
          <div className="bg-medical-secondary/50 dark:bg-medical-primary/20 p-6 rounded-2xl">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Medical Reports</h1>
            <p className="text-gray-600 dark:text-gray-300">
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
            <Select 
              value={filterType} 
              onValueChange={handleFilterTypeChange}
            >
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
          
          <ReportList 
            reports={filteredReports} 
            isLoading={isLoading}
            onReportDeleted={handleReportDeleted}
          />
          
          {error && (
            <div className="text-center py-4">
              <p className="text-red-500">Failed to load reports. Please try again later.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
