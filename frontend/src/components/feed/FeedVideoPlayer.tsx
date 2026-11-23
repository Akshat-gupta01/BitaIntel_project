'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Film,
  CheckCircle2,
} from 'lucide-react';
import type { FeedPost } from '@/config/feedData';
import { cn } from '@/lib/utils';

interface FeedVideoPlayerProps {
  post: FeedPost;
  compact?: boolean;
  onExpand?: () => void;
}

function parseDurationSeconds(duration?: string): number {
  if (!duration) return 180;
  const parts = duration.split(':').map((n) => Number(n));
  if (parts.length === 2 && !parts.some(Number.isNaN)) {
    return parts[0] * 60 + parts[1];
  }
  return 180;
}

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function FeedVideoPlayer({
  post,
  compact = false,
  onExpand,
}: FeedVideoPlayerProps) {
  // If a real external/CDN MP4 video URL is attached, render native HTML5 video with poster fallback.
  const hasRealVideoFile = Boolean(post.videoUrl && post.videoUrl.trim().length > 0);
  const totalSeconds = useMemo(
    () => parseDurationSeconds(post.videoDuration),
    [post.videoDuration]
  );

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const chapters = post.videoChapters || [];

  const activeChapterIndex = useMemo(() => {
    if (chapters.length === 0) return -1;
    let idx = 0;
    for (let i = 0; i < chapters.length; i++) {
      const chSec = parseDurationSeconds(chapters[i].time);
      if (elapsed >= chSec) idx = i;
    }
    return idx;
  }, [chapters, elapsed]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= totalSeconds) {
          setPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, totalSeconds]);

  if (hasRealVideoFile) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 aspect-video">
        <video
          src={post.videoUrl}
          poster={post.posterUrl}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const progressPct = Math.min(100, Math.round((elapsed / totalSeconds) * 100));
  const currentChapter = activeChapterIndex >= 0 ? chapters[activeChapterIndex] : null;

  return (
    <div className="group/video relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 text-white shadow-sm">
      <div className="relative aspect-video w-full overflow-hidden">
        {post.posterUrl ? (
          <img
            src={post.posterUrl}
            alt={post.title}
            className={cn(
              'h-full w-full object-cover transition-all duration-700',
              playing ? 'scale-[1.03] brightness-[0.38]' : 'brightness-90 group-hover/video:scale-[1.02]'
            )}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900" />
        )}

        {/* Active Playback Briefing Overlay */}
        {playing && currentChapter && (
          <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-8 pb-10 animate-in fade-in duration-300">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              <CheckCircle2 className="size-3" />
              Playing Briefing · Chapter {activeChapterIndex + 1} of {chapters.length}
            </span>
            <h4 className={cn('mt-2.5 font-extrabold tracking-tight text-white', compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl')}>
              {currentChapter.label}
            </h4>
            <p className={cn('mt-1.5 text-slate-200 max-w-xl leading-relaxed', compact ? 'text-xs line-clamp-2' : 'text-sm')}>
              {currentChapter.detail}
            </p>
          </div>
        )}

        {/* Top Badges */}
        <div className="pointer-events-none absolute left-3 top-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/15">
            <Film className="size-3 text-primary-300" />
            Admin Video Briefing
          </span>
          {post.videoDuration && (
            <span className="rounded-full bg-slate-950/80 px-2.5 py-0.5 font-mono text-[11px] font-bold text-slate-100 backdrop-blur-md border border-white/15">
              {post.videoDuration}
            </span>
          )}
        </div>

        {/* Center Play/Pause Overlay Button */}
        {!playing && (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play briefing video: ${post.title}`}
            className="absolute inset-0 flex items-center justify-center bg-slate-950/15 transition-colors hover:bg-slate-950/25"
          >
            <span className="grid size-14 place-items-center rounded-full bg-white/95 text-slate-950 shadow-xl ring-4 ring-white/25 transition-transform duration-200 group-hover/video:scale-105">
              <Play className="size-6 fill-slate-950 translate-x-0.5" />
            </span>
          </button>
        )}

        {/* Bottom Control Bar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent px-3 pt-6 pb-2.5">
          {/* Interactive Progress Scrubber */}
          <input
            type="range"
            min={0}
            max={totalSeconds}
            value={elapsed}
            aria-label="Seek video progress"
            onChange={(e) => setElapsed(Number(e.target.value))}
            className="mb-2 h-1 w-full cursor-pointer accent-primary-400"
          />

          <div className="flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pause video' : 'Play video'}
                className="grid size-7 place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
              >
                {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5 translate-x-0.25" />}
              </button>

              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? 'Unmute briefing' : 'Mute briefing'}
                className="grid size-7 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              >
                {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </button>

              <span className="font-mono text-[11px] text-slate-200">
                {formatSeconds(elapsed)} / {post.videoDuration || formatSeconds(totalSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {!compact && chapters.length > 0 && (
                <div className="hidden sm:flex items-center gap-1">
                  {chapters.map((ch, idx) => (
                    <button
                      key={ch.time}
                      type="button"
                      onClick={() => {
                        setElapsed(parseDurationSeconds(ch.time));
                        setPlaying(true);
                      }}
                      className={cn(
                        'rounded-full px-2 py-0.5 font-mono text-[10px] transition-colors',
                        idx === activeChapterIndex && playing
                          ? 'bg-primary-500 text-white font-bold'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      )}
                    >
                      {ch.time}
                    </button>
                  ))}
                </div>
              )}

              {onExpand && (
                <button
                  type="button"
                  onClick={onExpand}
                  aria-label="Open full video briefing"
                  className="grid size-7 place-items-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                >
                  <Maximize2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator accent line */}
      <div className="h-0.5 w-full bg-slate-800">
        <div
          className="h-full bg-primary-400 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

