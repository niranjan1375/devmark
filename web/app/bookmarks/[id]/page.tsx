'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import BookmarkForm from '@/components/BookmarkForm';
import { Bookmark, CreateBookmarkInput } from '@/types';

export default function EditBookmarkPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      loadBookmark();
    }
  }, [user, params.id]);

  const loadBookmark = async () => {
    try {
      const data = await api.getBookmark(params.id);
      setBookmark(data);
    } catch (err) {
      setError('Failed to load bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateBookmarkInput) => {
    await api.updateBookmark(params.id, data);
    router.push('/bookmarks');
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !bookmark) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">{error || 'Bookmark not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Dev<span className="text-blue-600">Mark</span>
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Edit Bookmark
        </h2>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <BookmarkForm
            initialData={{
              url: bookmark.url,
              title: bookmark.title,
              note: bookmark.note,
              tags: bookmark.tags.map(t => t.name),
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/bookmarks')}
            submitLabel="Update Bookmark"
          />
        </div>
      </main>
    </div>
  );
}
