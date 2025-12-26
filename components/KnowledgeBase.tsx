
import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeDocument, NotebookGuide, ChatMessage } from '../types';
import { generateNotebookGuide, chatWithNotebook, generateAudioOverview } from '../services/geminiService';
import {
  Database, Plus, Trash2, FileText, Loader2, Cpu, Globe, Server,
  BookOpen, MessageSquare, Headphones, Sparkles, Send, Info,
  CheckCircle2, ChevronRight, Play, Pause, Download
} from 'lucide-react';

interface Props {
  documents: KnowledgeDocument[];
  onAddDocument: (doc: KnowledgeDocument) => void;
  onRemoveDocument: (id: string) => void;
  initialSource?: { title: string; content: string } | null;
  onClearInitial?: () => void;
}

const KnowledgeBase: React.FC<Props> = ({ documents, onAddDocument, onRemoveDocument, initialSource, onClearInitial }) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'chat' | 'guide'>('sources');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedDocIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const [guide, setGuide] = useState<NotebookGuide | null>(null);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (initialSource) {
      setTitle(initialSource.title);
      setContent(initialSource.content);
      setActiveTab('sources');
      if (onClearInitial) onClearInitial();
    }
  }, [initialSource]);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsVectorizing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newDoc: KnowledgeDocument = {
      id: Math.random().toString(36).substring(7),
      title,
      content,
      timestamp: Date.now(),
    };
    onAddDocument(newDoc);
    setTitle('');
    setContent('');
    setIsVectorizing(false);
  };

  const handleGenerateGuide = async () => {
    if (documents.length === 0) return;
    setIsGeneratingGuide(true);
    try {
      const result = await generateNotebookGuide(documents);
      setGuide(result);
      setActiveTab('guide');
    } catch (e) {
      alert("Guide generation failed.");
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleChat = async () => {
    const activeDocs = selectedDocIds.size > 0
      ? documents.filter(d => selectedDocIds.has(d.id))
      : documents;

    if (!userQuery.trim() || activeDocs.length === 0) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userQuery, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setUserQuery('');
    setIsChatting(true);

    try {
      const response = await chatWithNotebook(userQuery, activeDocs, chatHistory);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        sources: response.sources
      };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (e) {
      alert("Chat failed.");
    } finally {
      setIsChatting(false);
    }
  };

  const handleAudioOverview = async () => {
    if (documents.length === 0) return;
    setIsGeneratingAudio(true);
    try {
      const base64 = await generateAudioOverview(documents);
      setAudioBase64(base64);
    } catch (e) {
      alert("Audio generation failed.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const playAudio = async () => {
    if (!audioBase64) return;
    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = ctx;
      const binaryString = atob(audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-4 md:space-y-6 animate-fadeIn overflow-y-auto lg:overflow-hidden">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-900/20">
              <Database size={24} className="text-white" />
            </div>
            Research Hub
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1 flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" />
            Source-grounded intelligence.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-800">
          <TabButton active={activeTab === 'sources'} onClick={() => setActiveTab('sources')} icon={<FileText size={16} />} label="Sources" />
          <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={16} />} label="Chat" />
          <TabButton active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} icon={<BookOpen size={16} />} label="Guide" />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6 overflow-visible lg:overflow-y-auto custom-scrollbar">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 shadow-xl">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Plus size={14} /> New Source
            </h3>
            <div className="space-y-3">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-xs md:text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" className="w-full h-32 md:h-40 bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-xs md:text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none resize-none" />
              <button onClick={handleAdd} disabled={!title || !content || isVectorizing} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                {isVectorizing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Add Document
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden group">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Headphones size={18} className="text-indigo-400" /> Audio Overview
            </h3>
            <p className="text-[10px] text-indigo-200/50 mb-4 leading-relaxed">Podcast generation from your documents.</p>

            {audioBase64 ? (
              <button onClick={playAudio} className="w-full bg-indigo-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs">
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                {isPlaying ? 'Playing...' : 'Play Podcast'}
              </button>
            ) : (
              <button onClick={handleAudioOverview} disabled={isGeneratingAudio || documents.length === 0} className="w-full bg-white/10 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs disabled:opacity-30">
                {isGeneratingAudio ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generate
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-9 bg-gray-900/40 rounded-2xl border border-gray-800 flex flex-col shadow-2xl min-h-[400px] lg:min-h-0 overflow-hidden relative">
          {activeTab === 'sources' && (
            <div className="flex-1 flex flex-col p-4 md:p-6 min-h-0">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h3 className="text-xl md:text-2xl font-black text-white">
                  Sources ({documents.length})
                  {selectedDocIds.size > 0 && <span className="text-xs md:text-sm font-bold text-indigo-400 ml-3 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">{selectedDocIds.size} Chat Active</span>}
                </h3>
                <button onClick={handleGenerateGuide} disabled={isGeneratingGuide || documents.length === 0} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-30">
                  {isGeneratingGuide ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
                  Synthesize Guide
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {documents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-12">
                    <FileText size={48} className="mb-4" />
                    <p className="text-lg italic">No sources added.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.map(doc => (
                      <div key={doc.id} className={`bg-gray-950 border rounded-xl p-4 flex flex-col transition-all ${selectedDocIds.has(doc.id) ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'border-gray-800 hover:border-emerald-500/30'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <input
                              type="checkbox"
                              checked={selectedDocIds.has(doc.id)}
                              onChange={() => toggleSelection(doc.id)}
                              className="w-4 h-4 rounded border-gray-700 bg-gray-900/50 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <h4 className={`font-bold text-sm truncate cursor-pointer select-none ${selectedDocIds.has(doc.id) ? 'text-indigo-300' : 'text-white'}`} onClick={() => toggleSelection(doc.id)}>{doc.title}</h4>
                          </div>
                          <button onClick={() => onRemoveDocument(doc.id)} className="text-gray-600 hover:text-red-500 transition-colors shrink-0 ml-2">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">{doc.content}</p>
                        <div className="mt-auto pt-2 border-t border-gray-900 flex items-center justify-between text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                          <span>{new Date(doc.timestamp).toLocaleDateString()}</span>
                          <span className="text-emerald-500/60">Grounded</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <MessageSquare size={48} className="mb-4" />
                    <p className="text-lg">Ask about your documents.</p>
                  </div>
                ) : (
                  chatHistory.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-950 border border-gray-800 text-gray-200 rounded-tl-none'}`}>
                        <div className="text-xs md:text-sm leading-relaxed">{msg.text}</div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-800/50 flex flex-wrap gap-1.5">
                            {msg.sources.map(s => <span key={s} className="text-[8px] bg-gray-900 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/10">Source: {s}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-gray-950 border border-gray-800 rounded-2xl rounded-tl-none p-4 text-gray-500 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-[10px] uppercase tracking-widest">Consulting...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-950/50 border-t border-gray-800">
                <div className="relative flex items-center gap-2">
                  <input type="text" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChat()} placeholder="Ask a question..." className="flex-1 bg-gray-900 border border-gray-800 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                  <button onClick={handleChat} className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg transition-all active:scale-90">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar space-y-8 md:space-y-12">
              {!guide ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-12">
                  <BookOpen size={48} className="mb-4" />
                  <p className="text-lg">Notebook guide not generated.</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-8 md:space-y-12 pb-12">
                  <section>
                    <h3 className="text-xl md:text-2xl font-black text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-indigo-500 rounded-full" /> Summary
                    </h3>
                    <p className="text-sm md:text-lg text-gray-400 leading-relaxed font-light">{guide.summary}</p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section>
                      <h4 className="text-sm font-bold text-white mb-4 border-b border-gray-800 pb-1 uppercase tracking-widest">Key Terms</h4>
                      <div className="space-y-3">
                        {guide.keyTerms.map(kt => (
                          <div key={kt.term} className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                            <div className="font-bold text-indigo-400 text-xs mb-1">{kt.term}</div>
                            <div className="text-[10px] text-gray-500 leading-relaxed">{kt.definition}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section>
                      <h4 className="text-sm font-bold text-white mb-4 border-b border-gray-800 pb-1 uppercase tracking-widest">FAQs</h4>
                      <div className="space-y-3">
                        {guide.faqs.map(faq => (
                          <div key={faq.question} className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                            <div className="font-bold text-emerald-400 text-xs mb-1">? {faq.question}</div>
                            <div className="text-[10px] text-gray-400 leading-relaxed">{faq.answer}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <section className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                      <Info size={18} className="text-indigo-400" /> Study Guide
                    </h3>
                    <div className="text-xs md:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{guide.studyGuide}</div>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-lg font-bold transition-all text-[10px] md:text-sm ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
    {icon}
    <span>{label}</span>
  </button>
);

export default KnowledgeBase;
