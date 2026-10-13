import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// ==========================================
// In-Memory Database & Seed Data
// ==========================================

const schools = [
  { id: 'sch-1', name: 'RMK Higher Secondary School', code: 'RMKHSS', city: 'Chennai' },
  { id: 'sch-2', name: 'ABC Matriculation School', code: 'ABCMS', city: 'Coimbatore' },
  { id: 'sch-3', name: 'Demo International School', code: 'DIS', city: 'Bengaluru' },
];

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  schoolId: string;
  schoolName: string;
  grade?: string;
  subject?: string;
  assignedMentorId?: string;
  assignedMentorName?: string;
  xp?: number;
  level?: number;
  streakDays?: number;
}

let users: UserRecord[] = [
  {
    id: 'admin-1',
    name: 'Principal Rajan Sundaram',
    email: 'admin@rmk.ac.in',
    role: 'admin',
    schoolId: 'sch-1',
    schoolName: 'RMK Higher Secondary School',
  },
  {
    id: 'teacher-1',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@rmk.ac.in',
    role: 'teacher',
    schoolId: 'sch-1',
    schoolName: 'RMK Higher Secondary School',
    subject: 'Computer Science & DBMS',
  },
  {
    id: 'teacher-2',
    name: 'Prof. Anand Narayanan',
    email: 'anand.n@rmk.ac.in',
    role: 'teacher',
    schoolId: 'sch-1',
    schoolName: 'RMK Higher Secondary School',
    subject: 'Data Structures & Algorithms',
  },
  {
    id: 'student-1',
    name: 'Arun Kumar',
    email: 'arun.k@rmk.ac.in',
    role: 'student',
    schoolId: 'sch-1',
    schoolName: 'RMK Higher Secondary School',
    grade: 'Grade 12 - Section A',
    assignedMentorId: 'teacher-1',
    assignedMentorName: 'Dr. Priya Sharma',
    xp: 820,
    level: 4,
    streakDays: 7,
  },
  {
    id: 'student-2',
    name: 'Sneha Patel',
    email: 'sneha.p@rmk.ac.in',
    role: 'student',
    schoolId: 'sch-1',
    schoolName: 'RMK Higher Secondary School',
    grade: 'Grade 12 - Section A',
    assignedMentorId: 'teacher-1',
    assignedMentorName: 'Dr. Priya Sharma',
    xp: 940,
    level: 5,
    streakDays: 12,
  },
  {
    id: 'student-3',
    name: 'Rahul Varma',
    email: 'rahul.v@rmk.ac.in',
    role: 'student',
    schoolId: 'sch-1',
    schoolName: 'RMK Higher Secondary School',
    grade: 'Grade 12 - Section B',
    assignedMentorId: 'teacher-1',
    assignedMentorName: 'Dr. Priya Sharma',
    xp: 680,
    level: 3,
    streakDays: 4,
  },
  {
    id: 'student-4',
    name: 'Divya Krishnan',
    email: 'divya.k@rmk.ac.in',
    role: 'student',
    schoolId: 'sch-1',
    schoolName: 'RMK Higher Secondary School',
    grade: 'Grade 12 - Section B',
    assignedMentorId: 'teacher-1',
    assignedMentorName: 'Dr. Priya Sharma',
    xp: 760,
    level: 4,
    streakDays: 6,
  },
];

const documents = [
  {
    id: 'doc-dbms-101',
    title: 'Relational Database Design & Normalization Theory',
    subject: 'Database Management Systems',
    filename: 'DBMS_Normalization_Master_Chapter.pdf',
    fileType: 'application/pdf',
    uploadDate: '2026-09-28',
    topicsCount: 5,
    conceptsCount: 6,
    extractedText: `DATABASE MANAGEMENT SYSTEMS (DBMS) - UNIT 3: NORMALIZATION & RELATIONAL DESIGN
1. Normalization is the systematic process of organizing data in a relational database to reduce data redundancy and eliminate undesirable update anomalies (insertion, deletion, and modification anomalies).
2. Normalization is NOT simply deleting duplicate rows. It decomposes a large table with redundancies into smaller, well-structured relations using functional dependencies while preserving information.
3. Functional Dependency (FD): Given relation R, attribute Y is functionally dependent on X (X -> Y) if each value of X is associated with exactly one value of Y.
4. Normal Forms:
   - 1NF (First Normal Form): All table attributes must have atomic (indivisible) values. No repeating groups or arrays.
   - 2NF (Second Normal Form): Table is in 1NF AND every non-prime attribute is fully functionally dependent on the entire primary key (no partial dependencies on a candidate key component).
   - 3NF (Third Normal Form): Table is in 2NF AND no non-prime attribute is transitively dependent on the primary key (no X -> Y and Y -> Z where Z is non-prime).
   - BCNF (Boyce-Codd Normal Form): Strict 3NF where for every functional dependency X -> Y, X must be a super key.
5. Primary Key: A candidate key chosen by the database designer to uniquely identify tuples in a relation. It cannot contain NULL values.
6. SQL Joins: Combine rows from two or more tables based on a related column between them (INNER, LEFT, RIGHT, FULL OUTER).`,
    topics: [
      {
        id: 'top-1',
        name: 'Database Fundamentals',
        subtopics: ['Relations', 'Attributes', 'Tuples', 'Schemas'],
        concepts: ['Database Tables', 'Primary Key'],
      },
      {
        id: 'top-2',
        name: 'Functional Dependencies',
        subtopics: ['Determinants', 'Armstrong Axioms', 'Full Dependency', 'Transitive Dependency'],
        concepts: ['Functional Dependency'],
      },
      {
        id: 'top-3',
        name: 'Relational Normalization',
        subtopics: ['Redundancy & Anomalies', '1NF', '2NF', '3NF', 'BCNF Decomposition'],
        concepts: ['Normalization', 'Boyce-Codd Normal Form (BCNF)'],
      },
      {
        id: 'top-4',
        name: 'Relational Query Operations',
        subtopics: ['Inner Join', 'Outer Joins', 'Cross Join', 'Subqueries'],
        concepts: ['SQL Joins'],
      },
    ],
  },
  {
    id: 'doc-dsa-201',
    title: 'Data Structures: Trees and Graph Algorithms',
    subject: 'Data Structures & Algorithms',
    filename: 'DSA_Trees_Graphs_Unit.pdf',
    fileType: 'application/pdf',
    uploadDate: '2026-09-29',
    topicsCount: 4,
    conceptsCount: 5,
    extractedText: `DATA STRUCTURES & ALGORITHMS - UNIT 4: TREES AND GRAPH TRAVERSALS
1. Binary Search Tree (BST): A binary tree data structure where for each node, all elements in the left subtree are smaller than the node, and all elements in the right subtree are greater than or equal to the node. Enables O(log n) average search, insert, and delete.
2. AVL Tree: A self-balancing Binary Search Tree where the difference between heights of left and right subtrees (Balance Factor = Height(L) - Height(R)) cannot be more than 1 for all nodes. Rotations (LL, RR, LR, RL) rebalance the tree upon insertion/deletion.
3. Graph Representation: Adjacency Matrix (dense graphs) vs Adjacency List (sparse graphs).
4. Breadth-First Search (BFS): Graph traversal using a FIFO Queue to visit vertices level-by-level. Computes shortest path in unweighted graphs.
5. Depth-First Search (DFS): Graph traversal using recursion or a LIFO Stack to explore as deeply as possible along each branch before backtracking. Used for cycle detection and topological sorting.`,
    topics: [
      {
        id: 'top-dsa-1',
        name: 'Trees',
        subtopics: ['Binary Trees', 'Binary Search Trees', 'Balanced Trees'],
        concepts: ['Binary Search Tree', 'AVL Tree'],
      },
      {
        id: 'top-dsa-2',
        name: 'Graph Traversal',
        subtopics: ['BFS', 'DFS', 'Shortest Paths', 'Topological Sort'],
        concepts: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS)'],
      },
    ],
  }
];

