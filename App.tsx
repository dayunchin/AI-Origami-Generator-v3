/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { generateEditedImage, generateFilteredImage, generateAdjustedImage, removeBackgroundImage, generateImageFromText, upscaleImage, expandImage, getEditSuggestions, transferStyle } from './services/geminiService';
import Header from './components/Header';
import Spinner from './components/Spinner';
import FilterPanel from './components/FilterPanel';
import AdjustmentPanel from './components/AdjustmentPanel';
import CropPanel from './components/CropPanel';
import RemoveBgPanel from './components/RemoveBgPanel';
import UpscalePanel from './components/UpscalePanel';
import ExpandPanel, { type ExpandParams } from './components/ExpandPanel';
import { UndoIcon, RedoIcon } from './components/icons';
import StartScreen from './components/StartScreen';
import ComparisonSlider from './components/ComparisonSlider';
import SuggestionsPanel from './components/SuggestionsPanel';
import StyleTransferPanel from './components/StyleTransferPanel';
import PresetsPanel, { type Preset } from './components/PresetsPanel';
import BatchEditor from './components/BatchEditor';

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
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

type AppMode = 'start' | 'single-image' | 'batch';
type Tab = 'suggestions' | 'magic-edit' | 'adjust' | 'filters' | 'style-transfer' | 'presets' | 'crop' | 'remove-bg' | 'expand' | 'upscale';
type HistoryItem = { file: File; actionDescription?: string };
type Suggestion = { name: string; prompt: string; };

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('start');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('AI is working its magic...');
  const [error, setError] = useState<string | null>(null);
  const [editHotspot, setEditHotspot] = useState<{ x: number, y: number } | null>(null);
  const [displayHotspot, setDisplayHotspot] = useState<{ x: number, y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('suggestions');
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>();
  const imgRef = useRef<HTMLImageElement>(null);

  const [editSuggestions, setEditSuggestions] = useState<Suggestion[]>([]);
  const [styleImage, setStyleImage] = useState<File | null>(null);

  const currentHistoryItem = history[historyIndex] ?? null;
  const currentImage = currentHistoryItem?.file ?? null;
  const originalImage = history[0]?.file ?? null;

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentImage) {
      const url = URL.createObjectURL(currentImage);
      setCurrentImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCurrentImageUrl(null);
    }
  }, [currentImage]);
  
  useEffect(() => {
    if (originalImage) {
      const url = URL.createObjectURL(originalImage);
      setOriginalImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setOriginalImageUrl(null);
    }
  }, [originalImage]);


  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const addImageToHistory = useCallback((newImageFile: File, actionDescription?: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ file: newImageFile, actionDescription });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [history, historyIndex]);

  const handleGetSuggestions = useCallback(async (file: File) => {
    setEditSuggestions([]);
    try {
      const suggestions = await getEditSuggestions(file);
      setEditSuggestions(suggestions);
    } catch (err) {
      console.error("Failed to get edit suggestions:", err);
    }
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    setError(null);
    setHistory([{ file }]);
    setHistoryIndex(0);
    setEditHotspot(null);
    setDisplayHotspot(null);
    setActiveTab('suggestions');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAppMode('single-image');
    handleGetSuggestions(file);
  }, [handleGetSuggestions]);

  const handleGenerate = useCallback(async () => {
    if (!currentImage || !prompt.trim() || !editHotspot) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Performing localized edit...');
    try {
        const editedImageUrl = await generateEditedImage(currentImage, prompt, editHotspot);
        const newImageFile = dataURLtoFile(editedImageUrl, `edited-${Date.now()}.png`);
        addImageToHistory(newImageFile, `Magic Edit: "${prompt}"`);
        setEditHotspot(null);
        setDisplayHotspot(null);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate the image. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, prompt, editHotspot, addImageToHistory]);

  const handleGenerateFromText = useCallback(async (textPrompt: string) => {
    if (!textPrompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage('AI is generating your image...');
    try {
      const generatedImageUrl = await generateImageFromText(textPrompt);
      const newImageFile = dataURLtoFile(generatedImageUrl, `generated-${Date.now()}.png`);
      handleImageUpload(newImageFile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate the image. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [handleImageUpload]);
  
  const handleApplyFilter = useCallback(async (filterPrompt: string) => {
    if (!currentImage) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Applying creative filter...');
    try {
        const filteredImageUrl = await generateFilteredImage(currentImage, filterPrompt);
        const newImageFile = dataURLtoFile(filteredImageUrl, `filtered-${Date.now()}.png`);
        addImageToHistory(newImageFile, `Filter: "${filterPrompt}"`);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to apply the filter. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addImageToHistory]);
  
  const handleApplyAdjustment = useCallback(async (adjustmentPrompt: string) => {
    if (!currentImage) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Applying adjustment...');
    try {
        const adjustedImageUrl = await generateAdjustedImage(currentImage, adjustmentPrompt);
        const newImageFile = dataURLtoFile(adjustedImageUrl, `adjusted-${Date.now()}.png`);
        addImageToHistory(newImageFile, `Adjustment: "${adjustmentPrompt}"`);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to apply the adjustment. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addImageToHistory]);
  
  const handleRemoveBackground = useCallback(async () => {
    if (!currentImage) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Removing background...');
    try {
        const resultUrl = await removeBackgroundImage(currentImage);
        const newImageFile = dataURLtoFile(resultUrl, `bg-removed-${Date.now()}.png`);
        addImageToHistory(newImageFile, 'Remove Background');
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to remove background. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addImageToHistory]);

  const handleApplyCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = completedCrop.width * pixelRatio;
    canvas.height = completedCrop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, completedCrop.width, completedCrop.height);
    const croppedImageUrl = canvas.toDataURL('image/png');
    const newImageFile = dataURLtoFile(croppedImageUrl, `cropped-${Date.now()}.png`);
    addImageToHistory(newImageFile, 'Crop');
  }, [completedCrop, addImageToHistory]);
  
  const handleUpscale = useCallback(async () => {
    if (!currentImage) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Upscaling image...');
    try {
      const upscaledImageUrl = await upscaleImage(currentImage);
      const newImageFile = dataURLtoFile(upscaledImageUrl, `upscaled-${Date.now()}.png`);
      addImageToHistory(newImageFile, 'Upscale 2x');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to upscale the image. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, addImageToHistory]);

  const handleExpand = useCallback(async ({ pixels, direction, expandPrompt }: ExpandParams) => {
    if (!currentImage || !currentImageUrl) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Expanding canvas with AI...');
    try {
        const img = new Image();
        img.src = currentImageUrl;
        await new Promise(resolve => { img.onload = resolve; });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context");
        let newWidth = img.width, newHeight = img.height, drawX = 0, drawY = 0;
        if (['all', 'horizontal', 'left'].includes(direction)) { newWidth += pixels; drawX = pixels; }
        if (['all', 'horizontal', 'right'].includes(direction)) { newWidth += pixels; }
        if (['all', 'vertical', 'top'].includes(direction)) { newHeight += pixels; drawY = pixels; }
        if (['all', 'vertical', 'bottom'].includes(direction)) { newHeight += pixels; }
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, drawX, drawY);
        const canvasAsDataUrl = canvas.toDataURL('image/png');
        const imageToExpand = dataURLtoFile(canvasAsDataUrl, `expand-base-${Date.now()}.png`);
        const expandedImageUrl = await expandImage(imageToExpand, expandPrompt);
        const newImageFile = dataURLtoFile(expandedImageUrl, `expanded-${Date.now()}.png`);
        addImageToHistory(newImageFile, `Expand: ${expandPrompt || 'Extend scene'}`);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to expand the image. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, currentImageUrl, addImageToHistory]);

  const handleStyleTransfer = useCallback(async () => {
    if (!currentImage || !styleImage) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Applying artistic style...');
    try {
        const resultUrl = await transferStyle(currentImage, styleImage);
        const newImageFile = dataURLtoFile(resultUrl, `stylized-${Date.now()}.png`);
        addImageToHistory(newImageFile, `Style Transfer from ${styleImage.name}`);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to transfer style. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, styleImage, addImageToHistory]);

  const handleApplyPreset = useCallback(async (preset: Preset) => {
    if (!originalImage) return;
    setIsLoading(true);
    setError(null);
    setHistory(history.slice(0, 1));
    setHistoryIndex(0);

    let imageToProcess = originalImage;
    for (let i = 0; i < preset.actions.length; i++) {
        const action = preset.actions[i];
        setLoadingMessage(`Applying preset... (Step ${i+1}/${preset.actions.length})`);
        try {
            const adjustedImageUrl = await generateAdjustedImage(imageToProcess, action.prompt);
            const newImageFile = dataURLtoFile(adjustedImageUrl, `preset-step-${i}-${Date.now()}.png`);
            
            const newHistory = history.slice(0, i + 1);
            newHistory.push({ file: newImageFile, actionDescription: `Preset: ${action.prompt}`});
            setHistory(newHistory);
            setHistoryIndex(i + 1);
            imageToProcess = newImageFile;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to apply preset step "${action.prompt}". ${errorMessage}`);
            break;
        }
    }
    setIsLoading(false);

  }, [originalImage, history]);

  const handleUndo = useCallback(() => {
    if (canUndo) setHistoryIndex(historyIndex - 1);
  }, [canUndo, historyIndex]);
  
  const handleRedo = useCallback(() => {
    if (canRedo) setHistoryIndex(historyIndex + 1);
  }, [canRedo, historyIndex]);

  const handleReset = useCallback(() => {
    if (history.length > 0) {
      setHistoryIndex(0);
      setError(null);
    }
  }, [history]);
  
  const handleExitEditor = useCallback(() => {
      setHistory([]);
      setHistoryIndex(-1);
      setError(null);
      setPrompt('');
      setEditHotspot(null);
      setDisplayHotspot(null);
      setAppMode('start');
  }, []);

  const handleDownload = useCallback(() => {
      if (currentImage) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(currentImage);
          link.download = `edited-${currentImage.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
      }
  }, [currentImage]);
  
  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) handleImageUpload(files[0]);
  };
  
  const handleBatchFileSelect = (files: File[] | null) => {
    if (files && files.length > 0) {
        setAppMode('batch');
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement | HTMLDivElement>) => {
    if (activeTab !== 'magic-edit') return;
    const img = imgRef.current;
    if (!img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDisplayHotspot({ x: offsetX, y: offsetY });
    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;
    const scaleX = naturalWidth / clientWidth;
    const scaleY = naturalHeight / clientHeight;
    const originalX = Math.round(offsetX * scaleX);
    const originalY = Math.round(offsetY * scaleY);
    setEditHotspot({ x: originalX, y: originalY });
  };
  
  const TABS: Tab[] = ['suggestions', 'magic-edit', 'style-transfer', 'presets', 'adjust', 'filters', 'remove-bg', 'crop', 'expand', 'upscale'];

  const renderSingleImageEditor = () => {
    if (!currentImageUrl) {
         return (
            <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
              <Spinner />
              <p className="text-gray-300 text-lg">{loadingMessage}</p>
            </div>
         );
    }
    
    if (error) {
       return (
           <div className="text-center animate-fade-in bg-red-500/10 border border-red-500/20 p-8 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
            <p className="text-md text-red-400">{error}</p>
            <button
                onClick={() => setError(null)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors"
              >
                Try Again
            </button>
          </div>
        );
    }
    
    const cropImageElement = <img ref={imgRef} key={`crop-${currentImageUrl}`} src={currentImageUrl} alt="Crop this image" className="w-full h-auto object-contain max-h-[60vh] rounded-xl" />;

    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-black/20 checkerboard-bg">
            {isLoading && (
                <div className="absolute inset-0 bg-black/70 z-30 flex flex-col items-center justify-center gap-4 animate-fade-in">
                    <Spinner />
                    <p className="text-gray-300">{loadingMessage}</p>
                </div>
            )}
            
            {activeTab === 'crop' ? (
              <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={aspect} className="max-h-[60vh]">
                {cropImageElement}
              </ReactCrop>
            ) : canUndo && originalImageUrl && currentImageUrl ? (
                <ComparisonSlider originalImageUrl={originalImageUrl} currentImageUrl={currentImageUrl} imgRef={imgRef} onImageClick={handleImageClick} activeTab={activeTab} />
            ) : (
                <img ref={imgRef} key={currentImageUrl} src={currentImageUrl} alt="Current" onClick={handleImageClick} className={`w-full h-auto object-contain max-h-[60vh] rounded-xl ${activeTab === 'magic-edit' ? 'cursor-crosshair' : ''}`} />
            )}

            {displayHotspot && !isLoading && activeTab === 'magic-edit' && (
                <div className="absolute rounded-full w-6 h-6 bg-blue-500/50 border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${displayHotspot.x}px`, top: `${displayHotspot.y}px` }} >
                    <div className="absolute inset-0 rounded-full w-6 h-6 animate-ping bg-blue-400"></div>
                </div>
            )}
        </div>
        
        <div className="w-full bg-gray-800/80 border border-gray-700/80 rounded-lg p-2 flex items-center justify-center gap-1 flex-wrap backdrop-blur-sm">
            {TABS.map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-grow capitalize font-semibold py-3 px-4 rounded-md transition-all duration-200 text-sm md:text-base ${ activeTab === tab ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/40' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                    {tab.replace('-', ' ')}
                </button>
            ))}
        </div>
        
        <div className="w-full">
            {activeTab === 'suggestions' && <SuggestionsPanel suggestions={editSuggestions} onApplySuggestion={handleApplyAdjustment} isLoading={isLoading || editSuggestions.length === 0} />}
            {activeTab === 'magic-edit' && (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-md text-gray-400">{editHotspot ? 'Great! Now describe your localized edit below.' : 'Click an area on the image to make a precise edit.'}</p>
                    <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="w-full flex items-center gap-2">
                        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={editHotspot ? "e.g., 'change my shirt color to blue'" : "First click a point on the image"} className="flex-grow bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-5 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={isLoading || !editHotspot} />
                        <button type="submit" className="bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-5 px-8 text-lg rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none" disabled={isLoading || !prompt.trim() || !editHotspot}>Generate</button>
                    </form>
                </div>
            )}
            {activeTab === 'style-transfer' && <StyleTransferPanel onStyleTransfer={handleStyleTransfer} onSetStyleImage={setStyleImage} styleImage={styleImage} isLoading={isLoading} />}
            {activeTab === 'presets' && <PresetsPanel history={history.slice(1, historyIndex + 1)} onApplyPreset={handleApplyPreset} />}
            {activeTab === 'expand' && <ExpandPanel onExpand={handleExpand} isLoading={isLoading} />}
            {activeTab === 'upscale' && <UpscalePanel onUpscale={handleUpscale} isLoading={isLoading} />}
            {activeTab === 'crop' && <CropPanel onApplyCrop={handleApplyCrop} onSetAspect={setAspect} isLoading={isLoading} isCropping={!!completedCrop?.width && completedCrop.width > 0} />}
            {activeTab === 'adjust' && <AdjustmentPanel onApplyAdjustment={handleApplyAdjustment} isLoading={isLoading} />}
            {activeTab === 'filters' && <FilterPanel onApplyFilter={handleApplyFilter} isLoading={isLoading} />}
            {activeTab === 'remove-bg' && <RemoveBgPanel onRemoveBackground={handleRemoveBackground} isLoading={isLoading} />}
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button onClick={handleUndo} disabled={!canUndo} className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5" aria-label="Undo last action"><UndoIcon className="w-5 h-5 mr-2" />Undo</button>
            <button onClick={handleRedo} disabled={!canRedo} className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5" aria-label="Redo last action"><RedoIcon className="w-5 h-5 mr-2" />Redo</button>
            <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>
            <button onClick={handleReset} disabled={!canUndo} className="text-center bg-transparent border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/10 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent">Reset</button>
            <button onClick={handleExitEditor} className="text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base">Exit Editor</button>
            <button onClick={handleDownload} className="flex-grow sm:flex-grow-0 ml-auto bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-3 px-5 rounded-md transition-all duration-300 ease-in-out shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base">Download Image</button>
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (appMode) {
        case 'single-image':
            return renderSingleImageEditor();
        case 'batch':
            return <BatchEditor onExit={handleExitEditor} />;
        case 'start':
        default:
            if (isLoading) { // For text-to-image generation
                return (
                    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
                        <Spinner />
                        <p className="text-gray-300 text-lg">{loadingMessage}</p>
                    </div>
                );
            }
            if (error) {
               return (
                   <div className="text-center animate-fade-in bg-red-500/10 border border-red-500/20 p-8 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
                    <p className="text-md text-red-400">{error}</p>
                    <button onClick={() => { setError(null); handleExitEditor();}} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors">Try Again</button>
                  </div>
                );
            }
            return <StartScreen onFileSelect={handleFileSelect} onTextGenerate={handleGenerateFromText} onBatchEditClick={() => setAppMode('batch')} />;
    }
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col">
      <Header />
      <main className={`flex-grow w-full max-w-[1600px] mx-auto p-4 md:p-8 flex justify-center ${appMode !== 'start' ? 'items-start' : 'items-center'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;