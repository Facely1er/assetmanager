import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Building2, 
  Zap,
  BarChart3,
  Lock,
  Globe,
  Award,
  Play,
  BookOpen,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface StartScreenProps {
  onGetStarted: () => void;
  onLoadDemo: () => void;
  onShowDemoScenarios?: () => void;
  onShowUserManual?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onGetStarted, onLoadDemo, onShowDemoScenarios, onShowUserManual }) => {
  const { user } = useAuth();

  const stats = [
    { label: 'Assets Managed', value: '10M+', icon: Building2 },
    { label: 'Organizations', value: '5K+', icon: Users },
    { label: 'Compliance Frameworks', value: '15+', icon: Award },
    { label: 'Uptime', value: '99.9%', icon: Zap },
  ];

  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Shield,
      title: 'Comprehensive Asset Management',
      description: 'Track, categorize, and manage all your digital assets in one centralized platform with advanced filtering and search capabilities.',
      benefits: ['Real-time asset tracking', 'Inventory generator for sample data', 'Advanced categorization', 'Powerful search & filters']
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
      description: 'Upload your existing asset data via CSV, connect to your systems, or use our inventory generator to create sample data for different scenarios',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section - Matching Wireframe */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-command-blue-600 to-action-cyan-600 rounded-lg">
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
              {onShowUserManual && (
                <button
                  onClick={onShowUserManual}
                  className="inline-flex items-center px-4 py-2 text-command-blue-600 dark:text-command-blue-400 text-sm font-medium hover:text-command-blue-700 dark:hover:text-command-blue-300"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  User Manual
                </button>
              )}
              <button
                onClick={onLoadDemo}
                className="inline-flex items-center px-4 py-2 text-command-blue-600 dark:text-command-blue-400 text-sm font-medium hover:text-command-blue-700 dark:hover:text-command-blue-300"
              >
                <Play className="h-4 w-4 mr-2" />
                View Demo
              </button>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-command-blue-600 to-command-blue-700 text-white text-sm font-semibold rounded-lg hover:from-command-blue-700 hover:to-command-blue-800 transition-all"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features Section - Matching Wireframe Layout */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-outfit font-bold text-gray-900 dark:text-white mb-4">
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
                  className="p-6 rounded-xl border-2 border-command-blue-200 dark:border-command-blue-800 bg-gradient-to-r from-command-blue-50/50 to-action-cyan-50/50 dark:from-command-blue-900/20 dark:to-action-cyan-900/20 hover:shadow-lg transition-all duration-300"
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
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-2xl">
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
      </div>

      {/* Get Started Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-outfit font-bold text-gray-900 dark:text-white mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
              Follow these simple steps to set up your asset inventory management system.
            </p>
            {onShowUserManual && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need help? Check out our{' '}
                <button
                  onClick={onShowUserManual}
                  className="text-command-blue-600 dark:text-command-blue-400 hover:underline font-medium"
                >
                  comprehensive User Manual
                </button>
                {' '}for detailed guides and tutorials.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickStartSteps.map((step, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-command-blue-600 to-action-cyan-600 text-white rounded-full font-bold text-lg mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-outfit font-semibold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {step.description}
                </p>
                <button 
                  onClick={index === 0 ? onLoadDemo : index === 2 ? onGetStarted : undefined}
                  className="text-command-blue-600 dark:text-command-blue-400 font-semibold hover:text-command-blue-700 dark:hover:text-command-blue-300 transition-colors inline-flex items-center"
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
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
      </div>
    </div>
  );
};