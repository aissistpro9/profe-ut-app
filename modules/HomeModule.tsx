
import React from 'react';
import { Module } from '../components/Navigation';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import CameraIcon from '../components/icons/CameraIcon';
import DumbbellIcon from '../components/icons/DumbbellIcon';
import MessageSquareIcon from '../components/icons/MessageSquareIcon';

interface HomeModuleProps {
  setActiveModule: (module: Module) => void;
}

interface ModuleCardProps {
  // FIX: Specify that the icon prop is a ReactElement that accepts a className prop. This resolves the type error with React.cloneElement below.
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ icon, title, description, onClick, color }) => (
  <button
    onClick={onClick}
    className={`bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 text-left group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 hover:border-${color}-500`}
  >
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${color}-100 text-${color}-600 mb-4 transition-colors group-hover:bg-${color}-500 group-hover:text-white`}>
      {React.cloneElement(icon, { className: 'h-7 w-7' })}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </button>
);

const HomeModule: React.FC<HomeModuleProps> = ({ setActiveModule }) => {
  const cards = [
    {
      id: 'practice',
      icon: <DumbbellIcon />,
      title: 'Practicar',
      description: 'Genera ejercicios y pon a prueba tus conocimientos.',
      color: 'blue'
    },
    {
      id: 'learn',
      icon: <BookOpenIcon />,
      title: 'Aprender',
      description: 'Entiende cualquier tema de matemáticas con explicaciones sencillas.',
      color: 'indigo'
    },
    {
      id: 'review',
      icon: <CameraIcon />,
      title: 'Revisar',
      description: 'Sube una foto de tu tarea y recibe una pista si te equivocaste.',
      color: 'purple'
    },
    {
      id: 'tutor',
      icon: <MessageSquareIcon />,
      title: 'Tutor IA',
      description: 'Chatea con un tutor paciente que te guiará paso a paso.',
      color: 'green'
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">¡Bienvenido a El Profe UT!</h2>
        <p className="text-gray-600 mt-2 text-lg">Tu asistente personal para conquistar las matemáticas.</p>
        <p className="text-gray-500 mt-1">¿Qué quieres lograr hoy?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map(card => (
          <ModuleCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            description={card.description}
            color={card.color}
            onClick={() => setActiveModule(card.id as Module)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeModule;