let concepts = [
  {
    id: 'concept-normalization',
    title: 'Normalization',
    subject: 'Database Management Systems',
    chapter: 'Relational Database Design',
    category: 'Relational Theory',
    description: 'The process of organizing data in a database to reduce data redundancy and improve data integrity through decomposition into normal forms.',
    beginnerExplanation: `Imagine having a single notebook where you write down a student's name, their home address, their teacher's phone number, and every single book they borrowed. Every time they borrow a new book, you rewrite their home address and phone number! If their address changes, you might update it on line 1 but forget line 5, causing confusion. Normalization is like creating two neat notebooks instead: one for student profiles, and another for borrowed book records linked by a Student ID. You never have to duplicate addresses again!`,
    advancedExplanation: `Normalization systematically decomposes relations with redundancies and anomalies into smaller, lossless schemas. It relies on the analysis of Functional Dependencies (FDs) and candidate keys. The goal is to reach higher normal forms (1NF, 2NF, 3NF, BCNF) satisfying two formal guarantees: Lossless-Join Decomposition (ensuring the original relation can be reconstructed without spurious tuples) and Dependency Preservation (ensuring all FDs can be checked within individual decomposed tables without expensive multi-table joins).`,
    keyDefinitions: [
      'Decomposition: Splitting a relation R into {R1, R2} without losing information.',
      'Insertion Anomaly: Inability to insert certain facts without adding unrelated dummy data.',
      'Deletion Anomaly: Unintended loss of important data when deleting a related record.',
      'Update Anomaly: Inconsistent data caused by modifying redundant values in multiple tuples.'
    ],
    corePoints: [
      'Reduces data redundancy systematically.',
      'Eliminates insertion, update, and deletion anomalies.',
      'Decomposes tables based on functional dependencies.',
      'Preserves information via lossless-join decomposition.',
      'Progression goes from 1NF -> 2NF -> 3NF -> BCNF.'
    ],
    commonMisconceptions: [
      'Misconception: Normalization is just running a command to delete duplicate rows.',
      'Misconception: Normalization always speeds up SQL queries (in fact, it often requires JOINs, trading storage and consistency for read complexity).',
      'Misconception: 2NF removes transitive dependencies (that is 3NF; 2NF removes partial dependencies).'
    ],
    examples: [
      'Decomposing an Orders table containing CustomerName, CustomerAddress, ItemID, Price into Customers(CustID, Name, Address) and Orders(OrderID, CustID, ItemID).'
    ],
    relationships: ['Functional Dependency', 'Primary Key', 'SQL Joins', 'Boyce-Codd Normal Form (BCNF)'],
    prerequisites: ['Primary Key', 'Functional Dependency']
  },
  {
    id: 'concept-functional-dependency',
    title: 'Functional Dependency',
    subject: 'Database Management Systems',
    chapter: 'Relational Database Design',
    category: 'Relational Theory',
    description: 'A constraint between two sets of attributes in a relational database where one attribute uniquely determines the value of another.',
    beginnerExplanation: `Think of your School Roll Number. When a teacher knows your roll number, they can instantly look up your exact full name and date of birth with 100% certainty. We say your name is "functionally dependent" on your roll number (Roll Number -> Student Name). One input uniquely gives one output!`,
    advancedExplanation: `Given a relation schema R, and attribute sets X, Y ⊆ R, a functional dependency denoted X → Y holds on R if and only if for any valid instance r(R), whenever two tuples t1 and t2 have t1[X] = t2[X], they must also have t1[Y] = t2[Y]. FDs satisfy Armstrong Axioms: Reflexivity, Augmentation, and Transitivity. FDs define whether an attribute set is a super key and dictate normal form violations.`,
    keyDefinitions: [
      'Determinant: The attribute set X on the left side of X -> Y.',
      'Trivial Dependency: X -> Y where Y is a subset of X.',
      'Non-Trivial Dependency: X -> Y where Y is not a subset of X.'
    ],
    corePoints: [
      'Formal constraint: X uniquely determines Y (X -> Y).',
      'Armstrong\'s axioms form a sound and complete inference system.',
      'Full functional dependency vs Partial dependency (key for 2NF).',
      'Transitive dependency X -> Y and Y -> Z (key for 3NF).'
    ],
    commonMisconceptions: [
      'Misconception: If X -> Y, then Y must also determine X (wrong, not symmetric).',
      'Misconception: FDs depend on the current rows in the database (wrong, they are schema invariants).'
    ],
    examples: [
      'StudentID -> (StudentName, DOB)',
      'ISBN -> (BookTitle, Author, Publisher)'
    ],
    relationships: ['Normalization', 'Primary Key', 'Boyce-Codd Normal Form (BCNF)'],
    prerequisites: ['Primary Key']
  },
  {
    id: 'concept-primary-key',
    title: 'Primary Key',
    subject: 'Database Management Systems',
    chapter: 'Relational Data Model',
    category: 'Data Integrity',
    description: 'A minimal candidate key chosen to uniquely identify each tuple in a relation, enforcing entity integrity.',
    beginnerExplanation: `Think of a Primary Key as your unique government Aadhaar/SSN or your Student ID card number. Even if two students share the exact same first name, last name, and birthday, their Student ID numbers are strictly different. It prevents any two records from getting mixed up.`,
    advancedExplanation: `A Primary Key is a minimal super key satisfying uniqueness and NOT NULL constraints. It enforces the fundamental Entity Integrity rule in the relational model. Secondary relations reference this via Foreign Keys to establish referential integrity.`,
    keyDefinitions: [
      'Candidate Key: A minimal super key.',
      'Super Key: A set of attributes that uniquely identifies tuples.',
      'Entity Integrity Constraint: Primary key columns cannot contain NULL.'
    ],
    corePoints: [
      'Uniqueness: Every tuple must have a distinct primary key value.',
      'Non-nullability: No component attribute may be NULL.',
      'Minimality: No attribute can be discarded without losing uniqueness.',
      'Used as target for Foreign Key references.'
    ],
    commonMisconceptions: [
      'Misconception: A primary key can contain NULL values.',
      'Misconception: A table can have multiple primary keys (it can have multiple candidate keys, but only one chosen primary key).'
    ],
    examples: ['StudentID in Students table', 'EmployeeID in Employees table'],
    relationships: ['Normalization', 'Functional Dependency', 'SQL Joins'],
    prerequisites: []
  },
  {
    id: 'concept-sql-joins',
    title: 'SQL Joins',
    subject: 'Database Management Systems',
    chapter: 'Relational Query Languages',
    category: 'SQL & Queries',
    description: 'Relational algebra and SQL mechanisms used to combine records from two or more tables based on related columns.',
    beginnerExplanation: `Imagine you have one list of students and another list of library books borrowed. If you want to see which student has which book, you connect the two lists using the Student ID they have in common. An INNER JOIN only shows students who currently have a book. A LEFT JOIN shows every single student, even if they have borrowed zero books!`,
    advancedExplanation: `Joins implement Cartesian product followed by selection on join predicates. Types include Theta Join, Equi-Join, Natural Join, and Outer Joins (Left, Right, Full). Query optimizers select algorithms like Nested Loop Join, Hash Join, or Sort-Merge Join based on table cardinality and indexes.`,
    keyDefinitions: [
      'Inner Join: Tuples matching join predicate in both relations.',
      'Left Outer Join: All tuples from left relation + matching from right (or NULLs).',
      'Cartesian Product: All possible pairs of tuples from R and S.'
    ],
    corePoints: [
      'Combines normalized relations during query time.',
      'INNER JOIN vs OUTER JOIN semantics.',
      'Requires foreign key to primary key relationship typically.'
    ],
    commonMisconceptions: [
      'Misconception: Left Join and Right Join are completely different operations (they are symmetric by swapping relation order).'
    ],
    examples: ['SELECT * FROM Students JOIN Enrollments ON Students.id = Enrollments.student_id'],
    relationships: ['Normalization', 'Primary Key'],
    prerequisites: ['Primary Key', 'Normalization']
  },
  {
    id: 'concept-bcnf',
    title: 'Boyce-Codd Normal Form (BCNF)',
    subject: 'Database Management Systems',
    chapter: 'Relational Database Design',
    category: 'Relational Theory',
    description: 'A stronger version of 3NF where every determinant in every non-trivial functional dependency must be a super key.',
    beginnerExplanation: `3NF makes sure your database is very clean, but in rare cases with overlapping keys, there is still a small loophole for repetition! BCNF closes that loophole with one simple golden rule: whenever X determines Y, X MUST be a boss (a Super Key that uniquely identifies entire rows). No exceptions allowed!`,
    advancedExplanation: `A relation schema R is in BCNF with respect to a set of functional dependencies F if, for every non-trivial functional dependency X → Y in F+, X is a super key of R. BCNF strictly eliminates all redundancies arising from functional dependencies. However, BCNF decomposition cannot always guarantee dependency preservation, unlike 3NF.`,
    keyDefinitions: [
      'Super Key: A set of attributes that uniquely determines all attributes in the relation.',
      'Lossless Decomposition: Decomposition property where R1 ⋈ R2 = R.',
      'Dependency Preservation: Property where (F1 ∪ F2)+ = F+.'
    ],
    corePoints: [
      'Stronger standard than 3NF.',
      'Every determinant in X -> Y must be a super key.',
      'Guarantees no anomalies from FDs.',
      'Trade-off: May sacrifice dependency preservation.'
    ],
    commonMisconceptions: [
      'Misconception: BCNF is always achievable while preserving all functional dependencies.'
    ],
    examples: ['Teaching relation (Student, Subject, Teacher) where Teacher -> Subject and (Student, Subject) is key.'],
    relationships: ['Normalization', 'Functional Dependency'],
    prerequisites: ['Normalization', 'Functional Dependency']
  },
  // DSA Concepts
  {
    id: 'concept-bst',
    title: 'Binary Search Tree',
    subject: 'Data Structures & Algorithms',
    chapter: 'Trees',
    category: 'Hierarchical Structures',
    description: 'A node-based binary tree data structure which has the binary search property.',
    beginnerExplanation: `Imagine an organized library bookshelf where everything to your left is smaller/earlier in the alphabet, and everything to your right is larger! When looking for a book, you check the middle: if your book comes earlier, you completely ignore the entire right half!`,
    advancedExplanation: `A Binary Search Tree satisfies the invariant that for any node n, keys in n.left < n.key ≤ keys in n.right. Inorder traversal produces sorted keys in O(n) time. Average search, insertion, and deletion complexity is O(log n), but degrades to O(n) in degenerate skewed cases.`,
    keyDefinitions: [
      'BST Invariant: Left subtree < Node ≤ Right subtree',
      'Inorder Traversal: Left -> Root -> Right (produces sorted order)'
    ],
    corePoints: [
      'Lesser values in left subtree, greater in right.',
      'Inorder traversal yields sorted order.',
      'Can become unbalanced without balancing mechanisms.'
    ],
    commonMisconceptions: [
      'Misconception: Any binary tree with numbers is a BST (must satisfy recursive subtree ordering).'
    ],
    examples: ['Inserting 50, 30, 70, 20, 40'],
    relationships: ['AVL Tree', 'Breadth-First Search (BFS)'],
    prerequisites: []
  },
  {
    id: 'concept-bfs',
    title: 'Breadth-First Search (BFS)',
    subject: 'Data Structures & Algorithms',
    chapter: 'Graph Traversal',
    category: 'Graph Algorithms',
    description: 'An algorithm for traversing or searching tree or graph data structures using a FIFO Queue.',
    beginnerExplanation: `Imagine dropping a pebble into a calm pond. Ripples spread outward ring by ring! BFS explores all immediate neighbor spots first (1 step away), then all places 2 steps away, and so on. That is why it finds the shortest path!`,
    advancedExplanation: `BFS explores graph vertices reachable from a source s by expanding a frontier level-by-level using a FIFO Queue and a boolean visited array. Time complexity is O(V + E) with adjacency lists. It computes shortest path distances (unweighted edges).`,
    keyDefinitions: [
      'FIFO Queue: First-In-First-Out data structure used to maintain traversal frontier.',
      'Visited Array: Prevents infinite cycles in cyclic graphs.'
    ],
    corePoints: [
      'Level-order exploration.',
      'Guarantees shortest path in unweighted graphs.',
      'Uses Queue data structure.'
    ],
    commonMisconceptions: [
      'Misconception: BFS uses a Stack (DFS uses a Stack; BFS uses a Queue).'
    ],
    examples: ['Finding degrees of separation on LinkedIn or shortest maze routes.'],
    relationships: ['Depth-First Search (DFS)', 'Binary Search Tree'],
    prerequisites: []
  }
];

