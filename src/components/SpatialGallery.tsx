import { useState } from 'react';
import type { JournalEntry } from '../types';
import './SpatialGallery.css';

interface SpatialGalleryProps {
  entries: JournalEntry[];
}

export function SpatialGallery({ entries }: SpatialGalleryProps) {
  const [rotation, setRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="spatial-gallery-empty">
        <p>Create journal entries to see them floating in 3D space</p>
      </div>
    );
  }

  const openEntry = (entry: JournalEntry) => {
    const entryData = encodeURIComponent(JSON.stringify(entry));
    const url = `${__XR_ENV_BASE__}/entry?entry=${entryData}`;
    window.open(url, `entry-${entry.id}`);
  };

  const rotateCarousel = (direction: 'left' | 'right') => {
    if (isRotating) return;

    setIsRotating(true);
    const angle = 360 / entries.length;
    setRotation(prev => prev + (direction === 'left' ? angle : -angle));

    setTimeout(() => setIsRotating(false), 600);
  };

  const radius = 500; // Fixed larger radius for better wheel effect

  return (
    <div className="spatial-gallery">
      {/* Central axis - visual indicator */}
      <div className="carousel-axis" />

      {/* Carousel wheel container */}
      <div
        className="carousel-wheel"
        style={{
          transform: `translateZ(-200px) rotateY(${rotation}deg)`,
          willChange: 'transform'
        }}
      >
        {entries.map((entry, index) => {
          const totalEntries = entries.length;
          const angle = (index / totalEntries) * 360;

          return (
            <div
              key={entry.id}
              className="carousel-panel"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px) rotateY(${-angle}deg)`,
                '--mood-color': entry.mood.color,
                '--xr-back': `${150}px`,
              } as React.CSSProperties}
              onClick={() => openEntry(entry)}
            >
              <div className="panel-glow" />
              <div className="panel-content">
                <div className="panel-mood">
                  <span className="panel-emoji">{entry.mood.emoji}</span>
                  <span className="panel-mood-name">{entry.mood.name}</span>
                </div>
                <div className="panel-text">
                  {entry.content.substring(0, 100)}
                  {entry.content.length > 100 ? '...' : ''}
                </div>
                <div className="panel-date">
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carousel controls */}
      <div className="carousel-controls">
        <button
          className="carousel-btn carousel-btn-left"
          onClick={() => rotateCarousel('left')}
          disabled={isRotating}
          aria-label="Rotate left"
        >
          <span className="arrow">←</span>
        </button>
        <div className="carousel-counter">
          {entries.length} memories
        </div>
        <button
          className="carousel-btn carousel-btn-right"
          onClick={() => rotateCarousel('right')}
          disabled={isRotating}
          aria-label="Rotate right"
        >
          <span className="arrow">→</span>
        </button>
      </div>

      <div className="navigation-hint">
        <p>Rotate the carousel to explore your emotional journey</p>
        <p className="sub-hint">Click any panel to open in full view</p>
      </div>
    </div>
  );
}
