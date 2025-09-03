
import React from 'react';
import { GenieIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-dark-surface shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <GenieIcon className="h-8 w-8 text-brand-primary" />
        <h1 className="ml-3 text-2xl font-bold tracking-tight text-gray-100">
          PRDGenie
        </h1>
      </div>
    </header>
  );
};

export default Header;
