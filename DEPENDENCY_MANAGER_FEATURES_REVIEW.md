# DependencyManager Features Review for AssetManager Integration

## Executive Summary

This document reviews the features available in **DependencyManager** (TechnoSoluce) that could enhance **AssetManager** (ERMITS CyberSoluce). The review identifies unique features, implementation approaches, and integration recommendations.

---

## 1. Dependency Management Features

### 1.1 Current State Comparison

| Feature | DependencyManager | AssetManager | Status |
|---------|------------------|--------------|--------|
| Dependency Graph Visualization | ✅ Canvas-based graph with filtering | ✅ SVG-based network visualization | **Both have, but different implementations** |
| Dependency Strength Levels | ✅ Critical/High/Medium/Low | ✅ Strong/Medium/Weak | **Different naming, similar concept** |
| Dependency Filtering | ✅ By asset, by strength | ✅ By asset, criticality, personal data | **AssetManager has more filters** |
| Circular Dependency Detection | ❌ Not implemented | ✅ Implemented | **AssetManager advantage** |
| Dependency Types | ✅ Basic types | ✅ More detailed (data flow, purpose, personal data) | **AssetManager advantage** |

### 1.2 Features to Import

#### **Canvas-based Dependency Graph** (Optional Enhancement)
- **Current**: AssetManager uses SVG-based visualization
- **Proposed**: Consider DependencyManager's canvas-based approach for better performance with large datasets
- **Priority**: Low (SVG is already working well)

#### **Simplified Dependency Form**
- **Current**: AssetManager has complex relationship modal
- **Proposed**: Import DependencyManager's simpler form structure for quick dependency creation
- **Priority**: Medium

---

## 2. Risk Assessment & Management

### 2.1 Current State Comparison

| Feature | DependencyManager | AssetManager | Status |
|---------|------------------|--------------|--------|
| Risk Scoring | ✅ Likelihood × Impact (1-5 scale) | ✅ Risk score calculation | **Both have** |
| Risk Levels | ✅ Critical/High/Medium/Low | ✅ Similar levels | **Both have** |
| Risk-Dependency Linking | ✅ Links risks to dependencies | ❌ Not implemented | **DependencyManager advantage** |
| Risk-Dependency Linking | ✅ Links risks to assets | ✅ Links risks to assets | **Both have** |
| Risk Form Components | ✅ Dedicated RiskForm component | ✅ Vulnerability management | **Different approaches** |

### 2.2 Features to Import

#### **Risk-Dependency Relationship** ⭐ HIGH PRIORITY
- **Description**: Link risks directly to dependencies, not just assets
- **Benefit**: Better understanding of how dependency failures create risks
- **Implementation**: 
  - Add `dependencyId` field to Risk type
  - Update RiskForm to include dependency selection
  - Enhance risk visualization to show dependency connections
- **Priority**: **HIGH**

#### **Structured Risk Assessment Workflow**
- **Description**: DependencyManager's RiskForm provides a cleaner workflow
- **Benefit**: Better UX for risk assessment
- **Priority**: Medium

---

## 3. Mitigation Planning & Tracking

### 3.1 Current State Comparison

| Feature | DependencyManager | AssetManager | Status |
|---------|------------------|--------------|--------|
| Mitigation Actions | ✅ Full mitigation management | ❌ Not implemented | **DependencyManager advantage** |
| Action Tracking | ✅ Status, progress, assignee, due date | ❌ Not implemented | **DependencyManager advantage** |
| Risk-Mitigation Linking | ✅ Links actions to risks | ❌ Not implemented | **DependencyManager advantage** |
| Progress Tracking | ✅ Progress slider (0-100%) | ❌ Not implemented | **DependencyManager advantage** |

### 3.2 Features to Import

#### **Mitigation Action Management** ⭐ HIGH PRIORITY
- **Description**: Complete mitigation planning and tracking system
- **Components to Import**:
  - `MitigationAction` type definition
  - `MitigationForm` component
  - `MitigationList` component
  - `MitigationPage` component
- **Key Features**:
  - Link mitigation actions to risks
  - Track assignee, due date, status
  - Progress tracking (0-100%)
  - Status: pending/in-progress/completed/cancelled
- **Priority**: **HIGH**

#### **Mitigation Progress Widget**
- **Description**: Dashboard widget showing mitigation progress
- **Priority**: Medium

---

## 4. Business Impact Analysis (BIA)

### 4.1 Current State Comparison

