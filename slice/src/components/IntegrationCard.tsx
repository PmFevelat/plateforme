"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface IntegrationCardProps {
  name: string
  description: string
  icon: string
  status: 'connected' | 'not-connected'
}

export function IntegrationCard({ 
  name, 
  description, 
  icon, 
  status
}: IntegrationCardProps) {
  const isConnected = status === 'connected'
  
  return (
    <Card className="h-[160px] relative overflow-hidden">
      <CardHeader className="pb-2 flex-shrink-0 px-4 pt-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 flex-shrink-0">
            {icon.startsWith('/images/') ? (
              <Image
                src={icon}
                alt={`${name} logo`}
                width={28}
                height={28}
                className="object-contain"
              />
            ) : (
              <span className="text-lg">{icon}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold leading-tight mb-1">{name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-tight line-clamp-2">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-0 px-4">
        {/* Contenu principal */}
      </CardContent>
      
      {/* Badges et boutons positionnés absolument */}
      <div className="absolute bottom-8 left-4 right-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            {isConnected ? (
              <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-xs px-1.5 py-0.5 h-5">
                ✓ Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-muted-foreground text-xs px-1.5 py-0.5 h-5">
                Not connected
              </Badge>
            )}
          </div>
          <div className="flex items-center">
            <Button variant="link" size="sm" className="text-[#6D28D9] hover:text-[#5B21B6] p-0 h-auto font-medium text-xs leading-none">
              {isConnected ? 'Manage' : 'Connect'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
} 