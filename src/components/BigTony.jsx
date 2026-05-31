import { motion, AnimatePresence } from 'framer-motion';

const POSES = {
  welcome:   '/images/tony-welcome.png',
  pointing:  '/images/tony-pointing.png',
  vibing:    '/images/tony-vibing.png',
  searching: '/images/tony-searching.png',
  shrug:     '/images/tony-shrug.png',
  error:     '/images/tony-error.png',
};

const SIZES = {
  exterior: { height: '700px' },
  interior: { height: '700px' },
  mobile:   { height: '220px' },
};

export default function BigTony({ pose = 'welcome', theme, size = 'interior' }) {
  const isNight = theme === 'night';
  const { height } = SIZES[size] || SIZES.interior;
  const isVibing = pose === 'vibing';

  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={pose}
        src={POSES[pose]}
        alt={`Big Tony — ${pose}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          // gentle bob when vibing
          y: isVibing ? [0, -8, 0] : 0,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={
          isVibing
            ? {
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
              }
            : { duration: 0.3, ease: 'easeInOut' }
        }
        style={{
          height,
          width: 'auto',
          objectFit: 'contain',
          filter: isNight
            ? 'drop-shadow(0 0 18px rgba(255,0,110,0.4))'
            : 'drop-shadow(2px 4px 12px rgba(0,0,0,0.25))',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </AnimatePresence>
  );
}