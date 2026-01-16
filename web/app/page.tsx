'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/bookmarks');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <main className="flex flex-col items-center gap-8 px-8 py-16 text-center max-w-4xl">
        <h1 className="text-6xl font-bold text-gray-900">
          Dev<span className="text-blue-600">Mark</span>
        </h1>
        <p className="text-2xl text-gray-700 max-w-2xl">
          Production-grade bookmark manager for developers
        </p>
        <p className="text-lg text-gray-600 max-w-xl">
          Every bookmark comes with a mandatory note explaining why you saved it.
          Organize with tags, not folders. Max 5 tags per bookmark. Built for solo developers.
        </p>
        
        <div className="flex gap-4 mt-8">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-medium"
          >
            Register
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2 text-gray-900">📝 Mandatory Notes</h3>
            <p className="text-gray-600">
              Every bookmark requires a note (max 200 chars) explaining why you saved it. No more forgotten bookmarks!
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2 text-gray-900">🏷️ Tags Only</h3>
            <p className="text-gray-600">
              No folders - just tags. Add up to 5 tags per bookmark. Case-insensitive with spaces allowed.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2 text-gray-900">🚀 Production Quality</h3>
            <p className="text-gray-600">
              Built with TypeScript, Fastify, Next.js, and Postgres. Real SaaS quality for solo developers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
