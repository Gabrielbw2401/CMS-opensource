import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useProjectStore, useAuthStore } from "@/lib/store";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { isAuthenticated } = useAuthStore();
  const { projects, currentProject, setCurrentProject } = useProjectStore();
  
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  
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
      navigate(`/settings/${projects[0].id}`);
    } else {
      navigate("/dashboard");
    }
  }, [projectId, projects, navigate, setCurrentProject]);
  
  // Mettre à jour les champs du formulaire lorsque le projet change
  useEffect(() => {
    if (currentProject) {
      setProjectName(currentProject.nom);
      setProjectDescription(currentProject.description);
    }
  }, [currentProject]);
  
  const handleSave = () => {
    // Dans une vraie implémentation, on sauvegarderait les modifications
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres du projet ont été mis à jour.",
    });
  };
  
  if (!currentProject) {
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-muted/10 py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">Paramètres du projet</h1>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-64 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="space-y-1">
                    <li>
                      <Link 
                        to={`/editor/${currentProject.id}`}
                        className="block px-4 py-2 rounded-md hover:bg-muted"
                      >
                        Éditeur
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to={`/preview/${currentProject.id}`}
                        className="block px-4 py-2 rounded-md hover:bg-muted"
                      >
                        Aperçu
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to={`/settings/${currentProject.id}`}
                        className="block px-4 py-2 rounded-md bg-primary text-primary-foreground"
                      >
                        Paramètres
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Informations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Créé le:</span>
                      <p>{new Date(currentProject.dateCreation).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dernière modification:</span>
                      <p>{new Date(currentProject.dateMiseAJour).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex-1">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-6 w-full sm:w-auto">
                  <TabsTrigger value="general">Général</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="export">Export</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations générales</CardTitle>
                      <CardDescription>
                        Modifiez les informations de base de votre projet
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-name">Nom du projet</Label>
                        <Input
                          id="project-name"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="project-description">Description</Label>
                        <Input
                          id="project-description"
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                        />
                      </div>
                      
                      <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Domaine personnalisé</CardTitle>
                      <CardDescription>
                        Configurez un domaine personnalisé pour votre site web
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="custom-domain">Domaine personnalisé</Label>
                        <Input
                          id="custom-domain"
                          placeholder="www.monsite.com"
                        />
                      </div>
                      
                      <Button variant="outline">Configurer le domaine</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="seo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Paramètres SEO</CardTitle>
                      <CardDescription>
                        Optimisez votre site pour les moteurs de recherche
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="meta-title">Titre de la page (meta title)</Label>
                        <Input
                          id="meta-title"
                          placeholder="Mon site web - Accueil"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="meta-description">Description (meta description)</Label>
                        <textarea
                          id="meta-description"
                          className="w-full min-h-[100px] rounded-md border border-input bg-background p-2"
                          placeholder="Une description concise de votre site web..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="keywords">Mots-clés</Label>
                        <Input
                          id="keywords"
                          placeholder="cms, site web, éditeur visuel"
                        />
                        <p className="text-xs text-muted-foreground">
                          Séparez les mots-clés par des virgules.
                        </p>
                      </div>
                      
                      <Button>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="export" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Options d'exportation</CardTitle>
                      <CardDescription>
                        Exportez votre site web pour le déployer sur différentes plateformes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">HTML Statique</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4">
                              Téléchargez un fichier ZIP contenant tous les fichiers HTML, CSS et JavaScript
                              nécessaires pour héberger votre site sur n'importe quel serveur web.
                            </p>
                            <Button variant="outline" className="w-full">
                              Exporter en HTML
                            </Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">GitHub Pages</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4">
                              Déployez directement votre site sur GitHub Pages pour un hébergement gratuit
                              et facile à maintenir.
                            </p>
                            <Button variant="outline" className="w-full">
                              Déployer sur GitHub Pages
                            </Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Fly.io</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4">
                              Déployez votre site avec une base de données sur Fly.io pour des fonctionnalités
                              dynamiques et une haute disponibilité.
                            </p>
                            <Button variant="outline" className="w-full">
                              Déployer sur Fly.io
                            </Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Docker</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4">
                              Générez une image Docker pour héberger votre site sur votre propre serveur
                              ou sur n'importe quelle plateforme compatible.
                            </p>
                            <Button variant="outline" className="w-full">
                              Générer une image Docker
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;