import './SlideBase.css';

interface YearlyHeroSlideProps {
  year: number;
}

export function YearlyHeroSlide({ year }: YearlyHeroSlideProps) {
  return (
    <div className="slide-base yearly-hero-slide">
      <div className="slide-content">
        <div className="year-number">{year}</div>
        <h1 className="yearly-title">Your Emotional Journey</h1>
        <div className="globe-icon">🌍</div>
        <div className="cinematic-glow"></div>
      </div>
    </div>
  );
}

