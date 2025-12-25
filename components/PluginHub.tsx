
import React, { useState } from 'react';
import { Plugin } from '../types';
import { runDirectSearch, runMapsQuery, executePythonCode, searchVideos } from '../services/geminiService';
// Added Zap to imports
import { Search, Map, Youtube, Code, Globe, Navigation, Play, Terminal, Loader2, ExternalLink, Sparkles, Send, MapPin, ExternalLink as LinkIcon, Zap } from 'lucide-react';

interface Props {
  plugins: Plugin[];
}

const PluginHub: React.FC<Props> = ({ plugins }) => {
  const [activeTool, setActiveTool] = useState<string | null>(plugins.filter(p => p.installed)[0]?.id || null);
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
        let location = undefined;
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) {
          console.warn("Location access denied, proceeding without location context.");
        }
        const data = await runMapsQuery(query, location);
        setResult(data);
      } else if (activeTool === 'youtube-data') {
        const { text, chunks } = await searchVideos(query);
        setResult({ text, chunks });
      } else if (activeTool === 'python-core') {
        const data = await executePythonCode(query);
        setResult({ text: data });
      }
    } catch (e) {
      console.error(e);
      alert("Plugin execution failed. Ensure your API key is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Main Text Content */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-6 md:p-10 shadow-inner">
          {activeTool === 'python-core' ? (
            <div className="font-mono text-emerald-400 text-sm whitespace-pre-wrap">
              <span className="text-gray-600 mr-2">{">>>"}</span>
              {result.text}
            </div>
          ) : (
            <div className="prose prose-invert prose-lg max-w-none text-gray-200 leading-relaxed">
              {result.text}
            </div>
          )}
        </div>

        {/* Dynamic Chunks/Metadata */}
        {activeTool === 'google-search' && result.sources && result.sources.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
              <LinkIcon size={14} /> Citations & Sources
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.sources.map((src: any, i: number) => {
                const data = src.web || src;
                if (!data.uri) return null;
                return (
                  <a key={i} href={data.uri} target="_blank" rel="noreferrer" className="group bg-gray-900 border border-gray-800 p-5 rounded-2xl hover:border-indigo-500/50 hover:bg-gray-800/50 transition-all flex flex-col h-full">
                    <h5 className="text-xs font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-400">{data.title || "Reference Source"}</h5>
                    <p className="text-[10px] text-gray-500 truncate mt-auto">{data.uri}</p>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {activeTool === 'google-maps' && result.places && result.places.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
              <MapPin size={14} /> Locations & Venues
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.places.map((place: any, i: number) => {
                const data = place.maps || place;
                if (!data.uri) return null;
                return (
                  <a key={i} href={data.uri} target="_blank" rel="noreferrer" className="group bg-gray-900 border border-gray-800 p-5 rounded-2xl hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="text-xs font-bold text-white line-clamp-2 group-hover:text-emerald-400">{data.title || "Map Location"}</h5>
                      <ExternalLink size={14} className="text-gray-600 group-hover:text-emerald-500" />
                    </div>
                    {data.description && <p className="text-[10px] text-gray-400 line-clamp-2 mb-4 leading-relaxed">{data.description}</p>}
                    <p className="text-[10px] text-gray-500 truncate mt-auto font-mono">View on Maps</p>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {activeTool === 'youtube-data' && result.chunks && result.chunks.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
              <Youtube size={14} /> Educational Assets
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.chunks.map((chunk: any, i: number) => {
                const data = chunk.web || chunk;
                if (!data.uri || !data.uri.includes('youtu')) return null;
                const videoId = data.uri.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
                return (
                  <a key={i} href={data.uri} target="_blank" rel="noreferrer" className="group bg-gray-900 border border-gray-800 overflow-hidden rounded-2xl hover:border-red-500/50 transition-all flex flex-col">
                    {videoId && (
                      <div className="aspect-video relative overflow-hidden">
                        <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={24} className="text-white fill-current" />
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <h5 className="text-xs font-bold text-white line-clamp-2 mb-1">{data.title || "YouTube Lesson"}</h5>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 space-y-6 md:space-y-8 animate-fadeIn overflow-hidden">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-white flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl">
              <Globe size={32} className="text-white" />
            </div>
            Direct API Access
          </h2>
          <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            Studio Tooling Hub
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">

        {/* Left: Tool Selection - Re-styled for Desktop Hub */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto custom-scrollbar pb-2 lg:pb-0">
          {installedPlugins.length === 0 ? (
            <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-8 text-center text-gray-500 w-full flex flex-col items-center justify-center border-dashed">
              <p className="text-sm font-bold uppercase tracking-widest">No Plugins Active</p>
              <p className="text-[10px] mt-2">Manage your plugins in the sidebar.</p>
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
                className={`flex-shrink-0 flex items-center gap-4 p-5 rounded-3xl border transition-all text-left relative overflow-hidden group
                   ${activeTool === plugin.id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-600/20'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-800/50'}`}
              >
                <div className={`p-3 rounded-2xl ${activeTool === plugin.id ? 'bg-white/20' : 'bg-gray-950 border border-gray-800'}`}>
                  {plugin.icon === 'search' && <Search size={20} />}
                  {plugin.icon === 'map' && <Map size={20} />}
                  {plugin.icon === 'youtube' && <Youtube size={20} />}
                  {plugin.icon === 'code' && <Code size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest mb-0.5">{plugin.name}</h3>
                  <p className={`text-[10px] line-clamp-1 ${activeTool === plugin.id ? 'text-indigo-200' : 'text-gray-600'}`}>
                    {plugin.id === 'google-search' && "Deep web grounding"}
                    {plugin.id === 'google-maps' && "Place & venue data"}
                    {plugin.id === 'youtube-data' && "Video asset search"}
                    {plugin.id === 'python-core' && "Code sandbox"}
                  </p>
                </div>
                {activeTool === plugin.id && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-3xl flex items-center justify-center">
                    <Check size={14} />
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Right: Workspace */}
        <div className="lg:col-span-9 bg-gray-900/20 rounded-[2.5rem] border border-gray-800 flex flex-col shadow-2xl min-h-[400px] lg:min-h-0 overflow-hidden backdrop-blur-3xl">
          {!activeTool ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 p-12 text-center">
              <Globe size={64} className="mb-6" />
              <p className="text-xl font-black uppercase tracking-[0.4em]">Initialize Studio Tool</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 relative">
              {/* Header Context Indicator */}
              <div className="p-6 md:p-8 border-b border-gray-800 flex items-center justify-between bg-gray-900/40">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                    {activeTool === 'google-search' && <Globe size={24} />}
                    {activeTool === 'google-maps' && <Navigation size={24} />}
                    {activeTool === 'youtube-data' && <Youtube size={24} />}
                    {activeTool === 'python-core' && <Terminal size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">
                      {activeTool.replace('-', ' ')}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Gemini 3.0 Real-time Instance</p>
                  </div>
                </div>
                <button onClick={() => { setResult(null); setQuery(''); }} className="text-[10px] text-gray-500 hover:text-white font-black uppercase tracking-widest">Clear Space</button>
              </div>

              {/* Workspace Output Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
                    <div className="relative">
                      <div className="w-24 h-24 border-2 border-indigo-500/10 rounded-full animate-ping" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={40} className="animate-spin text-indigo-500" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-white uppercase tracking-widest">Processing Query...</p>
                      <p className="text-xs text-gray-600 mt-2 italic">Accessing external APIs via Gemini Grounding</p>
                    </div>
                  </div>
                ) : result ? (
                  renderResult()
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-30">
                    <Zap size={48} className="text-indigo-500 mb-6" />
                    <h4 className="text-xl font-black uppercase tracking-widest mb-2">Ready for Command</h4>
                    <p className="text-xs max-w-xs leading-relaxed">Input your query below to leverage live web grounding and advanced reasoning tools.</p>
                  </div>
                )}
              </div>

              {/* Command Input Area */}
              <div className="p-6 md:p-8 bg-gray-950/80 border-t border-gray-800 backdrop-blur-md">
                <div className="relative flex items-center gap-4 max-w-5xl mx-auto">
                  {activeTool === 'python-core' ? (
                    <div className="w-full relative group">
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="# Write your Python code here..."
                        className="w-full h-32 bg-gray-900/50 border border-gray-800 rounded-3xl px-6 py-5 text-sm md:text-base text-emerald-400 font-mono focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all group-hover:bg-gray-900"
                      />
                    </div>
                  ) : (
                    <div className="w-full relative group">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                        placeholder={
                          activeTool === 'google-maps' ? "Find local landmarks, coffee shops, or directions..." :
                            activeTool === 'youtube-data' ? "Find lectures, tutorials, or documentaries..." :
                              "Ask anything that requires live web research..."
                        }
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-full px-8 py-5 text-sm md:text-lg text-white placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 outline-none transition-all group-hover:bg-gray-900 shadow-2xl"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleRun}
                    disabled={isLoading || !query}
                    className={`p-5 rounded-full shadow-2xl active:scale-95 transition-all flex items-center justify-center shrink-0
                          ${isLoading || !query ? 'bg-gray-800 text-gray-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'}`}
                  >
                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
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

const Check = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default PluginHub;
