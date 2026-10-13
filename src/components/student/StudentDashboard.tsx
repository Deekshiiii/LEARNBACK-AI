import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Mic,
  TrendingUp,
  Award,
  AlertTriangle,
  Flame,
  ShieldAlert,
  ArrowRight,
  FolderOpen,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Zap,
  BarChart2,
  Brain,
  GitCommit,
  HelpCircle,
  Calendar,
  Image as ImageIcon,
  Rocket,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Concept, DocumentSource, StudentConceptProgress, TeachBackAttempt, User, MentorAlert, DirectMentorMessage } from '../../types';
import { fetchStudentProgress, fetchConcepts, fetchDocuments, fetchDirectMessages, sendDirectMessage } from '../../services/api';
import { VoiceAITutor } from './VoiceAITutor';
import { TeachBackStudio } from './TeachBackStudio';
import { StudyMaterialUploader } from './StudyMaterialUploader';
import { PersonalLearningTwinView } from './PersonalLearningTwinView';
import { ConceptDependencyView } from './ConceptDependencyView';
import { PracticeQuizView } from './PracticeQuizView';
import { SmartRevisionView } from './SmartRevisionView';
import { AchievementsView } from './AchievementsView';
import { MultimodalDiagramView } from './MultimodalDiagramView';
import { MasteryBadgesCard } from './MasteryBadgesCard';

