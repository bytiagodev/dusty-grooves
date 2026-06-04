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

export default function BigTony({ pose, message, bob, showBubble }) {
  const imageSrc = POSE_IMAGES[pose] || POSE_IMAGES['tony-welcome'];

  return (
    <div className="big-tony-wrapper">

      {/* Speech bubble — positioned above Tony's head */}
      <AnimatePresence mode="wait">
        {showBubble && message && (
          <SpeechBubble key={message} message={message} />
        )}
      </AnimatePresence>

      {/* Tony sprite — overlapping crossfade (no mode="wait") */}
      <div className="tony-sprite-container">
        <AnimatePresence>
          <motion.img
            key={pose}
            src={imageSrc}
            alt="Big Tony"
            className="tony-sprite"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              y: bob ? [0, -6, 0] : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.3, ease: 'easeInOut' },
              y: bob
                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.3 },
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'block',
              width: 'auto',
              maxWidth: 'none',
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
