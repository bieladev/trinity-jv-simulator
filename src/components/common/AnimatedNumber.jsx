import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, easeOutCubic, isInViewport, observeOnce, prefersReducedMotion } from '../../utils/motion';

const countDecimals = (n) => {
  if (!Number.isFinite(n) || Number.isInteger(n)) return 0;
  const s = String(n);
  const i = s.indexOf('.');
  return i === -1 ? 0 : s.length - i - 1;
};

const roundTo = (n, d) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

// Counts from the previous value to the new one with an ease-out cubic.
// `format` is the existing formatter: at rest the element shows exactly
// format(value), the same string the app showed before. In-between frames
// are format(rounded value), rounded to the target's decimals (max 2).
//
// On mount the number counts up from `from` (default 0) — immediately when
// it is on screen, otherwise when it first scrolls into view (until then it
// shows the final value, so off-screen reads, print and PDF are correct).
// With reduced motion it always shows the final value.
// `delay` (ms, mount count only) holds the start value for that long first,
// so a number can wait for the element around it to finish its entrance.
function AnimatedNumber({ value, format = String, duration = motion.duration.count, from = 0, delay = 0, animateOnMount = true, className, ...rest }) {
  const target = Number(value);
  const finalText = format(value);
  const [frameText, setFrameText] = useState(null); // null = at rest
  const ref = useRef(null);
  const rafRef = useRef(0);
  const shownRef = useRef(target); // numeric value currently on screen
  const prevTargetRef = useRef(target);
  const formatRef = useRef(format);
  formatRef.current = format;

  const delayRef = useRef(0);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (delayRef.current) clearTimeout(delayRef.current);
    delayRef.current = 0;
  };

  const run = (start, end, ms) => {
    stop();
    if (prefersReducedMotion() || !Number.isFinite(start) || !Number.isFinite(end) || start === end) {
      shownRef.current = end;
      setFrameText(null);
      return;
    }
    const decimals = Math.min(2, countDecimals(end));
    const t0 = performance.now();
    shownRef.current = start;
    setFrameText(formatRef.current(roundTo(start, decimals)));
    const tick = (now) => {
      // rAF timestamps can precede t0 (frame start): clamp so it never overshoots.
      const p = Math.min(1, Math.max(0, (now - t0) / ms));
      if (p >= 1) {
        shownRef.current = end;
        rafRef.current = 0;
        setFrameText(null);
        return;
      }
      const v = start + (end - start) * easeOutCubic(p);
      shownRef.current = v;
      setFrameText(formatRef.current(roundTo(v, decimals)));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // Mount: count up from `from`, now or when first seen.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!animateOnMount || !el || prefersReducedMotion() || !Number.isFinite(target)) return undefined;
    const start = () => {
      if (!(delay > 0)) {
        run(from, prevTargetRef.current, duration);
        return;
      }
      stop();
      shownRef.current = from;
      setFrameText(formatRef.current(roundTo(from, Math.min(2, countDecimals(prevTargetRef.current)))));
      delayRef.current = setTimeout(() => {
        delayRef.current = 0;
        run(from, prevTargetRef.current, duration);
      }, delay);
    };
    if (isInViewport(el)) {
      start();
      return stop;
    }
    const unobserve = observeOnce(el, start);
    return () => {
      unobserve();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Value changed: count from what is on screen now to the new value.
  useEffect(() => {
    if (prevTargetRef.current === target) return;
    prevTargetRef.current = target;
    run(shownRef.current, target, duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => stop, []);

  return (
    <span ref={ref} className={className ? `anum ${className}` : 'anum'} data-final={finalText} {...rest}>
      <span>{frameText ?? finalText}</span>
    </span>
  );
}

export default AnimatedNumber;
