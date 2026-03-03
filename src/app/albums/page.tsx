'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileBox,
  Plus,
  FolderOpen,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ref, onValue, off, set, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { createAlbum, editAlbum, deleteAlbum as deleteAlbumFromCatbox } from '@/lib/api/catbox';
import { useToast } from '@/hooks/use-toast';
import type { Album } from '@/lib/firebase';

export default function AlbumsPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;

    const albumsRef = ref(database, `users/${user.uid}/albums`);
    const handler = onValue(albumsRef, (snapshot) => {
      if (snapshot.exists()) {
        const albumsData = snapshot.val();
        const albumsList: Album[] = Object.entries(albumsData).map(([short, data]) => ({
          ...(data as Omit<Album, 'short'>),
          short,
        }));
        setAlbums(albumsList.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setAlbums([]);
      }
    });

    return () => off(albumsRef, 'value', handler);
  }, [user]);

  const handleCreate = async () => {
    if (!user || !formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const short = await createAlbum(formData.title, formData.description, []);
      
      const albumData: Album = {
        short,
        title: formData.title,
        description: formData.description,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        files: [],
      };

      await set(ref(database, `users/${user.uid}/albums/${short}`), albumData);

      toast({
        title: 'Album created',
        description: `"${formData.title}" has been created successfully.`,
      });

      setFormData({ title: '', description: '' });
      setIsCreateOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create album',
        description: error.message || 'An error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!user || !editingAlbum || !formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await editAlbum(editingAlbum.short, formData.title, formData.description, editingAlbum.files || []);

      const albumData: Partial<Album> = {
        title: formData.title,
        description: formData.description,
        updatedAt: Date.now(),
      };

      await set(ref(database, `users/${user.uid}/albums/${editingAlbum.short}`), {
        ...editingAlbum,
        ...albumData,
      });

      toast({
        title: 'Album updated',
        description: `"${formData.title}" has been updated successfully.`,
      });

      setFormData({ title: '', description: '' });
      setEditingAlbum(null);
      setIsEditOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update album',
        description: error.message || 'An error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (album: Album) => {
    if (!user) return;

    try {
      await deleteAlbumFromCatbox(album.short);
      await remove(ref(database, `users/${user.uid}/albums/${album.short}`));

      toast({
        title: 'Album deleted',
        description: `"${album.title}" has been deleted successfully.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete album',
        description: error.message || 'An error occurred.',
      });
    } finally {
      setAlbumToDelete(null);
    }
  };

  const openEditDialog = (album: Album) => {
    setEditingAlbum(album);
    setFormData({ title: album.title, description: album.description || '' });
    setIsEditOpen(true);
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
            <h1 className="text-3xl font-bold">Albums</h1>
            <p className="text-muted-foreground">
              {albums.length} album{albums.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Album
          </Button>
        </div>

        {/* Albums Grid */}
        {albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No albums yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first album to organize your files
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Album
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {albums.map((album, index) => (
                <motion.div
                  key={album.short}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer"
                          onClick={() => router.push(`/albums/${album.short}`)}
                        >
                          <FolderOpen className="h-6 w-6 text-primary" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(album)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(`https://catbox.moe/c/${album.short}`, '_blank')}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View on Catbox
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setAlbumToDelete(album)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() => router.push(`/albums/${album.short}`)}
                      >
                        <h3 className="font-semibold truncate">{album.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {album.description || 'No description'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {album.files?.length || 0} files
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Album</DialogTitle>
            <DialogDescription>
              Create a new album to organize your files
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="My Album"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.title.trim() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Album'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
            <DialogDescription>
              Update your album details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="My Album"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.title.trim() || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!albumToDelete} onOpenChange={() => setAlbumToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Album</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{albumToDelete?.title}&quot;? The album will
              be removed from Catbox, but files will remain in your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => albumToDelete && handleDelete(albumToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
