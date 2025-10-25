import { Asset } from '../types/asset';

export const sampleAssets: Asset[] = [
  {
    id: 'asset-001',
    name: 'Production Web Server 01',
    type: 'Server',
    criticality: 'Critical',
    owner: 'DevOps Team',
    location: 'Data Center A',
    ipAddress: '192.168.1.10',
    description: 'Primary web server handling customer-facing applications',
    complianceFrameworks: ['SOC 2', 'PCI DSS', 'ISO 27001'],
    riskScore: 85,
    lastAssessed: new Date('2024-01-15'),
    tags: ['production', 'web-server', 'customer-facing'],
    relationships: [
      {
        id: 'rel-001',
        relatedAssetId: 'asset-002',
        relatedAssetName: 'Customer Database',
        relationshipType: 'Connects To',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [
      {
        id: 'vuln-001',
        cveId: 'CVE-2024-0001',
        severity: 'High',
        title: 'Remote Code Execution',
        description: 'Potential RCE vulnerability in web framework',
        discoveredAt: new Date('2024-01-10'),
        status: 'In Progress'
      }
    ],
    status: 'Active',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'asset-002',
    name: 'Customer Database',
    type: 'Database',
    criticality: 'Critical',
    owner: 'Database Team',
    location: 'Data Center A',
    ipAddress: '192.168.1.20',
    description: 'Primary customer data repository',
    complianceFrameworks: ['SOC 2', 'PCI DSS', 'GDPR'],
    riskScore: 92,
    lastAssessed: new Date('2024-01-12'),
    tags: ['production', 'database', 'customer-data', 'encrypted'],
    relationships: [
      {
        id: 'rel-002',
        relatedAssetId: 'asset-001',
        relatedAssetName: 'Production Web Server 01',
        relationshipType: 'Accesses',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'asset-003',
    name: 'Corporate Email System',
    type: 'Application',
    criticality: 'High',
    owner: 'IT Operations',
    location: 'Cloud - AWS',
    description: 'Microsoft Exchange Online for corporate communications',
    complianceFrameworks: ['SOC 2', 'ISO 27001'],
    riskScore: 78,
    lastAssessed: new Date('2024-01-08'),
    tags: ['cloud', 'email', 'communication', 'microsoft'],
    relationships: [],
    vulnerabilities: [
      {
        id: 'vuln-002',
        severity: 'Medium',
        title: 'Outdated Security Patch',
        description: 'Missing latest security updates',
        discoveredAt: new Date('2024-01-05'),
        status: 'Open'
      }
    ],
    status: 'Active',
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: 'asset-004',
    name: 'Office Network Switch',
    type: 'Network',
    criticality: 'High',
    owner: 'Network Team',
    location: 'Office Building A',
    ipAddress: '192.168.100.1',
    description: 'Core network switch for office connectivity',
    complianceFrameworks: ['ISO 27001'],
    riskScore: 65,
    lastAssessed: new Date('2024-01-20'),
    tags: ['network', 'infrastructure', 'office'],
    relationships: [
      {
        id: 'rel-003',
        relatedAssetId: 'asset-005',
        relatedAssetName: 'Employee Workstations',
        relationshipType: 'Connects To',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2023-07-10'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'asset-005',
    name: 'Employee Workstations',
    type: 'Endpoint',
    criticality: 'Medium',
    owner: 'IT Support',
    location: 'Office Building A',
    description: 'Collection of employee desktop computers',
    complianceFrameworks: ['ISO 27001'],
    riskScore: 45,
    lastAssessed: new Date('2024-01-18'),
    tags: ['endpoint', 'workstation', 'employee'],
    relationships: [
      {
        id: 'rel-004',
        relatedAssetId: 'asset-004',
        relatedAssetName: 'Office Network Switch',
        relationshipType: 'Connects To',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [
      {
        id: 'vuln-003',
        severity: 'Low',
        title: 'Outdated Antivirus Signatures',
        description: 'Some workstations have outdated antivirus definitions',
        discoveredAt: new Date('2024-01-16'),
        status: 'In Progress'
      }
    ],
    status: 'Active',
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'asset-006',
    name: 'AWS S3 Storage',
    type: 'Cloud Service',
    criticality: 'High',
    owner: 'DevOps Team',
    location: 'Cloud - AWS',
    description: 'Primary cloud storage for application data and backups',
    complianceFrameworks: ['SOC 2', 'PCI DSS'],
    riskScore: 55,
    lastAssessed: new Date('2024-01-22'),
    tags: ['cloud', 'storage', 'backup', 'aws'],
    relationships: [
      {
        id: 'rel-005',
        relatedAssetId: 'asset-001',
        relatedAssetName: 'Production Web Server 01',
        relationshipType: 'Depends On',
        strength: 'Medium'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2023-04-20'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'asset-007',
    name: 'Legacy File Server',
    type: 'Server',
    criticality: 'Low',
    owner: 'IT Operations',
    location: 'Data Center B',
    ipAddress: '192.168.2.50',
    description: 'Old file server scheduled for decommissioning',
    complianceFrameworks: [],
    riskScore: 30,
    lastAssessed: new Date('2023-12-01'),
    tags: ['legacy', 'file-server', 'decommission'],
    relationships: [],
    vulnerabilities: [
      {
        id: 'vuln-004',
        severity: 'Medium',
        title: 'End of Life Operating System',
        description: 'Running unsupported OS version',
        discoveredAt: new Date('2023-11-15'),
        status: 'Accepted Risk'
      }
    ],
    status: 'Retired',
    createdAt: new Date('2020-03-15'),
    updatedAt: new Date('2023-12-01')
  },
  {
    id: 'asset-008',
    name: 'Development Environment',
    type: 'Server',
    criticality: 'Medium',
    owner: 'Development Team',
    location: 'Cloud - Azure',
    ipAddress: '10.0.1.100',
    description: 'Development and testing environment for new features',
    complianceFrameworks: ['ISO 27001'],
    riskScore: 40,
    lastAssessed: new Date('2024-01-10'),
    tags: ['development', 'testing', 'azure', 'non-production'],
    relationships: [],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'asset-009',
    name: 'Customer Personal Data Repository',
    type: 'Personal Data',
    criticality: 'Critical',
    owner: 'Data Protection Officer',
    location: 'Data Center A',
    description: 'Centralized repository for customer personal information including names, emails, and contact details',
    complianceFrameworks: ['GDPR', 'CCPA', 'SOC 2'],
    riskScore: 95,
    lastAssessed: new Date('2024-01-25'),
    tags: ['personal-data', 'customer-info', 'gdpr', 'encrypted'],
    relationships: [
      {
        id: 'rel-006',
        relatedAssetId: 'asset-002',
        relatedAssetName: 'Customer Database',
        relationshipType: 'Stores',
        strength: 'Strong',
        dataFlowDirection: 'Bidirectional',
        isPersonalData: true,
        purpose: 'Customer data storage and retrieval'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-01-25'),
    dataClassification: 'Confidential',
    dataTypes: ['PII', 'Contact Information', 'Customer Data'],
    retentionPeriod: 2555, // 7 years
    legalBasis: ['Consent', 'Contract'],
    dataSubjectRights: ['Access', 'Rectification', 'Erasure', 'Portability'],
    crossBorderTransfer: true,
    thirdPartySharing: false,
    encryptionStatus: 'Encrypted',
    accessControls: [
      {
        id: 'ac-001',
        type: 'Role-Based',
        description: 'Role-based access control for customer data',
        permissions: ['read', 'update'],
        isActive: true,
        lastReviewed: new Date('2024-01-01')
      }
    ],
    privacyImpactAssessment: {
      id: 'pia-001',
      assessmentDate: new Date('2024-01-01'),
      assessor: 'Data Protection Officer',
      riskLevel: 'High',
      findings: ['High volume of personal data', 'Cross-border transfers'],
      recommendations: ['Implement additional encryption', 'Regular access reviews'],
      status: 'Approved',
      nextReviewDate: new Date('2024-07-01')
    },
    dataBreachHistory: [],
    dependencies: [],
    requirements: []
  },
  {
    id: 'asset-010',
    name: 'Employee Health Records',
    type: 'Sensitive Data',
    criticality: 'Critical',
    owner: 'HR Department',
    location: 'Data Center A',
    description: 'Employee health information and medical records for insurance and compliance purposes',
    complianceFrameworks: ['HIPAA', 'GDPR', 'SOC 2'],
    riskScore: 88,
    lastAssessed: new Date('2024-01-20'),
    tags: ['health-data', 'employee-records', 'hipaa', 'sensitive'],
    relationships: [
      {
        id: 'rel-007',
        relatedAssetId: 'asset-003',
        relatedAssetName: 'Corporate Email System',
        relationshipType: 'Accesses',
        strength: 'Medium',
        dataFlowDirection: 'Inbound',
        isPersonalData: true,
        purpose: 'Email notifications for health benefits'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2024-01-20'),
    dataClassification: 'Restricted',
    dataTypes: ['PHI', 'Health Data', 'Employee Records'],
    retentionPeriod: 2555, // 7 years
    legalBasis: ['Legal Obligation', 'Vital Interests'],
    dataSubjectRights: ['Access', 'Rectification', 'Erasure'],
    crossBorderTransfer: false,
    thirdPartySharing: true,
    encryptionStatus: 'Encrypted',
    accessControls: [
      {
        id: 'ac-002',
        type: 'Mandatory',
        description: 'Mandatory access control for health data',
        permissions: ['read'],
        isActive: true,
        lastReviewed: new Date('2024-01-01')
      }
    ],
    privacyImpactAssessment: {
      id: 'pia-002',
      assessmentDate: new Date('2024-01-01'),
      assessor: 'Privacy Officer',
      riskLevel: 'Critical',
      findings: ['Highly sensitive health data', 'Third-party sharing'],
      recommendations: ['Enhanced encryption', 'Regular audits'],
      status: 'Approved',
      nextReviewDate: new Date('2024-04-01')
    },
    dataBreachHistory: [],
    dependencies: [],
    requirements: []
  }
];

export const complianceFrameworks = [
  'SOC 2',
  'PCI DSS',
  'ISO 27001',
  'GDPR',
  'HIPAA',
  'NIST',
  'CIS Controls',
  'COBIT'
];

export const assetTypes = [
  'Server',
  'Database',
  'Application',
  'Network',
  'Endpoint',
  'Cloud Service',
  'Information Asset',
  'Data Repository',
  'API',
  'File System',
  'Document',
  'Personal Data',
  'Sensitive Data',
  'Business Process',
  'Third Party Service'
];

export const criticalityLevels = [
  'Critical',
  'High',
  'Medium',
  'Low'
];

export const statusOptions = [
  'Active',
  'Inactive',
  'Retired',
  'Planned'
];