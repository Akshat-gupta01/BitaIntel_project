'use client';

import React, { useEffect, useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Mail,
  MessageCircle,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { formatFeedDate, getFeedShareUrl, type FeedPost } from '@/config/feedData';
import { toast } from 'sonner';

interface FeedShareDialogProps {
  post: FeedPost | null;
  onClose: () => void;
}

export function FeedShareDialog({ post, onClose }: FeedShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCopied(false);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, [post]);

  if (!post) return null;

  const shareUrl = getFeedShareUrl(post.slug);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);
  const encodedSummary = encodeURIComponent(`${post.title} — ${post.summary}`);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Post link copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Unable to copy link automatically. Please copy from the URL field.');
    }
  }

  async function handleNativeShare() {
    if (!post) return;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: shareUrl,
        });
      } catch {
        // User cancelled native share sheet; do nothing
      }
    }
  }

  const shareChannels = [
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      badge: 'in',
      classes: 'border-sky-200 bg-sky-50/80 text-sky-900 hover:bg-sky-100',
    },
    {
      name: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      badge: 'X',
      classes: 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100',
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedSummary}%20${encodedUrl}`,
      icon: <MessageCircle className="size-4 text-emerald-600" />,
      classes: 'border-emerald-200 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100',
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedSummary}%0A%0ARead%20more:%20${encodedUrl}`,
      icon: <Mail className="size-4 text-primary-600" />,
      classes: 'border-primary-200 bg-primary-50/80 text-primary-900 hover:bg-primary-100',
    },
  ];

  return (
    <Dialog
      open={Boolean(post)}
      onClose={onClose}
      title="Share Official Post"
      description="Distribute this BITAINTEL announcement with your procurement or compliance team."
      size="md"
    >
      <div className="mt-5 space-y-5">
        {/* Post Context Snippet */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500">
            <span className="text-primary-700 font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              {formatFeedDate(post.publishedAt)}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 leading-snug">{post.title}</p>
        </div>

        {/* Direct Link Copy Box */}
        <div className="space-y-1.5">
          <label
            htmlFor="feed-share-url"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            Direct Post Link
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs">
            <input
              id="feed-share-url"
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-slate-700 outline-none truncate"
            />
            <Button
              type="button"
              size="sm"
              variant={copied ? 'dark' : 'primary'}
              onClick={handleCopyLink}
              icon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            >
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
        </div>

        {/* Social & Communication Channels */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Share Via Channel
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {shareChannels.map((ch) => (
              <a
                key={ch.name}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition-colors ${ch.classes}`}
              >
                <span className="inline-flex items-center gap-2">
                  {ch.icon ? (
                    ch.icon
                  ) : (
                    <span className="grid size-5 place-items-center rounded-md bg-white/90 text-[11px] font-extrabold shadow-2xs">
                      {ch.badge}
                    </span>
                  )}
                  <span>{ch.name}</span>
                </span>
                <ExternalLink className="size-3.5 opacity-60" />
              </a>
            ))}
          </div>
        </div>

        {/* System Share API fallback/shortcut */}
        {canNativeShare && (
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center"
            onClick={handleNativeShare}
            icon={<Share2 className="size-4" />}
          >
            Open Device Share Sheet
          </Button>
        )}
      </div>
    </Dialog>
  );
}

