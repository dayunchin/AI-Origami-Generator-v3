/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const englishStrings = {
  // Header
  appTitle: "Dayun Design Studio",
  selectLanguage: "Select language",

  // App General
  loadingMagic: "AI is working its magic...",
  loadingLocalizedEdit: "Performing localized edit...",
  loadingGeneratingImage: "AI is generating your image...",
  loadingFilter: "Applying creative filter...",
  loadingAdjustment: "Applying adjustment...",
  loadingRemoveBg: "Removing background...",
  loadingUpscale: "Upscaling image...",
  loadingExpand: "Expanding canvas with AI...",
  loadingStyleTransfer: "Applying artistic style...",
  loadingPreset: "Applying preset... (Step {currentStep}/{totalSteps})",
  loadingTranslating: "Translating to {languageName}...",
  errorOccurred: "An Error Occurred",
  errorTryAgain: "Try Again",
  
  // Tabs
  tabSuggestions: "Suggestions",
  tabMagicEdit: "Magic Edit",
  tabStyleTransfer: "Style Transfer",
  tabPresets: "Presets",
  tabAdjust: "Adjust",
  tabFilters: "Filters",
  tabRemoveBg: "Remove BG",
  tabCrop: "Crop",
  tabExpand: "Expand",
  tabUpscale: "Upscale",

  // Single Image Editor UI
  magicEditPromptReady: "Great! Now describe your localized edit below.",
  magicEditPromptClick: "Click an area on the image to make a precise edit.",
  magicEditPlaceholderReady: "e.g., 'change my shirt color to blue'",
  magicEditPlaceholderClick: "First click a point on the image",
  generate: "Generate",
  undo: "Undo",
  redo: "Redo",
  reset: "Reset",
  exitEditor: "Exit Editor",
  downloadImage: "Download Image",

  // Start Screen
  startScreenTitle: "AI Origami Generator v3",
  startScreenDescription: "This AI tool is for designing digital origami. It does not provide folding instructions, diagrams, or crease patterns for creating physical origami—at least not yet.",
  startScreenTerms: "By using this application, you agree not to create harmful, explicit or unlawful content.",
  startScreenCredit: "Credit to Pixshop and Gemini.",
  textToImageTitle: "Text/Prompt to Image",
  textToImageDescription: "Let your imagination take flight and describe the origami you envision.",
  textToImageDisclaimer: "The suggestions below are based on my experience with adjusting prompt weights to make AI more controllable, rather than on any formal categorization or classification of origami.",
  imageToImageTitle: "Image to Image",
  imageToImageDescription: "Upload one origami image for the full suite of AI editing tools.",
  uploadAnImage: "Upload an Image",
  dragAndDrop: "or drag and drop",
  batchEditTitle: "Batch Edit",
  batchEditDescription: "Apply adjustment or filter to multiple origami images at once.",
  batchEditSelectPhotos: "Select Images",
  history: "History",
  clearHistory: "CLEAR",
  historyPlaceholder: "Your recent prompts will appear here.",
  origamiType: "Origami Type",
  shape: "Shape",
  color: "Color",
  material: "Material",
  style: "Style",
  details: "Details",
  adjustive: "Adjustive",
  selectUpTo: "(select up to {limit})",
  selectOne: "(select 1)",

  // Adjustment Panel
  adjustmentPanelTitle: "Apply a Professional Adjustment",
  adjBlurBg: "Blur Background",
  adjEnhance: "Enhance Details",
  adjWarmer: "Warmer Lighting",
  adjReplaceBg: "Replace Background",
  adjPlaceholderCustom: "Or describe a custom adjustment",
  adjPlaceholderNewBg: "Describe the new background (e.g., 'a lush tropical beach')",
  applyAdjustment: "Apply Adjustment",

  // Crop Panel
  cropPanelTitle: "Crop Image",
  cropPanelDescription: "Click and drag on the image to select a crop area.",
  aspectRatio: "Aspect Ratio:",
  applyCrop: "Apply Crop",

  // Filter Panel
  filterPanelTitle: "Apply a Filter",
  filterPlaceholder: "Or describe a custom filter (e.g., '80s synthwave glow')",
  applyFilter: "Apply Filter",

  // Remove BG Panel
  removeBgPanelTitle: "Remove Image Background",
  removeBgDescription: "Click the button below to automatically identify the main subject and remove the background. The result will be a PNG image with a transparent background.",
  removeBackground: "Remove Background",

  // Upscale Panel
  upscalePanelTitle: "AI Image Upscaler",
  upscaleDescription: "Increase the image resolution by 2x. The AI will enhance details and sharpness for a high-quality result.",
  upscaleAndEnhance: "Upscale 2x & Enhance",
  
  // Expand Panel
  expandPanelTitle: "Generative Expand",
  expandDescription: "Expand the canvas of your image and let AI fill in the new areas. Describe what you'd like to see in the new space.",
  direction: "Direction",
  pixelsToAdd: "Pixels to Add",
  contextOptional: "Context (Optional)",
  expandPlaceholder: "e.g., 'a sandy beach and ocean waves'",
  generateExpansion: "Generate Expansion",
  directionAll: "All Sides",
  directionHorizontal: "Horizontal",
  directionVertical: "Vertical",
  directionTop: "Top",
  directionRight: "Right",
  directionBottom: "Bottom",
  directionLeft: "Left",

  // Suggestions Panel
  suggestionsPanelTitle: "AI Suggestions",
  suggestionsLoading: "Analyzing your image for improvements...",
  suggestionsDescription: "Here are a few AI-powered suggestions to enhance your photo.",

  // Style Transfer Panel
  styleTransferPanelTitle: "AI Style Transfer",
  styleTransferDescription: "Upload a style image (like a painting or pattern) to apply its visual aesthetic to your photo.",
  styleTransferUpload: "Click to upload Style Image",
  applyStyle: "Apply Style",

  // Presets Panel
  presetsPanelTitle: "Custom Presets",
  presetsSaveWorkflow: "Save your current workflow as a reusable preset.",
  presetsEnterName: "Enter preset name",
  presetsSave: "Save",
  presetsSaveDisabled: "Apply at least one edit to save a preset.",
  presetsYourSaved: "Your Saved Presets",
  presetsApply: "Apply",
  presetsDelete: "Delete",
  presetsNone: "You have no saved presets.",
  
  // Portrait Panel
  portraitPanelTitle: "Smart Portrait Tools",
  portraitPanelDescription: "Apply one-click professional enhancements to your portraits.",
  portraitStudioLight: "Studio Light",
  portraitSmoothSkin: "Smooth Skin",
  portraitFixGaze: "Fix Gaze",

  // Batch Editor
  batchEditorTitle: "Batch Editor",
  batchEditorDescription: "Apply adjustment or filter to multiple origami images at once.",
  batchSelectAction: "Select Action",
  batchProcess: "Process {count} Images",
  batchProcessing: "Processing...",
  batchNoImages: "No images selected",
  batchAddMore: "Click below to add images to the batch.",
  batchSelectImages: "Select Images",
  batchExit: "Exit Batch Editor",
  batchDownloadAll: "Download All (.zip)",
};

export type UIStrings = typeof englishStrings;