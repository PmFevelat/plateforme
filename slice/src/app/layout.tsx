import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { LayoutWrapper } from "@/components/layout-wrapper";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial']
});

// const stagewiseConfig = {
//   plugins: []
// };

export const metadata: Metadata = {
  title: "Slice App",
  description: "Application de gestion de workflows",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {/* Temporairement désactivé pour éviter les erreurs d'hydratation
        {process.env.NODE_ENV === 'development' && (
          <StagewiseToolbar config={stagewiseConfig} />
        )}
        */}
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
