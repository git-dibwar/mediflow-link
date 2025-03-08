
import { supabase } from '@/lib/supabase'
import { toast } from "sonner"
import { getCurrentUser, uploadFile } from '@/lib/supabase'

export interface Report {
  id: string
  title: string
  type: string
  date: string
  provider: string
  status: "normal" | "attention" | "critical"
  file_path?: string
  created_at?: string
  user_id?: string
}

export const fetchReports = async (): Promise<Report[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data || []
  } catch (error: any) {
    console.error('Error fetching reports:', error)
    toast.error('Failed to load reports')
    return []
  }
}

export const uploadReportFile = async (file: File, reportId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${reportId}.${fileExt}`
    
    const result = await uploadFile('medical_files', fileName, file)
    
    if (!result) throw new Error('File upload failed')
    
    return result.path
  } catch (error: any) {
    console.error('Error uploading file:', error)
    toast.error('Failed to upload file')
    return null
  }
}

export const createReport = async (report: Omit<Report, 'id' | 'created_at' | 'user_id'>, file?: File): Promise<Report | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Insert the report
    const { data, error } = await supabase
      .from('reports')
      .insert([{ ...report, user_id: user.id }])
      .select()
    
    if (error) throw error
    
    const newReport = data[0]
    
    // Upload file if provided
    if (file && newReport) {
      const filePath = await uploadReportFile(file, newReport.id)
      
      if (filePath) {
        // Update the report with the file path
        const { error: updateError } = await supabase
          .from('reports')
          .update({ file_path: filePath })
          .eq('id', newReport.id)
        
        if (updateError) throw updateError
        
        newReport.file_path = filePath
      }
    }
    
    toast.success('Report created successfully')
    return newReport
  } catch (error: any) {
    console.error('Error creating report:', error)
    toast.error('Failed to create report')
    return null
  }
}

export const downloadReportFile = async (filePath: string, fileName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .storage
      .from('medical_files')
      .download(filePath)
    
    if (error) throw error
    
    // Create a download link
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error: any) {
    console.error('Error downloading file:', error)
    toast.error('Failed to download file')
    return false
  }
}

export const deleteReport = async (reportId: string, filePath?: string): Promise<boolean> => {
  try {
    // Delete the file first if it exists
    if (filePath) {
      const { error: fileError } = await supabase
        .storage
        .from('medical_files')
        .remove([filePath])
      
      if (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with report deletion even if file deletion fails
      }
    }
    
    // Delete the report
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
    
    if (error) throw error
    
    toast.success('Report deleted successfully')
    return true
  } catch (error: any) {
    console.error('Error deleting report:', error)
    toast.error('Failed to delete report')
    return false
  }
}
