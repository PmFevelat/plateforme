"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FilterTabsProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-auto">
      <TabsList className="grid w-full grid-cols-4 h-8">
        <TabsTrigger 
          value="all" 
          className="font-normal text-xs"
        >
          All
        </TabsTrigger>
        <TabsTrigger 
          value="transcript" 
          className="font-normal text-xs"
        >
          Transcript
        </TabsTrigger>
        <TabsTrigger 
          value="communication" 
          className="font-normal text-xs"
        >
          Communication
        </TabsTrigger>
        <TabsTrigger 
          value="knowledge" 
          className="font-normal text-xs"
        >
          Knowledge Base
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
} 