"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Plus, Calendar, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Call {
  id: number;
  meeting: string;
  status: "Complete" | "New" | "Running";
  clients: Array<{ name: string; avatar: string; color: string }>;
  nextMeeting?: { date: string; time: string };
  salesSummary: string;
  clientQuestions: string[];
  nextSteps: Array<{ task: string; completed: boolean }>;
  followUpEmail: "Sent" | "Draft ready" | "Create draft";
  workflow?: {
    type: "choose" | "running" | "completed";
    name?: string;
    status?: string;
  };
}

interface CallsTableProps {
  onQuestionClick?: (callData: {
    id: number;
    meeting: string;
    status: "Complete" | "New" | "Running";
    clients: Array<{ name: string; avatar: string; color: string }>;
    clientQuestions: string[];
    date: string;
  }) => void;
}

export default function CallsTable({ onQuestionClick }: CallsTableProps) {
  const [openWorkflowModal, setOpenWorkflowModal] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = (callId: number, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setModalPosition({
      top: rect.top - 200,
      left: rect.left
    });
    setOpenWorkflowModal(callId);
  };

  const closeModal = () => {
    setOpenWorkflowModal(null);
    setModalPosition(null);
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
    if (openWorkflowModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openWorkflowModal]);

  // Liste des workflows disponibles
  const availableWorkflows = [
    { id: 'post-call', name: 'Post-Call Sequence', description: 'Extract insights and follow-ups' },
    { id: 'discovery', name: 'Discovery Follow-up', description: 'Generate discovery questions' },
    { id: 'demo-prep', name: 'Demo Preparation', description: 'Prepare customized demo' },
    { id: 'sales-summary', name: 'Sales Summary', description: 'Generate comprehensive summary' },
    { id: 'action-items', name: 'Action Items', description: 'Extract and assign tasks' }
  ];

  const calls: Call[] = [
    {
      id: 1,
      meeting: "NexGen – Demo Call",
      status: "Complete",
      clients: [
        { name: "Client 1", avatar: "C", color: "bg-gray-600" },
        { name: "Client 2", avatar: "D", color: "bg-gray-500" }
      ],
      nextMeeting: { date: "June 12", time: "10:00 AM" },
      salesSummary: "Client is interested in our enterprise plan with custom integrations. Their main concerns are security compliance and team onboarding process.",
      clientQuestions: [
        "What integrations do you offer with Slack?",
        "How does pricing scale with team size?",
        "What security certifications do you have?"
      ],
      nextSteps: [
        { task: "Send security pack", completed: true },
        { task: "Schedule demo", completed: false },
        { task: "Add SDR to thread", completed: false }
      ],
      followUpEmail: "Sent",
      workflow: {
        type: "completed",
        name: "Post-Call Sequence",
        status: "Completed"
      }
    },
    {
      id: 2,
      meeting: "Acme Corp – Product Demo",
      status: "New",
      clients: [
        { name: "Client A", avatar: "A", color: "bg-blue-600" },
        { name: "Client B", avatar: "B", color: "bg-green-600" }
      ],
      salesSummary: "Client needs a solution in place by Q3. Their main concern factors are implementation time and customization options. Budget is approved for enterprise tier.",
      clientQuestions: [
        "How does your solution compare to Competitor X?",
        "What is the implementation timeline?",
        "Do you offer white-labeling options?"
      ],
      nextSteps: [
        { task: "Create implementation timeline", completed: false },
        { task: "Share competitor comparison sheet", completed: false },
        { task: "Schedule call with product team", completed: false }
      ],
      followUpEmail: "Draft ready",
      workflow: {
        type: "choose"
      }
    },
    {
      id: 3,
      meeting: "TechSolutions – Discovery Call",
      status: "Running",
      clients: [
        { name: "Client X", avatar: "X", color: "bg-purple-600" },
        { name: "Client Y", avatar: "Y", color: "bg-red-600" }
      ],
      salesSummary: "Technical team evaluation with focus on API capabilities and integration options. They have an in-house dev team that would build on our platform.",
      clientQuestions: [],
      nextSteps: [
        { task: "Share API documentation", completed: false },
        { task: "Set up developer sandbox", completed: false },
        { task: "Connect with solution architect", completed: false }
      ],
      followUpEmail: "Create draft",
      workflow: {
        type: "running",
        name: "Discovery Follow-up",
        status: "Running..."
      }
    }
  ];

  const getStatusColor = (status: Call["status"]) => {
    switch (status) {
      case "Complete":
        return "bg-green-100 text-green-800";
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Running":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFollowUpEmailColor = (status: Call["followUpEmail"]) => {
    switch (status) {
      case "Sent":
        return "text-green-600";
      case "Draft ready":
        return "text-purple-600";
      case "Create draft":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getWorkflowContent = (workflow?: Call["workflow"], callId?: number) => {
    if (!workflow) {
      return (
        <button className="text-[#6D28D9] hover:text-[#5B21B6] p-0 text-xs font-medium transition-colors hover:underline">
          Choose & Run
        </button>
      );
    }

    switch (workflow.type) {
      case "choose":
        return (
          <button 
            className="text-[#6D28D9] hover:text-[#5B21B6] p-0 text-xs font-medium transition-colors hover:underline"
            onClick={(e) => callId && openModal(callId, e)}
          >
            Choose & Run
          </button>
        );
      case "running":
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 p-1 -m-1 rounded transition-colors"
            onClick={(e) => callId && openModal(callId, e)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-900">{workflow.name}</span>
              <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        );
      case "completed":
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 p-1 -m-1 rounded transition-colors"
            onClick={(e) => callId && openModal(callId, e)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-900">{workflow.name}</span>
              <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        );
      default:
        return (
          <button className="text-[#6D28D9] hover:text-[#5B21B6] p-0 text-xs font-medium transition-colors hover:underline">
            Choose & Run
          </button>
        );
    }
  };

  return (
    <div className="h-full relative">
      <Table className="min-w-[2000px] border-collapse">
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-300">
            <TableHead className="sticky left-0 bg-gray-100 w-64 z-10 border-r border-gray-300 font-medium px-3 py-2 text-left text-xs">
              Meeting
            </TableHead>
            <TableHead className="w-80 font-medium border-r border-gray-300 px-3 py-2 text-left text-xs">Workflow</TableHead>
            <TableHead className="w-64 font-medium border-r border-gray-300 px-3 py-2 text-left text-xs">Clients</TableHead>
            <TableHead className="w-80 font-medium border-r border-gray-300 px-3 py-2 text-left text-xs">Next Meeting</TableHead>
            <TableHead className="w-96 font-medium border-r border-gray-300 px-3 py-2 text-left text-xs">Sales summary</TableHead>
            <TableHead className="w-80 font-medium border-r border-gray-300 px-3 py-2 text-left text-xs">Client questions</TableHead>
            <TableHead className="w-80 font-medium border-r border-gray-300 px-3 py-2 text-left text-xs">Next Steps (Internal)</TableHead>
            <TableHead className="w-64 font-medium px-3 py-2 text-left text-xs">Follow-up email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow key={call.id} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
              {/* Meeting - Sticky with Status Badge */}
              <TableCell className="sticky left-0 bg-gray-50 hover:bg-gray-100 z-10 border-r border-gray-300 px-3 py-2">
                <div className="relative">
                  <div className="font-medium text-xs pr-16">{call.meeting}</div>
                  <Badge className={`${getStatusColor(call.status)} border-0 text-xs absolute top-0 right-0 px-1.5 py-0.5 text-xs font-normal`}>
                    {call.status}
                  </Badge>
                </div>
              </TableCell>

              {/* Workflow - Previously Status */}
              <TableCell className="border-r border-gray-300 px-3 py-2">
                {getWorkflowContent(call.workflow, call.id)}
              </TableCell>

              {/* Clients */}
              <TableCell className="border-r border-gray-300 px-3 py-2">
                <div className="flex items-center gap-1">
                  {call.clients.map((client, index) => (
                    <div key={index} className={`h-6 w-6 rounded-full ${client.color} text-white text-xs flex items-center justify-center`}>
                      {client.avatar}
                    </div>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">+{call.clients.length}</span>
                </div>
              </TableCell>

              {/* Next Meeting */}
              <TableCell className="cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-300 px-3 py-2">
                {call.nextMeeting ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span>{call.nextMeeting.date}, {call.nextMeeting.time}</span>
                    </div>
                    <button className="text-[#6D28D9] hover:text-[#5B21B6] text-xs font-medium transition-colors">
                      Schedule
                    </button>
                  </div>
                ) : (
                  <button className="text-[#6D28D9] hover:text-[#5B21B6] text-xs font-medium transition-colors">
                    <Plus className="h-3 w-3 mr-1 inline" />
                    Add next meeting
                  </button>
                )}
              </TableCell>

              {/* Sales Summary */}
              <TableCell className="cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-300 px-3 py-2">
                <div className="text-xs text-gray-700 line-clamp-3">
                  {call.salesSummary}
                </div>
                <button className="text-[#6D28D9] hover:text-[#5B21B6] p-0 text-xs mt-1 font-medium transition-colors">
                  View More
                </button>
              </TableCell>

              {/* Client Questions */}
              <TableCell className="cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-300 px-3 py-2">
                {call.clientQuestions.length > 0 ? (
                  <div className="space-y-1" onClick={() => onQuestionClick?.({
                    id: call.id,
                    meeting: call.meeting,
                    status: call.status,
                    clients: call.clients,
                    clientQuestions: call.clientQuestions,
                    date: "June 10, 2025"
                  })}>
                    {call.clientQuestions.slice(0, 2).map((question, index) => (
                      <div key={index} className="text-xs text-gray-700 hover:text-[#6D28D9] transition-colors">
                        • {question}
                      </div>
                    ))}
                    {call.clientQuestions.length > 2 && (
                      <button className="text-[#6D28D9] hover:text-[#5B21B6] p-0 text-xs font-medium transition-colors">
                        View All ({call.clientQuestions.length} questions)
                      </button>
                    )}
                  </div>
                ) : (
                  <button className="text-[#6D28D9] hover:text-[#5B21B6] text-xs font-medium transition-colors">
                    <Plus className="h-3 w-3 mr-1 inline" />
                    Add Questions
                  </button>
                )}
              </TableCell>

              {/* Next Steps */}
              <TableCell className="border-r border-gray-300 px-3 py-2">
                <div className="space-y-1">
                  {call.nextSteps.slice(0, 3).map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <input 
                        type="checkbox" 
                        checked={step.completed}
                        className="h-3 w-3 rounded border-gray-300"
                        readOnly
                      />
                      <span className={step.completed ? "line-through text-gray-500" : "text-gray-700"}>
                        {step.task}
                      </span>
                    </div>
                  ))}
                  <Button variant="link" size="sm" className="text-purple-600 p-0 h-auto text-xs">
                    + Add task
                  </Button>
                </div>
              </TableCell>

              {/* Follow-up Email */}
              <TableCell className="cursor-pointer hover:bg-gray-100 transition-colors px-3 py-2">
                <span className={`text-xs font-medium ${getFollowUpEmailColor(call.followUpEmail)}`}>
                  {call.followUpEmail}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Workflow Dropdown */}
      {openWorkflowModal && modalPosition && (
        <>
          {/* Invisible overlay for click outside */}
          <div className="fixed inset-0 z-40" onClick={closeModal} />
          
          {/* Simple dropdown */}
          <div
            ref={modalRef}
            className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-64 animate-in fade-in duration-150"
            style={{
              top: modalPosition.top + 40,
              left: modalPosition.left,
            }}
          >
            {/* Current workflow re-run option if any */}
            {(() => {
              const currentCall = calls.find(c => c.id === openWorkflowModal);
              const currentWorkflow = currentCall?.workflow;
              
              if (currentWorkflow && currentWorkflow.type !== "choose" && currentWorkflow.name) {
                return (
                  <div className="px-3 py-2 border-b border-gray-100">
                    <button className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-1 -m-1 rounded transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">Re-run:</div>
                        <span className="text-xs font-medium text-gray-900">{currentWorkflow.name}</span>
                      </div>
                      <div className="text-xs text-[#6D28D9]">↻</div>
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            {/* Available workflows dropdown list */}
            <div className="py-1">
              {availableWorkflows
                .filter(w => {
                  const currentCall = calls.find(c => c.id === openWorkflowModal);
                  return w.name !== currentCall?.workflow?.name;
                })
                .slice(0, 4)
                .map((workflow) => (
                  <div
                    key={workflow.id}
                    className="group relative px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={closeModal}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 group-hover:text-[#6D28D9] transition-colors">
                          {workflow.name}
                        </div>
                        <div className="text-xs text-gray-500">{workflow.description}</div>
                      </div>
                      
                      {/* CTA qui apparaît au hover */}
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                        <div className="border border-[#6D28D9] text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors">
                          Run
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 