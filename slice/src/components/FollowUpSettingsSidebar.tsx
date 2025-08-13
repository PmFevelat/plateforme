"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Clock, Plus, Trash2, Sparkles } from 'lucide-react';

interface FollowUpSetting {
  id: string;
  delay: number;
  delayUnit: 'minutes' | 'hours' | 'days';
  subject: string;
  body: string;
}

interface FollowUpSettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdate: (settings: FollowUpSetting[]) => void;
  stepTitle?: string;
}

// Fonction utilitaire pour rendre les variables avec un style distinct
const renderTextWithVariables = (text: string) => {
  const parts = text.split(/({{[^}]+}})/g);
  return parts.map((part, index) => {
    if (part.match(/{{[^}]+}}/)) {
      return (
        <span
          key={index}
          className="text-blue-600 font-medium"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

export default function FollowUpSettingsSidebar({ 
  isOpen, 
  onClose, 
  onSettingsUpdate,
  stepTitle = "Notify Teams"
}: FollowUpSettingsSidebarProps) {
  const [followUpSettings, setFollowUpSettings] = useState<FollowUpSetting[]>([
    {
      id: '1',
      delay: 1,
      delayUnit: 'hours',
      subject: 'Follow-up required: {{ meeting.title }}',
      body: 'Team,\n\nWe need to follow up on the meeting with {{ client.name }}. Here are the key points discussed:\n\n{{ step.output }}\n\nNext steps:\n- Review action items\n- Prepare follow-up materials\n- Schedule next touchpoint\n\nPlease coordinate on this.\n\nThanks,\n{{ user.name }}'
    }
  ]);

  const [editingField, setEditingField] = useState<{ id: string; field: 'subject' | 'body' } | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Injection des styles CSS pour l'animation ultra-smooth
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInSmooth {
        0% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(0);
        }
      }
      @keyframes slideOutSmooth {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(100%);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Fonction pour fermer avec animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200); // Durée de l'animation
  };

  // Fermer en cliquant à l'extérieur ou sur le canvas (sans désactiver le toggle)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const sidebar = document.querySelector('[data-followup-sidebar]');
      
      // Fermer si clic à l'extérieur de la sidebar
      if (sidebar && !sidebar.contains(target)) {
        handleClose();
        return;
      }

      // Fermer aussi si clic sur le canvas ReactFlow ou ses éléments
      const reactFlowWrapper = target.closest('.react-flow');
      const reactFlowNode = target.closest('.react-flow__node');
      const reactFlowEdge = target.closest('.react-flow__edge');
      const reactFlowBackground = target.closest('.react-flow__background');
      const reactFlowControls = target.closest('.react-flow__controls');
      
      if (reactFlowWrapper || reactFlowNode || reactFlowEdge || reactFlowBackground || reactFlowControls) {
        handleClose();
      }
    };

    // Écouter l'événement de fermeture depuis le toggle
    const handleCloseEvent = () => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 200);
    };

    // Délai pour éviter la fermeture immédiate lors de l'ouverture
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('closeFollowUpSidebar', handleCloseEvent);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('closeFollowUpSidebar', handleCloseEvent);
    };
  }, [isOpen, onClose]);

  // Focus sur le champ en cours d'édition
  useEffect(() => {
    if (editingField) {
      setTimeout(() => {
        if (editingField.field === 'body' && textareaRef.current) {
          textareaRef.current.focus();
        } else if (editingField.field === 'subject' && inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [editingField]);

  const handleAddFollowUp = () => {
    const newFollowUp: FollowUpSetting = {
      id: Date.now().toString(),
      delay: 1,
      delayUnit: 'days',
      subject: 'Follow-up reminder: {{ meeting.title }}',
      body: 'Team,\n\nReminder to follow up on the meeting with {{ client.name }}.\n\nPlease review the action items and next steps.\n\nThanks,\n{{ user.name }}'
    };
    setFollowUpSettings(prev => [...prev, newFollowUp]);
  };

  const handleRemoveFollowUp = (id: string) => {
    setFollowUpSettings(prev => prev.filter(setting => setting.id !== id));
  };

  const handleUpdateFollowUp = (id: string, updates: Partial<FollowUpSetting>) => {
    setFollowUpSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, ...updates } : setting
      )
    );
  };

  const handleEditField = (id: string, field: 'subject' | 'body') => {
    setEditingField({ id, field });
  };

  const handleBlurField = () => {
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      setEditingField(null);
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  const handleSaveSettings = () => {
    onSettingsUpdate(followUpSettings);
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div 
      data-followup-sidebar
      className="fixed right-0 top-[50px] h-[calc(100vh-50px)] w-96 bg-white border-l border-gray-200 z-50 shadow-lg flex flex-col"
      style={{
        transform: isClosing ? 'translateX(100%)' : 'translateX(0)',
        transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animation: isClosing 
          ? 'slideOutSmooth 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
          : 'slideInSmooth 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
            <Clock className="h-3 w-3 text-blue-600" />
          </div>
          <h2 className="text-sm font-medium text-gray-900">Follow-up Settings</h2>
        </div>
        <button
          onClick={handleSaveSettings}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Step info */}
      <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="text-xs text-gray-500">{stepTitle}</div>
      </div>

      {/* Settings area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {followUpSettings.map((setting, index) => (
          <div key={setting.id} className="border border-gray-200 p-3 space-y-3">
            {/* Header du follow-up */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                </div>
                <span className="text-xs font-medium text-gray-900">Follow-up {index + 1}</span>
              </div>
              {followUpSettings.length > 1 && (
                                  <button
                    onClick={() => handleRemoveFollowUp(setting.id)}
                    className="p-0.5 hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 className="h-3 w-3 text-gray-400" />
                  </button>
              )}
            </div>

            {/* Délai */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Delay</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={setting.delay}
                  onChange={(e) => handleUpdateFollowUp(setting.id, { delay: parseInt(e.target.value) || 1 })}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-50 transition-colors"
                />
                <select
                  value={setting.delayUnit}
                  onChange={(e) => handleUpdateFollowUp(setting.id, { delayUnit: e.target.value as 'minutes' | 'hours' | 'days' })}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-50 transition-colors"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject</label>
              <div>
                {editingField?.id === setting.id && editingField?.field === 'subject' ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={setting.subject}
                    onChange={(e) => handleUpdateFollowUp(setting.id, { subject: e.target.value })}
                    onBlur={handleBlurField}
                    onKeyDown={handleKeyDown}
                    className="w-full p-2 text-xs border border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-800"
                  />
                ) : (
                  <div
                    onClick={() => handleEditField(setting.id, 'subject')}
                    className="p-2 bg-gray-50 border border-gray-300 cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[32px] flex items-center"
                  >
                    <div className="text-xs text-gray-800 select-text flex-1">
                      {renderTextWithVariables(setting.subject)}
                    </div>
                  </div>
                )}
                
                {/* Variables and Examples button - en dessous à droite */}
                <div className="flex justify-end mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Variables and Examples clicked for subject');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Variables and Examples
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">Body</label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Rewrite with AI clicked for body');
                  }}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded font-medium transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Rewrite with AI
                </button>
              </div>
              
              <div className="relative">
                {editingField?.id === setting.id && editingField?.field === 'body' ? (
                  <textarea
                    ref={textareaRef}
                    value={setting.body}
                    onChange={(e) => handleUpdateFollowUp(setting.id, { body: e.target.value })}
                    onBlur={handleBlurField}
                    onKeyDown={handleKeyDown}
                    className="w-full h-24 p-2 text-xs border border-purple-400 resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 font-mono text-gray-800"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => handleEditField(setting.id, 'body')}
                    className="p-2 bg-gray-50 border border-gray-300 cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[96px] relative"
                  >
                    <div 
                      className="text-xs text-gray-800 leading-relaxed font-mono select-text whitespace-pre-wrap" 
                      style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                    >
                      {renderTextWithVariables(setting.body)}
                    </div>
                  </div>
                )}
                
                {/* Variables and Examples button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Variables and Examples clicked for body');
                  }}
                  className="absolute bottom-2 right-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm px-2 py-1 rounded transition-colors"
                >
                  Variables and Examples
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Bouton pour ajouter un follow-up */}
        <button
          onClick={handleAddFollowUp}
          className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-3 w-3 text-gray-500" />
          <span className="text-xs text-gray-600">Add another follow-up</span>
        </button>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            className="flex-1 px-3 py-1.5 text-xs text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 