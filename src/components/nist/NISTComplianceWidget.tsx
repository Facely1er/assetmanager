import React from 'react';
import { Shield } from 'lucide-react';
import { NISTAssessment, NISTFunction } from '../../types/nist';

interface NISTComplianceWidgetProps {
  assessment: NISTAssessment;
}

export const NISTComplianceWidget: React.FC<NISTComplianceWidgetProps> = ({ assessment }) => {
  const formatScore = (score: number) => `${Math.round(score)}%`;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const functionLabels: Record<NISTFunction, string> = {
    identify: 'Identify',
    protect: 'Protect',
    detect: 'Detect',
    respond: 'Respond',
    recover: 'Recover'
  };

  const assessmentDate = assessment.date instanceof Date 
    ? assessment.date 
    : new Date(assessment.date);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">NIST CSF Compliance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <Shield size={32} className={getScoreColor(assessment.overallScore)} />
              <span className={getScoreColor(assessment.overallScore)}>
                {formatScore(assessment.overallScore)}
              </span>
            </div>
            <div className="text-sm text-gray-500">Overall NIST Compliance</div>
            <div className="text-xs text-gray-400 mt-1">
              Last assessed: {assessmentDate.toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {(Object.keys(assessment.functionScores) as NISTFunction[]).map((func) => (
            <div key={func}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">
                  {functionLabels[func]}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatScore(assessment.functionScores[func])}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    assessment.functionScores[func] >= 80 ? 'bg-green-600' :
                    assessment.functionScores[func] >= 60 ? 'bg-yellow-600' :
                    assessment.functionScores[func] >= 40 ? 'bg-orange-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: formatScore(assessment.functionScores[func]) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {assessment.findings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <div className="font-medium mb-2">Recent Findings</div>
            <div className="space-y-2">
              {assessment.findings.slice(0, 3).map((finding, index) => (
                <div 
                  key={finding.controlId + index}
                  className={`p-2 rounded-md ${
                    finding.status === 'compliant' ? 'bg-green-50' :
                    finding.status === 'partially-compliant' ? 'bg-yellow-50' :
                    'bg-red-50'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{finding.controlId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      finding.status === 'compliant' ? 'bg-green-100 text-green-800' :
                      finding.status === 'partially-compliant' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {finding.status}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-gray-600 line-clamp-2">
                    {finding.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

