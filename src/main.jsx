import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './routes/AuthContext';

// import App from './App.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import Profile from './pages/Profile.jsx';
import Complaints from './pages/Complaints.jsx';
import ComplaintDetails from './pages/ComplaintDetails.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import Home from './pages/Home.jsx';
import EmailVerificationPage from './pages/EmailVerificationPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/verify-email",
    element: <EmailVerificationPage />
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/complaints",
    element: (
      <ProtectedRoute>
        <Complaints />
      </ProtectedRoute>
    )
  },
  {
    path: "/complaints/:complaintId",
    element: (
      <ProtectedRoute>
        <ComplaintDetails />
      </ProtectedRoute>
    )
  }

])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)
