# DependencyManager → AssetManager Features Quick Reference

## 🎯 High Priority Features to Import

### 1. Mitigation Management System ⭐⭐⭐
**What**: Complete mitigation planning and tracking
- Mitigation actions linked to risks
- Progress tracking (0-100%)
- Assignee and due date management
- Status: pending/in-progress/completed/cancelled

**Components**: `MitigationForm`, `MitigationList`, `MitigationPage`, `MitigationProgressWidget`

**Effort**: 16-24 hours | **Complexity**: Medium

---

### 2. Business Impact Analysis (BIA) ⭐⭐⭐
**What**: Complete BIA functionality
- Business functions with MTD/RTO/RPO
- Financial, operational, regulatory impact assessment
- Impact visualization charts
- Continuity planning

**Components**: `BusinessImpactPage`, `BusinessFunction`, `BusinessImpact`, `ContinuityPlan` types

**Effort**: 20-30 hours | **Complexity**: Medium-High

---

### 3. NIST Framework Module ⭐⭐⭐
**What**: Complete NIST CSF implementation
- FIPS 199 security categorization
- NIST control library and mapping
- Assessment tracking
- Compliance scoring
- Radar chart visualization

**Components**: `NISTPage`, `NISTControl`, `NISTMapping`, `NISTAssessment` types

**Dependencies**: `@nivo/radar`, `@nivo/core`

**Effort**: 24-32 hours | **Complexity**: High

---

### 4. Risk-Dependency Linking ⭐⭐⭐
**What**: Link risks directly to dependencies
- Add `dependencyId` to Risk type
- Update RiskForm to include dependency selection
- Enhanced risk visualization

**Effort**: 8-12 hours | **Complexity**: Low-Medium

---

## ⚠️ Medium Priority Features

### 5. Framework Implementation Tracking
**What**: Track framework adoption progress
- Four-phase framework (Foundation → Development → Maturity → Optimization)
- Progress tracking per phase
- Task management
- Heatmap visualization

**Components**: `FrameworkPage`, `FrameworkPhase` type

**Dependencies**: `@nivo/heatmap`

**Effort**: 16-20 hours | **Complexity**: Medium

---

### 6. Dashboard Widgets
**What**: Additional dashboard widgets
- Mitigation progress widget
- Framework navigator widget

**Effort**: 8-12 hours | **Complexity**: Low-Medium

---

## 📦 Required Dependencies

```bash
npm install @nivo/radar @nivo/heatmap @nivo/core
```

**Optional**:
```bash
npm install chart.js react-chartjs-2
```

---

## 📊 Feature Comparison Matrix

| Feature | DependencyManager | AssetManager | Action |
|---------|------------------|--------------|--------|
| Mitigation Actions | ✅ | ❌ | **Import** |
| Business Impact Analysis | ✅ | ❌ | **Import** |
| NIST Framework | ✅ | ⚠️ Basic | **Enhance** |
| Risk-Dependency Link | ✅ | ❌ | **Import** |
| Framework Tracking | ✅ | ❌ | **Import** |
| Dependency Graph | ✅ | ✅ | Keep current |
| Circular Dependencies | ❌ | ✅ | Keep current |
| Personal Data Tracking | ❌ | ✅ | Keep current |

---

## 🗂️ Files to Import

### Types (`src/types/`)
- `mitigation.ts` (new)
- `business-impact.ts` (new)
- `nist.ts` (import from DependencyManager)
- `framework.ts` (import from DependencyManager)
- `controls.ts` (optional enhancement)

### Components (`src/components/`)
- `mitigation/` (new directory)
  - `MitigationForm.tsx`
  - `MitigationList.tsx`
- `business-impact/` (new directory)
  - `BusinessImpactPage.tsx`
- `nist/` (new directory)
  - `NISTPage.tsx`
  - `SecurityCategorizationWidget.tsx`
  - `NISTComplianceWidget.tsx`
- `framework/` (new directory)
  - `FrameworkPage.tsx`
  - `FrameworkNavigator.tsx`
  - `FrameworkComplianceWidget.tsx`

### Pages (`src/pages/`)
- `MitigationPage.tsx` (new)
- `BusinessImpactPage.tsx` (new)
- `NISTPage.tsx` (new)
- `FrameworkPage.tsx` (new)

---

## 🗄️ Database Tables Needed

1. `mitigation_actions`
2. `business_functions`
3. `business_impacts`
4. `continuity_plans`
5. `nist_controls`
6. `nist_mappings`
7. `nist_assessments`
8. `framework_phases`

---

## ⏱️ Total Estimated Effort

- **High Priority Features**: 68-98 hours
- **All Features**: 92-130 hours
- **Complexity**: Medium-High

---

## 📝 Quick Start Checklist

- [ ] Review detailed document: `DEPENDENCY_MANAGER_FEATURES_REVIEW.md`
- [ ] Install required dependencies
- [ ] Design database schema
- [ ] Create database migrations
- [ ] Import type definitions
- [ ] Migrate components
- [ ] Integrate with Supabase
- [ ] Update navigation/routing
- [ ] Test each feature
- [ ] Update documentation

---

**For detailed information, see**: `DEPENDENCY_MANAGER_FEATURES_REVIEW.md`

