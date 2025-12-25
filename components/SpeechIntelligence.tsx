
import React, { useState, useRef } from 'react';
import { transcribeAudio, processSpeechIntelligence } from '../services/geminiService';
import { KnowledgeDocument, Plugin } from '../types';
import { Mic, Square, BrainCircuit, Globe, Languages, FileText, Loader2, Database, CheckCircle2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

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
    const title = `Speech Summary - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    onExportToKB(title, summary);
  };

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 p-4 md:p-6 animate-fadeIn overflow-y-auto lg:overflow-hidden">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-indigo-500" />
            Speech Intel
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Dual-Source RAG Synthesis.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 p-3 md:p-4 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={18} />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-0">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 md:p-6 flex flex-col space-y-4 shadow-xl overflow-hidden">
          <div className="bg-gray-950 rounded-xl p-4 md:p-6 flex flex-col items-center justify-center border border-gray-800 min-h-[180px] md:min-h-[220px] relative">
            {processingStep === 'recording' ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping"></span>
                  <button onClick={stopRecording} className="relative bg-red-600 text-white w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                    <Square size={24} className="fill-current" />
                  </button>
                </div>
                <p className="text-red-500 mt-4 text-[10px] font-bold tracking-widest animate-pulse">RECORDING...</p>
              </div>
            ) : (
               <div className="flex flex-col items-center">
                  <button 
                    onClick={startRecording}
                    disabled={processingStep === 'transcribing' || processingStep === 'analyzing'}
                    className="bg-indigo-600 text-white w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <Mic size={24} />
                  </button>
                  <p className="text-gray-500 mt-4 text-[10px] uppercase font-bold tracking-wider">Tap to Speak</p>
               </div>
            )}
            
            {(processingStep === 'transcribing' || processingStep === 'analyzing') && (
              <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  {processingStep === 'transcribing' ? 'Transcribing...' : 'Analyzing...'}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[120px] flex flex-col bg-gray-950 rounded-xl border border-gray-800 p-4 overflow-hidden">
             <h4 className="text-[10px] font-bold text-gray-500 mb-2 flex items-center gap-2 uppercase tracking-widest">
               <FileText size={14} /> Transcript
             </h4>
             <div className="flex-1 overflow-y-auto text-gray-300 text-xs md:text-sm italic custom-scrollbar">
               {transcript || <span className="text-gray-800">Transcript will appear here...</span>}
             </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 md:p-6 lg:col-span-2 flex flex-col space-y-4 md:space-y-6 shadow-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-950 p-4 rounded-2xl border border-gray-800">
             <div className="flex-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                   <Database size={18} className="text-indigo-400" /> NotebookLM
                </h4>
                <p className="text-[10px] text-gray-500 mt-1">Export summary to Knowledge Base.</p>
             </div>
             <button 
                onClick={handleSyncToKnowledgeBase}
                disabled={!summary || processingStep !== 'complete'}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-30 transition-all"
             >
                <Sparkles size={14} /> Export <ArrowRight size={14} />
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto md:overflow-hidden pr-1">
            <div className="bg-gray-950 rounded-xl border border-gray-800 p-4 flex flex-col h-48 md:h-auto overflow-hidden">
               <h3 className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase mb-3">
                 <Globe size={14} /> English Translation
               </h3>
               <div className="flex-1 overflow-y-auto text-gray-400 text-xs leading-relaxed custom-scrollbar">
                 {translation || <span className="text-gray-800">...</span>}
               </div>
            </div>

            <div className="bg-gray-950 rounded-xl border border-gray-800 p-4 flex flex-col relative h-64 md:h-auto overflow-hidden">
               {ragUsed && (
                 <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-400 text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase">Hybrid Active</div>
               )}
               <h3 className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase mb-3">
                 <Languages size={14} /> Hybrid Summary
               </h3>
               <div className="flex-1 overflow-y-auto text-gray-200 text-xs md:text-sm leading-relaxed custom-scrollbar prose prose-invert prose-xs">
                 {summary || <span className="text-gray-800 italic">Generate a summary...</span>}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechIntelligence;
