'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Bookmark, Tag } from '@/types';
import BookmarkCard from '@/components/BookmarkCard';
import Link from 'next/link';

export default function BookmarksPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [bookmarksData, tagsData] = await Promise.all([
        api.getBookmarks(),
        api.getTags(),
      ]);
      setBookmarks(bookmarksData);
      setTags(tagsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBookmark(id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (err) {
      alert('Failed to delete bookmark');
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await api.searchBookmarks({
        tag: selectedTag || undefined,
        search: searchQuery || undefined,
      });
      setBookmarks(results);
    } catch (err) {
      alert('Failed to search bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setSelectedTag(null);
    setSearchQuery('');
    await loadData();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tighter">
            <span className="text-white">dev</span><span className="text-lime-400">mark</span>
          </h1>
          <div className="flex items-center gap-8">
            <span className="text-gray-400 text-sm font-mono">{user?.email}</span>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white text-sm font-mono transition-colors"
            >
              logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12 flex justify-between items-center">
          <h2 className="text-4xl font-black text-white">Your Bookmarks</h2>
          <Link
            href="/bookmarks/new"
            className="px-8 py-4 bg-lime-400 text-black font-bold hover:bg-lime-300 transition-all transform hover:scale-105"
          >
            New Bookmark
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="mb-12 border border-gray-800 bg-black p-8">
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles, URLs, or notes..."
              className="flex-1 px-6 py-4 bg-gray-950 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400 text-base"
            />
            <button
              onClick={handleSearch}
              className="px-10 py-4 bg-lime-400 text-black font-bold hover:bg-lime-300 transition-all"
            >
              Search
            </button>
            {(selectedTag || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-4 bg-transparent text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-white font-mono text-sm transition-colors"
              >
                clear
              </button>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-4 font-mono uppercase tracking-widest">Filter by tag</p>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      setSelectedTag(selectedTag === tag.name ? null : tag.name);
                    }}
                    className={`px-4 py-2 text-sm font-mono border transition-all ${
                      selectedTag === tag.name
                        ? 'bg-lime-400 text-black border-lime-400'
                        : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    #{tag.name} ({tag.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-32 border border-gray-800">
            <p className="text-gray-400 text-xl mb-8 font-mono">No bookmarks found</p>
            <Link
              href="/bookmarks/new"
              className="inline-block px-8 py-4 bg-lime-400 text-black font-bold hover:bg-lime-300 transition-all"
            >
              Create your first bookmark
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
