"use client";


import MeetingsTable from "@/components/MeetingsTable";

export default function MeetingResultPage() {
  return (
    <div className="flex flex-col h-full bg-white p-6">
      {/* Header local pour le titre et contrôles - style Clay exact */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium text-gray-900">Sourcing Result</h1>
        </div>
      </div>

      {/* TanStack table */}
      <div className="flex-1">
        <MeetingsTable />
      </div>
    </div>
  );
} 