// src/components/SignInButton.tsx
import { useState } from 'react';
import { signInWithGoogle } from '@services/googleAuth';

const SignInButton = () => {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();      // <-- real GIS flow
      setOk(true);                   // mark success (optional)
    } catch (err) {
      alert('Google sign-in failed – check console');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (ok) return null; // already signed-in, hide the button

  return (
    <button
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? 'Connecting…' : 'Connect Google'}
    </button>
  );
};

export default SignInButton;
