import React, { Suspense, lazy } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Lazy load recharts components
const LazyBarChart = lazy(() => import('recharts').then(m => ({ default: m.BarChart })));
const LazyBar = lazy(() => import('recharts').then(m => ({ default: m.Bar })));
const LazyXAxis = lazy(() => import('recharts').then(m => ({ default: m.XAxis })));
const LazyYAxis = lazy(() => import('recharts').then(m => ({ default: m.YAxis })));
const LazyCartesianGrid = lazy(() => import('recharts').then(m => ({ default: m.CartesianGrid })));
const LazyTooltip = lazy(() => import('recharts').then(m => ({ default: m.Tooltip })));
const LazyResponsiveContainer = lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));
const LazyPieChart = lazy(() => import('recharts').then(m => ({ default: m.PieChart })));
const LazyCell = lazy(() => import('recharts').then(m => ({ default: m.Cell })));
const LazyLineChart = lazy(() => import('recharts').then(m => ({ default: m.LineChart })));
const LazyLine = lazy(() => import('recharts').then(m => ({ default: m.Line })));
const LazyAreaChart = lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));
const LazyArea = lazy(() => import('recharts').then(m => ({ default: m.Area })));

// Chart wrapper components with Suspense
export const BarChartWrapper: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="sm" text="Loading chart..." />}>
    <LazyBarChart {...props} />
  </Suspense>
);

export const Bar: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyBar {...props} />
  </Suspense>
);

export const XAxis: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyXAxis {...props} />
  </Suspense>
);

export const YAxis: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyYAxis {...props} />
  </Suspense>
);

export const CartesianGrid: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyCartesianGrid {...props} />
  </Suspense>
);

export const Tooltip: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyTooltip {...props} />
  </Suspense>
);

export const ResponsiveContainer: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="sm" text="Loading chart..." />}>
    <LazyResponsiveContainer {...props} />
  </Suspense>
);

export const PieChartWrapper: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="sm" text="Loading chart..." />}>
    <LazyPieChart {...props} />
  </Suspense>
);

export const Cell: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyCell {...props} />
  </Suspense>
);

export const LineChartWrapper: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="sm" text="Loading chart..." />}>
    <LazyLineChart {...props} />
  </Suspense>
);

export const Line: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyLine {...props} />
  </Suspense>
);

export const AreaChartWrapper: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="sm" text="Loading chart..." />}>
    <LazyAreaChart {...props} />
  </Suspense>
);

export const Area: React.FC<any> = (props) => (
  <Suspense fallback={null}>
    <LazyArea {...props} />
  </Suspense>
);