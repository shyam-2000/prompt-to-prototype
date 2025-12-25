
import React from 'react';
import { Tab } from '../types';
import { Button } from './ui/Primitives';
import { Presentation, Mic, Video, Database, ArrowRight, Zap, Globe, Cpu } from 'lucide-react';

interface Props {
  onNavigate: (tab: Tab) => void;
}

const LandingPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar animate-fadeIn">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-[10px] md:text-xs font-medium mb-2 md:mb-4">
          <Zap className="w-3 h-3" /> Powered by Gemini 3.0 Pro & Veo 3.1
        </div>
        
        <h1 className="text-4xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight leading-tight">
          SarathiX AI Studio
        </h1>
        
        <p className="text-base md:text-xl text-gray-400 max-w-2xl leading-relaxed">
          Your intelligent workspace for Hybrid RAG creation. Generate presentations, translate educational speech, and create pedagogical videos with Veo 3.1.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
          <Button 
            size="lg" 
            onClick={() => onNavigate(Tab.PRESENTATION_STUDIO)} 
            className="rounded-full px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 font-bold transition-all border-0"
          >
            Start Creating
          </Button>
          <Button size="lg" onClick={() => onNavigate(Tab.KNOWLEDGE_BASE)} variant="outline" className="rounded-full px-8 border-gray-700 hover:border-indigo-500 hover:text-indigo-400">
            Manage Knowledge
          </Button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto w-full pb-12">
        
        {/* Card 1 */}
        <div 
          onClick={() => onNavigate(Tab.PRESENTATION_STUDIO)}
          className="group bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all cursor-pointer flex flex-col"
        >
          <div className="w-12 h-12 bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
            <Presentation className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Presentation Studio</h3>
          <p className="text-sm text-gray-400 mb-4 flex-1">
            Auto-generate slide decks with AI visuals. Uses Hybrid RAG (Textbooks + Web).
          </p>
          <div className="flex items-center text-indigo-400 text-xs font-bold group-hover:gap-2 transition-all">
            OPEN STUDIO <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => onNavigate(Tab.SPEECH_INTELLIGENCE)}
          className="group bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all cursor-pointer flex flex-col"
        >
          <div className="w-12 h-12 bg-pink-900/20 rounded-xl flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
            <Mic className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Speech Translation</h3>
          <p className="text-sm text-gray-400 mb-4 flex-1">
            Transcribe and translate educational speech using Gemini 3.0 reasoning.
          </p>
          <div className="flex items-center text-pink-400 text-xs font-bold group-hover:gap-2 transition-all">
            START TRANSLATING <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => onNavigate(Tab.VIDEO_GALLERY)}
          className="group bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all cursor-pointer flex flex-col"
        >
          <div className="w-12 h-12 bg-red-900/20 rounded-xl flex items-center justify-center text-red-400 mb-4 group-hover:scale-110 transition-transform">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Educational Gallery</h3>
          <p className="text-sm text-gray-400 mb-4 flex-1">
            Search YouTube with grounding or generate pedagogical videos with Veo 3.1.
          </p>
          <div className="flex items-center text-red-400 text-xs font-bold group-hover:gap-2 transition-all">
            CREATE & EXPLORE <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => onNavigate(Tab.KNOWLEDGE_BASE)}
          className="group bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all cursor-pointer flex flex-col"
        >
          <div className="w-12 h-12 bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Personal Knowledge</h3>
          <p className="text-sm text-gray-400 mb-4 flex-1">
            Store your textbooks and documents. The AI uses this as the primary source of truth.
          </p>
          <div className="flex items-center text-emerald-400 text-xs font-bold group-hover:gap-2 transition-all">
            MANAGE DATA <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto w-full pt-8 border-t border-gray-800/50">
         <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-950/30">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
               <Globe className="w-5 h-5" />
            </div>
            <div>
               <h4 className="font-semibold text-gray-200">Global Accessibility</h4>
               <p className="text-xs text-gray-500">Multilingual educational support via Gemini 3.0.</p>
            </div>
         </div>
         <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-950/30">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
               <Cpu className="w-5 h-5" />
            </div>
            <div>
               <h4 className="font-semibold text-gray-200">Veo 3.1 Production</h4>
               <p className="text-xs text-gray-500">Studio-grade educational video generation.</p>
            </div>
         </div>
         <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-950/30">
            <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
               <Zap className="w-5 h-5" />
            </div>
            <div>
               <h4 className="font-semibold text-gray-200">Hybrid Learning</h4>
               <p className="text-xs text-gray-500">Cross-referencing web data with personal documents.</p>
            </div>
         </div>
      </div>
      
      <div className="mt-auto py-8 text-center text-gray-600 text-sm">
         &copy; 2024 SarathiX AI Teacher. Built with Gemini 3.0 & Veo 3.1.
      </div>
    </div>
  );
};

export default LandingPage;
