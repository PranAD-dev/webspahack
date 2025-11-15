import { MOODS, type Mood, type JournalEntry } from '../types';

export interface MoodWrapStats {
  totalEntries: number;
  topMood: Mood | null;
  moodBreakdown: { mood: Mood; count: number; percentage: number }[];
  dateRange: { start: Date; end: Date };
  peakDay: { date: Date; mood: Mood; entry: JournalEntry } | null;
  insights: string[];
  goal: string;
  // Monthly-specific stats
  totalWords?: number;
  totalCharacters?: number;
  daysJournaled?: number;
  daysMissed?: number;
  longestStreak?: number;
  mostActiveDay?: { day: string; count: number };
  dayOfWeekBreakdown?: { day: string; count: number }[];
  wordCloud?: { word: string; count: number }[];
  emotionEvolution?: { date: string; mood: string }[];
  consistencyScore?: { grade: string; percentage: number };
  transformationMoment?: { startDate: Date; endDate: Date; startMood: Mood; endMood: Mood } | null;
  // Yearly-specific stats
  top3Emotions?: { mood: Mood; count: number; percentage: number }[];
  monthlyBreakdown?: { month: string; entries: JournalEntry[]; topMood: Mood | null }[];
  mostTransformativeMonth?: { month: string; entries: JournalEntry[]; topMood: Mood | null } | null;
  peakHappinessMonth?: { month: string; entries: JournalEntry[]; count: number } | null;
  hardestMonth?: { month: string; entries: JournalEntry[]; count: number } | null;
  gratitudeCount?: number;
  mostReflectiveEntry?: JournalEntry | null;
  emotionalGrowth?: { startMood: Mood; endMood: Mood } | null;
  percentile?: number;
  streakDates?: { start: Date; end: Date } | null;
}

export function calculateWeeklyStats(entries: JournalEntry[]): MoodWrapStats {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weekEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= weekAgo && entryDate <= now;
  });

  return calculateStats(weekEntries, weekAgo, now);
}

