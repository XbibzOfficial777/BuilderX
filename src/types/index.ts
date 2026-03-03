export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  firebaseUid: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  widgetTree: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetNode {
  id: string;
  type: string;
  name: string;
  properties: Record<string, unknown>;
  children: WidgetNode[];
}

export interface WidgetDefinition {
  type: string;
  name: string;
  category: WidgetCategory;
  icon: string;
  properties: PropertyDefinition[];
  defaultValue: Record<string, unknown>;
  codeTemplate: string;
}

export type WidgetCategory = 'basic' | 'layout' | 'input' | 'display' | 'navigation' | 'button';

export interface PropertyDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'boolean' | 'select' | 'dropdown' | 'size';
  defaultValue: unknown;
  options?: { label: string; value: string }[];
}

export interface DeviceFrame {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'phone' | 'tablet';
  os: 'ios' | 'android';
}

export interface EditorState {
  project: Project | null;
  selectedWidgetId: string | null;
  widgetTree: WidgetNode | null;
  history: WidgetNode[];
  historyIndex: number;
  isPreviewOpen: boolean;
  isCodePanelOpen: boolean;
  selectedDevice: DeviceFrame;
  isRotated: boolean;
}

export interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

import type { User as FirebaseUser } from 'firebase/auth';
