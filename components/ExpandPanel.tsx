/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { ArrowsPointingOutIcon } from './icons';
import type { UIStrings } from '../i18n';

export interface ExpandParams {
    pixels: number;
    direction: 'all' | 'horizontal' | 'vertical' | 'top' | 'right' | 'bottom' | 'left';
    expandPrompt: string;
}

interface ExpandPanelProps {
  onExpand: (params: ExpandParams) => void;
  isLoading: boolean;
  uiStrings: UIStrings;
}

const ExpandPanel: React.FC<ExpandPanelProps> = ({ onExpand, isLoading, uiStrings }) => {
  const [pixels, setPixels] = useState(256);
  const [direction, setDirection] = useState<ExpandParams['direction']>('all');
  const [expandPrompt, setExpandPrompt] = useState('');

  const handleExpand = () => {
    if (pixels > 0) {
      onExpand({ pixels, direction, expandPrompt });
    }
  };

  const directionOptions = {
    'all': uiStrings.directionAll,
    'horizontal': uiStrings.directionHorizontal,
    'vertical': uiStrings.directionVertical,
    'top': uiStrings.directionTop,
    'right': uiStrings.directionRight,
    'bottom': uiStrings.directionBottom,
    'left': uiStrings.directionLeft,
  };


  return (
    <div className="w-full bg-black/30 border border-purple-800/50 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-2">
        <ArrowsPointingOutIcon className="w-9 h-9 text-purple-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-200">{uiStrings.expandPanelTitle}</h3>
      <p className="text-md text-gray-400 max-w-xl text-center">
        {uiStrings.expandDescription}
      </p>

      <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="direction" className="block text-sm font-medium text-gray-300 mb-1">{uiStrings.direction}</label>
          <select
            id="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as ExpandParams['direction'])}
            disabled={isLoading}
            className="w-full bg-purple-950/20 border border-purple-800/60 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
          >
            {Object.entries(directionOptions).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pixels" className="block text-sm font-medium text-gray-300 mb-1">{uiStrings.pixelsToAdd}</label>
          <input
            id="pixels"
            type="number"
            value={pixels}
            onChange={(e) => setPixels(parseInt(e.target.value, 10))}
            step="64"
            min="64"
            max="1024"
            disabled={isLoading}
            className="w-full bg-purple-950/20 border border-purple-800/60 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
          />
        </div>
      </div>
      
      <div className="w-full max-w-xl mt-2">
        <label htmlFor="expandPrompt" className="block text-sm font-medium text-gray-300 mb-1">{uiStrings.contextOptional}</label>
        <input
            id="expandPrompt"
            type="text"
            value={expandPrompt}
            onChange={(e) => setExpandPrompt(e.target.value)}
            placeholder={uiStrings.expandPlaceholder}
            className="w-full bg-purple-950/20 border border-purple-800/60 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            disabled={isLoading}
          />
      </div>

      <button
        onClick={handleExpand}
        disabled={isLoading || pixels <= 0}
        className="w-full max-w-sm mt-6 bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-lg disabled:from-purple-800 disabled:to-pink-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        {uiStrings.generateExpansion}
      </button>
    </div>
  );
};

export default ExpandPanel;
