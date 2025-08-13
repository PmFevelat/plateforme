"use client";

import { useState } from "react";
import { Container, Row, Col, Section } from "@/components/ui/grid";
import { PageTitle, Description } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";
import CallsTable from "@/components/CallsTable";
import TasksCallsTable from "@/components/TasksCallsTable";
import { QuestionDetailsPanel } from "@/components/QuestionDetailsPanel";

export default function TablesPage() {
  const [activeMainTab, setActiveMainTab] = useState("transcripts");
  const [activeFilterTab, setActiveFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCallData, setSelectedCallData] = useState<{
    id: number;
    meeting: string;
    status: "Complete" | "New" | "Running";
    clients: Array<{ name: string; avatar: string; color: string }>;
    clientQuestions: string[];
    date: string;
  } | null>(null);

  const handleQuestionClick = (callData: {
    id: number;
    meeting: string;
    status: "Complete" | "New" | "Running";
    clients: Array<{ name: string; avatar: string; color: string }>;
    clientQuestions: string[];
    date: string;
  }) => {
    setSelectedCallData(callData);
    setIsPanelOpen(true);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header avec titre seulement - Même structure que Dashboard/Integrations */}
      <div className="flex-shrink-0">
        <Section spacing="sm">
          <Container>
            <Row>
              <Col span={12}>
                <div className="flex h-10 shrink-0 items-center px-2">
                  <PageTitle className="text-xl font-semibold">Tables</PageTitle>
                </div>
              </Col>
            </Row>
          </Container>
        </Section>
      </div>

      {/* Zone description - Même niveau que Dashboard/Integrations */}
      <div className="flex-shrink-0">
        <Section spacing="sm">
          <Container>
            <Row gutter="lg">
              <Col lg={8} md={10} span={12}>
                <Description className="text-sm text-gray-600 mb-3">All recorded calls analysed into editable building blocks for meetings and tasks.</Description>
              </Col>
            </Row>
            
            <Row gutter="lg">
              <Col span={12}>
                {/* Navigation à onglets principale */}
                <div className="space-y-1">
                  <div className="w-auto">
                    <div className="bg-transparent h-auto p-0 border-b border-gray-200 flex">
                      <div 
                        className={`relative bg-transparent px-0 pb-2 pt-0 font-medium text-sm shadow-none border-b-2 rounded-none mr-6 border-l-0 border-r-0 border-t-0 cursor-pointer transition-colors ${
                          activeMainTab === "transcripts" 
                            ? "text-gray-900 border-purple-500" 
                            : "text-gray-500 border-transparent hover:text-gray-900 hover:border-purple-500"
                        }`}
                        onClick={() => setActiveMainTab("transcripts")}
                      >
                        Transcripts
                      </div>
                      <div 
                        className={`relative bg-transparent px-0 pb-2 pt-0 font-medium text-sm shadow-none border-b-2 rounded-none border-l-0 border-r-0 border-t-0 cursor-pointer transition-colors ${
                          activeMainTab === "tasks" 
                            ? "text-gray-900 border-purple-500" 
                            : "text-gray-500 border-transparent hover:text-gray-900 hover:border-purple-500"
                        }`}
                        onClick={() => setActiveMainTab("tasks")}
                      >
                        Tasks
                      </div>
                    </div>
                  </div>

                  {/* Contrôles principaux - Espacés de la navigation */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Groupe de tabs et recherche */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                      {/* Tabs de filtrage selon l'onglet actif */}
                      {activeMainTab === "transcripts" && (
                        <div className="flex-shrink-0">
                          <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab} className="w-auto">
                            <TabsList className="grid w-full grid-cols-3 sm:w-auto h-8">
                              <TabsTrigger value="all" className="font-normal text-xs">All</TabsTrigger>
                              <TabsTrigger value="deal" className="font-normal text-xs">By deal</TabsTrigger>
                              <TabsTrigger value="client" className="font-normal text-xs">By client</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      )}
                      
                      {activeMainTab === "tasks" && (
                        <div className="flex-shrink-0">
                          <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab} className="w-auto">
                            <TabsList className="grid w-full grid-cols-2 sm:w-auto h-8">
                              <TabsTrigger value="all" className="font-normal text-xs">All Tasks</TabsTrigger>
                              <TabsTrigger value="my" className="font-normal text-xs">My tasks</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      )}
                      
                      {/* Barre de recherche après */}
                      <div className="w-full sm:w-80 sm:max-w-sm">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder={activeMainTab === "transcripts" ? "Search calls or type a command..." : "Search tasks..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-8"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions principales */}
                    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-2 flex-shrink-0">
                      <Button 
                        className="bg-[#BDBBFF] hover:bg-[#A8A5FF] text-black border-0 px-4 py-1.5 font-medium w-full sm:w-auto h-7 text-sm"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        New row
                      </Button>
                      <Button variant="outline" className="text-gray-600 border-gray-300 w-full sm:w-auto h-7 text-sm">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        New column
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </Section>
      </div>

            {/* Zone Table - Prend le reste de l'espace avec scroll vertical uniquement */}
      <div className="flex-1 min-h-0 bg-gray-50">
        <Section spacing="sm" className="h-full">
          <Container className="h-full">
            <Row className="h-full">
              <Col span={12} className="h-full">
                <div className="h-full">
                                      <div className="h-full overflow-y-auto overflow-x-auto">
                    {activeMainTab === "transcripts" ? (
                      <>
                        <div className="border border-gray-300 bg-white">
                          <CallsTable onQuestionClick={handleQuestionClick} />
                        </div>
                        <div 
                          onClick={() => console.log('New transcript row clicked')}
                          className="w-full flex items-center justify-center gap-1.5 px-3 h-7 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:text-purple-700 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group mt-2"
                        >
                          <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                          <span className="font-medium text-xs">New row</span>
                        </div>
                      </>
                    ) : (
                      <TasksCallsTable onNewRow={() => console.log('New row clicked')} />
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </Section>
      </div>

      {/* Question Details Panel */}
      <QuestionDetailsPanel 
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        callData={selectedCallData || undefined}
      />
      </div>
    </div>
  );
} 