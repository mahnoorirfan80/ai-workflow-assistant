
import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2, X } from 'lucide-react';
import { uploadResume } from '../services/api';
import { useToast } from '@/hooks/use-toast';
import { marked } from 'marked';

interface UploadedFile {
  name: string;
  summary: string;
  uploadedAt: Date;
  googleDocsLink?: string;
}

export default function Files() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saveToDocs, setSaveToDocs] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload only PDF or DOCX resumes.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setSelectedFile(file);

    try {
      
      const response = await uploadResume(file, saveToDocs);

      // If docs link is present, prepend it, otherwise just summary
      const summaryWithLink =
        saveToDocs && response.google_docs_link
          ? `[View summary on Google Docs](${response.google_docs_link})\n\n${response.summary}`
          : response.summary;

      // const newFile: UploadedFile = {
      //   name: file.name,
      //   summary: summaryWithLink,
      //   uploadedAt: new Date(),
      //   googleDocsLink: response.google_docs_link,
      // };

      const newFile: UploadedFile = {
      name: file.name,
      summary: response.summary,          // ← no markdown link here
      uploadedAt: new Date(),
      googleDocsLink: response.google_docs_link,
    };


      setUploadedFiles((prev) => [newFile, ...prev]);
      setSelectedFile(null);

      toast({
        title: 'Resume uploaded successfully',
        description: saveToDocs
          ? 'Your resume has been processed and saved to Google Docs.'
          : 'Your resume has been processed.',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload and process the resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Resume Summariser</h1>
        <p className="text-muted-foreground mt-2">
          Upload and process your PDF or Docx resume for analysis and summarization.
        </p>
      </div>

      {/* Toggle Save to Docs */}
      <div className="flex items-center gap-2">
        <input
          id="save-docs"
          type="checkbox"
          checked={saveToDocs}
          onChange={() => setSaveToDocs(!saveToDocs)}
          className="h-4 w-4"
        />
        <label htmlFor="save-docs" className="text-sm">
          Save processed summary to Google Docs
        </label>
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
            <h3 className="text-lg font-semibold mb-2">Upload your resume</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your PDF or Docx resume here, or click to browse
            </p>
            <button
              disabled={isUploading}
              className="btn btn-gradient transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Choose Files'
              )}
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: PDF, Docx(Max 10MB)
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

      {/* Selected File During Upload */}
      {selectedFile && (
        <div className="border p-4 rounded flex items-center justify-between bg-gray-50">
          <span>{selectedFile.name} is being processed…</span>
          <button onClick={handleCancelUpload} className="text-red-500 flex items-center gap-1">
            <X className="h-4 w-4" /> Cancel
          </button>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Processed Resume</h2>
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
                        {file.uploadedAt.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium mb-2">Summary:</h4>
                  {file.googleDocsLink && (
                    <a
                      href={file.googleDocsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 underline mb-3"
                    >
                      View summary on Google Docs ↗
                    </a>
                  )}
                  <div
                    className="prose max-w-none text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: marked.parse(file.summary) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
