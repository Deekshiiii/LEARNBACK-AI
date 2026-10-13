import React, { useState } from 'react';
import {
  Grid,
  Filter,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Calendar,
  Users
} from 'lucide-react';

export const ClassMisconceptionHeatmap: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const heatmapData = [
    {
      concept: 'Arrays & Indexing',
      subject: 'Data Structures',
      understanding: 91,
      indicator: '🟢',
      status: 'Mastered',
      commonMisconception: 'Off-by-one boundary indexing in zero-based arrays.',
      affectedStudents: 2,
    },
    {
      concept: 'SQL Joins & Foreign Keys',
      subject: 'DBMS',
      understanding: 88,
      indicator: '🟢',
      status: 'Mastered',
      commonMisconception: 'Assuming FULL OUTER JOIN works without unmatched null padding.',
      affectedStudents: 3,
    },
    {
      concept: 'Trees & Inorder Traversal',
      subject: 'Data Structures',
      understanding: 84,
      indicator: '🟢',
      status: 'Mastered',
      commonMisconception: 'Assuming any ordered binary tree is self-balancing.',
      affectedStudents: 4,
    },
    {
      concept: 'Primary Key & Entity Integrity',
      subject: 'DBMS',
      understanding: 82,
      indicator: '🟢',
      status: 'Mastered',
      commonMisconception: 'Assuming primary key columns can accept NULL values before assignment.',
      affectedStudents: 4,
    },
    {
      concept: 'Graphs & Adjacency Lists',
      subject: 'Data Structures',
      understanding: 68,
      indicator: '🟡',
      status: 'Developing',
      commonMisconception: 'Confusing space complexity of adjacency matrices with adjacency lists.',
      affectedStudents: 9,
    },
    {
      concept: 'Boyce-Codd Normal Form (BCNF)',
      subject: 'DBMS',
      understanding: 61,
      indicator: '🟠',
      status: 'Needs Support',
      commonMisconception: 'Assuming BCNF always preserves all original functional dependencies.',
      affectedStudents: 14,
    },
    {
      concept: 'Functional Dependency Directionality',
      subject: 'DBMS',
      understanding: 58,
      indicator: '🟠',
      status: 'Needs Support',
      commonMisconception: 'Believing functional dependency X -> Y implies symmetry (Y -> X).',
      affectedStudents: 16,
    },
    {
      concept: 'Breadth-First Search (BFS)',
      subject: 'Data Structures',
      understanding: 57,
      indicator: '🟠',
      status: 'Needs Support',
      commonMisconception: 'Using a Stack instead of a Queue to implement level-order traversal.',
      affectedStudents: 18,
    },
    {
      concept: 'Relational Normalization Decomposition',
      subject: 'DBMS',
      understanding: 55,
      indicator: '🔴',
      status: 'Persistent Gap Cluster',
      commonMisconception: 'Believing normalization is running a query to delete duplicate rows from tables.',
      affectedStudents: 22,
    },
    {
      concept: 'Depth-First Search (DFS) Cycle Detection',
      subject: 'Data Structures',
      understanding: 43,
      indicator: '🔴',
      status: 'Persistent Gap Cluster',
      commonMisconception: 'Failing to maintain a 3-color visited state (White, Gray, Black) in directed graphs.',
      affectedStudents: 26,
    },
  ];

  const filtered = heatmapData.filter(d => {
    if (selectedSubject !== 'All' && d.subject !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Cohort Telemetry Heatmap
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">
            Class Misconception Heatmap Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify cohort-level bottlenecks, common erroneous mental models, and persistent difficulty clusters.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Subject:</span>
          </span>
          {['All', 'DBMS', 'Data Structures'].map(s => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === s
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Concept / Syllabus Unit</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Cohort Understanding</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Prevalent Mental Model Error</th>
              <th className="py-3 px-4 text-right">Affected Students</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-base">{item.indicator}</span>
                  <span className="font-extrabold">{item.concept}</span>
                </td>

                <td className="py-4 px-4 text-slate-600 font-medium">
                  {item.subject}
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900">
                      {item.understanding}%
                    </span>
                    <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.understanding >= 80
                            ? 'bg-emerald-500'
                            : item.understanding >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.understanding}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      item.understanding >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.understanding >= 60
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800 font-black'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="py-4 px-4 text-slate-700 italic max-w-xs">
                  “{item.commonMisconception}”
                </td>

                <td className="py-4 px-4 text-right">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-lg ${
                      item.affectedStudents > 15
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.affectedStudents} students
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
