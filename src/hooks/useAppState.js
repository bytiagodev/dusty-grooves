import { useState, useCallback, useRef, useEffect } from "react";

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

const POSE_MAP = {
  welcome: "tony-welcome",
  searching: "tony-pointing",
  loading: "tony-searching",
  playing: "tony-vibing",
  paused: "tony-vibing",
  no_results: "tony-shrug",
  error: "tony-error",
};

const MIN_DWELL = {
  welcome: 0,
  searching: 600,
  loading: 1200,
  playing: 0,
  paused: 0,
  no_results: 2000,
  error: 2000,
};

export default function useAppState() {
  const [state, setState] = useState("welcome");
  const [message, setMessage] = useState(() => pickRandom(MESSAGES.welcome));

  const enteredAt = useRef(0);

  const pendingTransition = useRef(null);
  const dwellTimer = useRef(null);

  useEffect(() => {
    enteredAt.current = Date.now();
    return () => {
      if (dwellTimer.current) clearTimeout(dwellTimer.current);
    };
  }, []);

  const transitionTo = useCallback(
    (nextState, customMessage) => {

      if (dwellTimer.current) {
        clearTimeout(dwellTimer.current);
        dwellTimer.current = null;
      }

      const now = Date.now();
      const elapsed = now - enteredAt.current;
      const minDwell = MIN_DWELL[state] || 0;
      const remaining = minDwell - elapsed;

      const doTransition = () => {
        const msg =
          typeof customMessage === "function"
            ? customMessage()
            : customMessage || pickRandom(MESSAGES[nextState] || []);
        setState(nextState);
        setMessage(msg);
        enteredAt.current = Date.now();
        pendingTransition.current = null;
      };

      if (remaining > 0) {

        pendingTransition.current = nextState;
        dwellTimer.current = setTimeout(doTransition, remaining);
      } else {
        doTransition();
      }
    },
    [state],
  );

  const actions = {

    startSearch: useCallback(() => {

      if (state !== "searching" && state !== "loading") {
        transitionTo("searching");
      }
    }, [state, transitionTo]),

    submitSearch: useCallback(() => {
      transitionTo("loading");
    }, [transitionTo]),

    showResults: useCallback(() => {

      transitionTo(
        "searching",
        pickRandom([
          "Here's what I've got, my friend.",
          "Take your pick. They're all good.",
          "Found some beauties in the crates.",
          "Have a look through these.",
        ]),
      );
    }, [transitionTo]),

    noResults: useCallback(() => {
      transitionTo("no_results");
    }, [transitionTo]),

    selectTrack: useCallback(
      (trackName) => {
        transitionTo(
          "loading",
          trackName ? () => `Putting on "${trackName}"...` : undefined,
        );
      },
      [transitionTo],
    ),

    startPlaying: useCallback(
      (trackName, artistName) => {
        transitionTo(
          "playing",
          trackName
            ? () =>
                pickRandom([
                  `"${trackName}" by ${artistName || "this artist"}. Now that's a groove.`,
                  `${artistName || "This one"}. Classic, my friend.`,
                  `You picked a good one. Let it ride.`,
                ])
            : undefined,
        );
      },
      [transitionTo],
    ),

    pausePlayback: useCallback(() => {
      transitionTo("paused");
    }, [transitionTo]),

    resumePlayback: useCallback(() => {
      transitionTo(
        "playing",
        pickRandom([
          "And we're back. Let it play.",
          "That's right, keep it spinning.",
          "The groove continues, my friend.",
        ]),
      );
    }, [transitionTo]),

    songEnded: useCallback(() => {
      transitionTo(
        "welcome",
        pickRandom([
          "That was a good one. What's next, my friend?",
          "Record's done. Want to dig for another?",
          "The turntable's ready when you are.",
        ]),
      );
    }, [transitionTo]),

    setError: useCallback(
      (errorMsg) => {
        transitionTo("error", errorMsg || undefined);
      },
      [transitionTo],
    ),

    reset: useCallback(() => {
      transitionTo("welcome");
    }, [transitionTo]),
  };

  return {

    appState: state,

    tonyPose: POSE_MAP[state] || "tony-welcome",

    tonyMessage: message,

    tonyBob: state === "playing",

    showBubble:
      state === "welcome" ||
      state === "searching" ||
      state === "no_results" ||
      state === "error" ||
      state === "loading" ||
      state === "playing" ||
      state === "paused",

    actions,
  };
}
