// Re-export all data modules for easier imports
export * from './sampleAssets';
export * from './assetGenerators';
export * from './demoScenarios';
export * from './enhancedSampleAssets';
export * from './demoDataGenerator';

// Additional data utilities
export const APP_METADATA = {
  name: 'ERMITS CyberSoluce®',
  version: '1.0.0',
  description: 'Comprehensive Asset Inventory Management Tool for cybersecurity professionals',
  author: 'ERMITS CyberSoluce®',
  license: 'MIT',
  repository: 'https://github.com/ermits-cybersoluce/asset-inventory',
  homepage: 'https://jovial-halva-598fd3.netlify.app/',
  keywords: [
    'asset-inventory',
    'cybersecurity',
    'risk-management',
    'compliance',
    'vulnerability-management',
    'IT-assets'
  ]
} as const;

export const NAVIGATION_ROUTES = {
  dashboard: '/',
  workflow: '/workflow',
  assets: '/assets',
  analytics: '/analytics',
  compliance: '/compliance',
  vulnerabilities: '/vulnerabilities',
  organizations: '/organizations',
  users: '/users',
  activity: '/activity',
  userManual: '/user-manual',
  settings: '/settings',
  help: '/help'
} as const;

export const EXTERNAL_LINKS = {
  documentation: 'https://docs.ermits-cybersoluce.com',
  support: 'https://support.ermits-cybersoluce.com',
  github: 'https://github.com/ermits-cybersoluce',
  website: 'https://ermits-cybersoluce.com'
} as const;