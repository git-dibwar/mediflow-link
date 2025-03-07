
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Report, downloadReportFile } from "@/services/reportsService";
import { toast } from "sonner";

interface ReportListProps {
  reports: Report[];
  isLoading?: boolean;
}

const statusColors = {
  normal: "bg-green-100 text-green-800",
  attention: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-800"
};

const ReportList = ({ reports, isLoading = false }: ReportListProps) => {
  const handleDownload = async (report: Report) => {
    if (!report.file_path) {
      toast.warning("No file available for this report");
      return;
    }
    
    const url = await downloadReportFile(report.file_path);
    if (url) {
      // Create a temporary link and click it to download
      const a = document.createElement('a');
      a.href = url;
      a.download = report.title + ".pdf";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <FileText className="h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          You don't have any medical reports yet. Reports will appear here once your healthcare providers share them.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Report Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-gray-400 group-hover:text-medical-primary transition-colors" />
                    <span>{report.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{report.type}</Badge>
                </TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>{report.provider}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[report.status]}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(report)}
                      disabled={!report.file_path}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReportList;
