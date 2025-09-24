/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CodeBracketIcon } from './icons';

interface ComparisonSliderProps {
    originalImageUrl: string;
    currentImageUrl: string;
    imgRef: React.RefObject<HTMLImageElement>;
    onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    activeTab: 'magic-edit' | 'adjust' | 'filters' | 'crop' | 'remove-bg' | 'expand' | 'upscale' | 'suggestions' | 'style-transfer' | 'presets';
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
    originalImageUrl,
    currentImageUrl,
    imgRef,
    onImageClick,
    activeTab
}) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
    }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault(); // prevent text selection
        setIsDragging(true);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setIsDragging(true);
    };

    useEffect(() => {
        const container = containerRef.current;
        const handleMouseUp = () => setIsDragging(false);
        const handleTouchEnd = () => setIsDragging(false);

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) handleMove(e.clientX);
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging) handleMove(e.touches[0].clientX);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
        
        const preventDefaultDrag = (e: DragEvent) => e.preventDefault();
        container?.addEventListener('dragstart', preventDefaultDrag);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            container?.removeEventListener('dragstart', preventDefaultDrag);
        };
    }, [isDragging, handleMove]);

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Only trigger the retouch click if we weren't just dragging
      if (!isDragging) {
        onImageClick(e);
      }
    }

    return (
        <div 
            ref={containerRef} 
            className={`relative w-full max-h-[60vh] aspect-auto select-none overflow-hidden rounded-xl ${activeTab === 'magic-edit' ? 'cursor-crosshair' : ''}`} 
            onClick={handleContainerClick}
        >
            {/* Original Image (Bottom Layer) */}
            <img
                src={originalImageUrl}
                alt="Original"
                className="block w-full h-auto object-contain max-h-[60vh]"
                draggable="false"
            />
            
            {/* Current Image (Top Layer, clipped) */}
            <div
                className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    ref={imgRef}
                    src={currentImageUrl}
                    alt="Current"
                    className="block w-full h-auto object-contain max-h-[60vh]"
                    draggable="false"
                    style={{ minWidth: '100%', maxWidth: '100%' }}
                />
            </div>
            
            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white/80 z-10 cursor-ew-resize"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
                    style={{ left: '50%'}}
                >
                    <CodeBracketIcon className="w-6 h-6 text-gray-800" />
                </div>
            </div>
        </div>
    );
};

export default ComparisonSlider;