export function calculateMonthlyStats(entries: JournalEntry[]): MoodWrapStats {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  const monthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= monthStart && entryDate <= monthEnd;
  });

  const baseStats = calculateStats(monthEntries, monthStart, monthEnd);
  
  // Calculate monthly-specific metrics
  const totalWords = monthEntries.reduce((sum, entry) => {
    return sum + entry.content.split(/\s+/).filter(word => word.length > 0).length;
  }, 0);
  
  const totalCharacters = monthEntries.reduce((sum, entry) => sum + entry.content.length, 0);
  
  // Calculate unique days journaled
  const uniqueDays = new Set(
    monthEntries.map(entry => {
      const d = new Date(entry.timestamp);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  const daysJournaled = uniqueDays.size;
  const daysInMonth = monthEnd.getDate();
  const daysMissed = daysInMonth - daysJournaled;
  
  // Calculate longest streak
  const sortedEntries = [...monthEntries].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  let longestStreak = 0;
  let currentStreak = 0;
  let lastDate: string | null = null;
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.timestamp);
    const dateStr = `${entryDate.getFullYear()}-${entryDate.getMonth()}-${entryDate.getDate()}`;
    
    if (lastDate === null) {
      currentStreak = 1;
    } else {
      const last = new Date(lastDate);
      const diffDays = Math.floor((entryDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    lastDate = dateStr;
  }
  longestStreak = Math.max(longestStreak, currentStreak);
  
  // Day of week breakdown
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = new Map<string, number>();
  monthEntries.forEach(entry => {
    const day = dayNames[new Date(entry.timestamp).getDay()];
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  });
  const dayOfWeekBreakdown = Array.from(dayCounts.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.count - a.count);
  const mostActiveDay = dayOfWeekBreakdown[0] || null;
  
  // Word cloud (simple version - most common words)
  const wordCounts = new Map<string, number>();
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can']);
  
  monthEntries.forEach(entry => {
    const words = entry.content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
  });
  
  const wordCloud = Array.from(wordCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  
  // Emotion evolution (daily mood trends)
  const emotionEvolution: { date: string; mood: string }[] = [];
  const dailyMoods = new Map<string, string[]>();
  
  monthEntries.forEach(entry => {
    const dateStr = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!dailyMoods.has(dateStr)) {
      dailyMoods.set(dateStr, []);
    }
    dailyMoods.get(dateStr)!.push(entry.mood.id);
  });
  
  dailyMoods.forEach((moods, date) => {
    // Get most common mood for the day
    const moodCounts = new Map<string, number>();
    moods.forEach(mood => moodCounts.set(mood, (moodCounts.get(mood) || 0) + 1));
    const topMood = Array.from(moodCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'calm';
    emotionEvolution.push({ date, mood: topMood });
  });
  
  // Transformation moment (find significant mood shift)
  let transformationMoment: { startDate: Date; endDate: Date; startMood: Mood; endMood: Mood } | null = null;
  if (sortedEntries.length >= 2) {
    const firstWeek = sortedEntries.slice(0, Math.ceil(sortedEntries.length / 4));
    const lastWeek = sortedEntries.slice(-Math.ceil(sortedEntries.length / 4));
    
    const firstMoodCounts = new Map<string, number>();
    firstWeek.forEach(e => firstMoodCounts.set(e.mood.id, (firstMoodCounts.get(e.mood.id) || 0) + 1));
    const firstTopMood = Array.from(firstMoodCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    const lastMoodCounts = new Map<string, number>();
    lastWeek.forEach(e => lastMoodCounts.set(e.mood.id, (lastMoodCounts.get(e.mood.id) || 0) + 1));
    const lastTopMood = Array.from(lastMoodCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    if (firstTopMood && lastTopMood && firstTopMood !== lastTopMood) {
      const startMood = MOODS.find(m => m.id === firstTopMood);
      const endMood = MOODS.find(m => m.id === lastTopMood);
      if (startMood && endMood) {
        transformationMoment = {
          startDate: new Date(firstWeek[0].timestamp),
          endDate: new Date(lastWeek[lastWeek.length - 1].timestamp),
          startMood,
          endMood,
        };
      }
    }
  }
  
  // Consistency score
  const consistencyPercentage = Math.min(100, Math.round((daysJournaled / daysInMonth) * 100));
  let grade = 'F';
  if (consistencyPercentage >= 90) grade = 'A+';
  else if (consistencyPercentage >= 85) grade = 'A';
  else if (consistencyPercentage >= 80) grade = 'A-';
  else if (consistencyPercentage >= 75) grade = 'B+';
  else if (consistencyPercentage >= 70) grade = 'B';
  else if (consistencyPercentage >= 65) grade = 'B-';
  else if (consistencyPercentage >= 60) grade = 'C+';
  else if (consistencyPercentage >= 55) grade = 'C';
  else if (consistencyPercentage >= 50) grade = 'C-';
  else if (consistencyPercentage >= 40) grade = 'D';
  
  return {
    ...baseStats,
    totalWords,
    totalCharacters,
    daysJournaled,
    daysMissed,
    longestStreak,
    mostActiveDay: mostActiveDay ? { day: mostActiveDay.day, count: mostActiveDay.count } : undefined,
    dayOfWeekBreakdown,
    wordCloud,
    emotionEvolution,
    consistencyScore: { grade, percentage: consistencyPercentage },
    transformationMoment,
  };
}

export function calculateYearlyStats(entries: JournalEntry[]): MoodWrapStats {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  
  const yearEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= yearStart && entryDate <= yearEnd;
  });

  const baseStats = calculateStats(yearEntries, yearStart, yearEnd);
  
  // Calculate yearly-specific metrics
  const totalWords = yearEntries.reduce((sum, entry) => {
    return sum + entry.content.split(/\s+/).filter(word => word.length > 0).length;
  }, 0);
  
  const totalCharacters = yearEntries.reduce((sum, entry) => sum + entry.content.length, 0);
  
  // Calculate unique days journaled
  const uniqueDays = new Set(
    yearEntries.map(entry => {
      const d = new Date(entry.timestamp);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  const daysJournaled = uniqueDays.size;
  const daysInYear = 365;
  const daysMissed = daysInYear - daysJournaled;
  
  // Calculate longest streak
  const sortedEntries = [...yearEntries].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  let longestStreak = 0;
  let currentStreak = 0;
  let lastDate: string | null = null;
  let streakStartDate: Date | null = null;
  let streakEndDate: Date | null = null;
  let currentStreakStart: Date | null = null;
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.timestamp);
    const dateStr = `${entryDate.getFullYear()}-${entryDate.getMonth()}-${entryDate.getDate()}`;
    
    if (lastDate === null) {
      currentStreak = 1;
      currentStreakStart = entryDate;
    } else {
      const last = new Date(lastDate);
      const diffDays = Math.floor((entryDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          streakStartDate = currentStreakStart;
          streakEndDate = new Date(last);
        }
        currentStreak = 1;
        currentStreakStart = entryDate;
      }
    }
    lastDate = dateStr;
  }
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
    streakStartDate = currentStreakStart;
    streakEndDate = sortedEntries.length > 0 ? new Date(sortedEntries[sortedEntries.length - 1].timestamp) : null;
  }
  
  // Top 3 emotions (podium)
  const top3Emotions = baseStats.moodBreakdown.slice(0, 3);
  
  // Month-by-month breakdown
  const monthlyBreakdown = new Map<string, { entries: JournalEntry[]; topMood: Mood | null }>();
  yearEntries.forEach(entry => {
    const monthKey = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!monthlyBreakdown.has(monthKey)) {
      monthlyBreakdown.set(monthKey, { entries: [], topMood: null });
    }
    monthlyBreakdown.get(monthKey)!.entries.push(entry);
  });
  
  // Calculate top mood for each month
  monthlyBreakdown.forEach((data, _month) => {
    const moodCounts = new Map<string, number>();
    data.entries.forEach(e => {
      moodCounts.set(e.mood.id, (moodCounts.get(e.mood.id) || 0) + 1);
    });
    const topMoodId = Array.from(moodCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    data.topMood = MOODS.find(m => m.id === topMoodId) || null;
  });
  
  // Find most transformative month
  const monthlyData = Array.from(monthlyBreakdown.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => {
      const aDate = new Date(a.month);
      const bDate = new Date(b.month);
      return aDate.getTime() - bDate.getTime();
    });
  
  let mostTransformativeMonth: { month: string; entries: JournalEntry[]; topMood: Mood | null } | null = null;
  if (monthlyData.length >= 2) {
    // Find month with most entries or significant mood shift
    mostTransformativeMonth = monthlyData.reduce((max, current) => 
      current.entries.length > max.entries.length ? current : max
    );
  }
  
  // Find peak happiness month
  const happyMoods = ['happy', 'grateful', 'excited', 'calm'];
  let peakHappinessMonth: { month: string; entries: JournalEntry[]; count: number } | null = null;
  let maxHappyCount = 0;
  
  monthlyData.forEach(({ month, entries }) => {
    const happyCount = entries.filter(e => happyMoods.includes(e.mood.id)).length;
    if (happyCount > maxHappyCount) {
      maxHappyCount = happyCount;
      peakHappinessMonth = { month, entries, count: happyCount };
    }
  });
  
  // Find hardest month (most negative emotions)
  const negativeMoods = ['sad', 'anxious', 'overwhelmed'];
  let hardestMonth: { month: string; entries: JournalEntry[]; count: number } | null = null;
  let maxNegativeCount = 0;
  
  monthlyData.forEach(({ month, entries }) => {
    const negativeCount = entries.filter(e => negativeMoods.includes(e.mood.id)).length;
    if (negativeCount > maxNegativeCount && entries.length >= 3) {
      maxNegativeCount = negativeCount;
      hardestMonth = { month, entries, count: negativeCount };
    }
  });
  
  // Word cloud for the year
  const wordCounts = new Map<string, number>();
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can']);
  
  yearEntries.forEach(entry => {
    const words = entry.content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
  });
  
  const wordCloud = Array.from(wordCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Gratitude counter
  const gratitudeCount = yearEntries.filter(e => e.mood.id === 'grateful').length;
  
  // Most reflective entry (longest entry)
  const mostReflectiveEntry = yearEntries.reduce((longest, current) => 
    current.content.length > longest.content.length ? current : longest,
    yearEntries[0] || { content: '', timestamp: new Date(), mood: MOODS[0], id: '', position: { x: 0, y: 0, z: 0 } }
  );
  
  // Emotional growth (compare first quarter vs last quarter)
  const firstQuarter = sortedEntries.slice(0, Math.ceil(sortedEntries.length / 4));
  const lastQuarter = sortedEntries.slice(-Math.ceil(sortedEntries.length / 4));
  
  const firstQuarterMoods = new Map<string, number>();
  firstQuarter.forEach(e => firstQuarterMoods.set(e.mood.id, (firstQuarterMoods.get(e.mood.id) || 0) + 1));
  const firstTopMood = Array.from(firstQuarterMoods.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  
  const lastQuarterMoods = new Map<string, number>();
  lastQuarter.forEach(e => lastQuarterMoods.set(e.mood.id, (lastQuarterMoods.get(e.mood.id) || 0) + 1));
  const lastTopMood = Array.from(lastQuarterMoods.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  
  // Consistency score
  const consistencyPercentage = Math.min(100, Math.round((daysJournaled / daysInYear) * 100));
  let grade = 'F';
  if (consistencyPercentage >= 90) grade = 'A+';
  else if (consistencyPercentage >= 85) grade = 'A';
  else if (consistencyPercentage >= 80) grade = 'A-';
  else if (consistencyPercentage >= 75) grade = 'B+';
  else if (consistencyPercentage >= 70) grade = 'B';
  else if (consistencyPercentage >= 65) grade = 'B-';
  else if (consistencyPercentage >= 60) grade = 'C+';
  else if (consistencyPercentage >= 55) grade = 'C';
  else if (consistencyPercentage >= 50) grade = 'C-';
  else if (consistencyPercentage >= 40) grade = 'D';
  
  // Calculate percentile (simplified - top 15% if >80% consistency)
  const percentile = consistencyPercentage >= 80 ? 15 : consistencyPercentage >= 60 ? 30 : consistencyPercentage >= 40 ? 50 : 75;
  
  return {
    ...baseStats,
    totalWords,
    totalCharacters,
    daysJournaled,
    daysMissed,
    longestStreak,
    wordCloud,
    consistencyScore: { grade, percentage: consistencyPercentage },
    // Yearly-specific
    top3Emotions: top3Emotions,
    monthlyBreakdown: Array.from(monthlyBreakdown.entries()).map(([month, data]) => ({ month, ...data })),
    mostTransformativeMonth,
    peakHappinessMonth,
    hardestMonth,
    gratitudeCount,
    mostReflectiveEntry: mostReflectiveEntry.content ? mostReflectiveEntry : null,
    emotionalGrowth: firstTopMood && lastTopMood ? {
      startMood: MOODS.find(m => m.id === firstTopMood) || MOODS[0],
      endMood: MOODS.find(m => m.id === lastTopMood) || MOODS[0],
    } : null,
    percentile,
    streakDates: streakStartDate && streakEndDate ? { start: streakStartDate, end: streakEndDate } : null,
  };
}

function calculateStats(
  entries: JournalEntry[],
  startDate: Date,
  endDate: Date
): MoodWrapStats {
  const totalEntries = entries.length;

  // Count moods
  const moodCounts = new Map<string, number>();
  entries.forEach(entry => {
    const moodId = entry.mood.id;
    moodCounts.set(moodId, (moodCounts.get(moodId) || 0) + 1);
  });

  // Find top mood
  let topMood: Mood | null = null;
  let maxCount = 0;
  moodCounts.forEach((count, moodId) => {
    if (count > maxCount) {
      maxCount = count;
      topMood = MOODS.find(m => m.id === moodId) || null;
    }
  });

  // Create breakdown
  const moodBreakdown: { mood: Mood; count: number; percentage: number }[] = [];
  moodCounts.forEach((count, moodId) => {
    const mood = MOODS.find(m => m.id === moodId);
    if (mood) {
      moodBreakdown.push({
        mood,
        count,
        percentage: totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0,
      });
    }
  });
  moodBreakdown.sort((a, b) => b.count - a.count);

  // Find peak day (happiest/calmest entry)
  const positiveMoods: string[] = ['happy', 'calm', 'grateful', 'excited'];
  const positiveEntries = entries.filter(e => positiveMoods.includes(e.mood.id));
  const peakEntry = positiveEntries.length > 0
    ? positiveEntries.sort((a, b) => {
        const aScore = positiveMoods.indexOf(a.mood.id);
        const bScore = positiveMoods.indexOf(b.mood.id);
        return aScore - bScore; // Lower index = more positive
      })[0]
    : null;

  const peakDay = peakEntry
    ? {
        date: new Date(peakEntry.timestamp),
        mood: peakEntry.mood,
        entry: peakEntry,
      }
    : null;

  // Generate insights
  const insights: string[] = [];
  if (topMood !== null) {
    const currentMood: Mood = topMood;
    const moodId = currentMood.id;
    if (moodId === 'calm') {
      insights.push("You've been finding your center this week 🌊");
    } else if (moodId === 'happy') {
      insights.push("Joy has been your companion ✨");
    } else if (moodId === 'grateful') {
      insights.push("Gratitude is flowing through you 🙏");
    } else if (moodId === 'reflective') {
      insights.push("You're taking time to understand yourself 🤔");
    } else {
      insights.push(`You've been feeling mostly ${currentMood.name.toLowerCase()}`);
    }
  }

  if (totalEntries >= 5) {
    insights.push("You're building a beautiful journaling habit 📔");
  }

  // Generate goal
  let goal = "Keep writing! Every entry matters 💫";
  const topMoodId = topMood !== null ? (topMood as Mood).id : undefined;
  if (topMoodId === 'anxious' || topMoodId === 'overwhelmed') {
    goal = "Try morning meditation or breathing exercises 🧘";
  } else if (topMoodId === 'sad') {
    goal = "Consider reaching out to someone you trust 💙";
  } else if (totalEntries < 3) {
    goal = "Aim for 3 entries this week to build consistency 📝";
  }

  return {
    totalEntries,
    topMood,
    moodBreakdown,
    dateRange: { start: startDate, end: endDate },
    peakDay,
    insights,
    goal,
  };
}

