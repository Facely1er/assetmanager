# Dark Mode Update Guide

## ✅ Components with Full Dark Mode Support

The following components have been fully updated with dark mode support:

1. **Core Infrastructure**
   - ✅ `ThemeContext.tsx` - Theme management
   - ✅ `useTheme.ts` - Theme hook
   - ✅ `ThemeToggle.tsx` - Theme toggle button
   - ✅ `App.tsx` - ThemeProvider integration

2. **UI Components**
   - ✅ `Button` - All variants support dark mode
   - ✅ `Card` - All variants support dark mode
   - ✅ `Badge` - All variants support dark mode
   - ✅ `PageHeader` - Full dark mode support

3. **Layout Components**
   - ✅ `NavigationSidebar` - Full dark mode support
   - ✅ `MainLayout` - Main container updated
   - ✅ `StartScreen` - Landing page updated (partial)

4. **CSS & Theme**
   - ✅ `index.css` - All utilities support dark mode
   - ✅ `tailwind.config.js` - Dark mode configuration

---

## 🔄 Components Needing Dark Mode Updates

The following components still need dark mode class additions. Use this pattern:

### Pattern for Updates

Replace:
```tsx
className="bg-white text-gray-900 border-gray-200"
```

With:
```tsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
```

### Common Patterns

1. **Background Colors**
   - `bg-white` → `bg-white dark:bg-gray-800`
   - `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
   - `bg-gray-100` → `bg-gray-100 dark:bg-gray-700`

2. **Text Colors**
   - `text-gray-900` → `text-gray-900 dark:text-white`
   - `text-gray-600` → `text-gray-600 dark:text-gray-400`
   - `text-gray-500` → `text-gray-500 dark:text-gray-400`

3. **Borders**
   - `border-gray-200` → `border-gray-200 dark:border-gray-700`
   - `border-gray-300` → `border-gray-300 dark:border-gray-600`

4. **Hover States**
   - `hover:bg-gray-50` → `hover:bg-gray-50 dark:hover:bg-gray-700`
   - `hover:text-gray-900` → `hover:text-gray-900 dark:hover:text-white`

---

## 📋 Components List

### High Priority (User-Facing)

1. **Dashboard Components**
   - `DashboardHome.tsx`
   - `AssetStatsOverview.tsx`
   - `InsightsDashboard.tsx`

2. **Asset Management**
   - `AssetInventoryDashboard.tsx`
   - `AssetFormModal.tsx`
   - `AssetDetailModal.tsx`

3. **Risk & Compliance**
   - `RiskForm.tsx` ⚠️ (partially updated)
   - `ComplianceManagement.tsx`
   - `VulnerabilityDashboard.tsx`

4. **Mitigation & Business Impact**
   - `MitigationPage.tsx` ⚠️ (needs update)
   - `MitigationList.tsx` ⚠️ (needs update)
   - `MitigationForm.tsx` ⚠️ (needs update)
   - `BusinessImpactPage.tsx` ⚠️ (needs update)

5. **NIST Framework**
   - `NISTPage.tsx` ⚠️ (needs update)
   - `NISTComplianceWidget.tsx` ⚠️ (needs update)
   - `SecurityCategorizationWidget.tsx` ⚠️ (needs update)

6. **Framework Tracking**
   - `FrameworkPage.tsx` ⚠️ (needs update)
   - `FrameworkNavigator.tsx` ⚠️ (needs update)

7. **Dependencies**
   - `DependenciesPage.tsx` ✅ (partially updated)
   - `DependencyList.tsx` ✅ (partially updated)
   - `DependencyForm.tsx` ✅ (partially updated)

### Medium Priority

8. **Reporting**
   - `AdvancedReportingDashboard.tsx`
   - `AutomatedReportingManager.tsx`

9. **Privacy & Data Protection**
   - `PrivacyComplianceDashboard.tsx`
   - `DataProtectionDashboard.tsx`

10. **User Management**
    - `UserManagement.tsx`
    - `TeamManagementModal.tsx`

11. **Settings**
    - `SystemSettings.tsx`

12. **Other Pages**
    - `UserManualPage.tsx`
    - `GuidedWorkflow.tsx`
    - `DemoShowcase.tsx`
    - `ActivityLog.tsx`

---

## 🛠️ Quick Update Script Pattern

For each component file, search and replace:

### Search Patterns:

1. `bg-white` → `bg-white dark:bg-gray-800`
2. `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
3. `bg-gray-100` → `bg-gray-100 dark:bg-gray-700`
4. `text-gray-900` → `text-gray-900 dark:text-white`
5. `text-gray-600` → `text-gray-600 dark:text-gray-400`
6. `border-gray-200` → `border-gray-200 dark:border-gray-700`
7. `border-gray-300` → `border-gray-300 dark:border-gray-600`
8. `hover:bg-gray-50` → `hover:bg-gray-50 dark:hover:bg-gray-700`
9. `hover:text-gray-900` → `hover:text-gray-900 dark:hover:text-white`

---

## 🎨 Special Cases

### Tables
```tsx
// Table headers
<thead className="bg-gray-50 dark:bg-gray-800">

// Table rows
<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
```

### Cards
```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
```

### Forms
```tsx
<input className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
```

### Buttons (if not using Button component)
```tsx
<button className="bg-command-blue-600 hover:bg-command-blue-700 text-white dark:bg-command-blue-500 dark:hover:bg-command-blue-600">
```

---

## ✅ Testing Checklist

After updating each component:

- [ ] Toggle dark mode and verify all backgrounds
- [ ] Check text readability in dark mode
- [ ] Verify borders are visible
- [ ] Test hover states in dark mode
- [ ] Check form inputs and selects
- [ ] Verify table rows and headers
- [ ] Test modals and overlays
- [ ] Check icons and badges
- [ ] Verify charts/graphs (if applicable)

---

## 🚀 Automated Update (Future)

Consider creating a script to automate these updates:

```bash
# Example find/replace script
find src/components -name "*.tsx" -type f -exec sed -i 's/bg-white/bg-white dark:bg-gray-800/g' {} \;
```

**Note:** Always review automated changes manually!

---

## 📝 Notes

- Some components may have custom color schemes that need special attention
- Charts and graphs may need theme-aware color palettes
- Images and logos may need dark mode variants
- Consider accessibility contrast ratios in dark mode

---

## 🎯 Priority Order

1. **Start with most-used components** (Dashboard, Asset Inventory)
2. **Update forms and modals** (User interaction points)
3. **Update tables and lists** (Data display)
4. **Update settings and admin pages** (Less frequent use)

---

**Last Updated:** After Phase 1 Theme Integration
**Status:** Foundation complete, component updates in progress

