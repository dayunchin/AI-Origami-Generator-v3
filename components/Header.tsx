/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { DreamIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-8 border-b border-purple-800/30 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-center gap-3">
          <DreamIcon className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-bold tracking-tight text-gray-100">
            Dayun Design Studio
          </h1>
      </div>
    </header>
  );
};

export default Header;