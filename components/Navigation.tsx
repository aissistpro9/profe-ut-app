import React from 'react';
import BookOpenIcon from './icons/BookOpenIcon';
import CameraIcon from './icons/CameraIcon';
import DumbbellIcon from './icons/DumbbellIcon';
import MessageSquareIcon from './icons/MessageSquareIcon';

export type Module = 'practice' | 'learn' | 'review' | 'tutor';

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-200 ease-in-out ${
      isActive ? 'text-blue-600 scale-110' : 'text-gray-500 hover:text-blue-500 hover:scale-105'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span className="text-xs font-bold">{label}</span>
  </button>
);

interface NavigationProps {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeModule, setActiveModule }) => {
  const navItems = [
    { id: 'learn', label: 'Aprender', icon: <BookOpenIcon className="h-6 w-6" /> },
    { id: 'review', label: 'Revisar', icon: <CameraIcon className="h-6 w-6" /> },
    { id: 'practice', label: 'Practicar', icon: <DumbbellIcon className="h-6 w-6" /> },
    { id: 'tutor', label: 'Tutor', icon: <MessageSquareIcon className="h-6 w-6" /> },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-20 px-4">
        {navItems.map(item => (
          <NavButton
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeModule === item.id}
            onClick={() => setActiveModule(item.id as Module)}
          />
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
