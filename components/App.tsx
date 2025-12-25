
import React, { useState, useEffect } from 'react';
import { Tab, KnowledgeDocument, Plugin } from '../types';
import LandingPage from './LandingPage';
import PresentationStudio from './PresentationStudio';
import SpeechIntelligence from './SpeechIntelligence';
import KnowledgeBase from './KnowledgeBase';
import VideoGallery from './VideoGallery';
import CalendarHub from './CalendarHub';
import PluginMarketplace from './PluginMarketplace';
import PluginHub from './PluginHub';
import { Presentation, Mic, Database, Cpu, Search, Youtube, Video, Settings, Box, Map, Calendar, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.LANDING);
  const [isPluginMarketplaceOpen, setIsPluginMarketplaceOpen] = useState(false);
  const [pendingSource, setPendingSource] = useState<{ title: string; content: string } | null>(null);
  
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeDocument[]>(() => {
    try {
      const saved = localStorage.getItem('mobius_kb');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error("KB parse error", e); }
    return [{
      id: '1', title: 'Physics 101 Textbook - Thermodynamics', content: 'The first law of thermodynamics states that energy cannot be created or destroyed, only transferred or changed from one form to another. Entropy always increases in an isolated system.', timestamp: Date.now()
    }];
  });

  const [plugins, setPlugins] = useState<Plugin[]>(() => {
    const defaultPlugins = [
      { id: 'google-search', name: 'Google Search', description: 'Enable live web grounding for research.', icon: 'search', installed: true, requiresApiKey: false },
      { id: 'google-maps', name: 'Google Maps', description: 'Retrieve location data and venue details.', icon: 'map', installed: false, requiresApiKey: false },
      { id: 'youtube-data', name: 'YouTube Data', description: 'Enhanced video search and metadata.', icon: 'youtube', installed: true, requiresApiKey: false },
      { id: 'python-core', name: 'Python Core', description: 'Code execution environment for math.', icon: 'code', installed: false, requiresApiKey: false },
    ];
    try {
      const saved = localStorage.getItem('mobius_plugins');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error("Plugin parse error", e); }
    return defaultPlugins;
  });

  useEffect(() => { 
    if (knowledgeBase) localStorage.setItem('mobius_kb', JSON.stringify(knowledgeBase)); 
  }, [knowledgeBase]);

  useEffect(() => { 
    if (plugins) localStorage.setItem('mobius_plugins', JSON.stringify(plugins)); 
  }, [plugins]);

  const togglePlugin = (id: string) => {
    setPlugins(prev => (prev || []).map(p => p.id === id ? { ...p, installed: !p.installed } : p));
  };

  const addKnowledgeDocument = (doc: KnowledgeDocument) => {
    setKnowledgeBase(prev => [...(prev || []), doc]);
  };

  const handleExportToKB = (title: string, content: string) => {
    setPendingSource({ title, content });
    setActiveTab(Tab.KNOWLEDGE_BASE);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-gray-100 font-sans selection:bg-indigo-500/30">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 border-r border-gray-800 bg-[#090b14] flex-col justify-between z-50">
        <div>
          <button 
            onClick={() => setActiveTab(Tab.LANDING)}
            className="h-24 w-full flex items-center px-8 border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors group focus:outline-none"
          >
            <div className="bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/20 group-hover:scale-105 transition-all">
               <Cpu className="w-6 h-6 text-indigo-500" />
            </div>
            <span className="ml-4 text-xl font-black tracking-tighter group-hover:text-white transition-colors">SarathiX</span>
          </button>

          <nav className="mt-10 px-4 space-y-1.5">
            <SidebarItem icon={<Presentation />} label="Presentations" active={activeTab === Tab.PRESENTATION_STUDIO} onClick={() => setActiveTab(Tab.PRESENTATION_STUDIO)} />
            <SidebarItem icon={<Mic />} label="Speech Intel" active={activeTab === Tab.SPEECH_INTELLIGENCE} onClick={() => setActiveTab(Tab.SPEECH_INTELLIGENCE)} />
            <SidebarItem icon={<Video />} label="Educational Gallery" active={activeTab === Tab.VIDEO_GALLERY} onClick={() => setActiveTab(Tab.VIDEO_GALLERY)} />
            <SidebarItem icon={<Globe />} label="Plugin Hub" active={activeTab === Tab.PLUGIN_HUB} onClick={() => setActiveTab(Tab.PLUGIN_HUB)} />
            <SidebarItem icon={<Calendar />} label="Calendar" active={activeTab === Tab.CALENDAR} onClick={() => setActiveTab(Tab.CALENDAR)} />
            <SidebarItem icon={<Database />} label="Knowledge Base" active={activeTab === Tab.KNOWLEDGE_BASE} onClick={() => setActiveTab(Tab.KNOWLEDGE_BASE)} />
          </nav>
        </div>

        <div className="p-6 border-t border-gray-800/50 space-y-6">
           <div className="bg-gray-900/40 rounded-2xl p-5 border border-gray-800/50">
             <div className="flex justify-between items-center mb-4">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Plugins</h4>
               <button onClick={() => setIsPluginMarketplaceOpen(true)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Manage</button>
             </div>
             <div className="space-y-3">
               {(plugins || []).filter(p => p.installed).slice(0, 3).map(p => (
                 <div key={p.id} className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                   {p.icon === 'search' && <Search className="w-4 h-4 text-blue-400" />}
                   {p.icon === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                   {p.icon === 'map' && <Map className="w-4 h-4 text-emerald-500" />}
                   {p.icon === 'code' && <Box className="w-4 h-4 text-yellow-500" />}
                   <span className="truncate">{p.name}</span>
                 </div>
               ))}
               {(plugins || []).filter(p => p.installed).length === 0 && <span className="text-[10px] text-gray-600 italic font-bold">No plugins active</span>}
             </div>
           </div>
           
           <button 
             onClick={() => setIsPluginMarketplaceOpen(true)}
             className="w-full flex items-center gap-4 p-3 text-gray-400 hover:text-white transition-all group"
           >
             <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
             <span className="text-sm font-bold tracking-tight">Plugin Store</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col pb-16 lg:pb-0 bg-[#030712]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03),transparent)] pointer-events-none"></div>
        <div className="relative z-10 flex-1 h-full overflow-hidden">
          {activeTab === Tab.LANDING && <LandingPage onNavigate={setActiveTab} />}
          {activeTab === Tab.PRESENTATION_STUDIO && <PresentationStudio knowledgeBase={knowledgeBase} plugins={plugins} />}
          {activeTab === Tab.SPEECH_INTELLIGENCE && <SpeechIntelligence knowledgeBase={knowledgeBase} plugins={plugins} onExportToKB={handleExportToKB} />}
          {activeTab === Tab.VIDEO_GALLERY && <VideoGallery />}
          {activeTab === Tab.PLUGIN_HUB && <PluginHub plugins={plugins} />}
          {activeTab === Tab.CALENDAR && <CalendarHub />}
          {activeTab === Tab.KNOWLEDGE_BASE && (
            <KnowledgeBase 
              documents={knowledgeBase} 
              onAddDocument={addKnowledgeDocument} 
              onRemoveDocument={(id) => setKnowledgeBase(prev => (prev || []).filter(d => d.id !== id))} 
              initialSource={pendingSource}
              onClearInitial={() => setPendingSource(null)}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 flex items-center justify-around h-20 z-50 px-4 backdrop-blur-2xl">
        <MobileNavItem icon={<Presentation size={24} />} active={activeTab === Tab.PRESENTATION_STUDIO} onClick={() => setActiveTab(Tab.PRESENTATION_STUDIO)} />
        <MobileNavItem icon={<Mic size={24} />} active={activeTab === Tab.SPEECH_INTELLIGENCE} onClick={() => setActiveTab(Tab.SPEECH_INTELLIGENCE)} />
        <MobileNavItem icon={<Globe size={24} />} active={activeTab === Tab.PLUGIN_HUB} onClick={() => setActiveTab(Tab.PLUGIN_HUB)} />
        <MobileNavItem icon={<Database size={24} />} active={activeTab === Tab.KNOWLEDGE_BASE} onClick={() => setActiveTab(Tab.KNOWLEDGE_BASE)} />
        <MobileNavItem icon={<Settings size={24} />} active={isPluginMarketplaceOpen} onClick={() => setIsPluginMarketplaceOpen(true)} />
      </nav>

      <PluginMarketplace 
        isOpen={isPluginMarketplaceOpen} 
        onClose={() => setIsPluginMarketplaceOpen(false)} 
        plugins={plugins || []}
        onTogglePlugin={togglePlugin}
      />
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group
      ${active 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/10 scale-[1.02]' 
        : 'text-gray-500 hover:bg-gray-800/30 hover:text-gray-200'
      }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-60'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span className={`ml-4 text-sm font-black tracking-tight ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
  </button>
);

const MobileNavItem = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-2xl transition-all duration-300 ${active ? 'text-indigo-500 bg-indigo-500/10 scale-110' : 'text-gray-600'}`}
  >
    {icon}
  </button>
);

export default App;
