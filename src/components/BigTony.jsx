import { AnimatePresence, motion } from 'framer-motion';
import SpeechBubble from './SpeechBubble';
import { asset } from '../utils/assetPath';

const POSE_IMAGES = {
  'tony-welcome':   asset('/images/tony-welcome.png'),
  'tony-pointing':  asset('/images/tony-pointing.png'),
  'tony-vibing':    asset('/images/tony-vibing.png'),
  'tony-searching': asset('/images/tony-searching.png'),
  'tony-shrug':     asset('/images/tony-shrug.png'),
  'tony-error':     asset('/images/tony-error.png'),
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

      {/* Tony sprite — sequential crossfade, tightened to 0.2s */}
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
            opacity: { duration: 0.2, ease: 'easeInOut' },
            y: bob
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 },
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
