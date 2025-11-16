import { useState, useRef, useEffect } from 'react';
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
import './MoodWrapCarousel.css';

interface MoodWrapCarouselProps {
  stats: MoodWrapStats;
  timePeriod: 'weekly' | 'monthly' | 'yearly';
  dateRange: string;
}

export function MoodWrapCarousel({ stats, timePeriod, dateRange }: MoodWrapCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [skipToEnd, setSkipToEnd] = useState(true);
  const dragStartX = useRef<number>(0);
  const dragStartY = useRef<number>(0);
  const lastTapTime = useRef<number>(0);

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
    ...(stats.top3Emotions && stats.top3Emotions.length > 0 ? [<Top3EmotionsSlide key="top3" stats={stats} />] : []),
    ...(stats.monthlyBreakdown && stats.monthlyBreakdown.length > 0 ? [<EmotionTimelineSlide key="timeline" stats={stats} />] : []),
    ...(stats.mostTransformativeMonth ? [<TransformativeMonthSlide key="transformative" stats={stats} />] : []),
    ...(stats.peakHappinessMonth ? [<PeakHappinessSlide key="happiness" stats={stats} />] : []),
    ...(stats.hardestMonth ? [<HardestMonthSlide key="hardest" stats={stats} />] : []),
    ...(stats.longestStreak && stats.streakDates ? [<LongestStreakYearlySlide key="streak" stats={stats} />] : []),
    ...(stats.wordCloud && stats.wordCloud.length > 0 ? [<WordsThatDefinedSlide key="words" stats={stats} year={getYear()} />] : []),
    ...(stats.emotionalGrowth ? [<EmotionalGrowthSlide key="growth" stats={stats} />] : []),
    ...(stats.percentile ? [<ConsistencyBadgeSlide key="badge" stats={stats} />] : []),
    ...(stats.gratitudeCount ? [<GratitudeCounterSlide key="gratitude" stats={stats} />] : []),
    ...(stats.mostReflectiveEntry ? [<MostReflectiveDaySlide key="reflective" stats={stats} />] : []),
    <YearTransitionSlide key="transition" currentYear={getYear()} nextYear={getNextYear()} />,
    <ShareJourneySlide key="share" stats={stats} year={getYear()} />,
    <div key="glowcard" className="glowcard-slide">
      <GlowCard 
        monthName="Year" 
        year={getYear()}
      />
    </div>
  ].filter(Boolean) : timePeriod === 'monthly' ? [
    <MonthlyHeroSlide key="hero" monthName={getMonthName(stats.dateRange.start)} />,
    <ByTheNumbersSlide key="numbers" stats={stats} />,
    <EmotionEvolutionSlide key="evolution" stats={stats} />,
    <DominantEmotionSlide key="dominant" stats={stats} monthName={getMonthName(stats.dateRange.start)} />,
    <BreakdownSlide key="breakdown" stats={stats} />,
    <StreakSlide key="streak" stats={stats} />,
    <MostActiveDaySlide key="active-day" stats={stats} />,
    <WordCloudSlide key="wordcloud" stats={stats} monthName={getMonthName(stats.dateRange.start)} />,
    ...(stats.transformationMoment ? [<TransformationSlide key="transformation" stats={stats} />] : []),
    ...(stats.consistencyScore ? [<ConsistencySlide key="consistency" stats={stats} />] : []),
    <LookingAheadSlide key="ahead" stats={stats} nextMonth={getNextMonthName()} />,
    <div key="glowcard" className="glowcard-slide">
      <GlowCard 
        monthName={getMonthName(stats.dateRange.start)} 
        year={stats.dateRange.start.getFullYear()}
      />
    </div>
  ].filter(Boolean) : [
    <HeroSlide key="hero" timePeriod={timePeriod} dateRange={dateRange} />,
    <EntryCountSlide key="count" stats={stats} />,
    <TopEmotionSlide key="emotion" stats={stats} />,
    <BreakdownSlide key="breakdown" stats={stats} />,
    <PeakMomentSlide key="peak" stats={stats} />,
    <InsightSlide key="insight" stats={stats} />,
    <GoalSlide key="goal" stats={stats} />,
  ];

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - dragStartX.current;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100; // Minimum swipe distance
    const velocity = Math.abs(dragOffset) / 10; // Simple velocity calculation
    
    if (Math.abs(dragOffset) > threshold || velocity > 5) {
      if (dragOffset > 0 && currentSlide > 0) {
        // Swipe right - go to previous
        setCurrentSlide(currentSlide - 1);
      } else if (dragOffset < 0 && currentSlide < slides.length - 1) {
        // Swipe left - go to next
        setCurrentSlide(currentSlide + 1);
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Prevent default drag behavior
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => document.removeEventListener('touchmove', preventDefault);
  }, [isDragging]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // const goToPrevious = () => {
  //   if (currentSlide > 0) {
  //     setCurrentSlide(currentSlide - 1);
  //   }
  // };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't trigger tap if we just finished dragging
    if (isDragging || Math.abs(dragOffset) > 10) {
      return;
    }
    
    // Prevent tap if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('.carousel-actions')) {
      return;
    }
    
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;
    
    // Single tap - go to next
    if (timeSinceLastTap > 300) {
      goToNext();
      lastTapTime.current = now;
    }
  };

  const handleSkip = () => {
    if (skipToEnd) {
      setCurrentSlide(slides.length - 1);
    } else {
      setCurrentSlide(0);
    }
    setSkipToEnd(!skipToEnd);
  };

  const handleReplay = () => {
    setCurrentSlide(0);
  };

  const handleShareSlide = async () => {
    // Find the active card element
    const activeCard = document.querySelector('.floating-card.active');
    if (!activeCard) {
      console.error('No active card found');
      return;
    }

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture the entire active card
      const canvas = await html2canvas(activeCard as HTMLElement, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        width: activeCard.clientWidth,
        height: activeCard.clientHeight,
      });

      // Convert canvas to blob
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) {
          console.error('Failed to create blob');
          return;
        }

        const file = new File([blob], `soul-summary-slide-${currentSlide + 1}.png`, { type: 'image/png' });

        // Try native share API first
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: `Soul Summary - Slide ${currentSlide + 1}`,
            text: `Check out my Soul Summary!`,
            files: [file],
          }).catch((error) => {
            console.error('Error sharing:', error);
            // Fallback to download
            downloadImage(blob);
          });
        } else {
          // Fallback: download image
          downloadImage(blob);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error capturing slide:', error);
      // Fallback: share text summary
      const shareText = `Soul Summary - Slide ${currentSlide + 1} of ${slides.length}\n\nCheck out my Soul Summary journey!`;
      if (navigator.share) {
        navigator.share({ title: 'Soul Summary', text: shareText }).catch(() => {
          navigator.clipboard.writeText(shareText);
          alert('Slide summary copied to clipboard!');
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('Slide summary copied to clipboard!');
      }
    }
  };

  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soul-summary-slide-${currentSlide + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mood-wrap-carousel">
      <div className="cards-stack">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const isNext = index === currentSlide + 1;
          const isPrev = index === currentSlide - 1;
          const isVisible = isActive || isNext || isPrev || Math.abs(index - currentSlide) <= 2;
          
          if (!isVisible) return null;

          const offset = isActive ? dragOffset : 0;
          const zIndex = slides.length - Math.abs(index - currentSlide);
          const scale = isActive ? 1 : 0.95 - Math.abs(index - currentSlide) * 0.05;
          const opacity = isActive ? 1 : 0.6 - Math.abs(index - currentSlide) * 0.2;
          const rotation = isActive ? dragOffset * 0.1 : (index - currentSlide) * 2;

          return (
            <div
              key={index}
              className={`floating-card ${isActive ? 'active' : ''}`}
              style={{
                zIndex,
                transform: `translateX(calc(${(index - currentSlide) * 100}% + ${offset}px)) scale(${scale}) rotateY(${rotation}deg)`,
                opacity: Math.max(opacity, 0.3),
                pointerEvents: isActive ? 'auto' : 'none',
              }}
              onMouseDown={isActive ? onMouseDown : undefined}
              onMouseMove={isActive && isDragging ? onMouseMove : undefined}
              onMouseUp={isActive ? onMouseUp : undefined}
              onMouseLeave={isActive ? onMouseUp : undefined}
              onTouchStart={isActive ? onTouchStart : undefined}
              onTouchMove={isActive ? onTouchMove : undefined}
              onTouchEnd={isActive ? onTouchEnd : undefined}
              onClick={isActive ? (e) => handleTap(e) : undefined}
            >
              <div className="card-content">
                {slide}
              </div>
              {isActive && (
                <div className="swipe-hint">
                  <span className="swipe-left">← Swipe</span>
                  <span className="swipe-right">Swipe →</span>
                  <span className="tap-hint">or Tap to continue</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="carousel-controls">
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="carousel-actions">
        <button 
          className="action-button skip-button" 
          onClick={handleSkip}
          aria-label={skipToEnd ? "Skip to end" : "Go to beginning"}
          title={skipToEnd ? "Skip to end" : "Go to beginning"}
        >
          {skipToEnd ? "⏭️ Skip" : "⏮️ Start"}
        </button>
        
        <button 
          className="action-button replay-button" 
          onClick={handleReplay}
          aria-label="Replay from beginning"
          title="Replay from beginning"
        >
          🔄 Replay
        </button>
        
        <button 
          className="action-button share-button" 
          onClick={handleShareSlide}
          aria-label="Share this slide"
          title="Share this slide"
        >
          📤 Share
        </button>
      </div>

      <div className="slide-counter">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}

