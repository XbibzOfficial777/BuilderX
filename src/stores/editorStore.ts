import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WidgetInstance, DeviceType } from '@/types/widget';
import { createDefaultWidgetInstance } from '@/lib/widgets';
import { generateId } from '@/lib/utils';

interface EditorState {
  // Widget tree
  widgetTree: WidgetInstance | null;
  selectedWidgetId: string | null;
  
  // Editor UI state
  zoom: number;
  showPreview: boolean;
  showCode: boolean;
  deviceType: DeviceType;
  deviceRotation: 'portrait' | 'landscape';
  
  // History for undo/redo
  history: WidgetInstance[];
  historyIndex: number;
  
  // Actions
  setWidgetTree: (tree: WidgetInstance | null) => void;
  selectWidget: (id: string | null) => void;
  addWidget: (parentId: string | null, type: string) => void;
  removeWidget: (id: string) => void;
  updateWidgetProperty: (id: string, property: string, value: unknown) => void;
  moveWidget: (widgetId: string, newParentId: string | null, index?: number) => void;
  duplicateWidget: (id: string) => void;
  
  // UI actions
  setZoom: (zoom: number) => void;
  togglePreview: () => void;
  toggleCode: () => void;
  setDeviceType: (type: DeviceType) => void;
  toggleDeviceRotation: () => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
  
  // Initialize
  initNewProject: () => void;
  loadProject: (widgetTree: WidgetInstance) => void;
}

const createDefaultRoot = (): WidgetInstance => ({
  id: generateId(),
  type: 'Scaffold',
  properties: {
    backgroundColor: '#07080D',
  },
  children: [
    {
      id: generateId(),
      type: 'Center',
      properties: {},
      children: [
        {
          id: generateId(),
          type: 'Text',
          properties: {
            data: 'Hello FlutterForge!',
            fontSize: 24,
            color: '#F2F4F8',
          },
          children: [],
        },
      ],
    },
  ],
});

const findWidgetById = (tree: WidgetInstance, id: string): WidgetInstance | null => {
  if (tree.id === id) return tree;
  for (const child of tree.children) {
    const found = findWidgetById(child, id);
    if (found) return found;
  }
  return null;
};

const findParentOfWidget = (tree: WidgetInstance, id: string): WidgetInstance | null => {
  for (const child of tree.children) {
    if (child.id === id) return tree;
    const found = findParentOfWidget(child, id);
    if (found) return found;
  }
  return null;
};

const removeWidgetFromTree = (tree: WidgetInstance, id: string): WidgetInstance => {
  const newTree = { ...tree, children: [...tree.children] };
  newTree.children = newTree.children.filter(child => child.id !== id);
  newTree.children = newTree.children.map(child => removeWidgetFromTree(child, id));
  return newTree;
};

const addWidgetToParent = (
  tree: WidgetInstance, 
  parentId: string | null, 
  newWidget: WidgetInstance
): WidgetInstance => {
  if (parentId === null || tree.id === parentId) {
    return { ...tree, children: [...tree.children, newWidget] };
  }
  
  const newTree = { ...tree, children: [...tree.children] };
  newTree.children = newTree.children.map(child => 
    addWidgetToParent(child, parentId, newWidget)
  );
  return newTree;
};

const updateWidgetInTree = (
  tree: WidgetInstance,
  id: string,
  updates: Partial<WidgetInstance>
): WidgetInstance => {
  if (tree.id === id) {
    return { ...tree, ...updates };
  }
  
  const newTree = { ...tree, children: [...tree.children] };
  newTree.children = newTree.children.map(child => 
    updateWidgetInTree(child, id, updates)
  );
  return newTree;
};

