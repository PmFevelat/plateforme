"use client";

import MarketGraph from "@/components/MarketGraph";
import EnrollmentNotification from "@/components/EnrollmentNotification";

export default function SourcingResultGraphPage() {
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Graphe du marché */}
      <div className="flex-1 bg-white overflow-hidden">
        <MarketGraph />
      </div>
      
      {/* Notification d'enrollment */}
      <EnrollmentNotification />
    </div>
  );
}
