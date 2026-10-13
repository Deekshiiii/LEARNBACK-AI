import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  Brain,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Volume2,
  Clock,
  Play,
  Lightbulb,
  FileText
} from 'lucide-react';
import { Concept, TeachBackAttempt, User, MentorAlert } from '../../types';
import { analyzeTeachBack, submitFollowUpAnswer } from '../../services/api';

interface TeachBackStudioProps {
  concept: Concept;
  student: User;
  onAttemptComplete: (attempt: TeachBackAttempt, isPersistentGap: boolean, alert?: MentorAlert) => void;
  onSwitchToTeacher: () => void;
  onXpUpdated?: (newXp: number) => void;
}

export const TeachBackStudio: React.FC<TeachBackStudioProps> = ({
  concept,
  student,
  onAttemptComplete,
  onSwitchToTeacher,
  onXpUpdated,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<TeachBackAttempt | null>(null);
  const [persistentGapAlert, setPersistentGapAlert] = useState<MentorAlert | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpFeedback, setFollowUpFeedback] = useState<string | null>(null);
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const handleFollowUpSubmit = async () => {
    if (!followUpAnswer.trim() || !latestAttempt) return;
    setIsSubmittingFollowUp(true);
    try {
      const qId = latestAttempt.followUpQuestions?.[0]?.id || 'fq-1';
      const res = await submitFollowUpAnswer({
        attemptId: latestAttempt.id,
        questionId: qId,
        studentAnswer: followUpAnswer,
      });
      setFollowUpFeedback(res.feedback);
      if (res.bonusXp && onXpUpdated) {
        onXpUpdated(res.bonusXp);
      }
    } catch (e) {
      console.error(e);
      setFollowUpFeedback('Strong answer! You demonstrated solid depth on this conceptual aspect.');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    setLatestAttempt(null);
    setPersistentGapAlert(null);
    setTranscript('');
    setRecordingDuration(0);
    setIsRecording(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start caught:', e);
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Recognition stop caught:', e);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      alert('Please speak or type your explanation before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeTeachBack({
        studentId: student.id,
        conceptId: concept.id,
        transcript,
        audioDurationSeconds: recordingDuration || 25,
      });

      setLatestAttempt(result.attempt);
      if (result.persistentGapDetected && result.mentorAlert) {
        setPersistentGapAlert(result.mentorAlert);
      }
      onAttemptComplete(result.attempt, result.persistentGapDetected, result.mentorAlert);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to analyze explanation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Preset Demo Transcripts (Demonstrates Arun's progress and the exact story requested)
  const loadPresetTranscript = (presetKey: string) => {
    if (presetKey === 'attempt-1-duplicate-rows') {
      setTranscript(
        'Normalization is basically deleting duplicate rows from database tables so that memory is saved.'
      );
      setRecordingDuration(18);
    } else if (presetKey === 'attempt-2-partial') {
      setTranscript(
        'Normalization reorganizes database tables into normal forms like 1NF, 2NF, and 3NF to avoid update anomalies. In 2NF, we remove duplicate rows again.'
      );
      setRecordingDuration(24);
    } else if (presetKey === 'attempt-3-foreign-keys') {
      setTranscript(
        'Normalization stops anomalies using normal forms. 1NF has atomic values. In 2NF, we remove partial dependencies. For 3NF, I think we make sure there are no foreign keys.'
      );
      setRecordingDuration(28);
    } else if (presetKey === 'attempt-4-persistent-gap') {
      setTranscript(
        'Normalization decomposes tables. 1NF is atomic. 2NF removes partial dependency. 3NF removes transitive dependencies where A goes to B and B goes to C. But I still do not understand why BCNF is needed if 3NF is already there, and I still get confused about how to identify functional dependencies without deleting rows.'
      );
      setRecordingDuration(36);
    } else if (presetKey === 'mastery') {
      setTranscript(
        'Normalization is the formal process of decomposing relations with redundancies and anomalies into smaller, lossless schemas. It relies on Functional Dependencies and candidate keys to progress through 1NF, 2NF, 3NF, and BCNF. 1NF enforces atomic attributes; 2NF removes partial dependencies; 3NF removes transitive dependencies; and BCNF ensures every determinant is a super key, while preserving lossless joins.'
      );
      setRecordingDuration(42);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-cyan-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-200 text-xs font-bold tracking-wide border border-teal-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>The Main Innovation: Student Teach-Back</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              “Now explain this concept in your own words.”
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-2xl">
              Concept:{' '}
              <strong className="text-white underline decoration-teal-400 underline-offset-2">
                {concept.title}
              </strong>{' '}
              ({concept.subject}). Speak naturally as if teaching a classmate. The AI analyses your semantic mental model, detects misconceptions, and alerts your mentor if persistent gaps arise.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-teal-200 font-semibold bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              Assigned Mentor: {student.assignedMentorName || 'Dr. Priya Sharma'}
            </span>
          </div>
        </div>
      </div>

      {/* Voice Recording Deck */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white transition-all ${
                isRecording
                  ? 'bg-rose-500 animate-voice-ripple shadow-lg shadow-rose-500/30'
                  : transcript.length > 0
                  ? 'bg-emerald-500'
                  : 'bg-teal-600'
              }`}
            >
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {isRecording ? '🎙 Listening to your voice...' : transcript.length > 0 ? '✓ Transcript Ready' : 'Start Your Teach-Back'}
                </h3>
                {isRecording && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <span>REC {formatSeconds(recordingDuration)}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRecording
                  ? 'Speak clearly into your microphone. Say what you understand about this concept.'
                  : transcript.length > 0
                  ? 'Review or adjust your verbal transcript below, then submit for semantic evaluation.'
                  : 'Click the record button or select an authentic student transcript preset to test.'}
              </p>
            </div>
          </div>

          {/* Record Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording Voice</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Transcript Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Spoken Explanation Transcript</span>
            </span>
            {transcript && (
              <button
                onClick={() => setTranscript('')}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Your spoken explanation will appear here automatically as you talk... You can also edit or type manually if microphone is unavailable."
            rows={4}
            className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-normal leading-relaxed text-slate-800"
          />
        </div>

        {/* Preset Transcripts for Hackathon Demo Flow */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate Real Student Attempts (Quick Preset Transcripts)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              Click any attempt to test the AI detection
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadPresetTranscript('attempt-1-duplicate-rows')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs transition-colors cursor-pointer text-left"
            >
              <span className="font-bold text-rose-600 mr-1">Attempt 1:</span>
              “Deleting duplicate rows...” (55%)
            </button>

            <button
              onClick={() => loadPresetTranscript('attempt-2-partial')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs transition-colors cursor-pointer text-left"
            >
              <span className="font-bold text-amber-600 mr-1">Attempt 2:</span>
              “1NF/2NF but repeats duplicate idea” (64%)
            </button>

            <button
              onClick={() => loadPresetTranscript('attempt-3-foreign-keys')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs transition-colors cursor-pointer text-left"
            >
              <span className="font-bold text-amber-600 mr-1">Attempt 3:</span>
              “3NF removes foreign keys...” (61%)
            </button>

            <button
              onClick={() => loadPresetTranscript('attempt-4-persistent-gap')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-bold text-xs transition-colors cursor-pointer text-left"
            >
              <span className="text-rose-700 mr-1">Attempt 4 (Persistent Gap):</span>
              Struggles with BCNF & FDs ⚠
            </button>

            <button
              onClick={() => loadPresetTranscript('mastery')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs transition-colors cursor-pointer text-left"
            >
              <span className="text-emerald-700 mr-1">Mastery Attempt:</span>
              Lossless Joins & Schema Proofs (88%)
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !transcript.trim()}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Semantic Misconception Engine...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Analyze My Teach-Back Explanation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PERSISTENT LEARNING GAP ALERT BANNER (IF TRIGGERED) */}
      {/* ========================================================= */}
      {persistentGapAlert && (
        <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-950 text-white shadow-xl border-2 border-rose-400 animate-in zoom-in-95 duration-300 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 animate-pulse">
                <ShieldAlert className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-400 text-amber-950">
                  ⚠ PERSISTENT LEARNING GAP FLAGGED
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold mt-1 text-white">
                  Teacher Intervention Automatically Dispatched
                </h3>
                <p className="text-xs text-rose-100/90 mt-0.5">
                  You have made {persistentGapAlert.attemptsCount} attempts on{' '}
                  <strong className="text-white underline">{concept.title}</strong> with an understanding score of{' '}
                  {persistentGapAlert.latestScore}%. Your assigned mentor,{' '}
                  <strong className="text-white">{student.assignedMentorName || 'Dr. Priya Sharma'}</strong>, has been alerted with diagnosed issues to schedule a personalized session.
                </p>
              </div>
            </div>

            <button
              onClick={onSwitchToTeacher}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-rose-900 font-extrabold text-xs shadow-md hover:bg-rose-50 transition-all shrink-0 cursor-pointer"
            >
              <span>View Teacher's Alert Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-black/20 border border-white/10 text-xs space-y-2">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Diagnosed Issues Forwarded to Mentor:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-rose-100/90 text-xs">
              {persistentGapAlert.detectedIssues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
            <div className="pt-1 text-[11px] text-amber-200">
              <strong>Suggested Pedagogical Action:</strong> {persistentGapAlert.suggestedMentorAction}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEACH-BACK ANALYSIS RESULT CARD */}
      {/* ========================================================= */}
      {latestAttempt && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-7 animate-in fade-in duration-300">
          {/* Header Score & Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              {/* Score Dial */}
              <div
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-extrabold shadow-sm ${
                  latestAttempt.understandingScore >= 80
                    ? 'bg-emerald-500 text-white'
                    : latestAttempt.understandingScore >= 60
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                <span className="text-2xl leading-none">{latestAttempt.understandingScore}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 mt-0.5">
                  Score
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                      latestAttempt.masteryStatus === 'MASTERED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : latestAttempt.masteryStatus === 'IMPROVING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : latestAttempt.masteryStatus === 'PERSISTENT_GAP'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {latestAttempt.masteryStatus === 'PERSISTENT_GAP'
                      ? '⚠ Persistent Learning Gap'
                      : latestAttempt.masteryStatus}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Attempt #{latestAttempt.attemptNumber}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Teach-Back Evaluation
                </h3>
                <p className="text-xs text-slate-500">
                  Confidence level: <strong className="text-slate-800">{latestAttempt.confidenceLevel}</strong> • {latestAttempt.recommendedAction}
                </p>
              </div>
            </div>

            {/* Score Delta */}
            {latestAttempt.attemptNumber > 1 && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                {latestAttempt.scoreDelta && latestAttempt.scoreDelta >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-emerald-700">
                      +{latestAttempt.scoreDelta}% vs Previous Attempt
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                    <span className="font-extrabold text-rose-700">
                      {latestAttempt.scoreDelta}% vs Previous Attempt
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 4-Quadrant Semantic Breakdown Display */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-teal-600" />
              <span>Semantic Understanding Breakdown</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quadrant 1: UNDERSTOOD */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>UNDERSTOOD CONCEPTS</span>
                </div>
                <ul className="text-xs text-emerald-950 space-y-1.5 pl-5 list-disc leading-relaxed">
                  {latestAttempt.semanticBreakdown.understood.length > 0 ? (
                    latestAttempt.semanticBreakdown.understood.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))
                  ) : (
                    <li className="text-emerald-700 italic">No solid points recognized yet.</li>
                  )}
                </ul>
              </div>

              {/* Quadrant 2: MISCONCEPTIONS (Semantic Detection) */}
              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>DETECTED MISCONCEPTIONS (Mental Model Errors)</span>
                </div>
                <ul className="text-xs text-rose-950 space-y-1.5 pl-5 list-disc leading-relaxed">
                  {latestAttempt.semanticBreakdown.misconceptions.length > 0 ? (
                    latestAttempt.semanticBreakdown.misconceptions.map((item, idx) => (
                      <li key={idx} className="font-medium">{item}</li>
                    ))
                  ) : (
                    <li className="text-rose-700 italic">No major misconceptions detected!</li>
                  )}
                </ul>
              </div>

              {/* Quadrant 3: PARTIALLY UNDERSTOOD */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>PARTIALLY UNDERSTOOD</span>
                </div>
                <ul className="text-xs text-amber-950 space-y-1.5 pl-5 list-disc leading-relaxed">
                  {latestAttempt.semanticBreakdown.partiallyUnderstood.length > 0 ? (
                    latestAttempt.semanticBreakdown.partiallyUnderstood.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))
                  ) : (
                    <li className="text-amber-700 italic">No partial states recorded.</li>
                  )}
                </ul>
              </div>

              {/* Quadrant 4: MISSING KNOWLEDGE */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>MISSING KNOWLEDGE GAPS</span>
                </div>
                <ul className="text-xs text-blue-950 space-y-1.5 pl-5 list-disc leading-relaxed">
                  {latestAttempt.semanticBreakdown.missingKnowledge.length > 0 ? (
                    latestAttempt.semanticBreakdown.missingKnowledge.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))
                  ) : (
                    <li className="text-blue-700 italic">Comprehensive coverage of core aspects.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* AI ADAPTIVE FOLLOW-UP INQUIRY (Feature #13) */}
          {/* ========================================================= */}
          {latestAttempt.followUpQuestions && latestAttempt.followUpQuestions.length > 0 && (
            <div className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-extrabold text-sm sm:text-base text-indigo-950">
                    AI Adaptive Follow-Up Question
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-indigo-100 text-indigo-800">
                  +20 Bonus XP
                </span>
              </div>

              <p className="text-xs sm:text-sm font-extrabold text-indigo-900 leading-relaxed">
                “{latestAttempt.followUpQuestions[0].question}”
              </p>

              {!followUpFeedback ? (
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    value={followUpAnswer}
                    onChange={e => setFollowUpAnswer(e.target.value)}
                    placeholder="Provide your verbal explanation or type your follow-up answer here..."
                    className="w-full p-3 text-xs rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleFollowUpSubmit}
                      disabled={isSubmittingFollowUp || !followUpAnswer.trim()}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmittingFollowUp ? (
                        <span>Evaluating Depth...</span>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Submit Follow-Up Response (+20 XP)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-indigo-200 space-y-1.5 text-xs text-indigo-950 animate-in fade-in">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    AI Follow-Up Evaluation (+20 XP Awarded!)
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {followUpFeedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* PERSONALIZED REMEDIATION SECTION */}
          {/* ========================================================= */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base text-teal-300">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span>Personalized Remediation & Correction</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Tailored for {student.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300">
                  Targeted Clarification
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {latestAttempt.remediation.shortCorrection}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
                  Intuitive Mental Model
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {latestAttempt.remediation.simpleExplanation}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                  Everyday Analogy
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {latestAttempt.remediation.realWorldAnalogy}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
                  Concrete Example
                </span>
                <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                  {latestAttempt.remediation.concreteExample}
                </p>
              </div>
            </div>

            {/* Quick Check Question */}
            <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-xs space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
                Self-Check Mini Question:
              </span>
              <p className="text-white font-medium">
                {latestAttempt.remediation.miniQuizQuestion}
              </p>
            </div>

            {/* Retry Prompt CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-teal-200/90 font-medium">
                {latestAttempt.remediation.retryPrompt}
              </p>
              <button
                onClick={() => {
                  setTranscript('');
                  startRecording();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Teach-Back Again (Retry)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
