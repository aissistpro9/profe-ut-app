import React, { useState, useCallback, useRef } from 'react';
import TopicSelector from '../components/TopicSelector';
import ProblemDisplay from '../components/ProblemDisplay';
import SolutionDisplay from '../components/SolutionDisplay';
import { generateProblems, generateSolution, reviewHomework } from '../services/geminiService';
import { Difficulty, Problem } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Confetti from '../components/Confetti';
import CameraIcon from '../components/icons/CameraIcon';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface ProblemWithExtras extends Problem {
  solution?: string | null;
  isLoadingSolution?: boolean;
  imageFile?: File | null;
  imagePreview?: string | null;
  reviewFeedback?: string | null;
  isReviewing?: boolean;
  showConfetti?: boolean;
}

const PracticeModule: React.FC = () => {
  const [problems, setProblems] = useState<ProblemWithExtras[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeProblemIndexForUpload, setActiveProblemIndexForUpload] = useState<number | null>(null);

  const handleGenerateProblems = useCallback(async (topic: string, difficulty: Difficulty) => {
    setIsLoadingProblems(true);
    setProblems([]);
    setError(null);
    try {
      const newProblems = await generateProblems(topic, difficulty, 1);
      setProblems(newProblems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoadingProblems(false);
    }
  }, []);

  const handleShowSolution = useCallback(async (problemIndex: number) => {
    const problemToSolve = problems[problemIndex];
    if (!problemToSolve || problemToSolve.solution) return;

    setProblems(prev => prev.map((p, i) => i === problemIndex ? { ...p, isLoadingSolution: true } : p));
    setError(null);

    try {
      const solution = await generateSolution(problemToSolve);
      setProblems(prev => prev.map((p, i) => i === problemIndex ? { ...p, solution, isLoadingSolution: false } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setProblems(prev => prev.map((p, i) => i === problemIndex ? { ...p, isLoadingSolution: false } : p));
    }
  }, [problems]);
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, problemIndex: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProblems(prev => prev.map((p, i) => i === problemIndex ? {
          ...p,
          imageFile: file,
          imagePreview: reader.result as string,
          reviewFeedback: null,
          showConfetti: false,
        } : p));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (activeProblemIndexForUpload !== null) {
      handleImageChange(event, activeProblemIndexForUpload);
    }
    // Reset file input to allow uploading the same file again
    if(event.target) event.target.value = '';
  };

  const triggerFileInput = (index: number) => {
    setActiveProblemIndexForUpload(index);
    fileInputRef.current?.click();
  };
  
  const handleReviewSubmission = useCallback(async (problemIndex: number) => {
    const problemToReview = problems[problemIndex];
    if (!problemToReview.imageFile || !problemToReview.imagePreview) return;

    setProblems(prev => prev.map((p, i) => i === problemIndex ? { ...p, isReviewing: true, reviewFeedback: null, showConfetti: false } : p));
    setError(null);

    try {
      const base64Data = problemToReview.imagePreview.split(',')[1];
      const problemContext = `Problem Title: ${problemToReview.title}. Context: ${problemToReview.context}. Questions: ${problemToReview.questions.join(' ')}`;
      const result = await reviewHomework(base64Data, problemToReview.imageFile.type, problemContext);

      if (result.trim().toUpperCase() === 'CORRECT') {
        setProblems(prev => prev.map((p, i) => i === problemIndex ? { ...p, isReviewing: false, showConfetti: true, reviewFeedback: "¡Felicitaciones! Tu solución es correcta. ¡Excelente trabajo! 🥳" } : p));
      } else {
         setProblems(prev => prev.map((p, i) => i === problemIndex ? { ...p, isReviewing: false, reviewFeedback: result } : p));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during review.');
       setProblems(prev => prev.map((p, i) => i === problemIndex ? { ...p, isReviewing: false } : p));
    }
  }, [problems]);


  return (
    <div className="animate-fade-in space-y-6">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
      />
       <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Gimnasio de Mates</h2>
        <p className="text-gray-600">Genera ejercicios para poner a prueba tus conocimientos.</p>
      </div>

      <TopicSelector onGenerate={handleGenerateProblems} isLoading={isLoadingProblems} />
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow" role="alert">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {isLoadingProblems && (
         <div className="p-6 bg-white rounded-xl shadow-lg flex justify-center items-center min-h-[150px]">
            <div className="text-center">
                <LoadingSpinner />
                <p className="text-lg text-gray-600 mt-4">Generando un problema increíble para ti...</p>
            </div>
        </div>
      )}
      
      {problems.map((p, index) => (
        <div key={index}>
            {p.showConfetti && <Confetti />}
            <ProblemDisplay 
                problem={p} 
                onShowSolution={() => handleShowSolution(index)}
                isLoading={!!p.isLoadingSolution}
                solutionVisible={!!p.solution}
            />

            {/* Review Section */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 mt-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Revisa tu Solución</h3>
              {!p.imagePreview && (
                <button
                  onClick={() => triggerFileInput(index)}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition"
                >
                  <CameraIcon className="h-10 w-10 mb-2" />
                  <span className="font-semibold">Subir foto de la solución</span>
                </button>
              )}
              {p.imagePreview && (
                <div className="space-y-4">
                  <img src={p.imagePreview} alt="Vista Previa de la solución" className="max-h-64 w-full object-contain rounded-lg bg-gray-100 p-2" />
                  <button
                    onClick={() => handleReviewSubmission(index)}
                    disabled={p.isReviewing}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                  >
                    {p.isReviewing ? 'Revisando...' : 'Revisar mi solución'}
                  </button>
                  <button
                    onClick={() => triggerFileInput(index)}
                    disabled={p.isReviewing}
                    className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cambiar foto
                  </button>
                </div>
              )}
               {p.isReviewing && <div className="flex justify-center"><LoadingSpinner /></div>}
               {p.reviewFeedback && (
                <div className={`p-4 rounded-lg mt-4 animate-fade-in ${p.showConfetti ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <h4 className="font-semibold text-gray-800 mb-2">Retroalimentación:</h4>
                   <div className="prose prose-blue max-w-none text-gray-700">
                      <MarkdownRenderer content={p.reviewFeedback} enableMath={true} />
                  </div>
                </div>
              )}
            </div>

            <SolutionDisplay 
                solution={p.solution ?? null}
                isLoading={!!p.isLoadingSolution}
            />
        </div>
      ))}
    </div>
  );
};

export default PracticeModule;