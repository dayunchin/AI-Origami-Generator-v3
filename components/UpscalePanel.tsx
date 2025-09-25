/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ArrowUpCircleIcon } from './icons';
import type { UIStrings } from '../i18n';

interface UpscalePanelProps {
  onUpscale: () => void;
  isLoading: boolean;
  uiStrings: UIStrings;
}

const UpscalePanel: React.FC<UpscalePanelProps> = ({ onUpscale, isLoading, uiStrings }) => {
  return (
    <div className="w-full bg-black/30 border border-purple-800/50 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm text-center">
      <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-2">
        <ArrowUpCircleIcon className="w-9 h-9 text-purple-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-200">{uiStrings.upscalePanelTitle}</h3>
      <p className="text-md text-gray-400 max-w-md">
        {uiStrings.upscaleDescription}
      </p>

      <button
        onClick={onUpscale}
        disabled={isLoading}
        className="w-full max-w-sm mt-4 bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-lg disabled:from-purple-800 disabled:to-pink-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        {uiStrings.upscaleAndEnhance}
      </button>
    </div>
  );
};

export default UpscalePanel;
