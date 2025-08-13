"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { 
  ReactFlow, 
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position,
  EdgeProps,
  getBezierPath,
  useReactFlow,
  ReactFlowProvider
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus, X, Search, Bookmark, Zap, Edit, Share, ThumbsUp, Mail, Users, Sparkles, Trash2, GitBranch, ArrowDown, ChevronRight, ChevronDown, FileText, Check } from "lucide-react";
import AIRewriteSidebar from "@/components/AIRewriteSidebar";
import FollowUpSettingsSidebar from "@/components/FollowUpSettingsSidebar";
import TaskSettingsSidebar from "@/components/TaskSettingsSidebar";

// Fonction utilitaire pour rendre les variables avec un style distinct
const renderTextWithVariables = (text: string) => {
  const parts = text.split(/({{[^}]+}})/g);
  return parts.map((part, index) => {
    if (part.match(/{{[^}]+}}/)) {
      return (
        <span
          key={index}
          className="text-blue-600 font-medium"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

// Fonction utilitaire pour estimer la hauteur d'un node selon son type
const getNodeEstimatedHeight = (nodeType: string) => {
  const nodeHeights = {
    'workflowStarter': 200,
    'search': 600, // Node Search est plus grand
    'extractQuestions': 400,
    'summariseCall': 350,
    'condition': 300,
    'reviewBeforeProceeding': 250,
    'emailClient': 500, // Node Email Client avec recipients, subject et body
    'notifyTeams': 550 // Node Notify Teams avec channel, recipients, body et toggles
  };
  return nodeHeights[nodeType as keyof typeof nodeHeights] || 300;
};

// Interface pour les actions
interface Action {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ActionSection {
  id: string;
  title: string;
  actions: Action[];
}

interface FollowUpSetting {
  id: string;
  delay: number;
  delayUnit: 'minutes' | 'hours' | 'days';
  subject: string;
  body: string;
}

interface TaskSetting {
  id: string;
  taskName: string;
  assignees: string[];
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

// Composant popup pour New Step / New Branch
function EdgeActionPopup({ 
  isOpen, 
  onClose, 
  onSelectOption,
  position
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelectOption: (option: 'new-step' | 'new-branch' | string) => void;
  position?: { x: number; y: number };
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [showActionsPopup, setShowActionsPopup] = useState(false);
  const [actionsPopupPosition, setActionsPopupPosition] = useState<{ x: number; y: number } | undefined>();
  const [currentActionType, setCurrentActionType] = useState<'new-step' | 'new-branch' | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        setShowActionsPopup(false);
        setCurrentActionType(null);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && e.target && !popupRef.current.contains(e.target as Element)) {
        onClose();
        setShowActionsPopup(false);
        setCurrentActionType(null);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleHover = (option: 'new-step' | 'new-branch', e: React.MouseEvent) => {
    // Annuler tout timeout en cours
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Stocker le type d'action pour différencier le comportement
    setCurrentActionType(option);
    
    // Obtenir les dimensions de la popup parent (New step/New branch)
    const parentPopup = (e.currentTarget as Element).closest('.fixed');
    const rect = (e.currentTarget as Element).getBoundingClientRect();
    
    if (parentPopup) {
      const parentRect = parentPopup.getBoundingClientRect();
      
      // Positionnement différencié selon le type d'action
      if (option === 'new-step') {
        // New step : popup très décalée à droite, alignée avec le haut
        setActionsPopupPosition({
          x: parentRect.right + 110, // Espacement de 110px pour éviter complètement le chevauchement
          y: parentRect.top
        });
      } else if (option === 'new-branch') {
        // New branch : popup très décalée à droite et vers le bas pour montrer la distinction
        setActionsPopupPosition({
          x: parentRect.right + 110, // Même espacement horizontal de 110px
          y: parentRect.top + 25 // Décalage vers le bas pour montrer que c'est une branche
        });
      }
    } else {
      // Fallback si on ne trouve pas la popup parent
      setActionsPopupPosition({
        x: rect.right,
        y: rect.top - 20
      });
    }
    
    setShowActionsPopup(true);
  };

  const handleLeave = () => {
    // Délai pour permettre de naviguer vers le popup d'actions
    hoverTimeoutRef.current = setTimeout(() => {
      setShowActionsPopup(false);
      setCurrentActionType(null);
    }, 150);
  };



  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Popup principal */}
      <div
        ref={popupRef}
        className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 w-36"
        style={{
          top: position ? position.y + 5 : '50%',
          left: position ? position.x - 72 : '50%',
          transform: position ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        <div className="p-1">
          <button
            onClick={() => onSelectOption('new-step')}
            onMouseEnter={(e) => handleHover('new-step', e)}
            onMouseLeave={handleLeave}
            className="w-full flex items-center justify-between px-2 py-1.5 text-left hover:bg-gray-100 rounded-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowDown className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-700">New step</span>
            </div>
            <ChevronRight className="h-3 w-3 text-gray-400" />
          </button>
          <button
            onClick={() => onSelectOption('new-branch')}
            onMouseEnter={(e) => handleHover('new-branch', e)}
            onMouseLeave={handleLeave}
            className="w-full flex items-center justify-between px-2 py-1.5 text-left hover:bg-gray-100 rounded-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-700">New branch</span>
            </div>
            <ChevronRight className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Popup d'actions - réutilisation de ActionLibraryPopup avec positionnement personnalisé */}
      {showActionsPopup && (
        <div
          onMouseEnter={() => {
            // Maintenir la popup ouverte quand on survole
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            // Fermer avec délai quand on quitte
            hoverTimeoutRef.current = setTimeout(() => {
              setShowActionsPopup(false);
              setCurrentActionType(null);
            }, 150);
          }}
        >
          <ActionLibraryPopup
            isOpen={showActionsPopup}
            onClose={() => {
              setShowActionsPopup(false);
              setCurrentActionType(null);
            }}
            onSelectAction={(action) => onSelectOption(`${currentActionType}:${action.id}`)}
            position={actionsPopupPosition}
          />
        </div>
      )}
    </>
  );
}

// Composant Edge personnalisé avec hover
function CustomEdge({ id, sourceX, sourceY, targetX, targetY, style }: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Position du milieu de l'edge pour placer le bouton +
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Déclencher l'événement personnalisé avec la position et l'ID de l'edge
    const rect = (e.currentTarget as Element).getBoundingClientRect();
    const customEvent = new CustomEvent('edgeAddClick', {
      detail: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        edgeId: id
      }
    });
    window.dispatchEvent(customEvent);
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Zone de hover invisible plus large */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        className="react-flow__edge-interaction"
      />
      
      {/* Edge path visible */}
      <path
        id={id}
        d={edgePath}
        style={{
          ...style,
          strokeDasharray: '8 4',
          animation: 'dash-flow 2s linear infinite'
        }}
        className="react-flow__edge-path"
      />
      
      {/* Bouton + au milieu de l'edge, visible au hover */}
      {isHovered && (
        <foreignObject
          x={midX - 12}
          y={midY - 12}
          width={24}
          height={24}
          className="overflow-visible"
        >
          <button
            onClick={handleAddClick}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-3 py-2 font-medium rounded-md flex items-center justify-center transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <Plus className="h-4 w-4" />
          </button>
        </foreignObject>
      )}
    </g>
  );
}

// Composant popup de librairie d'actions
function ActionLibraryPopup({ 
  isOpen, 
  onClose, 
  onSelectAction,
  position
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelectAction: (action: Action) => void;
  position?: { x: number; y: number };
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [calculatedPosition, setCalculatedPosition] = useState<{ top: number; left: number } | null>(null);

  // Calculer la position optimale pour que la popup soit entièrement visible
  const calculateOptimalPosition = (triggerPosition: { x: number; y: number }) => {
    const popupWidth = 224; // w-56 = 224px
    const popupHeight = 288; // max-h-72 = 288px
    const margin = 20; // Marge de sécurité
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let top = triggerPosition.y + margin;
    let left = triggerPosition.x - (popupWidth / 2); // Centrer par défaut
    
    // Vérifier si la popup dépasse en bas
    if (top + popupHeight > viewportHeight - margin) {
      // Placer au-dessus du trigger
      top = triggerPosition.y - popupHeight - margin;
    }
    
    // Vérifier si la popup dépasse à droite
    if (left + popupWidth > viewportWidth - margin) {
      left = viewportWidth - popupWidth - margin;
    }
    
    // Vérifier si la popup dépasse à gauche
    if (left < margin) {
      left = margin;
    }
    
    // Si même au-dessus ça ne rentre pas, placer à côté
    if (top < margin) {
      top = Math.max(margin, triggerPosition.y - (popupHeight / 2));
      
      // Essayer à droite du trigger
      if (triggerPosition.x + popupWidth + margin < viewportWidth) {
        left = triggerPosition.x + margin;
      } else {
        // Sinon à gauche
        left = triggerPosition.x - popupWidth - margin;
      }
    }
    
    return { top, left };
  };

  // Recalculer la position quand la popup s'ouvre ou que la position change
  useEffect(() => {
    if (isOpen && position) {
      const optimalPosition = calculateOptimalPosition(position);
      setCalculatedPosition(optimalPosition);
    }
  }, [isOpen, position]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && e.target && !popupRef.current.contains(e.target as Element)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Sections recommandées
  const recommendedActions: Action[] = [
    { id: "summarise-call", title: "Summarise call", icon: Bookmark },
    { id: "extract-data", title: "Extract Data", icon: Zap }
  ];

  // Sections par catégorie
  const categorySections: ActionSection[] = [
    {
      id: "extraction",
      title: "Extraction",
      actions: [
        { id: "summarise-call-cat", title: "Summarise call", icon: Bookmark },
        { id: "extract-data-cat", title: "Extract data", icon: Zap }
      ]
    },
    {
      id: "enrichment",
      title: "Enrichment",
      actions: [
        { id: "search", title: "Search", icon: Search }
      ]
    },
    {
      id: "decision",
      title: "Decision",
      actions: [
        { id: "condition", title: "Condition", icon: Search },
        { id: "review-before-proceeding", title: "Review Before Proceeding", icon: ThumbsUp }
      ]
    },
    {
      id: "action",
      title: "Action",
      actions: [
        { id: "notify-team", title: "Notify Team", icon: Users },
        { id: "email-client", title: "Email Client", icon: Mail },
        { id: "draft-follow-up", title: "Draft Follow-up", icon: Edit },
        { id: "update-crm", title: "Update CRM", icon: Share }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Style pour scrollbar fine */}
      <style jsx>{`
        .thin-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .thin-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Popup */}
      <div
        ref={popupRef}
        className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 w-56 max-h-72 overflow-y-auto thin-scrollbar"
        style={{
          top: calculatedPosition ? calculatedPosition.top : (position ? position.y + 20 : '50%'),
          left: calculatedPosition ? calculatedPosition.left : (position ? position.x - 112 : '50%'),
          transform: (!calculatedPosition && !position) ? 'translate(-50%, -50%)' : 'none',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <h3 className="font-medium text-xs text-gray-900">Add steps</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-2 space-y-3">
          {/* Sections recommandées */}
          <div>
            <h4 className="font-medium text-xs text-gray-500 uppercase tracking-wide mb-1.5">Recommended</h4>
                  <div className="space-y-0.5">
              {recommendedActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => onSelectAction(action)}
                        className="w-full flex items-center gap-2 p-1 text-left hover:bg-gray-100 rounded-sm transition-colors"
                      >
                        <action.icon className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{action.title}</span>
                      </button>
              ))}
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-200"></div>

          {/* Sections par catégorie */}
          <div>
            <h4 className="font-medium text-xs text-gray-500 uppercase tracking-wide mb-1.5">By category</h4>
            <div className="space-y-2">
              {categorySections.map((section) => (
                <div key={section.id}>
                  <h5 className="font-medium text-xs text-gray-800 mb-1">{section.title}</h5>
            <div className="space-y-0.5">
                    {section.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onSelectAction(action)}
                  className="w-full flex items-center gap-2 p-1 text-left hover:bg-gray-100 rounded-sm transition-colors"
                >
                  <action.icon className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{action.title}</span>
                </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Node personnalisé pour le workflow starter
function WorkflowStarterNode({ data }: { data: { onAddNode: (position: { x: number; y: number }) => void; hasConnection?: boolean; hasOutgoingConnection?: boolean } }) {
  const [selectedTrigger, setSelectedTrigger] = useState("Manual");
  const [selectedSyncMode, setSelectedSyncMode] = useState("Auto-sync");
  const [isIntegrationEnabled, setIsIntegrationEnabled] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);



  // Fermer la sélection en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ne pas fermer si on clique sur le bouton de suppression
      if (target.closest('[data-delete-button]')) return;
      
      // Ne pas fermer si on clique à l'intérieur du nœud
      if (target.closest('[data-node-container]')) return;
      
      // Fermer dans tous les autres cas
      setIsSelected(false);
    };
    
    if (isSelected) {
      // Utiliser capture pour s'assurer que l'événement est capturé avant les autres handlers
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isSelected]);

  const handleAddNode = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      data.onAddNode({
        x: rect.left + rect.width / 2,
        y: rect.bottom
      });
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    // Empêcher le clic si on clique sur des éléments interactifs
    const target = e.target as HTMLElement;
    if (target.closest('input, select, button, textarea')) return;
    
    // Empêcher la sélection du nœud si on est en train de sélectionner du texte
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    
    setIsSelected(true);
  };

  return (
    <div className="flex flex-col items-center relative" data-node-container>
      {/* Handle de sortie - visible seulement si connecté */}
      {data.hasOutgoingConnection && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="a"
          style={{
            background: '#9ca3af',
            width: 8,
            height: 8,
            bottom: -4
          }}
        />
      )}
      
      {/* Node principal avec style Clay anguleux */}
      <div 
        className={`bg-white rounded p-4 min-w-[380px] border-2 cursor-pointer hover:border-purple-300 transition-all ${
          isSelected 
            ? 'border-purple-400 shadow-md' 
            : 'border-gray-200 shadow-sm'
        }`}
        onClick={handleNodeClick}
      >
        {/* Header du node avec style Clay */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></div>
          </div>
          <h3 className="font-semibold text-sm text-gray-900">Get Transcript</h3>
        </div>

        {/* Mode de synchronisation avec boutons toggle */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Transcript source
          </label>
          <div className="flex gap-1.5">
          <button
              onClick={() => setSelectedSyncMode("Auto-sync")}
              className={`flex-1 px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                selectedSyncMode === "Auto-sync"
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
              </div>
              Auto-sync
          </button>
            <button
              onClick={() => setSelectedSyncMode("Manual URL")}
              className={`flex-1 px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                selectedSyncMode === "Manual URL"
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                {selectedSyncMode === "Manual URL" && <div className="w-1.5 h-1.5 bg-current rounded-full"></div>}
              </div>
              Manual URL
            </button>
          </div>
        </div>

        {/* Section conditionnelle selon le mode sélectionné */}
        {selectedSyncMode === "Auto-sync" && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Choose integrations
            </label>
            <div className="border border-gray-300 rounded p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    Z
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-900">Zoom</div>
                    <div className="text-xs text-gray-500">Connected as john@company.com</div>
                  </div>
                </div>
                  <button
                  onClick={() => setIsIntegrationEnabled(!isIntegrationEnabled)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${
                    isIntegrationEnabled ? 'bg-blue-300' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                    isIntegrationEnabled ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                  </button>
              </div>
            </div>
            <div className="flex justify-end mt-1.5">
              <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <div className="w-2.5 h-2.5 border border-current rounded-full flex items-center justify-center">
                  <div className="w-0.5 h-0.5 bg-current rounded-full"></div>
                </div>
                Change integration
              </button>
            </div>
          </div>
        )}

        {/* Trigger type avec toggle buttons */}
        <div className="mb-0">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Trigger type
          </label>
          <div className="flex gap-1.5">
            <button
              onClick={() => setSelectedTrigger("Manual")}
              className={`flex-1 px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                selectedTrigger === "Manual"
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                {selectedTrigger === "Manual" && <div className="w-1.5 h-1.5 bg-current rounded-full"></div>}
              </div>
              Manual
            </button>
            <button
              onClick={() => setSelectedTrigger("Automatic")}
              className={`flex-1 px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                selectedTrigger === "Automatic"
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                {selectedTrigger === "Automatic" && <div className="w-1.5 h-1.5 bg-current rounded-full"></div>}
              </div>
              Automatic
            </button>
          </div>
        </div>
      </div>

      {/* CTA button Clay style - seulement si pas de connexion */}
      {!data.hasOutgoingConnection && (
        <div className="mt-3">
          <button 
            ref={buttonRef}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-2.5 py-1.5 font-medium rounded flex items-center justify-center transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            onClick={handleAddNode}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// Node pour la recherche
function SearchNode({ data }: { data: { onAddNode: (position: { x: number; y: number }) => void; hasConnection?: boolean; openAIRewriteSidebar?: (prompt: string, stepTitle: string, callback: (newPrompt: string) => void) => void; onDeleteNode?: (nodeId: string) => void; nodeId?: string; stepNumber?: number; hasOutgoingConnection?: boolean; actionTitle?: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState("Find the document that best answers: {{ step5.output }}");
  const [isSelected, setIsSelected] = useState(false);
  const [selectedScope, setSelectedScope] = useState("Internal");
  const [sources, setSources] = useState<string[]>(["Google Drive", "Notion"]);
  const [maxResults, setMaxResults] = useState(10);
  const [focusKeywords, setFocusKeywords] = useState<string[]>(["documentation", "client case", "features"]);
  const [selectedOutputFormat, setSelectedOutputFormat] = useState("Links");
  
  // Prompts et keywords selon le scope
  const getPromptForScope = (scope: string) => {
    return scope === "Internal" 
      ? "Find the document that best answers: {{ step5.output }}"
      : "Find information on the web that best answers: {{ step5.output }}";
  };
  
  const getKeywordsForScope = (scope: string) => {
    return scope === "Internal" 
      ? ["documentation", "client case", "features"]
      : ["pricing", "competitors", "features"];
  };
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleScopeChange = (scope: string) => {
    setSelectedScope(scope);
    // Mettre à jour le prompt et les keywords selon le scope
    setPrompt(getPromptForScope(scope));
    setFocusKeywords(getKeywordsForScope(scope));
  };

  const handleRemoveSource = (sourceToRemove: string) => {
    setSources(sources.filter(source => source !== sourceToRemove));
  };

  const handleAddSource = () => {
    const newSource = window.prompt('Enter source name:');
    if (newSource && newSource.trim() && !sources.includes(newSource.trim())) {
      setSources([...sources, newSource.trim()]);
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFocusKeywords(focusKeywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleAddKeyword = () => {
    const newKeyword = window.prompt('Enter focus keyword:');
    if (newKeyword && newKeyword.trim() && !focusKeywords.includes(newKeyword.trim())) {
      setFocusKeywords([...focusKeywords, newKeyword.trim()]);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleAddNode = () => {
    if (buttonRef.current && data.onAddNode) {
      const rect = buttonRef.current.getBoundingClientRect();
      const position = {
        x: rect.right + 10,
        y: rect.top
      };
      data.onAddNode(position);
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('input, select, button, textarea')) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    
    setIsSelected(true);
  };

  const handleDeleteNode = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (data.onDeleteNode && data.nodeId) {
      data.onDeleteNode(data.nodeId);
    }
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Fermer la sélection en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('[data-delete-button]')) return;
      if (target.closest('[data-node-container]')) return;
      
      setIsSelected(false);
    };
    
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isSelected]);

  return (
    <div className="flex flex-col items-center relative" data-node-container>
      {/* Handle d'entrée */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{
          background: '#9ca3af',
          width: 8,
          height: 8,
          top: -4
        }}
      />

      {/* Icône de suppression ou boutons de confirmation */}
      {isSelected && !showDeleteConfirmation && (
        <button
          onClick={handleDeleteNode}
          data-delete-button
          className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}

      {/* Boutons de confirmation de suppression */}
      {isSelected && showDeleteConfirmation && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          <button
            onClick={handleCancelDelete}
            data-delete-button
            className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={handleConfirmDelete}
            data-delete-button
            className="w-7 h-7 bg-red-500 border border-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Node principal Clay style avec largeur fixe */}
      <div 
        className={`bg-white rounded p-4 w-[400px] border-2 cursor-pointer hover:border-purple-300 transition-all ${
          isSelected 
            ? 'border-purple-400 shadow-md' 
            : 'border-gray-200 shadow-sm'
        }`}
        onClick={handleNodeClick}
      >
        {/* Header du node Clay style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-purple-100 rounded flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Search</h3>
          </div>
          {data.stepNumber && (
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
              <span className="text-xs text-gray-500">step{data.stepNumber}</span>
            </div>
          )}
        </div>

        {/* Scope Selection */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Scope</label>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleScopeChange("Internal");
              }}
              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                selectedScope === "Internal"
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Internal
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleScopeChange("External");
              }}
              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                selectedScope === "External"
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              External
            </button>
          </div>
        </div>

        {/* Sources */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Source</label>
          <div className="flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
              >
                <span className="text-gray-700">{source}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSource(source);
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-1"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddSource();
              }}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs text-gray-600 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Prompt</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.openAIRewriteSidebar) {
                  data.openAIRewriteSidebar(prompt, "Search", (newPrompt: string) => {
                    setPrompt(newPrompt);
                  });
                }
              }}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Rewrite with AI
            </button>
          </div>
          
          <div className="relative">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full h-32 p-3 text-xs border border-purple-400 rounded resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 font-mono text-gray-800"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
                placeholder="Enter your search prompt..."
              />
            ) : (
              <div
                onClick={handleEdit}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                className="p-3 bg-gray-50 border border-gray-300 rounded cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[128px] relative"
              >
                <div 
                  className="text-xs text-gray-800 leading-relaxed font-mono select-text" 
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {renderTextWithVariables(prompt)}
                </div>
              </div>
            )}
            
            {/* Variables and Examples button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Variables and Examples clicked');
              }}
              className="absolute bottom-2 right-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm px-2 py-1 rounded transition-colors"
            >
              Variables and Examples
            </button>
          </div>
        </div>

        {/* Parameters */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-3">Parameters</label>
          
          {/* Max results */}
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-gray-700">Max results</label>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMaxResults(Math.max(1, maxResults - 1));
                }}
                className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-gray-600 transition-colors"
              >
                -
              </button>
              <span className="text-xs font-medium text-gray-900 min-w-[20px] text-center">{maxResults}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMaxResults(maxResults + 1);
                }}
                className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Focus keywords */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">Focus keywords</label>
            <div className="flex flex-wrap gap-2">
              {focusKeywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveKeyword(keyword);
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddKeyword();
                }}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs text-gray-600 transition-colors"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Output Format */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">Output Format</label>
          <div className="flex gap-2">
            {["Paragraph", "Links", "JSON"].map((format) => (
              <button
                key={format}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOutputFormat(format);
                }}
                className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                  selectedOutputFormat === format
                    ? 'bg-gray-100 text-gray-900 border-gray-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>


      </div>

      {/* CTA button Clay style - seulement si pas de connexion */}
      {!data.hasOutgoingConnection && (
        <div className="mt-4">
          <button 
            ref={buttonRef}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-3 py-2 font-medium rounded-md flex items-center justify-center transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            onClick={handleAddNode}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Handle de sortie - visible seulement si connecté */}
      {data.hasOutgoingConnection && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="c"
          style={{
            background: '#9ca3af',
            width: 8,
            height: 8,
            bottom: -4
          }}
        />
      )}
    </div>
  );
}

// Node pour l'extraction de questions client
function ExtractQuestionsNode({ data }: { data: { onAddNode: (position: { x: number; y: number }) => void; hasConnection?: boolean; openAIRewriteSidebar?: (prompt: string, stepTitle: string, callback: (newPrompt: string) => void) => void; onDeleteNode?: (nodeId: string) => void; nodeId?: string; stepNumber?: number; hasOutgoingConnection?: boolean; actionTitle?: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [selectedPromptType, setSelectedPromptType] = useState("Custom");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [competitors, setCompetitors] = useState<string[]>(["Salesforce", "HubSpot"]);
  const [includeUnknowns, setIncludeUnknowns] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const promptTypes = [
    { value: "autonomous", label: "Custom" },
    { value: "client-questions", label: "Client questions" },
    { value: "hobbies", label: "Hobbies" },
    { value: "competitors", label: "Competitors" },
    { value: "objections", label: "Objections" },
    { value: "kpis", label: "KPIs" }
  ];

  const predefinedPrompts = {
    "Custom": "",
    "Client questions": "Extract all customer questions from the {{transcript}}. Format each question with the {{speaker}} name and timestamp. Only include explicit questions that require follow-up.",
    "Hobbies": "Extract information about hobbies and personal interests mentioned in the {{transcript}}.",
    "Competitors": "Identify any competitors or competing solutions mentioned in the {{transcript}}.",
    "Objections": "Extract all objections, concerns, or hesitations expressed in the {{transcript}}.",
    "KPIs": "Identify key performance indicators and metrics discussed in the {{transcript}}."
  };

  const handlePromptTypeChange = (value: string) => {
    setSelectedPromptType(value);
    setPrompt(predefinedPrompts[value as keyof typeof predefinedPrompts] || "");
  };



  const handleRemoveCompetitor = (competitorToRemove: string) => {
    setCompetitors(competitors.filter(comp => comp !== competitorToRemove));
  };



  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleAddNode = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      data.onAddNode({
        x: rect.left + rect.width / 2,
        y: rect.bottom
      });
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    // Empêcher le clic si on édite le prompt
    if (isEditing) return;
    
    // Empêcher le clic si on clique sur des éléments interactifs
    const target = e.target as HTMLElement;
    if (target.closest('input, select, button, textarea')) return;
    
    // Empêcher la sélection du nœud si on est en train de sélectionner du texte
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    
    setIsSelected(true);
  };

  const handleDeleteNode = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (data.onDeleteNode && data.nodeId) {
      data.onDeleteNode(data.nodeId);
    }
    setShowDeleteConfirmation(false);
    setIsSelected(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Fermer la sélection en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ne pas fermer si on clique sur le bouton de suppression
      if (target.closest('[data-delete-button]')) return;
      
      // Ne pas fermer si on clique à l'intérieur du nœud
      if (target.closest('[data-node-container]')) return;
      
      // Fermer dans tous les autres cas
      setIsSelected(false);
    };
    
    if (isSelected) {
      // Utiliser capture pour s'assurer que l'événement est capturé avant les autres handlers
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isSelected]);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Fermer si on clique en dehors du dropdown container
      if (!target.closest('[data-dropdown-container]')) {
        setIsDropdownOpen(false);
      }
    };
    
    if (isDropdownOpen) {
      // Utiliser capture pour s'assurer que l'événement est capturé avant les autres handlers
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isDropdownOpen]);

  // Fermer le dropdown avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };
    
    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isDropdownOpen]);

  return (
    <div className="flex flex-col items-center relative" data-node-container>
      {/* Handle d'entrée - toujours visible car ce node est créé connecté */}
      <Handle
        type="target"
        position={Position.Top}
        id="b"
        style={{
          background: '#9ca3af',
          width: 8,
          height: 8,
          top: -4
        }}
      />

      {/* Handle de sortie - visible seulement si connecté */}
      {data.hasOutgoingConnection && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="c"
          style={{
            background: '#9ca3af',
            width: 8,
            height: 8,
            bottom: -4
          }}
        />
      )}

      {/* Icône de suppression ou boutons de confirmation */}
      {isSelected && !showDeleteConfirmation && (
        <button
          onClick={handleDeleteNode}
          data-delete-button
          className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}

      {/* Boutons de confirmation de suppression */}
      {isSelected && showDeleteConfirmation && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          <button
            onClick={handleCancelDelete}
            data-delete-button
            className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={handleConfirmDelete}
            data-delete-button
            className="w-7 h-7 bg-red-500 border border-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Node principal Clay style avec largeur fixe */}
      <div 
        className={`bg-white rounded p-4 w-[400px] border-2 cursor-pointer hover:border-purple-300 transition-all ${
          isSelected 
            ? 'border-purple-400 shadow-md' 
            : 'border-gray-200 shadow-sm'
        }`}
        onClick={handleNodeClick}
      >
        {/* Header du node Clay style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-purple-100 rounded flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-purple-600" />
          </div>
            <h3 className="font-semibold text-sm text-gray-900">{data.actionTitle || "Extract Data"}</h3>
          </div>
          {data.stepNumber && (
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
              <span className="text-xs text-gray-500">step{data.stepNumber}</span>
            </div>
          )}
          </div>

        {/* Section de sélection de prompt */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Select an AI prompt
          </label>
          <div className="relative" data-dropdown-container>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="w-full px-2.5 py-1.5 border border-gray-300 bg-white text-xs text-left focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span className="text-gray-900">{selectedPromptType}</span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 shadow-lg z-50 max-h-48 overflow-y-auto">
                {promptTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePromptTypeChange(type.label);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-gray-100 transition-colors text-gray-900 border-none bg-transparent"
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de prompt Clay style */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Extraction prompt</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.openAIRewriteSidebar) {
                  data.openAIRewriteSidebar(prompt, "Extract Questions", (newPrompt: string) => {
                    setPrompt(newPrompt);
                  });
                }
              }}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Rewrite with AI
            </button>
          </div>
          
          <div className="relative">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
                className="w-full h-32 p-3 text-xs border border-purple-400 rounded resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 font-mono text-gray-800"
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }}
              placeholder={selectedPromptType === "Autonomous" ? "Write your custom extraction prompt..." : "Edit the predefined prompt..."}
            />
          ) : (
            <div
              onClick={handleEdit}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
                className="p-3 bg-gray-50 border border-gray-300 rounded cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[128px] relative"
            >
              {selectedPromptType === "Autonomous" && !prompt ? (
                <p 
                  className="text-xs text-gray-400 leading-relaxed font-mono italic" 
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                >
                  Click to write your custom extraction prompt...
                </p>
              ) : (
                <div 
                  className="text-xs text-gray-800 leading-relaxed font-mono select-text" 
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                  {renderTextWithVariables(prompt)}
                </div>
              )}
            </div>
          )}
            
            {/* Variables and Examples button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Ajouter la logique pour afficher les variables et exemples
                console.log('Variables and Examples clicked');
              }}
              className="absolute bottom-2 right-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm px-2 py-1 rounded transition-colors"
            >
              Variables and Examples
            </button>
          </div>
        </div>

        {/* Section Parameters - seulement pour Competitors */}
        {selectedPromptType === "Competitors" && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-3">Parameters</label>
            
            {/* Known competitors */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">Known competitors</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {competitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                  >
                    <span className="text-gray-700">{competitor}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCompetitor(competitor);
                      }}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const competitorName = window.prompt('Enter competitor name:');
                    if (competitorName && competitorName.trim() && !competitors.includes(competitorName.trim())) {
                      setCompetitors([...competitors, competitorName.trim()]);
                    }
                  }}
                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs text-gray-600 transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Include unknowns toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">Include unknowns</label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIncludeUnknowns(!includeUnknowns);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  includeUnknowns ? 'bg-purple-400' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    includeUnknowns ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
          </div>
          </div>
        )}

      </div>

      {/* CTA button Clay style - seulement si pas de connexion */}
      {!data.hasOutgoingConnection && (
        <div className="mt-4">
          <button 
            ref={buttonRef}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-3 py-2 font-medium rounded-md flex items-center justify-center transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            onClick={handleAddNode}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function ConditionNode({ data }: { data: { onAddNode: (position: { x: number; y: number }, branch?: 'yes' | 'no') => void; hasConnection?: boolean; stepNumber?: number; hasOutgoingConnection?: boolean; onDeleteNode?: (nodeId: string) => void; nodeId?: string } }) {
  const [isSelected, setIsSelected] = useState(false);
  const [conditions, setConditions] = useState<string[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleAddCondition = () => {
    setConditions([...conditions, `Condition ${conditions.length + 1}`]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleDeleteNode = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (data.onDeleteNode && data.nodeId) {
      data.onDeleteNode(data.nodeId);
    }
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, select, button, textarea')) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return; 
    
    setIsSelected(true);
  };

  const handleAddNode = (branch: 'yes' | 'no', event: React.MouseEvent) => {
    // Calculer la position du bouton cliqué pour ouvrir la popup à côté
    const buttonRect = (event.target as HTMLElement).getBoundingClientRect();
    const position = {
      x: buttonRect.right + 10, // 10px à droite du bouton
      y: buttonRect.top
    };
    
    if (data.onAddNode) {
      // Passer la branche sélectionnée avec la position
      data.onAddNode(position, branch);
    }
  };

  // Fermer la sélection en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('[data-delete-button]')) return;
      if (target.closest('[data-node-container]')) return;
      
      setIsSelected(false);
    };
    
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isSelected]);

  return (
    <div className="flex flex-col items-center relative" data-node-container>
      {/* Handle d'entrée */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{
          background: '#9ca3af',
          width: 8,
          height: 8,
          top: -4
        }}
      />

      {/* Icône de suppression ou boutons de confirmation */}
      {isSelected && !showDeleteConfirmation && (
        <button
          onClick={handleDeleteNode}
          data-delete-button
          className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}

      {/* Boutons de confirmation de suppression */}
      {isSelected && showDeleteConfirmation && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          <button
            onClick={handleCancelDelete}
            data-delete-button
            className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={handleConfirmDelete}
            data-delete-button
            className="w-7 h-7 bg-red-500 border border-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Node principal */}
      <div 
        className={`bg-white rounded p-4 w-[400px] border-2 cursor-pointer hover:border-purple-300 transition-all ${
          isSelected 
            ? 'border-purple-400 shadow-md' 
            : 'border-gray-200 shadow-sm'
        }`}
        onClick={handleNodeClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
             <div className="w-7 h-7 bg-purple-100 rounded flex items-center justify-center">
               <GitBranch className="w-3.5 h-3.5 text-purple-600" />
             </div>
            <h3 className="font-semibold text-sm text-gray-900">Condition</h3>
          </div>
          {data.stepNumber && (
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
              <span className="text-xs text-gray-500">step{data.stepNumber}</span>
            </div>
          )}
        </div>

        {/* Section Conditions */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-gray-600">Conditions</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddCondition();
              }}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-700 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add condition
            </button>
          </div>

          {/* Liste des conditions */}
          <div className="space-y-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <span className="text-xs text-gray-700 flex-1">{condition}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCondition(index);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Boutons de branche centrés en dessous avec handles au-dessus */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="relative">
          {/* Handle pour "If no" centré au-dessus du bouton */}
          <Handle
            type="source"
            position={Position.Top}
            id="no"
            style={{
              background: '#9ca3af',
              width: 8,
              height: 8,
              top: -4,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddNode('no', e);
            }}
            className="text-black px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: '#BDBBFF' }}
          >
            If no
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="relative">
          {/* Handle pour "If yes" centré au-dessus du bouton */}
          <Handle
            type="source"
            position={Position.Top}
            id="yes"
            style={{
              background: '#9ca3af',
              width: 8,
              height: 8,
              top: -4,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddNode('yes', e);
            }}
            className="text-black px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: '#BDBBFF' }}
          >
            If yes
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewBeforeProceedingNode({ data }: { data: { onAddNode: (position: { x: number; y: number }, branch?: 'decline' | 'accept') => void; hasConnection?: boolean; stepNumber?: number; hasOutgoingConnection?: boolean } }) {
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [outputText, setOutputText] = useState("{{ step20.output }}");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDeleteNode = () => {
    console.log('Delete review before proceeding node');
    setIsSelected(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    // Empêcher le clic si on édite le texte
    if (isEditing) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('input, select, button, textarea')) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    
    setIsSelected(true);
  };

  const handleAddNode = (branch: 'decline' | 'accept', event: React.MouseEvent) => {
    // Calculer la position du bouton cliqué pour ouvrir la popup à côté
    const buttonRect = (event.target as HTMLElement).getBoundingClientRect();
    const position = {
      x: buttonRect.right + 10, // 10px à droite du bouton
      y: buttonRect.top
    };
    
    if (data.onAddNode) {
      // Passer la branche sélectionnée avec la position
      data.onAddNode(position, branch);
    }
  };

  // Fermer la sélection en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('[data-delete-button]')) return;
      if (target.closest('[data-node-container]')) return;
      
      setIsSelected(false);
    };
    
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isSelected]);

  return (
    <div className="flex flex-col items-center relative" data-node-container>
      {/* Handle d'entrée */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{
          background: '#9ca3af',
          width: 8,
          height: 8,
          top: -4
        }}
      />

      {/* Icône de suppression */}
      {isSelected && (
        <button
          onClick={handleDeleteNode}
          data-delete-button
          className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}

      {/* Node principal */}
      <div 
        className={`bg-white rounded p-4 w-[400px] border-2 cursor-pointer hover:border-purple-300 transition-all ${
          isSelected 
            ? 'border-purple-400 shadow-md' 
            : 'border-gray-200 shadow-sm'
        }`}
        onClick={handleNodeClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-purple-100 rounded flex items-center justify-center">
              <ThumbsUp className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Review before proceeding</h3>
          </div>
          {data.stepNumber && (
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
              <span className="text-xs text-gray-500">step{data.stepNumber}</span>
            </div>
          )}
        </div>

        {/* Section contenu */}
        <div className="mb-4">
          <div className="relative">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
                className="w-full h-32 p-3 text-xs border border-purple-400 rounded resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 font-mono text-gray-800"
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }}
              placeholder="Edit the output text..."
            />
          ) : (
            <div
              onClick={handleEdit}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
                className="p-3 bg-gray-50 border border-gray-300 rounded cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[128px] relative"
            >
              <p 
                  className="text-xs text-gray-800 leading-relaxed font-mono select-text" 
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {outputText}
              </p>
            </div>
          )}
          
            {/* Variables and Examples button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Ajouter la logique pour afficher les variables et exemples
                console.log('Variables and Examples clicked');
              }}
              className="absolute bottom-2 right-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm px-2 py-1 rounded transition-colors"
            >
              Variables and Examples
            </button>
          </div>
        </div>
      </div>

      {/* Boutons de branche centrés en dessous avec handles au-dessus */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="relative">
          {/* Handle pour "Decline" centré au-dessus du bouton */}
          <Handle
            type="source"
            position={Position.Top}
            id="decline"
            style={{
              background: '#9ca3af',
              width: 8,
              height: 8,
              top: -4,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddNode('decline', e);
            }}
            className="text-black px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: '#BDBBFF' }}
          >
            Decline
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="relative">
          {/* Handle pour "Accept" centré au-dessus du bouton */}
          <Handle
            type="source"
            position={Position.Top}
            id="accept"
            style={{
              background: '#9ca3af',
              width: 8,
              height: 8,
              top: -4,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddNode('accept', e);
            }}
            className="text-black px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: '#BDBBFF' }}
          >
            Accept
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SummariseCallNode({ data }: { data: { onAddNode: (position: { x: number; y: number }) => void; hasConnection?: boolean; openAIRewriteSidebar?: (prompt: string, stepTitle: string, callback: (newPrompt: string) => void) => void; onDeleteNode?: (nodeId: string) => void; nodeId?: string; stepNumber?: number; hasOutgoingConnection?: boolean } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState("Provide a comprehensive summary of the meeting covering all key topics, decisions, and outcomes discussed in {{transcript}}.");
  const [isSelected, setIsSelected] = useState(false);
  const [selectedSummaryType, setSelectedSummaryType] = useState("Custom");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const summaryTypes = [
    { value: "general", label: "Custom" },
    { value: "client-facing", label: "Client facing" },
    { value: "short-summary", label: "Short summary" },
    { value: "summary-with-actions", label: "Summary with action items" },
    { value: "bullet-points", label: "Bullet points" }
  ];

  const predefinedPrompts = {
    "Custom": "Provide a comprehensive summary of the meeting covering all key topics, decisions, and outcomes discussed in {{transcript}}.",
    "Client facing": "Create a professional, client-appropriate summary of the meeting highlighting key decisions, next steps, and outcomes from {{transcript}}.",
    "Short summary": "Provide a brief, concise summary of the main points and key takeaways from {{transcript}}.",
    "Summary with action items": "Summarize the meeting and clearly identify all action items, responsibilities, and deadlines mentioned in {{transcript}}.",
    "Bullet points": "Organize the key points from {{transcript}} into clear, structured bullet points covering main topics and decisions."
  };

  const handleSummaryTypeChange = (value: string) => {
    setSelectedSummaryType(value);
    setPrompt(predefinedPrompts[value as keyof typeof predefinedPrompts] || "");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleAddNode = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      data.onAddNode({
        x: rect.left + rect.width / 2,
        y: rect.bottom
      });
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    // Empêcher le clic si on édite le prompt
    if (isEditing) return;
    
    // Empêcher le clic si on clique sur des éléments interactifs
    const target = e.target as HTMLElement;
    if (target.closest('input, select, button, textarea')) return;
    
    // Empêcher la sélection du nœud si on est en train de sélectionner du texte
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    
    setIsSelected(true);
  };

  const handleDeleteNode = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (data.onDeleteNode && data.nodeId) {
      data.onDeleteNode(data.nodeId);
    }
    setShowDeleteConfirmation(false);
    setIsSelected(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Fermer la sélection en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('[data-delete-button]')) return;
      if (target.closest('[data-node-container]')) return;
      
      setIsSelected(false);
    };
    
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isSelected]);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Fermer si on clique en dehors du dropdown container
      if (!target.closest('[data-dropdown-container]')) {
        setIsDropdownOpen(false);
      }
    };
    
    if (isDropdownOpen) {
      // Utiliser capture pour s'assurer que l'événement est capturé avant les autres handlers
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isDropdownOpen]);

  // Fermer le dropdown avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };
    
    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isDropdownOpen]);

  return (
    <div className="flex flex-col items-center relative" data-node-container>
      {/* Handle d'entrée */}
      <Handle
        type="target"
        position={Position.Top}
        id="b"
        style={{
          background: '#9ca3af',
          width: 8,
          height: 8,
          top: -4
        }}
      />

      {/* Handle de sortie */}
      {data.hasOutgoingConnection && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="c"
          style={{
            background: '#9ca3af',
            width: 8,
            height: 8,
            bottom: -4
          }}
        />
      )}

      {/* Icône de suppression ou boutons de confirmation */}
      {isSelected && !showDeleteConfirmation && (
        <button
          onClick={handleDeleteNode}
          data-delete-button
          className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}

      {/* Boutons de confirmation de suppression */}
      {isSelected && showDeleteConfirmation && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          <button
            onClick={handleCancelDelete}
            data-delete-button
            className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={handleConfirmDelete}
            data-delete-button
            className="w-7 h-7 bg-red-500 border border-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Node principal */}
      <div 
        className={`bg-white rounded p-4 w-[400px] border-2 cursor-pointer hover:border-purple-300 transition-all ${
          isSelected 
            ? 'border-purple-400 shadow-md' 
            : 'border-gray-200 shadow-sm'
        }`}
        onClick={handleNodeClick}
      >
        {/* Header du node */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-purple-100 rounded flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Summarise Call</h3>
          </div>
          {data.stepNumber && (
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
              <span className="text-xs text-gray-500">step{data.stepNumber}</span>
            </div>
          )}
        </div>

        {/* Section de sélection de prompt */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Select an AI prompt
          </label>
          <div className="relative" data-dropdown-container>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="w-full px-2.5 py-1.5 border border-gray-300 bg-white text-xs text-left focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span className="text-gray-900">{selectedSummaryType}</span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 shadow-lg z-50 max-h-48 overflow-y-auto">
                {summaryTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSummaryTypeChange(type.label);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-gray-100 transition-colors text-gray-900 border-none bg-transparent"
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de prompt Clay style */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Summary prompt</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.openAIRewriteSidebar) {
                  data.openAIRewriteSidebar(prompt, "Summarise Call", (newPrompt: string) => {
                    setPrompt(newPrompt);
                  });
                }
              }}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Rewrite with AI
            </button>
      </div>

          <div className="relative">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
                className="w-full h-32 p-3 text-xs border border-purple-400 rounded resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 font-mono text-gray-800"
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }}
              placeholder="Edit the summary prompt..."
            />
          ) : (
            <div
              onClick={handleEdit}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
                className="p-3 bg-gray-50 border border-gray-300 rounded cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[128px] relative"
              >
                <div 
                  className="text-xs text-gray-800 leading-relaxed font-mono select-text" 
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {renderTextWithVariables(prompt)}
                </div>
              </div>
            )}
            
            {/* Variables and Examples button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Ajouter la logique pour afficher les variables et exemples
                console.log('Variables and Examples clicked');
              }}
              className="absolute bottom-2 right-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm px-2 py-1 rounded transition-colors"
            >
              Variables and Examples
            </button>
          </div>
        </div>
      </div>

      {/* CTA button */}
      {!data.hasOutgoingConnection && (
        <div className="mt-4">
          <button 
            ref={buttonRef}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-3 py-2 font-medium rounded-md flex items-center justify-center transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            onClick={handleAddNode}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Node pour l'envoi d'email client
function EmailClientNode({ data }: { data: { onAddNode: (position: { x: number; y: number }) => void; hasConnection?: boolean; openAIRewriteSidebar?: (prompt: string, stepTitle: string, callback: (newPrompt: string) => void) => void; onDeleteNode?: (nodeId: string) => void; nodeId?: string; stepNumber?: number; hasOutgoingConnection?: boolean } }) {
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [subject, setSubject] = useState("Follow-up from our call today");
  const [body, setBody] = useState("Hi {{ client.name }},\n\nThank you for the great call today. Based on our discussion, here's a summary: {{ step20.output }} Looking forward to next steps! Best regards, {{ user.name }}");
  const [recipients, setRecipients] = useState<string[]>(["client@company.com"]);
  const [newRecipient, setNewRecipient] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleEditSubject = () => {
    setIsEditingSubject(true);
    setTimeout(() => {
      if (subjectRef.current) {
        subjectRef.current.focus();
      }
    }, 0);
  };

  const handleEditBody = () => {
    setIsEditingBody(true);
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.focus();
      }
    }, 0);
  };

  const handleBlurSubject = () => {
    setIsEditingSubject(false);
  };

  const handleBlurBody = () => {
    setIsEditingBody(false);
  };

  const handleKeyDownSubject = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditingSubject(false);
    }
  };

  const handleKeyDownBody = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      setIsEditingBody(false);
    } else if (e.key === 'Escape') {
      setIsEditingBody(false);
    }
  };

  const handleAddRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()]);
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (recipientToRemove: string) => {
    setRecipients(recipients.filter(recipient => recipient !== recipientToRemove));
  };

  const handleAddNode = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      data.onAddNode({
        x: rect.left + rect.width / 2,
        y: rect.bottom
      });
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    // Empêcher le clic si on édite
    if (isEditingSubject || isEditingBody) return;
    
    // Empêcher le clic si on clique sur des éléments interactifs
    const target = e.target as HTMLElement;
    if (target.closest('input, select, button, textarea')) return;
    
    // Empêcher la sélection du nœud si on est en train de sélectionner du texte
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    
    setIsSelected(true);
  };

  const handleDeleteNode = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (data.onDeleteNode && data.nodeId) {
      data.onDeleteNode(data.nodeId);
    }
    setShowDeleteConfirmation(false);
    setIsSelected(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Fermer la sélection en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ne pas fermer si on clique sur le bouton de suppression
      if (target.closest('[data-delete-button]')) return;
      
      // Ne pas fermer si on clique à l'intérieur du nœud
      if (target.closest('[data-node-container]')) return;
      
      // Fermer dans tous les autres cas
      setIsSelected(false);
    };
    
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isSelected]);

  return (
    <div className="flex flex-col items-center relative" data-node-container>
      {/* Handle d'entrée - toujours visible car ce node est créé connecté */}
      <Handle
        type="target"
        position={Position.Top}
        id="b"
        style={{
          background: '#9ca3af',
          width: 8,
          height: 8,
          top: -4
        }}
      />

      {/* Handle de sortie - visible seulement si connecté */}
      {data.hasOutgoingConnection && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="c"
          style={{
            background: '#9ca3af',
            width: 8,
            height: 8,
            bottom: -4
          }}
        />
      )}

      {/* Icône de suppression ou boutons de confirmation */}
      {isSelected && !showDeleteConfirmation && (
        <button
          onClick={handleDeleteNode}
          data-delete-button
          className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}

      {/* Boutons de confirmation de suppression */}
      {isSelected && showDeleteConfirmation && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          <button
            onClick={handleCancelDelete}
            data-delete-button
            className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={handleConfirmDelete}
            data-delete-button
            className="w-7 h-7 bg-red-500 border border-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Node principal Clay style avec largeur fixe */}
      <div 
        className={`bg-white rounded p-4 w-[400px] border-2 cursor-pointer hover:border-purple-300 transition-all ${
          isSelected 
            ? 'border-purple-400 shadow-md' 
            : 'border-gray-200 shadow-sm'
        }`}
        onClick={handleNodeClick}
      >
        {/* Header du node Clay style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-100 rounded flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Email Client</h3>
          </div>
          {data.stepNumber && (
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
               <span className="text-xs text-gray-500">step{data.stepNumber}</span>
            </div>
          )}
        </div>

        {/* Recipients */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Recipients</label>
          <div className="border border-gray-300 bg-white p-2.5 rounded">
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  <span>{recipient}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRecipient(recipient);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRecipient();
                  }
                }}
                placeholder="Add email..."
                className="text-xs border-none outline-none bg-transparent text-gray-500 placeholder-gray-400 min-w-20 flex-1"
              />
            </div>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject</label>
          <div className="relative">
            {isEditingSubject ? (
              <input
                ref={subjectRef}
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onBlur={handleBlurSubject}
                onKeyDown={handleKeyDownSubject}
                className="w-full p-2.5 text-xs border border-purple-400 rounded focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-800"
              />
            ) : (
              <div
                onClick={handleEditSubject}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                className="p-2.5 bg-gray-50 border border-gray-300 rounded cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[40px] relative flex items-center"
              >
                {subject ? (
                  <div 
                    className="text-xs text-gray-800 select-text" 
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {renderTextWithVariables(subject)}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Enter subject...</p>
                )}
              </div>
            )}
            
            {/* Variables and Examples button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Variables and Examples clicked');
              }}
              className="absolute bottom-1 right-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm px-2 py-1 rounded transition-colors"
            >
              Variables and Examples
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Body</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.openAIRewriteSidebar) {
                  data.openAIRewriteSidebar(body, "Email Body", (newBody: string) => {
                    setBody(newBody);
                  });
                }
              }}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Rewrite with AI
            </button>
          </div>
          
          <div className="relative">
            {isEditingBody ? (
              <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={handleBlurBody}
                onKeyDown={handleKeyDownBody}
                className="w-full h-32 p-3 text-xs border border-purple-400 rounded resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 font-mono text-gray-800"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
                placeholder="Enter email body..."
              />
            ) : (
              <div
                onClick={handleEditBody}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                className="p-3 bg-gray-50 border border-gray-300 rounded cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[128px] relative"
              >
                {body ? (
                  <div 
                    className="text-xs text-gray-800 leading-relaxed font-mono select-text whitespace-pre-wrap" 
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {renderTextWithVariables(body)}
                  </div>
                ) : (
                  <p 
                    className="text-xs text-gray-400 leading-relaxed font-mono italic" 
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                  >
                    Enter email body...
                  </p>
                )}
              </div>
            )}
            
            {/* Variables and Examples button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Variables and Examples clicked');
              }}
              className="absolute bottom-2 right-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm px-2 py-1 rounded transition-colors"
            >
              Variables and Examples
            </button>
          </div>
        </div>
      </div>

      {/* CTA button Clay style - seulement si pas de connexion */}
      {!data.hasOutgoingConnection && (
        <div className="mt-4">
          <button 
            ref={buttonRef}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-3 py-2 font-medium rounded-md flex items-center justify-center transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            onClick={handleAddNode}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Node pour notifier les équipes
function NotifyTeamsNode({ data }: { data: { onAddNode: (position: { x: number; y: number }) => void; hasConnection?: boolean; openAIRewriteSidebar?: (prompt: string, stepTitle: string, callback: (newPrompt: string) => void) => void; onDeleteNode?: (nodeId: string) => void; nodeId?: string; stepNumber?: number; hasOutgoingConnection?: boolean; openFollowUpSidebar?: (stepTitle: string, callback: (settings: FollowUpSetting[]) => void) => void; openTaskSidebar?: (stepTitle: string, initialRecipients: string[], callback: (settings: TaskSetting[]) => void) => void } }) {
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [body, setBody] = useState("}}");
  const [recipients, setRecipients] = useState<string[]>(["#sales-team", "@john.doe"]);
  const [newRecipient, setNewRecipient] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("Email");
  const [followUpSettings, setFollowUpSettings] = useState(false);
  const [createTask, setCreateTask] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);





  const handleEditBody = () => {
    setIsEditingBody(true);
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.focus();
      }
    }, 0);
  };

  const handleBlurBody = () => {
    setIsEditingBody(false);
  };

  const handleKeyDownBody = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      setIsEditingBody(false);
    } else if (e.key === 'Escape') {
      setIsEditingBody(false);
    }
  };

  const handleAddRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()]);
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (recipientToRemove: string) => {
    setRecipients(recipients.filter(recipient => recipient !== recipientToRemove));
  };

  const handleAddNode = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      data.onAddNode({
        x: rect.left + rect.width / 2,
        y: rect.bottom
      });
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    // Empêcher le clic si on édite
    if (isEditingBody) return;
    
    // Empêcher le clic si on clique sur des éléments interactifs
    const target = e.target as HTMLElement;
    if (target.closest('input, select, button, textarea')) return;
    
    // Empêcher la sélection du nœud si on est en train de sélectionner du texte
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    
    setIsSelected(true);
  };

  const handleDeleteNode = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (data.onDeleteNode && data.nodeId) {
      data.onDeleteNode(data.nodeId);
    }
    setShowDeleteConfirmation(false);
    setIsSelected(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Fermer la sélection en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ne pas fermer si on clique sur le bouton de suppression
      if (target.closest('[data-delete-button]')) return;
      
      // Ne pas fermer si on clique à l'intérieur du nœud
      if (target.closest('[data-node-container]')) return;
      
      // Fermer dans tous les autres cas
      setIsSelected(false);
    };
    
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isSelected]);

  return (
    <div className="flex flex-col items-center relative" data-node-container>
      {/* Handle d'entrée - toujours visible car ce node est créé connecté */}
      <Handle
        type="target"
        position={Position.Top}
        id="b"
        style={{
          background: '#9ca3af',
          width: 8,
          height: 8,
          top: -4
        }}
      />

      {/* Handle de sortie - visible seulement si connecté */}
      {data.hasOutgoingConnection && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="c"
          style={{
            background: '#9ca3af',
            width: 8,
            height: 8,
            bottom: -4
          }}
        />
      )}

      {/* Icône de suppression ou boutons de confirmation */}
      {isSelected && !showDeleteConfirmation && (
        <button
          onClick={handleDeleteNode}
          data-delete-button
          className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}

      {/* Boutons de confirmation de suppression */}
      {isSelected && showDeleteConfirmation && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          <button
            onClick={handleCancelDelete}
            data-delete-button
            className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={handleConfirmDelete}
            data-delete-button
            className="w-7 h-7 bg-red-500 border border-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Node principal Clay style avec largeur fixe */}
      <div 
        className={`bg-white rounded p-4 w-[400px] border-2 cursor-pointer hover:border-purple-300 transition-all ${
          isSelected 
            ? 'border-purple-400 shadow-md' 
            : 'border-gray-200 shadow-sm'
        }`}
        onClick={handleNodeClick}
      >
        {/* Header du node Clay style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-100 rounded flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Notify Teams</h3>
          </div>
          {data.stepNumber && (
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
               <span className="text-xs text-gray-500">step{data.stepNumber}</span>
            </div>
          )}
        </div>

        {/* Channel Selection */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Channel</label>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedChannel("Slack");
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedChannel === "Slack"
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-150'
              }`}
            >
              <span className="text-xs">#</span>
              <span>Slack</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedChannel("Email");
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedChannel === "Email"
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-150'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Email</span>
            </button>
          </div>
        </div>

        {/* Recipients */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Recipients</label>
          <div className="border border-gray-300 bg-white p-2.5 rounded">
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  <span>{recipient}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRecipient(recipient);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRecipient();
                  }
                }}
                placeholder="Add recipients..."
                className="text-xs border-none outline-none bg-transparent text-gray-500 placeholder-gray-400 min-w-20 flex-1"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Body</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.openAIRewriteSidebar) {
                  data.openAIRewriteSidebar(body, "Notification Body", (newBody: string) => {
                    setBody(newBody);
                  });
                }
              }}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Rewrite with AI
            </button>
          </div>
          
          <div className="relative">
            {isEditingBody ? (
              <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={handleBlurBody}
                onKeyDown={handleKeyDownBody}
                className="w-full h-32 p-3 text-xs border border-purple-400 rounded resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 font-mono text-gray-800"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
                placeholder="Enter notification body..."
              />
            ) : (
              <div
                onClick={handleEditBody}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                className="p-3 bg-gray-50 border border-gray-300 rounded cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[128px] relative"
              >
                {body ? (
                  <div 
                    className="text-xs text-gray-800 leading-relaxed font-mono select-text whitespace-pre-wrap" 
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                    {renderTextWithVariables(body)}
                  </div>
                ) : (
                  <p 
                    className="text-xs text-gray-400 leading-relaxed font-mono italic" 
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                  >
                    Enter notification body...
                  </p>
                )}
            </div>
          )}
        </div>
      </div>

        {/* Follow up settings */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Follow up settings</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newState = !followUpSettings;
                setFollowUpSettings(newState);
                
                if (newState && data.openFollowUpSidebar) {
                  // Ouvrir la sidebar quand on active le toggle
                  data.openFollowUpSidebar("Notify Teams", (settings: FollowUpSetting[]) => {
                    console.log('Follow-up settings updated:', settings);
                    // Ici on pourrait sauvegarder les settings dans l'état du node
                  });
                } else if (!newState) {
                  // Fermer la sidebar quand on désactive le toggle
                  const closeEvent = new CustomEvent('closeFollowUpSidebar');
                  window.dispatchEvent(closeEvent);
                }
              }}
                             className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                 followUpSettings ? 'bg-purple-400' : 'bg-gray-300'
               }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  followUpSettings ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Create task */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Create task</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newState = !createTask;
                setCreateTask(newState);
                
                if (newState && data.openTaskSidebar) {
                  // Ouvrir la sidebar quand on active le toggle
                  data.openTaskSidebar("Notify Teams", recipients, (settings: TaskSetting[]) => {
                    console.log('Task settings updated:', settings);
                    // Ici on pourrait sauvegarder les settings dans l'état du node
                  });
                } else if (!newState) {
                  // Fermer la sidebar quand on désactive le toggle
                  const closeEvent = new CustomEvent('closeTaskSidebar');
                  window.dispatchEvent(closeEvent);
                }
              }}
                             className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                 createTask ? 'bg-purple-400' : 'bg-gray-300'
               }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  createTask ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* CTA button Clay style - seulement si pas de connexion */}
      {!data.hasOutgoingConnection && (
        <div className="mt-4">
          <button 
            ref={buttonRef}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-3 py-2 font-medium rounded-md flex items-center justify-center transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            onClick={handleAddNode}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Node pour draft follow-up
function DraftFollowUpNode({ data }: { data: { onAddNode: (position: { x: number; y: number }) => void; hasConnection?: boolean; openAIRewriteSidebar?: (prompt: string, stepTitle: string, callback: (newPrompt: string) => void) => void; onDeleteNode?: (nodeId: string) => void; nodeId?: string; stepNumber?: number; hasOutgoingConnection?: boolean } }) {
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [body, setBody] = useState("Hi {{ client.name }},\n\nThank you for our productive meeting today. Here's a summary of what we discussed:\n\n{{ step1.output }}\n\nI'll follow up on the action items we identified and keep you updated on our progress.\n\nBest regards,\n{{ user.name }}");
  const [recipients, setRecipients] = useState<string[]>(["client@company.com"]);
  const [newRecipient, setNewRecipient] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("Custom");
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [insertedSteps, setInsertedSteps] = useState<string[]>(["step1.output", "step2.output"]);
  const [newStep, setNewStep] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const templateTypes = [
    { value: "custom", label: "Custom" },
    { value: "summary", label: "Summary" },
    { value: "summary-qa", label: "Summary + Q&A" },
    { value: "action-items", label: "Action Items" },
    { value: "next-steps", label: "Next Steps" }
  ];

  const predefinedTemplates = {
    "Custom": "Hi {{ client.name }},\n\nThank you for our productive meeting today. Here's a summary of what we discussed:\n\n{{ step1.output }}\n\nI'll follow up on the action items we identified and keep you updated on our progress.\n\nBest regards,\n{{ user.name }}",
    "Summary": "Hi {{ client.name }},\n\nI wanted to follow up on our meeting with a comprehensive summary:\n\n{{ step1.output }}\n\nPlease review and let me know if I missed anything important or if you have any questions.\n\nLooking forward to our next steps.\n\nBest regards,\n{{ user.name }}",
    "Summary + Q&A": "Hi {{ client.name }},\n\nThank you for the great discussion today. Here's what we covered:\n\n**Meeting Summary:**\n{{ step1.output }}\n\n**Questions & Answers:**\n{{ step2.output }}\n\nPlease confirm these details are accurate and let me know if you need any clarification.\n\nBest regards,\n{{ user.name }}",
    "Action Items": "Hi {{ client.name }},\n\nFollowing up on our meeting, here are the key action items we discussed:\n\n{{ step1.output }}\n\nI'll keep you updated on progress and reach out if I need any additional information from your side.\n\nThanks again for your time today.\n\nBest regards,\n{{ user.name }}",
    "Next Steps": "Hi {{ client.name }},\n\nGreat meeting today! Here are the next steps we outlined:\n\n{{ step1.output }}\n\nI'll start working on these items and will update you by {{ follow_up_date }}. Please let me know if you have any questions or concerns.\n\nBest regards,\n{{ user.name }}"
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    setBody(predefinedTemplates[value as keyof typeof predefinedTemplates] || "");
  };

  const handleEditBody = () => {
    setIsEditingBody(true);
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.focus();
      }
    }, 0);
  };

  const handleBlurBody = () => {
    setIsEditingBody(false);
  };

  const handleKeyDownBody = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      setIsEditingBody(false);
    } else if (e.key === 'Escape') {
      setIsEditingBody(false);
    }
  };

  const handleAddRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()]);
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (recipientToRemove: string) => {
    setRecipients(recipients.filter(recipient => recipient !== recipientToRemove));
  };

  const handleAddStep = () => {
    if (newStep.trim() && !insertedSteps.includes(newStep.trim())) {
      setInsertedSteps([...insertedSteps, newStep.trim()]);
      setNewStep("");
    }
  };

  const handleRemoveStep = (stepToRemove: string) => {
    setInsertedSteps(insertedSteps.filter(step => step !== stepToRemove));
  };

  const handleAddNode = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      data.onAddNode({
        x: rect.left + rect.width / 2,
        y: rect.bottom
      });
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    // Empêcher le clic si on édite
    if (isEditingBody) return;
    
    // Empêcher le clic si on clique sur des éléments interactifs
    const target = e.target as HTMLElement;
    if (target.closest('input, select, button, textarea')) return;
    
    // Empêcher la sélection du nœud si on est en train de sélectionner du texte
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    
    setIsSelected(true);
  };

  const handleDeleteNode = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (data.onDeleteNode && data.nodeId) {
      data.onDeleteNode(data.nodeId);
    }
    setShowDeleteConfirmation(false);
    setIsSelected(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Fermer la sélection en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ne pas fermer si on clique sur le bouton de suppression
      if (target.closest('[data-delete-button]')) return;
      
      // Ne pas fermer si on clique à l'intérieur du nœud
      if (target.closest('[data-node-container]')) return;
      
      // Fermer dans tous les autres cas
      setIsSelected(false);
    };
    
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isSelected]);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Fermer si on clique en dehors du dropdown container
      if (!target.closest('[data-template-dropdown-container]')) {
        setIsTemplateDropdownOpen(false);
      }
    };
    
    if (isTemplateDropdownOpen) {
      // Utiliser capture pour s'assurer que l'événement est capturé avant les autres handlers
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isTemplateDropdownOpen]);

  // Fermer le dropdown avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTemplateDropdownOpen) {
        setIsTemplateDropdownOpen(false);
      }
    };
    
    if (isTemplateDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isTemplateDropdownOpen]);

  return (
    <div className="flex flex-col items-center relative" data-node-container>
      {/* Handle d'entrée - toujours visible car ce node est créé connecté */}
      <Handle
        type="target"
        position={Position.Top}
        id="b"
        style={{
          background: '#9ca3af',
          width: 8,
          height: 8,
          top: -4
        }}
      />

      {/* Handle de sortie - visible seulement si connecté */}
      {data.hasOutgoingConnection && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="c"
          style={{
            background: '#9ca3af',
            width: 8,
            height: 8,
            bottom: -4
          }}
        />
      )}

      {/* Icône de suppression ou boutons de confirmation */}
      {isSelected && !showDeleteConfirmation && (
        <button
          onClick={handleDeleteNode}
          data-delete-button
          className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}

      {/* Boutons de confirmation de suppression */}
      {isSelected && showDeleteConfirmation && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          <button
            onClick={handleCancelDelete}
            data-delete-button
            className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={handleConfirmDelete}
            data-delete-button
            className="w-7 h-7 bg-red-500 border border-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Node principal Clay style avec largeur fixe */}
      <div 
        className={`bg-white rounded p-4 w-[400px] border-2 cursor-pointer hover:border-purple-300 transition-all ${
          isSelected 
            ? 'border-purple-400 shadow-md' 
            : 'border-gray-200 shadow-sm'
        }`}
        onClick={handleNodeClick}
      >
        {/* Header du node Clay style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-green-100 rounded flex items-center justify-center">
              <Edit className="w-3.5 h-3.5 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Draft Follow-up</h3>
          </div>
          {data.stepNumber && (
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
               <span className="text-xs text-gray-500">step{data.stepNumber}</span>
            </div>
          )}
        </div>

        {/* Recipients */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Recipients</label>
          <div className="border border-gray-300 bg-white p-2.5 rounded">
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  <span>{recipient}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRecipient(recipient);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRecipient();
                  }
                }}
                placeholder="Add email..."
                className="text-xs border-none outline-none bg-transparent text-gray-500 placeholder-gray-400 min-w-20 flex-1"
              />
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Select template
          </label>
          <div className="relative" data-template-dropdown-container>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTemplateDropdownOpen(!isTemplateDropdownOpen);
              }}
              className="w-full px-2.5 py-1.5 border border-gray-300 bg-white text-xs text-left focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span className="text-gray-900">{selectedTemplate}</span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isTemplateDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isTemplateDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 shadow-lg z-50 max-h-48 overflow-y-auto">
                {templateTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateChange(type.label);
                      setIsTemplateDropdownOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-gray-100 transition-colors text-gray-900 border-none bg-transparent"
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inserted Steps */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Inserted steps</label>
          <div className="border border-gray-300 bg-white p-2.5 rounded">
            <div className="flex flex-wrap gap-2">
              {insertedSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  <span>{step}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStep(step);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
                placeholder="Add step output (e.g., step1.output)..."
                className="text-xs border-none outline-none bg-transparent text-gray-500 placeholder-gray-400 min-w-32 flex-1"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Body</label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.openAIRewriteSidebar) {
                  data.openAIRewriteSidebar(body, "Draft Follow-up", (newBody: string) => {
                    setBody(newBody);
                  });
                }
              }}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Rewrite with AI
            </button>
          </div>
          
          <div className="relative">
            {isEditingBody ? (
              <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={handleBlurBody}
                onKeyDown={handleKeyDownBody}
                className="w-full h-32 p-3 text-xs border border-purple-400 rounded resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 font-mono text-gray-800"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
                placeholder="Enter email body..."
              />
            ) : (
              <div
                onClick={handleEditBody}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                className="p-3 bg-gray-50 border border-gray-300 rounded cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[128px] relative"
              >
                {body ? (
                  <div 
                    className="text-xs text-gray-800 leading-relaxed font-mono select-text whitespace-pre-wrap" 
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {renderTextWithVariables(body)}
                  </div>
                ) : (
                  <p 
                    className="text-xs text-gray-400 leading-relaxed font-mono italic" 
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                  >
                    Enter email body...
                  </p>
                )}
              </div>
            )}
            
            {/* Variables and Examples button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Variables and Examples clicked');
              }}
              className="absolute bottom-2 right-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm px-2 py-1 rounded transition-colors"
            >
              Variables and Examples
            </button>
          </div>
        </div>
      </div>

      {/* CTA button Clay style - seulement si pas de connexion */}
      {!data.hasOutgoingConnection && (
        <div className="mt-4">
          <button 
            ref={buttonRef}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-3 py-2 font-medium rounded-md flex items-center justify-center transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            onClick={handleAddNode}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Types de nodes personnalisés - définis en dehors du composant
const nodeTypes = {
  workflowStarter: WorkflowStarterNode,
  search: SearchNode,
  extractQuestions: ExtractQuestionsNode,
  summariseCall: SummariseCallNode,
  condition: ConditionNode,
  reviewBeforeProceeding: ReviewBeforeProceedingNode,
  emailClient: EmailClientNode,
  notifyTeams: NotifyTeamsNode,
  draftFollowUp: DraftFollowUpNode,
};

// Types d'edges personnalisés - définis en dehors du composant
const edgeTypes = {
  custom: CustomEdge,
};

// Composant interne qui utilise useReactFlow
function WorkflowBuilderContent() {
  // Mémoriser les types pour éviter les re-créations
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  // Style global pour les edges pointillées avec animation de flux
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .dashed-edge path {
        stroke-dasharray: 8 4 !important;
        animation: dash-flow 2s linear infinite;
      }
      
      @keyframes dash-flow {
        0% {
          stroke-dashoffset: 12;
        }
        100% {
          stroke-dashoffset: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // État pour la popup d'actions
  const [showActionLibrary, setShowActionLibrary] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | undefined>();
  const [sourceNodeId, setSourceNodeId] = useState<string | undefined>();
  const [sourceBranch, setSourceBranch] = useState<'yes' | 'no' | undefined>();

  // État pour la popup edge
  const [showEdgePopup, setShowEdgePopup] = useState(false);
  const [edgePopupPosition, setEdgePopupPosition] = useState<{ x: number; y: number } | undefined>();

  // État pour la sidebar AI Rewrite
  const [showAIRewriteSidebar, setShowAIRewriteSidebar] = useState(false);
  const [aiRewritePrompt, setAIRewritePrompt] = useState("");
  const [aiRewriteStepTitle, setAIRewriteStepTitle] = useState("");
  const [aiRewriteCallback, setAIRewriteCallback] = useState<((newPrompt: string) => void) | null>(null);

  // État pour la sidebar Follow-up Settings
  const [showFollowUpSidebar, setShowFollowUpSidebar] = useState(false);
  const [followUpStepTitle, setFollowUpStepTitle] = useState("");
  const [followUpCallback, setFollowUpCallback] = useState<((settings: FollowUpSetting[]) => void) | null>(null);

  // État pour la sidebar Task Settings
  const [showTaskSidebar, setShowTaskSidebar] = useState(false);
  const [taskStepTitle, setTaskStepTitle] = useState("");
  const [taskCallback, setTaskCallback] = useState<((settings: TaskSetting[]) => void) | null>(null);
  const [taskInitialRecipients, setTaskInitialRecipients] = useState<string[]>([]);

  // Fonction pour calculer les numéros de steps basés sur l'ordre topologique
  const calculateStepNumbers = (nodes: Node[], edges: Edge[]) => {
    console.log('=== Calcul des numéros de steps ===');
    console.log('Nodes:', nodes.map(n => ({ id: n.id, type: n.type })));
    console.log('Edges:', edges.map(e => ({ id: e.id, source: e.source, target: e.target })));
    
    const stepNumbers: { [nodeId: string]: number } = {};
    
    // Trouver le node starter (input)
    const starterNode = nodes.find(node => node.type === 'workflowStarter');
    if (!starterNode) {
      console.log('Aucun node starter trouvé');
      return stepNumbers;
    }
    
    console.log('Node starter trouvé:', starterNode.id);
    
    // Construire un graphe d'adjacence
    const adjacencyList: { [nodeId: string]: string[] } = {};
    const inDegree: { [nodeId: string]: number } = {};
    
    // Initialiser tous les nodes
    nodes.forEach(node => {
      adjacencyList[node.id] = [];
      inDegree[node.id] = 0;
    });
    
    // Construire le graphe
    edges.forEach(edge => {
      adjacencyList[edge.source].push(edge.target);
      inDegree[edge.target]++;
    });
    
    console.log('Graphe d\'adjacence:', adjacencyList);
    console.log('Degrés entrants:', inDegree);
    
    // Tri topologique avec BFS pour assigner les numéros de steps
    const queue: string[] = [];
    const levels: { [nodeId: string]: number } = {};
    
    // Commencer par le starter (niveau 0, pas de step number)
    queue.push(starterNode.id);
    levels[starterNode.id] = 0;
    
    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      const currentLevel = levels[currentNode];
      
      console.log(`Traitement du node ${currentNode} au niveau ${currentLevel}`);
      
      // Traiter tous les nodes adjacents
      adjacencyList[currentNode].forEach(neighbor => {
        // Le niveau du voisin est au moins currentLevel + 1
        if (levels[neighbor] === undefined) {
          levels[neighbor] = currentLevel + 1;
          queue.push(neighbor);
          console.log(`  -> ${neighbor} assigné au niveau ${currentLevel + 1}`);
        } else {
          // Si le voisin a déjà un niveau, prendre le maximum
          const newLevel = Math.max(levels[neighbor], currentLevel + 1);
          if (newLevel > levels[neighbor]) {
            levels[neighbor] = newLevel;
            console.log(`  -> ${neighbor} niveau mis à jour vers ${newLevel}`);
          }
        }
      });
    }
    
    console.log('Niveaux calculés:', levels);
    
    // Convertir les niveaux en numéros de steps (en excluant le starter)
    Object.keys(levels).forEach(nodeId => {
      if (nodeId !== starterNode.id && levels[nodeId] > 0) {
        stepNumbers[nodeId] = levels[nodeId];
      }
    });
    
    console.log('Steps avant normalisation:', stepNumbers);
    
    // Renormaliser les numéros de steps pour qu'ils soient consécutifs
    const sortedSteps = Object.entries(stepNumbers)
      .sort(([, a], [, b]) => a - b)
      .map(([nodeId]) => nodeId);
    
    const normalizedStepNumbers: { [nodeId: string]: number } = {};
    sortedSteps.forEach((nodeId, index) => {
      normalizedStepNumbers[nodeId] = index + 1;
    });
    
    console.log('Steps après normalisation:', normalizedStepNumbers);
    console.log('=== Fin du calcul des steps ===');
    
    return normalizedStepNumbers;
  };

  // Position centrée horizontalement et dans la partie haute du canvas
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'workflowStarter',
      position: { x: 550, y: 100 },
      data: {
        onAddNode: (position: { x: number; y: number }) => {
          setPopupPosition(position);
          setSourceNodeId('1');
          setShowActionLibrary(true);
        },
        hasConnection: false
      }
    }
  ];

  const initialEdges: Edge[] = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Hook pour contrôler la caméra React Flow
  const { setCenter } = useReactFlow();

  // Fonction pour centrer la caméra sur un nouveau node
  const centerOnNewNode = (nodeId: string, nodePosition?: { x: number; y: number }, nodeType?: string) => {
    setTimeout(() => {
      if (nodePosition) {
        // Calculer la hauteur estimée du node pour centrer correctement
        const estimatedHeight = getNodeEstimatedHeight(nodeType || 'default');
        
        // Centrer sur le milieu du node (position + moitié de la hauteur)
        const centerX = nodePosition.x + 150; // Largeur approximative du node / 2
        const centerY = nodePosition.y + (estimatedHeight / 2);
        
        setCenter(centerX, centerY, { zoom: 0.7, duration: 800 });
      } else {
        // Fallback : chercher le node dans l'état actuel
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          const estimatedHeight = getNodeEstimatedHeight(node.type || 'default');
          const centerX = node.position.x + 150;
          const centerY = node.position.y + (estimatedHeight / 2);
          setCenter(centerX, centerY, { zoom: 0.7, duration: 800 });
        }
      }
    }, 100); // Petit délai pour s'assurer que le node est ajouté au DOM
  };

  // Écouter les clics sur les edges
  useEffect(() => {
    const handleEdgeAddClick = (e: CustomEvent) => {
      // Ouvrir EdgeActionPopup (New step/New branch)
      setEdgePopupPosition(e.detail);
      
      // Identifier le node source depuis l'edge cliqué
      if (e.detail.edgeId) {
        const edge = edges.find(edge => edge.id === e.detail.edgeId);
        if (edge) {
          setSourceNodeId(edge.source);
        }
      }
      
      setShowEdgePopup(true);
    };

    window.addEventListener('edgeAddClick', handleEdgeAddClick as EventListener);
    return () => {
      window.removeEventListener('edgeAddClick', handleEdgeAddClick as EventListener);
    };
  }, [edges]);

  // Calculer les numéros de steps et mettre à jour les nodes
  const nodesWithSteps = useMemo(() => {
    console.log('Recalcul des steps et mise à jour des nodes');
    
    const stepNumbers = calculateStepNumbers(nodes, edges);
    console.log('Steps calculés:', stepNumbers);
    
    const updatedNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        stepNumber: stepNumbers[node.id],
        hasOutgoingConnection: edges.some(edge => edge.source === node.id)
      }
    }));
    
    console.log('Nodes avec steps mis à jour:', updatedNodes);
    return updatedNodes;
  }, [nodes, edges]);

  const openAIRewriteSidebar = (prompt: string, stepTitle: string, callback: (newPrompt: string) => void) => {
    setAIRewritePrompt(prompt);
    setAIRewriteStepTitle(stepTitle);
    setAIRewriteCallback(() => callback);
    setShowAIRewriteSidebar(true);
  };

  const closeAIRewriteSidebar = () => {
    setShowAIRewriteSidebar(false);
    setAIRewritePrompt("");
    setAIRewriteStepTitle("");
    setAIRewriteCallback(null);
  };

  const handlePromptUpdate = (newPrompt: string) => {
    if (aiRewriteCallback) {
      aiRewriteCallback(newPrompt);
    }
  };

  const openFollowUpSidebar = (stepTitle: string, callback: (settings: FollowUpSetting[]) => void) => {
    setFollowUpStepTitle(stepTitle);
    setFollowUpCallback(() => callback);
    setShowFollowUpSidebar(true);
  };

  const closeFollowUpSidebar = () => {
    setShowFollowUpSidebar(false);
    setFollowUpStepTitle("");
    setFollowUpCallback(null);
    // Déclencher un événement pour désactiver le toggle
    const toggleEvent = new CustomEvent('followUpSidebarClosed');
    window.dispatchEvent(toggleEvent);
  };

  const handleFollowUpSettingsUpdate = (settings: FollowUpSetting[]) => {
    if (followUpCallback) {
      followUpCallback(settings);
    }
  };

  const openTaskSidebar = (stepTitle: string, initialRecipients: string[], callback: (settings: TaskSetting[]) => void) => {
    setTaskStepTitle(stepTitle);
    setTaskInitialRecipients(initialRecipients);
    setTaskCallback(() => callback);
    setShowTaskSidebar(true);
  };

  const closeTaskSidebar = () => {
    setShowTaskSidebar(false);
    setTaskStepTitle("");
    setTaskInitialRecipients([]);
    setTaskCallback(null);
    // Déclencher un événement pour désactiver le toggle
    const toggleEvent = new CustomEvent('taskSidebarClosed');
    window.dispatchEvent(toggleEvent);
  };

  const handleTaskSettingsUpdate = (settings: TaskSetting[]) => {
    if (taskCallback) {
      taskCallback(settings);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    console.log('Suppression du node:', nodeId);
    
    // Trouver les edges connectées au node à supprimer
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    
    console.log('Edges entrantes:', incomingEdges);
    console.log('Edges sortantes:', outgoingEdges);
    
    // Créer de nouvelles connexions pour reconnecter le flux
    const newEdges: Edge[] = [];
    
    // Pour chaque edge entrante, la connecter à chaque edge sortante
    incomingEdges.forEach(incomingEdge => {
      outgoingEdges.forEach(outgoingEdge => {
        const newEdge: Edge = {
          id: `reconnect-${Date.now()}-${Math.random()}`,
          source: incomingEdge.source,
          sourceHandle: incomingEdge.sourceHandle,
          target: outgoingEdge.target,
          targetHandle: outgoingEdge.targetHandle,
          type: 'custom',
          animated: false,
          // Utiliser le style pointillé pour les reconnexions
          style: { 
            stroke: '#9ca3af', 
            strokeWidth: 2,
            strokeDasharray: '8 4'
          },
          className: 'dashed-edge'
        };
        newEdges.push(newEdge);
        console.log('Nouvelle edge de reconnexion créée:', newEdge);
      });
    });
    
    // Supprimer le node et mettre à jour les edges
    setNodes(prevNodes => {
      const filteredNodes = prevNodes.filter(node => node.id !== nodeId);
      console.log('Nodes après suppression:', filteredNodes);
      return filteredNodes;
    });
    
    setEdges(prevEdges => {
      // Supprimer les edges connectées au node supprimé
      const filteredEdges = prevEdges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      );
      // Ajouter les nouvelles edges de reconnexion
      const finalEdges = [...filteredEdges, ...newEdges];
      console.log('Edges après reconnexion:', finalEdges);
      return finalEdges;
    });
    
    // Les numéros de steps et les connexions seront automatiquement recalculés
    // grâce aux useMemo qui dépendent de nodes et edges
    console.log('Suppression terminée, recalcul automatique des steps en cours...');
  };

  const handleSelectAction = (action: Action) => {
    console.log('Action sélectionnée:', action);
    setShowActionLibrary(false);
    
    // Trouver le node source (celui qui a déclenché l'ajout)
    const sourceNode = sourceNodeId ? nodes.find(node => node.id === sourceNodeId) : nodes[0];
    
    // Calculer la position du nouveau node (en dessous du source)
    let newPosition = { x: 550, y: 400 };
    
    if (sourceNode) {
      // Calculer la position Y la plus basse en tenant compte de la hauteur des nodes
      let maxBottomY = 0;
      nodes.forEach(node => {
        const nodeHeight = getNodeEstimatedHeight(node.type || 'default');
        const nodeBottomY = node.position.y + nodeHeight;
        maxBottomY = Math.max(maxBottomY, nodeBottomY);
      });
      
      // Calculer la position en dessous du source node
      const sourceNodeHeight = getNodeEstimatedHeight(sourceNode.type || 'default');
      const belowSourceY = sourceNode.position.y + sourceNodeHeight + 150; // 150px d'espacement très généreux
      
      // Prendre la position la plus basse entre les deux options
      const finalY = Math.max(belowSourceY, maxBottomY + 150);
      
      newPosition = {
        x: sourceNode.position.x,
        y: finalY
      };
    }
    
    setPopupPosition(undefined);
    setSourceNodeId(undefined);
    setSourceBranch(undefined);
    
    // Ajouter le nouveau node selon l'action sélectionnée
    if (action.id === 'extract-data' || action.id === 'extract-data-cat') {
      const newNodeId = `extract-questions-${Date.now()}`;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'extractQuestions',
        position: newPosition,
        data: {
          onAddNode: (position: { x: number; y: number }) => {
            setPopupPosition(position);
            setSourceNodeId(newNodeId);
            setShowActionLibrary(true);
          },
          hasConnection: false,
          openAIRewriteSidebar: openAIRewriteSidebar,
          onDeleteNode: handleDeleteNode,
          nodeId: newNodeId
        }
      };
      
      // Ajouter une connexion depuis le node source avec le bon handle
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: sourceNode!.id,
        sourceHandle: sourceBranch || undefined, // Utiliser la branche sélectionnée comme handle source
        target: newNodeId,
        type: 'custom',
        animated: false,
        style: { 
          stroke: '#9ca3af', 
          strokeWidth: 2
        }
      };
      
      // Mettre à jour le node source pour marquer qu'il a une connexion
      const updatedNodes = nodes.map(node => 
        node.id === sourceNode!.id 
          ? { ...node, data: { ...node.data, hasConnection: true } }
          : node
      );
      
      // Mettre à jour les nodes et edges
      setNodes([...updatedNodes, newNode]);
      setEdges([...edges, newEdge]);
      
      // Centrer la caméra sur le nouveau node
      centerOnNewNode(newNodeId, newPosition, 'extractQuestions');
    } else if (action.id === 'summarise-call' || action.id === 'summarise-call-cat') {
      const newNodeId = `summarise-call-${Date.now()}`;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'summariseCall',
        position: newPosition,
        data: {
          onAddNode: (position: { x: number; y: number }) => {
            setPopupPosition(position);
            setSourceNodeId(newNodeId);
            setShowActionLibrary(true);
          },
          hasConnection: false,
          openAIRewriteSidebar: openAIRewriteSidebar,
          onDeleteNode: handleDeleteNode,
          nodeId: newNodeId
        }
      };
      
      // Ajouter une connexion depuis le node source avec le bon handle
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: sourceNode!.id,
        sourceHandle: sourceBranch || undefined, // Utiliser la branche sélectionnée comme handle source
        target: newNodeId,
        type: 'custom',
        animated: false,
        style: { 
          stroke: '#9ca3af', 
          strokeWidth: 2
        }
      };
      
      // Mettre à jour le node source pour marquer qu'il a une connexion
      const updatedNodes = nodes.map(node => 
        node.id === sourceNode!.id 
          ? { ...node, data: { ...node.data, hasConnection: true } }
          : node
      );
      
      // Mettre à jour les nodes et edges
      setNodes([...updatedNodes, newNode]);
      setEdges([...edges, newEdge]);
      
      // Centrer la caméra sur le nouveau node
      centerOnNewNode(newNodeId, newPosition, 'summariseCall');
    } else if (action.id === 'condition') {
      const newNodeId = `condition-${Date.now()}`;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'condition',
        position: newPosition,
        data: {
          onAddNode: (position: { x: number; y: number }, branch?: 'yes' | 'no') => {
            setPopupPosition(position);
            setSourceNodeId(newNodeId);
            setSourceBranch(branch);
            setShowActionLibrary(true);
          },
          hasConnection: false
        }
      };
      
      // Ajouter une connexion depuis le node source avec le bon handle
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: sourceNode!.id,
        sourceHandle: sourceBranch || undefined, // Utiliser la branche sélectionnée comme handle source
        target: newNodeId,
        type: 'custom',
        animated: false,
        style: { 
          stroke: '#9ca3af', 
          strokeWidth: 2
        }
      };
      
      // Mettre à jour le node source pour marquer qu'il a une connexion
      const updatedNodes = nodes.map(node => 
        node.id === sourceNode!.id 
          ? { ...node, data: { ...node.data, hasConnection: true } }
          : node
      );
      
      // Mettre à jour les nodes et edges
      setNodes([...updatedNodes, newNode]);
      setEdges([...edges, newEdge]);
      
      // Centrer la caméra sur le nouveau node
      centerOnNewNode(newNodeId, newPosition, 'condition');
    } else if (action.id === 'review-before-proceeding') {
      const newNodeId = `review-before-proceeding-${Date.now()}`;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'reviewBeforeProceeding',
        position: newPosition,
        data: {
          onAddNode: (position: { x: number; y: number }, branch?: 'decline' | 'accept') => {
            setPopupPosition(position);
            setSourceNodeId(newNodeId);
            setSourceBranch(branch as 'yes' | 'no' | undefined);
            setShowActionLibrary(true);
          },
          hasConnection: false
        }
      };
      
      // Ajouter une connexion depuis le node source avec le bon handle
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: sourceNode!.id,
        sourceHandle: sourceBranch || undefined, // Utiliser la branche sélectionnée comme handle source
        target: newNodeId,
        type: 'custom',
        animated: false,
        style: { 
          stroke: '#9ca3af', 
          strokeWidth: 2
        }
      };
      
      // Mettre à jour le node source pour marquer qu'il a une connexion
      const updatedNodes = nodes.map(node => 
        node.id === sourceNode!.id 
          ? { ...node, data: { ...node.data, hasConnection: true } }
          : node
      );
      
      // Mettre à jour les nodes et edges
      setNodes([...updatedNodes, newNode]);
      setEdges([...edges, newEdge]);
      
      // Centrer la caméra sur le nouveau node
      centerOnNewNode(newNodeId, newPosition, 'reviewBeforeProceeding');
    } else if (action.id === 'search') {
      // Créer un node Search
      const newNodeId = `search-${Date.now()}`;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'search',
        position: newPosition,
        data: {
          onAddNode: (position: { x: number; y: number }) => {
            setPopupPosition(position);
            setSourceNodeId(newNodeId);
            setShowActionLibrary(true);
          },
          hasConnection: false,
          openAIRewriteSidebar: openAIRewriteSidebar,
          onDeleteNode: handleDeleteNode,
          nodeId: newNodeId,
          actionTitle: 'Search'
        }
      };
      
      // Ajouter une connexion depuis le node source avec le bon handle
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: sourceNode!.id,
        sourceHandle: sourceBranch || undefined,
        target: newNodeId,
        type: 'custom',
        animated: false,
        style: { 
          stroke: '#9ca3af', 
          strokeWidth: 2
        }
      };
      
      // Mettre à jour le node source pour marquer qu'il a une connexion
      const updatedNodes = nodes.map(node => 
        node.id === sourceNode!.id 
          ? { ...node, data: { ...node.data, hasConnection: true } }
          : node
      );
      
      // Mettre à jour les nodes et edges
      setNodes([...updatedNodes, newNode]);
      setEdges([...edges, newEdge]);
      
      // Centrer la caméra sur le nouveau node
      centerOnNewNode(newNodeId, newPosition, 'search');
    } else if (action.id === 'email-client') {
      const newNodeId = `email-client-${Date.now()}`;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'emailClient',
        position: newPosition,
        data: {
          onAddNode: (position: { x: number; y: number }) => {
            setPopupPosition(position);
            setSourceNodeId(newNodeId);
            setShowActionLibrary(true);
          },
          hasConnection: false,
          openAIRewriteSidebar: openAIRewriteSidebar,
          onDeleteNode: handleDeleteNode,
          nodeId: newNodeId
        }
      };
      
      // Ajouter une connexion depuis le node source avec le bon handle
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: sourceNode!.id,
        sourceHandle: sourceBranch || undefined,
        target: newNodeId,
        type: 'custom',
        animated: false,
        style: { 
          stroke: '#9ca3af', 
          strokeWidth: 2
        }
      };
      
      // Mettre à jour le node source pour marquer qu'il a une connexion
      const updatedNodes = nodes.map(node => 
        node.id === sourceNode!.id 
          ? { ...node, data: { ...node.data, hasConnection: true } }
          : node
      );
      
      // Mettre à jour les nodes et edges
      setNodes([...updatedNodes, newNode]);
      setEdges([...edges, newEdge]);
      
      // Centrer la caméra sur le nouveau node
      centerOnNewNode(newNodeId, newPosition, 'emailClient');
    } else if (action.id === 'notify-team') {
      const newNodeId = `notify-team-${Date.now()}`;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'notifyTeams',
        position: newPosition,
        data: {
          onAddNode: (position: { x: number; y: number }) => {
            setPopupPosition(position);
            setSourceNodeId(newNodeId);
            setShowActionLibrary(true);
          },
          hasConnection: false,
          openAIRewriteSidebar: openAIRewriteSidebar,
          openFollowUpSidebar: openFollowUpSidebar,
          openTaskSidebar: openTaskSidebar,
          onDeleteNode: handleDeleteNode,
          nodeId: newNodeId
        }
      };
      
      // Ajouter une connexion depuis le node source avec le bon handle
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: sourceNode!.id,
        sourceHandle: sourceBranch || undefined,
        target: newNodeId,
        type: 'custom',
        animated: false,
        style: { 
          stroke: '#9ca3af', 
          strokeWidth: 2
        }
      };
      
      // Mettre à jour le node source pour marquer qu'il a une connexion
      const updatedNodes = nodes.map(node => 
        node.id === sourceNode!.id 
          ? { ...node, data: { ...node.data, hasConnection: true } }
          : node
      );
      
      // Mettre à jour les nodes et edges
      setNodes([...updatedNodes, newNode]);
      setEdges([...edges, newEdge]);
      
      // Centrer la caméra sur le nouveau node
      centerOnNewNode(newNodeId, newPosition, 'notifyTeams');
    } else if (action.id === 'draft-follow-up') {
      const newNodeId = `draft-follow-up-${Date.now()}`;
      
      const newNode: Node = {
        id: newNodeId,
        type: 'draftFollowUp',
        position: newPosition,
        data: {
          onAddNode: (position: { x: number; y: number }) => {
            setPopupPosition(position);
            setSourceNodeId(newNodeId);
            setShowActionLibrary(true);
          },
          hasConnection: false,
          openAIRewriteSidebar: openAIRewriteSidebar,
          onDeleteNode: handleDeleteNode,
          nodeId: newNodeId
        }
      };
      
      // Ajouter une connexion depuis le node source avec le bon handle
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: sourceNode!.id,
        sourceHandle: sourceBranch || undefined, // Utiliser la branche sélectionnée comme handle source
        target: newNodeId,
        type: 'custom',
        animated: false,
        style: { 
          stroke: '#9ca3af', 
          strokeWidth: 2
        }
      };
      
      // Mettre à jour le node source pour marquer qu'il a une connexion
      const updatedNodes = nodes.map(node => 
        node.id === sourceNode!.id 
          ? { ...node, data: { ...node.data, hasConnection: true } }
          : node
      );
      
      // Mettre à jour les nodes et edges
      setNodes([...updatedNodes, newNode]);
      setEdges([...edges, newEdge]);
      
      // Centrer la caméra sur le nouveau node
      centerOnNewNode(newNodeId, newPosition, 'draftFollowUp');
    }
    
    // Fermer la popup
    setShowActionLibrary(false);
    setPopupPosition(undefined);
    setSourceNodeId(undefined);
    setSourceBranch(undefined);
  };

  const handleSelectEdgeOption = (option: 'new-step' | 'new-branch' | string) => {
    console.log('Option edge sélectionnée:', option);
    setShowEdgePopup(false);
    setEdgePopupPosition(undefined);
    
    // Si c'est une action avec contexte (new-step: ou new-branch:)
    if (option.startsWith('new-step:') || option.startsWith('new-branch:')) {
      const [actionType, actionId] = option.split(':');
      console.log(`Action ${actionId} sélectionnée pour ${actionType}`);
      
      // Mapper les actions vers les types de nodes appropriés
      if (actionId === 'summarise-call' || actionId === 'summarise-call-cat') {
        const action: Action = { id: 'summarise-call', title: 'Summarise call', icon: Bookmark };
        
        if (actionType === 'new-step') {
          // Créer une nouvelle étape dans le flux existant
          handleSelectAction(action);
        } else if (actionType === 'new-branch') {
          // Créer une nouvelle branche depuis le node source
          handleSelectActionForBranch(action);
        }
      } else if (actionId === 'extract-data' || actionId === 'extract-data-cat') {
        const action: Action = { id: 'extract-data', title: 'Extract Data', icon: Zap };
        
        if (actionType === 'new-step') {
          handleSelectAction(action);
        } else if (actionType === 'new-branch') {
          handleSelectActionForBranch(action);
        }
      } else {
        // Pour les autres actions
        if (actionType === 'new-step') {
          handleSelectActionFromEdge(actionId);
        } else if (actionType === 'new-branch') {
          handleSelectActionFromEdgeForBranch(actionId);
        }
      }
    }
    // Ancienne logique pour compatibilité
    else if (option.startsWith('action:')) {
      const actionId = option.replace('action:', '');
      
      // Mapper les actions vers les types de nodes appropriés
      if (actionId === 'summarise-call' || actionId === 'summarise-call-cat') {
        const action: Action = { id: 'summarise-call', title: 'Summarise call', icon: Bookmark };
        handleSelectAction(action);
      } else if (actionId === 'extract-data' || actionId === 'extract-data-cat') {
        const action: Action = { id: 'extract-data', title: 'Extract Data', icon: Zap };
        handleSelectAction(action);
      } else {
        // Pour les autres actions, utiliser l'ancienne logique
        handleSelectActionFromEdge(actionId);
      }
    } else if (option === 'close') {
      // Fermer la popup
      return;
    }
    // Sinon, logique pour new-step ou new-branch
  };

  const handleSelectActionFromEdge = (actionTitle: string) => {
    console.log('Action sélectionnée depuis edge:', actionTitle);
    console.log('Nodes actuels:', nodes);
    setShowEdgePopup(false);
    setEdgePopupPosition(undefined);
    
    // Créer un nouveau nœud basé sur l'action sélectionnée
    const newNodeId = `action-${Date.now()}`;
    
    // Calculer la position en symétrie (à droite du nœud existant)
    const existingNode = nodes.find(node => node.type === 'extractQuestions');
    console.log('Nœud existant trouvé:', existingNode);
    
    // Position de base : si pas de nœud existant, utiliser une position par défaut
    let baseX = 950; // Position par défaut à droite
    let baseY = 400; // Position par défaut
    
    if (existingNode) {
      baseX = existingNode.position.x + 450; // Position à droite du node existant
      baseY = existingNode.position.y; // Même hauteur
    } else {
      // Si pas de node existant, calculer la position en dessous du dernier node
      let maxBottomY = 0;
      nodes.forEach(node => {
        const nodeHeight = getNodeEstimatedHeight(node.type || 'default');
        const nodeBottomY = node.position.y + nodeHeight;
        maxBottomY = Math.max(maxBottomY, nodeBottomY);
      });
      baseY = maxBottomY + 150; // 150px d'espacement très généreux
    }
    
    console.log('Position calculée:', { x: baseX, y: baseY });
    
    // Déterminer le type de node selon l'action
    let nodeType = 'extractQuestions'; // Type par défaut
    let nodeData: Record<string, unknown> = {
        onAddNode: (position: { x: number; y: number }) => {
          setPopupPosition(position);
          setSourceNodeId(newNodeId);
          setShowActionLibrary(true);
        },
        hasConnection: false,
        actionTitle: actionTitle // Passer le titre de l'action
    };

    // Mapper les actions vers les types de nodes appropriés
    if (actionTitle === 'Email Client') {
      nodeType = 'emailClient';
      nodeData = {
        ...nodeData,
        openAIRewriteSidebar: openAIRewriteSidebar,
        onDeleteNode: handleDeleteNode,
        nodeId: newNodeId
      };
    } else if (actionTitle === 'Notify Team') {
      nodeType = 'notifyTeams';
      nodeData = {
        ...nodeData,
        openAIRewriteSidebar: openAIRewriteSidebar,
        openFollowUpSidebar: openFollowUpSidebar,
        onDeleteNode: handleDeleteNode,
        nodeId: newNodeId
      };
    } else if (actionTitle === 'Draft Follow-up') {
      nodeType = 'draftFollowUp';
      nodeData = {
        ...nodeData,
        openAIRewriteSidebar: openAIRewriteSidebar,
        onDeleteNode: handleDeleteNode,
        nodeId: newNodeId
      };
    }

    const newNode: Node = {
      id: newNodeId,
      type: nodeType,
      position: { x: baseX, y: baseY },
      data: nodeData
    };
    
    console.log('Nouveau nœud créé:', newNode);
    
    // Créer une connexion depuis le premier nœud (starter)
    const starterNode = nodes.find(node => node.type === 'workflowStarter');
    console.log('Nœud starter trouvé:', starterNode);
    
    if (starterNode) {
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: starterNode.id,
        target: newNodeId,
        type: 'custom',
        animated: false,
        style: { 
          stroke: '#9ca3af', 
          strokeWidth: 2
        }
      };
      
      console.log('Nouvelle edge créée:', newEdge);
      
      // Ajouter le nouveau nœud et edge
      setNodes(prevNodes => {
        const newNodes = [...prevNodes, newNode];
        console.log('Nouveaux nodes après ajout:', newNodes);
        return newNodes;
      });
      setEdges(prevEdges => {
        const newEdges = [...prevEdges, newEdge];
        console.log('Nouvelles edges après ajout:', newEdges);
        return newEdges;
      });
      
      // Centrer la caméra sur le nouveau node
      centerOnNewNode(newNodeId, { x: baseX, y: baseY }, nodeType);
    } else {
      console.error('Nœud starter non trouvé !');
    }
  };

  // Fonction pour créer une action en tant que nouvelle branche
  const handleSelectActionForBranch = (action: Action) => {
    console.log('Action sélectionnée pour nouvelle branche:', action);
    // Logique similaire à handleSelectAction mais pour créer une branche
    // Pour l'instant, utiliser la même logique que handleSelectAction
    handleSelectAction(action);
  };

  // Fonction pour créer une action depuis edge en tant que nouvelle branche
  const handleSelectActionFromEdgeForBranch = (actionTitle: string) => {
    console.log('Action sélectionnée depuis edge pour nouvelle branche:', actionTitle);
    // Logique similaire à handleSelectActionFromEdge mais pour créer une branche
    // Pour l'instant, utiliser la même logique que handleSelectActionFromEdge
    handleSelectActionFromEdge(actionTitle);
  };

  return (
    <>
      {/* Zone canvas qui occupe tout l'espace sous le header global */}
      <div className="w-full overflow-hidden bg-white" style={{ height: 'calc(100vh - 48px)' }}>
        <div className="w-full h-full">
          <ReactFlow
            nodes={nodesWithSteps}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={memoizedNodeTypes}
            edgeTypes={memoizedEdgeTypes}
            fitView={false}
            defaultViewport={{ x: 100, y: 50, zoom: 0.8 }}
            minZoom={0.1}
            maxZoom={3}
            style={{ width: '100%', height: '100%' }}
          >
            <Background 
              gap={20}
              size={3}
              color="#e5e7eb"
            />
            <Controls position="bottom-left" />
          </ReactFlow>
        </div>
      </div>

      {/* Popup de librairie d'actions */}
      <ActionLibraryPopup
        isOpen={showActionLibrary}
        onClose={() => {
          setShowActionLibrary(false);
          setPopupPosition(undefined);
          setSourceNodeId(undefined);
          setSourceBranch(undefined);
        }}
        onSelectAction={handleSelectAction}
        position={popupPosition}
      />

      {/* Popup pour New Step / New Branch depuis les edges */}
      <EdgeActionPopup
        isOpen={showEdgePopup}
        onClose={() => {
          setShowEdgePopup(false);
          setEdgePopupPosition(undefined);
        }}
        onSelectOption={handleSelectEdgeOption}
        position={edgePopupPosition}
      />

      {/* Sidebar AI Rewrite */}
      <AIRewriteSidebar
        isOpen={showAIRewriteSidebar}
        onClose={closeAIRewriteSidebar}
        originalPrompt={aiRewritePrompt}
        onPromptUpdate={handlePromptUpdate}
        stepTitle={aiRewriteStepTitle}
      />

      {/* Sidebar Follow-up Settings */}
      <FollowUpSettingsSidebar
        isOpen={showFollowUpSidebar}
        onClose={closeFollowUpSidebar}
        onSettingsUpdate={handleFollowUpSettingsUpdate}
        stepTitle={followUpStepTitle}
      />

      {/* Sidebar Task Settings */}
      <TaskSettingsSidebar
        isOpen={showTaskSidebar}
        onClose={closeTaskSidebar}
        onSettingsUpdate={handleTaskSettingsUpdate}
        stepTitle={taskStepTitle}
        initialRecipients={taskInitialRecipients}
      />
    </>
  );
} 

// Composant principal qui wrappe avec ReactFlowProvider
export default function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent />
    </ReactFlowProvider>
  );
}