/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { BookmarkIcon } from './icons';

export interface Preset {
  name: string;
  actions: { prompt: string }[];
}

interface PresetsPanelProps {
  history: { actionDescription?: string }[];
  onApplyPreset: (preset: Preset) => void;
}

const PresetsPanel: React.FC<PresetsPanelProps> = ({ history, onApplyPreset }) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('pixshop_presets');
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error("Failed to load presets from localStorage", error);
    }
  }, []);

  const savePresetsToLocalStorage = (newPresets: Preset[]) => {
    try {
      localStorage.setItem('pixshop_presets', JSON.stringify(newPresets));
      setPresets(newPresets);
    } catch (error) {
      console.error("Failed to save presets to localStorage", error);
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim() || history.length === 0) return;

    const actions = history
      .map(item => ({ prompt: item.actionDescription || '' }))
      .filter(action => action.prompt);
      
    if (actions.length === 0) return;

    const newPreset: Preset = { name: presetName, actions };
    const newPresets = [...presets, newPreset];
    savePresetsToLocalStorage(newPresets);
    setPresetName('');
  };

  const handleDeletePreset = (presetNameToDelete: string) => {
    const newPresets = presets.filter(p => p.name !== presetNameToDelete);
    savePresetsToLocalStorage(newPresets);
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-2">
        <BookmarkIcon className="w-9 h-9 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-200">Custom Presets</h3>
      
      <div className="w-full max-w-md border-b border-gray-600 pb-6 mb-4">
        <p className="text-md text-gray-400 text-center mb-4">Save your current workflow as a reusable preset.</p>
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name"
                className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full"
                disabled={history.length === 0}
            />
            <button
                onClick={handleSavePreset}
                disabled={!presetName.trim() || history.length === 0}
                className="bg-blue-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                Save
            </button>
        </div>
        {history.length === 0 && <p className="text-xs text-gray-500 text-center mt-2">Apply at least one edit to save a preset.</p>}
      </div>

      <div className="w-full max-w-md">
        <h4 className="text-lg font-semibold text-gray-300 mb-2 text-center">Your Saved Presets</h4>
        {presets.length > 0 ? (
          <ul className="space-y-2">
            {presets.map(preset => (
              <li key={preset.name} className="bg-gray-900/50 p-3 rounded-lg flex items-center justify-between">
                <span className="font-medium text-gray-200">{preset.name}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => onApplyPreset(preset)} className="bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded hover:bg-green-500 transition-colors">Apply</button>
                    <button onClick={() => handleDeletePreset(preset.name)} className="bg-red-600 text-white text-sm font-semibold py-1 px-3 rounded hover:bg-red-500 transition-colors">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">You have no saved presets.</p>
        )}
      </div>
    </div>
  );
};

export default PresetsPanel;