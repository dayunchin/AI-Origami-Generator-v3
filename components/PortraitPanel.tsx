/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { UserCircleIcon } from './icons';
import type { UIStrings } from '../i18n';

interface PortraitPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
  uiStrings: UIStrings;
}

const PortraitPanel: React.FC<PortraitPanelProps> = ({ onApplyAdjustment, isLoading, uiStrings }) => {
  const presets = [
    { name: uiStrings.portraitStudioLight, prompt: 'Add dramatic, professional studio lighting to the main subject.' },
    { name: uiStrings.portraitSmoothSkin, prompt: 'Perform subtle and natural skin smoothing on the faces in the portrait, reducing blemishes while preserving skin texture.' },
    { name: uiStrings.portraitFixGaze, prompt: 'Subtly adjust the eyes of the person in the portrait to look directly at the camera.' },
  ];

  return (
    <div className="w-full bg-black/30 border border-purple-800/50 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm text-center">
      <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-2">
        <UserCircleIcon className="w-9 h-9 text-purple-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-200">{uiStrings.portraitPanelTitle}</h3>
      <p className="text-md text-gray-400 max-w-md">
        {uiStrings.portraitPanelDescription}
      </p>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => onApplyAdjustment(preset.prompt)}
            disabled={isLoading}
            className="w-full text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-4 px-5 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PortraitPanel;
