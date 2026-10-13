import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Award,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock,
  Send,
  Sparkles,
  BarChart3,
  Layers,
  ChevronRight,
  BookOpen,
  Calendar,
  X,
  MessageSquare
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MentorAlert, MentorIntervention, User } from '../../types';
import {
  fetchTeacherRoster,
  fetchMentorAlerts,
  fetchTeacherStudentDeepDive,
  submitMentorIntervention
} from '../../services/api';
import { ClassMisconceptionHeatmap } from './ClassMisconceptionHeatmap';
import { AITeacherAssistantPanel } from './AITeacherAssistantPanel';
import { MentorMessagingPanel } from './MentorMessagingPanel';

interface TeacherDashboardProps {
  teacher: User;
  onSwitchToStudent: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  onSwitchToStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'alerts' | 'messages' | 'heatmap' | 'assistant' | 'analytics'>('roster');
  const [rosterData, setRosterData] = useState<any>(null);
  const [alerts, setAlerts] = useState<MentorAlert[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [messagingStudentId, setMessagingStudentId] = useState<string | null>(null);
  const [studentDeepDive, setStudentDeepDive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);

  // Intervention Modal State
  const [interventionModalOpen, setInterventionModalOpen] = useState(false);
  const [targetAlert, setTargetAlert] = useState<MentorAlert | null>(null);
  const [interventionType, setInterventionType] = useState<string>('1-ON-1_SESSION');
  const [interventionNotes, setInterventionNotes] = useState<string>('');
  const [prescribedResource, setPrescribedResource] = useState<string>('');
  const [submittingIntervention, setSubmittingIntervention] = useState(false);

  const loadData = async () => {
    try {
      const [roster, alertList] = await Promise.all([
        fetchTeacherRoster(teacher.id),
        fetchMentorAlerts(),
      ]);
      setRosterData(roster);
      setAlerts(alertList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacher.id]);

  const handleOpenStudentDeepDive = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setDeepDiveLoading(true);
    try {
      const data = await fetchTeacherStudentDeepDive(studentId);
      setStudentDeepDive(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDeepDiveLoading(false);
    }
  };

  const handleOpenInterventionModal = (alert?: MentorAlert) => {
    if (alert) {
      setTargetAlert(alert);
      setInterventionNotes(
        `Met with ${alert.studentName}. Walked through visual relation decomposition without data loss. Clarified functional dependency determinants.`
      );
      setPrescribedResource(
        'Practice Sheet: Armstrong Axioms & Decomposition (Exercise 3.2)'
      );
    } else if (studentDeepDive) {
      setTargetAlert(null);
      setInterventionNotes(
        `Scheduled 1-on-1 clinic for ${studentDeepDive.student.name} to reinforce core theoretical models.`
      );
      setPrescribedResource('Targeted Normalization Worksheet');
    }
    setInterventionModalOpen(true);
  };

  const handleSubmitIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingIntervention(true);

    try {
      const studentId = targetAlert?.studentId || selectedStudentId || 'student-1';
      const conceptId = targetAlert?.conceptId || 'concept-normalization';

      await submitMentorIntervention({
        alertId: targetAlert?.id,
        studentId,
        teacherId: teacher.id,
        conceptId,
        interventionType,
        notes: interventionNotes,
        prescribedResource,
      });

      alert('Mentor intervention logged and dispatched to student!');
      setInterventionModalOpen(false);
      loadData();
      if (selectedStudentId) {
        handleOpenStudentDeepDive(selectedStudentId);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit intervention');
    } finally {
      setSubmittingIntervention(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading teacher cohort telemetry...</p>
        </div>
      </div>
    );
  }

  // Analytics datasets for Recharts
  const attemptProgressionData = [
    { attempt: 'Attempt 1', Arun: 55, Rahul: 48, CohortAvg: 62 },
    { attempt: 'Attempt 2', Arun: 64, Rahul: 56, CohortAvg: 70 },
    { attempt: 'Attempt 3', Arun: 61, Rahul: 59, CohortAvg: 76 },
    { attempt: 'Attempt 4', Arun: 63, Rahul: 72, CohortAvg: 81 },
  ];

  const conceptMasteryCohortData = [
    { concept: 'SQL Joins', mastery: 89, studentsCount: 4 },
    { concept: 'Primary Key', mastery: 82, studentsCount: 4 },
    { concept: 'BCNF', mastery: 64, studentsCount: 4 },
    { concept: 'Functional Dep', mastery: 58, studentsCount: 4 },
    { concept: 'Normalization', mastery: 55, studentsCount: 4 },
  ];

  const masteryDistributionData = [
    { name: 'Mastered (>=80%)', value: 45, color: '#10b981' },
    { name: 'Improving (60-79%)', value: 30, color: '#f59e0b' },
    { name: 'Needs Support (<60%)', value: 15, color: '#f43f5e' },
    { name: 'Persistent Gap', value: 10, color: '#e11d48' },
  ];

  const pendingAlerts = alerts.filter(a => a.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Teacher Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Teacher & Mentor Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {teacher.schoolName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {teacher.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-3">
            <span>Specialization: <strong>{teacher.subject || 'Computer Science & DBMS'}</strong></span>
            <span>•</span>
            <span>Active Student Cohort: <strong>32 Enrolled</strong></span>
          </p>
        </div>

        <button
          onClick={onSwitchToStudent}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <span>Open Student View (Arun Kumar)</span>
          <ArrowRight className="w-4 h-4 text-teal-600" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Students
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {rosterData?.totalStudents || 4}
            </span>
            <span className="text-xs text-slate-400 font-medium">in roster</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Grade 12 CS Cohort
          </p>
        </div>

        {/* Card 2: Weak Concepts */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Concepts Under 70%
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {rosterData?.conceptsRequiringAttention || 3}
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-2 truncate">
            Normalization, FD, BCNF
          </p>
        </div>

        {/* Card 3: Persistent Learning Gaps (Critical Innovation) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-300 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Persistent Gaps</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700">
              {pendingAlerts.length}
            </span>
            <span className="text-xs text-rose-600 font-bold">critical</span>
          </div>
          <p className="text-[11px] text-rose-800 font-bold mt-2">
            Auto-escalated to you
          </p>
        </div>

        {/* Card 4: Students Improving */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Students Improving
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {rosterData?.studentsImprovingCount || 2}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-2">
            Demonstrating mastery
          </p>
        </div>

        {/* Card 5: Needing Intervention */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Needs Intervention
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
              {rosterData?.studentsNeedingInterventionCount || 2}
            </span>
            <span className="text-xs text-slate-400 font-medium">students</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-2 truncate">
            Arun Kumar, Rahul Varma
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>My Students & Cohort Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Intervention Alerts</span>
          {pendingAlerts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white text-rose-700 font-black">
              {pendingAlerts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Student Messaging & Feedback</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'heatmap'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Misconception Heatmap</span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'assistant'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Teacher Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Cohort Analytics & Charts</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: MY STUDENTS ROSTER */}
      {/* ========================================================= */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Enrolled Students
              </h3>
              <p className="text-xs text-slate-500">
                Click any student to view their teach-back history, detected misconceptions, and record interventions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Cohort:</span>
              <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl">
                Grade 12 - DBMS
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Total Attempts</th>
                  <th className="py-3 px-4">Weakest Concept</th>
                  <th className="py-3 px-4">Latest Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rosterData?.students?.map((s: any) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => handleOpenStudentDeepDive(s.id)}
                  >
                    <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block group-hover:text-indigo-600 transition-colors font-extrabold">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {s.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {s.grade}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      {s.totalAttempts}
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-700">
                      {s.weakConcepts.length > 0 ? (
                        <span className="text-rose-700 font-bold">
                          {s.weakConcepts.join(', ')}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">None (Mastered)</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-extrabold text-sm text-slate-900">
                        {s.averageScore}%
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          s.status === 'INTERVENTION_REQUIRED'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                            : s.status === 'NEEDS_ATTENTION'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {s.status === 'INTERVENTION_REQUIRED'
                          ? '⚠ Intervention Required'
                          : s.status === 'NEEDS_ATTENTION'
                          ? 'Needs Attention'
                          : 'On Track'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setMessagingStudentId(s.id);
                            setActiveTab('messages');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                          title="Send feedback or encouragement"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                          <span>Message</span>
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenStudentDeepDive(s.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: INTERVENTION ALERTS */}
      {/* ========================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-amber-300 border border-white/20 animate-pulse">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-amber-950">
                  Automated Pedagogical Alert Service
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold mt-1 text-white">
                  Persistent Learning Gap Alerts
                </h2>
                <p className="text-xs text-rose-100/90 mt-0.5">
                  Triggered when a student fails to master a concept after 3 or more attempts and exhibits persistent semantic misconceptions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4 hover:border-rose-400 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                        {alert.severity} Priority Alert
                      </span>
                      <span className="text-xs text-slate-400">
                        Flagged on {new Date(alert.flaggedDate).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          alert.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                      Student: <span className="text-indigo-700">{alert.studentName}</span> ({alert.studentGrade})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Concept: <strong className="text-slate-800">{alert.conceptTitle}</strong> • {alert.attemptsCount} attempts made • Latest Score: <strong className="text-rose-600">{alert.latestScore}%</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setMessagingStudentId(alert.studentId);
                        setActiveTab('messages');
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                      <span>Send Direct Feedback</span>
                    </button>
                    <button
                      onClick={() => handleOpenInterventionModal(alert)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      Record Mentor Intervention
                    </button>
                    <button
                      onClick={() => handleOpenStudentDeepDive(alert.studentId)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Inspect All Attempts
                    </button>
                  </div>
                </div>

                {/* Detected Issues */}
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5 text-xs text-rose-950">
                  <div className="font-extrabold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Diagnosed Misconceptions from Student Transcripts:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {alert.detectedIssues.map((issue, idx) => (
                      <li key={idx} className="font-medium">{issue}</li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Pedagogical Action */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950">
                  <span className="font-extrabold text-indigo-900 block mb-0.5">
                    Suggested Mentor Action:
                  </span>
                  <p className="text-indigo-900/90 leading-relaxed font-medium">
                    {alert.suggestedMentorAction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: COHORT ANALYTICS WITH RECHARTS */}
      {/* ========================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Progress over Attempts (Line Chart) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Student Progress Over Multiple Attempts
                </h4>
                <p className="text-xs text-slate-500">
                  Compares Arun Kumar and Rahul Varma against Cohort Average on Normalization.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attemptProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="attempt" tick={{ fontSize: 11 }} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Arun"
                      name="Arun Kumar (Persistent Gap)"
                      stroke="#e11d48"
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Rahul"
                      name="Rahul Varma"
                      stroke="#0d9488"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="CohortAvg"
                      name="Cohort Benchmark"
                      stroke="#64748b"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Concept Mastery Across Cohort (Bar Chart) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Concept Mastery Across Cohort
                </h4>
                <p className="text-xs text-slate-500">
                  Mean understanding score per curriculum unit.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conceptMasteryCohortData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="concept" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip />
                    <Bar
                      dataKey="mastery"
                      name="Average Mastery %"
                      fill="#0d9488"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 3 & 4: Mastery Distribution & Cohort Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie/Donut Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Mastery Distribution
                </h4>
                <p className="text-xs text-slate-500">
                  Proportion of cohort by status category.
                </p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={masteryDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {masteryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                {masteryDistributionData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="truncate text-slate-700">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cohort Heatmap Matrix (Students vs Concepts) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Cohort Heatmap: Students vs Concepts
                </h4>
                <p className="text-xs text-slate-500">
                  Instant visibility into who understands what and where persistent gaps cluster.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-3 text-left">Student</th>
                      <th className="py-2.5 px-3">Normalization</th>
                      <th className="py-2.5 px-3">Func. Dependency</th>
                      <th className="py-2.5 px-3">SQL Joins</th>
                      <th className="py-2.5 px-3">Primary Key</th>
                      <th className="py-2.5 px-3">BCNF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    <tr>
                      <td className="py-3 px-3 text-left font-extrabold text-slate-800">
                        Arun Kumar
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-800 font-mono text-[11px] font-bold">
                          63% ⚠
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-800 font-mono text-[11px] font-bold">
                          58% ⚠
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          88% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          82% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-mono text-[11px] font-bold">
                          61%
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-left font-extrabold text-slate-800">
                        Sneha Patel
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          84% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          80% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          92% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          88% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          81% ✓
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-left font-extrabold text-slate-800">
                        Rahul Varma
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-mono text-[11px] font-bold">
                          72%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-mono text-[11px] font-bold">
                          68%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          85% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          84% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-800 font-mono text-[11px] font-bold">
                          59% ⚠
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-left font-extrabold text-slate-800">
                        Divya Krishnan
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          86% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-mono text-[11px] font-bold">
                          74%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          90% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          85% ✓
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                          82% ✓
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 4: REAL-TIME MESSAGING & FEEDBACK (Feature) */}
      {/* ========================================================= */}
      {activeTab === 'messages' && (
        <MentorMessagingPanel
          teacher={teacher}
          students={rosterData?.students || []}
          preselectedStudentId={messagingStudentId}
          onOpenStudentDeepDive={handleOpenStudentDeepDive}
        />
      )}

      {/* ========================================================= */}
      {/* VIEW 5: CLASS MISCONCEPTION HEATMAP (Feature #23) */}
      {/* ========================================================= */}
      {activeTab === 'heatmap' && <ClassMisconceptionHeatmap />}

      {/* ========================================================= */}
      {/* VIEW 6: AI TEACHER ASSISTANT (Feature #26) */}
      {/* ========================================================= */}
      {activeTab === 'assistant' && <AITeacherAssistantPanel />}

      {/* ========================================================= */}
      {/* STUDENT DEEP-DIVE MODAL / DRAWER */}
      {/* ========================================================= */}
      {selectedStudentId && studentDeepDive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 text-white">
                    Detailed Pedagogical Audit
                  </span>
                  <span className="text-xs text-indigo-200">
                    {studentDeepDive.student.grade}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold mt-1 text-white">
                  {studentDeepDive.student.name}
                </h2>
                <p className="text-xs text-indigo-200/80">
                  {studentDeepDive.student.email} • {teacher.schoolName}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenInterventionModal()}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Record Intervention
                </button>
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="p-1.5 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Concept Mastery Bars */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Concept Mastery Breakdown
                </h4>
                <div className="space-y-2">
                  {studentDeepDive.conceptBreakdown.map((cb: any) => (
                    <div key={cb.conceptId} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-800">
                          {cb.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            {cb.attemptsCount} attempts
                          </span>
                          <span
                            className={`font-mono font-extrabold px-2 py-0.5 rounded-md ${
                              cb.latestScore >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : cb.latestScore >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {cb.latestScore}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cb.latestScore >= 80
                              ? 'bg-emerald-500'
                              : cb.latestScore >= 60
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${cb.latestScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Attempt Telemetry with Transcripts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Voice Teach-Back Transcripts & AI Semantic Misconception History
                </h4>
                <div className="space-y-3">
                  {studentDeepDive.attempts.map((att: any) => (
                    <div
                      key={att.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">
                            {att.conceptTitle}
                          </span>
                          <span className="text-slate-400 font-medium">
                            Attempt #{att.attemptNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              att.masteryStatus === 'MASTERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.masteryStatus === 'PERSISTENT_GAP'
                                ? 'bg-rose-100 text-rose-900 font-extrabold'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {att.masteryStatus}
                          </span>
                        </div>
                        <span className="font-extrabold font-mono text-sm">
                          {att.understandingScore}%
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 text-slate-700 italic">
                        “{att.transcript}”
                      </div>

                      {att.misconceptions?.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                          <strong>Detected Misconceptions:</strong>
                          <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                            {att.misconceptions.map((m: string, idx: number) => (
                              <li key={idx}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RECORD INTERVENTION ACTION MODAL */}
      {/* ========================================================= */}
      {interventionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 text-white relative">
              <button
                onClick={() => setInterventionModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-amber-950">
                Pedagogical Intervention Log
              </span>
              <h3 className="text-xl font-extrabold mt-1 text-white">
                Record Mentor Action
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Target: <strong>{targetAlert?.studentName || studentDeepDive?.student?.name || 'Arun Kumar'}</strong> on{' '}
                <strong>{targetAlert?.conceptTitle || 'Normalization'}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmitIntervention} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Intervention Format
                </label>
                <select
                  value={interventionType}
                  onChange={e => setInterventionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1-ON-1_SESSION">1-on-1 Pedagogical Session</option>
                  <option value="TARGETED_WORKSHEET">Targeted Practice Worksheet</option>
                  <option value="CONCEPT_REVIEW">Visual Schema Demonstration</option>
                  <option value="CUSTOM_EXERCISE">Custom Exam Formulation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentor Clinical Notes & Guidance (Sent to Student)
                </label>
                <textarea
                  rows={4}
                  required
                  value={interventionNotes}
                  onChange={e => setInterventionNotes(e.target.value)}
                  placeholder="Record your clinical guidance, explanation corrections, and next steps..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prescribed Revision Material / Assignment
                </label>
                <input
                  type="text"
                  value={prescribedResource}
                  onChange={e => setPrescribedResource(e.target.value)}
                  placeholder="e.g. Chapter 3 Exercise on Lossless Joins & Composite Keys"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInterventionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIntervention || !interventionNotes}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submittingIntervention ? (
                    <span>Logging Intervention...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit & Notify Student</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
