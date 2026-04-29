import React from 'react';
import LightbulbIcon from './icons/LightbulbIcon';
import { Problem } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ProblemDisplayProps {
  problem: Problem | null;
  onShowSolution: () => void;
  isLoading: boolean;
  solutionVisible: boolean;
}

const ProblemDisplay: React.FC<ProblemDisplayProps> = ({ problem, onShowSolution, isLoading, solutionVisible }) => {
  if (!problem) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6 animate-fade-in transition-transform duration-300 ease-in-out hover:scale-[1.02]">
      <h2 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">{problem.title}</h2>
      <div className="prose prose-blue max-w-none text-gray-700 my-4">
        <MarkdownRenderer content={problem.context} enableMath={true} />
      </div>
      <div className="space-y-3 text-gray-800">
        <h3 className="font-semibold text-lg">Preguntas:</h3>
        <ol className="space-y-2">
            {problem.questions.map((q, index) => (
                <li key={index} className="flex items-start">
                    <span className="font-semibold mr-2">{String.fromCharCode(97 + index)})</span>
                    <div className="flex-1">
                        <MarkdownRenderer content={q} className="[&_p]:inline" enableMath={true} />
                    </div>
                </li>
            ))}
        </ol>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onShowSolution}
          disabled={isLoading || solutionVisible}
          className="flex items-center justify-center bg-green-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:bg-green-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <LightbulbIcon className="h-5 w-5 mr-2" />
          {isLoading ? 'Pensando...' : 'Mostrar Solución'}
        </button>
      </div>
    </div>
  );
};

export default ProblemDisplay;
