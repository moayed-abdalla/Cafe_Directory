"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export function MagneticButton({ children, onClick, className }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(y, [-20, 20], [4, -4]);
  const rotateY = useTransform(x, [-20, 20], [-4, 4]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.15);
      y.set((e.clientY - cy) * 0.15);
    };

    const onLeave = () => {
      x.set(0);
      y.set(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: Date.now(),
    });
    setTimeout(() => setRipple(null), 600);
    onClick?.();
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative overflow-hidden rounded-full bg-copper px-10 py-4 text-lg font-semibold text-cream shadow-xl shadow-copper/30 transition-shadow hover:shadow-copper/50",
        className
      )}
    >
      {ripple && (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute h-8 w-8 rounded-full bg-cream"
          style={{ left: ripple.x - 16, top: ripple.y - 16 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
