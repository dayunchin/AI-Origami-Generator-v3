/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { UploadIcon, MagicWandIcon, LayersIcon } from './icons';
import type { UIStrings } from '../i18n';

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
  onTextGenerate: (prompt: string) => void;
  onBatchEditClick: () => void;
  uiStrings: UIStrings;
}

const promptCategories = [
    {
        nameKey: 'origamiType' as keyof UIStrings,
        name: 'Origami Type',
        limit: 2,
        words: [
            '3D Origami', 'Abstract Origami', 'Action Origami', 'Anesama Ningyo Origami',
            'Biological Origami', 'Blintzed Bases', 'Box pleating', 'Business Card Origami',
            'Ceremonial Origami', 'Chinese Paper Folding(Bao Die)', 'Circle Parking',
            'Classic Japanese Origami', 'Composite Origami', 'Computational Origami',
            'Crease Pattern Origami', 'Crumpling', 'Curved Origami', 'Cute Origami',
            'Digital Origami', 'Dollar Bill Origami', 'Fashion Origami', 'Geometric Origami',
            'Golden Venture Folding', 'Grafting', 'Iris Folding', 'Japaness Formal Wrappers',
            'Japanese Gomashio Wrappers', 'Japanese Religious Folding', 'Jewelry Origami',
            'Kirigami', 'Korean Paper Folding(Jong-i Jeobgi)', 'Linked Tetrahedra Origami',
            'Minimalist Origami', 'Modular origami', 'Multi Modular Origami',
            'Multi-piece tessellation', 'Multipiece Origami (Yoshihide/Momotani)',
            'Multiunit Boxes Origami', 'Origami Architecture', 'Origami Puzzles',
            'Origami Quilts', 'Origami Sculpture', 'Paper Weaving', 'Pleated surface textures',
            'Pureland Origami', 'Rigit Origami', 'Sembazuru Origami', 'Sheet Origami',
            'Shibori', 'Sticky Note Origami', 'Strip Folding', 'Sumiko', 'Tea Bag Folding',
            'Technical Origami', 'Tessellation', 'Tiling', 'Tsutsumi Origami',
            'Wet Folding Origami', 'Yoshihide Origami'
        ].sort()
    },
    {
        nameKey: 'shape' as keyof UIStrings,
        name: 'Shape',
        limit: 2,
        words: [
            '2D/Flat', 'box', 'buckyball', 'butterfly', 'cone', 'crane', 'cube', 'cuboid',
            'cylinder', 'diamond', 'dodecahedron', 'dragon', 'ellipsoid', 'flower',
            'half sphere', 'hexagonal prism', 'hexagonal pyramid', 'icosahedron',
            'octahedron', 'pentagonal', 'pentagrammic prism', 'polyhedron', 'pyramid',
            'ring', 'sphere', 'spiral', 'square pyramid', 'star', 'tetrahedron', 'torus',
            'triangular prism', 'truncated cone', 'wheel'
        ].sort()
    },
    {
        nameKey: 'color' as keyof UIStrings,
        name: 'Color',
        limit: 3,
        words: [
            'black', 'blue', 'gold', 'green', 'light red', 'monochromatic', 'orange',
            'pastel colors', 'purple', 'rainbow', 'silver', 'vibrant colors', 'white',
            'yellow'
        ].sort()
    },
    {
        nameKey: 'material' as keyof UIStrings,
        name: 'Material',
        limit: 2,
        words: [
            'aluminum foil', 'cardboard', 'envelope paper', 'fabric/textile', 'glass',
            'handkerchief', 'lace Doiley', 'metal', 'money', 'napkin', 'newspaper',
            'paper', 'plastic', 'straw', 'tea bag', 'tissue paper', 'towel',
            'wheat straw'
        ].sort()
    },
    {
        nameKey: 'style' as keyof UIStrings,
        name: 'Style',
        limit: 2,
        words: [
            '3D Style', 'Abstract', 'Art Deco', 'Cinematic Kino', 'Concept Art',
            'Delicate Detail', 'Dreamshaper', 'Fantasy Art', 'Futuristic',
            'Impressionistic', 'Juggernaut XL', 'Minimalist', 'Photorealistic',
            'Steampunk', 'Surreal', 'Vibrant Glass', 'Vintage', 'Zavi Chroma XL'
        ].sort()
    },
    {
        nameKey: 'details' as keyof UIStrings,
        name: 'Details',
        limit: 3,
        words: [
            'Back-lit', 'chiaroscuro', 'close-up shot', 'detailed patterns',
            'diffuse lighting', 'flat lighting', 'fractal', 'geometrical',
            'high contrast', 'intricate fold', 'on a dark background', 'symmetric',
            'weaving fold', 'wet-folding technique'
        ].sort()
    },
    {
        nameKey: 'adjustive' as keyof UIStrings,
        name: 'Adjustive',
        limit: 1,
        words: [
            'beautiful', 'bokeh', 'complex', 'creative', 'extraordinary', 'foldable',
            'imaginative', 'sci-fi', 'simple', 'stunning'
        ].sort()
    }
];


