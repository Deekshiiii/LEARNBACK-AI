import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  FolderTree,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  BookOpen,
  Calendar,
  FileCode,
  Tag
} from 'lucide-react';
import { DocumentSource } from '../../types';
import { uploadDocument } from '../../services/api';

interface StudyMaterialUploaderProps {
  documents: DocumentSource[];
  onDocumentAdded: (doc: DocumentSource) => void;
  onSelectConceptFromTree?: (conceptTitle: string) => void;
}

export const StudyMaterialUploader: React.FC<StudyMaterialUploaderProps> = ({
  documents,
  onDocumentAdded,
  onSelectConceptFromTree,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docSubject, setDocSubject] = useState('Database Management Systems');
  const [docContent, setDocContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeDoc, setActiveDoc] = useState<DocumentSource>(documents[0]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setDocTitle(file.name.replace(/\.[^/.]+$/, ''));

    // Read content
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setDocContent(text || '');
    };
    reader.readAsText(file);
  };

  const handleProcessUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docContent) {
      alert('Please provide a document title and text content.');
      return;
    }

    setIsUploading(true);
    try {
      const newDoc = await uploadDocument({
        title: docTitle,
        subject: docSubject,
        content: docContent,
        filename: selectedFile?.name || `${docTitle}.pdf`,
        fileType: selectedFile?.type || 'application/pdf',
      });
      onDocumentAdded(newDoc);
      setActiveDoc(newDoc);
      setDocTitle('');
      setDocContent('');
      setSelectedFile(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const loadSampleStudyNotes = () => {
    setDocTitle('Operating Systems: Deadlock & Concurrency');
    setDocSubject('Operating Systems');
    setDocContent(`OPERATING SYSTEMS - CHAPTER 5: PROCESS SYNCHRONIZATION & DEADLOCKS
1. A Deadlock occurs when a set of concurrent processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.
2. Coffman Conditions (Four conditions must hold simultaneously for a deadlock):
   - Mutual Exclusion: At least one resource must be held in a non-shareable mode.
   - Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources.
   - No Preemption: Resources cannot be preempted; only released voluntarily by the process.
   - Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next.
3. Banker's Algorithm: Resource allocation and deadlock avoidance algorithm that simulates maximum resource allocation safety.`);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-teal-100 text-teal-800">
                Textbook & Study Material Pipeline
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Upload Your Study Notes (PDF, DOCX, TXT)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The AI parses the document, extracts key topics, maps conceptual dependencies, and generates a structured concept hierarchy for voice learning.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSampleStudyNotes}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Load Sample OS Material</span>
          </button>
        </div>

        <form onSubmit={handleProcessUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Document / Chapter Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Relational Normalization & SQL Queries"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Database Management Systems"
                value={docSubject}
                onChange={e => setDocSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* File input / drag & drop box */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors bg-slate-50/50">
            <UploadCloud className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">
              {selectedFile ? selectedFile.name : 'Choose a PDF, DOCX or TXT file'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports course lecture notes, syllabus chapters, and reference books.
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="mt-3 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Extracted Text Content (or Paste Notes Directly)
            </label>
            <textarea
              rows={4}
              required
              placeholder="Paste raw textbook excerpt here to extract topics..."
              value={docContent}
              onChange={e => setDocContent(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || !docContent}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extracting Topics & Concepts with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Process Material & Extract Concept Hierarchy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List & Concept Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Uploaded Materials ({documents.length})
          </h3>
          {documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => setActiveDoc(doc)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeDoc?.id === doc.id
                  ? 'border-teal-500 bg-teal-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {doc.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {doc.subject}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {doc.conceptsCount} Concepts
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {doc.uploadDate}
                </span>
                <span>{doc.topicsCount} Topics</span>
              </div>
            </div>
          ))}
        </div>

        {/* Concept Hierarchy Tree Viewer */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  AI Topic Extraction Hierarchy
                </h3>
                <p className="text-[11px] text-slate-500">
                  Document: <strong className="text-slate-800">{activeDoc?.title}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* ASCII / Visual Tree Representation */}
          <div className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto shadow-inner">
            <div className="text-cyan-400 font-bold mb-1">
              📂 {activeDoc?.subject}
            </div>
            {activeDoc?.topics.map((top, idx) => (
              <div key={top.id} className="pl-4 border-l border-emerald-900/60 ml-2 py-1">
                <div className="text-teal-200 font-semibold">
                  ├── 📑 {top.name}
                </div>
                <div className="pl-6 border-l border-emerald-900/40 ml-2 py-0.5 space-y-1">
                  {top.concepts.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      onClick={() => onSelectConceptFromTree && onSelectConceptFromTree(c)}
                      className="text-white hover:text-teal-300 hover:underline cursor-pointer flex items-center gap-1.5 transition-colors"
                      title="Click to study this concept"
                    >
                      <span className="text-emerald-500">└── 💡</span>
                      <span>{c}</span>
                      <span className="text-[10px] text-slate-400 font-sans ml-1">
                        [Study with Voice]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                All extracted concepts have been loaded into your learning library.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
