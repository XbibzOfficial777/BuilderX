import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Project, WidgetInstance } from '@/types/widget';
import { 
  createProject as createProjectInDb,
  updateProject as updateProjectInDb,
  deleteProject as deleteProjectInDb,
  getUserProjects,
  subscribeToProjects,
} from '@/lib/firebase';
import { generateId } from '@/lib/utils';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // CRUD operations
  createProject: (userId: string, name: string) => Promise<{ projectId: string | null; error: Error | null }>;
  updateProject: (userId: string, projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (userId: string, projectId: string) => Promise<void>;
  duplicateProject: (userId: string, projectId: string) => Promise<void>;
  loadProjects: (userId: string) => Promise<void>;
  subscribeToUserProjects: (userId: string) => () => void;
  
  // Getters
  getFilteredProjects: () => Project[];
}

const createDefaultWidgetTree = (): WidgetInstance => ({
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

export const useProjectsStore = create<ProjectsState>()(
  devtools(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      
      setProjects: (projects) => set({ projects }),
      
      setCurrentProject: (project) => set({ currentProject: project }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      createProject: async (userId, name) => {
        set({ isLoading: true, error: null });
        
        const widgetTree = createDefaultWidgetTree();
        const { projectId, error } = await createProjectInDb(userId, {
          name,
          widgetTree,
        });
        
        if (error) {
          set({ error: error.message, isLoading: false });
          return { projectId: null, error };
        }
        
        set({ isLoading: false });
        return { projectId, error: null };
      },
      
      updateProject: async (userId, projectId, updates) => {
        set({ isLoading: true, error: null });
        
        const { error } = await updateProjectInDb(userId, projectId, updates);
        
        if (error) {
          set({ error: error.message, isLoading: false });
          return;
        }
        
        // Update local state
        const { projects, currentProject } = get();
        const updatedProjects = projects.map(p => 
          p.id === projectId ? { ...p, ...updates, updatedAt: Date.now() } : p
        );
        
        set({ 
          projects: updatedProjects,
          currentProject: currentProject?.id === projectId 
            ? { ...currentProject, ...updates, updatedAt: Date.now() }
            : currentProject,
          isLoading: false 
        });
      },
      
      deleteProject: async (userId, projectId) => {
        set({ isLoading: true, error: null });
        
        const { error } = await deleteProjectInDb(userId, projectId);
        
        if (error) {
          set({ error: error.message, isLoading: false });
          return;
        }
        
        // Update local state
        const { projects, currentProject } = get();
        set({ 
          projects: projects.filter(p => p.id !== projectId),
          currentProject: currentProject?.id === projectId ? null : currentProject,
          isLoading: false 
        });
      },
      
      duplicateProject: async (userId, projectId) => {
        set({ isLoading: true, error: null });
        
        const { projects } = get();
        const projectToDuplicate = projects.find(p => p.id === projectId);
        
        if (!projectToDuplicate) {
          set({ error: 'Project not found', isLoading: false });
          return;
        }
        
        const { error } = await createProjectInDb(userId, {
          name: `${projectToDuplicate.name} (Copy)`,
          widgetTree: projectToDuplicate.widgetTree,
          thumbnail: projectToDuplicate.thumbnail,
        });
        
        if (error) {
          set({ error: error.message, isLoading: false });
          return;
        }
        
        set({ isLoading: false });
      },
      
      loadProjects: async (userId) => {
        set({ isLoading: true, error: null });
        
        const { projects, error } = await getUserProjects(userId);
        
        if (error) {
          set({ error: error.message, isLoading: false });
          return;
        }
        
        set({ projects: (projects as unknown) as Project[], isLoading: false });
      },
      
      subscribeToUserProjects: (userId) => {
        set({ isLoading: true });
        
        const unsubscribe = subscribeToProjects(userId, (projects) => {
          set({ projects: (projects as unknown) as Project[], isLoading: false });
        });
        
        return unsubscribe;
      },
      
      getFilteredProjects: () => {
        const { projects, searchQuery } = get();
        
        if (!searchQuery.trim()) {
          return projects.sort((a, b) => b.updatedAt - a.updatedAt);
        }
        
        const query = searchQuery.toLowerCase();
        return projects
          .filter(p => p.name.toLowerCase().includes(query))
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },
    }),
    { name: 'flutterforge-projects' }
  )
);
