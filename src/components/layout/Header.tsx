import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  subtitle?: string;
  rightContent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ subtitle, rightContent }) => {
  return (
    <div className="bg-[#2d3e50] text-white p-3 flex justify-between items-center border-b-4 border-yellow-500">
      <div className="flex items-center space-x-4">
        <Link
          to="/dashboard"
          className="bg-yellow-500 text-[#2d3e50] font-black px-2 py-1 italic hover:bg-yellow-400 transition-colors"
        >
          SIAK<span className="text-white">NG</span>-LITE
        </Link>
        {subtitle && (
          <div className="hidden md:block text-[10px] uppercase tracking-tighter">
            {subtitle}
          </div>
        )}
      </div>
      {rightContent && (
        <div className="flex items-center space-x-4 text-[11px] uppercase font-bold">
          {rightContent}
        </div>
      )}
    </div>
  );
};
