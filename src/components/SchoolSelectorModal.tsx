import React, { useState, useEffect } from 'react';
import {
  School as SchoolIcon,
  GraduationCap,
  Users,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';
import { School, User } from '../types';
import { fetchSchools, loginUser, registerUser } from '../services/api';

interface SchoolSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  defaultRole?: 'student' | 'teacher' | 'admin';
}

export const SchoolSelectorModal: React.FC<SchoolSelectorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRole = 'student',
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin'>(defaultRole);

  // Auth form state
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('Grade 12 - Section A');
  const [subject, setSubject] = useState('Computer Science & DBMS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools()
      .then(data => {
        setSchools(data);
        if (data.length > 0) setSelectedSchool(data[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setSelectedRole(defaultRole);
  }, [defaultRole]);

  if (!isOpen) return null;

  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school);
    setStep(2);
  };

  const handleSelectRole = (role: 'student' | 'teacher' | 'admin') => {
    setSelectedRole(role);
    setStep(3);
  };

  const handleQuickDemoLogin = async (role: 'student' | 'teacher' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      const demoEmail = role === 'student'
        ? 'arun.k@rmk.ac.in'
        : role === 'teacher'
        ? 'priya.sharma@rmk.ac.in'
        : 'admin@rmk.ac.in';
      const result = await loginUser(demoEmail, role === 'admin' ? 'teacher' : role);
      onSuccess(result.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;

    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const payload: Partial<User> = {
          name,
          email,
          role: selectedRole,
          schoolId: selectedSchool.id,
          schoolName: selectedSchool.name,
          grade: selectedRole === 'student' ? grade : undefined,
          subject: selectedRole === 'teacher' ? subject : undefined,
        };
        const res = await registerUser(payload);
        onSuccess(res.user);
      } else {
        const res = await loginUser(email, selectedRole);
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-teal-700 via-cyan-800 to-indigo-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-teal-400/20 text-teal-200 border border-teal-400/30">
              Step {step} of 3
            </span>
            <span className="text-xs text-teal-100 font-medium">
              {step === 1 ? 'Select Your School' : step === 2 ? 'Choose Your Role' : 'Authenticate & Sign In'}
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {step === 1 && 'Welcome to LEARNBACK AI'}
            {step === 2 && 'Select Your Academic Role'}
            {step === 3 && (isRegister ? `Register as ${selectedRole === 'student' ? 'Student' : 'Teacher'}` : `Sign in to ${selectedSchool?.name || 'School'}`)}
          </h2>
          <p className="text-xs text-teal-100/90 mt-1">
            {step === 1 && 'Select your affiliated educational institution to continue'}
            {step === 2 && 'Access role-tailored dashboards and pedagogical tools'}
            {step === 3 && 'Access voice teach-back, analysis, and mentor intervention workflows'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: SCHOOL SELECTION */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Available Partner Institutions
              </p>
              {schools.map(school => (
                <div
                  key={school.id}
                  onClick={() => handleSelectSchool(school)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    selectedSchool?.id === school.id
                      ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      <SchoolIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                        {school.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {school.city} • Code: {school.code}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium">Selected School:</span>{' '}
                  <span className="font-bold text-slate-800">{selectedSchool?.name}</span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-teal-600 font-bold hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Student Card */}
                <div
                  onClick={() => handleSelectRole('student')}
                  className="p-4 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer group text-center"
                >
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Student</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Upload notes, Voice AI, Teach-Back, and remediation.
                  </p>
                  <button className="mt-3 w-full py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-xs cursor-pointer">
                    Continue as Student
                  </button>
                </div>

                {/* Teacher / Mentor Card */}
                <div
                  onClick={() => handleSelectRole('teacher')}
                  className="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group text-center"
                >
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Faculty Mentor</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Persistent gaps, misconception analysis, and interventions.
                  </p>
                  <button className="mt-3 w-full py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer">
                    Continue as Mentor
                  </button>
                </div>

                {/* Administrator Card */}
                <div
                  onClick={() => handleSelectRole('admin')}
                  className="p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all cursor-pointer group text-center"
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Administrator</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Manage schools, assign mentors, and institutional governance.
                  </p>
                  <button className="mt-3 w-full py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs cursor-pointer">
                    Continue as Admin
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AUTHENTICATION (LOGIN / REGISTER + 1-CLICK DEMO) */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Back navigation pill */}
              <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-100 pb-3">
                <span>
                  <strong className="text-slate-800 capitalize">{selectedRole === 'admin' ? 'Administrator' : selectedRole}</strong> at{' '}
                  <strong className="text-slate-800">{selectedSchool?.name}</strong>
                </span>
                <button
                  onClick={() => setStep(2)}
                  className="text-teal-600 font-bold hover:underline"
                >
                  Change Role
                </button>
              </div>

              {/* Instant 1-Click Demo Profiles */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold flex items-center gap-1.5 text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    One-Click Demo Profiles
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded-full">
                    Recommended for Review
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mb-3 leading-snug">
                  Jump right into the fully populated demo data without typing credentials:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('student')}
                    disabled={loading}
                    className="py-2 px-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Arun (Student)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('teacher')}
                    disabled={loading}
                    className="py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-11px font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Dr. Priya (Mentor)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin')}
                    disabled={loading}
                    className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Principal (Admin)</span>
                  </button>
                </div>
              </div>

              {/* Normal Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedRole === 'student' ? 'e.g. Arun Kumar' : 'e.g. Dr. Priya Sharma'}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={selectedRole === 'student' ? 'arun.k@rmk.ac.in' : 'priya.sharma@rmk.ac.in'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    defaultValue="demoPassword123"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {isRegister && selectedRole === 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Class / Grade
                    </label>
                    <input
                      type="text"
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}

                {isRegister && selectedRole === 'teacher' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject / Specialization
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-xs text-teal-600 font-semibold hover:underline"
                  >
                    {isRegister ? 'Already have an account? Sign In' : 'New student or teacher? Register here'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
