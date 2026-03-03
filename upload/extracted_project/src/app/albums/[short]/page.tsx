'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileBox,
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Video,
  Music,
  FileIcon,
  ExternalLink,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store';
import { ref, onValue, off, set, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { editAlbum } from '@/lib/api/catbox';
import { useToast } from '@/hooks/use-toast';
import type { Album, UploadedFile } from '@/lib/firebase';

export default function AlbumDetailPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const short = params.short as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFileUrl, setNewFileUrl] = useState('');
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(true);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || !short) return;

    const albumRef = ref(database, `users/${user.uid}/albums/${short}`);
    const handler = onValue(albumRef, async (snapshot) => {
      setIsLoadingAlbum(false);
      if (snapshot.exists()) {
        const albumData = snapshot.val() as Album;
        setAlbum(albumData);

        // Load files
        if (albumData.files && albumData.files.length > 0) {
          const filesData: UploadedFile[] = [];
          for (const fileUrl of albumData.files) {
            // Try to find file info from user's files
            const filesRef = ref(database, `users/${user.uid}/files`);
            const filesSnapshot = await get(filesRef);
            if (filesSnapshot.exists()) {
              const allFiles = filesSnapshot.val();
              for (const fileId of Object.keys(allFiles)) {
                const file = allFiles[fileId];
                if (file.url === fileUrl) {
                  filesData.push(file);
                  break;
                }
              }
            }
            // If file not found in user's files, create a basic entry
            if (!filesData.find(f => f.url === fileUrl)) {
              const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
              let fileType = 'other';
              if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) fileType = 'image';
              else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) fileType = 'video';
              else if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) fileType = 'audio';
              
              filesData.push({
                id: fileUrl.split('/').pop() || '',
                name: fileUrl.split('/').pop() || 'Unknown',
                url: fileUrl,
                size: 0,
                type: fileType,
                uploadedAt: Date.now(),
              });
            }
          }
          setFiles(filesData);
        } else {
          setFiles([]);
        }
      } else {
        setAlbum(null);
      }
    });

    return () => off(albumRef, 'value', handler);
  }, [user, short]);

  const addFileToAlbum = async () => {
    if (!user || !album || !newFileUrl.trim()) return;

    setIsAddingFile(true);
    try {
      const updatedFiles = [...(album.files || []), newFileUrl.trim()];
      await editAlbum(short, album.title, album.description, updatedFiles);
      
      // Update local state
      await set(ref(database, `users/${user.uid}/albums/${short}`), {
        ...album,
        files: updatedFiles,
        updatedAt: Date.now(),
      });

      toast({ title: 'File added', description: 'File has been added to the album.' });
      setNewFileUrl('');
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to add file',
        description: error.message || 'An error occurred.',
      });
    } finally {
      setIsAddingFile(false);
    }
  };

  const removeFileFromAlbum = async (fileUrl: string) => {
    if (!user || !album) return;

    try {
      const updatedFiles = (album.files || []).filter(url => url !== fileUrl);
      await editAlbum(short, album.title, album.description, updatedFiles);
      
      // Update local state
      await set(ref(database, `users/${user.uid}/albums/${short}`), {
        ...album,
        files: updatedFiles,
        updatedAt: Date.now(),
      });

      toast({ title: 'File removed', description: 'File has been removed from the album.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to remove file',
        description: error.message || 'An error occurred.',
      });
    } finally {
      setFileToRemove(null);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-green-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-blue-500" />;
      case 'audio':
        return <Music className="h-8 w-8 text-purple-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (isLoading || isLoadingAlbum) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <FileBox className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!user || !album) {
    return (
      <MainLayout>
        <div className="container py-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Album not found</h1>
          <Button onClick={() => router.push('/albums')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Albums
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/albums')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{album.title}</h1>
              {album.description && (
                <p className="text-muted-foreground">{album.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {files.length} file{files.length !== 1 ? 's' : ''} • 
                <a
                  href={`https://catbox.moe/c/${short}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-primary hover:underline"
                >
                  View on Catbox <ExternalLink className="h-3 w-3 inline" />
                </a>
              </p>
            </div>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add File
          </Button>
        </div>

        {/* Files Grid */}
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileBox className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No files in this album</h3>
            <p className="text-muted-foreground mb-4">
              Add files to organize them in this album
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add File
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
                    <CardContent className="p-0">
                      {/* Preview */}
                      <div
                        className="aspect-square bg-muted flex items-center justify-center cursor-pointer relative overflow-hidden"
                        onClick={() => setPreviewFile(file)}
                      >
                        {file.type === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getFileIcon(file.type)
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-3">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setFileToRemove(file.url)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add File Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add File to Album</DialogTitle>
            <DialogDescription>
              Enter the URL of the file you want to add to this album
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="https://files.catbox.moe/..."
              value={newFileUrl}
              onChange={(e) => setNewFileUrl(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addFileToAlbum} disabled={!newFileUrl.trim() || isAddingFile}>
              {isAddingFile ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add File'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove File Confirmation */}
      <AlertDialog open={!!fileToRemove} onOpenChange={() => setFileToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this file from the album? The file will still be available in your files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToRemove && removeFileFromAlbum(fileToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* File Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">
              {previewFile?.name || 'Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center overflow-auto">
            {previewFile?.type === 'image' && (
              <img
                src={previewFile.url}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
            {previewFile?.type === 'video' && (
              <video
                src={previewFile.url}
                controls
                autoPlay
                className="max-w-full max-h-[70vh] rounded-lg"
              />
            )}
            {previewFile?.type === 'audio' && (
              <div className="w-full max-w-md p-8 bg-muted/50 rounded-lg">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <Music className="h-10 w-10 text-primary" />
                  </div>
                  <audio
                    src={previewFile.url}
                    controls
                    autoPlay
                    className="w-full"
                  />
                </div>
              </div>
            )}
            {previewFile?.type === 'other' && (
              <div className="text-center py-8">
                <FileIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p>Preview not available</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(previewFile?.url || '');
                toast({ title: 'Link copied!' });
              }}
            >
              Copy Link
            </Button>
            <Button asChild>
              <a href={previewFile?.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
