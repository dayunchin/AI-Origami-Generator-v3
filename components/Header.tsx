/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { DreamIcon } from './icons';
import type { UIStrings } from '../i18n';

interface HeaderProps {
  uiStrings: UIStrings;
  onLanguageChange: (languageCode: string) => void;
  currentLanguage: string;
}

export const LANGUAGES = {
    "en": "English",
    "es": "Español",
    "fr": "Français",
    "de": "Deutsch",
    "ja": "日本語",
    "ko": "한국어",
    "zh": "中文",
    "hi": "हिन्दी",
    "ar": "العربية",
};

const Header: React.FC<HeaderProps> = ({ uiStrings, onLanguageChange, currentLanguage }) => {
  return (
    <header className="w-full py-4 px-8 border-b border-purple-800/30 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-3">
              <DreamIcon className="w-6 h-6 text-purple-400" />
              <h1 className="text-xl font-bold tracking-tight text-gray-100">
                {uiStrings.appTitle}
              </h1>
          </div>
          <div>
            <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-purple-950/20 border border-purple-800/60 text-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                aria-label={uiStrings.selectLanguage}
            >
                {Object.entries(LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code} className="bg-purple-800 text-gray-200">{name}</option>
                ))}
            </select>
          </div>
      </div>
    </header>
  );
};

export default Header;
