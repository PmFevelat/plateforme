"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTitle, CardTitleTypography, Description, Metadata } from "@/components/ui/typography";
import { ArrowRight } from "lucide-react";

interface ClientQuestion {
  id: number;
  company: string;
  question: string;
  assignee: string;
  dueDate: string;
  avatar: string;
}

interface ClientQuestionsProps {
  questions?: ClientQuestion[];
  onViewAll?: () => void;
}

export default function ClientQuestions({ questions, onViewAll }: ClientQuestionsProps) {
  // Données par défaut si aucune n'est fournie
  const clientQuestions = questions || [
    {
      id: 1,
      company: "Acme Corp - Q3 Planning",
      question: '"Can you provide more details about the implementation timeline for the new features?"',
      assignee: "X",
      dueDate: "Due today",
      avatar: "AC",
    },
    {
      id: 2,
      company: "TechStart Inc - Demo Session",
      question: '"What security certifications does your platform currently have?"',
      assignee: "X",
      dueDate: "Due in 2 days",
      avatar: "TS",
    },
    {
      id: 3,
      company: "Global Solutions - Contract Review",
      question: '"Could you clarify the terms of the SLA regarding uptime guarantees?"',
      assignee: "X",
      dueDate: "Due in 5 days",
      avatar: "GS",
    },
  ];

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <SectionTitle size="sm" className="font-medium text-gray-900">Client questions still unanswered</SectionTitle>
        <Button variant="link" className="text-purple-600 hover:text-purple-700 text-sm" onClick={handleViewAll}>
          View all <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {clientQuestions.map((item) => (
            <div key={item.id} className="space-y-1.5 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitleTypography size="sm" className="font-medium text-gray-900 text-sm leading-tight">
                    {item.company}
                  </CardTitleTypography>
                  <Description size="sm" className="mt-0.5 text-gray-600 leading-relaxed text-xs">
                    {item.question}
                  </Description>
                </div>
                <Badge 
                  variant="outline" 
                  className={`ml-3 text-xs flex-shrink-0 ${
                    item.dueDate.includes('today') ? 'border-red-200 text-red-700 bg-red-50' : 
                    item.dueDate.includes('2 days') ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 
                    'border-blue-200 text-blue-700 bg-blue-50'
                  }`}
                >
                  {item.dueDate}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                  {item.avatar}
                </div>
                <Metadata className="text-gray-500 text-xs">Assigned to {item.assignee}</Metadata>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 