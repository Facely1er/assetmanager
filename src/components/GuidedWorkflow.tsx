import React, { useState } from 'react';
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Target,
  Users,
  Shield,
  Upload,
  BarChart3,
  Settings,
  FileText,
  Zap,
  AlertTriangle,
  Play,
  ChevronRight,
  Clock,
  Star,
  Award
} from 'lucide-react';
import { useLocalStorage } from '../hooks';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  category: 'Setup' | 'Configuration' | 'Operations' | 'Advanced';
  prerequisites?: string[];
  actions: WorkflowAction[];
  tips?: string[];
  resources?: { title: string; url?: string; action?: () => void }[];
}

interface WorkflowAction {
  id: string;
  title: string;
  description: string;
  actionType: 'navigate' | 'modal' | 'external' | 'info';
  actionData?: Record<string, unknown>;
  completed?: boolean;
}

interface GuidedWorkflowProps {
  onNavigate: (view: string) => void;
  onShowImport: () => void;
  onShowInventoryGenerator: () => void;
  onShowTeamManagement: () => void;
  currentStats?: {
    totalAssets: number;
    hasAssets: boolean;
    hasTeam: boolean;
    hasCompliance: boolean;
  };
}

export const GuidedWorkflow: React.FC<GuidedWorkflowProps> = ({
  onNavigate,
  onShowImport,
  onShowInventoryGenerator,
  onShowTeamManagement,
  currentStats = { totalAssets: 0, hasAssets: false, hasTeam: false, hasCompliance: false }
}) => {
  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>('ermits-completed-workflow-steps', []);
  const [activeStep, setActiveStep] = useState<string>('initial-setup');
  const [expandedStep, setExpandedStep] = useState<string | null>('initial-setup');

  const workflowSteps: WorkflowStep[] = [
    {
      id: 'initial-setup',
      title: 'Initial Platform Setup',
      description: 'Get familiar with the platform interface and core features',
      icon: Target,
      estimatedTime: '5 minutes',
      difficulty: 'Easy',
      category: 'Setup',
      actions: [
        {
          id: 'explore-dashboard',
          title: 'Explore Dashboard',
          description: 'Navigate to the main dashboard to see platform overview',
          actionType: 'navigate',
          actionData: 'dashboard'
        },
        {
          id: 'review-features',
          title: 'Review Key Features',
          description: 'Understand asset management, compliance, and reporting capabilities',
          actionType: 'info'
        },
        {
          id: 'check-user-manual',
          title: 'Access User Manual',
          description: 'Review comprehensive documentation and help resources',
          actionType: 'navigate',
          actionData: 'user-manual'
        }
      ],
      tips: [
        'Start with the dashboard to get an overview of your current state',
        'The user manual contains detailed information about all features',
        'Navigation sidebar provides quick access to all major sections'
      ]
    },
    {
      id: 'asset-import',
      title: 'Import or Generate Asset Data',
      description: 'Populate your inventory with existing asset data or generate sample data',
      icon: Upload,
      estimatedTime: '10-30 minutes',
      difficulty: 'Easy',
      category: 'Setup',
      prerequisites: ['initial-setup'],
      actions: [
        {
          id: 'choose-import-method',
          title: 'Choose Import Method',
          description: 'Decide between CSV import, inventory generation, or manual entry',
          actionType: 'info'
        },
        {
          id: 'csv-import',
          title: 'Import from CSV',
          description: 'Upload existing asset data using our CSV template',
          actionType: 'modal',
          actionData: 'import'
        },
        {
          id: 'generate-inventory',
          title: 'Generate Sample Inventory',
          description: 'Create realistic asset data for different organizational scenarios',
          actionType: 'modal',
          actionData: 'generator'
        },
        {
          id: 'manual-entry',
          title: 'Add Assets Manually',
          description: 'Create individual assets using the asset form',
          actionType: 'navigate',
          actionData: 'assets'
        }
      ],
      tips: [
        'Download the CSV template for the correct import format',
        'Sample inventories help you explore features with realistic data',
        'Start with one method and expand as needed'
      ],
      resources: [
        { title: 'CSV Import Guide', action: () => onNavigate('user-manual') },
        { title: 'Download CSV Template', action: () => onShowImport() }
      ]
    },
    {
      id: 'asset-organization',
      title: 'Organize and Categorize Assets',
      description: 'Configure asset properties, tags, and compliance frameworks',
      icon: Shield,
      estimatedTime: '15-45 minutes',
      difficulty: 'Medium',
      category: 'Configuration',
      prerequisites: ['asset-import'],
      actions: [
        {
          id: 'review-asset-types',
          title: 'Review Asset Types',
          description: 'Ensure all assets are properly categorized by type',
          actionType: 'navigate',
          actionData: 'assets'
        },
        {
          id: 'assign-criticality',
          title: 'Assign Criticality Levels',
          description: 'Set appropriate criticality levels based on business impact',
          actionType: 'navigate',
          actionData: 'assets'
        },
        {
          id: 'add-compliance-frameworks',
          title: 'Add Compliance Frameworks',
          description: 'Tag assets with relevant compliance requirements',
          actionType: 'navigate',
          actionData: 'assets'
        },
        {
          id: 'organize-with-tags',
          title: 'Organize with Tags',
          description: 'Create consistent tagging strategy for easy filtering',
          actionType: 'navigate',
          actionData: 'assets'
        }
      ],
      tips: [
        'Use consistent naming conventions for owners and locations',
        'Assign criticality based on business impact, not technical complexity',
        'Tags help with filtering and reporting - be consistent'
      ]
    },
    {
      id: 'team-setup',
      title: 'Set Up Team Collaboration',
      description: 'Configure user access, roles, and organizational structure',
      icon: Users,
      estimatedTime: '20-60 minutes',
      difficulty: 'Medium',
      category: 'Configuration',
      prerequisites: ['asset-organization'],
      actions: [
        {
          id: 'create-organization',
          title: 'Create Organization',
          description: 'Set up your company or team structure',
          actionType: 'modal',
          actionData: 'team'
        },
        {
          id: 'invite-team-members',
          title: 'Invite Team Members',
          description: 'Send invitations to colleagues who need access',
          actionType: 'modal',
          actionData: 'team'
        },
        {
          id: 'configure-roles',
          title: 'Configure User Roles',
          description: 'Assign appropriate permissions to team members',
          actionType: 'modal',
          actionData: 'team'
        },
        {
          id: 'test-collaboration',
          title: 'Test Collaboration Features',
          description: 'Verify team members can access and edit assets appropriately',
          actionType: 'info'
        }
      ],
      tips: [
        'Start with a small team and expand gradually',
        'Use viewer roles for stakeholders who only need visibility',
        'Regular review of permissions helps maintain security'
      ]
    },
    {
      id: 'compliance-setup',
      title: 'Configure Compliance Monitoring',
      description: 'Set up compliance frameworks and monitoring for your assets',
      icon: FileText,
      estimatedTime: '30-90 minutes',
      difficulty: 'Medium',
      category: 'Configuration',
      prerequisites: ['asset-organization'],
      actions: [
        {
          id: 'select-frameworks',
          title: 'Select Compliance Frameworks',
          description: 'Choose relevant frameworks (SOC 2, ISO 27001, PCI DSS, etc.)',
          actionType: 'navigate',
          actionData: 'compliance'
        },
        {
          id: 'map-assets',
          title: 'Map Assets to Frameworks',
          description: 'Assign appropriate compliance requirements to each asset',
          actionType: 'navigate',
          actionData: 'assets'
        },
        {
          id: 'set-compliance-targets',
          title: 'Set Compliance Targets',
          description: 'Define compliance goals and monitoring thresholds',
          actionType: 'navigate',
          actionData: 'compliance'
        },
        {
          id: 'review-coverage',
          title: 'Review Compliance Coverage',
          description: 'Analyze current compliance status and identify gaps',
          actionType: 'navigate',
          actionData: 'analytics'
        }
      ],
      tips: [
        'Focus on frameworks most relevant to your industry',
        'Regular compliance audits help maintain standards',
        'Use reporting features to track compliance over time'
      ]
    },
    {
      id: 'risk-assessment',
      title: 'Implement Risk Assessment',
      description: 'Configure risk scoring and vulnerability management',
      icon: AlertTriangle,
      estimatedTime: '45-120 minutes',
      difficulty: 'Advanced',
      category: 'Operations',
      prerequisites: ['asset-organization', 'compliance-setup'],
      actions: [
        {
          id: 'review-risk-scores',
          title: 'Review Risk Scores',
          description: 'Analyze current risk scores and adjust as needed',
          actionType: 'navigate',
          actionData: 'analytics'
        },
        {
          id: 'configure-risk-thresholds',
          title: 'Configure Risk Thresholds',
          description: 'Set appropriate risk level thresholds for your organization',
          actionType: 'navigate',
          actionData: 'settings'
        },
        {
          id: 'vulnerability-tracking',
          title: 'Set Up Vulnerability Tracking',
          description: 'Begin tracking and managing security vulnerabilities',
          actionType: 'navigate',
          actionData: 'vulnerabilities'
        },
        {
          id: 'risk-reporting',
          title: 'Configure Risk Reporting',
          description: 'Set up automated risk assessment reports',
          actionType: 'navigate',
          actionData: 'analytics'
        }
      ],
      tips: [
        'Risk scores should reflect business impact, not just technical severity',
        'Regular vulnerability scans help maintain security posture',
        'Automated reporting saves time and ensures consistency'
      ]
    },
    {
      id: 'reporting-analytics',
      title: 'Set Up Reporting & Analytics',
      description: 'Configure dashboards, reports, and analytics for ongoing monitoring',
      icon: BarChart3,
      estimatedTime: '30-90 minutes',
      difficulty: 'Medium',
      category: 'Operations',
      prerequisites: ['asset-organization'],
      actions: [
        {
          id: 'explore-analytics',
          title: 'Explore Analytics Dashboard',
          description: 'Review available charts, metrics, and insights',
          actionType: 'navigate',
          actionData: 'analytics'
        },
        {
          id: 'generate-reports',
          title: 'Generate Initial Reports',
          description: 'Create PDF, Excel, and CSV reports for stakeholders',
          actionType: 'navigate',
          actionData: 'analytics'
        },
        {
          id: 'schedule-reports',
          title: 'Schedule Automated Reports',
          description: 'Set up recurring reports for regular monitoring',
          actionType: 'navigate',
          actionData: 'settings'
        },
        {
          id: 'share-dashboards',
          title: 'Share with Stakeholders',
          description: 'Provide access to relevant reports and dashboards',
          actionType: 'modal',
          actionData: 'team'
        }
      ],
      tips: [
        'Start with weekly reports and adjust frequency as needed',
        'Different stakeholders need different report types',
        'Export capabilities help with external compliance requirements'
      ]
    },
    {
      id: 'ongoing-maintenance',
      title: 'Ongoing Maintenance & Optimization',
      description: 'Establish processes for regular updates and continuous improvement',
      icon: Settings,
      estimatedTime: 'Ongoing',
      difficulty: 'Medium',
      category: 'Operations',
      prerequisites: ['reporting-analytics'],
      actions: [
        {
          id: 'regular-updates',
          title: 'Schedule Regular Asset Updates',
          description: 'Establish process for keeping asset information current',
          actionType: 'info'
        },
        {
          id: 'review-metrics',
          title: 'Monthly Metrics Review',
          description: 'Analyze trends and identify areas for improvement',
          actionType: 'navigate',
          actionData: 'analytics'
        },
        {
          id: 'team-training',
          title: 'Ongoing Team Training',
          description: 'Ensure team members stay updated on platform features',
          actionType: 'navigate',
          actionData: 'user-manual'
        },
        {
          id: 'optimization',
          title: 'Process Optimization',
          description: 'Refine workflows based on usage patterns and feedback',
          actionType: 'info'
        }
      ],
      tips: [
        'Regular maintenance prevents data quality issues',
        'Monthly reviews help identify trends and patterns',
        'Continuous training improves team adoption and efficiency'
      ]
    }
  ];

  const handleStepAction = (step: WorkflowStep, action: WorkflowAction) => {
    switch (action.actionType) {
      case 'navigate':
        onNavigate(action.actionData);
        break;
      case 'modal':
        if (action.actionData === 'import') onShowImport();
        else if (action.actionData === 'generator') onShowInventoryGenerator();
        else if (action.actionData === 'team') onShowTeamManagement();
        break;
      case 'external':
        if (action.actionData) window.open(action.actionData, '_blank');
        break;
      case 'info':
        // Show info modal or tooltip
        break;
    }
    
    markActionComplete(step.id, action.id);
  };

  const markActionComplete = (stepId: string, actionId: string) => {
    const actionKey = `${stepId}-${actionId}`;
    if (!completedSteps.includes(actionKey)) {
      setCompletedSteps([...completedSteps, actionKey]);
    }
  };

  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const isActionCompleted = (stepId: string, actionId: string) => {
    return completedSteps.includes(`${stepId}-${actionId}`);
  };

  const isStepCompleted = (stepId: string) => {
    const step = workflowSteps.find(s => s.id === stepId);
    if (!step) return false;
    
    return step.actions.every(action => isActionCompleted(stepId, action.id));
  };

  const getStepProgress = (stepId: string) => {
    const step = workflowSteps.find(s => s.id === stepId);
    if (!step) return 0;
    
    const completedActions = step.actions.filter(action => isActionCompleted(stepId, action.id)).length;
    return Math.round((completedActions / step.actions.length) * 100);
  };

  const getTotalProgress = () => {
    const completedStepsCount = workflowSteps.filter(step => isStepCompleted(step.id)).length;
    return Math.round((completedStepsCount / workflowSteps.length) * 100);
  };

  const getNextRecommendedStep = () => {
    // Logic to determine next step based on current state and completed steps
    if (!currentStats.hasAssets) return 'asset-import';
    if (currentStats.hasAssets && !currentStats.hasCompliance) return 'compliance-setup';
    if (!currentStats.hasTeam) return 'team-setup';
    return 'reporting-analytics';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Setup': return 'text-blue-600 bg-blue-50';
      case 'Configuration': return 'text-purple-600 bg-purple-50';
      case 'Operations': return 'text-green-600 bg-green-50';
      case 'Advanced': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const recommendedStep = getNextRecommendedStep();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold mb-2 flex items-center">
              <Target className="h-8 w-8 mr-3" />
              Platform Setup Roadmap
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Follow this guided workflow to set up and optimize your asset inventory management
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                <span>{getTotalProgress()}% Complete</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Estimated: 2-6 hours total</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                <span>{workflowSteps.length} steps</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="text-3xl font-bold">{getTotalProgress()}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-outfit font-semibold text-gray-900 mb-4">Progress Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Setup', 'Configuration', 'Operations', 'Advanced'].map(category => {
            const categorySteps = workflowSteps.filter(step => step.category === category);
            const completedCategorySteps = categorySteps.filter(step => isStepCompleted(step.id)).length;
            const categoryProgress = Math.round((completedCategorySteps / categorySteps.length) * 100);
            
            return (
              <div key={category} className={`p-4 rounded-lg border ${getCategoryColor(category)}`}>
                <h3 className="font-medium mb-2">{category}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{completedCategorySteps}/{categorySteps.length} steps</span>
                  <span className="text-sm font-bold">{categoryProgress}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div 
                    className="bg-current h-2 rounded-full transition-all duration-300"
                    style={{ width: `${categoryProgress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Next Step */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-lg font-outfit font-semibold text-blue-900 mb-2 flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Recommended Next Step
        </h2>
        {(() => {
          const nextStep = workflowSteps.find(step => step.id === recommendedStep);
          return nextStep ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">{nextStep.title}</h3>
                <p className="text-blue-800 text-sm">{nextStep.description}</p>
              </div>
              <button
                onClick={() => {
                  setActiveStep(nextStep.id);
                  setExpandedStep(nextStep.id);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Step
              </button>
            </div>
          ) : (
            <p className="text-blue-800">Great job! You've completed the essential setup steps.</p>
          );
        })()}
      </div>

      {/* Workflow Steps */}
      <div className="space-y-6">
        {workflowSteps.map((step, index) => {
          const completed = isStepCompleted(step.id);
          const progress = getStepProgress(step.id);
          const canStart = !step.prerequisites || step.prerequisites.every(prereq => isStepCompleted(prereq));
          
          return (
            <div 
              key={step.id} 
              className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 ${
                completed ? 'border-green-200 bg-green-50' :
                activeStep === step.id ? 'border-purple-300 shadow-md' :
                'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Step Header */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${completed ? 'bg-green-600' : canStart ? 'bg-purple-600' : 'bg-gray-400'}`}>
                      {completed ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <step.icon className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-outfit font-semibold text-gray-900">
                          {index + 1}. {step.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(step.difficulty)}`}>
                          {step.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(step.category)}`}>
                          {step.category}
                        </span>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {step.estimatedTime}
                        </span>
                        <span>{progress}% complete</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {!canStart && (
                      <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                        Prerequisites needed
                      </span>
                    )}
                    <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedStep === step.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>
                
                {progress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          completed ? 'bg-green-600' : 'bg-purple-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step Details */}
              {expandedStep === step.id && (
                <div className="border-t border-gray-100 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Actions */}
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold text-gray-900 mb-4">Action Items</h4>
                      <div className="space-y-3">
                        {step.actions.map((action) => {
                          const actionCompleted = isActionCompleted(step.id, action.id);
                          return (
                            <div 
                              key={action.id}
                              className={`p-4 rounded-lg border transition-all ${
                                actionCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {actionCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-gray-400" />
                                  )}
                                  <div>
                                    <h5 className="font-medium text-gray-900">{action.title}</h5>
                                    <p className="text-sm text-gray-600">{action.description}</p>
                                  </div>
                                </div>
                                {!actionCompleted && canStart && (
                                  <button
                                    onClick={() => handleStepAction(step, action)}
                                    className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                  >
                                    <ArrowRight className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tips and Resources */}
                    <div className="space-y-6">
                      {step.tips && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">💡 Tips</h4>
                          <ul className="space-y-2">
                            {step.tips.map((tip, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <span className="text-purple-500 mr-2">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.resources && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">📚 Resources</h4>
                          <div className="space-y-2">
                            {step.resources.map((resource, index) => (
                              <button
                                key={index}
                                onClick={resource.action}
                                className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <div className="text-sm font-medium text-blue-900">{resource.title}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.prerequisites && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Prerequisites</h4>
                          <div className="space-y-2">
                            {step.prerequisites.map((prereqId) => {
                              const prereq = workflowSteps.find(s => s.id === prereqId);
                              const prereqCompleted = isStepCompleted(prereqId);
                              return prereq ? (
                                <div key={prereqId} className="flex items-center space-x-2">
                                  {prereqCompleted ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className={`text-sm ${prereqCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                                    {prereq.title}
                                  </span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mark Complete Button */}
                  {canStart && !completed && progress > 50 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                      <button
                        onClick={() => markStepComplete(step.id)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Step Complete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Celebration */}
      {getTotalProgress() === 100 && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <div className="mb-4">
            <Award className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-outfit font-bold mb-2">Congratulations! 🎉</h2>
            <p className="text-lg">
              You've successfully completed the platform setup. Your asset inventory management system is ready for production use!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              View Dashboard
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-green-600 transition-colors"
            >
              <FileText className="h-5 w-5 mr-2" />
              Generate Reports
            </button>
          </div>
        </div>
      )}
    </div>
  );
};