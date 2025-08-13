"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

import { Search, Grid3X3, List, ChevronLeft, ChevronRight, Edit, RefreshCw, ChevronDown } from "lucide-react";

interface Task {
  id: number;
  task: string;
  deal: string;
  meeting: string;
  assignee: string;
  assigneeAvatar: string;
  status: "In Progress" | "To Do" | "Done";
  dueDate: string;
  priority: "Urgent" | "High" | "Normal" | "Low";
}

export default function TasksTable() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedAssignee, setExpandedAssignee] = useState<number | null>(null);
  const [expandedStatus, setExpandedStatus] = useState<number | null>(null);

  const tasks: Task[] = [
    {
      id: 1,
      task: "Send pricing proposal for enterprise tier",
      deal: "ACME",
      meeting: "Discovery Call",
      assignee: "Alex",
      assigneeAvatar: "A",
      status: "In Progress",
      dueDate: "Today",
      priority: "Urgent"
    },
    {
      id: 2,
      task: "Schedule technical architecture review with engineering team",
      deal: "Global Systems",
      meeting: "Product Demo",
      assignee: "Alex",
      assigneeAvatar: "A",
      status: "To Do",
      dueDate: "Tomorrow",
      priority: "High"
    },
    {
      id: 3,
      task: "Review contract redlines with legal team",
      deal: "Innovate Corp",
      meeting: "Contract Review",
      assignee: "Emma",
      assigneeAvatar: "E",
      status: "To Do",
      dueDate: "May 29",
      priority: "Normal"
    },
    {
      id: 4,
      task: "Prepare integration documentation for client",
      deal: "DataFlow Inc.",
      meeting: "Follow-up Call",
      assignee: "Alex",
      assigneeAvatar: "A",
      status: "To Do",
      dueDate: "May 30",
      priority: "Normal"
    },
    {
      id: 5,
      task: "Respond to security questionnaire",
      deal: "TechSolutions",
      meeting: "Discovery Call",
      assignee: "Alex",
      assigneeAvatar: "A",
      status: "Done",
      dueDate: "May 25",
      priority: "Normal"
    }
  ];

  const getStatusColor = (status: Task["status"]) => {
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
  const availableStatuses: Task["status"][] = ["To Do", "In Progress", "Done"];

  return (
    <div className="space-y-4">
      {/* Filtres et contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Tabs de filtrage */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="all" 
              className="font-normal"
            >
              All Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="my" 
              className="font-normal"
            >
              My tasks
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Contrôles droite */}
        <div className="flex items-center gap-2">
          {/* Filtres dropdown */}
          <select className="w-24 h-8 text-xs border border-gray-300 rounded-md px-2">
            <option value="">Deal</option>
            <option value="all">All Deals</option>
          </select>

          <select className="w-28 h-8 text-xs border border-gray-300 rounded-md px-2">
            <option value="">Assignee</option>
            <option value="all">All</option>
          </select>

          <select className="w-24 h-8 text-xs border border-gray-300 rounded-md px-2">
            <option value="">Status</option>
            <option value="all">All</option>
          </select>

          <select className="w-20 h-8 text-xs border border-gray-300 rounded-md px-2">
            <option value="">Due</option>
            <option value="all">All</option>
          </select>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 w-40 text-xs"
            />
          </div>

          {/* Sélecteur de vue */}
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-8 w-8 p-0 ${viewMode === "grid" ? "bg-purple-100 text-purple-600" : ""}`}
            >
              <Grid3X3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-8 w-8 p-0 ${viewMode === "list" ? "bg-purple-100 text-purple-600" : ""}`}
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <input type="checkbox" className="rounded border-gray-300" />
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Deal / Meeting</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-gray-900">{task.task}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                    {task.deal} – {task.meeting}
                  </div>
                                </TableCell>
                <TableCell>
                  <div className="relative">
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setExpandedAssignee(expandedAssignee === task.id ? null : task.id)}
                    >
                      <div className="h-6 w-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                        {task.assigneeAvatar}
                      </div>
                      <span className="text-sm text-gray-900">{task.assignee}</span>
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    </div>
                    {expandedAssignee === task.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                        {availableAssignees.map((assignee) => (
                          <div
                            key={assignee}
                            className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              // Ici on pourrait mettre à jour l'assigné
                              setExpandedAssignee(null);
                            }}
                          >
                            {assignee}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <div 
                      className="cursor-pointer"
                      onClick={() => setExpandedStatus(expandedStatus === task.id ? null : task.id)}
                    >
                      <Badge className={`text-xs ${getStatusColor(task.status)} flex items-center gap-1 border-0 px-1.5 py-0.5 font-normal`}>
                        {task.status}
                        <ChevronDown className="h-3 w-3" />
                      </Badge>
                    </div>
                    {expandedStatus === task.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                        {availableStatuses.map((status) => (
                          <div
                            key={status}
                            className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              // Ici on pourrait mettre à jour le statut
                              setExpandedStatus(null);
                            }}
                          >
                            {status}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${getDueDateColor(task.dueDate)} border-0 px-1.5 py-0.5 font-normal`}>
                    {task.dueDate}
                  </Badge>
                </TableCell>
                <TableCell>
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
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing 1-8 of 24 tasks
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {[1, 2, 3].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              size="sm"
              className={`h-8 w-8 p-0 ${
                currentPage === page ? "bg-purple-600 text-white" : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 3}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 