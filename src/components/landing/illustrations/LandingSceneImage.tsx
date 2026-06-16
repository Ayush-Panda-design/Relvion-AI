'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SCENES = {
  'unified-workspace': {
    src: '/landing/scenes/unified-workspace.svg',
    alt: 'Unified inbox, calendar, and agent in one workspace',
  },
  'flow-showcase': {
    src: '/landing/scenes/flow-showcase.svg',
    alt: 'Email to calendar to confirmation workflow',
  },
} as const;

export type LandingSceneId = keyof typeof SCENES;

export function LandingSceneImage({
  id,
  className,
  priority = false,
  animate = true,
}: {
  id: LandingSceneId;
  className?: string;
  priority?: boolean;
  animate?: boolean;
}) {
  const scene = SCENES[id];

  const image = (
    <div className={cn('relative aspect-[16/9] w-full overflow-hidden rounded-2xl', className)}>
      <motion.div
        className="absolute inset-0"
        animate={animate ? { scale: [1, 1.02, 1] } : undefined}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image
          src={scene.src}
          alt={scene.alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 720px"
        />
      </motion.div>
      {animate && (
        <>
          <motion.span
            className="pointer-events-none absolute -left-4 top-8 h-16 w-16 rounded-full bg-[#4285F4]/15 blur-xl"
            animate={{ x: [0, 12, 0], y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.span
            className="pointer-events-none absolute -right-2 bottom-6 h-20 w-20 rounded-full bg-[#34A853]/15 blur-xl"
            animate={{ x: [0, -10, 0], y: [0, 6, 0] }}
            transition={{ duration: 7, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </div>
  );

  if (!animate) return image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {image}
    </motion.div>
  );
}
