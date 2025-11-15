import './SlideBase.css';

interface YearTransitionSlideProps {
  currentYear: number;
  nextYear: number;
}

export function YearTransitionSlide({ currentYear, nextYear }: YearTransitionSlideProps) {
  return (
    <div className="slide-base year-transition-slide">
      <div className="slide-content">
        <div className="transition-icon">✨</div>
        <h2 className="slide-subtitle">You've grown so much this year</h2>
        <div className="year-transition">
          <div className="year-current">{currentYear}</div>
          <div className="transition-arrow">→</div>
          <div className="year-next">{nextYear}</div>
        </div>
        <p className="slide-description">Ready for {nextYear}?</p>
        <div className="encouragement-box">
          <p>Your journey continues, one entry at a time 🌟</p>
        </div>
      </div>
    </div>
  );
}

