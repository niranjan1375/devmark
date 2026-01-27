'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/bookmarks');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md border-2 border-zinc-800 bg-zinc-900/50 p-8">
        <div className="border-l-4 border-emerald-500 pl-4 mb-8">
          <h1 className="text-3xl font-black text-zinc-100">
            Login
          </h1>
          <p className="text-zinc-400 font-mono text-sm mt-1">./auth/login</p>
        </div>

        {error && (
          <div className="border-2 border-red-500 bg-red-500/10 text-red-400 px-4 py-3 mb-6 font-mono text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-emerald-500"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400 font-mono">
          No account?{' '}
          <Link href="/auth/register" className="text-emerald-500 hover:text-emerald-400">
            Sign up
          </Link>
        </p>

        <p className="mt-4 text-center">
          <Link href="/" className="text-zinc-500 hover:text-zinc-400 text-sm font-mono">
            ← back
          </Link>
        </p>
      </div>
    </div>
  );
}
