import { Asset, AssetRelationship, Vulnerability } from '../types/asset';

export interface InventoryScenario {
  id: string;
  name: string;
  description: string;
  assetCount: number;
  characteristics: string[];
}

export const INVENTORY_SCENARIOS: InventoryScenario[] = [
  {
    id: 'small-business',
    name: 'Small Business',
    description: 'Basic IT infrastructure for a small company (20-50 employees)',
    assetCount: 25,
    characteristics: ['Basic infrastructure', 'Limited compliance', 'Few vulnerabilities']
  },
  {
    id: 'enterprise',
    name: 'Enterprise Corporation',
    description: 'Large enterprise with complex infrastructure and strict compliance',
    assetCount: 150,
    characteristics: ['Complex infrastructure', 'Multiple compliance frameworks', 'Extensive security monitoring']
  },
  {
    id: 'healthcare',
    name: 'Healthcare Organization',
    description: 'Hospital or healthcare provider with HIPAA compliance requirements',
    assetCount: 80,
    characteristics: ['HIPAA compliance', 'Medical devices', 'Patient data systems']
  },
  {
    id: 'financial',
    name: 'Financial Institution',
    description: 'Bank or financial services with high security requirements',
    assetCount: 120,
    characteristics: ['PCI DSS compliance', 'High security', 'Trading systems']
  },
  {
    id: 'startup',
    name: 'Tech Startup',
    description: 'Fast-growing technology startup with cloud-first approach',
    assetCount: 35,
    characteristics: ['Cloud-native', 'DevOps focused', 'Rapid scaling']
  },
  {
    id: 'government',
    name: 'Government Agency',
    description: 'Government organization with strict security and compliance',
    assetCount: 200,
    characteristics: ['Government compliance', 'High security classification', 'Legacy systems']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing Plant',
    description: 'Industrial manufacturing with OT/IT convergence',
    assetCount: 90,
    characteristics: ['Industrial control systems', 'OT/IT integration', 'Safety critical']
  },
  {
    id: 'education',
    name: 'Educational Institution',
    description: 'University or school district with diverse user base',
    assetCount: 110,
    characteristics: ['Student data protection', 'Research systems', 'BYOD environment']
  }
];

const ASSET_TEMPLATES = {
  servers: [
    'Web Server', 'Database Server', 'Application Server', 'File Server', 
    'Mail Server', 'DNS Server', 'DHCP Server', 'Print Server',
    'Backup Server', 'Domain Controller', 'Proxy Server', 'FTP Server'
  ],
  databases: [
    'Customer Database', 'Financial Database', 'Inventory Database',
    'User Database', 'Analytics Database', 'Backup Database',
    'Reporting Database', 'Archive Database'
  ],
  applications: [
    'CRM System', 'ERP System', 'Email System', 'Document Management',
    'HR System', 'Accounting Software', 'Project Management',
    'Customer Portal', 'Vendor Portal', 'Analytics Platform'
  ],
  network: [
    'Core Switch', 'Access Switch', 'Router', 'Firewall',
    'Load Balancer', 'VPN Gateway', 'Wireless Controller',
    'Network Monitor', 'IDS/IPS', 'Network Storage'
  ],
  endpoints: [
    'Executive Workstations', 'Employee Laptops', 'Shared Workstations',
    'Kiosk Systems', 'Mobile Devices', 'Tablets',
    'Point of Sale Systems', 'Digital Signage'
  ],
  cloudServices: [
    'AWS EC2 Instances', 'Azure Virtual Machines', 'Google Cloud Storage',
    'Office 365', 'Salesforce', 'AWS S3 Buckets',
    'Azure SQL Database', 'Google Workspace', 'Dropbox Business'
  ]
};

const LOCATIONS = {
  'small-business': ['Main Office', 'Remote Office'],
  'enterprise': ['Headquarters', 'Regional Office East', 'Regional Office West', 'Data Center Primary', 'Data Center DR', 'Branch Office'],
  'healthcare': ['Main Hospital', 'Outpatient Clinic', 'Emergency Department', 'Laboratory', 'Pharmacy', 'Administrative Building'],
  'financial': ['Corporate HQ', 'Trading Floor', 'Data Center', 'Branch Office Downtown', 'Branch Office Uptown', 'ATM Network'],
  'startup': ['Main Office', 'AWS US-East-1', 'AWS US-West-2', 'Remote Workers'],
  'government': ['Main Building', 'Secure Facility', 'Field Office', 'Data Center', 'Emergency Operations', 'Remote Sites'],
  'manufacturing': ['Plant Floor', 'Control Room', 'Office Building', 'Warehouse', 'Quality Lab', 'Maintenance Shop'],
  'education': ['Main Campus', 'Library', 'Student Center', 'Research Lab', 'Administrative Building', 'Dormitories']
};

