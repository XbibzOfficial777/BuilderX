'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileBox,
  Grid,
  List,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { FileGrid } from '@/components/files/FileGrid';
import { useAuthStore, useUIStore } from '@/store';
import { ref, onValue, off, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { deleteFiles } from '@/lib/api/catbox';
import { useToast } from '@/hooks/use-toast';
import type { UploadedFile } from '@/lib/firebase';

export default function FilesPage() {
  const { user, isLoading } = useAuthStore();
  const { viewMode, setViewMode } = useUIStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<UploadedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;

    const filesRef = ref(database, `users/${user.uid}/files`);
    const handler = onValue(filesRef, (snapshot) => {
      if (snapshot.exists()) {
        const filesData = Object.values(snapshot.val()) as UploadedFile[];
        setFiles(filesData.sort((a, b) => b.uploadedAt - a.uploadedAt));
      } else {
        setFiles([]);
      }
    });

    return () => off(filesRef, 'value', handler);
  }, [user]);

  useEffect(() => {
    let result = files;

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((file) => file.type.startsWith(filterType));
    }

    // Search by name
    if (searchQuery) {
      result = result.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFiles(result);
  }, [files, filterType, searchQuery]);

  const handleDelete = async (file: UploadedFile) => {
    setIsDeleting(true);
    try {
      // Delete from Catbox
      const fileName = file.url.split('/').pop();
      if (fileName) {
        await deleteFiles([fileName]);
      }

      // Delete from database
      await remove(ref(database, `users/${user!.uid}/files/${file.id}`));
      
      // Update user stats
      await update(ref(database, `users/${user!.uid}`), {
        fileCount: (user!.fileCount || 1) - 1,
        totalStorageUsed: Math.max(0, (user!.totalStorageUsed || 0) - file.size),
      });

      toast({
        title: 'File deleted',
        description: `${file.name} has been deleted successfully.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || 'Failed to delete file.',
      });
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  const handleAddToAlbum = (file: UploadedFile) => {
    // TODO: Implement album selection modal
    toast({
      title: 'Coming soon',
      description: 'Album selection will be available soon.',
    });
  };

  if (isLoading || !user) {
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

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Files</h1>
            <p className="text-muted-foreground">
              {files.length} file{files.length !== 1 ? 's' : ''} • Total:{' '}
              {formatBytes(files.reduce((acc, f) => acc + (f.size || 0), 0))}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="application">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Grid */}
        <FileGrid
          files={filteredFiles}
          onDelete={setFileToDelete}
          onAddToAlbum={handleAddToAlbum}
          viewMode={viewMode}
        />
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete File
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{fileToDelete?.name}&quot;? This action
              cannot be undone. The file will be permanently removed from Catbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && handleDelete(fileToDelete)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
