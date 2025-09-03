import React, { useState, useCallback } from 'react';
import { UploadIcon, ImageIcon, VideoIcon, CloseIcon } from './icons';

interface IdeaFormProps {
  onSubmit: (text: string, files: File[]) => void;
  isLoading: boolean;
  error: string | null;
}

interface FileWithProgress {
  file: File;
  progress: number;
  id: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const IdeaForm: React.FC<IdeaFormProps> = ({ onSubmit, isLoading, error }) => {
  const [text, setText] = useState('');
  const [filesWithProgress, setFilesWithProgress] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddFiles = useCallback((newFiles: File[]) => {
    if (validationError) setValidationError(null);

    const newUploads: FileWithProgress[] = newFiles.map(file => ({
        file,
        progress: 0,
        id: `${file.name}-${file.lastModified}-${file.size}`,
    }));

    setFilesWithProgress(prev => {
        const prevIds = new Set(prev.map(f => f.id));
        return [...prev, ...newUploads.filter(f => !prevIds.has(f.id))];
    });

    // Simulate upload progress after a short delay
    setTimeout(() => {
        setFilesWithProgress(prev => {
            const newUploadIds = new Set(newUploads.map(f => f.id));
            return prev.map(f => newUploadIds.has(f.id) ? { ...f, progress: 100 } : f);
        });
    }, 500);
  }, [validationError]);

  const handleRemoveFile = useCallback((idToRemove: string) => {
    setFilesWithProgress(prev => prev.filter(f => f.id !== idToRemove));
  }, []);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleAddFiles(Array.from(event.target.files));
    }
  };
  
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() && filesWithProgress.length === 0) {
        setValidationError("Please provide an idea in text or upload a file.");
        return;
    }
    setValidationError(null);
    onSubmit(text, filesWithProgress.map(f => f.file));
  }, [onSubmit, text, filesWithProgress]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        handleAddFiles(Array.from(event.dataTransfer.files));
        event.dataTransfer.clearData();
    }
  }, [handleAddFiles]);
  
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
        return <ImageIcon className="h-8 w-8 text-dark-subtle flex-shrink-0" />;
    }
    if (file.type.startsWith('video/')) {
        return <VideoIcon className="h-8 w-8 text-dark-subtle flex-shrink-0" />;
    }
    return null;
  };

  const displayError = validationError || error;

  return (
    <div className="max-w-3xl mx-auto bg-dark-surface p-8 rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-3xl font-bold mb-2 text-gray-100">Describe Your App Idea</h2>
      <p className="text-dark-subtle mb-6">Provide text, a sketch, or even a short video. Our AI will do the rest.</p>
      
      {displayError && <div className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4">{displayError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="idea-text" className="block text-sm font-medium text-dark-content mb-2">Your Idea in Words</label>
          <textarea
            id="idea-text"
            rows={8}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-dark-content placeholder-gray-500"
            placeholder="e.g., An app that uses AI to suggest recipes based on ingredients I have at home..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (validationError) setValidationError(null);
            }}
          />
        </div>

        <div className="mb-6">
            <label htmlFor="idea-files" className="block text-sm font-medium text-dark-content mb-2">Upload Files (Sketches, Wireframes)</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md transition-colors duration-200 ${isDragging ? 'border-brand-primary bg-gray-800' : ''}`}
            >
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <div className="flex text-sm text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-dark-surface rounded-md font-medium text-brand-primary hover:text-brand-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-brand-primary">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*,video/*" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB. Video support is experimental.</p>
                </div>
            </div>
        </div>

        {filesWithProgress.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-dark-content mb-2">Selected Files:</h3>
            <ul className="space-y-3">
              {filesWithProgress.map(({ file, progress, id }) => (
                <li key={id} className="flex items-center bg-gray-900 p-3 rounded-md border border-gray-700">
                  {getFileIcon(file)}
                  <div className="ml-4 flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-dark-content truncate">{file.name}</p>
                    <p className="text-xs text-dark-subtle">
                      {formatBytes(file.size)}
                    </p>
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-brand-primary h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(id)}
                    className="ml-4 p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-primary"
                    aria-label="Remove file"
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Create My PRD'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdeaForm;