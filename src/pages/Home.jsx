// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const [h1Animated, setH1Animated] = useState(false);
  const [contentAnimated, setContentAnimated] = useState(false);

  useEffect(() => {
    // 1. Trigger H1 animation after a very small delay (e.g., 50ms)
    //    This ensures the browser has time to render 'translate-y-full'
    //    BEFORE 'translate-y-0' is applied.
    const h1Timer = setTimeout(() => {
      setH1Animated(true);
    }, 500); // Adjusted to a small delay for h1

    // 2. Trigger other content animation after its intended delay
    const contentTimer = setTimeout(() => {
      setContentAnimated(true);
    }, 500); // This is your 500ms delay for other content

    // Cleanup both timers if the component unmounts
    return () => {
      clearTimeout(h1Timer);
      clearTimeout(contentTimer);
    };
  }, []);


  return (
    <div className="min-h-screen bg-[url('/images/forest_waterfall.jpg')] bg-cover bg-right">
      <div className='flex flex-col md:flex-row items-center gap-[50px] justify-center bg-[linear-gradient(to_top,rgba(0,0,0,0.8),rgba(0,0,0,0.6)_50%,rgba(0,0,0,0.1))] min-h-screen w-screen p-2.5 md:p-8'>
        <h1 className={`text-6xl text-center font-bold text-white mb-8 transform transition-transform transition-scale duration-1000 ease-out ${h1Animated ? ' scale-100' : 'translate-y-1/2 md:translate-y-0 md:translate-x-1/2 scale-150'}`}>Welcome, Sentinels!</h1>

        <div className={`flex flex-col items-center gap-[0px] transition-opacity duration-1000 ease-in-out ${contentAnimated ? 'opacity-100' : 'opacity-0'} delay-[500ms]`}>
          <h2 className="text-3xl font-bold text-white text-center mb-8">Report forest threats. Stay anonymous. Make impact.</h2>
          <p className="text-2xl text-white mb-4 text-center max-w-md">
            Please choose an option to continue.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 text-lg font-medium hover:cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 text-lg font-medium hover:cursor-pointer"
            >
              Sign Up
            </button>
          </div>
          <p className="text-lg text-white mt-10 text-center max-w-md">
            Dont worry. Your anonymity is ensured upon signup, unless you're a <span className='text-gray-200 bg-red-400 rounded-sm'>spammer</span>
          </p>
        </div>
      </div>
    </div>
  );
}