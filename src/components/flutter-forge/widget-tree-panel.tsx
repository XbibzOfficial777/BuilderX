'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/stores/editor-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  ChevronRight,
  ChevronDown,
  Box,
  Type,
  Image as ImageIcon,
  Star,
  Columns,
  Rows,
  Layers,
  Maximize,
  List,
  Grid,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from 'lucide-react';
import { getWidgetDefinition } from '@/lib/widget-definitions';
import type { WidgetNode } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  Container: <Box className="h-3.5 w-3.5" />,
  Text: <Type className="h-3.5 w-3.5" />,
  Image: <ImageIcon className="h-3.5 w-3.5" />,
  Icon: <Star className="h-3.5 w-3.5" />,
  Row: <Columns className="h-3.5 w-3.5" />,
  Column: <Rows className="h-3.5 w-3.5" />,
  Stack: <Layers className="h-3.5 w-3.5" />,
  Expanded: <Maximize className="h-3.5 w-3.5" />,
  ListView: <List className="h-3.5 w-3.5" />,
  GridView: <Grid className="h-3.5 w-3.5" />,
  Scaffold: <Box className="h-3.5 w-3.5" />,
  default: <Box className="h-3.5 w-3.5" />,
};

export function WidgetTreePanel() {
  const {
    widgetTree,
    selectedWidgetId,
    selectWidget,
    deleteWidget,
    duplicateWidget,
  } = useEditorStore();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root']));

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!widgetTree) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">No widgets</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b shrink-0">
        <h2 className="font-semibold text-sm">Widget Tree</h2>
        <p className="text-xs text-muted-foreground">
          {countWidgets(widgetTree)} widgets
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <TreeNode
            node={widgetTree}
            level={0}
            expandedIds={expandedIds}
            selectedId={selectedWidgetId}
            onToggle={toggleExpanded}
            onSelect={selectWidget}
            onDelete={deleteWidget}
            onDuplicate={duplicateWidget}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

interface TreeNodeProps {
  node: WidgetNode;
  level: number;
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function TreeNode({
  node,
  level,
  expandedIds,
  selectedId,
  onToggle,
  onSelect,
  onDelete,
  onDuplicate,
}: TreeNodeProps) {
  const definition = getWidgetDefinition(node.type);
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            className={`
              tree-item flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer
              ${isSelected ? 'selected bg-accent/50' : ''}
            `}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={handleClick}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Expand/Collapse Icon */}
            {hasChildren ? (
              <motion.div
                className="shrink-0"
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </motion.div>
            ) : (
              <div className="w-3" />
            )}

            {/* Widget Icon */}
            <div className={`
              shrink-0 p-1 rounded
              ${isSelected ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}
            `}>
              {iconMap[node.type] || iconMap.default}
            </div>

            {/* Widget Name */}
            <span className={`
              text-xs truncate flex-1
              ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}
            `}>
              {node.name || node.type}
            </span>

            {/* Children Count Badge */}
            {hasChildren && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {node.children.length}
              </span>
            )}
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent align="start" className="w-48">
          <ContextMenuItem onClick={() => onDuplicate(node.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            Hide
          </ContextMenuItem>
          <ContextMenuItem>
            <Lock className="mr-2 h-4 w-4" />
            Lock
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                expandedIds={expandedIds}
                selectedId={selectedId}
                onToggle={onToggle}
                onSelect={onSelect}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function countWidgets(node: WidgetNode): number {
  let count = 1;
  for (const child of node.children) {
    count += countWidgets(child);
  }
  return count;
}
