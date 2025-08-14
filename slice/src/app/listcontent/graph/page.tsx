"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import MarketGraph from "@/components/MarketGraph";
import EnrollmentNotification from "@/components/EnrollmentNotification";

function ListContentGraphPageContent() {
  const searchParams = useSearchParams();
  const listName = searchParams.get('name') || 'Liste inconnue';
  const listId = searchParams.get('id') || '0';

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Graphe du marché pour la liste spécifique */}
      <div className="flex-1 bg-white overflow-hidden">
        <MarketGraph />
      </div>
      
      {/* Notification d'enrollment */}
      <EnrollmentNotification />
    </div>
  );
}

export default function ListContentGraphPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ListContentGraphPageContent />
    </Suspense>
  );
}
