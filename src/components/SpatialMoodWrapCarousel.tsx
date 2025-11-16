import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MoodWrapStats } from '../services/moodWrapService';
import { HeroSlide } from './MoodWrapSlides/HeroSlide';
import { EntryCountSlide } from './MoodWrapSlides/EntryCountSlide';
import { TopEmotionSlide } from './MoodWrapSlides/TopEmotionSlide';
import { BreakdownSlide } from './MoodWrapSlides/BreakdownSlide';
import { PeakMomentSlide } from './MoodWrapSlides/PeakMomentSlide';
import { InsightSlide } from './MoodWrapSlides/InsightSlide';
import { GoalSlide } from './MoodWrapSlides/GoalSlide';
import { MonthlyHeroSlide } from './MoodWrapSlides/MonthlyHeroSlide';
import { ByTheNumbersSlide } from './MoodWrapSlides/ByTheNumbersSlide';
import { EmotionEvolutionSlide } from './MoodWrapSlides/EmotionEvolutionSlide';
import { DominantEmotionSlide } from './MoodWrapSlides/DominantEmotionSlide';
import { StreakSlide } from './MoodWrapSlides/StreakSlide';
import { MostActiveDaySlide } from './MoodWrapSlides/MostActiveDaySlide';
import { WordCloudSlide } from './MoodWrapSlides/WordCloudSlide';
import { TransformationSlide } from './MoodWrapSlides/TransformationSlide';
import { ConsistencySlide } from './MoodWrapSlides/ConsistencySlide';
import { LookingAheadSlide } from './MoodWrapSlides/LookingAheadSlide';
import { YearlyHeroSlide } from './MoodWrapSlides/YearlyHeroSlide';
import { YearInNumbersSlide } from './MoodWrapSlides/YearInNumbersSlide';
import { Top3EmotionsSlide } from './MoodWrapSlides/Top3EmotionsSlide';
import { EmotionTimelineSlide } from './MoodWrapSlides/EmotionTimelineSlide';
import { TransformativeMonthSlide } from './MoodWrapSlides/TransformativeMonthSlide';
import { PeakHappinessSlide } from './MoodWrapSlides/PeakHappinessSlide';
import { HardestMonthSlide } from './MoodWrapSlides/HardestMonthSlide';
import { LongestStreakYearlySlide } from './MoodWrapSlides/LongestStreakYearlySlide';
import { WordsThatDefinedSlide } from './MoodWrapSlides/WordsThatDefinedSlide';
import { EmotionalGrowthSlide } from './MoodWrapSlides/EmotionalGrowthSlide';
import { ConsistencyBadgeSlide } from './MoodWrapSlides/ConsistencyBadgeSlide';
import { GratitudeCounterSlide } from './MoodWrapSlides/GratitudeCounterSlide';
import { MostReflectiveDaySlide } from './MoodWrapSlides/MostReflectiveDaySlide';
import { YearTransitionSlide } from './MoodWrapSlides/YearTransitionSlide';
import { ShareJourneySlide } from './MoodWrapSlides/ShareJourneySlide';
import { GlowCard } from './GlowCard';
import './SpatialMoodWrapCarousel.css';

interface SpatialMoodWrapCarouselProps {
  stats: MoodWrapStats;
  timePeriod: 'weekly' | 'monthly' | 'yearly';
  dateRange: string;
  onTimePeriodChange?: (period: 'weekly' | 'monthly' | 'yearly') => void;
}

