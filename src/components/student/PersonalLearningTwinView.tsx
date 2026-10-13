import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldAlert,
  Flame,
  Lightbulb
} from 'lucide-react';
import { PersonalLearningTwin } from '../../types';
import { fetchPersonalLearningTwin } from '../../services/api';

interface PersonalLearningTwinViewProps {
  studentId: string;
  onNavigateToTopic?: (topicName: string) => void;
}

export const PersonalLearningTwinView: React.FC<PersonalLearningTwinViewProps> = ({
  studentId,
  onNavigateToTopic,
}) => {
  const [twin, setTwin] = useState<PersonalLearningTwin | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTwin = async () => {
    setLoading(true);
    try {
      const data = await fetchPersonalLearningTwin(studentId);
      setTwin(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTwin();
  }, [studentId]);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 space-y-3">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold">Synchronizing with your Personal Learning Twin...</p>
      </div>
    );
  }

  if (!twin) return null;

  return (
    <div className="space-y-6">
      {/* Top Twin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-400 via-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 animate-pulse">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  Cognitive Digital Twin
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Real-time Neural Model
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                {twin.studentName}’s Learning Twin
              </h2>
              <p className="text-xs text-teal-200/80 mt-0.5">
                Dynamic replica of your concept comprehension, memory retention decay, and active misconceptions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadTwin}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resync State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Twin Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Overall Understanding */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Overall Understanding
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-600">
              {twin.overallUnderstanding}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all"
              style={{ width: `${twin.overallUnderstanding}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Aggregated from voice teach-backs & quizzes.
          </p>
        </div>

        {/* Metric 2: Current Level */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Cognitive Stage
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700">
              Level {twin.currentLevel}
            </span>
            <span className="text-xs font-extrabold uppercase text-indigo-500">
              {twin.levelName}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${(twin.xp / twin.nextLevelXp) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            {twin.xp} / {twin.nextLevelXp} XP ({twin.nextLevelXp - twin.xp} XP to next level)
          </p>
        </div>

        {/* Metric 3: Active Misconceptions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Unresolved Misconceptions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">
              {twin.unresolvedMisconceptionsCount}
            </span>
            <span className="text-xs font-bold text-rose-500">flagged</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full w-2/3" />
          </div>
          <p className="text-[11px] text-rose-700 font-semibold pt-1">
            Requires targeted remediation.
          </p>
        </div>

        {/* Metric 4: Resilience & Consistency */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>Learning Momentum</span>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {twin.streakDays} Days
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full w-4/5" />
          </div>
          <p className="text-[11px] text-orange-600 font-bold pt-1">
            Cognitive Resilience: {twin.cognitiveResilienceScore}/100
          </p>
        </div>
      </div>

      {/* Conceptual Topology: Strong vs Weak concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Concepts */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Strong Concepts (Validated by Voice Teach-Back)
            </h3>
          </div>
          <div className="space-y-2.5">
            {twin.strongConcepts.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs font-bold text-emerald-950 flex items-center justify-between"
              >
                <span>{item}</span>
                <span className="text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Mastered
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Concepts */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Weak Concepts (Learning Friction Points)
            </h3>
          </div>
          <div className="space-y-2.5">
            {twin.weakConcepts.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-xs font-bold text-rose-950 flex items-center justify-between"
              >
                <span>{item}</span>
                <span className="text-[10px] uppercase font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                  Needs Revision
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unresolved Misconceptions Diagnostic Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Active Misconception Registry
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Diagnosed by LLM Semantic Engine
          </span>
        </div>

        <div className="space-y-3">
          {twin.unresolvedMisconceptions.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-900 text-sm">
                  {item.concept}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900">
                  {item.severity} Severity Misconception
                </span>
              </div>
              <p className="text-amber-900/90 font-medium leading-relaxed">
                “{item.misconception}”
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-700 to-indigo-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white/20 text-teal-200">
            Next Cognitive Objective
          </span>
          <h4 className="text-xl font-extrabold mt-1">
            {twin.recommendedNextTopic}
          </h4>
          <p className="text-xs text-teal-100/90 mt-0.5">
            Your Learning Twin determined that addressing this concept first unlocks downstream mastery of BCNF and relational synthesis.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTopic && onNavigateToTopic(twin.recommendedNextTopic)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-teal-900 font-extrabold text-xs shadow-md hover:bg-teal-50 transition-all cursor-pointer shrink-0"
        >
          <span>Launch Recommended Drill</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
