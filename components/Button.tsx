import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, isActive = false }) => {
  const baseClasses = "px-5 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform focus:outline-none";
  const activeClasses = "bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-105";
  const inactiveClasses = "bg-white/10 hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {children}
    </button>
  );
};

export default Button;
