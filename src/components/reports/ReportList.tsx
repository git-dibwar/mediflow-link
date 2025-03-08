
import React, { useState } from 'react';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Trash2 } from 'lucide-react';
import { Report, downloadReportFile, deleteReport } from '@/services/reportsService';
import { toast } from 'sonner';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface ReportListProps {
  reports: Report[];
  onReportDeleted: () => void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  normal: "bg-green-100 text-green-800",
  attention: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-800"
};

const ReportList: React.FC<ReportListProps> = ({ reports, onReportDeleted, isLoading = false }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (report: Report) => {
    if (!report.file_path) {
      toast.error('No file available for this report');
      return;
    }
    
    setIsDownloading(report.id);
    try {
      const fileUrl = await downloadReportFile(report.file_path);
      
      if (fileUrl) {
        // Create a temporary link and click it to download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `${report.title}.${report.file_path.split('.').pop()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('File downloaded successfully');
      } else {
        toast.error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('An error occurred while downloading the file');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDelete = async (reportId: string, filePath?: string) => {
    setIsDeleting(true);
    try {
      const success = await deleteReport(reportId, filePath);
      if (success) {
        onReportDeleted();
        toast.success('Report deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/10">
        <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <h3 className="text-lg font-medium">No Reports</h3>
        <p className="text-muted-foreground">You don't have any medical reports yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.title}</TableCell>
              <TableCell>{report.type}</TableCell>
              <TableCell>{report.date}</TableCell>
              <TableCell>{report.provider}</TableCell>
              <TableCell>
                <Badge className={statusColors[report.status]}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                {report.file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report)}
                    disabled={isDownloading === report.id}
                  >
                    {isDownloading === report.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    Download
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingId(report.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Report</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this report? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeletingId(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground"
                        onClick={() => handleDelete(report.id, report.file_path)}
                        disabled={isDeleting}
                      >
                        {isDeleting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReportList;
