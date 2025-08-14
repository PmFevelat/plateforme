"use client";

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

export default function EnrollmentNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const handleEnrollment = (event: CustomEvent) => {
      setCompanyName(event.detail.companyName);
      setIsVisible(true);
      
      // Masquer après 3 secondes
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    window.addEventListener('companyEnrolled', handleEnrollment as EventListener);
    
    return () => {
      window.removeEventListener('companyEnrolled', handleEnrollment as EventListener);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[70] bg-green-50 border border-green-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-2">
      <div className="flex-shrink-0">
        <Check className="h-4 w-4 text-green-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-green-800">Successfully enrolled!</p>
        <p className="text-xs text-green-600">{companyName} has been added to the sequence.</p>
      </div>
    </div>
  );
}
