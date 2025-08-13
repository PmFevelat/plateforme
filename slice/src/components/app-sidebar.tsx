"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  GalleryVerticalEnd,
  Workflow,
  Calendar,
  CheckSquare,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  Search,
  DollarSign,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"

// This is sample data.
const data = {
  teams: [
    {
      name: "ACME",
      logo: GalleryVerticalEnd,
      plan: "Sales Team",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Sourcing",
      url: "/sourcing",
      icon: Search,
    },
    {
      title: "Deals",
      url: "/deals",
      icon: DollarSign,
    },
    {
      title: "Companies",
      url: "/companies",
      icon: Users,
    },
  ],
  user: {
    name: "John Doe",
    email: "john@acme.com",
    avatar: "/avatars/john-doe.jpg",
  },
}

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ isCollapsed = false, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  
  // Déterminer l'item actif basé sur l'URL actuelle
  const navItemsWithActive = data.navMain.map(item => {
    let isActive = false;
    
    // Correspondance exacte
    if (pathname === item.url) {
      isActive = true;
    }
    // Correspondances spéciales pour les sous-pages
    else if (item.url === "/sourcing" && pathname === "/sourcingresult") {
      isActive = true;
    }
    
    return {
      ...item,
      isActive
    };
  })
  
  return (
    <div className="relative group">
      <nav className={`${isCollapsed ? 'w-16 min-w-16' : 'w-56 min-w-56'} flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-200`}>
        {/* Logo section at the top */}
        {!isCollapsed && (
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
            <Link 
              href="/home"
              className="flex items-center gap-2 text-left"
            >
              <span className="font-semibold text-gray-900 text-sm">Dealway</span>
            </Link>
          </div>
        )}

        {/* Collapsed logo */}
        {isCollapsed && (
          <div className="flex-shrink-0 px-3 py-3 border-b border-gray-200 flex justify-center">
            <button 
              onClick={onToggle}
              className="hover:bg-gray-100 rounded p-1 transition-colors"
              title="Expand sidebar"
            >
              <span className="font-semibold text-gray-900 text-xs">D</span>
            </button>
          </div>
        )}

        {/* Navigation section */}
        <div className="flex flex-1 flex-col overflow-y-auto p-4 pb-2">
          <NavMain items={navItemsWithActive} isCollapsed={isCollapsed} />
        </div>

        {/* Footer section with Settings and Profile */}
        <div className={`flex-shrink-0 flex flex-col border-t border-gray-950/5 ${isCollapsed ? 'px-2' : 'px-4'} py-3 gap-1`}>
          {!isCollapsed ? (
            <>
              <Link
                href="/settings"
                className="flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left text-sm font-normal text-gray-600 hover:bg-gray-950/5"
              >
                <Settings className="size-4 min-w-4 max-w-4" />
                Settings
              </Link>
              <button className="group flex w-full flex-row items-center justify-between px-2 py-1 rounded-lg font-normal text-sm border-transparent text-gray-600 hover:bg-gray-50">
                <div className="flex flex-row items-center gap-3">
                  <span className="size-6 flex items-center justify-center text-white inline-grid shrink-0 bg-gray-300 outline outline-1 -outline-offset-1 outline-gray-500/20 rounded-full">
                    <User className="size-3 text-gray-600" />
                  </span>
                  <div className="text-left">
                    <p className="truncate text-xs font-semibold text-gray-900">Pierre Marie Fevelat</p>
                    <p className="truncate text-xs font-light text-gray-600">Pierre&apos;s Workspace</p>
                  </div>
                </div>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/settings"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-950/5"
                title="Settings"
              >
                <Settings className="size-4" />
              </Link>
              <button 
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-50"
                title="Pierre Marie Fevelat"
              >
                <span className="size-6 flex items-center justify-center text-white inline-grid shrink-0 bg-gray-300 outline outline-1 -outline-offset-1 outline-gray-500/20 rounded-full">
                  <User className="size-3 text-gray-600" />
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Toggle button - Style slider avec chevrons doubles */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="absolute top-4 -right-2.5 w-5 h-5 bg-transparent hover:bg-gray-100 border border-gray-300 rounded flex items-center justify-center transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronsLeft className="w-3 h-3 text-gray-500" />
            )}
          </button>
        )}
      </nav>
    </div>
  )
}
