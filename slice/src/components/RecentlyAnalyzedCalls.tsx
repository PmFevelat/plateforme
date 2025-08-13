"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTitle, CardTitleTypography, Metadata } from "@/components/ui/typography";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface Call {
  id: number;
  title: string;
  date: string;
  duration: string;
  avatars: string[];
  status: string;
  actionText: string;
}

interface RecentlyAnalyzedCallsProps {
  calls?: Call[];
}

export default function RecentlyAnalyzedCalls({ calls }: RecentlyAnalyzedCallsProps) {
  const [currentCallsPage, setCurrentCallsPage] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const cardWidth = 320; // Largeur d'une carte en px (w-80 = 20rem = 320px)
  const gap = 16; // Gap entre cartes en px (gap-4 = 1rem = 16px)
  const cardStep = cardWidth + gap; // Pas de déplacement

  // Données par défaut si aucune n'est fournie
  const recentCalls = calls || [
    {
      id: 1,
      title: "NexGen - Demo Call",
      date: "June 6",
      duration: "14 min",
      avatars: ["NX", "AB"],
      status: "Next meeting scheduled",
      actionText: "View Table row",
    },
    {
      id: 2,
      title: "TechSolutions - Discovery Call",
      date: "June 5",
      duration: "22 min",
      avatars: ["TS", "CD"],
      status: "Follow-up sent",
      actionText: "View Table row",
    },
    {
      id: 3,
      title: "Acme Corp - Negotiation Call",
      date: "June 4",
      duration: "31 min",
      avatars: ["AC"],
      status: "Tasks pending",
      actionText: "View Table row",
    },
  ];

  const handlePrevious = () => {
    const newPage = Math.max(0, currentCallsPage - 1);
    setCurrentCallsPage(newPage);
    scrollToPosition(newPage);
  };

  const handleNext = () => {
    const maxPage = Math.max(0, recentCalls.length - 1);
    const newPage = Math.min(maxPage, currentCallsPage + 1);
    setCurrentCallsPage(newPage);
    scrollToPosition(newPage);
  };

  const scrollToPosition = (page: number) => {
    if (carouselRef.current) {
      const scrollPosition = page * cardStep;
      carouselRef.current.style.transform = `translateX(-${scrollPosition}px)`;
    }
  };

  const handleCardClick = (globalIndex: number) => {
    // Navigation basée sur l'index de la carte cliquée
    if (globalIndex !== currentCallsPage) {
      setCurrentCallsPage(globalIndex);
      scrollToPosition(globalIndex);
    }
  };



  useEffect(() => {
    scrollToPosition(currentCallsPage);
  }, [currentCallsPage]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <SectionTitle size="sm">Recently analyzed calls</SectionTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handlePrevious}
            disabled={currentCallsPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleNext}
            disabled={currentCallsPage >= recentCalls.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-4">
        {/* Carrousel horizontal */}
        <div className="overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex gap-4 transition-transform duration-300 ease-in-out"
          >
            {recentCalls.map((call, globalIndex) => (
              <div 
                key={call.id} 
                className="flex-shrink-0 w-80 cursor-pointer"
                onClick={() => handleCardClick(globalIndex)}
              >
                <Card className="h-[140px] relative overflow-hidden bg-white border border-gray-200 transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
                  <CardHeader className="pb-2 flex-shrink-0 px-4 pt-3">
                    <div className="space-y-2">
                      <CardTitleTypography size="sm" className="font-medium text-gray-900 text-sm leading-tight">
                        {call.title}
                      </CardTitleTypography>
                      <Metadata className="text-gray-500 text-xs">
                        {call.date} • {call.duration}
                      </Metadata>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto font-normal bg-gray-100 text-gray-700">
                        {call.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  {/* Bouton CTA positionné absolument */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex justify-end">
                      <Button variant="link" className="h-auto p-0 text-xs text-purple-600 leading-tight font-medium hover:text-purple-700">
                        {call.actionText} <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 