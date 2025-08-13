"use client"

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const activeTeam = teams[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="sm" className="pointer-events-none h-8">
          <div className="flex aspect-square size-5 items-center justify-center rounded bg-black text-white">
            <span className="text-xs font-bold">S</span>
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-medium text-xs">
              {activeTeam.name}
            </span>
            <span className="truncate text-xs text-gray-500">{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
