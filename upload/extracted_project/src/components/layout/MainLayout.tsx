'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
  hideFooter?: boolean;
}

export function MainLayout({ children, hideSidebar = false, hideFooter = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        {!hideSidebar && <Sidebar />}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-auto"
          >
            {children}
          </motion.div>
          {!hideFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}
