/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { generateEditedImage, generateFilteredImage, generateAdjustedImage, removeBackgroundImage, generateImageFromText, upscaleImage, expandImage, getEditSuggestions, transferStyle, translateText, generateImageVariations, generateAnimatedGif, getPromptFromImage, generateInpaintedImage } from './services/geminiService';
import Header, { LANGUAGES } from './components/Header';
import Spinner from './components/Spinner';
import FilterPanel from './components/FilterPanel';
import AdjustmentPanel from './components/AdjustmentPanel';
import CropPanel from './components/CropPanel';
import RemoveBgPanel from './components/RemoveBgPanel';
import UpscalePanel from './components/UpscalePanel';
import ExpandPanel, { type ExpandParams } from './components/ExpandPanel';
import { UndoIcon, RedoIcon, SparkleIcon, FilmIcon, LassoIcon } from './components/icons';
import StartScreen from './components/StartScreen';
import ComparisonSlider from './components/ComparisonSlider';
import SuggestionsPanel from './components/SuggestionsPanel';
import StyleTransferPanel from './components/StyleTransferPanel';
import PresetsPanel, { type Preset } from './components/PresetsPanel';
import BatchEditor from './components/BatchEditor';
import VariationsModal from './components/VariationsModal';
import GifModal from './components/GifModal';
import LassoPanel from './components/LassoPanel';
import LassoCanvas from './components/LassoCanvas';
import { englishStrings, type UIStrings } from './i18n';


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
type Tab = 'suggestions' | 'magic-edit' | 'lasso-select' | 'style-transfer' | 'presets' | 'adjust' | 'filters' | 'remove-bg' | 'crop' | 'expand' | 'upscale';
type HistoryItem = { file: File; actionDescription?: string };
type Suggestion = { name: string; prompt: string; };

