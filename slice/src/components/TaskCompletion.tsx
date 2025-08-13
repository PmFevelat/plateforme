"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/typography";

interface TaskCompletionData {
  completed: number;
  pending: number;
  percentage: number;
}

interface TaskCompletionProps {
  data?: TaskCompletionData;
}

export default function TaskCompletion({ data }: TaskCompletionProps) {
  // Données par défaut si aucune n'est fournie
  const taskData = data || {
    completed: 24,
    pending: 11,
    percentage: 68
  };

  const { completed, pending, percentage } = taskData;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <SectionTitle size="sm">Task Completion</SectionTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-3 flex-1 justify-center p-4">
        {/* Graphique en donut réduit */}
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            {/* Cercle de fond */}
            <path
              className="text-gray-200"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            {/* Cercle de progression */}
            <path
              className="text-purple-500"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${percentage}, ${100 - percentage}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{percentage}%</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 text-sm w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">Completed</span>
            </div>
            <span className="font-medium text-gray-900">({completed})</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <span className="text-gray-700">Pending</span>
            </div>
            <span className="font-medium text-gray-900">({pending})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 