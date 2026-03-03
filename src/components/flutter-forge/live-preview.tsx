'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/stores/editor-store';
import { Button } from '@/components/ui/button';
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
  Smartphone,
  RotateCw,
  ChevronDown,
  Maximize2,
  Smartphone as PhoneIcon,
  Tablet,
} from 'lucide-react';
import { deviceFrames } from '@/lib/widget-definitions';
import type { WidgetNode } from '@/types';

export function LivePreview() {
  const {
    widgetTree,
    selectedDevice,
    isRotated,
    setDevice,
    toggleRotation,
  } = useEditorStore();

  const deviceWidth = isRotated ? selectedDevice.height : selectedDevice.width;
  const deviceHeight = isRotated ? selectedDevice.width : selectedDevice.height;

  // Generate preview HTML from widget tree
  const previewHTML = React.useMemo(() => {
    if (!widgetTree) return '';
    return generatePreviewHTML(widgetTree);
  }, [widgetTree]);

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 border-b bg-muted/50 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Preview</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Device Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 h-7">
                {selectedDevice.type === 'phone' ? (
                  <PhoneIcon className="h-3.5 w-3.5" />
                ) : (
                  <Tablet className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">{selectedDevice.name}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Phones</DropdownMenuLabel>
              {deviceFrames
                .filter((d) => d.type === 'phone')
                .map((device) => (
                  <DropdownMenuItem
                    key={device.id}
                    onClick={() => setDevice(device)}
                    className={selectedDevice.id === device.id ? 'bg-muted' : ''}
                  >
                    {device.name}
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
                    {device.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleRotation}
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotate</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-muted/30 p-4 overflow-auto">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden relative"
          style={{
            width: Math.min(deviceWidth * 0.5, 350),
            height: Math.min(deviceHeight * 0.5, 600),
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Device Frame */}
          {selectedDevice.os === 'ios' && (
            <div className="absolute top-0 left-0 right-0 h-6 bg-black/5 flex items-center justify-center z-10">
              <div className="w-20 h-4 bg-black rounded-full" />
            </div>
          )}

          {/* Preview Content */}
          <div
            className="w-full h-full overflow-auto"
            style={{
              paddingTop: selectedDevice.os === 'ios' ? '24px' : 0,
            }}
          >
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                    ${previewStyles}
                  </style>
                </head>
                <body>
                  ${previewHTML}
                </body>
                </html>
              `}
              className="w-full h-full border-0"
              title="Preview"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const previewStyles = `
  .flutter-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
  .flutter-row {
    display: flex;
    flex-direction: row;
    width: 100%;
  }
  .flutter-column {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .flutter-stack {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .flutter-stack > * {
    position: absolute;
  }
  .flutter-text {
    font-size: 16px;
    color: #000;
  }
  .flutter-button {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
  }
  .flutter-input {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
  }
  .flutter-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 16px;
  }
`;

function generatePreviewHTML(node: WidgetNode): string {
  switch (node.type) {
    case 'Scaffold':
      return `<div class="flutter-container" style="background: #f5f5f5;">
        ${node.children.map(generatePreviewHTML).join('')}
      </div>`;

    case 'Container':
      return `<div style="
        ${node.properties.width ? `width: ${node.properties.width}px;` : ''}
        ${node.properties.height ? `height: ${node.properties.height}px;` : ''}
        ${node.properties.color ? `background-color: ${node.properties.color};` : ''}
        ${node.properties.padding ? `padding: ${node.properties.padding}px;` : ''}
        ${node.properties.borderRadius ? `border-radius: ${node.properties.borderRadius}px;` : ''}
      ">
        ${node.children.map(generatePreviewHTML).join('')}
      </div>`;

    case 'Row':
      return `<div class="flutter-row" style="
        justify-content: ${getFlexJustify(String(node.properties.mainAxisAlignment))};
        align-items: ${getFlexAlign(String(node.properties.crossAxisAlignment))};
        gap: 8px;
        padding: 8px;
      ">
        ${node.children.map(generatePreviewHTML).join('')}
      </div>`;

    case 'Column':
      return `<div class="flutter-column" style="
        justify-content: ${getFlexJustify(String(node.properties.mainAxisAlignment))};
        align-items: ${getFlexAlign(String(node.properties.crossAxisAlignment))};
        gap: 8px;
        padding: 8px;
      ">
        ${node.children.map(generatePreviewHTML).join('')}
      </div>`;

    case 'Stack':
      return `<div class="flutter-stack">
        ${node.children.map(generatePreviewHTML).join('')}
      </div>`;

    case 'Text':
      return `<span class="flutter-text" style="
        font-size: ${node.properties.fontSize || 16}px;
        color: ${node.properties.color || '#000'};
        font-weight: ${node.properties.fontWeight === 'bold' ? 'bold' : 'normal'};
        text-align: ${node.properties.textAlign || 'left'};
      ">${node.properties.text || 'Text'}</span>`;

    case 'Image':
      return `<img src="${node.properties.src}" style="
        width: ${node.properties.width || 100}px;
        height: ${node.properties.height || 100}px;
        object-fit: ${node.properties.fit || 'cover'};
      " alt="Widget" />`;

    case 'ElevatedButton':
      return `<button class="flutter-button" style="
        background: ${node.properties.color || '#2196F3'};
        color: white;
        border: none;
      ">${node.properties.label || 'Button'}</button>`;

    case 'OutlinedButton':
      return `<button class="flutter-button" style="
        background: transparent;
        color: ${node.properties.color || '#2196F3'};
        border: 1px solid ${node.properties.color || '#2196F3'};
      ">${node.properties.label || 'Button'}</button>`;

    case 'TextButton':
      return `<button class="flutter-button" style="
        background: transparent;
        color: ${node.properties.color || '#2196F3'};
        border: none;
      ">${node.properties.label || 'Button'}</button>`;

    case 'TextField':
      return `<input class="flutter-input" type="text" placeholder="${node.properties.hintText || node.properties.label || 'Input'}" />`;

    case 'Card':
      return `<div class="flutter-card" style="
        ${node.properties.color ? `background: ${node.properties.color};` : ''}
      ">
        ${node.children.map(generatePreviewHTML).join('')}
      </div>`;

    case 'Icon':
      return `<span style="
        font-size: ${node.properties.size || 24}px;
        color: ${node.properties.color || '#000'};
      ">⭐</span>`;

    case 'CircularProgressIndicator':
      return `<div style="
        width: 24px;
        height: 24px;
        border: 2px solid ${node.properties.color || '#2196F3'};
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>`;

    case 'Divider':
      return `<hr style="
        width: 100%;
        height: ${node.properties.thickness || 1}px;
        background: ${node.properties.color || '#ccc'};
        border: none;
      " />`;

    case 'SizedBox':
      return `<div style="
        ${node.properties.width ? `width: ${node.properties.width}px;` : ''}
        ${node.properties.height ? `height: ${node.properties.height}px;` : ''}
      "></div>`;

    default:
      return `<div style="padding: 8px; color: #666; font-size: 12px;">
        ${node.type}
      </div>`;
  }
}

function getFlexJustify(value: string): string {
  switch (value) {
    case 'center': return 'center';
    case 'end': return 'flex-end';
    case 'spaceBetween': return 'space-between';
    case 'spaceAround': return 'space-around';
    case 'spaceEvenly': return 'space-evenly';
    default: return 'flex-start';
  }
}

function getFlexAlign(value: string): string {
  switch (value) {
    case 'center': return 'center';
    case 'end': return 'flex-end';
    case 'stretch': return 'stretch';
    default: return 'flex-start';
  }
}