const OWNERS = {
  'small-business': ['IT Manager', 'Office Manager', 'CEO', 'Operations'],
  'enterprise': ['IT Operations', 'Security Team', 'Database Team', 'Network Team', 'DevOps Team', 'Business Units'],
  'healthcare': ['IT Department', 'Medical IT', 'Administration', 'Clinical Engineering', 'Security Office'],
  'financial': ['IT Operations', 'Trading Technology', 'Risk Management', 'Compliance', 'Security Team'],
  'startup': ['DevOps Team', 'Engineering', 'Product Team', 'Operations'],
  'government': ['IT Division', 'Security Office', 'Operations', 'Field Services', 'Classified Systems'],
  'manufacturing': ['IT Department', 'OT Team', 'Plant Operations', 'Maintenance', 'Quality Assurance'],
  'education': ['IT Services', 'Academic Computing', 'Student Services', 'Research Computing', 'Administration']
};

const COMPLIANCE_FRAMEWORKS = {
  'small-business': ['ISO 27001'],
  'enterprise': ['SOC 2', 'ISO 27001', 'NIST', 'PCI DSS'],
  'healthcare': ['HIPAA', 'SOC 2', 'ISO 27001', 'HITECH'],
  'financial': ['PCI DSS', 'SOX', 'FFIEC', 'ISO 27001', 'SOC 2'],
  'startup': ['SOC 2', 'ISO 27001'],
  'government': ['FISMA', 'NIST', 'FedRAMP', 'CJIS'],
  'manufacturing': ['ISO 27001', 'NIST', 'IEC 62443'],
  'education': ['FERPA', 'SOC 2', 'ISO 27001', 'NIST']
};

const TAGS = {
  'small-business': ['production', 'office', 'shared', 'backup'],
  'enterprise': ['production', 'staging', 'development', 'critical', 'high-availability', 'disaster-recovery'],
  'healthcare': ['patient-data', 'medical-device', 'clinical', 'administrative', 'phi-storage'],
  'financial': ['trading', 'customer-data', 'payment-processing', 'regulatory', 'high-frequency'],
  'startup': ['cloud-native', 'microservices', 'ci-cd', 'scalable', 'containerized'],
  'government': ['classified', 'sensitive', 'public', 'secure-communications', 'emergency-services'],
  'manufacturing': ['industrial-control', 'safety-critical', 'production-line', 'quality-control', 'maintenance'],
  'education': ['student-data', 'research', 'academic', 'administrative', 'public-access']
};

