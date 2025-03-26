import { useProjectStore, useEditorStore } from "@/lib/store";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Grid3X3 } from "lucide-react";

export function EditorCanvas() {
  const { 
    elements, 
    currentPage, 
    selectedElementId, 
    selectElement, 
    updateElement 
  } = useProjectStore();
  const { isDragging, setDragging, saveState } = useEditorStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState<{
    vertical: number[],
    horizontal: number[]
  }>({ vertical: [], horizontal: [] });

  // Gérer la sélection d'un élément
  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(elementId);
  };

  // Gérer le début du drag d'un élément
  const handleDragStart = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (selectedElementId !== elementId) {
      selectElement(elementId);
    }
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    // Calculer l'offset pour maintenir la position relative du curseur
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    
    setDragging(true);
    saveState(); // Sauvegarder l'état avant de commencer à déplacer
    
    // Calculer les guides d'alignement
    calculateAlignmentGuides(elementId);
  };

  // Calculer les guides d'alignement basés sur les autres éléments
  const calculateAlignmentGuides = (currentElementId: string) => {
    if (!currentPage) return;
    
    const pageElements = elements.filter(el => el.pageId === currentPage.id && el.id !== currentElementId);
    
    const vertical: number[] = [];
    const horizontal: number[] = [];
    
    pageElements.forEach(element => {
      // Bords gauche et droit
      vertical.push(element.position.x);
      vertical.push(element.position.x + element.position.width);
      
      // Centre vertical
      vertical.push(element.position.x + element.position.width / 2);
      
      // Bords haut et bas
      horizontal.push(element.position.y);
      horizontal.push(element.position.y + element.position.height);
      
      // Centre horizontal
      horizontal.push(element.position.y + element.position.height / 2);
    });
    
    setAlignmentGuides({ vertical, horizontal });
  };

  // Gérer le déplacement d'un élément
  const handleDrag = (e: MouseEvent) => {
    if ((!isDragging && !resizing) || !selectedElementId || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const selectedElement = elements.find(el => el.id === selectedElementId);
    if (!selectedElement) return;
    
    if (isDragging) {
      // Déplacement
      let newX = e.clientX - canvasRect.left - dragOffset.x;
      let newY = e.clientY - canvasRect.top - dragOffset.y;
      
      // Snap aux guides d'alignement (avec une tolérance de 5px)
      const snapTolerance = 5;
      
      alignmentGuides.vertical.forEach(guide => {
        // Snap du bord gauche
        if (Math.abs(newX - guide) < snapTolerance) {
          newX = guide;
        }
        
        // Snap du bord droit
        if (Math.abs(newX + selectedElement.position.width - guide) < snapTolerance) {
          newX = guide - selectedElement.position.width;
        }
        
        // Snap du centre
        if (Math.abs(newX + selectedElement.position.width / 2 - guide) < snapTolerance) {
          newX = guide - selectedElement.position.width / 2;
        }
      });
      
      alignmentGuides.horizontal.forEach(guide => {
        // Snap du bord supérieur
        if (Math.abs(newY - guide) < snapTolerance) {
          newY = guide;
        }
        
        // Snap du bord inférieur
        if (Math.abs(newY + selectedElement.position.height - guide) < snapTolerance) {
          newY = guide - selectedElement.position.height;
        }
        
        // Snap du centre
        if (Math.abs(newY + selectedElement.position.height / 2 - guide) < snapTolerance) {
          newY = guide - selectedElement.position.height / 2;
        }
      });
      
      // Mettre à jour la position de l'élément
      updateElement(selectedElementId, {
        position: {
          ...selectedElement.position,
          x: Math.max(0, newX),
          y: Math.max(0, newY),
        }
      });
    } else if (resizing && resizeDirection) {
      // Redimensionnement
      const { x, y, width, height } = selectedElement.position;
      let newWidth = width;
      let newHeight = height;
      let newX = x;
      let newY = y;
      
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      if (resizeDirection.includes('e')) { // Est (droite)
        newWidth = Math.max(20, mouseX - x);
      }
      
      if (resizeDirection.includes('w')) { // Ouest (gauche)
        const deltaX = x - mouseX;
        newWidth = Math.max(20, width + deltaX);
        newX = mouseX;
      }
      
      if (resizeDirection.includes('s')) { // Sud (bas)
        newHeight = Math.max(20, mouseY - y);
      }
      
      if (resizeDirection.includes('n')) { // Nord (haut)
        const deltaY = y - mouseY;
        newHeight = Math.max(20, height + deltaY);
        newY = mouseY;
      }
      
      updateElement(selectedElementId, {
        position: {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        }
      });
    }
  };

  // Gérer le début du redimensionnement
  const handleResizeStart = (direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setResizeDirection(direction);
    setResizing(true);
    saveState(); // Sauvegarder l'état avant de commencer à redimensionner
  };

  // Gérer la fin du drag ou du redimensionnement
  const handleDragEnd = () => {
    if (isDragging) {
      setDragging(false);
    }
    
    if (resizing) {
      setResizing(false);
      setResizeDirection(null);
    }
    
    // Effacer les guides d'alignement
    setAlignmentGuides({ vertical: [], horizontal: [] });
  };

  // Ajouter les écouteurs d'événements pour le drag et le redimensionnement
  useEffect(() => {
    if (isDragging || resizing) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, resizing, selectedElementId, resizeDirection]);

  // Désélectionner l'élément si on clique sur le canvas
  const handleCanvasClick = () => {
    selectElement(null);
  };

  // Rendu des poignées de redimensionnement
  const renderResizeHandles = (element: any) => {
    if (selectedElementId !== element.id) return null;
    
    const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    const cursors = ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize'];
    
    return directions.map((dir, index) => {
      let style: React.CSSProperties = {
        position: 'absolute',
        width: '8px',
        height: '8px',
        backgroundColor: 'white',
        border: '1px solid #3b82f6',
        cursor: cursors[index],
      };
      
      switch (dir) {
        case 'n':
          style = { ...style, top: '-4px', left: '50%', transform: 'translateX(-50%)' };
          break;
        case 'ne':
          style = { ...style, top: '-4px', right: '-4px' };
          break;
        case 'e':
          style = { ...style, top: '50%', right: '-4px', transform: 'translateY(-50%)' };
          break;
        case 'se':
          style = { ...style, bottom: '-4px', right: '-4px' };
          break;
        case 's':
          style = { ...style, bottom: '-4px', left: '50%', transform: 'translateX(-50%)' };
          break;
        case 'sw':
          style = { ...style, bottom: '-4px', left: '-4px' };
          break;
        case 'w':
          style = { ...style, top: '50%', left: '-4px', transform: 'translateY(-50%)' };
          break;
        case 'nw':
          style = { ...style, top: '-4px', left: '-4px' };
          break;
      }
      
      return (
        <div
          key={dir}
          style={style}
          onMouseDown={(e) => handleResizeStart(dir, e)}
          className="resize-handle"
        />
      );
    });
  };

  // Rendu des guides d'alignement
  const renderAlignmentGuides = () => {
    if (!isDragging || !selectedElementId) return null;
    
    return (
      <>
        {alignmentGuides.vertical.map((position, index) => (
          <div
            key={`v-${index}`}
            className="absolute top-0 bottom-0 w-px bg-primary"
            style={{ left: `${position}px` }}
          />
        ))}
        {alignmentGuides.horizontal.map((position, index) => (
          <div
            key={`h-${index}`}
            className="absolute left-0 right-0 h-px bg-primary"
            style={{ top: `${position}px` }}
          />
        ))}
      </>
    );
  };

  // Rendu de la grille d'alignement
  const renderGrid = () => {
    if (!showGrid) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full grid grid-cols-12 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="h-full border-r border-dashed border-primary/20" />
          ))}
        </div>
        <div className="w-full h-full grid grid-rows-[repeat(auto-fill,minmax(20px,1fr))]">
          {Array.from({ length: 50 }).map((_, index) => (
            <div key={index} className="w-full border-b border-dashed border-primary/20" />
          ))}
        </div>
      </div>
    );
  };

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Veuillez sélectionner ou créer une page</p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant={showGrid ? "default" : "outline"}
          size="icon"
          onClick={() => setShowGrid(!showGrid)}
          title={showGrid ? "Masquer la grille" : "Afficher la grille"}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </div>
      
      <div 
        ref={canvasRef}
        className="w-full h-full bg-white overflow-auto relative"
        onClick={handleCanvasClick}
      >
        {renderGrid()}
        {renderAlignmentGuides()}
        
        <div className="min-h-[2000px] relative p-4">
          {elements.filter(el => el.pageId === currentPage.id).map((element) => (
            <div
              key={element.id}
              className={cn(
                "absolute cursor-move",
                selectedElementId === element.id && "ring-2 ring-primary"
              )}
              style={{
                left: `${element.position.x}px`,
                top: `${element.position.y}px`,
                width: `${element.position.width}px`,
                height: `${element.position.height}px`,
                ...element.style,
              }}
              onClick={(e) => handleElementClick(element.id, e)}
              onMouseDown={(e) => handleDragStart(element.id, e)}
            >
              {renderElement(element)}
              {renderResizeHandles(element)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Fonction pour rendre différents types d'éléments
function renderElement(element: any) {
  switch (element.type) {
    case 'texte':
      return <div style={element.style}>{element.contenu}</div>;
      
    case 'image':
      return <img src={element.contenu.src} alt={element.contenu.alt} style={element.style} />;
      
    case 'bouton':
      return <button style={element.style}>{element.contenu}</button>;
      
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
                />
              ) : (
                <input 
                  type={field.type} 
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full p-2 border rounded"
                />
              )}
            </div>
          ))}
          <button 
            type="submit" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded"
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
      
    default:
      return <div>Élément non pris en charge</div>;
  }
}