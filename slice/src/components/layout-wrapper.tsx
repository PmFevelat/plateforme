"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GlobalHeader } from "@/components/global-header";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Pages qui ne doivent pas avoir de sidebar
  const noSidebarPages = ['/workflowbuilder', '/sourcingresult/table', '/sourcingresult/graph', '/listcontent', '/listcontent/table', '/listcontent/graph'];
  const noSidebarPrefixes = ['/workflowbuilder'];
  
  // Vérifier si on est sur une page de détail d'entreprise (sequences/[companyName]/table ou graph)
  const isCompanyDetailPage = pathname.includes('/sequences/') && (pathname.endsWith('/table') || pathname.endsWith('/graph'));
  
  const shouldShowSidebar = !noSidebarPages.includes(pathname) && 
                          !noSidebarPrefixes.some(prefix => pathname.startsWith(prefix)) &&
                          !isCompanyDetailPage;

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className="flex flex-col h-screen">
      <GlobalHeader />
      {shouldShowSidebar ? (
        <div className="flex flex-1 overflow-hidden">
          <SidebarProvider>
            <AppSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            <main className="flex flex-col flex-1 min-h-0">
              {children}
            </main>
          </SidebarProvider>
        </div>
      ) : (
        <main className="flex flex-col flex-1 min-h-0">
          {children}
        </main>
      )}
    </div>
  );
} 