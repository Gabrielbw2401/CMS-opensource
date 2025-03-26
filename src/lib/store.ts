import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type User = {
  id: string;
  nom: string;
  email: string;
  role: 'admin' | 'editeur';
};

export type Project = {
  id: string;
  nom: string;
  description: string;
  utilisateurId: string;
  dateCreation: string;
  dateMiseAJour: string;
};

export type Page = {
  id: string;
  titre: string;
  slug: string;
  contenu: Record<string, any>;
  projetId: string;
  estAccueil: boolean;
  ordre: number;
};

export type Element = {
  id: string;
  type: 'texte' | 'image' | 'bouton' | 'conteneur' | 'formulaire' | 'video' | 'galerie' | 'temoignage' | 'hero' | 'features';
  contenu: any;
  style: Record<string, any>;
  pageId: string;
  position: { x: number; y: number; width: number; height: number };
};

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Simulation d'authentification pour le MVP
        if (email === 'demo@example.com' && password === 'password') {
          set({
            user: {
              id: '1',
              nom: 'Utilisateur Démo',
              email: 'demo@example.com',
              role: 'admin',
            },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Action types for history
type Action = {
  type: 'ADD_ELEMENT' | 'UPDATE_ELEMENT' | 'REMOVE_ELEMENT' | 'MOVE_ELEMENT' | 'RESIZE_ELEMENT';
  payload: any;
  timestamp: number;
  description: string;
};

// Project Store
interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  pages: Page[];
  currentPage: Page | null;
  elements: Element[];
  selectedElementId: string | null;
  addProject: (project: Omit<Project, 'id' | 'dateCreation' | 'dateMiseAJour'>) => void;
  setCurrentProject: (projectId: string) => void;
  addPage: (page: Omit<Page, 'id'>) => void;
  setCurrentPage: (pageId: string) => void;
  addElement: (element: Omit<Element, 'id'>) => void;
  updateElement: (elementId: string, updates: Partial<Element>) => void;
  removeElement: (elementId: string) => void;
  selectElement: (elementId: string | null) => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  currentProject: null,
  pages: [],
  currentPage: null,
  elements: [],
  selectedElementId: null,
  
  addProject: (project) => {
    const newProject = {
      ...project,
      id: `project-${Date.now()}`,
      dateCreation: new Date().toISOString(),
      dateMiseAJour: new Date().toISOString(),
    };
    
    set((state) => ({
      projects: [...state.projects, newProject],
      currentProject: newProject,
    }));
    
    // Créer une page d'accueil par défaut
    get().addPage({
      titre: 'Accueil',
      slug: 'accueil',
      contenu: {},
      projetId: newProject.id,
      estAccueil: true,
      ordre: 0,
    });
  },
  
  setCurrentProject: (projectId) => {
    const project = get().projects.find(p => p.id === projectId);
    if (project) {
      set({ currentProject: project });
      
      // Charger les pages du projet
      const projectPages = get().pages.filter(p => p.projetId === projectId);
      if (projectPages.length > 0) {
        get().setCurrentPage(projectPages[0].id);
      }
    }
  },
  
  addPage: (page) => {
    const newPage = {
      ...page,
      id: `page-${Date.now()}`,
    };
    
    set((state) => ({
      pages: [...state.pages, newPage],
      currentPage: newPage,
    }));
  },
  
  setCurrentPage: (pageId) => {
    const page = get().pages.find(p => p.id === pageId);
    if (page) {
      set({ 
        currentPage: page,
        // Charger les éléments de la page
        elements: get().elements.filter(e => e.pageId === pageId),
        selectedElementId: null,
      });
    }
  },
  
  addElement: (element) => {
    const newElement = {
      ...element,
      id: `element-${Date.now()}`,
    };
    
    set((state) => ({
      elements: [...state.elements, newElement],
      selectedElementId: newElement.id,
    }));
    
    // Enregistrer l'action dans l'historique
    useEditorStore.getState().addToHistory({
      type: 'ADD_ELEMENT',
      payload: { element: newElement },
      timestamp: Date.now(),
      description: `Ajout d'un élément ${newElement.type}`
    });
  },
  
  updateElement: (elementId, updates) => {
    const oldElement = get().elements.find(el => el.id === elementId);
    
    set((state) => ({
      elements: state.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      ),
    }));
    
    // Enregistrer l'action dans l'historique
    if (oldElement) {
      const actionType = updates.position ? 
        (updates.position.width !== oldElement.position.width || updates.position.height !== oldElement.position.height) 
          ? 'RESIZE_ELEMENT' 
          : 'MOVE_ELEMENT'
        : 'UPDATE_ELEMENT';
        
      useEditorStore.getState().addToHistory({
        type: actionType,
        payload: { 
          elementId, 
          oldValues: actionType === 'UPDATE_ELEMENT' ? oldElement : oldElement.position,
          newValues: updates 
        },
        timestamp: Date.now(),
        description: `Modification d'un élément ${oldElement.type}`
      });
    }
  },
  
  removeElement: (elementId) => {
    const elementToRemove = get().elements.find(el => el.id === elementId);
    
    set((state) => ({
      elements: state.elements.filter(el => el.id !== elementId),
      selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
    }));
    
    // Enregistrer l'action dans l'historique
    if (elementToRemove) {
      useEditorStore.getState().addToHistory({
        type: 'REMOVE_ELEMENT',
        payload: { element: elementToRemove },
        timestamp: Date.now(),
        description: `Suppression d'un élément ${elementToRemove.type}`
      });
    }
  },
  
  selectElement: (elementId) => {
    set({ selectedElementId: elementId });
  },
}));

