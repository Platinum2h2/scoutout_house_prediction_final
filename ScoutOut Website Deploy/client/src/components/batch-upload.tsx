import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function BatchUpload() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedJobId, setUploadedJobId] = useState<number | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await fetch('/api/batch-predict', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setUploadedJobId(result.jobId);
      toast({
        title: "Upload Successful",
        description: "Your file is being processed. Check back for results.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: jobStatus } = useQuery({
    queryKey: ['/api/batch-jobs', uploadedJobId],
    enabled: !!uploadedJobId,
    refetchInterval: uploadedJobId ? 2000 : false, // Poll every 2 seconds if job is active
  }) as { data?: { 
    id: number;
    fileName: string;
    status: 'processing' | 'completed' | 'failed';
    totalRecords: number;
    processedRecords: number;
    createdAt: string;
    completedAt?: string;
  } };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== 'text/csv') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid CSV file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File Too Large",
        description: "File size must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const getProgressPercentage = () => {
    if (!jobStatus || !jobStatus.totalRecords) return 0;
    return Math.round((jobStatus.processedRecords / jobStatus.totalRecords) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 transition-colors duration-300 cursor-pointer" 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-semibold text-gray-700 mb-2">Drop your CSV file here</p>
        <p className="text-gray-500 mb-4">or click to browse</p>
        <Button className="apple-button">
          Select File
        </Button>
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={handleFileSelect}
        />
      </div>
      
      {/* Sample Data Format */}
      <div className="p-6 bg-gray-50 rounded-2xl">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Required CSV Format:</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-2 text-left">Avg. Area Income</th>
                <th className="px-4 py-2 text-left">Avg. Area House Age</th>
                <th className="px-4 py-2 text-left">Avg. Area Number of Rooms</th>
                <th className="px-4 py-2 text-left">Avg. Area Number of Bedrooms</th>
                <th className="px-4 py-2 text-left">Area Population</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2">79545.46</td>
                <td className="px-4 py-2">5.68</td>
                <td className="px-4 py-2">7.01</td>
                <td className="px-4 py-2">4.09</td>
                <td className="px-4 py-2">23086.80</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            <Download className="mr-2 h-4 w-4" />
            Download Sample CSV
          </Button>
          <span className="text-xs text-gray-500">Max file size: 50MB</span>
        </div>
      </div>
      
      {/* Processing Status */}
      {jobStatus && (
        <div className="p-6 bg-blue-50 rounded-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h4 className="text-lg font-semibold text-gray-800">Processing Status</h4>
              <Badge className={getStatusColor(jobStatus.status)}>
                {getStatusIcon(jobStatus.status)}
                <span className="ml-1 capitalize">{jobStatus.status}</span>
              </Badge>
            </div>
            <span className="text-sm text-gray-600">
              {jobStatus.processedRecords} / {jobStatus.totalRecords} properties
            </span>
          </div>
          
          {jobStatus.status === 'processing' && (
            <>
              <Progress value={getProgressPercentage()} className="mb-2" />
              <p className="text-sm text-gray-600">
                Estimated completion: {Math.max(1, Math.ceil((jobStatus.totalRecords - jobStatus.processedRecords) / 10))} minutes
              </p>
            </>
          )}
          
          {jobStatus.status === 'completed' && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">
                Processing complete! {jobStatus.processedRecords} properties processed successfully.
              </p>
              <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white">
                <Download className="mr-2 h-4 w-4" />
                Download Results
              </Button>
            </div>
          )}
          
          {jobStatus.status === 'failed' && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">
                Processing failed. Please check your CSV format and try again.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