// Seed teach-back attempts for Arun Kumar
let attempts: any[] = [
  {
    id: 'att-101',
    studentId: 'student-1',
    conceptId: 'concept-normalization',
    conceptTitle: 'Normalization',
    attemptNumber: 1,
    timestamp: '2026-09-28T10:14:00Z',
    transcript: 'Normalization is basically deleting duplicate rows from database tables so that memory is saved.',
    understandingScore: 55,
    masteryStatus: 'NEEDS_SUPPORT',
    correctPoints: ['Identified that normalization aims to reduce duplicate data and save redundant storage.'],
    missingPoints: [
      'Failed to mention decomposing tables into smaller relations.',
      'Did not mention functional dependencies or normal forms (1NF, 2NF, 3NF).',
      'Did not identify anomalies (insertion, deletion, update).'
    ],
    misconceptions: [
      'Believes normalization is simply executing a command or query to delete duplicate rows, rather than designing schema decomposition.'
    ],
    semanticBreakdown: {
      understood: ['Data redundancy is undesirable.'],
      partiallyUnderstood: ['Connects it to storage efficiency.'],
      misconceptions: ['Normalization equals deleting duplicate rows in an existing table.'],
      missingKnowledge: ['Functional dependencies', 'Normal forms decomposition', 'Update anomalies']
    },
    remediation: {
      shortCorrection: 'Normalization is schema decomposition, not row deletion.',
      simpleExplanation: 'Normalization is about designing your tables so redundancy cannot happen in the first place by splitting big messy tables into clean related tables.',
      realWorldAnalogy: 'Think of separating a messy binder into distinct tabbed folders for Student Info and Library Books.',
      concreteExample: 'Instead of having Customer Address copied on 50 orders, you store Customer once in a Customer table with a CustID.',
      miniQuizQuestion: 'Does normalization delete student rows or reorganize columns into related tables?',
      retryPrompt: 'Explain how normalization splits tables using functional dependencies instead of deleting rows.'
    },
    confidenceLevel: 'Medium',
    recommendedAction: 'Review Beginner Mode explanation on table decomposition.',
    scoreDelta: 0,
    xpAwarded: 30,
  },
  {
    id: 'att-102',
    studentId: 'student-1',
    conceptId: 'concept-normalization',
    conceptTitle: 'Normalization',
    attemptNumber: 2,
    timestamp: '2026-09-28T14:30:00Z',
    transcript: 'Normalization reorganizes database tables into normal forms like 1NF, 2NF, and 3NF to avoid update anomalies. In 2NF, we remove duplicate rows again.',
    understandingScore: 64,
    masteryStatus: 'IMPROVING',
    correctPoints: [
      'Recognized progression of normal forms (1NF, 2NF, 3NF).',
      'Correctly named update anomalies as something to be avoided.',
      'Understood that tables are reorganized.'
    ],
    missingPoints: [
      'Did not explain what partial dependency is for 2NF.',
      'Did not explain transitive dependency for 3NF.',
      'Did not explain functional dependencies (X -> Y).'
    ],
    misconceptions: [
      'Still reverts to "removing duplicate rows" when describing 2NF instead of removing partial dependencies on candidate keys.'
    ],
    semanticBreakdown: {
      understood: ['Normal form sequence 1NF, 2NF, 3NF', 'Preventing update anomalies'],
      partiallyUnderstood: ['Schema reorganization vs row operations'],
      misconceptions: ['2NF means removing duplicate rows'],
      missingKnowledge: ['Partial functional dependency', 'Transitive dependency', 'Composite primary key role']
    },
    remediation: {
      shortCorrection: '2NF removes partial functional dependencies, not duplicate rows.',
      simpleExplanation: 'In 2NF, every column must depend on the WHOLE primary key, not just half of a composite key.',
      realWorldAnalogy: 'If your key is (StudentID, CourseID), the CourseName only depends on CourseID! That is a partial dependency.',
      concreteExample: 'Move CourseName to a separate Courses table so you don\'t repeat the course title for every enrolled student.',
      miniQuizQuestion: 'What kind of dependency does 2NF eliminate?',
      retryPrompt: 'Explain what 2NF requires regarding primary keys and partial dependencies.'
    },
    confidenceLevel: 'Medium',
    recommendedAction: 'Clarify partial functional dependency with composite keys.',
    scoreDelta: 9,
    xpAwarded: 30,
  },
  {
    id: 'att-103',
    studentId: 'student-1',
    conceptId: 'concept-normalization',
    conceptTitle: 'Normalization',
    attemptNumber: 3,
    timestamp: '2026-09-29T09:15:00Z',
    transcript: 'Normalization stops anomalies using normal forms. 1NF has atomic values. In 2NF, we remove partial dependencies. For 3NF, I think we make sure there are no foreign keys.',
    understandingScore: 61,
    masteryStatus: 'NEEDS_SUPPORT',
    correctPoints: [
      'Correctly stated 1NF requires atomic values.',
      'Correctly identified that 2NF eliminates partial dependencies.'
    ],
    missingPoints: [
      'Did not state definition of 3NF (transitive dependencies).',
      'Confused foreign keys with anomalies.',
      'Did not mention Boyce-Codd Normal Form.'
    ],
    misconceptions: [
      'Misconception: 3NF requires removing foreign keys (foreign keys are actually essential to link normalized decomposed tables!).'
    ],
    semanticBreakdown: {
      understood: ['1NF atomicity', '2NF partial dependencies'],
      partiallyUnderstood: ['Normal form hierarchy'],
      misconceptions: ['3NF removes foreign keys'],
      missingKnowledge: ['Transitive dependencies (X -> Y and Y -> Z)', 'Role of foreign keys in preserving lossless joins']
    },
    remediation: {
      shortCorrection: 'Foreign keys are REQUIRED in normalized tables to link decomposed tables together.',
      simpleExplanation: '3NF removes transitive dependencies (A -> B and B -> C). It does NOT remove foreign keys!',
      realWorldAnalogy: 'Foreign keys are like the glue that connects your separate folders. Without foreign keys, you cannot do joins!',
      concreteExample: 'In Orders(OrderID, CustID), CustID is a foreign key pointing to Customers. That is healthy 3NF.',
      miniQuizQuestion: 'What does 3NF actually eliminate: foreign keys or transitive dependencies?',
      retryPrompt: 'Explain 3NF using transitive dependencies and explain why foreign keys are still necessary.'
    },
    confidenceLevel: 'Medium',
    recommendedAction: 'Warning: 3rd unsuccessful attempt. Review relational integrity.',
    scoreDelta: -3,
    xpAwarded: 30,
  },
  {
    id: 'att-104',
    studentId: 'student-1',
    conceptId: 'concept-normalization',
    conceptTitle: 'Normalization',
    attemptNumber: 4,
    timestamp: '2026-09-30T16:45:00Z',
    transcript: 'Normalization decomposes tables. 1NF is atomic. 2NF removes partial dependency. 3NF removes transitive dependencies where A goes to B and B goes to C. But I still do not understand why BCNF is needed if 3NF is already there, and I still get confused about how to identify functional dependencies without deleting rows.',
    understandingScore: 63,
    masteryStatus: 'PERSISTENT_GAP',
    correctPoints: [
      'Correctly explained 1NF (atomic values).',
      'Correctly identified 2NF (removes partial dependency).',
      'Correctly identified 3NF (removes transitive dependency A -> B -> C).'
    ],
    missingPoints: [
      'Cannot explain why BCNF is stricter than 3NF.',
      'Unable to operationalize functional dependencies without falling back to row deletion analogies.',
      'Misses lossless-join property.'
    ],
    misconceptions: [
      'Persistent conceptual block on practical decomposition and BCNF determinant rule.',
      'Confused on how functional dependencies are identified from business rules versus table rows.'
    ],
    semanticBreakdown: {
      understood: ['1NF, 2NF, 3NF definitions'],
      partiallyUnderstood: ['Transitive dependency chaining'],
      misconceptions: ['Repeated difficulty linking FDs to practical schemas'],
      missingKnowledge: ['BCNF super key determinant rule', 'Lossless-join validation']
    },
    remediation: {
      shortCorrection: 'Persistent difficulty detected across 4 attempts. Human Mentor Intervention flagged.',
      simpleExplanation: 'You have memorized definitions for 1NF, 2NF, and 3NF, but have a persistent mental block on practical functional dependencies and BCNF.',
      realWorldAnalogy: 'Dr. Priya Sharma has been notified to guide you through a visual table decomposition exercise.',
      concreteExample: 'Review Professor Sharma\'s scheduled 1-on-1 notes on BCNF decomposition with composite keys.',
      miniQuizQuestion: 'Why does BCNF require every determinant X in X -> Y to be a super key?',
      retryPrompt: 'After reviewing mentor intervention guidance, explain BCNF and how decomposition preserves data integrity.'
    },
    confidenceLevel: 'Medium',
    recommendedAction: 'Flagged for Human Teacher Intervention.',
    scoreDelta: 2,
    xpAwarded: 30,
  },
  // SQL Joins (Mastered)
  {
    id: 'att-201',
    studentId: 'student-1',
    conceptId: 'concept-sql-joins',
    conceptTitle: 'SQL Joins',
    attemptNumber: 1,
    timestamp: '2026-09-27T11:20:00Z',
    transcript: 'SQL joins combine data from two or more tables based on a related column between them, usually a primary key and foreign key. INNER JOIN only returns rows where there is a match in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right table, or NULL if no match exists. We use them after normalization to query our split data.',
    understandingScore: 88,
    masteryStatus: 'MASTERED',
    correctPoints: [
      'Clear definition of combining tables on related primary-foreign key columns.',
      'Accurate contrast between INNER JOIN and LEFT JOIN semantics.',
      'Correct identification of NULL padding in unmatched outer joins.',
      'Recognized purpose of joins in reconstructing normalized schemas.'
    ],
    missingPoints: ['Could also briefly mention FULL OUTER JOIN or Cartesian product.'],
    misconceptions: [],
    semanticBreakdown: {
      understood: ['Inner Join', 'Left Outer Join', 'Foreign Key linkage', 'Role in normalized databases'],
      partiallyUnderstood: [],
      misconceptions: [],
      missingKnowledge: ['Full Outer Join']
    },
    remediation: {
      shortCorrection: 'Excellent mastery demonstrated!',
      simpleExplanation: 'You clearly understand how relational joins work and how they relate back to normalized schemas.',
      realWorldAnalogy: 'Connecting student records with enrolled grades smoothly.',
      concreteExample: 'SELECT * FROM Students S LEFT JOIN Enrollments E ON S.id = E.student_id',
      miniQuizQuestion: 'What does a FULL OUTER JOIN return?',
      retryPrompt: 'Concept Mastered! You can advance to Relational Algebra.'
    },
    confidenceLevel: 'High',
    recommendedAction: 'Advance to advanced query optimization.',
    scoreDelta: 88,
    xpAwarded: 70,
  },
  // Primary Key (Mastered)
  {
    id: 'att-302',
    studentId: 'student-1',
    conceptId: 'concept-primary-key',
    conceptTitle: 'Primary Key',
    attemptNumber: 2,
    timestamp: '2026-09-26T10:15:00Z',
    transcript: 'A primary key is a minimal candidate key that uniquely identifies every tuple in a relation. It enforces entity integrity, meaning it strictly cannot contain NULL values under any circumstances, and serves as the destination for foreign key references in other tables.',
    understandingScore: 82,
    masteryStatus: 'MASTERED',
    correctPoints: [
      'Minimal candidate key identification.',
      'Uniquely identifies tuples.',
      'Entity integrity constraint (strictly NO NULL).',
      'Referenced by foreign keys.'
    ],
    missingPoints: [],
    misconceptions: [],
    semanticBreakdown: {
      understood: ['Uniqueness', 'NOT NULL constraint', 'Entity Integrity', 'Foreign key targeting'],
      partiallyUnderstood: [],
      misconceptions: [],
      missingKnowledge: []
    },
    remediation: {
      shortCorrection: 'Mastery achieved!',
      simpleExplanation: 'You now grasp both the uniqueness and NOT NULL constraints of primary keys.',
      realWorldAnalogy: 'An immutable, unique passport identifier.',
      concreteExample: 'StudentID INT PRIMARY KEY',
      miniQuizQuestion: 'What distinguishes a primary key from a candidate key?',
      retryPrompt: 'Ready for higher level normalization.'
    },
    confidenceLevel: 'High',
    recommendedAction: 'Mastered concept.',
    scoreDelta: 14,
    xpAwarded: 60,
  },
];

// Persistent Learning Gap Alerts
let mentorAlerts: any[] = [
  {
    id: 'alert-1',
    studentId: 'student-1',
    studentName: 'Arun Kumar',
    studentGrade: 'Grade 12 - Section A',
    conceptId: 'concept-normalization',
    conceptTitle: 'Normalization',
    subject: 'Database Management Systems',
    teacherId: 'teacher-1',
    attemptsCount: 4,
    latestScore: 63,
    flaggedDate: '2026-09-30T16:45:00Z',
    status: 'PENDING',
    detectedIssues: [
      'Confuses normalization with duplicate row removal or query execution.',
      'Repeated difficulty articulating Boyce-Codd Normal Form (BCNF) super key condition.',
      'Cannot explain how functional dependencies guide table decomposition without data loss.'
    ],
    missingConcepts: [
      'Functional dependency determinants',
      'Lossless-join decomposition guarantee',
      'BCNF vs 3NF distinction'
    ],
    suggestedMentorAction: 'Provide a practical database example (e.g. Student-Course enrollment) and manually explain functional dependency and decomposition without data loss.',
    severity: 'CRITICAL',
  },
  {
    id: 'alert-2',
    studentId: 'student-1',
    studentName: 'Arun Kumar',
    studentGrade: 'Grade 12 - Section A',
    conceptId: 'concept-functional-dependency',
    conceptTitle: 'Functional Dependency',
    subject: 'Database Management Systems',
    teacherId: 'teacher-1',
    attemptsCount: 3,
    latestScore: 58,
    flaggedDate: '2026-09-30T14:10:00Z',
    status: 'PENDING',
    detectedIssues: [
      'Struggles with composite keys in determining partial dependencies.',
      'Unable to distinguish between partial and transitive dependencies on exam questions.'
    ],
    missingConcepts: [
      'Full functional dependency on candidate keys',
      'Armstrong\'s transitivity axiom'
    ],
    suggestedMentorAction: 'Review composite candidate keys with a 2x2 matrix exercise showing (StudentID, CourseID) relationships.',
    severity: 'HIGH',
  },
  {
    id: 'alert-3',
    studentId: 'student-3',
    studentName: 'Rahul Varma',
    studentGrade: 'Grade 12 - Section B',
    conceptId: 'concept-bcnf',
    conceptTitle: 'Boyce-Codd Normal Form (BCNF)',
    subject: 'Database Management Systems',
    teacherId: 'teacher-1',
    attemptsCount: 3,
    latestScore: 59,
    flaggedDate: '2026-09-29T16:00:00Z',
    status: 'PENDING',
    detectedIssues: [
      'Confuses BCNF with 3NF prime attribute allowance.',
      'Cannot determine when dependency preservation is sacrificed.'
    ],
    missingConcepts: [
      'Every determinant must be a super key',
      'Dependency preservation trade-off'
    ],
    suggestedMentorAction: 'Walk through the classic (Student, Subject, Teacher) counter-example where 3NF holds but BCNF fails.',
    severity: 'HIGH',
  },
];

// Recorded mentor interventions
let mentorInterventions: any[] = [
  {
    id: 'int-1',
    alertId: 'alert-prev',
    studentId: 'student-1',
    studentName: 'Arun Kumar',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Priya Sharma',
    conceptId: 'concept-primary-key',
    conceptTitle: 'Primary Key',
    interventionType: 'TARGETED_WORKSHEET',
    notes: 'Reviewed entity integrity rule and explained why NULL is strictly forbidden in primary keys using student database schemas.',
    prescribedResource: 'Chapter 2 Practice Sheet: Candidate Keys & Integrity Rules',
    timestamp: '2026-09-26T10:00:00Z',
    status: 'COMPLETED',
  }
];

