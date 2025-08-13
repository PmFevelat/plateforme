"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur Slice
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Votre application de gestion de workflows
          </p>
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Fonctionnalités disponibles
            </h2>
            <ul className="space-y-2 text-left">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Gestion des réunions
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Création de workflows
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Intégrations
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Gestion des tâches
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 