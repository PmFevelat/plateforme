"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface MeetingDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  panelType?: 'summary';
  meetingData?: {
    id: number;
    companyName: string;
    sirenNumber: string;
    nafCode: string;
    location: string;
    ceoAge: number;
    employees: string;
    revenue: string;
    ebe: string;
    matchingScore: "high" | "medium";
    potentialBuyers: number;
  } | null;
  onAddToList?: (companyId: number) => void;
}

export default function MeetingDetailPanel({ isOpen, onClose, panelType = 'summary', meetingData, onAddToList }: MeetingDetailPanelProps) {
  const [isFullPageOpen, setIsFullPageOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fermeture du panel en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ne pas fermer si on clique sur la modale "Add to list"
      const addToListModal = document.querySelector('[data-modal="add-to-list"]');
      if (addToListModal && addToListModal.contains(event.target as Node)) {
        return;
      }
      
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Petit délai pour éviter la fermeture immédiate lors de l'ouverture
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fermeture du modal full page en cliquant en dehors - ramène au panel
  useEffect(() => {
    const handleModalClickOutside = (event: MouseEvent) => {
      // Ne pas fermer si on clique sur la modale "Add to list"
      const addToListModal = document.querySelector('[data-modal="add-to-list"]');
      if (addToListModal && addToListModal.contains(event.target as Node)) {
        return;
      }
      
      if (isFullPageOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsFullPageOpen(false);
        // Ne pas fermer le panel, juste le modal
      }
    };

    if (isFullPageOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleModalClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleModalClickOutside);
    };
  }, [isFullPageOpen]);

  // Fermeture avec la touche Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullPageOpen) {
          setIsFullPageOpen(false);
          // Ne ferme que le modal, pas le panel
        } else if (isOpen) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isFullPageOpen, onClose]);

  // Réinitialiser l'état du modal quand le panel se ferme
  useEffect(() => {
    if (!isOpen) {
      setIsFullPageOpen(false);
      setHasBeenOpened(false);
    }
  }, [isOpen]);

  // Marquer comme ouvert une fois que le panel est affiché
  useEffect(() => {
    if (isOpen && !isFullPageOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen, isFullPageOpen]);



  if (!isOpen || !meetingData) return null;

  return (
    <>
            {/* Panel - style Notion sans overlay avec animation conditionnelle */}
      {!isFullPageOpen && (
    <div 
          ref={panelRef}
          className="fixed right-0 top-[50px] h-[calc(100vh-50px)] w-[28rem] bg-white border-l border-gray-200 z-50 shadow-lg flex flex-col transition-transform duration-300 ease-out"
      style={{
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
      }}
    >
      {/* Header style Notion avec bullet points */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 bg-yellow-100">
              <div className="w-2 h-2 rounded bg-yellow-200"></div>
            </div>
            <h2 className="text-base font-semibold text-gray-900">{meetingData.companyName}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullPageOpen(true)}
              className="p-1 hover:bg-gray-100 rounded transition-colors group"
              title="See full page"
            >
              <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>


      </div>

      {/* Contenu de la page d'entreprise */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          {/* Section Company Overview */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-gray-700">Company Overview</div>
            <div className="bg-gray-50 rounded-md p-3">
              <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-gray-500">SIREN</span>
                    <span className="text-xs font-mono text-gray-900">{meetingData.sirenNumber}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-gray-500">Activité (NAF)</span>
                    <span className="text-xs font-mono text-gray-900">{meetingData.nafCode}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-gray-500">Location</span>
                    <span className="text-xs text-gray-900">{meetingData.location}</span>
                  </div>
                  </div>
                <div className="space-y-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-gray-500">CEO Age</span>
                    <span className="text-xs text-gray-900">{meetingData.ceoAge} ans</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-gray-500">Effectif</span>
                    <span className="text-xs text-gray-900">{meetingData.employees}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-gray-500">Matching Score</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium w-fit ${
                      meetingData.matchingScore === 'high' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {meetingData.matchingScore === 'high' ? 'High' : 'Med'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Financial Data */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-gray-700">Financial Data</div>
            <div className="bg-gray-50 rounded-md p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-gray-500">Revenue</span>
                  <span className="text-sm font-semibold text-gray-900">{meetingData.revenue}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-gray-500">EBE</span>
                  <span className="text-sm font-semibold text-gray-900">{meetingData.ebe}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Potential Buyers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-700">Potential Buyers ({meetingData.potentialBuyers})</div>
                    <button 
                onClick={() => alert('View all potential buyers')}
                className="text-[#6D28D9] hover:text-[#5B21B6] text-xs font-medium transition-colors"
                    >
                View more
                    </button>
            </div>
          <div className="space-y-2">
              {/* Shortlist de 3 potential buyers */}
              <div className="bg-white border border-gray-200 rounded-md p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">AB</span>
            </div>
                    <div>
                      <div className="text-xs font-medium text-gray-900">Acme Corp</div>
                      <div className="text-xs text-gray-500">Technology • Paris</div>
                </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-green-600">95%</div>
                    <div className="text-xs text-gray-500">€50M</div>
                  </div>
          </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-md p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-green-600">GS</span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-900">Global Solutions</div>
                      <div className="text-xs text-gray-500">Software • Berlin</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-green-600">88%</div>
                    <div className="text-xs text-gray-500">€35M</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-md p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-purple-600">IT</span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-900">InnoTech Partners</div>
                      <div className="text-xs text-gray-500">Consulting • Amsterdam</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-orange-600">82%</div>
                    <div className="text-xs text-gray-500">€28M</div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
          </div>

              {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded transition-colors"
            >
              Close
            </button>
                  <button 
              onClick={() => onAddToList && meetingData && onAddToList(meetingData.id)}
              className="px-3 py-1.5 text-xs font-medium text-black bg-[#BDBBFF] hover:bg-[#A8A5FF] border-0 rounded transition-colors"
                  >
              Add to list
                  </button>
                </div>
              </div>
        </div>
      )}

      {/* Modal Full Page - style Notion */}
      {isFullPageOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-8">
          <div 
            ref={modalRef}
            className="bg-white rounded shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden"
            style={{
              animation: 'modalSlideIn 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
            }}
          >
            {/* Header du modal */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-yellow-100">
                    <div className="w-3 h-3 rounded bg-yellow-200"></div>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">{meetingData.companyName}</h1>
                </div>
                <button
                  onClick={() => setIsFullPageOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Contenu du modal - version proportionnelle */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Section Company Overview */}
                <div className="space-y-4">
                  <div className="text-base font-medium text-gray-700">Company Overview</div>
                  <div className="bg-gray-50 rounded p-4">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500">SIREN</span>
                          <span className="text-sm font-mono text-gray-900">{meetingData.sirenNumber}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500">Activité (NAF)</span>
                          <span className="text-sm font-mono text-gray-900">{meetingData.nafCode}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500">Location</span>
                          <span className="text-sm text-gray-900">{meetingData.location}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500">CEO Age</span>
                          <span className="text-sm text-gray-900">{meetingData.ceoAge} ans</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500">Effectif</span>
                          <span className="text-sm text-gray-900">{meetingData.employees}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500">Matching Score</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium w-fit ${
                            meetingData.matchingScore === 'high' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {meetingData.matchingScore === 'high' ? 'High' : 'Medium'}
                          </span>
                        </div>
                      </div>
                    </div>
          </div>
        </div>

                {/* Section Financial Data */}
                <div className="space-y-4">
                  <div className="text-base font-medium text-gray-700">Financial Data</div>
                  <div className="bg-gray-50 rounded p-4">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-500 mb-1">Revenue</div>
                        <div className="text-2xl font-semibold text-gray-900">{meetingData.revenue}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-500 mb-1">EBE</div>
                        <div className="text-2xl font-semibold text-gray-900">{meetingData.ebe}</div>
                      </div>
                    </div>
                  </div>
                  </div>
                  
                {/* Section Potential Buyers */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-base font-medium text-gray-700">Potential Buyers ({meetingData.potentialBuyers})</div>
                    <button
                      onClick={() => alert('View all potential buyers')}
                      className="text-[#6D28D9] hover:text-[#5B21B6] text-xs font-medium transition-colors"
                    >
                      View all buyers
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Liste des potential buyers */}
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">AC</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">Acme Corp</div>
                            <div className="text-xs text-gray-500">Technology • Paris, France</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-green-600">95% match</div>
                          <div className="text-xs text-gray-500">€50M revenue</div>
                </div>
          </div>
            </div>

                                        <div className="bg-white border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-green-600">GS</span>
                          </div>
            <div>
                            <div className="text-sm font-medium text-gray-900">Global Solutions</div>
                            <div className="text-xs text-gray-500">Software • Berlin, Germany</div>
          </div>
        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-green-600">88% match</div>
                          <div className="text-xs text-gray-500">€35M revenue</div>
              </div>
            </div>
          </div>

                    <div className="bg-white border border-gray-200 rounded p-3">
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-purple-600">IT</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">InnoTech Partners</div>
                            <div className="text-xs text-gray-500">Consulting • Amsterdam, NL</div>
          </div>
        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-orange-600">82% match</div>
                          <div className="text-xs text-gray-500">€28M revenue</div>
                     </div>
          </div>
                </div>
                 
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-red-600">NV</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">NextVision Ltd</div>
                            <div className="text-xs text-gray-500">AI/ML • London, UK</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-orange-600">78% match</div>
                          <div className="text-xs text-gray-500">€22M revenue</div>
            </div>
                 </div>
               </div>
            </div>
              </div>
              </div>
          </div>

            {/* Footer du modal */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-2 justify-end">
          <button
                  onClick={() => setIsFullPageOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-sm transition-colors"
          >
            Close
          </button>
          <button
                  onClick={() => onAddToList && meetingData && onAddToList(meetingData.id)}
                  className="px-3 py-1.5 text-xs font-medium text-black bg-[#BDBBFF] hover:bg-[#A8A5FF] border-0 rounded-sm transition-colors"
          >
                  Add to list
          </button>
        </div>
      </div>
    </div>
        </div>
      )}
    </>
  );
} 