// Gamification Badges & Teach-Back Mastery Badges (#9)
let badges: any[] = [
  {
    id: 'b-tb-first',
    title: 'First Teach-Back Hero',
    description: 'Explained a technical concept aloud in your own voice.',
    icon: 'Mic',
    unlocked: true,
    unlockedAt: '2026-09-26',
    category: 'TEACH_BACK',
    xpReward: 50,
    moduleTitle: 'Introductory Teach-Back',
    masteryScore: 78,
    criteria: 'Complete your first voice teach-back module',
  },
  {
    id: 'b-tb-pk',
    title: 'Relational Integrity Master',
    description: 'Completed Primary Key & Entity Integrity Teach-Back module with high verbal accuracy.',
    icon: 'Key',
    unlocked: true,
    unlockedAt: '2026-09-27',
    category: 'TEACH_BACK',
    xpReward: 85,
    moduleTitle: 'Primary Key & Candidate Keys',
    masteryScore: 85,
    criteria: 'Achieve >=80% mastery on Primary Key Teach-Back',
  },
  {
    id: 'b-tb-stack',
    title: 'LIFO Stack Architect',
    description: 'Mastered the Stack Data Structure Teach-Back module demonstrating push/pop mechanics.',
    icon: 'Layers',
    unlocked: true,
    unlockedAt: '2026-09-29',
    category: 'TEACH_BACK',
    xpReward: 80,
    moduleTitle: 'Stack & LIFO Principles',
    masteryScore: 82,
    criteria: 'Achieve >=80% mastery on Stack Teach-Back',
  },
  {
    id: 'b-tb-norm',
    title: 'Normalization Conqueror',
    description: 'Complete Normalization (1NF, 2NF, 3NF, BCNF) Teach-Back to eliminate functional dependency gaps.',
    icon: 'Database',
    unlocked: false,
    category: 'TEACH_BACK',
    xpReward: 120,
    moduleTitle: 'Relational Normalization & BCNF',
    masteryScore: 63,
    criteria: 'Achieve >=80% mastery on Normalization Teach-Back',
  },
  {
    id: 'b-tb-tree',
    title: 'Binary Tree Virtuoso',
    description: 'Articulate Binary Search Tree invariants and recursive lookup logic aloud.',
    icon: 'GitFork',
    unlocked: false,
    category: 'TEACH_BACK',
    xpReward: 90,
    moduleTitle: 'Binary Search Trees & Traversal',
    masteryScore: 45,
    criteria: 'Achieve >=80% mastery on BST Teach-Back',
  },
  {
    id: 'b-tb-perfect',
    title: 'Mastery Articulation Maestro',
    description: 'Score 90% or higher in any Teach-Back evaluation with zero detected misconceptions.',
    icon: 'Sparkles',
    unlocked: false,
    category: 'TEACH_BACK',
    xpReward: 150,
    moduleTitle: 'Any Advanced Syllabus Module',
    masteryScore: 85,
    criteria: 'Score >=90% in any Teach-Back module',
  },
  {
    id: 'b-2',
    title: '7-Day Learning Streak',
    description: 'Maintained continuous daily study sessions for a full week.',
    icon: 'Flame',
    unlocked: true,
    unlockedAt: '2026-09-30',
    category: 'STREAK',
    xpReward: 100,
    criteria: 'Study 7 consecutive days',
  },
  {
    id: 'b-3',
    title: 'Concept Master',
    description: 'Achieved Level 5 Mastery (>=80%) on a foundational curriculum concept.',
    icon: 'Award',
    unlocked: true,
    unlockedAt: '2026-09-27',
    category: 'MASTERY',
    xpReward: 75,
    criteria: 'Achieve Level 5 mastery on a concept',
  },
  {
    id: 'b-4',
    title: 'Misconception Slayer',
    description: 'Overcame a persistent mental model error via personalized voice remediation.',
    icon: 'Lightbulb',
    unlocked: true,
    unlockedAt: '2026-09-26',
    category: 'REMEDIATION',
    xpReward: 60,
    criteria: 'Resolve a flagged misconception',
  },
  {
    id: 'b-5',
    title: 'Topic Master',
    description: 'Mastered all concepts within an entire syllabus chapter.',
    icon: 'BookOpen',
    unlocked: false,
    category: 'MASTERY',
    xpReward: 150,
    criteria: 'Master all concepts in a chapter',
  },
  {
    id: 'b-6',
    title: 'Fast Learner',
    description: 'Achieved mastery on a concept within 2 teach-back attempts.',
    icon: 'Zap',
    unlocked: true,
    unlockedAt: '2026-09-27',
    category: 'ENGAGEMENT',
    xpReward: 80,
    criteria: 'Reach mastery in <= 2 teach-back attempts',
  },
  {
    id: 'b-7',
    title: 'Mastery Achieved',
    description: 'Reach Level 5 overall across your curriculum subjects.',
    icon: 'Trophy',
    unlocked: false,
    category: 'MASTERY',
    xpReward: 200,
    criteria: 'Achieve Level 5 across all subjects',
  }
];

// Real-Time Direct Mentor <-> Student Feedback Messages
let directMessages: any[] = [
  {
    id: 'msg-1',
    senderId: 'teacher-1',
    senderName: 'Dr. Priya Sharma',
    senderRole: 'teacher',
    recipientId: 'student-1',
    recipientName: 'Arun Kumar',
    text: 'Great work improving your Primary Key teach-back score to 85%! Your verbal explanation of entity integrity was clear and precise.',
    timestamp: '2026-09-30T15:20:00Z',
    conceptTag: 'Primary Key',
    type: 'ENCOURAGEMENT',
    read: true,
  },
  {
    id: 'msg-2',
    senderId: 'student-1',
    senderName: 'Arun Kumar',
    senderRole: 'student',
    recipientId: 'teacher-1',
    recipientName: 'Dr. Priya Sharma',
    text: 'Thank you Dr. Priya! I reviewed the Armstrong axioms worksheet. When decomposing for 3NF, do all determinants have to be candidate keys?',
    timestamp: '2026-09-30T16:00:00Z',
    conceptTag: 'Normalization',
    type: 'QUESTION',
    read: true,
  },
  {
    id: 'msg-3',
    senderId: 'teacher-1',
    senderName: 'Dr. Priya Sharma',
    senderRole: 'teacher',
    recipientId: 'student-1',
    recipientName: 'Arun Kumar',
    text: 'Great question! In 3NF, for any X -> A, either X is a superkey OR A is a prime attribute. It is BCNF that strictly requires X to always be a superkey without exception. Try recording your teach-back explanation with this distinction!',
    timestamp: '2026-10-01T09:15:00Z',
    conceptTag: 'Normalization',
    type: 'FEEDBACK',
    read: false,
  },
  {
    id: 'msg-4',
    senderId: 'teacher-1',
    senderName: 'Dr. Priya Sharma',
    senderRole: 'teacher',
    recipientId: 'student-3',
    recipientName: 'Rahul Varma',
    text: 'Rahul, commendable effort on your SQL joins query practice! Let us focus next on BCNF dependency preservation in our 1-on-1 session.',
    timestamp: '2026-09-30T17:00:00Z',
    conceptTag: 'BCNF',
    type: 'ENCOURAGEMENT',
    read: true,
  }
];


// Spaced Repetition Revision Schedule
let revisionSchedule: any[] = [
  {
    id: 'rev-1',
    conceptId: 'concept-normalization',
    conceptTitle: 'Normalization',
    dayInterval: 1,
    stageName: 'Day 1: Remediation Recall',
    dueDate: '2026-10-01',
    completed: false,
    taskType: 'TEACH_BACK',
  },
  {
    id: 'rev-2',
    conceptId: 'concept-functional-dependency',
    conceptTitle: 'Functional Dependency',
    dayInterval: 2,
    stageName: 'Day 2: Active Recall',
    dueDate: '2026-10-01',
    completed: false,
    taskType: 'QUIZ',
  },
  {
    id: 'rev-3',
    conceptId: 'concept-primary-key',
    conceptTitle: 'Primary Key',
    dayInterval: 7,
    stageName: 'Day 7: Weekly Retention Check',
    dueDate: '2026-10-03',
    completed: false,
    taskType: 'QUIZ',
  },
  {
    id: 'rev-4',
    conceptId: 'concept-sql-joins',
    conceptTitle: 'SQL Joins',
    dayInterval: 14,
    stageName: 'Day 14: Mastery Confirmation',
    dueDate: '2026-10-10',
    completed: false,
    taskType: 'MASTERY_CHECK',
  },
];

// Practice Questions Bank
let practiceQuestions: any[] = [
  {
    id: 'q-1',
    conceptId: 'concept-normalization',
    conceptTitle: 'Normalization',
    subject: 'DBMS',
    type: 'MCQ',
    question: 'What is the primary objective of decomposing tables in relational normalization?',
    options: [
      'To physically delete duplicate rows from disk',
      'To eliminate insertion, update, and deletion anomalies while reducing redundancy',
      'To avoid creating primary and foreign keys',
      'To speed up all SELECT queries without requiring JOINs'
    ],
    correctAnswer: 'To eliminate insertion, update, and deletion anomalies while reducing redundancy',
    explanation: 'Normalization decomposes tables based on functional dependencies to eliminate anomalies without losing information.',
    difficulty: 'Easy',
    xp: 20,
  },
  {
    id: 'q-2',
    conceptId: 'concept-normalization',
    conceptTitle: 'Normalization',
    subject: 'DBMS',
    type: 'TRUE_FALSE',
    question: 'A table in Second Normal Form (2NF) can still contain transitive functional dependencies between non-prime attributes.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'True! 2NF only eliminates partial dependencies. Transitive dependencies are eliminated in Third Normal Form (3NF).',
    difficulty: 'Medium',
    xp: 20,
  },
  {
    id: 'q-3',
    conceptId: 'concept-functional-dependency',
    conceptTitle: 'Functional Dependency',
    subject: 'DBMS',
    type: 'SCENARIO',
    question: 'In an Enrollments table with composite primary key (StudentID, CourseID), attribute InstructorName depends only on CourseID. What violation is present?',
    options: [
      'Transitive dependency violating 3NF',
      'Partial functional dependency violating 2NF',
      'Non-atomic attribute violating 1NF',
      'No violation exists'
    ],
    correctAnswer: 'Partial functional dependency violating 2NF',
    explanation: 'Because InstructorName depends on part of the composite primary key (CourseID), it is a partial dependency violating 2NF.',
    difficulty: 'Medium',
    xp: 25,
  },
  {
    id: 'q-4',
    conceptId: 'concept-bcnf',
    conceptTitle: 'Boyce-Codd Normal Form (BCNF)',
    subject: 'DBMS',
    type: 'APPLICATION',
    question: 'Under what specific condition is a relation in Boyce-Codd Normal Form (BCNF)?',
    options: [
      'Every determinant X in every non-trivial functional dependency X -> Y must be a Super Key',
      'Every non-prime attribute must depend on all candidate keys',
      'There must be no composite keys permitted in the relation',
      'The database must contain exactly one table'
    ],
    correctAnswer: 'Every determinant X in every non-trivial functional dependency X -> Y must be a Super Key',
    explanation: 'BCNF requires every determinant X in non-trivial FDs to be a super key, strictly eliminating all redundancy from FDs.',
    difficulty: 'Hard',
    xp: 30,
  },
  {
    id: 'q-5',
    conceptId: 'concept-bst',
    conceptTitle: 'Binary Search Tree',
    subject: 'Data Structures & Algorithms',
    type: 'MCQ',
    question: 'Which tree traversal on a Binary Search Tree (BST) visits nodes in strictly ascending sorted order?',
    options: ['Preorder Traversal', 'Inorder Traversal', 'Postorder Traversal', 'Level-order Traversal'],
    correctAnswer: 'Inorder Traversal',
    explanation: 'Inorder traversal recursively visits Left -> Node -> Right, yielding sorted order on BSTs.',
    difficulty: 'Easy',
    xp: 20,
  },
  {
    id: 'q-6',
    conceptId: 'concept-bfs',
    conceptTitle: 'Breadth-First Search (BFS)',
    subject: 'Data Structures & Algorithms',
    type: 'TRUE_FALSE',
    question: 'Breadth-First Search (BFS) uses a LIFO Stack to explore branches to their deepest level first.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'False! BFS uses a FIFO Queue to explore level-by-level. DFS uses a LIFO Stack.',
    difficulty: 'Easy',
    xp: 20,
  }
];

// Notifications
let notifications: any[] = [
  {
    id: 'n-1',
    userId: 'student-1',
    title: 'Smart Revision Due Today',
    message: '2 concepts are scheduled for spaced recall: Normalization & Functional Dependency.',
    type: 'REVISION',
    timestamp: '2026-10-01T08:00:00Z',
    read: false,
  },
  {
    id: 'n-2',
    userId: 'student-1',
    title: 'Mentor Feedback Received',
    message: 'Dr. Priya Sharma left clinical guidance notes on your Primary Key practice.',
    type: 'MENTOR',
    timestamp: '2026-09-30T17:00:00Z',
    read: false,
  },
  {
    id: 'n-3',
    userId: 'teacher-1',
    title: 'Intervention Required: Arun Kumar',
    message: 'Arun has attempted Normalization 4 times with persistent misconceptions.',
    type: 'ALERT',
    timestamp: '2026-09-30T16:45:00Z',
    read: false,
  }
];

// Helper: RAG Context
function retrieveRelevantChunks(query: string, conceptId?: string): string {
  const targetConcept = concepts.find(c => c.id === conceptId);
  const doc = documents[0];

  let context = `DOCUMENT CONTEXT:\n${doc.extractedText}\n\n`;
  if (targetConcept) {
    context += `CONCEPT: ${targetConcept.title}\n`;
    context += `DEFINITIONS: ${targetConcept.keyDefinitions.join('; ')}\n`;
    context += `CORE POINTS: ${targetConcept.corePoints.join('; ')}\n`;
    context += `COMMON MISCONCEPTIONS: ${targetConcept.commonMisconceptions.join('; ')}\n`;
  }
  return context;
}

