# LEARNBACK AI – Adaptive Learning & Intelligent Mentor Intervention Platform

> **Tagline:** *Learn. Explain. Improve. Master.*  
> **Mission:** An adaptive AI learning platform that understands what students know, identifies deep-rooted misconceptions, continuously tracks conceptual mastery through a Personal Learning Twin, and connects students with human teachers and mentors when persistent learning difficulties are detected.

---

## 📖 Table of Contents
1. [Project Overview & Vision](#-project-overview--vision)
2. [The 7-Stage Adaptive Learning Cycle](#-the-7-stage-adaptive-learning-cycle)
3. [Key Platform Features](#-key-platform-features)
   - [Student Experience & Dashboard](#1-student-experience--dashboard)
   - [Voice-Based Teach-Back Studio](#2-voice-based-teach-back-studio)
   - [Teach-Back Mastery Badges & Gamification](#3-teach-back-mastery-badges--gamification)
   - [Personal Learning Twin](#4-personal-learning-twin)
   - [Concept Dependency Graph & Adaptive Path](#5-concept-dependency-graph--adaptive-path)
   - [Smart Spaced Repetition](#6-smart-spaced-repetition)
   - [Multimodal Diagram & Schema Analyzer](#7-multimodal-diagram--schema-analyzer)
   - [Study Material RAG & Document Processing](#8-study-material-rag--document-processing)
   - [Teacher & Mentor Portal](#9-teacher--mentor-portal)
   - [Real-Time Direct Mentor Messaging](#10-real-time-direct-mentor-messaging)
   - [Multi-School Administrator Portal](#11-multi-school-administrator-portal)
4. [Technology Stack](#-technology-stack)
5. [System Architecture & Data Flow](#-system-architecture--data-flow)
6. [Role-Based Access Control & Default Credentials](#-role-based-access-control--default-credentials)
7. [API Endpoints Reference](#-api-endpoints-reference)
8. [Getting Started & Local Setup](#-getting-started--local-setup)
9. [License](#-license)

---

## 🌟 Project Overview & Vision

Traditional online learning platforms treat students as passive consumers of video lectures or multiple-choice quizzes. **LEARNBACK AI** revolutionizes educational technology through the scientific **Feynman Technique** ("Teach-Back"): **The best way to truly understand a concept is to explain it in your own words.**

Rather than functioning as a superficial chatbot, LEARNBACK AI operates as an institutional-grade educational operating system with three integrated stakeholder portals:
* **Students:** Explore syllabus topics through voice AI, articulate concepts aloud in the Teach-Back Studio, earn Teach-Back Mastery Badges, track their Personal Learning Twin, and receive targeted remediation.
* **Teachers / Mentors:** Monitor cohort-wide concept mastery, inspect diagnosed misconceptions, review semantic speech transcripts, receive automated alerts on persistent learning gaps, send real-time personalized feedback and encouragement, and deploy AI Teacher Assistant tools for worksheet generation.
* **Administrators:** Manage schools, classes, students, and teachers, and orchestrate mentor assignments.

---

## 🔄 The 7-Stage Adaptive Learning Cycle

```
  ┌─────────┐       ┌───────────┐       ┌───────────┐       ┌───────────┐
  │  LEARN  │ ───►  │  EXPLAIN  │ ───►  │  ANALYSE  │ ───►  │  IMPROVE  │
  └─────────┘       └───────────┘       └───────────┘       └───────────┘
                                                                  │
  ┌───────────────────────────────────────────────────────────────┘
  ▼
  ┌────────────┐       ┌──────────┐       ┌───────────────────────┐
  │  PRACTICE  │ ───►  │  MASTER  │ ───►  │  MENTOR INTERVENTION  │
  └────────────┘       └──────────┘       └───────────────────────┘
```

1. **LEARN:** Student absorbs curriculum concepts via structured modular lessons, interactive notes, and dynamic Voice AI explanations tailored to Beginner, Intermediate, or Advanced levels.
2. **EXPLAIN (Teach-Back):** The AI tutor prompts: *"Now explain this concept in your own words."* The student speaks aloud, and their speech is captured via the Web Speech API and transcribed in real time.
3. **ANALYSE:** The AI Misconception Engine evaluates the student's verbal explanation for correct assertions, missing knowledge, semantic depth, and diagnosed mental-model fallacies.
4. **IMPROVE:** The system generates an instant 6-point clinical remediation plan featuring simple analogies, counter-examples, and targeted retry prompts.
5. **PRACTICE:** Dynamic question generation across MCQs, True/False, Scenarios, and Application problems reinforces identified weak spots.
6. **MASTER:** Student achieves Level 5 Mastery (80%+ understanding score), unlocking Teach-Back Mastery Badges and updating their Personal Learning Twin.
7. **MENTOR INTERVENTION:** When persistent difficulties occur (3+ consecutive attempts below 70%), the system automatically flags the student, alerts their assigned teacher, and opens a direct pedagogical feedback channel.

---

## 🚀 Key Platform Features

### 1. Student Experience & Dashboard
* **Dynamic Welcome & Status Overview:** Shows enrolled school, section, assigned faculty mentor, overall cohort percentile, and learning streak.
* **5-Level Progression System:**
  * **Level 1 – Beginner (0–20%):** Basic definitions, everyday analogies, introductory explanations.
  * **Level 2 – Learning (21–40%):** Simple practice scenarios, guided recall prompts.
  * **Level 3 – Developing (41–60%):** Semantic misconception detection, multi-step follow-ups.
  * **Level 4 – Proficient (61–80%):** Application problems, schema trade-offs, advanced scenarios.
  * **Level 5 – Mastery (81–100%):** Formal mathematical proofs, peer-mentor eligibility.
* **Next Level Mission:** Active mission cards that bridge current score to target mastery with interactive task checklists.

### 2. Voice-Based Teach-Back Studio
* **Speech-to-Text & Real-Time Audio Capture:** Direct browser-based voice recording and transcript capture.
* **Semantic Analysis & Scoring:** Categorizes verbal explanations into understood points, partially understood elements, missing knowledge, and verified misconceptions.
* **Adaptive Follow-Up Inquiry:** The AI tutor challenges the student with context-aware Socratic follow-up questions to assess true conceptual depth.
* **Misconception Detection Engine:** Specifically targets classical pitfalls (e.g., confusing Normalization with duplicate row deletion, or mistaking 3NF transitive dependencies for 2NF partial dependencies).

### 3. Teach-Back Mastery Badges & Gamification
* **Earned Icons for Teach-Back Modules:** Displays distinct, gleaming badges awarded specifically for completing voice teach-back modules:
  * 🎙️ **First Teach-Back Hero:** Completed introductory verbal articulation module (+50 XP).
  * 🔑 **Relational Integrity Master:** Achieved ≥80% verbal accuracy on Primary Key & Entity Integrity (+85 XP).
  * 🥞 **LIFO Stack Architect:** Mastered Stack Data Structure push/pop boundary mechanics (+80 XP).
  * 🗄️ **Normalization Conqueror:** Mastered 1NF, 2NF, 3NF, and BCNF voice explanation (+120 XP).
  * 🌲 **Binary Tree Virtuoso:** Verbalized BST subtree invariants and recursive lookups (+90 XP).
  * ✨ **Mastery Articulation Maestro:** Scored ≥90% in any Teach-Back module with zero misconceptions (+150 XP).
* **Interactive Module Launcher:** Locked badges show required criteria and have a direct "Start Module" button that immediately loads the respective concept in the Teach-Back Studio.
* **XP Telemetry & Daily Streaks:** Experience points dynamically adjust student level and progress bars towards the next level milestone.

### 4. Personal Learning Twin
* **Cognitive State Model:** Visualizes the student's real-time knowledge graph, overall comprehension score, cognitive resilience rating, and unresolved misconceptions.
* **Strength & Gap Analysis:** Categorizes all syllabus topics into Mastered, Developing, or Needs Support.
* **Dynamic Next Topic Recommendation:** Suggests the optimal next topic to study based on prerequisite fulfillment and current mental model stability.

### 5. Concept Dependency Graph & Adaptive Path
* **Visual Prerequisite Graphs:** Illustrates prerequisite dependencies (e.g., Keys → Functional Dependencies → 1NF → 2NF → 3NF → BCNF).
* **Adaptive Learning Routing:** When a student stumbles on an advanced concept (e.g., 3NF), the platform routes them back to the prerequisite (Functional Dependencies) before scheduling revision.

### 6. Smart Spaced Repetition
* **Forgetting Curve Remediation:** Schedules spaced review milestones on Day 1 (Remediation Recall), Day 2 (Active Recall), Day 4 (Teach-Back), Day 7 (Quiz), and Day 14 (Mastery Check).
* **Automated Due Alerts:** Notifies students when revisions are due, awarding +20 XP upon task completion.

### 7. Multimodal Diagram & Schema Analyzer
* **Visual Schema Diagnostics:** Upload hand-drawn entity-relationship (ER) diagrams, relational schemas, or binary trees for computer-vision structural review.
* **Arrow & Key Verification:** Flags missing primary/foreign key connections and verifies schema normalization integrity.

### 8. Study Material RAG & Document Processing
* **Document Ingestion:** Supports PDF, DOCX, TXT, and image uploads.
* **Hierarchical Topic Extraction:** Automatically parses syllabus documents into Chapters, Subtopics, and atomic Concept nodes with searchable text chunks.

### 9. Teacher & Mentor Portal
* **Cohort Roster & Telemetry:** Monitors student progress, attempt counts, average scores, and persistent gap flags.
* **Intervention Alerts:** Flags students requiring immediate pedagogical assistance with diagnosed misconceptions and suggested mentor action plans.
* **Class Misconception Heatmap:** Aggregates class-wide errors into visual heatmaps to pinpoint cohort-level curriculum bottlenecks.
* **AI Teacher Assistant:** Generates custom diagnostic quizzes, tailored remediation worksheets, and cohort summaries.

### 10. Real-Time Direct Mentor Messaging
* **Bidirectional Communication:** Teachers and mentors can send real-time encouragement, pedagogical feedback, rule clarifications, or 1-on-1 clinic invitations to specific students.
* **Quick Presets:** One-click inspirational praise, technical rule summaries, and review reminders.
* **Student In-App Reply:** Students can view mentor directives and respond with questions directly in their dashboard.

### 11. Multi-School Administrator Portal
* **School Management:** Create and inspect schools (e.g., RMK Higher Secondary School, St. Joseph's Academy).
* **User Management:** Create student, teacher, and administrator accounts.
* **Mentor Assignment Engine:** Assign specific teachers as dedicated mentors to individual students.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Design** | Tailwind CSS v4, Lucide React Icons |
| **Data Visualization** | Recharts (Line Charts, Bar Charts, Pie Charts) |
| **Speech & Audio** | HTML5 Web Speech API (SpeechRecognition & SpeechSynthesis) |
| **Backend Server** | Node.js, Express, tsx |
| **AI / LLM Integration** | Google Gemini API (`@google/genai` TypeScript SDK, `gemini-3.8-flash`) |
| **State & Persistence** | In-memory robust schema with REST endpoints, local storage sync |

---

## 📐 System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT (React 19 SPA)                │
│                                                        │
│  StudentDashboard       TeacherDashboard     Admin     │
│  ├── VoiceAITutor       ├── Cohort Roster    Portal    │
│  ├── TeachBackStudio    ├── Alerts & Heatmap           │
│  ├── MasteryBadgesCard  └── MentorMessaging            │
│  └── LearningTwin                                      │
└───────────────────────────▲────────────────────────────┘
                            │ REST / JSON (Vite Proxy)
┌───────────────────────────▼────────────────────────────┐
│                  SERVER (Express + Node.js)            │
│                                                        │
│  /api/auth/*          /api/teach-back/*    /api/admin  │
│  /api/progress/*      /api/messages/*      /api/rag    │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                   AI / COGNITIVE ENGINE                │
│                                                        │
│  • Google Gemini 3.8 Flash (Structured Schema Output)   │
│  • Speech-to-Text & Transcript Semantic Analysis       │
│  • Misconception Detection & Follow-up Question Engine │
└────────────────────────────────────────────────────────┘
```

---

## 👥 Role-Based Access Control & Default Credentials

The platform includes pre-configured demo personas representing each stakeholder role:

| Role | Name | Email | Default School | Permissions |
|---|---|---|---|---|
| **Student** | Arun Kumar | `arun.kumar@rmk.ac.in` | RMK Higher Secondary School | Learn, Voice Teach-Back, Badges, Twin, Revision, Quizzes, Message Mentor |
| **Teacher / Mentor** | Dr. Priya Sharma | `priya.sharma@rmk.ac.in` | RMK Higher Secondary School | Cohort Roster, Intervention Alerts, Misconception Heatmap, AI Assistant, Direct Messaging |
| **Teacher / Mentor** | Prof. K. Ramanathan | `ramanathan@stjoseph.ac.in` | St. Joseph's Academy | View assigned students, record clinical interventions |
| **Administrator** | Principal Rajan Sundaram | `admin@rmk.ac.in` | RMK Higher Secondary School | Multi-school overview, user creation, mentor assignments |

*Note: You can instantly switch between roles in the top navigation bar or through the role selector modal.*

---

## 📡 API Endpoints Reference

### Authentication & Schools
* `POST /api/auth/login` – Authenticate by email & password.
* `POST /api/auth/register` – Register new student or teacher account.
* `GET /api/schools` – Retrieve list of enrolled institutions.

### Curriculum & Study Materials (RAG)
* `GET /api/concepts` – Retrieve all concepts across subjects.
* `GET /api/documents` – List uploaded syllabus documents and extracted topic hierarchies.
* `POST /api/documents/upload` – Ingest new document (PDF, DOCX, TXT), extract topics, and create searchable chunks.

### Voice AI Tutor & Teach-Back Evaluation
* `POST /api/ai-tutor/chat` – Dynamic explanation adapted to Beginner, Intermediate, or Advanced level.
* `POST /api/teach-back/evaluate` – Real-time semantic analysis of student voice transcript, misconception detection, XP calculation, and automated Teach-Back Mastery Badge unlocking.

### Gamification & Mastery Badges
* `GET /api/student/:id/badges` – Retrieve all badges with earned icons, criteria, and Teach-Back module mastery scores.
* `GET /api/student/:id/twin` – Fetch the student's Personal Learning Twin telemetry.
* `GET /api/student/:id/adaptive-path` – Retrieve personalized curriculum roadmap and prerequisite dependencies.

### Practice & Smart Spaced Revision
* `GET /api/practice/questions` – Get syllabus practice questions.
* `POST /api/practice/submit` – Validate student answers and award XP.
* `POST /api/practice/generate` – AI auto-generation of new practice questions.
* `GET /api/student/:id/revision-schedule` – Retrieve spaced repetition schedule.
* `POST /api/student/:id/revision/complete` – Mark revision item completed.

### Teacher & Cohort Telemetry
* `GET /api/teacher/:id/roster` – Cohort-wide metrics, enrolled students, and alert counts.
* `GET /api/teacher/student/:id` – Deep-dive inspection of a specific student's attempt history and misconception transcripts.
* `GET /api/teacher/alerts` – List pending persistent gap intervention alerts.
* `POST /api/mentor/intervene` – Record official clinical intervention and prescribe worksheets.
* `POST /api/teacher/ai-assistant` – Cohort telemetry query and custom remediation worksheet generator.

### Real-Time Direct Mentor Messaging
* `GET /api/messages?studentId=:id` – Fetch conversation history between student and mentor.
* `POST /api/messages/send` – Send real-time feedback, praise, or student query with automatic recipient notification.

### Administrator Routes
* `GET /api/admin/overview` – Global telemetry across schools, students, teachers, and attempts.
* `GET /api/admin/users` – Filterable user directory by school and role.
* `POST /api/admin/users` – Create new student, teacher, or admin accounts.
* `POST /api/admin/assign-mentor` – Assign a faculty mentor to a student.
* `POST /api/admin/schools` – Create a new school.

---

## 💻 Getting Started & Local Setup

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd /workspace
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (optional for AI capabilities):
   Create a `.env` file based on `.env.example`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: The platform includes comprehensive algorithmic fallbacks and works out-of-the-box even without an external API key!)*

4. Launch the full-stack development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**LEARNBACK AI** — *Empowering human mentors with adaptive cognitive intelligence.*
