import React from 'react';
import BrainIcon from './icons/BrainIcon';
import { UserSession } from '../services/authService';

interface HeaderProps {
  session?: UserSession | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ session, onLogout }) => {
  return (
    <header className="w-full max-w-4xl mx-auto py-5 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center text-center sm:text-left">
          <BrainIcon className="h-10 w-10 text-blue-600 mr-3 shrink-0" />
          <div className="relative py-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              El Profe UT
            </h1>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          </div>
        </div>

        {/* User Session Chip & Logout */}
        {session && (
          <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-200 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div className="text-left">
                <p className="font-bold text-gray-800 leading-none">{session.name}</p>
                <p className="text-[10px] text-blue-600 font-medium">{session.plan}</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="ml-2 px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-lg font-medium transition flex items-center space-x-1"
              >
                <span>Salir</span>
                <span>🚪</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
