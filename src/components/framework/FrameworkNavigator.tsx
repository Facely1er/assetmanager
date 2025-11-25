import React from 'react';
import { 
  Database, Network, AlertTriangle, 
  Shield, BarChart, Building2
} from 'lucide-react';

interface FrameworkNavigatorProps {
  onNavigate: (section: string) => void;
}

export const FrameworkNavigator: React.FC<FrameworkNavigatorProps> = ({ onNavigate }) => {
  const sections = [
    {
      id: 'inventory',
      name: 'Technology Foundation',
      description: 'Asset inventory and classification',
      icon: <Database size={24} className="text-blue-500" />,
      color: 'border-blue-500'
    },
    {
      id: 'dependencies',
      name: 'Dependency Mapping',
      description: 'Relationship mapping and analysis',
      icon: <Network size={24} className="text-teal-500" />,
      color: 'border-teal-500'
    },
    {
      id: 'bia',
      name: 'Business Impact',
      description: 'Impact analysis and assessment',
      icon: <Building2 size={24} className="text-purple-500" />,
      color: 'border-purple-500'
    },
    {
      id: 'risks',
      name: 'Risk Assessment',
      description: 'Risk identification and evaluation',
      icon: <AlertTriangle size={24} className="text-orange-500" />,
      color: 'border-orange-500'
    },
    {
      id: 'mitigation',
      name: 'Controls & Mitigation',
      description: 'Risk treatment and controls',
      icon: <Shield size={24} className="text-green-500" />,
      color: 'border-green-500'
    },
    {
      id: 'reports',
      name: 'Reporting & Metrics',
      description: 'Analysis and compliance reporting',
      icon: <BarChart size={24} className="text-indigo-500" />,
      color: 'border-indigo-500'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Framework Navigator</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={`p-4 rounded-lg border-l-4 ${section.color} bg-white hover:bg-gray-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg p-2 bg-gray-100">
                {section.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{section.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{section.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

