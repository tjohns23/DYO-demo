'use client';

import React, { useState, useRef } from 'react';
import { uploadArtifactAction } from '@/lib/actions/mission';

interface ArtifactUploadModalProps {
  missionId: string;
  onUploadSuccess: () => void;
  onCancel: () => void;
}

const ALLOWED_TYPES = [
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'text/plain',
  'text/markdown',
  // Code files
  'text/javascript',
  'text/typescript',
  'text/python',
  'text/x-python',
  'text/x-java',
  'text/x-c',
  'text/x-cpp',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function ArtifactUploadModal({ missionId, onUploadSuccess, onCancel }: ArtifactUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Supported: images, PDFs, text, code, archives`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size: 100MB`,
      };
    }

    return { valid: true };
  };

  const handleFile = async (file: File) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 30;
        });
      }, 300);

      const result = await uploadArtifactAction(missionId, file);

      clearInterval(progressInterval);

      if (result.success) {
        setUploadProgress(100);
        setTimeout(() => {
          onUploadSuccess();
        }, 500);
      } else {
        setError(result.error || 'Upload failed');
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--background)] border border-[rgba(180,40,70,0.3)] rounded-2xl p-8 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-semibold text-[var(--glass-text-primary)] mb-2">Submit Your Artifact</h2>
        <p className="text-sm text-[#8a7080] mb-6">Upload proof of your work to complete this mission.</p>

        {!isUploading && (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-[var(--glass-success)] bg-[rgba(61,224,138,0.08)]'
                  : 'border-[rgba(180,40,70,0.3)] hover:border-[rgba(180,40,70,0.5)]'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleInputChange}
                accept={ALLOWED_TYPES.join(',')}
              />

              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 text-[#8a7080] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-[var(--glass-text-primary)] font-medium">Drag file here or click</p>
                <p className="text-xs text-[#8a7080] mt-1">Images, PDF, code, text (max 100MB)</p>
              </div>
            </div>

            {error && <div className="mt-4 p-3 bg-[rgba(224,48,96,0.1)] border border-[rgba(224,48,96,0.3)] rounded-lg text-sm text-[#ff6b9d]">{error}</div>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 px-3 py-2 rounded-lg border border-[rgba(180,40,70,0.3)] text-[var(--glass-text-primary)] font-mono text-xs font-semibold uppercase tracking-[0.12em] hover:bg-[rgba(180,40,70,0.08)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--glass-accent)] text-[var(--glass-text-primary)] font-mono text-xs font-semibold uppercase tracking-[0.12em] hover:bg-[#7a3548] transition-colors"
              >
                Select File
              </button>
            </div>
          </>
        )}

        {isUploading && (
          <div className="flex flex-col items-center">
            <div className="w-full bg-[rgba(255,255,255,0.08)] rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="h-full bg-[var(--glass-success)] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-[#8a7080] mb-4">Uploading... {Math.round(uploadProgress)}%</p>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-[var(--glass-success)] animate-bounce" />
              <div className="w-1 h-1 rounded-full bg-[var(--glass-success)] animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1 h-1 rounded-full bg-[var(--glass-success)] animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
