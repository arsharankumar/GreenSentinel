// src/pages/Signup.jsx (or wherever your Signup component is)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config'; // Adjust this import path if needed

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState(""); // Use string for error message
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const signupBtnRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      signupBtnRef.current?.click();
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError(""); // Clear previous errors
    setLoading(true);

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Send email verification
      // This is crucial here, so the EmailVerificationPage can tell the user to verify.
      await sendEmailVerification(user);

      // 3. Create initial user document in Firestore with onboardingComplete: false
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
          onboardingComplete: false, // User has not completed onboarding steps yet
        },
        { merge: true }
      );

      // --- IMMEDIATE REDIRECT TO EMAIL VERIFICATION PAGE AFTER SUCCESSFUL SIGNUP ---
      // Pass the email as state so the verification page can display it.
      navigate("/verify-email", { state: { email: user.email } });

    } catch (error) {
      console.error("Signup error:", error);
      setSignupError(error.message || "Failed to sign up. Please try a different email or stronger password.");
    } finally {
      setLoading(false);
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
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-4">Sign Up</h2>

              {signupError && (
                <div className="mb-4 p-3 rounded-md text-sm bg-red-100 text-red-700">
                  {signupError}
                  <button
                    className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={() => setSignupError("")}
                  >
                    Clear Error
                  </button>
                </div>
              )}

              <input
                type="email"
                id="email"
                placeholder='Enter Email'
                className="w-full p-2 border rounded-sm mb-4" // Added text-gray-900 for visibility
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                ref={emailRef}
                required
              />
              <input
                type="password"
                id="password"
                placeholder='Enter a Strong Password'
                className="w-full p-2 border rounded-sm mb-4" // Added text-gray-900 for visibility
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handlePasswordKeyDown}
                ref={passwordRef}
                required
              />
              <button ref={signupBtnRef} onClick={handleSignup}
                className="px-5 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 text-lg font-medium hover:cursor-pointer"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>

              <p className="text-center text-gray-300 text-sm mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-400 hover:text-blue-300 font-bold focus:outline-none"
                >
                  Log In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
