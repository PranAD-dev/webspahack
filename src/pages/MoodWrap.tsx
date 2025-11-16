import { useState, useRef, useEffect } from 'react';
import { BackButton } from '../components/BackButton';
import { calculateWeeklyStats, calculateMonthlyStats, calculateYearlyStats, type MoodWrapStats } from '../services/moodWrapService';
import { type JournalEntry, MOODS } from '../types';
import { HeroSlide } from '../components/MoodWrapSlides/HeroSlide';
import { EntryCountSlide } from '../components/MoodWrapSlides/EntryCountSlide';
import { TopEmotionSlide } from '../components/MoodWrapSlides/TopEmotionSlide';
import { BreakdownSlide } from '../components/MoodWrapSlides/BreakdownSlide';
import { PeakMomentSlide } from '../components/MoodWrapSlides/PeakMomentSlide';
import { InsightSlide } from '../components/MoodWrapSlides/InsightSlide';
import { GoalSlide } from '../components/MoodWrapSlides/GoalSlide';
import { MonthlyHeroSlide } from '../components/MoodWrapSlides/MonthlyHeroSlide';
import { ByTheNumbersSlide } from '../components/MoodWrapSlides/ByTheNumbersSlide';
import { DominantEmotionSlide } from '../components/MoodWrapSlides/DominantEmotionSlide';
import { EmotionEvolutionSlide } from '../components/MoodWrapSlides/EmotionEvolutionSlide';
import { StreakSlide } from '../components/MoodWrapSlides/StreakSlide';
import { WordCloudSlide } from '../components/MoodWrapSlides/WordCloudSlide';
import { TransformationSlide } from '../components/MoodWrapSlides/TransformationSlide';
import { LookingAheadSlide } from '../components/MoodWrapSlides/LookingAheadSlide';
import { YearlyHeroSlide } from '../components/MoodWrapSlides/YearlyHeroSlide';
import { YearInNumbersSlide } from '../components/MoodWrapSlides/YearInNumbersSlide';
import { Top3EmotionsSlide } from '../components/MoodWrapSlides/Top3EmotionsSlide';
import { EmotionTimelineSlide } from '../components/MoodWrapSlides/EmotionTimelineSlide';
import { PeakValleySlide } from '../components/MoodWrapSlides/PeakValleySlide';
import { LongestStreakYearlySlide } from '../components/MoodWrapSlides/LongestStreakYearlySlide';
import { WordsThatDefinedSlide } from '../components/MoodWrapSlides/WordsThatDefinedSlide';
import { EmotionalGrowthSlide } from '../components/MoodWrapSlides/EmotionalGrowthSlide';
import { GratitudeCounterSlide } from '../components/MoodWrapSlides/GratitudeCounterSlide';
import { ShareJourneySlide } from '../components/MoodWrapSlides/ShareJourneySlide';
import { playTwinkleSound, playClickSound, playSwipeSound, playPingSound, playTadaSound } from '../utils/soundEffects';
import '../components/MoodWrapCarousel.css';
import './MoodWrap.css';

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

