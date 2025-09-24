/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { PaintBrushIcon, UploadIcon } from './icons';

interface StyleTransferPanelProps {
  onStyleTransfer: () => void;
  onSetStyleImage: (file: File | null) => void;
  styleImage: File | null;
  isLoading: boolean;
}

const StyleTransferPanel: React.FC<StyleTransferPanelProps> = ({ onStyleTransfer, onSetStyleImage, styleImage, isLoading }) => {
  const [styleImageUrl, setStyleImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (styleImage) {
      const url = URL.createObjectURL(styleImage);
      setStyleImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setStyleImageUrl(null);
    }
  }, [styleImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onSetStyleImage(e.target.files[0]);
    }
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm text-center">
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-2">
        <PaintBrushIcon className="w-9 h-9 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-200">AI Style Transfer</h3>
      <p className="text-md text-gray-400 max-w-md">
        Upload a style image (like a painting or pattern) to apply its visual aesthetic to your photo.
      </p>

      <div className="w-full max-w-sm mt-4 flex flex-col items-center gap-4">
        <label htmlFor="style-image-upload" className="w-full cursor-pointer">
          <div className="w-full h-40 bg-gray-900/50 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-900/80 hover:border-blue-500 transition-colors">
            {styleImageUrl ? (
                <img src={styleImageUrl} alt="Style preview" className="w-full h-full object-contain p-1" />
            ) : (
                <>
                    <UploadIcon className="w-10 h-10 mb-2" />
                    <span>Click to upload Style Image</span>
                </>
            )}
          </div>
        </label>
        <input id="style-image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isLoading} />

        <button
          onClick={onStyleTransfer}
          disabled={isLoading || !styleImage}
          className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-lg disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
        >
          Apply Style
        </button>
      </div>
    </div>
  );
};

export default StyleTransferPanel;