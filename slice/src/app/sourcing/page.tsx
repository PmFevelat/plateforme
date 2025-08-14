"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Upload, Building, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SourcingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [openStatusModal, setOpenStatusModal] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const [sourcedCompanies] = useState([
    {
      id: 1,
      name: "TechCorp Industries",
      industry: "Technology",
      type: "seller" as "seller" | "buyer"
    },
    {
      id: 2,
      name: "Manufacturing Plus",
      industry: "Manufacturing",
      type: "buyer" as "seller" | "buyer"
    },
    {
      id: 3,
      name: "Green Energy Solutions",
      industry: "Energy",
      type: "seller" as "seller" | "buyer"
    },
    {
      id: 4,
      name: "Retail Dynamics",
      industry: "Retail",
      type: "buyer" as "seller" | "buyer"
    },
    {
      id: 5,
      name: "FinanceCore Systems",
      industry: "Finance",
      type: "seller" as "seller" | "buyer"
    }
  ]);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleActionsClick = (company: typeof sourcedCompanies[0], event: React.MouseEvent) => {
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

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
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
      }
    };
    if (openStatusModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openStatusModal]);

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
    <div className="flex flex-1 flex-col h-full">
      {/* Partie haute avec background gris */}
      <div className="bg-gray-50 px-4 pt-15 pb-4 flex-shrink-0">
        {/* Header avec titre */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Sourcing
          </h1>
        </div>
        
        {/* Grille des 4 cartes principales */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* Card Find Seller */}
          <Link href="/companies">
            <div className="bg-white border border-gray-200 rounded p-4 h-20 hover:border-gray-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">Find seller</h3>
              </div>
            </div>
          </Link>

          {/* Card Import Seller */}
          <div className="bg-white border border-gray-200 rounded p-4 h-20 hover:border-gray-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded">
                <Upload className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm">Import seller</h3>
            </div>
          </div>

          {/* Card Find Buyer */}
          <div className="bg-white border border-gray-200 rounded p-4 h-20 hover:border-gray-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm">Find buyer</h3>
            </div>
          </div>

          {/* Card Import Buyer */}
          <div className="bg-white border border-gray-200 rounded p-4 h-20 hover:border-gray-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-50 rounded">
                <Building className="h-4 w-4 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm">Import buyer</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Partie basse avec background blanc - Table des deals sourcés */}
      <div className="bg-white flex-1 p-4">
        <div className="h-full">
          {/* Header local pour le titre et contrôles - style Clay exact */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-gray-900">Recently Sourced Companies</h2>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sourced companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-60 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 bg-white h-8"
                />
              </div>

              {/* Bouton New */}
              <Link href="/sourcing" className="bg-[#BDBBFF] hover:bg-[#A8A5FF] text-black px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1.5 transition-colors h-8">
                <Plus className="h-3.5 w-3.5" />
                New
              </Link>
            </div>
          </div>

          {/* Tableau style Clay exact */}
          <div className="bg-white">
            {/* En-têtes */}
            <div className="grid grid-cols-8 gap-4 px-4 py-3 text-xs font-medium text-gray-500 border-b border-gray-200">
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Industry</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Lignes de données */}
            <div className="divide-y divide-gray-100">
              {sourcedCompanies.map((company) => (
                <div
                  key={company.id}
                  className="grid grid-cols-8 gap-4 px-4 py-2 hover:bg-gray-50 transition-colors group cursor-pointer"
                  onClick={() => router.push('/sourcingresult/table')}
                >
                  <div className="col-span-4 flex items-center min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-blue-600">🏢</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-xs truncate">
                          {company.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <span className="text-xs text-gray-600">{company.industry}</span>
                  </div>
                  
                  <div className="col-span-1 flex items-center">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getTypeColor(company.type)}`}>
                      {company.type}
                    </span>
                  </div>
                  
                  <div className="col-span-1 flex items-center">
                    <button 
                      onClick={(event) => {
                        event.stopPropagation();
                        handleActionsClick(company, event);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    >
                      •••
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Ligne de fermeture pour la table */}
              <div className="border-t border-gray-200"></div>
            </div>

            {/* CTA pour nouvelle entreprise sourcée - style Clay minimaliste */}
            <div className="mt-2">
              <Link href="/sourcing" className="flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors group">
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">New sourced company</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal dropdown pour les actions */}
      {openStatusModal && modalPosition && (
        <>
          {/* Overlay invisible pour fermer en cliquant à l'extérieur */}
          <div className="fixed inset-0 z-40" onClick={closeModal} />
          
          {/* Modal dropdown */}
          <div
            ref={modalRef}
            className="fixed z-50 w-32 py-1 bg-white border border-gray-200 rounded shadow-lg"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
            }}
          >
            <div className="py-1">
              <div
                className="px-3 py-2 transition-colors cursor-pointer hover:bg-gray-50"
                onClick={closeModal}
              >
                <div className="text-xs font-medium text-gray-900">View</div>
              </div>
              
              <div
                className="px-3 py-2 transition-colors cursor-pointer hover:bg-gray-50"
                onClick={closeModal}
              >
                <div className="text-xs font-medium text-gray-900">Edit</div>
              </div>
              
              <div
                className="px-3 py-2 transition-colors cursor-pointer hover:bg-gray-50"
                onClick={closeModal}
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