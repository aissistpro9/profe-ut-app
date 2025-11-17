import React, { useState } from 'react';
import { DIFFICULTIES, DIFFICULTY_LABELS_ES } from '../constants';
import { Difficulty } from '../types';

interface TopicSelectorProps {
  onGenerate: (topic: string, difficulty: Difficulty) => void;
  isLoading: boolean;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onGenerate, isLoading }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('Derivadas');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.Medium);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTopic.trim()) {
        onGenerate(selectedTopic, selectedDifficulty);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-4 mb-5">
            <div className="flex-1">
              <label htmlFor="topic-search" className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <input
                id="topic-search"
                type="text"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                placeholder="Ej: Derivadas, Integrales..."
                disabled={isLoading}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="Difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Dificultad
              </label>
              <select
                id="Difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                {DIFFICULTIES.map((option) => (
                  <option key={option} value={option}>
                    {DIFFICULTY_LABELS_ES[option]}
                  </option>
                ))}
              </select>
            </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !selectedTopic.trim()}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {isLoading ? 'Generando...' : 'Generar Nuevo Problema'}
        </button>
      </form>
    </div>
  );
};

export default TopicSelector;