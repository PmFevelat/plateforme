"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, RotateCcw, Check } from 'lucide-react';

interface AIRewriteSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  onPromptUpdate: (newPrompt: string) => void;
  stepTitle?: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export default function AIRewriteSidebar({ 
  isOpen, 
  onClose, 
  originalPrompt, 
  onPromptUpdate,
  stepTitle = "Email team members"
}: AIRewriteSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentRewrite, setCurrentRewrite] = useState(originalPrompt);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input quand la sidebar s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Fermer en cliquant à l'extérieur ou sur le canvas
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const sidebar = document.querySelector('[data-ai-sidebar]');
      
      // Fermer si clic à l'extérieur de la sidebar
      if (sidebar && !sidebar.contains(target)) {
        onClose();
        return;
      }

      // Fermer aussi si clic sur le canvas ReactFlow ou ses éléments
      const reactFlowWrapper = target.closest('.react-flow');
      const reactFlowNode = target.closest('.react-flow__node');
      const reactFlowEdge = target.closest('.react-flow__edge');
      const reactFlowBackground = target.closest('.react-flow__background');
      const reactFlowControls = target.closest('.react-flow__controls');
      
      if (reactFlowWrapper || reactFlowNode || reactFlowEdge || reactFlowBackground || reactFlowControls) {
        onClose();
      }
    };

    // Délai pour éviter la fermeture immédiate lors de l'ouverture
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Initialiser avec un message de bienvenue
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: 'Hi! I can help you improve this prompt. Tell me what you\'d like to change (shorter, more detailed, different format, etc.)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Simuler une réponse de l'IA avec le nouveau prompt
    setTimeout(() => {
      // Générer un nouveau prompt basé sur la demande
      let newPrompt = currentRewrite;
      if (userInput.toLowerCase().includes('short') || userInput.toLowerCase().includes('concise') || userInput.toLowerCase().includes('brief')) {
        newPrompt = "Generate a concise summary of key meeting topics, decisions, and outcomes from {{transcript}}.";
      } else if (userInput.toLowerCase().includes('detail') || userInput.toLowerCase().includes('comprehensive') || userInput.toLowerCase().includes('complete')) {
        newPrompt = "Provide a comprehensive and detailed summary of the meeting covering all key topics, decisions, outcomes, and action items discussed in {{transcript}}.";
      } else if (userInput.toLowerCase().includes('bullet') || userInput.toLowerCase().includes('point') || userInput.toLowerCase().includes('list')) {
        newPrompt = "Organize the key points from {{transcript}} into clear, structured bullet points covering main topics and decisions.";
      } else {
        // Modification générique
        newPrompt = currentRewrite.replace(/comprehensive/g, 'focused').replace(/detailed/g, 'streamlined');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Here's the updated prompt:\n\n"${newPrompt}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setCurrentRewrite(newPrompt);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAcceptRewrite = () => {
    onPromptUpdate(currentRewrite);
    onClose();
  };

  const handleRevert = () => {
    setCurrentRewrite(originalPrompt);
  };

  if (!isOpen) return null;

  return (
    <div 
      data-ai-sidebar
      className="fixed right-0 top-[50px] h-[calc(100vh-50px)] w-96 bg-white border-l border-gray-200 z-50 shadow-lg flex flex-col"
      style={{
        transform: 'translateX(0)',
        transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animation: 'slideInSmooth 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-50">
            <Sparkles className="w-3 h-3 text-purple-600" />
          </div>
          <h2 className="text-sm font-medium text-gray-900">Rewrite with AI</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 transition-colors rounded-md hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Step info */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100">
        <div className="text-xs text-gray-500">{stepTitle}</div>
      </div>

      {/* Messages area */}
      <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] ${
                message.type === 'user'
                  ? 'bg-gray-100 text-gray-900 rounded-xl px-2.5 py-1.5'
                  : 'text-gray-900'
              }`}
            >
              <div className="text-xs leading-relaxed">
                {message.content.includes('"') ? (
                  // Si le message contient un prompt (entre guillemets), le formater spécialement
                  <div>
                    {message.content.split('\n\n').map((part, index) => (
                      <div key={index}>
                        {part.startsWith('"') && part.endsWith('"') ? (
                          <div className="p-2 mt-1 font-mono text-xs border border-gray-200 rounded bg-gray-50">
                            {part.slice(1, -1)}
                          </div>
                        ) : (
                          <span>{part}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  message.content
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {message.timestamp}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-2.5 py-1.5">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleRevert}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors h-7"
          >
            <RotateCcw className="w-3 h-3" />
            Revert
          </button>
          <button
            onClick={handleAcceptRewrite}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-gray-900 hover:bg-gray-800 rounded transition-colors h-7"
          >
            <Check className="w-3 h-3" />
            Accept
          </button>
        </div>

        {/* Input area */}
        <div className="flex items-end gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to modify the prompt..."
            className="flex-1 px-0 py-1.5 text-xs border-0 border-b border-gray-200 focus:outline-none focus:border-gray-400 bg-transparent placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
} 