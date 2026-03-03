'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/stores/editor-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Box,
  Type,
  Image as ImageIcon,
  Star,
  Columns,
  Rows,
  Layers,
  Copy,
  Trash2,
  ChevronRight,
  Plus,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { getWidgetDefinition, type WidgetDefinition } from '@/lib/widget-definitions';
import type { WidgetNode } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const iconMap: Record<string, React.ReactNode> = {
  Container: <Box className="h-4 w-4" />,
  Text: <Type className="h-4 w-4" />,
  Image: <ImageIcon className="h-4 w-4" />,
  Icon: <Star className="h-4 w-4" />,
  Row: <Columns className="h-4 w-4" />,
  Column: <Rows className="h-4 w-4" />,
  Stack: <Layers className="h-4 w-4" />,
  default: <Box className="h-4 w-4" />,
};

export function Canvas() {
  const {
    widgetTree,
    selectedWidgetId,
    selectedDevice,
    isRotated,
    zoom,
    selectWidget,
    addWidget,
    updateWidget,
    deleteWidget,
    duplicateWidget,
    moveWidget,
  } = useEditorStore();

  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ parentId: string | null; index: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const deviceWidth = isRotated ? selectedDevice.height : selectedDevice.width;
  const deviceHeight = isRotated ? selectedDevice.width : selectedDevice.height;

  const handleDragOver = useCallback((e: React.DragEvent, nodeId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverId(nodeId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
    setDropIndicator(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, parentId: string | null) => {
      e.preventDefault();
      setDragOverId(null);
      setDropIndicator(null);

      const widgetData = e.dataTransfer.getData('widget');
      if (!widgetData) return;

      try {
        const widget: WidgetDefinition = JSON.parse(widgetData);
        const newWidget: WidgetNode = {
          id: uuidv4(),
          type: widget.type,
          name: widget.name,
          properties: { ...widget.defaultValue },
          children: [],
        };
        addWidget(newWidget, parentId);
      } catch (error) {
        console.error('Failed to parse widget data:', error);
      }
    },
    [addWidget]
  );

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverId(null);
      setDropIndicator(null);

      const widgetData = e.dataTransfer.getData('widget');
      if (!widgetData) return;

      try {
        const widget: WidgetDefinition = JSON.parse(widgetData);
        const newWidget: WidgetNode = {
          id: uuidv4(),
          type: widget.type,
          name: widget.name,
          properties: { ...widget.defaultValue },
          children: [],
        };
        addWidget(newWidget, null);
      } catch (error) {
        console.error('Failed to parse widget data:', error);
      }
    },
    [addWidget]
  );

  if (!widgetTree) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">No widget tree</p>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className="flex-1 flex items-center justify-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
    >
      <motion.div
        className="bg-background rounded-2xl device-frame overflow-hidden relative"
        style={{
          width: deviceWidth * zoom,
          height: deviceHeight * zoom,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Device Frame Header */}
        <div className="h-7 bg-gradient-to-r from-muted via-muted/80 to-muted flex items-center justify-between px-3 border-b shrink-0">
          <div className="flex items-center gap-1.5">
            {selectedDevice.os === 'ios' ? (
              <div className="w-16 h-4 bg-black/80 rounded-full" />
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>{deviceWidth}x{deviceHeight}</span>
          </div>
        </div>

        {/* Canvas Content */}
        <ScrollArea className="h-[calc(100%-28px)]">
          <div
            className="p-2 min-h-full relative"
            style={{
              width: deviceWidth * zoom,
              minHeight: (deviceHeight - 28) * zoom,
            }}
          >
            {/* Empty State */}
            {widgetTree.children.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center p-4"
              >
                <div className="widget-drop-zone rounded-xl p-8 text-center max-w-xs">
                  <div className="w-16 h-16 rounded-2xl gradient-brand mx-auto mb-4 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-medium mb-1">Start Building</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag widgets from the left panel or double-click to add them here
                  </p>
                </div>
              </motion.div>
            )}

            <WidgetNodeComponent
              node={widgetTree}
              isSelected={selectedWidgetId === widgetTree.id}
              isDragOver={dragOverId === widgetTree.id}
              onSelect={() => selectWidget(widgetTree.id)}
              onDragOver={(e) => handleDragOver(e, widgetTree.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, widgetTree.id)}
              onUpdate={(props) => updateWidget(widgetTree.id, props)}
              onDelete={() => deleteWidget(widgetTree.id)}
              onDuplicate={() => duplicateWidget(widgetTree.id)}
              onAddChild={(widget) => addWidget(widget, widgetTree.id)}
              zoom={zoom}
              selectedId={selectedWidgetId}
              dragOverId={dragOverId}
              selectWidget={selectWidget}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              updateWidget={updateWidget}
              deleteWidget={deleteWidget}
              duplicateWidget={duplicateWidget}
              isRoot
            />
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}

interface WidgetNodeComponentProps {
  node: WidgetNode;
  isSelected: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onUpdate: (props: Record<string, unknown>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddChild?: (widget: WidgetNode) => void;
  zoom: number;
  selectedId: string | null;
  dragOverId: string | null;
  selectWidget: (id: string) => void;
  handleDragOver: (e: React.DragEvent, id: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, parentId: string | null) => void;
  updateWidget: (id: string, props: Record<string, unknown>) => void;
  deleteWidget: (id: string) => void;
  duplicateWidget: (id: string) => void;
  isRoot?: boolean;
}

function WidgetNodeComponent({
  node,
  isSelected,
  isDragOver,
  onSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onUpdate,
  onDelete,
  onDuplicate,
  zoom,
  selectedId,
  dragOverId,
  selectWidget,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  updateWidget,
  deleteWidget,
  duplicateWidget,
  isRoot = false,
}: WidgetNodeComponentProps) {
  const definition = getWidgetDefinition(node.type);
  const canHaveChildren = ['Row', 'Column', 'Stack', 'Container', 'Card', 'ListView', 'GridView', 'Wrap', 'Expanded', 'Scaffold', 'AppBar', 'Drawer'].includes(node.type);
  const isLayoutWidget = ['Row', 'Column', 'Stack', 'ListView', 'GridView', 'Wrap'].includes(node.type);

  const getWidgetStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (node.properties.width) {
      style.width = Number(node.properties.width) * zoom;
    }
    if (node.properties.height) {
      style.height = Number(node.properties.height) * zoom;
    }
    if (node.properties.color || node.properties.backgroundColor) {
      style.backgroundColor = String(node.properties.color || node.properties.backgroundColor);
    }
    if (node.properties.borderRadius) {
      style.borderRadius = Number(node.properties.borderRadius) * zoom;
    }
    if (node.properties.padding) {
      style.padding = Number(node.properties.padding) * zoom;
    }
    if (node.properties.margin) {
      style.margin = Number(node.properties.margin) * zoom;
    }
    if (node.properties.elevation && node.type === 'Card') {
      style.boxShadow = `0 ${Number(node.properties.elevation) * zoom}px ${Number(node.properties.elevation) * 2 * zoom}px rgba(0,0,0,0.1)`;
    }

    return style;
  };

  const getWidgetContent = () => {
    const textZoom = Math.max(0.7, Math.min(1.3, zoom));
    
    switch (node.type) {
      case 'Text':
        return (
          <span
            className="block"
            style={{
              fontSize: Number(node.properties.fontSize || 16) * textZoom,
              color: String(node.properties.color || 'inherit'),
              fontWeight: node.properties.fontWeight === 'bold' ? 'bold' : 
                          node.properties.fontWeight?.toString().startsWith('w') ? 500 : undefined,
              textAlign: String(node.properties.textAlign || 'left') as 'left' | 'center' | 'right' | 'justify',
            }}
          >
            {String(node.properties.text || 'Text')}
          </span>
        );
      case 'Icon':
        return (
          <Star
            className="inline-block"
            style={{
              width: Number(node.properties.size || 24) * zoom,
              height: Number(node.properties.size || 24) * zoom,
              color: String(node.properties.color || 'currentColor'),
            }}
          />
        );
      case 'Image':
        return (
          <img
            src={String(node.properties.src || 'https://via.placeholder.com/150')}
            alt="Widget"
            className="block max-w-full"
            style={{
              width: Number(node.properties.width || 100) * zoom,
              height: Number(node.properties.height || 100) * zoom,
              objectFit: String(node.properties.fit || 'cover') as 'cover' | 'contain' | 'fill',
            }}
          />
        );
      case 'TextField':
        return (
          <div className="w-full">
            <label className="text-[10px] text-muted-foreground mb-0.5 block">
              {String(node.properties.label || 'Label')}
            </label>
            <input
              type="text"
              placeholder={String(node.properties.hintText || 'Enter text')}
              className="w-full px-2 py-1.5 border rounded text-sm bg-background"
              style={{ fontSize: 12 * textZoom }}
              readOnly
            />
          </div>
        );
      case 'ElevatedButton':
      case 'OutlinedButton':
      case 'TextButton':
        return (
          <button
            className="px-3 py-1.5 rounded text-sm font-medium transition-all"
            style={{
              backgroundColor: node.type === 'ElevatedButton' ? String(node.properties.color || '#2196F3') : undefined,
              color: node.type === 'ElevatedButton' ? '#fff' : String(node.properties.color || '#2196F3'),
              border: node.type === 'OutlinedButton' ? `1px solid ${node.properties.color || '#2196F3'}` : undefined,
              fontSize: 12 * textZoom,
              boxShadow: node.type === 'ElevatedButton' ? '0 2px 4px rgba(0,0,0,0.1)' : undefined,
            }}
          >
            {String(node.properties.label || 'Button')}
          </button>
        );
      case 'FloatingActionButton':
        return (
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: String(node.properties.color || '#2196F3'),
            }}
          >
            <Plus className="h-5 w-5 text-white" />
          </button>
        );
      case 'IconButton':
        return (
          <button className="p-2 rounded-full hover:bg-muted/50 transition-colors">
            <Star
              style={{
                width: Number(node.properties.size || 24) * zoom,
                height: Number(node.properties.size || 24) * zoom,
                color: String(node.properties.color || 'currentColor'),
              }}
            />
          </button>
        );
      case 'CircularProgressIndicator':
        return (
          <div
            className="rounded-full border-2 border-t-transparent animate-spin"
            style={{
              width: 24 * zoom,
              height: 24 * zoom,
              borderColor: String(node.properties.color || '#2196F3'),
              borderTopColor: 'transparent',
            }}
          />
        );
      case 'LinearProgressIndicator':
        return (
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Number(node.properties.value || 0.5) * 100}%`,
                backgroundColor: String(node.properties.color || '#2196F3'),
              }}
            />
          </div>
        );
      case 'Divider':
        return (
          <hr
            className="w-full border-0"
            style={{
              height: Number(node.properties.thickness || 1),
              backgroundColor: String(node.properties.color || '#CCCCCC'),
            }}
          />
        );
      case 'SizedBox':
        return (
          <div
            style={{
              width: Number(node.properties.width || 10) * zoom || 10,
              height: Number(node.properties.height || 10) * zoom || 10,
              backgroundColor: 'transparent',
            }}
          />
        );
      case 'Checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(node.properties.value)}
              readOnly
              className="w-4 h-4 rounded border"
            />
            <span style={{ fontSize: 12 * textZoom }}>{String(node.properties.label || 'Checkbox')}</span>
          </label>
        );
      case 'Switch':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-8 h-4 rounded-full transition-colors ${Boolean(node.properties.value) ? 'bg-primary' : 'bg-muted'}`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${Boolean(node.properties.value) ? 'translate-x-4' : 'translate-x-0.5'} mt-0.5`}
              />
            </div>
            <span style={{ fontSize: 12 * textZoom }}>{String(node.properties.label || 'Switch')}</span>
          </label>
        );
      case 'Slider':
        return (
          <input
            type="range"
            min={Number(node.properties.min || 0)}
            max={Number(node.properties.max || 100)}
            value={Number(node.properties.value || 50)}
            readOnly
            className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer"
          />
        );
      case 'AppBar':
        return (
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{
              backgroundColor: String(node.properties.backgroundColor || '#2196F3'),
            }}
          >
            <span
              className="text-white font-medium"
              style={{ fontSize: 14 * textZoom }}
            >
              {String(node.properties.title || 'AppBar')}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          className={`
            relative rounded transition-all cursor-pointer
            ${isSelected ? 'widget-selected' : 'widget-hover'}
            ${isDragOver && canHaveChildren ? 'widget-drop-zone drag-over' : ''}
            ${canHaveChildren && node.children.length === 0 && !isRoot ? 'min-h-[40px] border border-dashed border-muted-foreground/30' : ''}
          `}
          style={getWidgetStyle()}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onDragOver={canHaveChildren ? onDragOver : undefined}
          onDragLeave={canHaveChildren ? onDragLeave : undefined}
          onDrop={canHaveChildren ? onDrop : undefined}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
        >
          {/* Widget Label Badge */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute -top-5 left-0 gradient-brand text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm z-10"
              >
                {iconMap[node.type] || iconMap.default}
                <span>{node.type}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drop Indicator Overlay */}
          <AnimatePresence>
            {isDragOver && canHaveChildren && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 border-2 border-dashed border-primary rounded bg-primary/5 flex items-center justify-center z-20"
              >
                <div className="bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded shadow">
                  Drop here
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          {!isLayoutWidget && !canHaveChildren && getWidgetContent()}

          {/* Container/Stack with children */}
          {['Container', 'Stack', 'Card', 'Expanded', 'Drawer'].includes(node.type) && (
            <div className="relative w-full h-full">
              {node.children.length === 0 ? (
                <div className="min-h-[40px] flex items-center justify-center p-2">
                  <span className="text-[10px] text-muted-foreground">
                    {node.type}
                  </span>
                </div>
              ) : (
                node.children.map((child) => (
                  <WidgetNodeComponent
                    key={child.id}
                    node={child}
                    isSelected={selectedId === child.id}
                    isDragOver={dragOverId === child.id}
                    onSelect={() => selectWidget(child.id)}
                    onDragOver={(e) => handleDragOver(e, child.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, child.id)}
                    onUpdate={(props) => updateWidget(child.id, props)}
                    onDelete={() => deleteWidget(child.id)}
                    onDuplicate={() => duplicateWidget(child.id)}
                    zoom={zoom}
                    selectedId={selectedId}
                    dragOverId={dragOverId}
                    selectWidget={selectWidget}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    updateWidget={updateWidget}
                    deleteWidget={deleteWidget}
                    duplicateWidget={duplicateWidget}
                  />
                ))
              )}
            </div>
          )}

          {/* Layout Widget Content */}
          {isLayoutWidget && (
            <div
              className={`
                ${node.type === 'Row' ? 'flex flex-row' : ''}
                ${node.type === 'Column' ? 'flex flex-col' : ''}
                ${node.type === 'Stack' ? 'relative' : ''}
                ${node.type === 'Wrap' ? 'flex flex-wrap' : ''}
                ${node.type === 'ListView' ? 'flex flex-col overflow-auto' : ''}
                ${node.type === 'GridView' ? 'grid grid-cols-2 gap-2' : ''}
                gap-1.5 p-1.5 w-full min-h-[30px]
              `}
              style={{
                justifyContent: node.properties.mainAxisAlignment === 'center' ? 'center' :
                               node.properties.mainAxisAlignment === 'end' ? 'flex-end' :
                               node.properties.mainAxisAlignment === 'spaceBetween' ? 'space-between' :
                               node.properties.mainAxisAlignment === 'spaceAround' ? 'space-around' :
                               node.properties.mainAxisAlignment === 'spaceEvenly' ? 'space-evenly' :
                               'flex-start',
                alignItems: node.properties.crossAxisAlignment === 'center' ? 'center' :
                           node.properties.crossAxisAlignment === 'end' ? 'flex-end' :
                           node.properties.crossAxisAlignment === 'stretch' ? 'stretch' :
                           'flex-start',
              }}
            >
              {node.children.length === 0 ? (
                <div className="flex-1 min-h-[30px] border border-dashed border-muted-foreground/20 rounded flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground">
                    {node.type}
                  </span>
                </div>
              ) : (
                node.children.map((child) => (
                  <WidgetNodeComponent
                    key={child.id}
                    node={child}
                    isSelected={selectedId === child.id}
                    isDragOver={dragOverId === child.id}
                    onSelect={() => selectWidget(child.id)}
                    onDragOver={(e) => handleDragOver(e, child.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, child.id)}
                    onUpdate={(props) => updateWidget(child.id, props)}
                    onDelete={() => deleteWidget(child.id)}
                    onDuplicate={() => duplicateWidget(child.id)}
                    zoom={zoom}
                    selectedId={selectedId}
                    dragOverId={dragOverId}
                    selectWidget={selectWidget}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    updateWidget={updateWidget}
                    deleteWidget={deleteWidget}
                    duplicateWidget={duplicateWidget}
                  />
                ))
              )}
            </div>
          )}
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem>
          <ArrowUp className="mr-2 h-4 w-4" />
          Move Up
        </ContextMenuItem>
        <ContextMenuItem>
          <ArrowDown className="mr-2 h-4 w-4" />
          Move Down
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
