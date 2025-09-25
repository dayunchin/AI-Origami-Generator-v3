/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { generateFilteredImage, generateAdjustedImage, removeBackgroundImage } from '../services/geminiService';
import { UploadIcon } from './icons';
import Spinner from './Spinner';
import type { UIStrings } from '../i18n';

interface BatchEditorProps {
    onExit: () => void;
    uiStrings: UIStrings;
}

type ImageStatus = 'pending' | 'processing' | 'done' | 'error';
type ImageJob = {
    id: string;
    originalFile: File;
    processedFile?: File;
    status: ImageStatus;
    error?: string;
};
type ActionType = 'filter' | 'adjustment' | 'remove-bg';
type Action = {
    name: string;
    prompt?: string;
    type: ActionType;
};

const getActions = (uiStrings: UIStrings): Action[] => [
    // Filters
    { name: 'Synthwave Filter', prompt: 'Apply a vibrant 80s synthwave aesthetic with neon magenta and cyan glows, and subtle scan lines.', type: 'filter' },
    { name: 'Anime Filter', prompt: 'Give the image a vibrant Japanese anime style, with bold outlines, cel-shading, and saturated colors.', type: 'filter' },
    { name: 'Lomo Filter', prompt: 'Apply a Lomography-style cross-processing film effect with high-contrast, oversaturated colors, and dark vignetting.', type: 'filter' },
    { name: 'Noir Filter', prompt: 'Convert the image to a high-contrast, dramatic black-and-white noir style, with deep shadows and cinematic grain.', type: 'filter' },
    { name: 'Watercolor Filter', prompt: 'Transform the image into a delicate watercolor painting, with soft, blended colors, and a textured paper effect.', type: 'filter' },
    { name: 'Steampunk Filter', prompt: 'Apply a steampunk aesthetic to the image, with brass and copper tones, intricate gears, and a Victorian industrial feel.', type: 'filter' },
    { name: 'Double Exposure Filter', prompt: 'Create a surreal double exposure effect, blending the main subject with a misty forest landscape.', type: 'filter' },
    // Adjustments
    { name: uiStrings.adjEnhance, prompt: 'Slightly enhance the sharpness and details of the image without making it look unnatural.', type: 'adjustment' },
    { name: uiStrings.adjWarmer, prompt: 'Adjust the color temperature to give the image warmer, golden-hour style lighting.', type: 'adjustment' },
    // Features
    { name: uiStrings.removeBackground, type: 'remove-bg' },
];

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

