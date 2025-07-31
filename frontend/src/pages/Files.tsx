import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { uploadResume } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  name: string;
  summary: string;
  uploadedAt: Date;
}

export default function Files() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload only PDF or DOCX files.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await uploadResume(file);
      
      const newFile: UploadedFile = {
        name: file.name,
        summary: response.summary,
        uploadedAt: new Date(),
      };

      setUploadedFiles(prev => [newFile, ...prev]);
      
      toast({
        title: 'File uploaded successfully',
        description: 'Your file has been processed and summarized.',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload and process the file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">File Management</h1>
        <p className="text-muted-foreground mt-2">
          Upload and process your PDF and DOCX files for analysis and summarization.
        </p>
      </div>

      {/* Upload Area */}
      <div className="card upload-area">
        <div
          className="card-content p-8 text-center cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto max-w-md">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload your files</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your PDF or DOCX files here, or click to browse
            </p>
            <button 
              disabled={isUploading}
              className="btn btn-gradient transition-all"
            >
              {isUploading ? 'Processing...' : 'Choose Files'}
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: PDF, DOCX (Max 10MB)
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Processed Files</h2>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="card transition-all shadow-elegant">
                <div className="card-header pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="card-title text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {file.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Processed on {file.uploadedAt.toLocaleDateString()} at{' '}
                        {file.uploadedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-medium mb-2">Summary:</h4>
                    <p className="text-sm text-muted-foreground">{file.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}