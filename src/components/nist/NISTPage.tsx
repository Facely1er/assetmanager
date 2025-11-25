import React from 'react';
import { Radar } from '@nivo/radar';
import { NISTAssessment, NISTMapping, NISTControl } from '../../types/nist';

interface NISTPageProps {
  assessment: NISTAssessment;
  mapping: NISTMapping;
  controls: NISTControl[];
}

export const NISTPage: React.FC<NISTPageProps> = ({
  assessment,
  mapping,
  controls
}) => {
  const radarData = [
    {
      function: 'Identify',
      score: assessment.functionScores.identify,
      baseline: 80
    },
    {
      function: 'Protect',
      score: assessment.functionScores.protect,
      baseline: 85
    },
    {
      function: 'Detect',
      score: assessment.functionScores.detect,
      baseline: 75
    },
    {
      function: 'Respond',
      score: assessment.functionScores.respond,
      baseline: 70
    },
    {
      function: 'Recover',
      score: assessment.functionScores.recover,
      baseline: 65
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'partially-implemented': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partially-compliant': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NIST Framework</h1>
          <p className="text-gray-500">Cybersecurity Framework Implementation and Assessment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Framework Functions Radar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Framework Functions</h3>
          <div className="h-80">
            <Radar
              data={radarData}
              keys={['score', 'baseline']}
              indexBy="function"
              maxValue={100}
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
              curve="linearClosed"
              borderWidth={2}
              borderColor={{ from: 'color' }}
              gridLevels={5}
              gridShape="circular"
              gridLabelOffset={36}
              enableDots={true}
              dotSize={8}
              dotColor={{ theme: 'background' }}
              dotBorderWidth={2}
              enableDotLabel={true}
              dotLabel="value"
              dotLabelYOffset={-12}
              colors={['#3B82F6', '#6B7280']}
              blendMode="multiply"
              legends={[
                {
                  anchor: 'top-left',
                  direction: 'column',
                  translateX: -50,
                  translateY: -40,
                  itemWidth: 80,
                  itemHeight: 20,
                  itemTextColor: '#666',
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#000'
                      }
                    }
                  ]
                }
              ]}
            />
          </div>
        </div>

        {/* Control Implementation Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Control Implementation Status</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {controls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No controls defined yet.
              </div>
            ) : (
              controls.map(control => {
                const finding = assessment.findings.find(f => f.controlId === control.id);
                
                return (
                  <div key={control.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{control.id}</h4>
                        <p className="text-sm text-gray-500">{control.title}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(control.status)}`}>
                        {control.status}
                      </span>
                    </div>
                    {finding && (
                      <div className="mt-2 text-sm">
                        <div className="text-gray-600">{finding.evidence}</div>
                        {finding.remediation && (
                          <div className="mt-1 text-orange-600">
                            Remediation: {finding.remediation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Assessment Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Assessment Timeline</h3>
        {assessment.findings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No assessment findings available.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-8 w-px bg-gray-200" />
            <div className="space-y-8">
              {assessment.findings.map((finding, index) => (
                <div key={index} className="relative pl-12">
                  <div className={`absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${
                    finding.status === 'compliant' ? 'bg-green-100 border-green-500' :
                    finding.status === 'partially-compliant' ? 'bg-yellow-100 border-yellow-500' :
                    'bg-red-100 border-red-500'
                  }`} />
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{finding.controlId}</h4>
                      <p className="text-sm text-gray-500 mt-1">{finding.evidence}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplianceColor(finding.status)}`}>
                      {finding.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

