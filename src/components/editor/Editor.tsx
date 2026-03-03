import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  ChevronLeft,
  Save,
  Play,
  Code,
  RotateCw,
  Undo,
  Redo,
  Trash2,
  Copy,
  Box,
  Type,
  Image as ImageIcon,
  LayoutGrid,
  MousePointerClick,
  Monitor,
  Navigation,
  Sparkles,
  X,
  ChevronRight,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectsStore } from '@/stores/projectsStore';
import { useToast } from '@/hooks/use-toast';
import { widgetDefinitions, widgetCategories } from '@/lib/widgets';
import { generateFullCode } from '@/lib/codeGenerator';
import type { WidgetInstance, WidgetDefinition, DeviceType } from '@/types/widget';
import { cn } from '@/lib/utils';

// Draggable widget item from toolbar
function DraggableWidgetItem({ widget }: { widget: WidgetDefinition }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `widget-${widget.type}`,
    data: { type: widget.type, isNew: true },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const iconMap: Record<string, React.ElementType> = {
    Box,
    Type,
    ImageIcon,
    LayoutGrid,
    MousePointerClick,
    Monitor,
    Navigation,
    Sparkles,
  };

  const Icon = iconMap[widget.icon] || Box;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all',
        'bg-[#0E111A] border border-[#2D2D3D] hover:border-[#7B6DFF]/50 hover:bg-[#1E1E2E]',
        isDragging && 'opacity-50 ring-2 ring-[#7B6DFF]'
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-[#7B6DFF]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#7B6DFF]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#F2F4F8] truncate">{widget.displayName}</p>
        <p className="text-xs text-[#A7ACB8] truncate">{widget.description}</p>
      </div>
    </div>
  );
}

