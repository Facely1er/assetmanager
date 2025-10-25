import { Asset } from '../types/asset';

// Enhanced sample assets with more realistic data for demo purposes
export const enhancedSampleAssets: Asset[] = [
  // Healthcare Scenario Assets
  {
    id: 'healthcare-001',
    name: 'Patient Database Server',
    type: 'Database',
    criticality: 'Critical',
    owner: 'Medical IT Department',
    location: 'Main Hospital - Data Center',
    ipAddress: '192.168.10.50',
    description: 'Primary database containing patient medical records, treatment history, and personal information. Critical for patient care operations.',
    complianceFrameworks: ['HIPAA', 'HITECH', 'SOC 2'],
    riskScore: 95,
    lastAssessed: new Date('2024-01-20'),
    tags: ['patient-data', 'critical-care', 'encrypted', 'backup-enabled'],
    relationships: [
      {
        id: 'rel-healthcare-001',
        relatedAssetId: 'healthcare-002',
        relatedAssetName: 'EMR Application Server',
        relationshipType: 'Accesses',
        strength: 'Strong'
      },
      {
        id: 'rel-healthcare-002',
        relatedAssetId: 'healthcare-003',
        relatedAssetName: 'Backup Storage System',
        relationshipType: 'Backs Up To',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [
      {
        id: 'vuln-healthcare-001',
        cveId: 'CVE-2024-1234',
        severity: 'High',
        title: 'Database Encryption Vulnerability',
        description: 'Potential vulnerability in database encryption implementation',
        discoveredAt: new Date('2024-01-15'),
        status: 'In Progress'
      }
    ],
    status: 'Active',
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'healthcare-002',
    name: 'EMR Application Server',
    type: 'Application',
    criticality: 'Critical',
    owner: 'Medical IT Department',
    location: 'Main Hospital - Data Center',
    ipAddress: '192.168.10.51',
    description: 'Electronic Medical Records application server handling patient data entry, medical history, and treatment planning.',
    complianceFrameworks: ['HIPAA', 'HITECH'],
    riskScore: 88,
    lastAssessed: new Date('2024-01-18'),
    tags: ['patient-data', 'critical-care', 'web-application', 'ssl-enabled'],
    relationships: [
      {
        id: 'rel-healthcare-003',
        relatedAssetId: 'healthcare-001',
        relatedAssetName: 'Patient Database Server',
        relationshipType: 'Connects To',
        strength: 'Strong'
      },
      {
        id: 'rel-healthcare-004',
        relatedAssetId: 'healthcare-004',
        relatedAssetName: 'Load Balancer',
        relationshipType: 'Behind',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [
      {
        id: 'vuln-healthcare-002',
        severity: 'Medium',
        title: 'Outdated Web Framework',
        description: 'Web application framework needs security updates',
        discoveredAt: new Date('2024-01-10'),
        status: 'Open'
      }
    ],
    status: 'Active',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'healthcare-003',
    name: 'Backup Storage System',
    type: 'Server',
    criticality: 'High',
    owner: 'Medical IT Department',
    location: 'Main Hospital - Data Center',
    ipAddress: '192.168.10.52',
    description: 'Dedicated backup system for patient data and medical records with encrypted storage.',
    complianceFrameworks: ['HIPAA', 'HITECH'],
    riskScore: 75,
    lastAssessed: new Date('2024-01-22'),
    tags: ['backup', 'patient-data', 'encrypted', 'offsite-sync'],
    relationships: [
      {
        id: 'rel-healthcare-005',
        relatedAssetId: 'healthcare-001',
        relatedAssetName: 'Patient Database Server',
        relationshipType: 'Backs Up',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'healthcare-004',
    name: 'Load Balancer',
    type: 'Network',
    criticality: 'High',
    owner: 'Network Team',
    location: 'Main Hospital - Network Rack',
    ipAddress: '192.168.10.1',
    description: 'Load balancer distributing traffic across EMR application servers for high availability.',
    complianceFrameworks: ['HIPAA'],
    riskScore: 65,
    lastAssessed: new Date('2024-01-19'),
    tags: ['load-balancer', 'high-availability', 'ssl-termination'],
    relationships: [
      {
        id: 'rel-healthcare-006',
        relatedAssetId: 'healthcare-002',
        relatedAssetName: 'EMR Application Server',
        relationshipType: 'Routes To',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'healthcare-005',
    name: 'MRI Scanner Control System',
    type: 'Endpoint',
    criticality: 'High',
    owner: 'Radiology Department',
    location: 'Main Hospital - Radiology Suite',
    ipAddress: '192.168.20.100',
    description: 'Industrial control system managing MRI scanner operations and patient safety protocols.',
    complianceFrameworks: ['HIPAA', 'HITECH'],
    riskScore: 82,
    lastAssessed: new Date('2024-01-16'),
    tags: ['medical-device', 'radiology', 'patient-safety', 'legacy-system'],
    relationships: [],
    vulnerabilities: [
      {
        id: 'vuln-healthcare-003',
        severity: 'High',
        title: 'Legacy Operating System',
        description: 'MRI control system running unsupported Windows version',
        discoveredAt: new Date('2024-01-05'),
        status: 'Accepted Risk'
      }
    ],
    status: 'Active',
    createdAt: new Date('2020-06-15'),
    updatedAt: new Date('2024-01-16')
  },

  // Financial Services Scenario Assets
  {
    id: 'financial-001',
    name: 'Core Banking System',
    type: 'Application',
    criticality: 'Critical',
    owner: 'Banking IT Department',
    location: 'Data Center - Primary',
    ipAddress: '10.0.1.100',
    description: 'Primary core banking application handling customer accounts, transactions, and financial operations.',
    complianceFrameworks: ['PCI DSS', 'SOX', 'FFIEC'],
    riskScore: 92,
    lastAssessed: new Date('2024-01-21'),
    tags: ['core-banking', 'customer-data', 'transaction-processing', 'high-availability'],
    relationships: [
      {
        id: 'rel-financial-001',
        relatedAssetId: 'financial-002',
        relatedAssetName: 'Customer Database',
        relationshipType: 'Accesses',
        strength: 'Strong'
      },
      {
        id: 'rel-financial-002',
        relatedAssetId: 'financial-003',
        relatedAssetName: 'Payment Processing Gateway',
        relationshipType: 'Integrates With',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [
      {
        id: 'vuln-financial-001',
        cveId: 'CVE-2024-2345',
        severity: 'Critical',
        title: 'SQL Injection Vulnerability',
        description: 'Critical SQL injection vulnerability in customer data access',
        discoveredAt: new Date('2024-01-18'),
        status: 'In Progress'
      }
    ],
    status: 'Active',
    createdAt: new Date('2022-01-15'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'financial-002',
    name: 'Customer Database',
    type: 'Database',
    criticality: 'Critical',
    owner: 'Database Team',
    location: 'Data Center - Primary',
    ipAddress: '10.0.1.101',
    description: 'Encrypted database containing customer account information, transaction history, and personal data.',
    complianceFrameworks: ['PCI DSS', 'SOX', 'FFIEC'],
    riskScore: 96,
    lastAssessed: new Date('2024-01-20'),
    tags: ['customer-data', 'encrypted', 'pci-compliant', 'audit-logged'],
    relationships: [
      {
        id: 'rel-financial-003',
        relatedAssetId: 'financial-001',
        relatedAssetName: 'Core Banking System',
        relationshipType: 'Serves',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'financial-003',
    name: 'Payment Processing Gateway',
    type: 'Application',
    criticality: 'Critical',
    owner: 'Payment Systems Team',
    location: 'Data Center - Primary',
    ipAddress: '10.0.1.102',
    description: 'Secure payment processing gateway handling credit card transactions and ACH transfers.',
    complianceFrameworks: ['PCI DSS', 'SOX'],
    riskScore: 94,
    lastAssessed: new Date('2024-01-19'),
    tags: ['payment-processing', 'pci-compliant', 'encrypted', 'audit-logged'],
    relationships: [
      {
        id: 'rel-financial-004',
        relatedAssetId: 'financial-001',
        relatedAssetName: 'Core Banking System',
        relationshipType: 'Integrates With',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [
      {
        id: 'vuln-financial-002',
        severity: 'High',
        title: 'SSL Certificate Expiration',
        description: 'SSL certificate expires in 30 days',
        discoveredAt: new Date('2024-01-15'),
        status: 'In Progress'
      }
    ],
    status: 'Active',
    createdAt: new Date('2022-02-01'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'financial-004',
    name: 'Trading Platform Server',
    type: 'Application',
    criticality: 'Critical',
    owner: 'Trading Technology Team',
    location: 'Data Center - Trading Floor',
    ipAddress: '10.0.2.100',
    description: 'High-frequency trading platform handling real-time market data and trade execution.',
    complianceFrameworks: ['SOX', 'FFIEC'],
    riskScore: 89,
    lastAssessed: new Date('2024-01-22'),
    tags: ['trading', 'high-frequency', 'real-time', 'low-latency'],
    relationships: [],
    vulnerabilities: [
      {
        id: 'vuln-financial-003',
        severity: 'Medium',
        title: 'Memory Leak in Trading Engine',
        description: 'Potential memory leak in trading engine after extended operation',
        discoveredAt: new Date('2024-01-12'),
        status: 'Open'
      }
    ],
    status: 'Active',
    createdAt: new Date('2021-11-20'),
    updatedAt: new Date('2024-01-22')
  },

  // Technology Startup Scenario Assets
  {
    id: 'startup-001',
    name: 'AWS EC2 Production Cluster',
    type: 'Cloud Service',
    criticality: 'High',
    owner: 'DevOps Team',
    location: 'AWS US-East-1',
    description: 'Auto-scaling EC2 cluster running microservices for the main application platform.',
    complianceFrameworks: ['SOC 2', 'ISO 27001'],
    riskScore: 68,
    lastAssessed: new Date('2024-01-23'),
    tags: ['aws', 'microservices', 'auto-scaling', 'production'],
    relationships: [
      {
        id: 'rel-startup-001',
        relatedAssetId: 'startup-002',
        relatedAssetName: 'RDS Database Cluster',
        relationshipType: 'Connects To',
        strength: 'Strong'
      },
      {
        id: 'rel-startup-002',
        relatedAssetId: 'startup-003',
        relatedAssetName: 'ElastiCache Redis',
        relationshipType: 'Uses',
        strength: 'Medium'
      }
    ],
    vulnerabilities: [
      {
        id: 'vuln-startup-001',
        severity: 'Low',
        title: 'Outdated AMI Version',
        description: 'EC2 instances using outdated Amazon Machine Image',
        discoveredAt: new Date('2024-01-20'),
        status: 'In Progress'
      }
    ],
    status: 'Active',
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: 'startup-002',
    name: 'RDS Database Cluster',
    type: 'Cloud Service',
    criticality: 'High',
    owner: 'DevOps Team',
    location: 'AWS US-East-1',
    description: 'Managed PostgreSQL database cluster with read replicas for high availability.',
    complianceFrameworks: ['SOC 2'],
    riskScore: 72,
    lastAssessed: new Date('2024-01-22'),
    tags: ['aws-rds', 'postgresql', 'high-availability', 'encrypted'],
    relationships: [
      {
        id: 'rel-startup-003',
        relatedAssetId: 'startup-001',
        relatedAssetName: 'AWS EC2 Production Cluster',
        relationshipType: 'Serves',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2023-08-10'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'startup-003',
    name: 'ElastiCache Redis',
    type: 'Cloud Service',
    criticality: 'Medium',
    owner: 'DevOps Team',
    location: 'AWS US-East-1',
    description: 'Managed Redis cache for session storage and application performance optimization.',
    complianceFrameworks: ['SOC 2'],
    riskScore: 45,
    lastAssessed: new Date('2024-01-21'),
    tags: ['aws-elasticache', 'redis', 'caching', 'session-storage'],
    relationships: [
      {
        id: 'rel-startup-004',
        relatedAssetId: 'startup-001',
        relatedAssetName: 'AWS EC2 Production Cluster',
        relationshipType: 'Used By',
        strength: 'Medium'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'startup-004',
    name: 'Kubernetes Cluster',
    type: 'Cloud Service',
    criticality: 'High',
    owner: 'DevOps Team',
    location: 'AWS EKS',
    description: 'Managed Kubernetes cluster running containerized microservices and APIs.',
    complianceFrameworks: ['SOC 2'],
    riskScore: 58,
    lastAssessed: new Date('2024-01-20'),
    tags: ['kubernetes', 'containers', 'microservices', 'aws-eks'],
    relationships: [],
    vulnerabilities: [
      {
        id: 'vuln-startup-002',
        severity: 'Medium',
        title: 'Kubernetes Security Policy Missing',
        description: 'Missing network security policies for pod communication',
        discoveredAt: new Date('2024-01-18'),
        status: 'Open'
      }
    ],
    status: 'Active',
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2024-01-20')
  },

  // Manufacturing Scenario Assets
  {
    id: 'manufacturing-001',
    name: 'Production Line Control System',
    type: 'Endpoint',
    criticality: 'Critical',
    owner: 'Plant Operations',
    location: 'Manufacturing Floor - Line 1',
    ipAddress: '192.168.100.10',
    description: 'Industrial control system managing automated production line operations and safety protocols.',
    complianceFrameworks: ['ISO 27001', 'IEC 62443'],
    riskScore: 88,
    lastAssessed: new Date('2024-01-17'),
    tags: ['industrial-control', 'production-line', 'safety-critical', 'legacy-system'],
    relationships: [
      {
        id: 'rel-manufacturing-001',
        relatedAssetId: 'manufacturing-002',
        relatedAssetName: 'SCADA System',
        relationshipType: 'Reports To',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [
      {
        id: 'vuln-manufacturing-001',
        severity: 'High',
        title: 'Unpatched Industrial Control Firmware',
        description: 'Production line control system has unpatched security vulnerabilities',
        discoveredAt: new Date('2024-01-10'),
        status: 'In Progress'
      }
    ],
    status: 'Active',
    createdAt: new Date('2019-05-20'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: 'manufacturing-002',
    name: 'SCADA System',
    type: 'Application',
    criticality: 'Critical',
    owner: 'Plant Operations',
    location: 'Control Room',
    ipAddress: '192.168.100.1',
    description: 'Supervisory Control and Data Acquisition system monitoring all plant operations and equipment.',
    complianceFrameworks: ['ISO 27001', 'IEC 62443'],
    riskScore: 91,
    lastAssessed: new Date('2024-01-19'),
    tags: ['scada', 'industrial-control', 'monitoring', 'safety-critical'],
    relationships: [
      {
        id: 'rel-manufacturing-002',
        relatedAssetId: 'manufacturing-001',
        relatedAssetName: 'Production Line Control System',
        relationshipType: 'Monitors',
        strength: 'Strong'
      },
      {
        id: 'rel-manufacturing-003',
        relatedAssetId: 'manufacturing-003',
        relatedAssetName: 'Plant Network Switch',
        relationshipType: 'Connects Via',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [
      {
        id: 'vuln-manufacturing-002',
        severity: 'Critical',
        title: 'Default SCADA Credentials',
        description: 'SCADA system using default administrator credentials',
        discoveredAt: new Date('2024-01-08'),
        status: 'In Progress'
      }
    ],
    status: 'Active',
    createdAt: new Date('2018-12-10'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'manufacturing-003',
    name: 'Plant Network Switch',
    type: 'Network',
    criticality: 'High',
    owner: 'Plant IT Team',
    location: 'Network Rack - Plant Floor',
    ipAddress: '192.168.100.1',
    description: 'Core network switch connecting all industrial control systems and plant equipment.',
    complianceFrameworks: ['ISO 27001'],
    riskScore: 76,
    lastAssessed: new Date('2024-01-21'),
    tags: ['network-switch', 'industrial-network', 'ot-network', 'vlan-enabled'],
    relationships: [
      {
        id: 'rel-manufacturing-004',
        relatedAssetId: 'manufacturing-002',
        relatedAssetName: 'SCADA System',
        relationshipType: 'Connects',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2019-03-15'),
    updatedAt: new Date('2024-01-21')
  },

  // Government Scenario Assets
  {
    id: 'government-001',
    name: 'Classified Data Server',
    type: 'Server',
    criticality: 'Critical',
    owner: 'Classified Systems Team',
    location: 'Secure Facility - SCIF',
    ipAddress: '10.1.1.100',
    description: 'Highly secured server containing classified government data and intelligence information.',
    complianceFrameworks: ['FISMA', 'NIST', 'CJIS'],
    riskScore: 98,
    lastAssessed: new Date('2024-01-20'),
    tags: ['classified', 'top-secret', 'air-gapped', 'encrypted'],
    relationships: [],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'government-002',
    name: 'Citizen Services Portal',
    type: 'Application',
    criticality: 'High',
    owner: 'Public Services IT',
    location: 'Data Center - Public',
    ipAddress: '10.2.1.50',
    description: 'Public-facing web portal providing citizen services and government information.',
    complianceFrameworks: ['FISMA', 'NIST'],
    riskScore: 78,
    lastAssessed: new Date('2024-01-22'),
    tags: ['public-facing', 'citizen-services', 'web-application', 'ssl-enabled'],
    relationships: [],
    vulnerabilities: [
      {
        id: 'vuln-government-001',
        severity: 'Medium',
        title: 'Web Application Firewall Missing',
        description: 'Citizen portal lacks web application firewall protection',
        discoveredAt: new Date('2024-01-15'),
        status: 'Open'
      }
    ],
    status: 'Active',
    createdAt: new Date('2021-06-01'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'government-003',
    name: 'FedRAMP Cloud Service',
    type: 'Cloud Service',
    criticality: 'High',
    owner: 'Cloud Services Team',
    location: 'AWS GovCloud',
    description: 'FedRAMP-authorized cloud service hosting government applications and data.',
    complianceFrameworks: ['FedRAMP', 'FISMA', 'NIST'],
    riskScore: 72,
    lastAssessed: new Date('2024-01-21'),
    tags: ['fedramp', 'aws-govcloud', 'government-cloud', 'compliant'],
    relationships: [],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2022-03-10'),
    updatedAt: new Date('2024-01-21')
  },

  // Education Scenario Assets
  {
    id: 'education-001',
    name: 'Student Information System',
    type: 'Application',
    criticality: 'High',
    owner: 'Academic Computing',
    location: 'Main Campus - Data Center',
    ipAddress: '192.168.50.100',
    description: 'Student information system managing enrollment, grades, and academic records.',
    complianceFrameworks: ['FERPA', 'SOC 2'],
    riskScore: 85,
    lastAssessed: new Date('2024-01-19'),
    tags: ['student-data', 'academic-records', 'ferpa-compliant', 'web-application'],
    relationships: [
      {
        id: 'rel-education-001',
        relatedAssetId: 'education-002',
        relatedAssetName: 'Student Database',
        relationshipType: 'Accesses',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [
      {
        id: 'vuln-education-001',
        severity: 'Medium',
        title: 'FERPA Compliance Gap',
        description: 'Student data access logging needs improvement for FERPA compliance',
        discoveredAt: new Date('2024-01-12'),
        status: 'In Progress'
      }
    ],
    status: 'Active',
    createdAt: new Date('2020-08-15'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'education-002',
    name: 'Student Database',
    type: 'Database',
    criticality: 'High',
    owner: 'Database Team',
    location: 'Main Campus - Data Center',
    ipAddress: '192.168.50.101',
    description: 'Encrypted database containing student records, academic history, and personal information.',
    complianceFrameworks: ['FERPA', 'SOC 2'],
    riskScore: 88,
    lastAssessed: new Date('2024-01-18'),
    tags: ['student-data', 'encrypted', 'ferpa-compliant', 'backup-enabled'],
    relationships: [
      {
        id: 'rel-education-002',
        relatedAssetId: 'education-001',
        relatedAssetName: 'Student Information System',
        relationshipType: 'Serves',
        strength: 'Strong'
      }
    ],
    vulnerabilities: [],
    status: 'Active',
    createdAt: new Date('2020-08-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'education-003',
    name: 'Research Computing Cluster',
    type: 'Server',
    criticality: 'Medium',
    owner: 'Research Computing',
    location: 'Research Building - Data Center',
    ipAddress: '192.168.60.100',
    description: 'High-performance computing cluster for research projects and academic computing.',
    complianceFrameworks: ['FERPA', 'ISO 27001'],
    riskScore: 65,
    lastAssessed: new Date('2024-01-20'),
    tags: ['research', 'hpc', 'academic-computing', 'shared-resource'],
    relationships: [],
    vulnerabilities: [
      {
        id: 'vuln-education-002',
        severity: 'Low',
        title: 'Outdated Research Software',
        description: 'Some research software packages need security updates',
        discoveredAt: new Date('2024-01-14'),
        status: 'Open'
      }
    ],
    status: 'Active',
    createdAt: new Date('2021-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

// Demo use case scenarios with step-by-step instructions
export const DEMO_USE_CASES = [
  {
    id: 'healthcare-compliance-audit',
    title: 'Healthcare HIPAA Compliance Audit',
    description: 'Demonstrate how to prepare for a HIPAA compliance audit using the asset inventory system.',
    industry: 'Healthcare',
    duration: '30 minutes',
    difficulty: 'Medium',
    steps: [
      {
        step: 1,
        title: 'Load Healthcare Scenario',
        description: 'Load the healthcare scenario with medical devices and patient data systems',
        action: 'Use the inventory generator to select "Healthcare Organization" scenario',
        expectedResult: 'Complete healthcare asset inventory loaded with medical devices and patient systems'
      },
      {
        step: 2,
        title: 'Review Asset Classification',
        description: 'Review how assets are classified by type, criticality, and compliance requirements',
        action: 'Navigate to the asset dashboard and review asset classifications',
        expectedResult: 'Clear understanding of asset categorization and HIPAA compliance mapping'
      },
      {
        step: 3,
        title: 'Generate Compliance Report',
        description: 'Generate a comprehensive HIPAA compliance report for audit purposes',
        action: 'Use the reporting feature to generate a HIPAA compliance report',
        expectedResult: 'Detailed compliance report showing HIPAA compliance status for all assets'
      },
      {
        step: 4,
        title: 'Review Vulnerability Assessment',
        description: 'Review and prioritize vulnerabilities in medical devices and patient systems',
        action: 'Navigate to vulnerability management and review security issues',
        expectedResult: 'Prioritized list of vulnerabilities with remediation recommendations'
      }
    ]
  },
  {
    id: 'financial-pci-audit',
    title: 'Financial Services PCI DSS Audit',
    description: 'Show how to prepare for a PCI DSS audit in a financial services environment.',
    industry: 'Financial Services',
    duration: '35 minutes',
    difficulty: 'Advanced',
    steps: [
      {
        step: 1,
        title: 'Load Financial Services Scenario',
        description: 'Load the financial services scenario with banking systems and payment processors',
        action: 'Use the inventory generator to select "Financial Institution" scenario',
        expectedResult: 'Complete financial services asset inventory with banking and payment systems'
      },
      {
        step: 2,
        title: 'Map PCI DSS Requirements',
        description: 'Map all assets to specific PCI DSS requirements and controls',
        action: 'Navigate to compliance management and configure PCI DSS requirements',
        expectedResult: 'All payment systems properly mapped to PCI DSS requirements'
      },
      {
        step: 3,
        title: 'Conduct Risk Assessment',
        description: 'Perform comprehensive risk assessment for all financial systems',
        action: 'Use risk assessment tools to evaluate financial system security',
        expectedResult: 'Detailed risk assessment with prioritized remediation recommendations'
      },
      {
        step: 4,
        title: 'Generate Audit Documentation',
        description: 'Generate comprehensive audit documentation for PCI DSS compliance',
        action: 'Use reporting features to create PCI DSS audit documentation',
        expectedResult: 'Complete audit package ready for external auditors'
      }
    ]
  },
  {
    id: 'startup-cloud-security',
    title: 'Startup Cloud Security Assessment',
    description: 'Demonstrate cloud security assessment for a fast-growing technology startup.',
    industry: 'Technology',
    duration: '25 minutes',
    difficulty: 'Easy',
    steps: [
      {
        step: 1,
        title: 'Load Startup Scenario',
        description: 'Load the startup scenario with cloud infrastructure and microservices',
        action: 'Use the inventory generator to select "Tech Startup" scenario',
        expectedResult: 'Complete startup asset inventory with cloud resources and microservices'
      },
      {
        step: 2,
        title: 'Review Cloud Architecture',
        description: 'Review cloud infrastructure and microservices architecture',
        action: 'Navigate to the asset dashboard and review cloud resources',
        expectedResult: 'Clear understanding of cloud architecture and service dependencies'
      },
      {
        step: 3,
        title: 'Perform Security Scanning',
        description: 'Scan cloud resources for security misconfigurations and vulnerabilities',
        action: 'Use automated security scanning tools',
        expectedResult: 'Comprehensive security assessment with remediation recommendations'
      },
      {
        step: 4,
        title: 'Set Up Compliance Monitoring',
        description: 'Configure SOC 2 compliance monitoring for cloud infrastructure',
        action: 'Set up compliance frameworks and monitoring',
        expectedResult: 'Automated SOC 2 compliance monitoring and reporting'
      }
    ]
  }
];

export function getDemoUseCase(useCaseId: string) {
  return DEMO_USE_CASES.find(useCase => useCase.id === useCaseId);
}

export function getDemoUseCasesByIndustry(industry: string) {
  return DEMO_USE_CASES.filter(useCase => useCase.industry === industry);
}