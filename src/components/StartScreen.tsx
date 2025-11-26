import React, { useState, useRef, useEffect } from 'react';
import { logger } from '../utils/logger';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  BarChart3,
  Lock,
  Globe,
  Search,
  Play,
  X,
  Server,
  Database,
  Network,
  Monitor,
  Gift,
  FileText,
  Building2 as Building
} from 'lucide-react';

interface StartScreenProps {
  onGetStarted: () => void;
  onLoadDemo: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onGetStarted, onLoadDemo }) => {
  const [demoSearch, setDemoSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('all');

  const handleGetStarted = () => {
    try {
      onGetStarted();
    } catch (error) {
      logger.error('Error starting application', error instanceof Error ? error : undefined);
    }
  };

  const handleLoadDemo = () => {
    try {
      onLoadDemo();
    } catch (error) {
      logger.error('Error loading demo', error instanceof Error ? error : undefined);
    }
  };

  // Demo assets for interactive preview
  const demoAssets = [
    {
      id: '1',
      name: 'Production Web Server',
      type: 'Server',
      criticality: 'Critical',
      riskScore: 85,
      status: 'Active',
      location: 'Data Center A',
      compliance: ['SOC 2', 'ISO 27001']
    },
    {
      id: '2',
      name: 'Customer Database',
      type: 'Database',
      criticality: 'Critical',
      riskScore: 92,
      status: 'Active',
      location: 'Data Center A',
      compliance: ['PCI DSS', 'SOC 2']
    },
    {
      id: '3',
      name: 'API Gateway',
      type: 'Network',
      criticality: 'High',
      riskScore: 65,
      status: 'Active',
      location: 'Cloud',
      compliance: ['ISO 27001']
    },
    {
      id: '4',
      name: 'Monitoring Dashboard',
      type: 'Application',
      criticality: 'Medium',
      riskScore: 45,
      status: 'Active',
      location: 'Cloud',
      compliance: ['SOC 2']
    },
    {
      id: '5',
      name: 'Backup Storage',
      type: 'Server',
      criticality: 'High',
      riskScore: 58,
      status: 'Active',
      location: 'Data Center B',
      compliance: ['ISO 27001']
    },
    {
      id: '6',
      name: 'Development Database',
      type: 'Database',
      criticality: 'Low',
      riskScore: 32,
      status: 'Active',
      location: 'Cloud',
      compliance: []
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Server': return Server;
      case 'Database': return Database;
      case 'Network': return Network;
      default: return Monitor;
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Helper component for risk score bar to avoid inline styles
  const RiskScoreBar: React.FC<{ score: number }> = ({ score }) => {
    const barRef = useRef<HTMLDivElement>(null);
    const width = Math.min(score, 100);

    useEffect(() => {
      if (barRef.current) {
        barRef.current.style.setProperty('--risk-score-width', `${width}%`);
      }
    }, [width]);

    return (
      <div
        ref={barRef}
        className={`risk-score-bar-fill ${
          score >= 75 ? 'bg-red-500' :
          score >= 50 ? 'bg-orange-500' :
          score >= 25 ? 'bg-yellow-500' : 'bg-green-500'
        }`}
        aria-label={`Risk score: ${score}%`}
      />
    );
  };

  const filteredAssets = demoAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(demoSearch.toLowerCase()) ||
                         asset.location.toLowerCase().includes(demoSearch.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    const matchesCriticality = selectedCriticality === 'all' || asset.criticality === selectedCriticality;
    return matchesSearch && matchesType && matchesCriticality;
  });

  const features = [
    {
      icon: Shield,
      title: 'Comprehensive Asset Management',
      description: 'Track, categorize, and manage all your digital assets in one centralized platform with advanced filtering and search capabilities.',
      benefits: ['Real-time asset tracking', 'Advanced categorization', 'Powerful search & filters']
    },
    {
      icon: BarChart3,
      title: 'Risk Assessment & Analytics',
      description: 'Get detailed insights into your asset risk profile with automated scoring, vulnerability tracking, and compliance monitoring.',
      benefits: ['Automated risk scoring', 'Vulnerability management', 'Compliance tracking']
    },
    {
      icon: Lock,
      title: 'Security & Compliance',
      description: 'Ensure your assets meet industry standards with built-in compliance frameworks and security best practices.',
      benefits: ['Multi-framework support', 'Audit trails', 'Security monitoring']
    },
    {
      icon: Globe,
      title: 'Enterprise Integration',
      description: 'Seamlessly integrate with your existing tools and workflows through our robust API and import/export capabilities.',
      benefits: ['API integration', 'Bulk import/export', 'Workflow automation']
    }
  ];

  const quickStartSteps = [
    {
      step: 1,
      title: 'Import or Generate Your Assets',
      description: 'Upload your existing asset data via CSV or use our inventory generator to create sample data for different scenarios',
      action: 'Get Started'
    },
    {
      step: 2,
      title: 'Configure Settings',
      description: 'Set up compliance frameworks, risk parameters, and organizational structure',
      action: 'Configure'
    },
    {
      step: 3,
      title: 'Start Managing',
      description: 'Begin tracking, analyzing, and optimizing your asset inventory',
      action: 'Manage'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" role="main">
      {/* Header Section - Matching Wireframe */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-command-blue-600 to-action-cyan-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-outfit font-bold text-gray-900 dark:text-white">
                  CyberSoluce<sup className="text-sm">™</sup>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">by ERMITS</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGetStarted}
                aria-label="Get started with CyberSoluce Asset Manager"
                className="inline-flex items-center px-6 py-3 bg-command-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-command-blue-700 focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Features Section - Matching Wireframe Layout */}
      <section className="py-16 bg-white dark:bg-gray-800" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h2 id="features-heading" className="text-4xl md:text-5xl font-outfit font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Asset Management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
              Powerful features designed to streamline your cybersecurity operations and ensure comprehensive asset visibility.
            </p>
          </div>

          {/* Features and Dashboard Grid - Wireframe Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Feature Cards - Stacked Vertically */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-command-blue-200 dark:border-command-blue-800 bg-gradient-to-r from-command-blue-50/50 to-action-cyan-50/50 dark:from-command-blue-900/20 dark:to-action-cyan-900/20 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-lg bg-command-blue-600 dark:bg-command-blue-500 flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-outfit font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
                        {feature.description}
                      </p>
                      <ul className="space-y-1.5">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Asset Dashboard Preview */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-2xl border border-gray-700">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-outfit font-semibold">Asset Dashboard</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm opacity-75">Total Assets</span>
                      <span className="text-2xl font-bold">1,247</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-lg font-bold text-red-400">23</div>
                      <div className="text-xs opacity-75 mt-1">Critical</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-lg font-bold text-green-400">89%</div>
                      <div className="text-xs opacity-75 mt-1">Compliant</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {['Production Server', 'Database Cluster', 'Network Switch'].map((asset, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
                        <span className="text-sm">{asset}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-red-400' : index === 1 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-gradient-to-br from-command-blue-50 via-white to-action-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" aria-labelledby="interactive-demo-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="interactive-demo-heading" className="text-4xl font-outfit font-bold text-gray-900 dark:text-white mb-4">
              Try It Out - Interactive Demo
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Explore our platform with this interactive preview. Search, filter, and see how easy it is to manage your assets.
            </p>
            <button
              onClick={handleLoadDemo}
              className="inline-flex items-center px-6 py-3 bg-command-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-command-blue-700 focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label="Launch full interactive demo"
            >
              <Play className="h-4 w-4 mr-2" aria-hidden="true" />
              Launch Full Demo
            </button>
          </div>

          {/* Interactive Asset Table Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Demo Toolbar */}
            <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assets by name or location..."
                    value={demoSearch}
                    onChange={(e) => setDemoSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:border-transparent"
                    aria-label="Search assets"
                  />
                  {demoSearch && (
                    <button
                      onClick={() => setDemoSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:border-transparent"
                    aria-label="Filter by asset type"
                  >
                    <option value="all">All Types</option>
                    <option value="Server">Server</option>
                    <option value="Database">Database</option>
                    <option value="Network">Network</option>
                    <option value="Application">Application</option>
                  </select>

                  <select
                    value={selectedCriticality}
                    onChange={(e) => setSelectedCriticality(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:border-transparent"
                    aria-label="Filter by criticality"
                  >
                    <option value="all">All Criticality</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredAssets.length} of {demoAssets.length} assets
              </div>
            </div>

            {/* Asset Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Criticality</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Risk Score</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Compliance</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAssets.map((asset) => {
                    const TypeIcon = getTypeIcon(asset.type);
                    return (
                      <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-command-blue-50 dark:bg-command-blue-900/20 rounded-lg mr-3">
                              <TypeIcon className="h-4 w-4 text-command-blue-600 dark:text-command-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{asset.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{asset.status}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-gray-100">{asset.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCriticalityColor(asset.criticality)}`}>
                            {asset.criticality}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm font-semibold ${getRiskScoreColor(asset.riskScore)}`}>
                              {asset.riskScore}
                            </span>
                            <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative overflow-hidden">
                              <RiskScoreBar score={asset.riskScore} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {asset.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {asset.compliance.slice(0, 2).map((framework, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-command-blue-100 text-command-blue-800 dark:bg-command-blue-900/30 dark:text-command-blue-300">
                                {framework}
                              </span>
                            ))}
                            {asset.compliance.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                                +{asset.compliance.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Demo Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This is a preview. <button onClick={handleLoadDemo} className="text-command-blue-600 dark:text-command-blue-400 hover:underline font-medium">Launch full demo</button> to explore all features.
                </p>
                <button
                  onClick={handleLoadDemo}
                  className="inline-flex items-center px-4 py-2 bg-command-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-command-blue-700 focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  aria-label="Launch full demo"
                >
                  Explore Full Demo
                  <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Tools Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" aria-labelledby="free-tools-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h2 id="free-tools-heading" className="text-4xl font-outfit font-bold text-gray-900 dark:text-white mb-4">
              Free Cybersecurity Assessment Tools
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Start your cybersecurity journey with our professional, browser-based tools. No installation, no account required. Privacy-first design.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                No Installation
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Privacy-First
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Instant Access
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Data Inventory Tool */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-outfit font-semibold text-gray-900 dark:text-white mb-2">
                Data Inventory Tool
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Discover, catalog, and track all organizational data. Perfect for GDPR Article 30 preparation.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>13 core data fields</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>PII & Sensitive tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>CSV/JSON export</span>
                </li>
              </ul>
              <a
                href="/tools/DataInventoryTool.html"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Open Tool →
              </a>
            </div>

            {/* Information Asset Register */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-outfit font-semibold text-gray-900 dark:text-white mb-2">
                Asset Register
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Comprehensive asset management with automated gap analysis and compliance tracking.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>20+ asset fields</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automated gap analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Multi-framework compliance</span>
                </li>
              </ul>
              <a
                href="/tools/InformationAssetRegister.html"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Open Tool →
              </a>
            </div>

            {/* Vendor Register Manager */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-outfit font-semibold text-gray-900 dark:text-white mb-2">
                Vendor Register
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Third-party risk management with automated risk scoring and gap analysis.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>15+ vendor fields</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automated risk scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Contract tracking</span>
                </li>
              </ul>
              <a
                href="/tools/VendorRegisterManager.html"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Open Tool →
              </a>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/tools/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-command-blue-600 dark:text-command-blue-400 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-command-blue-600 dark:border-command-blue-400 transition-colors"
            >
              View All Free Tools
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900" aria-labelledby="get-started-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="get-started-heading" className="text-4xl font-outfit font-bold text-gray-900 dark:text-white mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Follow these simple steps to set up your asset inventory management system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickStartSteps.map((step, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 h-full border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-command-blue-600 to-action-cyan-500 text-white rounded-full font-bold text-lg mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-outfit font-semibold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {step.description}
                </p>
                <button 
                  onClick={index === 0 ? handleLoadDemo : index === 2 ? handleGetStarted : undefined}
                  aria-label={`${step.action} - ${step.title}`}
                  disabled={index === 1}
                  className="text-command-blue-600 dark:text-command-blue-400 font-semibold hover:text-command-blue-700 dark:hover:text-command-blue-300 focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:ring-offset-2 rounded transition-colors duration-200 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-8 w-8 text-command-blue-400 mr-3" />
              <div>
                <div className="text-xl font-outfit font-bold">ERMITS CyberSoluce®</div>
                <div className="text-sm text-gray-400">Asset Inventory Management</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 ERMITS CyberSoluce®. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};