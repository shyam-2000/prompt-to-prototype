
import React, { useState, useEffect } from 'react';
import { generatePresentation, expandPresentation, generateSlideVisual } from '../services/geminiService';
import { PresentationSlide, KnowledgeDocument, Plugin, SavedSlide } from '../types';
import { Presentation, ChevronRight, ChevronLeft, MapPin, Layout, Loader2, Zap, BookOpen, Globe, Maximize2, Minimize2, Plus, Bookmark, Check } from 'lucide-react';
import { Button, Input } from './ui/Primitives';

interface Props {
  knowledgeBase: KnowledgeDocument[];
  plugins: Plugin[];
}

const PresentationStudio: React.FC<Props> = ({ knowledgeBase = [], plugins = [] }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpandingDeck, setIsExpandingDeck] = useState(false);
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);
  const [savedStatus, setSavedStatus] = useState<Record<number, boolean>>({});
  
  // Options
  const [location, setLocation] = useState('');

  // Plugin Checks
  const isWebSearchInstalled = plugins?.find(p => p.id === 'google-search')?.installed;
  const isMapsInstalled = plugins?.find(p => p.id === 'google-maps')?.installed;

  // Handle Escape key for full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCanvasExpanded) {
        setIsCanvasExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCanvasExpanded]);

  const handleSaveSlide = () => {
    const slide = slides[currentSlide];
    if (!slide || !slide.visual) return;

    const savedSlidesRaw = localStorage.getItem('sarathix_saved_slides');
    const savedSlides: SavedSlide[] = savedSlidesRaw ? JSON.parse(savedSlidesRaw) : [];
    
    const newSavedSlide: SavedSlide = {
      ...slide,
      id: Math.random().toString(36).substring(7),
      topic: topic || "General Topic",
      savedAt: Date.now()
    };

    localStorage.setItem('sarathix_saved_slides', JSON.stringify([newSavedSlide, ...savedSlides]));
    setSavedStatus(prev => ({ ...prev, [currentSlide]: true }));
    
    // Reset status after a few seconds
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [currentSlide]: false }));
    }, 2000);
  };

  // Helper to auto-generate visuals for a batch of slides
  const processVisualsForSlides = async (slidesToProcess: PresentationSlide[], startIndex: number) => {
    if (!Array.isArray(slidesToProcess)) return;
    slidesToProcess.forEach(async (slide, relativeIndex) => {
      const actualIndex = startIndex + relativeIndex;
      try {
        const base64Image = await generateSlideVisual(slide.title, slide.bullets || []);
        setSlides(prev => prev.map((s, idx) => 
          idx === actualIndex ? { ...s, visual: base64Image } : s
        ));
      } catch (error) {
        console.error(`Failed to generate visual for slide ${actualIndex}`, error);
      }
    });
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsLoading(true);
    setSlides([]);
    setCurrentSlide(0);
    setSavedStatus({});

    try {
      const kbContext = knowledgeBase.map(d => `[${d.title}]: ${d.content}`);
      const activePluginIds = plugins.filter(p => p.installed).map(p => p.id);
      
      const generatedSlides = await generatePresentation(
        topic, 
        kbContext, 
        { location },
        activePluginIds
      );
      
      if (Array.isArray(generatedSlides)) {
        setSlides(generatedSlides);
        processVisualsForSlides(generatedSlides, 0);
      } else {
        throw new Error("Invalid presentation format received.");
      }

    } catch (e) {
      console.error(e);
      alert("Failed to generate presentation. Please try a different topic.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpandDeck = async () => {
    if (!topic || slides.length === 0) return;
    
    setIsExpandingDeck(true);
    try {
      const kbContext = knowledgeBase.map(d => `[${d.title}]: ${d.content}`);
      const activePluginIds = plugins.filter(p => p.installed).map(p => p.id);
      
      const newSlides = await expandPresentation(
        topic,
        slides,
        kbContext,
        activePluginIds
      );
      
      if (Array.isArray(newSlides) && newSlides.length > 0) {
        const startIndex = slides.length;
        setSlides(prev => [...prev, ...newSlides]);
        setCurrentSlide(startIndex);
        processVisualsForSlides(newSlides, startIndex);
      }
    } catch (e) {
      console.error("Failed to expand deck", e);
    } finally {
      setIsExpandingDeck(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(c => c + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 p-4 md:p-6 animate-fadeIn overflow-y-auto lg:overflow-hidden">
      <div className={`flex justify-between items-end ${isCanvasExpanded ? 'hidden' : ''}`}>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Presentation className="w-6 h-6 md:w-8 md:h-8 text-indigo-500" />
            Presentation Studio
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Hybrid RAG Engine: school books & web data.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 min-h-0">
        {/* Controls Area */}
        <div className={`bg-gray-900 rounded-xl border border-gray-800 p-4 md:p-6 flex flex-col space-y-6 shadow-xl transition-all duration-300 ${isCanvasExpanded ? 'hidden' : 'flex'}`}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-2 block">Presentation Topic</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'Thermodynamics'"
              />
            </div>

            {isMapsInstalled && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-emerald-500" /> Venue Context
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., 'Science Fair'"
                />
              </div>
            )}
          </div>

          <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              <Zap className="w-3 h-3 text-yellow-500" /> Sources Active
            </div>
            
            <div className="flex items-center justify-between text-xs md:text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Personal DB</span>
              </div>
              <span className={`text-[10px] md:text-xs ${knowledgeBase?.length > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
                {knowledgeBase?.length > 0 ? `${knowledgeBase.length} Docs` : 'Empty'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Live Web</span>
              </div>
              <span className={`text-[10px] md:text-xs ${isWebSearchInstalled ? 'text-emerald-400' : 'text-gray-600'}`}>
                {isWebSearchInstalled ? 'Active' : 'Missing'}
              </span>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!topic || isLoading}
            size="lg"
            className="w-full font-bold"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Layout className="w-4 h-4 mr-2" />}
            Create
          </Button>

          {/* Slide List */}
          {Array.isArray(slides) && slides.length > 0 && (
             <div className="flex-1 flex flex-col min-h-[200px] border-t border-gray-800 pt-4">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Slides</h4>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  {slides.map((slide, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 text-xs md:text-sm
                        ${currentSlide === idx 
                          ? 'bg-gray-800 border-indigo-500 text-white' 
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:bg-gray-900'}`}
                    >
                      <span className="font-mono opacity-50 w-4">{idx + 1}</span>
                      <span className="truncate">{slide.title}</span>
                      {slide.visual ? (
                        <span className="w-2 h-2 rounded-full bg-pink-500 ml-auto" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-800 ml-auto animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <Button 
                    onClick={handleExpandDeck}
                    disabled={isExpandingDeck}
                    variant="outline" 
                    className="w-full text-[10px] md:text-xs border-dashed"
                  >
                    {isExpandingDeck ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Plus className="w-3 h-3 mr-2" />}
                    Expand Deck (AI)
                  </Button>
                </div>
             </div>
          )}
        </div>

        {/* Slide Display Area */}
        <div className={`bg-gray-950 rounded-xl border border-gray-800 flex flex-col shadow-2xl relative overflow-hidden transition-all duration-300 ${isCanvasExpanded ? 'lg:col-span-3 fixed inset-0 z-[100] rounded-none' : 'lg:col-span-2 aspect-video lg:aspect-auto'}`}>
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            {currentSlideData && currentSlideData.visual && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSaveSlide}
                className={`bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all ${savedStatus[currentSlide] ? 'text-emerald-400' : ''}`}
                title="Save to Gallery"
              >
                {savedStatus[currentSlide] ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCanvasExpanded(!isCanvasExpanded)}
              className="bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm"
            >
              {isCanvasExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          </div>

          {currentSlideData ? (
            <>
              <div className="flex-1 p-6 md:p-12 flex flex-col relative bg-gradient-to-br from-gray-900 to-gray-950 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="mb-4 md:mb-8 mt-4 z-10">
                   <h1 className="text-xl md:text-4xl font-bold text-white mb-2 md:mb-4 leading-tight">
                     {currentSlideData.title}
                   </h1>
                   <div className="h-1 w-12 md:w-16 bg-indigo-500 rounded-full" />
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center z-10 overflow-y-auto lg:overflow-visible">
                    <div className="space-y-3 md:space-y-6">
                        {Array.isArray(currentSlideData.bullets) && currentSlideData.bullets.map((bullet, i) => (
                            <div key={i} className="flex gap-3 md:gap-4 animate-fadeIn">
                                <div className="w-1 md:w-1.5 h-1 md:h-1.5 mt-2 md:mt-2.5 bg-indigo-400 rounded-full shrink-0" />
                                <p className="text-sm md:text-xl text-gray-300 font-light leading-relaxed">{bullet}</p>
                            </div>
                        ))}
                    </div>

                    <div className="h-48 md:h-full max-h-[300px] md:max-h-[400px] bg-white/5 rounded-2xl border-2 border-dashed border-gray-800 flex items-center justify-center relative overflow-hidden">
                        {currentSlideData.visual ? (
                            <img src={currentSlideData.visual} alt="Slide Visual" className="w-full h-full object-contain p-2 md:p-4" />
                        ) : (
                            <div className="text-center p-4">
                                <Loader2 className="w-6 h-6 text-pink-500 animate-spin mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Generating visual...</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800/50 flex justify-between items-end text-[10px] md:text-sm text-gray-600 z-10">
                  <span className="truncate max-w-[150px]">{currentSlideData.footer || "SarathiX AI"}</span>
                  <span className="font-mono">{currentSlide + 1} / {slides.length}</span>
                </div>
              </div>

              {!isCanvasExpanded && (
                <div className="bg-gray-900 border-t border-gray-800 p-3 h-24 overflow-y-auto custom-scrollbar">
                   <span className="text-[10px] font-bold text-indigo-400 uppercase mb-1 tracking-wider block">Notes</span>
                   <p className="text-gray-400 text-xs leading-relaxed">{currentSlideData.speakerNotes}</p>
                </div>
              )}

              <div className="absolute inset-y-0 left-0 w-12 md:w-16 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20">
                 <Button variant="ghost" size="icon" onClick={prevSlide} disabled={currentSlide === 0} className="rounded-full bg-black/50 text-white h-8 w-8 md:h-10 md:w-10">
                   <ChevronLeft size={20} />
                 </Button>
              </div>
              <div className="absolute inset-y-0 right-0 w-12 md:w-16 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20">
                 <Button variant="ghost" size="icon" onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="rounded-full bg-black/50 text-white h-8 w-8 md:h-10 md:w-10">
                   <ChevronRight size={20} />
                 </Button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 p-6 text-center">
              <Layout className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-20" />
              <p className="text-sm md:text-base">Enter a topic to generate slides.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationStudio;
