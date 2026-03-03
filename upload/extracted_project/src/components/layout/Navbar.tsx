'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Upload, 
  FolderOpen, 
  MessageCircle, 
  User, 
  LogOut, 
  Settings,
  Search,
  Moon,
  Sun,
  FileBox,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useAuthStore, useUIStore } from '@/store';
import { useAuth } from '@/contexts/AuthContext';
import { debounce } from '@/lib/utils';

// Custom hook for mounted state without useEffect
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface SearchResult {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string;
}

export function Navbar() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const mounted = useMounted();
  const router = useRouter();

  const performSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debounce(() => performSearch(value), 300)();
  };

  const handleUserClick = (username: string) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    router.push(`/user/${username}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 glass border-b" />
      
      <div className="relative flex h-16 items-center px-4 md:px-6 max-w-[1800px] mx-auto">
        {/* Mobile menu button */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="md:hidden mr-2"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4 md:mr-6 group">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-xl gradient-primary blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-xl p-2 gradient-primary">
              <FileBox className="h-5 w-5 text-white" />
            </div>
          </motion.div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold gradient-text">Catbox</span>
            <span className="text-xl font-light text-muted-foreground">Manager</span>
          </div>
        </Link>

        {/* Search bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 transition-colors group-focus-within:text-primary" />
            <Input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="pl-10 w-full bg-muted/50 border-transparent focus:border-primary/50 focus:bg-background transition-all input-glow"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 glass border rounded-xl shadow-xl overflow-hidden z-50"
              >
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {searchQuery.length < 2 ? 'Type at least 2 characters' : 'No users found'}
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {searchResults.map((result, index) => (
                      <motion.button
                        key={result.uid}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleUserClick(result.username)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                          <AvatarImage src={result.photoURL} />
                          <AvatarFallback className="gradient-primary text-white text-sm">
                            {result.displayName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{result.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{result.username}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Theme toggle */}
          {mounted && (
            <motion.div
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-5 w-5 text-amber-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-5 w-5 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          )}

          {user ? (
            <>
              {/* Quick upload button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="hidden sm:block"
              >
                <Button asChild className="btn-gradient rounded-full px-5">
                  <Link href="/upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Link>
                </Button>
              </motion.div>

              {/* Mobile upload */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="sm:hidden"
              >
                <Button asChild variant="ghost" size="icon">
                  <Link href="/upload">
                    <Upload className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback className="gradient-primary text-white">
                        {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background pulse-online" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass rounded-xl border shadow-xl">
                  <div className="flex items-center justify-start gap-3 p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback className="gradient-primary text-white">
                        {user.displayName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg my-1">
                    <Link href="/files" className="flex items-center">
                      <FolderOpen className="mr-3 h-4 w-4 text-muted-foreground" />
                      My Files
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg my-1">
                    <Link href="/albums" className="flex items-center">
                      <FolderOpen className="mr-3 h-4 w-4 text-muted-foreground" />
                      Albums
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg my-1">
                    <Link href="/chat" className="flex items-center">
                      <MessageCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg my-1">
                    <Link href={`/user/${user.username}`} className="flex items-center">
                      <User className="mr-3 h-4 w-4 text-muted-foreground" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg my-1">
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout} 
                    className="rounded-lg my-1 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="btn-gradient rounded-full">
                <Link href="/register">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
