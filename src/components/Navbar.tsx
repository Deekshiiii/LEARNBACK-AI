import React from 'react';
import {
  Sparkles,
  GraduationCap,
  Users,
  School as SchoolIcon,
  Bell,
  ArrowRightLeft,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onSelectRole: (role: 'student' | 'teacher' | 'admin') => void;
  onOpenSchoolModal: () => void;
  onLogout: () => void;
  onOpenLanding: () => void;
  activeAlertCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectRole,
  onOpenSchoolModal,
  onLogout,
  onOpenLanding,
  activeAlertCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenLanding}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-700 via-cyan-800 to-indigo-900 bg-clip-text text-transparent">
                  LEARNBACK<span className="text-teal-600">.AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-teal-50 text-teal-700 border border-teal-200/60">
                  Voice Teach-Back & Mentor Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Learn • Explain • Improve • Master
              </p>
            </div>
          </div>

          {/* Center: School Badge */}
          {currentUser && (
            <div
              onClick={onOpenSchoolModal}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold cursor-pointer transition-colors border border-slate-200/60"
              title="Click to change school"
            >
              <SchoolIcon className="w-3.5 h-3.5 text-teal-600" />
              <span className="truncate max-w-[200px]">{currentUser.schoolName}</span>
              <span className="text-[10px] text-teal-600 font-bold ml-0.5">Switch</span>
            </div>
          )}

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <>
                {/* Demo Quick Switcher Button */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => onSelectRole('student')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentUser.role === 'student'
                        ? 'bg-white text-teal-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                    <span className="hidden sm:inline">Student View</span>
                    <span className="sm:hidden">Student</span>
                  </button>
                  <button
                    onClick={() => onSelectRole('teacher')}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentUser.role === 'teacher'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Teacher Portal</span>
                    <span className="sm:hidden">Teacher</span>
                    {activeAlertCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold animate-pulse">
                        {activeAlertCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => onSelectRole('admin')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentUser.role === 'admin'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">School Admin</span>
                    <span className="sm:hidden">Admin</span>
                  </button>
                </div>

                {/* Profile Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium capitalize">
                      {currentUser.role === 'teacher' ? 'Faculty Mentor' : currentUser.role === 'admin' ? 'Institutional Admin' : (currentUser.grade || 'Student')}
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSchoolModal}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Select School
                </button>
                <button
                  onClick={() => onSelectRole('student')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Student Login
                </button>
                <button
                  onClick={() => onSelectRole('teacher')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Teacher Login
                </button>
                <button
                  onClick={() => onSelectRole('admin')}
                  className="hidden md:inline-flex px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
