// client/components/ui/FileUpload.tsx
'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
// --- CORRECTED IMPORT ---
import { useUploadStatus, useAppActions } from '@/lib/store';
import { cn } from '@/lib/utils';

const FileUpload = () => {
  const api = useApi();
  const { uploadAndTrackDocument } = useAppActions();
  // --- ADDED TYPE ANNOTATION ---
const uploadStatus = useUploadStatus();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      await uploadAndTrackDocument(file, api);
    }
  }, [uploadAndTrackDocument, api]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });
  
  const renderContent = () => {
    switch (uploadStatus) {
      case 'uploading':
      case 'processing':
        return (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing Document...'}
            </h2>
            <p className="text-muted-foreground">Please wait, this may take a moment.</p>
          </>
        );
      case 'failed':
        return (
          <>
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">Upload Failed</h2>
            <p className="text-muted-foreground">Please try again.</p>
          </>
        );
      case 'success':
         return (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Upload Successful</h2>
            <p className="text-muted-foreground">Your new chat is available in the sidebar.</p>
          </>
        );
      case 'idle':
      default:
        return (
          <>
            <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Upload your PDF Document</h2>
            <p className="text-muted-foreground">
              {isDragActive ? 'Drop the file here ...' : 'Drag and drop your file here, or click to select a file.'}
            </p>
          </>
        );
    }
  };

  return (
    <div 
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center h-1/3 border-2 border-dashed border-border rounded-xl p-8 text-center transition-colors",
        isDragActive ? "border-primary bg-primary/10" : "bg-card/50 hover:bg-card/80",
        (uploadStatus !== 'idle') && "cursor-default pointer-events-none"
      )}
    >
      <input {...getInputProps()} />
      {renderContent()}
    </div>
  );
};

export default FileUpload;