import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { Image as ImageIcon, Wand2, Upload, Download, Loader2 } from 'lucide-react';

const ImageStudio: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setOriginalImage(base64);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt) return;
    
    setIsLoading(true);
    try {
      // Strip prefix for API
      const base64Data = originalImage.split(',')[1];
      const result = await editImage(base64Data, prompt);
      setGeneratedImage(result);
    } catch (error) {
      alert("Failed to edit image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-6 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-pink-500" />
            Nano Banana Studio
          </h2>
          <p className="text-gray-400 mt-1">Powered by Gemini 2.5 Flash Image. Describe how you want to change the image.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Input Area */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col space-y-4 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-200">Original Image</h3>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group
              ${originalImage ? 'border-gray-700 bg-gray-950' : 'border-gray-700 hover:border-pink-500 hover:bg-gray-800'}`}
          >
            {originalImage ? (
              <img src={originalImage} alt="Original" className="max-h-96 object-contain rounded-lg shadow-md" />
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 font-medium">Click to upload an image</p>
                <p className="text-sm text-gray-600 mt-1">PNG, JPG supported</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Edit Prompt</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a futuristic neon background', 'Make it sketch style'"
                className="flex-1 bg-gray-800 border-gray-700 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
              />
              <button
                onClick={handleGenerate}
                disabled={!originalImage || !prompt || isLoading}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all
                  ${!originalImage || !prompt || isLoading 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                  }`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Output Area */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col space-y-4 shadow-xl">
           <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-200">Generated Result</h3>
            {generatedImage && (
              <a 
                href={generatedImage} 
                download="gemini-edit.png"
                className="text-xs flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </a>
            )}
           </div>
          
          <div className="flex-1 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-center overflow-hidden relative">
            {isLoading ? (
              <div className="text-center space-y-3 animate-pulse">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Wand2 className="w-6 h-6 text-pink-500 animate-spin" />
                </div>
                <p className="text-gray-400">Gemini is reimagining your image...</p>
              </div>
            ) : generatedImage ? (
               <img src={generatedImage} alt="Generated" className="max-h-full max-w-full object-contain shadow-2xl" />
            ) : (
              <div className="text-gray-600 flex flex-col items-center">
                <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                <p>Result will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;