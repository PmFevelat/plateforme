"use client";

import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

import { useSidebar } from "./ui/sidebar";
import { X, Search, FileText, MessageCircle, User, MoreHorizontal, ChevronRight, Wand2, Send, Check, Settings, Mail, AlertTriangle, Eye } from "lucide-react";

interface NodeLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NodeLibraryPanel({ isOpen, onClose }: NodeLibraryPanelProps) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [panelWidth, setPanelWidth] = useState(420); // Valeur fixe pour éviter l'hydratation
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [configNode, setConfigNode] = useState<string | null>(null);
  const [stepName, setStepName] = useState("Extract Client Questions");
  const [promptText, setPromptText] = useState("Extract all customer questions from the {{transcript}}. Format each question with the {{speaker}} name and timestamp. Only include explicit questions that require follow-up.");

  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("slack");
  const [emailSubject, setEmailSubject] = useState("Questions from {{deal_name}} - {{call_date}}");
  const [emailBody, setEmailBody] = useState("Hi {{recipient_name}}, Here are the questions from our call earlier today: {{extracted_questions}} Let me know if anything is missing. Best, {{sales_rep}}");
  const { state } = useSidebar();
  
  useEffect(() => {
    const calculateWidth = () => {
      if (typeof window !== 'undefined') {
        const sidebarWidth = state === "expanded" ? 256 : 48;
        const availableWidth = window.innerWidth - sidebarWidth;
        
        // Ajuster la largeur selon l'état de la sidebar
        if (state === "expanded") {
          // Sidebar étendue : largeur équilibrée avec marge confortable
          const newWidth = Math.min(420, Math.max(360, availableWidth * 0.35));
          setPanelWidth(newWidth);
        } else {
          // Sidebar repliée : on peut utiliser plus d'espace
          const newWidth = Math.min(520, Math.max(380, availableWidth * 0.4));
          setPanelWidth(newWidth);
        }
      }
    };
    
    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    
    return () => window.removeEventListener('resize', calculateWidth);
  }, [state]);

  const tabs = ["All", "Summaries", "Questions", "Tasks", "Scheduling"];

  const nodes = [
    {
      id: "qualification-summary",
      title: "Qualification Summary",
      description: "Extracts MEDDIC / BANT qualification data from the transcript",
      category: "Summaries",
      icon: FileText,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      id: "summarize-call-client",
      title: "Summarize call (client)",
      description: "Create a client facing summary of the call",
      category: "Summaries",
      icon: User,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      id: "generate-next-steps",
      title: "Generate Next steps",
      description: "Creates actionable steps from the conversation",
      category: "Tasks",
      icon: FileText,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      id: "extract-questions",
      title: "Extract client questions",
      description: "",
      category: "Questions",
      icon: MessageCircle,
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600"
    }
  ];

  const filteredNodes = nodes.filter(node => {
    const matchesTab = activeTab === "All" || node.category === activeTab;
    const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Configuration view for Extract Client Questions
  if (configNode === "extract-questions") {
    return (
      <div 
        className="fixed top-0 right-0 h-full bg-white z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col"
        style={{
          width: `${panelWidth}px`,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10 p-4">
          {/* Title and Close */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                <MessageCircle className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">Extract Client Questions</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setConfigNode(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-gray-700 p-0 h-auto font-normal"
              onClick={() => setConfigNode(null)}
            >
              Node library
            </Button>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-gray-500">Extract Client Questions</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* General */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                    <Settings className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">General</h3>
                </div>
                <p className="text-sm text-gray-500 ml-9">Basic configuration settings for this workflow step</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">Step name</label>
                  <Input
                    value={stepName}
                    onChange={(e) => setStepName(e.target.value)}
                    className="h-8 bg-white text-sm"
                    placeholder="Enter step name..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                    <Wand2 className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Prompt Configuration</h3>
                </div>
                <p className="text-sm text-gray-500 ml-9">The extraction prompt sent to the AI model to analyze transcripts</p>
              </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-700">Extraction prompt</label>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-[#6D28D9] hover:text-[#5B21B6] p-0 h-auto text-xs flex items-center gap-1"
                    onClick={() => setIsAiChatOpen(true)}
                  >
                    <Wand2 className="h-2.5 w-2.5" />
                    Rewrite with AI
                  </Button>
                </div>
                <div className="relative">
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full h-28 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent font-mono bg-white"
                    placeholder="Enter your prompt here..."
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {promptText.length}/500
                  </div>
                </div>
              </div>
              
                              <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">Available tokens</label>
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5">{"{{transcript}}"}</Badge>
                    <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5">{"{{speaker}}"}</Badge>
                    <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5">{"{{deal_name}}"}</Badge>
                  </div>
                </div>

              {/* AI Chat Interface */}
              {isAiChatOpen && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Ask AI to improve your prompt</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsAiChatOpen(false);
                        setAiChatInput("");
                        setAiSuggestion("");
                      }}
                      className="h-6 w-6 p-0 text-purple-700 hover:bg-purple-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Quick suggestions */}
                  <div className="space-y-2">
                    <label className="text-xs text-purple-700">Quick suggestions:</label>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "Make it more specific",
                        "Add more context",
                        "Improve clarity",
                        "Make it shorter"
                      ].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs px-2 text-purple-700 border-purple-300 hover:bg-purple-100"
                          onClick={() => setAiChatInput(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Input area */}
                  <div className="flex gap-2">
                    <Input
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      placeholder="Tell AI how to improve the prompt..."
                      className="text-sm h-8 border-purple-300 focus:border-purple-500 bg-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setAiSuggestion("Extract all customer questions from the {{transcript}}, including context around each question. Format each question with the {{speaker}} name, timestamp, and surrounding conversation context. Prioritize explicit questions that require follow-up, and identify implicit concerns or requests for clarification.");
                          setAiChatInput("");
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-[#6D28D9] hover:bg-[#5B21B6]"
                      onClick={() => {
                        setAiSuggestion("Extract all customer questions from the {{transcript}}, including context around each question. Format each question with the {{speaker}} name, timestamp, and surrounding conversation context. Prioritize explicit questions that require follow-up, and identify implicit concerns or requests for clarification.");
                        setAiChatInput("");
                      }}
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {aiSuggestion && (
                    <div className="p-3 bg-white border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                          <Wand2 className="h-2.5 w-2.5 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-purple-900">AI Suggestion</span>
                      </div>
                      <p className="text-xs text-gray-700 mb-2 font-mono leading-relaxed">{aiSuggestion}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="h-6 text-xs px-2 bg-[#6D28D9] hover:bg-[#5B21B6]"
                          onClick={() => {
                            setPromptText(aiSuggestion);
                            setIsAiChatOpen(false);
                            setAiSuggestion("");
                            setAiChatInput("");
                          }}
                        >
                          <Check className="h-2.5 w-2.5 mr-1" />
                          Apply
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 text-xs px-2 border-gray-300"
                          onClick={() => setAiSuggestion("")}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Delivery</h3>
              </div>
              <p className="text-sm text-gray-500 ml-9">How and where to send the extracted questions to recipients</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Channel</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedChannel === "slack" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 ${selectedChannel === "slack" ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200" : ""}`}
                    onClick={() => setSelectedChannel("slack")}
                  >
                    # Slack
                  </Button>
                  <Button
                    variant={selectedChannel === "email" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 ${selectedChannel === "email" ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200" : ""}`}
                    onClick={() => setSelectedChannel("email")}
                  >
                    ✉ Email
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Recipients</label>
                {selectedChannel === "slack" ? (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">To</div>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" className="flex items-center gap-1 bg-white">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        Alex Morgan
                        <X className="h-3 w-3 cursor-pointer hover:text-red-500" />
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 bg-white">
                        # sales-team
                        <X className="h-3 w-3 cursor-pointer hover:text-red-500" />
                      </Badge>
                    </div>
                    <Input
                      placeholder="Search teammates or channels..."
                      className="h-8 text-sm bg-white"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">To</div>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" className="flex items-center gap-1 bg-white">
                        jane@acme.com
                        <X className="h-3 w-3 cursor-pointer hover:text-red-500" />
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 bg-white">
                        sales-team@acme.com
                        <X className="h-3 w-3 cursor-pointer hover:text-red-500" />
                      </Badge>
                    </div>
                    <Input
                      placeholder="Search teammates or enter address..."
                      className="h-8 text-sm bg-white"
                    />
                    <Button variant="link" size="sm" className="text-[#6D28D9] p-0 h-auto text-xs">
                      + Add CC/BCC
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Who should deliver this message?</label>
                <div className="space-y-2">
                  {selectedChannel === "slack" ? (
                    <>
                      <div className="flex items-center gap-3 p-2 rounded-md border-2 border-purple-200 bg-purple-50">
                        <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                        <span className="text-sm font-medium">Slice Bot</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>
                        <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Me- PMF</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-2 rounded-md border-2 border-purple-200 bg-purple-50">
                        <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                        <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">Me- PMF</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>
                        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                        <span className="text-sm">Slice Bot</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Email-specific fields */}
              {selectedChannel === "email" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Subject</label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="h-8 text-sm font-mono bg-white"
                    />
                    <div className="flex gap-2 flex-wrap mt-1">
                      <Badge variant="secondary" className="text-xs bg-gray-200">{"{{deal_name}}"}</Badge>
                      <Badge variant="secondary" className="text-xs bg-gray-200">{"{{speaker}}"}</Badge>
                      <Badge variant="secondary" className="text-xs bg-gray-200">{"{{call_date}}"}</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Email body template</label>
                      <Button variant="link" size="sm" className="text-[#6D28D9] p-0 h-auto text-xs">
                        Rewrite with AI
                      </Button>
                    </div>
                    
                    {/* Rich text editor toolbar */}
                    <div className="flex gap-1 p-2 border border-gray-200 rounded-t-lg bg-gray-100">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 font-bold">B</Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 italic">I</Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">☰</Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">🔗</Button>
                    </div>
                    
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full h-20 p-3 border border-gray-200 rounded-b-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent font-mono border-t-0 bg-white"
                    />
                    <div className="text-xs text-gray-400 mt-1">485 chars</div>
                    <div className="text-xs text-gray-500 italic mt-1">
                      Slice will embed the extracted questions into {"{{extracted_questions}}"}.
                    </div>
                  </div>
                </>
              )}
            </div>
            </div>
          </div>

          {/* Escalation & Follow ups */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                    <AlertTriangle className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Escalation & Follow ups</h3>
                </div>
                <p className="text-sm text-gray-500 ml-9">Automated follow-up settings and escalation rules for unanswered questions</p>
              </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">Retry settings</label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Follow-up count</label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="w-8 h-8 p-0">-</Button>
                      <span className="w-8 text-center font-medium">2</span>
                      <Button variant="outline" size="sm" className="w-8 h-8 p-0">+</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Send follow-up email after</label>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">2 days</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        → 2 messages
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Escalate if unanswered</label>
                  <div className="relative inline-block w-10 h-6">
                    <div className="w-10 h-6 bg-[#6D28D9] rounded-full border border-gray-400"></div>
                    <div className="absolute w-4 h-4 bg-white rounded-full border border-gray-300 top-1 right-1 transition"></div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Assign to person</label>
                  <Input
                    placeholder="Search teammates..."
                    className="h-8 text-sm bg-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Ticket template</label>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700 font-mono">
                      Customer {"{{customer_name}}"} has questions from {"{{call_date}}"} that need attention. Please review and respond ASAP.
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 italic">
                  Slice will create an internal task if no reply is logged after the last follow-up.
                </p>
              </div>
            </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                    <Eye className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Preview</h3>
                </div>
                <p className="text-sm text-gray-500 ml-9">How recipients will see the extracted questions in their final message</p>
              </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="space-y-3 text-sm">
                  <p>Hi Jane,</p>
                  <p>Here are the questions from our call earlier today:</p>
                  <div className="space-y-2">
                                         <div>
                       <span className="font-medium">1. John (Client):</span> &quot;Can you explain how the integration with Salesforce works?&quot; [00:12:45]
                     </div>
                     <div>
                       <span className="font-medium">2. John (Client):</span> &quot;What&apos;s the timeline for implementing the new features?&quot; [00:18:30]
                     </div>
                  </div>
                  <p>Let me know if anything is missing.</p>
                  <p>Best, Alex</p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 p-3 z-10">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 h-9"
              onClick={() => setConfigNode(null)}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              className="flex-1 h-9 bg-[#6D28D9] hover:bg-[#5B21B6]"
              onClick={() => setConfigNode(null)}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed top-0 right-0 h-full bg-white z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col"
      style={{
        width: `${panelWidth}px`,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
      }}
    >
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white border-b z-10 p-4">
          <div className="grid grid-cols-12 gap-3">
            {/* Title Section - 9 cols */}
            <div className="col-span-9">
              <h2 className="text-lg font-semibold tracking-tight">Node library</h2>
            </div>
            
            {/* Close Button - 3 cols */}
            <div className="col-span-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search Bar - Full width */}
            <div className="col-span-12">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                <Input
                  placeholder="Enrich..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>

            {/* Tabs - Full width */}
            <div className="col-span-12">
              <div className="flex flex-wrap gap-1.5">
                {tabs.map((tab) => (
                  <Badge
                    key={tab}
                    variant={activeTab === tab ? "default" : "secondary"}
                    className={`cursor-pointer px-2.5 py-1 text-xs font-medium transition-colors ${
                      activeTab === tab 
                        ? "bg-purple-100 text-purple-700 hover:bg-purple-100" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content - Flex 1 avec scroll interne */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-12 gap-3">
            {activeTab === "All" || activeTab === "Summaries" ? (
              <div className="col-span-12 mb-4">
                <div className="grid grid-cols-12 gap-3">
                  {/* Section Title */}
                  <div className="col-span-12">
                    <h3 className="text-base font-semibold tracking-tight mb-3">Summaries</h3>
                  </div>
                  
                  {/* Node Cards */}
                  {filteredNodes.filter(node => node.category === "Summaries").map((node) => (
                    <div key={node.id} className="col-span-12">
                      <Card 
                        className={`p-3 cursor-pointer transition-all duration-200 border rounded-lg shadow-none ${
                          selectedNode === node.id 
                            ? "border-purple-400" 
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                      >
                        <div className="grid grid-cols-12 gap-2.5 items-start">
                          <div className="col-span-2">
                            <div className={`w-6 h-6 rounded-full ${node.bgColor} flex items-center justify-center`}>
                              <node.icon className={`h-3.5 w-3.5 ${node.iconColor}`} />
                            </div>
                          </div>
                          <div className="col-span-10">
                            <h4 className="font-medium text-sm leading-tight">{node.title}</h4>
                            {node.description && (
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{node.description}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "All" || activeTab === "Questions" ? (
              <div className="col-span-12 mb-4">
                <div className="grid grid-cols-12 gap-3">
                  {/* Section Title */}
                  <div className="col-span-12">
                    <h3 className="text-base font-semibold tracking-tight mb-3">Questions</h3>
                  </div>
                  
                  {/* Question Cards */}
                  {filteredNodes.filter(node => node.category === "Questions").map((node) => (
                    <div key={node.id} className="col-span-12">
                      <Card 
                        className={`p-3 cursor-pointer transition-all duration-200 border rounded-lg shadow-none ${
                          selectedNode === node.id 
                            ? "border-purple-400" 
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        onClick={() => {
                          if (node.id === "extract-questions") {
                            setConfigNode(node.id);
                          } else {
                            setSelectedNode(selectedNode === node.id ? null : node.id);
                          }
                        }}
                      >
                        <div className="grid grid-cols-12 gap-2.5 items-center">
                          <div className="col-span-2">
                            <div className={`w-6 h-6 rounded-full ${node.bgColor} flex items-center justify-center`}>
                              <node.icon className={`h-3.5 w-3.5 ${node.iconColor}`} />
                            </div>
                          </div>
                          <div className="col-span-9">
                            <span className="font-medium text-sm">{node.title}</span>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <MoreHorizontal className="h-3.5 w-3.5 text-gray-400" />
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                  
                  {/* Placeholder dots */}
                  <div className="col-span-12 text-center py-6">
                    <p className="text-gray-500 text-sm font-medium">...</p>
                  </div>
                </div>
              </div>
            ) : null}

          </div>
        </div>



        {/* Footer - Collé en bas du panel visible */}
        <div className="bg-white border-t border-gray-200 p-4 z-10">
          <div className="grid grid-cols-12 gap-3">
            {/* Instruction text */}
            <div className="col-span-12 text-center mb-3">
              <p className="text-gray-400 text-xs">Drag nodes to the canvas or click to add</p>
            </div>
            
            {/* Add Selected Node Button */}
            <div className="col-span-12">
              <Button className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] h-9 text-sm font-medium">
                Add selected node
              </Button>
            </div>
          </div>
        </div>
    </div>
  );
} 