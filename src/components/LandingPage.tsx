import React from 'react';
import {
  Mic,
  Brain,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Users,
  CheckCircle2,
  RefreshCw,
  FileText,
  Volume2,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onStudentLogin: () => void;
  onTeacherLogin: () => void;
  onDemoFlow: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  onStudentLogin,
  onTeacherLogin,
  onDemoFlow,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-teal-200/40 via-cyan-100/30 to-indigo-200/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide mb-6 shadow-xs animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Beyond Simple Multiple-Choice Quizzes & Chatbots</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            LEARNBACK <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-700 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-bold text-teal-700 tracking-wide uppercase">
            “Learn • Explain • Improve • Master”
          </p>

          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-slate-600 font-normal leading-relaxed">
            “An AI-powered voice learning platform that understands what students <span className="font-semibold text-slate-900 underline decoration-teal-400 decoration-2 underline-offset-4">actually understand</span>.”
          </p>

          <p className="mt-3 max-w-2xl mx-auto text-sm text-slate-500">
            Students learn from their own study materials, explain concepts aloud using voice, receive semantic misconception detection and personalized remediation, and trigger human teacher interventions when persistent gaps occur.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStudentLogin}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              <GraduationCap className="w-5 h-5 text-teal-600" />
              <span>Student Login</span>
            </button>

            <button
              onClick={onTeacherLogin}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900 font-bold text-base border border-indigo-200 shadow-xs transition-all cursor-pointer"
            >
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Teacher / Mentor Portal</span>
            </button>

            <button
              onClick={onDemoFlow}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm border border-amber-300/80 shadow-xs transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>Watch Live Demo Flow (Arun's Story)</span>
            </button>
          </div>
        </div>
      </section>

      {/* The 6-Step Closed Loop Workflow Section */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
              The Closed-Loop Pedagogy
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
              From Voice Teach-Back to Mentor Care
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              The platform answers four crucial questions: What did the student learn? What do they actually understand? What are they misunderstanding? And when should the teacher step in?
            </p>
          </div>

          {/* Workflow Diagram */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Step 1: Learn */}
            <div className="relative group bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all text-center">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3 font-bold group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">Step 1</span>
              <h3 className="font-bold text-slate-900 text-base mt-0.5">Learn</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                Study notes, PDF extraction & Voice AI Tutor in Beginner or Advanced mode.
              </p>
            </div>

            {/* Step 2: Explain */}
            <div className="relative group bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto mb-3 font-bold group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider">Step 2</span>
              <h3 className="font-bold text-slate-900 text-base mt-0.5">Explain</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                Student presses record and explains the concept aloud in their own words.
              </p>
            </div>

            {/* Step 3: Analyse */}
            <div className="relative group bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3 font-bold group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Step 3</span>
              <h3 className="font-bold text-slate-900 text-base mt-0.5">Analyse</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                Gemini semantic engine detects exact misconceptions & missing points.
              </p>
            </div>

            {/* Step 4: Improve */}
            <div className="relative group bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 font-bold group-hover:scale-110 transition-transform">
                <Lightbulb className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Step 4</span>
              <h3 className="font-bold text-slate-900 text-base mt-0.5">Improve</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                Personalized remediation, analogies, and targeted mini check questions.
              </p>
            </div>

            {/* Step 5: Retry / Track */}
            <div className="relative group bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3 font-bold group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Step 5</span>
              <h3 className="font-bold text-slate-900 text-base mt-0.5">Track</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                Multi-attempt progression tracking from Needs Support to Mastery.
              </p>
            </div>

            {/* Step 6: Mentor Intervention */}
            <div className="relative group bg-amber-50 hover:bg-amber-100/60 rounded-2xl p-5 border border-amber-300 hover:border-amber-500 hover:shadow-md transition-all text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center mx-auto mb-3 font-bold group-hover:scale-110 transition-transform animate-pulse">
                <ShieldAlert className="w-6 h-6 text-amber-700" />
              </div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Step 6</span>
              <h3 className="font-bold text-amber-950 text-base mt-0.5">Intervention</h3>
              <p className="text-xs text-amber-800 mt-1.5 leading-snug font-medium">
                Persistent gaps auto-notify the teacher with diagnosed issues & action plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Feature 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center mb-6 shadow-md shadow-teal-500/20">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Voice Teach-Back Studio
            </h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              When students merely read or select multiple-choice options, misconceptions hide behind superficial recall. LEARNBACK AI asks: <span className="font-bold text-slate-800">“Now explain this concept in your own words.”</span> Browser speech recognition captures voice transcripts in real time.
            </p>
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                <span>Microphone Pipeline</span>
              </div>
              <p className="text-slate-600 font-mono text-[11px]">
                Student Voice → Real-time STT → Transcript → Gemini 3.8 Flash Semantic Analysis
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-600/20">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Semantic Misconception Engine
            </h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              We do NOT rely on simplistic keyword frequency. If a student says <span className="italic font-medium text-slate-700">“Normalization is deleting duplicate rows from tables”</span>, the engine flags this exact semantic distortion and provides targeted remediation rather than generic slides.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                ✓ Understood Concepts
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                ⚠ Specific Misconceptions
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-semibold">
                ? Missing Knowledge
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-semibold">
                🎯 Actionable Remediation
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-6 shadow-md shadow-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Persistent Learning Gap Detection
            </h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              If an AI system loops indefinitely without student progress, the learner becomes frustrated. If a student struggles on the SAME concept across 3+ attempts, the system automatically flags a <span className="font-bold text-rose-600">Persistent Learning Gap</span> and escalates to their teacher.
            </p>
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
              ⚠ Automatically routes student attempt logs, detected misconceptions, and suggested pedagogical actions directly to the teacher dashboard.
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mb-6 shadow-md shadow-amber-600/20">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Human Mentor Intervention Hub
            </h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Teachers don't just see grades; they see <span className="font-bold text-slate-800">how their students think</span>. Teachers inspect exact voice transcripts, review the AI diagnosis, log 1-on-1 pedagogical interventions, and assign custom worksheets back to the student.
            </p>
            <div className="mt-5 flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-medium">
              <BarChart3 className="w-5 h-5 text-indigo-700 shrink-0" />
              <span>Full cohort analytics: mastery distribution, progress trends, and student-concept heatmaps.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Callout Banner */}
      <section className="pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 via-cyan-800 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 text-xs font-bold uppercase tracking-wider">
              Hackathon Demonstration Preset
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-3">
              Explore Arun Kumar's Learning Journey
            </h2>
            <p className="text-teal-100 text-sm mt-2 max-w-xl">
              Pre-loaded with 4 attempts on Normalization (55% → 64% → 61% → 63%), a Persistent Gap alert for mentor Dr. Priya Sharma, and a completed Primary Key mastery flow.
            </p>
          </div>
          <button
            onClick={onDemoFlow}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-teal-900 font-extrabold text-sm shadow-md transition-all transform hover:scale-105 cursor-pointer"
          >
            Launch Interactive Experience
          </button>
        </div>
      </section>
    </div>
  );
};
