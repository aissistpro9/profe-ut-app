import React, { useState, useCallback, useRef } from 'react';
import { reviewHomework } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import CameraIcon from '../components/icons/CameraIcon';
import Confetti from '../components/Confetti';
import MarkdownRenderer from '../components/MarkdownRenderer';

const ReviewModule: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [problemContext, setProblemContext] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setImageFile(file);
        setFeedback(null);
        setError(null);
        setShowConfetti(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReview = useCallback(async () => {
    if (!imageFile) return;
    
    setIsLoading(true);
    setError(null);
    setFeedback(null);
    setShowConfetti(false);

    try {
      const base64Data = image!.split(',')[1];
      const result = await reviewHomework(base64Data, imageFile.type, problemContext);
      
      if (result.trim().toUpperCase() === 'CORRECT') {
        setShowConfetti(true);
        setFeedback("¡Está 100% correcto! ¡Excelente trabajo! 🥳");
      } else {
        setFeedback(result);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [image, imageFile, problemContext]);

  return (
    <div className="animate-fade-in space-y-6">
      {showConfetti && <Confetti />}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">El Revisor Mágico de Tareas</h2>
        <p className="text-gray-600">Describe el problema y sube una foto de tu solución para recibir una pista.</p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 space-y-6">
        <div>
          <label htmlFor="problem-context" className="block text-sm font-medium text-gray-700 mb-2">
            <span className="font-bold text-lg mr-2">1.</span>
            Describe el problema (opcional, pero recomendado)
          </label>
          <textarea
            id="problem-context"
            rows={3}
            value={problemContext}
            onChange={(e) => setProblemContext(e.target.value)}
            placeholder="Ej: Resolver la ecuación 2x + 5 = 15"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="font-bold text-lg mr-2">2.</span>
            Sube la foto de tu solución
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
          {!image && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition"
            >
              <CameraIcon className="h-12 w-12 mb-2" />
              <span className="font-semibold">Subir foto de la tarea</span>
            </button>
          )}
          
          {image && (
            <div className="space-y-4">
              <img src={image} alt="Vista Previa" className="max-h-64 w-full object-contain rounded-lg bg-gray-100 p-2" />
              <button
                onClick={handleReview}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Revisando...' : 'Revisar mi solución'}
              </button>
               <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Cambiar foto
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow" role="alert">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading && <div className="flex justify-center"><LoadingSpinner /></div>}
      
      {feedback && (
        <div className={`p-6 rounded-xl shadow-lg border mt-6 animate-fade-in ${showConfetti ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Retroalimentación:</h3>
          <div className="prose prose-blue max-w-none text-gray-700">
              <MarkdownRenderer content={feedback} enableMath={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewModule;