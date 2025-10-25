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
  BookOpen
} from 'lucide-react';

interface StartScreenProps {
  onGetStarted: () => void;
  onLoadDemo: () => void;
  onShowDemoScenarios?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onGetStarted, onLoadDemo, onShowDemoScenarios }) => {
  const { user } = useAuth();

  const stats = [
    {
      icon: Users,
      value: "Active",
      label: "User Sessions"
    },
    {
      icon: Building2,
      value: "Ready",
      label: "Platform Status"
    },
    {
      icon: Zap,
      value: "Real-time",
      label: "Data Processing"
    },
    {
      icon: Award,
      value: "Secure",
      label: "Data Storage"
    }
  ];

  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Shield,
      title: 'Comprehensive Asset Management',
      description: 'Track, categorize, and manage your digital assets in a centralized platform with filtering and search capabilities.',
      benefits: ['Asset tracking', 'Categorization', 'Search & filters']
    },
    {
      icon: BarChart3,
      title: 'Risk Assessment & Analytics',
      description: 'Gain insights into your asset risk profile with scoring, vulnerability tracking, and compliance monitoring.',
      benefits: ['Risk scoring', 'Vulnerability tracking', 'Compliance monitoring']
    },
    {
      icon: Lock,
      title: 'Security & Compliance',
      description: 'Help ensure your assets meet industry standards with compliance frameworks and security features.',
      benefits: ['Framework support', 'Audit capabilities', 'Security features']
    },
    {
      icon: Globe,
      title: 'Enterprise Integration',
      description: 'Integrate with existing tools and workflows through import/export capabilities and extensible architecture.',
      benefits: ['Data import/export', 'Extensible design', 'Workflow support']
    }
  ];

  const quickStartSteps = [
    {
      step: 1,
      title: 'Set Up Your Inventory',
      description: 'Import existing asset data or generate sample data to get started',
      action: 'Get Started'
    },
    {
      step: 2,
      title: 'Organize Your Assets',
      description: 'Categorize assets, assign criticality levels, and configure your preferences',
      action: 'Configure'
    },
    {
      step: 3,
      title: 'Monitor and Analyze',
      description: 'Track your inventory, generate reports, and maintain compliance',
      action: 'Manage'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-command-blue-600/10 to-action-cyan-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-to-r from-command-blue-600 to-action-cyan-600 rounded-2xl shadow-lg">
                <Shield className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-outfit font-bold text-gray-900 mb-6">
              ERMITS CyberSoluce<sup className="text-2xl">®</sup>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              A comprehensive asset inventory management platform for cybersecurity professionals
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-command-blue-600 to-command-blue-700 text-white text-lg font-semibold rounded-xl hover:from-command-blue-700 hover:to-command-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Play className="h-5 w-5 mr-2" />
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
              
              <button
                onClick={onLoadDemo}
                className="inline-flex items-center px-8 py-4 bg-white text-command-blue-600 text-lg font-semibold rounded-xl border-2 border-command-blue-200 hover:border-command-blue-300 hover:bg-command-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                View Demo
              </button>
              
              {onShowDemoScenarios && (
                <button
                  onClick={onShowDemoScenarios}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-action-cyan-600 to-action-cyan-700 text-white text-lg font-semibold rounded-xl hover:from-action-cyan-700 hover:to-action-cyan-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Award className="h-5 w-5 mr-2" />
                  Demo Scenarios
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-8 w-8 text-command-blue-600" />
                  </div>
                  <div className="text-3xl font-outfit font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-outfit font-bold text-gray-900 mb-4">
              Asset Management Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Features designed to help streamline your cybersecurity operations and improve asset visibility
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Feature Navigation */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-gradient-to-r from-command-blue-50 to-action-cyan-50 border-2 border-command-blue-200 shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      activeFeature === index ? 'bg-command-blue-600' : 'bg-gray-400'
                    } transition-colors duration-300`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{feature.description}</p>
                      <ul className="space-y-1">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-sm text-gray-500">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Visualization */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
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
                      <div className="text-xs opacity-75">Critical</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-lg font-bold text-green-400">89%</div>
                      <div className="text-xs opacity-75">Compliant</div>
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

      {/* Quick Start Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-outfit font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these simple steps to set up your asset inventory management system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickStartSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-command-blue-600 to-action-cyan-600 text-white rounded-xl font-bold text-lg mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-outfit font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {step.description}
                  </p>
                  <button className="text-command-blue-600 font-semibold hover:text-command-blue-700 transition-colors">
                    {step.action} →
                  </button>
                </div>
                
                {index < quickStartSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-command-blue-600 to-action-cyan-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-outfit font-bold text-white mb-6">
            Ready to Improve Your Asset Management?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Explore how ERMITS CyberSoluce® can help with your asset inventory management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center px-8 py-4 bg-white text-command-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <button
              onClick={onLoadDemo}
              className="inline-flex items-center px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-command-blue-600 transform hover:scale-105 transition-all duration-200"
            >
              <Play className="h-5 w-5 mr-2" />
              View Demo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
      </div>
    </div>
  );
};