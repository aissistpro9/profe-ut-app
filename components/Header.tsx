import React from 'react';
import BrainIcon from './icons/BrainIcon';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-center text-center">
        <BrainIcon className="h-10 w-10 text-blue-500 mr-3" />
        <div className="relative py-2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            El Profe UT
          </h1>
          <div className="absolute w-2/3 h-1 bg-blue-500 rounded-full bottom-0 left-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
