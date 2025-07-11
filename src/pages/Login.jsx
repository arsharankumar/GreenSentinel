// src/pages/Login.jsx
import { useState, useRef, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Login() {

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failLogin, setfailLogin] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const loginBtnRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    emailRef.current?.focus();
  }, [failLogin]);

  const handleLogin = async () => {
    setLoading(true); // start spinner
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get the authenticated user object

      // Fetch user's Firestore document to check onboarding status
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.onboardingComplete) {
          // User is authenticated AND onboarding is complete
          navigate('/dashboard'); // Or '/profile'
        } else {
          // User is authenticated but onboarding NOT complete
          navigate('/onboarding');
        }
      } else {
        // This case indicates an issue: user is authenticated but no Firestore doc.
        // This *shouldn't* happen if your Signup page correctly creates the doc with onboardingComplete: false.
        // For safety, lead to onboarding to ensure doc is created/filled
        console.warn("User logged in, but no Firestore document found. Redirecting to onboarding.");
        navigate('/onboarding');
      }
    } catch (error) {
      setfailLogin(true);
      console.error("Login/Data Retrieval Error:", error); // Log the full error object
      console.error("Error code:", error.code); // Firebase specific error code (e.g., 'auth/user-not-found')
      console.error("Error message:", error.message);
      // navigate('/login-error')
    }
    setLoading(false); // stop spinner (in both success & failure)
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current?.focus(); // move focus
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      loginBtnRef.current?.click(); // click login button
    }
  };

  return (
    <div className="min-h-screen bg-[url('/images/forest_waterfall.jpg')] bg-cover bg-right opacity-100">
      <div className='text-white flex flex-col md:flex-row items-center justify-center bg-[linear-gradient(to_top,rgba(0,0,0,0.8),rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.8))] min-h-screen w-screen p-2.5 md:p-8'>

        <div className="p-4 min-w-[60vw] md:min-w-xl md:max-w-5xl mx-auto flex flex-col items-center">
          {loading ? (
            <div className="flex space-x-2 justify-center items-center">
              <div className="animate-bounce rounded-full h-4 w-4 bg-green-600 [animation-duration:0.7s] ease [animation-delay:0ms]"></div>
              <div className="animate-bounce rounded-full h-4 w-4 bg-green-600 [animation-duration:0.7s] ease [animation-delay:150ms]"></div>
              <div className="animate-bounce rounded-full h-4 w-4 bg-green-600 [animation-duration:0.7s] ease [animation-delay:300ms]"></div>
            </div>
          ) : failLogin ? (
            <>
              <p className='mb-6 text-xl'>There was an error logging in. Please Retry.</p>
              <button
                className='px-5 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 text-lg font-medium hover:cursor-pointer'
                onClick={() => setfailLogin(false)}
              >
                Retry
              </button>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-4">Login</h2>
              <input
                type="email"
                placeholder="Enter Email"
                className="w-full p-2 border rounded-sm mb-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                ref={emailRef}
              />
              <input
                type="password"
                placeholder="Enter Password"
                className="w-full p-2 border rounded-sm mb-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handlePasswordKeyDown}
                ref={passwordRef}
              />
              <button ref={loginBtnRef}
              onClick={handleLogin}
              className="px-5 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 text-lg font-medium hover:cursor-pointer">
                Login
              </button>
              <button
                className='mt-5 text-blue-400 hover:text-blue-300 font-bold focus:outline-none hover:cursor-pointer'
                onClick={() => { navigate('/forgot-password') }}>
                Forgot Password?
              </button>
              <p>If you do not have an account, consider <button className='mt-5 text-blue-400 hover:text-blue-300 font-bold focus:outline-none hover:cursor-pointer' onClick={() => { navigate('/signup') }}>Signing Up</button></p>
            </>
          )}
        </div>
      </div>
    </div>
  );

}
