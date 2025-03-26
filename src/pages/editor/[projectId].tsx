import { Header } from "@/components/layout/Header";
import { ElementLibrary } from "@/components/editor/ElementLibrary";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { ElementSettings } from "@/components/editor/ElementSettings";
import { PageManager } from "@/components/editor/PageManager";
import { ExportDialog } from "@/components/editor/ExportDialog";
import { useProjectStore, useAuthStore, useEditorStore } from "@/lib/store";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, Eye, Undo, Redo, Save, Clock, Menu, X, Settings, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Editor = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const { isAuthenticated } = useAuthStore();
  const { projects, currentProject, setCurrentProject } = useProjectStore();
  const { 
    undo, 
    redo, 
    history, 
    lastSaved, 
    startAutoSave, 
    stopAutoSave, 
    saveState 
  } = useEditorStore();
  
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(!isMobile);
  const [showRightSidebar, setShowRightSidebar] = useState(!isMobile);
  const [showMobileHelp, setShowMobileHelp] = useState(isMobile);
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Charger le projet
  useEffect(() => {
    if (projectId && projects.some(p => p.id === projectId)) {
      setCurrentProject(projectId);
    } else if (projects.length > 0) {
      // Si le projet n'existe pas mais qu'il y a d'autres projets, rediriger vers le premier
      navigate(`/editor/${projects[0].id}`);
    } else {
      // Si aucun projet n'existe, rediriger vers le tableau de bord
      navigate("/dashboard");
    }
  }, [projectId, projects, navigate, setCurrentProject]);
  
  // Configurer les raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z ou Cmd+Z pour annuler
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Ctrl+Y ou Cmd+Shift+Z pour rétablir
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      
      // Ctrl+S ou Cmd+S pour sauvegarder
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);
  
  // Démarrer la sauvegarde automatique
  useEffect(() => {
    startAutoSave();
    
    return () => {
      stopAutoSave();
    };
  }, [startAutoSave, stopAutoSave]);
  
  // Gérer l'affichage des sidebars en fonction de la taille de l'écran
  useEffect(() => {
    setShowLeftSidebar(!isMobile);
    setShowRightSidebar(!isMobile);
    setShowMobileHelp(isMobile);
  }, [isMobile]);
  
  const handleSave = () => {
    saveState();
    toast({
      title: "Projet sauvegardé",
      description: "Toutes vos modifications ont été enregistrées.",
    });
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  const formatTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) {
      return `il y a ${seconds} seconde${seconds > 1 ? 's' : ''}`;
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  };
  
  if (!currentProject) {
    return null; // Ne rien afficher pendant le chargement
  }
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex items-center justify-between border-b p-2 bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-medium truncate max-w-[150px] sm:max-w-none">{currentProject.nom}</h1>
          
          <div className="ml-2 text-xs text-muted-foreground hidden sm:flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Dernière sauvegarde: {formatTimeSince(lastSaved)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Bouton pour afficher/masquer la sidebar gauche sur mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className="sm:hidden"
              aria-label={showLeftSidebar ? "Masquer la bibliothèque d'éléments" : "Afficher la bibliothèque d'éléments"}
            >
              {showLeftSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={undo} 
                  disabled={history.past.length === 0}
                  className="hidden sm:flex"
                  aria-label="Annuler"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Annuler (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={redo} 
                  disabled={history.future.length === 0}
                  className="hidden sm:flex"
                  aria-label="Rétablir"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rétablir (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu open={showHistoryDropdown} onOpenChange={setShowHistoryDropdown}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Historique
                <span className="ml-1 text-xs bg-muted rounded-full px-1.5 py-0.5">
                  {history.past.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Historique des actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {history.past.length === 0 ? (
                <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                  Aucune action dans l'historique
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  {[...history.past].reverse().map((action, index) => (
                    <DropdownMenuItem key={index} className="flex flex-col items-start">
                      <span className="font-medium">{action.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(action.timestamp)}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild className="hidden sm:flex">
                  <Link to={`/preview/${currentProject.id}`} target="_blank">
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Aperçu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleSave} className="hidden sm:flex">
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sauvegarder (Ctrl+S)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <ExportDialog />
          
          {/* Bouton pour afficher/masquer la sidebar droite sur mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className="sm:hidden"
              aria-label={showRightSidebar ? "Masquer les paramètres" : "Afficher les paramètres"}
            >
              {showRightSidebar ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
      
      <PageManager />
      
      {/* Message d'aide pour les utilisateurs mobiles */}
      {showMobileHelp && (
        <Alert className="m-2">
          <Info className="h-4 w-4" />
          <AlertTitle>Conseil pour l'édition mobile</AlertTitle>
          <AlertDescription>
            L'édition est optimisée pour les écrans plus larges. Utilisez les boutons en haut pour afficher/masquer les panneaux latéraux.
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs"
              onClick={() => setShowMobileHelp(false)}
            >
              Ne plus afficher
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar gauche (Bibliothèque d'éléments) */}
        <div 
          className={`absolute sm:relative z-10 h-full transition-all duration-300 transform ${
            showLeftSidebar ? "translate-x-0" : "-translate-x-full sm:translate-x-0 sm:w-0"
          }`}
        >
          <ElementLibrary />
        </div>
        
        {/* Canvas central */}
        <div className="flex-1 overflow-hidden">
          <EditorCanvas />
        </div>
        
        {/* Sidebar droite (Paramètres d'éléments) */}
        <div 
          className={`absolute sm:relative right-0 z-10 h-full transition-all duration-300 transform ${
            showRightSidebar ? "translate-x-0" : "translate-x-full sm:translate-x-0 sm:w-0"
          }`}
        >
          <ElementSettings />
        </div>
      </div>
      
      {/* Barre d'outils mobile en bas */}
      {isMobile && (
        <div className="sm:hidden flex items-center justify-between border-t p-2 bg-background">
          <Button variant="outline" size="sm" onClick={undo} disabled={history.past.length === 0}>
            <Undo className="h-4 w-4 mr-1" />
            Annuler
          </Button>
          
          <Button variant="outline" size="sm" onClick={redo} disabled={history.future.length === 0}>
            <Redo className="h-4 w-4 mr-1" />
            Rétablir
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Enregistrer
          </Button>
        </div>
      )}
    </div>
  );
};

export default Editor;