const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect, onTextGenerate, onBatchEditClick, uiStrings }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [prompt, setPrompt] = useState('Origami,');
  const [selectedWords, setSelectedWords] = useState<Record<string, string[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  // Load prompt history from local storage on mount
  useEffect(() => {
    try {
        const savedHistory = localStorage.getItem('ai_dream_studio_prompt_history');
        if (savedHistory) {
            setPromptHistory(JSON.parse(savedHistory));
        }
    } catch (error) {
        console.error("Failed to load prompt history:", error);
    }
  }, []);

  const savePromptToHistory = (newPrompt: string) => {
    const trimmedPrompt = newPrompt.trim();
    if (!trimmedPrompt || trimmedPrompt === 'Origami,') return;

    // Read from storage to ensure we have the latest history,
    // avoiding potential stale state issues from the component lifecycle.
    let currentHistory: string[] = [];
    try {
        const savedHistory = localStorage.getItem('ai_dream_studio_prompt_history');
        if (savedHistory) {
            currentHistory = JSON.parse(savedHistory);
        }
    } catch (error) {
        console.error("Failed to parse history from localStorage during save", error);
    }

    const updatedHistory = [trimmedPrompt, ...currentHistory.filter(p => p !== trimmedPrompt)].slice(0, 20); // Keep latest 20
    
    try {
        localStorage.setItem('ai_dream_studio_prompt_history', JSON.stringify(updatedHistory));
        // Also update the component's state so the UI reflects the change if it doesn't unmount.
        setPromptHistory(updatedHistory);
    } catch (error) {
        console.error("Failed to save prompt history:", error);
    }
  };

  const handleClearHistory = () => {
    setPromptHistory([]);
    try {
        localStorage.removeItem('ai_dream_studio_prompt_history');
    } catch (error) {
        console.error("Failed to clear prompt history:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };
  
  const handleGenerateClick = () => {
    if (prompt.trim()) {
      savePromptToHistory(prompt);
      onTextGenerate(prompt);
    }
  };

  const buildPromptFromWords = (words: Record<string, string[]>) => {
    const promptParts: string[] = [];
    promptCategories.forEach(category => {
        const categoryWords = words[category.name];
        if (categoryWords && categoryWords.length > 0) {
            promptParts.push(...categoryWords);
        }
    });
    const basePrompt = "Origami";
    return [basePrompt, ...promptParts].join(', ');
  };

  const handleWordClick = (categoryName: string, word: string) => {
    const category = promptCategories.find(c => c.name === categoryName);
    if (!category) return;

    const currentSelection = selectedWords[categoryName] || [];
    let newSelectionForCategory: string[];
    
    if (currentSelection.includes(word)) {
        newSelectionForCategory = currentSelection.filter(w => w !== word);
    } else {
        if (category.limit === 1) {
            newSelectionForCategory = [word];
        } else if (currentSelection.length < category.limit) {
            newSelectionForCategory = [...currentSelection, word];
        } else {
            return; // Limit reached, do nothing
        }
    }
    
    const newSelectedWords = { ...selectedWords, [categoryName]: newSelectionForCategory };
    setSelectedWords(newSelectedWords);
    setPrompt(buildPromptFromWords(newSelectedWords));
  };
  
  const handleManualPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    // If user types, deselect all word buttons
    if (Object.keys(selectedWords).length > 0) {
      setSelectedWords({});
    }
  };

  const handleHistoryClick = (historicalPrompt: string) => {
    setPrompt(historicalPrompt);
    if (Object.keys(selectedWords).length > 0) {
      setSelectedWords({});
    }
  };

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto text-center p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl md:text-6xl">
          {uiStrings.startScreenTitle}
        </h1>
        <p className="max-w-3xl text-lg text-gray-400 md:text-xl">
          {uiStrings.startScreenDescription}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {uiStrings.startScreenTerms}
          {' '}
          <span className="text-purple-400">
            {uiStrings.startScreenCredit}
          </span>
        </p>

        <div className="mt-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Create Image from Text */}
          <div className="lg:col-span-2 bg-black/30 border border-purple-800/50 rounded-xl p-8 flex flex-col items-center justify-start gap-4">
              <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-2">
                <MagicWandIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">{uiStrings.textToImageTitle}</h2>
              <p className="text-gray-400">{uiStrings.textToImageDescription}</p>
              <p className="text-sm text-gray-500 mt-1">{uiStrings.textToImageDisclaimer}</p>
              <form onSubmit={(e) => { e.preventDefault(); handleGenerateClick(); }} className="w-full flex flex-col sm:flex-row items-center gap-2 mt-4">
                  <input
                      type="text"
                      value={prompt}
                      onChange={handleManualPromptChange}
                      className="flex-grow bg-purple-950/20 border border-purple-800/60 text-gray-200 rounded-lg p-4 text-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition w-full"
                  />
                  <button 
                      type="submit"
                      className="w-full sm:w-auto bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold py-4 px-8 text-lg rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner disabled:from-purple-800 disabled:to-pink-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                      disabled={!prompt.trim()}
                  >
                      {uiStrings.generate}
                  </button>
              </form>

              <div className="w-full mt-6 space-y-4 text-left self-start">
                {promptCategories.map(category => {
                    const isExpanded = !!expandedCategories[category.name];
                    const INITIAL_VISIBLE_COUNT = 8;
                    const wordsToShow = isExpanded ? category.words : category.words.slice(0, INITIAL_VISIBLE_COUNT);
                    const hasMore = category.words.length > INITIAL_VISIBLE_COUNT;

                    return (
                    <div key={category.name}>
                    <h3 className="text-md font-semibold text-gray-300">
                        {uiStrings[category.nameKey]} <span className="text-gray-500 font-normal text-sm">{category.limit === 1 ? uiStrings.selectOne : uiStrings.selectUpTo.replace('{limit}', String(category.limit))}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                        {wordsToShow.map(word => {
                        const isSelected = selectedWords[category.name]?.includes(word);
                        return (
                            <button
                            key={word}
                            onClick={() => handleWordClick(category.name, word)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                isSelected 
                                ? 'bg-purple-600 text-white font-semibold ring-2 ring-offset-2 ring-offset-black ring-purple-500 shadow-lg shadow-purple-500/30' 
                                : 'bg-gray-700/80 hover:bg-gray-600/80 text-gray-300'
                            }`}
                            >
                            {word}
                            </button>
                        );
                        })}
                        {hasMore && (
                            <button
                                onClick={() => toggleCategoryExpansion(category.name)}
                                className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200 bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 font-bold"
                                aria-label={isExpanded ? 'Show less' : 'Show more'}
                            >
                                {isExpanded ? '<<' : '>>'}
                            </button>
                        )}
                    </div>
                    </div>
                )})}
            </div>

            <div className="w-full mt-6 space-y-2 text-left self-start">
                <div className="flex justify-between items-center">
                    <h3 className="text-md font-semibold text-gray-300">
                        {uiStrings.history}
                    </h3>
                    {promptHistory.length > 0 && (
                        <button
                            onClick={handleClearHistory}
                            className="text-xs font-semibold text-gray-500 hover:text-red-400 transition-colors"
                            aria-label="Clear prompt history"
                        >
                            {uiStrings.clearHistory}
                        </button>
                    )}
                </div>
                {promptHistory.length > 0 ? (
                    <div className="flex flex-wrap gap-2 items-center">
                        {promptHistory.map((p, index) => (
                            <button
                                key={index}
                                onClick={() => handleHistoryClick(p)}
                                className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200 bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 max-w-full"
                                title={p}
                            >
                               <span className="truncate block max-w-[250px]">{p}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">{uiStrings.historyPlaceholder}</p>
                )}
            </div>
          </div>
          
          {/* Edit a Photo */}
          <div 
            className={`bg-black/20 border-2 rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${isDraggingOver ? 'bg-purple-500/10 border-dashed border-purple-400' : 'border-purple-800/50'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              onFileSelect(e.dataTransfer.files);
            }}
          >
              <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-2">
                <UploadIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">{uiStrings.imageToImageTitle}</h2>
              <p className="text-gray-400">{uiStrings.imageToImageDescription}</p>
               <label htmlFor="image-upload-start" className="mt-4 relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg cursor-pointer transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner">
                  {uiStrings.uploadAnImage}
              </label>
              <input id="image-upload-start" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              <p className="text-sm text-gray-500">{uiStrings.dragAndDrop}</p>
          </div>
          
          {/* Batch Edit Photos */}
          <div className="bg-black/20 border border-purple-800/50 rounded-xl p-8 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-2">
                <LayersIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">{uiStrings.batchEditTitle}</h2>
              <p className="text-gray-400">{uiStrings.batchEditDescription}</p>
              <button onClick={onBatchEditClick} className="mt-4 relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg cursor-pointer transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner">
                  {uiStrings.batchEditSelectPhotos}
              </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StartScreen;