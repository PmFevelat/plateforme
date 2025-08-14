"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
// import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ListsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [openTypeModal, setOpenTypeModal] = useState<number | null>(null);
  const [openActionsModal, setOpenActionsModal] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const [actionsModalPosition, setActionsModalPosition] = useState<{ top: number; left: number } | null>(null);
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: "TechCorp Industries",
      type: "seller" as "seller" | "buyer",
      recordsCount: 24
    },
    {
      id: 2,
      name: "Manufacturing Plus",
      type: "buyer" as "seller" | "buyer",
      recordsCount: 18
    },
    {
      id: 3,
      name: "Green Energy Solutions",
      type: "seller" as "seller" | "buyer",
      recordsCount: 31
    },
    {
      id: 4,
      name: "Retail Dynamics",
      type: "buyer" as "seller" | "buyer",
      recordsCount: 12
    },
    {
      id: 5,
      name: "FinTech Innovators",
      type: "seller" as "seller" | "buyer",
      recordsCount: 45
    }
  ]);

  // Load and sync created lists from localStorage
  useEffect(() => {
    const loadCreatedLists = () => {
      const savedLists = localStorage.getItem('createdLists');
      if (savedLists) {
        try {
          const createdLists = JSON.parse(savedLists);
          const newCompanies = createdLists.map((list: { id: number; name: string; type: string; count: number }) => ({
            id: list.id + 1000, // Offset to avoid ID conflicts
            name: list.name,
            type: list.type,
            recordsCount: list.count
          }));
          
          // Remplacer complètement les listes créées pour éviter les doublons
          setCompanies(prev => {
            // Garder seulement les listes par défaut (ID < 1000)
            const defaultLists = prev.filter(c => c.id < 1000);
            return [...defaultLists, ...newCompanies];
          });
        } catch (error) {
          console.error('Error loading created lists:', error);
        }
      }
    };

    // Charger au montage
    loadCreatedLists();

    // Écouter les changements de localStorage (pour sync entre onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'createdLists') {
        loadCreatedLists();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filtrer les companies en temps réel basé sur la recherche
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [searchQuery, companies]);

  const handleTypeClick = (company: typeof companies[0], event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setOpenTypeModal(company.id);
  };

  const closeModal = () => {
    setOpenTypeModal(null);
    setModalPosition(null);
  };

  const handleTypeChange = (companyId: number, newType: "seller" | "buyer") => {
    setCompanies(prev => 
      prev.map(c => 
        c.id === companyId 
          ? { ...c, type: newType }
          : c
      )
    );
    closeModal();
  };

  const handleActionsClick = (company: typeof companies[0], event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setActionsModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setOpenActionsModal(company.id);
  };

  const handleDeleteCompany = (companyId: number) => {
    setCompanies(prev => prev.filter(c => c.id !== companyId));
    closeActionsModal();
  };

  const closeActionsModal = () => {
    setOpenActionsModal(null);
    setActionsModalPosition(null);
  };

  const handleRowClick = (company: typeof companies[0]) => {
    router.push(`/listcontent/table?id=${company.id}&name=${encodeURIComponent(company.name)}`);
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
    if (openTypeModal || openActionsModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openTypeModal, openActionsModal]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "seller":
        return "bg-blue-100 text-blue-800";
      case "buyer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white px-4 pt-15 pb-4">
      {/* Header local pour le titre et contrôles - style Clay exact */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium text-gray-900">Lists</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search lists..."
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
            <div className="col-span-4">List Name</div>
            <div className="col-span-2"># of records</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Lignes de données */}
          <div className="divide-y divide-gray-100">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No lists found matching your search</p>
              </div>
            ) : (
              filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="grid grid-cols-8 gap-4 px-4 py-2 hover:bg-gray-50 transition-colors group cursor-pointer"
                onClick={() => handleRowClick(company)}
              >
                <div className="col-span-4 flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-purple-600">📋</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-gray-900 text-xs truncate">
                        {company.name}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-gray-600">{company.recordsCount}</span>
                </div>
                
                <div className="col-span-1 flex items-center">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTypeClick(company, event);
                    }}
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium hover:opacity-80 transition-colors ${getTypeColor(company.type)}`}
                  >
                    {company.type}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </button>
                </div>

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
            <button className="flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors group">
              <Plus className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">New list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal dropdown pour changer le type */}
      {openTypeModal && modalPosition && (
        <>
          {/* Overlay invisible pour fermer en cliquant à l'extérieur */}
          <div className="fixed inset-0 z-40" onClick={closeModal} />
          
          {/* Modal dropdown */}
          <div
            ref={modalRef}
            className="fixed z-50 bg-white rounded shadow-lg border border-gray-200 py-1 w-24"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
            }}
          >
            <div className="py-1">
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleTypeChange(openTypeModal, "seller")}
              >
                <div className="text-xs font-medium text-gray-900">Seller</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleTypeChange(openTypeModal, "buyer")}
              >
                <div className="text-xs font-medium text-gray-900">Buyer</div>
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
