import { useState, useEffect, useRef } from 'react';
import type { MoodWrapStats } from '../../services/moodWrapService';
import { animateCountUp, formatNumber } from '../../utils/countUpAnimation';
import './SlideBase.css';

interface EntryCountSlideProps {
  stats: MoodWrapStats;
}

export function EntryCountSlide({ stats }: EntryCountSlideProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (slideRef.current) {
      observer.observe(slideRef.current);
    }

    return () => {
      if (slideRef.current) {
        observer.unobserve(slideRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && !hasAnimated.current) {
      hasAnimated.current = true;
      const cancel = animateCountUp(0, stats.totalEntries, setDisplayCount, {
        duration: 1500,
        easing: (t) => t * (2 - t),
      });
      
      // Animate progress bar
      const targetWidth = Math.min((stats.totalEntries / 7) * 100, 100);
      const progressCancel = animateCountUp(0, targetWidth, setProgressWidth, {
        duration: 1800,
        easing: (t) => t * (2 - t),
      });

      return () => {
        cancel();
        progressCancel();
      };
    }
  }, [isVisible, stats.totalEntries]);

  return (
    <div ref={slideRef} className="slide-base entry-count-slide interactive-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">You wrote</h2>
        <div className="big-number count-up-number">{formatNumber(displayCount)}</div>
        <p className="slide-description">
          {stats.totalEntries === 1 
            ? "That's 1 moment of self-reflection 💭"
            : `That's ${formatNumber(stats.totalEntries)} moments of self-reflection 💭`
          }
        </p>
        <p className="slide-description" style={{ fontSize: '0.9rem', marginTop: '10px' }}>
          this week
        </p>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

