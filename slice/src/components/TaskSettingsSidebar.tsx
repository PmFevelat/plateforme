"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, AlertCircle, Calendar } from 'lucide-react';

interface TaskSetting {
  id: string;
  taskName: string;
  assignees: string[];
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface TaskSettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdate: (settings: TaskSetting[]) => void;
  stepTitle?: string;
  initialRecipients?: string[];
}

export default function TaskSettingsSidebar({ 
  isOpen, 
  onClose, 
  onSettingsUpdate,
  stepTitle = "Notify Teams",
  initialRecipients = []
}: TaskSettingsSidebarProps) {
  const [taskSettings, setTaskSettings] = useState<TaskSetting[]>([
    {
      id: '1',
      taskName: 'Follow up on meeting discussion',
      assignees: initialRecipients.length > 0 ? initialRecipients : ['john.doe@company.com'],
      dueDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        return date.toISOString().split('T')[0];
      })(),
      priority: 'medium'
    }
  ]);

  const [editingField, setEditingField] = useState<{ id: string; field: 'taskName' } | null>(null);
  const [newAssignees, setNewAssignees] = useState<{ [taskId: string]: string }>({});
  const [isClosing, setIsClosing] = useState(false);
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

  // Mettre à jour les assignees quand les recipients initiaux changent
  useEffect(() => {
    if (initialRecipients.length > 0) {
      setTaskSettings(prev => 
        prev.map(task => ({ ...task, assignees: initialRecipients }))
      );
    }
  }, [initialRecipients]);

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
      const sidebar = document.querySelector('[data-task-sidebar]');
      
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
      window.addEventListener('closeTaskSidebar', handleCloseEvent);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('closeTaskSidebar', handleCloseEvent);
    };
  }, [isOpen, onClose]);

  // Focus sur le champ en cours d'édition
  useEffect(() => {
    if (editingField) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [editingField]);

  // const handleAddTask = () => {
  //   const newTask: TaskSetting = {
  //     id: Date.now().toString(),
  //     taskName: 'New task',
  //     assignees: initialRecipients.length > 0 ? initialRecipients : ['john.doe@company.com'],
  //     dueDate: (() => {
  //       const date = new Date();
  //       date.setDate(date.getDate() + 3);
  //       return date.toISOString().split('T')[0];
  //     })(),
  //     priority: 'medium'
  //   };
  //   setTaskSettings(prev => [...prev, newTask]);
  // };

  // const handleRemoveTask = (id: string) => {
  //   setTaskSettings(prev => prev.filter(task => task.id !== id));
  // };

  const handleUpdateTask = (id: string, updates: Partial<TaskSetting>) => {
    setTaskSettings(prev => 
      prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const handleEditField = (id: string, field: 'taskName') => {
    setEditingField({ id, field });
  };

  const handleBlurField = () => {
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setEditingField(null);
    }
  };

  const handleAddAssignee = (taskId: string) => {
    const newAssignee = newAssignees[taskId]?.trim();
    if (newAssignee && !taskSettings.find(t => t.id === taskId)?.assignees.includes(newAssignee)) {
      handleUpdateTask(taskId, {
        assignees: [...(taskSettings.find(t => t.id === taskId)?.assignees || []), newAssignee]
      });
      setNewAssignees(prev => ({ ...prev, [taskId]: '' }));
    }
  };

  const handleRemoveAssignee = (taskId: string, assigneeToRemove: string) => {
    const task = taskSettings.find(t => t.id === taskId);
    if (task) {
      handleUpdateTask(taskId, {
        assignees: task.assignees.filter(assignee => assignee !== assigneeToRemove)
      });
    }
  };

  const handleKeyPressAssignee = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      handleAddAssignee(taskId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSaveSettings = () => {
    onSettingsUpdate(taskSettings);
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div 
      data-task-sidebar
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
            <AlertCircle className="h-3 w-3 text-blue-600" />
          </div>
          <h2 className="text-sm font-medium text-gray-900">Task Settings</h2>
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
        {taskSettings.map((task) => (
          <div key={task.id} className="border border-gray-200 p-3 space-y-3">

            {/* Task Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Task name</label>
              <div>
                {editingField?.id === task.id && editingField?.field === 'taskName' ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={task.taskName}
                    onChange={(e) => handleUpdateTask(task.id, { taskName: e.target.value })}
                    onBlur={handleBlurField}
                    onKeyDown={handleKeyDown}
                    className="w-full p-2 text-xs border border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-800"
                  />
                ) : (
                  <div
                    onClick={() => handleEditField(task.id, 'taskName')}
                    className="p-2 bg-gray-50 border border-gray-300 cursor-text hover:bg-gray-100 hover:border-purple-300 transition-colors select-text min-h-[32px] flex items-center"
                  >
                    <div className="text-xs text-gray-800 select-text flex-1">
                      {task.taskName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assignees */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Assignees</label>
              <div className="border border-gray-300 bg-white p-2.5 rounded">
                <div className="flex flex-wrap gap-2">
                  {task.assignees.map((assignee, assigneeIndex) => (
                    <div key={assigneeIndex} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      <span>{assignee}</span>
                      <button
                        onClick={() => handleRemoveAssignee(task.id, assignee)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="email"
                    value={newAssignees[task.id] || ''}
                    onChange={(e) => setNewAssignees(prev => ({ ...prev, [task.id]: e.target.value }))}
                    onKeyPress={(e) => handleKeyPressAssignee(e, task.id)}
                    placeholder="Add assignee email..."
                    className="text-xs border-none outline-none bg-transparent text-gray-500 placeholder-gray-400 min-w-20 flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Due date</label>
              <div className="relative">
                <input
                  type="date"
                  value={task.dueDate}
                  onChange={(e) => handleUpdateTask(task.id, { dueDate: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-50 transition-colors"
                />
                <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Priority</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handleUpdateTask(task.id, { priority })}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      task.priority === priority
                        ? getPriorityColor(priority)
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}



        {/* Info Message */}
        <div className="bg-gray-50 border border-gray-200 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Task tracking</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                These tasks will be automatically added to the task tracking screen in the /tasks page. 
                Assignees will receive a notification to update the status of their tasks.
              </p>
            </div>
          </div>
        </div>
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