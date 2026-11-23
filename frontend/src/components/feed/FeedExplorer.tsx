'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Film,
  Layers,
  Newspaper,
} from 'lucide-react';
import {
  feedPosts,
  FEED_CATEGORIES,
  type FeedCategory,
  type FeedMediaType,
  type FeedPost,
} from '@/config/feedData';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { FeedCard } from './FeedCard';
import { FeedReaderModal } from './FeedReaderModal';
import { FeedShareDialog } from './FeedShareDialog';
import { cn } from '@/lib/utils';

type FormatFilter = 'all' | FeedMediaType;
type SortOrder = 'newest' | 'oldest';

export function FeedExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const feedTopRef = useRef<HTMLDivElement>(null);

  const initialPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const sharedSlug = searchParams.get('post');

  const [query, setQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FeedCategory>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [pageSize, setPageSize] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const [sharePost, setSharePost] = useState<FeedPost | null>(null);

  // Sync ?post=<slug> deep link to open reader automatically when landing on a shared link
  useEffect(() => {
    if (!sharedSlug) return;
    const match = feedPosts.find((p) => p.slug === sharedSlug);
    if (match) {
      setActivePost(match);
    }
  }, [sharedSlug]);

  // Keep page state synchronized with browser navigation (?page=N)
  useEffect(() => {
    const paramPage = Math.max(1, Number(searchParams.get('page')) || 1);
    setCurrentPage(paramPage);
  }, [searchParams]);

  const countsByFormat = useMemo(() => {
    return {
      all: feedPosts.length,
      text: feedPosts.filter((p) => p.mediaType === 'text').length,
      image: feedPosts.filter((p) => p.mediaType === 'image').length,
      video: feedPosts.filter((p) => p.mediaType === 'video').length,
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matched = feedPosts.filter((post) => {
      if (formatFilter !== 'all' && post.mediaType !== formatFilter) return false;
      if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;

      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.content.some((p) => p.toLowerCase().includes(q)) ||
        post.category.toLowerCase().includes(q) ||
        post.author.name.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    return [...matched].sort((a, b) => {
      // Keep pinned admin post first on newest-first view
      if (sortOrder === 'newest') {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    });
  }, [query, formatFilter, categoryFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedPosts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, safePage, pageSize]);

  function updatePage(nextPage: number, scroll = true) {
    const clamped = Math.max(1, Math.min(nextPage, totalPages));
    setCurrentPage(clamped);

    const params = new URLSearchParams(searchParams.toString());
    if (clamped <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(clamped));
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

    if (scroll && feedTopRef.current) {
      feedTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleFilterChange(action: () => void) {
    action();
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleResetFilters() {
    setQuery('');
    setFormatFilter('all');
    setCategoryFilter('all');
    setSortOrder('newest');
    updatePage(1, false);
  }

  function handleCloseReader() {
    setActivePost(null);
    if (searchParams.get('post')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('post');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }

  function handleOpenReader(post: FeedPost) {
    setActivePost(post);
  }

  // Generate compact page number list (with ellipsis for larger counts)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: Array<number | 'ellipsis'> = [1];
    if (safePage > 3) pages.push('ellipsis');
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  }, [totalPages, safePage]);

  const startItem = filteredPosts.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(filteredPosts.length, safePage * pageSize);

  const formatTabs: Array<{
    id: FormatFilter;
    label: string;
    count: number;
    icon: React.ReactNode;
  }> = [
    { id: 'all', label: 'All Posts', count: countsByFormat.all, icon: <Layers className="size-3.5" /> },
    { id: 'text', label: 'Updates', count: countsByFormat.text, icon: <FileText className="size-3.5" /> },
    { id: 'image', label: 'Images', count: countsByFormat.image, icon: <ImageIcon className="size-3.5" /> },
    { id: 'video', label: 'Videos', count: countsByFormat.video, icon: <Film className="size-3.5" /> },
  ];

  const hasActiveFilters =
    query.trim() !== '' || formatFilter !== 'all' || categoryFilter !== 'all' || sortOrder !== 'newest';

  return (
    <div ref={feedTopRef} className="space-y-8 scroll-mt-24">
      {/* Search & Controls Panel */}
      <div className="relative z-20 rounded-3xl border border-slate-200/80 bg-white/85 p-4 sm:p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleFilterChange(() => setQuery(e.target.value))}
              placeholder="Search admin news, regulatory alerts, tags, or compliance updates..."
              aria-label="Search feed posts"
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleFilterChange(() => setQuery(''))}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category, Sort & Page Size */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 lg:w-auto">
            <div className="min-w-[165px]">
              <CustomDropdown
                value={categoryFilter}
                onChange={(val) =>
                  handleFilterChange(() => setCategoryFilter(val as 'all' | FeedCategory))
                }
                options={[
                  { value: 'all', label: 'All Topics' },
                  ...FEED_CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
                buttonClassName="min-h-12 rounded-2xl py-2.5"
              />
            </div>

            <div className="min-w-[145px]">
              <CustomDropdown
                value={sortOrder}
                onChange={(val) => handleFilterChange(() => setSortOrder(val as SortOrder))}
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                ]}
                buttonClassName="min-h-12 rounded-2xl py-2.5"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 min-w-[125px]">
              <CustomDropdown
                value={String(pageSize)}
                onChange={(val) => handleFilterChange(() => setPageSize(Number(val)))}
                options={[
                  { value: '6', label: '6 / page' },
                  { value: '9', label: '9 / page' },
                  { value: '12', label: '12 / page' },
                ]}
                buttonClassName="min-h-12 rounded-2xl py-2.5"
              />
            </div>
          </div>
        </div>

        {/* Format Filter Pills & Summary Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {formatTabs.map((tab) => {
              const active = formatFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterChange(() => setFormatFilter(tab.id))}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all',
                    active
                      ? 'bg-slate-900 !text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.25 text-[10px] font-bold',
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Showing <strong className="font-bold text-slate-900">{startItem}–{endItem}</strong> of{' '}
              <strong className="font-bold text-slate-900">{filteredPosts.length}</strong> posts
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-900 transition-colors"
              >
                <X className="size-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feed Grid */}
      {paginatedPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              onRead={handleOpenReader}
              onShare={(selected) => setSharePost(selected)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-12 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Newspaper className="size-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No feed posts match your filter</h3>
          <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
            Try clearing your search keywords or switching back to all post formats and topics.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-700 transition-colors"
          >
            Show All Admin Posts
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {filteredPosts.length > 0 && (
        <nav
          aria-label="Feed pagination"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/85 px-5 py-4 backdrop-blur-xl shadow-2xs"
        >
          <p className="text-xs font-medium text-slate-500">
            Page <strong className="font-bold text-slate-900">{safePage}</strong> of{' '}
            <strong className="font-bold text-slate-900">{totalPages}</strong>{' '}
            <span className="text-slate-400">·</span>{' '}
            <span>{filteredPosts.length} published announcements</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => updatePage(safePage - 1)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="size-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {pageNumbers.map((item, idx) =>
                item === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-xs font-bold text-slate-400 select-none"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updatePage(item)}
                    aria-current={item === safePage ? 'page' : undefined}
                    className={cn(
                      'grid size-9 place-items-center rounded-full text-xs font-bold transition-all',
                      item === safePage
                        ? 'bg-slate-900 !text-white shadow-sm'
                        : 'border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => updatePage(safePage + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:pointer-events-none transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </nav>
      )}

      {/* Full Post Reader Modal */}
      <FeedReaderModal
        post={activePost}
        onClose={handleCloseReader}
        onShare={(selected) => setSharePost(selected)}
      />

      {/* Share Modal */}
      <FeedShareDialog
        post={sharePost}
        onClose={() => setSharePost(null)}
      />
    </div>
  );
}

