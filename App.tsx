import React, { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
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
      <main className="flex-grow container mx-auto px-4 py-8 pb-24">
        <div className="w-full max-w-2xl mx-auto">
          <ErrorBoundary key={activeModule} fallbackMessage="Este módulo tuvo un problema">
            {renderActiveModule()}
          </ErrorBoundary>
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-200 bg-white/50 backdrop-blur-sm space-y-1">
        <p className="font-medium text-gray-600">Respaldado por <span className="text-blue-600 font-semibold">AissistPro</span> y la <span className="text-blue-600 font-semibold">Universidad del Tolima</span></p>
        <p>Un desarrollo de <span className="font-semibold text-gray-700">Smith Cordoba</span></p>
        <p>📞 Contacto: <a href="tel:+573042147440" className="text-blue-600 hover:underline font-medium">304 214 7440</a></p>
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