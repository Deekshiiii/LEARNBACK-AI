import React, { useState, useEffect } from 'react';
import {
  GitCommit,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  AlertTriangle,
  Layers,
  ChevronRight,
  Rocket,
  CheckSquare,
  Square
} from 'lucide-react';
import { ConceptDependencyNode, AdaptiveLearningPathStep, NextLevelMission } from '../../types';
import { fetchConceptDependencies, fetchAdaptiveLearningPath } from '../../services/api';

interface ConceptDependencyViewProps {
  studentId: string;
  onLaunchConcept: (conceptTitle: string) => void;
}

export const ConceptDependencyView: React.FC<ConceptDependencyViewProps> = ({
  studentId,
  onLaunchConcept,
}) => {
  const [dependencies, setDependencies] = useState<ConceptDependencyNode[]>([]);
  const [learningPath, setLearningPath] = useState<AdaptiveLearningPathStep[]>([]);
  const [mission, setMission] = useState<NextLevelMission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchConceptDependencies(), fetchAdaptiveLearningPath(studentId)])
      .then(([deps, pathData]) => {
        setDependencies(deps);
        setLearningPath(pathData.path);
        setMission(pathData.mission);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-bold">Constructing prerequisite dependency graph...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 🚀 Feature #18: NEXT LEVEL MISSION CARD */}
      {mission && (
        <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-amber-950">
                  <Rocket className="w-3.5 h-3.5" />
                  <span>NEXT LEVEL MISSION</span>
                </span>
                <span className="text-xs text-teal-200">
                  Target: Level Up to Level 5 Mastery
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                {mission.topic}
              </h3>
              <p className="text-xs text-teal-200/90 max-w-xl">
                Complete these 4 mission milestones to eliminate the persistent learning gap and unlock the next syllabus tier.
              </p>
            </div>

            {/* Target Score Dial */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
              <div className="text-center">
                <span className="text-[10px] text-teal-200 font-bold uppercase block">Current</span>
                <span className="text-2xl font-black text-amber-300">{mission.currentScore}%</span>
              </div>
              <ArrowRight className="w-4 h-4 text-teal-300" />
              <div className="text-center">
                <span className="text-[10px] text-teal-200 font-bold uppercase block">Target</span>
                <span className="text-2xl font-black text-emerald-400">{mission.targetScore}%</span>
              </div>
            </div>
          </div>

          {/* Mission Checklist */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {mission.checklist.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold transition-all ${
                  item.completed
                    ? 'bg-teal-500/20 border border-teal-400/40 text-teal-200'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 cursor-pointer'
                }`}
                onClick={() => !item.completed && onLaunchConcept(mission.topic)}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="line-clamp-1">{item.task}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => onLaunchConcept(mission.topic)}
              className="px-6 py-3 rounded-2xl bg-teal-400 hover:bg-teal-300 text-teal-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>CONTINUE LEARNING MISSION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Feature #16: CONCEPT PREREQUISITE GRAPH */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 border border-teal-200/60">
                Cognitive Prerequisite Engine
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Concept Dependency Graph
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies prerequisite knowledge gaps. If you struggle with 3NF or Normalization, the engine points back to Functional Dependencies.
            </p>
          </div>
        </div>

        {/* Visual Prerequisite Flowchart */}
        <div className="flex flex-col items-center space-y-3 py-4 max-w-xl mx-auto">
          {dependencies.map((node, idx) => (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div
                onClick={() => onLaunchConcept(node.title)}
                className={`w-full p-4 rounded-2xl border-2 transition-all cursor-pointer group shadow-xs hover:shadow-md ${
                  node.status === 'MASTERED'
                    ? 'border-emerald-400 bg-emerald-50/40 text-emerald-950'
                    : node.status === 'PERSISTENT_GAP'
                    ? 'border-rose-400 bg-rose-50/50 text-rose-950 animate-pulse'
                    : 'border-amber-300 bg-amber-50/40 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        node.status === 'MASTERED'
                          ? 'bg-emerald-500 text-white'
                          : node.status === 'PERSISTENT_GAP'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                        {node.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {node.subject} • {node.prerequisites.length > 0 ? `Requires: ${node.prerequisites.join(', ')}` : 'Foundational'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-slate-800">
                      {node.score}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        node.status === 'MASTERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : node.status === 'PERSISTENT_GAP'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>
                </div>

                {node.status === 'PERSISTENT_GAP' && (
                  <div className="mt-2.5 pt-2 border-t border-rose-200 text-[11px] text-rose-800 flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Prerequisite Alert: Before advancing to 3NF & BCNF, solidify Functional Dependencies!</span>
                  </div>
                )}
              </div>

              {/* Connecting Arrow */}
              {idx < dependencies.length - 1 && (
                <div className="flex flex-col items-center text-teal-600">
                  <ArrowDown className="w-5 h-5 animate-bounce" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Feature #17: ADAPTIVE LEARNING PATH */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Your Dynamic Adaptive Learning Path
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              This sequential path updates automatically based on your real-time teach-back scores and diagnosed misconceptions.
            </p>
          </div>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
          {learningPath.map((step, idx) => (
            <div key={step.id} className="relative group">
              {/* Bullet */}
              <div
                className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step.status === 'COMPLETED'
                    ? 'bg-emerald-500 text-white'
                    : step.status === 'IN_PROGRESS'
                    ? 'bg-teal-500 text-white ring-4 ring-teal-100'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {step.status === 'COMPLETED' ? '✓' : idx + 1}
              </div>

              <div
                onClick={() => step.status !== 'LOCKED' && onLaunchConcept(step.title)}
                className={`p-4 rounded-2xl border transition-all ${
                  step.status === 'COMPLETED'
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : step.status === 'IN_PROGRESS'
                    ? 'bg-teal-50/50 border-teal-400 shadow-sm cursor-pointer'
                    : 'bg-slate-50/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {step.type}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {step.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.score && (
                      <span className="font-mono font-bold text-xs text-slate-800">
                        {step.score}%
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : step.status === 'IN_PROGRESS'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
