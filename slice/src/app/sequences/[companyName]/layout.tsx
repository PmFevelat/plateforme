"use client";

import { ReactNode } from 'react';

interface CompanyDetailLayoutProps {
  children: ReactNode;
  params: {
    companyName: string;
  };
}

export default function CompanyDetailLayout({ children, params }: CompanyDetailLayoutProps) {
  // Décoder le nom de l'entreprise depuis l'URL
  const decodedCompanyName = decodeURIComponent(params.companyName);
  
  return (
    <div className="flex flex-col h-full">
      {children}
    </div>
  );
}
