import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CategoryScore } from '../types';

const RING_LEVELS = [20, 40, 60, 80, 100];
const WEAK_THRESHOLD = 75;

type RadarSeries = {
  id: string;
  scores: CategoryScore[];
  tone: 'individual' | 'manager';
};

type RadarCanvasProps = {
  scores: CategoryScore[];
  datasets?: RadarSeries[];
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

const drawRadarSeries = (
  ctx: CanvasRenderingContext2D,
  size: number,
  scores: CategoryScore[],
  points: { x: number; y: number }[],
  tone: RadarSeries['tone'],
  colors: { accent: string; danger: string; muted: string },
  forceOriginal: boolean
) => {
  if (!points.length) return;
  const radius = getRadius(size);
  const isManager = tone === 'manager';
  const useOriginal = forceOriginal || isManager;
  const strokeColor = useOriginal ? colors.accent : withAlpha(colors.muted, 0.85);
  const fillColor = useOriginal ? withAlpha(colors.accent, 0.22) : withAlpha(colors.muted, 0.08);

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  if (useOriginal) {
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
      gradient.addColorStop(0, withAlpha(colors.danger, 0));
      gradient.addColorStop(1, withAlpha(colors.danger, 0.25));
      ctx.fillStyle = gradient;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    });
  }

  ctx.lineWidth = useOriginal ? 2 : 1;
  if (useOriginal) {
    points.forEach((point, index) => {
      const nextPoint = points[(index + 1) % points.length];
      const startScore = scores[index]?.score ?? 0;
      const endScore = scores[(index + 1) % scores.length]?.score ?? 0;
      const startColor = startScore > WEAK_THRESHOLD ? colors.accent : colors.danger;
      const endColor = endScore > WEAK_THRESHOLD ? colors.accent : colors.danger;
      const gradient = ctx.createLinearGradient(point.x, point.y, nextPoint.x, nextPoint.y);
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(1, endColor);
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(nextPoint.x, nextPoint.y);
      ctx.stroke();
    });
  } else {
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.stroke();
  }
};

const drawRadar = (
  ctx: CanvasRenderingContext2D,
  size: number,
  labelScores: CategoryScore[],
  datasets: RadarSeries[],
  pointsList: Array<{ x: number; y: number }[]>,
  colors: { accent: string; danger: string; muted: string },
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
    labelScores.forEach((_score, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / labelScores.length;
      const x = Math.cos(angle) * ringRadius;
      const y = Math.sin(angle) * ringRadius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  });

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  labelScores.forEach((_score, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / labelScores.length;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.stroke();
  });

  datasets.forEach((dataset, index) => {
    const points = pointsList[index] ?? [];
    drawRadarSeries(
      ctx,
      size,
      dataset.scores,
      points,
      dataset.tone,
      colors,
      datasets.length === 1
    );
  });

  labelScores.forEach((score, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / labelScores.length;
    const labelRadius = radius + 14;
    const x = Math.cos(angle) * labelRadius;
    const y = Math.sin(angle) * labelRadius;
    const icon = iconImages[index];
    if (icon && icon.complete && icon.naturalWidth > 0) {
      const targetSize = 18;
      const ratio = icon.naturalWidth / icon.naturalHeight;
      const width = ratio >= 1 ? targetSize : targetSize * ratio;
      const height = ratio >= 1 ? targetSize / ratio : targetSize;
      ctx.drawImage(icon, x - width / 2, y - height / 2, width, height);
      return;
    }

    ctx.fillStyle = 'rgba(240, 240, 240, 0.78)';
    ctx.font = '11px "Inter", "Helvetica Neue", Arial, sans-serif';
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

const RadarCanvas: React.FC<RadarCanvasProps> = ({ scores, datasets }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const previousPoints = useRef<Array<{ x: number; y: number }[]>>([]);
  const goodColorRef = useRef('#ffe3a2');
  const badColorRef = useRef('#ed0f94');
  const mutedColorRef = useRef('#a1a1a1');
  const iconCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [iconVersion, setIconVersion] = useState(0);

  const resolvedDatasets = useMemo(() => {
    if (datasets && datasets.length) return datasets;
    return [{ id: 'primary', scores, tone: 'manager' as const }];
  }, [datasets, scores]);

  const labelScores = resolvedDatasets[0]?.scores ?? scores;

  const targetPoints = useMemo(() => {
    const radius = sizeRef.current ? getRadius(sizeRef.current) : getRadius(320);
    return resolvedDatasets.map((dataset) => getPoints(dataset.scores, radius));
  }, [resolvedDatasets]);

  const iconImages = useMemo(
    () =>
      labelScores.map((score) => {
        if (!score.iconSrc) return undefined;
        const cached = iconCache.current.get(score.iconSrc);
        if (cached) return cached;
        const image = new Image();
        image.src = score.iconSrc;
        image.onload = () => setIconVersion((prev) => prev + 1);
        iconCache.current.set(score.iconSrc, image);
        return image;
      }),
    [labelScores, iconVersion]
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
      const pointsList = resolvedDatasets.map((dataset) => getPoints(dataset.scores, radius));
      previousPoints.current = pointsList;
      const computed = getComputedStyle(document.documentElement);
      goodColorRef.current = computed.getPropertyValue('--color-accent').trim() || '#ffe3a2';
      badColorRef.current = computed.getPropertyValue('--color-danger').trim() || '#ed0f94';
      mutedColorRef.current = computed.getPropertyValue('--color-muted').trim() || '#a1a1a1';
      drawRadar(ctx, size, labelScores, resolvedDatasets, pointsList, {
        accent: goodColorRef.current,
        danger: badColorRef.current,
        muted: mutedColorRef.current,
      }, iconImages);
    };

    resize();
    const frame = requestAnimationFrame(resize);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement as Element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [resolvedDatasets, labelScores, iconImages]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startPoints =
      previousPoints.current.length === targetPoints.length
        ? previousPoints.current
        : targetPoints;
    const endPoints = targetPoints;

    const start = performance.now();
    const duration = 150;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress * (2 - progress);
      const currentPoints = endPoints.map((seriesPoints, seriesIndex) => {
        const startSeries = startPoints[seriesIndex] ?? seriesPoints;
        return seriesPoints.map((point, index) => {
          const startPoint = startSeries[index] ?? point;
          return {
            x: startPoint.x + (point.x - startPoint.x) * eased,
            y: startPoint.y + (point.y - startPoint.y) * eased,
          };
        });
      });
      const size = sizeRef.current || 320;
      drawRadar(ctx, size, labelScores, resolvedDatasets, currentPoints, {
        accent: goodColorRef.current,
        danger: badColorRef.current,
        muted: mutedColorRef.current,
      }, iconImages);
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
  }, [targetPoints, labelScores, resolvedDatasets, iconImages]);

  return (
    <div className="relative w-full aspect-square">
      <canvas ref={canvasRef} className="w-full h-full" aria-label="Radar chart" role="img" />
    </div>
  );
};

export default RadarCanvas;
