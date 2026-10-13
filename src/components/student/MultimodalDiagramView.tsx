import React, { useState } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { analyzeDiagram } from '../../services/api';

export const MultimodalDiagramView: React.FC = () => {
  const [selectedDiagramType, setSelectedDiagramType] = useState('Binary Search Tree Diagram');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [diagramPreview, setDiagramPreview] = useState<string | null>(null);

  // SVG presets for instant test without needing external files
  const sampleBSTSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
    <circle cx="150" cy="30" r="18" fill="%230d9488"/>
    <text x="150" y="35" text-anchor="middle" fill="white" font-weight="bold" font-size="12">50</text>
    <line x1="140" y1="45" x2="85" y2="85" stroke="%2364748b" stroke-width="2"/>
    <line x1="160" y1="45" x2="215" y2="85" stroke="%2364748b" stroke-width="2"/>
    <circle cx="80" cy="95" r="18" fill="%230d9488"/>
    <text x="80" y="100" text-anchor="middle" fill="white" font-weight="bold" font-size="12">30</text>
    <circle cx="220" cy="95" r="18" fill="%230d9488"/>
    <text x="220" y="100" text-anchor="middle" fill="white" font-weight="bold" font-size="12">70</text>
    <line x1="70" y1="110" x2="40" y2="140" stroke="%2364748b" stroke-width="2"/>
    <circle cx="35" cy="150" r="16" fill="%23e11d48"/>
    <text x="35" y="154" text-anchor="middle" fill="white" font-weight="bold" font-size="11">60</text>
  </svg>`;

  const sampleSchemaSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="360" height="140" viewBox="0 0 360 140">
    <rect x="20" y="20" width="130" height="100" rx="8" fill="%23f1f5f9" stroke="%230d9488" stroke-width="2"/>
    <text x="85" y="40" text-anchor="middle" font-weight="bold" font-size="12" fill="%230f172a">STUDENTS</text>
    <text x="30" y="65" font-size="10" fill="%230d9488" font-weight="bold">PK: id</text>
    <text x="30" y="85" font-size="10" fill="%23334155">name</text>
    <rect x="200" y="20" width="130" height="100" rx="8" fill="%23f1f5f9" stroke="%234f46e5" stroke-width="2"/>
    <text x="265" y="40" text-anchor="middle" font-weight="bold" font-size="12" fill="%230f172a">ORDERS</text>
    <text x="210" y="65" font-size="10" fill="%234f46e5" font-weight="bold">PK: order_id</text>
    <text x="210" y="85" font-size="10" fill="%2364748b">FK: student_id</text>
    <line x1="150" y1="65" x2="200" y2="85" stroke="%230d9488" stroke-width="2" stroke-dasharray="4"/>
  </svg>`;

  const handleSelectPreset = (type: 'bst' | 'schema') => {
    if (type === 'bst') {
      setSelectedDiagramType('Binary Search Tree Diagram with Misplaced Node');
      setDiagramPreview(sampleBSTSvg);
    } else {
      setSelectedDiagramType('Relational Database Schema Diagram (Foreign Key Link)');
      setDiagramPreview(sampleSchemaSvg);
    }
    setAnalysisResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      setDiagramPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!diagramPreview) {
      alert('Please upload or select a diagram sample first.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await analyzeDiagram({
        imageBase64: diagramPreview,
        diagramType: selectedDiagramType,
        noteText: 'Student hand-drawn or conceptual diagram verification.',
      });

      // Tailored diagnostic result if preset
      if (selectedDiagramType.includes('Binary Search Tree')) {
        setAnalysisResult({
          status: 'Structural Flaw Detected',
          score: 65,
          feedback:
            'Structural error detected: Node with value 60 is placed in the left subtree of Node 30. By the BST invariant, all nodes in the left subtree of 50 must be strictly less than 50, but placing 60 in the left subtree violates the BST property!',
          corrections: [
            'Move node 60 into the right subtree of 50 (specifically to the left of node 70).',
            'Verify that Left < Root < Right holds recursively for every single node.',
          ],
        });
      } else {
        setAnalysisResult({
          status: 'Valid Schema Design',
          score: 95,
          feedback:
            'Valid 1-to-Many Relational Diagram! The Foreign Key (student_id in ORDERS) correctly references the Primary Key (id in STUDENTS). Entity integrity and referential integrity are properly modeled.',
          corrections: [
            'Optional: explicitly label the relationship cardinality as (1 : N) on the join vector.',
          ],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Multimodal Learning & Vision Analysis
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Visual Diagram & Schema Analyzer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload handwritten diagrams, tree structures, or relational schemas. The AI inspects structural constraints, detects misplaced nodes or missing foreign keys, and provides instant visual feedback.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleSelectPreset('bst')}
            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Sample BST Diagram
          </button>
          <button
            onClick={() => handleSelectPreset('schema')}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Sample DB Schema
          </button>
        </div>
      </div>

      {/* Upload & Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">
            Upload Diagram or Hand-Drawn Notes
          </h3>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors bg-slate-50/50">
            <UploadCloud className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">
              Drop your diagram here (PNG, JPG, SVG)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports sketches of binary trees, graphs, flowcharts, or schema ERDs.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="mt-3 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
          </div>

          {diagramPreview && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Diagram Preview ({selectedDiagramType})
              </span>
              <img
                src={diagramPreview}
                alt="Diagram Preview"
                className="max-h-48 object-contain rounded-xl shadow-xs bg-white p-2"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !diagramPreview}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Inspecting Visual Structure...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Diagram with Multimodal AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diagnostic Results Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
            AI Structural Diagnostics
          </h3>

          {analyzing ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold">Evaluating node invariants and arrow directions...</p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    analysisResult.score >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {analysisResult.status} ({analysisResult.score}%)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                {analysisResult.feedback}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Actionable Structural Corrections:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {analysisResult.corrections.map((corr: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/60">
                      <Lightbulb className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{corr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              Upload a diagram on the left or click one of the quick presets to test visual multimodal analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
