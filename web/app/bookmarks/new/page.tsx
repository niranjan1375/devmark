'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import BookmarkForm from '@/components/BookmarkForm';
import { CreateBookmarkInput } from '@/types';
import { useEffect } from 'react';

export default function NewBookmarkPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (data: CreateBookmarkInput) => {
    await api.createBookmark(data);
    router.push('/bookmarks');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
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
          New Bookmark
        </h2>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <BookmarkForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/bookmarks')}
            submitLabel="Create Bookmark"
          />
        </div>
      </main>
    </div>
  );
}
