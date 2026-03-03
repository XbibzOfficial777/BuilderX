'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { AuthForm, Dashboard, Editor } from '@/components/flutter-forge';

type View = 'auth' | 'dashboard' | 'editor';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [editorActive, setEditorActive] = useState(false);

  const view = useMemo<View>(() => {
    if (editorActive && projectId) return 'editor';
    return isAuthenticated ? 'dashboard' : 'auth';
  }, [isAuthenticated, editorActive, projectId]);

  const handleOpenProject = (id: string) => {
    setProjectId(id);
    setEditorActive(true);
  };

  const handleBackToDashboard = () => {
    setProjectId(null);
    setEditorActive(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
            />
          </div>
          <p className="text-muted-foreground">Loading FlutterForge...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'auth' && (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AuthForm />
        </motion.div>
      )}

      {view === 'dashboard' && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Dashboard onOpenProject={handleOpenProject} />
        </motion.div>
      )}

      {view === 'editor' && projectId && (
        <motion.div
          key="editor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <Editor projectId={projectId} onBack={handleBackToDashboard} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
