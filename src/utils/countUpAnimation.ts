/**
 * Utility for animating numbers counting up
 */

export interface CountUpOptions {
  duration?: number;
  startValue?: number;
  easing?: (t: number) => number;
  onUpdate?: (value: number) => void;
}

/**
 * Animate a number from start to end value
 */
export function animateCountUp(
  start: number,
  end: number,
  callback: (value: number) => void,
  options: CountUpOptions = {}
): () => void {
  const {
    duration = 1500,
    startValue = start,
    easing = (t: number) => t * (2 - t), // ease-out
    onUpdate,
  } = options;

  let startTime: number | null = null;
  let animationFrameId: number | null = null;
  let cancelled = false;

  const animate = (currentTime: number) => {
    if (cancelled) return;

    if (startTime === null) {
      startTime = currentTime;
    }

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);

    const currentValue = Math.floor(startValue + (end - startValue) * easedProgress);
    callback(currentValue);

    if (onUpdate) {
      onUpdate(currentValue);
    }

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      callback(end); // Ensure final value is set
    }
  };

  animationFrameId = requestAnimationFrame(animate);

  // Return cancel function
  return () => {
    cancelled = true;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format percentage
 */
export function formatPercentage(num: number, decimals: number = 0): string {
  return `${num.toFixed(decimals)}%`;
}