// Card carousel component
function CardCarousel({ 
  timePeriod, 
  stats, 
  dateRange 
}: { 
  timePeriod: TimePeriod;
  stats: MoodWrapStats | null;
  dateRange: string;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const hasMoved = useRef<boolean>(false);
  const prevSlideRef = useRef<number>(0);
  const slideRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Helper function to get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  const getNextMonthName = () => {
    if (!stats) return '';
    const nextMonth = new Date(stats.dateRange.end);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleDateString('en-US', { month: 'long' });
  };

  const getYear = () => {
    if (!stats) return new Date().getFullYear();
    return stats.dateRange.start.getFullYear();
  };

  // Create slides based on time period
  const slides = timePeriod === 'weekly' && stats && stats.totalEntries > 0 ? [
    <HeroSlide key="hero" timePeriod="weekly" dateRange={dateRange} />,
    <EntryCountSlide key="entry-count" stats={stats} />,
    ...(stats.topMood ? [<TopEmotionSlide key="top-emotion" stats={stats} />] : []),
    ...(stats.moodBreakdown && stats.moodBreakdown.length > 0 ? [<BreakdownSlide key="breakdown" stats={stats} />] : []),
    ...(stats.peakDay ? [<PeakMomentSlide key="peak" stats={stats} />] : []),
    <InsightSlide key="insight" stats={stats} />,
    <GoalSlide key="goal" stats={stats} />,
  ].filter(Boolean) : timePeriod === 'monthly' && stats && stats.totalEntries > 0 ? [
    <MonthlyHeroSlide key="hero" monthName={getMonthName(stats.dateRange.start)} />,
    <ByTheNumbersSlide key="numbers" stats={stats} />,
    <DominantEmotionSlide key="dominant" stats={stats} monthName={getMonthName(stats.dateRange.start)} />,
    <BreakdownSlide key="palette" stats={stats} />,
    <EmotionEvolutionSlide key="journey" stats={stats} />,
    <StreakSlide key="streak" stats={stats} />,
    ...(stats.wordCloud && stats.wordCloud.length > 0 ? [<WordCloudSlide key="words" stats={stats} monthName={getMonthName(stats.dateRange.start)} />] : []),
    ...(stats.transformationMoment ? [<TransformationSlide key="transformation" stats={stats} />] : []),
    <LookingAheadSlide key="ahead" stats={stats} nextMonth={getNextMonthName()} />,
  ].filter(Boolean) : timePeriod === 'yearly' && stats && stats.totalEntries > 0 ? [
    <YearlyHeroSlide key="hero" year={getYear()} />,
    <YearInNumbersSlide key="numbers" stats={stats} />,
    ...(stats.top3Emotions && stats.top3Emotions.length > 0 ? [<Top3EmotionsSlide key="top3" stats={stats} />] : []),
    ...(stats.monthlyBreakdown && stats.monthlyBreakdown.length > 0 ? [<EmotionTimelineSlide key="timeline" stats={stats} />] : []),
    ...(stats.peakHappinessMonth && stats.hardestMonth ? [<PeakValleySlide key="peak-valley" stats={stats} />] : []),
    ...(stats.wordCloud && stats.wordCloud.length > 0 ? [<WordsThatDefinedSlide key="words" stats={stats} year={getYear()} />] : []),
    ...(stats.longestStreak && stats.streakDates ? [<LongestStreakYearlySlide key="streak" stats={stats} />] : []),
    ...(stats.emotionalGrowth ? [<EmotionalGrowthSlide key="growth" stats={stats} />] : []),
    ...(stats.gratitudeCount ? [<GratitudeCounterSlide key="gratitude" stats={stats} />] : []),
    <ShareJourneySlide key="share" stats={stats} year={getYear()} />,
  ].filter(Boolean) : timePeriod === 'weekly' ? [
    // Show empty state slide for weekly when no entries
    <div key="empty" className="slide-base empty-state-slide">
      <div className="slide-content">
        <div className="empty-icon">📔</div>
        <h2 className="slide-subtitle">No entries this week</h2>
        <p className="slide-description">Start journaling to see your weekly Soul Summary!</p>
      </div>
    </div>
  ] : timePeriod === 'monthly' ? [
    // Show empty state slide for monthly when no entries
    <div key="empty" className="slide-base empty-state-slide">
      <div className="slide-content">
        <div className="empty-icon">📔</div>
        <h2 className="slide-subtitle">No entries this month</h2>
        <p className="slide-description">Start journaling to see your monthly Soul Summary!</p>
      </div>
    </div>
  ] : timePeriod === 'yearly' ? [
    // Show empty state slide for yearly when no entries
    <div key="empty" className="slide-base empty-state-slide">
      <div className="slide-content">
        <div className="empty-icon">📔</div>
        <h2 className="slide-subtitle">No entries this year</h2>
        <p className="slide-description">Start journaling to see your yearly Soul Summary!</p>
      </div>
    </div>
  ] : Array.from({ length: 5 }, (_, i) => (
    <div key={i} className="slide-base blank-slide"></div>
  ));

  // Play tada sound when reaching the final card
  useEffect(() => {
    if (slides.length > 0 && currentSlide === slides.length - 1 && prevSlideRef.current !== currentSlide) {
      // Only play if we just reached the final slide (not if we were already there)
      if (prevSlideRef.current < currentSlide) {
        playTadaSound(0.3);
      }
    }
    prevSlideRef.current = currentSlide;
  }, [currentSlide, slides.length]);

  // Focus the current slide when it changes
  useEffect(() => {
    const currentSlideElement = slideRefs.current.get(currentSlide);
    if (currentSlideElement && !isDragging) {
      // Small delay to ensure the transition has started
      setTimeout(() => {
        currentSlideElement.focus();
      }, 50);
    }
  }, [currentSlide, isDragging]);

  const handleDragStart = (clientX: number) => {
    dragStartX.current = clientX;
    hasMoved.current = false;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    const offset = clientX - dragStartX.current;
    const moveDistance = Math.abs(offset);

    if (moveDistance > 5) {
      hasMoved.current = true;
      if (!isDragging) {
        setIsDragging(true);
      }
      setDragOffset(offset);
    }
  };

  const handleDragEnd = () => {
    if (isDragging) {
      const threshold = 100;
      const velocity = Math.abs(dragOffset) / 10;

      if (Math.abs(dragOffset) > threshold || velocity > 5) {
        playSwipeSound(0.15);
        if (dragOffset > 0 && currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        } else if (dragOffset < 0 && currentSlide < slides.length - 1) {
          setCurrentSlide(currentSlide + 1);
        }
      }
    }

    setTimeout(() => {
      setIsDragging(false);
      setDragOffset(0);
      hasMoved.current = false;
      dragStartX.current = 0;
    }, 50);
  };

  const handleTap = () => {
    if (!hasMoved.current && Math.abs(dragOffset) < 10) {
      if (currentSlide < slides.length - 1) {
        playClickSound(0.2);
        setCurrentSlide(currentSlide + 1);
      }
    }
  };

  const handleSkip = () => {
    playPingSound(0.2);
    setCurrentSlide(slides.length - 1);
  };

  const handleReplay = () => {
    playPingSound(0.2);
    setCurrentSlide(0);
  };

  const handleShareSlide = async () => {
    playPingSound(0.2);
    const activeCard = document.querySelector('.floating-card.active');
    if (!activeCard) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(activeCard as HTMLElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        const file = new File([blob], `soul-summary-slide-${currentSlide + 1}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: `Soul Summary - Slide ${currentSlide + 1}`,
            text: `Check out my Soul Summary!`,
            files: [file],
          }).catch(() => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `soul-summary-slide-${currentSlide + 1}.png`;
            a.click();
            URL.revokeObjectURL(url);
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `soul-summary-slide-${currentSlide + 1}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Ensure we always have at least one slide
  if (slides.length === 0) {
    slides.push(
      <div key="empty" className="slide-base empty-state-slide">
        <div className="slide-content">
          <div className="empty-icon">📔</div>
          <h2 className="slide-subtitle">No data available</h2>
          <p className="slide-description">Start journaling to see your Soul Summary!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-wrap-carousel">
      <div className="cards-stack">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const offset = isActive ? dragOffset : 0;
          const zIndex = slides.length - Math.abs(index - currentSlide);
          const scale = isActive ? 1 : 0.95 - Math.abs(index - currentSlide) * 0.05;
          const opacity = isActive ? 1 : 0.6 - Math.abs(index - currentSlide) * 0.2;

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
              tabIndex={isActive ? 0 : -1}
              className={`floating-card ${isActive ? 'active' : ''}`}
              style={{
                zIndex,
                transform: `translateX(calc(${(index - currentSlide) * 100}% + ${offset}px)) scale(${scale})`,
                opacity: Math.max(opacity, 0.3),
                pointerEvents: isActive ? 'auto' : 'none',
              }}
              onMouseDown={isActive ? (e) => handleDragStart(e.clientX) : undefined}
              onMouseMove={isActive ? (e) => {
                if (dragStartX.current !== 0) {
                  handleDragMove(e.clientX);
                }
              } : undefined}
              onMouseUp={isActive ? () => handleDragEnd() : undefined}
              onMouseLeave={isActive ? () => handleDragEnd() : undefined}
              onTouchStart={isActive ? (e) => handleDragStart(e.touches[0].clientX) : undefined}
              onTouchMove={isActive ? (e) => {
                if (dragStartX.current !== 0) {
                  handleDragMove(e.touches[0].clientX);
                }
              } : undefined}
              onTouchEnd={isActive ? () => handleDragEnd() : undefined}
              onClick={isActive ? () => {
                if (!hasMoved.current && Math.abs(dragOffset) < 10) {
                  handleTap();
                }
              } : undefined}
            >
              <div className="card-content">
                {slide}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress dots */}
      <div className="carousel-controls">
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => {
                playClickSound(0.15);
                setCurrentSlide(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Action buttons container - below dots */}
      <div className="carousel-actions-container">
        {/* Skip button - shown in the middle (when not at the end) */}
        {currentSlide < slides.length - 1 ? (
          <button
            className="action-button skip-button"
            onClick={handleSkip}
            aria-label="Skip to end"
            title="Skip to end"
          >
            ⏭️ Skip to End
          </button>
        ) : (
          <button
            className="action-button replay-button"
            onClick={handleReplay}
            aria-label="Replay from beginning"
            title="Replay from beginning"
          >
            🔄 Replay
          </button>
        )}

        {/* Share button - always available, next to skip/replay */}
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

export function MoodWrap() {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('weekly');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<MoodWrapStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MoodWrapStats | null>(null);
  const [yearlyStats, setYearlyStats] = useState<MoodWrapStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      if (activePeriod === 'weekly') {
        const stats = calculateWeeklyStats(entries);
        setWeeklyStats(stats);
        setMonthlyStats(null);
        setYearlyStats(null);
      } else if (activePeriod === 'monthly') {
        const stats = calculateMonthlyStats(entries);
        setMonthlyStats(stats);
        setWeeklyStats(null);
        setYearlyStats(null);
      } else if (activePeriod === 'yearly') {
        const stats = calculateYearlyStats(entries);
        setYearlyStats(stats);
        setWeeklyStats(null);
        setMonthlyStats(null);
      } else {
        setWeeklyStats(null);
        setMonthlyStats(null);
        setYearlyStats(null);
      }
    } else {
      setWeeklyStats(null);
      setMonthlyStats(null);
      setYearlyStats(null);
    }
    setLoading(false);
  }, [entries, activePeriod]);

  const loadEntries = () => {
    const stored = localStorage.getItem('journalEntries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          mood: MOODS.find(m => m.id === entry.mood.id) || entry.mood,
        }));
        setEntries(entriesWithDates);
      } catch (e) {
        console.error('Error loading entries:', e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const weeklyDateRange = weeklyStats 
    ? formatDateRange(weeklyStats.dateRange.start, weeklyStats.dateRange.end)
    : '';

  return (
    <div className="mood-wrap-page">
      <BackButton />

      <div className="mood-wrap-container">
            <h1 className="mood-wrap-title">Soul Summary</h1>

        <div className="time-period-tabs">
          <button
            className={`tab-button ${activePeriod === 'weekly' ? 'active' : ''}`}
            onClick={() => {
              playTwinkleSound(0.25);
              setActivePeriod('weekly');
            }}
          >
            WEEKLY
          </button>
          <button
            className={`tab-button ${activePeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => {
              playTwinkleSound(0.25);
              setActivePeriod('monthly');
            }}
          >
            MONTHLY
          </button>
          <button
            className={`tab-button ${activePeriod === 'yearly' ? 'active' : ''}`}
            onClick={() => {
              playTwinkleSound(0.25);
              setActivePeriod('yearly');
            }}
          >
            YEARLY
          </button>
        </div>

        <div className="panel-container">
          {activePeriod === 'weekly' && (
            <div className="panel">
              {loading ? (
                <div className="loading-wrap">
                  <div className="spinner"></div>
                  <p>Calculating your Soul Summary...</p>
                </div>
              ) : (
                <CardCarousel 
                  timePeriod="weekly" 
                  stats={weeklyStats}
                  dateRange={weeklyDateRange}
                />
              )}
            </div>
          )}

          {activePeriod === 'monthly' && (
            <div className="panel">
              {loading ? (
                <div className="loading-wrap">
                  <div className="spinner"></div>
                  <p>Calculating your Soul Summary...</p>
                </div>
              ) : (
                <CardCarousel 
                  timePeriod="monthly" 
                  stats={monthlyStats}
                  dateRange=""
                />
              )}
            </div>
          )}

          {activePeriod === 'yearly' && (
            <div className="panel">
              {loading ? (
                <div className="loading-wrap">
                  <div className="spinner"></div>
                  <p>Calculating your Soul Summary...</p>
                </div>
              ) : (
                <CardCarousel 
                  timePeriod="yearly" 
                  stats={yearlyStats}
                  dateRange=""
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

