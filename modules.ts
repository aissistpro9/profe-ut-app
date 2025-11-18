import React from 'react';
import BookOpenIcon from './components/icons/BookOpenIcon';
import CameraIcon from './components/icons/CameraIcon';
import DumbbellIcon from './components/icons/DumbbellIcon';
import MessageSquareIcon from './components/icons/MessageSquareIcon';
import HomeIcon from './components/icons/HomeIcon';

export type Module = 'home' | 'practice' | 'learn' | 'review' | 'tutor';

export interface ModuleConfig {
  id: Module;
  label: string;
  icon: React.ReactNode;
}

export const MODULE_CONFIGS: ModuleConfig[] = [
  { id: 'home', label: 'Inicio', icon: React.createElement(HomeIcon, { className: "h-6 w-6" }) },
  { id: 'learn', label: 'Aprender', icon: React.createElement(BookOpenIcon, { className: "h-6 w-6" }) },
  { id: 'review', label: 'Revisar', icon: React.createElement(CameraIcon, { className: "h-6 w-6" }) },
  { id: 'practice', label: 'Practicar', icon: React.createElement(DumbbellIcon, { className: "h-6 w-6" }) },
  { id: 'tutor', label: 'Tutor', icon: React.createElement(MessageSquareIcon, { className: "h-6 w-6" }) },
];