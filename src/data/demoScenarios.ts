import { Asset } from '../types/asset';

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  industry: string;
  companySize: 'Startup' | 'SMB' | 'Enterprise' | 'Government';
  useCase: string;
  persona: string;
  challenges: string[];
  solutions: string[];
  keyFeatures: string[];
  assets: Asset[];
  complianceRequirements: string[];
  riskProfile: {
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    description: string;
    keyRisks: string[];
  };
  demoSteps: DemoStep[];
  expectedOutcomes: string[];
}

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  action: string;
  expectedResult: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'healthcare-hospital',
    name: 'Regional Hospital Network',
    description: 'A mid-size hospital network managing patient data systems, medical devices, and administrative infrastructure with strict HIPAA compliance requirements.',
    industry: 'Healthcare',
    companySize: 'SMB',
    useCase: 'HIPAA Compliance & Medical Device Management',
    persona: 'Healthcare IT Director',
    challenges: [
      'Managing 200+ medical devices across multiple locations',
      'Ensuring HIPAA compliance for all patient data systems',
      'Tracking vulnerabilities in legacy medical equipment',
      'Coordinating security updates across different departments',
      'Maintaining audit trails for compliance reporting'
    ],
    solutions: [
      'Centralized asset inventory with medical device categorization',
      'Automated compliance mapping for HIPAA requirements',
      'Vulnerability tracking specific to medical devices',
      'Role-based access control for different departments',
      'Automated compliance reporting and audit trails'
    ],
    keyFeatures: [
      'Medical device asset tracking',
      'HIPAA compliance monitoring',
      'Department-based access controls',
      'Vulnerability management for medical equipment',
      'Automated compliance reporting'
    ],
    assets: [], // Will be populated by generator
    complianceRequirements: ['HIPAA', 'HITECH', 'SOC 2', 'ISO 27001'],
    riskProfile: {
      level: 'High',
      description: 'High-risk environment due to patient data sensitivity and critical medical device dependencies',
      keyRisks: [
        'Patient data breaches',
        'Medical device vulnerabilities',
        'Regulatory compliance violations',
        'System downtime affecting patient care'
      ]
    },
    demoSteps: [
      {
        id: 'setup-inventory',
        title: 'Set Up Medical Device Inventory',
        description: 'Import and categorize medical devices, patient data systems, and administrative assets',
        action: 'Use the inventory generator to create a healthcare scenario with medical devices',
        expectedResult: 'Complete asset inventory with proper categorization and HIPAA tagging',
        duration: '10 minutes',
        difficulty: 'Easy'
      },
      {
        id: 'compliance-mapping',
        title: 'Map Assets to HIPAA Requirements',
        description: 'Assign compliance frameworks and requirements to each asset type',
        action: 'Navigate to compliance management and configure HIPAA requirements',
        expectedResult: 'All assets properly mapped to relevant compliance requirements',
        duration: '15 minutes',
        difficulty: 'Medium'
      },
      {
        id: 'vulnerability-assessment',
        title: 'Assess Medical Device Vulnerabilities',
        description: 'Review and manage vulnerabilities in medical devices and patient systems',
        action: 'Use vulnerability management to identify and prioritize security issues',
        expectedResult: 'Comprehensive vulnerability assessment with risk prioritization',
        duration: '20 minutes',
        difficulty: 'Advanced'
      },
      {
        id: 'generate-compliance-report',
        title: 'Generate HIPAA Compliance Report',
        description: 'Create comprehensive compliance report for audit purposes',
        action: 'Use reporting features to generate HIPAA compliance documentation',
        expectedResult: 'Detailed compliance report ready for audit submission',
        duration: '10 minutes',
        difficulty: 'Easy'
      }
    ],
    expectedOutcomes: [
      'Complete visibility into all medical devices and patient data systems',
      'Automated HIPAA compliance monitoring and reporting',
      'Streamlined vulnerability management for medical equipment',
      'Improved audit readiness and regulatory compliance',
      'Enhanced security posture for patient data protection'
    ]
  },
  {
    id: 'financial-bank',
    name: 'Regional Bank & Trust',
    description: 'A regional bank managing customer financial data, payment processing systems, and trading platforms with strict PCI DSS and SOX compliance requirements.',
    industry: 'Financial Services',
    companySize: 'SMB',
    useCase: 'PCI DSS Compliance & Financial Data Protection',
    persona: 'Bank CISO',
    challenges: [
      'Managing 500+ financial systems across multiple branches',
      'Ensuring PCI DSS compliance for payment processing',
      'SOX compliance for financial reporting systems',
      'High-frequency trading platform security',
      'Customer data protection across all touchpoints'
    ],
    solutions: [
      'Comprehensive financial asset inventory with PCI DSS mapping',
      'Automated compliance monitoring for financial regulations',
      'Real-time vulnerability tracking for payment systems',
      'Audit trail management for SOX compliance',
      'Risk assessment for financial data exposure'
    ],
    keyFeatures: [
      'Financial system asset tracking',
      'PCI DSS compliance monitoring',
      'SOX audit trail management',
      'Payment system vulnerability tracking',
      'Financial risk assessment'
    ],
    assets: [], // Will be populated by generator
    complianceRequirements: ['PCI DSS', 'SOX', 'FFIEC', 'ISO 27001', 'SOC 2'],
    riskProfile: {
      level: 'Critical',
      description: 'Critical risk environment due to financial data sensitivity and regulatory requirements',
      keyRisks: [
        'Financial data breaches',
        'Payment system compromises',
        'Regulatory compliance violations',
        'Trading platform security incidents'
      ]
    },
    demoSteps: [
      {
        id: 'setup-financial-inventory',
        title: 'Set Up Financial Systems Inventory',
        description: 'Import and categorize banking systems, payment processors, and trading platforms',
        action: 'Use the inventory generator to create a financial services scenario',
        expectedResult: 'Complete financial asset inventory with proper categorization',
        duration: '15 minutes',
        difficulty: 'Easy'
      },
      {
        id: 'pci-compliance-setup',
        title: 'Configure PCI DSS Compliance',
        description: 'Set up PCI DSS compliance monitoring for payment processing systems',
        action: 'Navigate to compliance management and configure PCI DSS requirements',
        expectedResult: 'All payment systems mapped to PCI DSS requirements',
        duration: '20 minutes',
        difficulty: 'Medium'
      },
      {
        id: 'risk-assessment',
        title: 'Conduct Financial Risk Assessment',
        description: 'Assess risk levels for all financial systems and data repositories',
        action: 'Use risk assessment tools to evaluate financial system security',
        expectedResult: 'Comprehensive risk assessment with prioritized remediation',
        duration: '25 minutes',
        difficulty: 'Advanced'
      },
      {
        id: 'audit-preparation',
        title: 'Prepare SOX Audit Documentation',
        description: 'Generate comprehensive audit documentation for SOX compliance',
        action: 'Use reporting features to create SOX audit documentation',
        expectedResult: 'Complete audit package ready for external auditors',
        duration: '15 minutes',
        difficulty: 'Medium'
      }
    ],
    expectedOutcomes: [
      'Complete visibility into all financial systems and payment processors',
      'Automated PCI DSS compliance monitoring and reporting',
      'Streamlined SOX audit preparation and documentation',
      'Enhanced security posture for financial data protection',
      'Improved regulatory compliance and audit readiness'
    ]
  },
  {
    id: 'tech-startup',
    name: 'Cloud-Native Tech Startup',
    description: 'A fast-growing technology startup with cloud-first infrastructure, microservices architecture, and rapid scaling requirements.',
    industry: 'Technology',
    companySize: 'Startup',
    useCase: 'Cloud Asset Management & Rapid Scaling',
    persona: 'Startup CTO',
    challenges: [
      'Managing rapidly changing cloud infrastructure',
      'Tracking microservices and containerized applications',
      'Ensuring security across multiple cloud providers',
      'Scaling asset management with company growth',
      'Maintaining compliance during rapid development'
    ],
    solutions: [
      'Cloud-native asset discovery and tracking',
      'Automated infrastructure monitoring',
      'Microservices dependency mapping',
      'Multi-cloud security posture management',
      'Scalable compliance framework implementation'
    ],
    keyFeatures: [
      'Cloud asset discovery',
      'Microservices tracking',
      'Multi-cloud management',
      'Container security monitoring',
      'Automated compliance scanning'
    ],
    assets: [], // Will be populated by generator
    complianceRequirements: ['SOC 2', 'ISO 27001'],
    riskProfile: {
      level: 'Medium',
      description: 'Medium risk environment with focus on cloud security and rapid scaling',
      keyRisks: [
        'Cloud misconfigurations',
        'Container vulnerabilities',
        'API security issues',
        'Data exposure in cloud storage'
      ]
    },
    demoSteps: [
      {
        id: 'cloud-discovery',
        title: 'Discover Cloud Infrastructure',
        description: 'Automatically discover and catalog cloud resources across providers',
        action: 'Use cloud discovery features to map AWS, Azure, and GCP resources',
        expectedResult: 'Complete cloud infrastructure inventory with dependencies',
        duration: '15 minutes',
        difficulty: 'Easy'
      },
      {
        id: 'microservices-mapping',
        title: 'Map Microservices Architecture',
        description: 'Document microservices, APIs, and service dependencies',
        action: 'Use relationship mapping to document service dependencies',
        expectedResult: 'Complete microservices architecture documentation',
        duration: '20 minutes',
        difficulty: 'Medium'
      },
      {
        id: 'security-scanning',
        title: 'Perform Security Scanning',
        description: 'Scan cloud resources for security misconfigurations and vulnerabilities',
        action: 'Use automated security scanning tools',
        expectedResult: 'Comprehensive security assessment with remediation recommendations',
        duration: '25 minutes',
        difficulty: 'Advanced'
      },
      {
        id: 'compliance-setup',
        title: 'Set Up SOC 2 Compliance',
        description: 'Configure SOC 2 compliance monitoring for cloud infrastructure',
        action: 'Set up compliance frameworks and monitoring',
        expectedResult: 'Automated SOC 2 compliance monitoring and reporting',
        duration: '15 minutes',
        difficulty: 'Medium'
      }
    ],
    expectedOutcomes: [
      'Complete visibility into cloud infrastructure and microservices',
      'Automated security scanning and vulnerability management',
      'Streamlined compliance monitoring for cloud environments',
      'Enhanced security posture for rapid scaling',
      'Improved operational efficiency and risk management'
    ]
  },
  {
    id: 'manufacturing-plant',
    name: 'Industrial Manufacturing Plant',
    description: 'A large manufacturing facility with industrial control systems, IoT devices, and OT/IT convergence requiring specialized security management.',
    industry: 'Manufacturing',
    companySize: 'Enterprise',
    useCase: 'OT/IT Security & Industrial Control Systems',
    persona: 'Manufacturing IT Director',
    challenges: [
      'Managing 1000+ industrial control systems and IoT devices',
      'Securing legacy OT systems with limited security features',
      'OT/IT network segmentation and access control',
      'Compliance with industrial security standards',
      'Managing security for production-critical systems'
    ],
    solutions: [
      'Industrial asset discovery and classification',
      'OT/IT network mapping and segmentation',
      'Legacy system security assessment',
      'Industrial compliance framework implementation',
      'Production system security monitoring'
    ],
    keyFeatures: [
      'Industrial control system tracking',
      'OT/IT network mapping',
      'Legacy system security assessment',
      'Industrial compliance monitoring',
      'Production system protection'
    ],
    assets: [], // Will be populated by generator
    complianceRequirements: ['ISO 27001', 'NIST', 'IEC 62443'],
    riskProfile: {
      level: 'High',
      description: 'High risk environment due to production-critical systems and legacy OT infrastructure',
      keyRisks: [
        'Production system compromises',
        'Legacy OT system vulnerabilities',
        'OT/IT network breaches',
        'Industrial espionage and sabotage'
      ]
    },
    demoSteps: [
      {
        id: 'ot-discovery',
        title: 'Discover Industrial Control Systems',
        description: 'Identify and catalog all industrial control systems and IoT devices',
        action: 'Use industrial asset discovery to map OT infrastructure',
        expectedResult: 'Complete inventory of industrial control systems and IoT devices',
        duration: '20 minutes',
        difficulty: 'Medium'
      },
      {
        id: 'network-mapping',
        title: 'Map OT/IT Network Architecture',
        description: 'Document network segmentation and data flow between OT and IT systems',
        action: 'Use network mapping tools to document OT/IT architecture',
        expectedResult: 'Complete network architecture documentation with segmentation',
        duration: '25 minutes',
        difficulty: 'Advanced'
      },
      {
        id: 'legacy-assessment',
        title: 'Assess Legacy System Security',
        description: 'Evaluate security posture of legacy industrial control systems',
        action: 'Use specialized tools to assess legacy OT system security',
        expectedResult: 'Comprehensive security assessment of legacy systems',
        duration: '30 minutes',
        difficulty: 'Advanced'
      },
      {
        id: 'compliance-implementation',
        title: 'Implement Industrial Compliance',
        description: 'Set up IEC 62443 and NIST compliance monitoring',
        action: 'Configure compliance frameworks for industrial security standards',
        expectedResult: 'Automated compliance monitoring for industrial security standards',
        duration: '20 minutes',
        difficulty: 'Medium'
      }
    ],
    expectedOutcomes: [
      'Complete visibility into industrial control systems and IoT devices',
      'Enhanced OT/IT network security and segmentation',
      'Improved security posture for legacy industrial systems',
      'Streamlined compliance with industrial security standards',
      'Better protection for production-critical systems'
    ]
  },
  {
    id: 'government-agency',
    name: 'Federal Government Agency',
    description: 'A federal government agency managing classified and sensitive data systems with strict FISMA and FedRAMP compliance requirements.',
    industry: 'Government',
    companySize: 'Government',
    useCase: 'FISMA Compliance & Classified Data Management',
    persona: 'Government CISO',
    challenges: [
      'Managing 2000+ classified and unclassified systems',
      'Ensuring FISMA compliance across all systems',
      'FedRAMP compliance for cloud services',
      'CJIS compliance for law enforcement data',
      'Managing security for legacy government systems'
    ],
    solutions: [
      'Classified system inventory and categorization',
      'FISMA compliance monitoring and reporting',
      'FedRAMP cloud service management',
      'CJIS compliance for law enforcement systems',
      'Legacy system security modernization'
    ],
    keyFeatures: [
      'Classified system tracking',
      'FISMA compliance monitoring',
      'FedRAMP cloud management',
      'CJIS compliance tracking',
      'Legacy system modernization'
    ],
    assets: [], // Will be populated by generator
    complianceRequirements: ['FISMA', 'NIST', 'FedRAMP', 'CJIS'],
    riskProfile: {
      level: 'Critical',
      description: 'Critical risk environment due to classified data and national security implications',
      keyRisks: [
        'Classified data breaches',
        'Nation-state cyber attacks',
        'Insider threats',
        'Legacy system vulnerabilities'
      ]
    },
    demoSteps: [
      {
        id: 'classified-inventory',
        title: 'Create Classified System Inventory',
        description: 'Catalog all classified and unclassified government systems',
        action: 'Use specialized tools to discover and categorize government systems',
        expectedResult: 'Complete inventory of classified and unclassified systems',
        duration: '25 minutes',
        difficulty: 'Medium'
      },
      {
        id: 'fisma-compliance',
        title: 'Set Up FISMA Compliance',
        description: 'Configure FISMA compliance monitoring and reporting',
        action: 'Set up FISMA compliance frameworks and monitoring',
        expectedResult: 'Automated FISMA compliance monitoring and reporting',
        duration: '30 minutes',
        difficulty: 'Advanced'
      },
      {
        id: 'fedramp-management',
        title: 'Manage FedRAMP Cloud Services',
        description: 'Track and monitor FedRAMP-authorized cloud services',
        action: 'Configure FedRAMP compliance monitoring for cloud services',
        expectedResult: 'Complete FedRAMP compliance monitoring for cloud services',
        duration: '20 minutes',
        difficulty: 'Medium'
      },
      {
        id: 'security-assessment',
        title: 'Conduct Security Assessment',
        description: 'Perform comprehensive security assessment of all systems',
        action: 'Use security assessment tools to evaluate all government systems',
        expectedResult: 'Comprehensive security assessment with remediation plan',
        duration: '45 minutes',
        difficulty: 'Advanced'
      }
    ],
    expectedOutcomes: [
      'Complete visibility into classified and unclassified government systems',
      'Automated FISMA compliance monitoring and reporting',
      'Streamlined FedRAMP cloud service management',
      'Enhanced security posture for government systems',
      'Improved compliance with federal security requirements'
    ]
  },
  {
    id: 'education-university',
    name: 'Major University',
    description: 'A large university managing student data, research systems, and administrative infrastructure with FERPA compliance requirements.',
    industry: 'Education',
    companySize: 'Enterprise',
    useCase: 'FERPA Compliance & Student Data Protection',
    persona: 'University CISO',
    challenges: [
      'Managing 1500+ systems across multiple campuses',
      'Ensuring FERPA compliance for student data systems',
      'Protecting research data and intellectual property',
      'Managing BYOD and student device access',
      'Coordinating security across academic departments'
    ],
    solutions: [
      'Comprehensive campus system inventory',
      'FERPA compliance monitoring and reporting',
      'Research data protection and classification',
      'BYOD security management',
      'Department-based access control and monitoring'
    ],
    keyFeatures: [
      'Campus system tracking',
      'FERPA compliance monitoring',
      'Research data protection',
      'BYOD security management',
      'Department access control'
    ],
    assets: [], // Will be populated by generator
    complianceRequirements: ['FERPA', 'SOC 2', 'ISO 27001', 'NIST'],
    riskProfile: {
      level: 'Medium',
      description: 'Medium risk environment with focus on student data protection and research security',
      keyRisks: [
        'Student data breaches',
        'Research data theft',
        'BYOD security incidents',
        'Academic system compromises'
      ]
    },
    demoSteps: [
      {
        id: 'campus-inventory',
        title: 'Create Campus System Inventory',
        description: 'Discover and catalog all systems across university campuses',
        action: 'Use discovery tools to map all university systems and networks',
        expectedResult: 'Complete inventory of all campus systems and networks',
        duration: '20 minutes',
        difficulty: 'Easy'
      },
      {
        id: 'ferpa-compliance',
        title: 'Set Up FERPA Compliance',
        description: 'Configure FERPA compliance monitoring for student data systems',
        action: 'Set up FERPA compliance frameworks and monitoring',
        expectedResult: 'Automated FERPA compliance monitoring and reporting',
        duration: '25 minutes',
        difficulty: 'Medium'
      },
      {
        id: 'research-protection',
        title: 'Implement Research Data Protection',
        description: 'Set up security controls for research data and intellectual property',
        action: 'Configure research data classification and protection',
        expectedResult: 'Comprehensive research data protection framework',
        duration: '30 minutes',
        difficulty: 'Advanced'
      },
      {
        id: 'byod-management',
        title: 'Set Up BYOD Security Management',
        description: 'Configure security controls for student and faculty devices',
        action: 'Set up BYOD security policies and monitoring',
        expectedResult: 'Comprehensive BYOD security management system',
        duration: '20 minutes',
        difficulty: 'Medium'
      }
    ],
    expectedOutcomes: [
      'Complete visibility into all campus systems and networks',
      'Automated FERPA compliance monitoring and reporting',
      'Enhanced protection for research data and intellectual property',
      'Improved BYOD security management',
      'Better coordination of security across academic departments'
    ]
  }
];

export function getDemoScenario(scenarioId: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find(scenario => scenario.id === scenarioId);
}

export function getDemoScenariosByIndustry(industry: string): DemoScenario[] {
  return DEMO_SCENARIOS.filter(scenario => scenario.industry === industry);
}

export function getDemoScenariosByCompanySize(size: string): DemoScenario[] {
  return DEMO_SCENARIOS.filter(scenario => scenario.companySize === size);
}

export function getDemoScenariosByRiskLevel(level: string): DemoScenario[] {
  return DEMO_SCENARIOS.filter(scenario => scenario.riskProfile.level === level);
}