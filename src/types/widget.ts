export interface WidgetProperty {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'enum' | 'edgeInsets' | 'alignment' | 'double';
  defaultValue: unknown;
  options?: string[];
  label: string;
}

export interface WidgetDefinition {
  type: string;
  category: WidgetCategory;
  displayName: string;
  icon: string;
  description: string;
  properties: WidgetProperty[];
  canHaveChildren: boolean;
  defaultSize?: { width: number; height: number };
}

export type WidgetCategory = 
  | 'basic' 
  | 'layout' 
  | 'input' 
  | 'display' 
  | 'navigation' 
  | 'effects';

export interface WidgetInstance {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  children: WidgetInstance[];
  parentId?: string;
}

export interface Project {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  widgetTree: WidgetInstance;
  thumbnail?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type DeviceType = 'iphone' | 'android' | 'tablet' | 'desktop';

export interface EditorState {
  selectedWidgetId: string | null;
  zoom: number;
  showPreview: boolean;
  showCode: boolean;
  deviceType: DeviceType;
  deviceRotation: 'portrait' | 'landscape';
}