// ==========================================
// API Endpoints
// ==========================================

// Health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    time: new Date().toISOString(),
    geminiConfigured: !!aiClient,
  });
});

// Schools
app.get('/api/schools', (req: Request, res: Response) => {
  res.json(schools);
});

// Auth
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) ||
               users.find(u => u.role === role);

  if (!user) {
    return res.status(404).json({ error: 'User not found. Try Arun Kumar (Student) or Dr. Priya Sharma (Teacher).' });
  }
  res.json({ user, token: 'mock-session-jwt-token' });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, schoolId, grade, subject, assignedMentorId } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  const school = schools.find(s => s.id === schoolId) || schools[0];
  const mentor = users.find(u => u.id === assignedMentorId && u.role === 'teacher') ||
                 users.find(u => u.role === 'teacher');

  const newUser: UserRecord = {
    id: `user-${Date.now()}`,
    name,
    email,
    role,
    schoolId: school.id,
    schoolName: school.name,
    grade: role === 'student' ? (grade || 'Grade 12') : undefined,
    subject: role === 'teacher' ? (subject || 'Computer Science') : undefined,
    assignedMentorId: role === 'student' ? mentor?.id : undefined,
    assignedMentorName: role === 'student' ? mentor?.name : undefined,
    xp: 100,
    level: 1,
    streakDays: 1,
  };

  users.push(newUser);
  res.json({ user: newUser, token: 'mock-session-jwt-token' });
});

// Documents
app.get('/api/documents', (req: Request, res: Response) => {
  res.json(documents);
});

app.post('/api/documents/upload', async (req: Request, res: Response) => {
  try {
    const { title, subject, content, filename, fileType } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Document title and text content are required.' });
    }

    const docId = `doc-${Date.now()}`;
    let extractedTopics = [
      {
        id: `top-${Date.now()}-1`,
        name: `${title} Fundamentals`,
        subtopics: ['Core Definitions', 'Mechanisms', 'Standard Formulations'],
        concepts: [title],
      }
    ];

    if (aiClient) {
      try {
        const prompt = `Analyze this study material on subject "${subject || 'General'}".
Extract the topic hierarchy in strict JSON format:
{
  "topics": [
    { "name": "Topic Name", "subtopics": ["sub1", "sub2"], "concepts": ["concept1", "concept2"] }
  ]
}

DOCUMENT CONTENT:
${content.slice(0, 8000)}`;

        const geminiRes = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        if (geminiRes.text) {
          const parsed = JSON.parse(geminiRes.text);
          if (parsed.topics && Array.isArray(parsed.topics)) {
            extractedTopics = parsed.topics.map((t: any, idx: number) => ({
              id: `top-${Date.now()}-${idx}`,
              name: t.name,
              subtopics: t.subtopics || [],
              concepts: t.concepts || [],
            }));
          }
        }
      } catch (llmErr) {
        console.warn('LLM Topic extraction fallback:', llmErr);
      }
    }

    const newDoc = {
      id: docId,
      title,
      subject: subject || 'Computer Science',
      filename: filename || `${title.replace(/\s+/g, '_')}.pdf`,
      fileType: fileType || 'application/pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      topicsCount: extractedTopics.length,
      conceptsCount: extractedTopics.reduce((acc, t) => acc + (t.concepts?.length || 0), 0) || 1,
      extractedText: content,
      topics: extractedTopics,
    };

    documents.push(newDoc);

    // Create concepts
    extractedTopics.forEach((t, tIdx) => {
      (t.concepts || []).forEach((cName: string, cIdx: number) => {
        const cid = `concept-${Date.now()}-${tIdx}-${cIdx}`;
        concepts.push({
          id: cid,
          title: cName,
          subject: newDoc.subject,
          chapter: t.name,
          category: t.name,
          description: `Key concept extracted from ${title}: ${cName}`,
          beginnerExplanation: `${cName} is a foundational concept in ${title}. It introduces essential building blocks.`,
          advancedExplanation: `Academic formalization of ${cName} within ${newDoc.subject}. Relates to systemic properties and proof logic.`,
          keyDefinitions: [`${cName}: Core theoretical construct from ${title}.`],
          corePoints: [`Crucial component of ${t.name}`, `Essential for examination and real-world mastery`],
          commonMisconceptions: [`Confusing ${cName} with adjacent definitions`],
          examples: [`Standard canonical implementation of ${cName}`],
          relationships: t.concepts.filter((x: string) => x !== cName),
          prerequisites: [],
        });
      });
    });

    res.json(newDoc);
  } catch (error: any) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process document' });
  }
});

// Concepts
app.get('/api/concepts', (req: Request, res: Response) => {
  const { category, subject } = req.query;
  let filtered = [...concepts];
  if (category) {
    filtered = filtered.filter(c => c.category.toLowerCase() === String(category).toLowerCase());
  }
  if (subject) {
    filtered = filtered.filter(c => c.subject.toLowerCase() === String(subject).toLowerCase());
  }
  res.json(filtered);
});

app.get('/api/concepts/:id', (req: Request, res: Response) => {
  const concept = concepts.find(c => c.id === req.params.id);
  if (!concept) return res.status(404).json({ error: 'Concept not found' });
  res.json(concept);
});

// Learning AI Tutor (with Multilingual support & Level adaptation)
app.post('/api/learning/explain', async (req: Request, res: Response) => {
  const { conceptId, mode, simpler, advancedMore, language } = req.body;
  const concept = concepts.find(c => c.id === conceptId) || concepts[0];
  const lang = language || 'en';

  const ragContext = retrieveRelevantChunks(concept.title, concept.id);
  const targetMode = mode === 'advanced' ? 'ADVANCED' : 'BEGINNER';

  if (!aiClient) {
    const text = targetMode === 'ADVANCED' ? concept.advancedExplanation : concept.beginnerExplanation;
    return res.json({
      conceptTitle: concept.title,
      mode: targetMode,
      language: lang,
      explanation: text,
      analogy: targetMode === 'BEGINNER' ? 'Think of it like organizing separate notebooks for each topic.' : null,
      definitions: concept.keyDefinitions,
      corePoints: concept.corePoints,
      groundedSource: 'DBMS_Normalization_Master_Chapter.pdf (Section 3.2)',
    });
  }

  try {
    const langInstructions: Record<string, string> = {
      en: 'Explain in English.',
      ta: 'Explain in Tamil with clear Tamil terms and English technical terms in brackets (e.g. Normalization [நார்மலைசேஷன்]).',
      hi: 'Explain in clear Hindi with English technical terms in brackets (e.g. Primary Key [प्राइमरी की]).',
      te: 'Explain in Telugu with English technical terms in brackets.',
      kn: 'Explain in Kannada with English technical terms in brackets.',
      ml: 'Explain in Malayalam with English technical terms in brackets.',
    };

    const prompt = `You are LEARNBACK AI's Adaptive Voice Tutor.
Concept: "${concept.title}"
Mode: ${targetMode} (Beginner uses everyday analogies and conversational speech. Advanced uses exact academic terminology, mathematical definitions, schemas, and exam-oriented tips).
Language: ${langInstructions[lang] || 'Explain in English.'}
${simpler ? 'Make it even simpler with a memorable analogy.' : ''}
${advancedMore ? 'Make it deeply technical with schema constraints.' : ''}

RAG MATERIAL TO GROUND EXPLANATION:
${ragContext}

Return strict JSON:
{
  "explanation": "Clear, voice-ready spoken explanation (2-3 paragraphs)",
  "analogy": "A memorable real-world analogy",
  "definitions": ["Key definition 1", "Key definition 2"],
  "corePoints": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"],
  "groundedSource": "Specific section from student uploaded material"
}`;

    const geminiRes = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    if (geminiRes.text) {
      const parsed = JSON.parse(geminiRes.text);
      return res.json({
        conceptTitle: concept.title,
        mode: targetMode,
        language: lang,
        ...parsed,
      });
    }
  } catch (err) {
    console.error('Gemini explanation error:', err);
  }

  res.json({
    conceptTitle: concept.title,
    mode: targetMode,
    language: lang,
    explanation: targetMode === 'ADVANCED' ? concept.advancedExplanation : concept.beginnerExplanation,
    analogy: 'A real-world organization system.',
    definitions: concept.keyDefinitions,
    corePoints: concept.corePoints,
    groundedSource: 'DBMS_Normalization_Master_Chapter.pdf (Section 3.2)',
  });
});

// Voice TTS
app.post('/api/learning/tts', async (req: Request, res: Response) => {
  const { text, voice } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required for TTS' });

  if (aiClient) {
    try {
      const voiceName = voice || 'Kore';
      const ttsRes = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: text.slice(0, 1200), speechMetadata: { style: 'Warm, engaging academic tutor' } }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      });

      const base64Audio = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
          source: 'gemini-tts',
        });
      }
    } catch (err) {
      console.warn('Gemini TTS fallback:', err);
    }
  }

  res.json({ audioBase64: null, fallbackToBrowserSpeech: true, text });
});

