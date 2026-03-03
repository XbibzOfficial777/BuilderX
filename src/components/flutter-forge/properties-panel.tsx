'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, ChevronRight, Settings } from 'lucide-react';
import { getWidgetDefinition } from '@/lib/widget-definitions';
import type { WidgetNode, PropertyDefinition } from '@/types';

export function PropertiesPanel() {
  const {
    selectedWidgetId,
    widgetTree,
    updateWidget,
    deleteWidget,
    selectWidget,
  } = useEditorStore();

  const selectedWidget = selectedWidgetId
    ? findWidgetById(widgetTree, selectedWidgetId)
    : null;

  const definition = selectedWidget
    ? getWidgetDefinition(selectedWidget.type)
    : null;

  if (!selectedWidget || !definition) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b shrink-0">
          <h2 className="font-semibold text-sm">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a widget to view its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (key: string, value: unknown) => {
    updateWidget(selectedWidgetId!, { [key]: value });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">{definition.name}</h2>
            <p className="text-xs text-muted-foreground">{selectedWidget.type}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              deleteWidget(selectedWidgetId!);
              selectWidget(null);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Widget Name */}
          <div className="space-y-2">
            <Label className="text-xs">Widget Name</Label>
            <Input
              value={selectedWidget.name}
              onChange={(e) => {
                // Update widget name in tree
              }}
              className="h-8 text-sm"
            />
          </div>

          <Separator />

          {/* Dynamic Properties */}
          {definition.properties.map((prop) => (
            <PropertyInput
              key={prop.key}
              property={prop}
              value={selectedWidget.properties[prop.key]}
              onChange={(value) => handlePropertyChange(prop.key, value)}
            />
          ))}

          {/* Children Count */}
          {selectedWidget.children.length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-xs">Children</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedWidget.children.length} child widget
                  {selectedWidget.children.length !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface PropertyInputProps {
  property: PropertyDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

function PropertyInput({ property, value, onChange }: PropertyInputProps) {
  const renderInput = () => {
    switch (property.type) {
      case 'text':
        return (
          <Input
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-sm"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={Number(value || 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-8 text-sm"
          />
        );

      case 'color':
        return (
          <div className="flex gap-2">
            <Input
              type="color"
              value={String(value || '#000000')}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-8 p-1 cursor-pointer"
            />
            <Input
              value={String(value || '')}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="h-8 text-sm flex-1"
            />
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={onChange}
            />
            <span className="text-xs text-muted-foreground">
              {value ? 'Yes' : 'No'}
            </span>
          </div>
        );

      case 'select':
      case 'dropdown':
        return (
          <Select
            value={String(value || '')}
            onValueChange={onChange}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'size':
        return (
          <Input
            type="number"
            value={Number(value || 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-8 text-sm"
          />
        );

      default:
        return (
          <Input
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-sm"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{property.label}</Label>
      {renderInput()}
    </div>
  );
}

function findWidgetById(
  node: WidgetNode | null,
  id: string
): WidgetNode | null {
  if (!node) return null;
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findWidgetById(child, id);
    if (found) return found;
  }
  return null;
}
