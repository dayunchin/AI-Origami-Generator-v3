/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { UploadIcon, SparkleIcon, RectangleStackIcon } from './icons';

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
  onTextGenerate: (prompt: string) => void;
  onBatchEditClick: () => void;
}

const promptCategories = [
    {
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
        name: 'Color',
        limit: 3,
        words: [
            'black', 'blue', 'gold', 'green', 'light red', 'monochromatic', 'orange',
            'pastel colors', 'purple', 'rainbow', 'silver', 'vibrant colors', 'white',
            'yellow'
        ].sort()
    },
    {
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
        name: 'Adjustive',
        limit: 1,
        words: [
            'beautiful', 'bokeh', 'complex', 'creative', 'extraordinary', 'foldable',
            'imaginative', 'sci-fi', 'simple', 'stunning'
        ].sort()
    }
];


const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect, onTextGenerate, onBatchEditClick }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [prompt, setPrompt] = useState('Origami,');
  const [selectedWords, setSelectedWords] = useState<Record<string, string[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };
  
  const handleGenerateClick = () => {
    if (prompt.trim()) {
      onTextGenerate(prompt);
    }
  };

  const handleWordClick = (categoryName: string, word: string) => {
    const category = promptCategories.find(c => c.name === categoryName);
    if (!category) return;

    setSelectedWords(prev => {
        const newSelected = { ...prev };
        const currentSelection = newSelected[categoryName] || [];

        if (currentSelection.includes(word)) {
            // Deselect
            newSelected[categoryName] = currentSelection.filter(w => w !== word);
        } else {
            // Select
            if (category.limit === 1) {
                newSelected[categoryName] = [word];
            } else if (currentSelection.length < category.limit) {
                newSelected[categoryName] = [...currentSelection, word];
            }
        }
        return newSelected;
    });
  };

  useEffect(() => {
    const promptParts: string[] = [];
    promptCategories.forEach(category => {
        const words = selectedWords[category.name];
        if (words && words.length > 0) {
            promptParts.push(...words);
        }
    });
    const basePrompt = "Origami";
    const newPrompt = [basePrompt, ...promptParts].join(', ');
    setPrompt(newPrompt);
  }, [selectedWords]);


  return (
    <div className="w-full max-w-7xl mx-auto text-center p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl md:text-6xl">
          AI Origami Generator
        </h1>
        <p className="max-w-3xl text-lg text-gray-400 md:text-xl">
          Describe the origami in your mind, release your creative winds, and let AI help bring it to life.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          By using this application, you agree not to create harmful, explicit or unlawful content.
        </p>

        <div className="mt-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Image from Text */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 flex flex-col items-center justify-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-cyan-500/30">
                <SparkleIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Create with AI</h2>
              <p className="text-gray-400">Describe anything you can imagine.</p>
              <form onSubmit={(e) => { e.preventDefault(); handleGenerateClick(); }} className="w-full flex flex-col sm:flex-row items-center gap-2 mt-4">
                  <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="flex-grow bg-gray-900/80 border border-gray-600 text-gray-200 rounded-lg p-4 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full"
                  />
                  <button 
                      type="submit"
                      className="w-full sm:w-auto bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-8 text-lg rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                      disabled={!prompt.trim()}
                  >
                      Generate
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
                        {category.name} <span className="text-gray-500 font-normal text-sm">(select {category.limit === 1 ? '1' : `up to ${category.limit}`})</span>
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
                                ? 'bg-blue-500 text-white font-semibold ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500 shadow-lg shadow-blue-500/30' 
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

          </div>
          
          {/* Edit a Photo */}
          <div 
            className={`bg-gray-800/30 border-2 rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${isDraggingOver ? 'bg-blue-500/10 border-dashed border-blue-400' : 'border-gray-700/80'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              onFileSelect(e.dataTransfer.files);
            }}
          >
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-2">
                <UploadIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Edit a Photo</h2>
              <p className="text-gray-400">Upload one image for the full suite of AI editing tools.</p>
               <label htmlFor="image-upload-start" className="mt-4 relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-white/10 border border-white/20 rounded-full cursor-pointer group hover:bg-white/20 transition-colors">
                  Upload an Image
              </label>
              <input id="image-upload-start" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              <p className="text-sm text-gray-500">or drag and drop</p>
          </div>
          
          {/* Batch Edit Photos */}
          <div className="bg-gray-800/30 border border-gray-700/80 rounded-xl p-8 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-2">
                <RectangleStackIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Batch Edit</h2>
              <p className="text-gray-400">Apply one filter or adjustment to multiple images at once.</p>
              <button onClick={onBatchEditClick} className="mt-4 relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-white/10 border border-white/20 rounded-full cursor-pointer group hover:bg-white/20 transition-colors">
                  Select Photos
              </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StartScreen;