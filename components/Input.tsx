import React, { useState, useEffect } from 'react';

interface InputProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const placeholders = [
  "restaurants near me",
  "hospitals in New York",
  "salons in London",
  "gyms with a pool",
  "coffee shops open late",
];

const Input: React.FC<InputProps> = ({ icon, placeholder, value, onChange, type = 'text' }) => {
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState(placeholder);
  
  useEffect(() => {
    // Only animate the placeholder for the main search input
    if (placeholder.includes("Search Query")) {
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * placeholders.length);
            setDynamicPlaceholder(placeholders[randomIndex]);
        }, 3000);

        return () => clearInterval(interval);
    }
  }, [placeholder]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder.includes("Search Query") && !value ? dynamicPlaceholder : placeholder}
        className="w-full bg-black/30 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/80 shadow-inner transition-all duration-300"
      />
    </div>
  );
};

export default Input;