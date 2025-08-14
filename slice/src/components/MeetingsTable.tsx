"use client";

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table';
import { Building, Plus, X, Search, Users, ArrowLeft, Check, Workflow } from 'lucide-react';
import MeetingDetailPanel from './MeetingDetailPanel';
import { enrollCompany } from '@/lib/enrollment';

// Company data interface for sourcing results
interface CompanyData {
  id: number;
  companyName: string;
  sirenNumber: string;
  nafCode: string;
  location: string;
  ceoAge: number;
  employees: string;
  revenue: string;
  ebe: string;
  matchingScore: "high" | "medium";
  potentialBuyers: number;
}

export default function MeetingsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [openWorkflowModal, setOpenWorkflowModal] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // const [panelType, setPanelType] = useState<'summary' | 'questions' | 'email' | 'review' | 'notify' | 'teamfollowup'>('summary');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [listSearchQuery, setListSearchQuery] = useState("");
  const [selectedLists, setSelectedLists] = useState<Set<number>>(new Set());
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListType, setNewListType] = useState<"seller" | "buyer">("seller");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showCreateListNotification, setShowCreateListNotification] = useState(false);
  const [wasOpenedFromPanel, setWasOpenedFromPanel] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const addToListModalRef = useRef<HTMLDivElement>(null);

  // Sample company data
  const data: CompanyData[] = useMemo(() => [
    {
      id: 1,
      companyName: "TechCorp Industries",
      sirenNumber: "123456789",
      nafCode: "62.01Z",
      location: "Paris, France",
      ceoAge: 45,
      employees: "150",
      revenue: "€15M",
      ebe: "€2.8M",
      matchingScore: "high",
      potentialBuyers: 8
    },
    {
      id: 2,
      companyName: "DataSoft Solutions",
      sirenNumber: "987654321",
      nafCode: "62.02A",
      location: "Berlin, Germany",
      ceoAge: 38,
      employees: "85",
      revenue: "€8M",
      ebe: "€1.2M",
      matchingScore: "medium",
      potentialBuyers: 5
    },
    {
      id: 3,
      companyName: "Innovation Labs",
      sirenNumber: "456789123",
      nafCode: "72.11Z",
      location: "Amsterdam, Netherlands",
      ceoAge: 52,
      employees: "220",
      revenue: "€25M",
      ebe: "€4.5M",
      matchingScore: "high",
      potentialBuyers: 12
    },
    {
      id: 4,
      companyName: "GreenTech Dynamics",
      sirenNumber: "789123456",
      nafCode: "25.62A",
      location: "Stockholm, Sweden",
      ceoAge: 41,
      employees: "95",
      revenue: "€12M",
      ebe: "€1.8M",
      matchingScore: "medium",
      potentialBuyers: 6
    },
    {
      id: 5,
      companyName: "FinanceCore Systems",
      sirenNumber: "321654987",
      nafCode: "64.19Z",
      location: "Zurich, Switzerland",
      ceoAge: 49,
      employees: "180",
      revenue: "€20M",
      ebe: "€3.2M",
      matchingScore: "high",
      potentialBuyers: 10
    }
  ], []);

  const [createdLists, setCreatedLists] = useState<Array<{id: number, name: string, count: number, type: "seller" | "buyer"}>>([]);

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

  // Available workflows
  const availableWorkflows = [
    { id: 'demo-slice', name: 'Demo Slice', description: 'Generate slice demo' },
    { id: 'discovery', name: 'Discovery Follow-up', description: 'Generate discovery questions' },
    { id: 'sales-summary', name: 'Sales Summary', description: 'Generate comprehensive summary' }
  ];

  // const openModal = (callId: number, event: React.MouseEvent) => {
  //   const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  //   setModalPosition({
  //     top: rect.top - 200,
  //     left: rect.left
  //   });
  //   setOpenWorkflowModal(callId);
  // };

  const closeModal = () => {
    setOpenWorkflowModal(null);
    setModalPosition(null);
  };

  const handleRowClick = (company: CompanyData) => {
    setSelectedCompany(company);
    // setPanelType('summary'); // Default to summary for row clicks
    setIsPanelOpen(true);
  };

  const handleCellClick = (company: CompanyData, cellType: 'summary' | 'questions' | 'email' | 'review' | 'notify' | 'teamfollowup', event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    setSelectedCompany(company);
    // setPanelType(cellType);
    setIsPanelOpen(true);
  };

  const closePanelModal = () => {
    setIsPanelOpen(false);
    setSelectedCompany(null);
  };

  const toggleRowSelection = (id: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(item => item.id)));
    }
  };

  const isAllSelected = selectedRows.size === data.length && data.length > 0;

  const clearSelection = () => {
    setSelectedRows(new Set());
  };



  const handleAddToList = () => {
    setShowAddToListModal(true);
  };

  const closeAddToListModal = () => {
    setShowAddToListModal(false);
    setListSearchQuery("");
    setSelectedLists(new Set());
    setShowCreateListForm(false);
    setNewListTitle("");
    setNewListType("seller");
    
    // Si la modale a été ouverte depuis le panel, restaurer le panel et vider les sélections
    if (wasOpenedFromPanel) {
      setSelectedRows(new Set()); // Vider les sélections pour éviter la barre d'actions
      setWasOpenedFromPanel(false);
      // Le panel reste ouvert car isPanelOpen et selectedCompany ne changent pas
    }
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
    console.log('Adding companies to lists:', {
      companies: Array.from(selectedRows),
      lists: Array.from(selectedLists)
    });
    
    // Show success notification
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
    
    // Clear selections and close modal
    setSelectedRows(new Set());
    
    // Reset the flag but don't close the panel - let it stay open
    if (wasOpenedFromPanel) {
      setWasOpenedFromPanel(false);
    }
    
    closeAddToListModal();
    
    // Logique pour ajouter les entreprises aux listes sélectionnées
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

  // Close with Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        closeAddToListModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
      if (addToListModalRef.current && !addToListModalRef.current.contains(e.target as Node)) {
        closeAddToListModal();
      }
    };
    if (openWorkflowModal || showAddToListModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openWorkflowModal, showAddToListModal]);

  const columnHelper = createColumnHelper<CompanyData>();

    // Colonnes figées (checkbox + nom entreprise)
  const frozenColumns = useMemo(() => [
    // Colonne de sélection
    columnHelper.display({
      id: 'select',
      header: () => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleAllSelection}
            className="w-4 h-4 rounded-md border-gray-300 text-gray-900 focus:ring-gray-500 focus:ring-2 accent-gray-900"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedRows.has(row.original.id)}
            onChange={(e) => {
              e.stopPropagation();
              toggleRowSelection(row.original.id);
            }}
            className="w-4 h-4 rounded-md border-gray-300 text-gray-900 focus:ring-gray-500 focus:ring-2 accent-gray-900"
          />
        </div>
      ),
    }),
    columnHelper.accessor('companyName', {
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <Building className="h-3.5 w-3.5" />
          Nom entreprise
        </div>
      ),
      cell: ({ getValue, row }) => (
        <div 
          className="cursor-pointer"
          onClick={(e) => handleCellClick(row.original, 'summary', e)}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center flex-shrink-0 w-4 h-4 bg-blue-100 rounded">
              <span className="text-xs text-blue-600">🏢</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-gray-900 truncate">
                {getValue()}
              </div>
            </div>
          </div>
        </div>
      ),
    }),
  ], [isAllSelected, selectedRows, toggleAllSelection, toggleRowSelection]);

  // Colonnes scrollables
  const scrollableColumns = useMemo(() => [
    // SIREN column
    columnHelper.accessor('sirenNumber', {
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          SIREN
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-xs text-gray-700 font-mono">
          {getValue()}
        </div>
      ),
    }),

    // NAF column
    columnHelper.accessor('nafCode', {
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          Activité (NAF)
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-xs text-gray-700 font-mono">
          {getValue()}
        </div>
      ),
    }),

    // Localisation column
    columnHelper.accessor('location', {
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          Localisation
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-xs text-gray-700">
          {getValue()}
        </div>
      ),
    }),

    // Age dirigeant column
    columnHelper.accessor('ceoAge', {
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          Age dirigeant
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-xs text-gray-700">
          {getValue()} ans
        </div>
      ),
    }),

    // Effectif column
    columnHelper.accessor('employees', {
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          Effectif
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-xs text-gray-700">
          {getValue()}
              </div>
      ),
    }),

    // CA column
    columnHelper.accessor('revenue', {
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          CA
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-xs text-gray-700">
            {getValue()}
        </div>
      ),
    }),

    // EBE column
    columnHelper.accessor('ebe', {
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          EBE
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-xs text-gray-700">
          {getValue()}
        </div>
      ),
    }),

    // Badge de scoring column
    columnHelper.accessor('matchingScore', {
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          Scoring
        </div>
      ),
      cell: ({ getValue }) => (
        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          getValue() === 'high' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {getValue() === 'high' ? 'High' : 'Medium'}
          </div>
      ),
    }),

    // Nombre de buyers potentiels column
    columnHelper.accessor('potentialBuyers', {
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          Buyers potentiels
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-xs text-gray-700">
          {getValue()}
          </div>
      ),
    }),
  ], []);

  // Colonnes combinées pour le table
  const columns = useMemo(() => [...frozenColumns, ...scrollableColumns], [frozenColumns, scrollableColumns]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="flex-1 -mx-6">
      {/* Barre d'actions pour les sélections */}
      {selectedRows.size > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-3">
          <button
            onClick={clearSelection}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            <X className="h-4 w-4" />
            Clear {selectedRows.size} selected
          </button>
          
          <div className="w-px h-4 bg-gray-300"></div>
          
          <button
            onClick={handleAddToList}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-1.5 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add to list
          </button>

          {/* Bouton Enroll - seulement si une seule entreprise est sélectionnée */}
          {selectedRows.size === 1 && (
            <button
              onClick={() => {
                const companyId = Array.from(selectedRows)[0];
                const company = data.find(c => c.id === companyId);
                if (company) {
                  enrollCompany(company.companyName);
                  setSelectedRows(new Set()); // Clear selection after enrollment
                }
              }}
              className="flex items-center gap-2 bg-[#BDBBFF] hover:bg-[#A8A5FF] text-black px-3 py-1.5 text-sm font-medium rounded transition-colors"
            >
              <Workflow className="h-4 w-4" />
              Enroll
            </button>
          )}
        </div>
      )}
      
      <div className="relative bg-white border border-gray-200 rounded-none overflow-x-auto">
        <div className="flex" style={{ minWidth: '1510px' }}>
          {/* Colonne figée - Container */}
          <div className="sticky left-0 z-10 bg-white border-r-2 border-gray-300 shadow-sm">
            {/* Header figé */}
            <div className="border-b border-gray-200 flex">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.slice(0, 2).map((header, index) => (
                  <div
                    key={header.id}
                    className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200 last:border-r-0"
                    style={{ width: index === 0 ? '50px' : '250px', height: '44px' }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
          </div>
                ))
              )}
        </div>

            {/* Rows figés */}
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0 flex"
            >
                {row.getVisibleCells().slice(0, 2).map((cell, index) => (
              <div 
                    key={cell.id}
                    className="flex items-center px-4 py-3 border-r border-gray-200 last:border-r-0"
                    style={{ width: index === 0 ? '50px' : '250px', height: '56px' }}
                    onClick={index === 0 ? undefined : () => handleRowClick(row.original)}
              >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
                    </div>
                  ))}
              </div>
              
          {/* Colonnes scrollables - Container */}
          <div className="flex-1">
            {/* Headers scrollables */}
            <div className="flex border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.slice(2).map((header) => (
                  <div
                    key={header.id}
                    className="flex items-center flex-shrink-0 gap-2 px-4 py-3 text-xs font-medium text-gray-500 border-r border-gray-200 hover:bg-gray-50 transition-colors"
                    style={{ width: '140px', height: '44px' }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                    )}
                  </div>
                ))
                )}
              </div>
              
            {/* Rows scrollables */}
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="flex hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                {row.getVisibleCells().slice(2).map((cell) => (
                  <div
                    key={cell.id}
                    className="flex items-center flex-shrink-0 px-4 py-3 border-r border-gray-200 last:border-r-0"
                    style={{ width: '140px', height: '56px' }}
                    onClick={() => handleRowClick(row.original)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
                ))}
              </div>
            ))}
            </div>
        </div>

        {/* Workflow Dropdown */}
        {openWorkflowModal && modalPosition && (
          <>
            {/* Invisible overlay for click outside */}
            <div className="fixed inset-0 z-40" onClick={closeModal} />
            
            {/* Clay-style dropdown - more angular and compact */}
            <div
              ref={modalRef}
              className="fixed z-50 w-48 bg-white border border-gray-200 shadow-sm"
              style={{
                top: modalPosition.top + 40,
                left: modalPosition.left,
              }}
            >
              {/* Available workflows dropdown list */}
              <div>
                {availableWorkflows
                  .slice(0, 3)
                  .map((workflow) => (
                    <div
                      key={workflow.id}
                      className="group px-2 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={closeModal}
                    >
                      <div className="flex flex-col">
                        <div className="text-xs font-medium text-gray-900 mb-0.5">
                          {workflow.name}
                        </div>
                        <div className="text-xs text-gray-500">{workflow.description}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Meeting Detail Panel */}
        <MeetingDetailPanel
          isOpen={isPanelOpen}
          onClose={closePanelModal}
          meetingData={selectedCompany}
          panelType="summary"
          onAddToList={(companyId) => {
            // Simuler la sélection de cette entreprise et ouvrir la modale
            setSelectedRows(new Set([companyId]));
            setWasOpenedFromPanel(true);
            setShowAddToListModal(true);
            // Ne pas fermer le panel ici, on le gère dans closeAddToListModal
          }}
          onEnroll={(companyId) => {
            const company = data.find(c => c.id === companyId);
            if (company) {
              enrollCompany(company.companyName);
            }
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
              <p className="text-xs text-green-600">Companies have been added to the selected lists.</p>
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
    </div>
  );
} 