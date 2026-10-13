import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Filter
} from 'lucide-react';
import { PracticeQuestion } from '../../types';
import { fetchPracticeQuestions, submitPracticeAnswer, generatePracticeQuestions } from '../../services/api';

interface PracticeQuizViewProps {
  studentId: string;
  onXpAwarded?: (newXp: number) => void;
}

export const PracticeQuizView: React.FC<PracticeQuizViewProps> = ({
  studentId,
  onXpAwarded,
}) => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [evaluatedResult, setEvaluatedResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await fetchPracticeQuestions(
        undefined,
        selectedDifficulty === 'All' ? undefined : selectedDifficulty
      );
      setQuestions(data);
      setActiveQuestionIdx(0);
      setSelectedOption('');
      setEvaluatedResult(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedDifficulty]);

  const handleSubmitAnswer = async () => {
    if (!selectedOption) return;
    const currentQ = questions[activeQuestionIdx];
    try {
      const res = await submitPracticeAnswer({
        questionId: currentQ.id,
        studentAnswer: selectedOption,
        studentId,
      });
      setEvaluatedResult(res);
      if (res.newTotalXp && onXpAwarded) {
        onXpAwarded(res.newTotalXp);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption('');
    setEvaluatedResult(null);
    setActiveQuestionIdx(prev => (prev + 1) % questions.length);
  };

  const handleGenerateNewQuestions = async () => {
    setIsGenerating(true);
    try {
      const newGenerated = await generatePracticeQuestions({
        conceptTitle: 'Relational Normalization & Functional Dependencies',
        difficulty: selectedDifficulty === 'All' ? 'Medium' : (selectedDifficulty as any),
      });
      setQuestions(prev => [...newGenerated, ...prev]);
      setActiveQuestionIdx(0);
      setSelectedOption('');
      setEvaluatedResult(null);
      alert('AI generated 3 new practice questions grounded in your study notes!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQuestion = questions[activeQuestionIdx];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 border border-teal-200/60">
              Interactive Practice Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            AI-Generated Practice & Diagnostic Quizzes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Reinforce concepts through application problems, scenario checks, and instant pedagogical explanations. Earn +20 XP per correct answer!
          </p>
        </div>

        <button
          onClick={handleGenerateNewQuestions}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Generate New AI Questions</span>
        </button>
      </div>

      {/* Difficulty Filters */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Difficulty:</span>
        </span>
        {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDifficulty === diff
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Question Card */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold">Loading questions...</p>
        </div>
      ) : currentQuestion ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                {currentQuestion.type}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                {currentQuestion.conceptTitle}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                +{currentQuestion.xp || 20} XP
              </span>
              <span className="text-xs text-slate-400 font-bold">
                Question {activeQuestionIdx + 1} of {questions.length}
              </span>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {(currentQuestion.options || ['True', 'False']).map((opt, oIdx) => (
              <div
                key={oIdx}
                onClick={() => !evaluatedResult && setSelectedOption(opt)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedOption === opt
                    ? 'border-teal-500 bg-teal-50/50 shadow-xs font-bold text-teal-950'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span className="text-xs sm:text-sm font-medium">{opt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Evaluated Result Card */}
          {evaluatedResult && (
            <div
              className={`p-5 rounded-2xl border space-y-2 text-xs animate-in fade-in ${
                evaluatedResult.correct
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-sm">
                  {evaluatedResult.correct ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Correct Answer! (+{evaluatedResult.xpAwarded} XP)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>Incorrect — Keep Learning!</span>
                    </>
                  )}
                </div>
                {!evaluatedResult.correct && (
                  <span className="font-bold text-slate-700">
                    Correct: <strong>{evaluatedResult.correctAnswer}</strong>
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {evaluatedResult.explanation}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={activeQuestionIdx === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              Previous
            </button>

            {evaluatedResult ? (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Check Answer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 text-xs">
          No questions found for this filter. Click 'Generate New AI Questions' above!
        </div>
      )}
    </div>
  );
};
