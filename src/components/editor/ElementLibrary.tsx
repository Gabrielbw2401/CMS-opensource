import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/lib/store";
import { 
  Type, 
  Image, 
  Square, 
  MousePointer, 
  FormInput, 
  Video, 
  Layout,
  Columns,
  MessageSquare,
  Images,
  Users,
  ListChecks,
  Layers,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ElementType = 'texte' | 'image' | 'bouton' | 'conteneur' | 'formulaire' | 'video' | 'galerie' | 'temoignage' | 'hero' | 'features';

interface ElementTemplate {
  type: ElementType;
  icon: React.ReactNode;
  label: string;
  defaultContent: any;
  defaultStyle: Record<string, any>;
}

const basicElements: ElementTemplate[] = [
  {
    type: 'texte',
    icon: <Type className="h-5 w-5" />,
    label: 'Texte',
    defaultContent: 'Cliquez pour modifier ce texte',
    defaultStyle: {
      fontSize: '16px',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left',
      padding: '8px',
    },
  },
  {
    type: 'image',
    icon: <Image className="h-5 w-5" />,
    label: 'Image',
    defaultContent: {
      src: 'https://via.placeholder.com/300x200',
      alt: 'Image placeholder',
    },
    defaultStyle: {
      width: '100%',
      height: 'auto',
      objectFit: 'cover',
    },
  },
  {
    type: 'bouton',
    icon: <Square className="h-5 w-5" />,
    label: 'Bouton',
    defaultContent: 'Bouton',
    defaultStyle: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      padding: '8px 16px',
      borderRadius: '4px',
      textAlign: 'center',
      cursor: 'pointer',
    },
  },
  {
    type: 'conteneur',
    icon: <Layout className="h-5 w-5" />,
    label: 'Conteneur',
    defaultContent: [],
    defaultStyle: {
      width: '100%',
      minHeight: '100px',
      padding: '16px',
      border: '1px dashed #cccccc',
      backgroundColor: '#f9fafb',
    },
  },
  {
    type: 'formulaire',
    icon: <FormInput className="h-5 w-5" />,
    label: 'Formulaire',
    defaultContent: {
      fields: [
        { type: 'text', label: 'Nom', placeholder: 'Votre nom', required: true },
        { type: 'email', label: 'Email', placeholder: 'Votre email', required: true },
        { type: 'textarea', label: 'Message', placeholder: 'Votre message', required: false },
      ],
      submitLabel: 'Envoyer',
    },
    defaultStyle: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
    },
  },
  {
    type: 'video',
    icon: <Video className="h-5 w-5" />,
    label: 'Vidéo',
    defaultContent: {
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Vidéo YouTube',
    },
    defaultStyle: {
      width: '100%',
      height: '315px',
    },
  },
];

const advancedElements: ElementTemplate[] = [
  {
    type: 'galerie',
    icon: <Images className="h-5 w-5" />,
    label: 'Galerie',
    defaultContent: {
      images: [
        { src: 'https://via.placeholder.com/300x200?text=Image+1', alt: 'Image 1' },
        { src: 'https://via.placeholder.com/300x200?text=Image+2', alt: 'Image 2' },
        { src: 'https://via.placeholder.com/300x200?text=Image+3', alt: 'Image 3' },
        { src: 'https://via.placeholder.com/300x200?text=Image+4', alt: 'Image 4' },
      ]
    },
    defaultStyle: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      padding: '16px',
    },
  },
  {
    type: 'temoignage',
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'Témoignage',
    defaultContent: {
      quote: "Ce produit a complètement transformé notre façon de travailler. Je le recommande vivement !",
      author: "Jean Dupont",
      position: "Directeur, Entreprise XYZ",
      avatar: "https://via.placeholder.com/100?text=JD"
    },
    defaultStyle: {
      padding: '24px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
    },
  },
];

