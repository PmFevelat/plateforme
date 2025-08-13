# Plan de développement - Application d'Intégrations

## Vue d'ensemble
Transformation d'une maquette en application Next.js avec shadcn/ui pour une interface d'intégrations d'entreprise.

## Composants UI à créer

### 1. **Sidebar** (`src/components/Sidebar.tsx`) ✅
- [x] Navigation latérale avec logo ACME Sales Team
- [x] Menu items : Dashboard, Workflows, Tables, Integrations, Settings
- [x] État actif pour "Integrations"
- [x] Icônes avec lucide-react
- [x] Responsive design

### 2. **Header** (`src/components/Header.tsx`) ✅
- [x] Titre principal "Integrations"
- [x] Sous-titre descriptif "Connect the tools you use to streamline your post-call workflows."
- [x] Bouton "Add Integration" avec icône +
- [x] Utilisation du composant Button de shadcn/ui

### 3. **SearchBar** (`src/components/SearchBar.tsx`) ✅
- [x] Barre de recherche avec placeholder "Search integrations..."
- [x] Icône de recherche (lucide-react)
- [x] Utilisation du composant Input de shadcn/ui
- [x] État de recherche

### 4. **FilterTabs** (`src/components/FilterTabs.tsx`) ✅
- [x] Onglets de filtrage : All, Transcript, Communication, Knowledge Base
- [x] État actif pour "All"
- [x] Logique de filtrage
- [x] Style personnalisé pour les onglets

### 5. **IntegrationCard** (`src/components/IntegrationCard.tsx`) ✅
- [x] Carte réutilisable pour chaque intégration
- [x] Props : icône, nom, description, statut, statistiques
- [x] Boutons d'action (Connect/Manage)
- [x] Badge de statut (Connected/Not connected)
- [x] Utilisation du composant Card de shadcn/ui
- [x] Gestion des états de connexion

### 6. **SectionHeader** (`src/components/SectionHeader.tsx`) ✅
- [x] En-têtes de section avec titre et description
- [x] Sections : "Transcript Sources", "Communication Channels", "Knowledge Bases & CRMs"
- [x] Typography cohérente

### 7. **Layout principal** ✅
- [x] Modification de `src/app/layout.tsx`
- [x] Structure avec sidebar + contenu principal
- [x] Responsive design

## Structure de données

### Interface Integration ✅
```typescript
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'transcript' | 'communication' | 'knowledge';
  isConnected: boolean;
  workflowsUsed: number;
  connections: number;
  autoSuggestion?: boolean;
  autoFill?: boolean;
}
```

### Données mockées ✅
- [x] Créer `src/lib/integrations-data.ts`
- [x] Données pour toutes les intégrations visibles dans la maquette

## Intégrations à implémenter

### Transcript Sources
- [ ] Zoom (Connected - 12 workflows, 4 connections)
- [ ] Google Meet (Not connected - 5 workflows, 2 connections)
- [ ] Microsoft Teams (Not connected - 3 connections)
- [ ] Gong (Not connected - 10 workflows, 2 connections)

### Communication Channels
- [ ] Slack (Connected - 6 workflows, 2 teams)
- [ ] Gmail (Not connected - 8 workflows, 3 connections)
- [ ] Outlook (Not connected - 4 workflows, 1 connection)
- [ ] Teams Chat (Not connected - 5 workflows, 2 teams)

### Knowledge Bases & CRMs
- [ ] Notion (Connected - 9 workflows, auto-suggestion enabled)
- [ ] Google Drive (Not connected - 7 workflows, 3 connections)
- [ ] Confluence (Not connected - 4 workflows, 1 connection)
- [ ] Salesforce (Not connected - 11 workflows, auto-suggestion enabled)
- [ ] HubSpot (Not connected - 5 workflows, 2 connections)

## Configuration technique

### shadcn/ui ✅
- [x] Vérification de l'installation
- [x] Installation des composants : button, card, input, badge, separator
- [x] Configuration du thème et des couleurs

### Styling
- [ ] Configuration Tailwind CSS
- [ ] Variables CSS personnalisées
- [ ] Thème cohérent avec la maquette

### Structure des fichiers
```
src/
├── components/
│   ├── ui/ (shadcn/ui components)
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── SearchBar.tsx
│   ├── FilterTabs.tsx
│   ├── IntegrationCard.tsx
│   └── SectionHeader.tsx
├── lib/
│   ├── utils.ts
│   └── integrations-data.ts
└── app/
    ├── layout.tsx (modifié)
    ├── page.tsx (remplacé)
    └── globals.css
```

## Étapes de développement

1. [x] Installation et configuration de shadcn/ui
2. [x] Création des données mockées
3. [x] Développement du Sidebar
4. [x] Développement du Header
5. [x] Développement de la SearchBar et FilterTabs
6. [x] Développement de l'IntegrationCard
7. [x] Assemblage de la page principale
8. [ ] Tests et ajustements responsive
9. [ ] Polissage et optimisations

## Notes
- Utiliser lucide-react pour les icônes
- Respecter les couleurs et espacements de la maquette
- Assurer la responsivité mobile
- Prévoir l'extensibilité pour de nouvelles intégrations 