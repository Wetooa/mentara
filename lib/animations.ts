// Default animation duration in seconds
export const DEFAULT_DURATION = 0.2;

export const fade = {
  in: {
    opacity: 1,
    transition: { duration: DEFAULT_DURATION, ease: "easeOut" },
  },
  out: {
    opacity: 0,
    transition: { duration: DEFAULT_DURATION, ease: "easeIn" },
  },
};

// Slide animations
export const slide = {
  left: {
    x: -10,
    transition: { duration: DEFAULT_DURATION },
  },
  right: {
    x: 10,
    transition: { duration: DEFAULT_DURATION },
  },
  up: {
    y: -10,
    transition: { duration: DEFAULT_DURATION },
  },
  down: {
    y: 10,
    transition: { duration: DEFAULT_DURATION },
  },
};

// Start animation
export const start = {
  left: {
    x: -10,
    y: 0,
    transition: { duration: DEFAULT_DURATION },
  },
  right: {
    x: 10,
    y: 0,
    transition: { duration: DEFAULT_DURATION },
  },
  up: {
    x: 0,
    y: -10,
    transition: { duration: DEFAULT_DURATION },
  },
  down: {
    x: 0,
    y: 10,
    transition: { duration: DEFAULT_DURATION },
  },
};

// Reset position
export const reset = {
  x: 0,
  y: 0,
  transition: { duration: DEFAULT_DURATION },
};

export const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export const fadeDown = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export const fadeLeft = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export const fadeRight = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export const slideIn = (
  direction: "left" | "right" | "up" | "down" = "up",
  distance = 100
) => {
  const variants = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
  };

  return {
    initial: { opacity: 0, ...variants[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...variants[direction] },
    transition: { duration: 0.5, ease: "easeOut" },
  };
};
