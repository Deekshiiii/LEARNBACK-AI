export type UserRole = 'student' | 'teacher' | 'admin';

export interface School {
  id: string;
  name: string;
  code: string;
  city: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  schoolName: string;
  grade?: string;
  subject?: string;
  assignedMentorId?: string;
  assignedMentorName?: string;
  avatarUrl?: string;
  level?: number;
  xp?: number;
  streakDays?: number;
}

export type MasteryStatus = 'MASTERED' | 'IMPROVING' | 'NEEDS_SUPPORT' | 'PERSISTENT_GAP';

export interface Concept {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  category: string;
  description: string;
  beginnerExplanation: string;
  advancedExplanation: string;
  keyDefinitions: string[];
  corePoints: string[];
  commonMisconceptions: string[];
  examples: string[];
  relationships: string[];
  prerequisites?: string[];
}

export interface DocumentSource {
  id: string;
  title: string;
  subject: string;
  filename: string;
  fileType: string;
  uploadDate: string;
  topicsCount: number;
  conceptsCount: number;
  extractedText: string;
  topics: ExtractedTopic[];
}

export interface ExtractedTopic {
  id: string;
  name: string;
  subtopics: string[];
  concepts: string[];
}

export interface SemanticBreakdown {
  understood: string[];
  partiallyUnderstood: string[];
  misconceptions: string[];
  missingKnowledge: string[];
}

export interface RemediationPlan {
  shortCorrection: string;
  simpleExplanation: string;
  realWorldAnalogy: string;
  concreteExample: string;
  miniQuizQuestion: string;
  retryPrompt: string;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  context: string;
  studentAnswer?: string;
  feedback?: string;
  depthScore?: number;
}

export interface TeachBackAttempt {
  id: string;
  studentId: string;
  conceptId: string;
  conceptTitle: string;
  attemptNumber: number;
  timestamp: string;
  transcript: string;
  audioDurationSeconds?: number;
  understandingScore: number;
  masteryStatus: MasteryStatus;
  correctPoints: string[];
  missingPoints: string[];
  misconceptions: string[];
  semanticBreakdown: SemanticBreakdown;
  remediation: RemediationPlan;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  recommendedAction: string;
  scoreDelta?: number;
  followUpQuestions?: FollowUpQuestion[];
  xpAwarded?: number;
}

export interface StudentConceptProgress {
  conceptId: string;
  conceptTitle: string;
  subject: string;
  category: string;
  attemptsCount: number;
  latestScore: number;
  highestScore: number;
  masteryStatus: MasteryStatus;
  isPersistentGap: boolean;
  lastAttemptDate: string;
  attempts: TeachBackAttempt[];
}

export interface LearningLevelInfo {
  levelNumber: number;
  name: 'Beginner' | 'Learning' | 'Developing' | 'Proficient' | 'Mastery';
  minPercent: number;
  maxPercent: number;
  description: string;
  capabilities: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'TEACH_BACK' | 'STREAK' | 'MASTERY' | 'REMEDIATION' | 'ENGAGEMENT';
  xpReward: number;
  moduleTitle?: string;
  masteryScore?: number;
  criteria?: string;
}

export interface PersonalLearningTwin {
  studentId: string;
  studentName: string;
  overallUnderstanding: number;
  currentLevel: number;
  levelName: string;
  xp: number;
  nextLevelXp: number;
  streakDays: number;
  strongConcepts: string[];
  weakConcepts: string[];
  unresolvedMisconceptionsCount: number;
  unresolvedMisconceptions: { concept: string; misconception: string; severity: 'High' | 'Medium' }[];
  recommendedNextTopic: string;
  cognitiveResilienceScore: number;
  lastUpdated: string;
}

export interface ConceptDependencyNode {
  id: string;
  title: string;
  subject: string;
  prerequisites: string[];
  dependents: string[];
  status: MasteryStatus;
  score: number;
}

export interface AdaptiveLearningPathStep {
  id: string;
  stepNumber: number;
  title: string;
  conceptId: string;
  type: 'LEARN' | 'TEACH_BACK' | 'PRACTICE' | 'REMEDIATION' | 'MASTERY_TEST';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
  score?: number;
}

export interface NextLevelMission {
  topic: string;
  conceptId: string;
  currentScore: number;
  targetScore: number;
  checklist: {
    id: string;
    task: string;
    completed: boolean;
    type: 'EXPLANATION' | 'QUIZ' | 'TEACH_BACK' | 'CHALLENGE';
  }[];
}

export interface PracticeQuestion {
  id: string;
  conceptId: string;
  conceptTitle: string;
  subject: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SCENARIO' | 'APPLICATION' | 'TEACH_BACK';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xp: number;
}

export interface RevisionScheduleItem {
  id: string;
  conceptId: string;
  conceptTitle: string;
  dayInterval: 1 | 2 | 4 | 7 | 14;
  stageName: string;
  dueDate: string;
  completed: boolean;
  taskType: 'RECALL' | 'TEACH_BACK' | 'QUIZ' | 'MASTERY_CHECK';
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'REVISION' | 'LEVEL' | 'BADGE' | 'MENTOR' | 'ALERT';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface MentorAlert {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  conceptId: string;
  conceptTitle: string;
  subject: string;
  teacherId: string;
  attemptsCount: number;
  latestScore: number;
  flaggedDate: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'INTERVENED' | 'RESOLVED';
  detectedIssues: string[];
  missingConcepts: string[];
  suggestedMentorAction: string;
  severity: 'HIGH' | 'CRITICAL';
}

export interface MentorIntervention {
  id: string;
  alertId?: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  conceptId: string;
  conceptTitle: string;
  interventionType: '1-ON-1_SESSION' | 'TARGETED_WORKSHEET' | 'CONCEPT_REVIEW' | 'CUSTOM_EXERCISE';
  notes: string;
  prescribedResource?: string;
  timestamp: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'te' | 'kn' | 'ml';

export interface TeacherAIChatMessage {
  id: string;
  sender: 'teacher' | 'ai';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  generatedWorksheet?: string;
}

export interface DirectMentorMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  recipientId: string;
  recipientName: string;
  text: string;
  timestamp: string;
  conceptTag?: string;
  type: 'ENCOURAGEMENT' | 'FEEDBACK' | 'QUESTION' | 'CLARIFICATION';
  read: boolean;
}

