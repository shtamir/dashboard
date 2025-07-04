import React, { useState, useEffect } from 'react';
import { signInWithGoogle } from '@services/googleAuth';

const LinkDevice: React.FC = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Handle Google Sign-In redirect
  useEffect(() => {
    const handleGoogleSignIn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      if (error) {
        setError(`Google Sign-In failed: ${error}`);
        return;
      }

      if (code) {
        try {
          setIsSigningIn(true);
          const t = await signInWithGoogle();
          setToken(t);
          // Remove the code from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          setError('Google sign-in failed');
        } finally {
          setIsSigningIn(false);
        }
      }
    };

    handleGoogleSignIn();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch('/.netlify/functions/device-code', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, token }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Failed to link device');
      setStatus('error');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const t = await signInWithGoogle();
      setToken(t);
    } catch (err) {
      setError('Google sign-in failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4 text-center">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Link Your TV</h1>
        {!token ? (
          <button
            className="w-full mb-4 bg-red-600 text-white py-3 rounded-lg font-bold text-lg disabled:opacity-50"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
          >
            {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
          </button>
        ) : (
          <div className="mb-4 text-green-600">Signed in with Google!</div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-300 text-2xl text-center font-mono"
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            required
            autoFocus
            disabled={!token || isSigningIn}
          />
          <button
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold text-lg disabled:opacity-50"
            type="submit"
            disabled={status === 'loading' || !token || isSigningIn}
          >
            {status === 'loading' ? 'Linking…' : 'Link TV'}
          </button>
        </form>
        {status === 'success' && <div className="mt-4 text-green-600">Device linked! You can return to your TV.</div>}
        {status === 'error' && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    </div>
  );
};

export default LinkDevice;
