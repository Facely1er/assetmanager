import React from 'react';
import { HeatMap } from '@nivo/heatmap';
import { Radar } from '@nivo/radar';
import { FrameworkPhase } from '../../types/framework';

interface FrameworkPageProps {
  phases: FrameworkPhase[];
}

export const FrameworkPage: React.FC<FrameworkPageProps> = ({ phases }) => {
  // Mock data for the heatmap
  const heatmapData = [
    {
      id: 'Identify',
      data: [
        { x: 'Asset Management', y: 8 },
        { x: 'Business Environment', y: 7 },
        { x: 'Governance', y: 9 },
        { x: 'Risk Assessment', y: 6 },
        { x: 'Risk Management', y: 7 }
      ]
    },
    {
      id: 'Protect',
      data: [
        { x: 'Access Control', y: 8 },
        { x: 'Awareness Training', y: 5 },
        { x: 'Data Security', y: 9 },
        { x: 'Maintenance', y: 7 },
        { x: 'Protective Technology', y: 8 }
      ]
    },
    {
      id: 'Detect',
      data: [
        { x: 'Anomalies', y: 6 },
        { x: 'Continuous Monitoring', y: 7 },
        { x: 'Detection Processes', y: 8 },
        { x: 'System Events', y: 7 },
        { x: 'Alert Thresholds', y: 6 }
      ]
    }
  ];

  // Mock data for the radar chart
  const radarData = [
    {
      metric: 'Asset Coverage',
      foundation: 65,
      development: 45,
      maturity: 30,
      optimization: 15
    },
    {
      metric: 'Risk Management',
      foundation: 80,
      development: 60,
      maturity: 40,
      optimization: 20
    },
    {
      metric: 'Dependency Mapping',
      foundation: 70,
      development: 50,
      maturity: 35,
      optimization: 25
    },
    {
      metric: 'Control Implementation',
      foundation: 75,
      development: 55,
      maturity: 45,
      optimization: 30
    },
    {
      metric: 'Continuous Monitoring',
      foundation: 60,
      development: 40,
      maturity: 25,
      optimization: 10
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Framework Implementation</h1>
          <p className="text-gray-500">Track and manage framework adoption progress</p>
        </div>
      </div>

      {/* Phase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {phases.map(phase => (
          <div key={phase.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">{phase.name}</h3>
              <span className="text-2xl font-bold text-blue-600">{phase.progress}%</span>
            </div>
            <div className="space-y-4">
              {phase.tasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No tasks defined
                </div>
              ) : (
                phase.tasks.map(task => {
                  const dueDate = task.dueDate instanceof Date 
                    ? task.dueDate 
                    : new Date(task.dueDate);
                  
                  return (
                    <div key={task.id} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{task.name}</div>
                        <div className="text-xs text-gray-500">
                          Due: {dueDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Implementation Heatmap</h3>
          <div className="h-80">
            <HeatMap
              data={heatmapData}
              margin={{ top: 20, right: 60, bottom: 60, left: 80 }}
              valueFormat=">-.2s"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: '',
                legendPosition: 'middle',
                legendOffset: 36
              }}
              colors={{
                type: 'sequential',
                scheme: 'blues'
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Maturity Assessment</h3>
          <div className="h-80">
            <Radar
              data={radarData}
              keys={['foundation', 'development', 'maturity', 'optimization']}
              indexBy="metric"
              valueFormat=">-.2f"
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
              borderColor={{ from: 'color' }}
              gridLabelOffset={36}
              dotSize={10}
              dotColor={{ theme: 'background' }}
              dotBorderWidth={2}
              colors={{ scheme: 'nivo' }}
              blendMode="multiply"
              motionConfig="wobbly"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

