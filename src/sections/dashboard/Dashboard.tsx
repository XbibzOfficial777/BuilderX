import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MoreVertical,
  Clock,
  FolderOpen,
  Copy,
  Trash2,
  Download,
  Sparkles,
  LogOut,
  Sun,
  Moon,
  User,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useProjectsStore } from '@/stores/projectsStore';
import { logOut } from '@/lib/firebase';
import { formatDate } from '@/lib/utils';
import type { Project } from '@/types/widget';

export function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const { 
    isLoading, 
    searchQuery, 
    setSearchQuery,
    createProject,
    deleteProject,
    duplicateProject,
    subscribeToUserProjects,
    getFilteredProjects,
  } = useProjectsStore();
  
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    const unsubscribe = subscribeToUserProjects(user.uid);
    return () => unsubscribe();
  }, [user, navigate, subscribeToUserProjects]);
  
  const handleLogout = async () => {
    const { error } = await logOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    logout();
    navigate('/');
  };
  
  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !user) return;
    
    setIsCreating(true);
    const { projectId, error } = await createProject(user.uid, newProjectName.trim());
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setIsCreating(false);
      return;
    }
    
    toast({
      title: 'Project created',
      description: 'Your new project is ready to edit.',
    });
    
    setNewProjectName('');
    setIsCreateDialogOpen(false);
    setIsCreating(false);
    
    if (projectId) {
      navigate(`/editor/${projectId}`);
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    if (!user) return;
    
    await deleteProject(user.uid, projectId);
    toast({
      title: 'Project deleted',
      description: 'The project has been permanently removed.',
    });
  };
  
  const handleDuplicateProject = async (projectId: string) => {
    if (!user) return;
    
    await duplicateProject(user.uid, projectId);
    toast({
      title: 'Project duplicated',
      description: 'A copy of the project has been created.',
    });
  };
  
  const handleExportProject = (_project: Project) => {
    // TODO: Implement export functionality
    toast({
      title: 'Export started',
      description: 'Your project is being prepared for download.',
    });
  };
  
  const filteredProjects = getFilteredProjects();
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-[#07080D]">
      {/* Header */}
      <header className="border-b border-[#1E1E2E] bg-[#07080D]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B6DFF] to-[#2EE7FF] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#F2F4F8]">FlutterForge</span>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7ACB8]" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0E111A] border-[#2D2D3D] text-[#F2F4F8] placeholder:text-[#A7ACB8]/50 focus:border-[#7B6DFF] focus:ring-[#7B6DFF]/20"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E]"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-[#7B6DFF] text-white">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0E111A] border-[#2D2D3D]">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-[#7B6DFF] text-white text-sm">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#F2F4F8]">
                        {user.displayName || 'User'}
                      </span>
                      <span className="text-xs text-[#A7ACB8] truncate max-w-[140px]">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-[#2D2D3D]" />
                  <DropdownMenuItem 
                    className="text-[#F2F4F8] focus:bg-[#1E1E2E] focus:text-[#F2F4F8] cursor-pointer"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-400 focus:bg-[#1E1E2E] focus:text-red-400 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#F2F4F8]">My Projects</h1>
            <p className="text-[#A7ACB8] mt-1">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0E111A] border-[#2D2D3D]">
              <DialogHeader>
                <DialogTitle className="text-[#F2F4F8]">Create New Project</DialogTitle>
                <DialogDescription className="text-[#A7ACB8]">
                  Give your project a name to get started.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] placeholder:text-[#A7ACB8]/50 focus:border-[#7B6DFF] focus:ring-[#7B6DFF]/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateProject();
                    }
                  }}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="bg-transparent border-[#2D2D3D] text-[#F2F4F8] hover:bg-[#1E1E2E]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || isCreating}
                  className="bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Projects grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-[#0E111A] border border-[#1E1E2E] rounded-xl h-48 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#1E1E2E] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-[#A7ACB8]" />
            </div>
            <h3 className="text-xl font-semibold text-[#F2F4F8] mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-[#A7ACB8] mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search query to find what you\'re looking for.'
                : 'Create your first project to start building beautiful Flutter UIs.'
              }
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-[#0E111A] border border-[#1E1E2E] rounded-xl overflow-hidden hover:border-[#7B6DFF]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#7B6DFF]/10"
              >
                {/* Thumbnail */}
                <div 
                  className="aspect-[4/3] bg-gradient-to-br from-[#1E1E2E] to-[#2D2D3D] relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/editor/${project.id}`)}
                >
                  {project.thumbnail ? (
                    <img 
                      src={project.thumbnail} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-xl bg-[#7B6DFF]/20 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-[#7B6DFF]" />
                      </div>
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#7B6DFF]/0 group-hover:bg-[#7B6DFF]/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button size="sm" className="bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Open
                    </Button>
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-semibold text-[#F2F4F8] truncate cursor-pointer hover:text-[#7B6DFF] transition-colors"
                        onClick={() => navigate(`/editor/${project.id}`)}
                      >
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-[#A7ACB8] mt-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(project.updatedAt)}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#0E111A] border-[#2D2D3D]">
                        <DropdownMenuItem 
                          className="text-[#F2F4F8] focus:bg-[#1E1E2E] focus:text-[#F2F4F8] cursor-pointer"
                          onClick={() => navigate(`/editor/${project.id}`)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-[#F2F4F8] focus:bg-[#1E1E2E] focus:text-[#F2F4F8] cursor-pointer"
                          onClick={() => handleDuplicateProject(project.id)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-[#F2F4F8] focus:bg-[#1E1E2E] focus:text-[#F2F4F8] cursor-pointer"
                          onClick={() => handleExportProject(project)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#2D2D3D]" />
                        <DropdownMenuItem 
                          className="text-red-400 focus:bg-[#1E1E2E] focus:text-red-400 cursor-pointer"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
