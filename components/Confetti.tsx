import React from 'react';
import './Confetti.css';

const Confetti: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-50">
    <div className="pyro">
        <div className="before"></div>
        <div className="after"></div>
    </div>
    {Array.from({ length: 150 }).map((_, i) => (
      <div
        key={i}
        className="confetti"
        style={{
          '--x': `${Math.random()}`,
          '--y': `${Math.random()}`,
          '--angle': `${Math.random() * 360}`,
          '--hue': `${Math.random() * 360}`,
          '--delay': `${Math.random() * 5}`,
          '--duration': `${Math.random() * 3 + 2}`,
          '--size': `${Math.random() * 8 + 6}`,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

export default Confetti;
