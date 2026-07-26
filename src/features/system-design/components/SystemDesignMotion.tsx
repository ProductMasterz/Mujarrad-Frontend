'use client';

import type {
  ReactNode,
} from 'react';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'motion/react';

type MotionContainerProps = {
  children: ReactNode;
  className?: string;
  motionKey?: string;
};

type MotionInteractiveProps =
  MotionContainerProps & {
    selected?: boolean;
    disabled?: boolean;
  };

export function MotionPanel({
  children,
  className,
  motionKey,
}: MotionContainerProps) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      key={motionKey}
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 6,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={
        reduceMotion
          ? undefined
          : {
              opacity: 0,
              y: -4,
            }
      }
      transition={{
        duration: 0.18,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionScale({
  children,
  className,
  motionKey,
}: MotionContainerProps) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      key={motionKey}
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              scale: 0.995,
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={
        reduceMotion
          ? undefined
          : {
              opacity: 0,
              scale: 0.995,
            }
      }
      transition={{
        duration: 0.16,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionInteractive({
  children,
  className,
  motionKey,
  selected = false,
  disabled = false,
}: MotionInteractiveProps) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      key={motionKey}
      className={className}
      animate={{
        scale:
          !reduceMotion && selected
            ? 1.01
            : 1,
      }}
      whileHover={
        reduceMotion || disabled
          ? undefined
          : {
              y: -1,
            }
      }
      whileTap={
        reduceMotion || disabled
          ? undefined
          : {
              scale: 0.98,
            }
      }
      transition={{
        duration: 0.14,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionStatus({
  children,
  className,
  motionKey,
}: MotionContainerProps) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      key={motionKey}
      className={className}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              scale: 0.97,
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={
        reduceMotion
          ? undefined
          : {
              opacity: 0,
              scale: 0.97,
            }
      }
      transition={{
        duration: 0.16,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export {
  AnimatePresence,
  motion,
};
