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

// Healthcare/Therapist specific animations
// Common easing patterns used in therapist components
export const THERAPIST_EASING = {
  spring: [0.25, 0.25, 0, 1] as const,
  easeOut: "easeOut" as const,
  easeInOut: "easeInOut" as const,
} as const;

// Common hover animations for therapist components
export const THERAPIST_HOVER = {
  // Subtle scale up for small elements
  subtle: {
    scale: 1.05,
    transition: { duration: 0.2, ease: THERAPIST_EASING.easeOut },
  },
  // Card hover with lift effect
  cardLift: {
    scale: 1.02,
    y: -2,
    transition: { duration: 0.2, ease: THERAPIST_EASING.easeOut },
  },
  // Button hover with lift
  buttonLift: {
    scale: 1.05,
    y: -2,
    transition: { duration: 0.2, ease: THERAPIST_EASING.easeOut },
  },
  // Container slight scale
  container: {
    scale: 1.01,
    transition: { duration: 0.2, ease: THERAPIST_EASING.easeOut },
  },
} as const;

// Tap animations for therapist components
export const THERAPIST_TAP = {
  button: { scale: 0.95 },
  card: { scale: 0.98 },
} as const;

// Staggered entry animations for therapist request cards
export const THERAPIST_STAGGER = {
  container: {
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: THERAPIST_EASING.spring,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  },
} as const;

// Status indicator animations
export const THERAPIST_STATUS = {
  // Pulse animation for pending status
  pulse: {
    animate: { scale: [1, 1.1, 1] },
    transition: { duration: 2, repeat: Infinity, ease: THERAPIST_EASING.easeInOut },
  },
  // Rotate animation for clock icons
  clockRotate: {
    animate: { rotate: [0, 5, -5, 0] },
    transition: { duration: 2, repeat: Infinity, ease: THERAPIST_EASING.easeInOut },
  },
  // Continuous spin for loading spinners
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" },
  },
} as const;

// Loading state animations for therapist components
export const THERAPIST_LOADING = {
  container: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  item: {
    initial: { scale: 0.8 },
    animate: { scale: 1 },
    transition: { duration: 0.4, ease: THERAPIST_EASING.easeOut },
  },
} as const;
