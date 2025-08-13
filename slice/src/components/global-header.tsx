"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Table");

  // Synchroniser l'onglet actif avec l'URL
  useEffect(() => {
    if (pathname === '/sourcingresult/table') {
      setActiveTab("Table");
    } else if (pathname === '/sourcingresult/graph') {
      setActiveTab("Graph");
    }
  }, [pathname]);

  // Gérer le changement d'onglet avec navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Table") {
      router.push("/sourcingresult/table");
    } else if (tab === "Graph") {
      router.push("/sourcingresult/graph");
    }
  };
  
  // N'afficher le header que sur les pages avec breadcrumb
  const showHeader = pathname.startsWith('/workflowbuilder') || pathname.startsWith('/sourcingresult');
  
  if (!showHeader) {
    return null;
  }

  // Breadcrumb conditionnel selon la page
  const getBreadcrumb = () => {
    if (pathname.startsWith('/workflowbuilder')) {
      // Extraire l'ID du workflow depuis l'URL si présent
      const workflowId = pathname.match(/\/workflowbuilder\/(\d+)/)?.[1];
      const workflowName = workflowId === '0' ? 'Demo Slice' : 
                          workflowId ? `Workflow ${workflowId}` : 'New workflow';
      
      return (
        <div className="flex items-center gap-1 text-xs">
          <Link 
            href="/workflowsclay" 
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 px-1 py-0.5 rounded transition-colors cursor-pointer"
          >
            Workflows
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-800">{workflowName}</span>
        </div>
      );
    }
    if (pathname.startsWith('/sourcingresult')) {
      return (
        <div className="flex items-center gap-1 text-xs">
          <Link 
            href="/sourcing" 
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 px-1 py-0.5 rounded transition-colors cursor-pointer"
          >
            Sourcing
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-800">Sourcing Result</span>
        </div>
      );
    }
    return null;
  };

  return (
    <nav className={`h-12 overflow-hidden ${pathname.startsWith('/workflowbuilder') || pathname.startsWith('/sourcingresult') ? 'bg-gray-50' : 'bg-white'} flex w-full items-center gap-2 border-b border-gray-200 px-4 py-2.5`}>
      {pathname.startsWith('/sourcingresult') ? (
        <>
          {/* Container avec position relative pour centrage absolu */}
          <div className="relative flex items-center w-full">
            {/* Logo et breadcrumb à gauche */}
            <div className="flex items-center gap-4">
              <Link 
                href="/home"
                className="flex items-center gap-2"
              >
                <span className="text-sm font-semibold text-gray-900">Dealway</span>
              </Link>
              {getBreadcrumb()}
            </div>

            {/* Navigation tabbée centrée absolument */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center bg-white border border-gray-200 rounded-md p-1">
                <button
                  onClick={() => handleTabChange("Table")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    activeTab === "Table"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => handleTabChange("Graph")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    activeTab === "Graph"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Graph
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Logo et nom Dealway pour les autres pages */}
          <div className="flex items-center gap-2 mr-4">
            <Link 
              href="/home"
              className="flex items-center gap-2"
            >
              <span className="text-sm font-semibold text-gray-900">Dealway</span>
            </Link>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center">
            {getBreadcrumb()}
          </div>
        </>
      )}
    </nav>
  );
} 