// Teach-Back Semantic Analysis (With XP, Level updating, Follow-up Question)
app.post('/api/teachback/analyze', async (req: Request, res: Response) => {
  try {
    const { studentId, conceptId, transcript, audioDurationSeconds } = req.body;
    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Student explanation transcript cannot be empty.' });
    }

    const student = users.find(u => u.id === (studentId || 'student-1')) || users[1];
    const concept = concepts.find(c => c.id === conceptId) || concepts[0];

    const pastAttempts = attempts.filter(a => a.studentId === student.id && a.conceptId === concept.id);
    const attemptNumber = pastAttempts.length + 1;
    const previousScore = pastAttempts.length > 0 ? pastAttempts[pastAttempts.length - 1].understandingScore : 0;

    let analysisResult: any = null;

    if (aiClient) {
      try {
        const ragContext = retrieveRelevantChunks(concept.title, concept.id);
        const prompt = `You are LEARNBACK AI's Semantic Teach-Back Analyzer.
Analyze the student's verbal explanation of "${concept.title}".
Evaluate SEMANTIC UNDERSTANDING: Does the student grasp the underlying mechanism, or do they hold a distorted mental model?
Identify specific misconceptions. Also generate a follow-up inquiry question to test concept depth.

GROUND TRUTH STUDY MATERIAL:
${ragContext}

STUDENT TRANSCRIPT TO ANALYZE:
"${transcript}"

ATTEMPT #${attemptNumber} (Previous scores: ${pastAttempts.map(a => a.understandingScore).join(', ') || 'First attempt'})

Return STRICT JSON:
{
  "understanding_score": 75,
  "mastery_status": "MASTERED (>=80) or IMPROVING (60-79) or NEEDS_SUPPORT (<60) or PERSISTENT_GAP",
  "correct_points": ["Point 1 got right", "Point 2"],
  "missing_points": ["Key point 1 missed", "Key point 2"],
  "misconceptions": ["Exact incorrect mental model or wrong relationship held"],
  "semantic_breakdown": {
    "understood": ["List of concepts clearly understood"],
    "partially_understood": ["Concepts with partial grasp"],
    "misconceptions": ["Specific erroneous beliefs"],
    "missing_knowledge": ["Crucial gaps not mentioned"]
  },
  "confidence_level": "Low or Medium or High",
  "recommended_action": "Clear pedagogical next step",
  "remediation": {
    "short_correction": "1-sentence direct clarification",
    "simple_explanation": "2-3 sentences explaining what it actually is",
    "real_world_analogy": "Relatable intuitive analogy",
    "concrete_example": "Concrete code, schema or table example",
    "mini_quiz_question": "A quick check question to test the corrected idea",
    "retry_prompt": "Specific prompt asking student to explain again with the correction in mind"
  },
  "follow_up_question": "An intelligent follow-up question testing the depth of the student's explanation"
}`;

        const geminiRes = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        if (geminiRes.text) {
          analysisResult = JSON.parse(geminiRes.text);
        }
      } catch (geminiErr) {
        console.warn('Gemini teach-back analysis fallback:', geminiErr);
      }
    }

    if (!analysisResult) {
      const lower = transcript.toLowerCase();
      let score = 55;
      const correct: string[] = [];
      const missing: string[] = [];
      const misconceptionsList: string[] = [];

      if (lower.includes('table') || lower.includes('database') || lower.includes('organize') || lower.includes('tree') || lower.includes('queue')) {
        correct.push('Understands the fundamental data organization paradigm.');
        score += 15;
      }
      if (lower.includes('duplicate row') || lower.includes('delete duplicate')) {
        misconceptionsList.push('Confuses schema decomposition with executing queries to delete duplicate rows.');
        score -= 10;
      }
      if (lower.includes('1nf') || lower.includes('2nf') || lower.includes('3nf') || lower.includes('normal form') || lower.includes('left') || lower.includes('right')) {
        correct.push('Recognized structural order and progression.');
        score += 15;
      }
      if (lower.includes('functional depend') || lower.includes('dependency') || lower.includes('bst') || lower.includes('fifo')) {
        correct.push('Identified formal ordering principles.');
        score += 15;
      } else {
        missing.push('Missed formal invariant definitions.');
      }

      score = Math.max(45, Math.min(95, score));
      let status: 'MASTERED' | 'IMPROVING' | 'NEEDS_SUPPORT' | 'PERSISTENT_GAP' = 'IMPROVING';
      if (score >= 80) status = 'MASTERED';
      else if (score >= 60) status = 'IMPROVING';
      else status = 'NEEDS_SUPPORT';

      if (attemptNumber >= 3 && score < 70) {
        status = 'PERSISTENT_GAP';
      }

      analysisResult = {
        understanding_score: score,
        mastery_status: status,
        correct_points: correct.length > 0 ? correct : ['Touched upon core concept.'],
        missing_points: missing.length > 0 ? missing : ['Formal decomposition guarantees.'],
        misconceptions: misconceptionsList,
        semantic_breakdown: {
          understood: correct,
          partially_understood: ['Structure organization vs data alteration'],
          misconceptions: misconceptionsList,
          missing_knowledge: missing,
        },
        confidence_level: 'Medium',
        recommended_action: score >= 80 ? 'Mastery achieved!' : 'Review remediation and teach-back again.',
        remediation: {
          short_correction: `${concept.title} requires formal decomposition, not row operations.`,
          simpleExplanation: `In ${concept.title}, relations are partitioned to enforce integrity.`,
          realWorldAnalogy: 'Like organizing receipts into separate envelopes instead of a giant shoebox.',
          concreteExample: 'Decomposing Orders into Customers and OrderItems linked by CustID.',
          miniQuizQuestion: `Does ${concept.title} delete rows or reorganize schema relations?`,
          retryPrompt: `Explain ${concept.title} again focusing on functional dependencies.`,
        },
        follow_up_question: `Can you give a concrete example of how ${concept.title} applies in an exam or production schema?`,
      };
    }

    const understandingScore = analysisResult.understanding_score || 65;
    let masteryStatus = analysisResult.mastery_status || 'IMPROVING';

    if (attemptNumber >= 3 && understandingScore < 70) {
      masteryStatus = 'PERSISTENT_GAP';
    }

    const scoreDelta = attemptNumber === 1 ? understandingScore : (understandingScore - previousScore);

    // XP calculation: Teach-Back +30 XP, plus +40 XP if misconception fixed or +50 if mastered
    let xpGained = 30;
    if (understandingScore >= 80) xpGained += 50;
    else if (scoreDelta > 0) xpGained += 20;

    student.xp = (student.xp || 800) + xpGained;
    // Update student level based on XP: 0-200 L1, 201-400 L2, 401-600 L3, 601-800 L4, 801+ L5
    if (student.xp >= 800) student.level = 5;
    else if (student.xp >= 600) student.level = 4;
    else if (student.xp >= 400) student.level = 3;
    else if (student.xp >= 200) student.level = 2;
    else student.level = 1;

    const newAttempt = {
      id: `att-${Date.now()}`,
      studentId: student.id,
      conceptId: concept.id,
      conceptTitle: concept.title,
      attemptNumber,
      timestamp: new Date().toISOString(),
      transcript,
      audioDurationSeconds: audioDurationSeconds || 24,
      understandingScore,
      masteryStatus,
      correctPoints: analysisResult.correct_points || [],
      missingPoints: analysisResult.missing_points || [],
      misconceptions: analysisResult.misconceptions || [],
      semanticBreakdown: {
        understood: analysisResult.semantic_breakdown?.understood || analysisResult.correct_points || [],
        partiallyUnderstood: analysisResult.semantic_breakdown?.partially_understood || [],
        misconceptions: analysisResult.semantic_breakdown?.misconceptions || analysisResult.misconceptions || [],
        missingKnowledge: analysisResult.semantic_breakdown?.missing_knowledge || analysisResult.missing_points || [],
      },
      remediation: {
        shortCorrection: analysisResult.remediation?.short_correction || 'Review core definitions.',
        simpleExplanation: analysisResult.remediation?.simple_explanation || 'Decompose tables using functional dependencies.',
        realWorldAnalogy: analysisResult.remediation?.real_world_analogy || 'Organizing files into proper folders.',
        concreteExample: analysisResult.remediation?.concrete_example || 'Splitting customer records from order lines.',
        miniQuizQuestion: analysisResult.remediation?.mini_quiz_question || 'What does this concept eliminate?',
        retryPrompt: analysisResult.remediation?.retry_prompt || 'Try explaining again in your own words.',
      },
      confidenceLevel: analysisResult.confidence_level || 'Medium',
      recommendedAction: analysisResult.recommended_action || 'Review the remediation.',
      scoreDelta,
      xpAwarded: xpGained,
      followUpQuestions: [
        {
          id: `fq-${Date.now()}`,
          question: analysisResult.follow_up_question || `Why is ${concept.title} essential for data consistency?`,
          context: 'Testing depth of understanding.',
        }
      ],
    };

    attempts.push(newAttempt);

    // Dynamic Mastery Badges Unlocking based on completing Teach-Back modules
    const newlyUnlockedBadges: any[] = [];
    
    // First Teach-back badge
    const firstTbBadge = badges.find(b => b.id === 'b-tb-first');
    if (firstTbBadge && !firstTbBadge.unlocked) {
      firstTbBadge.unlocked = true;
      firstTbBadge.unlockedAt = new Date().toISOString().split('T')[0];
      firstTbBadge.masteryScore = understandingScore;
      newlyUnlockedBadges.push(firstTbBadge);
    }
    
    // Concept-specific teach-back badges
    if ((concept.id === 'concept-primary-key' || concept.title.toLowerCase().includes('primary key')) && understandingScore >= 80) {
      const pkBadge = badges.find(b => b.id === 'b-tb-pk');
      if (pkBadge && !pkBadge.unlocked) {
        pkBadge.unlocked = true;
        pkBadge.unlockedAt = new Date().toISOString().split('T')[0];
        pkBadge.masteryScore = understandingScore;
        newlyUnlockedBadges.push(pkBadge);
      }
    }
    
    if ((concept.id.includes('stack') || concept.title.toLowerCase().includes('stack')) && understandingScore >= 80) {
      const stackBadge = badges.find(b => b.id === 'b-tb-stack');
      if (stackBadge && !stackBadge.unlocked) {
        stackBadge.unlocked = true;
        stackBadge.unlockedAt = new Date().toISOString().split('T')[0];
        stackBadge.masteryScore = understandingScore;
        newlyUnlockedBadges.push(stackBadge);
      }
    }
    
    if ((concept.id.includes('norm') || concept.title.toLowerCase().includes('normalization')) && understandingScore >= 80) {
      const normBadge = badges.find(b => b.id === 'b-tb-norm');
      if (normBadge && !normBadge.unlocked) {
        normBadge.unlocked = true;
        normBadge.unlockedAt = new Date().toISOString().split('T')[0];
        normBadge.masteryScore = understandingScore;
        newlyUnlockedBadges.push(normBadge);
      }
    }
    
    if ((concept.id.includes('tree') || concept.title.toLowerCase().includes('tree') || concept.title.toLowerCase().includes('bst')) && understandingScore >= 80) {
      const treeBadge = badges.find(b => b.id === 'b-tb-tree');
      if (treeBadge && !treeBadge.unlocked) {
        treeBadge.unlocked = true;
        treeBadge.unlockedAt = new Date().toISOString().split('T')[0];
        treeBadge.masteryScore = understandingScore;
        newlyUnlockedBadges.push(treeBadge);
      }
    }
    
    if (understandingScore >= 90) {
      const perfectBadge = badges.find(b => b.id === 'b-tb-perfect');
      if (perfectBadge && !perfectBadge.unlocked) {
        perfectBadge.unlocked = true;
        perfectBadge.unlockedAt = new Date().toISOString().split('T')[0];
        perfectBadge.masteryScore = understandingScore;
        newlyUnlockedBadges.push(perfectBadge);
      }
    }
    
    if (newlyUnlockedBadges.length > 0) {
      newlyUnlockedBadges.forEach(b => {
        student.xp = (student.xp || 800) + b.xpReward;
        notifications.unshift({
          id: `notif-${Date.now()}-${b.id}`,
          userId: student.id,
          title: `🏅 Teach-Back Badge Unlocked: ${b.title}!`,
          message: `Congratulations! You mastered "${b.moduleTitle || concept.title}" in Teach-Back and earned +${b.xpReward} XP!`,
          type: 'BADGE',
          timestamp: new Date().toISOString(),
          read: false,
        });
      });
    }

    // Persistent Gap detection & auto-alert
    let createdAlert = null;
    if (attemptNumber >= 3 && understandingScore < 70) {
      const existingAlert = mentorAlerts.find(
        a => a.studentId === student.id && a.conceptId === concept.id && a.status === 'PENDING'
      );

      if (!existingAlert) {
        createdAlert = {
          id: `alert-${Date.now()}`,
          studentId: student.id,
          studentName: student.name,
          studentGrade: student.grade || 'Grade 12',
          conceptId: concept.id,
          conceptTitle: concept.title,
          subject: concept.subject,
          teacherId: student.assignedMentorId || 'teacher-1',
          attemptsCount: attemptNumber,
          latestScore: understandingScore,
          flaggedDate: new Date().toISOString(),
          status: 'PENDING',
          detectedIssues: analysisResult.misconceptions?.length > 0
            ? analysisResult.misconceptions
            : [`Repeated struggle with ${concept.title} after ${attemptNumber} teach-back attempts.`],
          missingConcepts: analysisResult.missing_points?.length > 0
            ? analysisResult.missing_points
            : ['Core functional decomposition'],
          suggestedMentorAction: `Schedule a 1-on-1 pedagogical review with ${student.name}. Walk through a visual schema decomposition on ${concept.title}.`,
          severity: attemptNumber >= 4 ? 'CRITICAL' : 'HIGH',
        };
        mentorAlerts.unshift(createdAlert);
      }
    }

    res.json({
      attempt: newAttempt,
      persistentGapDetected: masteryStatus === 'PERSISTENT_GAP',
      mentorAlertCreated: !!createdAlert,
      mentorAlert: createdAlert,
      studentXp: student.xp,
      studentLevel: student.level,
      xpAwarded: xpGained,
      unlockedBadges: newlyUnlockedBadges,
    });
  } catch (error: any) {
    console.error('Teachback analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze explanation' });
  }
});

// Follow-up question submission
app.post('/api/teachback/follow-up', async (req: Request, res: Response) => {
  const { attemptId, questionId, studentAnswer } = req.body;
  const attempt = attempts.find(a => a.id === attemptId);

  let feedback = 'Good follow-up response! You clarified the mechanism with appropriate detail.';
  let bonusXp = 20;

  if (aiClient && studentAnswer) {
    try {
      const prompt = `Evaluate the student's follow-up answer:
"${studentAnswer}"
Give a 1-2 sentence constructive pedagogical feedback.`;
      const r = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      if (r.text) feedback = r.text.trim();
    } catch (e) {
      console.warn('Follow-up evaluation fallback:', e);
    }
  }

  res.json({
    success: true,
    feedback,
    bonusXp,
    message: 'Follow-up question evaluated. +20 XP awarded!',
  });
});

// Personal Learning Twin Endpoint (Major Feature #15)
app.get('/api/student/:id/twin', (req: Request, res: Response) => {
  const studentId = req.params.id;
  const student = users.find(u => u.id === studentId) || users[1];

  const studentAttempts = attempts.filter(a => a.studentId === student.id);
  const attemptedScores = studentAttempts.map(a => a.understandingScore);
  const avgUnderstanding = attemptedScores.length > 0
    ? Math.round(attemptedScores.reduce((a, b) => a + b, 0) / attemptedScores.length)
    : 82;

  const strong = ['SQL Joins (88%)', 'Primary Key (82%)', 'BST (80%)'];
  const weak = ['Normalization (63%)', 'Functional Dependency (58%)', 'BCNF (59%)'];

  const unresolved = [
    {
      concept: 'Normalization',
      misconception: 'Confusing table decomposition with deleting duplicate rows from tables.',
      severity: 'High' as const,
    },
    {
      concept: 'Functional Dependency',
      misconception: 'Believing functional dependency X -> Y is always symmetric (Y -> X).',
      severity: 'Medium' as const,
    }
  ];

  const levelNames = ['Beginner', 'Learning', 'Developing', 'Proficient', 'Mastery'];
  const levelNum = student.level || 4;
  const levelName = levelNames[levelNum - 1] || 'Proficient';

  res.json({
    studentId: student.id,
    studentName: student.name,
    overallUnderstanding: avgUnderstanding,
    currentLevel: levelNum,
    levelName,
    xp: student.xp || 820,
    nextLevelXp: levelNum === 5 ? 1200 : levelNum * 200 + 200,
    streakDays: student.streakDays || 7,
    strongConcepts: strong,
    weakConcepts: weak,
    unresolvedMisconceptionsCount: unresolved.length,
    unresolvedMisconceptions: unresolved,
    recommendedNextTopic: 'Functional Dependency & Lossless Decomposition Drill',
    cognitiveResilienceScore: 84,
    lastUpdated: new Date().toISOString(),
  });
});

