'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- CORRECTED REDIRECT URL ---
  const redirectUrl = searchParams.get('redirect') || '/nexushub/dropbox';
  // --- END CORRECTION ---

  useEffect(() => {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
      router.push(redirectUrl);
    }
  }, [router, redirectUrl]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const correctUsername = 'admin123';
    const correctPassword = 'password123';

    if (username === correctUsername && password === correctPassword) {
      sessionStorage.setItem('isLoggedIn', 'true');
      router.push(redirectUrl);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-800 to-teal-900 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 md:p-12">
        
        <div className="flex justify-center mb-8">
            <Image
                src="/Systemic-Shifts-Logo/systemic-shifts-logo-Solid.png"
                alt="Systemic Shifts Logo"
                width={240} // A bit larger for emphasis
                height={48} // Maintain aspect ratio
                priority
            />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-center text-teal-700 mb-8">
          Admin Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
           <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-900"
              placeholder="admin123"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-gray-900"
              placeholder="password123"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
          <div>
            <button
              type="submit"
              className="w-full py-3 px-6 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700 transition-colors text-lg"
            >
              Login
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-teal-600 hover:underline">
            ← Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
