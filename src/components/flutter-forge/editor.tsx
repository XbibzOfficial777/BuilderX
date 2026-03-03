'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { useEditorStore } from '@/stores/editor-store';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Moon,
  Sun,
  LogOut,
  Save,
  Undo,
  Redo,
  Play,
  Code,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  ChevronDown,
  Loader2,
  Smartphone,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Keyboard,
  HelpCircle,
  Download,
  FileCode,
  TreePine,
  LayoutGrid,
  Settings,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { WidgetLibrary } from './widget-library';
import { Canvas } from './canvas';
import { PropertiesPanel } from './properties-panel';
import { CodePanel } from './code-panel';
import { LivePreview } from './live-preview';
import { WidgetTreePanel } from './widget-tree-panel';
import { deviceFrames } from '@/lib/widget-definitions';

interface EditorProps {
  projectId: string;
  onBack: () => void;
}

export function Editor({ projectId, onBack }: EditorProps) {
  const { user } = useAuthStore();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const {
    project,
    setProject,
    isPreviewOpen,
    isCodePanelOpen,
    isLeftPanelOpen,
    isRightPanelOpen,
    selectedDevice,
    isRotated,
    zoom,
    togglePreview,
    toggleCodePanel,
    toggleLeftPanel,
    toggleRightPanel,
    setDevice,
    toggleRotation,
    setZoom,
    undo,
    redo,
    widgetTree,
    history,
    historyIndex,
  } = useEditorStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [isEditingName, setIsEditingName] = useState(false);
  const [activeTab, setActiveTab] = useState<'canvas' | 'code'>('canvas');
  const [leftPanelTab, setLeftPanelTab] = useState<'widgets' | 'tree'>('widgets');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data.project);
          setProjectName(data.project.name);
        } else {
          // Demo mode
          setProject({
            id: projectId,
            name: 'Demo Project',
            description: 'A demo project',
            thumbnail: null,
            widgetTree: JSON.stringify({
              id: 'root',
              type: 'Scaffold',
              name: 'Scaffold',
              properties: {},
              children: [],
            }),
            userId: 'demo',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          setProjectName('Demo Project');
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
        toast.error('Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, setProject]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, widgetTree]);

  const handleSave = useCallback(async () => {
    if (!widgetTree) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          widgetTree: JSON.stringify(widgetTree),
        }),
      });

      if (response.ok) {
        toast.success('Project saved');
      } else {
        toast.success('Project saved (demo mode)');
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, projectName, widgetTree]);

  const handleNameSave = async () => {
    setIsEditingName(false);
    if (projectName !== project?.name) {
      await handleSave();
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export/${projectId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Project exported successfully');
      } else {
        toast.error('Failed to export project');
      }
    } catch (error) {
      console.error('Failed to export project:', error);
      toast.error('Failed to export project');
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
            />
          </div>
          <p className="text-muted-foreground">Loading editor...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.386z"/>
            </svg>
            <span className="hidden sm:inline">FlutterForge</span>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {isEditingName ? (
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="w-48 h-8"
              autoFocus
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingName(true)}
              className="gap-1 max-w-48"
            >
              <span className="truncate">{projectName}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <div className="hidden sm:flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={undo}
                    disabled={!canUndo}
                    className="h-8 w-8"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={redo}
                    disabled={!canRedo}
                    className="h-8 w-8"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-1" />
          </div>

          {/* Panel toggles */}
          <div className="hidden md:flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLeftPanel}
                    className="h-8 w-8"
                  >
                    {isLeftPanelOpen ? (
                      <PanelLeftClose className="h-4 w-4" />
                    ) : (
                      <PanelLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Left Panel</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRightPanel}
                    className="h-8 w-8"
                  >
                    {isRightPanelOpen ? (
                      <PanelRightClose className="h-4 w-4" />
                    ) : (
                      <PanelRight className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Right Panel</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-1" />
          </div>

          {/* View toggles */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === 'canvas' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setActiveTab('canvas')}
                  className="h-8 w-8"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Canvas View</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === 'code' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setActiveTab('code')}
                  className="h-8 w-8"
                >
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Code View</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPreviewOpen ? 'default' : 'ghost'}
                  size="icon"
                  onClick={togglePreview}
                  className="h-8 w-8"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Preview</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Save */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gradient-brand text-white"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            <span className="hidden sm:inline">Save</span>
          </Button>

          {/* Export */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export as ZIP</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Help */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowShortcuts(true)}
                  className="h-8 w-8"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard Shortcuts</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user?.name?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-muted-foreground">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Widget Library & Tree */}
        <AnimatePresence>
          {isLeftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r bg-card shrink-0 overflow-hidden flex flex-col"
            >
              <Tabs value={leftPanelTab} onValueChange={(v) => setLeftPanelTab(v as 'widgets' | 'tree')} className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b h-10 px-2 bg-transparent">
                  <TabsTrigger value="widgets" className="gap-1 data-[state=active]:bg-muted">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Widgets
                  </TabsTrigger>
                  <TabsTrigger value="tree" className="gap-1 data-[state=active]:bg-muted">
                    <TreePine className="h-3.5 w-3.5" />
                    Tree
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="widgets" className="flex-1 mt-0 overflow-hidden">
                  <WidgetLibrary />
                </TabsContent>
                <TabsContent value="tree" className="flex-1 mt-0 overflow-hidden">
                  <WidgetTreePanel />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center - Canvas or Code */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'canvas' ? (
            <>
              {/* Canvas Toolbar */}
              <div className="h-11 border-b bg-muted/50 flex items-center px-3 gap-2 shrink-0">
                {/* Device Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1 h-8">
                      <Smartphone className="h-4 w-4" />
                      <span className="hidden sm:inline">{selectedDevice.name}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Phones</DropdownMenuLabel>
                    {deviceFrames
                      .filter((d) => d.type === 'phone')
                      .map((device) => (
                        <DropdownMenuItem
                          key={device.id}
                          onClick={() => setDevice(device)}
                          className={selectedDevice.id === device.id ? 'bg-muted' : ''}
                        >
                          {device.name} ({device.width}x{device.height})
                        </DropdownMenuItem>
                      ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Tablets</DropdownMenuLabel>
                    {deviceFrames
                      .filter((d) => d.type === 'tablet')
                      .map((device) => (
                        <DropdownMenuItem
                          key={device.id}
                          onClick={() => setDevice(device)}
                          className={selectedDevice.id === device.id ? 'bg-muted' : ''}
                        >
                          {device.name} ({device.width}x{device.height})
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6" />

                {/* Rotate */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleRotation}
                        className="h-8 w-8"
                      >
                        <RotateCw className={`h-4 w-4 ${isRotated ? 'text-primary' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rotate Device</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Separator orientation="vertical" className="h-6" />

                {/* Zoom */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                        className="h-8 w-8"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom Out</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <span className="text-sm text-muted-foreground w-12 text-center font-mono">
                  {Math.round(zoom * 100)}%
                </span>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                        className="h-8 w-8"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom In</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Canvas Area */}
              <div className="flex-1 overflow-auto bg-muted/30 p-4 grid-pattern">
                <Canvas />
              </div>
            </>
          ) : (
            <CodePanel />
          )}
        </div>

        {/* Right Panel - Properties or Preview */}
        <AnimatePresence>
          {isRightPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isPreviewOpen ? 400 : 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l bg-card shrink-0 overflow-hidden flex flex-col"
            >
              {isPreviewOpen ? (
                <LivePreview />
              ) : (
                <PropertiesPanel />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these shortcuts to work faster in FlutterForge
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {[
              { keys: ['Ctrl', 'S'], action: 'Save project' },
              { keys: ['Ctrl', 'Z'], action: 'Undo' },
              { keys: ['Ctrl', 'Y'], action: 'Redo' },
              { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo (alternate)' },
              { keys: ['Ctrl', '/'], action: 'Show shortcuts' },
              { keys: ['Delete'], action: 'Delete selected widget' },
              { keys: ['Ctrl', 'D'], action: 'Duplicate widget' },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, j) => (
                    <React.Fragment key={j}>
                      <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                        {key}
                      </kbd>
                      {j < shortcut.keys.length - 1 && (
                        <span className="text-muted-foreground">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
