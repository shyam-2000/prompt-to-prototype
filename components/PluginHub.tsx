
import React, { useState } from 'react';
import { Plugin } from '../types';
import { runDirectSearch, runMapsQuery, executePythonCode, searchVideos } from '../services/geminiService';
import { Search, Map, Youtube, Code, Globe, Navigation, Play, Terminal, Loader2, ExternalLink, Sparkles, Send } from 'lucide-react';

interface Props {
  plugins: Plugin[];
}

const PluginHub: React.FC<Props> = ({ plugins }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const installedPlugins = plugins.filter(p => p.installed);

  const handleRun = async () => {
    if (!query.trim() || !activeTool) return;
    setIsLoading(true);
    setResult(null);

    try {
      if (activeTool === 'google-search') {
        const data = await runDirectSearch(query);
        setResult(data);
      } else if (activeTool === 'google-maps') {
        const data = await runMapsQuery(query);
        setResult(data);
      } else if (activeTool === 'youtube-data') {
        const { text, chunks } = await searchVideos(query);
        setResult({ text, chunks });
      } else if (activeTool === 'python-core') {
        const data = await executePythonCode(query);
        setResult({ text: data });
      }
    } catch (e) {
      alert("Plugin execution failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-4 md:space-y-6 animate-fadeIn overflow-y-auto lg:overflow-hidden">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Globe size={24} className="text-white" />
            </div>
            Command Center
          </h2>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-400" />
            Direct API Access.
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-visible lg:overflow-hidden pb-4">
        
        {/* Left: Tool Selection */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto custom-scrollbar pb-2 lg:pb-0">
           {installedPlugins.length === 0 ? (
             <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center text-gray-500 w-full">
                <p className="text-xs">No active plugins.</p>
             </div>
           ) : (
             installedPlugins.map(plugin => (
               <button
                 key={plugin.id}
                 onClick={() => {
                   setActiveTool(plugin.id);
                   setResult(null);
                   setQuery('');
                 }}
                 className={`flex-shrink-0 flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group
                   ${activeTool === plugin.id 
                     ? 'bg-indigo-600 border-indigo-500 text-white min-w-[140px]' 
                     : 'bg-gray-900 border-gray-800 text-gray-400 min-w-[120px]'}`}
               >
                 <div className={`p-2 rounded-xl ${activeTool === plugin.id ? 'bg-white/20' : 'bg-gray-950'}`}>
                   {plugin.icon === 'search' && <Search size={18} />}
                   {plugin.icon === 'map' && <Map size={18} />}
                   {plugin.icon === 'youtube' && <Youtube size={18} />}
                   {plugin.icon === 'code' && <Code size={18} />}
                 </div>
                 <h3 className="font-bold text-xs whitespace-nowrap lg:whitespace-normal">{plugin.name}</h3>
               </button>
             ))
           )}
        </div>

        {/* Right: Interaction Workspace */}
        <div className="lg:col-span-9 bg-gray-950/50 rounded-3xl border border-gray-800 flex flex-col shadow-2xl min-h-[400px] lg:min-h-0 overflow-hidden backdrop-blur-3xl">
           {!activeTool ? (
             <div className="flex-1 flex flex-col items-center justify-center opacity-20 p-12 text-center">
                <Globe size={48} className="mb-4" />
                <p className="text-lg italic font-light">Select a plugin</p>
             </div>
           ) : (
             <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 md:p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/30">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                         {activeTool === 'google-search' && <Globe size={20} />}
                         {activeTool === 'google-maps' && <Navigation size={20} />}
                         {activeTool === 'youtube-data' && <Youtube size={20} />}
                         {activeTool === 'python-core' && <Terminal size={20} />}
                      </div>
                      <h3 className="text-sm md:text-lg font-bold text-white uppercase tracking-wider">
                         {activeTool.replace('-', ' ')}
                      </h3>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar space-y-6">
                   {result ? (
                     <div className="space-y-6 animate-fadeIn">
                        {activeTool === 'python-core' ? (
                           <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 font-mono text-emerald-400 text-xs overflow-x-auto whitespace-pre">
                              {result.text}
                           </div>
                        ) : (
                          <>
                             <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
                                {result.text}
                             </div>
                             
                             {(result.sources || result.places || result.chunks) && (
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 pt-8 border-t border-gray-800">
                                  {(result.sources || result.places || result.chunks).map((item: any, idx: number) => {
                                    const data = item.web || item.maps || item.youtube || item;
                                    if (!data.uri && !data.url) return null;
                                    return (
                                      <a key={idx} href={data.uri || data.url} target="_blank" rel="noreferrer" className="bg-gray-900/50 border border-gray-800 p-3 rounded-xl hover:border-indigo-500/50 transition-all">
                                         <h4 className="font-bold text-white text-[10px] truncate mb-1">{data.title || "Reference"}</h4>
                                         <p className="text-[8px] text-gray-600 truncate">{data.uri || data.url}</p>
                                      </a>
                                    );
                                  })}
                               </div>
                             )}
                          </>
                        )}
                     </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-20">
                        <Loader2 className={`w-10 h-10 mb-2 ${isLoading ? 'animate-spin' : ''}`} />
                        <p className="text-sm">{isLoading ? "Processing..." : "Ready for input."}</p>
                     </div>
                   )}
                </div>

                <div className="p-4 md:p-6 bg-gray-950 border-t border-gray-800">
                   <div className="relative flex items-center gap-2 max-w-3xl mx-auto">
                      {activeTool === 'python-core' ? (
                        <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Code..." className="w-full h-24 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-xs md:text-sm text-white font-mono focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
                      ) : (
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRun()} placeholder="Search or ask..." className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-xs md:text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                      )}
                      <button onClick={handleRun} disabled={isLoading || !query} className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl shadow-lg active:scale-90 transition-all">
                         {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PluginHub;
