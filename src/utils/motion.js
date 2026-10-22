import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

// Motion tokens: the single source for every duration, easing, distance and
// stagger in the app (CSS keyframes, MUI transitions, Recharts and the
// count-up hook all read from here). Documented in design_planning.md.
export const motion = {
  duration: {
    press: 100, // button press travel
    fast: 150, // colour / chevron / small state changes
    base: 200, // hover lift, shadows
    medium: 250, // tab indicator, chart-tab fade, exit-marker fade
    screen: 280, // screen-to-screen transition
    collapse: 280, // optional-feature panels and FAQ expand
    reveal: 420, // staggered entrance of cards and sections
    countFast: 240, // live slider / input value labels
    count: 800, // big-number count-up
    chart: 800, // Recharts draw-in
  },
  easing: {
    // Decelerating curve for everything that enters or settles.
    out: 'cubic-bezier(0.2, 0, 0, 1)',
    // CSS twin of easeOutCubic below (count-up).
    outCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
    // Symmetric curve for things that leave or collapse.
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    chart: 'ease-out', // Recharts accepts named easings only
  },
  stagger: 60, // ms between siblings in a grid or list
  staggerMaxSteps: 6, // later siblings share the last delay
  distance: { rise: 8, reveal: 12, screen: 12, lift: 2, press: 1 }, // px
  // Reveal as soon as any pixel is on screen: nothing visible stays hidden.
  revealRootMargin: '0px',
};

export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export const staggerDelay = (index = 0, offset = 0) =>
  `${offset + Math.min(Math.max(0, index), motion.staggerMaxSteps) * motion.stagger}ms`;

// ---------------------------------------------------------------------------
// Reduced motion
// ---------------------------------------------------------------------------
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_QUERY).matches;

const subscribeReduced = (onChange) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener?.('change', onChange);
  return () => mq.removeEventListener?.('change', onChange);
};

export const useReducedMotion = () => useSyncExternalStore(subscribeReduced, prefersReducedMotion, () => false);

// ---------------------------------------------------------------------------
// Shared IntersectionObserver (one observer per rootMargin, many elements)
// ---------------------------------------------------------------------------
const observers = new Map();

export function observeOnce(el, callback, rootMargin = '0px') {
  if (typeof IntersectionObserver === 'undefined') {
    callback();
    return () => {};
  }
  let shared = observers.get(rootMargin);
  if (!shared) {
    const callbacks = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const fn = callbacks.get(entry.target);
        callbacks.delete(entry.target);
        io.unobserve(entry.target);
        if (fn) fn();
      });
    }, { rootMargin, threshold: 0 });
    shared = { io, callbacks };
    observers.set(rootMargin, shared);
  }
  shared.callbacks.set(el, callback);
  shared.io.observe(el);
  return () => {
    shared.callbacks.delete(el);
    shared.io.unobserve(el);
  };
}

export const isInViewport = (el) => {
  if (!el || typeof window === 'undefined') return false;
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
};

// ---------------------------------------------------------------------------
// Staggered entrance
// ---------------------------------------------------------------------------
// Sets data-reveal on the element before first paint:
//   rise    – already on screen: CSS keyframe rise, opacity stays 1
//   pending – below the fold: hidden until the shared observer sees it
//   in      – observed: fade + rise with its stagger delay
//   done    – reduced motion: no animation
// With no JS the attribute is absent and the element is simply visible.
export function useReveal() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion()) {
      el.dataset.reveal = 'done';
      return undefined;
    }
    if (isInViewport(el)) {
      el.dataset.reveal = 'rise';
      return undefined;
    }
    el.dataset.reveal = 'pending';
    const stop = observeOnce(el, () => { el.dataset.reveal = 'in'; }, motion.revealRootMargin);
    return () => {
      stop();
      // StrictMode re-runs the effect; never leave an element hidden.
      if (el.dataset.reveal === 'pending') el.dataset.reveal = 'done';
    };
  }, []);
  return ref;
}

// Props for a reveal element: ref + stagger delay.
export const revealStyle = (index = 0) => ({ '--motion-delay': staggerDelay(index) });

