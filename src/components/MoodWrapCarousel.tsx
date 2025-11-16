import { useState, useRef, useEffect } from 'react';
import type { MoodWrapStats } from '../services/moodWrapService';
import './MoodWrapCarousel.css';

interface MoodWrapCarouselProps {
  stats: MoodWrapStats;
  timePeriod: 'weekly' | 'monthly' | 'yearly';
  dateRange: string;
}

export function MoodWrapCarousel({ stats: _stats }: MoodWrapCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const dragStartY = useRef<number>(0);
  const hasMoved = useRef<boolean>(false);

  // Start from scratch - all blank slides with just pastel colored cards
  const slides = [
    <div key="slide-1" className="slide-base blank-slide"></div>,
    <div key="slide-2" className="slide-base blank-slide"></div>,
    <div key="slide-3" className="slide-base blank-slide"></div>,
    <div key="slide-4" className="slide-base blank-slide"></div>,
    <div key="slide-5" className="slide-base blank-slide"></div>,
  ];

  const handleDragStart = (clientX: number, clientY: number) => {
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    hasMoved.current = false;
    setIsDragging(false); // Don't set dragging until we actually move
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    const offset = clientX - dragStartX.current;
    const moveDistance = Math.abs(offset);
    
    // Only start dragging if we've moved more than 5px
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
    }
    
    // Reset drag state after a short delay to allow click events
    setTimeout(() => {
      setIsDragging(false);
      setDragOffset(0);
      hasMoved.current = false;
      dragStartX.current = 0;
    }, 50);
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    // Don't prevent default - let click events work
    handleDragStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStartX.current !== 0) {
      handleDragMove(e.clientX);
    }
  };

  const onMouseUp = (_e: React.MouseEvent) => {
    handleDragEnd();
    // Don't handle click here - let onClick handle it
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

  const onTouchEnd = (e?: React.TouchEvent) => {
    const wasDragging = isDragging;
    const currentDragOffset = dragOffset;
    handleDragEnd();
    // If it wasn't a drag, treat it as a tap
    if (!wasDragging && e && Math.abs(currentDragOffset) < 10) {
      setTimeout(() => handleTap(e), 100);
    }
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
    // Check if we actually dragged (moved more than 10px)
    if (hasMoved.current || Math.abs(dragOffset) > 10) {
      console.log('Blocked tap - was a drag', { hasMoved: hasMoved.current, dragOffset });
      return;
    }
    
    // Prevent tap if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('a') || 
      target.closest('.carousel-actions') ||
      target.closest('.slide-indicators') ||
      target.closest('.swipe-hint') ||
      target.closest('.tap-hint')
    ) {
      console.log('Blocked tap - clicked on interactive element');
      return;
    }
    
    console.log('Tap detected - going to next slide');
    // Go to next slide on tap/click
    e.preventDefault();
    e.stopPropagation();
    goToNext();
  };

  const handleSkip = () => {
    // Always skip to the end (last slide)
    setCurrentSlide(slides.length - 1);
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
              onMouseMove={isActive ? onMouseMove : undefined}
              onMouseUp={isActive ? onMouseUp : undefined}
              onMouseLeave={isActive ? (e) => onMouseUp(e) : undefined}
              onTouchStart={isActive ? onTouchStart : undefined}
              onTouchMove={isActive ? onTouchMove : undefined}
              onTouchEnd={isActive ? (e) => onTouchEnd(e) : undefined}
            >
              <div 
                className="card-content" 
                onClick={isActive ? (e) => {
                  // Check if this was a click (not a drag) by checking if we moved
                  const moved = hasMoved.current || Math.abs(dragOffset) > 10;
                  if (!moved) {
                    handleTap(e);
                  }
                } : undefined}
              >
                {slide}
              </div>
              {/* Hide all hints for blank slides */}
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
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Skip button - shown in the middle (when not at the end) */}
          {currentSlide < slides.length - 1 && (
            <div className="carousel-actions-middle">
              <button
                className="action-button skip-button"
                onClick={handleSkip}
                aria-label="Skip to end"
                title="Skip to end"
              >
                ⏭️ Skip to End
              </button>
            </div>
          )}

          {/* Replay button - shown at the end (last slide) */}
          {currentSlide === slides.length - 1 && (
            <div className="carousel-actions-end">
              <button
                className="action-button replay-button"
                onClick={handleReplay}
                aria-label="Replay from beginning"
                title="Replay from beginning"
              >
                🔄 Replay
              </button>
            </div>
          )}

          {/* Share button - always available */}
          <div className="carousel-actions-share">
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

