import React from 'react';
import { Menu } from '@headlessui/react';

interface DropdownMenuItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
  onClick: (e?: React.FormEvent) => void | Promise<void>;
  className?: string;
  disabled?: boolean;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  icon: Icon,
  text,
  onClick,
  className = "text-gray-400",
  disabled = false
}) => {
  const cursorClass = disabled ? "cursor-not-allowed" : "cursor-pointer";
  const hoverClass = disabled ? "" : "hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <Menu.Item>
      {() => (
        <div
          className={`bg-white dark:bg-black w-full px-4 py-2 text-sm leading-5 text-left ${cursorClass} ${hoverClass} transition-colors duration-200 flex items-center space-x-3 ${className}`}
          onClick={onClick}
        >
          <Icon className="h-5 w-5" />
          <span>{text}</span>
        </div>
      )}
    </Menu.Item>
  );
};

export default DropdownMenuItem;