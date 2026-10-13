import {
  Concept,
  DocumentSource,
  MentorAlert,
  MentorIntervention,
  School,
  StudentConceptProgress,
  TeachBackAttempt,
  User,
  PersonalLearningTwin,
  ConceptDependencyNode,
  AdaptiveLearningPathStep,
  NextLevelMission,
  PracticeQuestion,
  RevisionScheduleItem,
  Badge,
  NotificationItem,
  SupportedLanguage,
  DirectMentorMessage,
} from '../types';

export async function fetchSchools(): Promise<School[]> {
  const res = await fetch('/api/schools');
  if (!res.ok) throw new Error('Failed to fetch schools');
  return res.json();
}

export async function loginUser(email: string, role?: 'student' | 'teacher' | 'admin' | string): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to login');
  }
  return res.json();
}

export async function registerUser(payload: Partial<User>): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to register');
  }
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentSource[]> {
  const res = await fetch('/api/documents');
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function uploadDocument(payload: {
  title: string;
  subject: string;
  content: string;
  filename?: string;
  fileType?: string;
}): Promise<DocumentSource> {
  const res = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to upload document');
  }
  return res.json();
}

export async function fetchConcepts(category?: string, subject?: string): Promise<Concept[]> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (subject) params.set('subject', subject);
  const res = await fetch(`/api/concepts?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch concepts');
  return res.json();
}

export async function fetchConceptById(id: string): Promise<Concept> {
  const res = await fetch(`/api/concepts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch concept');
  return res.json();
}

export async function requestExplanation(payload: {
  conceptId: string;
  mode: 'beginner' | 'advanced';
  simpler?: boolean;
  advancedMore?: boolean;
  language?: SupportedLanguage;
}): Promise<{
  conceptTitle: string;
  mode: string;
  language?: string;
  explanation: string;
  analogy?: string;
  definitions?: string[];
  corePoints?: string[];
  groundedSource?: string;
}> {
  const res = await fetch('/api/learning/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to get AI explanation');
  return res.json();
}

export async function synthesizeVoiceSpeech(text: string, voice?: string): Promise<{
  audioBase64: string | null;
  mimeType?: string;
  fallbackToBrowserSpeech?: boolean;
  text?: string;
}> {
  const res = await fetch('/api/learning/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });
  if (!res.ok) throw new Error('Failed to synthesize speech');
  return res.json();
}

export async function analyzeTeachBack(payload: {
  studentId: string;
  conceptId: string;
  transcript: string;
  audioDurationSeconds?: number;
}): Promise<{
  attempt: TeachBackAttempt;
  persistentGapDetected: boolean;
  mentorAlertCreated: boolean;
  mentorAlert?: MentorAlert;
  studentXp: number;
  studentLevel: number;
  xpAwarded: number;
}> {
  const res = await fetch('/api/teachback/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to analyze explanation');
  }
  return res.json();
}

export async function submitFollowUpAnswer(payload: {
  attemptId: string;
  questionId: string;
  studentAnswer: string;
}): Promise<{
  success: boolean;
  feedback: string;
  bonusXp: number;
  message: string;
}> {
  const res = await fetch('/api/teachback/follow-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit follow up answer');
  return res.json();
}

export async function fetchPersonalLearningTwin(studentId: string): Promise<PersonalLearningTwin> {
  const res = await fetch(`/api/student/${studentId}/twin`);
  if (!res.ok) throw new Error('Failed to fetch personal learning twin');
  return res.json();
}

export async function fetchConceptDependencies(): Promise<ConceptDependencyNode[]> {
  const res = await fetch('/api/concepts/dependencies');
  if (!res.ok) throw new Error('Failed to fetch concept dependencies');
  return res.json();
}

export async function fetchAdaptiveLearningPath(studentId: string): Promise<{
  path: AdaptiveLearningPathStep[];
  mission: NextLevelMission;
}> {
  const res = await fetch(`/api/student/${studentId}/learning-path`);
  if (!res.ok) throw new Error('Failed to fetch learning path');
  return res.json();
}

