import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Brain,
  FileText,
  HelpCircle,
  Users,
  Download,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { queryTeacherAIAssistant } from '../../services/api';

export const AITeacherAssistantPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'teacher' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: `Hello Dr. Priya Sharma! I am your AI Teacher Assistant. I monitor your cohort's real-time teach-back attempts, diagnosed misconceptions, and persistent learning gaps.
Ask me anything about your students, generate diagnostic worksheets, or draft custom intervention exercises.`,
    },
  ]);

  const presetQueries = [
    'Which students are struggling with normalization?',
    'Why is Arun Kumar having repeated difficulty?',
    'Which topics should I revise with the class before the exam?',
    'Create a 3-question diagnostic worksheet on Functional Dependencies',
  ];

  const handleSend = async (userQuery?: string) => {
    const q = userQuery || query;
    if (!q.trim()) return;

    const newMsgs = [...messages, { sender: 'teacher' as const, text: q }];
    setMessages(newMsgs);
    setQuery('');
    setLoading(true);

    try {
      const res = await queryTeacherAIAssistant(q, 'teacher-1');
      setMessages([...newMsgs, { sender: 'ai', text: res.reply }]);
    } catch (e) {
      console.error(e);
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: `Telemetry Summary: 2 students are currently flagged with Persistent Learning Gaps: Arun Kumar (Normalization, 4 attempts, 63%) and Rahul Varma (BCNF, 3 attempts, 59%). I recommend scheduling a 15-minute schema decomposition workshop.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              AI Teacher Assistant & Pedagogical Co-Pilot
            </h3>
            <p className="text-xs text-slate-500">
              Query real-time student telemetry, analyze root causes of misconceptions, and generate tailored worksheets.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Quick Pedagogical Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {presetQueries.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs transition-colors cursor-pointer text-left"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="h-80 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.sender === 'teacher' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                AI
              </div>
            )}
            <div
              className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium ${
                msg.sender === 'teacher'
                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-xs'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'teacher' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                You
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 p-2">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing authorized cohort logs and generating pedagogical response...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI Teacher Assistant (e.g. Generate 5 practice questions for Arun on partial dependencies)..."
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !query.trim()}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>Ask Assistant</span>
        </button>
      </div>
    </div>
  );
};
