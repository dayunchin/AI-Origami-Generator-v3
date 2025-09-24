/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { LightBulbIcon } from './icons';
import Spinner from './Spinner';

interface SuggestionsPanelProps {
  suggestions: { name: string; prompt: string }[];
  onApplySuggestion: (prompt: string) => void;
  isLoading: boolean;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ suggestions, onApplySuggestion, isLoading }) => {
  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm text-center">
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-2">
        <LightBulbIcon className="w-9 h-9 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-200">AI Suggestions</h3>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-4">
            <Spinner />
            <p className="text-md text-gray-400">Analyzing your image for improvements...</p>
        </div>
      ) : (
        <>
            <p className="text-md text-gray-400 max-w-md">
                Here are a few AI-powered suggestions to enhance your photo.
            </p>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {suggestions.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onApplySuggestion(suggestion.prompt)}
                    className="w-full text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-4 px-5 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {suggestion.name}
                </button>
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default SuggestionsPanel;