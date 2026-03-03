'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileBox } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileUploader } from '@/components/files/FileUploader';
import { useAuthStore } from '@/store';

export default function UploadPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

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
      <div className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Upload Files</h1>
            <p className="text-muted-foreground">
              Upload your files to Catbox.moe and manage them easily
            </p>
          </div>

          <FileUploader />
        </motion.div>
      </div>
    </MainLayout>
  );
}
