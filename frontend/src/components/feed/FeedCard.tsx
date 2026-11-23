'use client';

import React from 'react';
import {
  Calendar,
  Share2,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Film,
  ArrowUpRight,
  Pin,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeKind } from '@/components/ui/Badge';
import { FeedVideoPlayer } from './FeedVideoPlayer';
import {
  formatFeedDate,
  type FeedCategory,
  type FeedMediaType,
  type FeedPost,
} from '@/config/feedData';
import { cn } from '@/lib/utils';

interface FeedCardProps {
  post: FeedPost;
  onRead: (post: FeedPost) => void;
  onShare: (post: FeedPost) => void;
}

const categoryBadgeKind: Record<FeedCategory, BadgeKind> = {
  'Platform Update': 'primary',
  'Regulatory Alert': 'amber',
  'Market Intelligence': 'sage',
  'Audit Advisory': 'mint',
  Spotlight: 'lavender',
};

const mediaMeta: Record<
  FeedMediaType,
  { label: string; icon: React.ReactNode }
> = {
  text: { label: 'Update', icon: <FileText className="size-3" /> },
  image: { label: 'Visual', icon: <ImageIcon className="size-3" /> },
  video: { label: 'Video', icon: <Film className="size-3" /> },
};

export function FeedCard({ post, onRead, onShare }: FeedCardProps) {
  const media = mediaMeta[post.mediaType];

  return (
    <Card
      variant="default"
      className={cn(
        'group flex flex-col justify-between p-5 sm:p-6 hover:border-primary-300/80 hover:shadow-[0_14px_34px_-10px_rgba(37,99,235,0.14)] transition-all duration-300',
        post.pinned && 'ring-1 ring-primary-200/80 bg-gradient-to-b from-primary-50/25 via-white to-white'
      )}
    >
      <div className="space-y-4">
        {/* Top Meta Bar: Category, Format & Post Date */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                <Pin className="size-2.5" />
                Pinned
              </span>
            )}
            <Badge
              kind={categoryBadgeKind[post.category]}
              icon={false}
              className="px-2.5 py-0.5 text-[11px]"
            >
              {post.category}
            </Badge>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {media.icon}
              {media.label}
            </span>
          </div>

          <time
            dateTime={post.publishedAt}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 whitespace-nowrap"
            title={`Posted on ${formatFeedDate(post.publishedAt)}`}
          >
            <Calendar className="size-3.5 text-primary-600" />
            {formatFeedDate(post.publishedAt)}
          </time>
        </div>

        {/* Media Slot (Image / Video / Editorial Text Highlight) */}
        {post.mediaType === 'image' && post.imageUrl && (
          <button
            type="button"
            onClick={() => onRead(post)}
            aria-label={`Inspect visual for ${post.title}`}
            className="block w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 aspect-video text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <img
              src={post.imageUrl}
              alt={post.imageAlt || post.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
        )}

        {post.mediaType === 'video' && (
          <FeedVideoPlayer
            post={post}
            compact
            onExpand={() => onRead(post)}
          />
        )}

        {post.mediaType === 'text' && (
          <button
            type="button"
            onClick={() => onRead(post)}
            className="w-full rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-primary-50/40 to-white p-4 sm:p-5 text-left transition-colors hover:border-primary-200/90"
          >
            {post.highlightMetric ? (
              <div className="space-y-1.5">
                <span className="inline-block rounded-full bg-primary-100/80 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-800">
                  {post.highlightMetric.label}
                </span>
                <p className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  {post.highlightMetric.value}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {post.highlightMetric.context}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <span className="inline-block rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Official Bulletin
                </span>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {post.content[0]}
                </p>
              </div>
            )}
          </button>
        )}

        {/* Headline & Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-extrabold tracking-tight text-slate-900 leading-snug group-hover:text-primary-700 transition-colors">
            <button
              type="button"
              onClick={() => onRead(post)}
              className="text-left focus:outline-none"
            >
              {post.title}
            </button>
          </h3>

          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
            {post.summary}
          </p>
        </div>

        {/* Topic Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100/90 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Admin Attribution + Read + Share Only (No Likes/Comments) */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-600 text-white shadow-2xs">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-900">
              {post.author.name}
            </p>
            <p className="truncate text-[10px] font-medium text-slate-500 flex items-center gap-1">
              <span>{post.author.badge}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5">
                <Clock className="size-2.5" />
                {post.readTime}
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onRead(post)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
          >
            <span>Read</span>
            <ArrowUpRight className="size-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => onShare(post)}
            aria-label={`Share post: ${post.title}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200/80 px-3 py-1.5 text-xs font-bold text-primary-800 hover:bg-primary-100 hover:border-primary-300 transition-colors"
          >
            <Share2 className="size-3.5 text-primary-700" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </Card>
  );
}

