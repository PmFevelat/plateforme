"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useSidebar } from "./ui/sidebar";
import { X, HelpCircle, Trash2, Plus, MoreHorizontal, ChevronDown, ChevronUp, Search, Check, RotateCcw, Clock, FileText } from "lucide-react";

interface QuestionDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  callData?: {
    id: number;
    meeting: string;
    status: "Complete" | "New" | "Running";
    clients: Array<{ name: string; avatar: string; color: string }>;
    clientQuestions: string[];
    date: string;
  };
}

export function QuestionDetailsPanel({ isOpen, onClose, callData }: QuestionDetailsPanelProps) {
  const [panelWidth, setPanelWidth] = useState(450);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [currentState, setCurrentState] = useState<'validate' | 'resolved'>('validate');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const { state } = useSidebar();
  
  useEffect(() => {
    const calculateWidth = () => {
      if (typeof window !== 'undefined') {
        const sidebarWidth = state === "expanded" ? 256 : 48;
        const availableWidth = window.innerWidth - sidebarWidth;
        
        if (state === "expanded") {
          const newWidth = Math.min(420, Math.max(360, availableWidth * 0.35));
          setPanelWidth(newWidth);
        } else {
          const newWidth = Math.min(520, Math.max(380, availableWidth * 0.4));
          setPanelWidth(newWidth);
        }
      }
    };
    
    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    
    return () => window.removeEventListener('resize', calculateWidth);
  }, [state]);

  const defaultCallData = {
    id: 1,
    meeting: "NexGen – Demo Call",
    status: "Complete" as const,
    clients: [
      { name: "John Smith", avatar: "JS", color: "bg-blue-600" },
      { name: "Sarah Wilson", avatar: "SW", color: "bg-green-600" }
    ],
    clientQuestions: [
      "What integrations do you offer with Slack?",
      "How does pricing scale with team size?",
      "What security certifications do you have?",
      "Can we get a demo of the enterprise features?",
      "What is the implementation timeline?"
    ],
    date: "June 10, 2025"
  };

  const data = callData || defaultCallData;

  const resolvedQuestions = [
    {
      question: "What integrations do you offer with Slack?",
      answer: "We offer comprehensive Slack integration including real-time notifications, channel-based workflows, and automated message posting.",
      resources: ["Slack Integration Guide", "API Documentation"],
      status: "resolved" as const
    },
    {
      question: "How does pricing scale with team size?",
      answer: "Our pricing starts at $10/user/month for teams up to 10 users, with volume discounts for larger teams.",
      resources: ["Pricing Sheet", "Enterprise Plans"],
      status: "resolved" as const
    },
    {
      question: "What security certifications do you have?",
      answer: "We are SOC 2 Type II certified, GDPR compliant, and maintain ISO 27001 certification.",
      resources: ["Security Compliance Doc", "Audit Reports"],
      status: "resolved" as const
    }
  ];

  const unresolvedQuestions = [
    {
      question: "Can we get a demo of the enterprise features?",
      answer: "Follow-up required with product team to schedule enterprise demo.",
      resources: ["Demo Request Form", "Enterprise Feature List"],
      status: "unresolved" as const
    },
    {
      question: "What is the implementation timeline?",
      answer: "Typical implementation takes 2-4 weeks depending on team size and complexity.",
      resources: ["Implementation Guide", "Timeline Template"],
      status: "unresolved" as const
    }
  ];

  const allQuestions = [...resolvedQuestions, ...unresolvedQuestions];

  // Initialiser les questions depuis les données
  useEffect(() => {
    if (callData?.clientQuestions) {
      setQuestions(callData.clientQuestions);
    } else {
      setQuestions(defaultCallData.clientQuestions);
    }
  }, [callData?.clientQuestions]);

  const handleEditQuestion = (index: number, newText: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = newText;
    setQuestions(updatedQuestions);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion("");
      setShowAddInput(false);
    }
  };

  const handleSearchAnswers = () => {
    setCurrentState('resolved');
  };

  const toggleQuestionExpansion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const filteredResources = (resources: string[]) => {
    if (!searchTerm) return resources;
    return resources.filter(resource => 
      resource.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div 
      className="fixed top-0 right-0 h-full bg-white shadow-xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col"
      style={{
        width: `${panelWidth}px`,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
      }}
    >
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center">
              <HelpCircle className="h-3 w-3 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              {currentState === 'validate' && 'Validate Client Questions'}
              {currentState === 'resolved' && 'Question Analysis & Follow-up'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mb-2">
          {data.meeting}
        </div>
        
        <div className="text-sm font-medium text-gray-900">
          {currentState === 'validate' && `${questions.length} detected question${questions.length !== 1 ? 's' : ''}`}
          {currentState === 'resolved' && `${resolvedQuestions.length} resolved • ${unresolvedQuestions.length} unresolved`}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentState === 'validate' && (
          <>
            {/* Questions List */}
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-none">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Question {index + 1}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteQuestion(index)}
                      className="h-5 w-5 p-0 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {editingQuestion === index ? (
                    <textarea
                      defaultValue={question}
                      className="w-full text-gray-700 leading-relaxed text-sm p-1 rounded resize-none border-0 outline-none focus:outline-none focus:ring-0 focus:border-0 bg-transparent"
                      style={{ minHeight: 'auto' }}
                      rows={Math.max(1, Math.ceil(question.length / 70))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleEditQuestion(index, e.currentTarget.value);
                        }
                        if (e.key === 'Escape') {
                          setEditingQuestion(null);
                        }
                      }}
                      onBlur={(e) => handleEditQuestion(index, e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <p 
                      className="text-gray-700 leading-relaxed text-sm p-1 rounded cursor-text hover:bg-gray-50 transition-colors"
                      onClick={() => setEditingQuestion(index)}
                    >
                      {question}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Question */}
            {showAddInput ? (
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-none">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Question {questions.length + 1}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowAddInput(false);
                      setNewQuestion("");
                    }}
                    className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter the question..."
                  className="w-full text-gray-700 leading-relaxed text-sm p-1 rounded resize-none border-0 outline-none focus:outline-none focus:ring-0 focus:border-0 bg-transparent placeholder-gray-400"
                  style={{ minHeight: 'auto' }}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddQuestion();
                    }
                    if (e.key === 'Escape') {
                      setShowAddInput(false);
                      setNewQuestion("");
                    }
                  }}
                  onBlur={() => {
                    if (newQuestion.trim()) {
                      handleAddQuestion();
                    } else {
                      setShowAddInput(false);
                      setNewQuestion("");
                    }
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <div 
                onClick={() => setShowAddInput(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:text-purple-700 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group"
              >
                <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">Add new question</span>
              </div>
            )}
          </>
        )}

        {currentState === 'resolved' && (
          <>
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search internal resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 border-gray-200 focus:border-purple-300"
              />
            </div>

            {/* Questions with Status Chips */}
            <div className="space-y-3">
              {allQuestions.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-none">
                  <div 
                    className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleQuestionExpansion(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${
                            item.status === 'resolved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.status === 'resolved' ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {item.status === 'resolved' ? 'Resolved' : 'Unresolved'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium">{item.question}</p>
                      </div>
                      {expandedQuestions.has(index) ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  
                  {expandedQuestions.has(index) && (
                    <div className="border-t border-gray-100 p-3 space-y-4">
                      {/* AI Generated Answer */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Generated Answer</h4>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-xs text-gray-700 mb-3">{item.answer}</p>
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Rewrite with AI
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs border-purple-300 text-purple-600 hover:bg-purple-50"
                            >
                              Add to follow-up email
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Internal Resources */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Internal Resources</h4>
                        <div className="space-y-2">
                          {filteredResources(item.resources).map((resource, resourceIndex) => (
                            <div key={resourceIndex} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-700">{resource}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              >
                                Attach
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Follow-up Messages */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Follow-up Messages</h4>
                        <div className="space-y-2">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-blue-800">Email to client</span>
                              <button className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-2 py-1 rounded transition-colors">
                                Preview
                              </button>
                            </div>
                            <p className="text-xs text-blue-700">Automated response with answer and resources</p>
                          </div>
                          
                          {item.status === 'unresolved' && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-orange-800">Message to internal team</span>
                                <button className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-100 px-2 py-1 rounded transition-colors">
                                  Preview
                                </button>
                              </div>
                              <p className="text-xs text-orange-700">Request for additional information or follow-up</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="flex gap-3">
          {currentState === 'validate' ? (
            <>
              <Button 
                variant="ghost" 
                className="flex-1 text-gray-600 h-9 text-sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#6D28D9] hover:bg-[#5B21B6] h-9 text-sm"
                onClick={handleSearchAnswers}
              >
                Search answers
              </Button>
            </>
          ) : (
            <Button 
              className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] h-9 text-sm"
              onClick={onClose}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 