// Editor Store
interface EditorState {
  isDragging: boolean;
  history: {
    past: Action[];
    future: Action[];
  };
  lastSaved: number;
  autoSaveInterval: number | null;
  setDragging: (isDragging: boolean) => void;
  undo: () => void;
  redo: () => void;
  addToHistory: (action: Omit<Action, 'timestamp'> & { timestamp?: number }) => void;
  clearHistory: () => void;
  startAutoSave: () => void;
  stopAutoSave: () => void;
  saveState: () => void;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  isDragging: false,
  history: {
    past: [],
    future: [],
  },
  lastSaved: Date.now(),
  autoSaveInterval: null,
  
  setDragging: (isDragging) => {
    set({ isDragging });
  },
  
  addToHistory: (action) => {
    const actionWithTimestamp = {
      ...action,
      timestamp: action.timestamp || Date.now()
    };
    
    set((state) => ({
      history: {
        past: [...state.history.past, actionWithTimestamp],
        future: [], // Effacer le futur lorsqu'une nouvelle action est ajoutée
      },
    }));
  },
  
  clearHistory: () => {
    set({
      history: {
        past: [],
        future: [],
      }
    });
  },
  
  undo: () => {
    const { history } = get();
    const { past, future } = history;
    
    if (past.length === 0) return;
    
    const lastAction = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    // Appliquer l'annulation en fonction du type d'action
    const { elements, updateElement, addElement, removeElement } = useProjectStore.getState();
    
    switch (lastAction.type) {
      case 'ADD_ELEMENT':
        // Annuler l'ajout = supprimer l'élément
        removeElement(lastAction.payload.element.id);
        break;
        
      case 'REMOVE_ELEMENT':
        // Annuler la suppression = réajouter l'élément
        addElement(lastAction.payload.element);
        break;
        
      case 'UPDATE_ELEMENT':
      case 'MOVE_ELEMENT':
      case 'RESIZE_ELEMENT':
        // Annuler la modification = restaurer les anciennes valeurs
        updateElement(lastAction.payload.elementId, lastAction.payload.oldValues);
        break;
    }
    
    set({
      history: {
        past: newPast,
        future: [lastAction, ...future],
      }
    });
  },
  
  redo: () => {
    const { history } = get();
    const { past, future } = history;
    
    if (future.length === 0) return;
    
    const nextAction = future[0];
    const newFuture = future.slice(1);
    
    // Appliquer la restauration en fonction du type d'action
    const { updateElement, addElement, removeElement } = useProjectStore.getState();
    
    switch (nextAction.type) {
      case 'ADD_ELEMENT':
        // Refaire l'ajout = ajouter l'élément
        addElement(nextAction.payload.element);
        break;
        
      case 'REMOVE_ELEMENT':
        // Refaire la suppression = supprimer l'élément
        removeElement(nextAction.payload.element.id);
        break;
        
      case 'UPDATE_ELEMENT':
      case 'MOVE_ELEMENT':
      case 'RESIZE_ELEMENT':
        // Refaire la modification = appliquer les nouvelles valeurs
        updateElement(nextAction.payload.elementId, nextAction.payload.newValues);
        break;
    }
    
    set({
      history: {
        past: [...past, nextAction],
        future: newFuture,
      }
    });
  },
  
  startAutoSave: () => {
    // Démarrer la sauvegarde automatique toutes les 30 secondes
    const interval = window.setInterval(() => {
      get().saveState();
    }, 30000);
    
    set({ autoSaveInterval: interval });
  },
  
  stopAutoSave: () => {
    const { autoSaveInterval } = get();
    if (autoSaveInterval !== null) {
      window.clearInterval(autoSaveInterval);
      set({ autoSaveInterval: null });
    }
  },
  
  saveState: () => {
    // Dans une vraie implémentation, on sauvegarderait l'état du projet
    set({ lastSaved: Date.now() });
    console.log("Projet sauvegardé automatiquement à", new Date().toLocaleTimeString());
  },
}));