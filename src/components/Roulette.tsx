import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export type SkinItem = {
  id: string;
  name: string;
  rarity: string;
  rarityLabel?: string;
  image: string;
  isKnife?: boolean;
};

type RouletteProps = {
  items: SkinItem[];
  targetItemId: string | null;
  spinToken: number;
  onSpinStart: () => void;
  onSpinEnd: (item: SkinItem) => void;
};

const REPEAT_COUNT = 14;
const BASE_REPEAT_INDEX = Math.floor(REPEAT_COUNT / 2);
const STOP_HIT_RATIO = 0.5;

function easeOutQuint(t: number): number {
  return 1 - (1 - t) ** 5;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function Roulette({ items, targetItemId, spinToken, onSpinStart, onSpinEnd }: RouletteProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const lastProcessedSpinTokenRef = useRef(0);
  const onSpinStartRef = useRef(onSpinStart);
  const onSpinEndRef = useRef(onSpinEnd);
  const xRef = useRef(0);
  const cardWidthRef = useRef(0);
  const pitchRef = useRef(0);
  const centerRef = useRef(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const sequence = useMemo(
    () => Array.from({ length: REPEAT_COUNT * items.length }, (_, i) => items[i % items.length]),
    [items],
  );

  const applyX = (x: number) => {
    xRef.current = x;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
    }
  };

  const getApproxIndex = () => {
    const pitch = pitchRef.current;
    const center = centerRef.current;
    if (!pitch || !center) return 0;
    const currentCenter = -xRef.current + center;
    return currentCenter / pitch - 0.5;
  };

  const normalizeTrackPosition = () => {
    const pitch = pitchRef.current;
    const center = centerRef.current;
    const cardWidth = cardWidthRef.current;
    if (!pitch || !center || !cardWidth || !items.length) return;

    const rawIndex = Math.round(getApproxIndex());
    const wrappedIndex = ((rawIndex % items.length) + items.length) % items.length;
    const normalizedIndex = BASE_REPEAT_INDEX * items.length + wrappedIndex;
    const normalizedCenter = normalizedIndex * pitch + cardWidth * 0.5;
    applyX(center - normalizedCenter);
  };

  useLayoutEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track || !track.children.length) return;

      const first = track.children[0] as HTMLElement;
      const firstRect = first.getBoundingClientRect();
      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap) || 14;

      cardWidthRef.current = firstRect.width;
      pitchRef.current = firstRect.width + gap;
      centerRef.current = viewport.clientWidth * 0.5;

      const initialIndex = BASE_REPEAT_INDEX * items.length;
      const targetCenter = initialIndex * pitchRef.current + cardWidthRef.current * 0.5;
      applyX(centerRef.current - targetCenter);
    };

    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, [items.length]);

  useEffect(() => {
    onSpinStartRef.current = onSpinStart;
    onSpinEndRef.current = onSpinEnd;
  }, [onSpinStart, onSpinEnd]);

  useEffect(() => {
    if (!targetItemId || !spinToken) return;
    if (!trackRef.current || !viewportRef.current) return;
    if (lastProcessedSpinTokenRef.current === spinToken) return;

    const cardWidth = cardWidthRef.current;
    const pitch = pitchRef.current;
    const center = centerRef.current;

    if (!cardWidth || !pitch || !center) return;

    const targetItemIndex = items.findIndex((item) => item.id === targetItemId);
    if (targetItemIndex === -1) return;

    normalizeTrackPosition();

    const currentCenter = -xRef.current + center;
    const approxIndex = currentCenter / pitch - 0.5;
    // Keep apparent speed close to the original by shortening both distance and duration ~25%.
    const extraCycles = Math.random() < 0.75 ? 2 : 3;
    const cycleStart = Math.ceil(approxIndex / items.length) * items.length + items.length * extraCycles;
    const targetIndex = cycleStart + targetItemIndex;

    const targetCardHitPoint = targetIndex * pitch + cardWidth * STOP_HIT_RATIO;
    const toX = center - targetCardHitPoint;
    const fromX = xRef.current;
    const duration = (3400 + Math.floor(Math.random() * 1400)) * 2.25;
    lastProcessedSpinTokenRef.current = spinToken;
    const isKnifeFinish = targetItemId === 'knife-win';

    setIsSpinning(true);
    onSpinStartRef.current();

    let rafId = 0;
    let cancelled = false;

    const animateSegment = (
      startX: number,
      endX: number,
      segmentDuration: number,
      easing: (t: number) => number = easeOutQuint,
    ) =>
      new Promise<void>((resolve) => {
        const startedAt = performance.now();
        const tick = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }

          const progress = Math.min((now - startedAt) / segmentDuration, 1);
          const eased = easing(progress);
          applyX(startX + (endX - startX) * eased);

          if (progress < 1) {
            rafId = requestAnimationFrame(tick);
            return;
          }

          resolve();
        };

        rafId = requestAnimationFrame(tick);
      });

    const finishSpin = () => {
      if (cancelled) return;
      setIsSpinning(false);
      onSpinEndRef.current(items[targetItemIndex]);
    };

    const runSpin = async () => {
      if (isKnifeFinish) {
        await animateSegment(fromX, toX, duration, easeOutQuint);
        applyX(toX);
        finishSpin();
        return;
      }

      await animateSegment(fromX, toX, duration, easeOutCubic);
      applyX(toX);
      finishSpin();
    };

    void runSpin();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [items, spinToken, targetItemId]);

  return (
    <section className="panel roulette-wrap">
      <div className="roulette-viewport" ref={viewportRef}>
        <div className={`roulette-track ${isSpinning ? 'is-spinning' : ''}`} ref={trackRef}>
          {sequence.map((item, index) => (
            (() => {
              const [weaponPart, skinPart] = item.name.split('|').map((part) => part.trim());
              const weaponLabel = skinPart ? weaponPart.toUpperCase() : (item.rarityLabel ?? '').toUpperCase();
              const skinLabel = skinPart ?? weaponPart;

              return (
                <article
                  key={`${item.id}-${index}`}
                  className={`roulette-item ${item.isKnife ? 'knife' : ''}`}
                  data-rarity={item.rarity.toLowerCase()}
                >
                  <div className="roulette-media">
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>
                  <p className="roulette-weapon">{weaponLabel}</p>
                  <p className="roulette-skin">{skinLabel}</p>
                </article>
              );
            })()
          ))}
        </div>
      </div>
      <div className="center-marker" aria-hidden="true" />
    </section>
  );
}
