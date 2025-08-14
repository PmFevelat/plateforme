"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Company {
  id: number;
  name: string;
  type?: string;
  status?: string;
  industry?: string;
  location?: string;
  revenue?: string;
  employees?: string;
  lastInteraction?: string;
  latestContact?: string;
  dealStage?: string;
  dealValue?: string;
  dealType?: string;
  probability?: number;
  isNew?: boolean;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [openStatusModal, setOpenStatusModal] = useState<number | null>(null);
  const [openActionsModal, setOpenActionsModal] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const [actionsModalPosition, setActionsModalPosition] = useState<{ top: number; left: number } | null>(null);
  
  // Companies déjà engagées (Known Companies)
  const [knownCompanies, setKnownCompanies] = useState([
    {
      id: 1,
      name: "TechCorp Industries",
      industry: "Technology",
      latestContact: "Dec 18, 2024",
      type: "Seller" as "Seller" | "Buyer",
      status: "Interested" as "Contacted" | "Interested" | "Negotiating" | "Closed"
    },
    {
      id: 2,
      name: "Manufacturing Plus",
      industry: "Manufacturing",
      latestContact: "Dec 15, 2024",
      type: "Buyer" as "Seller" | "Buyer",
      status: "Contacted" as "Contacted" | "Interested" | "Negotiating" | "Closed"
    },
    {
      id: 3,
      name: "Green Energy Solutions",
      industry: "Energy",
      latestContact: "Dec 20, 2024",
      type: "Seller" as "Seller" | "Buyer",
      status: "Negotiating" as "Contacted" | "Interested" | "Negotiating" | "Closed"
    },
    {
      id: 4,
      name: "Retail Dynamics",
      industry: "Retail",
      latestContact: "Dec 12, 2024",
      type: "Buyer" as "Seller" | "Buyer",
      status: "Closed" as "Contacted" | "Interested" | "Negotiating" | "Closed"
    },
    {
      id: 5,
      name: "FinTech Innovators",
      industry: "Financial Services",
      latestContact: "Dec 22, 2024",
      type: "Seller" as "Seller" | "Buyer",
      status: "Interested" as "Contacted" | "Interested" | "Negotiating" | "Closed"
    }
  ]);

  // Toutes les companies de la base de données (pour la recherche)
  const [allCompanies] = useState([
    // Known companies + nouvelles companies non contactées
    ...knownCompanies,
    {
      id: 6,
      name: "AI Startup Ventures",
      industry: "Technology",
      type: "Seller" as "Seller" | "Buyer",
      isNew: true
    },
    {
      id: 7,
      name: "BioTech Solutions",
      industry: "Healthcare",
      type: "Buyer" as "Seller" | "Buyer",
      isNew: true
    },
    {
      id: 8,
      name: "Construction Masters",
      industry: "Construction",
      type: "Seller" as "Seller" | "Buyer",
      isNew: true
    }
  ]);

  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(knownCompanies);
  const [isSearching, setIsSearching] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filtrer les companies en temps réel basé sur la recherche
  useEffect(() => {
    if (searchQuery.trim() === "") {
      // Pas de recherche globale, on applique le filtre local sur les known companies
      if (localSearchQuery.trim() === "") {
        setFilteredCompanies(knownCompanies);
      } else {
        const filtered = knownCompanies.filter(company =>
          company.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
          company.industry.toLowerCase().includes(localSearchQuery.toLowerCase())
        );
        setFilteredCompanies(filtered);
      }
      setIsSearching(false);
    } else {
      // Recherche globale dans toute la base de données
      const filtered = allCompanies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
      setIsSearching(true);
    }
  }, [searchQuery, localSearchQuery, knownCompanies, allCompanies]);

  const handleSearch = () => {
    // La recherche se fait déjà en temps réel via useEffect
    console.log("Searching for:", searchQuery);
  };

  const handleStatusClick = (company: Company, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setOpenStatusModal(company.id);
  };

  const closeModal = () => {
    setOpenStatusModal(null);
    setModalPosition(null);
  };

  const handleActionsClick = (company: Company, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setActionsModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setOpenActionsModal(company.id);
  };

  const handleDeleteCompany = (companyId: number) => {
    setKnownCompanies(prev => prev.filter(c => c.id !== companyId));
    closeActionsModal();
  };

  const closeActionsModal = () => {
    setOpenActionsModal(null);
    setActionsModalPosition(null);
  };

  const handleStatusChange = (companyId: number, newStatus: "Contacted" | "Interested" | "Negotiating" | "Closed") => {
    setKnownCompanies(prev => 
      prev.map(c => 
        c.id === companyId 
          ? { ...c, status: newStatus }
          : c
      )
    );
    closeModal();
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
      case "Negotiating":
        return "bg-yellow-100 text-yellow-800";
      case "Interested":
        return "bg-purple-100 text-purple-800";
      case "Contacted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Seller":
        return "bg-orange-100 text-orange-800";
      case "Buyer":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Partie haute avec background gris - Section de recherche */}
      <div className="bg-gray-50 px-4 pt-15 pb-4 flex-shrink-0">
        {/* Header avec titre */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Companies
          </h1>
        </div>
        
        {/* Barre de recherche principale */}
        <div className="bg-white border border-gray-200 rounded p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 text-sm">Search for a company from the database</h3>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10 pr-3 py-2 w-full text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Partie basse avec background blanc - Table des companies */}
      <div className="bg-white flex-1 p-4">
        <div className="h-full">
          {/* Header local pour le titre et contrôles - style Clay exact */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-gray-900">
                {isSearching ? "Search Results" : "Known Companies"}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              {!isSearching && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search known companies..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 w-60 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 bg-white h-8"
                  />
                </div>
              )}
              
              {/* Bouton New */}
              <Link href="/companies" className="bg-[#BDBBFF] hover:bg-[#A8A5FF] text-black px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1.5 transition-colors h-8">
                <Plus className="h-3.5 w-3.5" />
                New
              </Link>
            </div>
          </div>

          {/* Tableau style Clay exact */}
          <div className="bg-white">
            {/* En-têtes - différents selon le contexte */}
            <div className={`grid gap-4 px-4 py-3 text-xs font-medium text-gray-500 border-b border-gray-200 ${
              isSearching ? 'grid-cols-10' : 'grid-cols-12'
            }`}>
              <div className={isSearching ? "col-span-4" : "col-span-3"}>Name</div>
              <div className={isSearching ? "col-span-3" : "col-span-2"}>Industry</div>
              {!isSearching && <div className="col-span-2">Latest Contact</div>}
              <div className={isSearching ? "col-span-2" : "col-span-2"}>Type</div>
              {!isSearching && <div className="col-span-2">Status</div>}
              <div className="col-span-1">Actions</div>
            </div>

            {/* Lignes de données */}
            <div className="divide-y divide-gray-100">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No companies found matching your search</p>
                </div>
              ) : (
                filteredCompanies.map((company: Company) => (
                <div
                  key={company.id}
                  className={`grid gap-4 px-4 py-2 hover:bg-gray-50 transition-colors group cursor-pointer ${
                    isSearching ? 'grid-cols-10' : 'grid-cols-12'
                  }`}
                  onClick={() => router.push('/companies')}
                >
                  <div className={`${isSearching ? "col-span-4" : "col-span-3"} flex items-center min-w-0`}>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-blue-600">🏢</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-xs truncate">
                          {company.name}
                          {company.isNew && <span className="ml-1 text-green-600">●</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${isSearching ? "col-span-3" : "col-span-2"} flex items-center`}>
                    <span className="text-xs text-gray-600">{company.industry}</span>
                  </div>
                  
                  {!isSearching && (
                    <div className="col-span-2 flex items-center">
                      <span className="text-xs text-gray-600">{company.latestContact}</span>
                    </div>
                  )}
                  
                  <div className="col-span-2 flex items-center">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getTypeColor(company.type || 'Unknown')}`}>
                      {company.type || 'Unknown'}
                    </span>
                  </div>
                  
                  {!isSearching && (
                    <div className="col-span-2 flex items-center">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleStatusClick(company, event);
                        }}
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium hover:opacity-80 transition-colors ${getStatusColor(company.status || 'Unknown')}`}
                      >
                        {company.status || 'Unknown'}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  <div className="col-span-1 flex items-center">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleActionsClick(company, event);
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

            {/* CTA pour nouvelle company - style Clay minimaliste */}
            <div className="mt-2">
              <Link href="/companies" className="flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors group">
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">New company</span>
              </Link>
            </div>
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
                onClick={() => handleStatusChange(openStatusModal, "Contacted")}
              >
                <div className="text-xs font-medium text-gray-900">Contacted</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "Interested")}
              >
                <div className="text-xs font-medium text-gray-900">Interested</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "Negotiating")}
              >
                <div className="text-xs font-medium text-gray-900">Negotiating</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "Closed")}
              >
                <div className="text-xs font-medium text-gray-900">Closed</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal dropdown pour les actions View/Delete */}
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
                onClick={() => handleDeleteCompany(openActionsModal)}
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
