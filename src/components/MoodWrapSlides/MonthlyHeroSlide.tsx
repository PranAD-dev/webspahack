import './SlideBase.css';

interface MonthlyHeroSlideProps {
  monthName: string;
}

export function MonthlyHeroSlide({ monthName }: MonthlyHeroSlideProps) {
  return (
    <div className="slide-base monthly-hero-slide">
      <div className="slide-content">
        <div className="gift-emoji">🎁</div>
        <h1 className="hero-title">{monthName} Unwrapped</h1>
        <div className="pulse-circle"></div>
      </div>
    </div>
  );
}

