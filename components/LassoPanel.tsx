/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import type { UIStrings } from '../i18n';
import { LassoIcon } from './icons';

interface LassoPanelProps {
  onGenerate: (prompt: string) => void;
  isMaskReady: boolean;
  isLoading: boolean;
  uiStrings: UIStrings;
}

const LassoPanel: React.FC<LassoPanelProps> = ({ onGenerate, isMaskReady, isLoading, uiStrings }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && isMaskReady && !isLoading) {
            onGenerate(prompt);
        }
    };

    return (
        <div className="w-full bg-black/30 border border-purple-800/50 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm text-center">
            <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-2">
                <LassoIcon className="w-9 h-9 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-200">{uiStrings.lassoPanelTitle}</h3>
            <p className="text-md text-gray-400 max-w-2xl">
                {isMaskReady ? uiStrings.lassoPanelPrompt : uiStrings.lassoPanelInstructions}
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col sm:flex-row items-center gap-2 mt-4">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={uiStrings.lassoPlaceholder}
                    className="flex-grow bg-purple-950/20 border border-purple-800/60 text-gray-200 rounded-lg p-5 text-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isLoading || !isMaskReady}
                />
                <button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold py-5 px-8 text-lg rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner disabled:from-purple-800 disabled:to-pink-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isLoading || !prompt.trim() || !isMaskReady}
                >
                    {uiStrings.generate}
                </button>
            </form>
        </div>
    );
};

export default LassoPanel;