| Feature | DependencyManager | AssetManager | Status |
|---------|------------------|--------------|--------|
| Business Functions | ✅ Defined with MTD/RTO/RPO | ❌ Not implemented | **DependencyManager advantage** |
| Business Impact Assessment | ✅ Financial, Operational, Regulatory | ❌ Not implemented | **DependencyManager advantage** |
| Impact Visualization | ✅ Chart.js bar charts | ❌ Not implemented | **DependencyManager advantage** |
| Continuity Planning | ✅ Continuity plan structure | ❌ Not implemented | **DependencyManager advantage** |

### 4.2 Features to Import

#### **Business Impact Analysis Module** ⭐ HIGH PRIORITY
- **Description**: Complete BIA functionality
- **Components to Import**:
  - `BusinessFunction` type (with MTD/RTO/RPO)
  - `BusinessImpact` type (financial, operational, regulatory)
  - `ContinuityPlan` type
  - `BusinessImpactPage` component
- **Key Features**:
  - Business function definition
  - Maximum Tolerable Downtime (MTD)
  - Recovery Time Objective (RTO)
  - Recovery Point Objective (RPO)
  - Financial impact calculation
  - Operational impact assessment
  - Regulatory impact tracking
  - Impact visualization charts
- **Priority**: **HIGH**

#### **Framework Metrics Calculation**
- **Description**: Calculate framework metrics from BIA data
- **Function**: `calculateFrameworkMetrics()` from `framework.ts`
- **Priority**: Medium

---

## 5. NIST Cybersecurity Framework Integration

### 5.1 Current State Comparison

| Feature | DependencyManager | AssetManager | Status |
|---------|------------------|--------------|--------|
| NIST CSF Functions | ✅ Identify, Protect, Detect, Respond, Recover | ✅ Mentioned in compliance | **DependencyManager more detailed** |
| Security Categorization | ✅ FIPS 199 (Confidentiality/Integrity/Availability) | ❌ Not implemented | **DependencyManager advantage** |
| NIST Control Mapping | ✅ Control-to-asset mapping | ❌ Not implemented | **DependencyManager advantage** |
| NIST Assessment | ✅ Assessment with findings | ❌ Not implemented | **DependencyManager advantage** |
| Radar Chart Visualization | ✅ @nivo/radar charts | ❌ Not implemented | **DependencyManager advantage** |

### 5.2 Features to Import

#### **NIST Framework Module** ⭐ HIGH PRIORITY
- **Description**: Complete NIST CSF implementation
- **Components to Import**:
  - `NISTControl` type
  - `NISTMapping` type
  - `NISTAssessment` type
  - `NISTPage` component
  - `SecurityCategorizationWidget` component
  - `NISTComplianceWidget` component
- **Key Features**:
  - FIPS 199 security categorization
  - NIST control library
  - Control-to-asset mapping
  - Assessment tracking
  - Compliance scoring
  - Radar chart visualization (@nivo/radar)
- **Dependencies**: `@nivo/radar` package
- **Priority**: **HIGH**

#### **Security Categorization Widget**
- **Description**: Widget for FIPS 199 categorization
- **Priority**: Medium

---

## 6. Framework Implementation Tracking

### 6.1 Current State Comparison

| Feature | DependencyManager | AssetManager | Status |
|---------|------------------|--------------|--------|
| Framework Phases | ✅ Foundation/Development/Maturity/Optimization | ❌ Not implemented | **DependencyManager advantage** |
| Phase Progress Tracking | ✅ Progress percentage per phase | ❌ Not implemented | **DependencyManager advantage** |
| Task Management | ✅ Tasks within phases | ❌ Not implemented | **DependencyManager advantage** |
| Heatmap Visualization | ✅ @nivo/heatmap | ❌ Not implemented | **DependencyManager advantage** |
| Framework Navigator | ✅ Navigation widget | ❌ Not implemented | **DependencyManager advantage** |

### 6.2 Features to Import

#### **Framework Implementation Tracking** ⭐ MEDIUM PRIORITY
- **Description**: Track framework adoption progress
- **Components to Import**:
  - `FrameworkPhase` type
  - `FrameworkPage` component
  - `FrameworkNavigator` component
  - `FrameworkComplianceWidget` component
- **Key Features**:
  - Four-phase framework (Foundation → Development → Maturity → Optimization)
  - Progress tracking per phase
  - Task management within phases
  - Heatmap visualization (@nivo/heatmap)
  - Radar chart for maturity assessment
- **Dependencies**: `@nivo/heatmap`, `@nivo/radar` packages
- **Priority**: **MEDIUM**

#### **Framework Navigator Widget**
- **Description**: Quick navigation widget for framework sections
- **Priority**: Low

---

## 7. Controls & Baseline Management

### 7.1 Current State Comparison

