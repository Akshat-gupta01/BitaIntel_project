'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Share2,
  ArrowRight,
  Pin,
  Tag,
} from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FeedVideoPlayer } from './FeedVideoPlayer';
import { formatFeedDateTime, type FeedPost } from '@/config/feedData';

interface FeedReaderModalProps {
  post: FeedPost | null;
  onClose: () => void;
  onShare: (post: FeedPost) => void;
}

export function FeedReaderModal({
  post,
  onClose,
  onShare,
}: FeedReaderModalProps) {
  if (!post) return null;

  return (
    <Dialog
      open={Boolean(post)}
      onClose={onClose}
      size="xl"
    >
      <article className="space-y-6">
        {/* Top Meta Header */}
        <div className="flex flex-wrap items-center gap-2 pr-8">
          {post.pinned && (
            <Badge kind="amber" icon={false}>
              <Pin className="size-3" />
              Pinned Notice
            </Badge>
          )}
          <Badge kind="primary" icon={false}>
            {post.category}
          </Badge>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <Calendar className="size-3.5 text-slate-500" />
            Published {formatFeedDateTime(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <Clock className="size-3.5" />
            {post.readTime}
          </span>
        </div>

        {/* Title & Summary */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {post.title}
          </h2>
          <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
            {post.summary}
          </p>
        </div>

        {/* Author + Share Strip (No Likes/Comments) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary-600 text-white shadow-2xs">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{post.author.name}</span>
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-800">
                  {post.author.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{post.author.role}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onShare(post)}
            icon={<Share2 className="size-3.5 text-primary-600" />}
          >
            Share Post
          </Button>
        </div>

        {/* Media Presentation */}
        {post.mediaType === 'image' && post.imageUrl && (
          <figure className="space-y-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 shadow-sm">
              <img
                src={post.imageUrl}
                alt={post.imageAlt || post.title}
                className="w-full h-auto max-h-[420px] object-cover"
              />
            </div>
            {post.imageCaption && (
              <figcaption className="text-xs text-slate-500 italic px-1">
                {post.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {post.mediaType === 'video' && (
          <div className="space-y-3">
            <FeedVideoPlayer post={post} />
            {post.videoChapters && post.videoChapters.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-3">
                {post.videoChapters.map((ch) => (
                  <div
                    key={ch.time}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 text-xs"
                  >
                    <span className="font-mono text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200/70">
                      {ch.time}
                    </span>
                    <p className="mt-1.5 font-bold text-slate-900">{ch.label}</p>
                    <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">{ch.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {post.mediaType === 'text' && post.highlightMetric && (
          <div className="rounded-2xl border border-primary-200/80 bg-gradient-to-br from-primary-50 via-white to-slate-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-700">
                {post.highlightMetric.label}
              </span>
              <p className="mt-1 text-xl font-extrabold text-slate-900">
                {post.highlightMetric.value}
              </p>
            </div>
            <p className="text-xs text-slate-600 sm:max-w-sm leading-relaxed">
              {post.highlightMetric.context}
            </p>
          </div>
        )}

        {/* Full Editorial Body */}
        <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed text-slate-700">
          {post.content.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <Tag className="size-3.5 text-slate-400" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200/80">
          {post.relatedLink ? (
            <Link
              href={post.relatedLink.href}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-900 transition-colors"
            >
              <span>{post.relatedLink.label}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <span className="text-xs text-slate-400">
              Published by BITAINTEL Administration
            </span>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onShare(post)}
              icon={<Share2 className="size-3.5" />}
            >
              Share
            </Button>
          </div>
        </div>
      </article>
    </Dialog>
  );
}

