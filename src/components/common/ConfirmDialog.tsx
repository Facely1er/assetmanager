import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'default' | 'danger' | 'warning';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'default',
  loading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      default:
        return null;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!loading}
      showCloseButton={false}
    >
      <div className="text-center">
        {getIcon() && (
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
            type === 'danger' 
              ? 'bg-red-100 dark:bg-red-900/30' 
              : 'bg-yellow-100 dark:bg-yellow-900/30'
          }`}>
            {getIcon()}
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>
        
        <div className="flex space-x-3 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          
          <Button
            variant={getConfirmButtonVariant()}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
export { ConfirmDialog };

