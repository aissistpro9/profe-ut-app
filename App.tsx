import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import PracticeModule from './modules/PracticeModule';
import LearnModule from './modules/LearnModule';
import ReviewModule from './modules/ReviewModule';
import TutorModule from './modules/TutorModule';
import HomeModule from './modules/HomeModule';
import { MODULE_CONFIGS, Module } from './modules';
import { authService, UserSession } from './services/authService';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeModule, setActiveModule] = useState<Module>('home');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const currentSession = authService.getSession();
    setSession(currentSession);
    setIsLoadingAuth(false);
  }, []);

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setActiveModule('home');
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
  };

  // While restoring session from storage
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400 font-medium">Iniciando El Profe UT...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render the secure public Landing Page
  if (!session) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  // If authenticated, render the full tutor app
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 font-sans text-gray-900 flex flex-col">
      <Header session={session} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-6 pb-28">
        <div className="w-full max-w-2xl mx-auto">
          <ErrorBoundary key={activeModule} fallbackMessage="Este módulo tuvo un problema">
            {renderActiveModule()}
          </ErrorBoundary>
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-200/80 bg-white/70 backdrop-blur-sm space-y-1">
        <p className="font-medium text-gray-700">Respaldado por <span className="text-blue-600 font-semibold">AissistPro</span> y la <span className="text-blue-600 font-semibold">Universidad del Tolima</span></p>
        <p>Un desarrollo de <span className="font-semibold text-gray-800">Smith Córdoba</span></p>
        <p>📞 Soporte: <a href="https://wa.me/573042147440" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">+57 304 214 7440</a></p>
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
