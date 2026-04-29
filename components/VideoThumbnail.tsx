
import React, { useState } from 'react';

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const VideoPlaceholder: React.FC = () => (
    <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.55a1 1 0 011.45.89v6.22a1 1 0 01-1.45.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    </div>
);


interface VideoThumbnailProps {
  videoId: string;
  title: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ videoId, title }) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  return (
    <div className="relative">
      {error ? (
        <VideoPlaceholder />
      ) : (
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          onError={handleError}
          className="w-full h-auto object-cover aspect-video"
        />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <PlayIcon className="h-12 w-12 text-white" />
      </div>
    </div>
  );
};

export default VideoThumbnail;