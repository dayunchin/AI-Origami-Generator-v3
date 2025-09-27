/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import type { UIStrings } from '../i18n';

interface VariationsModalProps {
  isOpen: boolean;
  variations: string[];
  onSelect: (url: string) => void;
  onClose: () => void;
  uiStrings: UIStrings;
}

const VariationsModal: React.FC<VariationsModalProps> = ({ isOpen, variations, onSelect, onClose, uiStrings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="variations-title">
      <div className="bg-black/50 border border-purple-800/50 rounded-xl w-full max-w-4xl max-h-[90vh] p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
            <h2 id="variations-title" className="text-2xl font-bold text-white">{uiStrings.variationsModalTitle}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl leading-none" aria-label="Close variations modal">&times;</button>
        </div>
        <p className="text-gray-400">{uiStrings.variationsModalDescription}</p>
        <div className="flex-grow overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-4 pr-2">
            {variations.map((url, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(url)}
                  className="aspect-square bg-gray-900 rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 cursor-pointer group"
                  aria-label={`Select variation ${index + 1}`}
                >
                    <img src={url} alt={`Variation ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default VariationsModal;
