import { useProjectStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Plus, FileText } from "lucide-react";
import { useState } from "react";

export function PageManager() {
  const { currentProject, pages, currentPage, addPage, setCurrentPage } = useProjectStore();
  const [newPageTitle, setNewPageTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const projectPages = pages.filter(page => page.projetId === currentProject?.id);
  
  const handleAddPage = () => {
    if (!currentProject || !newPageTitle.trim()) return;
    
    const slug = newPageTitle
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    addPage({
      titre: newPageTitle,
      slug,
      contenu: {},
      projetId: currentProject.id,
      estAccueil: projectPages.length === 0,
      ordre: projectPages.length,
    });
    
    setNewPageTitle("");
    setIsDialogOpen(false);
  };
  
  if (!currentProject) {
    return null;
  }
  
  return (
    <div className="border-b p-2 bg-background">
      <div className="flex items-center gap-2 overflow-x-auto">
        {projectPages.map((page) => (
          <Button
            key={page.id}
            variant={currentPage?.id === page.id ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setCurrentPage(page.id)}
          >
            <FileText className="h-4 w-4" />
            <span>{page.titre}</span>
            {page.estAccueil && <span className="text-xs ml-1">(Accueil)</span>}
          </Button>
        ))}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex-shrink-0">
              <Plus className="h-4 w-4" />
              <span className="ml-1">Nouvelle page</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle page</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="page-title">Titre de la page</Label>
              <Input
                id="page-title"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="Accueil, À propos, Contact..."
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleAddPage}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}