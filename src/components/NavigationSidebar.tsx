import React from 'react';
import { 
  Home, 
  Shield, 
  BarChart3, 
  Settings, 
  FileText, 
  Users, 
  AlertTriangle,
  Building2,
  Activity,
  HelpCircle,
  BookOpen,
  User as UserIcon,
  Zap,
  LogOut,
  Target,
  Play,
  Database,
  Network,
  Lock,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface NavigationSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user?: { id: string; email: string; full_name?: string };
  onShowTeamManagement?: () => void;
  signOut?: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  user,
  onShowTeamManagement,
  signOut,
}) => {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      id: 'workflow',
      label: 'Setup Workflow',
      icon: Target,
      description: 'Guided setup and roadmap'
    },
    {
      id: 'demo-scenarios',
      label: 'Demo Scenarios',
      icon: Play,
      description: 'Industry use cases and demos'
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: Shield,
      description: 'Manage your inventory'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Reports and insights'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: FileText,
      description: 'Framework management'
    },
    {
      id: 'privacy-compliance',
      label: 'Privacy & Data',
      icon: Database,
      description: 'Privacy compliance & data protection'
    },
    {
      id: 'dependencies',
      label: 'Dependencies',
      icon: Network,
      description: 'Asset dependencies mapping'
    },
    {
      id: 'data-protection',
      label: 'Data Protection',
      icon: Lock,
      description: 'Security controls & data protection'
    },
    {
      id: 'vulnerabilities',
      label: 'Vulnerabilities',
      icon: AlertTriangle,
      description: 'Security issues'
    },
    {
      id: 'mitigation',
      label: 'Mitigation',
      icon: CheckCircle2,
      description: 'Risk mitigation planning'
    },
    {
      id: 'business-impact',
      label: 'Business Impact',
      icon: Building2,
      description: 'BIA and continuity planning'
    },
    {
      id: 'nist',
      label: 'NIST Framework',
      icon: Shield,
      description: 'NIST CSF implementation'
    },
    {
      id: 'framework',
      label: 'Framework',
      icon: TrendingUp,
      description: 'Implementation tracking'
    },
    {
      id: 'organizations',
      label: 'Organizations',
      icon: Building2,
      description: 'Manage entities'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'User management'
    },
    {
      id: 'activity',
      label: 'Activity Log',
      icon: Activity,
      description: 'System activity'
    },
    {
      id: 'user-manual',
      label: 'User Manual',
      icon: BookOpen,
      description: 'Help and documentation'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'System configuration'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'Additional support'
    }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-command-blue-600 mr-3" />
              <div>
                <div className="font-outfit font-bold text-gray-900">ERMITS</div>
                <div className="text-xs text-gray-500">CyberSoluce®</div>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className={`w-4 h-4 border-2 border-gray-400 rounded transition-transform ${
              isCollapsed ? 'rotate-180' : ''
            }`}>
              <div className="w-0 h-0 border-l-2 border-l-gray-400 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group ${
              activeView === item.id
                ? 'bg-command-blue-50 text-command-blue-700 border border-command-blue-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
              activeView === item.id ? 'text-command-blue-600' : 'text-gray-400 group-hover:text-gray-600'
            }`} />
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-600">
                  {item.description}
                </div>
              </div>
            )}
            {!isCollapsed && activeView === item.id && (
              <div className="w-2 h-2 bg-command-blue-600 rounded-full"></div>
            )}
          </button>
        ))}
      </nav>

      {/* User Section */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-command-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-command-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          {onShowTeamManagement && (
            <button
              onClick={onShowTeamManagement}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors mb-2"
            >
              <Zap className="h-4 w-4 mr-2" />
              Team Settings
            </button>
          )}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-command-blue-50 to-action-cyan-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-900 mb-1">
              Need Help?
            </div>
            <div className="text-xs text-gray-600 mb-2">
              Check our documentation and support resources
            </div>
            <button 
              onClick={() => onViewChange('user-manual')}
              className="text-xs text-command-blue-600 font-medium hover:text-command-blue-700"
            >
              View User Manual →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};