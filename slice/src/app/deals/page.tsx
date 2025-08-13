"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openStatusModal, setOpenStatusModal] = useState<number | null>(null);
  const [openActionsModal, setOpenActionsModal] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const [actionsModalPosition, setActionsModalPosition] = useState<{ top: number; left: number } | null>(null);
  const [deals, setDeals] = useState([
    {
      id: 1,
      name: "TechCorp Acquisition",
      sellSideCompany: "TechCorp Industries",

      status: "In Progress" as "In Progress" | "Negotiating" | "Due Diligence" | "Closed" | "On Hold"
    },
    {
      id: 2,
      name: "Manufacturing Plus Exit",
      sellSideCompany: "Manufacturing Plus",

      status: "Negotiating" as "In Progress" | "Negotiating" | "Due Diligence" | "Closed" | "On Hold"
    },
    {
      id: 3,
      name: "Green Energy Merger",
      sellSideCompany: "Green Energy Solutions",

      status: "Due Diligence" as "In Progress" | "Negotiating" | "Due Diligence" | "Closed" | "On Hold"
    },
    {
      id: 4,
      name: "Retail Chain Sale",
      sellSideCompany: "Retail Dynamics",

      status: "Closed" as "In Progress" | "Negotiating" | "Due Diligence" | "Closed" | "On Hold"
    },
    {
      id: 5,
      name: "FinTech Investment",
      sellSideCompany: "FinTech Innovators",

      status: "On Hold" as "In Progress" | "Negotiating" | "Due Diligence" | "Closed" | "On Hold"
    }
  ]);
  const [filteredDeals, setFilteredDeals] = useState(deals);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filtrer les deals en temps réel basé sur la recherche
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDeals(deals);
    } else {
      const filtered = deals.filter(deal =>
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.sellSideCompany.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDeals(filtered);
    }
  }, [searchQuery, deals]);

  const handleStatusClick = (deal: typeof deals[0], event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setOpenStatusModal(deal.id);
  };

  const closeModal = () => {
    setOpenStatusModal(null);
    setModalPosition(null);
  };

  const handleStatusChange = (dealId: number, newStatus: "In Progress" | "Negotiating" | "Due Diligence" | "Closed" | "On Hold") => {
    setDeals(prev => 
      prev.map(d => 
        d.id === dealId 
          ? { ...d, status: newStatus }
          : d
      )
    );
    closeModal();
  };

  const handleActionsClick = (deal: typeof deals[0], event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setActionsModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setOpenActionsModal(deal.id);
  };

  const handleDeleteDeal = (dealId: number) => {
    setDeals(prev => prev.filter(d => d.id !== dealId));
    closeActionsModal();
  };

  const closeActionsModal = () => {
    setOpenActionsModal(null);
    setActionsModalPosition(null);
  };

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        closeActionsModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
        closeActionsModal();
      }
    };
    if (openStatusModal || openActionsModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openStatusModal, openActionsModal]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Closed":
        return "bg-green-100 text-green-800";
      case "Due Diligence":
        return "bg-blue-100 text-blue-800";
      case "Negotiating":
        return "bg-purple-100 text-purple-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "On Hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white px-4 pt-15 pb-4">
      {/* Header local pour le titre et contrôles - style Clay exact */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium text-gray-900">Deals</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-60 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 bg-white h-8"
            />
          </div>

          {/* Bouton New */}
          <button className="bg-[#BDBBFF] hover:bg-[#A8A5FF] text-black px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1.5 transition-colors h-8">
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </div>

      {/* Tableau style Clay exact */}
      <div className="flex-1">
        <div className="bg-white">
          {/* En-têtes */}
          <div className="grid grid-cols-8 gap-4 px-4 py-3 text-xs font-medium text-gray-500 border-b border-gray-200">
            <div className="col-span-4">Deal Name</div>
            <div className="col-span-2">Sell Side Company</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Lignes de données */}
          <div className="divide-y divide-gray-100">
            {filteredDeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No deals found matching your search</p>
              </div>
            ) : (
              filteredDeals.map((deal) => (
              <div
                key={deal.id}
                className="grid grid-cols-8 gap-4 px-4 py-2 hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <div className="col-span-4 flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-blue-600">💼</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-gray-900 text-xs truncate">
                        {deal.name}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-gray-600">{deal.sellSideCompany}</span>
                </div>
                
                <div className="col-span-1 flex items-center">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleStatusClick(deal, event);
                    }}
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium hover:opacity-80 transition-colors ${getStatusColor(deal.status)}`}
                  >
                    {deal.status}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </button>
                </div>

                <div className="col-span-1 flex items-center">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleActionsClick(deal, event);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    •••
                  </button>
                </div>
              </div>
              ))
            )}
            
            {/* Ligne de fermeture pour la table */}
            <div className="border-t border-gray-200"></div>
          </div>

          {/* CTA pour nouveau deal - style Clay minimaliste */}
          <div className="mt-2">
            <button className="flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors group">
              <Plus className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">New deal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal dropdown pour changer le statut */}
      {openStatusModal && modalPosition && (
        <>
          {/* Overlay invisible pour fermer en cliquant à l'extérieur */}
          <div className="fixed inset-0 z-40" onClick={closeModal} />
          
          {/* Modal dropdown */}
          <div
            ref={modalRef}
            className="fixed z-50 bg-white rounded shadow-lg border border-gray-200 py-1 w-32"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
            }}
          >
            <div className="py-1">
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "In Progress")}
              >
                <div className="text-xs font-medium text-gray-900">In Progress</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "Negotiating")}
              >
                <div className="text-xs font-medium text-gray-900">Negotiating</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "Due Diligence")}
              >
                <div className="text-xs font-medium text-gray-900">Due Diligence</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "Closed")}
              >
                <div className="text-xs font-medium text-gray-900">Closed</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "On Hold")}
              >
                <div className="text-xs font-medium text-gray-900">On Hold</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal dropdown pour les actions Edit/Delete */}
      {openActionsModal && actionsModalPosition && (
        <>
          {/* Overlay invisible pour fermer en cliquant à l'extérieur */}
          <div className="fixed inset-0 z-40" onClick={closeActionsModal} />
          
          {/* Modal dropdown */}
          <div
            ref={modalRef}
            className="fixed z-50 bg-white rounded shadow-lg border border-gray-200 py-1 w-24"
            style={{
              top: actionsModalPosition.top,
              left: actionsModalPosition.left,
            }}
          >
            <div className="py-1">
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={closeActionsModal}
              >
                <div className="text-xs font-medium text-gray-900">View</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleDeleteDeal(openActionsModal)}
              >
                <div className="text-xs font-medium text-red-600">Delete</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 