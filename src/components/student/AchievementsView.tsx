import React, { useState, useEffect } from 'react';
import {
  Award,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  Trophy,
  Mic,
  Lightbulb,
  BookOpen,
  Calendar,
  Sparkles,
  Key,
  Layers,
  Database,
  GitFork,
} from 'lucide-react';
import { Badge, LearningLevelInfo } from '../../types';
import { fetchBadges } from '../../services/api';

interface AchievementsViewProps {
  studentId: string;
  currentXp: number;
  currentLevel: number;
  streakDays: number;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  studentId,
  currentXp,
  currentLevel,
  streakDays,
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges(studentId)
      .then(setBadges)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  const levelInfo: LearningLevelInfo[] = [
    {
      levelNumber: 1,
      name: 'Beginner',
      minPercent: 0,
      maxPercent: 20,
      description: 'Starting topic exploration with basic conversational explanations and simple analogies.',
      capabilities: ['Basic definitions', 'Introductory voice audio', 'Everyday analogies'],
    },
    {
      levelNumber: 2,
      name: 'Learning',
      minPercent: 21,
      maxPercent: 40,
      description: 'Active learning with simple practice scenarios and beginner teach-back prompts.',
      capabilities: ['Guided teach-back', 'Simple examples', 'Recall questions'],
    },
    {
      levelNumber: 3,
      name: 'Developing',
      minPercent: 41,
      maxPercent: 60,
      description: 'Addressing misconceptions, intermediate teach-back, and multi-step follow-ups.',
      capabilities: ['Semantic misconception detection', 'Follow-up inquiry', 'Prerequisite identification'],
    },
    {
      levelNumber: 4,
      name: 'Proficient',
      minPercent: 61,
      maxPercent: 80,
      description: 'Application problems, schema synthesis, and advanced technical teach-back.',
      capabilities: ['Advanced teach-back', 'Schema trade-offs', 'Scenario-based diagnosis'],
    },
    {
      levelNumber: 5,
      name: 'Mastery',
      minPercent: 81,
      maxPercent: 100,
      description: 'Exam-ready mastery with formal mathematical rigor, proof logic, and clinical precision.',
      capabilities: ['Formal schema proofs', 'Challenge questions', 'Peer-mentor eligibility'],
    },
  ];

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mic': return <Mic className="w-6 h-6 text-teal-600" />;
      case 'Key': return <Key className="w-6 h-6 text-amber-500" />;
      case 'Layers': return <Layers className="w-6 h-6 text-indigo-600" />;
      case 'Database': return <Database className="w-6 h-6 text-cyan-600" />;
      case 'GitFork': return <GitFork className="w-6 h-6 text-purple-600" />;
      case 'Flame': return <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />;
      case 'Award': return <Award className="w-6 h-6 text-amber-500" />;
      case 'Lightbulb': return <Lightbulb className="w-6 h-6 text-cyan-600" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-indigo-600" />;
      case 'Zap': return <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
      case 'Trophy': return <Trophy className="w-6 h-6 text-amber-600" />;
      default: return <Sparkles className="w-6 h-6 text-teal-600" />;
    }
  };

  const nextLevelXp = currentLevel === 5 ? 1200 : currentLevel * 200 + 200;
  const xpInLevel = currentXp - (currentLevel - 1) * 200;
  const xpNeeded = nextLevelXp - currentXp;

  return (
    <div className="space-y-8">
      {/* Gamification Dashboard (Feature #30) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-amber-950">
              Gamified Learning Telemetry
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              Level {currentLevel}: {levelInfo[currentLevel - 1]?.name || 'Proficient'}
            </h2>
            <p className="text-xs text-teal-200">
              Earn XP by speaking aloud in Teach-Back (+30 XP), fixing misconceptions (+40 XP), and mastering topics (+100 XP).
            </p>
          </div>

          {/* XP Progress Box */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shrink-0 w-full lg:w-80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>{currentXp} / {nextLevelXp} XP</span>
              <span className="text-amber-300">{xpNeeded} XP to next level</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentXp / nextLevelXp) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-teal-200">
              <span className="flex items-center gap-1 font-bold">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                {streakDays} Day Learning Streak
              </span>
              <span>Daily Goal: 75% (3/4 Done)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Level System Grid (Feature #7) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            5-Stage Learning Progression System
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your performance dynamically adapts the difficulty and type of AI tutoring provided.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {levelInfo.map(lvl => {
            const isCurrent = lvl.levelNumber === currentLevel;
            const isCompleted = lvl.levelNumber < currentLevel;
            return (
              <div
                key={lvl.levelNumber}
                className={`p-4 rounded-2xl border-2 transition-all space-y-2 relative ${
                  isCurrent
                    ? 'border-teal-500 bg-teal-50/50 shadow-md ring-2 ring-teal-200'
                    : isCompleted
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-200 bg-slate-50/40 opacity-70'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-teal-600 text-white">
                    Current Level
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">
                    Level {lvl.levelNumber}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {lvl.minPercent}–{lvl.maxPercent}%
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-800">
                  {lvl.name}
                </h4>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {lvl.description}
                </p>
                <div className="pt-2 border-t border-slate-200/60 space-y-1">
                  {lvl.capabilities.map((cap, cIdx) => (
                    <div key={cIdx} className="text-[10px] text-slate-600 flex items-center gap-1 font-medium">
                      <span className="text-teal-600">✓</span>
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges System (Feature #9) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Badges & Achievements
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unlocked through authentic voice explanations, consistency streaks, and overcoming mental model errors.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
            {badges.filter(b => b.unlocked).length} of {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                badge.unlocked
                  ? 'bg-white border-slate-200 hover:border-teal-400 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  badge.unlocked
                    ? 'bg-slate-100 shadow-xs'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {badge.unlocked ? getBadgeIcon(badge.icon) : <Lock className="w-5 h-5 text-slate-400" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {badge.title}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    +{badge.xpReward} XP
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  {badge.description}
                </p>
                {badge.moduleTitle && (
                  <span className="text-[10px] font-semibold text-slate-500 block">
                    Module: <strong className="text-slate-700">{badge.moduleTitle}</strong>
                  </span>
                )}
                {badge.criteria && (
                  <span className="text-[10px] text-slate-400 block italic">
                    Criteria: {badge.criteria}
                  </span>
                )}
                {badge.unlocked && badge.unlockedAt && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked on {badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
