"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Download, FileText, MessageCircleQuestion, CheckSquare } from "lucide-react";

interface WorkflowCardProps {
  title: string;
  type: 'input' | 'processing' | 'output';
  integrations?: string[];
  details?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function WorkflowCard({ 
  title, 
  type, 
  integrations = [], 
  details,
  className = "",
  style 
}: WorkflowCardProps) {
  const getCardIcon = () => {
    // Identifier le type d'opération basé sur le titre
    if (title.toLowerCase().includes('input') || title.toLowerCase().includes('transcript')) {
      return <Download className="h-3 w-3 text-blue-600" />;
    } else if (title.toLowerCase().includes('summarize') || title.toLowerCase().includes('summary')) {
      return <FileText className="h-3 w-3 text-purple-600" />;
    } else if (title.toLowerCase().includes('extract') && title.toLowerCase().includes('question')) {
      return <MessageCircleQuestion className="h-3 w-3 text-purple-600" />;
    } else if (title.toLowerCase().includes('extract') && title.toLowerCase().includes('task')) {
      return <CheckSquare className="h-3 w-3 text-purple-600" />;
    } else {
      // Fallback selon le type
      switch (type) {
        case 'input':
          return <Download className="h-3 w-3 text-blue-600" />;
        case 'processing':
          return <FileText className="h-3 w-3 text-purple-600" />;
        case 'output':
          return <MessageCircleQuestion className="h-3 w-3 text-purple-600" />;
        default:
          return <Download className="h-3 w-3 text-gray-600" />;
      }
    }
  };

  const getIconBackground = () => {
    // Tout en violet pastel #F3E8FF sauf l'input
    if (title.toLowerCase().includes('input') || title.toLowerCase().includes('transcript')) {
      return 'bg-blue-100';
    } else {
      return 'bg-[#F3E8FF]';
    }
  };

  // Combiner les intégrations et les détails en une seule liste de badges
  const allBadges = [...integrations];
  if (details) {
    allBadges.push(details);
  }

  return (
    <Card 
      className={`w-80 h-20 bg-white shadow-none rounded-xl cursor-pointer transition-all duration-200 border border-gray-400 hover:border-[#6D28D9] ${className}`}
      style={style}
    >
      <CardContent className="p-4 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${getIconBackground()} flex items-center justify-center flex-shrink-0`}>
              {getCardIcon()}
            </div>
            <h3 className="font-medium text-base text-gray-900 flex-1">{title}</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {allBadges.length > 0 && (
          <div className="flex flex-wrap gap-1" style={{ marginLeft: '44px' }}>
            {allBadges.map((badge, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-normal"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 