// Concept Dependency Graph (Feature #16)
app.get('/api/concepts/dependencies', (req: Request, res: Response) => {
  const graph = [
    {
      id: 'dep-1',
      title: 'Database Tables',
      subject: 'DBMS',
      prerequisites: [],
      dependents: ['Primary Key'],
      status: 'MASTERED',
      score: 90,
    },
    {
      id: 'dep-2',
      title: 'Primary Key',
      subject: 'DBMS',
      prerequisites: ['Database Tables'],
      dependents: ['Functional Dependency', 'SQL Joins'],
      status: 'MASTERED',
      score: 82,
    },
    {
      id: 'dep-3',
      title: 'Functional Dependency',
      subject: 'DBMS',
      prerequisites: ['Primary Key'],
      dependents: ['Normalization (1NF -> 2NF -> 3NF)'],
      status: 'PERSISTENT_GAP',
      score: 58,
    },
    {
      id: 'dep-4',
      title: 'Normalization',
      subject: 'DBMS',
      prerequisites: ['Functional Dependency'],
      dependents: ['Boyce-Codd Normal Form (BCNF)'],
      status: 'PERSISTENT_GAP',
      score: 63,
    },
    {
      id: 'dep-5',
      title: 'Boyce-Codd Normal Form (BCNF)',
      subject: 'DBMS',
      prerequisites: ['Normalization'],
      dependents: ['Relational Schema Synthesis'],
      status: 'NEEDS_SUPPORT',
      score: 61,
    },
    {
      id: 'dep-6',
      title: 'SQL Joins',
      subject: 'DBMS',
      prerequisites: ['Primary Key'],
      dependents: ['Query Optimization'],
      status: 'MASTERED',
      score: 88,
    },
  ];
  res.json(graph);
});

// Adaptive Learning Path (Feature #17) & Next Level Mission (#18)
app.get('/api/student/:id/learning-path', (req: Request, res: Response) => {
  const path = [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Primary Key & Entity Integrity',
      conceptId: 'concept-primary-key',
      type: 'LEARN',
      status: 'COMPLETED',
      score: 82,
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'Functional Dependencies & Determinants',
      conceptId: 'concept-functional-dependency',
      type: 'PRACTICE',
      status: 'COMPLETED',
      score: 58,
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Normalization (1NF, 2NF, 3NF Decomposition)',
      conceptId: 'concept-normalization',
      type: 'TEACH_BACK',
      status: 'IN_PROGRESS',
      score: 63,
    },
    {
      id: 'step-4',
      stepNumber: 4,
      title: 'Targeted Remediation on Partial Dependencies',
      conceptId: 'concept-normalization',
      type: 'REMEDIATION',
      status: 'IN_PROGRESS',
    },
    {
      id: 'step-5',
      stepNumber: 5,
      title: 'Mastery Challenge: BCNF & Lossless Joins',
      conceptId: 'concept-bcnf',
      type: 'MASTERY_TEST',
      status: 'LOCKED',
    },
  ];

  const mission = {
    topic: 'Relational Normalization & Normal Forms',
    conceptId: 'concept-normalization',
    currentScore: 63,
    targetScore: 80,
    checklist: [
      { id: 'm-1', task: 'AI Explanation in Beginner Mode', completed: true, type: 'EXPLANATION' },
      { id: 'm-2', task: 'Complete Practice Quiz on 2NF', completed: true, type: 'QUIZ' },
      { id: 'm-3', task: 'Voice Teach-Back on Table Decomposition', completed: false, type: 'TEACH_BACK' },
      { id: 'm-4', task: 'Challenge Question on BCNF Determinants', completed: false, type: 'CHALLENGE' },
    ],
  };

  res.json({ path, mission });
});

// Practice Questions Bank (#19)
app.get('/api/practice/questions', (req: Request, res: Response) => {
  const { conceptId, difficulty } = req.query;
  let list = [...practiceQuestions];
  if (conceptId) list = list.filter(q => q.conceptId === conceptId);
  if (difficulty) list = list.filter(q => q.difficulty === difficulty);
  res.json(list);
});

app.post('/api/practice/submit', (req: Request, res: Response) => {
  const { questionId, studentAnswer, studentId } = req.body;
  const question = practiceQuestions.find(q => q.id === questionId);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const isCorrect = String(studentAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
  const student = users.find(u => u.id === (studentId || 'student-1')) || users[1];

  let xpAwarded = 0;
  if (isCorrect) {
    xpAwarded = question.xp || 20;
    student.xp = (student.xp || 820) + xpAwarded;
  }

  res.json({
    correct: isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    xpAwarded,
    newTotalXp: student.xp,
  });
});

app.post('/api/practice/generate', async (req: Request, res: Response) => {
  const { conceptTitle, difficulty } = req.body;
  const targetDifficulty = difficulty || 'Medium';

  if (aiClient) {
    try {
      const prompt = `Generate 3 practice questions for concept "${conceptTitle || 'Relational Normalization'}" at ${targetDifficulty} difficulty.
Return strict JSON array matching:
[
  {
    "question": "Question text",
    "type": "MCQ or TRUE_FALSE or SCENARIO",
    "options": ["opt1", "opt2", "opt3", "opt4"],
    "correctAnswer": "Exact matching option",
    "explanation": "Why this is correct",
    "difficulty": "${targetDifficulty}",
    "xp": 25
  }
]`;
      const geminiRes = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      if (geminiRes.text) {
        const parsed = JSON.parse(geminiRes.text);
        return res.json(parsed);
      }
    } catch (e) {
      console.warn('Gemini question generation fallback:', e);
    }
  }

  res.json([
    {
      question: `What is the key criterion for 3NF regarding transitive dependencies in ${conceptTitle || 'Normalization'}?`,
      type: 'MCQ',
      options: [
        'No non-prime attribute may transitively depend on the primary key',
        'All attributes must be prime keys',
        'Every row must be uniquely duplicated',
        'Tables must only contain numeric IDs'
      ],
      correctAnswer: 'No non-prime attribute may transitively depend on the primary key',
      explanation: '3NF strictly eliminates transitive functional dependencies between non-key attributes.',
      difficulty: targetDifficulty,
      xp: 25,
    }
  ]);
});

// Smart Spaced Repetition Revision (#20)
app.get('/api/student/:id/revision-schedule', (req: Request, res: Response) => {
  res.json({
    todayDueCount: 2,
    schedule: revisionSchedule,
  });
});

app.post('/api/student/:id/revision/complete', (req: Request, res: Response) => {
  const { revisionId } = req.body;
  const item = revisionSchedule.find(r => r.id === revisionId);
  if (item) {
    item.completed = true;
  }
  res.json({ success: true, message: 'Revision task completed! +20 XP awarded.' });
});

// Gamification Badges (#9)
app.get('/api/student/:id/badges', (req: Request, res: Response) => {
  res.json(badges);
});

// Notifications (#31)
app.get('/api/notifications/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const list = notifications.filter(n => n.userId === userId || !n.userId);
  res.json(list);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// Real-Time Direct Mentor <-> Student Messaging
app.get('/api/messages', (req: Request, res: Response) => {
  const { studentId, teacherId } = req.query;
  let list = [...directMessages];
  if (studentId) {
    list = list.filter(m => m.senderId === studentId || m.recipientId === studentId);
  }
  if (teacherId) {
    list = list.filter(m => m.senderId === teacherId || m.recipientId === teacherId);
  }
  // Sort oldest to newest for chronological chat
  list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  res.json(list);
});

app.post('/api/messages/send', (req: Request, res: Response) => {
  const {
    senderId,
    senderName,
    senderRole,
    recipientId,
    recipientName,
    text,
    conceptTag,
    type,
  } = req.body;

  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  const sender = users.find(u => u.id === senderId);
  const recipient = users.find(u => u.id === recipientId);

  const newMsg = {
    id: `msg-${Date.now()}`,
    senderId: senderId || 'teacher-1',
    senderName: senderName || (sender ? sender.name : 'Mentor'),
    senderRole: senderRole || 'teacher',
    recipientId: recipientId || 'student-1',
    recipientName: recipientName || (recipient ? recipient.name : 'Student'),
    text: String(text).trim(),
    timestamp: new Date().toISOString(),
    conceptTag: conceptTag || undefined,
    type: type || (senderRole === 'student' ? 'QUESTION' : 'FEEDBACK'),
    read: false,
  };

  directMessages.push(newMsg);

  // Dispatch notification to recipient
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: newMsg.recipientId,
    title: senderRole === 'teacher' ? '💬 New Feedback from your Mentor' : '💬 Student Message Received',
    message: `${newMsg.senderName}: "${newMsg.text.slice(0, 80)}${newMsg.text.length > 80 ? '...' : ''}"`,
    type: 'MENTOR',
    timestamp: new Date().toISOString(),
    read: false,
  });

  res.json({
    success: true,
    message: newMsg,
  });
});


// Multimodal Learning: Diagram & Notes Analysis (#29)
app.post('/api/learning/analyze-diagram', async (req: Request, res: Response) => {
  const { imageBase64, diagramType, noteText } = req.body;

  let feedback = 'Diagram analyzed: Node relationships and schema integrity are verified.';
  let corrections = ['Ensure foreign key links connect to the exact primary key column.'];

  if (aiClient && imageBase64) {
    try {
      const prompt = `Analyze this student diagram (${diagramType || 'Database Schema / Tree Structure'}).
Identify if there are any structural errors, missing arrows, improper relationships, or incorrect representations.
Return concise diagnostic feedback.`;

      const geminiRes = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              },
            },
            { text: prompt },
          ],
        },
      });

      if (geminiRes.text) feedback = geminiRes.text.trim();
    } catch (e) {
      console.warn('Gemini diagram analysis notice:', e);
    }
  }

  res.json({
    status: 'Analyzed',
    feedback,
    corrections,
    score: 85,
  });
});

// AI Teacher Assistant (#26)
app.post('/api/teacher/ai-assistant', async (req: Request, res: Response) => {
  const { query, teacherId } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  let reply = '';
  let suggestedQuestions: string[] = [];
  let generatedWorksheet = '';

  const lower = query.toLowerCase();

  if (aiClient) {
    try {
      const cohortContext = `COHORT SUMMARY FOR TEACHER:
- Arun Kumar: Struggling with Normalization (4 attempts, 63%) and Functional Dependency (3 attempts, 58%).
- Rahul Varma: Struggling with BCNF (3 attempts, 59%).
- Sneha Patel: Mastered all DBMS concepts (Avg 86%).
- Divya Krishnan: High proficiency (Avg 83%).
- Lowest class concepts: Normalization (55% cohort avg), Functional Dependency (58% cohort avg).`;

      const prompt = `You are LEARNBACK AI's Teacher Assistant for faculty Dr. Priya Sharma.
Teacher Query: "${query}"

CONTEXT:
${cohortContext}

Provide an insightful, professional pedagogical response. If the teacher asks to generate questions, a worksheet, or analyze a student, provide concrete actionable material.`;

      const geminiRes = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (geminiRes.text) {
        reply = geminiRes.text;
      }
    } catch (e) {
      console.warn('AI Teacher Assistant error:', e);
    }
  }

  if (!reply) {
    if (lower.includes('struggling') || lower.includes('normalization')) {
      reply = `Students currently struggling with Normalization:
1. Arun Kumar (4 attempts, 63%, Persistent Gap flagged). Core issue: Confuses schema decomposition with deleting duplicate rows.
2. Rahul Varma (72%, Needs Attention on 3NF transitive dependencies).

Recommendation: Schedule a 15-minute table decomposition clinic using the Student-Course enrollment schema.`;
    } else if (lower.includes('worksheet') || lower.includes('generate')) {
      reply = `Here is a custom remediation worksheet:
Title: Targeted Practice on Functional Dependencies & 2NF
1. Given Relation R(A, B, C, D) with Key (A, B) and FD: B -> C. Why does this violate 2NF?
2. Decompose R into 2NF relations while preserving all attributes.
3. Prove whether the decomposition is lossless.`;
    } else {
      reply = `Class telemetry summary: The cohort has strong mastery in SQL Joins (89%) and Primary Keys (82%). The primary friction points are Normalization (55%) and Functional Dependencies (58%). I recommend revising composite candidate keys before the upcoming exam.`;
    }
  }

  res.json({
    reply,
    suggestedQuestions: [
      'Which students are struggling with normalization?',
      'Why is Arun Kumar having repeated difficulty?',
      'Generate a 5-question diagnostic quiz on BCNF',
      'Create a revision worksheet for the upcoming test'
    ],
  });
});

