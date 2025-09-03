import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './icons';

const messages = [
  "Igniting neural networks...",
  "Parsing your product vision...",
  "Teaching the AI about your idea...",
  "Synthesizing insights from market data...",
  "Simulating user personas and journeys...",
  "Drafting initial feature hypotheses...",
  "Applying product management best practices...",
  "Polishing the final document, just for you...",
];

const LoadingView: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center h-96 animate-fade-in">
      <SpinnerIcon className="h-16 w-16 text-brand-primary" />
      <h2 className="mt-6 text-2xl font-semibold text-gray-100">Generating Your PRD</h2>
      <p className="mt-2 text-lg text-dark-subtle transition-opacity duration-500">
        {messages[currentMessageIndex]}
      </p>
    </div>
  );
};

export default LoadingView;
