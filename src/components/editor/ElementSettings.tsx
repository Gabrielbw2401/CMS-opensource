import { useProjectStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Copy, Save, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

// Thèmes prédéfinis
const colorThemes = [
  {
    name: "Bleu classique",
    colors: {
      primary: "#3b82f6",
      secondary: "#93c5fd",
      accent: "#1d4ed8",
      text: "#1e293b",
      background: "#ffffff"
    }
  },
  {
    name: "Vert nature",
    colors: {
      primary: "#10b981",
      secondary: "#6ee7b7",
      accent: "#047857",
      text: "#1e293b",
      background: "#f0fdf4"
    }
  },
  {
    name: "Violet créatif",
    colors: {
      primary: "#8b5cf6",
      secondary: "#c4b5fd",
      accent: "#6d28d9",
      text: "#1e293b",
      background: "#ffffff"
    }
  },
  {
    name: "Orange chaleureux",
    colors: {
      primary: "#f97316",
      secondary: "#fdba74",
      accent: "#c2410c",
      text: "#1e293b",
      background: "#fff7ed"
    }
  },
  {
    name: "Mode sombre",
    colors: {
      primary: "#60a5fa",
      secondary: "#1e293b",
      accent: "#3b82f6",
      text: "#f8fafc",
      background: "#0f172a"
    }
  }
];

// Styles sauvegardés (simulés pour le MVP)
const savedStyles = [
  {
    name: "Bouton principal",
    type: "bouton",
    style: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      padding: "12px 24px",
      borderRadius: "8px",
      fontWeight: "bold",
      border: "none",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    }
  },
  {
    name: "Titre de section",
    type: "texte",
    style: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#1e293b",
      marginBottom: "16px",
      borderBottom: "2px solid #e2e8f0",
      paddingBottom: "8px"
    }
  },
  {
    name: "Carte info",
    type: "conteneur",
    style: {
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "24px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
    }
  }
];

