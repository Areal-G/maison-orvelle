"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";

/** Quiet ambience: about a twentieth of full volume, just under the surface. */
const VOLUME = 0.05;
const FADE_IN = 3;
const FADE_OUT = 0.6;
const STORAGE_KEY = "orvelle-sound";

/**
 * Ambient sound, on by default but subtle. Browsers only allow audio after the visitor interacts,
 * so it fades in on the first tap, click or key press. Muting is remembered for next time.
 * Volume runs through a Web Audio gain node so it stays quiet on iOS too (iOS ignores audio.volume).
 */
const MusicStreamLine = () => {
  const [wanted, setWanted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const divRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const graph = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);
  const wantedRef = useRef(true);

  // Respect a previous "mute" choice.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "off") {
        wantedRef.current = false;
        setWanted(false);
      }
    } catch {
      /* storage unavailable: keep the default */
    }
  }, []);

  /** Build the audio graph on first use; must run inside a user gesture. */
  const ensureGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return null;
    if (!graph.current) {
      const Ctx =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      const ctx = new Ctx();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
      graph.current = { ctx, gain };
    }
    return graph.current;
  }, []);

  const fadeTo = (target: number, seconds: number) => {
    const g = graph.current;
    if (!g) return;
    const now = g.ctx.currentTime;
    g.gain.gain.cancelScheduledValues(now);
    g.gain.gain.setValueAtTime(g.gain.gain.value, now);
    g.gain.gain.linearRampToValueAtTime(target, now + seconds);
  };

  const start = useCallback(() => {
    const audio = audioRef.current;
    const g = ensureGraph();
    if (!audio || !g) return;
    g.ctx.resume().catch(() => {});
    audio
      .play()
      .then(() => {
        setPlaying(true);
        fadeTo(VOLUME, FADE_IN);
      })
      .catch(() => setPlaying(false));
  }, [ensureGraph]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    fadeTo(0, FADE_OUT);
    setPlaying(false);
    window.setTimeout(
      () => {
        if (!wantedRef.current || document.hidden) audio.pause();
      },
      FADE_OUT * 1000 + 50,
    );
  }, []);

  // Start on the visitor's first interaction anywhere on the page (except the toggle itself,
  // which handles its own click).
  useEffect(() => {
    if (!wanted || playing) return;
    const unlock = (e: Event) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      // Keep listening until playback really starts (this effect re-runs and cleans up then),
      // in case a gesture the browser does not count, like Escape, came first.
      if (wantedRef.current) start();
    };
    const events = ["pointerdown", "keydown", "touchend"] as const;
    const remove = () => events.forEach((ev) => window.removeEventListener(ev, unlock, true));
    events.forEach((ev) => window.addEventListener(ev, unlock, { capture: true, passive: true }));
    return remove;
  }, [wanted, playing, start]);

  // Go quiet while the tab is in the background.
  useEffect(() => {
    const onVis = () => {
      if (!graph.current) return;
      if (document.hidden) stop();
      else if (wantedRef.current) start();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [start, stop]);

  useEffect(() => () => void graph.current?.ctx.close(), []);

  const toggle = () => {
    const next = !wanted;
    wantedRef.current = next;
    setWanted(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      /* ignore */
    }
    if (next) start();
    else stop();
  };

  useGSAP(
    () => {
      if (!divRef.current) return;
      const bars = Array.from(divRef.current.children);
      gsap.killTweensOf(bars);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      bars.forEach((bar, index) => {
        if (playing && !reduce)
          gsap.to(bar, {
            scaleY: 2 + Math.random() * 1.5,
            duration: 0.5 + Math.random() * 0.3,
            delay: index * 0.12 + Math.random() * 0.1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
        else gsap.to(bar, { scaleY: playing ? 2 : 1, duration: 0.3, ease: "power1.out" });
      });
    },
    { dependencies: [playing] },
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-pressed={wanted}
      aria-label={wanted ? "Mute background sound" : "Play background sound"}
      className="flex items-center gap-2 hover-animation py-2 uppercase tracking-[0.2em]"
    >
      <span className="hidden md:inline">{wanted ? "Sound on" : "Sound off"}</span>
      <span ref={divRef} className="flex items-center gap-1 h-5" aria-hidden="true">
        <span className="w-0.5 h-1 bg-current" />
        <span className="w-0.5 h-1 bg-current" />
        <span className="w-0.5 h-1 bg-current" />
      </span>
      <audio ref={audioRef} src="/audio/orvelle-atelier.mp3" preload="auto" loop />
    </button>
  );
};

export default MusicStreamLine;
