import { useState, useEffect, useRef } from 'react';
import type { MoodWrapStats } from '../../services/moodWrapService';
import { animateCountUp, formatNumber } from '../../utils/countUpAnimation';
import './SlideBase.css';

interface ByTheNumbersSlideProps {
  stats: MoodWrapStats;
}

export function ByTheNumbersSlide({ stats }: ByTheNumbersSlideProps) {
  const daysInMonth = stats.dateRange.end.getDate();
  const daysJournaled = stats.daysJournaled || 0;
  
  const [entriesCount, setEntriesCount] = useState(0);
  const [wordsCount, setWordsCount] = useState(0);
  const [daysCount, setDaysCount] = useState(0);
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
      const cancel1 = animateCountUp(0, stats.totalEntries, setEntriesCount, { duration: 1200 });
      const cancel2 = animateCountUp(0, stats.totalWords || 0, setWordsCount, { duration: 1500 });
      const cancel3 = animateCountUp(0, daysJournaled, setDaysCount, { duration: 1000 });

      return () => {
        cancel1();
        cancel2();
        cancel3();
      };
    }
  }, [isVisible, stats.totalEntries, stats.totalWords, daysJournaled]);
  
  return (
    <div ref={slideRef} className="slide-base by-numbers-slide interactive-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">By The Numbers</h2>
        <div className="numbers-list">
          <div className="number-item interactive-stat">
            <p className="number-text">You wrote <strong className="count-up-number">{formatNumber(entriesCount)}</strong> entries this month</p>
          </div>
          <div className="number-item interactive-stat">
            <p className="number-text">That's <strong className="count-up-number">{formatNumber(wordsCount)}</strong> words of reflection</p>
          </div>
          <div className="number-item interactive-stat">
            <p className="number-text">
              <strong className="count-up-number">{formatNumber(daysCount)}</strong> out of <strong>{daysInMonth}</strong> days - you showed up for yourself! ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

