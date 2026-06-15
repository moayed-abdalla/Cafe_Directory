import type { Variants } from "framer-motion";

export const cinematicEase = [0.22, 1, 0.36, 1] as const;

export const springBounce = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20,
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: cinematicEase },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: cinematicEase },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: cinematicEase },
  },
};

export const pinSpring = {
  hidden: { opacity: 0, scale: 0, y: -30 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...springBounce,
      delay: i * 0.05,
    },
  }),
};
