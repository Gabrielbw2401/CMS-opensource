import { useProjectStore, useAuthStore } from "@/lib/store";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, Edit3, Smartphone, Tablet, Monitor, Laptop, RotateCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type DeviceType = "mobile" | "tablet" | "laptop" | "desktop";
type Orientation = "portrait" | "landscape";

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  deviceType: DeviceType;
}

const devicePresets: DevicePreset[] = [
  { name: "iPhone SE", width: 375, height: 667, deviceType: "mobile" },
  { name: "iPhone 12/13", width: 390, height: 844, deviceType: "mobile" },
  { name: "iPhone 12/13 Pro Max", width: 428, height: 926, deviceType: "mobile" },
  { name: "Samsung Galaxy S20", width: 360, height: 800, deviceType: "mobile" },
  { name: "iPad Mini", width: 768, height: 1024, deviceType: "tablet" },
  { name: "iPad Pro 11\"", width: 834, height: 1194, deviceType: "tablet" },
  { name: "iPad Pro 12.9\"", width: 1024, height: 1366, deviceType: "tablet" },
  { name: "MacBook Air", width: 1280, height: 800, deviceType: "laptop" },
  { name: "Desktop HD", width: 1920, height: 1080, deviceType: "desktop" },
];

const Preview = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useAuthStore();
  const { projects, pages, elements, currentProject, setCurrentProject } = useProjectStore();
  
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");
  const [customDimensions, setCustomDimensions] = useState({ width: 1200, height: 800 });
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  
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
      
      // Trouver la page d'accueil
      const projectPages = pages.filter(p => p.projetId === projectId);
      const homePage = projectPages.find(p => p.estAccueil);
      
      if (homePage) {
        setCurrentPageId(homePage.id);
      } else if (projectPages.length > 0) {
        setCurrentPageId(projectPages[0].id);
      }
    } else if (projects.length > 0) {
      navigate(`/preview/${projects[0].id}`);
    } else {
      navigate("/dashboard");
    }
  }, [projectId, projects, pages, navigate, setCurrentProject]);
  
  // Gérer le changement de preset d'appareil
  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    
    if (presetName === "custom") {
      return;
    }
    
    const preset = devicePresets.find(p => p.name === presetName);
    if (preset) {
      setDeviceType(preset.deviceType);
      setCustomDimensions({
        width: orientation === "portrait" ? preset.width : preset.height,
        height: orientation === "portrait" ? preset.height : preset.width
      });
    }
  };
  
  // Changer l'orientation
  const toggleOrientation = () => {
    const newOrientation = orientation === "portrait" ? "landscape" : "portrait";
    setOrientation(newOrientation);
    
    // Inverser les dimensions
    setCustomDimensions({
      width: customDimensions.height,
      height: customDimensions.width
    });
  };
  
  // Simuler un clic sur un lien en mode navigation
  const handleElementClick = (element: any) => {
    if (!isNavigationMode) return;
    
    // Si c'est un bouton, vérifier s'il contient un lien vers une autre page
    if (element.type === 'bouton' && element.contenu.includes('page:')) {
      const pageSlug = element.contenu.split('page:')[1].trim();
      const targetPage = pages.find(p => p.slug === pageSlug && p.projetId === currentProject?.id);
      
      if (targetPage) {
        setCurrentPageId(targetPage.id);
      }
    }
  };
  
  if (!currentProject || !currentPageId) {
    return null;
  }
  
  // Trouver la page courante
  const currentPage = pages.find(p => p.id === currentPageId);
  
  // Filtrer les éléments de la page courante
  const pageElements = elements.filter(e => e.pageId === currentPageId);
  
  // Calculer les dimensions de l'aperçu
  const getPreviewStyle = () => {
    let width, height, scale = 1;
    
    // Calculer les dimensions en fonction du type d'appareil
    switch (deviceType) {
      case "mobile":
        width = orientation === "portrait" ? 375 : 667;
        height = orientation === "portrait" ? 667 : 375;
        break;
      case "tablet":
        width = orientation === "portrait" ? 768 : 1024;
        height = orientation === "portrait" ? 1024 : 768;
        break;
      case "laptop":
        width = 1280;
        height = 800;
        break;
      case "desktop":
      default:
        width = customDimensions.width;
        height = customDimensions.height;
    }
    
    return {
      width: `${width}px`,
      height: `${height}px`,
      transform: `scale(${scale})`,
      transformOrigin: 'top center',
      border: deviceType !== "desktop" ? '16px solid #1e293b' : '1px solid #e2e8f0',
      borderRadius: deviceType !== "desktop" ? '16px' : '0',
    };
  };
  
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b p-2 bg-background gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/editor/${currentProject.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-medium">Aperçu: {currentProject.nom}</h1>
          
          {currentPage && (
            <span className="ml-2 text-sm text-muted-foreground hidden sm:inline-block">
              Page: {currentPage.titre}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={deviceType} onValueChange={(value) => setDeviceType(value as DeviceType)} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="mobile" className="flex-1 sm:flex-none">
                <Smartphone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Mobile</span>
              </TabsTrigger>
              <TabsTrigger value="tablet" className="flex-1 sm:flex-none">
                <Tablet className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Tablette</span>
              </TabsTrigger>
              <TabsTrigger value="laptop" className="flex-1 sm:flex-none">
                <Laptop className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Portable</span>
              </TabsTrigger>
              <TabsTrigger value="desktop" className="flex-1 sm:flex-none">
                <Monitor className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bureau</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleOrientation}
            disabled={deviceType === "desktop" || deviceType === "laptop"}
            title="Changer l'orientation"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px] hidden sm:flex">
              <SelectValue placeholder="Appareil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Personnalisé</SelectItem>
              {devicePresets
                .filter(preset => preset.deviceType === deviceType)
                .map(preset => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          
          <Button 
            variant={isNavigationMode ? "default" : "outline"}
            onClick={() => setIsNavigationMode(!isNavigationMode)}
            size="sm"
          >
            Mode navigation
          </Button>
          
          <Button asChild size="sm">
            <Link to={`/editor/${currentProject.id}`}>
              <Edit3 className="h-4 w-4 mr-2" />
              Retour à l'éditeur
            </Link>
          </Button>
        </div>
      </div>
      
      {currentPage && (
        <div className="flex-1 flex flex-col items-center justify-start bg-muted/10 overflow-auto p-4">
          <div className="mb-4 flex flex-wrap gap-2 max-w-full overflow-x-auto pb-2">
            {pages
              .filter(page => page.projetId === currentProject.id)
              .map(page => (
                <Button
                  key={page.id}
                  variant={page.id === currentPageId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPageId(page.id)}
                >
                  {page.titre}
                </Button>
              ))
            }
          </div>
          
          <Card className="mb-4 p-2 w-full max-w-[1400px]">
            <CardContent className="p-0 flex justify-center">
              <div
                className="bg-white shadow-lg transition-all duration-300 overflow-hidden"
                style={getPreviewStyle()}
              >
                <div className="relative w-full h-full overflow-auto">
                  {pageElements.map((element) => (
                    <div
                      key={element.id}
                      className="absolute"
                      style={{
                        left: `${element.position.x}px`,
                        top: `${element.position.y}px`,
                        width: `${element.position.width}px`,
                        height: `${element.position.height}px`,
                        ...element.style,
                        cursor: isNavigationMode && element.type === 'bouton' ? 'pointer' : 'default',
                      }}
                      onClick={() => handleElementClick(element)}
                    >
                      {renderPreviewElement(element, isNavigationMode)}
                    </div>
                  ))}
                  
                  {pageElements.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Cette page est vide. Ajoutez des éléments dans l'éditeur.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-2 text-sm text-muted-foreground text-center">
            {isNavigationMode ? (
              <p>Mode navigation activé. Cliquez sur les boutons pour naviguer entre les pages.</p>
            ) : (
              <p>Dimensions: {customDimensions.width} × {customDimensions.height}px</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Fonction pour rendre différents types d'éléments en mode aperçu
function renderPreviewElement(element: any, isNavigationMode: boolean) {
  switch (element.type) {
    case 'texte':
      return <div style={element.style}>{element.contenu}</div>;
      
    case 'image':
      return <img src={element.contenu.src} alt={element.contenu.alt} style={element.style} />;
      
    case 'bouton':
      return (
        <button 
          style={{
            ...element.style,
            cursor: isNavigationMode ? 'pointer' : 'default'
          }}
        >
          {element.contenu}
        </button>
      );
      
    case 'conteneur':
      return <div style={element.style}>{element.contenu}</div>;
      
    case 'formulaire':
      return (
        <form style={element.style} onSubmit={(e) => e.preventDefault()}>
          {element.contenu.fields.map((field: any, index: number) => (
            <div key={index} className="mb-4">
              <label className="block mb-2 text-sm font-medium">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea 
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full p-2 border rounded"
                  disabled={isNavigationMode}
                />
              ) : (
                <input 
                  type={field.type} 
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full p-2 border rounded"
                  disabled={isNavigationMode}
                />
              )}
            </div>
          ))}
          <button 
            type="submit" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded"
            disabled={isNavigationMode}
          >
            {element.contenu.submitLabel}
          </button>
        </form>
      );
      
    case 'video':
      return (
        <iframe
          src={element.contenu.src}
          title={element.contenu.title}
          style={element.style}
          allowFullScreen
        ></iframe>
      );
      
    case 'hero':
      return (
        <div style={element.style} className="flex flex-col items-center justify-center text-center">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {element.contenu.title}
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '800px' }}>
            {element.contenu.subtitle}
          </p>
          <button 
            style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.375rem',
              fontWeight: 'bold',
              cursor: isNavigationMode ? 'pointer' : 'default'
            }}
          >
            {element.contenu.buttonText}
          </button>
          {element.contenu.image && (
            <img 
              src={element.contenu.image} 
              alt="Hero" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                marginTop: '2rem',
                borderRadius: '0.5rem'
              }} 
            />
          )}
        </div>
      );
      
    case 'features':
      return (
        <div style={element.style}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
            {element.contenu.title}
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem' 
          }}>
            {element.contenu.features.map((feature: any, index: number) => (
              <div key={index} style={{ 
                padding: '1.5rem', 
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '2rem', 
                  marginBottom: '1rem' 
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
      
    case 'galerie':
      return (
        <div style={{ ...element.style }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            {element.contenu.images.map((image: any, index: number) => (
              <img 
                key={index}
                src={image.src}
                alt={image.alt}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            ))}
          </div>
        </div>
      );
      
    case 'temoignage':
      return (
        <div style={element.style}>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '1.5rem',
              fontStyle: 'italic',
              marginBottom: '1.5rem',
              color: '#4b5563'
            }}>
              "{element.contenu.quote}"
            </div>
            <div style={{ 
              display: 'flex',
              alignItems: 'center'
            }}>
              {element.contenu.avatar && (
                <img 
                  src={element.contenu.avatar}
                  alt={element.contenu.author}
                  style={{ 
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    marginRight: '1rem'
                  }}
                />
              )}
              <div>
                <div style={{ fontWeight: 'bold' }}>{element.contenu.author}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{element.contenu.position}</div>
              </div>
            </div>
          </div>
        </div>
      );
      
    default:
      return <div>Élément non pris en charge</div>;
  }
}

export default Preview;