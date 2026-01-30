'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import GitHubCard from '@/components/GitHubCard';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name || undefined);
      router.push('/bookmarks');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GitHubCard title="Create your account">
      {error && (
        <div className="mb-4 px-4 py-3 bg-[#ffebe9] border border-[#ff818266] rounded-md text-sm text-[#86181d]">
          <div className="flex items-center">
            <span className="font-semibold mr-1">Error:</span> {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-normal text-white mb-2">
            Full name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="github-input w-full px-3 py-1.5 rounded-md text-sm leading-5 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-normal text-white mb-2">
            Email address
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
          <label htmlFor="password" className="block text-sm font-normal text-white mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="github-input w-full px-3 py-1.5 rounded-md text-sm leading-5 shadow-sm"
            required
            minLength={6}
          />
          <p className="mt-2 text-xs text-[#8b949e]">
            Make sure it's at least 6 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="github-btn w-full mt-4 px-4 py-1.5 rounded-md text-sm font-bold shadow-sm"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </GitHubCard>
  );
}