export async function fetchPracticeQuestions(conceptId?: string, difficulty?: string): Promise<PracticeQuestion[]> {
  const params = new URLSearchParams();
  if (conceptId) params.set('conceptId', conceptId);
  if (difficulty) params.set('difficulty', difficulty);
  const res = await fetch(`/api/practice/questions?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch practice questions');
  return res.json();
}

export async function submitPracticeAnswer(payload: {
  questionId: string;
  studentAnswer: string;
  studentId: string;
}): Promise<{
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  xpAwarded: number;
  newTotalXp: number;
}> {
  const res = await fetch('/api/practice/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit answer');
  return res.json();
}

export async function generatePracticeQuestions(payload: {
  conceptTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}): Promise<PracticeQuestion[]> {
  const res = await fetch('/api/practice/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate questions');
  return res.json();
}

export async function fetchRevisionSchedule(studentId: string): Promise<{
  todayDueCount: number;
  schedule: RevisionScheduleItem[];
}> {
  const res = await fetch(`/api/student/${studentId}/revision-schedule`);
  if (!res.ok) throw new Error('Failed to fetch revision schedule');
  return res.json();
}

export async function completeRevisionTask(studentId: string, revisionId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/student/${studentId}/revision/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ revisionId }),
  });
  if (!res.ok) throw new Error('Failed to complete revision task');
  return res.json();
}

export async function fetchBadges(studentId: string): Promise<Badge[]> {
  const res = await fetch(`/api/student/${studentId}/badges`);
  if (!res.ok) throw new Error('Failed to fetch badges');
  return res.json();
}

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const res = await fetch(`/api/notifications/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to mark notification read');
  return res.json();
}

export async function queryTeacherAIAssistant(query: string, teacherId?: string): Promise<{
  reply: string;
  suggestedQuestions: string[];
}> {
  const res = await fetch('/api/teacher/ai-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, teacherId }),
  });
  if (!res.ok) throw new Error('Failed to query AI assistant');
  return res.json();
}

export async function analyzeDiagram(payload: {
  imageBase64: string;
  diagramType?: string;
  noteText?: string;
}): Promise<{
  status: string;
  feedback: string;
  corrections: string[];
  score: number;
}> {
  const res = await fetch('/api/learning/analyze-diagram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to analyze diagram');
  return res.json();
}

export interface StudentProgressResponse {
  student: User;
  overallProgress: number;
  conceptsMasteredCount: number;
  conceptsNeedingImprovementCount: number;
  persistentGapsCount: number;
  improvingCount: number;
  totalAttempted: number;
  learningStreakDays: number;
  xp: number;
  level: number;
  pendingRemediationCount: number;
  hasActiveMentorAlert: boolean;
  activeAlerts: MentorAlert[];
  interventions: MentorIntervention[];
  conceptProgress: StudentConceptProgress[];
  recentAttempts: TeachBackAttempt[];
}

export async function fetchStudentProgress(studentId: string): Promise<StudentProgressResponse> {
  const res = await fetch(`/api/progress/student/${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch student progress');
  return res.json();
}

export async function fetchTeacherRoster(teacherId = 'teacher-1') {
  const res = await fetch(`/api/teacher/students?teacherId=${teacherId}`);
  if (!res.ok) throw new Error('Failed to fetch teacher roster');
  return res.json();
}

export async function fetchTeacherStudentDeepDive(studentId: string) {
  const res = await fetch(`/api/teacher/student/${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch student deep dive');
  return res.json();
}

export async function fetchMentorAlerts(): Promise<MentorAlert[]> {
  const res = await fetch('/api/teacher/alerts');
  if (!res.ok) throw new Error('Failed to fetch mentor alerts');
  return res.json();
}

export async function submitMentorIntervention(payload: {
  alertId?: string;
  studentId: string;
  teacherId: string;
  conceptId: string;
  interventionType: string;
  notes: string;
  prescribedResource?: string;
}): Promise<{
  success: boolean;
  intervention: MentorIntervention;
  message: string;
}> {
  const res = await fetch('/api/mentor/intervene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit intervention');
  }
  return res.json();
}

export interface AdminOverviewData {
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalSchools: number;
  totalConcepts: number;
  totalDocuments: number;
  totalTeachBackAttempts: number;
  pendingAlerts: number;
  resolvedAlerts: number;
  avgMastery: number;
}

export async function fetchAdminOverview(): Promise<AdminOverviewData> {
  const res = await fetch('/api/admin/overview');
  if (!res.ok) throw new Error('Failed to fetch admin overview');
  return res.json();
}

export async function fetchAdminUsers(role?: string, schoolId?: string): Promise<User[]> {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (schoolId) params.set('schoolId', schoolId);
  const res = await fetch(`/api/admin/users?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch admin users');
  return res.json();
}

export async function createAdminUser(payload: Partial<User>): Promise<{ success: boolean; user: User }> {
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create user');
  }
  return res.json();
}

export async function assignMentorToStudent(studentId: string, mentorId: string): Promise<{ success: boolean; student: User; message: string }> {
  const res = await fetch('/api/admin/assign-mentor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, mentorId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to assign mentor');
  }
  return res.json();
}

export async function createSchool(payload: { name: string; code?: string; city?: string }): Promise<{ success: boolean; school: School }> {
  const res = await fetch('/api/admin/schools', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create school');
  }
  return res.json();
}

export async function fetchDirectMessages(studentId: string): Promise<DirectMentorMessage[]> {
  const res = await fetch(`/api/messages?studentId=${encodeURIComponent(studentId)}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendDirectMessage(payload: {
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  recipientId: string;
  recipientName: string;
  text: string;
  conceptTag?: string;
  type?: 'ENCOURAGEMENT' | 'FEEDBACK' | 'QUESTION' | 'CLARIFICATION';
}): Promise<{ success: boolean; message: DirectMentorMessage }> {
  const res = await fetch('/api/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to send message');
  }
  return res.json();
}

