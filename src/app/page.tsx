'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileBox,
  Upload,
  FolderOpen,
  Users,
  HardDrive,
  Clock,
  Plus,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import { formatFileSize } from '@/lib/api/catbox';
import type { UploadedFile, Album } from '@/lib/firebase';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function HomePage() {
  const { user, isLoading } = useAuthStore();
  const [recentFiles, setRecentFiles] = useState<UploadedFile[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    totalAlbums: 0,
  });

  useEffect(() => {
    if (!user) return;

    const filesRef = ref(database, `users/${user.uid}/files`);
    const filesHandler = onValue(filesRef, (snapshot) => {
      if (snapshot.exists()) {
        const filesData = Object.values(snapshot.val()) as UploadedFile[];
        const sorted = filesData.sort((a, b) => b.uploadedAt - a.uploadedAt);
        setRecentFiles(sorted.slice(0, 6));
        setStats((prev) => ({
          ...prev,
          totalFiles: filesData.length,
          totalSize: filesData.reduce((acc, f) => acc + (f.size || 0), 0),
        }));
      }
    });

    const albumsRef = ref(database, `users/${user.uid}/albums`);
    const albumsHandler = onValue(albumsRef, (snapshot) => {
      if (snapshot.exists()) {
        const albumsData = Object.values(snapshot.val()) as Album[];
        setAlbums(albumsData.slice(0, 4));
        setStats((prev) => ({ ...prev, totalAlbums: albumsData.length }));
      }
    });

    return () => {
      off(filesRef, 'value', filesHandler);
      off(albumsRef, 'value', albumsHandler);
    };
  }, [user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiAwaDR2LTRoLTR2NHptLTYgMGg0di00aC00djR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 text-white/80 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Welcome back</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white"
              >
                Hey, {user.displayName?.split(' ')[0] || 'there'}! 👋
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/70"
              >
                Here&apos;s what&apos;s happening with your files today
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-xl rounded-full px-6"
              >
                <Link href="/upload">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Files
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
          <StatsCard
            variants={item}
            title="Total Files"
            value={stats.totalFiles.toString()}
            icon={<FileBox className="h-5 w-5" />}
            color="from-violet-500 to-purple-600"
          />
          <StatsCard
            variants={item}
            title="Storage Used"
            value={formatFileSize(stats.totalSize)}
            icon={<HardDrive className="h-5 w-5" />}
            color="from-blue-500 to-cyan-500"
          />
          <StatsCard
            variants={item}
            title="Albums"
            value={stats.totalAlbums.toString()}
            icon={<FolderOpen className="h-5 w-5" />}
            color="from-emerald-500 to-green-500"
          />
          <StatsCard
            variants={item}
            title="Shared"
            value="0"
            icon={<Users className="h-5 w-5" />}
            color="from-orange-500 to-amber-500"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickActionCard
              title="Upload"
              description="Add files"
              icon={<Upload className="h-5 w-5" />}
              href="/upload"
              color="from-violet-500 to-purple-500"
            />
            <QuickActionCard
              title="Albums"
              description="Organize"
              icon={<Plus className="h-5 w-5" />}
              href="/albums"
              color="from-pink-500 to-rose-500"
            />
            <QuickActionCard
              title="Files"
              description="Browse"
              icon={<FolderOpen className="h-5 w-5" />}
              href="/files"
              color="from-blue-500 to-cyan-500"
            />
            <QuickActionCard
              title="Chat"
              description="Connect"
              icon={<Users className="h-5 w-5" />}
              href="/chat"
              color="from-emerald-500 to-green-500"
            />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Files */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full glass hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Recent Files</CardTitle>
                  <CardDescription>Your latest uploads</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-primary">
                  <Link href="/files">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentFiles.length === 0 ? (
                  <EmptyState
                    icon={<Clock className="h-8 w-8" />}
                    title="No files yet"
                    description="Upload your first file to get started"
                    href="/upload"
                    buttonText="Upload File"
                  />
                ) : (
                  <div className="space-y-2">
                    {recentFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
                      >
                        <FileIcon type={file.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                          </p>
                        </div>
                        <Link
                          href={file.url}
                          target="_blank"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Albums */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full glass hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Your Albums</CardTitle>
                  <CardDescription>Organized collections</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-primary">
                  <Link href="/albums">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {albums.length === 0 ? (
                  <EmptyState
                    icon={<FolderOpen className="h-8 w-8" />}
                    title="No albums yet"
                    description="Create your first album to organize files"
                    href="/albums"
                    buttonText="Create Album"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {albums.map((album, index) => (
                      <motion.div
                        key={album.short}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/albums/${album.short}`}>
                          <div className="p-4 rounded-xl border bg-card hover:bg-muted hover:border-primary/30 transition-all group">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                <FolderOpen className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {album.files?.length || 0} files
                              </span>
                            </div>
                            <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                              {album.title}
                            </h4>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-xl gradient-primary blur-xl opacity-50" />
        <div className="relative rounded-xl p-4 gradient-primary">
          <FileBox className="h-8 w-8 text-white" />
        </div>
      </motion.div>
    </div>
  );
}

function StatsCard({ title, value, icon, color, variants: _variants }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  variants?: Record<string, unknown>;
}) {
  return (
    <motion.div variants={item}>
      <Card className="glass hover:shadow-lg transition-all duration-300 hover-lift overflow-hidden group">
        <CardContent className="p-4 md:p-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">{title}</p>
              <p className="text-xl md:text-2xl font-bold">{value}</p>
            </div>
            <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
              {icon}
            </div>
          </div>
          {/* Decorative gradient */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function QuickActionCard({ title, description, icon, href, color }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card className="h-full glass hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-md group-hover:scale-110 transition-transform shrink-0`}>
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-sm truncate">{title}</h3>
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

function FileIcon({ type }: { type: string }) {
  const getIcon = () => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getColor = () => {
    if (type.startsWith('image/')) return 'from-green-500 to-emerald-500';
    if (type.startsWith('video/')) return 'from-blue-500 to-cyan-500';
    if (type.startsWith('audio/')) return 'from-purple-500 to-violet-500';
    return 'from-gray-500 to-slate-500';
  };

  return (
    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getColor()} flex items-center justify-center text-white shrink-0`}>
      {getIcon()}
    </div>
  );
}

function EmptyState({ icon, title, description, href, buttonText }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button variant="outline" size="sm" asChild>
        <Link href={href}>{buttonText}</Link>
      </Button>
    </div>
  );
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-pink-600/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Navbar */}
      <nav className="relative z-50 border-b glass">
        <div className="container flex items-center justify-between h-16 px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl gradient-primary blur-sm" />
              <div className="relative rounded-xl p-2 gradient-primary">
                <FileBox className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold gradient-text">Catbox Manager</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="btn-gradient rounded-full">
              <Link href="/register">
                <Sparkles className="mr-2 h-4 w-4" />
                Get Started
              </Link>
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10">
        <div className="container px-4 py-16 md:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              <Zap className="h-4 w-4" />
              Fast, Free & Secure
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Manage Your Files
              <br />
              <span className="gradient-text">Like a Pro</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload, organize, and share your files seamlessly. Powered by Catbox.moe with beautiful design and powerful features.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Button size="lg" asChild className="btn-gradient rounded-full px-8 h-12 text-lg">
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-lg glass">
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-20 md:mt-32 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<Upload className="h-6 w-6" />}
              title="Lightning Fast"
              description="Upload files directly to Catbox.moe with blazing fast speeds. Support for all file types."
              gradient="from-violet-500 to-purple-500"
            />
            <FeatureCard
              icon={<FolderOpen className="h-6 w-6" />}
              title="Smart Organization"
              description="Create albums, categorize files, and find what you need instantly."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Social Features"
              description="Connect with others, share files, and chat in real-time."
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Secure Storage"
              description="Your files are stored securely on Catbox.moe servers with redundancy."
              gradient="from-emerald-500 to-green-500"
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Public URLs"
              description="Get instant shareable links for all your uploaded files."
              gradient="from-orange-500 to-amber-500"
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Beautiful UI"
              description="Modern, responsive interface with dark mode support."
              gradient="from-indigo-500 to-violet-500"
            />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t glass mt-auto">
        <div className="container py-6 px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Catbox Manager Pro. Powered by Catbox.moe</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Card className="h-full glass hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