// Student Progress
app.get('/api/progress/student/:id', (req: Request, res: Response) => {
  const studentId = req.params.id;
  const student = users.find(u => u.id === studentId) || users[1];

  const studentAttempts = attempts.filter(a => a.studentId === studentId);
  const conceptMap: Record<string, any> = {};

  concepts.forEach(c => {
    const cAttempts = studentAttempts.filter(a => a.conceptId === c.id);
    if (cAttempts.length > 0) {
      const latestAttempt = cAttempts[cAttempts.length - 1];
      const highestScore = Math.max(...cAttempts.map(a => a.understandingScore));
      conceptMap[c.id] = {
        conceptId: c.id,
        conceptTitle: c.title,
        subject: c.subject,
        category: c.category,
        attemptsCount: cAttempts.length,
        latestScore: latestAttempt.understandingScore,
        highestScore,
        masteryStatus: latestAttempt.masteryStatus,
        isPersistentGap: latestAttempt.masteryStatus === 'PERSISTENT_GAP' || (cAttempts.length >= 3 && latestAttempt.understandingScore < 70),
        lastAttemptDate: latestAttempt.timestamp,
        attempts: cAttempts,
      };
    } else {
      conceptMap[c.id] = {
        conceptId: c.id,
        conceptTitle: c.title,
        subject: c.subject,
        category: c.category,
        attemptsCount: 0,
        latestScore: 0,
        highestScore: 0,
        masteryStatus: 'NEEDS_SUPPORT',
        isPersistentGap: false,
        lastAttemptDate: null,
        attempts: [],
      };
    }
  });

  const conceptProgressList = Object.values(conceptMap);
  const attempted = conceptProgressList.filter(c => c.attemptsCount > 0);
  const masteredCount = attempted.filter(c => c.masteryStatus === 'MASTERED').length;
  const persistentGapsCount = attempted.filter(c => c.isPersistentGap).length;
  const improvingCount = attempted.filter(c => c.masteryStatus === 'IMPROVING').length;
  const needsSupportCount = attempted.filter(c => c.masteryStatus === 'NEEDS_SUPPORT').length;

  const overallProgress = attempted.length > 0
    ? Math.round(attempted.reduce((acc, c) => acc + c.latestScore, 0) / attempted.length)
    : 0;

  const activeAlerts = mentorAlerts.filter(a => a.studentId === studentId && a.status === 'PENDING');
  const studentInterventions = mentorInterventions.filter(i => i.studentId === studentId);

  res.json({
    student,
    overallProgress,
    conceptsMasteredCount: masteredCount,
    conceptsNeedingImprovementCount: needsSupportCount,
    persistentGapsCount,
    improvingCount,
    totalAttempted: attempted.length,
    learningStreakDays: student.streakDays || 7,
    xp: student.xp || 820,
    level: student.level || 4,
    pendingRemediationCount: persistentGapsCount + needsSupportCount,
    hasActiveMentorAlert: activeAlerts.length > 0,
    activeAlerts,
    interventions: studentInterventions,
    conceptProgress: conceptProgressList,
    recentAttempts: studentAttempts.slice(-8).reverse(),
  });
});

// Teacher: Get all students
app.get('/api/teacher/students', (req: Request, res: Response) => {
  const teacherId = (req.query.teacherId as string) || 'teacher-1';
  const teacher = users.find(u => u.id === teacherId) || users[0];

  const studentList = users.filter(u => u.role === 'student');

  const roster = studentList.map(s => {
    const sAttempts = attempts.filter(a => a.studentId === s.id);
    const activeAlert = mentorAlerts.find(a => a.studentId === s.id && a.status === 'PENDING');
    const uniqueConcepts = new Set(sAttempts.map(a => a.conceptId));
    let weakConceptNames: string[] = [];
    let avgScore = 0;

    if (sAttempts.length > 0) {
      avgScore = Math.round(sAttempts.reduce((acc, a) => acc + a.understandingScore, 0) / sAttempts.length);
      const lowScores = sAttempts.filter(a => a.understandingScore < 70);
      weakConceptNames = Array.from(new Set(lowScores.map(a => a.conceptTitle)));
    }

    let status = 'ON_TRACK';
    if (activeAlert) {
      status = 'INTERVENTION_REQUIRED';
    } else if (weakConceptNames.length > 0) {
      status = 'NEEDS_ATTENTION';
    }

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      grade: s.grade || 'Grade 12',
      schoolName: s.schoolName,
      totalAttempts: sAttempts.length,
      averageScore: avgScore,
      conceptsCount: uniqueConcepts.size,
      weakConcepts: weakConceptNames,
      status,
      activeAlertId: activeAlert?.id,
      activeAlertConcept: activeAlert?.conceptTitle,
      latestAttemptDate: sAttempts.length > 0 ? sAttempts[sAttempts.length - 1].timestamp : null,
      xp: s.xp || 750,
      level: s.level || 4,
    };
  });

  const pendingAlerts = mentorAlerts.filter(a => a.status === 'PENDING');

  res.json({
    teacher,
    totalStudents: roster.length,
    conceptsRequiringAttention: 3,
    persistentLearningGapsCount: pendingAlerts.length,
    studentsImprovingCount: roster.filter(s => s.status === 'ON_TRACK').length,
    studentsNeedingInterventionCount: roster.filter(s => s.status === 'INTERVENTION_REQUIRED').length,
    students: roster,
  });
});

// Teacher: Get single student deep dive
app.get('/api/teacher/student/:id', (req: Request, res: Response) => {
  const studentId = req.params.id;
  const student = users.find(u => u.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const studentAttempts = attempts.filter(a => a.studentId === studentId);
  const studentAlerts = mentorAlerts.filter(a => a.studentId === studentId);
  const studentInterventionsList = mentorInterventions.filter(i => i.studentId === studentId);

  const conceptBreakdown = concepts.map(c => {
    const cAttempts = studentAttempts.filter(a => a.conceptId === c.id);
    const latest = cAttempts.length > 0 ? cAttempts[cAttempts.length - 1] : null;
    return {
      conceptId: c.id,
      title: c.title,
      subject: c.subject,
      category: c.category,
      attemptsCount: cAttempts.length,
      latestScore: latest ? latest.understandingScore : 0,
      masteryStatus: latest ? latest.masteryStatus : 'NEEDS_SUPPORT',
      isPersistentGap: latest ? latest.masteryStatus === 'PERSISTENT_GAP' : false,
      allScores: cAttempts.map(a => a.understandingScore),
      latestMisconceptions: latest ? latest.misconceptions : [],
      latestMissingPoints: latest ? latest.missingPoints : [],
    };
  });

  res.json({
    student,
    attempts: studentAttempts,
    conceptBreakdown,
    alerts: studentAlerts,
    interventions: studentInterventionsList,
  });
});

// Teacher: Alerts
app.get('/api/teacher/alerts', (req: Request, res: Response) => {
  res.json(mentorAlerts);
});

// Mentor Intervention submission
app.post('/api/mentor/intervene', (req: Request, res: Response) => {
  const { alertId, studentId, teacherId, conceptId, interventionType, notes, prescribedResource } = req.body;

  const student = users.find(u => u.id === studentId) || users[1];
  const teacher = users.find(u => u.id === teacherId) || users[0];
  const concept = concepts.find(c => c.id === conceptId) || concepts[0];

  const newIntervention = {
    id: `int-${Date.now()}`,
    alertId,
    studentId: student.id,
    studentName: student.name,
    teacherId: teacher.id,
    teacherName: teacher.name,
    conceptId: concept.id,
    conceptTitle: concept.title,
    interventionType: interventionType || '1-ON-1_SESSION',
    notes: notes || 'Conducted 1-on-1 pedagogical review with visual schema decomposition.',
    prescribedResource: prescribedResource || 'Targeted Practice Worksheet: Lossless Joins & Normal Forms',
    timestamp: new Date().toISOString(),
    status: 'ACTIVE',
  };

  mentorInterventions.unshift(newIntervention);

  if (alertId) {
    const alert = mentorAlerts.find(a => a.id === alertId);
    if (alert) alert.status = 'INTERVENED';
  } else {
    const matchingAlert = mentorAlerts.find(
      a => a.studentId === student.id && a.conceptId === concept.id && a.status === 'PENDING'
    );
    if (matchingAlert) matchingAlert.status = 'INTERVENED';
  }

  // Push notification to student
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: student.id,
    title: 'Mentor Clinical Feedback Received',
    message: `${teacher.name} has provided clinical guidance and prescribed resources for ${concept.title}.`,
    type: 'MENTOR',
    timestamp: new Date().toISOString(),
    read: false,
  });

  res.json({
    success: true,
    intervention: newIntervention,
    message: 'Teacher intervention logged successfully and dispatched to student dashboard.',
  });
});

// ==========================================
// ADMINISTRATOR API ROUTES
// ==========================================
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const admins = users.filter(u => u.role === 'admin');
  const pendingAlerts = mentorAlerts.filter(a => a.status === 'PENDING').length;
  const resolvedAlerts = mentorAlerts.filter(a => a.status === 'INTERVENED').length;

  const totalScores = attempts.map((a: any) => a.understandingScore || 0);
  const avgMastery = totalScores.length > 0
    ? Math.round(totalScores.reduce((a: number, b: number) => a + b, 0) / totalScores.length)
    : 78;

  res.json({
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalAdmins: admins.length,
    totalSchools: schools.length,
    totalConcepts: concepts.length,
    totalDocuments: documents.length,
    totalTeachBackAttempts: attempts.length,
    pendingAlerts,
    resolvedAlerts,
    avgMastery,
  });
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  const { role, schoolId } = req.query;
  let filtered = [...users];
  if (role) filtered = filtered.filter(u => u.role === role);
  if (schoolId) filtered = filtered.filter(u => u.schoolId === schoolId);
  res.json(filtered);
});

app.post('/api/admin/users', (req: Request, res: Response) => {
  const { name, email, role, schoolId, grade, subject, assignedMentorId } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  const school = schools.find(s => s.id === schoolId) || schools[0];
  const mentor = assignedMentorId ? users.find(u => u.id === assignedMentorId) : undefined;

  const newUser: UserRecord = {
    id: `user-${Date.now()}`,
    name,
    email,
    role,
    schoolId: school.id,
    schoolName: school.name,
    grade: role === 'student' ? (grade || 'Grade 12') : undefined,
    subject: role === 'teacher' ? (subject || 'General') : undefined,
    assignedMentorId: role === 'student' ? mentor?.id : undefined,
    assignedMentorName: role === 'student' ? mentor?.name : undefined,
    xp: 0,
    level: 1,
    streakDays: 0,
  };

  users.push(newUser);
  res.json({ success: true, user: newUser });
});

app.post('/api/admin/assign-mentor', (req: Request, res: Response) => {
  const { studentId, mentorId } = req.body;
  const student = users.find(u => u.id === studentId && u.role === 'student');
  const teacher = users.find(u => u.id === mentorId && u.role === 'teacher');

  if (!student || !teacher) {
    return res.status(404).json({ error: 'Student or teacher mentor not found.' });
  }

  student.assignedMentorId = teacher.id;
  student.assignedMentorName = teacher.name;

  res.json({
    success: true,
    student,
    message: `Assigned mentor ${teacher.name} to ${student.name}.`,
  });
});

app.post('/api/admin/schools', (req: Request, res: Response) => {
  const { name, code, city } = req.body;
  if (!name) return res.status(400).json({ error: 'School name is required.' });

  const newSchool = {
    id: `sch-${Date.now()}`,
    name,
    code: code || name.slice(0, 3).toUpperCase(),
    city: city || 'Chennai',
  };

  schools.push(newSchool);
  res.json({ success: true, school: newSchool });
});

// Server bootstrap
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LEARNBACK AI server listening on http://0.0.0.0:${PORT}`);
    console.log(`Gemini API configured: ${!!aiClient}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
