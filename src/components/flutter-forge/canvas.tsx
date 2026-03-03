'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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

  const deviceWidth = isRotated ? selectedDevice.height : selectedDevice.width;
  const deviceHeight = isRotated ? selectedDevice.width : selectedDevice.height;

  const handleDragOver = useCallback((e: React.DragEvent, nodeId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverId(nodeId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, parentId: string | null) => {
      e.preventDefault();
      setDragOverId(null);

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
      className="flex-1 flex items-center justify-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
    >
      <motion.div
        className="bg-background rounded-xl shadow-2xl overflow-hidden border"
        style={{
          width: deviceWidth * zoom,
          height: deviceHeight * zoom,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Device Frame Header */}
        <div className="h-6 bg-muted flex items-center justify-center border-b">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-muted-foreground">
              {selectedDevice.name} - {deviceWidth}x{deviceHeight}
            </span>
          </div>
        </div>

        {/* Canvas Content */}
        <ScrollArea className="h-[calc(100%-24px)]">
          <div
            className="p-4 min-h-full"
            style={{
              width: deviceWidth * zoom,
              minHeight: (deviceHeight - 24) * zoom,
            }}
          >
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
}: WidgetNodeComponentProps) {
  const definition = getWidgetDefinition(node.type);
  const canHaveChildren = ['Row', 'Column', 'Stack', 'Container', 'Card', 'ListView', 'GridView', 'Wrap', 'Expanded', 'Scaffold', 'AppBar', 'Drawer'].includes(node.type);

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

    return style;
  };

  const getWidgetContent = () => {
    switch (node.type) {
      case 'Text':
        return (
          <span
            style={{
              fontSize: Number(node.properties.fontSize || 16) * zoom,
              color: String(node.properties.color || 'inherit'),
              fontWeight: node.properties.fontWeight === 'bold' ? 'bold' : undefined,
            }}
          >
            {String(node.properties.text || 'Text')}
          </span>
        );
      case 'Icon':
        return (
          <Star
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
            style={{
              width: Number(node.properties.width || 100) * zoom,
              height: Number(node.properties.height || 100) * zoom,
              objectFit: 'cover',
            }}
          />
        );
      case 'TextField':
        return (
          <input
            type="text"
            placeholder={String(node.properties.hintText || node.properties.label || 'Input')}
            className="w-full px-2 py-1 border rounded text-sm"
            style={{ fontSize: 14 * zoom }}
            readOnly
          />
        );
      case 'ElevatedButton':
      case 'OutlinedButton':
      case 'TextButton':
        return (
          <button
            className="px-4 py-2 rounded text-sm font-medium"
            style={{
              backgroundColor: node.type === 'ElevatedButton' ? String(node.properties.color || '#2196F3') : undefined,
              color: node.type === 'ElevatedButton' ? '#fff' : String(node.properties.color || '#2196F3'),
              border: node.type === 'OutlinedButton' ? `1px solid ${node.properties.color || '#2196F3'}` : undefined,
            }}
          >
            {String(node.properties.label || 'Button')}
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
      case 'Divider':
        return (
          <hr
            style={{
              width: '100%',
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
      default:
        return null;
    }
  };

  const isLayoutWidget = ['Row', 'Column', 'Stack', 'ListView', 'GridView', 'Wrap'].includes(node.type);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          className={`
            relative rounded cursor-pointer transition-all
            ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : 'hover:ring-2 hover:ring-purple-500/50'}
            ${isDragOver && canHaveChildren ? 'ring-2 ring-green-500' : ''}
            ${canHaveChildren && node.children.length === 0 ? 'min-h-[60px]' : ''}
          `}
          style={getWidgetStyle()}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onDragOver={canHaveChildren ? onDragOver : undefined}
          onDragLeave={canHaveChildren ? onDragLeave : undefined}
          onDrop={canHaveChildren ? onDrop : undefined}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Widget Label */}
          {isSelected && (
            <div className="absolute -top-6 left-0 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-t flex items-center gap-1">
              {iconMap[node.type] || iconMap.default}
              <span>{node.type}</span>
            </div>
          )}

          {/* Drop Indicator */}
          {isDragOver && canHaveChildren && (
            <div className="absolute inset-0 border-2 border-dashed border-green-500 rounded bg-green-500/10 flex items-center justify-center">
              <span className="text-xs text-green-600">Drop here</span>
            </div>
          )}

          {/* Content */}
          {!isLayoutWidget && getWidgetContent()}

          {/* Layout Widget Content */}
          {isLayoutWidget && (
            <div
              className={`
                ${node.type === 'Row' ? 'flex flex-row' : ''}
                ${node.type === 'Column' ? 'flex flex-col' : ''}
                ${node.type === 'Stack' ? 'relative' : ''}
                ${node.type === 'Wrap' ? 'flex flex-wrap' : ''}
                gap-2 p-2 w-full
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
                <div className="flex-1 min-h-[40px] border border-dashed border-muted-foreground/30 rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    {node.type} - Drag widgets here
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

          {/* Container/Stack with children */}
          {['Container', 'Stack', 'Card', 'Expanded', 'Drawer'].includes(node.type) && (
            <div className="relative w-full h-full">
              {node.children.length === 0 ? (
                <div className="min-h-[60px] border border-dashed border-muted-foreground/30 rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    {node.type} - Drag widgets here
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
        <ContextMenuItem onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
