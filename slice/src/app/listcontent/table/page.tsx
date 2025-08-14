"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ListContentTable from '@/components/ListContentTable';
import EnrollmentNotification from '@/components/EnrollmentNotification';

function ListContentTablePageContent() {
  const searchParams = useSearchParams();
  const listName = searchParams.get('name') || 'Liste inconnue';
  const listId = searchParams.get('id') || '0';

  return (
    <div className="flex flex-col h-full bg-white p-6">
      {/* Header local pour le titre et contrôles - style Clay exact */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium text-gray-900">{listName}</h1>
        </div>
      </div>

      {/* TanStack table */}
      <div className="flex-1">
        <ListContentTable listId={listId} listName={listName} />
      </div>
      
      {/* Notification d'enrollment */}
      <EnrollmentNotification />
    </div>
  );
}

export default function ListContentTablePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ListContentTablePageContent />
    </Suspense>
  );
}
