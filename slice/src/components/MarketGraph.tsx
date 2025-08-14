"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Search, X, Plus, ArrowLeft, Users, Check } from 'lucide-react';
import MeetingDetailPanel from './MeetingDetailPanel';

interface Company {
  id: string;
  name: string;
  industry: string;
  type: 'target' | 'buyer' | 'neutral';
  revenue: string;
  location: string;
  employees: string;
  lastContact: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  // Propriétés additionnelles pour MeetingDetailPanel
  companyName: string;
  sirenNumber: string;
  nafCode: string;
  ceoAge: number;
  ebe: string;
  matchingScore: "high" | "medium";
  potentialBuyers: number;
}

interface Connection {
  source: string;
  target: string;
  strength: number;
}

// Générer plus de données pour un graphe réaliste
const generateCompanies = (): Company[] => {
    const industries = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Energy', 'Retail', 'Consulting', 'Real Estate'];
    const locations = ['Paris, France', 'Berlin, Germany', 'London, UK', 'Amsterdam, Netherlands', 'Milan, Italy', 'Madrid, Spain', 'Stockholm, Sweden', 'Zurich, Switzerland', 'Vienna, Austria', 'Brussels, Belgium'];
    const companyNames = [
      'TechCorp Industries', 'DataSoft Solutions', 'Global Dynamics', 'Innovation Labs', 'Synergy Partners',
      'MetalWorks Inc', 'CloudTech Systems', 'European Holdings', 'Digital Ventures', 'Industrial Partners',
      'SmartSystems Ltd', 'FutureTech Group', 'Precision Manufacturing', 'HealthCare Solutions', 'Financial Partners',
      'Energy Dynamics', 'Retail Innovations', 'Consulting Excellence', 'Property Ventures', 'Tech Innovations'
    ];
    const companies: Company[] = [];
    
    // Créer 80 entreprises pour un graphe réaliste
    for (let i = 1; i <= 80; i++) {
      const industry = industries[Math.floor(Math.random() * industries.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const revenue = Math.floor(Math.random() * 200) + 5;
      const employees = Math.floor(Math.random() * 1000) + 50;
      
      let type: 'target' | 'buyer' | 'neutral';
      if (i <= 8) type = 'target'; // 8 cibles
      else if (i <= 28) type = 'buyer'; // 20 acheteurs
      else type = 'neutral'; // Le reste en neutre
      
      const baseName = companyNames[Math.floor(Math.random() * companyNames.length)];
      const name = i <= 20 ? baseName : `${baseName} ${i}`;
      
      companies.push({
        id: i.toString(),
        name,
        industry,
        type,
        revenue: `€${revenue}M`,
        location,
        employees: employees.toString(),
        lastContact: `2024-01-${Math.floor(Math.random() * 28) + 1}`,
        // Propriétés additionnelles pour MeetingDetailPanel
        companyName: name,
        sirenNumber: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        nafCode: `${Math.floor(Math.random() * 90) + 10}.${Math.floor(Math.random() * 90) + 10}Z`,
        ceoAge: Math.floor(Math.random() * 25) + 35, // Age entre 35 et 60
        ebe: `€${Math.floor(revenue * 0.15)}M`, // EBE approximatif
        matchingScore: Math.random() > 0.4 ? "high" : "medium",
        potentialBuyers: Math.floor(Math.random() * 15) + 3 // Entre 3 et 18 buyers
      });
    }
    
    return companies;
};

// Générer des connexions entre cibles et acheteurs
const generateConnections = (companiesList: Company[]): Connection[] => {
    const connections: Connection[] = [];
    const targets = companiesList.filter(c => c.type === 'target');
    const buyers = companiesList.filter(c => c.type === 'buyer');
    
    targets.forEach(target => {
      // Chaque cible a 2-5 acheteurs potentiels
      const numBuyers = Math.floor(Math.random() * 4) + 2;
      const shuffledBuyers = [...buyers].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numBuyers && i < shuffledBuyers.length; i++) {
        connections.push({
          source: target.id,
          target: shuffledBuyers[i].id,
          strength: Math.random() * 0.5 + 0.5
        });
      }
    });
    
    return connections;
};

const MarketGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [potentialBuyers, setPotentialBuyers] = useState<Company[]>([]);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [companies] = useState(() => generateCompanies());
  const [connections] = useState(() => generateConnections(companies));
  
  // États pour la gestion des listes
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [listSearchQuery, setListSearchQuery] = useState("");
  const [selectedLists, setSelectedLists] = useState<Set<number>>(new Set());
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListType, setNewListType] = useState<"seller" | "buyer">("seller");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showCreateListNotification, setShowCreateListNotification] = useState(false);
  const [createdLists, setCreatedLists] = useState<Array<{id: number, name: string, count: number, type: "seller" | "buyer"}>>([]);
  const addToListModalRef = useRef<HTMLDivElement>(null);

  // Load created lists from localStorage on mount
  useEffect(() => {
    const savedLists = localStorage.getItem('createdLists');
    if (savedLists) {
      try {
        setCreatedLists(JSON.parse(savedLists));
      } catch (error) {
        console.error('Error loading created lists:', error);
      }
    }
  }, []);

  // Available lists (combining default + created lists)
  const availableLists = useMemo(() => {
    const defaultLists = [
      { id: 1, name: "Tech Prospects", count: 142, type: "seller" as const },
      { id: 2, name: "Manufacturing Targets", count: 89, type: "buyer" as const },
      { id: 3, name: "Healthcare Companies", count: 67, type: "seller" as const },
      { id: 4, name: "Financial Services", count: 34, type: "buyer" as const },
      { id: 5, name: "Retail & E-commerce", count: 156, type: "seller" as const },
      { id: 6, name: "SaaS Startups", count: 78, type: "seller" as const }
    ];
    return [...defaultLists, ...createdLists];
  }, [createdLists]);

  // Filter lists based on search
  const filteredLists = useMemo(() => {
    if (listSearchQuery.trim() === "") {
      return availableLists;
    }
    return availableLists.filter(list =>
      list.name.toLowerCase().includes(listSearchQuery.toLowerCase())
    );
  }, [availableLists, listSearchQuery]);

  const getNodeColor = (company: Company, isSelected: boolean, isPotentialBuyer: boolean) => {
    if (isSelected) return '#3b82f6'; // Blue for selected target
    if (isPotentialBuyer) return '#10b981'; // Green for potential buyers
    
    // Tous les autres nœuds sont gris par défaut
    return '#9ca3af'; // Gray for all non-selected nodes
  };

  const closeSidePanel = useCallback(() => {
    setShowSidePanel(false);
    setIsPanelOpen(false);
    // Garder la cible sélectionnée (bleue) mais supprimer les acheteurs verts
    setPotentialBuyers([]);
  }, []);

  // Fonctions de gestion des listes
  const closeAddToListModal = () => {
    setShowAddToListModal(false);
    setListSearchQuery("");
    setSelectedLists(new Set());
    setShowCreateListForm(false);
    setNewListTitle("");
    setNewListType("seller");
  };

  const toggleListSelection = (listId: number) => {
    setSelectedLists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  };

  const handleConfirmAddToList = () => {
    if (!selectedCompany) return;
    
    console.log('Adding company to lists:', {
      company: selectedCompany.id,
      lists: Array.from(selectedLists)
    });
    
    // Show success notification
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
    
    closeAddToListModal();
  };

  const handleShowCreateForm = () => {
    setShowCreateListForm(true);
  };

  const handleBackToLists = () => {
    setShowCreateListForm(false);
    setNewListTitle("");
    setNewListType("seller");
  };

  const handleCreateNewList = () => {
    if (newListTitle.trim()) {
      const newId = Math.max(...availableLists.map(l => l.id), 0) + 1;
      const newList = {
        id: newId,
        name: newListTitle.trim(),
        count: 0,
        type: newListType
      };
      
      setCreatedLists(prev => {
        const updatedLists = [...prev, newList];
        // Persist to localStorage for sync with /lists page
        localStorage.setItem('createdLists', JSON.stringify(updatedLists));
        return updatedLists;
      });
      
      // Show success notification for list creation
      setShowCreateListNotification(true);
      setTimeout(() => setShowCreateListNotification(false), 3000);
      
      // Reset form and go back to list selection
      setNewListTitle("");
      setNewListType("seller");
      setShowCreateListForm(false);
    }
  };

  const handleNodeClick = useCallback((company: Company) => {
    console.log('Node clicked:', company);
    console.log('Selected company:', selectedCompany);
    console.log('Show side panel:', showSidePanel);
    
    // Seulement permettre le clic sur LA target company (nœud bleu)
    if (company.type !== 'target' || !selectedCompany || company.id !== selectedCompany.id) {
      console.log('Click ignored - not the selected target');
      return;
    }
    
    console.log('Valid target click - toggling panel');
    
    // Clic sur la target company : toggle du panel et des acheteurs
    if (showSidePanel) {
      // Si le panel est ouvert, le fermer (garder le nœud bleu)
      console.log('Closing panel');
      closeSidePanel();
    } else {
      // Si le panel est fermé, l'ouvrir avec les acheteurs verts
      console.log('Opening panel');
      const buyerIds = connections
        .filter(conn => conn.source === company.id)
        .map(conn => conn.target);

      const buyers = companies.filter(c => buyerIds.includes(c.id) && c.type === 'buyer');
      console.log('Found buyers:', buyers);
      setPotentialBuyers(buyers);
      setShowSidePanel(true);
      setIsPanelOpen(true);
    }
  }, [selectedCompany, showSidePanel, connections, companies, closeSidePanel]);

  // Close with Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAddToListModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addToListModalRef.current && !addToListModalRef.current.contains(e.target as Node)) {
        closeAddToListModal();
      }
    };
    if (showAddToListModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddToListModal]);

  // Pré-sélectionner une cible au chargement (sans ouvrir le panel)
  useEffect(() => {
    if (selectedCompany) return; // Déjà sélectionnée
    
    const firstTarget = companies.find(c => c.type === 'target');
    if (firstTarget) {
      console.log('Pre-selecting target:', firstTarget);
      setSelectedCompany(firstTarget);
      setShowSidePanel(false);
      setPotentialBuyers([]);
    }
  }, [companies, selectedCompany]);

  // Effect séparé pour mettre à jour les couleurs quand la sélection change
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const container = svg.select('g');
    
    if (container.empty()) return;
    
    // Mettre à jour les couleurs des nœuds
    container.selectAll('g')
      .select('circle')
      .transition()
      .duration(300)
      .attr('fill', (d: Company) => {
        // Vérifier que d existe avant de l'utiliser
        if (!d || !d.id) {
          return '#9ca3af'; // Couleur grise par défaut
        }
        return getNodeColor(d, 
          selectedCompany?.id === d.id,
          potentialBuyers.some(buyer => buyer.id === d.id)
        );
      });

    // Mettre à jour les curseurs
    container.selectAll('g')
      .attr('cursor', (d: Company) => {
        // Vérifier que d existe et a les propriétés nécessaires
        if (!d || !d.type || !d.id) {
          return 'move';
        }
        // Seule la target company sélectionnée est cliquable
        if (d.type === 'target' && selectedCompany && d.id === selectedCompany.id) {
          return 'pointer';
        }
        return 'move';
      });

    // Mettre à jour l'opacité des liens
    container.selectAll('line')
      .transition()
      .duration(300)
      .attr('stroke-opacity', (d: Connection) => 
        selectedCompany && d.source === selectedCompany.id ? 0.4 : 0
      );
  }, [selectedCompany, potentialBuyers]);

  useEffect(() => {
    if (!svgRef.current) return;
    
    console.log('D3 useEffect running - creating graph');

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1200;
    const height = 800;

    svg.attr('width', width).attr('height', height);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    const container = svg.append('g');

    // Position initiale des nœuds en forme ovale
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = width * 0.35; // Rayon horizontal de l'ovale
    const radiusY = height * 0.3; // Rayon vertical de l'ovale

    companies.forEach((company, i) => {
      const angle = (i / companies.length) * 2 * Math.PI;
      const randomRadius = 0.7 + Math.random() * 0.6; // Variation du rayon pour dispersion
      company.x = centerX + Math.cos(angle) * radiusX * randomRadius + (Math.random() - 0.5) * 100;
      company.y = centerY + Math.sin(angle) * radiusY * randomRadius + (Math.random() - 0.5) * 80;
    });

    // Create force simulation - plus faible pour maintenir la forme
    const simulation = d3.forceSimulation(companies)
      .force('charge', d3.forceManyBody().strength(-50)) // Force plus faible
      .force('collision', d3.forceCollide().radius(25))
      .force('center', d3.forceCenter(centerX, centerY).strength(0.1)) // Force de centrage très faible
      .alphaDecay(0.05) // Ralentir la simulation
      .velocityDecay(0.8); // Plus de friction

    // Create links - masquées par défaut
    const link = container.append('g')
      .selectAll('line')
      .data(connections)
      .enter().append('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0)
      .attr('stroke-width', 1);

    // Create nodes
    const node = container.append('g')
      .selectAll('g')
      .data(companies)
      .enter().append('g')
      .attr('cursor', 'move')
      .call(d3.drag<SVGGElement, Company>()
        .on('start', (event, d) => {
          // Ne pas redémarrer la simulation lors du drag
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          // Libérer les positions fixes après le drag
          d.fx = null;
          d.fy = null;
        }));

    // Add circles for nodes - plus gros
    node.append('circle')
      .attr('r', 18) // Nœuds plus gros
      .attr('fill', (d: Company) => getNodeColor(d, 
        selectedCompany?.id === d.id,
        potentialBuyers.some(buyer => buyer.id === d.id)
      ))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Pas de labels pour un graphe plus épuré

    // Add click handlers
    node.on('click', (event, d) => {
      event.stopPropagation();
      handleNodeClick(d);
    });

    // Update simulation - stopper rapidement
    simulation.on('tick', () => {
      link
        .attr('x1', (d: Connection) => (d.source as Company).x || 0)
        .attr('y1', (d: Connection) => (d.source as Company).y || 0)
        .attr('x2', (d: Connection) => (d.target as Company).x || 0)
        .attr('y2', (d: Connection) => (d.target as Company).y || 0);

      node.attr('transform', (d: Company) => `translate(${d.x},${d.y})`);
    });

    // Stopper la simulation après quelques itérations pour maintenir les positions
    setTimeout(() => {
      simulation.stop();
    }, 2000);



    // Click on background to deselect
    svg.on('click', (event) => {
      // Ne pas fermer si le clic vient du panel ou de ses enfants
      const target = event.target as Element;
      if (target && target.closest('.fixed')) {
        return;
      }
      
      if (selectedCompany) {
        closeSidePanel();
      }
    });

    return () => {
      simulation.stop();
    };
  }, [handleNodeClick, closeSidePanel]);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      {/* Légende */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-gray-200/50 p-4 z-10">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-xs text-gray-600">Companies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Selected Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Potential Buyer</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">Click on targets to see potential buyers</p>
        </div>
      </div>

      {/* Graphe SVG */}
      <svg ref={svgRef} className="w-full h-full"></svg>

      {/* MeetingDetailPanel remplace l'ancien panel */}
      <MeetingDetailPanel
        isOpen={isPanelOpen}
        onClose={closeSidePanel}
        meetingData={selectedCompany ? {
          id: parseInt(selectedCompany.id),
          companyName: selectedCompany.companyName,
          sirenNumber: selectedCompany.sirenNumber,
          nafCode: selectedCompany.nafCode,
          location: selectedCompany.location,
          ceoAge: selectedCompany.ceoAge,
          employees: selectedCompany.employees,
          revenue: selectedCompany.revenue,
          ebe: selectedCompany.ebe,
          matchingScore: selectedCompany.matchingScore,
          potentialBuyers: selectedCompany.potentialBuyers
        } : null}
        panelType="summary"
        onAddToList={(companyId) => {
          console.log('Add to list clicked for company:', companyId);
          setShowAddToListModal(true);
        }}
      />

      {/* Add to List Modal */}
      {showAddToListModal && (
        <>
          {/* Overlay with blur */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={closeAddToListModal} />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              ref={addToListModalRef}
              data-modal="add-to-list"
              className="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[70vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {showCreateListForm && (
                      <button
                        onClick={handleBackToLists}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    )}
                    <h3 className="text-base font-medium text-gray-900">
                      {showCreateListForm ? "Create new list" : "Add to list"}
                    </h3>
                  </div>
                  <button
                    onClick={closeAddToListModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Content - List Selection State */}
              {!showCreateListForm && (
                <>
                  {/* Search */}
                  <div className="px-4 py-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={listSearchQuery}
                        onChange={(e) => setListSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Tab */}
                  <div className="px-4">
                    <div className="border-b border-gray-200">
                      <button className="pb-2 text-sm font-medium text-gray-900 border-b-2 border-gray-900">
                        All lists
                      </button>
                    </div>
                  </div>

                  {/* Lists */}
                  <div className="px-4 py-3 max-h-48 overflow-y-auto">
                    <div className="space-y-1">
                      {filteredLists.map((list) => (
                        <div
                          key={list.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => toggleListSelection(list.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLists.has(list.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleListSelection(list.id);
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-500 focus:ring-1 accent-gray-900"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-900">{list.name}</span>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                            <Users className="h-2.5 w-2.5 text-gray-600" />
                            <span className="text-xs text-gray-600">{list.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={handleShowCreateForm}
                      className="text-xs text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50"
                    >
                      Create new list
                    </button>
                    
                    <button
                      onClick={handleConfirmAddToList}
                      disabled={selectedLists.size === 0}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        selectedLists.size > 0
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add to list
                    </button>
                  </div>
                </>
              )}

              {/* Content - Create List Form State */}
              {showCreateListForm && (
                <>
                  {/* Form */}
                  <div className="px-4 py-4 space-y-4">
                    {/* Title Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        List title
                      </label>
                      <input
                        type="text"
                        placeholder="Enter list title"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    {/* Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setNewListType("seller")}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                            newListType === "seller"
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-gray-50 text-gray-600 border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          Seller
                        </button>
                        <button
                          onClick={() => setNewListType("buyer")}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                            newListType === "buyer"
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-gray-50 text-gray-600 border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          Buyer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
                    <button
                      onClick={handleBackToLists}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateNewList}
                      disabled={!newListTitle.trim()}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        newListTitle.trim()
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Create list
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Success Notification for Adding to List */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-[70] bg-green-50 border border-green-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-2">
          <div className="flex-shrink-0">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">Added to list successfully!</p>
            <p className="text-xs text-green-600">Company has been added to the selected lists.</p>
          </div>
        </div>
      )}

      {/* Success Notification for Creating List */}
      {showCreateListNotification && (
        <div className="fixed top-4 right-4 z-[70] bg-green-50 border border-green-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-2">
          <div className="flex-shrink-0">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">List created successfully!</p>
            <p className="text-xs text-green-600">Your new list is now available for selection.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketGraph;
