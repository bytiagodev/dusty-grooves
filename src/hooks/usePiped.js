import { useState, useCallback, useRef } from "react";
import { pipedFetch } from "../utils/pipedInstances";

const PENALTY_WORDS = [
  "remix",
  "cover",
  "karaoke",
  "instrumental",
  "parody",
  "tutorial",
  "lesson",
  "reaction",
  "review",
  "mashup",
  "slowed",
  "reverb",
  "sped up",
  "speed up",
  "nightcore",
  "daycore",
  "8d audio",
  "bass boosted",
];

const MILD_PENALTY_WORDS = ["live", "concert", "acoustic", "unplugged"];
const BONUS_WORDS = [
  "official audio",
  "official music video",
  "official video",
];

function normalise(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreResult(result, trackName, artistName) {
  const title = normalise(result.title || "");
  const author = normalise(result.author || "");
  const track = normalise(trackName);
  const artist = normalise(artistName);

  let score = 0;

  if (title.includes(track)) {
    score += 10;
  } else {
    const trackWords = track.split(" ").filter((w) => w.length > 2);
    const matched = trackWords.filter((w) => title.includes(w));
    if (matched.length >= trackWords.length * 0.5) score += 5;
  }

  if (title.includes(artist) || author.includes(artist)) {
    score += 10;
  } else {
    const artistWords = artist.split(" ").filter((w) => w.length > 2);
    const matched = artistWords.filter(
      (w) => title.includes(w) || author.includes(w),
    );
    if (matched.length >= artistWords.length * 0.5) score += 5;
  }

  for (const bonus of BONUS_WORDS) {
    if (title.includes(bonus)) {
      score += 5;
      break;
    }
  }

  for (const word of PENALTY_WORDS) {
    if (title.includes(word)) {
      score -= 8;
      break;
    }
  }

  for (const word of MILD_PENALTY_WORDS) {
    if (title.includes(word)) {
      score -= 4;
      break;
    }
  }

  return score;
}

export default function usePiped() {
  const [videoId, setVideoId] = useState(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [streamMeta, setStreamMeta] = useState(null);

  const abortRef = useRef(null);

  const searchStream = useCallback(
    async (trackName, artistName) => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setIsLoadingStream(true);
      setStreamError(null);
      setVideoId(null);
      setStreamMeta(null);

      try {
        const query = encodeURIComponent(`${trackName} ${artistName}`);
        const { data: searchResults } = await pipedFetch(
          `/search?q=${query}&type=video`,
        );

        const items = Array.isArray(searchResults) ? searchResults : [];
        if (items.length === 0) {
          throw new Error("No results found");
        }

        const scored = items
          .filter((item) => item.videoId)
          .map((item) => ({
            ...item,
            _score: scoreResult(item, trackName, artistName),
          }))
          .sort((a, b) => b._score - a._score);

        const best = scored[0];
        if (!best || best._score < 3) {
          throw new Error("No confident match found");
        }

        const meta = {
          videoTitle: best.title,
          videoDuration: 0,
          videoId: best.videoId,
          artUrl: `https://i.ytimg.com/vi/${best.videoId}/hqdefault.jpg`,
        };

        setVideoId(best.videoId);
        setStreamMeta(meta);
        setIsLoadingStream(false);

        return { videoId: best.videoId, ...meta };
      } catch (err) {
        if (err.name === "AbortError") return null;

        const message = err.message || "Failed to find video";
        setStreamError(message);
        setIsLoadingStream(false);
        return null;
      }
    },
    [],
  );

  const clearStream = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setVideoId(null);
    setStreamMeta(null);
    setStreamError(null);
    setIsLoadingStream(false);
  }, []);

  return {
    videoId,
    streamMeta,
    isLoadingStream,
    streamError,
    searchStream,
    clearStream,
  };
}
