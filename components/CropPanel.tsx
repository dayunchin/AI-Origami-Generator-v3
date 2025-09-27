/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import type { UIStrings } from '../i18n';

interface CropPanelProps {
  onApplyCrop: () => void;
  onSetAspect: (aspect: number | undefined) => void;
  isLoading: boolean;
  isCropping: boolean;
  uiStrings: UIStrings;
}

type AspectRatio = 'square' | '16:9';

const CropPanel: React.FC<CropPanelProps> = ({ onApplyCrop, onSetAspect, isLoading, isCropping, uiStrings }) => {
  const [activeAspect, setActiveAspect] = useState<AspectRatio>('square');
  
  // Set default aspect ratio to square when the component is shown
  useEffect(() => {
    onSetAspect(1);
  }, [onSetAspect]);

  const handleAspectChange = (aspect: AspectRatio, value: number | undefined) => {
    setActiveAspect(aspect);
    onSetAspect(value);
  }

  const aspects: { name: string, id: AspectRatio, value: number | undefined }[] = [
    { name: 'Square', id: 'square', value: 1 / 1 },
    { name: '16:9', id: '16:9', value: 16 / 9 },
  ];

  return (
    <div className="w-full bg-black/30 border border-purple-800/50 rounded-lg p-4 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-gray-300">{uiStrings.cropPanelTitle}</h3>
      <p className="text-sm text-gray-400 -mt-2">{uiStrings.cropPanelDescription}</p>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-400">{uiStrings.aspectRatio}</span>
        {aspects.map(({ name, id, value }) => (
          <button
            key={name}
            onClick={() => handleAspectChange(id, value)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
              activeAspect === id 
              ? 'bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-md shadow-pink-500/20' 
              : 'bg-white/10 hover:bg-white/20 text-gray-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <button
        onClick={onApplyCrop}
        disabled={isLoading || !isCropping}
        className="w-full max-w-xs mt-2 bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-green-800 disabled:to-green-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        {uiStrings.applyCrop}
      </button>
    </div>
  );
};

export default CropPanel;
