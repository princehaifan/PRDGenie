import React, { useState, useCallback } from 'react';
import { AppState, ViewType } from './types';
import Header from './components/Header';
import IdeaForm from './components/IdeaForm';
import LoadingView from './components/LoadingView';
import PrdDisplay from './components/PrdDisplay';
import { generatePrd } from './services/gemini';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    view: ViewType.FORM,
    prdContent: '',
    error: null,
  });

  const handlePrdGeneration = useCallback(async (text: string, files: File[]) => {
    setAppState({ view: ViewType.LOADING, prdContent: '', error: null });
    try {
      const generatedContent = await generatePrd(text, files);
      setAppState({ view: ViewType.RESULT, prdContent: generatedContent, error: null });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setAppState({ view: ViewType.FORM, prdContent: '', error: `Failed to generate PRD: ${errorMessage}` });
    }
  }, []);

  const handleReset = () => {
    setAppState({ view: ViewType.FORM, prdContent: '', error: null });
  };

  const renderContent = () => {
    switch (appState.view) {
      case ViewType.LOADING:
        return <LoadingView />;
      case ViewType.RESULT:
        return <PrdDisplay content={appState.prdContent} onReset={handleReset} />;
      case ViewType.FORM:
      default:
        return (
          <IdeaForm
            onSubmit={handlePrdGeneration}
            // Fix: This comparison is always false because the `IdeaForm` is only shown
            // when the view is `FORM`, not `LOADING`.
            isLoading={false}
            error={appState.error}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg font-sans text-dark-content">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
