
import React, { useState, useRef } from 'react';
import { transcribeAudio, processSpeechIntelligence } from '../services/geminiService';
import { KnowledgeDocument, Plugin } from '../types';
import { Mic, Square, BrainCircuit, Globe, Languages, FileText, Loader2, Database, Sparkles, AlertCircle, ArrowRight, NotebookTabs } from 'lucide-react';

interface Props {
  knowledgeBase: KnowledgeDocument[];
  plugins: Plugin[];
  onExportToKB: (title: string, content: string) => void;
}

const SpeechIntelligence: React.FC<Props> = ({ knowledgeBase, plugins, onExportToKB }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [processingStep, setProcessingStep] = useState<'idle' | 'recording' | 'transcribing' | 'analyzing' | 'complete'>('idle');
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [summary, setSummary] = useState('');
  const [ragUsed, setRagUsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleAudioProcess(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setProcessingStep('recording');
      setError(null);

      setTranscript('');
      setTranslation('');
      setSummary('');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleAudioProcess = async (audioBlob: Blob) => {
    setProcessingStep('transcribing');
    try {
      const base64Url = await blobToBase64(audioBlob);
      const base64Data = base64Url.split(',')[1];

      const transcriptText = await transcribeAudio(base64Data, audioBlob.type);
      setTranscript(transcriptText);

      if (!transcriptText || transcriptText.trim().length === 0) {
        throw new Error("No speech detected.");
      }

      setProcessingStep('analyzing');
      const kbContents = knowledgeBase.map(doc => doc.content);
      const activePluginIds = plugins.filter(p => p.installed).map(p => p.id);

      const analysis = await processSpeechIntelligence(transcriptText, kbContents, activePluginIds);

      setTranslation(analysis.translation || "Unavailable.");
      if (analysis.originalTranscript) {
        setTranscript(analysis.originalTranscript);
      }
      setSummary(analysis.summary || "Failed.");
      setRagUsed(analysis.ragUsed || false);
      setProcessingStep('complete');

    } catch (error: any) {
      console.error("Processing failed", error);
      setError(error.message || "Failed to process.");
      setProcessingStep('idle');
    }
  };

  const handleSyncToKnowledgeBase = () => {
    if (!summary) return;
    const title = `Deep Research Summary - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    onExportToKB(title, summary);
  };

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 p-4 md:p-6 animate-fadeIn overflow-y-auto lg:overflow-hidden">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white flex items-center gap-3">
            <BrainCircuit className="w-10 h-10 text-indigo-500" />
            Speech Intel
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-wide mt-1">Dual-Source RAG Synthesis.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Recording and Transcript */}
        <div className="lg:col-span-4 flex flex-col space-y-6 min-h-[500px] lg:min-h-0">
          {/* Recording Box */}
          <div className="bg-gray-900/40 rounded-3xl border border-gray-800 p-8 flex flex-col items-center justify-center relative overflow-hidden flex-1 group shadow-2xl">
            {processingStep === 'recording' ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <span className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping"></span>
                  <button onClick={stopRecording} className="relative bg-red-600 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                    <Square size={32} className="fill-current" />
                  </button>
                </div>
                <p className="text-red-500 text-xs font-black tracking-[0.2em] animate-pulse">RECORDING...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <button
                  onClick={startRecording}
                  disabled={processingStep === 'transcribing' || processingStep === 'analyzing'}
                  className={`bg-indigo-600 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50 hover:bg-indigo-500 hover:shadow-indigo-500/20
                      ${(processingStep === 'transcribing' || processingStep === 'analyzing') ? 'animate-pulse' : ''}`}
                >
                  <Mic size={32} />
                </button>
                <p className="text-gray-500 mt-6 text-xs uppercase font-black tracking-widest group-hover:text-gray-400 transition-colors">Tap to Speak</p>
              </div>
            )}

            {(processingStep === 'transcribing' || processingStep === 'analyzing') && (
              <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">
                  {processingStep === 'transcribing' ? 'Transcribing...' : 'Analyzing...'}
                </span>
              </div>
            )}
          </div>

          {/* Transcript Box */}
          <div className="bg-gray-900/40 rounded-3xl border border-gray-800 p-8 flex flex-col h-[300px] shadow-2xl">
            <h4 className="text-[10px] font-black text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
              <FileText size={16} className="text-gray-600" /> Transcript
            </h4>
            <div className="flex-1 overflow-y-auto text-gray-400 text-sm italic font-light leading-relaxed custom-scrollbar">
              {transcript || <span className="text-gray-800">Transcript will appear here...</span>}
            </div>
          </div>
        </div>

        {/* Right Column: NotebookLM Style Results */}
        <div className="lg:col-span-8 bg-gray-900/40 rounded-3xl border border-gray-800 flex flex-col shadow-2xl overflow-hidden min-h-[500px] lg:min-h-0">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-8 border-b border-gray-800 bg-gray-900/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-950 border border-gray-800 rounded-2xl text-indigo-400">
                <Database size={24} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white tracking-tight">NotebookLM</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Export summary to Knowledge Base.</p>
              </div>
            </div>
            <button
              onClick={handleSyncToKnowledgeBase}
              disabled={!summary || processingStep !== 'complete'}
              className="flex items-center justify-center gap-3 px-8 py-3 rounded-xl bg-indigo-600/10 border border-indigo-600/50 hover:bg-indigo-600/20 text-indigo-400 font-black text-xs uppercase tracking-widest disabled:opacity-20 transition-all group"
            >
              <Sparkles size={14} className="group-hover:rotate-12 transition-transform" /> Export <ArrowRight size={14} />
            </button>
          </div>

          {/* Result Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-800 flex-1 min-h-0">
            {/* Translation Panel */}
            <div className="bg-gray-950 p-8 flex flex-col overflow-hidden">
              <h3 className="flex items-center gap-3 text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
                <Globe size={14} /> English Translation
              </h3>
              <div className="flex-1 overflow-y-auto text-gray-300 text-sm leading-relaxed custom-scrollbar font-serif italic whitespace-pre-wrap tracking-wide opacity-90">
                {translation || <span className="text-gray-800 not-italic opacity-30 font-sans">Translation will appear here...</span>}
              </div>
            </div>

            {/* Summary Panel */}
            <div className="bg-gray-950 p-8 flex flex-col relative overflow-hidden border-l border-gray-800">
              {ragUsed && (
                <div className="absolute top-8 right-8 bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">Hybrid Active</div>
              )}
              <h3 className="flex items-center gap-3 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
                <Languages size={14} /> Hybrid Summary
              </h3>
              <div className="flex-1 overflow-y-auto text-gray-300 text-sm leading-relaxed custom-scrollbar prose prose-invert prose-sm max-w-none">
                {summary || <span className="text-gray-900 opacity-30 italic">Generate a summary...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechIntelligence;
