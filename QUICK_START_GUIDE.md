# Quick Start Guide - DependencyManager Features

## 🚀 Getting Started

This guide will help you quickly start using the newly integrated DependencyManager features in AssetManager.

---

## 📋 Prerequisites

1. **Database Migration**
   - Run the migration: `supabase migration up`
   - Or manually apply: `supabase/migrations/20250125000000_dependency_manager_features.sql`

2. **Dependencies Installed**
   - All required packages are already installed (`@nivo/radar`, `@nivo/heatmap`, `@nivo/core`)

---

## 🎯 Feature Overview

### 1. Mitigation Management
**Location**: Navigation → Mitigation

**Features**:
- Create mitigation actions linked to risks
- Track progress (0-100%)
- Assign owners and set due dates
- Filter by risk, status, or assignee
- View overdue actions

**Quick Start**:
1. Navigate to "Mitigation" in the sidebar
2. Click "Add Action"
3. Select a risk, assign an owner, set due date
4. Track progress as work progresses

---

### 2. Business Impact Analysis (BIA)
**Location**: Navigation → Business Impact

**Features**:
- Define business functions with MTD/RTO/RPO
- Assess financial, operational, and regulatory impacts
- Visualize impact data with charts
- Plan business continuity

**Quick Start**:
1. Navigate to "Business Impact" in the sidebar
2. Define business functions (if not already done)
3. Create impact assessments for assets
4. View impact analysis charts

---

### 3. NIST Framework
**Location**: Navigation → NIST Framework

**Features**:
- NIST CSF implementation tracking
- FIPS 199 security categorization
- Control library and mapping
- Compliance scoring
- Radar chart visualization

**Quick Start**:
1. Navigate to "NIST Framework" in the sidebar
2. Review framework functions radar chart
3. Check control implementation status
4. View assessment timeline

---

### 4. Framework Implementation Tracking
**Location**: Navigation → Framework

**Features**:
- Track framework adoption progress
- Four-phase implementation (Foundation → Development → Maturity → Optimization)
- Task management within phases
- Heatmap and radar visualizations

**Quick Start**:
1. Navigate to "Framework" in the sidebar
2. Review phase progress
3. Add tasks to phases
4. Track maturity over time

---

### 5. Enhanced Risk Management
**Location**: Available via RiskForm component

**Features**:
- Link risks to dependencies (not just assets)
- Automatic risk score calculation
- Risk level determination
- Category and source tracking

**Quick Start**:
1. Use RiskForm component in your risk management workflow
2. Select an asset
3. Optionally select a dependency
4. Set likelihood and impact (1-5 scale)
5. Risk score and level are calculated automatically

---

## 🔧 Integration Examples

### Using RiskForm Component

```tsx
import { RiskForm } from './components/risks/RiskForm';
import { riskService } from './services/riskService';
import { extractDependenciesFromAssets } from './utils/dependencyUtils';

// In your component
const [risks, setRisks] = useState<Risk[]>([]);
const [showRiskForm, setShowRiskForm] = useState(false);

const handleSaveRisk = async (risk: Risk) => {
  const created = await riskService.create(risk);
  if (created) {
    setRisks([...risks, created]);
    setShowRiskForm(false);
  }
};

const dependencies = extractDependenciesFromAssets(assets);

<RiskForm
  assets={assets}
  dependencies={dependencies}
  onSave={handleSaveRisk}
  onCancel={() => setShowRiskForm(false)}
  isOpen={showRiskForm}
/>
```

### Using Mitigation Service

```tsx
import { mitigationService } from './services/mitigationService';

// Get all mitigation actions
const actions = await mitigationService.getAll();

// Create a new action
const newAction = await mitigationService.create({
  riskId: 'risk-123',
  name: 'Implement firewall rules',
  assignee: 'John Doe',
  dueDate: new Date('2024-12-31'),
  status: 'pending',
  progress: 0,
  priority: 'High',
  description: 'Configure firewall to block unauthorized access',
});

// Update progress
await mitigationService.update(newAction.id, { progress: 50 });
```

### Using Business Impact Service

```tsx
import { businessImpactService } from './services/businessImpactService';

// Create a business function
const businessFunction = await businessImpactService.createBusinessFunction({
  name: 'Customer Portal',
  owner: 'IT Department',
  department: 'IT',
  priority: 'Critical',
  mtd: 4, // Maximum Tolerable Downtime: 4 hours
  rto: 1, // Recovery Time Objective: 1 hour
  rpo: 0.5, // Recovery Point Objective: 0.5 hours
  regulatoryRequirements: ['GDPR', 'SOC 2'],
  dependencies: ['asset-1', 'asset-2'],
});

// Create business impact assessment
const impact = await businessImpactService.createBusinessImpact({
  assetId: 'asset-1',
  businessFunctionId: businessFunction.id,
  financialImpact: {
    hourlyRevenueLoss: 10000,
    recoveryCosts: 50000,
    reputationalCosts: 20000,
    penalties: 100000,
  },
  operationalImpact: {
    affectedUsers: 5000,
    affectedProcesses: 10,
    workaroundAvailable: false,
    workaroundCost: 0,
  },
  regulatoryImpact: {
    regulations: ['GDPR'],
    penaltiesPerDay: 10000,
    reportingRequired: true,
  },
});
```

---

## 📊 Data Flow

```
Assets → Risks → Mitigation Actions
   ↓
Business Functions → Business Impacts
   ↓
NIST Mappings → NIST Assessments
   ↓
Framework Phases → Tasks
```

---

## 🗄️ Database Schema

All tables are created by the migration. Key relationships:

- `mitigation_actions` → `risks` (via risk_id)
- `mitigation_actions` → `assets` (via asset_id, optional)
- `mitigation_actions` → dependencies (via dependency_id, optional)
- `business_impacts` → `business_functions` (via business_function_id)
- `business_impacts` → `assets` (via asset_id)
- `nist_mappings` → `assets` (via asset_id)
- `nist_assessments` → `assets` (via asset_id)
- `risks` → `assets` (via asset_id)
- `risks` → dependencies (via dependency_id, optional)

---

## 🔍 Troubleshooting

### Issue: No data showing in pages
**Solution**: 
- Ensure database migration has been run
- Check that RLS policies allow your user to access data
- Verify Supabase connection is configured

### Issue: Components not loading
**Solution**:
- Check browser console for errors
- Verify all dependencies are installed: `npm install`
- Check that lazy loading is working correctly

### Issue: Risk scores not calculating
**Solution**:
- Ensure likelihood and impact are between 1-5
- Check RiskForm component is using the calculation logic
- Verify riskScore field is being saved

---

## 📚 Additional Resources

- **Detailed Review**: See `DEPENDENCY_MANAGER_FEATURES_REVIEW.md`
- **Implementation Status**: See `IMPLEMENTATION_STATUS.md`
- **Complete Implementation**: See `IMPLEMENTATION_COMPLETE.md`

---

## 🎉 You're Ready!

All features are integrated and ready to use. Start by:
1. Running the database migration
2. Navigating to any of the new features in the sidebar
3. Creating your first mitigation action, business function, or NIST assessment

Happy managing! 🚀

