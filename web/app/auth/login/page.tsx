'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import GitHubCard from '@/components/GitHubCard';

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
    <GitHubCard title="Sign in to DevMark">
      {error && (
        <div className="mb-4 px-4 py-3 bg-[#ffebe9] border border-[#ff818266] rounded-md text-sm text-[#86181d]">
          <div className="flex items-center">
            <span className="font-semibold mr-1">Error:</span> {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-normal text-white mb-2">
            Username or email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="github-input w-full px-3 py-1.5 rounded-md text-sm leading-5 shadow-sm"
            required
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-normal text-white">
              Password
            </label>
            <a href="#" className="text-xs text-[#58a6ff] hover:text-[#58a6ff] hover:underline decoration-1">
              Forgot password?
            </a>
          </div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="github-input w-full px-3 py-1.5 rounded-md text-sm leading-5 shadow-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="github-btn w-full mt-4 px-4 py-1.5 rounded-md text-sm font-bold shadow-sm"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </GitHubCard>
  );
}