// Canvas widget component
function CanvasWidget({
  widget,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  depth = 0,
}: {
  widget: WidgetInstance;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  depth?: number;
}) {
  const def = widgetDefinitions.find(w => w.type === widget.type);
  const isContainer = def?.canHaveChildren ?? false;

  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${widget.id}`,
    data: { parentId: widget.id },
    disabled: !isContainer,
  });

  const renderWidgetContent = () => {
    const props = widget.properties;

    switch (widget.type) {
      case 'Container':
        return (
          <div
            style={{
              width: props.width ? `${props.width}px` : 'auto',
              height: props.height ? `${props.height}px` : 'auto',
              backgroundColor: props.color as string,
              borderRadius: `${props.borderRadius || 0}px`,
              padding: props.padding ? `${(props.padding as { top: number }).top}px ${(props.padding as { right: number }).right}px ${(props.padding as { bottom: number }).bottom}px ${(props.padding as { left: number }).left}px` : undefined,
              margin: props.margin ? `${(props.margin as { top: number }).top}px ${(props.margin as { right: number }).right}px ${(props.margin as { bottom: number }).bottom}px ${(props.margin as { left: number }).left}px` : undefined,
            }}
            className="min-w-[50px] min-h-[50px]"
          />
        );
      case 'Text':
        return (
          <span
            style={{
              fontSize: `${props.fontSize || 16}px`,
              color: props.color as string,
              fontWeight: props.fontWeight as string,
              textAlign: props.textAlign as 'left' | 'center' | 'right' | 'justify',
            }}
          >
            {props.data as string}
          </span>
        );
      case 'Icon':
        return (
          <div
            style={{
              width: `${props.size || 24}px`,
              height: `${props.size || 24}px`,
              color: props.color as string,
            }}
            className="flex items-center justify-center"
          >
            <Box className="w-full h-full" />
          </div>
        );
      case 'Image':
        return (
          <img
            src={props.url as string}
            alt=""
            style={{
              width: props.width ? `${props.width}px` : '100%',
              height: props.height ? `${props.height}px` : 'auto',
              borderRadius: `${props.borderRadius || 0}px`,
              objectFit: props.fit as 'cover' | 'contain' | 'fill' | 'none' | 'scale-down',
            }}
            className="max-w-full"
          />
        );
      case 'Row':
      case 'Column':
        return (
          <div
            className={cn(
              'flex gap-2',
              widget.type === 'Row' ? 'flex-row' : 'flex-col'
            )}
            style={{
              justifyContent: props.mainAxisAlignment as string,
              alignItems: props.crossAxisAlignment as string,
            }}
          >
            {widget.children.map(child => (
              <CanvasWidget
                key={child.id}
                widget={child}
                isSelected={false}
                onSelect={onSelect}
                onRemove={onRemove}
                onDuplicate={onDuplicate}
                depth={depth + 1}
              />
            ))}
          </div>
        );
      case 'Center':
        return (
          <div className="flex items-center justify-center w-full h-full">
            {widget.children.map(child => (
              <CanvasWidget
                key={child.id}
                widget={child}
                isSelected={false}
                onSelect={onSelect}
                onRemove={onRemove}
                onDuplicate={onDuplicate}
                depth={depth + 1}
              />
            ))}
          </div>
        );
      case 'TextField':
        return (
          <input
            type="text"
            placeholder={props.hintText as string}
            readOnly
            className="px-3 py-2 bg-[#1E1E2E] border border-[#2D2D3D] rounded-lg text-[#F2F4F8] text-sm w-full"
            style={{ borderRadius: `${props.borderRadius || 8}px` }}
          />
        );
      case 'ElevatedButton':
      case 'TextButton':
        return (
          <button
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              widget.type === 'ElevatedButton' && 'shadow-lg'
            )}
            style={{
              backgroundColor: widget.type === 'ElevatedButton' ? (props.backgroundColor as string) : 'transparent',
              color: props.foregroundColor as string,
              borderRadius: `${props.borderRadius || 8}px`,
            }}
          >
            Button
          </button>
        );
      case 'Card':
        return (
          <div
            className="p-4 shadow-lg"
            style={{
              backgroundColor: props.color as string,
              borderRadius: `${props.borderRadius || 12}px`,
            }}
          >
            {widget.children.map(child => (
              <CanvasWidget
                key={child.id}
                widget={child}
                isSelected={false}
                onSelect={onSelect}
                onRemove={onRemove}
                onDuplicate={onDuplicate}
                depth={depth + 1}
              />
            ))}
          </div>
        );
      case 'ListTile':
        const subtitleText = props.subtitle ? String(props.subtitle) : null;
        return (
          <div className="flex items-center gap-3 p-3">
            {props.leadingIcon !== 'none' && <Box className="w-5 h-5 text-[#A7ACB8]" />}
            <div className="flex-1">
              <p className="text-[#F2F4F8] font-medium">{String(props.title || '')}</p>
              {subtitleText && <p className="text-[#A7ACB8] text-sm">{subtitleText}</p>}
            </div>
            {props.trailingIcon !== 'none' && <ChevronRight className="w-5 h-5 text-[#A7ACB8]" />}
          </div>
        );
      case 'Divider':
        return (
          <div
            className="w-full"
            style={{
              height: `${props.thickness || 1}px`,
              backgroundColor: props.color as string,
              marginLeft: `${props.indent || 0}px`,
              marginRight: `${props.endIndent || 0}px`,
            }}
          />
        );
      case 'CircularProgressIndicator':
        return (
          <div className="w-8 h-8 rounded-full border-2 border-[#7B6DFF] border-t-transparent animate-spin" />
        );
      case 'LinearProgressIndicator':
        return (
          <div className="w-full h-1 bg-[#2D2D3D] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${((props.value as number) || 0.5) * 100}%`,
                backgroundColor: props.valueColor as string,
              }}
            />
          </div>
        );
      default:
        return (
          <div className="px-3 py-2 bg-[#1E1E2E] border border-dashed border-[#2D2D3D] rounded text-[#A7ACB8] text-sm">
            {widget.type}
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(widget.id);
      }}
      className={cn(
        'relative transition-all',
        isSelected && 'ring-2 ring-[#7B6DFF] ring-offset-2 ring-offset-[#07080D]',
        isOver && 'bg-[#7B6DFF]/10',
        depth > 0 && 'ml-4'
      )}
    >
      {renderWidgetContent()}
      
      {isSelected && (
        <div className="absolute -top-8 right-0 flex items-center gap-1 bg-[#0E111A] border border-[#2D2D3D] rounded-lg p-1 shadow-lg z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(widget.id);
            }}
            className="p-1.5 hover:bg-[#1E1E2E] rounded text-[#A7ACB8] hover:text-[#F2F4F8]"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widget.id);
            }}
            className="p-1.5 hover:bg-red-500/20 rounded text-[#A7ACB8] hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Property editor component
