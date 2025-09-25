/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
};

const handleApiResponse = (
    response: GenerateContentResponse,
    context: string // e.g., "edit", "filter", "adjustment"
): string => {
    // 1. Check for prompt blocking first
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    // 2. Try to find the image part
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        console.log(`Received image data (${mimeType}) for ${context}`);
        return `data:${mimeType};base64,${data}`;
    }

    // 3. If no image, check for other reasons
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }
    
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image for the ${context}. ` + 
        (textFeedback 
            ? `The model responded with text: "${textFeedback}"`
            : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt to be more direct.");

    console.error(`Model response did not contain an image part for ${context}.`, { response });
    throw new Error(errorMessage);
};

/**
 * Generates an edited image using generative AI based on a text prompt and a specific point.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired edit.
 * @param hotspot The {x, y} coordinates on the image to focus the edit.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    hotspot: { x: number, y: number }
): Promise<string> => {
    console.log('Starting generative edit at:', hotspot);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, localized edit on the provided image based on the user's request.
User Request: "${userPrompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).

Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding area.
- The rest of the image (outside the immediate edit area) must remain identical to the original.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final edited image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model.', response);

    return handleApiResponse(response, 'edit');
};

/**
 * Generates an image with a filter applied using generative AI.
 * @param originalImage The original image file.
 * @param filterPrompt The text prompt describing the desired filter.
 * @returns A promise that resolves to the data URL of the filtered image.
 */
export const generateFilteredImage = async (
    originalImage: File,
    filterPrompt: string,
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire image based on the user's request. Do not change the composition or content, only apply the style.
Filter Request: "${filterPrompt}"

Safety & Ethics Policy:
- Filters may subtly shift colors, but you MUST ensure they do not alter a person's fundamental race or ethnicity.
- YOU MUST REFUSE any request that explicitly asks to change a person's race (e.g., 'apply a filter to make me look Chinese').

Output: Return ONLY the final filtered image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and filter prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for filter.', response);
    
    return handleApiResponse(response, 'filter');
};

/**
 * Generates an image with a global adjustment applied using generative AI.
 * @param originalImage The original image file.
 * @param adjustmentPrompt The text prompt describing the desired adjustment.
 * @returns A promise that resolves to the data URL of the adjusted image.
 */
export const generateAdjustedImage = async (
    originalImage: File,
    adjustmentPrompt: string,
): Promise<string> => {
    console.log(`Starting global adjustment generation: ${adjustmentPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire image based on the user's request.
User Request: "${adjustmentPrompt}"

Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final adjusted image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and adjustment prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for adjustment.', response);
    
    return handleApiResponse(response, 'adjustment');
};

/**
 * Removes the background from an image using generative AI.
 * @param originalImage The original image file.
 * @returns A promise that resolves to the data URL of the image with the background removed.
 */
