import React, { useState, useEffect } from 'react';
import {
  Award,
  Mic,
  Key,
  Layers,
  Database,
  GitFork,
  Sparkles,
  Lock,
  CheckCircle2,
  ArrowRight,
  Flame,
  Zap,
  TrendingUp,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Badge } from '../../types';
import { fetchBadges } from '../../services/api';

interface MasteryBadgesCardProps {
  studentId: string;
  onLaunchTeachBack?: (conceptTitle?: string) => void;
}

export const MasteryBadgesCard: React.FC<MasteryBadgesCardProps> = ({
  studentId,
  onLaunchTeachBack,
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges(studentId)
      .then(setBadges)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  const teachBackBadges = badges.filter(b => b.category === 'TEACH_BACK');
  const earnedCount = teachBackBadges.filter(b => b.unlocked).length;
  const totalCount = teachBackBadges.length || 6;
  const completionPercent = Math.round((earnedCount / totalCount) * 100);

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = `w-6 h-6 ${isUnlocked ? 'text-teal-600' : 'text-slate-400'}`;
    switch (iconName) {
      case 'Mic':
        return <Mic className={iconClass} />;
      case 'Key':
        return <Key className={`w-6 h-6 ${isUnlocked ? 'text-amber-500' : 'text-slate-400'}`} />;
      case 'Layers':
        return <Layers className={`w-6 h-6 ${isUnlocked ? 'text-indigo-600' : 'text-slate-400'}`} />;
      case 'Database':
        return <Database className={`w-6 h-6 ${isUnlocked ? 'text-cyan-600' : 'text-slate-400'}`} />;
      case 'GitFork':
        return <GitFork className={`w-6 h-6 ${isUnlocked ? 'text-purple-600' : 'text-slate-400'}`} />;
      case 'Sparkles':
        return <Sparkles className={`w-6 h-6 ${isUnlocked ? 'text-amber-400 fill-amber-300' : 'text-slate-400'}`} />;
      case 'Flame':
        return <Flame className={`w-6 h-6 ${isUnlocked ? 'text-orange-500 fill-orange-400' : 'text-slate-400'}`} />;
      case 'Zap':
        return <Zap className={`w-6 h-6 ${isUnlocked ? 'text-yellow-500 fill-yellow-400' : 'text-slate-400'}`} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  const filteredBadges = teachBackBadges.filter(b => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header with Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center gap-1">
              <Award className="w-3 h-3 text-teal-600" />
              Teach-Back Mastery Badges
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Verbal Articulation Badges
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl mt-1">
            Voice Teach-Back Mastery Badges
          </h3>
          <p className="text-xs text-slate-500">
            Earn distinct mastery icons by explaining syllabus modules aloud with clinical accuracy and zero misconceptions.
          </p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-700 block">
              {earnedCount} of {totalCount} Badges
            </span>
            <span className="text-[10px] font-semibold text-teal-700">
              {completionPercent}% Modules Mastered
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            {completionPercent}%
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Modules ({teachBackBadges.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'unlocked'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Earned ({earnedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'locked'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3 h-3" />
            In Progress ({totalCount - earnedCount})
          </button>
        </div>

        <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
          Click any locked badge to start its teach-back module
        </span>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400 font-medium">
          Loading mastery badges...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map(badge => {
            return (
              <div
                key={badge.id}
                className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between group ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-white via-teal-50/20 to-teal-50/40 border-teal-200/80 hover:border-teal-400 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Ribbon tag */}
                {badge.unlocked ? (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Earned
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Locked
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    {/* Badge Icon Holder */}
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        badge.unlocked
                          ? 'bg-gradient-to-tr from-teal-100 via-teal-50 to-white shadow-xs ring-2 ring-teal-200/80'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {getBadgeIcon(badge.icon, badge.unlocked)}
                    </div>

                    <div className="pr-12">
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {badge.title}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 mt-1 inline-block">
                        +{badge.xpReward} XP
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {badge.description}
                  </p>

                  {/* Module Meta */}
                  <div className="bg-white/80 border border-slate-200/70 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                    {badge.moduleTitle && (
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-400">Teach-Back Module:</span>
                        <span className="font-bold text-slate-800 text-right truncate max-w-[160px]">
                          {badge.moduleTitle}
                        </span>
                      </div>
                    )}
                    {badge.criteria && (
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-400">Target Criteria:</span>
                        <span className="font-semibold text-slate-700 text-right">
                          {badge.criteria}
                        </span>
                      </div>
                    )}
                    {badge.unlocked && badge.masteryScore ? (
                      <div className="flex items-center justify-between font-medium pt-1 border-t border-slate-100">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                          Mastery Score:
                        </span>
                        <span className="font-extrabold text-emerald-700 font-mono">
                          {badge.masteryScore}%
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Footer action / Unlocked date */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  {badge.unlocked ? (
                    <span className="text-[10px] font-medium text-slate-400">
                      Earned on {badge.unlockedAt || 'Recent'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500">
                      Requires Teach-Back
                    </span>
                  )}

                  {onLaunchTeachBack && (
                    <button
                      onClick={() => onLaunchTeachBack(badge.moduleTitle || badge.title)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        badge.unlocked
                          ? 'text-teal-700 bg-teal-50 hover:bg-teal-100'
                          : 'text-white bg-slate-900 hover:bg-slate-800 shadow-xs'
                      }`}
                    >
                      <span>{badge.unlocked ? 'Replay' : 'Start Module'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
