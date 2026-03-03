'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { WidgetNode, DeviceFrame, Project } from '@/types';
import { deviceFrames } from '@/lib/widget-definitions';

interface EditorState {
  project: Project | null;
  selectedWidgetId: string | null;
  widgetTree: WidgetNode | null;
  history: WidgetNode[];
  historyIndex: number;
  isPreviewOpen: boolean;
  isCodePanelOpen: boolean;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  selectedDevice: DeviceFrame;
  isRotated: boolean;
  zoom: number;
  
  // Actions
  setProject: (project: Project | null) => void;
  setWidgetTree: (tree: WidgetNode | null) => void;
  selectWidget: (id: string | null) => void;
  addWidget: (widget: WidgetNode, parentId: string | null) => void;
  updateWidget: (id: string, properties: Record<string, unknown>) => void;
  deleteWidget: (id: string) => void;
  moveWidget: (id: string, newParentId: string | null, index: number) => void;
  duplicateWidget: (id: string) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // UI State
  togglePreview: () => void;
  toggleCodePanel: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setDevice: (device: DeviceFrame) => void;
  toggleRotation: () => void;
  setZoom: (zoom: number) => void;
}

function createDefaultTree(): WidgetNode {
  return {
    id: uuidv4(),
    type: 'Scaffold',
    name: 'Scaffold',
    properties: {},
    children: [],
  };
}

function findWidgetById(node: WidgetNode, id: string): WidgetNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findWidgetById(child, id);
    if (found) return found;
  }
  return null;
}

function findParentWidget(node: WidgetNode, id: string): WidgetNode | null {
  for (const child of node.children) {
    if (child.id === id) return node;
    const found = findParentWidget(child, id);
    if (found) return found;
  }
  return null;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function deleteWidgetFromTree(node: WidgetNode, id: string): boolean {
  const index = node.children.findIndex((c) => c.id === id);
  if (index !== -1) {
    node.children.splice(index, 1);
    return true;
  }
  for (const child of node.children) {
    if (deleteWidgetFromTree(child, id)) return true;
  }
  return false;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  selectedWidgetId: null,
  widgetTree: createDefaultTree(),
  history: [],
  historyIndex: -1,
  isPreviewOpen: true,
  isCodePanelOpen: true,
  isLeftPanelOpen: true,
  isRightPanelOpen: true,
  selectedDevice: deviceFrames[0],
  isRotated: false,
  zoom: 1,

  setProject: (project) => {
    set({ project });
    if (project?.widgetTree) {
      try {
        const tree = JSON.parse(project.widgetTree);
        set({ widgetTree: tree, history: [tree], historyIndex: 0 });
      } catch {
        const defaultTree = createDefaultTree();
        set({ widgetTree: defaultTree, history: [defaultTree], historyIndex: 0 });
      }
    }
  },

  setWidgetTree: (tree) => {
    set({ widgetTree: tree });
    get().saveToHistory();
  },

  selectWidget: (id) => set({ selectedWidgetId: id }),

  addWidget: (widget, parentId) => {
    const state = get();
    const newTree = deepClone(state.widgetTree);
    if (!newTree) return;

    if (parentId === null) {
      newTree.children.push(widget);
    } else {
      const parent = findWidgetById(newTree, parentId);
      if (parent) {
        parent.children.push(widget);
      }
    }

    set({ widgetTree: newTree, selectedWidgetId: widget.id });
    get().saveToHistory();
  },

  updateWidget: (id, properties) => {
    const state = get();
    const newTree = deepClone(state.widgetTree);
    if (!newTree) return;

    const widget = findWidgetById(newTree, id);
    if (widget) {
      widget.properties = { ...widget.properties, ...properties };
      set({ widgetTree: newTree });
      get().saveToHistory();
    }
  },

  deleteWidget: (id) => {
    const state = get();
    const newTree = deepClone(state.widgetTree);
    if (!newTree) return;

    if (newTree.id === id) {
      return; // Can't delete root
    }

    deleteWidgetFromTree(newTree, id);
    set({ widgetTree: newTree, selectedWidgetId: null });
    get().saveToHistory();
  },

  moveWidget: (id, newParentId, index) => {
    const state = get();
    const newTree = deepClone(state.widgetTree);
    if (!newTree) return;

    const widget = findWidgetById(newTree, id);
    if (!widget) return;

    // Remove from current position
    deleteWidgetFromTree(newTree, id);

    // Add to new position
    if (newParentId === null) {
      newTree.children.splice(index, 0, widget);
    } else {
      const newParent = findWidgetById(newTree, newParentId);
      if (newParent) {
        newParent.children.splice(index, 0, widget);
      }
    }

    set({ widgetTree: newTree });
    get().saveToHistory();
  },

  duplicateWidget: (id) => {
    const state = get();
    const newTree = deepClone(state.widgetTree);
    if (!newTree) return;

    const widget = findWidgetById(newTree, id);
    if (!widget) return;

    const parent = findParentWidget(newTree, id);
    const duplicate = deepClone(widget);
    
    // Generate new IDs for all widgets in the duplicated tree
    function regenerateIds(node: WidgetNode) {
      node.id = uuidv4();
      for (const child of node.children) {
        regenerateIds(child);
      }
    }
    regenerateIds(duplicate);

    if (parent) {
      const index = parent.children.findIndex((c) => c.id === id);
      parent.children.splice(index + 1, 0, duplicate);
    } else {
      newTree.children.push(duplicate);
    }

    set({ widgetTree: newTree, selectedWidgetId: duplicate.id });
    get().saveToHistory();
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        historyIndex: newIndex,
        widgetTree: deepClone(state.history[newIndex]),
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        historyIndex: newIndex,
        widgetTree: deepClone(state.history[newIndex]),
      });
    }
  },

  saveToHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(deepClone(state.widgetTree!));
    
    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  togglePreview: () => set((state) => ({ isPreviewOpen: !state.isPreviewOpen })),
  toggleCodePanel: () => set((state) => ({ isCodePanelOpen: !state.isCodePanelOpen })),
  toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
  setDevice: (device) => set({ selectedDevice: device }),
  toggleRotation: () => set((state) => ({ isRotated: !state.isRotated })),
  setZoom: (zoom) => set({ zoom }),
}));
