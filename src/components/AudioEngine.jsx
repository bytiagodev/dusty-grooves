import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';

// ── AudioEngine (YouTube IFrame Player) ───────────────────────
// Replaces the HTML5 <audio> element with YouTube's official
// IFrame Player API. Same imperative API as before — the parent
// controls playback via ref, receives state via callbacks.
//
// Why IFrame instead of <audio>:
//   YouTube's signed stream URLs (googlevideo.com) return 403
//   when loaded directly by a browser. The IFrame API is the
//   only reliable way to play full YouTube audio from a browser.
//
// The video is hidden (1x1 pixel). Quality is forced to lowest
//   available (240p) to minimise data usage — we only need audio.

const YT_PLAYER_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

// Load the YouTube IFrame API script once globally
let ytApiReady = false;
let ytApiPromise = null;

function loadYTApi() {
  if (ytApiReady) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      ytApiReady = true;
      resolve();
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      ytApiReady = true;
      resolve();
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });

  return ytApiPromise;
}

const AudioEngine = forwardRef(function AudioEngine(
  { videoId, autoPlay = true, onPlay, onPause, onEnded, onError, onTimeUpdate, onLoadedData },
  ref
) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const currentVideoIdRef = useRef(null);

  // ── Imperative API ──────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    play() {
      playerRef.current?.playVideo?.();
    },
    pause() {
      playerRef.current?.pauseVideo?.();
    },
    seek(time) {
      playerRef.current?.seekTo?.(time, true);
    },
    setVolume(v) {
      // YouTube uses 0-100, our API uses 0-1
      playerRef.current?.setVolume?.(Math.round(Math.max(0, Math.min(1, v)) * 100));
    },
    getVolume() {
      const v = playerRef.current?.getVolume?.();
      return v != null ? v / 100 : 1;
    },
    getCurrentTime() {
      return playerRef.current?.getCurrentTime?.() || 0;
    },
    getDuration() {
      return playerRef.current?.getDuration?.() || 0;
    },
    isPlaying() {
      return playerRef.current?.getPlayerState?.() === YT_PLAYER_STATES.PLAYING;
    },
  }), []);

  // ── Time update polling ─────────────────────────────────────
  // YouTube IFrame API doesn't have a timeupdate event.
  // We poll every 250ms while playing.

  const startTimeUpdates = useCallback(() => {
    stopTimeUpdates();
    timerRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      onTimeUpdate?.({
        currentTime: player.getCurrentTime?.() || 0,
        duration: player.getDuration?.() || 0,
        buffered: player.getVideoLoadedFraction?.()
          ? player.getVideoLoadedFraction() * (player.getDuration?.() || 0)
          : 0,
      });
    }, 250);
  }, [onTimeUpdate, stopTimeUpdates]);

  const stopTimeUpdates = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── State change handler ────────────────────────────────────

  const handleStateChange = useCallback((event) => {
    switch (event.data) {
      case YT_PLAYER_STATES.PLAYING:
        // Force lowest quality to save data
        playerRef.current?.setPlaybackQuality?.('small');
        startTimeUpdates();
        onPlay?.();
        break;

      case YT_PLAYER_STATES.PAUSED:
        stopTimeUpdates();
        onPause?.();
        break;

      case YT_PLAYER_STATES.ENDED:
        stopTimeUpdates();
        onEnded?.();
        break;

      case YT_PLAYER_STATES.BUFFERING:
        // Still loading — don't trigger anything yet
        break;
    }
  }, [onPlay, onPause, onEnded, startTimeUpdates, stopTimeUpdates]);

  const handlePlayerReady = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    // Force lowest quality
    player.setPlaybackQuality('small');

    onLoadedData?.({
      duration: player.getDuration?.() || 0,
    });
  }, [onLoadedData]);

  const handlePlayerError = useCallback((event) => {
    const codeMap = {
      2: 'Invalid video ID',
      5: 'Video cannot be played in HTML5 player',
      100: 'Video not found or removed',
      101: 'Video owner does not allow embedded playback',
      150: 'Video owner does not allow embedded playback',
    };

    onError?.({
      message: codeMap[event.data] || `YouTube player error (code ${event.data})`,
      code: event.data,
      resumePosition: playerRef.current?.getCurrentTime?.() || 0,
      isRecoverable: event.data === 2 || event.data === 5,
    });
  }, [onError]);

  // ── Create / update player ──────────────────────────────────

  useEffect(() => {
    if (!videoId) return;
    if (videoId === currentVideoIdRef.current) return;

    currentVideoIdRef.current = videoId;

    async function initOrLoad() {
      await loadYTApi();

      if (playerRef.current) {
        // Player exists — just load the new video
        if (autoPlay) {
          playerRef.current.loadVideoById({
            videoId,
            suggestedQuality: 'small',
          });
        } else {
          playerRef.current.cueVideoById({
            videoId,
            suggestedQuality: 'small',
          });
        }
        return;
      }

      // First time — create the player
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: 1,
        height: 1,
        playerVars: {
          autoplay: autoPlay ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
          onError: handlePlayerError,
        },
      });
    }

    initOrLoad();
  }, [videoId, autoPlay, handlePlayerReady, handleStateChange, handlePlayerError]);

  // ── Cleanup ─────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopTimeUpdates();
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [stopTimeUpdates]);

  // ── Render ──────────────────────────────────────────────────
  // The div becomes the YouTube iframe. Hidden with CSS.

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
      }}
    />
  );
});

export default AudioEngine;