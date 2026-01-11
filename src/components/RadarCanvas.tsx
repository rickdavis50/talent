import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CategoryScore } from '../types';

const RING_LEVELS = [20, 40, 60, 80, 100];
const WEAK_THRESHOLD = 80;

type RadarCanvasProps = {
  scores: CategoryScore[];
};

const getPoints = (scores: CategoryScore[], radius: number) => {
  const angleStep = (Math.PI * 2) / scores.length;
  return scores.map((score, index) => {
    const angle = -Math.PI / 2 + index * angleStep;
    const value = score.score / 100;
    return {
      x: Math.cos(angle) * radius * value,
      y: Math.sin(angle) * radius * value,
    };
  });
};

const getRadius = (size: number) => {
  const center = size / 2;
  const padding = Math.max(28, size * 0.08);
  return center - padding;
};

const splitLabel = (text: string) => {
  if (text.length <= 12) return [text];
  if (text.includes('-')) {
    const parts = text.split('-');
    if (parts.length >= 2) {
      const first = parts.slice(0, 2).join('-');
      const rest = parts.slice(2).join('-');
      return rest ? [first, rest] : [first];
    }
  }
  if (text.includes(' ')) {
    const parts = text.split(' ');
    if (parts.length >= 2) {
      return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
    }
  }
  return [text];
};

const withAlpha = (color: string, alpha: number) => {
  const value = color.trim();
  if (value.startsWith('rgb')) {
    const numbers = value
      .replace(/rgba?\(/, '')
      .replace(')', '')
      .split(',')
      .map((chunk) => parseFloat(chunk.trim()))
      .filter((num) => Number.isFinite(num));
    if (numbers.length >= 3) {
      const [r, g, b] = numbers;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  const clean = value.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(255, 227, 162, ${alpha})`;
};

const drawRadar = (
  ctx: CanvasRenderingContext2D,
  size: number,
  scores: CategoryScore[],
  points: { x: number; y: number }[],
  goodColor: string,
  badColor: string,
  iconImages: Array<HTMLImageElement | undefined>
) => {
  const center = size / 2;
  const radius = getRadius(size);

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(center, center);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  RING_LEVELS.forEach((level) => {
    ctx.beginPath();
    const ringRadius = (radius * level) / 100;
    scores.forEach((_score, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / scores.length;
      const x = Math.cos(angle) * ringRadius;
      const y = Math.sin(angle) * ringRadius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  });

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  scores.forEach((_score, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / scores.length;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.stroke();
  });

  if (points.length) {
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fillStyle = withAlpha(goodColor, 0.22);
    ctx.fill();
  }

  if (points.length) {
    points.forEach((point, index) => {
      const score = scores[index];
      if (!score || score.score > WEAK_THRESHOLD) return;
      const prevPoint = points[(index - 1 + points.length) % points.length];
      const nextPoint = points[(index + 1) % points.length];
      const midPrev = {
        x: (prevPoint.x + point.x) / 2,
        y: (prevPoint.y + point.y) / 2,
      };
      const midNext = {
        x: (nextPoint.x + point.x) / 2,
        y: (nextPoint.y + point.y) / 2,
      };
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(midPrev.x, midPrev.y);
      ctx.lineTo(point.x, point.y);
      ctx.lineTo(midNext.x, midNext.y);
      ctx.closePath();
      ctx.clip();
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, withAlpha(badColor, 0));
      gradient.addColorStop(1, withAlpha(badColor, 0.25));
      ctx.fillStyle = gradient;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    });
  }

  if (points.length) {
    ctx.lineWidth = 2;
    points.forEach((point, index) => {
      const nextPoint = points[(index + 1) % points.length];
      const startScore = scores[index]?.score ?? 0;
      const endScore = scores[(index + 1) % scores.length]?.score ?? 0;
      const startColor = startScore > WEAK_THRESHOLD ? goodColor : badColor;
      const endColor = endScore > WEAK_THRESHOLD ? goodColor : badColor;
      const gradient = ctx.createLinearGradient(point.x, point.y, nextPoint.x, nextPoint.y);
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(1, endColor);
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(nextPoint.x, nextPoint.y);
      ctx.stroke();
    });
  }

  scores.forEach((score, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / scores.length;
    const labelRadius = radius + 14;
    const x = Math.cos(angle) * labelRadius;
    const y = Math.sin(angle) * labelRadius;
    const icon = iconImages[index];
    if (icon && icon.complete && icon.naturalWidth > 0) {
      const size = 18;
      ctx.drawImage(icon, x - size / 2, y - size / 2, size, size);
      return;
    }

    ctx.fillStyle = 'rgba(240, 240, 240, 0.78)';
    ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
    const lines = splitLabel(score.name);
    ctx.save();
    ctx.translate(x, y);
    ctx.textAlign = x > 0 ? 'left' : x < 0 ? 'right' : 'center';
    ctx.textBaseline = 'middle';
    const lineHeight = 12;
    const startY = -((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, lineIndex) => {
      ctx.fillText(line, 0, startY + lineIndex * lineHeight);
    });
    ctx.restore();
  });

  ctx.restore();
};

const RadarCanvas: React.FC<RadarCanvasProps> = ({ scores }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const previousPoints = useRef<{ x: number; y: number }[]>([]);
  const goodColorRef = useRef('#ffe3a2');
  const badColorRef = useRef('#ed0f94');
  const iconCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [iconVersion, setIconVersion] = useState(0);

  const targetPoints = useMemo(() => {
    const radius = sizeRef.current ? getRadius(sizeRef.current) : 0;
    return getPoints(scores, radius);
  }, [scores]);

  const iconImages = useMemo(
    () =>
      scores.map((score) => {
        if (!score.iconSrc) return undefined;
        const cached = iconCache.current.get(score.iconSrc);
        if (cached) return cached;
        const image = new Image();
        image.src = score.iconSrc;
        image.onload = () => setIconVersion((prev) => prev + 1);
        iconCache.current.set(score.iconSrc, image);
        return image;
      }),
    [scores, iconVersion]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const resolved = Math.min(rect.width, rect.height || rect.width);
      const size = resolved > 0 ? resolved : 320;
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = size;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const radius = getRadius(size);
      const points = getPoints(scores, radius);
      previousPoints.current = points;
      const computed = getComputedStyle(document.documentElement);
      const good = computed.getPropertyValue('--color-accent').trim() || '#ffe3a2';
      const bad = computed.getPropertyValue('--color-danger').trim() || '#ed0f94';
      goodColorRef.current = good;
      badColorRef.current = bad;
      drawRadar(ctx, size, scores, points, goodColorRef.current, badColorRef.current, iconImages);
    };

    resize();
    const frame = requestAnimationFrame(resize);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement as Element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [scores, iconImages]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startPoints = previousPoints.current.length
      ? previousPoints.current
      : targetPoints;
    const endPoints = targetPoints;

    const start = performance.now();
    const duration = 150;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress * (2 - progress);
      const current = startPoints.map((point, index) => ({
        x: point.x + (endPoints[index].x - point.x) * eased,
        y: point.y + (endPoints[index].y - point.y) * eased,
      }));
      drawRadar(ctx, sizeRef.current, scores, current, goodColorRef.current, badColorRef.current, iconImages);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousPoints.current = endPoints;
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [scores, targetPoints, iconImages]);

  return (
    <div className="relative w-full aspect-square">
      <canvas ref={canvasRef} className="w-full h-full" aria-label="Radar chart" role="img" />
    </div>
  );
};

export default RadarCanvas;
