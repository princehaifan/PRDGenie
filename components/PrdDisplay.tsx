import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { exportMarkdown, exportDocx, exportPdf } from '../services/export';
import { MarkdownIcon, WordIcon, PdfIcon, EditIcon, ViewIcon, SettingsIcon } from './icons';

interface PrdDisplayProps {
  content: string;
  onReset: () => void;
}

const PrdDisplay: React.FC<PrdDisplayProps> = ({ content, onReset }) => {
  const [editedContent, setEditedContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const prdViewRef = useRef<HTMLDivElement>(null);

  // State for modal and custom export fields
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Failed to copy');
        setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleCustomExportDocx = () => {
    if (prdViewRef.current) {
        exportDocx(prdViewRef.current.innerHTML, 'prd.docx', { header: headerText, footer: footerText });
        setIsExportModalOpen(false); // Close modal after export
    }
  };

  const handleCustomExportPdf = () => {
      if (prdViewRef.current) {
          exportPdf(prdViewRef.current, 'prd.pdf', { header: headerText, footer: footerText });
          setIsExportModalOpen(false); // Close modal after export
      }
  };

  const ExportModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setIsExportModalOpen(false)}>
      <div className="bg-dark-surface rounded-lg shadow-xl p-8 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4 text-gray-100">Custom Export Options</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="header-text" className="block text-sm font-medium text-dark-content mb-1">Header Text</label>
            <input
              type="text"
              id="header-text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="e.g., Created by: John Doe"
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-dark-content placeholder-gray-500"
            />
          </div>
          <div>
            <label htmlFor="footer-text" className="block text-sm font-medium text-dark-content mb-1">Footer Text</label>
            <input
              type="text"
              id="footer-text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="e.g., Version 1.0 - Confidential"
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-dark-content placeholder-gray-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors">
            Cancel
          </button>
          <button onClick={handleCustomExportDocx} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">
            <WordIcon className="h-4 w-4" /> Export DOCX
          </button>
          <button onClick={handleCustomExportPdf} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
            <PdfIcon className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {isExportModalOpen && <ExportModal />}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-dark-surface rounded-lg shadow-lg sticky top-0 z-10">
        <h2 className="text-2xl font-bold text-gray-100">Your Generated PRD</h2>
        <div className="flex flex-wrap items-center gap-2">
           <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors">
            {isEditing ? <ViewIcon className="h-4 w-4" /> : <EditIcon className="h-4 w-4" />}
            {isEditing ? 'View' : 'Edit'}
          </button>
          <button onClick={() => exportMarkdown(editedContent, 'prd.md')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
            <MarkdownIcon className="h-4 w-4" /> Markdown
          </button>
          <button onClick={() => prdViewRef.current && exportDocx(prdViewRef.current.innerHTML, 'prd.docx')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">
            <WordIcon className="h-4 w-4" /> DOCX
          </button>
          <button onClick={() => prdViewRef.current && exportPdf(prdViewRef.current, 'prd.pdf')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
            <PdfIcon className="h-4 w-4" /> PDF
          </button>
          <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors" title="Custom Export Options">
            <SettingsIcon className="h-4 w-4" /> Options
          </button>
          <button onClick={onReset} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
            New Idea
          </button>
        </div>
      </div>

      <div className="bg-dark-surface p-8 rounded-lg shadow-xl">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-[80vh] bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-dark-content placeholder-gray-500"
          />
        ) : (
          <div ref={prdViewRef} className="prose prose-invert max-w-none prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-brand-primary hover:prose-a:text-brand-secondary prose-strong:text-gray-200 prose-blockquote:border-l-brand-primary prose-table:bg-dark-surface prose-th:bg-gray-900">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{editedContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrdDisplay;