// ---------------------------------------------------------------------------
// Replay a chart's draw-in when it first scrolls into view
// ---------------------------------------------------------------------------
// Returns [ref, key]. Charts already on screen animate on mount; charts
// below the fold render complete (so print and PDF export are never empty)
// and are re-keyed once they enter the viewport, which replays the draw-in.
export function useEnterReplay() {
  const ref = useRef(null);
  const [replayKey, setReplayKey] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isInViewport(el)) return undefined;
    return observeOnce(el, () => setReplayKey((k) => k + 1));
  }, []);
  return [ref, replayKey];
}

// Recharts props shared by every animated series.
export const chartAnimation = (reduced, begin = 0) => ({
  isAnimationActive: !reduced,
  animationBegin: begin,
  animationDuration: motion.duration.chart,
  animationEasing: motion.easing.chart,
});

// ---------------------------------------------------------------------------
// Global CSS (keyframes and utility classes), injected through CssBaseline
// ---------------------------------------------------------------------------
export const motionGlobalStyles = (shadows) => {
  const { duration: d, easing: e, distance: x } = motion;
  const delayed = { animationDelay: 'var(--motion-delay, 0ms)' };
  return {
    '@keyframes motionScreenIn': { from: { opacity: 0, translate: `0 ${x.screen}px` }, to: { opacity: 1, translate: '0 0' } },
    '@keyframes motionRise': { from: { translate: `0 ${x.rise}px` }, to: { translate: '0 0' } },
    '@keyframes motionReveal': { from: { opacity: 0, translate: `0 ${x.reveal}px` }, to: { opacity: 1, translate: '0 0' } },
    '@keyframes motionFade': { from: { opacity: 0 }, to: { opacity: 1 } },
    '@keyframes motionRule': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },

    // Screen change (Overview → Assumptions → Summary/Results). Fill mode
    // "backwards" so no transform lingers after the animation.
    '.motion-screen': { animation: `motionScreenIn ${d.screen}ms ${e.out} backwards` },
    // Above-the-fold rise: pure CSS, opacity 1 on first paint.
    '.motion-rise': { animation: `motionRise ${d.reveal}ms ${e.out} backwards`, ...delayed },
    '.motion-rule::before': { transformOrigin: 'left center', animation: `motionRule ${d.reveal}ms ${e.out} backwards`, ...delayed },
    '.motion-fade': { animation: `motionFade ${d.medium}ms ${e.out} backwards` },
    // Exit-year marker appears once the series has drawn.
    '.motion-chart-marker': { animation: `motionFade ${d.medium}ms ${e.out} ${d.chart}ms backwards` },

    '[data-reveal="pending"]': { opacity: 0 },
    '[data-reveal="rise"]': { animation: `motionRise ${d.reveal}ms ${e.out} backwards`, ...delayed },
    '[data-reveal="in"]': { animation: `motionReveal ${d.reveal}ms ${e.out} backwards`, ...delayed },

    // Hover lift for cards (pointer devices only). Doubled class beats the
    // component's own transition declaration.
    '.motion-lift.motion-lift': {
      transition: `transform ${d.base}ms ${e.out}, box-shadow ${d.base}ms ${e.out}, background-color ${d.fast}ms ${e.out}`,
      '@media (hover: hover)': {
        '&:hover': { transform: `translateY(-${x.lift}px)`, boxShadow: shadows[8] },
      },
    },

    // Count-up number: the hidden ::after copy of the final string reserves
    // its width, so nothing around the number moves while it counts.
    '.anum': {
      display: 'inline-grid',
      maxWidth: '100%',
      fontVariantNumeric: 'tabular-nums',
      '& > span, &::after': { gridArea: '1 / 1', minWidth: 0 },
      '&::after': { content: 'attr(data-final)', visibility: 'hidden', pointerEvents: 'none', userSelect: 'none' },
    },

    '@media print': {
      '[data-reveal]': { opacity: '1 !important', animation: 'none !important' },
    },
    '@media (prefers-reduced-motion: reduce)': {
      '*, *::before, *::after': {
        animationDuration: '0.01ms !important',
        animationDelay: '0ms !important',
        transitionDuration: '0.01ms !important',
        scrollBehavior: 'auto !important',
      },
      '[data-reveal="pending"]': { opacity: 1 },
      '.motion-lift.motion-lift:hover': { transform: 'none' },
    },
  };
};
