
import React, { useState, useEffect } from 'react';
import { searchVideos, translateText, generateEducationalVideo } from '../services/geminiService';
import { Youtube, Search, Play, ExternalLink, Loader2, Sparkles, Wand2, History, Languages, BookOpen, ArrowLeft, Info, AlertTriangle } from 'lucide-react';
import { VideoResult, GeneratedVideo } from '../types';

const getAIStudio = () => (window as any).aistudio;

const VideoGallery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [youtubeVideos, setYoutubeVideos] = useState<VideoResult[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | GeneratedVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightText, setInsightText] = useState('');
  const [targetLang, setTargetLang] = useState('English');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sarathix_generated_videos');
    if (saved) setGeneratedVideos(JSON.parse(saved));
  }, []);

  const saveVideo = (video: GeneratedVideo) => {
    const updated = [video, ...generatedVideos];
    setGeneratedVideos(updated);
    localStorage.setItem('sarathix_generated_videos', JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const { text, chunks } = await searchVideos(searchQuery);
      setInsightText(text || '');
      const found: VideoResult[] = [];
      const seen = new Set();
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && (chunk.web.uri.includes('youtube.com') || chunk.web.uri.includes('youtu.be'))) {
          if (!seen.has(chunk.web.uri)) {
            seen.add(chunk.web.uri);
            const id = chunk.web.uri.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
            if (id) {
              found.push({
                title: chunk.web.title || 'Educational Lesson',
                url: chunk.web.uri,
                thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
                type: 'YOUTUBE'
              });
            }
          }
        }
      });
      setYoutubeVideos(found);
    } catch (e) { setError("Search failed."); } finally { setIsLoading(false); }
  };

  const handleCreateAIVideo = async () => {
    if (!searchQuery.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const aistudio = getAIStudio();
      if (!(await aistudio.hasSelectedApiKey())) await aistudio.openSelectKey();
      
      const uri = await generateEducationalVideo(searchQuery);
      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substring(7),
        title: `AI: ${searchQuery}`,
        prompt: searchQuery,
        uri,
        timestamp: Date.now(),
        type: 'AI_GENERATED'
      };
      saveVideo(newVideo);
      setSelectedVideo(newVideo);
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) await getAIStudio().openSelectKey();
      else setError("Generation failed.");
    } finally { setIsGenerating(false); }
  };

  const handleTranslate = async () => {
    if (!insightText || targetLang === 'English') return;
    setIsTranslating(true);
    try {
      const result = await translateText(insightText, targetLang);
      setTranslatedText(result);
    } catch (e) { console.error(e); } finally { setIsTranslating(false); }
  };

  useEffect(() => {
    if (insightText && targetLang !== 'English') handleTranslate();
    else setTranslatedText('');
  }, [targetLang, insightText]);

  const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese'];

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-6 md:space-y-8 animate-fadeIn overflow-y-auto custom-scrollbar">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 md:gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-xl shadow-lg">
              <Youtube size={24} className="text-white" />
            </div>
            Learning Lab
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1 flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-500" />
            Grounding & AI Generation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:max-w-2xl">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Topic..." className="flex-1 bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:ring-1 focus:ring-red-500 outline-none" />
          <div className="flex gap-2">
            <button onClick={handleSearch} disabled={isLoading} className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs disabled:opacity-50">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
            </button>
            <button onClick={handleCreateAIVideo} disabled={isGenerating || !searchQuery} className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs disabled:opacity-50">
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />} Create
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-xl flex items-center gap-3 text-red-400 text-xs">
          <AlertTriangle size={16} /> <p>{error}</p>
        </div>
      )}

      {selectedVideo ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in-95">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-gray-800">
              {selectedVideo.type === 'AI_GENERATED' ? (
                <video src={(selectedVideo as GeneratedVideo).uri} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <iframe src={`https://www.youtube.com/embed/${(selectedVideo as VideoResult).url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1]}?autoplay=1`} title={selectedVideo.title} className="w-full h-full border-0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white line-clamp-1">{selectedVideo.title}</h3>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{selectedVideo.type === 'AI_GENERATED' ? 'AI Production' : 'YouTube Asset'}</p>
              </div>
              <button onClick={() => setSelectedVideo(null)} className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 rounded-lg text-xs">
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 md:p-6 flex flex-col h-[400px] lg:h-auto overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[10px]">
                <BookOpen size={14} /> Insights
              </h4>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="bg-black/40 text-[10px] text-gray-300 outline-none p-1 rounded border border-gray-800">
                {languages.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto text-xs md:text-sm text-gray-300 leading-relaxed custom-scrollbar italic font-light">
              {isTranslating ? <div className="flex items-center justify-center h-full"><Loader2 size={24} className="animate-spin text-indigo-500" /></div> : (translatedText || insightText || "Deep analysis available...")}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 pb-12">
          {generatedVideos.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><History size={18} /> AI Library</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {generatedVideos.map((video) => (
                  <div key={video.id} onClick={() => setSelectedVideo(video)} className="group bg-gray-900/40 rounded-2xl overflow-hidden border border-gray-800 cursor-pointer flex flex-col h-full hover:border-indigo-500/50 transition-all">
                    <div className="aspect-video bg-indigo-950 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-indigo-950/40" />
                      <Play size={24} className="text-white fill-current opacity-60 group-hover:opacity-100" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-white text-[10px] md:text-xs line-clamp-1">{video.title}</h4>
                      <p className="text-[8px] text-gray-600 mt-1 uppercase">{new Date(video.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Youtube size={18} /> Search Results</h3>
            {isLoading ? <div className="h-40 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-red-500 opacity-30" /></div> : youtubeVideos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {youtubeVideos.map((video, idx) => (
                  <div key={idx} onClick={() => setSelectedVideo(video)} className="bg-gray-900/40 rounded-2xl overflow-hidden border border-gray-800 cursor-pointer flex flex-col h-full hover:border-red-500/50 transition-all">
                    <div className="aspect-video overflow-hidden">
                      <img src={video.thumbnail} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-white text-[10px] md:text-xs line-clamp-1">{video.title}</h4>
                      <span className="text-[8px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase mt-2 inline-block">Lesson</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isGenerating && (
              <div className="h-48 flex flex-col items-center justify-center opacity-10 py-12">
                <Sparkles size={48} />
              </div>
            )}
          </section>

          {isGenerating && (
            <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6 text-center">
              <Loader2 size={48} className="animate-spin text-indigo-500 mb-6" />
              <h3 className="text-2xl font-black text-white">Veo 3.1 is Crafting...</h3>
              <p className="text-sm text-indigo-300 mt-2 max-w-xs">Generating pedagogical visuals. This may take a minute.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
