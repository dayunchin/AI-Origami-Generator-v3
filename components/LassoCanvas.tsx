/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState, useEffect, useCallback } from 'react';

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
}

interface LassoCanvasProps {
  imageRef: React.RefObject<HTMLImageElement>;
  onMaskReady: (maskFile: File) => void;
}

type Point = { x: number; y: number };

const LassoCanvas: React.FC<LassoCanvasProps> = ({ imageRef, onMaskReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;
    if (!canvas || !ctx || !image) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length === 0) return;

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillStyle = 'rgba(192, 80, 224, 0.4)';

    // Draw polygon
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    
    if (isComplete) {
        ctx.closePath();
        ctx.fill();
    } else if (mousePos && points.length > 0) {
        // Draw rubber band line to cursor
        ctx.lineTo(mousePos.x, mousePos.y);
    }
    ctx.stroke();

    // Draw points
    ctx.fillStyle = 'white';
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    });

  }, [points, mousePos, isComplete, imageRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            canvas.width = width;
            canvas.height = height;
            draw();
        }
    });
    
    resizeObserver.observe(image);
    
    return () => {
        resizeObserver.disconnect();
    };
  }, [imageRef, draw]);

  useEffect(() => {
    draw();
  }, [points, mousePos, draw]);
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isComplete) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints(prev => [...prev, { x, y }]);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isComplete) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };
  
  const handleMouseLeave = () => {
    setMousePos(null);
  }

  const handleUndo = () => {
    setIsComplete(false); // Allow adding more points if it was complete
    setPoints(prev => prev.slice(0, -1));
  };
  
  const handleClear = () => {
    setPoints([]);
    setIsComplete(false);
  };
  
  const handleComplete = () => {
    if (points.length < 3) return;
    setIsComplete(true);
    setMousePos(null);
    
    const image = imageRef.current;
    if (!image) return;

    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = image;
    const scaleX = naturalWidth / clientWidth;
    const scaleY = naturalHeight / clientHeight;
    
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = naturalWidth;
    maskCanvas.height = naturalHeight;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, naturalWidth, naturalHeight);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
    }
    ctx.closePath();
    ctx.fill();
    
    const dataUrl = maskCanvas.toDataURL('image/png');
    const file = dataURLtoFile(dataUrl, 'mask.png');
    onMaskReady(file);
  };

  return (
    <div className="absolute inset-0 z-20 cursor-crosshair">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
          <button onClick={handleUndo} disabled={points.length === 0} className="bg-white/10 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed">Undo Point</button>
          <button onClick={handleClear} disabled={points.length === 0} className="bg-white/10 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed">Clear</button>
          <button onClick={handleComplete} disabled={points.length < 3 || isComplete} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
            {isComplete ? 'Selection Ready' : 'Complete Selection'}
          </button>
      </div>
    </div>
  );
};

export default LassoCanvas;
