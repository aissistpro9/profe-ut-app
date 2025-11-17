import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import MarkdownRenderer from './MarkdownRenderer';

interface SolutionDisplayProps {
  solution: string | null;
  isLoading: boolean;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6 flex justify-center items-center min-h-[150px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!solution) return null;

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200 mt-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Solución Paso a Paso:</h2>
      <div className="prose prose-blue max-w-none text-gray-700">
        <MarkdownRenderer content={solution} enableMath={true} />
      </div>
    </div>
  );
};

export default SolutionDisplay;