export function SpatialMoodWrapCarousel({ stats, timePeriod, dateRange, onTimePeriodChange }: SpatialMoodWrapCarouselProps) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);
  const slideRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  const getNextMonthName = () => {
    const nextMonth = new Date(stats.dateRange.end);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleDateString('en-US', { month: 'long' });
  };

  const getYear = () => stats.dateRange.start.getFullYear();
  const getNextYear = () => getYear() + 1;

  const slides = timePeriod === 'yearly' ? [
    <YearlyHeroSlide key="hero" year={getYear()} />,
    <YearInNumbersSlide key="numbers" stats={stats} />,
    <Top3EmotionsSlide key="top3" stats={stats} />,
    <EmotionTimelineSlide key="timeline" stats={stats} />,
    <TransformativeMonthSlide key="transformative" stats={stats} />,
    <PeakHappinessSlide key="happiness" stats={stats} />,
    <HardestMonthSlide key="hardest" stats={stats} />,
    <LongestStreakYearlySlide key="streak" stats={stats} />,
    <WordsThatDefinedSlide key="words" stats={stats} year={getYear()} />,
    <EmotionalGrowthSlide key="growth" stats={stats} />,
    <ConsistencyBadgeSlide key="badge" stats={stats} />,
    <GratitudeCounterSlide key="gratitude" stats={stats} />,
    <MostReflectiveDaySlide key="reflective" stats={stats} />,
    <YearTransitionSlide key="transition" currentYear={getYear()} nextYear={getNextYear()} />,
    <ShareJourneySlide key="share" stats={stats} year={getYear()} />,
    <div key="glowcard" className="glowcard-slide">
      <GlowCard
        monthName="Year"
        year={getYear()}
      />
    </div>
  ] : timePeriod === 'monthly' ? [
    <MonthlyHeroSlide key="hero" monthName={getMonthName(stats.dateRange.start)} />,
    <ByTheNumbersSlide key="numbers" stats={stats} />,
    <EmotionEvolutionSlide key="evolution" stats={stats} />,
    <DominantEmotionSlide key="dominant" stats={stats} monthName={getMonthName(stats.dateRange.start)} />,
    <BreakdownSlide key="breakdown" stats={stats} />,
    <StreakSlide key="streak" stats={stats} />,
    <MostActiveDaySlide key="active-day" stats={stats} />,
    <WordCloudSlide key="wordcloud" stats={stats} monthName={getMonthName(stats.dateRange.start)} />,
    <TransformationSlide key="transformation" stats={stats} />,
    <ConsistencySlide key="consistency" stats={stats} />,
    <LookingAheadSlide key="ahead" stats={stats} nextMonth={getNextMonthName()} />,
    <div key="glowcard" className="glowcard-slide">
      <GlowCard
        monthName={getMonthName(stats.dateRange.start)}
        year={stats.dateRange.start.getFullYear()}
      />
    </div>
  ] : [
    <HeroSlide key="hero" timePeriod={timePeriod} dateRange={dateRange} />,
    <EntryCountSlide key="count" stats={stats} />,
    <TopEmotionSlide key="emotion" stats={stats} />,
    <BreakdownSlide key="breakdown" stats={stats} />,
    <PeakMomentSlide key="peak" stats={stats} />,
    <InsightSlide key="insight" stats={stats} />,
    <GoalSlide key="goal" stats={stats} />,
  ];

  const goToSlide = (index: number) => {
    if (index < 0 || index >= slides.length || isTransitioning) return;

    setIsTransitioning(true);
    setCurrentSlide(index);

    setTimeout(() => setIsTransitioning(false), 600);
  };

  const goToNext = () => {
    // Circular: wrap to first slide if on last
    const nextIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    goToSlide(nextIndex);
  };

  const goToPrevious = () => {
    // Circular: wrap to last slide if on first
    const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    goToSlide(prevIndex);
  };

  // Drag/Swipe handlers
  const handleDragStart = (clientX: number) => {
    if (isTransitioning) return;
    setDragStart(clientX);
    setDragCurrent(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStart === null) return;
    setDragCurrent(clientX);
  };

  const handleDragEnd = () => {
    if (dragStart === null || dragCurrent === null) return;

    const diff = dragCurrent - dragStart;
    const threshold = 100; // Minimum drag distance to trigger navigation

    if (diff > threshold) {
      goToPrevious(); // Swiped right
    } else if (diff < -threshold) {
      goToNext(); // Swiped left
    }

    setDragStart(null);
    setDragCurrent(null);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length]);

  // Request fullscreen on mount for VisionOS
  useEffect(() => {
    if (containerRef.current) {
      const elem = containerRef.current;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {
          // Fullscreen may not be supported or user declined
        });
      }
    }
  }, []);

  // Focus the current slide when it changes
  useEffect(() => {
    const currentSlideElement = slideRefs.current.get(currentSlide);
    if (currentSlideElement && !isTransitioning) {
      // Small delay to ensure the transition has started
      setTimeout(() => {
        currentSlideElement.focus();
      }, 50);
    }
  }, [currentSlide, isTransitioning]);

  // Calculate circular positioning for 3D carousel
  // Always show 3 cards: prev, current, next (like doubly linked list)
  const getVisibleSlides = (): Array<{ index: number; position: 'prev' | 'current' | 'next' }> => {
    const visible: Array<{ index: number; position: 'prev' | 'current' | 'next' }> = [];

    // Previous slide (wrap to last if on first slide)
    const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    visible.push({ index: prevIndex, position: 'prev' });

    // Current slide
    visible.push({ index: currentSlide, position: 'current' });

    // Next slide (wrap to first if on last slide)
    const nextIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    visible.push({ index: nextIndex, position: 'next' });

    return visible;
  };

  const getSlideTransform = (position: 'prev' | 'current' | 'next') => {
    const horizontalSpacing = 650; // Horizontal distance between cards (linked list spacing)
    const angleRotation = 25; // Slight rotation for depth

    // Calculate drag offset for smooth dragging animation
    const dragOffset = dragStart !== null && dragCurrent !== null ? (dragCurrent - dragStart) * 0.5 : 0;

    switch (position) {
      case 'prev':
        return {
          x: -horizontalSpacing + dragOffset,
          z: -600, // Side cards are CLOSER to user
          rotateY: angleRotation,
          opacity: 1,
          scale: 0.88,
        };
      case 'current':
        return {
          x: 0 + dragOffset,
          z: -1200, // Middle card is MUCH further back
          rotateY: 0,
          opacity: 1,
          scale: 1,
        };
      case 'next':
        return {
          x: horizontalSpacing + dragOffset,
          z: -600, // Side cards are CLOSER to user
          rotateY: -angleRotation,
          opacity: 1,
          scale: 0.88,
        };
    }
  };

  const visibleSlides = getVisibleSlides();

  return (
    <div
      className="spatial-mood-wrap fullscreen-visionos"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Back Button */}
      <button
        className="spatial-back-button"
        onClick={() => navigate('/features')}
        aria-label="Go back"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Main 3D Carousel - Circular Layout */}
      <div className="spatial-carousel-container">
        <div className="spatial-carousel-stage">
          {visibleSlides.map(({ index, position }) => {
            const transform = getSlideTransform(position);
            const isFocused = position === 'current';

            const isDragging = dragStart !== null;

            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) {
                    slideRefs.current.set(index, el);
                  } else {
                    slideRefs.current.delete(index);
                  }
                }}
                tabIndex={isFocused ? 0 : -1}
                className={`spatial-slide ${isFocused ? 'focused' : ''} position-${position} ${isDragging ? 'dragging' : ''}`}
                style={{
                  transform: `translate3d(${transform.x}px, 0px, ${transform.z}px) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
                  opacity: transform.opacity,
                  pointerEvents: isFocused ? 'auto' : 'none',
                  transition: isTransitioning || !isDragging ? 'all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)' : 'none',
                }}
                onClick={() => !isFocused && goToSlide(index)}
              >
                <div className="spatial-slide-content">
                  {slides[index]}
                </div>
                {/* Show pointer indicators on side cards */}
                {!isFocused && (
                  <div className={`linked-list-pointer ${position === 'prev' ? 'pointer-prev' : 'pointer-next'}`}>
                    {position === 'prev' ? '←' : '→'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Period Tabs - Top */}
      {onTimePeriodChange && (
        <div className="spatial-time-period-tabs">
          <button
            className={`spatial-tab ${timePeriod === 'weekly' ? 'active' : ''}`}
            onClick={() => onTimePeriodChange('weekly')}
          >
            WEEKLY
          </button>
          <button
            className={`spatial-tab ${timePeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => onTimePeriodChange('monthly')}
          >
            MONTHLY
          </button>
          <button
            className={`spatial-tab ${timePeriod === 'yearly' ? 'active' : ''}`}
            onClick={() => onTimePeriodChange('yearly')}
          >
            YEARLY
          </button>
        </div>
      )}

    </div>
  );
}
