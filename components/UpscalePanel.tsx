/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ArrowUpCircleIcon } from './icons';

interface UpscalePanelProps {
  onUpscale: () => void;
  isLoading: boolean;
}

const UpscalePanel: React.FC<UpscalePanelProps> = ({ onUpscale, isLoading }) => {
  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm text-center">
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-2">
        <ArrowUpCircleIcon className="w-9 h-9 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-200">AI Image Upscaler</h3>
      <p className="text-md text-gray-400 max-w-md">
        Increase the image resolution by 2x. The AI will enhance details and sharpness for a high-quality result.
      </p>

      <button
        onClick={onUpscale}
        disabled={isLoading}
        className="w-full max-w-sm mt-4 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-lg disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        Upscale 2x & Enhance
      </button>
    </div>
  );
};

export default UpscalePanel;