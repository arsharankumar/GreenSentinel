import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleReset = async () => {
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      // Check if email exists in users collection
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Email not found. Please sign up instead.");
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-[url('/images/forest_waterfall.jpg')] bg-cover bg-right opacity-100">
      <div className='text-white flex flex-col md:flex-row items-center justify-center bg-[linear-gradient(to_top,rgba(0,0,0,0.8),rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.8))] min-h-screen w-screen p-2.5 md:p-8'>

        <div className="p-4 min-w-[60vw] md:min-w-xl md:max-w-5xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl font-bold mb-4">Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-sm mb-6"
          />
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 text-lg font-medium hover:cursor-pointer"
          >
            Send Reset Email
          </button>
          {message && <p className="mt-4 text-green-600">{message}</p>}
          {error && <p className="mt-4 text-red-600">{error}</p>}
          <button
            onClick={() => { navigate('/login') }}
            // className='px-5 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 text-lg font-medium hover:cursor-pointer mt-6'
            className='hover:cursor-pointer hover:bg-gray-700 px-1.5 rounded-sm mt-[20px] mb-[20px] underline'
          >
            Go Back to Login
            </button>
        </div>
      </div>
    </div>
  );
}
