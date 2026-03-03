'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileBox, User, Calendar, MapPin, Link as LinkIcon, FileImage } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { formatFileSize } from '@/lib/api/catbox';
import type { UserProfile, UploadedFile } from '@/lib/firebase';

interface PublicUser {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string;
  bio: string;
  location: string;
  website: string;
  joinedAt: number;
  fileCount: number;
  totalStorageUsed: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = (params.username as string)?.replace('@', '');
  
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      setIsLoading(true);
      setNotFound(false);

      try {
        // Use the search API to find user by username
        const response = await fetch(`/api/user/search?q=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (!response.ok || !data.users || data.users.length === 0) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        // Find exact match (case-insensitive)
        const user = data.users.find(
          (u: PublicUser) => u.username.toLowerCase() === username.toLowerCase()
        );

        if (!user) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setProfile(user);

        // Fetch files from API (we'll need to create this)
        // For now, just set empty array
        setFiles([]);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
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

  if (notFound || !profile) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-muted-foreground">
            The user @{username} doesn&apos;t exist or has been removed.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6 space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="h-24 w-24 md:h-32 md:w-32">
                  <AvatarImage src={profile.photoURL} />
                  <AvatarFallback className="text-3xl">
                    {profile.displayName?.charAt(0).toUpperCase() || profile.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{profile.displayName}</h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-muted-foreground max-w-xl">{profile.bio}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span>{profile.website.replace(/https?:\/\//, '')}</span>
                      </a>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{profile.fileCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Files</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatFileSize(profile.totalStorageUsed || 0)}</p>
                      <p className="text-xs text-muted-foreground">Storage</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Files */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Files</h2>
          {files.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No public files yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden group cursor-pointer">
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      <div className="aspect-square relative bg-muted">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Badge variant="secondary">
                              {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </CardContent>
                    </a>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
