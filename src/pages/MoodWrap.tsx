import { useState, useEffect } from 'react';
import { BackButton } from '../components/BackButton';
import { calculateWeeklyStats, calculateMonthlyStats, calculateYearlyStats, type MoodWrapStats } from '../services/moodWrapService';
import { type JournalEntry, MOODS } from '../types';
import { SpatialMoodWrapCarousel } from '../components/SpatialMoodWrapCarousel';
import './MoodWrap.css';

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

export function MoodWrap() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<MoodWrapStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      calculateStats();
    } else {
      setStats(null);
      setLoading(false);
    }
  }, [entries, timePeriod]);

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

  const calculateStats = () => {
    setLoading(true);
    let calculatedStats: MoodWrapStats;
    
    switch (timePeriod) {
      case 'weekly':
        calculatedStats = calculateWeeklyStats(entries);
        break;
      case 'monthly':
        calculatedStats = calculateMonthlyStats(entries);
        break;
      case 'yearly':
        calculatedStats = calculateYearlyStats(entries);
        break;
    }
    
    setStats(calculatedStats);
    setLoading(false);
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  // Always render spatial carousel when we have stats - FULLSCREEN AUTOMATIC
  if (stats && stats.totalEntries > 0 && !loading) {
    return (
      <SpatialMoodWrapCarousel
        stats={stats}
        timePeriod={timePeriod}
        dateRange={formatDateRange(stats.dateRange.start, stats.dateRange.end)}
        onTimePeriodChange={setTimePeriod}
      />
    );
  }

  return (
    <div className="mood-wrap-page">
      <BackButton />

      <div className="mood-wrap-container">
        <h1 className="mood-wrap-title">Soul Summary</h1>

        <div className="time-period-tabs">
          <button
            className={`tab-button ${timePeriod === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimePeriod('weekly')}
          >
            WEEKLY
          </button>
          <button
            className={`tab-button ${timePeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimePeriod('monthly')}
          >
            MONTHLY
          </button>
          <button
            className={`tab-button ${timePeriod === 'yearly' ? 'active' : ''}`}
            onClick={() => setTimePeriod('yearly')}
          >
            YEARLY
          </button>
        </div>

        {loading ? (
          <div className="loading-wrap">
            <div className="spinner"></div>
            <p>Calculating your Soul Summary...</p>
          </div>
        ) : (
          <div className="empty-wrap">
            <div className="empty-icon">📔</div>
            <h2>No entries yet</h2>
            <p>Start journaling to see your Soul Summary!</p>
          </div>
        )}
      </div>
    </div>
  );
}