function generateRandomId(): string {
  return `asset-${Math.random().toString(36).substr(2, 9)}`;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateIPAddress(): string {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function generateRiskScore(criticality: string): number {
  const baseScores = {
    'Critical': [70, 95],
    'High': [50, 80],
    'Medium': [30, 60],
    'Low': [10, 40]
  };
  
  const [min, max] = baseScores[criticality as keyof typeof baseScores] || [10, 40];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateVulnerabilities(assetType: string, criticality: string): Vulnerability[] {
  const vulnCount = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 3) + 1;
  const vulnerabilities: Vulnerability[] = [];

  const vulnTemplates = [
    { title: 'Outdated Software Version', severity: 'Medium' },
    { title: 'Missing Security Patch', severity: 'High' },
    { title: 'Weak Authentication', severity: 'Medium' },
    { title: 'Unencrypted Data Storage', severity: 'High' },
    { title: 'Default Credentials', severity: 'Critical' },
    { title: 'Open Network Port', severity: 'Low' },
    { title: 'SSL Certificate Expired', severity: 'Medium' },
    { title: 'Buffer Overflow Vulnerability', severity: 'High' }
  ];

  for (let i = 0; i < vulnCount; i++) {
    const template = getRandomElement(vulnTemplates);
    vulnerabilities.push({
      id: `vuln-${generateRandomId()}`,
      cveId: Math.random() < 0.5 ? `CVE-2024-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}` : undefined,
      severity: template.severity as 'Critical' | 'High' | 'Medium' | 'Low',
      title: template.title,
      description: `${template.title} detected on ${assetType}`,
      discoveredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: getRandomElement(['Open', 'In Progress', 'Resolved', 'Accepted Risk'])
    });
  }

  return vulnerabilities;
}

function generateAssetName(type: string, template: string, index: number): string {
  const suffixes = ['01', '02', '03', 'A', 'B', 'C', 'Primary', 'Secondary', 'Backup'];
  
  if (template.includes('System') || template.includes('Platform')) {
    return template;
  }
  
  return `${template} ${getRandomElement(suffixes)}`;
}

export function generateAssetInventory(scenarioId: string): Asset[] {
  const scenario = INVENTORY_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }

  const assets: Asset[] = [];
  const locations = LOCATIONS[scenarioId as keyof typeof LOCATIONS] || ['Main Office'];
  const owners = OWNERS[scenarioId as keyof typeof OWNERS] || ['IT Team'];
  const complianceFrameworks = COMPLIANCE_FRAMEWORKS[scenarioId as keyof typeof COMPLIANCE_FRAMEWORKS] || ['ISO 27001'];
  const tags = TAGS[scenarioId as keyof typeof TAGS] || ['production'];

  // Asset distribution based on scenario
  const distribution = {
    'small-business': { servers: 0.3, databases: 0.1, applications: 0.2, network: 0.2, endpoints: 0.15, cloudServices: 0.05 },
    'enterprise': { servers: 0.25, databases: 0.15, applications: 0.2, network: 0.15, endpoints: 0.15, cloudServices: 0.1 },
    'healthcare': { servers: 0.2, databases: 0.2, applications: 0.25, network: 0.15, endpoints: 0.15, cloudServices: 0.05 },
    'financial': { servers: 0.3, databases: 0.2, applications: 0.2, network: 0.15, endpoints: 0.1, cloudServices: 0.05 },
    'startup': { servers: 0.1, databases: 0.1, applications: 0.15, network: 0.1, endpoints: 0.15, cloudServices: 0.4 },
    'government': { servers: 0.35, databases: 0.15, applications: 0.2, network: 0.2, endpoints: 0.1, cloudServices: 0 },
    'manufacturing': { servers: 0.25, databases: 0.1, applications: 0.15, network: 0.3, endpoints: 0.15, cloudServices: 0.05 },
    'education': { servers: 0.2, databases: 0.15, applications: 0.25, network: 0.15, endpoints: 0.2, cloudServices: 0.05 }
  };

  const dist = distribution[scenarioId as keyof typeof distribution] || distribution['small-business'];
  
  let assetIndex = 0;

  // Generate assets for each type
  Object.entries(dist).forEach(([assetType, percentage]) => {
    const count = Math.floor(scenario.assetCount * percentage);
    const templates = ASSET_TEMPLATES[assetType as keyof typeof ASSET_TEMPLATES] || [];
    
    for (let i = 0; i < count; i++) {
      const template = getRandomElement(templates);
      const criticality = getRandomElement(['Critical', 'High', 'Medium', 'Low']);
      const status = getRandomElement(['Active', 'Inactive', 'Planned']);
      
      const asset: Asset = {
        id: generateRandomId(),
        name: generateAssetName(assetType, template, i),
        type: assetType === 'cloudServices' ? 'Cloud Service' : 
              assetType === 'endpoints' ? 'Endpoint' :
              assetType.charAt(0).toUpperCase() + assetType.slice(1, -1) as Asset['type'],
        criticality: criticality as Asset['criticality'],
        owner: getRandomElement(owners),
        location: getRandomElement(locations),
        ipAddress: assetType !== 'cloudServices' ? generateIPAddress() : undefined,
        description: `${template} used for ${scenarioId.replace('-', ' ')} operations`,
        complianceFrameworks: getRandomElements(complianceFrameworks, Math.floor(Math.random() * 3) + 1),
        riskScore: generateRiskScore(criticality),
        lastAssessed: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        tags: getRandomElements(tags, Math.floor(Math.random() * 4) + 1),
        relationships: [], // Will be populated after all assets are created
        vulnerabilities: generateVulnerabilities(assetType, criticality),
        status: status as Asset['status'],
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      };

      assets.push(asset);
      assetIndex++;
    }
  });

  // Generate relationships between assets
  assets.forEach(asset => {
    const relationshipCount = Math.floor(Math.random() * 3);
    const potentialRelated = assets.filter(a => a.id !== asset.id);
    
    for (let i = 0; i < relationshipCount && i < potentialRelated.length; i++) {
      const relatedAsset = getRandomElement(potentialRelated);
      const relationshipTypes = ['Depends On', 'Connects To', 'Hosts', 'Manages', 'Accesses'];
      
      const relationship: AssetRelationship = {
        id: `rel-${generateRandomId()}`,
        relatedAssetId: relatedAsset.id,
        relatedAssetName: relatedAsset.name,
        relationshipType: getRandomElement(relationshipTypes) as AssetRelationship['relationshipType'],
        strength: getRandomElement(['Strong', 'Medium', 'Weak']) as AssetRelationship['strength']
      };
      
      asset.relationships.push(relationship);
    }
  });

  return assets;
}

export function generateMultipleInventories(): Record<string, Asset[]> {
  const inventories: Record<string, Asset[]> = {};
  
  INVENTORY_SCENARIOS.forEach(scenario => {
    inventories[scenario.id] = generateAssetInventory(scenario.id);
  });
  
  return inventories;
}

export function getInventoryScenarios(): InventoryScenario[] {
  return INVENTORY_SCENARIOS;
}