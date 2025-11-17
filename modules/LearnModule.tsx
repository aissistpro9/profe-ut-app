import React, { useState, useCallback } from 'react';
import { getSimpleExplanation } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import MarkdownRenderer from '../components/MarkdownRenderer';

const LearnModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError(null);
    setExplanation(null);
    try {
      const result = await getSimpleExplanation(searchTerm);
      setExplanation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">El Profesor Digital</h2>
        <p className="text-gray-600">Escribe cualquier tema de matemáticas que quieras entender.</p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200">
        <form onSubmit={handleExplain}>
          <div className="mb-5">
            <label htmlFor="topic-search" className="block text-sm font-medium text-gray-700 mb-2">
              Tema de Matemáticas
            </label>
            <input
              id="topic-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej: Límites, Teorema de Pitágoras..."
              disabled={isLoading}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? 'Explicando...' : '¡Explícamelo!'}
          </button>
        </form>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow" role="alert">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading && <div className="mt-6 flex justify-center"><LoadingSpinner /></div>}

      {explanation && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6 animate-fade-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Explicación:</h3>
          <div className="prose prose-blue max-w-none text-gray-700">
            <MarkdownRenderer content={explanation} enableMath={true} />
          </div>
        </div>
      )}
      
      {explanation && (
        <div className="bg-gray-100 p-6 rounded-xl shadow-inner border border-gray-200 mt-6 animate-fade-in">
           <h3 className="text-xl font-semibold text-gray-800 mb-4">Videos para potenciar tu aprendizaje</h3>
           <p className="text-gray-600">Próximamente: ¡Videos relevantes aparecerán aquí para reforzar tu aprendizaje!</p>
        </div>
      )}
    </div>
  );
};

export default LearnModule;