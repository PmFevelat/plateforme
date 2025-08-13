export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'transcript' | 'communication' | 'knowledge';
  isConnected: boolean;
  workflowsUsed: number;
  connections: number;
}

export const integrationsData: Integration[] = [
  // Transcript Sources
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Call ingestion via transcript',
    icon: '/images/Zoom.svg',
    category: 'transcript',
    isConnected: true,
    workflowsUsed: 12,
    connections: 4,
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    description: 'Call ingestion via transcript',
    icon: '/images/GM.png',
    category: 'transcript',
    isConnected: false,
    workflowsUsed: 5,
    connections: 2,
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Call ingestion via transcript',
    icon: '/images/Teams.png',
    category: 'transcript',
    isConnected: false,
    workflowsUsed: 8,
    connections: 3,
  },
  {
    id: 'gong',
    name: 'Gong',
    description: 'Conversation intelligence platform',
    icon: '/images/Gong.png',
    category: 'transcript',
    isConnected: false,
    workflowsUsed: 10,
    connections: 2,
  },

  // Communication Channels
  {
    id: 'slack',
    name: 'Slack',
    description: 'Used to push internal tasks',
    icon: '/images/slack.png',
    category: 'communication',
    isConnected: true,
    workflowsUsed: 6,
    connections: 2,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Used to send follow-up emails',
    icon: '/images/Gmail.png',
    category: 'communication',
    isConnected: false,
    workflowsUsed: 8,
    connections: 3,
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Used to send follow-up emails',
    icon: '/images/Outlook.png',
    category: 'communication',
    isConnected: false,
    workflowsUsed: 4,
    connections: 1,
  },
  {
    id: 'teams-chat',
    name: 'Teams Chat',
    description: 'Used to push internal tasks',
    icon: '/images/Teams.png',
    category: 'communication',
    isConnected: false,
    workflowsUsed: 5,
    connections: 2,
  },

  // Knowledge Bases & CRMs
  {
    id: 'notion',
    name: 'Notion',
    description: 'Fetch pages to enrich client answers',
    icon: '/images/notion.png',
    category: 'knowledge',
    isConnected: true,
    workflowsUsed: 9,
    connections: 0,
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Fetch content for follow-ups',
    icon: '/images/Drive.png',
    category: 'knowledge',
    isConnected: false,
    workflowsUsed: 7,
    connections: 3,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Auto-fill MEDDIC fields',
    icon: '/images/Salesforce.png',
    category: 'knowledge',
    isConnected: false,
    workflowsUsed: 11,
    connections: 0,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Auto-fill qualification fields',
    icon: '/images/Hubspot.webp',
    category: 'knowledge',
    isConnected: false,
    workflowsUsed: 5,
    connections: 2,
  },
];

export const getIntegrationsByCategory = (category: Integration['category']) => {
  return integrationsData.filter(integration => integration.category === category);
};

export const getSectionTitle = (category: Integration['category']) => {
  switch (category) {
    case 'transcript':
      return 'Transcript Sources';
    case 'communication':
      return 'Communication Channels';
    case 'knowledge':
      return 'Knowledge Bases & CRMs';
    default:
      return '';
  }
};

export const getSectionDescription = (category: Integration['category']) => {
  switch (category) {
    case 'transcript':
      return 'Used to ingest call recordings and transcripts';
    case 'communication':
      return 'Used to send follow-ups and internal tasks';
    case 'knowledge':
      return 'Used to enrich or attach context to AI answers';
    default:
      return '';
  }
}; 