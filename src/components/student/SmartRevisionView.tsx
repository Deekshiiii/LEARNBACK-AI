import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Mic,
  HelpCircle,
  Award
} from 'lucide-react';
import { RevisionScheduleItem } from '../../types';
import { fetchRevisionSchedule, completeRevisionTask } from '../../services/api';

interface SmartRevisionViewProps {
  studentId: string;
  onLaunchTeachBack: (conceptTitle: string) => void;
  onLaunchQuiz: () => void;
}

export const SmartRevisionView: React.FC<SmartRevisionViewProps> = ({
  studentId,
  onLaunchTeachBack,
  onLaunchQuiz,
}) => {
  const [schedule, setSchedule] = useState<RevisionScheduleItem[]>([]);
  const [todayDueCount, setTodayDueCount] = useState(2);
  const [loading, setLoading] = useState(true);

  const loadSchedule = async () => {
    try {
      const data = await fetchRevisionSchedule(studentId);
      setSchedule(data.schedule);
      setTodayDueCount(data.todayDueCount);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [studentId]);

  const handleComplete = async (itemId: string) => {
    try {
      await completeRevisionTask(studentId, itemId);
      setSchedule(prev =>
        prev.map(item => (item.id === itemId ? { ...item, completed: true } : item))
      );
      setTodayDueCount(prev => Math.max(0, prev - 1));
      alert('Revision milestone verified! +20 XP awarded.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-cyan-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-amber-950">
              Spaced Repetition Algorithm
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Smart Cognitive Revision Calendar
          </h2>
          <p className="text-xs text-teal-200 mt-1 max-w-xl">
            Combat the Ebbinghaus forgetting curve. Tasks are automatically scheduled at Day 1, Day 2, Day 4, Day 7, and Day 14 intervals to lock concepts into long-term memory.
          </p>
        </div>

        {/* Due Today Card */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0">
          <span className="text-[10px] font-extrabold uppercase text-amber-300 block">
            TODAY'S REVISION
          </span>
          <div className="text-3xl font-black mt-0.5">{todayDueCount}</div>
          <span className="text-[11px] text-teal-200 block font-medium">Activities Due</span>
        </div>
      </div>

      {/* 5-Stage Spaced Intervals Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-1">
          <span className="text-[10px] font-extrabold text-teal-600 uppercase">Day 1</span>
          <h4 className="font-extrabold text-slate-800 text-xs">Learn & Store</h4>
          <p className="text-[10px] text-slate-400">First study & RAG grounding</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-1">
          <span className="text-[10px] font-extrabold text-cyan-600 uppercase">Day 2</span>
          <h4 className="font-extrabold text-slate-800 text-xs">Active Recall</h4>
          <p className="text-[10px] text-slate-400">Rapid retrieval check</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-1">
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase">Day 4</span>
          <h4 className="font-extrabold text-slate-800 text-xs">Teach-Back</h4>
          <p className="text-[10px] text-slate-400">Explain in voice aloud</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-1">
          <span className="text-[10px] font-extrabold text-amber-600 uppercase">Day 7</span>
          <h4 className="font-extrabold text-slate-800 text-xs">Diagnostic Quiz</h4>
          <p className="text-[10px] text-slate-400">Application questions</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Day 14</span>
          <h4 className="font-extrabold text-slate-800 text-xs">Mastery Check</h4>
          <p className="text-[10px] text-slate-400">Permanent memory proof</p>
        </div>
      </div>

      {/* Revision Schedule Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
          Your Scheduled Spaced Revision Tasks
        </h3>

        <div className="space-y-3">
          {schedule.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                item.completed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-teal-400 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    item.completed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  {item.completed ? '✓' : item.dayInterval}d
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {item.conceptTitle}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                      {item.taskType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Stage: <strong>{item.stageName}</strong> • Due: {item.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                {item.taskType === 'TEACH_BACK' && !item.completed && (
                  <button
                    onClick={() => onLaunchTeachBack(item.conceptTitle)}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-xs hover:bg-teal-700"
                  >
                    Start Teach-Back
                  </button>
                )}

                {item.taskType === 'QUIZ' && !item.completed && (
                  <button
                    onClick={onLaunchQuiz}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700"
                  >
                    Take Quiz
                  </button>
                )}

                {!item.completed ? (
                  <button
                    onClick={() => handleComplete(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Mark Done (+20 XP)
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
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
