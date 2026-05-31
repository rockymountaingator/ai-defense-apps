'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'success' | 'error' | 'processing';
}

export default function AdminPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadedFile[] = Array.from(fileList)
      .filter((f) => f.type === 'application/pdf')
      .map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date(),
        status: 'processing' as const,
      }));

    if (newFiles.length === 0) {
      alert('Only PDF files are accepted at this time.');
      return;
    }

    setFiles((prev) => [...newFiles, ...prev]);

    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'processing' ? { ...f, status: 'success' as const } : f
        )
      );
    }, 1500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-cream p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Data Upload</h1>
            <p className="text-sm text-soft-slate">
              Upload PDFs to update assessment content.
            </p>
          </div>
          <a
            href="/"
            className="text-sm text-soft-slate hover:text-charcoal"
          >
            ← Back to Assessment
          </a>
        </div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
              dragActive
                ? 'border-terra bg-terra-light'
                : 'border-sand bg-canvas hover:border-sand-dark hover:bg-mist'
            }`}
          >
            <div className="mb-4 text-5xl">📄</div>
            <h3 className="mb-2 text-lg font-bold text-ink">
              Drop PDF files here
            </h3>
            <p className="mb-4 text-sm text-soft-slate">
              or click to browse · PDF only for now
            </p>
            <span className="inline-block rounded-full bg-mist px-4 py-1.5 text-xs font-medium text-soft-slate">
              Audio and video support coming soon
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>
        </motion.div>

        {/* Upload History */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-sand bg-canvas p-5"
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-soft-slate">
              Upload History
            </h3>
            <div className="space-y-2">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-3 rounded-xl bg-cream p-3"
                >
                  <div className="text-2xl">📄</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                    <p className="text-xs text-soft-slate">
                      {formatSize(file.size)} · {file.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    {file.status === 'processing' && (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-terra border-t-transparent" />
                    )}
                    {file.status === 'success' && (
                      <span className="text-lg text-sage">✓</span>
                    )}
                    {file.status === 'error' && (
                      <span className="text-lg text-rose">✗</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Status */}
        <div className="rounded-2xl border border-sand bg-canvas p-5">
          <h4 className="mb-2 text-sm font-bold text-ink">Current Status</h4>
          <ul className="space-y-2 text-sm text-charcoal">
            <li className="flex items-center gap-2">
              <span className="text-sage">✓</span> PDF upload — supported
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sand-dark">○</span> Audio upload — coming soon
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sand-dark">○</span> Video upload — coming soon
            </li>
          </ul>
          <p className="mt-3 text-xs text-soft-slate">
            Local-only admin tool. For public-facing deployments, consider API-based upload for better performance and security.
          </p>
        </div>
      </div>
    </div>
  );
}