const TABS: Tab[] = ['suggestions', 'magic-edit', 'lasso-select', 'style-transfer', 'presets', 'adjust', 'filters', 'remove-bg', 'crop', 'expand', 'upscale'];

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
  const [aspect, setAspect] = useState<number | undefined>(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const [editSuggestions, setEditSuggestions] = useState<Suggestion[]>([]);
  const [styleImage, setStyleImage] = useState<File | null>(null);
  const [maskFile, setMaskFile] = useState<File | null>(null);

  const [uiStrings, setUiStrings] = useState<UIStrings>(englishStrings);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [showVariationsModal, setShowVariationsModal] = useState<boolean>(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [showGifModal, setShowGifModal] = useState<boolean>(false);

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

  useEffect(() => {
    if (activeTab !== 'lasso-select') {
        setMaskFile(null);
    }
  }, [activeTab]);

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
    setOriginalPrompt(null);
    setVariations([]);
    setShowVariationsModal(false);
    handleGetSuggestions(file);
  }, [handleGetSuggestions]);

  const handleGenerate = useCallback(async () => {
    if (!currentImage || !prompt.trim() || !editHotspot) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage(uiStrings.loadingLocalizedEdit);
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
  }, [currentImage, prompt, editHotspot, addImageToHistory, uiStrings]);

  const handleGenerateFromText = useCallback(async (textPrompt: string) => {
    if (!textPrompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage(uiStrings.loadingGeneratingImage);
    try {
      const generatedImageUrl = await generateImageFromText(textPrompt);
      const newImageFile = dataURLtoFile(generatedImageUrl, `generated-${Date.now()}.png`);
      handleImageUpload(newImageFile);
      setOriginalPrompt(textPrompt);
      setVariations([]);
      setShowVariationsModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate the image. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [handleImageUpload, uiStrings]);
  
  const handleGenerateVariations = useCallback(async () => {
    if (!currentImage) return;
    setIsLoading(true);
    setError(null);
    try {
      let promptForVariations = originalPrompt;
      if (!promptForVariations) {
        setLoadingMessage(uiStrings.loadingAnalyzingForVariations);
        promptForVariations = await getPromptFromImage(currentImage);
      }
      setLoadingMessage(uiStrings.loadingVariations);
      const variationResults = await generateImageVariations(promptForVariations, 4);
      setVariations(variationResults);
      setShowVariationsModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate variations. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalPrompt, currentImage, uiStrings]);

  const handleSelectVariation = useCallback((url: string) => {
    const newImageFile = dataURLtoFile(url, `variation-${Date.now()}.png`);
    addImageToHistory(newImageFile, 'Selected Variation');
    setShowVariationsModal(false);
  }, [addImageToHistory]);

  const handleGenerateGif = useCallback(async () => {
    if (!currentImage) return;

    const animationPrompt = originalPrompt
      ? `Create a short, looping animation of this origami: ${originalPrompt}. The animation should be a gentle 360-degree rotation.`
      : "Create a short, looping animation of the subject in this image. The animation should be a gentle 360-degree rotation.";
    
    setIsLoading(true);
    setError(null);
    
    const messages = [
        uiStrings.loadingGif1,
        uiStrings.loadingGif2,
        uiStrings.loadingGif3,
    ];
    let messageIndex = 0;
    setLoadingMessage(messages[messageIndex]);
    const intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
    }, 5000);

    try {
        const videoUri = await generateAnimatedGif(currentImage, animationPrompt);
        setGifUrl(videoUri);
        setShowGifModal(true);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate animation. ${errorMessage}`);
    } finally {
        clearInterval(intervalId);
        setIsLoading(false);
    }
  }, [currentImage, originalPrompt, uiStrings]);


  const handleApplyFilter = useCallback(async (filterPrompt: string) => {
    if (!currentImage) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage(uiStrings.loadingFilter);
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
  }, [currentImage, addImageToHistory, uiStrings]);
  
  const handleApplyAdjustment = useCallback(async (adjustmentPrompt: string) => {
    if (!currentImage) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage(uiStrings.loadingAdjustment);
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
  }, [currentImage, addImageToHistory, uiStrings]);
  
  const handleRemoveBackground = useCallback(async () => {
    if (!currentImage) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage(uiStrings.loadingRemoveBg);
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
  }, [currentImage, addImageToHistory, uiStrings]);

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
    setLoadingMessage(uiStrings.loadingUpscale);
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
  }, [currentImage, addImageToHistory, uiStrings]);

  const handleExpand = useCallback(async ({ pixels, direction, expandPrompt }: ExpandParams) => {
    if (!currentImage || !currentImageUrl) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage(uiStrings.loadingExpand);
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
  }, [currentImage, currentImageUrl, addImageToHistory, uiStrings]);

  const handleStyleTransfer = useCallback(async () => {
    if (!currentImage || !styleImage) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage(uiStrings.loadingStyleTransfer);
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
  }, [currentImage, styleImage, addImageToHistory, uiStrings]);

  const handleLassoGenerate = useCallback(async (lassoPrompt: string) => {
    if (!currentImage || !maskFile || !lassoPrompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setLoadingMessage(uiStrings.loadingLassoEdit);
    try {
        const resultUrl = await generateInpaintedImage(currentImage, maskFile, lassoPrompt);
        const newImageFile = dataURLtoFile(resultUrl, `inpainted-${Date.now()}.png`);
        addImageToHistory(newImageFile, `Lasso Edit: "${lassoPrompt}"`);
        setMaskFile(null); // Clear mask after use
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to apply lasso edit. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, maskFile, addImageToHistory, uiStrings]);


  const handleApplyPreset = useCallback(async (preset: Preset) => {
    if (!originalImage) return;
    setIsLoading(true);
    setError(null);
    setHistory(history.slice(0, 1));
    setHistoryIndex(0);

    let imageToProcess = originalImage;
    for (let i = 0; i < preset.actions.length; i++) {
        const action = preset.actions[i];
        const loadingText = uiStrings.loadingPreset
            .replace('{currentStep}', String(i + 1))
            .replace('{totalSteps}', String(preset.actions.length));
        setLoadingMessage(loadingText);
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

  }, [originalImage, history, uiStrings]);

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
  
  const handleLanguageChange = useCallback(async (langCode: string) => {
    if (langCode === 'en') {
        setUiStrings(englishStrings);
        setCurrentLanguage('en');
        localStorage.removeItem(`translated_ui_${currentLanguage}`);
        localStorage.setItem('ui_language', 'en');
        return;
    }

    try {
        setIsLoading(true);
        const languageName = LANGUAGES[langCode as keyof typeof LANGUAGES] || langCode;
        setLoadingMessage(uiStrings.loadingTranslating.replace('{languageName}', languageName));
        
        const translationCache = localStorage.getItem(`translated_ui_${langCode}`);
        
        let translated: UIStrings;
        if (translationCache) {
            translated = JSON.parse(translationCache);
        } else {
            translated = await translateText(englishStrings, langCode) as UIStrings;
            localStorage.setItem(`translated_ui_${langCode}`, JSON.stringify(translated));
        }

        setUiStrings(translated);
        setCurrentLanguage(langCode);
        localStorage.setItem('ui_language', langCode);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to translate UI. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [currentLanguage, uiStrings.loadingTranslating]);

  useEffect(() => {
      const savedLang = localStorage.getItem('ui_language');
      if (savedLang && savedLang !== 'en') {
          handleLanguageChange(savedLang);
      }
  }, []); // Run only once on initial mount

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return; 

      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) { 
              handleRedo();
            } else { 
              handleUndo();
            }
            break;
          case 'y': 
            if (!isMac) {
              e.preventDefault();
              handleRedo();
            }
            break;
          case 'r':
            e.preventDefault();
            handleReset();
            break;
          case 'd':
            e.preventDefault();
            handleDownload();
            break;
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleExitEditor();
      } else if (e.altKey && !isNaN(parseInt(e.key))) {
        e.preventDefault();
        const tabIndex = e.key === '0' ? 9 : parseInt(e.key) - 1;
        if (tabIndex >= 0 && tabIndex < TABS.length) {
          setActiveTab(TABS[tabIndex]);
        }
      }
    };
    
    if (appMode === 'single-image') {
        window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [appMode, isLoading, handleUndo, handleRedo, handleReset, handleDownload, handleExitEditor, setActiveTab]);
  
  const tabNames: Record<Tab, keyof UIStrings> = {
    'suggestions': 'tabSuggestions',
    'magic-edit': 'tabMagicEdit',
    'lasso-select': 'tabLassoSelect',
    'style-transfer': 'tabStyleTransfer',
    'presets': 'tabPresets',
    'adjust': 'tabAdjust',
    'filters': 'tabFilters',
    'remove-bg': 'tabRemoveBg',
    'crop': 'tabCrop',
    'expand': 'tabExpand',
    'upscale': 'tabUpscale',
  };


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
            <h2 className="text-2xl font-bold text-red-300">{uiStrings.errorOccurred}</h2>
            <p className="text-md text-red-400">{error}</p>
            <button
                onClick={() => setError(null)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors"
              >
                {uiStrings.errorTryAgain}
            </button>
          </div>
        );
    }
    
    const cropImageElement = <img ref={imgRef} key={`crop-${currentImageUrl}`} src={currentImageUrl} alt="Crop this image" className="w-full h-auto object-contain max-h-[60vh] rounded-xl" />;

    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-black/40 checkerboard-bg">
            {isLoading && (
                <div className="absolute inset-0 bg-black/70 z-30 flex flex-col items-center justify-center gap-4 animate-fade-in">
                    <Spinner />
                    <p className="text-gray-300 text-center">{loadingMessage}</p>
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
            
            {activeTab === 'lasso-select' && !isLoading && (
              <LassoCanvas imageRef={imgRef} onMaskReady={setMaskFile} />
            )}

            {displayHotspot && !isLoading && activeTab === 'magic-edit' && (
                <div className="absolute rounded-full w-6 h-6 bg-purple-500/50 border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${displayHotspot.x}px`, top: `${displayHotspot.y}px` }} >
                    <div className="absolute inset-0 rounded-full w-6 h-6 animate-ping bg-purple-400"></div>
                </div>
            )}
        </div>
        
        <div className="w-full bg-black/30 border border-purple-800/50 rounded-lg p-2 flex items-center justify-center gap-1 flex-wrap backdrop-blur-sm">
            {TABS.map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center justify-center gap-2 flex-grow capitalize font-semibold py-3 px-4 rounded-md transition-all duration-200 text-sm md:text-base ${ activeTab === tab ? 'bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg shadow-pink-500/40' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                    {uiStrings[tabNames[tab]]}
                </button>
            ))}
        </div>
        
        <div className="w-full">
            {activeTab === 'suggestions' && <SuggestionsPanel suggestions={editSuggestions} onApplySuggestion={handleApplyAdjustment} isLoading={isLoading || editSuggestions.length === 0} uiStrings={uiStrings} />}
            {activeTab === 'magic-edit' && (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-md text-gray-400">{editHotspot ? uiStrings.magicEditPromptReady : uiStrings.magicEditPromptClick}</p>
                    <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="w-full flex items-center gap-2">
                        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={editHotspot ? uiStrings.magicEditPlaceholderReady : uiStrings.magicEditPlaceholderClick} className="flex-grow bg-purple-950/20 border border-purple-800/60 text-gray-200 rounded-lg p-5 text-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={isLoading || !editHotspot} />
                        <button type="submit" className="bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold py-5 px-8 text-lg rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner disabled:from-purple-800 disabled:to-pink-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none" disabled={isLoading || !prompt.trim() || !editHotspot}>{uiStrings.generate}</button>
                    </form>
                </div>
            )}
            {activeTab === 'lasso-select' && <LassoPanel onGenerate={handleLassoGenerate} isMaskReady={!!maskFile} isLoading={isLoading} uiStrings={uiStrings} />}
            {activeTab === 'style-transfer' && <StyleTransferPanel onStyleTransfer={handleStyleTransfer} onSetStyleImage={setStyleImage} styleImage={styleImage} isLoading={isLoading} uiStrings={uiStrings} />}
            {activeTab === 'presets' && <PresetsPanel history={history.slice(1, historyIndex + 1)} onApplyPreset={handleApplyPreset} uiStrings={uiStrings} />}
            {activeTab === 'expand' && <ExpandPanel onExpand={handleExpand} isLoading={isLoading} uiStrings={uiStrings} />}
            {activeTab === 'upscale' && <UpscalePanel onUpscale={handleUpscale} isLoading={isLoading} uiStrings={uiStrings} />}
            {activeTab === 'crop' && <CropPanel onApplyCrop={handleApplyCrop} onSetAspect={setAspect} isLoading={isLoading} isCropping={!!completedCrop?.width && completedCrop.width > 0} uiStrings={uiStrings} />}
            {activeTab === 'adjust' && <AdjustmentPanel onApplyAdjustment={handleApplyAdjustment} isLoading={isLoading} uiStrings={uiStrings} />}
            {activeTab === 'filters' && <FilterPanel onApplyFilter={handleApplyFilter} isLoading={isLoading} uiStrings={uiStrings} />}
            {activeTab === 'remove-bg' && <RemoveBgPanel onRemoveBackground={handleRemoveBackground} isLoading={isLoading} uiStrings={uiStrings} />}
        </div>
        
        <div className="w-full flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
                {currentImage && (
                    <button
                        onClick={handleGenerateVariations}
                        disabled={isLoading}
                        className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Generate Variations"
                    >
                        <SparkleIcon className="w-5 h-5 mr-2" />
                        {uiStrings.generateVariations}
                    </button>
                )}
                <button onClick={handleUndo} disabled={!canUndo || isLoading} className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5" aria-label="Undo last action"><UndoIcon className="w-5 h-5 mr-2" />{uiStrings.undo}</button>
                <button onClick={handleRedo} disabled={!canRedo || isLoading} className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5" aria-label="Redo last action"><RedoIcon className="w-5 h-5 mr-2" />{uiStrings.redo}</button>
                <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>
                <button onClick={handleReset} disabled={!canUndo || isLoading} className="text-center bg-transparent border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/10 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent">{uiStrings.reset}</button>
                <button onClick={handleExitEditor} disabled={isLoading} className="text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base">{uiStrings.exitEditor}</button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                    onClick={handleGenerateGif}
                    disabled={isLoading}
                    className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Generate GIF"
                >
                    <FilmIcon className="w-5 h-5 mr-2" />
                    {uiStrings.generateGif}
                </button>
                <button onClick={handleDownload} disabled={isLoading} className="bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-3 px-5 rounded-md transition-all duration-300 ease-in-out shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:opacity-50 disabled:cursor-not-allowed">{uiStrings.downloadImage}</button>
            </div>
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (appMode) {
        case 'single-image':
            return renderSingleImageEditor();
        case 'batch':
            return <BatchEditor onExit={handleExitEditor} uiStrings={uiStrings} />;
        case 'start':
        default:
            if (isLoading) { // For text-to-image generation or translation
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
                    <h2 className="text-2xl font-bold text-red-300">{uiStrings.errorOccurred}</h2>
                    <p className="text-md text-red-400">{error}</p>
                    <button onClick={() => { setError(null); handleExitEditor();}} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors">{uiStrings.errorTryAgain}</button>
                  </div>
                );
            }
            return <StartScreen onFileSelect={handleFileSelect} onTextGenerate={handleGenerateFromText} onBatchEditClick={() => setAppMode('batch')} uiStrings={uiStrings} />;
    }
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col">
      <Header uiStrings={uiStrings} onLanguageChange={handleLanguageChange} currentLanguage={currentLanguage} />
      <main className={`flex-grow w-full max-w-[1600px] mx-auto p-4 md:p-8 flex justify-center ${appMode !== 'start' ? 'items-start' : 'items-center'}`}>
        {renderContent()}
      </main>
      <VariationsModal
        isOpen={showVariationsModal}
        variations={variations}
        onSelect={handleSelectVariation}
        onClose={() => setShowVariationsModal(false)}
        uiStrings={uiStrings}
      />
      <GifModal
        isOpen={showGifModal}
        videoUrl={gifUrl}
        onClose={() => {
            setShowGifModal(false);
            setGifUrl(null);
        }}
        uiStrings={uiStrings}
      />
    </div>
  );
};

export default App;
