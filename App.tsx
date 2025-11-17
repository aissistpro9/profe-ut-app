import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Navigation, { Module } from './components/Navigation';
import PracticeModule from './modules/PracticeModule';
import LearnModule from './modules/LearnModule';
import ReviewModule from './modules/ReviewModule';
import TutorModule from './modules/TutorModule';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('practice');

  const renderModule = () => {
    switch (activeModule) {
      case 'learn':
        return <LearnModule />;
      case 'review':
        return <ReviewModule />;
      case 'tutor':
        return <TutorModule />;
      case 'practice':
      default:
        return <PracticeModule />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-900 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          {renderModule()}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-200">
        <p>Potenciado por IA, un desarrollo de Smith Cordoba</p>
      </footer>
      <Navigation activeModule={activeModule} setActiveModule={setActiveModule} />
    </div>
  );
};

export default App;