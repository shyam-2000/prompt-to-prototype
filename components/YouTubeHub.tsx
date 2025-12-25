
import React, { useState, useEffect } from 'react';
import { searchVideos, translateText } from '../services/geminiService';
import { Youtube, Search, Play, ExternalLink, Loader2, Film, BookOpen, Globe, ArrowRight, Languages, Sparkles } from 'lucide-react';
import { VideoResult } from '../types';

const YouTubeHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [targetLang, setTargetLang] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState('');

  const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese'];

  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setSelectedVideo(null);
    setVideos([]);
    setRawResponse('');
    setTranslatedSummary('');
    
    try {
      const { text, chunks } = await searchVideos(searchQuery);
      setRawResponse(text || '');

      const foundVideos: VideoResult[] = [];
      const seenUrls = new Set();
      
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri) {
            const uri = chunk.web.uri;
            if ((uri.includes('youtube.com') || uri.includes('youtu.be')) && !seenUrls.has(uri)) {
              const id = getVideoId(uri);
              if (id) {
                seenUrls.add(uri);
                foundVideos.push({
                  title: chunk.web.title || 'Educational Content',
                  url: uri,
                  thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
                });
              }
            }
          }
        });
      }
      setVideos(foundVideos);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!rawResponse || targetLang === 'English') {
        setTranslatedSummary('');
        return;
    }
    setIsTranslating(true);
    try {
      const translation = await translateText(rawResponse, targetLang);
      setTranslatedSummary(translation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (rawResponse) handleTranslate();
  }, [targetLang, rawResponse]);

  return (
    <div className="h-full flex flex-col space-y-6 p-6 animate-fadeIn overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-white flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-900/40">
                <Youtube className="w-8 h-8 text-white" />
            </div>
            Educational Video Gallery
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Curated pedagogical content powered by Gemini 3.0 Search Grounding.
          </p>
        </div>

        <div className="relative max-w-md w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Explore topics (e.g. Quantum Physics, History of Art...)"
              className="w-full bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all shadow-xl"
            />
            <Search className="absolute left-4 top-4.5 text-gray-500 w-5 h-5" />
            <button 
                onClick={handleSearch}
                className="absolute right-2 top-2 p-2 bg-red-600 hover:bg-red-500 rounded-xl text-white transition-colors"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </button>
        </div>
      </div>

      {selectedVideo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
            {/* Player Area */}
            <div className="lg:col-span-2 space-y-6">
                <div className="relative group bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video border border-gray-800">
                    <iframe
                        src={`https://www.youtube.com/embed/${getVideoId(selectedVideo.url)}?autoplay=1`}
                        title={selectedVideo.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
                <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-white">{selectedVideo.title}</h3>
                    <button 
                        onClick={() => setSelectedVideo(null)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors border border-gray-700"
                    >
                        Back to Gallery
                    </button>
                </div>
            </div>

            {/* AI Insights Panel */}
            <div className="lg:col-span-1 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 flex flex-col shadow-2xl max-h-[600px]">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                        <BookOpen className="w-4 h-4" /> Educational Insights
                    </h4>
                    <div className="flex items-center gap-2 bg-gray-950 rounded-lg p-1 border border-gray-800">
                        <Languages className="w-3.5 h-3.5 text-gray-500" />
                        <select 
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                            className="bg-transparent text-[10px] text-gray-400 focus:outline-none"
                        >
                            {languages.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {isTranslating ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-3 opacity-50">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            <p className="text-xs text-gray-400">Gemini 3.0 is translating...</p>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {translatedSummary || rawResponse || "Analyzing educational context..."}
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800">
                    <a 
                        href={selectedVideo.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-900/20"
                    >
                        <ExternalLink className="w-4 h-4" /> Open in YouTube
                    </a>
                </div>
            </div>
        </div>
      ) : (
        /* Gallery Grid */
        <div className="flex-1">
            {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-red-500/20 rounded-full animate-ping" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Youtube className="w-10 h-10 text-red-600 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-medium text-white">Curating educational assets...</p>
                        <p className="text-gray-500 text-sm mt-1">Grounding search results via Google Search Tool</p>
                    </div>
                </div>
            ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
                    {videos.map((video, idx) => (
                        <div 
                            key={idx}
                            onClick={() => setSelectedVideo(video)}
                            className="group relative bg-gray-900/40 rounded-3xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(239,68,68,0.15)] cursor-pointer flex flex-col animate-in fade-in slide-in-from-bottom-6"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img 
                                    src={video.thumbnail} 
                                    alt={video.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                                        <Play className="w-8 h-8 text-white fill-current" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h4 className="text-lg font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors leading-snug">
                                    {video.title}
                                </h4>
                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-950 px-2 py-1 rounded border border-gray-800">
                                        Learning Module
                                    </span>
                                    <span className="text-red-500 flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        VIEW LESSON <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                    <Film className="w-24 h-24 text-gray-600" />
                    <div>
                        <p className="text-2xl font-light text-gray-400 italic">Enter a topic to begin your educational journey</p>
                        <p className="text-sm text-gray-600 mt-2">Example: "The Golden Age of Pirates" or "How Neural Networks learn"</p>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default YouTubeHub;
