
import React, { useState, useEffect } from 'react';
import { searchVideos, translateText, generateEducationalVideo } from '../services/geminiService';
import { Youtube, Search, Play, ExternalLink, Loader2, Sparkles, Wand2, History, Languages, BookOpen, ArrowLeft, Info, AlertTriangle, Bookmark, Trash2, Layout, ChevronRight } from 'lucide-react';
import { VideoResult, GeneratedVideo, SavedSlide } from '../types';

const getAIStudio = () => (window as any).aistudio;

const VideoGallery: React.FC = () => {
  const [galleryTab, setGalleryTab] = useState<'videos' | 'slides'>('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [youtubeVideos, setYoutubeVideos] = useState<VideoResult[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [savedSlides, setSavedSlides] = useState<SavedSlide[]>([]);
  const [selectedItem, setSelectedItem] = useState<VideoResult | GeneratedVideo | SavedSlide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightText, setInsightText] = useState('');
  const [targetLang, setTargetLang] = useState('English');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const vSaved = localStorage.getItem('sarathix_generated_videos');
    if (vSaved) setGeneratedVideos(JSON.parse(vSaved));

    const sSaved = localStorage.getItem('sarathix_saved_slides');
    if (sSaved) setSavedSlides(JSON.parse(sSaved));
  }, []);

  const deleteSlide = (id: string) => {
    const updated = savedSlides.filter(s => s.id !== id);
    setSavedSlides(updated);
    localStorage.setItem('sarathix_saved_slides', JSON.stringify(updated));
    if (selectedItem && (selectedItem as SavedSlide).id === id) setSelectedItem(null);
  };

  const saveVideo = (video: GeneratedVideo) => {
    const updated = [video, ...generatedVideos];
    setGeneratedVideos(updated);
    localStorage.setItem('sarathix_generated_videos', JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setGalleryTab('videos');
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
      setSelectedItem(newVideo);
      setGalleryTab('videos');
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
    <div className="h-full flex flex-col p-4 md:p-8 space-y-8 animate-fadeIn overflow-y-auto custom-scrollbar bg-[#030712]">
      
      {/* --- BEAUTIFIED HEADER SECTION --- */}
      <div className="relative z-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="relative group">
          {/* Back Glow Effect */}
          <div className={`absolute -inset-8 blur-3xl opacity-20 transition-all duration-700 rounded-full 
            ${galleryTab === 'videos' ? 'bg-red-600' : 'bg-indigo-600'}`}></div>
          
          <div className="relative flex items-center gap-6">
            <div className={`p-4 rounded-[2rem] shadow-2xl transition-all duration-500 transform group-hover:rotate-6
              ${galleryTab === 'videos' ? 'bg-red-600 shadow-red-900/40' : 'bg-indigo-600 shadow-indigo-900/40'}`}>
              {galleryTab === 'videos' ? <Youtube size={32} className="text-white" /> : <Layout size={32} className="text-white" />}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">
                Educational <span className={galleryTab === 'videos' ? 'text-red-500' : 'text-indigo-500'}>Gallery</span>
              </h2>
              <div className="flex items-center bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-full p-1 w-fit shadow-xl">
                 <button 
                  onClick={() => setGalleryTab('videos')} 
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300
                    ${galleryTab === 'videos' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                  Videos
                 </button>
                 <button 
                  onClick={() => setGalleryTab('slides')} 
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300
                    ${galleryTab === 'slides' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                  Saved Slides
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Beautified Search Bar Area */}
        <div className="w-full lg:max-w-2xl relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-[1.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex flex-col sm:flex-row gap-3 bg-gray-950/80 backdrop-blur-2xl border border-gray-800 p-2 rounded-[1.5rem] shadow-2xl">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                placeholder="What do you want to learn today?" 
                className="w-full bg-transparent border-none rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:ring-0 outline-none placeholder-gray-600 font-medium" 
              />
            </div>
            <div className="flex gap-2 p-1">
              <button 
                onClick={handleSearch} 
                disabled={isLoading} 
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 text-xs transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-red-900/20"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={18} />} 
                SEARCH
              </button>
              <button 
                onClick={handleCreateAIVideo} 
                disabled={isGenerating || !searchQuery} 
                className="bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 text-xs transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} className="text-purple-400" />} 
                PRODUCE
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-xs animate-in slide-in-from-top-4">
          <AlertTriangle size={16} /> <p className="font-bold tracking-tight">{error}</p>
        </div>
      )}

      {selectedItem ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-black ring-1 ring-gray-800 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {/* Fix: use property-based type guards to distinguish between GeneratedVideo and VideoResult */}
              {selectedItem && 'uri' in selectedItem ? (
                <video src={selectedItem.uri} controls autoPlay className="w-full h-full object-contain" />
              ) : selectedItem && 'url' in selectedItem ? (
                <iframe src={`https://www.youtube.com/embed/${selectedItem.url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1]}?autoplay=1`} title={selectedItem.title} className="w-full h-full border-0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
              ) : selectedItem ? (
                <div className="w-full h-full p-12 bg-gradient-to-br from-gray-900 to-[#030712] flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-purple-600" />
                  <h3 className="text-2xl md:text-4xl font-black text-white mb-8 tracking-tighter leading-tight">{(selectedItem as SavedSlide).title}</h3>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 items-center overflow-hidden">
                    <div className="space-y-6">
                      {(selectedItem as SavedSlide).bullets.map((b, i) => (
                        <div key={i} className="flex gap-4 text-sm md:text-xl text-gray-400 font-light leading-relaxed group">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-3 shrink-0 group-hover:scale-150 transition-transform" /> {b}
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full"></div>
                      <img src={(selectedItem as SavedSlide).visual} className="relative w-full h-full object-contain rounded-3xl shadow-2xl" alt="Slide Visual" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-2">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">{selectedItem.title}</h3>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mt-3 flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${'uri' in selectedItem ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                   {'uri' in selectedItem ? (selectedItem.type === 'AI_GENERATED' ? 'SarathiX AI Production' : 'Global YouTube Library') : `Saved Research Slide • ${(selectedItem as SavedSlide).topic}`}
                </p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="flex items-center gap-2 px-6 py-3 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                <ArrowLeft size={16} /> Back to Gallery
              </button>
            </div>
          </div>

          {/* AI Info Panel */}
          <div className="bg-gray-900/30 backdrop-blur-3xl border border-gray-800 rounded-[2.5rem] p-8 flex flex-col h-[400px] lg:h-auto overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Sparkles size={120} />
            </div>
            <div className="flex items-center justify-between mb-8">
              <h4 className="flex items-center gap-3 text-indigo-400 font-black uppercase text-[10px] tracking-widest">
                <BookOpen size={18} /> Deep Contextual Insight
              </h4>
              <div className="bg-black/50 border border-gray-800 rounded-xl px-3 py-1.5">
                <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="bg-transparent text-[10px] font-bold text-gray-400 outline-none">
                  {languages.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto text-sm md:text-base text-gray-300 leading-relaxed custom-scrollbar italic font-light pr-2">
               {'speakerNotes' in selectedItem ? (
                 <div className="space-y-6">
                   <p className="opacity-40 uppercase text-[9px] font-black tracking-[0.4em] text-indigo-400">Grounded Speaker Notes</p>
                   <p className="not-italic text-gray-400 leading-relaxed">{(selectedItem as SavedSlide).speakerNotes}</p>
                 </div>
               ) : (
                 isTranslating ? <div className="flex flex-col items-center justify-center h-full gap-4"><Loader2 size={32} className="animate-spin text-indigo-500" /><p className="text-[10px] font-black uppercase tracking-widest opacity-40">Synthesizing Translation</p></div> : (translatedText || insightText || "Deep research analysis available after search...")
               )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-16 pb-20">
          {galleryTab === 'videos' ? (
            <>
              {generatedVideos.length > 0 && (
                <section className="space-y-6">
                  <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg"><History size={20} className="text-indigo-500" /></div>
                    SarathiX AI Library
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {generatedVideos.map((video) => (
                      <div key={video.id} onClick={() => setSelectedItem(video)} className="group bg-gray-900/20 rounded-[2rem] overflow-hidden border border-gray-800 cursor-pointer flex flex-col h-full hover:border-indigo-500/50 hover:shadow-2xl transition-all duration-500">
                        <div className="aspect-video bg-[#030712] flex items-center justify-center relative">
                          <div className="absolute inset-0 bg-indigo-950/20 group-hover:bg-transparent transition-colors" />
                          <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-125">
                            <Play size={24} className="text-white fill-current opacity-60 group-hover:opacity-100" />
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-white text-xs md:text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors">{video.title}</h4>
                          <p className="text-[9px] text-gray-600 mt-2 font-black uppercase tracking-widest">{new Date(video.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-6">
                <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  <div className="p-1.5 bg-red-500/10 rounded-lg"><Youtube size={20} className="text-red-600" /></div>
                  Global Video Search
                </h3>
                {isLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 size={48} className="animate-spin text-red-600 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Syncing with Grounded Knowledge</p>
                  </div>
                ) : youtubeVideos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {youtubeVideos.map((video, idx) => (
                      <div key={idx} onClick={() => setSelectedItem(video)} className="group bg-gray-900/20 rounded-[2rem] overflow-hidden border border-gray-800 cursor-pointer flex flex-col h-full hover:border-red-500/50 hover:shadow-2xl transition-all duration-500">
                        <div className="aspect-video overflow-hidden relative">
                          <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Play size={32} className="text-white fill-current" />
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-white text-xs md:text-sm line-clamp-2 group-hover:text-red-500 transition-colors">{video.title}</h4>
                          <div className="mt-4 pt-4 border-t border-gray-800/50 flex justify-between items-center">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">YouTube Lesson</span>
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isGenerating && (
                  <div className="h-64 flex flex-col items-center justify-center opacity-10 space-y-6 grayscale">
                    <Sparkles size={80} />
                    <p className="text-xs font-black uppercase tracking-[0.5em]">Explore pedagogical archives</p>
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
              <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg"><Bookmark size={20} className="text-indigo-500" /></div>
                Bookmarked Slide Deck
              </h3>
              {savedSlides.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-gray-700 opacity-20 border-2 border-dashed border-gray-900 rounded-[3rem] p-12 text-center">
                   <Layout size={64} className="mb-6" />
                   <p className="text-xl font-black uppercase tracking-widest">Your research vault is empty</p>
                   <p className="text-sm mt-4 italic font-light">Generate and save slides from the Presentation Studio to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {savedSlides.map((slide) => (
                    <div 
                      key={slide.id} 
                      className="group bg-gray-900/20 rounded-[2.5rem] overflow-hidden border border-gray-800 hover:border-indigo-500/50 hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                    >
                      <div 
                        onClick={() => setSelectedItem(slide)}
                        className="aspect-video relative overflow-hidden bg-gray-950 cursor-pointer"
                      >
                         <img src={slide.visual} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" alt={slide.title} />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#030712] to-transparent opacity-80" />
                         <div className="absolute bottom-4 left-6">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{slide.topic}</p>
                         </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start gap-4 mb-4">
                           <h4 onClick={() => setSelectedItem(slide)} className="font-black text-white text-sm md:text-base line-clamp-2 cursor-pointer hover:text-indigo-400 transition-colors leading-tight">{slide.title}</h4>
                           <button 
                             onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id); }}
                             className="text-gray-700 hover:text-red-500 transition-colors p-2 bg-gray-950/50 rounded-xl border border-gray-800"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-auto font-light leading-relaxed">{slide.speakerNotes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {isGenerating && (
            <div className="fixed inset-0 z-[200] bg-[#030712]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="relative mb-12">
                 <div className="w-32 h-32 border-2 border-indigo-500/10 rounded-full animate-ping" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={64} className="animate-spin text-indigo-600" />
                 </div>
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter">Veo 3.1 is Directing...</h3>
              <p className="text-base text-gray-500 mt-4 max-w-sm font-light italic leading-relaxed">Synthesizing pedagogical motion frames from your topic. A masterpiece takes a moment.</p>
              <div className="mt-12 flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
