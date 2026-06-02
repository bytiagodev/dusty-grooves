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
      <AnimatePresence>
        {showBubble && message && (
          <motion.div
            key="bubble"
            className="tony-bubble-anchor"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
          >
            <SpeechBubble message={message} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tony sprite */}
      <AnimatePresence mode="wait">
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
            opacity: { duration: 0.4, ease: 'easeInOut' },
            y: bob
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 },
          }}
          style={{
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
  );
}