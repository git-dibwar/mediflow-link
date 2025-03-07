
import { supabase } from '@/lib/supabase'
import { toast } from "sonner"

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
    const { data, error } = await supabase
      .from('reports')
      .select('*')
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
    const filePath = `reports/${fileName}`
    
    const { error } = await supabase
      .storage
      .from('medical_files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    
    return filePath
  } catch (error: any) {
    console.error('Error uploading file:', error)
    toast.error('Failed to upload file')
    return null
  }
}

export const createReport = async (report: Omit<Report, 'id' | 'created_at' | 'user_id'>, file?: File): Promise<Report | null> => {
  try {
    // Insert the report
    const { data, error } = await supabase
      .from('reports')
      .insert([{ ...report }])
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

export const downloadReportFile = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .storage
      .from('medical_files')
      .download(filePath)
    
    if (error) throw error
    
    const url = URL.createObjectURL(data)
    return url
  } catch (error: any) {
    console.error('Error downloading file:', error)
    toast.error('Failed to download file')
    return null
  }
}
