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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 py-24">
        {/* Header */}
        <div className="mb-24">
          <div className="inline-block mb-8">
            <h1 className="text-8xl font-black tracking-tighter">
              <span className="text-white">dev</span>
              <span className="text-lime-400">mark</span>
            </h1>
            <div className="h-1 w-32 bg-lime-400 mt-2"></div>
          </div>
          <p className="text-2xl text-gray-400 font-mono mb-4">
            bookmarks --with-context
          </p>
        </div>

        {/* Hero Content */}
        <div className="max-w-3xl mb-20">
          <h2 className="text-5xl font-bold leading-tight mb-8 text-white">
            Stop hoarding links you'll never revisit.
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-6">
            Every bookmark needs a{' '}
            <span className="text-lime-400 font-bold">200-character note</span> explaining
            why it matters. No exceptions.
          </p>
          <p className="text-lg text-gray-400 leading-relaxed">
            Tags instead of folders. Search instead of scrolling. Built for developers who
            value their time.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 mb-32">
          <Link
            href="/auth/login"
            className="px-10 py-5 bg-lime-400 text-black font-bold text-lg hover:bg-lime-300 transition-all transform hover:scale-105"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-10 py-5 bg-transparent text-white font-bold text-lg border-2 border-gray-700 hover:border-lime-400 hover:text-lime-400 transition-all"
          >
            Sign Up
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-gray-800 p-8 hover:border-lime-400/50 transition-colors">
            <div className="text-lime-400 text-xs font-mono mb-4 tracking-widest">RULE #1</div>
            <h3 className="text-2xl font-bold mb-4">Context Required</h3>
            <p className="text-gray-400 leading-relaxed">
              200-character limit forces you to think. Future you will actually remember why you
              saved this.
            </p>
          </div>
          <div className="border border-gray-800 p-8 hover:border-lime-400/50 transition-colors">
            <div className="text-lime-400 text-xs font-mono mb-4 tracking-widest">RULE #2</div>
            <h3 className="text-2xl font-bold mb-4">5 Tags Maximum</h3>
            <p className="text-gray-400 leading-relaxed">
              Constraints create clarity. No nested folders, no organizational paralysis. Just tag
              and move on.
            </p>
          </div>
          <div className="border border-gray-800 p-8 hover:border-lime-400/50 transition-colors">
            <div className="text-lime-400 text-xs font-mono mb-4 tracking-widest">STACK</div>
            <h3 className="text-2xl font-bold mb-4">Production Grade</h3>
            <p className="text-gray-400 leading-relaxed">
              TypeScript, Fastify, Next.js, PostgreSQL. Built with the same stack you'd use for
              real products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
