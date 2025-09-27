import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRecoilValue } from 'recoil';
import { colorThemeState } from '../atoms/atom';

interface ThemedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable themed modal wrapper that applies theme context to portaled modals
 */
const ThemedModal: React.FC<ThemedModalProps> = ({
  isOpen,
  onClose,
  children,
  className = ""
}) => {
  const theme = useRecoilValue(colorThemeState);

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={onClose}>
        {/* Apply theme to the portal content */}
        <div className={`${theme as string} ${className}`}>
          {children}
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ThemedModal;