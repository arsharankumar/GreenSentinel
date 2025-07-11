// src/pages/EmailVerificationPage.jsx (or wherever your pages are)
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, sendEmailVerification, reload } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config'; // Adjust this import path

export default function EmailVerificationPage() {
    const navigate = useNavigate();
    const location = useLocation(); // To get state passed from Signup.jsx
    const [loading, setLoading] = useState(true); // Initially true to check auth state
    const [statusMessage, setStatusMessage] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [resendError, setResendError] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // Get email from signup page if available, otherwise rely on auth.currentUser
    const userEmailFromSignup = location.state?.email || "your email";

    // Function to check user's verification status and redirect accordingly
    const checkVerificationStatusAndRedirect = async (user) => {
        if (!user) {
            // No user authenticated, redirect to login/signup
            navigate("/login"); // Or navigate to "/signup"
            return;
        }

        setLoading(true);
        try {
            // Reload the user to get the latest email verification status
            await reload(user);

            if (user.emailVerified) {
                setIsEmailVerified(true);
                setStatusMessage("Email verified successfully!");

                // Fetch user's Firestore document to check onboarding status
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists() && userDocSnap.data().onboardingComplete) {
                    navigate("/profile"); // User is verified AND has completed onboarding
                } else {
                    navigate("/onboarding"); // User is verified but has NOT completed onboarding
                }
            } else {
                setIsEmailVerified(false);
                setStatusMessage(`A verification link has been sent to ${user.email || userEmailFromSignup}. Please check your inbox (and spam folder!).`);
            }
        } catch (error) {
            console.error("Error checking verification or onboarding status:", error);
            setStatusMessage("Error checking status. Please try again or resend the email.");
            setIsEmailVerified(false); // Assume not verified if check fails
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Listen for auth state changes on this page
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                await checkVerificationStatusAndRedirect(user);
            } else {
                // No authenticated user, means they need to sign up or log in first
                navigate("/signup"); // Redirect them back to signup or login
            }
            setLoading(false);
        });

        return () => unsubscribe(); // Clean up the listener
    }, []); // Empty dependency array means this runs once on mount

    const handleResendVerification = async () => {
        if (auth.currentUser) {
            setResendLoading(true);
            setResendError("");
            try {
                await sendEmailVerification(auth.currentUser);
                setStatusMessage("Verification email resent. Please check your inbox.");
            } catch (error) {
                console.error("Error resending verification:", error);
                setResendError("Failed to resend verification email. Please try again later.");
            } finally {
                setResendLoading(false);
            }
        } else {
            setResendError("No active user to resend verification for. Please sign in.");
            navigate("/login"); // Redirect to login if no user
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
                            <h2 className="text-4xl font-bold mb-4">Verify Your Email</h2>
                            <p className="mb-4">{statusMessage}</p>

                            {resendError && (
                                <p className="text-red-500 mb-4">{resendError}</p>
                            )}

                                <button
                                    onClick={() => checkVerificationStatusAndRedirect(auth.currentUser)}
                                    className="px-5 py-2 mb-4 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 text-lg font-medium hover:cursor-pointer"
                                    disabled={loading}
                                >
                                    {loading ? 'Checking Status...' : "I've Verified My Email"}
                                </button>

                                <button
                                    onClick={handleResendVerification}
                                    className="px-5 py-2 mb-4 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 text-lg font-medium hover:cursor-pointer"
                                    disabled={resendLoading}
                                >
                                    {resendLoading ? 'Resending...' : 'Resend Verification Email'}
                                </button>

                                {/* <button
                                    onClick={() => navigate("/login")} // Allow users to go to login page
                                    className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Go to Login
                                </button> */}
                        </>
                    )}
                </div>
            </div>
        </div>
    );




    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="flex space-x-2 justify-center items-center">
                    <div className="animate-bounce rounded-full h-4 w-4 bg-green-600 [animation-duration:0.7s] ease [animation-delay:0ms]"></div>
                    <div className="animate-bounce rounded-full h-4 w-4 bg-green-600 [animation-duration:0.7s] ease [animation-delay:150ms]"></div>
                    <div className="animate-bounce rounded-full h-4 w-4 bg-green-600 [animation-duration:0.7s] ease [animation-delay:300ms]"></div>
                </div>
            </div>
        );
    }

    // If email is already verified, the checkVerificationStatusAndRedirect will navigate
    // This render block is for when the email is NOT yet verified.
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                <h2 className="text-3xl font-bold mb-4">Verify Your Email</h2>
                <p className="mb-4">{statusMessage}</p>

                {resendError && (
                    <p className="text-red-500 mb-4">{resendError}</p>
                )}

                <div className="space-y-3">
                    <button
                        onClick={() => checkVerificationStatusAndRedirect(auth.currentUser)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Checking Status...' : "I've Verified My Email"}
                    </button>

                    <button
                        onClick={handleResendVerification}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={resendLoading}
                    >
                        {resendLoading ? 'Resending...' : 'Resend Verification Email'}
                    </button>

                    <button
                        onClick={() => navigate("/login")} // Allow users to go to login page
                        className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
}