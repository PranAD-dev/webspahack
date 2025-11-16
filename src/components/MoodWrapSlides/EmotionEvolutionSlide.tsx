import type { MoodWrapStats } from '../../services/moodWrapService';
import { MOODS } from '../../types';
import './SlideBase.css';
import './EmotionEvolutionSlide.css';

interface EmotionEvolutionSlideProps {
  stats: MoodWrapStats;
}

export function EmotionEvolutionSlide({ stats }: EmotionEvolutionSlideProps) {
  if (!stats.emotionEvolution || stats.emotionEvolution.length === 0) {
    return null;
  }

  // Convert mood IDs to numeric values for graphing
  const moodValues: Record<string, number> = {
    'sad': 1,
    'anxious': 2,
    'overwhelmed': 3,
    'reflective': 4,
    'calm': 5,
    'grateful': 6,
    'happy': 7,
    'excited': 8,
  };

  // Sort emotion evolution by date to ensure chronological order
  const sortedEvolution = [...stats.emotionEvolution].sort((a, b) => {
    // Parse dates - format is "Month Day" (e.g., "Jan 15")
    const dateA = new Date(a.date + ' ' + new Date().getFullYear());
    const dateB = new Date(b.date + ' ' + new Date().getFullYear());
    return dateA.getTime() - dateB.getTime();
  });

  // Prepare data points for the graph
  const dataPoints = sortedEvolution.map((point, index) => {
    const mood = MOODS.find(m => m.id === point.mood);
    // Parse date - format is "Month Day" (e.g., "Jan 15")
    let date: Date;
    try {
      date = new Date(point.date + ' ' + new Date().getFullYear());
      if (isNaN(date.getTime())) {
        // Fallback: use current date
        date = new Date();
      }
    } catch {
      date = new Date();
    }
    
    return {
      x: index,
      y: moodValues[point.mood] || 4,
      mood: point.mood,
      moodObj: mood,
      date: date,
      dateLabel: point.date, // Use original date string
    };
  });

  // Calculate graph dimensions
  const graphWidth = 600;
  const graphHeight = 300;
  const padding = 40;
  const chartWidth = graphWidth - padding * 2;
  const chartHeight = graphHeight - padding * 2;

  // Calculate Y positions (invert Y so higher moods are at top)
  const minY = 1;
  const maxY = 8;
  const yScale = chartHeight / (maxY - minY);

  // Generate path for line graph
  const pathData = dataPoints.map((point, index) => {
    const x = padding + (index / (dataPoints.length - 1 || 1)) * chartWidth;
    const y = padding + (maxY - point.y) * yScale;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate area path (for area chart effect)
  const areaPath = `${pathData} L ${padding + chartWidth} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`;

  return (
    <div className="slide-base emotion-evolution-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">Your Emotional Journey</h2>
        <div className="mood-graph-container">
          <svg 
            className="mood-graph" 
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((moodValue) => {
              const y = padding + (maxY - moodValue) * yScale;
              const mood = MOODS.find(m => moodValues[m.id] === moodValue);
              return (
                <g key={moodValue}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={padding + chartWidth}
                    y2={y}
                    stroke={mood?.color || '#e0e0e0'}
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.3"
                  />
                  <text
                    x={padding - 10}
                    y={y + 5}
                    fontSize="12"
                    fill={mood?.color || '#666'}
                    textAnchor="end"
                  >
                    {mood?.emoji}
                  </text>
                </g>
              );
            })}

            {/* Area chart (gradient fill) */}
            <defs>
              <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                {dataPoints.map((point, index) => {
                  const percent = (index / (dataPoints.length - 1 || 1)) * 100;
                  return (
                    <stop
                      key={index}
                      offset={`${percent}%`}
                      stopColor={point.moodObj?.color || '#ffb6c1'}
                      stopOpacity="0.3"
                    />
                  );
                })}
              </linearGradient>
            </defs>
            <path
              d={areaPath}
              fill="url(#moodGradient)"
              opacity="0.4"
            />

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {dataPoints.map((point, index) => {
              const x = padding + (index / (dataPoints.length - 1 || 1)) * chartWidth;
              const y = padding + (maxY - point.y) * yScale;
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={point.moodObj?.color || '#ffb6c1'}
                    stroke="#fff"
                    strokeWidth="2"
                    className="mood-point"
                  />
                  {/* Tooltip on hover */}
                  <title>
                    {point.dateLabel}: {point.moodObj?.name || point.mood}
                  </title>
                </g>
              );
            })}

            {/* X-axis labels (dates) */}
            {dataPoints.map((point, index) => {
              if (index % Math.ceil(dataPoints.length / 6) === 0 || index === dataPoints.length - 1) {
                const x = padding + (index / (dataPoints.length - 1 || 1)) * chartWidth;
                return (
                  <text
                    key={index}
                    x={x}
                    y={graphHeight - padding + 20}
                    fontSize="11"
                    fill="rgba(255, 255, 255, 0.8)"
                    textAnchor="middle"
                  >
                    {point.dateLabel}
                  </text>
                );
              }
              return null;
            })}
          </svg>
        </div>
        <p className="slide-description">Your mood changes throughout the month</p>
      </div>
    </div>
  );
}

