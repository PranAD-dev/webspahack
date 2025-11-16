import './SlideBase.css';

interface HeroSlideProps {
  timePeriod: 'weekly' | 'monthly' | 'yearly';
  dateRange: string;
}

export function HeroSlide({ timePeriod, dateRange }: HeroSlideProps) {
  const periodLabel = timePeriod === 'weekly' ? 'Week' : timePeriod === 'monthly' ? 'Month' : 'Year';
  const title = timePeriod === 'weekly' ? 'Your Week in Feelings ✨' : `Your ${periodLabel} in Feelings`;
  
  return (
    <div className="slide-base hero-slide">
      <div className="slide-content">
        <div className="hero-emoji">✨</div>
        <h1 className="hero-title">{title}</h1>
        <p className="hero-date">{dateRange}</p>
        <div className="pulse-circle"></div>
      </div>
    </div>
  );
}

