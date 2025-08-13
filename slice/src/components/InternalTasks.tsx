"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTitle, CardTitleTypography, Description } from "@/components/ui/typography";
import { ArrowRight } from "lucide-react";

interface InternalTask {
  id: number;
  task: string;
  company: string;
  status: string;
  statusColor: string;
}

interface InternalTasksProps {
  tasks?: InternalTask[];
  onViewTasks?: () => void;
}

export default function InternalTasks({ tasks, onViewTasks }: InternalTasksProps) {
  // Données par défaut si aucune n'est fournie
  const internalTasks = tasks || [
    {
      id: 1,
      task: "Share SOC2 docs",
      company: "NexGen",
      status: "Overdue",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 2,
      task: "Push pricing proposal",
      company: "Acme Corp",
      status: "Today",
      statusColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: 3,
      task: "Schedule technical follow-up",
      company: "TechSolutions",
      status: "Next week",
      statusColor: "bg-blue-100 text-blue-800",
    },
  ];

  const handleViewTasks = () => {
    if (onViewTasks) {
      onViewTasks();
    }
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Overdue':
        return 'border-red-200 text-red-700 bg-red-50';
      case 'Today':
        return 'border-yellow-200 text-yellow-700 bg-yellow-50';
      default:
        return 'border-blue-200 text-blue-700 bg-blue-50';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <SectionTitle size="sm" className="font-medium text-gray-900">Internal next steps not completed</SectionTitle>
        <Button variant="link" className="text-purple-600 hover:text-purple-700 text-sm" onClick={handleViewTasks}>
          View tasks <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {internalTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <CardTitleTypography size="sm" className="font-medium text-gray-900 text-sm leading-tight">
                  {task.task}
                </CardTitleTypography>
                <Description size="sm" className="text-gray-600 text-xs">
                  {task.company}
                </Description>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ml-3 ${getBadgeStyle(task.status)}`}
              >
                {task.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 