const BatchEditor: React.FC<BatchEditorProps> = ({ onExit, uiStrings }) => {
    const ACTIONS = getActions(uiStrings);
    const [imageJobs, setImageJobs] = useState<ImageJob[]>([]);
    const [selectedAction, setSelectedAction] = useState<Action>(ACTIONS[0]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newJobs: ImageJob[] = Array.from(files).map(file => ({
            id: `${file.name}-${file.lastModified}`,
            originalFile: file,
            status: 'pending',
        }));
        setImageJobs(prev => [...prev, ...newJobs]);
    };

    useEffect(() => {
        fileInputRef.current?.click();
    }, []);

    const processImages = useCallback(async () => {
        setIsProcessing(true);
        const CONCURRENT_LIMIT = 3;
        const queue = [...imageJobs.filter(job => job.status === 'pending' || job.status === 'error')];

        const runJob = async (job: ImageJob) => {
            setImageJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'processing' } : j));
            try {
                let resultUrl: string;
                switch (selectedAction.type) {
                    case 'filter':
                        resultUrl = await generateFilteredImage(job.originalFile, selectedAction.prompt!);
                        break;
                    case 'adjustment':
                        resultUrl = await generateAdjustedImage(job.originalFile, selectedAction.prompt!);
                        break;
                    case 'remove-bg':
                        resultUrl = await removeBackgroundImage(job.originalFile);
                        break;
                    default:
                        throw new Error("Invalid action type selected.");
                }

                const newFile = dataURLtoFile(resultUrl, `edited-${job.originalFile.name}`);
                setImageJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'done', processedFile: newFile } : j));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setImageJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'error', error: message } : j));
            }
        };

        const worker = async () => {
            while (queue.length > 0) {
                const jobToRun = queue.shift();
                if (jobToRun) {
                    await runJob(jobToRun);
                }
            }
        };

        const workers = Array(CONCURRENT_LIMIT).fill(null).map(worker);
        await Promise.all(workers);

        setIsProcessing(false);
    }, [imageJobs, selectedAction]);

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        const doneJobs = imageJobs.filter(job => job.status === 'done' && job.processedFile);
        if (doneJobs.length === 0) return;

        doneJobs.forEach(job => {
            zip.file(job.processedFile!.name, job.processedFile!);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "pixshop_batch_edit.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };
    
    const jobsDone = imageJobs.filter(job => job.status === 'done').length;
    const totalJobs = imageJobs.length;
    const allFinished = (jobsDone === totalJobs) && totalJobs > 0;

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
            <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e.target.files)} />
            
            <div className="text-center">
                <h1 className="text-4xl font-bold">{uiStrings.batchEditorTitle}</h1>
                <p className="text-gray-400 mt-2">{uiStrings.batchEditorDescription}</p>
            </div>

            <div className="w-full bg-black/30 border border-purple-800/50 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
                <div className="flex flex-col w-full md:w-auto">
                    <label htmlFor="action-select" className="text-sm font-medium text-gray-300 mb-1">{uiStrings.batchSelectAction}</label>
                    <select id="action-select" value={selectedAction.name} onChange={e => setSelectedAction(ACTIONS.find(a => a.name === e.target.value)!)} disabled={isProcessing} className="w-full bg-purple-950/20 border border-purple-800/60 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition">
                        {ACTIONS.map(action => <option key={action.name} value={action.name} className="bg-purple-800 text-gray-200">{action.name}</option>)}
                    </select>
                </div>
                <button onClick={processImages} disabled={isProcessing || imageJobs.length === 0} className="w-full md:w-auto bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold py-3 px-8 text-lg rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-px active:scale-95 disabled:from-gray-600 disabled:shadow-none disabled:cursor-not-allowed">
                    {isProcessing ? uiStrings.batchProcessing : uiStrings.batchProcess.replace('{count}', String(imageJobs.length))}
                </button>
            </div>
            
            {imageJobs.length === 0 ? (
                <div className="w-full text-center py-20 bg-black/20 border-2 border-dashed border-purple-700/60 rounded-xl flex flex-col items-center justify-center gap-4">
                     <UploadIcon className="w-12 h-12 text-gray-500" />
                     <h3 className="text-xl font-semibold">{uiStrings.batchNoImages}</h3>
                     <p className="text-gray-400">{uiStrings.batchAddMore}</p>
                     <button onClick={() => fileInputRef.current?.click()} className="mt-2 bg-white/10 text-white font-semibold py-2 px-5 rounded-md hover:bg-white/20 transition-colors">{uiStrings.batchSelectImages}</button>
                </div>
            ) : (
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imageJobs.map(job => <ImageCard key={job.id} job={job} />)}
                </div>
            )}
            
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button onClick={onExit} className="text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md hover:bg-white/20">{uiStrings.batchExit}</button>
                {allFinished && <button onClick={handleDownloadAll} className="bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-3 px-5 rounded-md shadow-lg shadow-green-500/20 hover:shadow-xl">{uiStrings.batchDownloadAll}</button>}
            </div>
        </div>
    );
};


const ImageCard: React.FC<{ job: ImageJob }> = ({ job }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const file = job.status === 'done' && job.processedFile ? job.processedFile : job.originalFile;
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [job.originalFile, job.processedFile, job.status]);

    return (
        <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            {url && <img src={url} alt={job.originalFile.name} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2 text-center">
                {job.status === 'processing' && <Spinner />}
                {job.status === 'done' && <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>}
                {job.status === 'error' && <div className="text-red-400 font-bold text-sm">Error</div>}
            </div>
             <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">{job.originalFile.name}</p>
        </div>
    );
};

export default BatchEditor;
