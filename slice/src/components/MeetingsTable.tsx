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
import { Calendar, Building, Play, Plus, ChevronDown } from 'lucide-react';
import MeetingDetailPanel from './MeetingDetailPanel';

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
  const [panelType, setPanelType] = useState<'summary' | 'questions' | 'email' | 'review' | 'notify' | 'teamfollowup'>('summary');
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Available workflows
  const availableWorkflows = [
    { id: 'demo-slice', name: 'Demo Slice', description: 'Generate slice demo' },
    { id: 'discovery', name: 'Discovery Follow-up', description: 'Generate discovery questions' },
    { id: 'sales-summary', name: 'Sales Summary', description: 'Generate comprehensive summary' }
  ];

  const openModal = (callId: number, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setModalPosition({
      top: rect.top - 200,
      left: rect.left
    });
    setOpenWorkflowModal(callId);
  };

  const closeModal = () => {
    setOpenWorkflowModal(null);
    setModalPosition(null);
  };

  const handleRowClick = (company: CompanyData) => {
    setSelectedCompany(company);
    setPanelType('summary'); // Default to summary for row clicks
    setIsPanelOpen(true);
  };

  const handleCellClick = (company: CompanyData, cellType: 'summary' | 'questions' | 'email' | 'review' | 'notify' | 'teamfollowup', event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    setSelectedCompany(company);
    setPanelType(cellType);
    setIsPanelOpen(true);
  };

  const closePanelModal = () => {
    setIsPanelOpen(false);
    setSelectedCompany(null);
  };

  // Close with Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
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
    };
    if (openWorkflowModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openWorkflowModal]);

  const columnHelper = createColumnHelper<CompanyData>();

    // Colonnes figées (nom entreprise)
  const frozenColumns = useMemo(() => [
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
  ], []);

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
      <div className="relative bg-white border border-gray-200 rounded-none overflow-x-auto">
        <div className="flex" style={{ minWidth: '1510px' }}>
          {/* Colonne figée - Container */}
          <div className="sticky left-0 z-10 bg-white border-r-2 border-gray-300 shadow-sm">
            {/* Header figé */}
            <div className="border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.slice(0, 1).map((header) => (
                  <div
                    key={header.id}
                    className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    style={{ width: '250px', height: '44px' }}
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
                className="hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleRowClick(row.original)}
            >
                {row.getVisibleCells().slice(0, 1).map((cell) => (
              <div 
                    key={cell.id}
                    className="flex items-center px-4 py-3"
                    style={{ width: '250px', height: '56px' }}
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
                headerGroup.headers.slice(1).map((header) => (
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
                onClick={() => handleRowClick(row.original)}
              >
                {row.getVisibleCells().slice(1).map((cell) => (
                  <div
                    key={cell.id}
                    className="flex items-center flex-shrink-0 px-4 py-3 border-r border-gray-200 last:border-r-0"
                    style={{ width: '140px', height: '56px' }}
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
          panelType={panelType}
        />
      </div>
    </div>
  );
} 