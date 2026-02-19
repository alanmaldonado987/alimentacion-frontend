import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}

export const Dropdown = ({ isOpen, onClose, trigger, children, align = 'right' }: DropdownProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const getPosition = () => {
    if (!triggerRef.current) return { top: 0, right: 0 };

    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      right: align === 'right' ? window.innerWidth - rect.right : undefined,
      left: align === 'left' ? rect.left : undefined,
    };
  };

  const position = isOpen ? getPosition() : null;

  return (
    <>
      <div ref={triggerRef}>{trigger}</div>
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-50 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in"
            style={position || undefined}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
};

interface DropdownItemProps {
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'danger';
}

export const DropdownItem = ({ onClick, children, icon, variant = 'default' }: DropdownItemProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
        variant === 'danger'
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-50'
      )}
    >
      {icon && <span className="w-5 h-5 flex-shrink-0">{icon}</span>}
      <span className="font-medium">{children}</span>
    </button>
  );
};