| Feature | DependencyManager | AssetManager | Status |
|---------|------------------|--------------|--------|
| Baseline Controls | ✅ NIST/ISO27001 controls | ✅ Compliance frameworks | **Both have, different approach** |
| Control Assessment | ✅ Assessment tracking | ✅ Compliance management | **Both have** |
| Control Library | ✅ ControlLibrary component | ✅ Compliance dashboard | **Both have** |
| Applicable Controls | ✅ Filter by asset type | ❌ Not implemented | **DependencyManager advantage** |

### 7.2 Features to Import

#### **Control Library Enhancement**
- **Description**: Better control-to-asset type mapping
- **Function**: `getApplicableControls()` from `controls.ts`
- **Priority**: Low (AssetManager already has compliance features)

---

## 8. Dashboard & Widgets

### 8.1 Current State Comparison

| Feature | DependencyManager | AssetManager | Status |
|---------|------------------|--------------|--------|
| Summary Cards | ✅ Basic cards | ✅ Enhanced stats | **AssetManager advantage** |
| Critical Assets Widget | ✅ Simple widget | ✅ Advanced dashboard | **AssetManager advantage** |
| Top Risks Widget | ✅ Basic list | ✅ Vulnerability dashboard | **AssetManager advantage** |
| Mitigation Progress Widget | ✅ Progress widget | ❌ Not implemented | **DependencyManager advantage** |
| Framework Compliance Widget | ✅ Compliance widget | ✅ Compliance dashboard | **Both have** |

### 8.2 Features to Import

#### **Mitigation Progress Widget**
- **Description**: Dashboard widget showing mitigation action progress
- **Component**: `MitigationProgressWidget`
- **Priority**: Medium

---

## 9. Data Management Features

### 9.1 Current State Comparison

| Feature | DependencyManager | AssetManager | Status |
|---------|------------------|--------------|--------|
| LocalStorage Persistence | ✅ useLocalStorage hook | ✅ Supabase backend | **Different approaches** |
| Data Export | ✅ JSON export | ✅ CSV/Excel/PDF export | **AssetManager advantage** |
| Data Import | ✅ JSON import | ✅ Excel/CSV import | **Both have** |
| Data Reset | ✅ Reset to mock data | ❌ Not implemented | **DependencyManager advantage** |

### 9.2 Features to Import

#### **useLocalStorage Hook** (Optional)
- **Description**: Simple localStorage persistence hook
- **Use Case**: Could be useful for offline mode or demo mode
- **Priority**: Low (AssetManager uses Supabase)

---

## 10. Visualization Libraries

### 10.1 Library Comparison

| Library | DependencyManager | AssetManager | Recommendation |
|---------|------------------|--------------|----------------|
| Chart.js | ✅ Used for bar charts | ❌ Not used | Consider for BIA charts |
| @nivo/radar | ✅ NIST radar charts | ❌ Not used | **Import for NIST module** |
| @nivo/heatmap | ✅ Framework heatmap | ❌ Not used | **Import for framework tracking** |
| Recharts | ❌ Not used | ✅ Used extensively | Keep Recharts |

### 10.2 Recommendations

- **Import @nivo/radar**: Required for NIST framework visualization
- **Import @nivo/heatmap**: Required for framework implementation heatmap
- **Consider Chart.js**: Optional, for BIA bar charts (or use Recharts)

---

## 11. Type Definitions

### 11.1 Types to Import

#### **High Priority Types**
1. `MitigationAction` - Complete mitigation tracking
2. `BusinessFunction` - BIA functionality
3. `BusinessImpact` - Impact assessment
4. `ContinuityPlan` - Business continuity planning
5. `NISTControl` - NIST control definitions
6. `NISTMapping` - Control-to-asset mapping
7. `NISTAssessment` - Assessment tracking
8. `FrameworkPhase` - Framework progress tracking

#### **Medium Priority Types**
1. `FrameworkMetrics` - Framework calculation metrics
2. `BaselineControl` - Enhanced control definitions
3. `ControlAssessment` - Control assessment tracking

---

## 12. Component Structure

### 12.1 Components to Import

#### **High Priority Components**
1. `MitigationForm.tsx` - Mitigation action form
2. `MitigationList.tsx` - Mitigation action list
3. `MitigationPage.tsx` - Complete mitigation page
4. `BusinessImpactPage.tsx` - BIA page
5. `NISTPage.tsx` - NIST framework page
6. `SecurityCategorizationWidget.tsx` - Security categorization
7. `NISTComplianceWidget.tsx` - NIST compliance widget

#### **Medium Priority Components**
1. `FrameworkPage.tsx` - Framework tracking page
2. `FrameworkNavigator.tsx` - Framework navigation widget
3. `MitigationProgressWidget.tsx` - Progress widget
4. `DependencyForm.tsx` - Simplified dependency form (optional)

---

## 13. Integration Roadmap

