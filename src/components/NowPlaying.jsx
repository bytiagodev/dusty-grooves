import { motion, AnimatePresence } from 'framer-motion';

// ── NowPlaying ────────────────────────────────────────────────
// Displays the currently playing track with album art, song
// info, and playback controls. Sits above the search dock
// at the bottom of the shop interior.
//
// Pure presentational — receives all state and control
// functions as props. No internal audio logic.

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function NowPlaying({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
}) {
  if (!track) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="now-playing"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Album art */}
        <div className="now-playing__art-wrap">
          <img
            src={track.artUrl || '/images/vinyl-default.svg'}
            alt={`${track.album || track.name} cover`}
            className="now-playing__art"
            onError={(e) => { e.currentTarget.src = '/images/vinyl-default.svg'; }}
            draggable={false}
          />
          {isPlaying && <div className="now-playing__art-pulse" />}
        </div>

        {/* Track info + controls */}
        <div className="now-playing__body">
          {/* Song title + artist */}
          <div className="now-playing__info">
            <div className="now-playing__track">{track.name}</div>
            <div className="now-playing__artist">{track.artist}</div>
          </div>

          {/* Seek bar */}
          <div className="now-playing__seek-row">
            <span className="now-playing__time">{formatTime(currentTime)}</span>
            <div className="now-playing__seek-track" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              onSeek?.(pct * duration);
            }}>
              <div
                className="now-playing__seek-fill"
                style={{ width: `${progress}%` }}
              />
              <div
                className="now-playing__seek-thumb"
                style={{ left: `${progress}%` }}
              />
            </div>
            <span className="now-playing__time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Play/pause + volume */}
        <div className="now-playing__controls">
          <button
            className="now-playing__play-btn"
            onClick={onPlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>

          <div className="now-playing__volume">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <polygon points="6,9 2,9 2,15 6,15 11,19 11,5" fill="currentColor" stroke="none" />
              {volume > 0.3 && <path d="M15 8.5C16 9.5 16.5 11 16.5 12s-.5 2.5-1.5 3.5" />}
              {volume > 0.6 && <path d="M18 6C19.5 7.5 20.5 10 20.5 12s-1 4.5-2.5 6" />}
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
              className="now-playing__volume-slider"
              aria-label="Volume"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}