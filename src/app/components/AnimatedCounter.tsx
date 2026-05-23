import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react";
import { useEffect } from "react";
import { useIntersectionObserver } from "./hooks/useIntersectionObserver";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  duration = 2,
  className = "",
}: AnimatedCounterProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    triggerOnce: true,
  });

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    Math.round(latest),
  );

  useEffect(() => {
    if (isIntersecting) {
      const controls = animate(count, value, {
        duration,
        ease: "easeOut",
      });

      return controls.stop;
    }
  }, [isIntersecting, count, value, duration]);

  return (
    <div ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      <span>{suffix}</span>
    </div>
  );
}