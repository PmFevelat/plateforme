"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Edit, RefreshCw, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

interface TaskCall {
  id: number;
  meeting: string;
  task: string;
  deal: string;
  assignee: string;
  assigneeAvatar: string;
  status: "In Progress" | "To Do" | "Done";
  dueDate: string;
  priority: "Urgent" | "High" | "Normal" | "Low";
}

interface TasksCallsTableProps {
  onNewRow?: () => void;
}

export default function TasksCallsTable({ onNewRow }: TasksCallsTableProps) {
  const [expandedAssignee, setExpandedAssignee] = useState<number | null>(null);
  const [expandedStatus, setExpandedStatus] = useState<number | null>(null);

  const tasksFromCalls: TaskCall[] = [
    {
      id: 1,
      meeting: "NexGen – Demo Call",
      task: "Send security pack",
      deal: "NexGen",
      assignee: "Alex",
      assigneeAvatar: "A",
      status: "Done",
      dueDate: "Today",
      priority: "High"
    },
    {
      id: 2,
      meeting: "NexGen – Demo Call",
      task: "Schedule demo",
      deal: "NexGen",
      assignee: "Sarah",
      assigneeAvatar: "S",
      status: "To Do",
      dueDate: "Tomorrow",
      priority: "Normal"
    },
    {
      id: 3,
      meeting: "Acme Corp – Product Demo",
      task: "Create implementation timeline",
      deal: "Acme Corp",
      assignee: "Alex",
      assigneeAvatar: "A",
      status: "To Do",
      dueDate: "June 12",
      priority: "Urgent"
    },
    {
      id: 4,
      meeting: "Acme Corp – Product Demo",
      task: "Share competitor comparison sheet",
      deal: "Acme Corp",
      assignee: "Emma",
      assigneeAvatar: "E",
      status: "In Progress",
      dueDate: "June 13",
      priority: "High"
    },
    {
      id: 5,
      meeting: "TechSolutions – Discovery Call",
      task: "Share API documentation",
      deal: "TechSolutions",
      assignee: "John",
      assigneeAvatar: "J",
      status: "To Do",
      dueDate: "June 15",
      priority: "Normal"
    }
  ];

  const getStatusColor = (status: TaskCall["status"]) => {
    switch (status) {
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "To Do":
        return "bg-blue-100 text-blue-800";
      case "Done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDueDateColor = (dueDate: string) => {
    switch (dueDate) {
      case "Today":
        return "bg-red-100 text-red-800";
      case "Tomorrow":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };



  const availableAssignees = ["Alex", "Emma", "John", "Sarah"];
  const availableStatuses: TaskCall["status"][] = ["To Do", "In Progress", "Done"];

  const handleNewRow = () => {
    if (onNewRow) {
      onNewRow();
    }
    // Vous pouvez ajouter d'autres logiques ici si nécessaire
  };

  return (
    <>
      <div className="border border-gray-300 bg-white overflow-hidden">
        <Table className="min-w-[1100px] border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead className="sticky left-0 bg-gray-100 w-40 z-10 border-r border-gray-300 font-medium px-3 py-2 text-left text-xs">
                Meeting
              </TableHead>
              <TableHead className="w-40 font-medium border-r border-gray-300 px-3 py-2 text-left text-xs">Task</TableHead>
              <TableHead className="w-24 font-medium border-r border-gray-300 px-2 py-2 text-left text-xs">Deal</TableHead>
              <TableHead className="w-12 font-medium border-r border-gray-300 px-1 py-2 text-left text-xs">Assignee</TableHead>
              <TableHead className="w-12 font-medium border-r border-gray-300 px-1 py-2 text-left text-xs">Status</TableHead>
              <TableHead className="w-12 font-medium border-r border-gray-300 px-1 py-2 text-left text-xs">Due date</TableHead>
              <TableHead className="w-16 font-medium px-2 py-2 text-left text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasksFromCalls.map((task) => (
              <TableRow key={task.id} className="hover:bg-gray-50 transition-colors">
                {/* Meeting - Sticky */}
                <TableCell className="sticky left-0 bg-gray-50 hover:bg-gray-100 z-10 border-r border-gray-300 font-medium px-3 py-2 text-xs">
                  {task.meeting}
                </TableCell>

                {/* Task */}
                <TableCell className="cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-300 px-3 py-2 relative group">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-900">{task.task}</div>
                    <button className="absolute bottom-2 right-2 text-[#6D28D9] hover:text-[#5B21B6] p-0 text-xs font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                      View details
                    </button>
                  </div>
                </TableCell>

                {/* Deal */}
                <TableCell className="border-r border-gray-300 px-2 py-2">
                  <div className="space-y-1">
                    <div className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                      {task.deal}
                    </div>
                  </div>
                </TableCell>

                {/* Assignee */}
                <TableCell className="border-r border-gray-300 px-1 py-2">
                  <div className="space-y-1">
                    <div className="relative">
                      <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => setExpandedAssignee(expandedAssignee === task.id ? null : task.id)}
                      >
                        <div className="h-5 w-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                          {task.assigneeAvatar}
                        </div>
                        <span className="text-xs text-gray-900">{task.assignee}</span>
                        <ChevronDown className="h-2.5 w-2.5 text-gray-400" />
                      </div>
                      {expandedAssignee === task.id && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                          {availableAssignees.map((assignee) => (
                            <div
                              key={assignee}
                              className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setExpandedAssignee(null);
                              }}
                            >
                              {assignee}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="border-r border-gray-300 px-1 py-2">
                  <div className="space-y-1">
                    <div className="relative">
                      <div 
                        className="cursor-pointer"
                        onClick={() => setExpandedStatus(expandedStatus === task.id ? null : task.id)}
                      >
                        <Badge className={`text-xs ${getStatusColor(task.status)} flex items-center gap-1 border-0 px-1 py-0.5 font-normal`}>
                          {task.status}
                          <ChevronDown className="h-2.5 w-2.5" />
                        </Badge>
                      </div>
                      {expandedStatus === task.id && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                          {availableStatuses.map((status) => (
                            <div
                              key={status}
                              className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setExpandedStatus(null);
                              }}
                            >
                              {status}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Due date */}
                <TableCell className="border-r border-gray-300 px-1 py-2">
                  <div className="space-y-1">
                    <Badge className={`text-xs ${getDueDateColor(task.dueDate)} border-0 px-1 py-0.5 font-normal`}>
                      {task.dueDate}
                    </Badge>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-1 py-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* CTA séparé du tableau */}
      <div 
        onClick={handleNewRow}
        className="w-full flex items-center justify-center gap-1.5 px-3 h-7 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:text-purple-700 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group mt-2"
      >
        <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
        <span className="font-medium text-xs">New row</span>
      </div>
    </>
  );
} 