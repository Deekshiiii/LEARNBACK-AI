import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Zap,
  ChevronRight,
  Layers,
  FileCheck,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { Concept, SupportedLanguage } from '../../types';
import { requestExplanation, synthesizeVoiceSpeech } from '../../services/api';

interface VoiceAITutorProps {
  concept: Concept;
  onProceedToTeachBack: () => void;
}

export const VoiceAITutor: React.FC<VoiceAITutorProps> = ({
  concept,
  onProceedToTeachBack,
}) => {
  const [mode, setMode] = useState<'beginner' | 'advanced'>('beginner');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [loading, setLoading] = useState(false);
  const [explanationData, setExplanationData] = useState<{
    explanation: string;
    analogy?: string;
    definitions?: string[];
    corePoints?: string[];
    groundedSource?: string;
  } | null>(null);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [audioSource, setAudioSource] = useState<'gemini-tts' | 'browser-speech' | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
  ];

  // Fetch explanation when concept, mode, or language changes
  const loadExplanation = async (simpler = false, advancedMore = false) => {
    setLoading(true);
    stopAudio();
    try {
      const data = await requestExplanation({
        conceptId: concept.id,
        mode,
        simpler,
        advancedMore,
        language,
      });
      setExplanationData(data);
    } catch (err) {
      console.error(err);
      setExplanationData({
        explanation: mode === 'advanced' ? concept.advancedExplanation : concept.beginnerExplanation,
        analogy: mode === 'beginner' ? 'Like separating student details from library loan receipts into clean folders.' : undefined,
        definitions: concept.keyDefinitions,
        corePoints: concept.corePoints,
        groundedSource: 'DBMS_Normalization_Master_Chapter.pdf (Unit 3)',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExplanation();
  }, [concept.id, mode, language]);

  // Handle Voice Playback
  const handlePlayVoice = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    if (!explanationData?.explanation) return;

    setIsPlaying(true);

    try {
      // First try backend Gemini TTS
      const res = await synthesizeVoiceSpeech(explanationData.explanation);
      if (res.audioBase64) {
        setAudioSource('gemini-tts');
        const audioBlob = new Blob(
          [Uint8Array.from(atob(res.audioBase64), c => c.charCodeAt(0))],
          { type: res.mimeType || 'audio/wav' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.playbackRate = playbackSpeed;
        audio.onended = () => {
          setIsPlaying(false);
        };
        audio.onerror = () => {
          fallbackBrowserSpeech(explanationData.explanation);
        };
        audioRef.current = audio;
        audio.play();
        return;
      }
    } catch (e) {
      console.warn('Gemini TTS failed, using browser speech:', e);
    }

    // Fallback to browser SpeechSynthesis
    fallbackBrowserSpeech(explanationData.explanation);
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      setIsPlaying(false);
      return;
    }

    setAudioSource('browser-speech');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-teal-100 text-teal-800">
              {concept.subject}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Chapter: {concept.chapter}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {concept.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {concept.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Language Selector (Feature #28) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
            <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Beginner vs Advanced Mode Switch */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setMode('beginner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                mode === 'beginner'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Beginner Mode</span>
            </button>

            <button
              onClick={() => setMode('advanced')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                mode === 'advanced'
                  ? 'bg-white text-indigo-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Advanced Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice AI Audio Player Card */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Play Button */}
            <button
              onClick={handlePlayVoice}
              disabled={loading}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg transition-transform transform hover:scale-105 active:scale-95 cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500 shadow-amber-500/30 animate-pulse'
                  : 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/30'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white ml-0.5" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  Voice AI Tutor
                </span>
                {isPlaying && (
                  <span className="flex items-center gap-1.5 text-xs text-amber-300 font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Speaking ({audioSource === 'gemini-tts' ? 'Gemini TTS' : 'Audio Speech'})</span>
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold mt-1 text-white">
                {isPlaying ? 'Listening to Voice Explanation' : 'Learn with Voice AI'}
              </h3>
              <p className="text-xs text-teal-200/80 mt-0.5">
                {mode === 'beginner'
                  ? 'Simple language, real-world analogies, step-by-step breakdown.'
                  : 'Technical schema terminology, formal guarantees, and exam tips.'}
              </p>
            </div>
          </div>

          {/* Audio Waveform visualization */}
          {isPlaying && (
            <div className="flex items-center gap-1 h-8 px-4 py-1 rounded-xl bg-white/10 backdrop-blur-sm">
              <span className="w-1 bg-teal-400 rounded-full audio-bar-1" />
              <span className="w-1 bg-cyan-300 rounded-full audio-bar-2" />
              <span className="w-1 bg-teal-200 rounded-full audio-bar-3" />
              <span className="w-1 bg-emerald-400 rounded-full audio-bar-4" />
              <span className="w-1 bg-teal-400 rounded-full audio-bar-5" />
            </div>
          )}

          {/* Audio Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handlePlayVoice()}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-teal-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              onClick={() => loadExplanation(true, false)}
              className="px-3 py-1.5 rounded-xl bg-teal-600/40 hover:bg-teal-600/60 text-xs font-bold text-teal-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simpler Explanation</span>
            </button>

            <button
              onClick={() => loadExplanation(false, true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/60 text-xs font-bold text-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Advanced Deep Dive</span>
            </button>

            {/* Playback speed toggle */}
            <button
              onClick={() => {
                const next = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
                setPlaybackSpeed(next);
                if (audioRef.current) audioRef.current.playbackRate = next;
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white transition-colors cursor-pointer"
              title="Playback speed"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>
      </div>

      {/* Grounded Explanation Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Text Content */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <h3 className="font-extrabold text-slate-900 text-lg">
                Concept Explanation ({mode === 'beginner' ? 'Beginner Friendly' : 'Advanced Relational Theory'})
              </h3>
            </div>
            {explanationData?.groundedSource && (
              <span className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60">
                <FileCheck className="w-3.5 h-3.5" />
                <span>RAG Grounded: {explanationData.groundedSource}</span>
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium">Retrieving textbook chunks and generating explanation...</p>
            </div>
          ) : (
            <>
              {/* Spoken Text */}
              <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                {explanationData?.explanation || (mode === 'advanced' ? concept.advancedExplanation : concept.beginnerExplanation)}
              </div>

              {/* Analogy Box */}
              {(explanationData?.analogy || mode === 'beginner') && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Real-World Analogy</span>
                  </div>
                  <p className="text-amber-900/90 leading-relaxed">
                    {explanationData?.analogy || 'Think of organizing separate notebooks for each subject instead of one giant messy notebook with duplicate information.'}
                  </p>
                </div>
              )}

              {/* Core Points */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Key Takeaways to Remember
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(explanationData?.corePoints || concept.corePoints).map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Proceed to Teach-Back Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Ready to demonstrate your understanding?
              </p>
              <p className="text-[11px] text-slate-500">
                Teach-Back is the core learning step. Explain the concept in your own voice!
              </p>
            </div>
            <button
              onClick={onProceedToTeachBack}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <span>Go to Teach-Back Studio</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Info: Definitions & Relationships */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Core Definitions</span>
            </h4>
            <div className="space-y-2 text-xs">
              {concept.keyDefinitions.map((def, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
                  {def}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Related Concepts</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {concept.relationships.map((rel, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium">
                  {rel}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