const sectionTemplates: ElementTemplate[] = [
  {
    type: 'hero',
    icon: <Layers className="h-5 w-5" />,
    label: 'Section Hero',
    defaultContent: {
      title: "Titre principal accrocheur",
      subtitle: "Une description convaincante de votre produit ou service qui incite les visiteurs à agir.",
      buttonText: "Commencer maintenant",
      image: "https://via.placeholder.com/600x400?text=Hero+Image"
    },
    defaultStyle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '64px 16px',
      backgroundColor: '#f9fafb',
      width: '100%',
      minHeight: '400px',
    },
  },
  {
    type: 'features',
    icon: <ListChecks className="h-5 w-5" />,
    label: 'Fonctionnalités',
    defaultContent: {
      title: "Nos fonctionnalités",
      features: [
        {
          title: "Fonctionnalité 1",
          description: "Description de la première fonctionnalité.",
          icon: "✨"
        },
        {
          title: "Fonctionnalité 2",
          description: "Description de la deuxième fonctionnalité.",
          icon: "🚀"
        },
        {
          title: "Fonctionnalité 3",
          description: "Description de la troisième fonctionnalité.",
          icon: "🔒"
        }
      ]
    },
    defaultStyle: {
      padding: '48px 16px',
      width: '100%',
      backgroundColor: '#ffffff',
    },
  },
];

export function ElementLibrary() {
  const { currentPage, addElement } = useProjectStore();
  const [selectedTool, setSelectedTool] = useState<ElementType | 'select'>('select');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'basic': true,
    'advanced': false,
    'sections': false
  });

  const handleElementSelect = (template: ElementTemplate) => {
    if (!currentPage) return;
    
    setSelectedTool(template.type);
    
    addElement({
      type: template.type,
      contenu: template.defaultContent,
      style: template.defaultStyle,
      pageId: currentPage.id,
      position: {
        x: 50,
        y: 50,
        width: template.type === 'hero' || template.type === 'features' ? 800 : 300,
        height: template.type === 'hero' ? 400 : template.type === 'features' ? 500 : 200,
      },
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="w-64 border-r h-full overflow-y-auto bg-background">
      <Tabs defaultValue="elements" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="elements">Éléments</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="elements" className="p-4 space-y-4">
          <Button
            variant={selectedTool === 'select' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setSelectedTool('select')}
          >
            <MousePointer className="h-5 w-5 mr-2" />
            Sélectionner
          </Button>
          
          <div className="space-y-2">
            <div 
              className="flex items-center justify-between cursor-pointer py-1"
              onClick={() => toggleCategory('basic')}
            >
              <span className="font-medium text-sm">Éléments de base</span>
              {expandedCategories.basic ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
            
            {expandedCategories.basic && (
              <div className="space-y-1 pl-2">
                {basicElements.map((template) => (
                  <Button
                    key={template.type}
                    variant={selectedTool === template.type ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleElementSelect(template)}
                    size="sm"
                  >
                    {template.icon}
                    <span className="ml-2">{template.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div 
              className="flex items-center justify-between cursor-pointer py-1"
              onClick={() => toggleCategory('advanced')}
            >
              <span className="font-medium text-sm">Éléments avancés</span>
              {expandedCategories.advanced ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
            
            {expandedCategories.advanced && (
              <div className="space-y-1 pl-2">
                {advancedElements.map((template) => (
                  <Button
                    key={template.type}
                    variant={selectedTool === template.type ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleElementSelect(template)}
                    size="sm"
                  >
                    {template.icon}
                    <span className="ml-2">{template.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div 
              className="flex items-center justify-between cursor-pointer py-1"
              onClick={() => toggleCategory('sections')}
            >
              <span className="font-medium text-sm">Sections</span>
              {expandedCategories.sections ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
            
            {expandedCategories.sections && (
              <div className="space-y-1 pl-2">
                {sectionTemplates.map((template) => (
                  <Button
                    key={template.type}
                    variant={selectedTool === template.type ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleElementSelect(template)}
                    size="sm"
                  >
                    {template.icon}
                    <span className="ml-2">{template.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="p-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choisissez un modèle de page pour démarrer rapidement.
            </p>
            
            <div className="grid gap-2">
              {['Portfolio', 'Blog', 'E-commerce', 'Landing Page', 'Contact'].map((template) => (
                <div 
                  key={template}
                  className="border rounded-md p-2 cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="aspect-video bg-muted mb-2 flex items-center justify-center text-muted-foreground">
                    <Layout className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium">{template}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}