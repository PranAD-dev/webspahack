import { useState, useEffect } from 'react';
import './GlowCard.css';

interface GlowCardProps {
  monthName: string;
  year: number;
  onUnlockComplete?: () => void;
}

export function GlowCard({ monthName, year, onUnlockComplete }: GlowCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Save to localStorage
    const key = `glowcard-${year}-${monthName}`;
    const existing = localStorage.getItem(key);
    if (!existing) {
      localStorage.setItem(key, JSON.stringify({ month: monthName, year, unlockedAt: new Date().toISOString() }));
    }
    setIsUnlocked(true);
    
    // Trigger unlock animation
    setTimeout(() => {
      setShowAnimation(false);
      if (onUnlockComplete) {
        setTimeout(onUnlockComplete, 2000);
      }
    }, 3000);
  }, [monthName, year, onUnlockComplete]);

  return (
    <div className={`glow-card-container ${isUnlocked ? 'unlocked' : ''}`}>
      {showAnimation && (
        <div className="unlock-animation">
          <div className="sparkles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="sparkle" style={{
                '--delay': `${i * 0.1}s`,
                '--angle': `${(i * 360) / 20}deg`,
              } as React.CSSProperties}></div>
            ))}
          </div>
        </div>
      )}
      
      <div className="glow-card">
        <div className="card-glow"></div>
        <div className="card-content-inner">
          <div className="card-icon">✨</div>
          <h2 className="card-title">GlowCard</h2>
          <div className="card-month">{monthName}</div>
          <div className="card-year">{year}</div>
          <div className="card-badge">UNLOCKED</div>
        </div>
      </div>
      
      <p className="collectible-text">Collectible Card Unlocked! 🎉</p>
    </div>
  );
}

