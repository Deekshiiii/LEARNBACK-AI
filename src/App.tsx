import React, { useState, useEffect } from 'react';
import { User, MentorAlert } from './types';
import { loginUser, fetchMentorAlerts } from './services/api';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SchoolSelectorModal } from './components/SchoolSelectorModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [defaultModalRole, setDefaultModalRole] = useState<'student' | 'teacher'>('student');
  const [activeAlerts, setActiveAlerts] = useState<MentorAlert[]>([]);

  // Pre-load demo state and alerts count
  useEffect(() => {
    fetchMentorAlerts()
      .then(alerts => {
        setActiveAlerts(alerts.filter(a => a.status === 'PENDING'));
      })
      .catch(console.warn);
  }, []);

  // Quick switch role
  const handleSelectRole = async (role: 'student' | 'teacher' | 'admin') => {
    try {
      const email = role === 'student'
        ? 'arun.k@rmk.ac.in'
        : role === 'teacher'
        ? 'priya.sharma@rmk.ac.in'
        : 'admin@rmk.ac.in';
      const res = await loginUser(email, role === 'admin' ? 'teacher' : role);
      setCurrentUser(res.user);
      setViewMode('app');
    } catch (err) {
      console.warn('Role switch fallback:', err);
      // Fallback user object
      const fallbackUser: User = role === 'student'
        ? {
            id: 'student-1',
            name: 'Arun Kumar',
            email: 'arun.k@rmk.ac.in',
            role: 'student',
            schoolId: 'sch-1',
            schoolName: 'RMK Higher Secondary School',
            grade: 'Grade 12 - Section A',
            assignedMentorId: 'teacher-1',
            assignedMentorName: 'Dr. Priya Sharma',
          }
        : role === 'teacher'
        ? {
            id: 'teacher-1',
            name: 'Dr. Priya Sharma',
            email: 'priya.sharma@rmk.ac.in',
            role: 'teacher',
            schoolId: 'sch-1',
            schoolName: 'RMK Higher Secondary School',
            subject: 'Computer Science & DBMS',
          }
        : {
            id: 'admin-1',
            name: 'Principal Rajan Sundaram',
            email: 'admin@rmk.ac.in',
            role: 'admin',
            schoolId: 'sch-1',
            schoolName: 'RMK Higher Secondary School',
          };
      setCurrentUser(fallbackUser);
      setViewMode('app');
    }
  };

  const handleLaunchDemoFlow = () => {
    handleSelectRole('student');
  };

  const handleOpenAuthModal = (role: 'student' | 'teacher' = 'student') => {
    setDefaultModalRole(role);
    setShowSchoolModal(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        onOpenSchoolModal={() => setShowSchoolModal(true)}
        onLogout={handleLogout}
        onOpenLanding={() => setViewMode('landing')}
        activeAlertCount={activeAlerts.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {viewMode === 'landing' || !currentUser ? (
          <LandingPage
            onStart={() => handleOpenAuthModal('student')}
            onStudentLogin={() => handleSelectRole('student')}
            onTeacherLogin={() => handleSelectRole('teacher')}
            onDemoFlow={handleLaunchDemoFlow}
          />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard
            adminUser={currentUser}
            onSwitchToStudent={() => handleSelectRole('student')}
            onSwitchToTeacher={() => handleSelectRole('teacher')}
          />
        ) : currentUser.role === 'teacher' ? (
          <TeacherDashboard
            teacher={currentUser}
            onSwitchToStudent={() => handleSelectRole('student')}
          />
        ) : (
          <StudentDashboard
            user={currentUser}
            onSwitchToTeacher={() => handleSelectRole('teacher')}
          />
        )}
      </main>

      {/* School Selection & Auth Modal */}
      <SchoolSelectorModal
        isOpen={showSchoolModal}
        onClose={() => setShowSchoolModal(false)}
        defaultRole={defaultModalRole}
        onSuccess={user => {
          setCurrentUser(user);
          setViewMode('app');
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">LEARNBACK AI</span>
            <span>—</span>
            <span>“Learn • Explain • Improve • Master”</span>
          </div>
          <p className="text-slate-400">
            Voice Teach-Back Analysis • Semantic Misconception Engine • Persistent Learning Gap Detection • Teacher Intervention
          </p>
        </div>
      </footer>
    </div>
  );
}
