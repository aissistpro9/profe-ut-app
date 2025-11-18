
import React, { useState, useCallback } from 'react';
import { getSimpleExplanation, searchYoutubeVideos } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { YouTubeVideo } from '../types';
import VideoThumbnail from '../components/VideoThumbnail';

const LearnModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const handleExplain = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setExplanation(null);
    setVideos([]);
    setIsLoadingVideos(false);
    setSelectedVideoId(null);

    try {
      const result = await getSimpleExplanation(searchTerm);
      setExplanation(result);
      
      setIsLoadingVideos(true);
      try {
        const videoResults = await searchYoutubeVideos(searchTerm);
        setVideos(videoResults);
      } catch (videoError) {
        console.error("Failed to load videos", videoError);
        // Set videos to an empty array on error to show the "not found" message
        setVideos([]);
      } finally {
        setIsLoadingVideos(false);
      }

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

      {isLoading && (
        <div className="mt-6 flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="text-gray-600 mt-3 animate-pulse">Creando una explicación personalizada para ti...</p>
        </div>
      )}

      {explanation && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6 animate-fade-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Explicación:</h3>
          <div className="prose prose-blue max-w-none text-gray-700">
            <MarkdownRenderer content={explanation} enableMath={true} />
          </div>
        </div>
      )}
      
      {(isLoadingVideos || explanation) && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6 animate-fade-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Videos para potenciar tu aprendizaje
          </h3>
          {isLoadingVideos && (
             <div className="flex flex-col items-center justify-center py-4">
                <LoadingSpinner />
                <p className="text-gray-500 mt-2">Buscando videos recomendados...</p>
             </div>
          )}
          
          {!isLoadingVideos && (
            <div>
              {videos.length > 0 ? (
                <div>
                  {selectedVideoId ? (
                    <div className="space-y-4">
                      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
                         <iframe
                            src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <button 
                          onClick={() => setSelectedVideoId(null)}
                          className="w-full sm:w-auto bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                        >
                          ← Volver a la lista
                        </button>
                        <a 
                          href={`https://www.youtube.com/watch?v=${selectedVideoId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto flex items-center justify-center text-blue-600 hover:text-blue-800 font-semibold py-2 px-4 transition hover:bg-blue-50 rounded-lg"
                        >
                          Ver en YouTube 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {videos.map((video) => (
                        <div 
                          key={video.videoId} 
                          onClick={() => setSelectedVideoId(video.videoId)}
                          className="cursor-pointer group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-50"
                        >
                          <VideoThumbnail videoId={video.videoId} title={video.title} />
                          <div className="p-3">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-2">{video.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p>No se encontraron videos relevantes para este tema.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LearnModule;
