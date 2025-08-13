"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Plus, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Workflow {
  id: number;
  name: string;
  steps: number;
  triggerType: "manual" | "automatic";
  totalRuns: number;
  lastRun: string;
  status: "Active" | "Draft" | "Paused";
}

interface WorkflowsTableProps {
  onNewWorkflow?: () => void;
}

export default function WorkflowsTable({ onNewWorkflow }: WorkflowsTableProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 1,
      name: "Post-Meeting Follow-up",
      steps: 5,
      triggerType: "automatic",
      totalRuns: 142,
      lastRun: "2 hours ago",
      status: "Active"
    },
    {
      id: 2,
      name: "Weekly Report Generation",
      steps: 3,
      triggerType: "manual",
      totalRuns: 28,
      lastRun: "3 days ago",
      status: "Active"
    }
  ]);
  
  const [openTriggerModal, setOpenTriggerModal] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleTriggerClick = (workflow: Workflow, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setOpenTriggerModal(workflow.id);
  };

  const closeModal = () => {
    setOpenTriggerModal(null);
    setModalPosition(null);
  };

  const handleStatusChange = (workflowId: number, newTriggerType: "manual" | "automatic") => {
    setWorkflows(prev => 
      prev.map(w => 
        w.id === workflowId 
          ? { ...w, triggerType: newTriggerType }
          : w
      )
    );
    closeModal();
  };

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
    };
    if (openTriggerModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openTriggerModal]);

  const handleNewWorkflow = () => {
    if (onNewWorkflow) {
      onNewWorkflow();
    } else {
      router.push("/newworkflow");
    }
  };

  const getStatusColor = (status: Workflow["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Paused":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTriggerTypeColor = (triggerType: Workflow["triggerType"]) => {
    switch (triggerType) {
      case "automatic":
        return "bg-blue-100 text-blue-800";
      case "manual":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-300">
              <TableHead className="w-[25%] font-medium text-gray-900 px-3 py-2 text-left text-xs">Name</TableHead>
              <TableHead className="w-[15%] font-medium text-gray-900 px-3 py-2 text-left text-xs">Steps</TableHead>
              <TableHead className="w-[20%] font-medium text-gray-900 px-3 py-2 text-left text-xs">Trigger Type</TableHead>
              <TableHead className="w-[15%] font-medium text-gray-900 px-3 py-2 text-left text-xs">Total Runs</TableHead>
              <TableHead className="w-[25%] font-medium text-gray-900 px-3 py-2 text-left text-xs">Last Run</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => (
              <TableRow key={workflow.id} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                <TableCell className="px-3 py-2">
                  <div className="relative">
                    <div className="font-medium text-gray-900 text-xs pr-16">{workflow.name}</div>
                    <Badge variant="secondary" className={`${getStatusColor(workflow.status)} text-xs absolute top-0 right-0 px-1.5 py-0.5 font-normal`}>
                      {workflow.status}
                    </Badge>
                  </div>
                </TableCell>
                
                <TableCell className="px-3 py-2">
                  <span className="text-xs text-gray-600">{workflow.steps} steps</span>
                </TableCell>
                
                <TableCell className="px-3 py-2">
                  <button
                    onClick={(event) => handleTriggerClick(workflow, event)}
                    className="flex items-center gap-2 text-xs font-medium hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
                  >
                    <Badge variant="secondary" className={`${getTriggerTypeColor(workflow.triggerType)} text-xs px-1.5 py-0.5 font-normal`}>
                      {workflow.triggerType === "automatic" ? "Automatic" : "Manual"}
                    </Badge>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </TableCell>
                
                <TableCell className="px-3 py-2">
                  <span className="text-xs font-medium text-gray-900">{workflow.totalRuns}</span>
                </TableCell>
                
                <TableCell className="px-3 py-2">
                  <span className="text-xs text-gray-600">{workflow.lastRun}</span>
                </TableCell>
              </TableRow>
            ))}
            
          </TableBody>
        </Table>
      </div>
      
      {/* CTA séparé du tableau */}
      <div 
        onClick={handleNewWorkflow}
        className="w-full flex items-center justify-center gap-1.5 px-3 h-7 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:text-purple-700 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group mt-2"
      >
        <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
        <span className="font-medium text-xs">New workflow</span>
      </div>

      {/* Modal léger pour changer le trigger type */}
      {openTriggerModal && modalPosition && (
        <>
          {/* Overlay invisible pour fermer en cliquant à l'extérieur */}
          <div className="fixed inset-0 z-40" onClick={closeModal} />
          
          {/* Modal dropdown léger */}
          <div
            ref={modalRef}
            className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-32 animate-in fade-in duration-150"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
            }}
          >
            <div className="py-1">
                              <div
                  className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleStatusChange(openTriggerModal, "automatic")}
                >
                  <div className="text-xs font-medium text-gray-900">Automatic</div>
                </div>
                
                <div
                  className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleStatusChange(openTriggerModal, "manual")}
                >
                  <div className="text-xs font-medium text-gray-900">Manual</div>
                </div>
            </div>
          </div>
        </>
      )}
    </>
  );
} 