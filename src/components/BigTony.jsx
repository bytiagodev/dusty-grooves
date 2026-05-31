import { AnimatePresence, motion } from 'framer-motion';
import SpeechBubble from './SpeechBubble';

const POSE_IMAGES = {
  'tony-welcome':   '/images/tony-welcome.png',
  'tony-pointing':  '/images/tony-pointing.png',
  'tony-vibing':    '/images/tony-vibing.png',
  'tony-searching': '/images/tony-searching.png',
  'tony-shrug':     '/images/tony-shrug.png',
  'tony-error':     '/images/tony-error.png',
};

export default function BigTony({ pose, message, bob, showBubble, context }) {
  const imageSrc = POSE_IMAGES[pose] || POSE_IMAGES['tony-welcome'];

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Speech bubble */}
      {showBubble && message && (
        <SpeechBubble message={message} />
      )}

      {/* Tony with crossfade between poses */}
      <div
        style={{
          position: 'relative',
          height: context === 'exterior' ? '480px' : '520px',
          width: '300px',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={pose}
            src={imageSrc}
            alt="Big Tony"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: bob ? [0, -6, 0] : 0,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              opacity: { duration: 0.4, ease: 'easeInOut' },
              scale: { duration: 0.4, ease: 'easeOut' },
              y: bob
                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.3 },
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              height: '100%',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 20px rgba(255,0,110,0.15))',
            }}
            draggable={false}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}