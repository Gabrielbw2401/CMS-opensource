import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectStore } from "@/lib/store";
import { Download, Github, Upload } from "lucide-react";
import { useState } from "react";

export function ExportDialog() {
  const { currentProject, pages, elements } = useProjectStore();
  const [exportType, setExportType] = useState<"html" | "github" | "fly">("html");
  const [isExporting, setIsExporting] = useState(false);
  
  if (!currentProject) return null;
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simuler l'export pour le MVP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (exportType === "html") {
        // Dans une vraie implémentation, on générerait les fichiers HTML/CSS/JS
        alert("Export HTML terminé ! Dans une version complète, un fichier ZIP serait téléchargé.");
      } else if (exportType === "github") {
        alert("Export vers GitHub Pages ! Dans une version complète, vous seriez redirigé vers GitHub pour configurer le déploiement.");
      } else if (exportType === "fly") {
        alert("Déploiement vers Fly.io ! Dans une version complète, le site serait déployé automatiquement.");
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Une erreur est survenue lors de l'export.");
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exporter votre site</DialogTitle>
          <DialogDescription>
            Choisissez comment vous souhaitez exporter et déployer votre site web.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="html" value={exportType} onValueChange={(v) => setExportType(v as any)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="html">HTML Statique</TabsTrigger>
            <TabsTrigger value="github">GitHub Pages</TabsTrigger>
            <TabsTrigger value="fly">Fly.io</TabsTrigger>
          </TabsList>
          
          <TabsContent value="html" className="space-y-4">
            <div className="text-sm">
              <h3 className="font-medium mb-2">Export HTML Statique</h3>
              <p>
                Téléchargez un fichier ZIP contenant tous les fichiers HTML, CSS et JavaScript
                nécessaires pour héberger votre site sur n'importe quel serveur web.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Idéal pour les sites vitrines sans base de données</li>
                <li>Compatible avec tous les hébergeurs web</li>
                <li>Facile à déployer manuellement</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="github" className="space-y-4">
            <div className="text-sm">
              <h3 className="font-medium mb-2">GitHub Pages</h3>
              <p>
                Déployez directement votre site sur GitHub Pages pour un hébergement gratuit
                et facile à maintenir.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Hébergement gratuit pour les sites statiques</li>
                <li>Intégration avec votre compte GitHub</li>
                <li>Mise à jour facile via Git</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="fly" className="space-y-4">
            <div className="text-sm">
              <h3 className="font-medium mb-2">Fly.io</h3>
              <p>
                Déployez votre site avec une base de données sur Fly.io pour des fonctionnalités
                dynamiques et une haute disponibilité.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Support pour les sites dynamiques avec base de données</li>
                <li>Scaling automatique selon le trafic</li>
                <li>Déploiement en un clic</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" disabled={isExporting}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Exportation en cours...
              </>
            ) : (
              <>
                {exportType === "html" && <Download className="mr-2 h-4 w-4" />}
                {exportType === "github" && <Github className="mr-2 h-4 w-4" />}
                {exportType === "fly" && <Upload className="mr-2 h-4 w-4" />}
                {exportType === "html" ? "Télécharger" : "Déployer"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}