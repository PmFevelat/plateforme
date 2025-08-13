"use client"

import { type LucideIcon } from "lucide-react"
import Link from "next/link"



export function NavMain({
  items,
  isCollapsed = false,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
  isCollapsed?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto group/nav">
      {items.map((item) => (
        <span key={item.title} className="relative">
          {item.isActive && !isCollapsed && (
            <span 
              className="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-gray-950 transition-opacity duration-150 group-hover/nav:opacity-0" 
            ></span>
          )}
          <Link
            href={item.url}
            className={`flex w-full items-center ${isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-2 py-1'} rounded-lg text-left text-sm transition-all duration-150 ${
              item.isActive 
                ? "bg-gray-950/5 font-medium text-gray-950 group-hover/nav:bg-transparent group-hover/nav:font-normal group-hover/nav:text-gray-600" 
                : "font-normal text-gray-600"
            } hover:bg-gray-950/5 hover:font-medium hover:text-gray-950`}
            title={isCollapsed ? item.title : undefined}
          >
            {item.icon && <item.icon className="size-4 min-w-4 max-w-4" />}
            {!isCollapsed && item.title}
          </Link>
        </span>
      ))}
    </div>
  )
}
