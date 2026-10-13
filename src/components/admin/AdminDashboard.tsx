import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  School as SchoolIcon,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  ArrowRight,
  Server,
  Zap,
  Activity,
  Edit2
} from 'lucide-react';
import { School, User } from '../../types';
import {
  fetchAdminOverview,
  fetchAdminUsers,
  fetchSchools,
  createAdminUser,
  assignMentorToStudent,
  createSchool,
  AdminOverviewData
} from '../../services/api';

interface AdminDashboardProps {
  adminUser: User;
  onSwitchToStudent: () => void;
  onSwitchToTeacher: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onSwitchToStudent,
  onSwitchToTeacher,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'schools' | 'diagnostics'>('students');
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [schoolsList, setSchoolsList] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Reassign Modal State
  const [assignModalStudent, setAssignModalStudent] = useState<User | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);

  // New Student Modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('Grade 12 - Section A');
  const [newStudentMentorId, setNewStudentMentorId] = useState('');

  // New School Modal
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('');

  const loadData = async () => {
    try {
      const [ov, users, schs] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminUsers(),
        fetchSchools(),
      ]);
      setOverview(ov);
      setUsersList(users);
      setSchoolsList(schs);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const teachers = usersList.filter(u => u.role === 'teacher');
  const students = usersList.filter(u => u.role === 'student');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.assignedMentorName && s.assignedMentorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAssignMentor = async () => {
    if (!assignModalStudent || !selectedMentorId) return;
    setAssigningLoading(true);
    try {
      await assignMentorToStudent(assignModalStudent.id, selectedMentorId);
      await loadData();
      setAssignModalStudent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) return;
    try {
      await createAdminUser({
        name: newStudentName,
        email: newStudentEmail,
        role: 'student',
        grade: newStudentGrade,
        schoolId: adminUser.schoolId,
        assignedMentorId: newStudentMentorId || teachers[0]?.id,
      });
      setShowAddStudentModal(false);
      setNewStudentName('');
      setNewStudentEmail('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName) return;
    try {
      await createSchool({
        name: newSchoolName,
        code: newSchoolCode,
        city: newSchoolCity,
      });
      setShowAddSchoolModal(false);
      setNewSchoolName('');
      setNewSchoolCode('');
      setNewSchoolCity('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading Administrator Governance Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              School Administrator Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {adminUser.schoolName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Governance Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage institutional roster, assign faculty mentors, configure partner schools, and monitor learning health.
          </p>
        </div>

        {/* Quick persona jump buttons for presentation */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onSwitchToStudent}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <span>Switch to Student View</span>
          </button>
          <button
            onClick={onSwitchToTeacher}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Switch to Teacher Portal</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Students
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-600">
              {overview?.totalStudents || students.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Enrolled</span>
          </div>
          <p className="text-[11px] text-teal-700 font-semibold mt-2">
            Active Accounts
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Faculty Mentors
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
              {overview?.totalTeachers || teachers.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Staff</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-2">
            Subject Leads
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Partner Schools
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {overview?.totalSchools || schoolsList.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Campuses</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-2">
            Institutional Network
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Concepts & Curricula
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-600">
              {overview?.totalConcepts || 14}
            </span>
            <span className="text-xs text-slate-400 font-medium">Modules</span>
          </div>
          <p className="text-[11px] text-cyan-700 font-semibold mt-2">
            DBMS & Algorithms
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Alerts
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {overview?.pendingAlerts || 1}
            </span>
            <span className="text-xs text-slate-400 font-medium">Pending</span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-2">
            Intervention Required
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Average Mastery
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {overview?.avgMastery || 78}%
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-2">
            Across Cohorts
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Accounts & Mentor Allocations</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-teal-500 text-white font-bold">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'teachers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty & Mentors</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500 text-white font-bold">
            {teachers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('schools')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'schools'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <SchoolIcon className="w-4 h-4" />
          <span>Partner Schools</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-700 text-white font-bold">
            {schoolsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>AI & System Health</span>
        </button>
      </div>

      {/* TAB 1: STUDENTS & MENTOR ASSIGNMENT */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name, email, or mentor..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
            </div>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Class / Grade</th>
                    <th className="px-6 py-3.5">School</th>
                    <th className="px-6 py-3.5">Assigned Mentor</th>
                    <th className="px-6 py-3.5">Level / XP</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{student.name}</p>
                            <p className="text-[11px] text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {student.grade || 'Grade 12'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {student.schoolName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            {student.assignedMentorName || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">Level {student.level || 4}</span>
                        <span className="text-[11px] text-slate-400 ml-1">({student.xp || 820} XP)</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setAssignModalStudent(student);
                            setSelectedMentorId(student.assignedMentorId || teachers[0]?.id || '');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          <span>Reassign Mentor</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY & MENTORS */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map(teacher => {
              const assignedMentees = students.filter(s => s.assignedMentorId === teacher.id);
              return (
                <div key={teacher.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-lg shadow-xs">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{teacher.name}</h3>
                        <p className="text-xs text-indigo-600 font-semibold">{teacher.subject || 'Faculty Mentor'}</p>
                        <p className="text-[11px] text-slate-400">{teacher.email}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Assigned Mentees</span>
                    <span className="font-extrabold text-slate-900">{assignedMentees.length} Students</span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Student Cohort:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {assignedMentees.map(s => (
                        <span key={s.id} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PARTNER SCHOOLS */}
      {activeTab === 'schools' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddSchoolModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New School</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {schoolsList.map(school => {
              const schoolStudents = students.filter(s => s.schoolId === school.id);
              const schoolTeachers = teachers.filter(t => t.schoolId === school.id);
              return (
                <div key={school.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                      <SchoolIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{school.name}</h4>
                      <p className="text-xs text-slate-400">{school.city} • Code: {school.code}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Students</p>
                      <p className="text-base font-extrabold text-teal-600">{schoolStudents.length}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Mentors</p>
                      <p className="text-base font-extrabold text-indigo-600">{schoolTeachers.length || 1}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM & AI DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>AI Learning Engine Status</span>
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800">Gemini 3.8 Flash SDK</p>
                  <p className="text-[11px] text-slate-500">Multimodal teach-back, rubric grading, remediation</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                  ONLINE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800">Voice Synthesis (TTS) Engine</p>
                  <p className="text-[11px] text-slate-500">Gemini Native Audio with Web Speech API fallback</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                  READY
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800">Speech-to-Text (STT) Recognition</p>
                  <p className="text-[11px] text-slate-500">Live WebkitSpeechRecognition + simulated waveforms</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                  READY
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800">RAG Vector Document Ingestion</p>
                  <p className="text-[11px] text-slate-500">PDF, DOCX, TXT chunking with semantic citation links</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Intelligent Intervention Rules</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
                <p className="font-bold text-amber-900">Persistent Difficulty Rule:</p>
                <p className="mt-1 text-amber-800 leading-relaxed">
                  Triggers an automatic <strong>INTERVENTION REQUIRED</strong> alert to the assigned teacher when a student records <strong>2 or more consecutive attempts</strong> on the same concept with a score below 60% or unresolved misconceptions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/60">
                <p className="font-bold text-indigo-900">Pedagogical Feedback Sync:</p>
                <p className="mt-1 text-indigo-800 leading-relaxed">
                  When a teacher logs clinical guidance or assigns a practice worksheet, the intervention state resolves to <strong>INTERVENED</strong> and dispatches real-time notifications to the student dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN MENTOR MODAL */}
      {assignModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                Reassign Faculty Mentor
              </h3>
              <button
                onClick={() => setAssignModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Assign a faculty mentor for <strong>{assignModalStudent.name}</strong> ({assignModalStudent.email}).
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Faculty Mentor</label>
              <select
                value={selectedMentorId}
                onChange={e => setSelectedMentorId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subject || 'Faculty Mentor'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignModalStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignMentor}
                disabled={assigningLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
              >
                {assigningLoading ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateStudent} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Enroll New Student</h3>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Reddy"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram.r@rmk.ac.in"
                  value={newStudentEmail}
                  onChange={e => setNewStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Class / Grade</label>
                <input
                  type="text"
                  value={newStudentGrade}
                  onChange={e => setNewStudentGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Faculty Mentor</label>
                <select
                  value={newStudentMentorId}
                  onChange={e => setNewStudentMentorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD SCHOOL MODAL */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateSchool} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Register Partner School</h3>
              <button
                type="button"
                onClick={() => setShowAddSchoolModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Xavier Model School"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">School Code</label>
                <input
                  type="text"
                  placeholder="e.g. SXMS"
                  value={newSchoolCode}
                  onChange={e => setNewSchoolCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={newSchoolCity}
                  onChange={e => setNewSchoolCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSchoolModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Register School
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
