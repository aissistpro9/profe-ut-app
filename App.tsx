import React, { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import PracticeModule from './modules/PracticeModule';
import LearnModule from './modules/LearnModule';
import ReviewModule from './modules/ReviewModule';
import TutorModule from './modules/TutorModule';
import HomeModule from './modules/HomeModule';
import { MODULE_CONFIGS, Module } from './modules';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('home');

  // This function ensures that we explicitly render a fresh component based on the state.
  // It acts as a "Reset" for the UI when switching tabs.
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'home':
        return <HomeModule setActiveModule={setActiveModule} />;
      case 'learn':
        return <LearnModule />;
      case 'review':
        return <ReviewModule />;
      case 'practice':
        return <PracticeModule />;
      case 'tutor':
        return <TutorModule />;
      default:
        return <HomeModule setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-900 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          {renderActiveModule()}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-200">
        <p>Potenciado por IA, un desarrollo de Smith Cordoba</p>
      </footer>
      <Navigation 
        modules={MODULE_CONFIGS}
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
      />
    </div>
  );
};

export default App;