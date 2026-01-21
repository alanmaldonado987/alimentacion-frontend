import { AlertTriangle, LogOut } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
  icon?: 'alert' | 'logout';
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  icon = 'alert',
}: ConfirmDialogProps) => {
  const IconComponent = icon === 'logout' ? LogOut : AlertTriangle;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div
          className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform transition-transform ${
            variant === 'danger' 
              ? 'bg-gradient-to-br from-red-50 to-red-100' 
              : 'bg-gradient-to-br from-amber-50 to-amber-100'
          }`}
        >
          <IconComponent
            className={`w-10 h-10 ${
              variant === 'danger' ? 'text-red-600' : 'text-amber-600'
            }`}
          />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-8 leading-relaxed px-2">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className="min-w-[120px]"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

