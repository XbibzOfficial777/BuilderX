'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  MoreVertical,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  FolderPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatFileSize, getFileType } from '@/lib/api/catbox';
import type { UploadedFile } from '@/lib/firebase';

interface FileGridProps {
  files: UploadedFile[];
  onDelete: (file: UploadedFile) => void;
  onAddToAlbum: (file: UploadedFile) => void;
  viewMode: 'grid' | 'list';
}

export function FileGrid({ files, onDelete, onAddToAlbum, viewMode }: FileGridProps) {
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const getFileIcon = (type: string) => {
    const fileType = getFileType(type);
    switch (fileType) {
      case 'image':
        return <FileImage className="h-8 w-8 text-blue-500" />;
      case 'video':
        return <FileVideo className="h-8 w-8 text-purple-500" />;
      case 'audio':
        return <FileAudio className="h-8 w-8 text-green-500" />;
      case 'document':
        return <FileText className="h-8 w-8 text-orange-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const isPreviewable = (file: UploadedFile) => {
    const type = getFileType(file.type);
    return type === 'image' || type === 'video' || type === 'audio';
  };

  const renderPreview = (file: UploadedFile) => {
    const type = getFileType(file.type);
    
    switch (type) {
      case 'image':
        return (
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        );
      case 'video':
        return (
          <video
            src={file.url}
            controls
            className="max-w-full max-h-[70vh] rounded-lg"
          />
        );
      case 'audio':
        return (
          <div className="w-full max-w-md">
            <audio src={file.url} controls className="w-full" />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-4 p-8">
            {getFileIcon(file.type)}
            <p className="text-lg font-medium">{file.name}</p>
            <p className="text-muted-foreground">Preview not available for this file type</p>
          </div>
        );
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No files yet</h3>
        <p className="text-muted-foreground">
          Upload your first file to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="popLayout">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card
                  className="group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => isPreviewable(file) && setPreviewFile(file)}
                >
                  <CardContent className="p-3">
                    <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {getFileType(file.type) === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getFileIcon(file.type)
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in New Tab
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onAddToAlbum(file)}>
                            <FolderPlus className="mr-2 h-4 w-4" />
                            Add to Album
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(file)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {getFileType(file.type) === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getFileIcon(file.type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => isPreviewable(file) && setPreviewFile(file)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAddToAlbum(file)}>
                              <FolderPlus className="mr-2 h-4 w-4" />
                              Add to Album
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(file)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="truncate">{previewFile?.name}</DialogTitle>
            <DialogDescription>
              {previewFile && (
                <span>
                  {formatFileSize(previewFile.size)} • Uploaded{' '}
                  {new Date(previewFile.uploadedAt).toLocaleDateString()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            {previewFile && renderPreview(previewFile)}
          </div>
          {previewFile && (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => copyToClipboard(previewFile.url)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button onClick={() => window.open(previewFile.url, '_blank')}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
