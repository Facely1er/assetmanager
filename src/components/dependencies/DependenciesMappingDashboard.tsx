import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, 
  GitBranch, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Target,
  Shield,
  Database,
  Server,
  Cloud,
  FileText,
  Users,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import { Asset, AssetDependency, AssetRelationship } from '../../types/asset';
import { useAssetInventory } from '../../hooks/useAssetInventory';
import { exportToCSV } from '../../utils/assetUtils';
import toast from 'react-hot-toast';

interface DependencyNode {
  id: string;
  name: string;
  type: string;
  criticality: string;
  riskScore: number;
  x: number;
  y: number;
  dependencies: string[];
  dependents: string[];
  isSelected: boolean;
  isHighlighted: boolean;
}

interface DependencyEdge {
  source: string;
  target: string;
  type: string;
  strength: string;
  dataFlow: string;
  isPersonalData: boolean;
  purpose: string;
}

interface DependencyStats {
  totalNodes: number;
  totalEdges: number;
  criticalDependencies: number;
  circularDependencies: number;
  highRiskDependencies: number;
  personalDataFlows: number;
  averageDependencyDepth: number;
}

export const DependenciesMappingDashboard: React.FC = () => {
  const { assets } = useAssetInventory();
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);
  const [showOnlyPersonalData, setShowOnlyPersonalData] = useState(false);
  const [viewMode, setViewMode] = useState<'network' | 'hierarchy' | 'matrix'>('network');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<DependencyStats | null>(null);
  const [nodes, setNodes] = useState<DependencyNode[]>([]);
  const [edges, setEdges] = useState<DependencyEdge[]>([]);

  useEffect(() => {
    buildDependencyGraph();
  }, [assets, selectedAsset, showOnlyCritical, showOnlyPersonalData, searchTerm]);

  const buildDependencyGraph = () => {
    const filteredAssets = assets.filter(asset => {
      if (searchTerm && !asset.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (showOnlyCritical && asset.criticality !== 'Critical') {
        return false;
      }
      if (showOnlyPersonalData && !isPersonalDataAsset(asset)) {
        return false;
      }
      return true;
    });

    const nodeMap = new Map<string, DependencyNode>();
    const edgeList: DependencyEdge[] = [];

    // Create nodes
    filteredAssets.forEach((asset, index) => {
      const node: DependencyNode = {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        criticality: asset.criticality,
        riskScore: asset.riskScore,
        x: Math.random() * 800 + 100, // Random positioning for now
        y: Math.random() * 600 + 100,
        dependencies: [],
        dependents: [],
        isSelected: selectedAsset === asset.id,
        isHighlighted: selectedAsset === asset.id || 
          (selectedAsset && asset.relationships.some(rel => rel.relatedAssetId === selectedAsset))
      };

      nodeMap.set(asset.id, node);
    });

    // Create edges from relationships
    filteredAssets.forEach(asset => {
      asset.relationships.forEach(relationship => {
        if (nodeMap.has(relationship.relatedAssetId)) {
          const edge: DependencyEdge = {
            source: asset.id,
            target: relationship.relatedAssetId,
            type: relationship.relationshipType,
            strength: relationship.strength,
            dataFlow: relationship.dataFlowDirection,
            isPersonalData: relationship.isPersonalData,
            purpose: relationship.purpose
          };

          edgeList.push(edge);

          // Update node dependencies
          const sourceNode = nodeMap.get(asset.id);
          const targetNode = nodeMap.get(relationship.relatedAssetId);
          
          if (sourceNode && targetNode) {
            sourceNode.dependencies.push(relationship.relatedAssetId);
            targetNode.dependents.push(asset.id);
          }
        }
      });
    });

    // Calculate circular dependencies
    const circularDependencies = findCircularDependencies(nodeMap, edgeList);

    // Calculate stats
    const stats: DependencyStats = {
      totalNodes: nodeMap.size,
      totalEdges: edgeList.length,
      criticalDependencies: edgeList.filter(edge => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        return sourceNode?.criticality === 'Critical' || targetNode?.criticality === 'Critical';
      }).length,
      circularDependencies: circularDependencies.length,
      highRiskDependencies: edgeList.filter(edge => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        return (sourceNode?.riskScore || 0) >= 70 || (targetNode?.riskScore || 0) >= 70;
      }).length,
      personalDataFlows: edgeList.filter(edge => edge.isPersonalData).length,
      averageDependencyDepth: calculateAverageDepth(nodeMap, edgeList)
    };

    setNodes(Array.from(nodeMap.values()));
    setEdges(edgeList);
    setStats(stats);
  };

  const findCircularDependencies = (nodeMap: Map<string, DependencyNode>, edges: DependencyEdge[]): string[][] => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart));
        return;
      }

      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (node) {
        node.dependencies.forEach(depId => {
          dfs(depId, [...path, nodeId]);
        });
      }

      recursionStack.delete(nodeId);
    };

    nodeMap.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    });

    return cycles;
  };

  const calculateAverageDepth = (nodeMap: Map<string, DependencyNode>, edges: DependencyEdge[]): number => {
    let totalDepth = 0;
    let nodeCount = 0;

    nodeMap.forEach((node, nodeId) => {
      const depth = calculateNodeDepth(nodeId, nodeMap, new Set());
      totalDepth += depth;
      nodeCount++;
    });

    return nodeCount > 0 ? Math.round(totalDepth / nodeCount) : 0;
  };

  const calculateNodeDepth = (nodeId: string, nodeMap: Map<string, DependencyNode>, visited: Set<string>): number => {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node || node.dependencies.length === 0) return 0;

    const maxChildDepth = Math.max(
      ...node.dependencies.map(depId => calculateNodeDepth(depId, nodeMap, new Set(visited)))
    );

    return 1 + maxChildDepth;
  };

  const isPersonalDataAsset = (asset: Asset): boolean => {
    return asset.dataTypes?.some(type => ['PII', 'PHI', 'Personal Data'].includes(type)) ||
           asset.type === 'Personal Data' ||
           asset.type === 'Sensitive Data';
  };

  const getNodeColor = (node: DependencyNode): string => {
    if (node.isSelected) return 'bg-blue-500';
    if (node.isHighlighted) return 'bg-blue-200';
    if (node.criticality === 'Critical') return 'bg-red-500';
    if (node.criticality === 'High') return 'bg-orange-500';
    if (node.criticality === 'Medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getEdgeColor = (edge: DependencyEdge): string => {
    if (edge.isPersonalData) return 'stroke-red-500';
    if (edge.strength === 'Strong') return 'stroke-blue-500';
    if (edge.strength === 'Medium') return 'stroke-yellow-500';
    return 'stroke-gray-500';
  };

  const exportDependencyReport = async () => {
    try {
      const reportData = nodes.map(node => {
        const asset = assets.find(a => a.id === node.id);
        return {
          name: node.name,
          type: node.type,
          criticality: node.criticality,
          riskScore: node.riskScore,
          dependencies: node.dependencies.length,
          dependents: node.dependents.length,
          isPersonalData: isPersonalDataAsset(asset!),
          encryptionStatus: asset?.encryptionStatus || 'Unknown',
          complianceFrameworks: asset?.complianceFrameworks.join(', ') || 'None'
        };
      });

      await exportToCSV(reportData);
      toast.success('Dependency mapping report exported successfully');
    } catch (error) {
      toast.error('Failed to export dependency report');
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Database': return <Database className="h-4 w-4" />;
      case 'Server': return <Server className="h-4 w-4" />;
      case 'Cloud Service': return <Cloud className="h-4 w-4" />;
      case 'Personal Data': return <Users className="h-4 w-4" />;
      case 'Sensitive Data': return <Lock className="h-4 w-4" />;
      case 'Information Asset': return <FileText className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold mb-2 flex items-center">
              <Network className="h-8 w-8 mr-3" />
              Dependencies Mapping Dashboard
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Visualize and analyze asset dependencies and data flows
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                <span>{stats.totalNodes} Assets</span>
              </div>
              <div className="flex items-center">
                <GitBranch className="h-4 w-4 mr-2" />
                <span>{stats.totalEdges} Dependencies</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>{stats.circularDependencies} Circular Dependencies</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Network className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Assets</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyCritical}
                onChange={(e) => setShowOnlyCritical(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Critical Only</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyPersonalData}
                onChange={(e) => setShowOnlyPersonalData(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Personal Data Only</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('network')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'network' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              Network
            </button>
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'hierarchy' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              Hierarchy
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'matrix' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              Matrix
            </button>
          </div>

          <button
            onClick={exportDependencyReport}
            className="ml-auto inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-3xl font-outfit font-bold text-blue-600">{stats.totalNodes}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Network className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dependencies</p>
              <p className="text-3xl font-outfit font-bold text-green-600">{stats.totalEdges}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <GitBranch className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Circular Deps</p>
              <p className="text-3xl font-outfit font-bold text-red-600">{stats.circularDependencies}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Personal Data Flows</p>
              <p className="text-3xl font-outfit font-bold text-purple-600">{stats.personalDataFlows}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Dependency Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900">
            Dependency Network
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => buildDependencyGraph()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {viewMode === 'network' && (
          <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
            <svg className="w-full h-full">
              {/* Render edges */}
              {edges.map((edge, index) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                return (
                  <line
                    key={index}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={getEdgeColor(edge)}
                    strokeWidth={edge.strength === 'Strong' ? 3 : 2}
                    strokeDasharray={edge.isPersonalData ? '5,5' : '0'}
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}

              {/* Render nodes */}
              {nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={getNodeColor(node)}
                    stroke={node.isSelected ? '#3B82F6' : '#E5E7EB'}
                    strokeWidth={node.isSelected ? 3 : 1}
                    className="cursor-pointer hover:opacity-80"
                    onClick={() => setSelectedAsset(selectedAsset === node.id ? '' : node.id)}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    className="text-xs fill-white font-medium pointer-events-none"
                  >
                    {getAssetIcon(node.type)}
                  </text>
                </g>
              ))}

              {/* Arrow marker definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6B7280"
                  />
                </marker>
              </defs>
            </svg>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-2">Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Critical</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-4 h-0.5 bg-red-500" style={{ borderTop: '2px dashed red' }}></div>
                  <span>Personal Data</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'hierarchy' && (
          <div className="space-y-4">
            {nodes
              .filter(node => node.dependencies.length === 0)
              .map(rootNode => (
                <div key={rootNode.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {getAssetIcon(rootNode.type)}
                    <span className="font-medium">{rootNode.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rootNode.criticality === 'Critical' ? 'bg-red-100 text-red-800' :
                      rootNode.criticality === 'High' ? 'bg-orange-100 text-orange-800' :
                      rootNode.criticality === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rootNode.criticality}
                    </span>
                  </div>
                  <div className="ml-6 space-y-2">
                    {rootNode.dependents.map(dependentId => {
                      const dependent = nodes.find(n => n.id === dependentId);
                      if (!dependent) return null;
                      return (
                        <div key={dependentId} className="flex items-center space-x-2 text-sm text-gray-600">
                          <ArrowRight className="h-3 w-3" />
                          {getAssetIcon(dependent.type)}
                          <span>{dependent.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}

        {viewMode === 'matrix' && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-medium text-gray-600">Asset</th>
                  {nodes.map(node => (
                    <th key={node.id} className="text-center py-2 px-2 font-medium text-gray-600 text-xs">
                      {node.name.substring(0, 10)}...
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodes.map(node => (
                  <tr key={node.id} className="border-b border-gray-100">
                    <td className="py-2 px-4 font-medium text-gray-900 text-sm">
                      {node.name}
                    </td>
                    {nodes.map(targetNode => {
                      const hasDependency = edges.some(edge => 
                        edge.source === node.id && edge.target === targetNode.id
                      );
                      return (
                        <td key={targetNode.id} className="text-center py-2 px-2">
                          {hasDependency ? (
                            <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto"></div>
                          ) : (
                            <div className="w-4 h-4 bg-gray-200 rounded-full mx-auto"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dependency Details */}
      {selectedAsset && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-outfit font-semibold text-gray-900 mb-4">
            Asset Dependencies: {nodes.find(n => n.id === selectedAsset)?.name}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Dependencies</h4>
              <div className="space-y-2">
                {nodes.find(n => n.id === selectedAsset)?.dependencies.map(depId => {
                  const dep = nodes.find(n => n.id === depId);
                  const edge = edges.find(e => e.source === selectedAsset && e.target === depId);
                  if (!dep || !edge) return null;
                  
                  return (
                    <div key={depId} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getAssetIcon(dep.type)}
                          <span className="font-medium">{dep.name}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          edge.strength === 'Strong' ? 'bg-blue-100 text-blue-800' :
                          edge.strength === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {edge.strength}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <div>Type: {edge.type}</div>
                        <div>Data Flow: {edge.dataFlow}</div>
                        {edge.isPersonalData && (
                          <div className="text-red-600 font-medium">Contains Personal Data</div>
                        )}
                        <div>Purpose: {edge.purpose}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Dependents</h4>
              <div className="space-y-2">
                {nodes.find(n => n.id === selectedAsset)?.dependents.map(depId => {
                  const dep = nodes.find(n => n.id === depId);
                  const edge = edges.find(e => e.source === depId && e.target === selectedAsset);
                  if (!dep || !edge) return null;
                  
                  return (
                    <div key={depId} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getAssetIcon(dep.type)}
                          <span className="font-medium">{dep.name}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          edge.strength === 'Strong' ? 'bg-blue-100 text-blue-800' :
                          edge.strength === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {edge.strength}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <div>Type: {edge.type}</div>
                        <div>Data Flow: {edge.dataFlow}</div>
                        {edge.isPersonalData && (
                          <div className="text-red-600 font-medium">Contains Personal Data</div>
                        )}
                        <div>Purpose: {edge.purpose}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};