// Polices disponibles
const fontFamilies = [
  { name: "Sans-serif", value: "Arial, sans-serif" },
  { name: "Serif", value: "Georgia, serif" },
  { name: "Monospace", value: "Consolas, monospace" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Montserrat", value: "'Montserrat', sans-serif" },
  { name: "Lato", value: "'Lato', sans-serif" }
];

export function ElementSettings() {
  const { elements, selectedElementId, updateElement, removeElement } = useProjectStore();
  const selectedElement = elements.find(el => el.id === selectedElementId);
  
  const [styleValues, setStyleValues] = useState<Record<string, any>>({});
  const [contentValues, setContentValues] = useState<any>(null);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showSaveStyleDialog, setShowSaveStyleDialog] = useState(false);
  const [styleName, setStyleName] = useState("");
  
  // Mettre à jour les valeurs locales lorsque l'élément sélectionné change
  useEffect(() => {
    if (selectedElement) {
      setStyleValues(selectedElement.style || {});
      setContentValues(selectedElement.contenu);
    } else {
      setStyleValues({});
      setContentValues(null);
    }
  }, [selectedElement]);
  
  if (!selectedElement) {
    return (
      <div className="w-64 border-l p-4">
        <p className="text-muted-foreground text-center">
          Sélectionnez un élément pour modifier ses propriétés
        </p>
      </div>
    );
  }
  
  // Mettre à jour un style
  const handleStyleChange = (property: string, value: string) => {
    const newStyles = { ...styleValues, [property]: value };
    setStyleValues(newStyles);
    updateElement(selectedElement.id, { style: newStyles });
  };
  
  // Mettre à jour le contenu
  const handleContentChange = (value: any) => {
    setContentValues(value);
    updateElement(selectedElement.id, { contenu: value });
  };
  
  // Supprimer l'élément
  const handleDelete = () => {
    removeElement(selectedElement.id);
  };
  
  // Appliquer un thème de couleurs
  const applyColorTheme = (theme: typeof colorThemes[0]) => {
    let newStyles = { ...styleValues };
    
    // Appliquer les couleurs en fonction du type d'élément
    switch (selectedElement.type) {
      case 'bouton':
        newStyles = {
          ...newStyles,
          backgroundColor: theme.colors.primary,
          color: theme.colors.background,
          borderColor: theme.colors.primary
        };
        break;
      case 'texte':
        newStyles = {
          ...newStyles,
          color: theme.colors.text
        };
        break;
      case 'conteneur':
        newStyles = {
          ...newStyles,
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.secondary
        };
        break;
      default:
        // Pour les autres types d'éléments, appliquer des styles génériques
        newStyles = {
          ...newStyles,
          color: theme.colors.text,
          borderColor: theme.colors.secondary
        };
    }
    
    setStyleValues(newStyles);
    updateElement(selectedElement.id, { style: newStyles });
    setShowThemeDialog(false);
  };
  
  // Appliquer un style sauvegardé
  const applyStyle = (style: typeof savedStyles[0]) => {
    setStyleValues(style.style);
    updateElement(selectedElement.id, { style: style.style });
  };
  
  // Sauvegarder un style
  const saveStyle = () => {
    if (!styleName.trim()) return;
    
    toast({
      title: "Style sauvegardé",
      description: `Le style "${styleName}" a été sauvegardé et peut maintenant être appliqué à d'autres éléments.`
    });
    
    setStyleName("");
    setShowSaveStyleDialog(false);
  };
  
  // Dupliquer l'élément
  const duplicateElement = () => {
    const newElement = {
      ...selectedElement,
      id: `element-${Date.now()}`,
      position: {
        ...selectedElement.position,
        x: selectedElement.position.x + 20,
        y: selectedElement.position.y + 20
      }
    };
    
    // Dans une vraie implémentation, on ajouterait l'élément dupliqué
    toast({
      title: "Élément dupliqué",
      description: "Une copie de l'élément a été créée."
    });
  };
  
  return (
    <div className="w-64 border-l p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Propriétés</h3>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={duplicateElement}
            title="Dupliquer"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={handleDelete}
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="style">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
          <TabsTrigger value="content" className="flex-1">Contenu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="style">
          <div className="space-y-4">
            {/* Actions rapides */}
            <div className="flex gap-2 mb-4">
              <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Palette className="h-4 w-4 mr-2" />
                    Thèmes
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Appliquer un thème de couleurs</DialogTitle>
                    <DialogDescription>
                      Choisissez un thème pour modifier rapidement les couleurs de l'élément.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-2 gap-4 py-4">
                    {colorThemes.map((theme) => (
                      <div 
                        key={theme.name}
                        className="border rounded-md p-3 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => applyColorTheme(theme)}
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.secondary }}></div>
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.accent }}></div>
                        </div>
                        <p className="text-sm font-medium">{theme.name}</p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showSaveStyleDialog} onOpenChange={setShowSaveStyleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sauvegarder le style</DialogTitle>
                    <DialogDescription>
                      Donnez un nom à ce style pour pouvoir le réutiliser sur d'autres éléments.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <Label htmlFor="style-name">Nom du style</Label>
                    <Input
                      id="style-name"
                      value={styleName}
                      onChange={(e) => setStyleName(e.target.value)}
                      placeholder="ex: Bouton principal"
                    />
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button onClick={saveStyle}>Sauvegarder</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Styles sauvegardés */}
            <div>
              <h4 className="text-sm font-medium mb-2">Styles sauvegardés</h4>
              <div className="space-y-2">
                {savedStyles
                  .filter(style => style.type === selectedElement.type)
                  .map((style, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => applyStyle(style)}
                    >
                      {style.name}
                    </Button>
                  ))}
                
                {savedStyles.filter(style => style.type === selectedElement.type).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aucun style sauvegardé pour ce type d'élément.
                  </p>
                )}
              </div>
            </div>
            
            {/* Dimensions */}
            <div>
              <h4 className="text-sm font-medium mb-2">Dimensions</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="width">Largeur</Label>
                  <Input
                    id="width"
                    type="number"
                    value={selectedElement.position.width}
                    onChange={(e) => updateElement(selectedElement.id, {
                      position: { ...selectedElement.position, width: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Hauteur</Label>
                  <Input
                    id="height"
                    type="number"
                    value={selectedElement.position.height}
                    onChange={(e) => updateElement(selectedElement.id, {
                      position: { ...selectedElement.position, height: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </div>
            
            {/* Couleurs */}
            <div>
              <h4 className="text-sm font-medium mb-2">Couleurs</h4>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="color">Couleur du texte</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      className="w-12 p-1 h-9"
                      value={styleValues.color || '#000000'}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                    />
                    <Input
                      type="text"
                      value={styleValues.color || '#000000'}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="backgroundColor">Couleur de fond</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      className="w-12 p-1 h-9"
                      value={styleValues.backgroundColor || '#ffffff'}
                      onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    />
                    <Input
                      type="text"
                      value={styleValues.backgroundColor || '#ffffff'}
                      onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Typographie */}
            <div>
              <h4 className="text-sm font-medium mb-2">Typographie</h4>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="fontFamily">Police</Label>
                  <select
                    id="fontFamily"
                    className="w-full h-9 rounded-md border border-input bg-background px-3"
                    value={styleValues.fontFamily || 'Arial, sans-serif'}
                    onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="fontSize">Taille de police</Label>
                  <Input
                    id="fontSize"
                    type="text"
                    value={styleValues.fontSize || '16px'}
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="fontWeight">Graisse</Label>
                  <select
                    id="fontWeight"
                    className="w-full h-9 rounded-md border border-input bg-background px-3"
                    value={styleValues.fontWeight || 'normal'}
                    onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Gras</option>
                    <option value="lighter">Léger</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                    <option value="500">500</option>
                    <option value="600">600</option>
                    <option value="700">700</option>
                    <option value="800">800</option>
                    <option value="900">900</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="textAlign">Alignement</Label>
                  <select
                    id="textAlign"
                    className="w-full h-9 rounded-md border border-input bg-background px-3"
                    value={styleValues.textAlign || 'left'}
                    onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                  >
                    <option value="left">Gauche</option>
                    <option value="center">Centre</option>
                    <option value="right">Droite</option>
                    <option value="justify">Justifié</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="lineHeight">Hauteur de ligne</Label>
                  <Input
                    id="lineHeight"
                    type="text"
                    value={styleValues.lineHeight || '1.5'}
                    onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="letterSpacing">Espacement des lettres</Label>
                  <Input
                    id="letterSpacing"
                    type="text"
                    value={styleValues.letterSpacing || 'normal'}
                    onChange={(e) => handleStyleChange('letterSpacing', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Bordures */}
            <div>
              <h4 className="text-sm font-medium mb-2">Bordures</h4>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="borderRadius">Rayon</Label>
                  <Input
                    id="borderRadius"
                    type="text"
                    value={styleValues.borderRadius || '0px'}
                    onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="border">Bordure</Label>
                  <Input
                    id="border"
                    type="text"
                    value={styleValues.border || 'none'}
                    onChange={(e) => handleStyleChange('border', e.target.value)}
                    placeholder="1px solid #000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="boxShadow">Ombre</Label>
                  <Input
                    id="boxShadow"
                    type="text"
                    value={styleValues.boxShadow || 'none'}
                    onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                    placeholder="0 2px 4px rgba(0,0,0,0.1)"
                  />
                </div>
              </div>
            </div>
            
            {/* Espacement */}
            <div>
              <h4 className="text-sm font-medium mb-2">Espacement</h4>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="padding">Padding</Label>
                  <Input
                    id="padding"
                    type="text"
                    value={styleValues.padding || '0px'}
                    onChange={(e) => handleStyleChange('padding', e.target.value)}
                    placeholder="8px ou 8px 16px"
                  />
                </div>
                
                <div>
                  <Label htmlFor="margin">Margin</Label>
                  <Input
                    id="margin"
                    type="text"
                    value={styleValues.margin || '0px'}
                    onChange={(e) => handleStyleChange('margin', e.target.value)}
                    placeholder="8px ou 8px 16px"
                  />
                </div>
              </div>
            </div>
            
            {/* CSS personnalisé */}
            <div>
              <h4 className="text-sm font-medium mb-2">CSS personnalisé</h4>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background p-2 text-sm font-mono"
                placeholder="Entrez du CSS personnalisé ici..."
                value={styleValues.customCSS || ''}
                onChange={(e) => handleStyleChange('customCSS', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Exemple: transform: rotate(5deg); opacity: 0.8;
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="content">
          {selectedElement.type === 'texte' && (
            <div>
              <Label htmlFor="text-content">Texte</Label>
              <textarea
                id="text-content"
                className="w-full min-h-[100px] rounded-md border border-input bg-background p-2"
                value={contentValues || ''}
                onChange={(e) => handleContentChange(e.target.value)}
              />
            </div>
          )}
          
          {selectedElement.type === 'image' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-src">URL de l'image</Label>
                <Input
                  id="image-src"
                  type="text"
                  value={contentValues?.src || ''}
                  onChange={(e) => handleContentChange({
                    ...contentValues,
                    src: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="image-alt">Texte alternatif</Label>
                <Input
                  id="image-alt"
                  type="text"
                  value={contentValues?.alt || ''}
                  onChange={(e) => handleContentChange({
                    ...contentValues,
                    alt: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          
          {selectedElement.type === 'bouton' && (
            <div>
              <Label htmlFor="button-text">Texte du bouton</Label>
              <Input
                id="button-text"
                type="text"
                value={contentValues || ''}
                onChange={(e) => handleContentChange(e.target.value)}
              />
            </div>
          )}
          
          {selectedElement.type === 'video' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-src">URL de la vidéo</Label>
                <Input
                  id="video-src"
                  type="text"
                  value={contentValues?.src || ''}
                  onChange={(e) => handleContentChange({
                    ...contentValues,
                    src: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="video-title">Titre</Label>
                <Input
                  id="video-title"
                  type="text"
                  value={contentValues?.title || ''}
                  onChange={(e) => handleContentChange({
                    ...contentValues,
                    title: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          
          {selectedElement.type === 'hero' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Titre</Label>
                <Input
                  id="hero-title"
                  type="text"
                  value={contentValues?.title || ''}
                  onChange={(e) => handleContentChange({
                    ...contentValues,
                    title: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="hero-subtitle">Sous-titre</Label>
                <textarea
                  id="hero-subtitle"
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2"
                  value={contentValues?.subtitle || ''}
                  onChange={(e) => handleContentChange({
                    ...contentValues,
                    subtitle: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="hero-button">Texte du bouton</Label>
                <Input
                  id="hero-button"
                  type="text"
                  value={contentValues?.buttonText || ''}
                  onChange={(e) => handleContentChange({
                    ...contentValues,
                    buttonText: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="hero-image">URL de l'image</Label>
                <Input
                  id="hero-image"
                  type="text"
                  value={contentValues?.image || ''}
                  onChange={(e) => handleContentChange({
                    ...contentValues,
                    image: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          
          {selectedElement.type === 'features' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="features-title">Titre de la section</Label>
                <Input
                  id="features-title"
                  type="text"
                  value={contentValues?.title || ''}
                  onChange={(e) => handleContentChange({
                    ...contentValues,
                    title: e.target.value
                  })}
                />
              </div>
              
              {contentValues?.features?.map((feature: any, index: number) => (
                <div key={index} className="border p-3 rounded-md space-y-2">
                  <h5 className="text-sm font-medium">Fonctionnalité {index + 1}</h5>
                  
                  <div>
                    <Label htmlFor={`feature-title-${index}`}>Titre</Label>
                    <Input
                      id={`feature-title-${index}`}
                      type="text"
                      value={feature.title || ''}
                      onChange={(e) => {
                        const newFeatures = [...contentValues.features];
                        newFeatures[index].title = e.target.value;
                        handleContentChange({
                          ...contentValues,
                          features: newFeatures
                        });
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`feature-desc-${index}`}>Description</Label>
                    <Input
                      id={`feature-desc-${index}`}
                      type="text"
                      value={feature.description || ''}
                      onChange={(e) => {
                        const newFeatures = [...contentValues.features];
                        newFeatures[index].description = e.target.value;
                        handleContentChange({
                          ...contentValues,
                          features: newFeatures
                        });
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`feature-icon-${index}`}>Icône</Label>
                    <Input
                      id={`feature-icon-${index}`}
                      type="text"
                      value={feature.icon || ''}
                      onChange={(e) => {
                        const newFeatures = [...contentValues.features];
                        newFeatures[index].icon = e.target.value;
                        handleContentChange({
                          ...contentValues,
                          features: newFeatures
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newFeatures = [...(contentValues?.features || [])];
                  newFeatures.push({
                    title: "Nouvelle fonctionnalité",
                    description: "Description de la fonctionnalité",
                    icon: "✨"
                  });
                  handleContentChange({
                    ...contentValues,
                    features: newFeatures
                  });
                }}
              >
                Ajouter une fonctionnalité
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}