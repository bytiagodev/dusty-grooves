import { useState, useCallback, useRef, useEffect } from 'react';

// ── Tony's dialogue pools ──────────────────────────────────────
// Random pick keeps him feeling alive across repeated interactions.

const MESSAGES = {
  welcome: [
    "Welcome to Dusty Grooves, my friend!",
    "Step right in, my friend. The vinyl's waiting.",
    "You found the spot, my friend. What are we spinning today?",
    "The shop's open. The turntable's warm. Let's go.",
  ],
  searching: [
    "Let me see what we've got for you...",
    "Oh, I think I know where that one is.",
    "Good taste, my friend. Check the wall.",
    "I've got something for you, hold on.",
  ],
  loading: [
    "Digging through the crates...",
    "It's in here somewhere, I know it...",
    "Hold on, flipping through the good stuff...",
    "Every record in here is a masterpiece. Let me find yours.",
  ],
  playing: [
    "Now that's a groove.",
    "Feel that? That's real music, my friend.",
    "This one right here. This is why I opened the shop.",
    "Sit back. Let it ride.",
    "You can't stream this kind of feeling.",
  ],
  paused: [
    "Take your time, my friend. The record's not going anywhere.",
    "Intermission. The groove will be right here.",
  ],
  no_results: [
    "Can't find that one, my friend. Try another?",
    "That record's not in the crates today. Search again?",
    "Even my shop doesn't have everything. Almost, though.",
    "No dice, my friend. Want to try something else?",
  ],
  error: [
    "Something went wrong. Even the best records skip sometimes.",
    "The turntable hiccupped. Give it another spin?",
    "That wasn't supposed to happen. Let's try again, my friend.",
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Pose mapping ───────────────────────────────────────────────
// Maps app state → Tony image filename (without path/extension,
// so BigTony.jsx can resolve it however it wants).

const POSE_MAP = {
  welcome:    'tony-welcome',
  searching:  'tony-pointing',
  loading:    'tony-searching',
  playing:    'tony-vibing',
  paused:     'tony-vibing',
  no_results: 'tony-shrug',
  error:      'tony-error',
};

// ── Minimum dwell times (ms) ───────────────────────────────────
// How long Tony must stay in a state before transitioning out.
// Prevents flickering through poses faster than the eye registers.

const MIN_DWELL = {
  welcome:    0,       // can leave immediately on user action
  searching:  600,     // brief — user is actively typing/interacting
  loading:    1200,    // crate-digging animation needs to land
  playing:    0,       // stays as long as music plays
  paused:     0,       // stays until user acts
  no_results: 2000,    // let the user read the message
  error:      2000,    // let the user read the message
};

// ── The hook ───────────────────────────────────────────────────

export default function useAppState() {
  const [state, setState] = useState('welcome');
  const [message, setMessage] = useState(() => pickRandom(MESSAGES.welcome));

  // Track when we entered the current state (for dwell enforcement)
  const enteredAt = useRef(0);
  // Queue: if a transition is requested during dwell, it waits here
  const pendingTransition = useRef(null);
  const dwellTimer = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    enteredAt.current = Date.now();
    return () => {
      if (dwellTimer.current) clearTimeout(dwellTimer.current);
    };
  }, []);

  // ── Core transition logic ──────────────────────────────────
  const transitionTo = useCallback((nextState, customMessage) => {
    // Clear any previously queued transition
    if (dwellTimer.current) {
      clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }

    const now = Date.now();
    const elapsed = now - enteredAt.current;
    const minDwell = MIN_DWELL[state] || 0;
    const remaining = minDwell - elapsed;

    const doTransition = () => {
      const msg = customMessage || pickRandom(MESSAGES[nextState] || []);
      setState(nextState);
      setMessage(msg);
      enteredAt.current = Date.now();
      pendingTransition.current = null;
    };

    if (remaining > 0) {
      // Dwell time hasn't elapsed — queue the transition
      pendingTransition.current = nextState;
      dwellTimer.current = setTimeout(doTransition, remaining);
    } else {
      doTransition();
    }
  }, [state]);

  // ── Public actions ─────────────────────────────────────────
  // These are what the rest of the app calls. Each one triggers
  // the right state transition with appropriate context.

  const actions = {
    // User enters the shop from exterior
    enterShop: useCallback(() => {
      transitionTo('welcome');
    }, [transitionTo]),

    // User starts typing in the search bar
    startSearch: useCallback(() => {
      // Only transition if we're not already searching/loading
      if (state !== 'searching' && state !== 'loading') {
        transitionTo('searching');
      }
    }, [state, transitionTo]),

    // Search has been submitted, waiting for API
    submitSearch: useCallback(() => {
      transitionTo('loading');
    }, [transitionTo]),

    // Results came back successfully
    showResults: useCallback(() => {
      // Back to pointing — "here's what I found"
      transitionTo('searching', pickRandom([
        "Here's what I've got, my friend.",
        "Take your pick. They're all good.",
        "Found some beauties in the crates.",
        "Have a look through these.",
      ]));
    }, [transitionTo]),

    // No results found
    noResults: useCallback(() => {
      transitionTo('no_results');
    }, [transitionTo]),

    // User selected a track, audio is loading
    selectTrack: useCallback((trackName) => {
      transitionTo('loading', `Putting on "${trackName}"...`);
    }, [transitionTo]),

    // Audio has started playing
    startPlaying: useCallback((trackName, artistName) => {
      const custom = trackName
        ? pickRandom([
            `"${trackName}" by ${artistName || 'this artist'}. Now that's a groove.`,
            `${artistName || 'This one'}. Classic, my friend.`,
            `You picked a good one. Let it ride.`,
          ])
        : undefined;
      transitionTo('playing', custom);
    }, [transitionTo]),

    // User paused playback
    pausePlayback: useCallback(() => {
      transitionTo('paused');
    }, [transitionTo]),

    // User resumed playback
    resumePlayback: useCallback(() => {
      transitionTo('playing', pickRandom([
        "And we're back. Let it play.",
        "That's right, keep it spinning.",
        "The groove continues, my friend.",
      ]));
    }, [transitionTo]),

    // Song ended naturally
    songEnded: useCallback(() => {
      transitionTo('welcome', pickRandom([
        "That was a good one. What's next, my friend?",
        "Record's done. Want to dig for another?",
        "The turntable's ready when you are.",
      ]));
    }, [transitionTo]),

    // Something broke
    setError: useCallback((errorMsg) => {
      transitionTo('error', errorMsg || undefined);
    }, [transitionTo]),

    // Reset to welcome (after error, or manual reset)
    reset: useCallback(() => {
      transitionTo('welcome');
    }, [transitionTo]),
  };

  // ── Derived state for consumers ────────────────────────────

  return {
    // Current state string
    appState: state,

    // Which Tony pose to display
    tonyPose: POSE_MAP[state] || 'tony-welcome',

    // Current speech bubble message (null-check in SpeechBubble)
    tonyMessage: message,

    // Whether Tony should bob (only when actively playing)
    tonyBob: state === 'playing',

    // Whether the "NOW SPINNING" sign should be lit
    nowSpinning: state === 'playing' || state === 'paused',

    // Whether speech bubble should be visible
    showBubble: state === 'welcome' || state === 'no_results' || state === 'error'
      || state === 'loading' || state === 'playing' || state === 'paused',

    // Action dispatchers
    actions,
  };
}