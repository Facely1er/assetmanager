# New UI Components Guide

## 🎉 Successfully Ported Components

All high-priority UI components from CyberSoluce have been successfully ported to AssetManager!

---

## ✅ Components Added

### UI Components (`src/components/ui/`)

1. **Modal** - Accessible modal dialog
2. **Alert** - User feedback alerts
3. **Input** - Enhanced input field
4. **Select** - Dropdown select
5. **Textarea** - Multi-line text input
6. **Tooltip** - Hover tooltips

### Common Components (`src/components/common/`)

7. **EmptyState** - Empty state displays
8. **SkeletonLoader** - Loading skeletons
9. **ConfirmDialog** - Confirmation dialogs

---

## 📖 Usage Examples

### Modal

```tsx
import { Modal } from './components/ui';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        description="Modal description"
        size="md" // sm | md | lg | xl | full
        closeOnOverlayClick={true}
        showCloseButton={true}
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

**Features:**
- ✅ Keyboard navigation (Escape to close, Tab to navigate)
- ✅ Focus trap
- ✅ Dark mode support
- ✅ Multiple sizes
- ✅ Accessible (ARIA attributes)

---

### Alert

```tsx
import { Alert } from './components/ui';

// Success alert
<Alert variant="success" title="Success!" description="Operation completed successfully" />

// Error alert
<Alert variant="destructive" title="Error" description="Something went wrong" />

// Warning alert
<Alert variant="warning" title="Warning" description="Please review this" />

// Info alert
<Alert variant="info" title="Info" description="Here's some information" />

// Without icon
<Alert variant="default" showIcon={false} description="Custom alert" />
```

**Variants:** `default`, `destructive`, `success`, `warning`, `info`

---

### Input

```tsx
import { Input } from './components/ui';

// Basic input
<Input label="Email" placeholder="Enter your email" />

// With error
<Input 
  label="Email" 
  error="Invalid email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// With success state
<Input 
  label="Username" 
  success
  showSuccessIcon
  helperText="Username is available"
/>

// With helper text
<Input 
  label="Password" 
  type="password"
  helperText="Must be at least 8 characters"
/>
```

**Props:**
- `label` - Input label
- `error` - Error message
- `helperText` - Helper text
- `success` - Success state
- `showSuccessIcon` - Show checkmark icon
- All standard input props

---

### Select

```tsx
import { Select } from './components/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

<Select
  label="Choose an option"
  options={options}
  placeholder="Select..."
  error={error}
  helperText="Select an option from the list"
/>
```

---

### Textarea

```tsx
import { Textarea } from './components/ui';

<Textarea
  label="Description"
  placeholder="Enter description"
  maxLength={500}
  showCharCount
  error={error}
  helperText="Maximum 500 characters"
/>
```

**Features:**
- Character count display
- Character limit warnings
- Success/error states

---

### Tooltip

```tsx
import { Tooltip } from './components/ui';

<Tooltip content="This is a helpful tooltip" placement="top">
  <button>Hover me</button>
</Tooltip>

// Different placements
<Tooltip content="Tooltip" placement="bottom">...</Tooltip>
<Tooltip content="Tooltip" placement="left">...</Tooltip>
<Tooltip content="Tooltip" placement="right">...</Tooltip>

// Custom delay
<Tooltip content="Tooltip" delay={500}>...</Tooltip>
```

**Placements:** `top`, `bottom`, `left`, `right`

---

### EmptyState

```tsx
import EmptyState from './components/common/EmptyState';
import { Plus, Database } from 'lucide-react';

<EmptyState
  icon={Database}
  title="No assets found"
  description="Get started by adding your first asset to the inventory"
  action={{
    label: "Add Asset",
    onClick: () => handleAddAsset(),
    icon: Plus,
    variant: 'default'
  }}
  secondaryAction={{
    label: "Import Assets",
    onClick: () => handleImport(),
    variant: 'outline'
  }}
/>
```

---

### SkeletonLoader

```tsx
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonMetrics } from './components/common/SkeletonLoader';

// Basic skeleton
<Skeleton variant="text" width="100%" height={20} />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rounded" width="100%" height={100} />

// Pre-built components
<SkeletonCard />
<SkeletonTable rows={5} columns={4} />
<SkeletonMetrics />

// With animation
<Skeleton variant="text" animation="pulse" />
<Skeleton variant="text" animation="wave" />
```

**Variants:** `text`, `circular`, `rectangular`, `rounded`
**Animations:** `pulse`, `wave`, `none`

---

### ConfirmDialog

```tsx
import ConfirmDialog from './components/common/ConfirmDialog';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Delete</button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          // Handle confirmation
          setIsOpen(false);
        }}
        title="Delete Asset"
        description="Are you sure you want to delete this asset? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger" // default | danger | warning
        loading={isDeleting}
      />
    </>
  );
}
```

**Types:** `default`, `danger`, `warning`

---

## 🎨 Styling

All components support:
- ✅ Dark mode (automatic via theme)
- ✅ CyberSoluce brand colors
- ✅ Consistent spacing and typography
- ✅ Accessibility features

---

## 📦 Import Paths

### UI Components
```tsx
import { 
  Modal, 
  Alert, 
  Input, 
  Select, 
  Textarea, 
  Tooltip 
} from './components/ui';
```

### Common Components
```tsx
import EmptyState from './components/common/EmptyState';
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonMetrics 
} from './components/common/SkeletonLoader';
import ConfirmDialog from './components/common/ConfirmDialog';
```

---

## 🔄 Migration Guide

### Replacing Custom Modals

**Before:**
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50">
  <div className="modal-content">...</div>
</div>
```

**After:**
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Title">
  Content
</Modal>
```

### Replacing Form Inputs

**Before:**
```tsx
<input className="border-gray-300..." />
```

**After:**
```tsx
<Input label="Label" error={error} helperText="Helper text" />
```

### Replacing Empty States

**Before:**
```tsx
<div className="text-center py-12">
  <p>No items found</p>
</div>
```

**After:**
```tsx
<EmptyState 
  icon={Icon}
  title="No items found"
  description="Add your first item"
  action={{ label: "Add Item", onClick: handleAdd }}
/>
```

---

## ✨ Key Features

1. **Accessibility** - All components follow WCAG guidelines
2. **Dark Mode** - Full support for light/dark themes
3. **TypeScript** - Full type safety
4. **Consistent** - Unified design system
5. **Reusable** - Easy to use across the app

---

## 🚀 Next Steps

1. **Start using** these components in new features
2. **Gradually migrate** existing components
3. **Replace** custom modals/forms with new components
4. **Add** EmptyState to empty lists
5. **Use** SkeletonLoader for loading states

---

## 📝 Notes

- All components work **without framer-motion** (using CSS animations)
- Components are **lightweight** and **performant**
- **No breaking changes** - existing code continues to work
- Components can be **gradually adopted**

---

**Status:** ✅ Ready to Use
**Last Updated:** After Component Porting

