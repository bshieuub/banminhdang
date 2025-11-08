
import React from 'react';
import { DinosaurIcon } from './icons/DinosaurIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center space-x-4">
         <div className="text-sky-500 w-12 h-12">
            <DinosaurIcon />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-sky-600">
          Góc học tập của Minh Đăng
        </h1>
      </div>
    </header>
  );
};

export default Header;
