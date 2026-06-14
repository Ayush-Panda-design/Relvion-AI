'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else if (data.redirect) {
        window.location.href = data.redirect;
      }
    } catch (err: any) {
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm text-center">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-red-900 mb-1" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#FBC02D] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-red-900 mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#FBC02D] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 bg-[#D32F2F] hover:bg-[#C62828] text-white rounded-2xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
