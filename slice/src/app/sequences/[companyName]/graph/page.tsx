"use client";

import { useParams } from 'next/navigation';

export default function CompanyDetailGraphPage() {
  const params = useParams();
  const companyName = decodeURIComponent(params.companyName as string);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Zone blanche - Prend tout l'espace comme sourcingresult/graph */}
      <div className="flex-1 bg-white overflow-hidden">
        {/* Zone vide intentionnellement laissée blanche */}
      </div>
    </div>
  );
}
