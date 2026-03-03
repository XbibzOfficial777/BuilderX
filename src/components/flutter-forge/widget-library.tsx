'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/stores/editor-store';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
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
  WrapText,
  TextCursorInput,
  CheckSquare,
  ToggleLeft,
  Sliders,
  ChevronDown,
  MousePointerClick,
  Square,
  Text,
  PlusCircle,
  CreditCard,
  Loader,
  Minus,
  PanelTop,
  PanelBottom,
  LayoutList,
  PanelLeft,
  Search,
  ChevronRight,
} from 'lucide-react';
import { widgetDefinitions, widgetCategories, getWidgetsByCategory, type WidgetDefinition } from '@/lib/widget-definitions';
import { v4 as uuidv4 } from 'uuid';
import type { WidgetNode } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  square: <Box className="h-4 w-4" />,
  type: <Type className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
  columns: <Columns className="h-4 w-4" />,
  rows: <Rows className="h-4 w-4" />,
  layers: <Layers className="h-4 w-4" />,
  maximize: <Maximize className="h-4 w-4" />,
  list: <List className="h-4 w-4" />,
  grid: <Grid className="h-4 w-4" />,
  wrap: <WrapText className="h-4 w-4" />,
  'text-cursor-input': <TextCursorInput className="h-4 w-4" />,
  'check-square': <CheckSquare className="h-4 w-4" />,
  'toggle-left': <ToggleLeft className="h-4 w-4" />,
  sliders: <Sliders className="h-4 w-4" />,
  'chevron-down': <ChevronDown className="h-4 w-4" />,
  'mouse-pointer-click': <MousePointerClick className="h-4 w-4" />,
  'plus-circle': <PlusCircle className="h-4 w-4" />,
  'credit-card': <CreditCard className="h-4 w-4" />,
  loader: <Loader className="h-4 w-4" />,
  minus: <Minus className="h-4 w-4" />,
  'panel-top': <PanelTop className="h-4 w-4" />,
  'panel-bottom': <PanelBottom className="h-4 w-4" />,
  'layout-tabs': <LayoutList className="h-4 w-4" />,
  'panel-left': <PanelLeft className="h-4 w-4" />,
  text: <Text className="h-4 w-4" />,
  box: <Box className="h-4 w-4" />,
  mouse: <MousePointerClick className="h-4 w-4" />,
};

const categoryIconMap: Record<string, React.ReactNode> = {
  basic: <Box className="h-4 w-4" />,
  layout: <Columns className="h-4 w-4" />,
  input: <TextCursorInput className="h-4 w-4" />,
  display: <CreditCard className="h-4 w-4" />,
  button: <MousePointerClick className="h-4 w-4" />,
  navigation: <PanelTop className="h-4 w-4" />,
};

export function WidgetLibrary() {
  const { addWidget } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>(['basic', 'layout']);

  const filteredWidgets = searchQuery
    ? widgetDefinitions.filter(
        (w) =>
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const handleDragStart = (e: React.DragEvent, widget: WidgetDefinition) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddWidget = (widget: WidgetDefinition) => {
    const newWidget: WidgetNode = {
      id: uuidv4(),
      type: widget.type,
      name: widget.name,
      properties: { ...widget.defaultValue },
      children: [],
    };
    addWidget(newWidget, null);
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b shrink-0">
        <h2 className="font-semibold text-sm mb-2">Widget Library</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredWidgets ? (
            <div className="space-y-1">
              {filteredWidgets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No widgets found
                </p>
              ) : (
                filteredWidgets.map((widget) => (
                  <WidgetItem
                    key={widget.type}
                    widget={widget}
                    onDragStart={handleDragStart}
                    onAdd={handleAddWidget}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {widgetCategories.map((category) => (
                <Collapsible
                  key={category.id}
                  open={openCategories.includes(category.id)}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between h-8"
                    >
                      <span className="flex items-center gap-2">
                        {categoryIconMap[category.id]}
                        <span className="text-sm">{category.name}</span>
                      </span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform ${
                          openCategories.includes(category.id) ? 'rotate-90' : ''
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pt-1">
                    {getWidgetsByCategory(category.id).map((widget) => (
                      <WidgetItem
                        key={widget.type}
                        widget={widget}
                        onDragStart={handleDragStart}
                        onAdd={handleAddWidget}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface WidgetItemProps {
  widget: WidgetDefinition;
  onDragStart: (e: React.DragEvent, widget: WidgetDefinition) => void;
  onAdd: (widget: WidgetDefinition) => void;
}

function WidgetItem({ widget, onDragStart, onAdd }: WidgetItemProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            draggable
            onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, widget)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted cursor-grab active:cursor-grabbing transition-colors group"
            onDoubleClick={() => onAdd(widget)}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded bg-background shrink-0">
              {iconMap[widget.icon] || <Box className="h-4 w-4" />}
            </div>
            <span className="text-sm flex-1 truncate">{widget.name}</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="text-xs">{widget.name}</p>
          <p className="text-xs text-muted-foreground">Double-click to add</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
