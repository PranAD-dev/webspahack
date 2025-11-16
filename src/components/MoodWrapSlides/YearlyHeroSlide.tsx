import './SlideBase.css';

interface YearlyHeroSlideProps {
  year: number;
}

export function YearlyHeroSlide({ year }: YearlyHeroSlideProps) {
  return (
    <div className="slide-base yearly-hero-slide">
      <div className="slide-content">
        <h1 className="yearly-title">{year}: Your Emotional Journey 🌍</h1>
        <div className="year-number">{year}</div>
        <div className="cinematic-glow"></div>
      </div>
    </div>
  );
}