function PropertyEditor({
  widget,
  onUpdate,
}: {
  widget: WidgetInstance;
  onUpdate: (property: string, value: unknown) => void;
}) {
  const def = widgetDefinitions.find(w => w.type === widget.type);
  if (!def) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-[#2D2D3D]">
        <div className="w-8 h-8 rounded-lg bg-[#7B6DFF]/20 flex items-center justify-center">
          <Box className="w-4 h-4 text-[#7B6DFF]" />
        </div>
        <div>
          <p className="font-medium text-[#F2F4F8]">{def.displayName}</p>
          <p className="text-xs text-[#A7ACB8]">{widget.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {def.properties.map((prop) => (
          <div key={prop.name} className="space-y-2">
            <Label className="text-sm text-[#A7ACB8]">{prop.label}</Label>
            
            {prop.type === 'string' && (
              <Input
                value={(widget.properties[prop.name] as string) || ''}
                onChange={(e) => onUpdate(prop.name, e.target.value)}
                className="bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] focus:border-[#7B6DFF]"
              />
            )}
            
            {prop.type === 'number' && (
              <Input
                type="number"
                value={(widget.properties[prop.name] as number) || 0}
                onChange={(e) => onUpdate(prop.name, parseInt(e.target.value) || 0)}
                className="bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] focus:border-[#7B6DFF]"
              />
            )}
            
            {prop.type === 'double' && (
              <Input
                type="number"
                step="0.1"
                value={(widget.properties[prop.name] as number) ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : parseFloat(e.target.value);
                  onUpdate(prop.name, val);
                }}
                className="bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] focus:border-[#7B6DFF]"
              />
            )}
            
            {prop.type === 'boolean' && (
              <Switch
                checked={(widget.properties[prop.name] as boolean) || false}
                onCheckedChange={(checked) => onUpdate(prop.name, checked)}
                className="data-[state=checked]:bg-[#7B6DFF]"
              />
            )}
            
            {prop.type === 'color' && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={(widget.properties[prop.name] as string) || '#000000'}
                  onChange={(e) => onUpdate(prop.name, e.target.value)}
                  className="w-10 h-10 rounded-lg bg-transparent border border-[#2D2D3D] cursor-pointer"
                />
                <Input
                  value={(widget.properties[prop.name] as string) || ''}
                  onChange={(e) => onUpdate(prop.name, e.target.value)}
                  className="flex-1 bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] focus:border-[#7B6DFF]"
                />
              </div>
            )}
            
            {prop.type === 'enum' && (
              <Select
                value={(widget.properties[prop.name] as string) || prop.defaultValue as string}
                onValueChange={(value) => onUpdate(prop.name, value)}
              >
                <SelectTrigger className="bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0E111A] border-[#2D2D3D]">
                  {prop.options?.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="text-[#F2F4F8] focus:bg-[#1E1E2E] focus:text-[#F2F4F8]"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {prop.type === 'edgeInsets' && (
              <div className="grid grid-cols-2 gap-2">
                {['top', 'right', 'bottom', 'left'].map((side) => (
                  <div key={side} className="space-y-1">
                    <Label className="text-xs text-[#A7ACB8] capitalize">{side}</Label>
                    <Input
                      type="number"
                      value={((widget.properties[prop.name] as Record<string, number>)?.[side]) || 0}
                      onChange={(e) => {
                        const current = (widget.properties[prop.name] as Record<string, number>) || { top: 0, right: 0, bottom: 0, left: 0 };
                        onUpdate(prop.name, { ...current, [side]: parseInt(e.target.value) || 0 });
                      }}
                      className="bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] focus:border-[#7B6DFF]"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {prop.type === 'alignment' && (
              <div className="flex gap-1">
                {[
                  { value: 'topLeft', icon: AlignLeft },
                  { value: 'topCenter', icon: AlignCenter },
                  { value: 'topRight', icon: AlignRight },
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => onUpdate(prop.name, value)}
                    className={cn(
                      'flex-1 p-2 rounded-lg border transition-all',
                      widget.properties[prop.name] === value
                        ? 'bg-[#7B6DFF] border-[#7B6DFF] text-white'
                        : 'bg-[#07080D] border-[#2D2D3D] text-[#A7ACB8] hover:border-[#7B6DFF]/50'
                    )}
                  >
                    <Icon className="w-4 h-4 mx-auto" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Device frame for preview
function DeviceFrame({
  type,
  rotation,
  children,
}: {
  type: DeviceType;
  rotation: 'portrait' | 'landscape';
  children: React.ReactNode;
}) {
  const dimensions = {
    iphone: { width: 375, height: 812 },
    android: { width: 360, height: 740 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 800 },
  };

  const { width, height } = dimensions[type];
  const isLandscape = rotation === 'landscape';
  const frameWidth = isLandscape ? height : width;
  const frameHeight = isLandscape ? width : height;

  return (
    <div
      className="relative bg-[#0E111A] rounded-[3rem] p-3 shadow-2xl border border-[#2D2D3D]"
      style={{
        width: frameWidth + 24,
        height: frameHeight + 24,
      }}
    >
      {/* Notch */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#0E111A] rounded-full z-10" />
      
      {/* Screen */}
      <div
        className="w-full h-full bg-[#07080D] rounded-[2.5rem] overflow-hidden"
        style={{
          transform: isLandscape ? 'rotate(-90deg)' : 'none',
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Main Editor component
export function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { resolvedTheme } = useThemeStore();
  const { currentProject, updateProject: updateProjectInStore } = useProjectsStore();
  
  const {
    widgetTree,
    selectedWidgetId,
    zoom,
    showPreview,
    showCode,
    deviceType,
    deviceRotation,
    selectWidget,
    addWidget,
    removeWidget,
    updateWidgetProperty,
    duplicateWidget,
    setZoom,
    togglePreview,
    toggleCode,
    setDeviceType,
    toggleDeviceRotation,
    undo,
    redo,
    canUndo,
    canRedo,
    initNewProject,
    loadProject,
  } = useEditorStore();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load project on mount
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (projectId && currentProject?.id === projectId) {
      loadProject(currentProject.widgetTree);
    } else if (projectId) {
      // Load from store or fetch
      initNewProject();
    }
  }, [user, projectId, currentProject, navigate, loadProject, initNewProject]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.isNew) {
      // Adding new widget from toolbar
      const parentId = overData?.parentId || null;
      addWidget(parentId, activeData.type);
      toast({
        title: 'Widget added',
        description: `${activeData.type} has been added to the canvas.`,
      });
    }
  }, [addWidget, toast]);

  // Save project
  const handleSave = async () => {
    if (!user || !projectId || !widgetTree) return;

    setIsSaving(true);
    
    await updateProjectInStore(user.uid, projectId, {
      widgetTree,
      updatedAt: Date.now(),
    });

    toast({
      title: 'Project saved',
      description: 'Your changes have been saved.',
    });
    
    setIsSaving(false);
  };

  // Get selected widget
  const selectedWidget = selectedWidgetId && widgetTree
    ? findWidgetById(widgetTree, selectedWidgetId)
    : null;

  // Filter widgets by search
  const filteredWidgets = searchQuery
    ? widgetDefinitions.filter(w =>
        w.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : widgetDefinitions;

  // Generate code
  const generatedCode = widgetTree ? generateFullCode(widgetTree) : '';

  if (!user) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen bg-[#07080D] flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-[#0E111A] border-b border-[#1E1E2E] flex items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E]"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7B6DFF] to-[#2EE7FF] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[#F2F4F8]">
              {currentProject?.name || 'Untitled Project'}
            </span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={undo}
                    disabled={!canUndo()}
                    className="text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E] disabled:opacity-30"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={redo}
                    disabled={!canRedo()}
                    className="text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E] disabled:opacity-30"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 bg-[#2D2D3D]" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePreview}
                    className={cn(
                      'text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E]',
                      showPreview && 'text-[#7B6DFF] bg-[#7B6DFF]/10'
                    )}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCode}
                    className={cn(
                      'text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E]',
                      showCode && 'text-[#7B6DFF] bg-[#7B6DFF]/10'
                    )}
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Code</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 bg-[#2D2D3D]" />

            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Widget Library */}
          <div className="w-72 bg-[#0E111A] border-r border-[#1E1E2E] flex flex-col">
            <div className="p-4 border-b border-[#1E1E2E]">
              <h2 className="font-semibold text-[#F2F4F8] mb-3">Widgets</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7ACB8]" />
                <Input
                  placeholder="Search widgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] placeholder:text-[#A7ACB8]/50 focus:border-[#7B6DFF]"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {widgetCategories.map((category) => {
                  const categoryWidgets = filteredWidgets.filter(
                    (w) => w.category === category.id
                  );
                  if (categoryWidgets.length === 0) return null;

                  return (
                    <div key={category.id}>
                      <h3 className="text-xs font-medium text-[#A7ACB8] uppercase tracking-wider mb-3">
                        {category.name}
                      </h3>
                      <div className="space-y-2">
                        {categoryWidgets.map((widget) => (
                          <DraggableWidgetItem key={widget.type} widget={widget} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 bg-[#07080D] relative overflow-auto">
            <div className="min-h-full flex items-center justify-center p-8">
              {widgetTree ? (
                <div
                  className="relative bg-[#0E111A] rounded-lg shadow-2xl overflow-hidden"
                  style={{
                    width: 375,
                    height: 812,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                  onClick={() => selectWidget(null)}
                >
                  {/* Phone frame */}
                  <div className="absolute inset-0 border-[12px] border-[#1E1E2E] rounded-[2rem] pointer-events-none z-10" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1E1E2E] rounded-b-xl z-10" />

                  {/* Canvas content */}
                  <div className="w-full h-full overflow-auto p-4 pt-8">
                    <CanvasWidget
                      widget={widgetTree}
                      isSelected={selectedWidgetId === widgetTree.id}
                      onSelect={selectWidget}
                      onRemove={removeWidget}
                      onDuplicate={duplicateWidget}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#1E1E2E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Box className="w-10 h-10 text-[#A7ACB8]" />
                  </div>
                  <p className="text-[#A7ACB8]">Drag widgets here to start building</p>
                </div>
              )}
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#0E111A] border border-[#2D2D3D] rounded-lg p-2">
              <button
                onClick={() => setZoom(zoom - 0.1)}
                className="w-8 h-8 flex items-center justify-center text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E] rounded"
              >
                -
              </button>
              <span className="text-sm text-[#F2F4F8] w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(zoom + 0.1)}
                className="w-8 h-8 flex items-center justify-center text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E] rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* Right Sidebar - Properties & Code */}
          <div className="w-80 bg-[#0E111A] border-l border-[#1E1E2E] flex flex-col">
            <Tabs defaultValue="properties" className="flex-1 flex flex-col">
              <TabsList className="w-full bg-[#07080D] border-b border-[#1E1E2E] rounded-none p-0 h-12">
                <TabsTrigger
                  value="properties"
                  className="flex-1 rounded-none data-[state=active]:bg-[#0E111A] data-[state=active]:text-[#F2F4F8] text-[#A7ACB8]"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Properties
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="flex-1 rounded-none data-[state=active]:bg-[#0E111A] data-[state=active]:text-[#F2F4F8] text-[#A7ACB8]"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {selectedWidget ? (
                      <PropertyEditor
                        widget={selectedWidget}
                        onUpdate={(property, value) =>
                          updateWidgetProperty(selectedWidget.id, property, value)
                        }
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 bg-[#1E1E2E] rounded-xl flex items-center justify-center mx-auto mb-4">
                          <MousePointerClick className="w-6 h-6 text-[#A7ACB8]" />
                        </div>
                        <p className="text-[#A7ACB8]">Select a widget to edit its properties</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="code" className="flex-1 m-0">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-2 border-b border-[#1E1E2E]">
                    <span className="text-xs text-[#A7ACB8]">Generated Dart</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        toast({
                          title: 'Copied',
                          description: 'Code copied to clipboard',
                        });
                      }}
                      className="h-7 text-xs text-[#A7ACB8] hover:text-[#F2F4F8]"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      defaultLanguage="dart"
                      value={generatedCode}
                      theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 12,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-[480px] bg-[#0E111A] border-l border-[#1E1E2E] shadow-2xl z-50"
            >
              <div className="h-full flex flex-col">
                <div className="h-14 border-b border-[#1E1E2E] flex items-center justify-between px-4">
                  <h3 className="font-semibold text-[#F2F4F8]">Live Preview</h3>
                  <div className="flex items-center gap-2">
                    <Select value={deviceType} onValueChange={(v) => setDeviceType(v as DeviceType)}>
                      <SelectTrigger className="w-32 bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0E111A] border-[#2D2D3D]">
                        <SelectItem value="iphone" className="text-[#F2F4F8]">iPhone</SelectItem>
                        <SelectItem value="android" className="text-[#F2F4F8]">Android</SelectItem>
                        <SelectItem value="tablet" className="text-[#F2F4F8]">Tablet</SelectItem>
                        <SelectItem value="desktop" className="text-[#F2F4F8]">Desktop</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleDeviceRotation}
                      className="text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E] h-8 w-8"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePreview}
                      className="text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E] h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center bg-[#07080D] overflow-auto p-8">
                  <DeviceFrame type={deviceType} rotation={deviceRotation}>
                    {widgetTree && (
                      <div className="w-full h-full p-4">
                        {/* Simplified preview rendering */}
                        <div className="text-[#F2F4F8]">Preview Content</div>
                      </div>
                    )}
                  </DeviceFrame>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragId ? (
          <div className="bg-[#7B6DFF] text-white px-4 py-2 rounded-lg shadow-lg">
            Dragging...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Helper function to find widget by ID
function findWidgetById(tree: WidgetInstance, id: string): WidgetInstance | null {
  if (tree.id === id) return tree;
  for (const child of tree.children) {
    const found = findWidgetById(child, id);
    if (found) return found;
  }
  return null;
}
