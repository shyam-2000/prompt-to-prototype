
import React, { useState, useEffect } from 'react';
import { Tab, KnowledgeDocument, Plugin } from './types';
import LandingPage from './components/LandingPage';
import PresentationStudio from './components/PresentationStudio';
import SpeechIntelligence from './components/SpeechIntelligence';
import KnowledgeBase from './components/KnowledgeBase';
import VideoGallery from './components/VideoGallery';
import CalendarHub from './components/CalendarHub';
import PluginMarketplace from './components/PluginMarketplace';
import PluginHub from './components/PluginHub';
import { Presentation, Mic, Database, Cpu, Search, Youtube, Video, Settings, Box, Map, Calendar, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.LANDING);
  const [isPluginMarketplaceOpen, setIsPluginMarketplaceOpen] = useState(false);
  // Add state to track sources exported from Speech Intel to Knowledge Base
  const [pendingSource, setPendingSource] = useState<{ title: string; content: string } | null>(null);
  
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeDocument[]>(() => {
    const saved = localStorage.getItem('mobius_kb');
    return saved ? JSON.parse(saved) : [{
      id: '1', title: 'Physics 101 Textbook - Thermodynamics', content: 'The first law of thermodynamics states that energy cannot be created or destroyed, only transferred or changed from one form to another. Entropy always increases in an isolated system.', timestamp: Date.now()
    }];
  });

  const [plugins, setPlugins] = useState<Plugin[]>(() => {
    const saved = localStorage.getItem('mobius_plugins');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'google-search', name: 'Google Search', description: 'Enable live web grounding for research.', icon: 'search', installed: true, requiresApiKey: false },
      { id: 'google-maps', name: 'Google Maps', description: 'Retrieve location data and venue details.', icon: 'map', installed: false, requiresApiKey: false },
      { id: 'youtube-data', name: 'YouTube Data', description: 'Enhanced video search and metadata.', icon: 'youtube', installed: true, requiresApiKey: false },
      { id: 'python-core', name: 'Python Core', description: 'Code execution environment for math.', icon: 'code', installed: false, requiresApiKey: false },
    ];
  });

  useEffect(() => { localStorage.setItem('mobius_kb', JSON.stringify(knowledgeBase)); }, [knowledgeBase]);
  useEffect(() => { localStorage.setItem('mobius_plugins', JSON.stringify(plugins)); }, [plugins]);

  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, installed: !p.installed } : p));
  };

  // Fix for error in line 98: Implemented missing handler for SpeechIntelligence
  const handleExportToKB = (title: string, content: string) => {
    setPendingSource({ title, content });
    setActiveTab(Tab.KNOWLEDGE_BASE);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
      <aside className="w-20 lg:w-64 border-r border-gray-800 bg-gray-900/50 backdrop-blur-xl flex flex-col justify-between z-50">
        <div>
          <button 
            onClick={() => setActiveTab(Tab.LANDING)}
            className="h-20 w-full flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-800 hover:bg-gray-800/50 transition-colors group focus:outline-none"
          >
            <Cpu className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span className="ml-3 text-lg font-bold hidden lg:block tracking-tight group-hover:text-white transition-colors">SarathiX</span>
          </button>

          <nav className="mt-8 px-2 space-y-2">
            <SidebarItem icon={<Presentation />} label="Presentations" active={activeTab === Tab.PRESENTATION_STUDIO} onClick={() => setActiveTab(Tab.PRESENTATION_STUDIO)} />
            <SidebarItem icon={<Mic />} label="Speech Intel" active={activeTab === Tab.SPEECH_INTELLIGENCE} onClick={() => setActiveTab(Tab.SPEECH_INTELLIGENCE)} />
            <SidebarItem icon={<Video />} label="Educational Gallery" active={activeTab === Tab.VIDEO_GALLERY} onClick={() => setActiveTab(Tab.VIDEO_GALLERY)} />
            <SidebarItem icon={<Globe />} label="Plugin Hub" active={activeTab === Tab.PLUGIN_HUB} onClick={() => setActiveTab(Tab.PLUGIN_HUB)} />
            <SidebarItem icon={<Calendar />} label="Calendar" active={activeTab === Tab.CALENDAR} onClick={() => setActiveTab(Tab.CALENDAR)} />
            <SidebarItem icon={<Database />} label="Knowledge Base" active={activeTab === Tab.KNOWLEDGE_BASE} onClick={() => setActiveTab(Tab.KNOWLEDGE_BASE)} />
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-4">
           <div className="hidden lg:block bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
             <div className="flex justify-between items-center mb-3">
               <h4 className="text-xs font-semibold text-gray-400 uppercase">Active Plugins</h4>
               <button onClick={() => setIsPluginMarketplaceOpen(true)} className="text-xs text-indigo-400 hover:text-indigo-300">Manage</button>
             </div>
             <div className="space-y-2">
               {plugins.filter(p => p.installed).slice(0, 3).map(p => (
                 <div key={p.id} className="flex items-center gap-2 text-sm text-gray-300">
                   {p.icon === 'search' && <Search className="w-3.5 h-3.5 text-blue-400" />}
                   {p.icon === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-500" />}
                   {p.icon === 'map' && <Map className="w-3.5 h-3.5 text-emerald-500" />}
                   {p.icon === 'code' && <Box className="w-3.5 h-3.5 text-yellow-500" />}
                   <span className="truncate">{p.name}</span>
                 </div>
               ))}
               {plugins.filter(p => p.installed).length === 0 && <span className="text-xs text-gray-600 italic">No plugins active</span>}
             </div>
           </div>
           
           <button 
             onClick={() => setIsPluginMarketplaceOpen(true)}
             className="w-full flex items-center justify-center lg:justify-start gap-3 p-2 text-gray-400 hover:text-white transition-colors"
           >
             <Settings className="w-5 h-5" />
             <span className="hidden lg:inline text-sm font-medium">Plugin Store</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="relative z-10 flex-1 h-full overflow-hidden">
          {activeTab === Tab.LANDING && <LandingPage onNavigate={setActiveTab} />}
          {activeTab === Tab.PRESENTATION_STUDIO && <PresentationStudio knowledgeBase={knowledgeBase} plugins={plugins} />}
          {/* Fix: Passed required onExportToKB prop to SpeechIntelligence */}
          {activeTab === Tab.SPEECH_INTELLIGENCE && <SpeechIntelligence knowledgeBase={knowledgeBase} plugins={plugins} onExportToKB={handleExportToKB} />}
          {activeTab === Tab.VIDEO_GALLERY && <VideoGallery />}
          {activeTab === Tab.PLUGIN_HUB && <PluginHub plugins={plugins} />}
          {activeTab === Tab.CALENDAR && <CalendarHub />}
          {activeTab === Tab.KNOWLEDGE_BASE && (
            <KnowledgeBase 
              documents={knowledgeBase} 
              onAddDocument={(doc) => setKnowledgeBase(prev => [...prev, doc])} 
              onRemoveDocument={(id) => setKnowledgeBase(prev => prev.filter(d => d.id !== id))} 
              initialSource={pendingSource}
              onClearInitial={() => setPendingSource(null)}
            />
          )}
        </div>
      </main>

      <PluginMarketplace 
        isOpen={isPluginMarketplaceOpen} 
        onClose={() => setIsPluginMarketplaceOpen(false)} 
        plugins={plugins}
        onTogglePlugin={togglePlugin}
      />
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-xl transition-all duration-200 group
      ${active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    </div>
    <span className="ml-3 font-medium hidden lg:block">{label}</span>
  </button>
);

export default App;