export const removeBackgroundImage = async (
    originalImage: File
): Promise<string> => {
    console.log('Starting background removal.');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to accurately identify the main subject(s) in the image and completely remove the background, replacing it with transparency. The final output must be a PNG image with an alpha channel representing the transparent areas. Do not add any new background or color. Return ONLY the final image with the background removed.`;
    const textPart = { text: prompt };

    console.log('Sending image and background removal prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for background removal.', response);
    
    return handleApiResponse(response, 'background removal');
};

/**
 * Generates an image from a text prompt.
 * @param textPrompt The text prompt describing the image to generate.
 * @returns A promise that resolves to the data URL of the generated image.
 */
export const generateImageFromText = async (
  textPrompt: string
): Promise<string> => {
  console.log(`Starting text-to-image generation: ${textPrompt}`);
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: textPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
    },
  });
  console.log('Received response from model for text-to-image.', response);
  
  // FIX: The GenerateImagesResponse type does not have a promptFeedback property.
  // The check for an empty response below will handle cases where the prompt was blocked.

  const firstImage = response.generatedImages?.[0];
  if (!firstImage?.image?.imageBytes) {
    throw new Error('The AI model did not return an image. This can happen due to safety filters or an invalid prompt.');
  }

  const base64ImageBytes: string = firstImage.image.imageBytes;
  return `data:image/png;base64,${base64ImageBytes}`;
};

/**
 * Upscales an image to 2x its resolution.
 * @param originalImage The original image file.
 * @returns A promise that resolves to the data URL of the upscaled image.
 */
export const upscaleImage = async (
  originalImage: File
): Promise<string> => {
  console.log('Starting image upscaling.');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const originalImagePart = await fileToPart(originalImage);
  const prompt = `You are an expert photo editor AI. Your task is to upscale this image to twice its original resolution. Enhance details, increase sharpness, and ensure the result is photorealistic. Maintain the original aspect ratio and content.`;
  const textPart = { text: prompt };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: [originalImagePart, textPart] },
  });
  console.log('Received response from model for upscaling.', response);
  
  return handleApiResponse(response, 'upscaling');
};

/**
 * Expands an image canvas by filling in transparent areas.
 * @param imageToExpand The image file with transparent areas to be filled.
 * @param userPrompt A text prompt describing what to fill the areas with.
 * @returns A promise that resolves to the data URL of the expanded image.
 */
export const expandImage = async (
  imageToExpand: File,
  userPrompt: string
): Promise<string> => {
  console.log(`Starting generative expand with prompt: ${userPrompt}`);
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const imagePart = await fileToPart(imageToExpand);
  const prompt = `You are an expert photo editor AI (outpainting specialist). The user has expanded the canvas of the provided image, which now has transparent areas. Your task is to realistically fill in the transparent areas, seamlessly extending the original image content to create a larger, cohesive scene.
  
Context for new areas (use if provided, otherwise intelligently extend the scene): "${userPrompt}"

Output: Return ONLY the final, filled-in image.`;
  const textPart = { text: prompt };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: [imagePart, textPart] },
  });
  console.log('Received response from model for expand.', response);
  
  return handleApiResponse(response, 'expand');
};

/**
 * Generates a list of suggested edits for an image.
 * @param image The image to analyze.
 * @returns A promise that resolves to an array of suggestion objects.
 */
export const getEditSuggestions = async (
  image: File
): Promise<{ name: string; prompt: string }[]> => {
  console.log('Getting AI edit suggestions.');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const imagePart = await fileToPart(image);
  const prompt = `Analyze the provided image and suggest three specific, actionable improvements a user could make. For each suggestion, provide a concise name for a button (e.g., 'Enhance Colors') and a detailed prompt for an AI photo editor to execute the change (e.g., 'Increase the color saturation and vibrance of the image, making the colors pop without looking unnatural.'). Return the output as a valid JSON array of objects.`;
  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "A short, catchy name for the suggested edit, suitable for a button label.",
            },
            prompt: {
              type: Type.STRING,
              description: "A detailed, descriptive prompt that can be passed to another AI model to perform the edit.",
            },
          },
          required: ["name", "prompt"]
        }
      }
    },
  });
  
  console.log('Received suggestions from model.', response);
  const jsonStr = response.text.trim();
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse suggestions JSON:", e);
    throw new Error("The AI returned suggestions in an invalid format.");
  }
};


/**
 * Applies the style of one image to another.
 * @param contentImage The image providing the content.
 * @param styleImage The image providing the style.
 * @returns A promise that resolves to the data URL of the stylized image.
 */
export const transferStyle = async (
  contentImage: File,
  styleImage: File,
): Promise<string> => {
  console.log(`Starting style transfer.`);
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const contentImagePart = await fileToPart(contentImage);
  const styleImagePart = await fileToPart(styleImage);
  const prompt = `You are an expert style transfer AI. Apply the artistic style, color palette, and texture of the second image (the style image) to the content and composition of the first image (the content image). The final image must retain the subjects and structure of the content image but look as if it were created in the style of the style image. Return ONLY the final image.`;
  const textPart = { text: prompt };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: [contentImagePart, styleImagePart, textPart] },
  });
  console.log('Received response from model for style transfer.', response);
  
  return handleApiResponse(response, 'style transfer');
};


/**
 * Translates a JSON object of UI strings into a target language.
 * @param strings The object containing English strings.
 * @param targetLanguage The language code (e.g., 'es', 'fr') to translate to.
 * @returns A promise that resolves to the translated object.
 */
export const translateText = async (
  strings: object,
  targetLanguage: string
): Promise<object> => {
  console.log(`Translating UI to ${targetLanguage}`);
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const prompt = `Translate the values of the following JSON object into the language with code "${targetLanguage}". Maintain the exact JSON structure and keys. Only translate the string values. Do not translate placeholder variables like {currentStep} or {totalSteps}.
  
Input JSON:
${JSON.stringify(strings, null, 2)}
  
Output the translated JSON only, enclosed in a single JSON code block.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const jsonStr = response.text.trim();
  try {
    // It should be a valid JSON string because of responseMimeType
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse translated JSON:", e, { jsonStr });
    throw new Error(`The AI returned translated text in an invalid format for ${targetLanguage}.`);
  }
};
