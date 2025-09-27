import React from 'react';
import { useRecoilValue } from 'recoil';
import { colorThemeState } from '../atoms/atom';

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that applies theme context to modal content
 * Use this inside any Headless UI modal to ensure proper theming
 */
const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className = ""
}) => {
  const theme = useRecoilValue(colorThemeState);

  return (
    <div className={`${theme as string} ${className}`}>
      {children}
    </div>
  );
};

export default ModalContent;