const duplicateWidgetInTree = (tree: WidgetInstance, id: string): WidgetInstance => {
  const widgetToDuplicate = findWidgetById(tree, id);
  if (!widgetToDuplicate) return tree;
  
  const parent = findParentOfWidget(tree, id);
  if (!parent) return tree;
  
  const duplicatedWidget: WidgetInstance = {
    ...widgetToDuplicate,
    id: generateId(),
    children: widgetToDuplicate.children.map(child => ({
      ...child,
      id: generateId(),
    })),
  };
  
  return addWidgetToParent(tree, parent.id, duplicatedWidget);
};

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      widgetTree: null,
      selectedWidgetId: null,
      zoom: 1,
      showPreview: false,
      showCode: true,
      deviceType: 'iphone',
      deviceRotation: 'portrait',
      history: [],
      historyIndex: -1,
      
      setWidgetTree: (tree) => set({ widgetTree: tree }),
      
      selectWidget: (id) => set({ selectedWidgetId: id }),
      
      addWidget: (parentId, type) => {
        const { widgetTree, saveToHistory } = get();
        if (!widgetTree) return;
        
        const defaultInstance = createDefaultWidgetInstance(type);
        const newWidget: WidgetInstance = {
          id: generateId(),
          type,
          properties: defaultInstance.properties,
          children: [],
        };
        
        saveToHistory();
        const newTree = addWidgetToParent(widgetTree, parentId, newWidget);
        set({ widgetTree: newTree, selectedWidgetId: newWidget.id });
      },
      
      removeWidget: (id) => {
        const { widgetTree, selectedWidgetId, saveToHistory } = get();
        if (!widgetTree) return;
        
        saveToHistory();
        const newTree = removeWidgetFromTree(widgetTree, id);
        set({ 
          widgetTree: newTree, 
          selectedWidgetId: selectedWidgetId === id ? null : selectedWidgetId 
        });
      },
      
      updateWidgetProperty: (id, property, value) => {
        const { widgetTree } = get();
        if (!widgetTree) return;
        
        const widget = findWidgetById(widgetTree, id);
        if (!widget) return;
        
        const newProperties = { ...widget.properties, [property]: value };
        const newTree = updateWidgetInTree(widgetTree, id, { properties: newProperties });
        set({ widgetTree: newTree });
      },
      
      moveWidget: (widgetId, newParentId, _index) => {
        const { widgetTree, saveToHistory } = get();
        if (!widgetTree) return;
        
        const widget = findWidgetById(widgetTree, widgetId);
        if (!widget) return;
        
        saveToHistory();
        let newTree = removeWidgetFromTree(widgetTree, widgetId);
        newTree = addWidgetToParent(newTree, newParentId, widget);
        set({ widgetTree: newTree });
      },
      
      duplicateWidget: (id) => {
        const { widgetTree, saveToHistory } = get();
        if (!widgetTree) return;
        
        saveToHistory();
        const newTree = duplicateWidgetInTree(widgetTree, id);
        set({ widgetTree: newTree });
      },
      
      setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
      
      togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),
      
      toggleCode: () => set((state) => ({ showCode: !state.showCode })),
      
      setDeviceType: (type) => set({ deviceType: type }),
      
      toggleDeviceRotation: () => set((state) => ({ 
        deviceRotation: state.deviceRotation === 'portrait' ? 'landscape' : 'portrait' 
      })),
      
      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({ 
            widgetTree: history[newIndex],
            historyIndex: newIndex 
          });
        }
      },
      
      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({ 
            widgetTree: history[newIndex],
            historyIndex: newIndex 
          });
        }
      },
      
      canUndo: () => get().historyIndex > 0,
      
      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },
      
      saveToHistory: () => {
        const { widgetTree, history, historyIndex } = get();
        if (!widgetTree) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(widgetTree)));
        
        // Limit history to 50 items
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        
        set({ 
          history: newHistory,
          historyIndex: newHistory.length - 1 
        });
      },
      
      initNewProject: () => {
        const root = createDefaultRoot();
        set({ 
          widgetTree: root,
          selectedWidgetId: null,
          history: [JSON.parse(JSON.stringify(root))],
          historyIndex: 0,
        });
      },
      
      loadProject: (widgetTree) => {
        set({ 
          widgetTree,
          selectedWidgetId: null,
          history: [JSON.parse(JSON.stringify(widgetTree))],
          historyIndex: 0,
        });
      },
    }),
    { name: 'flutterforge-editor' }
  )
);
