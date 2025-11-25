import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BusinessFunction, BusinessImpact } from '../../types/business-impact';
import { Asset } from '../../types/asset';

interface BusinessImpactPageProps {
  assets: Asset[];
  businessFunctions: BusinessFunction[];
  businessImpacts: BusinessImpact[];
}

export const BusinessImpactPage: React.FC<BusinessImpactPageProps> = ({
  assets,
  businessFunctions,
  businessImpacts
}) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');

  // Calculate chart data
  const chartData = businessImpacts
    .filter(impact => !selectedFunction || impact.businessFunctionId === selectedFunction)
    .reduce((acc, impact) => {
      const financial = impact.financialImpact.hourlyRevenueLoss + 
        impact.financialImpact.recoveryCosts + 
        impact.financialImpact.reputationalCosts + 
        impact.financialImpact.penalties;
      
      const operational = impact.operationalImpact.affectedUsers * 100 + 
        impact.operationalImpact.affectedProcesses * 1000 +
        (impact.operationalImpact.workaroundAvailable ? 0 : 5000);
      
      const regulatory = impact.regulatoryImpact.penaltiesPerDay * 30 +
        (impact.regulatoryImpact.reportingRequired ? 10000 : 0);

      return [
        { category: 'Financial', value: acc[0]?.value + financial || financial },
        { category: 'Operational', value: acc[1]?.value + operational || operational },
        { category: 'Regulatory', value: acc[2]?.value + regulatory || regulatory },
      ];
    }, [] as { category: string; value: number }[]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Impact Analysis</h1>
          <p className="text-gray-500">Assess and analyze business impact of technology assets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Business Functions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Critical Business Functions</h3>
          <div className="space-y-4">
            {businessFunctions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No business functions defined yet.
              </div>
            ) : (
              businessFunctions.map(func => (
                <button
                  key={func.id}
                  onClick={() => setSelectedFunction(selectedFunction === func.id ? '' : func.id)}
                  className={`w-full p-4 rounded-lg border transition-colors ${
                    selectedFunction === func.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-left">{func.name}</h4>
                      <p className="text-sm text-gray-500 text-left">{func.department}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(func.priority)}`}>
                      {func.priority}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-left">
                    <div>
                      <div className="text-gray-500">MTD</div>
                      <div className="font-medium">{func.mtd}h</div>
                    </div>
                    <div>
                      <div className="text-gray-500">RTO</div>
                      <div className="font-medium">{func.rto}h</div>
                    </div>
                    <div>
                      <div className="text-gray-500">RPO</div>
                      <div className="font-medium">{func.rpo}h</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Impact Analysis */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Impact Analysis</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No impact data available
              </div>
            )}
          </div>

          {/* Impact Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Impact Details</h3>
            <div className="space-y-4">
              {businessImpacts
                .filter(impact => !selectedFunction || impact.businessFunctionId === selectedFunction)
                .map(impact => {
                  const asset = assets.find(a => a.id === impact.assetId);
                  const func = businessFunctions.find(f => f.id === impact.businessFunctionId);
                  
                  const totalFinancial = impact.financialImpact.hourlyRevenueLoss +
                    impact.financialImpact.recoveryCosts +
                    impact.financialImpact.reputationalCosts +
                    impact.financialImpact.penalties;
                  
                  return (
                    <div key={impact.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{asset?.name || 'Unknown Asset'}</h4>
                          <p className="text-sm text-gray-500">{func?.name || 'Unknown Function'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Total Financial Impact</div>
                          <div className="font-medium">
                            ${totalFinancial.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Operational Impact</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Affected Users:</span>
                              <span>{impact.operationalImpact.affectedUsers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Affected Processes:</span>
                              <span>{impact.operationalImpact.affectedProcesses}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Workaround Available:</span>
                              <span>{impact.operationalImpact.workaroundAvailable ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-2">Regulatory Impact</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Daily Penalties:</span>
                              <span>${impact.regulatoryImpact.penaltiesPerDay}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reporting Required:</span>
                              <span>{impact.regulatoryImpact.reportingRequired ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-2">Recovery</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Recovery Costs:</span>
                              <span>${impact.financialImpact.recoveryCosts.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reputational Impact:</span>
                              <span>${impact.financialImpact.reputationalCosts.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {businessImpacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No impact assessments available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

