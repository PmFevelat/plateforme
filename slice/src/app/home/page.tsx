"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  Calendar,
  FileText,
  Search,
  ChevronDown
} from "lucide-react";

export default function HomePage() {
  const [openStatusModal, setOpenStatusModal] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const meetingsAnalyses = [
    { id: 1, company: "Pierre Marie / Slice x TechCorp Investment", type: "Investment Meeting", date: "Dec 20, 2024", status: "Analysis Ready" },
    { id: 2, company: "Sarah Chen / Slice x StartupXYZ DD", type: "Due Diligence", date: "Dec 18, 2024", status: "Report Available" },
    { id: 3, company: "Pierre Marie / Slice x Innovation Inc", type: "Follow-up Call", date: "Dec 15, 2024", status: "Analysis Ready" },
    { id: 4, company: "Alex Johnson / Slice x NextCorp Pitch", type: "Pitch Review", date: "Dec 12, 2024", status: "Report Available" },
  ];

  const upcomingCalls = [
    { id: 1, time: "14:00", company: "Pierre Marie / Slice x FutureTech", type: "Pitch Meeting", date: "Today" },
    { id: 2, time: "16:30", company: "Sarah Chen / Slice x DisruptCo", type: "First Contact", date: "Today" },
    { id: 3, time: "10:00", company: "Alex Johnson / Slice x NextGen", type: "Due Diligence", date: "Tomorrow" },
    { id: 4, time: "15:00", company: "Pierre Marie / Slice x InnovateCorp", type: "Follow-up", date: "Dec 26" },
  ];

  const [tasks, setTasks] = useState([
    { id: 1, name: "Draft legal contract for new partnership", assignee: "Pierre Marie", priority: "High", status: "In Progress" as "To Do" | "In Progress" | "Review" | "Completed", date: "Dec 20, 2024" },
    { id: 2, name: "Send technical documentation for client inquiry", assignee: "Sarah Chen", priority: "Medium", status: "To Do" as "To Do" | "In Progress" | "Review" | "Completed", date: "Dec 22, 2024" },
    { id: 3, name: "Review StartupXYZ contract", assignee: "Pierre Marie", priority: "High", status: "In Progress" as "To Do" | "In Progress" | "Review" | "Completed", date: "Dec 21, 2024" },
  ]);

  const handleStatusClick = (task: typeof tasks[0], event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setOpenStatusModal(task.id);
  };

  const closeModal = () => {
    setOpenStatusModal(null);
    setModalPosition(null);
  };

  const handleStatusChange = (taskId: number, newStatus: "To Do" | "In Progress" | "Review" | "Completed") => {
    setTasks(prev => 
      prev.map(t => 
        t.id === taskId 
          ? { ...t, status: newStatus }
          : t
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
    if (openStatusModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openStatusModal]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Review":
        return "bg-purple-100 text-purple-800";
      case "To Do":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Partie haute avec background gris */}
      <div className="bg-gray-50 px-4 pt-15 pb-4 flex-shrink-0">
                {/* Header avec titre */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome to your Slice dashboard!
          </h1>
          <p className="text-gray-600">
            Overview of your meetings and internal tasks
          </p>
        </div>
        
        {/* Grille des 2 cartes principales - largeur complète */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Card Past Meetings */}
          <div className="bg-white border border-gray-200 rounded p-6 h-64">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-start">
                <div className="p-1 bg-blue-50 rounded mt-0.5 -ml-1">
                  <FileText className="h-3 w-3 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm ml-1">Past Meetings</h3>
              </div>
              <span className="text-xs text-gray-500">{meetingsAnalyses.length}</span>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-44">
              {meetingsAnalyses.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between py-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">{meeting.company}</div>
                    <div className="text-xs text-gray-500">{meeting.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">{meeting.date}</div>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {meeting.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Upcoming Calls */}
          <div className="bg-white border border-gray-200 rounded p-6 h-64">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-start">
                <div className="p-1 bg-purple-50 rounded mt-0.5 -ml-1">
                  <Calendar className="h-3 w-3 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm ml-2">Upcoming Calls</h3>
              </div>
              <span className="text-xs text-gray-500">{upcomingCalls.length}</span>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-44">
              {upcomingCalls.map((call, index) => (
                <div key={call.id} className="flex items-start gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${
                      call.date === 'Today' ? 'bg-red-500' :
                      call.date === 'Tomorrow' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}></div>
                    {index < upcomingCalls.length - 1 && (
                      <div className="w-0.5 h-6 bg-gray-200 mt-1"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-900">{call.time}</span>
                          <span className="text-xs text-gray-900 truncate">{call.company}</span>
                        </div>
                        <div className="text-xs text-gray-500">{call.type}</div>
                      </div>
                      <div className="ml-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                          call.date === 'Today' ? 'bg-red-100 text-red-800' :
                          call.date === 'Tomorrow' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {call.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Partie basse avec background blanc - occupe tout l'espace restant */}
      <div className="bg-white flex-1 p-4">
        {/* Section Home - style workflowsclay */}
        <div className="h-full">
          {/* Header local pour le titre et contrôles - style Clay exact */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Barre de recherche */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="pl-8 pr-3 py-1.5 w-60 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 bg-white h-8"
                />
              </div>

              {/* Bouton New */}
              <Button className="bg-[#BDBBFF] hover:bg-[#A8A5FF] text-black px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1.5 transition-colors h-8">
                <Plus className="h-3.5 w-3.5" />
                New
              </Button>
            </div>
          </div>

          {/* Tableau style Clay exact */}
          <div className="bg-white">
            {/* En-têtes */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-500 border-b border-gray-200">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Assignee</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Lignes de données */}
            <div className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <div key={task.id} className="grid grid-cols-12 gap-4 px-4 py-2 hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="col-span-3 flex items-center min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-blue-600">✓</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-xs truncate">
                          {task.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <span className="text-xs text-gray-600">{task.assignee}</span>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <span className="text-xs text-gray-600">{task.date}</span>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStatusClick(task, event);
                      }}
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium hover:opacity-80 transition-colors ${getStatusColor(task.status)}`}
                    >
                      {task.status}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="col-span-1 flex items-center">
                    <button className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Ligne de fermeture pour la table */}
              <div className="border-t border-gray-200"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal dropdown pour changer le statut */}
      {openStatusModal && modalPosition && (
        <>
          {/* Overlay invisible pour fermer en cliquant à l'extérieur */}
          <div className="fixed inset-0 z-40" onClick={closeModal} />
          
          {/* Modal dropdown */}
          <div
            ref={modalRef}
            className="fixed z-50 bg-white rounded shadow-lg border border-gray-200 py-1 w-32"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
            }}
          >
            <div className="py-1">
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "To Do")}
              >
                <div className="text-xs font-medium text-gray-900">To Do</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "In Progress")}
              >
                <div className="text-xs font-medium text-gray-900">In Progress</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "Review")}
              >
                <div className="text-xs font-medium text-gray-900">Review</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "Completed")}
              >
                <div className="text-xs font-medium text-gray-900">Completed</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 