
import React, { useState } from 'react';
import Header from './components/Header';
// FIX: Import ModuleConfig to explicitly type the modules array.
import Navigation, { Module, ModuleConfig } from './components/Navigation';
import PracticeModule from './modules/PracticeModule';
import LearnModule from './modules/LearnModule';
import ReviewModule from './modules/ReviewModule';
import TutorModule from './modules/TutorModule';
import BookOpenIcon from './components/icons/BookOpenIcon';
import CameraIcon from './components/icons/CameraIcon';
import DumbbellIcon from './components/icons/DumbbellIcon';
import MessageSquareIcon from './components/icons/MessageSquareIcon';
import HomeModule from './modules/HomeModule';
import HomeIcon from './components/icons/HomeIcon';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('home');

  const moduleConfigs: ModuleConfig[] = [
    { id: 'home', label: 'Inicio', icon: <HomeIcon className="h-6 w-6" />, component: <HomeModule setActiveModule={setActiveModule} /> },
    { id: 'learn', label: 'Aprender', icon: <BookOpenIcon className="h-6 w-6" />, component: <LearnModule /> },
    { id: 'review', label: 'Revisar', icon: <CameraIcon className="h-6 w-6" />, component: <ReviewModule /> },
    { id: 'practice', label: 'Practicar', icon: <DumbbellIcon className="h-6 w-6" />, component: <PracticeModule /> },
    { id: 'tutor', label: 'Tutor', icon: <MessageSquareIcon className="h-6 w-6" />, component: <TutorModule /> },
  ];

  const ActiveComponent = moduleConfigs.find(m => m.id === activeModule)?.component || <HomeModule setActiveModule={setActiveModule} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-900 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          {ActiveComponent}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-200">
        <p>Potenciado por IA, un desarrollo de Smith Cordoba</p>
      </footer>
      <Navigation 
        modules={moduleConfigs.map(({ id, label, icon }) => ({ id, label, icon }))}
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
      />
    </div>
  );
};

export default App;
