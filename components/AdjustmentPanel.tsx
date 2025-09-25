/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import type { UIStrings } from '../i18n';

interface AdjustmentPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
  uiStrings: UIStrings;
}

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ onApplyAdjustment, isLoading, uiStrings }) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [backgroundPrompt, setBackgroundPrompt] = useState('');

  const presets = [
    { name: uiStrings.adjBlurBg, prompt: 'Apply a realistic depth-of-field effect, making the background blurry while keeping the main subject in sharp focus.' },
    { name: uiStrings.adjEnhance, prompt: 'Slightly enhance the sharpness and details of the image without making it look unnatural.' },
    { name: uiStrings.adjWarmer, prompt: 'Adjust the color temperature to give the image warmer, golden-hour style lighting.' },
    { name: uiStrings.adjReplaceBg, prompt: 'replace-background' }, // Special key for custom logic
  ];

  const isReplacingBg = selectedPresetPrompt === 'replace-background';
  const activePrompt = isReplacingBg ? backgroundPrompt : selectedPresetPrompt || customPrompt;
  
  // Reset custom prompts when loading state changes
  useEffect(() => {
    if (!isLoading) {
      setBackgroundPrompt('');
      setCustomPrompt('');
      setSelectedPresetPrompt(null);
    }
  }, [isLoading]);

  const handlePresetClick = (prompt: string) => {
    setSelectedPresetPrompt(prompt);
    setCustomPrompt('');
    setBackgroundPrompt('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPresetPrompt(null);
  };

  const handleApply = () => {
    if (!activePrompt) return;
    
    let finalPrompt = '';
    if (isReplacingBg) {
      finalPrompt = `Replace the background of the image with: ${backgroundPrompt}`;
    } else {
      finalPrompt = activePrompt;
    }
    
    if (finalPrompt.trim()) {
      onApplyAdjustment(finalPrompt);
    }
  };

  return (
    <div className="w-full bg-black/30 border border-purple-800/50 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">{uiStrings.adjustmentPanelTitle}</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset.prompt)}
            disabled={isLoading}
            className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${selectedPresetPrompt === preset.prompt ? 'ring-2 ring-offset-2 ring-offset-black ring-purple-500' : ''}`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      { isReplacingBg ? (
          <input
            type="text"
            value={backgroundPrompt}
            onChange={(e) => setBackgroundPrompt(e.target.value)}
            placeholder={uiStrings.adjPlaceholderNewBg}
            className="flex-grow bg-purple-950/20 border border-purple-800/60 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
            disabled={isLoading}
          />
        ) : (
          <input
            type="text"
            value={customPrompt}
            onChange={handleCustomChange}
            placeholder={uiStrings.adjPlaceholderCustom}
            className="flex-grow bg-purple-950/20 border border-purple-800/60 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
            disabled={isLoading}
          />
        )
      }

      {activePrompt && (
        <div className="animate-fade-in flex flex-col gap-4 pt-2">
            <button
                onClick={handleApply}
                className="w-full bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-purple-800 disabled:to-pink-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading || !activePrompt.trim()}
            >
                {uiStrings.applyAdjustment}
            </button>
        </div>
      )}
    </div>
  );
};

export default AdjustmentPanel;
