"use client";

import { useParams } from 'next/navigation';

export default function CompanyDetailTablePage() {
  const params = useParams();
  const companyName = decodeURIComponent(params.companyName as string);

  return (
    <div className="flex flex-col h-full bg-white p-6">
      {/* Header local pour le titre - style Clay exact comme sourcingresult */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium text-gray-900">{companyName}</h1>
        </div>
      </div>

      {/* Zone blanche - Prend le reste de l'espace */}
      <div className="flex-1 bg-white">
        {/* Zone vide intentionnellement laissée blanche */}
      </div>
    </div>
  );
}