interface StudentDashboardProps {
  user: User;
  onSwitchToTeacher: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onSwitchToTeacher,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'learn'
    | 'teachback'
    | 'twin'
    | 'path'
    | 'practice'
    | 'revision'
    | 'achievements'
    | 'multimodal'
    | 'materials'
    | 'feedback'
  >('overview');

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [documents, setDocuments] = useState<DocumentSource[]>([]);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mentor Direct Messaging State
  const [messages, setMessages] = useState<DirectMentorMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const loadMentorMessages = async () => {
    try {
      const data = await fetchDirectMessages(user.id);
      setMessages(data);
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feedback') {
      setMessagesLoading(true);
      loadMentorMessages();
      const interval = setInterval(loadMentorMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, user.id]);

  const handleSendStudentReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await sendDirectMessage({
        senderId: user.id,
        senderName: user.name,
        senderRole: 'student',
        recipientId: user.assignedMentorId || 'teacher-1',
        recipientName: user.assignedMentorName || 'Dr. Priya Sharma',
        text: replyText.trim(),
        type: 'QUESTION',
      });
      setMessages(prev => [...prev, res.message]);
      setReplyText('');
    } catch (err: any) {
      console.error('Failed to send reply:', err);
      alert(err.message || 'Failed to send message');
    } finally {
      setSendingReply(false);
    }
  };

  const loadData = async () => {
    try {
      const [prog, concs, docs] = await Promise.all([
        fetchStudentProgress(user.id),
        fetchConcepts(),
        fetchDocuments(),
      ]);
      setProgressData(prog);
      setConcepts(concs);
      setDocuments(docs);
      if (concs.length > 0 && !selectedConcept) {
        setSelectedConcept(concs[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleSelectConcept = (concept: Concept, targetTab: 'learn' | 'teachback' = 'learn') => {
    setSelectedConcept(concept);
    setActiveTab(targetTab);
  };

  const handleLaunchConceptByTitle = (title: string, targetTab: 'learn' | 'teachback' = 'learn') => {
    const matched = concepts.find(c => c.title.toLowerCase().includes(title.toLowerCase())) || concepts[0];
    handleSelectConcept(matched, targetTab);
  };

  const handleTeachBackCompleted = (attempt: TeachBackAttempt, isPersistentGap: boolean, alert?: MentorAlert) => {
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading student learning telemetry...</p>
        </div>
      </div>
    );
  }

  const activeAlert = progressData?.activeAlerts?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-teal-50 text-teal-700 border border-teal-200/60">
              Student Dashboard
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {user.schoolName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {user.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-3">
            <span>Class: <strong>{user.grade || 'Grade 12 - CS'}</strong></span>
            <span>•</span>
            <span>Assigned Mentor: <strong className="text-teal-700">{user.assignedMentorName || 'Dr. Priya Sharma'}</strong></span>
          </p>
        </div>

        {/* Action button to switch to Teacher View */}
        <button
          onClick={onSwitchToTeacher}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <span>Open Faculty Mentor View</span>
          <ArrowRight className="w-4 h-4 text-indigo-600" />
        </button>
      </div>

      {/* PERSISTENT LEARNING GAP ALERT BANNER (If Active for Arun) */}
      {activeAlert && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white">
                ⚠ Persistent Learning Gap Active
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Struggling with {activeAlert.conceptTitle} ({activeAlert.attemptsCount} attempts, {activeAlert.latestScore}%)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Your mentor <strong>{user.assignedMentorName || 'Dr. Priya Sharma'}</strong> has been notified with your diagnosed misconceptions. Check the “Mentor Feedback” tab for notes!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('feedback')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              View Mentor Feedback
            </button>
            <button
              onClick={() => {
                const c = concepts.find(x => x.id === activeAlert.conceptId) || concepts[0];
                handleSelectConcept(c, 'teachback');
              }}
              className="px-4 py-2 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Retry Teach-Back
            </button>
          </div>
        </div>
      )}

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Overall Learning Progress */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Overall Progress
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-600">
              {progressData?.overallProgress || 82}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all"
              style={{ width: `${progressData?.overallProgress || 82}%` }}
            />
          </div>
        </div>

        {/* Card 2: Current Level (Feature #7) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Current Level
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
              LEVEL {progressData?.level || 4}
            </span>
          </div>
          <p className="text-[11px] text-indigo-600 font-extrabold uppercase mt-2">
            PROFICIENT ({progressData?.xp || 820} XP)
          </p>
        </div>

        {/* Card 3: Concepts Mastered */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Mastered
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {progressData?.conceptsMasteredCount || 2}
            </span>
            <span className="text-xs text-slate-400 font-medium">concepts</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-2 truncate">
            SQL Joins, Primary Key
          </p>
        </div>

        {/* Card 4: Learning Streak */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>Streak</span>
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {progressData?.learningStreakDays || 7}
            </span>
            <span className="text-xs text-slate-500 font-medium">Days</span>
          </div>
          <p className="text-[11px] text-orange-600 font-semibold mt-2">
            🔥 7 Day Streak
          </p>
        </div>

        {/* Card 5: Need Revision */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Need Revision
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {progressData?.pendingRemediationCount || 2}
            </span>
            <span className="text-xs text-slate-500 font-medium">concepts</span>
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-2">
            ⚠ 2 Need Revision
          </p>
        </div>

        {/* Card 6: Mentor Status */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Mentor Status
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
              {progressData?.interventions?.length > 0 ? 'Feedback Ready' : 'Active'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 truncate">
            {user.assignedMentorName || 'Dr. Priya Sharma'}
          </p>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('learn')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'learn'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>AI Tutor</span>
        </button>

        <button
          onClick={() => setActiveTab('teachback')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'teachback'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Teach-Back (Core)</span>
        </button>

        {/* Feature #15: Learning Twin */}
        <button
          onClick={() => setActiveTab('twin')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'twin'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Learning Twin</span>
        </button>

        {/* Feature #16 & #17: Dependency Graph & Path */}
        <button
          onClick={() => setActiveTab('path')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'path'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Prerequisites & Path</span>
        </button>

        {/* Feature #19: Practice Quizzes */}
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'practice'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Practice Quizzes</span>
        </button>

        {/* Feature #20: Smart Revision */}
        <button
          onClick={() => setActiveTab('revision')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'revision'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Smart Revision</span>
          <span className="w-2 h-2 rounded-full bg-amber-500" />
        </button>

        {/* Feature #7, 8, 9, 30: Achievements & Badges */}
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'achievements'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Achievements & XP</span>
        </button>

        {/* Feature #29: Multimodal Diagram */}
        <button
          onClick={() => setActiveTab('multimodal')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'multimodal'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Diagram Analyzer</span>
        </button>

        {/* Materials */}
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'materials'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Study Materials</span>
        </button>

        {/* Feedback */}
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Mentor Feedback</span>
          {progressData?.interventions?.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Concept Launcher */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Continue Learning
                </h3>
                <p className="text-xs text-slate-500">
                  Select any syllabus concept to begin Voice AI learning or submit your Teach-Back.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {concepts.map(concept => {
                const prog = progressData?.conceptProgress?.find((p: any) => p.conceptId === concept.id);
                return (
                  <div
                    key={concept.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/20 transition-all flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                          {concept.category}
                        </span>
                        {prog?.masteryStatus && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              prog.masteryStatus === 'MASTERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prog.masteryStatus === 'IMPROVING'
                                ? 'bg-amber-100 text-amber-800'
                                : prog.isPersistentGap
                                ? 'bg-rose-100 text-rose-900 font-black'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {prog.isPersistentGap ? '⚠ Persistent Gap' : prog.masteryStatus}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                        {concept.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {concept.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {prog?.attemptsCount || 0} Attempts • Latest: {prog?.latestScore || 0}%
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSelectConcept(concept, 'learn')}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Learn
                        </button>
                        <button
                          onClick={() => handleSelectConcept(concept, 'teachback')}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Teach-Back
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature: Teach-Back Mastery Badges Showcase */}
          <MasteryBadgesCard
            studentId={user.id}
            onLaunchTeachBack={title => handleLaunchConceptByTitle(title || 'Normalization', 'teachback')}
          />

          {/* Recent Teach-Back Attempts Timeline */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">
                Recent Teach-Back Attempts & Diagnoses
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Real-time Semantic Tracking
              </span>
            </div>

            <div className="space-y-3">
              {progressData?.recentAttempts?.map((att: TeachBackAttempt) => (
                <div
                  key={att.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-white text-base ${
                        att.understandingScore >= 80
                          ? 'bg-emerald-500'
                          : att.understandingScore >= 60
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    >
                      {att.understandingScore}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">
                          {att.conceptTitle}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">
                          Attempt #{att.attemptNumber}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            att.masteryStatus === 'MASTERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.masteryStatus === 'IMPROVING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.masteryStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                        “{att.transcript}”
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">
                      {new Date(att.timestamp).toLocaleDateString()}
                    </span>
                    {att.misconceptions.length > 0 && (
                      <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                        {att.misconceptions.length} misconception detected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: VOICE AI TUTOR */}
      {/* ========================================================= */}
      {activeTab === 'learn' && selectedConcept && (
        <VoiceAITutor
          concept={selectedConcept}
          onProceedToTeachBack={() => setActiveTab('teachback')}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 3: TEACH-BACK STUDIO (THE INNOVATION) */}
      {/* ========================================================= */}
      {activeTab === 'teachback' && selectedConcept && (
        <TeachBackStudio
          concept={selectedConcept}
          student={user}
          onAttemptComplete={handleTeachBackCompleted}
          onSwitchToTeacher={onSwitchToTeacher}
          onXpUpdated={newXp => {
            loadData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 4: PERSONAL LEARNING TWIN (Feature #15) */}
      {/* ========================================================= */}
      {activeTab === 'twin' && (
        <PersonalLearningTwinView
          studentId={user.id}
          onNavigateToTopic={title => handleLaunchConceptByTitle(title, 'learn')}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 5: PREREQUISITES & ADAPTIVE PATH (Feature #16, 17, 18) */}
      {/* ========================================================= */}
      {activeTab === 'path' && (
        <ConceptDependencyView
          studentId={user.id}
          onLaunchConcept={title => handleLaunchConceptByTitle(title, 'teachback')}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 6: PRACTICE QUIZZES (Feature #19) */}
      {/* ========================================================= */}
      {activeTab === 'practice' && (
        <PracticeQuizView
          studentId={user.id}
          onXpAwarded={newXp => {
            loadData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 7: SMART SPACED REVISION (Feature #20) */}
      {/* ========================================================= */}
      {activeTab === 'revision' && (
        <SmartRevisionView
          studentId={user.id}
          onLaunchTeachBack={title => handleLaunchConceptByTitle(title, 'teachback')}
          onLaunchQuiz={() => setActiveTab('practice')}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 8: ACHIEVEMENTS & GAMIFICATION (Feature #7, 8, 9, 30) */}
      {/* ========================================================= */}
      {activeTab === 'achievements' && (
        <AchievementsView
          studentId={user.id}
          currentXp={progressData?.xp || 820}
          currentLevel={progressData?.level || 4}
          streakDays={progressData?.learningStreakDays || 7}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 9: MULTIMODAL DIAGRAM ANALYZER (Feature #29) */}
      {/* ========================================================= */}
      {activeTab === 'multimodal' && <MultimodalDiagramView />}

      {/* ========================================================= */}
      {/* TAB 10: STUDY MATERIALS & TOPIC EXTRACTION */}
      {/* ========================================================= */}
      {activeTab === 'materials' && (
        <StudyMaterialUploader
          documents={documents}
          onDocumentAdded={newDoc => {
            setDocuments([newDoc, ...documents]);
            loadData();
          }}
          onSelectConceptFromTree={cName => {
            handleLaunchConceptByTitle(cName, 'learn');
          }}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 11: MENTOR FEEDBACK */}
      {/* ========================================================= */}
      {activeTab === 'feedback' && (
        <div className="space-y-8">
          {/* Section 1: Real-Time Direct Messaging with Mentor */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {user.assignedMentorName ? user.assignedMentorName.charAt(0) : 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      Direct Mentor Channel
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Faculty Mentor: <strong>{user.assignedMentorName || 'Dr. Priya Sharma'}</strong> ({user.schoolName || 'RMK School'})
                  </p>
                </div>
              </div>

              <button
                onClick={loadMentorMessages}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Messages</span>
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 max-h-[360px] overflow-y-auto">
              {messagesLoading && messages.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  Loading mentor messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No messages yet. Send a question to your mentor below!
                </div>
              ) : (
                messages.map(msg => {
                  const isStudent = msg.senderRole === 'student';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-slate-400">
                        <span>{isStudent ? 'You' : msg.senderName}</span>
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
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {msg.type}
                          </span>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed shadow-xs space-y-1.5 ${
                          isStudent
                            ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-tr-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {msg.conceptTag && (
                          <div
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider inline-block px-2 py-0.5 rounded-md ${
                              isStudent ? 'bg-teal-500/40 text-teal-100' : 'bg-slate-100 text-slate-600'
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
            </div>

            {/* Student Message Composer */}
            <form onSubmit={handleSendStudentReply} className="flex items-end gap-2 pt-2">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Ask ${user.assignedMentorName || 'Dr. Priya Sharma'} a question or reply to feedback...`}
                className="flex-1 p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={sendingReply || !replyText.trim()}
                className="px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>{sendingReply ? 'Sending...' : 'Send Reply'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Section 2: Recorded Mentor Interventions & Clinical Directives */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Formal Mentor Interventions & Clinical Prescriptions
                </h3>
                <p className="text-xs text-slate-500">
                  Pedagogical directives and assigned practice materials recorded by your mentor.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {progressData?.interventions?.length || 0} Recorded Interventions
              </span>
            </div>

            {progressData?.interventions?.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No mentor interventions recorded yet. Your mentor monitors your teach-back sessions automatically.
              </div>
            ) : (
              <div className="space-y-4">
                {progressData?.interventions?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-indigo-100/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {item.teacherName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {item.teacherName}
                          </h4>
                          <span className="text-[11px] text-indigo-700 font-semibold">
                            Target Concept: {item.conceptTitle}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-slate-700">
                        Intervention Type: <span className="text-indigo-800 font-extrabold">{item.interventionType}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 text-slate-700 text-xs leading-relaxed">
                        “{item.notes}”
                      </div>
                      {item.prescribedResource && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 p-2.5 rounded-xl border border-teal-200/60">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Prescribed Resource: {item.prescribedResource}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
