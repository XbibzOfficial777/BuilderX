'use client';

import React, { useMemo } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { getWidgetDefinition, hexToColorValue } from '@/lib/widget-definitions';
import type { WidgetNode } from '@/types';

export function CodePanel() {
  const { widgetTree, selectedDevice } = useEditorStore();
  const { theme } = useTheme();
  const [copied, setCopied] = React.useState(false);

  const code = useMemo(() => {
    if (!widgetTree) return '';
    return generateDartCode(widgetTree);
  }, [widgetTree]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.dart';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded');
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <div className="h-10 border-b bg-muted/50 flex items-center justify-between px-4 shrink-0">
        <span className="text-sm font-medium">Generated Dart Code</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-1"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <SyntaxHighlighter
            language="dart"
            style={theme === 'dark' ? vscDarkPlus : vs}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              background: 'transparent',
            }}
            showLineNumbers
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </ScrollArea>
    </div>
  );
}

function generateDartCode(node: WidgetNode, indent: number = 0): string {
  const definition = getWidgetDefinition(node.type);
  const spaces = '  '.repeat(indent);
  let code = '';

  switch (node.type) {
    case 'Scaffold':
      code += `${spaces}Scaffold(\n`;
      if (node.children.length > 0) {
        code += `${spaces}  body: ${generateDartCode(node.children[0], indent + 1)},\n`;
      }
      code += `${spaces})`;
      break;

    case 'Container':
      code += `${spaces}Container(\n`;
      if (node.properties.width) {
        code += `${spaces}  width: ${node.properties.width},\n`;
      }
      if (node.properties.height) {
        code += `${spaces}  height: ${node.properties.height},\n`;
      }
      if (node.properties.padding) {
        code += `${spaces}  padding: EdgeInsets.all(${node.properties.padding}),\n`;
      }
      code += `${spaces}  decoration: BoxDecoration(\n`;
      if (node.properties.color) {
        code += `${spaces}    color: Color(${hexToColorValue(String(node.properties.color))}),\n`;
      }
      if (node.properties.borderRadius) {
        code += `${spaces}    borderRadius: BorderRadius.circular(${node.properties.borderRadius}),\n`;
      }
      code += `${spaces}  ),\n`;
      if (node.children.length > 0) {
        code += `${spaces}  child: ${generateDartCode(node.children[0], indent + 1)},\n`;
      }
      code += `${spaces})`;
      break;

    case 'Row':
      code += `${spaces}Row(\n`;
      code += `${spaces}  mainAxisAlignment: MainAxisAlignment.${node.properties.mainAxisAlignment || 'start'},\n`;
      code += `${spaces}  crossAxisAlignment: CrossAxisAlignment.${node.properties.crossAxisAlignment || 'center'},\n`;
      if (node.children.length > 0) {
        code += `${spaces}  children: [\n`;
        node.children.forEach((child, index) => {
          code += generateDartCode(child, indent + 2);
          if (index < node.children.length - 1) {
            code += ',\n';
          } else {
            code += '\n';
          }
        });
        code += `${spaces}  ],\n`;
      }
      code += `${spaces})`;
      break;

    case 'Column':
      code += `${spaces}Column(\n`;
      code += `${spaces}  mainAxisAlignment: MainAxisAlignment.${node.properties.mainAxisAlignment || 'start'},\n`;
      code += `${spaces}  crossAxisAlignment: CrossAxisAlignment.${node.properties.crossAxisAlignment || 'center'},\n`;
      if (node.children.length > 0) {
        code += `${spaces}  children: [\n`;
        node.children.forEach((child, index) => {
          code += generateDartCode(child, indent + 2);
          if (index < node.children.length - 1) {
            code += ',\n';
          } else {
            code += '\n';
          }
        });
        code += `${spaces}  ],\n`;
      }
      code += `${spaces})`;
      break;

    case 'Stack':
      code += `${spaces}Stack(\n`;
      code += `${spaces}  alignment: Alignment.${node.properties.alignment || 'topStart'},\n`;
      if (node.children.length > 0) {
        code += `${spaces}  children: [\n`;
        node.children.forEach((child, index) => {
          code += generateDartCode(child, indent + 2);
          if (index < node.children.length - 1) {
            code += ',\n';
          } else {
            code += '\n';
          }
        });
        code += `${spaces}  ],\n`;
      }
      code += `${spaces})`;
      break;

    case 'Expanded':
      code += `${spaces}Expanded(\n`;
      code += `${spaces}  flex: ${node.properties.flex || 1},\n`;
      if (node.children.length > 0) {
        code += `${spaces}  child: ${generateDartCode(node.children[0], indent + 1)},\n`;
      }
      code += `${spaces})`;
      break;

    case 'Text':
      const fontWeight = node.properties.fontWeight === 'bold' ? 'FontWeight.bold' : 
                        node.properties.fontWeight?.startsWith('w') ? `FontWeight.${node.properties.fontWeight}` :
                        null;
      code += `${spaces}Text(\n`;
      code += `${spaces}  '${node.properties.text || 'Text'}',\n`;
      code += `${spaces}  style: TextStyle(\n`;
      code += `${spaces}    fontSize: ${node.properties.fontSize || 16},\n`;
      if (node.properties.color) {
        code += `${spaces}    color: Color(${hexToColorValue(String(node.properties.color))}),\n`;
      }
      if (fontWeight) {
        code += `${spaces}    fontWeight: ${fontWeight},\n`;
      }
      code += `${spaces}  ),\n`;
      code += `${spaces})`;
      break;

    case 'Image':
      code += `${spaces}Image.network(\n`;
      code += `${spaces}  '${node.properties.src}',\n`;
      code += `${spaces}  width: ${node.properties.width || 100},\n`;
      code += `${spaces}  height: ${node.properties.height || 100},\n`;
      code += `${spaces}  fit: BoxFit.${node.properties.fit || 'cover'},\n`;
      code += `${spaces})`;
      break;

    case 'Icon':
      code += `${spaces}Icon(\n`;
      code += `${spaces}  Icons.${node.properties.icon || 'star'},\n`;
      code += `${spaces}  size: ${node.properties.size || 24},\n`;
      if (node.properties.color) {
        code += `${spaces}  color: Color(${hexToColorValue(String(node.properties.color))}),\n`;
      }
      code += `${spaces})`;
      break;

    case 'ElevatedButton':
      code += `${spaces}ElevatedButton(\n`;
      code += `${spaces}  onPressed: () {},\n`;
      code += `${spaces}  style: ElevatedButton.styleFrom(\n`;
      if (node.properties.color) {
        code += `${spaces}    backgroundColor: Color(${hexToColorValue(String(node.properties.color))}),\n`;
      }
      code += `${spaces}  ),\n`;
      code += `${spaces}  child: Text('${node.properties.label || 'Button'}'),\n`;
      code += `${spaces})`;
      break;

    case 'OutlinedButton':
      code += `${spaces}OutlinedButton(\n`;
      code += `${spaces}  onPressed: () {},\n`;
      code += `${spaces}  style: OutlinedButton.styleFrom(\n`;
      if (node.properties.color) {
        code += `${spaces}    foregroundColor: Color(${hexToColorValue(String(node.properties.color))}),\n`;
      }
      code += `${spaces}  ),\n`;
      code += `${spaces}  child: Text('${node.properties.label || 'Button'}'),\n`;
      code += `${spaces})`;
      break;

    case 'TextButton':
      code += `${spaces}TextButton(\n`;
      code += `${spaces}  onPressed: () {},\n`;
      code += `${spaces}  style: TextButton.styleFrom(\n`;
      if (node.properties.color) {
        code += `${spaces}    foregroundColor: Color(${hexToColorValue(String(node.properties.color))}),\n`;
      }
      code += `${spaces}  ),\n`;
      code += `${spaces}  child: Text('${node.properties.label || 'Button'}'),\n`;
      code += `${spaces})`;
      break;

    case 'TextField':
      code += `${spaces}TextField(\n`;
      code += `${spaces}  decoration: InputDecoration(\n`;
      code += `${spaces}    labelText: '${node.properties.label || 'Input'}',\n`;
      if (node.properties.hintText) {
        code += `${spaces}    hintText: '${node.properties.hintText}',\n`;
      }
      code += `${spaces}  ),\n`;
      code += `${spaces}  obscureText: ${node.properties.obscureText || false},\n`;
      code += `${spaces})`;
      break;

    case 'Card':
      code += `${spaces}Card(\n`;
      code += `${spaces}  elevation: ${node.properties.elevation || 4},\n`;
      if (node.properties.color) {
        code += `${spaces}  color: Color(${hexToColorValue(String(node.properties.color))}),\n`;
      }
      code += `${spaces}  shape: RoundedRectangleBorder(\n`;
      code += `${spaces}    borderRadius: BorderRadius.circular(${node.properties.borderRadius || 8}),\n`;
      code += `${spaces}  ),\n`;
      if (node.children.length > 0) {
        code += `${spaces}  child: ${generateDartCode(node.children[0], indent + 1)},\n`;
      }
      code += `${spaces})`;
      break;

    case 'CircularProgressIndicator':
      code += `${spaces}CircularProgressIndicator(\n`;
      if (node.properties.color) {
        code += `${spaces}  color: Color(${hexToColorValue(String(node.properties.color))}),\n`;
      }
      code += `${spaces}  strokeWidth: ${node.properties.strokeWidth || 4},\n`;
      code += `${spaces})`;
      break;

    case 'LinearProgressIndicator':
      code += `${spaces}LinearProgressIndicator(\n`;
      if (node.properties.color) {
        code += `${spaces}  color: Color(${hexToColorValue(String(node.properties.color))}),\n`;
      }
      code += `${spaces}  value: ${node.properties.value || 0.5},\n`;
      code += `${spaces})`;
      break;

    case 'Divider':
      code += `${spaces}Divider(\n`;
      code += `${spaces}  thickness: ${node.properties.thickness || 1},\n`;
      if (node.properties.color) {
        code += `${spaces}  color: Color(${hexToColorValue(String(node.properties.color))}),\n`;
      }
      code += `${spaces})`;
      break;

    case 'SizedBox':
      code += `${spaces}SizedBox(\n`;
      if (node.properties.width) {
        code += `${spaces}  width: ${node.properties.width},\n`;
      }
      if (node.properties.height) {
        code += `${spaces}  height: ${node.properties.height},\n`;
      }
      code += `${spaces})`;
      break;

    case 'AppBar':
      code += `${spaces}AppBar(\n`;
      code += `${spaces}  title: Text('${node.properties.title || 'AppBar'}'),\n`;
      if (node.properties.backgroundColor) {
        code += `${spaces}  backgroundColor: Color(${hexToColorValue(String(node.properties.backgroundColor))}),\n`;
      }
      code += `${spaces}  centerTitle: ${node.properties.centerTitle || false},\n`;
      code += `${spaces})`;
      break;

    default:
      code += `${spaces}// ${node.type} widget\n`;
  }

  return code;
}
