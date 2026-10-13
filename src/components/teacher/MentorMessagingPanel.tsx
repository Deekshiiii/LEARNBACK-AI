import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lightbulb,
  Heart,
  ChevronRight,
  RefreshCw,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { DirectMentorMessage, User } from '../../types';
import { fetchDirectMessages, sendDirectMessage } from '../../services/api';

interface MentorMessagingPanelProps {
  teacher: User;
  students: any[];
  preselectedStudentId?: string | null;
  onOpenStudentDeepDive?: (studentId: string) => void;
}

export const MentorMessagingPanel: React.FC<MentorMessagingPanelProps> = ({
  teacher,
  students,
  preselectedStudentId,
  onOpenStudentDeepDive,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudentId || (students[0]?.id || 'student-1')
  );
  const [messages, setMessages] = useState<DirectMentorMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>('');
  const [messageType, setMessageType] = useState<'ENCOURAGEMENT' | 'FEEDBACK' | 'QUESTION' | 'CLARIFICATION'>('ENCOURAGEMENT');
  const [conceptTag, setConceptTag] = useState<string>('Normalization');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync if preselectedStudentId changes
  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  const loadMessages = async () => {
    if (!selectedStudentId) return;
    try {
      const data = await fetchDirectMessages(selectedStudentId);
      setMessages(data);
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadMessages();
    // Real-time polling every 4 seconds
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedStudentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      const result = await sendDirectMessage({
        senderId: teacher.id,
        senderName: teacher.name,
        senderRole: 'teacher',
        recipientId: selectedStudentId,
        recipientName: selectedStudent?.name || 'Student',
        text: messageText.trim(),
        conceptTag: conceptTag || undefined,
        type: messageType,
      });

      setMessages(prev => [...prev, result.message]);
      setMessageText('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSelectPreset = (text: string, type: 'ENCOURAGEMENT' | 'FEEDBACK' | 'QUESTION' | 'CLARIFICATION', tag?: string) => {
    setMessageText(text);
    setMessageType(type);
    if (tag) setConceptTag(tag);
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.grade && s.grade.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col lg:flex-row min-h-[640px]">
      {/* Student List Sidebar */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Cohort Students</span>
            </h3>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
              {students.length} Enrolled
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Student Cards List */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[260px] lg:max-h-[560px]">
          {filteredStudents.map(student => {
            const isSelected = student.id === selectedStudentId;
            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full p-4 text-left transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                    : 'hover:bg-slate-100/60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {student.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {student.name}
                    </h4>
                    {student.status === 'INTERVENTION_REQUIRED' ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Intervention Required" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="On Track" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {student.grade || 'Grade 12'} • Level {student.level || 4}
                  </p>

                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-slate-400">
                      Mastery: <strong className="text-slate-700">{student.overallMasteryScore || 65}%</strong>
                    </span>
                    {student.activeAlertConcept && (
                      <span className="text-rose-600 font-bold truncate max-w-[90px]">
                        {student.activeAlertConcept}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Messaging Pane */}
      <div className="flex-1 flex flex-col justify-between bg-white">
        {/* Active Conversation Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              {selectedStudent?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedStudent?.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800">
                  Direct Mentor Channel
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{selectedStudent?.grade || 'Grade 12 CS'}</span>
                <span>•</span>
                <span>Assigned Faculty: <strong>{teacher.name}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadMessages}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {onOpenStudentDeepDive && (
              <button
                onClick={() => onOpenStudentDeepDive(selectedStudentId)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Student Deep Dive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Message Thread History */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 max-h-[380px] bg-slate-50/20">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              Loading conversation with {selectedStudent?.name}...
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                No direct messages yet with {selectedStudent?.name}
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Send personalized words of encouragement, highlight recent teach-back achievements, or clarify misconceptions below.
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isTeacher = msg.senderRole === 'teacher';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-slate-400">
                    <span>{isTeacher ? 'You (Mentor)' : msg.senderName}</span>
                    <span>•</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.type && (
                      <span
                        className={`ml-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                          msg.type === 'ENCOURAGEMENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : msg.type === 'FEEDBACK'
                            ? 'bg-indigo-100 text-indigo-800'
                            : msg.type === 'QUESTION'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {msg.type}
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-xs leading-relaxed shadow-xs space-y-1.5 ${
                      isTeacher
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.conceptTag && (
                      <div
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider inline-block px-2 py-0.5 rounded-md ${
                          isTeacher ? 'bg-indigo-500/40 text-indigo-100' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Concept: {msg.conceptTag}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick Presets:
            </span>

            <button
              type="button"
              onClick={() =>
                handleSelectPreset(
                  `Great work on your recent teach-back session! Your grasp of key principles is noticeably improving. Keep it up!`,
                  'ENCOURAGEMENT',
                  'General'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-[11px] font-medium transition-all shrink-0 cursor-pointer"
            >
              🌟 Inspiring Praise
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelectPreset(
                  `Remember: In 3NF, every non-prime attribute must depend directly on candidate keys with no transitive dependencies. Try verbalizing this in Teach-Back Studio!`,
                  'FEEDBACK',
                  'Normalization'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-[11px] font-medium transition-all shrink-0 cursor-pointer"
            >
              🎯 3NF Rule Clarification
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelectPreset(
                  `I noticed some hesitation on composite candidate keys. I've scheduled a quick 1-on-1 clinic tomorrow to walk through schema decomposition examples.`,
                  'FEEDBACK',
                  'Functional Dependency'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-[11px] font-medium transition-all shrink-0 cursor-pointer"
            >
              📅 1-on-1 Clinic Invite
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelectPreset(
                  `Would you like to try explaining Binary Search Trees aloud again today to unlock the Tree Virtuoso badge?`,
                  'QUESTION',
                  'Binary Search Trees'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-700 text-[11px] font-medium transition-all shrink-0 cursor-pointer"
            >
              🏅 Badge Challenge Prompt
            </button>
          </div>
        </div>

        {/* Message Composer */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white space-y-3">
          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Tone/Category:</span>
              <select
                value={messageType}
                onChange={e => setMessageType(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ENCOURAGEMENT">🌟 Encouragement</option>
                <option value="FEEDBACK">🎯 Targeted Feedback</option>
                <option value="QUESTION">❓ Question / Inquiry</option>
                <option value="CLARIFICATION">💡 Clarification</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Tag Concept:</span>
              <select
                value={conceptTag}
                onChange={e => setConceptTag(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Normalization">Normalization</option>
                <option value="Functional Dependency">Functional Dependency</option>
                <option value="Primary Key">Primary Key</option>
                <option value="BCNF">BCNF</option>
                <option value="Binary Search Trees">Binary Search Trees</option>
                <option value="General Study Habit">General Study Habit</option>
              </select>
            </div>
          </div>

          {/* Text input and send */}
          <div className="flex items-end gap-2">
            <textarea
              rows={2}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder={`Write personalized feedback or encouragement for ${selectedStudent?.name}...`}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />

            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>{sending ? 'Sending...' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