### Phase 1: Critical Features (High Priority)
1. ✅ **Mitigation Management System**
   - Import MitigationAction types
   - Import MitigationForm, MitigationList, MitigationPage
   - Integrate with existing risk/vulnerability system
   - Add mitigation progress tracking

2. ✅ **Business Impact Analysis**
   - Import BusinessFunction, BusinessImpact types
   - Import BusinessImpactPage component
   - Add MTD/RTO/RPO tracking
   - Implement impact visualization

3. ✅ **NIST Framework Module**
   - Import NIST types (Control, Mapping, Assessment)
   - Import NISTPage component
   - Add security categorization (FIPS 199)
   - Implement NIST compliance scoring
   - Add @nivo/radar dependency

### Phase 2: Enhanced Features (Medium Priority)
4. ✅ **Risk-Dependency Linking**
   - Add dependencyId to Risk type
   - Update RiskForm to include dependency selection
   - Enhance risk visualization

5. ✅ **Framework Implementation Tracking**
   - Import FrameworkPhase type
   - Import FrameworkPage component
   - Add @nivo/heatmap dependency
   - Implement phase progress tracking

6. ✅ **Dashboard Widgets**
   - Import MitigationProgressWidget
   - Import FrameworkNavigator widget

### Phase 3: Optional Enhancements (Low Priority)
7. ⚠️ **Simplified Dependency Form** (if needed)
8. ⚠️ **useLocalStorage Hook** (for offline mode)
9. ⚠️ **Canvas-based Graph** (performance optimization)

---

## 14. Dependencies to Add

### Required Dependencies
```json
{
  "@nivo/radar": "^0.84.0",
  "@nivo/heatmap": "^0.84.0",
  "@nivo/core": "^0.84.0"
}
```

### Optional Dependencies
```json
{
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0"
}
```

---

## 15. Implementation Notes

### 15.1 Data Model Integration
- AssetManager uses Supabase backend, DependencyManager uses localStorage
- Need to create database migrations for new types:
  - `mitigation_actions` table
  - `business_functions` table
  - `business_impacts` table
  - `continuity_plans` table
  - `nist_controls` table
  - `nist_mappings` table
  - `nist_assessments` table
  - `framework_phases` table

### 15.2 Component Adaptation
- Adapt DependencyManager components to use AssetManager's context/hooks
- Replace localStorage with Supabase calls
- Integrate with existing authentication/authorization
- Match AssetManager's design system (colors, spacing, etc.)

### 15.3 Type Compatibility
- Review and align type definitions with AssetManager's existing types
- Ensure compatibility with Asset type structure
- Map DependencyManager's types to AssetManager's database schema

---

## 16. Summary of Recommendations

### Must-Have Features (High Priority)
1. ✅ **Mitigation Management System** - Complete mitigation planning and tracking
2. ✅ **Business Impact Analysis** - BIA with MTD/RTO/RPO
3. ✅ **NIST Framework Module** - Complete NIST CSF implementation
4. ✅ **Risk-Dependency Linking** - Link risks to dependencies

### Nice-to-Have Features (Medium Priority)
5. ⚠️ **Framework Implementation Tracking** - Phase-based progress tracking
6. ⚠️ **Mitigation Progress Widget** - Dashboard widget
7. ⚠️ **Framework Navigator** - Quick navigation widget

### Optional Features (Low Priority)
8. ⚠️ **Simplified Dependency Form** - If current form is too complex
9. ⚠️ **useLocalStorage Hook** - For offline/demo mode
10. ⚠️ **Canvas-based Graph** - Performance optimization

---

## 17. Estimated Effort

| Feature | Estimated Hours | Complexity |
|---------|----------------|------------|
| Mitigation Management | 16-24 hours | Medium |
| Business Impact Analysis | 20-30 hours | Medium-High |
| NIST Framework Module | 24-32 hours | High |
| Risk-Dependency Linking | 8-12 hours | Low-Medium |
| Framework Tracking | 16-20 hours | Medium |
| Dashboard Widgets | 8-12 hours | Low-Medium |
| **Total (High Priority)** | **68-98 hours** | **Medium-High** |
| **Total (All Phases)** | **92-130 hours** | **Medium-High** |

---

## 18. Next Steps

1. **Review and Approve**: Review this document with stakeholders
2. **Prioritize Features**: Confirm priority levels
3. **Create Issues**: Create GitHub issues for each feature
4. **Database Design**: Design database schema for new features
5. **Component Migration**: Start migrating components from DependencyManager
6. **Testing**: Test each feature as it's integrated
7. **Documentation**: Update user documentation

---

**Document Version**: 1.0  
**Date**: 2024  
**Reviewed By**: [To be filled]  
**Approved By**: [To be filled]

