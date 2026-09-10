<p align="center">
  <img src="public/images/shop-exterior-night.webp" alt="Dusty Grooves at night - neon sign glowing on a quiet street" width="100%" />
</p>

<h1 align="center">Dusty Grooves</h1>
<h3 align="center">Est. 1983 - A record shop that time forgot</h3>

<p align="center">
  <a href="https://bytiagodev.github.io/dusty-grooves"><strong>Visit the shop</strong></a>
</p>

> **Archived.** The shop is still open and still plays records. Nothing new is being added to it.

---

## The idea

Dusty Grooves is a browser music player disguised as an 80s record shop. Instead of a standard interface with buttons and lists, I built the app around a character named Big Tony.

The whole UI runs off a React state machine. Every app state maps to one of Tony's poses and a line of dialogue. Search for a song and Tony points at the wall, then digs through the crates. When it plays, he listens. When a search fails, he shrugs and tells you to try another record. No spinners, no error modals, just Tony reacting to whatever the app is doing.

<p align="center">
  <img src="public/images/tony-pointing.png" alt="Big Tony pointing at the records" height="260" />
  &emsp;&emsp;&emsp;&emsp;&emsp;
  <img src="public/images/tony-vibing.png" alt="Big Tony vibing to the music" height="260" />
  &emsp;&emsp;&emsp;&emsp;&emsp;
  <img src="public/images/tony-searching.png" alt="Big Tony searching through crates" height="260" />
</p>

## Day and night

There is a day and night toggle, but it belongs to the shop rather than to the interface. In the day the sunlight hits the faded awning. At night the hot pink neon comes on and the street is wet and dark.

<p align="center">
  <img src="public/images/shop-exterior-day.webp" alt="Dusty Grooves in the daytime" width="48%" />
  <img src="public/images/shop-exterior-night.webp" alt="Dusty Grooves at night" width="48%" />
</p>

No accounts, no playlists, no algorithms. You walk in, ask for a song, and listen to it.

## How the audio works

Last.fm supplies the track metadata and album art. The YouTube Data API supplies the audio. A Cloudflare Worker sits between them and the browser for one reason: the YouTube key lives as a Worker secret and never reaches the bundle.

A YouTube search for any song returns remixes, covers, karaoke versions and live cuts alongside the actual record, so every result is scored in the app before one is chosen. Points for the track name in the title, points for the artist in the title or the channel, points for an official upload, heavy penalties for remix, cover and karaoke, smaller ones for live and acoustic. If nothing clears the threshold, the app refuses to play anything and Tony tells you he does not have that one. Playback runs through a hidden YouTube iframe forced to 240p, since there is no audio-only mode and there is no point downloading video nobody looks at.

## The part that broke twice

Worth writing down, because it is the whole story of this project.

The first build streamed audio from Piped. By 2026 every public Piped instance was dead. The second build resolved a video ID through Invidious and played it in the YouTube player, which worked until the public instance list shrank to a handful, and those started answering datacentre traffic with captchas and bot checks. That is correct behaviour from volunteer-run servers, not a fault on their side.

The third build uses the official YouTube Data API through the Worker, with a published quota I can read in advance instead of a host list I have to hope about. Free public proxies are the right call for a prototype and the wrong one for anything meant to stay up.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React and Vite |
| Styling | Tailwind CSS and CSS keyframes |
| Metadata | Last.fm API |
| Audio | YouTube Data API v3 via Cloudflare Worker proxy |
| Hosting | GitHub Pages and GitHub Actions |

## Floor plan

```text
dusty-grooves/
├── worker/index.js            <- Cloudflare Worker, holds the YouTube key
├── public/images/             <- Big Tony poses and shop scenes
└── src/
    ├── components/
    │   ├── ShopExterior       <- The street, day and night
    │   ├── ShopInterior       <- Inside the shop
    │   ├── BigTony            <- State-driven poses
    │   ├── SpeechBubble       <- Typewriter dialogue
    │   └── AudioEngine        <- Hidden YouTube player
    └── hooks/
        ├── useLastFm          <- Metadata and album art
        ├── useTrackSearch     <- Worker search and result scoring
        └── useAppState        <- The state machine driving Tony
```

## If you want to run it

You need a free Last.fm API key and a YouTube Data API key from the Google Cloud Console. Deploy the Worker with Wrangler from inside the `worker` directory so your YouTube key stays server-side, copy `.env.example` to `.env`, fill in the Last.fm key and the Worker URL, then start the dev server.

## What I would fix if the shop reopened

When YouTube blocks a video from being embedded, the app gives up instead of trying the next best scored result. The list is already ranked, it just is not held onto after the first pick. That is the one outstanding change worth making, and it is the reason this is archived honestly rather than quietly.

---

<p align="center">
  <img src="public/images/tony-shop-interior.webp" alt="Inside Dusty Grooves" width="100%" />
</p>

<p align="center">
  <i>If it ain't vinyl, it ain't real.</i>
</p>

<p align="center">
  <sub>Built by <a href="https://bytiago.com/">Tiago Teixeira</a></sub>
</p>
