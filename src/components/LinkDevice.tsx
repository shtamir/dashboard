import React, { useState, useEffect } from 'react';
import { signInWithGoogle } from '@services/googleAuth';

const LinkDevice: React.FC = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [debug, setDebug] = useState<string | null>(null);

  // Handle Google Sign-In redirect
  useEffect(() => {
    const handleGoogleSignIn = async () => {
      console.log('🔍 Checking URL parameters for Google Sign-In redirect...');
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      if (error) {
        console.error('❌ Google Sign-In redirect error:', error);
        setError(`Google Sign-In failed: ${error}`);
        return;
      }

      if (code) {
        console.log('🔄 Processing Google Sign-In redirect code...');
        try {
          setIsSigningIn(true);
          const t = await signInWithGoogle();
          console.log('✅ Google Sign-In successful, token received');
          setToken(t);
          // Remove the code from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          console.log('🧹 Cleaned up URL parameters');
        } catch (err) {
          console.error('❌ Google Sign-In redirect failed:', err);
          setError('Google sign-in failed');
        } finally {
          setIsSigningIn(false);
        }
      } else {
        console.log('ℹ️ No Google Sign-In redirect code found in URL');
      }
    };

    handleGoogleSignIn();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Starting device linking process...');
    setStatus('loading');
    setError(null);
    setDebug(null);

    try {
      console.log('📤 Submitting code:', { 
        code, 
        token: token ? `${token.slice(0, 10)}...` : 'none',
        url: '/.netlify/functions/device-code'
      });
      
      const res = await fetch('/.netlify/functions/device-code', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, token }),
      });

      const data = await res.json();
      console.log('📥 Server response:', {
        status: res.status,
        ok: res.ok,
        data
      });

      if (!res.ok) {
        throw new Error(data.error || 'Failed to link device');
      }

      console.log('✅ Device linking successful');
      setStatus('success');
      setDebug(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('❌ Device linking error:', err);
      setError(err.message || 'Failed to link device');
      setStatus('error');
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('🔑 Starting Google Sign-In process...');
    try {
      setIsSigningIn(true);
      setError(null);
      const t = await signInWithGoogle();
      console.log('✅ Google Sign-In successful, token received:', t.slice(0, 10) + '...');
      setToken(t);
    } catch (err) {
      console.error('❌ Google Sign-In failed:', err);
      setError('Google sign-in failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Log component state changes
  useEffect(() => {
    console.log('🔄 LinkDevice state updated:', {
      status,
      hasToken: !!token,
      isSigningIn,
      hasError: !!error,
      codeLength: code.length
    });
  }, [status, token, isSigningIn, error, code]);

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
        {status === 'success' && (
          <>
            <div className="mt-4 text-green-600">Device linked! You can return to your TV.</div>
            {debug && (
              <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-left overflow-auto">
                {debug}
              </pre>
            )}
          </>
        )}
        {status === 'error' && (
          <>
            <div className="mt-4 text-red-600">{error}</div>
            {debug && (
              <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-left overflow-auto">
                {debug}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LinkDevice;
