"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MeetingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [openStatusModal, setOpenStatusModal] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      name: "Weekly Team Standup",
      owner: "Pierre Marie",
      date: "Dec 15, 2024",
      status: "Completed" as "Completed" | "Scheduled" | "In Progress" | "Cancelled"
    },
    {
      id: 2,
      name: "Client Presentation - Acme Corp", 
      owner: "Sarah Chen",
      date: "Dec 18, 2024",
      status: "Scheduled" as "Completed" | "Scheduled" | "In Progress" | "Cancelled"
    }
  ]);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleStatusClick = (meeting: typeof meetings[0], event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setOpenStatusModal(meeting.id);
  };

  const closeModal = () => {
    setOpenStatusModal(null);
    setModalPosition(null);
  };

  const handleStatusChange = (meetingId: number, newStatus: "Completed" | "Scheduled" | "In Progress" | "Cancelled") => {
    setMeetings(prev => 
      prev.map(m => 
        m.id === meetingId 
          ? { ...m, status: newStatus }
          : m
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
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white px-4 pt-15 pb-4">
      {/* Header local pour le titre et contrôles - style Clay exact */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium text-gray-900">Meetings</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-60 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 bg-white h-8"
            />
          </div>

          {/* Bouton New */}
          <Link href="/meetingresult" className="bg-[#BDBBFF] hover:bg-[#A8A5FF] text-black px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1.5 transition-colors h-8">
            <Plus className="h-3.5 w-3.5" />
            New
          </Link>
        </div>
      </div>

      {/* Tableau style Clay exact */}
      <div className="flex-1">
        <div className="bg-white">
          {/* En-têtes */}
          <div className="grid grid-cols-11 gap-4 px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-200">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Lignes de données */}
          <div className="divide-y divide-gray-100">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="grid grid-cols-11 gap-4 px-4 py-2 hover:bg-gray-50 transition-colors group cursor-pointer"
                onClick={() => router.push('/meetingresult')}
              >
                <div className="col-span-4 flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-purple-600">📅</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-xs truncate">
                        {meeting.name}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-gray-600">{meeting.owner}</span>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-gray-600">{meeting.date}</span>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleStatusClick(meeting, event);
                    }}
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium hover:opacity-80 transition-colors ${getStatusColor(meeting.status)}`}
                  >
                    {meeting.status}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </button>
                </div>
                
                <div className="col-span-1 flex items-center">
                  <button 
                    onClick={(event) => event.stopPropagation()}
                    className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
            
            {/* Ligne de fermeture pour la table */}
            <div className="border-t border-gray-200"></div>
          </div>

          {/* CTA pour nouvelle meeting - style Clay minimaliste */}
          <div className="mt-2">
            <Link href="/meetingresult" className="flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors group">
              <Plus className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">New meeting</span>
            </Link>
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
                onClick={() => handleStatusChange(openStatusModal, "Completed")}
              >
                <div className="text-xs font-medium text-gray-900">Completed</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "Scheduled")}
              >
                <div className="text-xs font-medium text-gray-900">Scheduled</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "In Progress")}
              >
                <div className="text-xs font-medium text-gray-900">In Progress</div>
              </div>
              
              <div
                className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleStatusChange(openStatusModal, "Cancelled")}
              >
                <div className="text-xs font-medium text-gray-900">Cancelled</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 