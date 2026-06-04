import { useState, useCallback } from "react";

const BASE_URL = "https://ws.audioscrobbler.com/2.0/";
const API_KEY = import.meta.env.VITE_LASTFM_KEY;

const PLACEHOLDER_ART = "/images/vinyl-default.svg";

function getArtUrl(images) {
  if (!images || !images.length) return null;
  const priority = ["extralarge", "large", "mega", "medium", "small"];
  for (const size of priority) {
    const match = images.find((img) => img.size === size);
    if (match?.["#text"] && match["#text"] !== "") return match["#text"];
  }
  return null;
}

export default function useLastFm() {
  const [results, setResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingTrack, setIsFetchingTrack] = useState(false);
  const [error, setError] = useState(null);

  const searchTracks = useCallback(async (query) => {
    if (!query?.trim()) return;
    setIsSearching(true);
    setError(null);
    setResults([]);
    setSelectedTrack(null);

    try {
      const params = new URLSearchParams({
        method: "track.search",
        track: query.trim(),
        api_key: API_KEY,
        format: "json",
        limit: 10,
      });

      const res = await fetch(`${BASE_URL}?${params}`);
      if (!res.ok) throw new Error(`Last.fm error: ${res.status}`);

      const data = await res.json();
      const trackMatches = data?.results?.trackmatches?.track;

      if (!trackMatches || trackMatches.length === 0) {
        setResults([]);
        return { found: false };
      }

      const tracks = Array.isArray(trackMatches)
        ? trackMatches
        : [trackMatches];

      const normalised = tracks.map((t) => ({
        name: t.name,
        artist: t.artist,
        mbid: t.mbid || null,
        url: t.url,
        artUrl: getArtUrl(t.image) || PLACEHOLDER_ART,
        listeners: t.listeners ? parseInt(t.listeners, 10) : null,
      }));

      // Set results immediately so the UI shows fast
      setResults(normalised);

      // Backfill artist images in parallel for tracks with no art
      const uniqueArtists = [...new Set(normalised.map((t) => t.artist))];

      const artistImages = await Promise.all(
        uniqueArtists.map(async (artist) => {
          try {
            const p = new URLSearchParams({
              method: "artist.getInfo",
              artist,
              api_key: API_KEY,
              format: "json",
            });
            const r = await fetch(`${BASE_URL}?${p}`);
            if (!r.ok) return { artist, url: null };
            const d = await r.json();
            return { artist, url: getArtUrl(d?.artist?.image) };
          } catch {
            return { artist, url: null };
          }
        }),
      );

      const artistImageMap = Object.fromEntries(
        artistImages.map(({ artist, url }) => [artist, url]),
      );

      setResults(
        normalised.map((t) =>
          t.artUrl === PLACEHOLDER_ART && artistImageMap[t.artist]
            ? { ...t, artUrl: artistImageMap[t.artist] }
            : t,
        ),
      );

      return { found: true, count: normalised.length };
    } catch (err) {
      setError(err.message);
      return { found: false, error: err.message };
    } finally {
      setIsSearching(false);
    }
  }, []);

  const fetchTrackInfo = useCallback(
    async ({ name, artist, mbid }) => {
      setIsFetchingTrack(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          method: "track.getInfo",
          api_key: API_KEY,
          format: "json",
          autocorrect: 1,
        });

        if (mbid) {
          params.set("mbid", mbid);
        } else {
          params.set("track", name);
          params.set("artist", artist);
        }

        const res = await fetch(`${BASE_URL}?${params}`);
        if (!res.ok) throw new Error(`Last.fm error: ${res.status}`);

        const data = await res.json();
        const t = data?.track;

        if (!t) throw new Error("Track not found");

        const track = {
          name: t.name,
          artist: t.artist?.name || artist,
          album: t.album?.title || null,
          artUrl:
            getArtUrl(t.album?.image) || getArtUrl(t.image) || PLACEHOLDER_ART,
          duration: t.duration
            ? Math.round(parseInt(t.duration, 10) / 1000)
            : null,
          playcount: t.playcount ? parseInt(t.playcount, 10) : null,
          url: t.url,
          mbid: t.mbid || mbid || null,
        };

        setSelectedTrack(track);
        return track;
      } catch (err) {
        const fallback = results.find(
          (r) =>
            r.name.toLowerCase() === name?.toLowerCase() &&
            r.artist.toLowerCase() === artist?.toLowerCase(),
        );
        if (fallback) {
          setSelectedTrack(fallback);
          return fallback;
        }
        setError(err.message);
        return null;
      } finally {
        setIsFetchingTrack(false);
      }
    },
    [results],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setSelectedTrack(null);
    setError(null);
  }, []);

  return {
    results,
    selectedTrack,
    isSearching,
    isFetchingTrack,
    error,
    searchTracks,
    fetchTrackInfo,
    clearResults,
  };
}
