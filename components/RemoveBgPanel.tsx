/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface RemoveBgPanelProps {
  onRemoveBackground: () => void;
  isLoading: boolean;
}

const RemoveBgPanel: React.FC<RemoveBgPanelProps> = ({ onRemoveBackground, isLoading }) => {
  return (
    <div className="w-full bg-black/30 border border-purple-800/50 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm text-center">
      <h3 className="text-xl font-bold text-gray-200">Remove Image Background</h3>
      <p className="text-md text-gray-400 max-w-md">
        Click the button below to automatically identify the main subject and remove the background. The result will be a PNG image with a transparent background.
      </p>

      <button
        onClick={onRemoveBackground}
        disabled={isLoading}
        className="w-full max-w-sm mt-4 bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-lg disabled:from-purple-800 disabled:to-pink-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        Remove Background
      </button>
    </div>
  );
};

export default RemoveBgPanel;