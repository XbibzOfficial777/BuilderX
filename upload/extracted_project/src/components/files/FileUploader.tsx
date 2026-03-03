'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link2, X, FileIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { uploadFile, uploadFromUrl, getFileType, formatFileSize } from '@/lib/api/catbox';
import { ref, set, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export function FileUploader() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlUploading, setUrlUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    if (!user) return;

    const id = uuidv4();
    const newFile: UploadingFile = {
      id,
      file,
      progress: 0,
      status: 'uploading',
    };

    setUploadingFiles((prev) => [...prev, newFile]);

    try {
      // Simulate progress since Catbox doesn't provide upload progress
      const progressInterval = setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      const url = await uploadFile(file);
      clearInterval(progressInterval);

      // Save to database
      const fileId = uuidv4();
      const fileData = {
        id: fileId,
        name: file.name,
        url,
        size: file.size,
        type: file.type,
        uploadedAt: Date.now(),
      };

      await set(ref(database, `users/${user.uid}/files/${fileId}`), fileData);
      await update(ref(database, `users/${user.uid}`), {
        fileCount: (user.fileCount || 0) + 1,
        totalStorageUsed: (user.totalStorageUsed || 0) + file.size,
      });

      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, progress: 100, status: 'success', url }
            : f
        )
      );

      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error: any) {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: 'error', error: error.message }
            : f
        )
      );

      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload file.',
      });
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim() || !user) return;

    setUrlUploading(true);
    try {
      const url = await uploadFromUrl(urlInput);
      const fileId = uuidv4();
      const fileName = url.split('/').pop() || 'unknown';

      const fileData = {
        id: fileId,
        name: fileName,
        url,
        size: 0, // Unknown size for URL uploads
        type: 'unknown',
        uploadedAt: Date.now(),
        sourceUrl: urlInput,
      };

      await set(ref(database, `users/${user.uid}/files/${fileId}`), fileData);
      await update(ref(database, `users/${user.uid}`), {
        fileCount: (user.fileCount || 0) + 1,
      });

      toast({
        title: 'Upload successful',
        description: 'File has been uploaded from URL successfully.',
      });
      setUrlInput('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload from URL.',
      });
    } finally {
      setUrlUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      Array.from(e.dataTransfer.files).forEach(handleUpload);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(handleUpload);
    }
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">
            <Upload className="h-4 w-4 mr-2" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link2 className="h-4 w-4 mr-2" />
            URL Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-12 transition-colors
              ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center justify-center text-center">
              <motion.div
                animate={{ scale: dragActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-1">Drop files here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse from your computer
              </p>
              <p className="text-xs text-muted-foreground">
                Supports all file types up to 200MB
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">File URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/file.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleUrlUpload}
                  disabled={!urlInput.trim() || urlUploading}
                  className="w-full"
                >
                  {urlUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Upload from URL
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload progress list */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h3 className="font-semibold">Uploading Files</h3>
            {uploadingFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <FileIcon className="h-8 w-8 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </p>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-2" />
                  )}
                  {file.status === 'error' && (
                    <p className="text-sm text-destructive mt-1">{file.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUploadingFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
