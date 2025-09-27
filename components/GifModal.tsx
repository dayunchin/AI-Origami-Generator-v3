/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import type { UIStrings } from '../i18n';
import Spinner from './Spinner';

interface GifModalProps {
  isOpen: boolean;
  videoUrl: string | null;
  onClose: () => void;
  uiStrings: UIStrings;
}

const GifModal: React.FC<GifModalProps> = ({ isOpen, videoUrl, onClose, uiStrings }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !videoUrl) {
        setBlobUrl(null);
        return;
    }

    let objectUrl: string;
    const fetchVideo = async () => {
        setIsFetching(true);
        setError(null);
        try {
            // The video URI from the VEO API requires the API key to be appended for access.
            const response = await fetch(`${videoUrl}&key=${process.env.API_KEY}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch video: ${response.statusText}. ${errorText}`);
            }
            const blob = await response.blob();
            objectUrl = URL.createObjectURL(blob);
            setBlobUrl(objectUrl);
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred while fetching the video.";
            console.error(err);
            setError(message);
        } finally {
            setIsFetching(false);
        }
    };
    
    fetchVideo();

    return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    }
  }, [isOpen, videoUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="gif-modal-title">
      <div className="bg-black/50 border border-purple-800/50 rounded-xl w-full max-w-2xl max-h-[90vh] p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
            <div>
                <h2 id="gif-modal-title" className="text-2xl font-bold text-white">{uiStrings.gifModalTitle}</h2>
                <p className="text-gray-400 mt-1">{uiStrings.gifModalDescription}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-4xl leading-none -mt-2" aria-label="Close modal">&times;</button>
        </div>
        
        <div className="flex-grow flex items-center justify-center bg-black/40 checkerboard-bg rounded-lg aspect-square">
            {isFetching && <Spinner />}
            {error && <p className="text-red-400 p-4 text-center">{error}</p>}
            {blobUrl && (
                <video src={blobUrl} autoPlay loop muted playsInline className="w-full h-full object-contain rounded-lg" />
            )}
        </div>

        {blobUrl && (
            <a
              href={blobUrl}
              download="animation.mp4"
              className="w-full text-center bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-3 px-5 rounded-md transition-all duration-300 ease-in-out shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base"
            >
              {uiStrings.downloadVideo}
            </a>
        )}
      </div>
    </div>
  );
};

export default GifModal;
