'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Upload,
  FolderOpen,
  Images,
  MessageCircle,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUIStore, useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home, gradient: 'from-violet-500 to-purple-500' },
  { href: '/upload', label: 'Upload', icon: Upload, gradient: 'from-blue-500 to-cyan-500' },
  { href: '/files', label: 'My Files', icon: FolderOpen, gradient: 'from-emerald-500 to-green-500' },
  { href: '/albums', label: 'Albums', icon: Images, gradient: 'from-orange-500 to-amber-500' },
  { href: '/chat', label: 'Messages', icon: MessageCircle, gradient: 'from-pink-500 to-rose-500' },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings, gradient: 'from-slate-500 to-gray-500' },
];

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
  pathname: string;
  sidebarCollapsed: boolean;
}

function NavLink({ href, label, icon: Icon, gradient, pathname, sidebarCollapsed }: NavLinkProps) {
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
  
  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group',
          isActive
            ? 'bg-gradient-to-r ' + gradient + ' text-white shadow-lg'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-20"
            initial={false}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        
        {/* Icon with gradient background on hover */}
        <div className={cn(
          'relative z-10 flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-300',
          isActive 
            ? 'bg-white/20' 
            : 'bg-muted/50 group-hover:bg-gradient-to-br group-hover:' + gradient
        )}>
          <Icon className={cn(
            'h-5 w-5 transition-colors',
            isActive ? 'text-white' : 'text-muted-foreground group-hover:text-white'
          )} />
        </div>
        
        {/* Label */}
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'font-medium truncate relative z-10',
                isActive && 'text-white'
              )}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Hover sparkle effect */}
        {!isActive && (
          <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
        )}
      </motion.div>
    </Link>
  );
}

interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  pathname: string;
  user: ReturnType<typeof useAuthStore.getState>['user'];
}

function MobileSidebar({ sidebarOpen, setSidebarOpen, pathname, user }: MobileSidebarProps) {
  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-16 bottom-0 w-72 z-50 md:hidden"
          >
            {/* Glassmorphism background */}
            <div className="absolute inset-0 glass border-r" />
            
            <ScrollArea className="relative h-full">
              <div className="p-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink {...item} pathname={pathname} sidebarCollapsed={false} />
                  </motion.div>
                ))}
              </div>
              
              {user && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 border-t mx-4 mt-4 rounded-xl bg-muted/30"
                >
                  <Link 
                    href={`/user/${user.username}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </Link>
                  {bottomNavItems.map((item) => (
                    <NavLink key={item.href} {...item} pathname={pathname} sidebarCollapsed={false} />
                  ))}
                </motion.div>
              )}
            </ScrollArea>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

interface DesktopSidebarProps {
  sidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  pathname: string;
  user: ReturnType<typeof useAuthStore.getState>['user'];
}

function DesktopSidebar({ sidebarCollapsed, toggleSidebarCollapse, pathname, user }: DesktopSidebarProps) {
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r transition-all duration-300 h-[calc(100vh-64px)] sticky top-16 relative',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 glass" />
      
      <ScrollArea className="relative flex-1">
        <div className="p-3 space-y-1.5">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink {...item} pathname={pathname} sidebarCollapsed={sidebarCollapsed} />
            </motion.div>
          ))}
        </div>
      </ScrollArea>
      
      {user && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-3 border-t"
        >
          <Link href={`/user/${user.username}`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    My Profile
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} sidebarCollapsed={sidebarCollapsed} />
          ))}
        </motion.div>
      )}

      {/* Collapse toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleSidebarCollapse}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg flex items-center justify-center z-10 hover:shadow-xl transition-shadow"
      >
        <AnimatePresence mode="wait">
          {sidebarCollapsed ? (
            <motion.div
              key="right"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="left"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </aside>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapse, setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      <MobileSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        pathname={pathname}
        user={user}
      />
      <DesktopSidebar 
        sidebarCollapsed={sidebarCollapsed} 
        toggleSidebarCollapse={toggleSidebarCollapse}
        pathname={pathname}
        user={user}
      />
    </>
  );
}
