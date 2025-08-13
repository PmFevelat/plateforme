"use client";

import MarketGraph from "@/components/MarketGraph";

export default function SourcingResultGraphPage() {
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Graphe du marché */}
      <div className="flex-1 bg-white overflow-hidden">
        <MarketGraph />
      </div>
    </div>
  );
}
